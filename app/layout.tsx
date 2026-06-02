import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "ImMalloy",
  description: ":)",
  openGraph: {
    title: "ImMalloy",
    description: ":)",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: ":)"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ImMalloy",
    description: ":)",
    images: ["/twitter-image"]
  }
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
