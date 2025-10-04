'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'doctor' | 'pharmacy' | 'patient' | 'admin'
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    console.log('[ProtectedRoute] Status:', status, 'Session:', !!session, 'Required role:', requiredRole)

    if (status === 'unauthenticated') {
      const callbackUrl = encodeURIComponent(window.location.pathname)
      router.push(`/auth/login?callbackUrl=${callbackUrl}`)
      return
    }

    if (session?.user && requiredRole) {
      const userRole = session.user.role?.toLowerCase()
      const requiredRoleLower = requiredRole.toLowerCase()

      console.log(`[ProtectedRoute] User role: '${userRole}', Required: '${requiredRoleLower}'`)

      if (userRole !== requiredRoleLower) {
        console.log(`🚨 [ProtectedRoute] ROLE MISMATCH! Forcing logout and redirect`)

        // Force logout with role mismatch message
        signOut({
          callbackUrl: `/auth/login?message=role_mismatch&required=${requiredRole}&attempted=${window.location.pathname}`
        })
        return
      }

      console.log(`✅ [ProtectedRoute] Access granted`)
    }
  }, [session, status, requiredRole, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">로그인 페이지로 이동 중...</p>
        </div>
      </div>
    )
  }

  // Role check for rendering
  if (session?.user && requiredRole) {
    const userRole = session.user.role?.toLowerCase()
    const requiredRoleLower = requiredRole.toLowerCase()

    if (userRole !== requiredRoleLower) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">접근 권한이 없습니다. 로그아웃 중...</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}