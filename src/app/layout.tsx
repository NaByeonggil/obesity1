import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/auth/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '헬스케어 플랫폼 - 간편한 의료 서비스',
  description: '온라인 예약부터 처방전 관리까지, 모든 의료 서비스를 하나의 플랫폼에서 경험하세요.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}