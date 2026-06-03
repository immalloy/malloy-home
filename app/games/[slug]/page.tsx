import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GamePlayer } from "../../../components/features/games/GamePlayer";
import { games, getGameBySlug } from "../../../lib/games/catalog";

type GamePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

export default async function GamePage({ params }: GamePageProps) {
  const { slug } = await params;
  const game = getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  return (
    <main className="page game-page">
      <div className="game-page-header">
        <Link className="game-control" href="/games" title="Back to games">
          <Image
            alt=""
            aria-hidden="true"
            height={20}
            src="/icons/arrow-left.svg"
            width={20}
          />
        </Link>
        <h1>{game.title}</h1>
        <span className="game-page-header-spacer" aria-hidden="true" />
      </div>
      <GamePlayer embedPath={game.embedPath} />
    </main>
  );
}
