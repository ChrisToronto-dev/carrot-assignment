import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // 타입 오류를 무시하고 빌드 진행
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
