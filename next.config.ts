import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone" убран — чтобы `npm run build` + `npm run start`
  // одинаково работали на Windows, macOS, Linux и Vercel
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
