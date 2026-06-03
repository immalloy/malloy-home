import { GamesGrid } from "../../components/features/games/GamesGrid";
import { games } from "../../lib/games/catalog";

export default function Games() {
  return (
    <main className="page games-page">
      <section className="games-section" aria-labelledby="games-title">
        <h1 id="games-title">games</h1>
        <GamesGrid games={games} />
      </section>
    </main>
  );
}
