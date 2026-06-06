export type ProjectType = "site" | "app" | "game" | "tool" | "other";

export type ProjectActionKind =
  | "play"
  | "site"
  | "repo"
  | "gamebanana"
  | "download"
  | "docs"
  | "external";

export type ProjectAction = {
  kind: ProjectActionKind;
  label: string;
  href: string;
};

export type ProjectEntry = {
  slug: string;
  name: string;
  type: ProjectType;
  description: string;
  thumbnail?: string;
  icon?: string;
  accent?: string;
  status?: string;
  details?: string;
  actions: ProjectAction[];
};

export const projects: ProjectEntry[] = [
  {
    slug: "oyachi",
    name: "Your Little Oyachi",
    type: "game",
    description:
      "A cozy little simulator where you take care of Little Oyachi.",
    thumbnail:
      "https://crew-awesome.github.io/Your-Little-Oyachi-1/assets/site/cover-art.png",
    icon: "/images/projects/your-little-oyachi-icon.png",
    accent: "#82c4dc",
    status: "playable",
    details:
      'Your Little Oyachi is a cozy little simulator where you take care of "Little Oyachi", a tiny, extra-cute version of my girlfriend, Oyachi. Pet her, hang out with her, and keep her happy while you spend time together in this tiny world hehe.',
    actions: [
      {
        kind: "play",
        label: "Play",
        href: "/games/oyachi"
      },
      {
        kind: "site",
        label: "Site",
        href: "https://crew-awesome.github.io/Your-Little-Oyachi-1/"
      },
      {
        kind: "repo",
        label: "GitHub",
        href: "https://github.com/Crew-Awesome/Your-Little-Oyachi-1"
      }
    ]
  },
  {
    slug: "gamebanana-today",
    name: "GameBanana Today",
    type: "tool",
    description:
      "A browser for finding recent GameBanana mods by date range and game.",
    thumbnail: "/images/projects/gamebanana-today-banner.png",
    icon: "/images/projects/gamebanana-today-icon.png",
    accent: "#f5dc63",
    status: "live",
    details:
      "GameBanana Today is a simple browser for finding GameBanana mods released across daily, weekly, and monthly ranges. It lets you pick a game, browse its recent mods, filter by category, and quickly see the most downloaded, liked, and viewed mods for that range.",
    actions: [
      {
        kind: "site",
        label: "Open",
        href: "https://immalloy.github.io/gamebanana-today/"
      },
      {
        kind: "repo",
        label: "GitHub",
        href: "https://github.com/immalloy/gamebanana-today"
      }
    ]
  },
  {
    slug: "gamebanana-api-docs",
    name: "GameBanana API Docs",
    type: "site",
    description: "Unofficial GameBanana API reference crawled by me.",
    icon: "/images/projects/gamebanana-api-docs-icon.png",
    accent: "#f5dc63",
    status: "live",
    details: "Unofficial GameBanana API reference crawled by me.",
    actions: [
      {
        kind: "docs",
        label: "Docs",
        href: "https://immalloy.github.io/GamebananaAPI-Docs/"
      },
      {
        kind: "repo",
        label: "GitHub",
        href: "https://github.com/immalloy/GamebananaAPI-Docs"
      }
    ]
  },
  {
    slug: "celstomp",
    name: "Celstomp",
    type: "tool",
    description:
      "A lightweight accessible browser-based handdrawn cel animation suite.",
    thumbnail: "/images/projects/celstomp-banner.png",
    icon: "/images/projects/celstomp-icon.ico",
    accent: "#8fd4f2",
    status: "contributor",
    details:
      "A lightweight and accessible browser-based 2D handdrawn cel animation suite with a specialized layer system, timeline controls, and intuitive drawing tools. I am not the creator, just a coder.",
    actions: [
      {
        kind: "site",
        label: "Open",
        href: "https://ginyo.space/celstomp/"
      },
      {
        kind: "repo",
        label: "GitHub",
        href: "https://github.com/Celstomp/celstomp"
      }
    ]
  },
  {
    slug: "funkhub",
    name: "FunkHub",
    type: "app",
    description:
      "A desktop app for finding, installing, and launching Friday Night Funkin' mods.",
    thumbnail: "/images/projects/funkhub-banner.png",
    icon: "/images/projects/funkhub-icon.png",
    accent: "#ff6a9d",
    status: "downloadable",
    details:
      "FunkHub is a simple desktop app for finding, installing, and launching Friday Night Funkin' mods using the GameBanana API.",
    actions: [
      {
        kind: "gamebanana",
        label: "GameBanana",
        href: "https://gamebanana.com/tools/22153"
      },
      {
        kind: "download",
        label: "Releases",
        href: "https://github.com/Crew-Awesome/FunkHub/releases"
      },
      {
        kind: "repo",
        label: "GitHub",
        href: "https://github.com/Crew-Awesome/FunkHub"
      }
    ]
  },
  {
    slug: "ale-psych",
    name: "ALE Psych",
    type: "tool",
    description:
      "Psych Engine rewrite focused on softcoding and JSON customization.",
    thumbnail: "/images/projects/ale-psych-banner.png",
    icon: "/images/projects/ale-psych-icon.png",
    accent: "#b18cff",
    status: "downloadable",
    details:
      "Psych Engine rewrite focused on Softcoding and Improving Customization through JSON.",
    actions: [
      {
        kind: "site",
        label: "Site",
        href: "https://ale-psych-crew.github.io/ALE-Psych-Site/"
      },
      {
        kind: "download",
        label: "Releases",
        href: "https://github.com/ALE-Psych-Crew/ALE-Psych/releases"
      },
      {
        kind: "repo",
        label: "GitHub",
        href: "https://github.com/ALE-Psych-Crew/ALE-Psych"
      }
    ]
  },
  {
    slug: "chromatic-scale-generator-plus-remastered",
    name: "Chromatic Scale Generator PLUS! (Remastered)",
    type: "tool",
    description:
      "Obsolete Windows tool for turning voice samples into tuned FNF chromatic scales.",
    thumbnail: "/images/projects/chromatic-plus-remastered-banner.jpg",
    icon: "/images/projects/chromatic-plus-remastered-icon.ico",
    accent: "#58d4a8",
    status: "obsolete",
    details:
      "Obsolete. This tool takes raw character voice samples and builds a tuned FNF chromatic scale from them. It handles the pitching and file organization so the result is easier to drop into FL Studio, Ableton, or another DAW.",
    actions: [
      {
        kind: "gamebanana",
        label: "GameBanana",
        href: "https://gamebanana.com/tools/20901"
      },
      {
        kind: "download",
        label: "Releases",
        href: "https://github.com/immalloy/Chromatic-Scale-Generator-Plus-Remastered/releases"
      },
      {
        kind: "repo",
        label: "GitHub",
        href: "https://github.com/immalloy/Chromatic-Scale-Generator-Plus-Remastered"
      }
    ]
  },
  {
    slug: "chromatic-scale-generator-deluxe",
    name: "Chromatic Scale Generator Deluxe",
    type: "tool",
    description:
      "Obsolete Windows app for making tuned FNF chromatic scales from raw samples.",
    thumbnail: "/images/projects/chromatic-deluxe-banner.jpg",
    icon: "/images/projects/chromatic-deluxe-icon.ico",
    accent: "#f09858",
    status: "obsolete",
    details:
      "Obsolete. Chromatic Scale Generator Deluxe is a Windows desktop application built with PySide6 and a Parselmouth/Praat backend. It turns raw samples into a complete, properly tuned FNF chromatic scale.",
    actions: [
      {
        kind: "gamebanana",
        label: "GameBanana",
        href: "https://gamebanana.com/tools/20598"
      },
      {
        kind: "download",
        label: "Releases",
        href: "https://github.com/immalloy/Chromatic-Scale-Generator-DELUXE/releases"
      },
      {
        kind: "repo",
        label: "GitHub",
        href: "https://github.com/immalloy/Chromatic-Scale-Generator-DELUXE"
      }
    ]
  }
];

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug);
}
