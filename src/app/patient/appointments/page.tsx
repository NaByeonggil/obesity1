"use client"

import * as React from "react"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AppointmentBooking } from "@/components/appointments/appointment-booking"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { appointmentsApi, ApiError } from "@/lib/api-client"
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  MessageCircle,
  MoreVertical,
  Plus,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Appointment {
  id: string
  type: 'ONLINE' | 'OFFLINE'
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  appointmentDate: string
  symptoms?: string
  notes?: string
  createdAt: string
  updatedAt: string
  doctor: {
    id: string
    name: string
    specialization?: string
    clinic?: string
    avatar?: string
  }
  department: {
    id: string
    name: string
    consultationType: string
  }
  prescription?: {
    id: string
    prescriptionNumber: string
    status: string
    issuedAt: string
  }
  // 원본 데이터 구조 (API 응답용)
  users_appointments_doctorIdTousers?: any
  departments?: any
}

export default function PatientAppointmentsPage() {
  const [showBooking, setShowBooking] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("upcoming")
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [cancellingId, setCancellingId] = React.useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = React.useState<Appointment | null>(null)

  // 디버깅: 상태 변경 추적
  React.useEffect(() => {
    console.log('[State Update] appointments:', appointments)
    console.log('[State Update] appointments.length:', appointments.length)
    console.log('[State Update] appointments type:', typeof appointments)
    console.log('[State Update] appointments is array:', Array.isArray(appointments))
  }, [appointments])

  React.useEffect(() => {
    console.log('[State Update] loading:', loading)
  }, [loading])

  React.useEffect(() => {
    console.log('[State Update] error:', error)
  }, [error])

  const { user, token, isAuthenticated } = useAuth()

  // Fetch appointments from API
  const fetchAppointments = React.useCallback(async () => {
    console.log('[fetchAppointments] Starting...')

    // NextAuth 세션이 있으면 API가 자동으로 처리하므로 인증 체크 제거
    // if (isAuthenticated === false) {
    //   console.log('[fetchAppointments] Not authenticated, skipping')
    //   setLoading(false)
    //   return
    // }

    try {
      setLoading(true)
      setError(null)
      console.log('[fetchAppointments] Calling API...')

      // 직접 fetch 사용 (쿠키 기반 인증)
      const response = await fetch('/api/patient/appointments', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('[fetchAppointments] Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('[fetchAppointments] API Response:', data)

        if (data.success && data.appointments) {
          console.log('[fetchAppointments] Appointments count:', data.appointments.length)
          console.log('[fetchAppointments] Raw appointments:', data.appointments)

          // API 응답 구조를 페이지에서 사용하는 구조로 변환
          const formattedAppointments = data.appointments.map((apt: any) => ({
            ...apt,
            doctor: apt.users_appointments_doctorIdTousers || apt.doctor,
            department: apt.departments || apt.department
          }))

          console.log('[fetchAppointments] Formatted appointments:', formattedAppointments)
          setAppointments(formattedAppointments || [])
        } else {
          console.log('[fetchAppointments] No appointments in response or failed')
          setAppointments([])
        }
      } else {
        const errorData = await response.json()
        console.error('[fetchAppointments] Error response:', errorData)
        setError(errorData.error || '예약 정보를 불러오는 중 오류가 발생했습니다.')
        setAppointments([])
      }
    } catch (err) {
      console.error('[fetchAppointments] Exception:', err)
      setError('예약 정보를 불러오는 중 오류가 발생했습니다.')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  // 예약 취소 함수
  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment)
    setShowCancelConfirm(true)
  }

  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return

    setCancellingId(appointmentToCancel.id)
    try {
      const response = await fetch(`/api/appointments/${appointmentToCancel.id}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ 예약 취소 성공:', data)

        // 예약 목록 새로고침
        await fetchAppointments()

        // 모달 닫기
        setShowCancelConfirm(false)
        setAppointmentToCancel(null)

        alert('예약이 성공적으로 취소되었습니다.')
      } else {
        const errorData = await response.json()
        console.error('❌ 예약 취소 실패:', errorData)
        alert(errorData.error || '예약 취소 중 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('❌ 예약 취소 예외:', err)
      alert('예약 취소 중 오류가 발생했습니다.')
    } finally {
      setCancellingId(null)
    }
  }

  const handleCancelClose = () => {
    setShowCancelConfirm(false)
    setAppointmentToCancel(null)
  }

  // 페이지 포커스 시 자동 새로고침
  React.useEffect(() => {
    const handleFocus = () => {
      fetchAppointments()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAppointments()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchAppointments])

  // 30초마다 자동 새로고침
  React.useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointments()
    }, 30000) // 30초

    return () => clearInterval(interval)
  }, [fetchAppointments])

  const handleBookingComplete = (appointmentData: any) => {
    console.log("예약 완료:", appointmentData)
    setShowBooking(false)
    // 새 예약 후 목록 새로고침
    fetchAppointments()
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // 상태별 배지 변환
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { variant: 'success' as const, text: '확정' }
      case 'PENDING':
        return { variant: 'warning' as const, text: '승인 대기' }
      case 'COMPLETED':
        return { variant: 'success' as const, text: '완료' }
      case 'CANCELLED':
        return { variant: 'destructive' as const, text: '취소' }
      default:
        return { variant: 'secondary' as const, text: '알 수 없음' }
    }
  }

  // 진료 방법 추출 (notes에서)
  const getConsultationMethod = (appointment: Appointment): 'video' | 'phone' | null => {
    if (appointment.type !== 'ONLINE' || !appointment.notes) return null
    // 전화 진료를 먼저 체크 (공백 포함)
    if (appointment.notes.includes('전화 진료')) return 'phone'
    if (appointment.notes.includes('전화진료')) return 'phone'
    // 화상 진료 체크 (공백 포함)
    if (appointment.notes.includes('화상 진료')) return 'video'
    if (appointment.notes.includes('화상진료')) return 'video'
    return null
  }

  // 예약을 과거/예정으로 분류 (에러 핸들링 추가)
  let upcomingAppointments: Appointment[] = []
  let pastAppointments: Appointment[] = []

  try {
    const now = new Date()
    console.log('[Filtering] Total appointments before filtering:', appointments.length)
    console.log('[Filtering] Appointments array:', appointments)
    console.log('[Filtering] Current time:', now.toISOString())

    if (!Array.isArray(appointments)) {
      console.error('[Filtering] appointments is not an array:', appointments)
      throw new Error('appointments is not an array')
    }

    upcomingAppointments = appointments.filter(apt => {
      try {
        if (!apt || !apt.appointmentDate) {
          console.warn('[Filtering] Invalid appointment:', apt)
          return false
        }
        const aptDate = new Date(apt.appointmentDate)
        const isUpcoming = aptDate >= now && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED'
        console.log(`[Filtering] Appointment ${apt.id}:`, {
          date: aptDate.toISOString(),
          status: apt.status,
          isUpcoming,
          doctor: apt.doctor?.name,
          type: apt.type
        })
        return isUpcoming
      } catch (filterError) {
        console.error('[Filtering] Error filtering appointment:', apt, filterError)
        return false
      }
    }).sort((a, b) => {
      // 최근에 예약된 것이 위로 오도록 정렬 (createdAt 기준 내림차순)
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    pastAppointments = appointments.filter(apt => {
      try {
        if (!apt || !apt.appointmentDate) {
          console.warn('[Filtering] Invalid appointment:', apt)
          return false
        }
        const aptDate = new Date(apt.appointmentDate)
        const isPast = aptDate < now || apt.status === 'COMPLETED' || apt.status === 'CANCELLED'
        return isPast
      } catch (filterError) {
        console.error('[Filtering] Error filtering appointment:', apt, filterError)
        return false
      }
    }).sort((a, b) => {
      // 최근에 예약된 것이 위로 오도록 정렬 (createdAt 기준 내림차순)
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })

    console.log('[Filtering] Upcoming appointments:', upcomingAppointments.length, upcomingAppointments)
    console.log('[Filtering] Past appointments:', pastAppointments.length, pastAppointments)
  } catch (filteringError) {
    console.error('[Filtering] Critical error during filtering:', filteringError)
    upcomingAppointments = []
    pastAppointments = []
  }

  if (showBooking) {
    return (
      <DashboardLayout userRole="patient" user={user}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">새 예약</h1>
              <p className="text-gray-600">의료진을 선택하고 예약하세요</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowBooking(false)}
            >
              취소
            </Button>
          </div>
          <AppointmentBooking onBookingComplete={handleBookingComplete} />
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout userRole="patient" user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">예약 정보를 불러오는 중...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="patient" user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">예약 관리</h1>
            <p className="text-gray-600">예약 현황을 확인하고 새로운 예약을 만드세요</p>
          </div>
          <Button
            onClick={() => setShowBooking(true)}
            className="bg-patient hover:bg-patient-dark"
          >
            <Plus className="h-5 w-5 mr-2" />
            새 예약
          </Button>
        </div>

        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">다가오는 예약 ({upcomingAppointments.length})</TabsTrigger>
            <TabsTrigger value="past">과거 예약 ({pastAppointments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">예정된 예약이 없습니다</h3>
                  <p className="text-sm">새로운 예약을 만들어보세요.</p>
                  <div className="mt-4 text-xs text-gray-400">
                    <p>디버깅 정보:</p>
                    <p>Total appointments: {appointments.length}</p>
                    <p>Upcoming: {upcomingAppointments.length}</p>
                    <p>Loading: {loading.toString()}</p>
                    <p>Error: {error || 'none'}</p>
                  </div>
                </div>
              </Card>
            ) : (
              upcomingAppointments.map((appointment) => {
                try {
                  const statusBadge = getStatusBadge(appointment.status)
                  return (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={appointment.doctor?.avatar || `https://ui-avatars.com/api/?name=${appointment.doctor?.name || 'Doctor'}&background=10B981&color=fff`}
                              alt={appointment.doctor?.name || 'Doctor'}
                            />
                            <AvatarFallback className="bg-doctor text-white text-lg">
                              {appointment.doctor?.name?.charAt(0) || 'D'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor?.name || '의사 정보 없음'}</h3>
                              <Badge variant="doctor">{appointment.doctor?.specialization || appointment.department?.name || '진료과'}</Badge>
                              {appointment.type === 'ONLINE' && (
                                <Badge variant="default" className="bg-blue-500">
                                  비대면 진료
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">{appointment.doctor?.clinic || '병원'}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(appointment.appointmentDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(appointment.appointmentDate)}</span>
                              </div>
                              <Badge variant={appointment.type === 'ONLINE' ? 'default' : 'secondary'}
                                     className={appointment.type === 'ONLINE' ? 'bg-green-500' : ''}>
                                {appointment.type === 'ONLINE' ?
                                  (getConsultationMethod(appointment) === 'phone' ? '전화진료' : '화상진료')
                                  : '방문진료'}
                              </Badge>
                              <Badge variant={statusBadge.variant}>
                                {statusBadge.text}
                              </Badge>
                            </div>
                            {appointment.symptoms && (
                              <p className="text-sm text-gray-600 mt-2">증상: {appointment.symptoms}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {appointment.type === 'ONLINE' && (() => {
                            const isPhoneConsultation = appointment.notes?.includes('전화 진료');
                            console.log('🔍 [진료 타입 체크]', {
                              appointmentId: appointment.id,
                              notes: appointment.notes,
                              isPhoneConsultation,
                              includes전화진료: appointment.notes?.includes('전화 진료'),
                              includes화상진료: appointment.notes?.includes('화상 진료')
                            });

                            return (
                              <Button
                                size="sm"
                                className="bg-patient hover:bg-patient-dark"
                                disabled={appointment.status === 'PENDING'}
                              >
                                {isPhoneConsultation ? (
                                  <>
                                    <Phone className="h-4 w-4 mr-2" />
                                    {appointment.status === 'CONFIRMED' ? '전화진료 대기' : '진료 대기 중'}
                                  </>
                                ) : (
                                  <>
                                    <Video className="h-4 w-4 mr-2" />
                                    {appointment.status === 'CONFIRMED' ? '화상진료 입장' : '진료 대기 중'}
                                  </>
                                )}
                              </Button>
                            );
                          })()}
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4 mr-2" />
                              연락
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              메시지
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelClick(appointment)}
                              disabled={cancellingId === appointment.id}
                            >
                              {cancellingId === appointment.id ? '취소 중...' : '예약 취소'}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <span>진료과: </span>
                          <span className="font-medium text-gray-900">{appointment.department?.name || '진료과 정보 없음'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>{appointment.doctor?.clinic || '병원'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  )
                } catch (renderError) {
                  console.error('[Render] Error rendering appointment:', appointment, renderError)
                  return (
                    <Card key={appointment.id || 'error'} className="p-4 border-red-200">
                      <div className="text-red-600 text-sm">
                        예약 정보 표시 중 오류가 발생했습니다.
                      </div>
                    </Card>
                  )
                }
              })
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">과거 예약이 없습니다</h3>
                  <p className="text-sm">아직 진료 받은 기록이 없습니다.</p>
                </div>
              </Card>
            ) : (
              pastAppointments.map((appointment) => {
                const statusBadge = getStatusBadge(appointment.status)
                return (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={appointment.doctor?.avatar || `https://ui-avatars.com/api/?name=${appointment.doctor?.name || 'Doctor'}&background=10B981&color=fff`}
                              alt={appointment.doctor?.name || 'Doctor'}
                            />
                            <AvatarFallback className="bg-doctor text-white text-lg">
                              {appointment.doctor?.name?.charAt(0) || 'D'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor?.name || '의사 정보 없음'}</h3>
                              <Badge variant="doctor">{appointment.doctor?.specialization || appointment.department?.name || '진료과'}</Badge>
                              {appointment.type === 'ONLINE' && (
                                <Badge variant="default" className="bg-blue-500">
                                  비대면 진료
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">{appointment.doctor?.clinic || '병원'}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(appointment.appointmentDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(appointment.appointmentDate)}</span>
                              </div>
                              <Badge variant={appointment.type === 'ONLINE' ? 'default' : 'secondary'}
                                     className={appointment.type === 'ONLINE' ? 'bg-green-500' : ''}>
                                {appointment.type === 'ONLINE' ?
                                  (getConsultationMethod(appointment) === 'phone' ? '전화진료' : '화상진료')
                                  : '방문진료'}
                              </Badge>
                              <Badge variant={statusBadge.variant}>
                                {statusBadge.text}
                              </Badge>
                            </div>
                            {appointment.symptoms && (
                              <p className="text-sm text-gray-600 mt-2">증상: {appointment.symptoms}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {appointment.prescription && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.location.href = `/patient/prescriptions/${appointment.prescription?.id}`}
                            >
                              처방전 보기
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            진료 기록 보기
                          </Button>
                          <Button size="sm" variant="outline">
                            다시 예약
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <span>진료과: </span>
                          <span className="font-medium text-gray-900">{appointment.department?.name || '진료과 정보 없음'}</span>
                        </div>
                        {appointment.prescription && (
                          <div className="text-sm text-gray-500">
                            <span>처방전: </span>
                            <span className="font-medium text-gray-900">{appointment.prescription?.prescriptionNumber}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>
        </Tabs>

        {/* 예약 취소 확인 모달 */}
        {showCancelConfirm && appointmentToCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">예약 취소 확인</h3>
                <div className="space-y-3 mb-6">
                  <p className="text-sm text-gray-600">다음 예약을 취소하시겠습니까?</p>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">의사:</span>
                      <span className="text-sm font-medium">{appointmentToCancel.doctor?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">진료과:</span>
                      <span className="text-sm font-medium">{appointmentToCancel.department?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">일시:</span>
                      <span className="text-sm font-medium">
                        {formatDate(appointmentToCancel.appointmentDate)} {formatTime(appointmentToCancel.appointmentDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">진료 방식:</span>
                      <span className="text-sm font-medium">
                        {appointmentToCancel.type === 'ONLINE' ?
                          (getConsultationMethod(appointmentToCancel) === 'phone' ? '전화진료' : '화상진료')
                          : '방문진료'}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-red-600 font-medium">
                    취소된 예약은 복구할 수 없습니다.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCancelClose}
                    disabled={cancellingId !== null}
                  >
                    닫기
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleCancelConfirm}
                    disabled={cancellingId !== null}
                  >
                    {cancellingId !== null ? '취소 중...' : '예약 취소'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}