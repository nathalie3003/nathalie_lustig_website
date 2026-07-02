import type { NextConfig } from "next";

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },
  async redirects() {
    return [{ source: "/cv", destination: "/#about", permanent: true }];
  },
};

export default config;
