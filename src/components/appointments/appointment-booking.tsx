"use client"

// Force browser cache refresh - Component loaded at: {timestamp}
console.log('🔄 [Component Load] appointment-booking.tsx loaded at:', new Date().toISOString())

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Clock,
  Search,
  MapPin,
  Star,
  Video,
  User,
  ChevronLeft,
  ChevronRight,
  Check
} from "lucide-react"

interface Doctor {
  id: string
  name: string
  specialization: string
  clinic: string
  rating: number
  reviews: number
  image?: string
  availableSlots: TimeSlot[]
  consultationFee: number
  location: string
}

interface TimeSlot {
  time: string
  available: boolean
  type: 'online' | 'offline'
}

interface AppointmentBookingProps {
  onBookingComplete?: (appointmentData: any) => void
}

// 실제 의사 데이터를 가져오는 Hook
function useDoctors() {
  const [doctors, setDoctors] = React.useState<Doctor[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function fetchDoctors() {
      try {
        const response = await fetch('/api/doctors')
        const data = await response.json()

        if (data.success) {
          setDoctors(data.doctors)
        } else {
          setError(data.error || '의사 목록을 불러올 수 없습니다')
        }
      } catch (err) {
        console.error('의사 목록 조회 오류:', err)
        setError('의사 목록을 불러오는 중 오류가 발생했습니다')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  return { doctors, loading, error }
}

const availableDates = [
  { date: "2024-01-15", label: "오늘", dayOfWeek: "월" },
  { date: "2024-01-16", label: "내일", dayOfWeek: "화" },
  { date: "2024-01-17", label: "1/17", dayOfWeek: "수" },
  { date: "2024-01-18", label: "1/18", dayOfWeek: "목" },
  { date: "2024-01-19", label: "1/19", dayOfWeek: "금" },
  { date: "2024-01-20", label: "1/20", dayOfWeek: "토" },
  { date: "2024-01-21", label: "1/21", dayOfWeek: "일" },
]

export function AppointmentBooking({ onBookingComplete }: AppointmentBookingProps) {
  const [step, setStep] = React.useState<'search' | 'select' | 'confirm'>('search')
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedDoctor, setSelectedDoctor] = React.useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = React.useState(availableDates[1].date)
  const [selectedSlot, setSelectedSlot] = React.useState<TimeSlot | null>(null)
  const [symptoms, setSymptoms] = React.useState("")

  // 실제 DB에서 의사 데이터 가져오기
  const { doctors, loading: doctorsLoading, error: doctorsError } = useDoctors()

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.includes(searchQuery) ||
    doctor.specialization.includes(searchQuery) ||
    doctor.clinic.includes(searchQuery)
  )

  const handleDoctorSelect = (doctor: Doctor) => {
    console.log('[Doctor Selection] Selected doctor:', {
      id: doctor.id,
      name: doctor.name,
      clinic: doctor.clinic,
      specialization: doctor.specialization
    })

    console.log('📅 [Available Slots] Doctor has these slots:', {
      totalSlots: doctor.availableSlots.length,
      slots: doctor.availableSlots.map(s => ({
        time: s.time,
        type: s.type,
        available: s.available
      }))
    })

    setSelectedDoctor(doctor)
    setStep('select')
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    console.log('🎯 [Slot Selection] User clicked slot:', {
      time: slot.time,
      type: slot.type,
      available: slot.available,
      fullSlot: slot
    })
    setSelectedSlot(slot)
    setStep('confirm')
  }

  const handleBooking = async () => {
    if (selectedDoctor && selectedSlot) {
      try {
        // 예약 시점의 선택된 의사 정보 로깅
        console.log('[Booking] Selected doctor at booking time:', {
          id: selectedDoctor.id,
          name: selectedDoctor.name,
          clinic: selectedDoctor.clinic,
          specialization: selectedDoctor.specialization,
          fullObject: selectedDoctor
        })

        // 실제 DB ID를 직접 사용 (더 이상 매핑 불필요)
        const realDoctorId = selectedDoctor.id
        console.log('[Booking] Using doctor ID:', realDoctorId)

        // localStorage에서 토큰 가져오기
        const token = localStorage.getItem('auth-token')
        if (!token) {
          console.error('❌ 인증 토큰이 없습니다')
          alert('로그인이 필요합니다.')
          return
        }

        // 의사의 진료 타입 설정에 따라 예약 타입 결정
        // selectedSlot.type이 의사가 제공하는 진료 방식이므로 그대로 사용
        const appointmentType = selectedSlot.type

        console.log('📋 예약 타입 결정:', {
          doctorName: selectedDoctor.name,
          slotType: selectedSlot.type,
          appointmentType,
          time: selectedSlot.time
        })

        const requestBody = {
          doctorId: realDoctorId,
          date: selectedDate,
          time: selectedSlot.time,
          type: appointmentType, // 전문분야에 따라 결정된 타입 사용
          symptoms,
          department: selectedDoctor.specialization,
          notes: `${selectedDoctor.clinic}에서 예약`
        }

        console.log('📤 [API Request] Sending to /api/patient/appointments:', requestBody)

        // 실제 예약 생성 API 호출
        const response = await fetch('/api/patient/appointments', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        })

        const result = await response.json()

        if (result.success) {
          // 성공 시 콜백 호출
          const appointmentData = {
            id: result.appointment.id,
            doctorId: selectedDoctor.id,
            doctorName: selectedDoctor.name,
            clinic: selectedDoctor.clinic,
            date: selectedDate,
            time: selectedSlot.time,
            type: selectedSlot.type,
            symptoms,
            fee: selectedDoctor.consultationFee,
            status: result.appointment.status
          }

          onBookingComplete?.(appointmentData)

          // Reset form
          setStep('search')
          setSelectedDoctor(null)
          setSelectedSlot(null)
          setSymptoms("")
        } else {
          console.error('예약 생성 실패:', result.error)
          alert('예약 생성에 실패했습니다: ' + result.error)
        }
      } catch (error) {
        console.error('예약 생성 중 오류:', error)
        alert('예약 생성 중 오류가 발생했습니다.')
      }
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
          step === 'search' ? "bg-patient text-white" : "bg-gray-200 text-gray-600"
        )}>
          1
        </div>
        <div className="w-16 h-0.5 bg-gray-200"></div>
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
          step === 'select' ? "bg-patient text-white" :
          step === 'confirm' ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
        )}>
          2
        </div>
        <div className="w-16 h-0.5 bg-gray-200"></div>
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
          step === 'confirm' ? "bg-patient text-white" : "bg-gray-200 text-gray-600"
        )}>
          3
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderStepIndicator()}

      {step === 'search' && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">의료진을 선택하세요</h2>
            <p className="text-gray-600">전문의를 검색하고 예약하세요</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="의사명, 진료과목, 병원명으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
              disabled={doctorsLoading}
            />
          </div>

          {/* 로딩 상태 */}
          {doctorsLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-patient"></div>
              <span className="ml-3 text-gray-600">의사 목록을 불러오는 중...</span>
            </div>
          )}

          {/* 에러 상태 */}
          {doctorsError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <span>⚠️</span>
                  <span>{doctorsError}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 의사 목록 */}
          {!doctorsLoading && !doctorsError && (
            <div className="grid gap-4">
              {filteredDoctors.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                    <p className="text-sm text-gray-400 mt-1">다른 검색어를 시도해보세요.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={doctor.image} alt={doctor.name} />
                          <AvatarFallback className="bg-doctor text-white text-lg">
                            {doctor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                            <Badge variant="doctor">{doctor.specialization}</Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{doctor.clinic}</p>
                          <div className="flex items-center gap-2 mb-2">
                            {doctor.hasOnlineConsultation && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                                <Video className="h-3 w-3" />
                                <span>비대면</span>
                              </div>
                            )}
                            {doctor.hasOfflineConsultation && (
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                                <User className="h-3 w-3" />
                                <span>방문</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{doctor.rating}</span>
                              <span>({doctor.reviews})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate max-w-[150px]">{doctor.location}</span>
                            </div>
                            <div className="font-medium text-gray-900">
                              {doctor.consultationFee.toLocaleString()}원
                            </div>
                          </div>
                        </div>
                        <Button variant="patient">
                          예약하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {step === 'select' && selectedDoctor && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep('search')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">예약 날짜와 시간을 선택하세요</h2>
              <p className="text-gray-600">{selectedDoctor.name} • {selectedDoctor.specialization}</p>
            </div>
          </div>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>날짜 선택</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {availableDates.map((date) => {
                  const isSelected = selectedDate === date.date
                  return (
                    <button
                      key={date.date}
                      onClick={() => setSelectedDate(date.date)}
                      className={cn(
                        "p-3 text-center rounded-lg border-2 transition-all duration-200",
                        isSelected
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-lg scale-105"
                          : "border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm"
                      )}
                    >
                      <div className={cn(
                        "text-sm font-semibold mb-0.5",
                        isSelected ? "text-white" : "text-gray-900"
                      )}>
                        {date.label}
                      </div>
                      <div className={cn(
                        "text-xs",
                        isSelected ? "text-blue-100" : "text-gray-500"
                      )}>
                        {date.dayOfWeek}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>시간 선택</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedDoctor.availableSlots.map((slot, idx) => {
                  const isSelected = selectedSlot?.time === slot.time && selectedSlot?.type === slot.type
                  const isOnline = slot.type === 'online'

                  return (
                    <button
                      key={`${slot.time}-${slot.type}-${idx}`}
                      onClick={() => slot.available && handleSlotSelect(slot)}
                      disabled={!slot.available}
                      className={cn(
                        "relative p-4 rounded-lg border-2 text-left transition-all duration-200",
                        // 선택된 상태
                        isSelected && isOnline && "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200",
                        isSelected && !isOnline && "border-green-500 bg-green-50 shadow-md ring-2 ring-green-200",
                        // 미선택 상태
                        !isSelected && slot.available && isOnline && "border-blue-200 bg-blue-50/30 hover:bg-blue-50 hover:border-blue-400 hover:shadow-sm",
                        !isSelected && slot.available && !isOnline && "border-green-200 bg-green-50/30 hover:bg-green-50 hover:border-green-400 hover:shadow-sm",
                        // 비활성화 상태
                        !slot.available && "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={cn(
                          "font-semibold text-base",
                          isSelected && isOnline && "text-blue-700",
                          isSelected && !isOnline && "text-green-700",
                          !isSelected && slot.available && isOnline && "text-blue-600",
                          !isSelected && slot.available && !isOnline && "text-green-600"
                        )}>
                          {slot.time}
                        </span>
                        {isOnline ? (
                          <Video className={cn(
                            "h-5 w-5",
                            isSelected ? "text-blue-600" : "text-blue-500"
                          )} />
                        ) : (
                          <User className={cn(
                            "h-5 w-5",
                            isSelected ? "text-green-600" : "text-green-500"
                          )} />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          isOnline ? "bg-blue-500" : "bg-green-500"
                        )} />
                        <span className={cn(
                          "text-xs font-medium",
                          isSelected && isOnline && "text-blue-700",
                          isSelected && !isOnline && "text-green-700",
                          !isSelected && slot.available && isOnline && "text-blue-600",
                          !isSelected && slot.available && !isOnline && "text-green-600"
                        )}>
                          {isOnline ? '비대면 진료' : '방문 진료'}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-white rounded-full p-0.5">
                          <div className={cn(
                            "w-4 h-4 rounded-full flex items-center justify-center",
                            isOnline ? "bg-blue-500" : "bg-green-500"
                          )}>
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'confirm' && selectedDoctor && selectedSlot && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setStep('select')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">예약 정보를 확인하세요</h2>
              <p className="text-gray-600">예약 세부사항을 검토하고 확정하세요</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>예약 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedDoctor.image} alt={selectedDoctor.name} />
                    <AvatarFallback className="bg-doctor text-white">
                      {selectedDoctor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{selectedDoctor.name}</p>
                    <p className="text-sm text-gray-600">{selectedDoctor.specialization}</p>
                    <p className="text-sm text-gray-600">{selectedDoctor.clinic}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-600">날짜</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">시간</span>
                    <span className="font-medium">{selectedSlot.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">진료 방식</span>
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full font-medium text-sm",
                      selectedSlot.type === 'online'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                    )}>
                      {selectedSlot.type === 'online' ? (
                        <>
                          <Video className="h-4 w-4" />
                          <span>비대면 진료</span>
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4" />
                          <span>방문 진료</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">진료비</span>
                    <span className="font-medium">{selectedDoctor.consultationFee.toLocaleString()}원</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>증상 및 메모</CardTitle>
                <CardDescription>진료받고 싶은 증상이나 궁금한 점을 적어주세요</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="예: 3일 전부터 기침과 열이 나고 있습니다..."
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-patient"
                />
              </CardContent>
            </Card>
          </div>

          <Card className="bg-patient text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">예약을 확정하시겠습니까?</h3>
                  <p className="text-patient-light">
                    예약 완료 후 의료진이 승인하면 알림을 보내드립니다.
                  </p>
                </div>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleBooking}
                  className="min-w-[120px]"
                >
                  <Check className="h-5 w-5 mr-2" />
                  예약 확정
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}