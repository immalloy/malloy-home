import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "../components/site/ThemeToggle";
import { navItems } from "../lib/site/navigation";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://malloy.vercel.app"),
  title: "ImMalloy",
  description: "Malloy site",
  openGraph: {
    title: "ImMalloy",
    description: "Malloy site",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Malloy"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ImMalloy",
    description: "Malloy site",
    images: ["/twitter-image"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('malloy-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch{}"
          }}
        />
        <div className="site-shell">
          <aside className="sidebar" aria-label="Primary navigation">
            <nav className="sidebar-nav">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </aside>
          <div className="sidebar-rule" aria-hidden="true" />
          {children}
        </div>
      </body>
    </html>
  );
}
