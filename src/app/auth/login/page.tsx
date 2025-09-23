"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Mail, Lock, User, Phone, Loader2, AlertCircle, MessageSquare, Chrome } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("login")

  // 로그인 폼 상태
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // 회원가입 폼 상태
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState("")
  const [signupPhone, setSignupPhone] = useState("")

  // 이메일 로그인 상태
  const [magicEmail, setMagicEmail] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  // 이메일/비밀번호 로그인
  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
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
          phone: signupPhone
        })
      })

      if (response.ok) {
        // 회원가입 성공 후 자동 로그인
        await signIn("credentials", {
          email: signupEmail,
          password: signupPassword,
          redirect: false
        })
        router.push("/")
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
      await signIn(provider, { callbackUrl: "/" })
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
          <CardTitle className="text-2xl text-center">헬스케어 플랫폼</CardTitle>
          <CardDescription className="text-center">
            간편하게 로그인하고 의료 서비스를 이용하세요
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
                      disabled={isLoading}
                    />
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