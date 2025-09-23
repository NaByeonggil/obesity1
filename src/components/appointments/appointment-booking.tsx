"use client"

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

// Mock data
const mockDoctors: Doctor[] = [
  {
    id: "1",
    name: "박성우",
    specialization: "내과",
    clinic: "서울대학교병원",
    rating: 4.8,
    reviews: 124,
    image: "https://ui-avatars.com/api/?name=박성우&background=10B981&color=fff",
    consultationFee: 30000,
    location: "서울시 종로구",
    availableSlots: [
      { time: "09:00", available: true, type: "offline" },
      { time: "09:30", available: false, type: "offline" },
      { time: "10:00", available: true, type: "online" },
      { time: "10:30", available: true, type: "offline" },
      { time: "11:00", available: false, type: "online" },
      { time: "11:30", available: true, type: "online" },
    ]
  },
  {
    id: "2",
    name: "이영희",
    specialization: "피부과",
    clinic: "강남피부과의원",
    rating: 4.9,
    reviews: 89,
    image: "https://ui-avatars.com/api/?name=이영희&background=F59E0B&color=fff",
    consultationFee: 50000,
    location: "서울시 강남구",
    availableSlots: [
      { time: "14:00", available: true, type: "offline" },
      { time: "14:30", available: true, type: "online" },
      { time: "15:00", available: false, type: "offline" },
      { time: "15:30", available: true, type: "offline" },
      { time: "16:00", available: true, type: "online" },
      { time: "16:30", available: true, type: "offline" },
    ]
  }
]

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

  const filteredDoctors = mockDoctors.filter(doctor =>
    doctor.name.includes(searchQuery) ||
    doctor.specialization.includes(searchQuery) ||
    doctor.clinic.includes(searchQuery)
  )

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setStep('select')
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setStep('confirm')
  }

  const handleBooking = () => {
    if (selectedDoctor && selectedSlot) {
      const appointmentData = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        clinic: selectedDoctor.clinic,
        date: selectedDate,
        time: selectedSlot.time,
        type: selectedSlot.type,
        symptoms,
        fee: selectedDoctor.consultationFee
      }

      onBookingComplete?.(appointmentData)

      // Reset form
      setStep('search')
      setSelectedDoctor(null)
      setSelectedSlot(null)
      setSymptoms("")
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
            />
          </div>

          <div className="grid gap-4">
            {filteredDoctors.map((doctor) => (
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
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                        <Badge variant="doctor">{doctor.specialization}</Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{doctor.clinic}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{doctor.rating}</span>
                          <span>({doctor.reviews})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{doctor.location}</span>
                        </div>
                        <div className="font-medium text-gray-900">
                          진료비 {doctor.consultationFee.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                    <Button variant="patient">
                      예약하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <div className="grid grid-cols-7 gap-2">
                {availableDates.map((date) => (
                  <button
                    key={date.date}
                    onClick={() => setSelectedDate(date.date)}
                    className={cn(
                      "p-3 text-center rounded-lg border transition-colors",
                      selectedDate === date.date
                        ? "bg-patient text-white border-patient"
                        : "border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="text-sm font-medium">{date.label}</div>
                    <div className="text-xs text-gray-500">{date.dayOfWeek}</div>
                  </button>
                ))}
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
                {selectedDoctor.availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && handleSlotSelect(slot)}
                    disabled={!slot.available}
                    className={cn(
                      "p-4 rounded-lg border text-left transition-colors",
                      slot.available
                        ? "border-gray-200 hover:bg-gray-50 hover:border-patient"
                        : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{slot.time}</span>
                      {slot.type === 'online' ? (
                        <Video className="h-4 w-4 text-blue-500" />
                      ) : (
                        <User className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {slot.type === 'online' ? '화상진료' : '방문진료'}
                    </div>
                  </button>
                ))}
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">진료 방식</span>
                    <Badge variant={selectedSlot.type === 'online' ? 'default' : 'secondary'}>
                      {selectedSlot.type === 'online' ? '화상진료' : '방문진료'}
                    </Badge>
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