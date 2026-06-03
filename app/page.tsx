import { RandomCharacterLink } from "../components/features/home/RandomCharacterLink";
import { getDailyMessage } from "../lib/home/daily-message";

export default async function Home() {
  const dailyMessage = await getDailyMessage();

  return (
    <main className="page home-page">
      <RandomCharacterLink />
      <section className="home-message" aria-label="Message of the day">
        <p className="malloy-mark">Malloy</p>
        {dailyMessage ? (
          <blockquote className="daily-message">
            <p>&ldquo;{dailyMessage.text}&rdquo;</p>
            <cite>{dailyMessage.author}</cite>
          </blockquote>
        ) : null}
      </section>
    </main>
  );
}
