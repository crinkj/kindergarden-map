/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // standalone은 Docker 전용. Vercel 배포 시에는 제거
  ...(process.env.DOCKER_BUILD === 'true' ? { output: 'standalone' } : {}),
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
