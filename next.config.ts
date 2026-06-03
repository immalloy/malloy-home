import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "crew-awesome.github.io",
        protocol: "https"
      }
    ]
  },
  poweredByHeader: false
};

export default nextConfig;
