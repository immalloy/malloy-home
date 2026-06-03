import Image from "next/image";
import Link from "next/link";
import type { GameEntry } from "../../../lib/games/catalog";

type GamesGridProps = {
  games: GameEntry[];
};

export function GamesGrid({ games }: GamesGridProps) {
  return (
    <div className="games-grid">
      {games.map((game) => (
        <Link className="game-tile" href={`/games/${game.slug}`} key={game.slug}>
          <div className="game-thumb">
            <Image
              alt={game.title}
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
              src={game.thumbnail}
            />
          </div>
          <span className="game-title">{game.title}</span>
        </Link>
      ))}
    </div>
  );
}
