'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Users,
  Stethoscope,
  Pill,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  ArrowLeft,
  AlertCircle,
  Check,
  Loader2,
  Video,
  MapPin
} from 'lucide-react'

type Role = 'patient' | 'doctor' | 'pharmacy'

interface RoleInfo {
  title: string
  icon: any
  color: string
  description: string
}

const roleInfo: Record<Role, RoleInfo> = {
  patient: {
    title: '일반 회원',
    icon: Users,
    color: 'bg-blue-500',
    description: '병원 예약 및 건강 관리 서비스 이용'
  },
  doctor: {
    title: '의사 회원',
    icon: Stethoscope,
    color: 'bg-green-500',
    description: '환자 진료 및 의원 관리 서비스 이용'
  },
  pharmacy: {
    title: '약사 회원',
    icon: Pill,
    color: 'bg-purple-500',
    description: '처방전 조제 및 약국 관리 서비스 이용'
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [role, setRole] = useState<Role>('patient')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    // 의사 전용 필드
    license: '',
    specialization: '',
    clinic: '',
    hasOnlineConsultation: true,
    hasOfflineConsultation: true,
    // 약사 전용 필드
    pharmacyName: '',
    pharmacyLicense: '',
    pharmacyAddress: ''
  })

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam && ['patient', 'doctor', 'pharmacy'].includes(roleParam)) {
      setRole(roleParam as Role)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      setIsLoading(false)
      return
    }

    // 의사의 경우 최소 하나의 진료 방식 선택 확인
    if (role === 'doctor' && !formData.hasOnlineConsultation && !formData.hasOfflineConsultation) {
      setError('최소 하나의 진료 방식을 선택해야 합니다.')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          role
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setError(data.error || '회원가입에 실패했습니다.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const currentRole = roleInfo[role]
  const Icon = currentRole.icon

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              메인으로
            </Button>
          </Link>

          <div className="text-center">
            <div className={`w-16 h-16 ${currentRole.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">{currentRole.title} 회원가입</CardTitle>
            <CardDescription>{currentRole.description}</CardDescription>
          </div>

          {/* 역할 선택 탭 */}
          <div className="flex gap-2 justify-center pt-4">
            {Object.keys(roleInfo).map((r) => (
              <Badge
                key={r}
                variant={role === r ? 'default' : 'outline'}
                className="cursor-pointer px-3 py-1"
                onClick={() => setRole(r as Role)}
              >
                {roleInfo[r as Role].title}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700">기본 정보</h3>

              <div className="grid gap-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-1" />
                  이메일
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">
                  <Lock className="inline h-4 w-4 mr-1" />
                  비밀번호
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="8자 이상 입력"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">
                  <Lock className="inline h-4 w-4 mr-1" />
                  비밀번호 확인
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="비밀번호 재입력"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">
                  <User className="inline h-4 w-4 mr-1" />
                  이름
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="실명 입력"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  휴대폰 번호
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* 의사 추가 정보 */}
            {role === 'doctor' && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-gray-700">의사 정보</h3>

                <div className="grid gap-2">
                  <Label htmlFor="license">
                    면허 번호
                  </Label>
                  <Input
                    id="license"
                    name="license"
                    type="text"
                    placeholder="의사 면허 번호"
                    value={formData.license}
                    onChange={handleChange}
                    required={role === 'doctor'}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="specialization">
                    전문 분야
                  </Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    type="text"
                    placeholder="예: 내과, 가정의학과"
                    value={formData.specialization}
                    onChange={handleChange}
                    required={role === 'doctor'}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="clinic">
                    <Building className="inline h-4 w-4 mr-1" />
                    의원명
                  </Label>
                  <Input
                    id="clinic"
                    name="clinic"
                    type="text"
                    placeholder="소속 의원명"
                    value={formData.clinic}
                    onChange={handleChange}
                    required={role === 'doctor'}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold">
                    제공 진료 방식 (기본값: 대면/비대면 모두 가능)
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasOfflineConsultation"
                        name="hasOfflineConsultation"
                        checked={formData.hasOfflineConsultation}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="hasOfflineConsultation" className="flex items-center gap-2 cursor-pointer">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        대면 진료 제공
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasOnlineConsultation"
                        name="hasOnlineConsultation"
                        checked={formData.hasOnlineConsultation}
                        onChange={handleChange}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <Label htmlFor="hasOnlineConsultation" className="flex items-center gap-2 cursor-pointer">
                        <Video className="h-4 w-4 text-green-600" />
                        비대면 진료 제공
                      </Label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    * 최소 하나의 진료 방식은 선택해야 합니다. 가입 후 프로필에서 변경 가능합니다.
                  </p>
                </div>
              </div>
            )}

            {/* 약사 추가 정보 */}
            {role === 'pharmacy' && (
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm text-gray-700">약사 정보</h3>

                <div className="grid gap-2">
                  <Label htmlFor="pharmacyLicense">
                    약사 면허 번호
                  </Label>
                  <Input
                    id="pharmacyLicense"
                    name="pharmacyLicense"
                    type="text"
                    placeholder="약사 면허 번호"
                    value={formData.pharmacyLicense}
                    onChange={handleChange}
                    required={role === 'pharmacy'}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pharmacyName">
                    <Building className="inline h-4 w-4 mr-1" />
                    약국명
                  </Label>
                  <Input
                    id="pharmacyName"
                    name="pharmacyName"
                    type="text"
                    placeholder="약국 이름"
                    value={formData.pharmacyName}
                    onChange={handleChange}
                    required={role === 'pharmacy'}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="pharmacyAddress">
                    약국 주소
                  </Label>
                  <Input
                    id="pharmacyAddress"
                    name="pharmacyAddress"
                    type="text"
                    placeholder="약국 주소 입력"
                    value={formData.pharmacyAddress}
                    onChange={handleChange}
                    required={role === 'pharmacy'}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  가입 처리 중...
                </>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            이미 계정이 있으신가요?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}