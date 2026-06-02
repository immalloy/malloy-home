const links = [
  { href: "https://vercel.com/docs", label: "Vercel Docs" },
  { href: "https://nextjs.org/docs", label: "Next.js Docs" },
  { href: "https://github.com", label: "GitHub" }
];

export default function Home() {
  return (
    <main className="site-shell">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Vercel starter</p>
          <h1 id="hero-title">Malloy Site</h1>
          <p className="lede">
            A clean Next.js base project ready for content, components, and
            production deployment on Vercel.
          </p>
          <div className="actions" aria-label="Primary links">
            <a className="button button-primary" href="#getting-started">
              Get started
            </a>
            <a className="button button-secondary" href="https://vercel.com/new">
              Deploy
            </a>
          </div>
        </div>
      </section>

      <section className="content-band" id="getting-started">
        <div className="section-heading">
          <p className="eyebrow">Project base</p>
          <h2>Built for a simple deployment flow.</h2>
        </div>
        <div className="feature-grid">
          <article>
            <span className="step">01</span>
            <h3>Edit the home page</h3>
            <p>
              Update <code>app/page.tsx</code> with your real content and build
              new routes under <code>app/</code>.
            </p>
          </article>
          <article>
            <span className="step">02</span>
            <h3>Style globally</h3>
            <p>
              Use <code>app/globals.css</code> for shared tokens, layout rules,
              and responsive polish.
            </p>
          </article>
          <article>
            <span className="step">03</span>
            <h3>Deploy on Vercel</h3>
            <p>
              Push to GitHub, import the repo in Vercel, and keep the default
              Next.js build settings.
            </p>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        <nav aria-label="Helpful links">
          {links.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </footer>
    </main>
  );
}
