"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  CreditCard,
  AlertCircle,
  Lock,
  FileText
} from "lucide-react"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  clinic: any
  appointmentType: 'online' | 'offline'
}

export function BookingModal({ isOpen, onClose, clinic, appointmentType }: BookingModalProps) {
  const [step, setStep] = React.useState<'info' | 'time' | 'confirm'>('info')
  const [selectedDate, setSelectedDate] = React.useState("")
  const [selectedTime, setSelectedTime] = React.useState("")
  const [symptoms, setSymptoms] = React.useState("")

  // 비대면 진료용 추가 정보
  const [personalInfo, setPersonalInfo] = React.useState({
    name: "",
    phone: "",
    ssn1: "", // 주민번호 앞자리
    ssn2: "", // 주민번호 뒷자리 (암호화 대상)
  })

  const availableDates = [
    { date: "2024-01-20", label: "오늘", day: "월" },
    { date: "2024-01-21", label: "내일", day: "화" },
    { date: "2024-01-22", label: "1/22", day: "수" },
    { date: "2024-01-23", label: "1/23", day: "목" },
    { date: "2024-01-24", label: "1/24", day: "금" },
  ]

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ]

  const handleSubmit = () => {
    const bookingData = {
      clinicId: clinic.id,
      appointmentType,
      date: selectedDate,
      time: selectedTime,
      symptoms,
      ...(appointmentType === 'online' && {
        personalInfo: {
          ...personalInfo,
          ssn2: "ENCRYPTED_" + personalInfo.ssn2 // 실제로는 암호화 처리
        }
      })
    }

    console.log("예약 정보:", bookingData)
    // API 호출하여 예약 생성
    alert(`${appointmentType === 'online' ? '비대면' : '대면'} 진료 예약이 신청되었습니다. 의원 승인을 기다려주세요.`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white m-4">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {appointmentType === 'online' ? '비대면' : '대면'} 진료 예약
              </CardTitle>
              <CardDescription className="mt-1">
                {clinic.name}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {step === 'info' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  예약자 정보
                </h3>

                {appointmentType === 'online' ? (
                  <>
                    {/* 비대면 진료 - 추가 정보 필요 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-semibold mb-1">비대면 진료 안내</p>
                          <p>비대면 진료를 위해 본인확인이 필요합니다.</p>
                          <p>주민등록번호는 안전하게 암호화되어 저장됩니다.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          이름 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="실명을 입력하세요"
                          value={personalInfo.name}
                          onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          연락처 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="010-0000-0000"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          주민등록번호 <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center space-x-2">
                          <Input
                            placeholder="앞 6자리"
                            maxLength={6}
                            value={personalInfo.ssn1}
                            onChange={(e) => setPersonalInfo({...personalInfo, ssn1: e.target.value})}
                          />
                          <span>-</span>
                          <div className="relative flex-1">
                            <Input
                              type="password"
                              placeholder="뒤 7자리"
                              maxLength={7}
                              value={personalInfo.ssn2}
                              onChange={(e) => setPersonalInfo({...personalInfo, ssn2: e.target.value})}
                            />
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          주민등록번호는 암호화되어 안전하게 보관됩니다
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 대면 진료 - 기본 정보만 */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          이름 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="예약자 이름"
                          value={personalInfo.name}
                          onChange={(e) => setPersonalInfo({...personalInfo, name: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          연락처 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="010-0000-0000"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">
                    증상 설명
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={3}
                    placeholder="증상이나 상담하고 싶은 내용을 적어주세요"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => setStep('time')}
                disabled={
                  !personalInfo.name ||
                  !personalInfo.phone ||
                  (appointmentType === 'online' && (!personalInfo.ssn1 || !personalInfo.ssn2))
                }
              >
                다음 단계
              </Button>
            </div>
          )}

          {step === 'time' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  날짜 선택
                </h3>
                <div className="grid grid-cols-5 gap-2">
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
                      <div className="text-xs">{date.day}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  시간 선택
                  {appointmentType === 'online' && (
                    <Badge variant="secondary" className="ml-2">
                      전화 상담 가능 시간
                    </Badge>
                  )}
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "p-2 rounded-lg border transition-colors",
                        selectedTime === time
                          ? "bg-patient text-white border-patient"
                          : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('info')}
                >
                  이전
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep('confirm')}
                  disabled={!selectedDate || !selectedTime}
                >
                  다음 단계
                </Button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">예약 정보 확인</h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">진료 방식</span>
                    <Badge variant={appointmentType === 'online' ? 'default' : 'secondary'}>
                      {appointmentType === 'online' ? '비대면 (전화)' : '대면'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">의원</span>
                    <span className="font-medium">{clinic.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">예약자</span>
                    <span className="font-medium">{personalInfo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">연락처</span>
                    <span className="font-medium">{personalInfo.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">날짜</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">시간</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                </div>

                {appointmentType === 'online' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start space-x-2">
                      <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-1">비대면 진료 안내</p>
                        <p>• 예약이 승인되면 알림을 보내드립니다</p>
                        <p>• 예약 시간에 의료진이 전화드립니다</p>
                        <p>• 처방전은 전화 상담 후 발급됩니다</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('time')}
                >
                  이전
                </Button>
                <Button
                  className="flex-1 bg-patient hover:bg-patient-dark"
                  onClick={handleSubmit}
                >
                  예약 신청
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}