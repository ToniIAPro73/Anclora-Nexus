import type { NextConfig } from "next";

const backendApiOrigin =
  process.env.BACKEND_API_ORIGIN?.replace(/\/$/, "") ||
  (process.env.NODE_ENV === "production"
    ? "https://anclora-nexus.onrender.com"
    : "http://127.0.0.1:8000");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiOrigin}/api/:path*`,
      },
    ];
  }
};

export default nextConfig;
