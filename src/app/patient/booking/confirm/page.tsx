"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Navigation } from "@/components/ui/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle,
  Building,
  Stethoscope,
  Video,
  PhoneCall
} from "lucide-react"

export default function BookingConfirmPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const clinicId = searchParams.get('clinic')
  const department = searchParams.get('department')

  // 디버깅: URL 파라미터 확인
  React.useEffect(() => {
    console.log('🔍 URL 파라미터:', { clinicId, department })
    console.log('🔍 비대면 진료 선택 가능?', !(department === 'obesity-treatment' || department === 'obesity'))
  }, [clinicId, department])

  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = React.useState<string>("")
  const [symptoms, setSymptoms] = React.useState("")
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [consultationMethod, setConsultationMethod] = React.useState<"video" | "phone">("video")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [bookingSuccess, setBookingSuccess] = React.useState(false)

  // Available time slots
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30"
  ]

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">인증 확인 중...</p>
          </div>
        </div>
      </div>
    )
  }

  // Redirect if no session
  if (!session || !session.user) {
    return null
  }

  const handleBookingSubmit = async () => {
    setIsSubmitting(true)

    try {
      // 진료과목별 한글 이름
      const departmentNames: { [key: string]: string } = {
        "obesity-treatment": "마운자로 · 위고비",
        "obesity": "비만 관련 처방",
        "eye-care": "인공눈물",
        "cold": "감기 관련",
        "internal-medicine": "내과",
        "pediatrics": "소아과",
        "dermatology": "피부과",
        "orthopedics": "정형외과",
        "neurosurgery": "신경외과",
        "ent": "이비인후과",
        "obgyn": "산부인과",
        "urology": "비뇨기과"
      }

      const departmentName = departmentNames[department || ''] || department

      // 진료 타입 결정: 비대면 진료 가능한 진료과 목록
      const onlineDepartments = [
        'eye-care',
        'cold',
        'internal-medicine',
        'pediatrics',
        'dermatology',
        'orthopedics',
        'neurosurgery',
        'ent'
      ]
      const isOnlineConsultation = onlineDepartments.includes(department || '')
      const consultationType = isOnlineConsultation ? 'online' : 'offline'

      console.log('📋 예약 정보:', {
        department,
        departmentName,
        isOnlineConsultation,
        consultationType,
        consultationMethod
      })

      // API 호출하여 예약 생성
      const response = await fetch('/api/appointments/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctorId: null, // 특정 의사가 없으면 자동 할당
          departmentName: departmentName,
          clinicName: `${departmentName} 클리닉`, // 클리닉 이름 생성
          appointmentDate: date?.toISOString().split('T')[0],
          appointmentTime: selectedTime,
          consultationType: consultationType,
          consultationMethod: isOnlineConsultation ? consultationMethod : undefined, // 비대면일 때만 화상/전화 구분
          symptoms,
          personalInfo: {
            phoneNumber,
            patientName: session.user?.name,
            patientEmail: session.user?.email
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Booking success:', result)
        setBookingSuccess(true)
        // 3초 후 환자 대시보드로 이동
        setTimeout(() => {
          router.push('/patient')
        }, 3000)
      } else {
        const errorResult = await response.json()
        console.error('Booking failed:', errorResult)
        alert(errorResult.error || '예약에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('Booking failed:', error)
      alert('예약 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">예약이 완료되었습니다!</h2>
              <p className="text-gray-600 mb-4">
                의사 선생님께 예약 확정 알림이 전송되었습니다.
              </p>
              <p className="text-sm text-gray-500">
                잠시 후 예약 내역 페이지로 이동합니다...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>

        <h1 className="text-2xl font-bold mb-6">진료 예약</h1>

        <div className="space-y-6">
          {/* 날짜 선택 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                예약 날짜 선택
              </CardTitle>
              <CardDescription>
                원하시는 진료 날짜를 선택해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
              />
            </CardContent>
          </Card>

          {/* 시간 선택 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                예약 시간 선택
              </CardTitle>
              <CardDescription>
                원하시는 진료 시간을 선택해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    onClick={() => setSelectedTime(time)}
                    className="w-full"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 진료 방식 선택 (비대면 진료 가능한 경우 표시) */}
          {(department === 'eye-care' ||
            department === 'cold' ||
            department === 'internal-medicine' ||
            department === 'pediatrics' ||
            department === 'dermatology' ||
            department === 'orthopedics' ||
            department === 'neurosurgery' ||
            department === 'ent') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  진료 방식 선택
                </CardTitle>
                <CardDescription>
                  원하시는 비대면 진료 방식을 선택해주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setConsultationMethod("video")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      consultationMethod === "video"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Video className={`h-8 w-8 ${consultationMethod === "video" ? "text-blue-500" : "text-gray-400"}`} />
                      <span className={`font-medium ${consultationMethod === "video" ? "text-blue-600" : "text-gray-700"}`}>
                        화상진료
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        화상 통화로 진료
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setConsultationMethod("phone")}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      consultationMethod === "phone"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <PhoneCall className={`h-8 w-8 ${consultationMethod === "phone" ? "text-green-500" : "text-gray-400"}`} />
                      <span className={`font-medium ${consultationMethod === "phone" ? "text-green-600" : "text-gray-700"}`}>
                        전화진료
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        음성 통화로 진료
                      </span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 증상 입력 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                증상 설명
              </CardTitle>
              <CardDescription>
                현재 증상이나 상담 내용을 간단히 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="예: 체중 감량을 위한 상담을 원합니다..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* 연락처 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                연락처 정보
              </CardTitle>
              <CardDescription>
                예약 확인을 위한 연락처를 입력해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">이름</label>
                <Input
                  value={session.user?.name || ''}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">연락처</label>
                <Input
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 예약 요약 */}
          <Card>
            <CardHeader>
              <CardTitle>예약 정보 확인</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">예약 날짜:</span>
                <span className="font-medium">
                  {date?.toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">예약 시간:</span>
                <span className="font-medium">{selectedTime || '선택 안됨'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">진료 유형:</span>
                <Badge>
                  {['eye-care', 'cold', 'internal-medicine', 'pediatrics', 'dermatology', 'orthopedics', 'neurosurgery', 'ent'].includes(department || '') ? '비대면' : '대면'}
                </Badge>
              </div>
              {['eye-care', 'cold', 'internal-medicine', 'pediatrics', 'dermatology', 'orthopedics', 'neurosurgery', 'ent'].includes(department || '') && (
                <div className="flex justify-between">
                  <span className="text-gray-600">진료 방식:</span>
                  <Badge variant={consultationMethod === 'video' ? 'default' : 'secondary'}>
                    {consultationMethod === 'video' ? '화상진료' : '전화진료'}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleBookingSubmit}
            disabled={!date || !selectedTime || !phoneNumber || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                예약 처리 중...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                예약 확정
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}