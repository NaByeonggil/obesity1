/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    // Production build에서 타입 에러 무시 (개발 중에는 IDE에서 확인)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Production build에서 ESLint 에러 무시
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['images.unsplash.com', 'ui-avatars.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '**',
      },
    ],
  },
}

module.exports = nextConfig