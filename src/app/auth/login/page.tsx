"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Mail, Lock, User, Phone, Loader2, AlertCircle, MessageSquare, Chrome, UserCheck } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("login")

  // URL 파라미터에서 callbackUrl, error, role, message 가져오기
  const roleParam = searchParams.get('role') as 'doctor' | 'pharmacy' | 'admin' | 'patient' | null
  const callbackUrl = searchParams.get('callbackUrl') || `/${roleParam || 'patient'}`
  const urlError = searchParams.get('error')
  const message = searchParams.get('message')
  const requiredRole = searchParams.get('required')
  const attemptedPath = searchParams.get('attempted')

  // 역할별 페이지 정보
  const getRoleInfo = (role: string | null) => {
    switch (role) {
      case 'doctor':
        return {
          title: '의료진 로그인',
          description: '의료진 전용 시스템에 로그인하세요'
        }
      case 'pharmacy':
        return {
          title: '약사 로그인',
          description: '약국 전용 시스템에 로그인하세요'
        }
      case 'admin':
        return {
          title: '관리자 로그인',
          description: '관리자 전용 시스템에 로그인하세요'
        }
      default:
        return {
          title: '헬스케어 플랫폼',
          description: '간편하게 로그인하고 의료 서비스를 이용하세요'
        }
    }
  }

  const roleInfo = getRoleInfo(roleParam)

  // 로그인 폼 상태
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // 회원가입 폼 상태
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("")
  const [signupPhone, setSignupPhone] = useState("")
  const [signupRole, setSignupRole] = useState("patient")

  // 의사 전용 필드
  const [signupLicense, setSignupLicense] = useState("")
  const [signupSpecialization, setSignupSpecialization] = useState("")
  const [signupClinic, setSignupClinic] = useState("")

  // 이메일 로그인 상태
  const [magicEmail, setMagicEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  // 사용자 역할에 따른 리다이렉트 경로 결정
  const getRedirectPathByRole = (userRole: string, callbackUrl?: string) => {
    // callbackUrl이 있고 유효한 경우 우선 사용
    if (callbackUrl && callbackUrl !== '/' && !callbackUrl.includes('auth')) {
      return callbackUrl
    }

    // 역할에 따른 기본 대시보드로 이동
    switch (userRole?.toLowerCase()) {
      case 'doctor':
        return '/doctor'
      case 'pharmacy':
        return '/pharmacy'
      case 'admin':
        return '/admin'
      case 'patient':
      default:
        return '/patient'
    }
  }

  // 이메일/비밀번호 로그인
  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        console.log('✅ 로그인 성공')

        // 로그인 성공 후 세션 정보를 가져와서 역할 확인
        const session = await getSession()
        if (session?.user?.role) {
          const redirectPath = getRedirectPathByRole(session.user.role, callbackUrl)
          console.log(`🔄 ${session.user.role} 역할로 ${redirectPath}로 이동`)
          router.push(redirectPath)
        } else {
          // 역할 정보가 없는 경우 기본값으로 이동
          router.push('/patient')
        }
        router.refresh()
      }
    } catch (error) {
      console.error('로그인 오류:', error)
      setError("로그인 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 회원가입
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (signupPassword !== signupPasswordConfirm) {
      setError("비밀번호가 일치하지 않습니다.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          phone: signupPhone,
          role: signupRole,
          // 의사 전용 필드 (의사인 경우에만 전송)
          ...(signupRole === 'doctor' && {
            license: signupLicense,
            specialization: signupSpecialization,
            clinic: signupClinic
          })
        })
      })

      if (response.ok) {
        // 회원가입 성공 후 자동 로그인
        const loginResult = await signIn("credentials", {
          email: signupEmail,
          password: signupPassword,
          redirect: false
        })

        if (loginResult?.ok) {
          // 회원가입한 역할에 따라 해당 페이지로 이동
          const redirectPath = getRedirectPathByRole(signupRole)
          console.log(`🆕 회원가입 완료: ${signupRole} 역할로 ${redirectPath}로 이동`)
          router.push(redirectPath)
        } else {
          router.push("/patient")
        }
        router.refresh()
      } else {
        const data = await response.json()
        setError(data.error || "회원가입에 실패했습니다.")
      }
    } catch (error) {
      setError("회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 이메일 매직 링크 발송
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("email", {
        email: magicEmail,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else {
        setEmailSent(true)
      }
    } catch (error) {
      setError("이메일 발송 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 소셜 로그인
  const handleSocialLogin = async (provider: string) => {
    setError("")
    setIsLoading(true)

    try {
      // 소셜 로그인은 NextAuth가 자동으로 리다이렉트 처리
      // 로그인 후 middleware에서 역할에 따른 리다이렉트가 처리됨
      await signIn(provider, {
        callbackUrl: callbackUrl || '/patient'
      })
    } catch (error) {
      setError(`${provider} 로그인 중 오류가 발생했습니다.`)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">{roleInfo.title}</CardTitle>
          <CardDescription className="text-center">
            {roleInfo.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* 역할 불일치로 인한 로그아웃 메시지 */}
          {message === 'role_mismatch' && requiredRole && attemptedPath && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>접근 권한이 없습니다.</strong><br />
                {requiredRole === 'doctor' && '의사'}
                {requiredRole === 'pharmacy' && '약사'}
                {requiredRole === 'admin' && '관리자'}
                {requiredRole === 'patient' && '환자'} 계정으로만 접근할 수 있는 페이지입니다.
                <br />
                <span className="text-sm text-gray-600">
                  시도한 경로: {attemptedPath}
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* 알 수 없는 역할로 인한 로그아웃 메시지 */}
          {message === 'invalid_role' && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>잘못된 계정 정보입니다.</strong><br />
                계정의 역할 정보가 올바르지 않습니다. 다시 로그인해주세요.
              </AlertDescription>
            </Alert>
          )}

          {/* URL에서 전달된 에러 메시지 표시 */}
          {urlError === 'unauthorized' && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                해당 페이지에 접근할 권한이 없습니다. 적절한 계정으로 로그인해주세요.
              </AlertDescription>
            </Alert>
          )}

          {/* 로그인 시도 시 발생한 에러 메시지 표시 */}
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 보호된 페이지 접근 시 안내 메시지 */}
          {callbackUrl && callbackUrl !== '/patient' && !message && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {callbackUrl.startsWith('/doctor')
                  ? '의사 전용 페이지입니다. 의사 계정으로 로그인해주세요.'
                  : callbackUrl.startsWith('/pharmacy')
                  ? '약국 전용 페이지입니다. 약국 계정으로 로그인해주세요.'
                  : callbackUrl.startsWith('/admin')
                  ? '관리자 전용 페이지입니다. 관리자 계정으로 로그인해주세요.'
                  : '로그인이 필요한 페이지입니다.'}
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
              <TabsTrigger value="email">이메일 로그인</TabsTrigger>
            </TabsList>

            {/* 로그인 탭 */}
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleCredentialLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="email@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10"
                      autoComplete="current-password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      로그인 중...
                    </>
                  ) : (
                    "로그인"
                  )}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">또는</span>
                </div>
              </div>

              {/* 소셜 로그인 버튼들 */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("kakao")}
                  disabled={isLoading}
                >
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" style={{ color: "#FEE500" }} />
                    카카오로 시작하기
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("naver")}
                  disabled={isLoading}
                >
                  <div className="flex items-center">
                    <div className="mr-2 w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">N</span>
                    </div>
                    네이버로 시작하기
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin("google")}
                  disabled={isLoading}
                >
                  <div className="flex items-center">
                    <Chrome className="mr-2 h-4 w-4" />
                    구글로 시작하기
                  </div>
                </Button>
              </div>
            </TabsContent>

            {/* 회원가입 탭 */}
            <TabsContent value="signup" className="space-y-4">
              {/* 소셜 간편가입 */}
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 mb-3">간편 가입하기</p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-yellow-300 hover:bg-yellow-400 border-yellow-400"
                  onClick={() => handleSocialLogin("kakao")}
                  disabled={isLoading}
                >
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" style={{ color: "#3C1E1E" }} />
                    <span className="font-medium">카카오로 3초만에 가입하기</span>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-green-500 hover:bg-green-600 text-white border-green-600"
                  onClick={() => handleSocialLogin("naver")}
                  disabled={isLoading}
                >
                  <div className="flex items-center">
                    <div className="mr-2 w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                      <span className="text-green-500 text-xs font-bold">N</span>
                    </div>
                    <span className="font-medium">네이버로 3초만에 가입하기</span>
                  </div>
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">또는 이메일로 가입</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="홍길동"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="pl-10"
                      autoComplete="name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="email@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">전화번호</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="010-1234-5678"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      className="pl-10"
                      autoComplete="tel"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-role">회원 유형</Label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Select
                      value={signupRole}
                      onValueChange={(value) => {
                        // 약국 선택 시 전용 회원가입 페이지로 이동
                        if (value === 'pharmacy') {
                          router.push('/auth/register?role=pharmacy')
                          return
                        }
                        setSignupRole(value)
                        // 역할 변경 시 역할별 필드 초기화
                        if (value !== 'doctor') {
                          setSignupLicense("")
                          setSignupSpecialization("")
                          setSignupClinic("")
                        }
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="회원 유형을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">환자</SelectItem>
                        <SelectItem value="doctor">의사</SelectItem>
                        <SelectItem value="pharmacy">약국 (상세 가입 페이지로 이동)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pl-10"
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password-confirm">비밀번호 확인</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password-confirm"
                      type="password"
                      placeholder="••••••••"
                      value={signupPasswordConfirm}
                      onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                      className="pl-10"
                      autoComplete="new-password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* 의사 전용 필드들 */}
                {signupRole === 'doctor' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="signup-license">의사 면허번호</Label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-license"
                          type="text"
                          placeholder="의사 면허번호를 입력하세요"
                          value={signupLicense}
                          onChange={(e) => setSignupLicense(e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-specialization">전문 분야</Label>
                      <div className="relative">
                        <Heart className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-specialization"
                          type="text"
                          placeholder="예: 비만의학, 내과, 가정의학과"
                          value={signupSpecialization}
                          onChange={(e) => setSignupSpecialization(e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-clinic">병원/의원명</Label>
                      <div className="relative">
                        <Heart className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-clinic"
                          type="text"
                          placeholder="병원 또는 의원명을 입력하세요"
                          value={signupClinic}
                          onChange={(e) => setSignupClinic(e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      회원가입 중...
                    </>
                  ) : (
                    "회원가입"
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* 이메일 매직 링크 탭 */}
            <TabsContent value="email" className="space-y-4">
              {emailSent ? (
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg">이메일을 확인하세요!</h3>
                  <p className="text-sm text-gray-600">
                    {magicEmail}로 로그인 링크를 발송했습니다.
                    이메일을 확인하고 링크를 클릭하여 로그인하세요.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailSent(false)
                      setMagicEmail("")
                    }}
                  >
                    다시 시도
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <p className="text-sm text-gray-600">
                    이메일 주소를 입력하면 로그인 링크를 보내드립니다.
                    비밀번호 없이 안전하게 로그인할 수 있습니다.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="magic-email">이메일</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="email@example.com"
                        value={magicEmail}
                        onChange={(e) => setMagicEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        이메일 발송 중...
                      </>
                    ) : (
                      "매직 링크 받기"
                    )}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-600">
            <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
              비밀번호를 잊으셨나요?
            </Link>
          </div>
          <div className="text-xs text-center text-gray-500">
            계속 진행하면 <Link href="/terms" className="underline">이용약관</Link> 및{" "}
            <Link href="/privacy" className="underline">개인정보처리방침</Link>에 동의하는 것으로 간주됩니다.
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}