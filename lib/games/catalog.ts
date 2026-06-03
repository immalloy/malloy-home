export type GameEntry = {
  embedPath: string;
  slug: string;
  thumbnail: string;
  title: string;
};

export const games: GameEntry[] = [
  {
    embedPath: "https://crew-awesome.github.io/Your-Little-Oyachi-1/game.html",
    slug: "oyachi",
    thumbnail: "https://crew-awesome.github.io/Your-Little-Oyachi-1/assets/site/cover-art.png",
    title: "Your Little Oyachi"
  }
];

export function getGameBySlug(slug: string) {
  return games.find((game) => game.slug === slug);
}
