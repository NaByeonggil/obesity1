"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { doctorsApi, appointmentsApi, ApiError } from "@/lib/api-client"
import {
  Calendar,
  Users,
  FileText,
  Clock,
  ChevronRight,
  Phone,
  Video,
  MapPin,
  TrendingUp,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DoctorStats {
  todayAppointments: number
  totalPatients: number
  pendingAppointments: number
  completedToday: number
  trends: {
    newPatientsThisMonth: number
  }
}

interface TodayAppointment {
  id: string
  type: 'ONLINE' | 'OFFLINE'
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  appointmentDate: string
  symptoms?: string
  notes?: string
  patient: {
    id: string
    name: string
    phone?: string
    avatar?: string
  }
}

interface RecentPatient {
  id: string
  name: string
  phone?: string
  avatar?: string
  lastVisit: string
  lastSymptoms?: string
  appointmentCount: number
}

const mockStats = {
  todayAppointments: 8,
  totalPatients: 156,
  pendingAppointments: 12,
  completedToday: 5
}

const mockTodaySchedule = [
  {
    id: "1",
    patientName: "김민지",
    time: "09:00",
    type: "offline" as const,
    status: "completed" as const,
    symptoms: "감기 증상"
  },
  {
    id: "2",
    patientName: "이철수",
    time: "09:30",
    type: "online" as const,
    status: "in_progress" as const,
    symptoms: "혈압 관리 상담"
  },
  {
    id: "3",
    patientName: "박영희",
    time: "10:00",
    type: "offline" as const,
    status: "pending" as const,
    symptoms: "정기 검진"
  },
  {
    id: "4",
    patientName: "최호준",
    time: "10:30",
    type: "online" as const,
    status: "pending" as const,
    symptoms: "복통"
  }
]

const mockRecentPatients = [
  {
    id: "1",
    name: "김민지",
    age: 28,
    lastVisit: "2024-01-15",
    condition: "감기",
    urgency: "low" as const
  },
  {
    id: "2",
    name: "이철수",
    age: 45,
    lastVisit: "2024-01-14",
    condition: "고혈압",
    urgency: "medium" as const
  },
  {
    id: "3",
    name: "박영희",
    age: 52,
    lastVisit: "2024-01-13",
    condition: "당뇨",
    urgency: "high" as const
  }
]

export default function DoctorDashboard() {
  const [stats, setStats] = React.useState<DoctorStats | null>(null)
  const [todaySchedule, setTodaySchedule] = React.useState<TodayAppointment[]>([])
  const [recentPatients, setRecentPatients] = React.useState<RecentPatient[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [useMockData, setUseMockData] = React.useState(false)

  const { user, token, isAuthenticated } = useAuth()

  // 데이터 로딩 함수
  const loadDashboardData = React.useCallback(async () => {
    if (!token || !isAuthenticated) {
      // 인증되지 않은 경우 목업 데이터 사용
      setUseMockData(true)
      setStats(mockStats)

      // 목업 데이터를 API 응답 형태로 변환
      const mockScheduleData: TodayAppointment[] = mockTodaySchedule.map(item => ({
        id: item.id,
        type: item.type === 'online' ? 'ONLINE' : 'OFFLINE',
        status: item.status === 'completed' ? 'COMPLETED' :
                item.status === 'in_progress' ? 'CONFIRMED' : 'PENDING',
        appointmentDate: new Date().toISOString(),
        symptoms: item.symptoms,
        patient: {
          id: item.id,
          name: item.patientName,
          phone: '010-1234-5678',
          avatar: undefined
        },
        notes: undefined
      }))

      const mockPatientData: RecentPatient[] = mockRecentPatients.map(item => ({
        id: item.id,
        name: item.name,
        phone: '010-1234-5678',
        avatar: undefined,
        lastVisit: item.lastVisit,
        lastSymptoms: item.condition,
        appointmentCount: 3
      }))

      setTodaySchedule(mockScheduleData)
      setRecentPatients(mockPatientData)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setUseMockData(false)

      // 통계, 오늘 스케줄, 최근 환자를 병렬로 가져오기
      const [statsResponse, scheduleResponse, patientsResponse] = await Promise.all([
        doctorsApi.getStats(token),
        doctorsApi.getTodaySchedule(token),
        doctorsApi.getRecentPatients(token)
      ])

      setStats(statsResponse.stats)

      // 오늘 날짜 필터링
      const today = new Date()
      const todayString = today.toISOString().split('T')[0]

      const todayAppointments = scheduleResponse.appointments.filter((apt: any) =>
        apt.appointmentDate.startsWith(todayString)
      )

      setTodaySchedule(todayAppointments)
      setRecentPatients(patientsResponse.patients)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('대시보드 정보를 불러오는 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [token, isAuthenticated])

  React.useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // 시간 포맷팅
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
        return { variant: 'default' as const, text: '진행중' }
      case 'PENDING':
        return { variant: 'secondary' as const, text: '대기' }
      case 'COMPLETED':
        return { variant: 'success' as const, text: '완료' }
      case 'CANCELLED':
        return { variant: 'destructive' as const, text: '취소' }
      default:
        return { variant: 'secondary' as const, text: '알 수 없음' }
    }
  }

  if (loading) {
    const loadingUser = user || {
      name: "사용자",
      email: "loading@example.com",
      avatar: undefined
    }

    return (
      <DashboardLayout userRole="doctor" user={loadingUser}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">대시보드를 불러오는 중...</span>
        </div>
      </DashboardLayout>
    )
  }

  // 데모 사용자 데이터
  const demoUser = useMockData && !user ? {
    name: "김의사",
    email: "doctor@example.com",
    avatar: undefined
  } : user

  return (
    <DashboardLayout userRole="doctor" user={demoUser}>
      <div className="space-y-6">
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {useMockData && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              데모 모드로 실행 중입니다. 로그인하면 실제 데이터를 볼 수 있습니다.
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-doctor to-doctor-dark rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">안녕하세요, {demoUser?.name} 원장님!</h2>
          <p className="text-doctor-light">
            오늘 예정된 진료가 {stats?.todayAppointments || 0}건 있습니다.
            현재 {stats?.completedToday || 0}건 완료되었습니다.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="오늘 진료"
            value={stats?.todayAppointments || 0}
            description="예정된 진료 수"
            icon={Calendar}
            variant="doctor"
          />
          <StatsCard
            title="총 환자 수"
            value={stats?.totalPatients || 0}
            description="관리 중인 환자"
            icon={Users}
            variant="doctor"
            trend={{
              value: stats?.trends?.newPatientsThisMonth || 0,
              label: "이번 달 신규",
              isPositive: true
            }}
          />
          <StatsCard
            title="대기 중인 예약"
            value={stats?.pendingAppointments || 0}
            description="승인 대기 중"
            icon={Clock}
            variant="doctor"
          />
          <StatsCard
            title="오늘 완료"
            value={stats?.completedToday || 0}
            description="진료 완료 건수"
            icon={FileText}
            variant="doctor"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 작업</CardTitle>
            <CardDescription>자주 사용하는 기능들을 빠르게 이용하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col space-y-2" variant="doctor">
                <Calendar className="h-6 w-6" />
                <span>일정 관리</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <Users className="h-6 w-6" />
                <span>환자 검색</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <FileText className="h-6 w-6" />
                <span>처방전 작성</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <TrendingUp className="h-6 w-6" />
                <span>진료 통계</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>오늘의 일정</CardTitle>
                <CardDescription>오늘 예정된 진료 스케줄입니다</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                전체보기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {todaySchedule.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>오늘 예정된 진료가 없습니다.</p>
                </div>
              ) : (
                todaySchedule.map((appointment) => {
                  const statusBadge = getStatusBadge(appointment.status)
                  return (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">{formatTime(appointment.appointmentDate)}</div>
                          <div className="flex items-center space-x-1 mt-1">
                            {appointment.type === 'ONLINE' ? (
                              <Video className="h-4 w-4 text-blue-500" />
                            ) : (
                              <MapPin className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                          <p className="text-sm text-gray-600">{appointment.symptoms || '증상 정보 없음'}</p>
                          <Badge
                            variant={statusBadge.variant}
                            className="mt-1"
                          >
                            {statusBadge.text}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {appointment.type === 'ONLINE' && (
                          <Button size="sm" variant="outline">
                            <Video className="h-4 w-4 mr-1" />
                            화상진료
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          상세보기
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>최근 환자</CardTitle>
                <CardDescription>최근에 진료한 환자들입니다</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                전체보기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>최근 진료한 환자가 없습니다.</p>
                </div>
              ) : (
                recentPatients.map((patient) => {
                  const formatDate = (dateString: string) => {
                    const date = new Date(dateString)
                    return date.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })
                  }

                  return (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name}&background=3B82F6&color=fff`}
                            alt={patient.name}
                          />
                          <AvatarFallback className="bg-patient text-white text-sm">
                            {patient.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{patient.name}</p>
                            <Badge variant="secondary">
                              {patient.appointmentCount}회 방문
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {patient.lastSymptoms || '진료 기록 없음'}
                          </p>
                          <p className="text-sm text-gray-500">
                            최근 방문: {formatDate(patient.lastVisit)}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {patient.phone && (
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-1" />
                            연락
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          기록보기
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}