import { GitHubStats } from "../../components/features/about/GitHubStats";
import { SocialLinks } from "../../components/features/about/SocialLinks";

export default function About() {
  return (
    <main className="page about-page">
      <section className="about-panel" aria-labelledby="about-title">
        <h1 id="about-title">about</h1>
        <p>
          coder, artist, voice actor, singer. i like doing a lot of stuff and
          im very awesomesauce.
        </p>
        <hr />
        <SocialLinks />
        <GitHubStats />
      </section>
    </main>
  );
}
