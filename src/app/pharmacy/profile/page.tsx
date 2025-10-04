"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AddressSearchInput } from "@/components/ui/address-search-input"
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Save,
  Loader2,
  AlertCircle,
  Check,
  Clock
} from "lucide-react"

interface PharmacyProfile {
  name: string
  email: string
  phone: string
  pharmacyName: string
  pharmacyLicense: string
  pharmacyAddress: string
  pharmacyPhone?: string
}

function PharmacyProfileContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const [formData, setFormData] = React.useState<PharmacyProfile>({
    name: '',
    email: '',
    phone: '',
    pharmacyName: '',
    pharmacyLicense: '',
    pharmacyAddress: '',
    pharmacyPhone: ''
  })

  // 프로필 데이터 로드
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return

      try {
        setIsLoading(true)
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setFormData({
              name: data.user.name || '',
              email: data.user.email || '',
              phone: data.user.phone || '',
              pharmacyName: data.user.pharmacyName || '',
              pharmacyLicense: data.user.license || '',
              pharmacyAddress: data.user.pharmacyAddress || '',
              pharmacyPhone: data.user.pharmacyPhone || ''
            })
          }
        }
      } catch (error) {
        console.error('프로필 로드 실패:', error)
        setError('프로필 정보를 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddressSelect = (address: string) => {
    setFormData(prev => ({
      ...prev,
      pharmacyAddress: address
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSaving(true)

    try {
      const response = await fetch('/api/pharmacy/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || '프로필 업데이트에 실패했습니다.')
      }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error)
      setError('프로필 업데이트 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="pharmacy" user={session?.user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2">프로필 정보를 불러오는 중...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="pharmacy" user={session?.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">프로필 설정</h1>
          <p className="text-gray-600 mt-1">
            약국 정보를 관리하고 업데이트할 수 있습니다
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              프로필이 성공적으로 업데이트되었습니다.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                기본 정보
              </CardTitle>
              <CardDescription>
                약사 개인 정보를 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  <User className="inline h-4 w-4 mr-1" />
                  이름
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-1" />
                  이메일
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">이메일은 변경할 수 없습니다</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  연락처
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
            </CardContent>
          </Card>

          {/* 약국 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                약국 정보
              </CardTitle>
              <CardDescription>
                약국 상세 정보를 관리합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="pharmacyName">
                  <Building className="inline h-4 w-4 mr-1" />
                  약국명
                </Label>
                <Input
                  id="pharmacyName"
                  name="pharmacyName"
                  type="text"
                  placeholder="OO약국"
                  value={formData.pharmacyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pharmacyLicense">
                  약사 면허번호
                </Label>
                <Input
                  id="pharmacyLicense"
                  name="pharmacyLicense"
                  type="text"
                  placeholder="면허번호"
                  value={formData.pharmacyLicense}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pharmacyAddress">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  약국 주소
                </Label>
                <AddressSearchInput
                  value={formData.pharmacyAddress}
                  onChange={handleAddressSelect}
                  placeholder="주소를 검색하세요"
                />
                <p className="text-xs text-gray-500">
                  주소 검색 버튼을 클릭하여 정확한 주소를 입력해주세요
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pharmacyPhone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  약국 전화번호
                </Label>
                <Input
                  id="pharmacyPhone"
                  name="pharmacyPhone"
                  type="tel"
                  placeholder="02-000-0000"
                  value={formData.pharmacyPhone}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* 영업 시간 (선택사항) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                영업 시간
              </CardTitle>
              <CardDescription>
                약국 운영 시간을 설정합니다 (추후 구현 예정)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                영업시간 설정 기능은 추후 업데이트될 예정입니다.
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/pharmacy')}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  저장
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default function PharmacyProfilePage() {
  return (
    <ProtectedRoute requiredRole="pharmacy">
      <PharmacyProfileContent />
    </ProtectedRoute>
  )
}
