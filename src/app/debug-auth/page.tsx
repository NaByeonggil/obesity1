'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAuthPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`])
  }

  const clearLogs = () => {
    setLogs([])
  }

  const testLogin = async () => {
    setIsLoading(true)
    addLog('🔐 브라우저 로그인 테스트 시작')

    try {
      // Show current cookies before login
      addLog(`🍪 로그인 전 쿠키: ${document.cookie}`)

      // Test login
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'kim@naver.com',
          password: '123456'
        })
      })

      addLog(`📊 로그인 응답 상태: ${loginResponse.status}`)

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        addLog(`✅ 로그인 성공: ${loginData.message}`)
        addLog(`👤 사용자 역할: ${loginData.user.role}`)

        // Show cookies after login
        addLog(`🍪 로그인 후 쿠키: ${document.cookie}`)

        // Wait a bit and test /api/auth/me
        setTimeout(async () => {
          addLog('🔄 /api/auth/me 테스트 중...')

          const meResponse = await fetch('/api/auth/me')
          addLog(`📊 /api/auth/me 응답 상태: ${meResponse.status}`)

          if (meResponse.ok) {
            const meData = await meResponse.json()
            addLog(`✅ /api/auth/me 성공: ${meData.user.name} (${meData.user.role})`)
          } else {
            const errorData = await meResponse.json()
            addLog(`❌ /api/auth/me 실패: ${errorData.error}`)
          }

          setIsLoading(false)
        }, 1000)
      } else {
        const errorData = await loginResponse.json()
        addLog(`❌ 로그인 실패: ${errorData.error}`)
        setIsLoading(false)
      }

    } catch (error) {
      addLog(`🚨 오류 발생: ${error}`)
      setIsLoading(false)
    }
  }

  const testAuthMe = async () => {
    addLog('🔍 /api/auth/me 직접 테스트')
    addLog(`🍪 현재 쿠키: ${document.cookie}`)

    try {
      const response = await fetch('/api/auth/me')
      addLog(`📊 응답 상태: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        addLog(`✅ 성공: ${data.user.name} (${data.user.role})`)
      } else {
        const errorData = await response.json()
        addLog(`❌ 실패: ${errorData.error}`)
      }
    } catch (error) {
      addLog(`🚨 오류: ${error}`)
    }
  }

  const clearCookies = () => {
    // Clear auth-token cookie
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    addLog('🧹 인증 쿠키 삭제됨')
    addLog(`🍪 현재 쿠키: ${document.cookie}`)
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 브라우저 인증 디버깅</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={testLogin} disabled={isLoading}>
              {isLoading ? '테스트 중...' : '🔐 로그인 테스트'}
            </Button>
            <Button onClick={testAuthMe} variant="outline">
              🔍 /api/auth/me 테스트
            </Button>
            <Button onClick={clearCookies} variant="outline">
              🧹 쿠키 삭제
            </Button>
            <Button onClick={clearLogs} variant="outline">
              📝 로그 지우기
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">디버그 로그</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <p className="text-gray-500">로그가 없습니다. 테스트를 실행해보세요.</p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="text-sm font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">브라우저 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : ''}</div>
                <div><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : ''}</div>
                <div><strong>Cookies Enabled:</strong> {typeof navigator !== 'undefined' ? (navigator.cookieEnabled ? '✅' : '❌') : ''}</div>
                <div><strong>Current Cookies:</strong> {typeof document !== 'undefined' ? (document.cookie || '(없음)') : ''}</div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}