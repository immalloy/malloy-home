import {
  activityWeeks,
  getGitHubStats,
  type ActivityDay
} from "../../../lib/about/github-profile";

export async function GitHubStats() {
  const stats = await getGitHubStats();

  if (!stats) {
    return (
      <a
        className="github-stats-card"
        href="https://github.com/immalloy"
        rel="noreferrer"
        target="_blank"
      >
        <span className="github-stats-title">GitHub</span>
        <span className="github-stats-muted">Stats unavailable. Open profile.</span>
      </a>
    );
  }

  const items = [
    { label: "repos", value: stats.publicRepos },
    { label: "original", value: stats.originalRepos },
    { label: "stars", value: stats.stars },
    { label: "forks", value: stats.forks },
    { label: "followers", value: stats.followers }
  ];

  return (
    <section className="github-panel" aria-labelledby="github-title">
      <a
        className="github-stats-card"
        href="https://github.com/immalloy"
        rel="noreferrer"
        target="_blank"
      >
        <span className="github-stats-title" id="github-title">
          ImMalloy on GitHub
        </span>
        <span className="github-stats-muted">live public profile stats</span>
        <span className="github-stats-grid">
          {items.map((item) => (
            <span className="github-stat" key={item.label}>
              <strong>{item.value.toLocaleString("en")}</strong>
              <span>{item.label}</span>
            </span>
          ))}
        </span>
      </a>

      <div className="github-activity" aria-label="Recent public GitHub activity">
        <div className="github-activity-header">
          <span>recent public activity</span>
          <small>last {activityWeeks} weeks</small>
        </div>
        <div className="github-activity-grid">
          {stats.activity.map((day: ActivityDay) => (
            <span
              aria-label={`${day.date}: ${day.count} public ${day.count === 1 ? "event" : "events"}`}
              className="github-activity-day"
              data-level={day.level}
              key={day.date}
              title={`${day.date}: ${day.count} public ${day.count === 1 ? "event" : "events"}`}
            />
          ))}
        </div>
        <div className="github-activity-legend" aria-hidden="true">
          <span>less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span className="github-activity-day" data-level={level} key={level} />
          ))}
          <span>more</span>
        </div>
        <p className="github-stats-muted">
          Uses public GitHub events, so it is a recent activity graph rather than the
          private full contribution calendar.
        </p>
      </div>
    </section>
  );
}
