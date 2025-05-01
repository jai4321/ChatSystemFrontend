import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};
export const config = {
  matcher: ["/api/:path*"], // Only runs for API routes
};
export default nextConfig;
