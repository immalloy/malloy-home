import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Malloy Site",
  description: "A Vercel-ready site for Malloy."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
