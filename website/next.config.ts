import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  basePath: "/nvs-bench",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
