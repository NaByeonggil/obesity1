"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/ui/navigation"
import { DepartmentCard } from "@/components/ui/department-card"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import {
  Calendar,
  FileText,
  Heart,
  Activity,
  Pill,
  Phone,
  Stethoscope,
  Eye,
  Thermometer,
  Send,
  Search,
  Building,
  Syringe,
  ArrowRight,
  Baby,
  Brain,
  Bone,
  Sparkles,
  LogOut
} from "lucide-react"

interface Appointment {
  id: string
  date: string
  time: string
  doctor: string
  department: string
  clinic?: string
  type: 'online' | 'offline'
  status: 'confirmed' | 'pending' | 'completed'
  symptoms?: string
  notes?: string
}

interface Prescription {
  id: string
  prescriptionNumber: string
  diagnosis: string
  notes?: string
  status: 'ISSUED' | 'PENDING' | 'DISPENSING' | 'DISPENSED'
  issuedAt: string
  validUntil: string
  appointment: {
    patient: {
      id: string
      name: string
    }
    doctor: {
      id: string
      name: string
      clinic?: string
    }
    department: {
      id: string
      name: string
    }
  }
  medications: Array<{
    id: string
    dosage: string
    frequency: string
    duration: string
    medication: {
      id: string
      name: string
      description?: string
    }
  }>
}

function PatientDashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // 진료 방법 추출 helper 함수
  const getConsultationMethod = (appointment: Appointment): 'video' | 'phone' | null => {
    if (appointment.type !== 'online' || !appointment.notes) return null
    if (appointment.notes.includes('화상진료')) return 'video'
    if (appointment.notes.includes('전화진료')) return 'phone'
    return null
  }

  // NextAuth 세션 기반 인증 체크
  const isAuthenticated = status === 'authenticated'
  const user = session?.user

  // NextAuth 세션 로딩 처리
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
    } else {
      setIsLoading(false)
    }
  }, [status])

  // 예약 데이터 새로고침 함수
  const refreshAppointments = useCallback(async () => {
    if (isAuthenticated && session?.user) {
      try {
        console.log('🔄 예약 데이터 새로고침 중...')

        const response = await fetch('/api/patient/appointments', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.appointments) {
            // API 응답 데이터를 프론트엔드 형식으로 변환
            const formattedAppointments = data.appointments.slice(0, 3).map((apt: any) => {
              // 날짜와 시간 분리
              const appointmentDate = new Date(apt.appointmentDate)
              const dateStr = appointmentDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })
              const timeStr = appointmentDate.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })

              return {
                id: apt.id,
                date: dateStr,
                time: timeStr,
                doctor: apt.users_appointments_doctorIdTousers?.name || '의사 정보 없음',
                department: apt.departments?.name || '진료과 정보 없음',
                clinic: apt.users_appointments_doctorIdTousers?.clinic || '병원 정보 없음',
                type: apt.type?.toLowerCase() === 'online' ? 'online' : 'offline',
                status: apt.status?.toLowerCase() || 'pending',
                symptoms: apt.symptoms || '',
                notes: apt.notes || ''
              }
            })
            setAppointments(formattedAppointments)
            console.log(`✅ 예약 데이터 새로고침 완료: ${formattedAppointments.length}개`)
          }
        }
      } catch (error) {
        console.error('Failed to refresh appointments:', error)
      }
    }
  }, [isAuthenticated, session])

  // NextAuth 세션 변경 감지 시 리다이렉션
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // 인증 후 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !session?.user) {
        setAppointments([])
        setPrescriptions([])
        return
      }

      try {
        // 실제 예약 데이터 API 호출
        try {
          const response = await fetch('/api/patient/appointments', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.appointments) {
              // API 응답 데이터를 프론트엔드 형식으로 변환 (초기 로드)
              const formattedAppointments = data.appointments.slice(0, 3).map((apt: any) => {
                // 날짜와 시간 분리
                const appointmentDate = new Date(apt.appointmentDate)
                const dateStr = appointmentDate.toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit'
                })
                const timeStr = appointmentDate.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })

                return {
                  id: apt.id,
                  date: dateStr,
                  time: timeStr,
                  doctor: apt.users_appointments_doctorIdTousers?.name || '의사 정보 없음',
                  department: apt.departments?.name || '진료과 정보 없음',
                  clinic: apt.users_appointments_doctorIdTousers?.clinic || '병원 정보 없음',
                  type: apt.type?.toLowerCase() === 'online' ? 'online' : 'offline',
                  status: apt.status?.toLowerCase() || 'pending',
                  symptoms: apt.symptoms || ''
                }
              })
              setAppointments(formattedAppointments)
            }
          }
        } catch (error) {
          console.error('Failed to fetch appointments:', error)
          setAppointments([])
        }

        // 실제 처방전 데이터 API 호출
        try {
          const response = await fetch('/api/patient/prescriptions', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.prescriptions) {
              setPrescriptions(data.prescriptions.slice(0, 3))
            } else {
              setPrescriptions([])
            }
          } else {
            setPrescriptions([])
          }
        } catch (error) {
          console.error('Failed to fetch prescriptions:', error)
          setPrescriptions([])
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        setAppointments([])
        setPrescriptions([])
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }
  }, [isAuthenticated, session, status])

  // 페이지 포커스 시 자동 새로고침
  useEffect(() => {
    const handleFocus = () => {
      refreshAppointments()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshAppointments()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshAppointments])

  // 30초마다 자동 새로고침
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      refreshAppointments()
    }, 30000) // 30초

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshAppointments])

  // 페이지 경로 변경 시 즉시 새로고침 (예약 후 돌아올 때)
  useEffect(() => {
    if (pathname === '/patient' && isAuthenticated) {
      console.log('🔄 patient 페이지 방문 - 예약 데이터 새로고침')
      refreshAppointments()
    }
  }, [pathname, isAuthenticated, refreshAppointments])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-patient mx-auto"></div>
            <p className="mt-4 text-gray-600">서비스를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  const handlePharmacySearch = () => {
    router.push('/pharmacy/search')
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                안녕하세요, {user?.name || '환자'}님
              </h1>
              <p className="text-gray-600">필요한 의료 서비스를 선택해 주세요</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* Department Selection Section - 진료 과목 선택 */}
        <section className="py-6 md:py-10 lg:py-12 bg-gradient-to-b from-white to-gray-50 rounded-lg mb-8">
          <div className="w-full px-4 md:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8 lg:mb-10">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                원하시는 진료를 선택하세요
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-gray-600">
                다양한 진료 과목을 온라인/오프라인으로 편리하게 이용할 수 있습니다
              </p>
            </div>

            {/* 메인페이지와 동일: 모바일(3열), 태블릿(3열), 데스크톱(4열), Full HD(6열) */}
            <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-4 lg:gap-6">
              <DepartmentCard
                title="마운자로 · 위고비"
                subtitle="비만 치료"
                description="GLP-1 기반 최신 비만 치료제로 체중 감량을 도와드립니다"
                icon={Syringe}
                available="offline"
                color="bg-gradient-to-r from-purple-500 to-pink-500"
                href="/patient/clinics?department=obesity-treatment"
                featured={true}
                requireLogin={true}
              />
              <DepartmentCard
                title="비만 관련 처방"
                subtitle="체중 관리"
                description="전문 의료진과 함께 건강한 체중 감량 프로그램"
                icon={Activity}
                available="offline"
                color="bg-gradient-to-r from-orange-500 to-red-500"
                href="/patient/clinics?department=obesity"
                featured={true}
                requireLogin={true}
              />
              <DepartmentCard
                title="인공눈물"
                subtitle="안구 건조"
                description="안구 건조증 치료를 위한 인공눈물 처방"
                icon={Eye}
                available="online"
                color="bg-gradient-to-r from-blue-500 to-cyan-500"
                href="/patient/clinics?department=eye-care"
                requireLogin={true}
              />
              <DepartmentCard
                title="감기 관련"
                subtitle="일반 감기"
                description="감기 증상 완화를 위한 처방 및 상담"
                icon={Thermometer}
                available="online"
                color="bg-gradient-to-r from-green-500 to-emerald-500"
                href="/patient/clinics?department=cold"
                requireLogin={true}
              />
              <DepartmentCard
                title="내과"
                subtitle="일반 내과"
                description="소화기, 호흡기, 순환기 등 내과 진료"
                icon={Stethoscope}
                available="online"
                color="bg-gradient-to-r from-indigo-500 to-purple-500"
                href="/patient/clinics?department=internal-medicine"
                requireLogin={true}
              />
              <DepartmentCard
                title="소아과"
                subtitle="어린이 진료"
                description="영유아 및 어린이 전문 진료 서비스"
                icon={Baby}
                available="online"
                color="bg-gradient-to-r from-pink-500 to-rose-500"
                href="/patient/clinics?department=pediatrics"
                requireLogin={true}
              />
              <DepartmentCard
                title="피부과"
                subtitle="피부 질환"
                description="여드름, 아토피, 두드러기 등 피부 질환 진료"
                icon={Sparkles}
                available="online"
                color="bg-gradient-to-r from-yellow-500 to-orange-500"
                href="/patient/clinics?department=dermatology"
                requireLogin={true}
              />
              <DepartmentCard
                title="정형외과"
                subtitle="근골격계"
                description="관절, 척추, 근육 통증 진료 및 재활 상담"
                icon={Bone}
                available="online"
                color="bg-gradient-to-r from-gray-600 to-gray-800"
                href="/patient/clinics?department=orthopedics"
                requireLogin={true}
              />
              <DepartmentCard
                title="신경외과"
                subtitle="신경계 질환"
                description="두통, 어지럼증, 신경통 등 신경계 질환 진료"
                icon={Brain}
                available="online"
                color="bg-gradient-to-r from-purple-600 to-indigo-600"
                href="/patient/clinics?department=neurosurgery"
                requireLogin={true}
              />
              <DepartmentCard
                title="이비인후과"
                subtitle="귀코목"
                description="중이염, 축농증, 편도염 등 이비인후과 진료"
                icon={Activity}
                available="online"
                color="bg-gradient-to-r from-teal-500 to-green-500"
                href="/patient/clinics?department=ent"
                requireLogin={true}
              />
              <DepartmentCard
                title="산부인과"
                subtitle="여성 건강"
                description="여성 질환 및 산전 관리 전문 진료"
                icon={Heart}
                available="offline"
                color="bg-gradient-to-r from-red-500 to-pink-500"
                href="/patient/clinics?department=obgyn"
                requireLogin={true}
              />
              <DepartmentCard
                title="비뇨기과"
                subtitle="비뇨기 질환"
                description="비뇨기계 질환 전문 진료 및 상담"
                icon={Activity}
                available="offline"
                color="bg-gradient-to-r from-blue-600 to-indigo-600"
                href="/patient/clinics?department=urology"
                requireLogin={true}
              />
            </div>

            <div className="mt-8 md:mt-10 text-center">
              <Button size="lg" variant="outline" className="text-sm md:text-base">
                더 많은 진료 과목 보기
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Active Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                활성 처방전
              </CardTitle>
              <CardDescription>
                전자 처방전 확인 및 약국 전송
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptions.map((prescription) => {
                  // 유효기간 계산
                  const validUntil = new Date(prescription.validUntil)
                  const today = new Date()
                  const remainingDays = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                  // 첫 번째 약물 정보 (여러 약물이 있을 경우)
                  const firstMed = prescription.medications?.[0]
                  const medicationName = firstMed?.medication?.name || prescription.diagnosis
                  const dosage = firstMed?.dosage || ''
                  const frequency = firstMed?.frequency || ''

                  return (
                    <div
                      key={prescription.id}
                      className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push('/patient/prescriptions')}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{medicationName}</div>
                        <div className="flex gap-2">
                          {prescription.status === 'ISSUED' && (
                            <Badge className="bg-blue-100 text-blue-700">
                              <Send className="h-3 w-3 mr-1" />
                              전송 대기
                            </Badge>
                          )}
                          {prescription.status === 'PENDING' && (
                            <Badge className="bg-yellow-100 text-yellow-700">
                              조제 대기
                            </Badge>
                          )}
                          <Badge variant={remainingDays > 7 ? 'default' : 'destructive'}>
                            {remainingDays}일 남음
                          </Badge>
                        </div>
                      </div>
                      {dosage && frequency && (
                        <div className="text-sm text-gray-600 mb-1">
                          {dosage} • {frequency}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 mb-2">
                        처방의: {prescription.appointment.doctor.name}
                        {prescription.appointment.doctor.clinic && ` (${prescription.appointment.doctor.clinic})`}
                      </div>
                      {prescription.status === 'ISSUED' && (
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push('/patient/prescriptions')
                          }}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          약국으로 전송
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
              {prescriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  현재 활성 처방전이 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                예약 현황
              </CardTitle>
              <CardDescription>
                예정된 진료 일정 및 상태
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium">{appointment.doctor}</div>
                        {appointment.type === 'online' && (
                          <Badge variant="default" className="bg-blue-500">
                            비대면 진료
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{appointment.department}</div>
                      <div className="text-sm text-gray-600">{appointment.clinic}</div>
                      <div className="text-sm text-gray-500">
                        {appointment.date} {appointment.time}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        <Badge
                          variant={appointment.type === 'online' ? 'default' : 'secondary'}
                          className={appointment.type === 'online' ? 'bg-green-500' : ''}
                        >
                          {appointment.type === 'online' ?
                            (getConsultationMethod(appointment) === 'phone' ? '전화진료' : '화상진료')
                            : '방문진료'}
                        </Badge>
                        <Badge
                          variant={
                            appointment.status === 'confirmed' ? 'default' :
                            appointment.status === 'pending' ? 'secondary' : 'outline'
                          }
                        >
                          {appointment.status === 'confirmed' ? '확정' :
                           appointment.status === 'pending' ? '대기' : '완료'}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowDetailModal(true)
                        }}
                      >
                        상세보기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {appointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  예정된 진료가 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 서비스</CardTitle>
            <CardDescription>
              자주 사용하는 기능들을 빠르게 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={handlePharmacySearch}
              >
                <Search className="h-6 w-6 mb-2" />
                <span className="text-center">
                  비급여 의약품<br/>검색
                </span>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-center">
                  진료 기록<br/>조회
                </span>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <Phone className="h-6 w-6 mb-2" />
                <span className="text-center">
                  의료진<br/>상담
                </span>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <Building className="h-6 w-6 mb-2" />
                <span className="text-center">
                  약국<br/>찾기
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 예약 상세보기 모달 */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">예약 상세 정보</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">담당의</label>
                <p className="text-base">{selectedAppointment.doctor}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">병원</label>
                <p className="text-base">{selectedAppointment.clinic}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">진료과</label>
                <p className="text-base">{selectedAppointment.department}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">예약일시</label>
                <p className="text-base">{selectedAppointment.date} {selectedAppointment.time}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">진료 유형</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={selectedAppointment.type === 'online' ? 'default' : 'secondary'}
                         className={selectedAppointment.type === 'online' ? 'bg-green-500' : ''}>
                    {selectedAppointment.type === 'online' ?
                      (getConsultationMethod(selectedAppointment) === 'phone' ? '전화진료 (비대면)' : '화상진료 (비대면)')
                      : '방문진료 (대면)'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">상태</label>
                <p className="text-base">
                  {selectedAppointment.status === 'confirmed' ? '확정' :
                   selectedAppointment.status === 'pending' ? '대기' : '완료'}
                </p>
              </div>

              {selectedAppointment.symptoms && (
                <div>
                  <label className="text-sm font-medium text-gray-600">증상</label>
                  <p className="text-base">{selectedAppointment.symptoms}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDetailModal(false)}
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PatientDashboard() {
  return (
    <ProtectedRoute requiredRole="patient">
      <PatientDashboardContent />
    </ProtectedRoute>
  )
}