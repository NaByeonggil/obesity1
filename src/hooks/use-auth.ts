"use client"

import { useSession } from 'next-auth/react'

interface User {
  id: string
  email: string
  name: string
  role: 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'ADMIN'
  avatar?: string
  phone?: string
  specialization?: string
  clinic?: string
  pharmacyName?: string
  pharmacyAddress?: string
  pharmacyPhone?: string
}

export function useAuth() {
  const { data: session, status } = useSession()

  const user = session?.user ? {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role as 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'ADMIN',
    avatar: session.user.image || undefined
  } as User : null

  return {
    user,
    token: session ? 'nextauth-session' : null, // NextAuth는 세션 기반이므로 토큰 대신 플래그
    isLoading: status === 'loading',
    isAuthenticated: !!session
  }
}