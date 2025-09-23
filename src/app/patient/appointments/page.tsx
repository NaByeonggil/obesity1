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
}

export default function PatientAppointmentsPage() {
  const [showBooking, setShowBooking] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("upcoming")
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const { user, token, isAuthenticated } = useAuth()

  // Fetch appointments from API
  const fetchAppointments = React.useCallback(async () => {
    if (!token || !isAuthenticated) return

    try {
      setLoading(true)
      setError(null)
      const response = await appointmentsApi.getAppointments(token)
      setAppointments(response.appointments || [])
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('예약 정보를 불러오는 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [token, isAuthenticated])

  React.useEffect(() => {
    fetchAppointments()
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

  // 예약을 과거/예정으로 분류
  const now = new Date()
  const upcomingAppointments = appointments.filter(apt =>
    new Date(apt.appointmentDate) >= now && apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED'
  )
  const pastAppointments = appointments.filter(apt =>
    new Date(apt.appointmentDate) < now || apt.status === 'COMPLETED' || apt.status === 'CANCELLED'
  )

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
                </div>
              </Card>
            ) : (
              upcomingAppointments.map((appointment) => {
                const statusBadge = getStatusBadge(appointment.status)
                return (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={appointment.doctor.avatar || `https://ui-avatars.com/api/?name=${appointment.doctor.name}&background=10B981&color=fff`}
                              alt={appointment.doctor.name}
                            />
                            <AvatarFallback className="bg-doctor text-white text-lg">
                              {appointment.doctor.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor.name}</h3>
                              <Badge variant="doctor">{appointment.doctor.specialization || appointment.department.name}</Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{appointment.doctor.clinic || '병원'}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(appointment.appointmentDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(appointment.appointmentDate)}</span>
                              </div>
                              <Badge variant={appointment.type === 'ONLINE' ? 'default' : 'secondary'}>
                                {appointment.type === 'ONLINE' ? '화상진료' : '방문진료'}
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
                          {appointment.type === 'ONLINE' && (
                            <Button
                              size="sm"
                              className="bg-patient hover:bg-patient-dark"
                              disabled={appointment.status === 'PENDING'}
                            >
                              <Video className="h-4 w-4 mr-2" />
                              {appointment.status === 'CONFIRMED' ? '화상진료 입장' : '진료 대기 중'}
                            </Button>
                          )}
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4 mr-2" />
                              연락
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              메시지
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <span>진료과: </span>
                          <span className="font-medium text-gray-900">{appointment.department.name}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>{appointment.doctor.clinic || '병원'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
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
                              src={appointment.doctor.avatar || `https://ui-avatars.com/api/?name=${appointment.doctor.name}&background=10B981&color=fff`}
                              alt={appointment.doctor.name}
                            />
                            <AvatarFallback className="bg-doctor text-white text-lg">
                              {appointment.doctor.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor.name}</h3>
                              <Badge variant="doctor">{appointment.doctor.specialization || appointment.department.name}</Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{appointment.doctor.clinic || '병원'}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(appointment.appointmentDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(appointment.appointmentDate)}</span>
                              </div>
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
                              onClick={() => window.location.href = `/patient/prescriptions/${appointment.prescription.id}`}
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
                          <span className="font-medium text-gray-900">{appointment.department.name}</span>
                        </div>
                        {appointment.prescription && (
                          <div className="text-sm text-gray-500">
                            <span>처방전: </span>
                            <span className="font-medium text-gray-900">{appointment.prescription.prescriptionNumber}</span>
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
      </div>
    </DashboardLayout>
  )
}