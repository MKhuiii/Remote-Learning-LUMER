import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Nâng hạn mức tối đa nhận payload lên 10 Megabytes
    },
  },
};

export default nextConfig;