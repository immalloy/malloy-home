type GitHubUser = {
  followers?: number;
  public_repos?: number;
};

type GitHubRepo = {
  fork?: boolean;
  forks_count?: number;
  stargazers_count?: number;
};

type GitHubEvent = {
  created_at?: string;
};

export type ActivityDay = {
  count: number;
  date: string;
  level: number;
};

export const activityWeeks = 26;

const activityDays = 7 * activityWeeks;

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getActivityLevel(count: number) {
  if (count === 0) {
    return 0;
  }

  if (count < 2) {
    return 1;
  }

  if (count < 4) {
    return 2;
  }

  if (count < 7) {
    return 3;
  }

  return 4;
}

function buildActivityDays(events: GitHubEvent[]) {
  const counts = new Map<string, number>();

  for (const event of events) {
    if (!event.created_at) {
      continue;
    }

    const key = event.created_at.slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (activityDays - 1));

  return Array.from({ length: activityDays }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const key = toDateKey(date);
    const count = counts.get(key) ?? 0;

    return {
      count,
      date: key,
      level: getActivityLevel(count)
    };
  });
}

export async function getGitHubStats() {
  try {
    const [userResponse, reposResponse, ...eventResponses] = await Promise.all([
      fetch("https://api.github.com/users/immalloy", {
        next: { revalidate: 60 * 60 }
      }),
      fetch("https://api.github.com/users/immalloy/repos?per_page=100&type=owner", {
        next: { revalidate: 60 * 60 }
      }),
      fetch("https://api.github.com/users/immalloy/events/public?per_page=100&page=1", {
        next: { revalidate: 60 * 60 }
      }),
      fetch("https://api.github.com/users/immalloy/events/public?per_page=100&page=2", {
        next: { revalidate: 60 * 60 }
      }),
      fetch("https://api.github.com/users/immalloy/events/public?per_page=100&page=3", {
        next: { revalidate: 60 * 60 }
      })
    ]);

    if (!userResponse.ok || !reposResponse.ok) {
      return null;
    }

    const user = (await userResponse.json()) as GitHubUser;
    const repos = (await reposResponse.json()) as GitHubRepo[];
    const eventPayloads = await Promise.all(
      eventResponses.map(async (response) =>
        response.ok ? ((await response.json()) as GitHubEvent[]) : []
      )
    );
    const events = eventPayloads.flat();
    const originalRepos = repos.filter((repo) => !repo.fork);

    return {
      activity: buildActivityDays(events),
      followers: user.followers ?? 0,
      forks: repos.reduce((total, repo) => total + (repo.forks_count ?? 0), 0),
      originalRepos: originalRepos.length,
      publicRepos: user.public_repos ?? repos.length,
      stars: repos.reduce((total, repo) => total + (repo.stargazers_count ?? 0), 0)
    };
  } catch {
    return null;
  }
}
