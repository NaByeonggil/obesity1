"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

interface DoctorStats {
  todayAppointments: number
  totalAppointments: number
  pendingAppointments: number
  completedAppointments: number
}

interface TodayAppointment {
  id: string
  type: 'online' | 'offline'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  date: string
  time: string
  symptoms: string
  patient: {
    id: string
    name: string
    phone: string
    email: string
    avatar?: string
  }
  department: string
  notes?: string
}

function DoctorDashboardContent() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [stats, setStats] = React.useState<DoctorStats>({
    todayAppointments: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  })
  const [todayAppointments, setTodayAppointments] = React.useState<TodayAppointment[]>([])
  const [recentPatients, setRecentPatients] = React.useState<any[]>([])

  React.useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      fetchDashboardData()
    }
  }, [status, session])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!session?.user) {
        setError('로그인이 필요합니다.')
        setLoading(false)
        return
      }

      const response = await fetch('/api/doctor/appointments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // 통계 설정
          setStats({
            todayAppointments: data.stats.todayAppointments,
            totalAppointments: data.stats.totalAppointments,
            pendingAppointments: data.stats.pendingAppointments,
            completedAppointments: data.stats.completedAppointments
          })

          // 오늘의 예약 필터링
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          const todayAppts = data.appointments.filter((apt: any) => {
            const aptDate = new Date(apt.appointmentDate)
            return aptDate >= today && aptDate < tomorrow
          })
          setTodayAppointments(todayAppts.slice(0, 5)) // 최대 5개만 표시

          // 최근 환자 목록 (중복 제거)
          const uniquePatients = new Map()
          data.appointments.forEach((apt: any) => {
            if (!uniquePatients.has(apt.patient.id)) {
              uniquePatients.set(apt.patient.id, {
                ...apt.patient,
                lastVisit: apt.date,
                lastSymptoms: apt.symptoms,
                appointmentCount: 1
              })
            } else {
              const patient = uniquePatients.get(apt.patient.id)
              patient.appointmentCount++
            }
          })
          setRecentPatients(Array.from(uniquePatients.values()).slice(0, 5))
        }
      } else {
        setError('데이터를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'completed':
        return 'success'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '확정'
      case 'pending':
        return '대기'
      case 'completed':
        return '완료'
      case 'cancelled':
        return '취소'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">대시보드를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          안녕하세요, {session?.user?.name || '원장'}님!
        </h2>
        <p className="text-blue-100">
          오늘도 환자들을 위한 진료 준비가 되어 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="오늘 진료"
          value={stats.todayAppointments.toString()}
          description="건"
          trend={stats.todayAppointments > 0 ? {
            value: 2.5,
            label: "전일 대비",
            isPositive: true
          } : undefined}
          icon={Calendar}
          variant="doctor"
        />
        <StatsCard
          title="총 예약수"
          value={stats.totalAppointments.toString()}
          description="건"
          trend={{
            value: 12,
            label: "전월 대비",
            isPositive: true
          }}
          icon={Users}
          variant="doctor"
        />
        <StatsCard
          title="대기 예약"
          value={stats.pendingAppointments.toString()}
          description="건"
          trend={stats.pendingAppointments > 0 ? {
            value: 5,
            label: "전일 대비",
            isPositive: true
          } : undefined}
          icon={Clock}
          variant="doctor"
        />
        <StatsCard
          title="완료 진료"
          value={stats.completedAppointments.toString()}
          description="건"
          trend={{
            value: 8,
            label: "전월 대비",
            isPositive: true
          }}
          icon={FileText}
          variant="doctor"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              오늘의 일정
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/doctor/appointments')}
            >
              전체보기
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardTitle>
          <CardDescription>
            오늘 예정된 진료 일정입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              오늘 예정된 진료가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={appointment.patient.avatar} />
                      <AvatarFallback>
                        {appointment.patient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{appointment.patient.name}</span>
                        <Badge variant={getStatusColor(appointment.status)}>
                          {getStatusText(appointment.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {appointment.time} • {appointment.department}
                      </div>
                      <div className="text-sm text-gray-500">
                        증상: {appointment.symptoms}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.type === 'online' ? (
                      <Badge variant="outline">
                        <Video className="h-3 w-3 mr-1" />
                        비대면
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <MapPin className="h-3 w-3 mr-1" />
                        대면
                      </Badge>
                    )}
                    <Button size="sm" variant="outline">
                      <Phone className="h-3 w-3 mr-1" />
                      연락
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              최근 환자
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/doctor/patients')}
            >
              전체보기
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardTitle>
          <CardDescription>
            최근 진료받은 환자 목록입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentPatients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              최근 환자 정보가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={patient.avatar} />
                      <AvatarFallback>
                        {patient.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-gray-600">
                        마지막 방문: {patient.lastVisit}
                      </div>
                      <div className="text-sm text-gray-500">
                        증상: {patient.lastSymptoms}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      방문 {patient.appointmentCount}회
                    </Badge>
                    <Button size="sm" variant="outline">
                      진료기록
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function DoctorDashboard() {
  return (
    <ProtectedRoute requiredRole="doctor">
      <DoctorDashboardContent />
    </ProtectedRoute>
  )
}