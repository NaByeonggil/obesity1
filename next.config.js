/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // 개발 모드에서 같은 네트워크의 다른 기기(IP 접속) 허용
  allowedDevOrigins: ['192.168.219.105', '100.122.238.29'],
  typescript: {
    // Production build에서 타입 에러 무시 (개발 중에는 IDE에서 확인)
    ignoreBuildErrors: true,
  },
  images: {
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