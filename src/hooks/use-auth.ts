"use client"

import { useState, useEffect } from 'react'

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
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // localStorage에서 토큰 가져오기
        const storedToken = localStorage.getItem('auth-token')
        const storedUser = localStorage.getItem('user-data')

        if (storedToken && storedUser) {
          // 저장된 사용자 정보 사용
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setToken(storedToken)
          setIsAuthenticated(true)

          // 토큰 유효성 확인을 위해 /api/auth/me 호출
          try {
            const response = await fetch('/api/auth/me', {
              headers: {
                'Authorization': `Bearer ${storedToken}`
              }
            })

            if (response.ok) {
              const data = await response.json()
              if (data.success && data.user) {
                // 서버에서 받은 최신 사용자 정보로 업데이트
                const updatedUser = {
                  id: data.user.id,
                  email: data.user.email,
                  name: data.user.name,
                  role: data.user.role as 'PATIENT' | 'DOCTOR' | 'PHARMACY' | 'ADMIN',
                  avatar: data.user.avatar,
                  phone: data.user.phone,
                  specialization: data.user.specialization,
                  clinic: data.user.clinic,
                  pharmacyName: data.user.pharmacyName,
                  pharmacyAddress: data.user.pharmacyAddress,
                  pharmacyPhone: data.user.pharmacyPhone
                }
                setUser(updatedUser)
                localStorage.setItem('user-data', JSON.stringify(updatedUser))
              }
            } else {
              // 토큰이 유효하지 않으면 로그아웃 처리
              localStorage.removeItem('auth-token')
              localStorage.removeItem('user-data')
              setUser(null)
              setToken(null)
              setIsAuthenticated(false)
            }
          } catch (error) {
            console.error('Failed to verify token:', error)
          }
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // localStorage 변경 감지
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem('auth-token')
      const storedUser = localStorage.getItem('user-data')

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser))
          setToken(storedToken)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Failed to parse user data:', error)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setToken(null)
        setIsAuthenticated(false)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  return {
    user,
    token,
    isLoading,
    isAuthenticated
  }
}