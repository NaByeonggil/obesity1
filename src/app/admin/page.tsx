"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Activity,
  Shield,
  TrendingUp,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Database,
  Bell,
  Loader2
} from "lucide-react"

// Types for admin statistics
interface AdminStats {
  totalUsers: number
  activeUsers: number
  systemAlerts: number
  dailyTransactions: number
  usersByRole: {
    patients: number
    doctors: number
    pharmacies: number
    admins: number
  }
  signupStats: {
    today: number
    thisWeek: number
    thisMonth: number
  }
  activityStats: {
    totalAppointments: number
    totalPrescriptions: number
    dailyTransactions: number
  }
  socialLoginStats: Record<string, number>
  trends: {
    usersGrowth: number
    appointmentsGrowth: number
    prescriptionsGrowth: number
  }
}

// Mock data for fallback
const mockUser = {
  name: "관리자",
  email: "admin@healthcare.com",
  image: "https://ui-avatars.com/api/?name=관리자&background=8B5CF6&color=fff"
}

const mockStats: AdminStats = {
  totalUsers: 6,
  activeUsers: 6,
  systemAlerts: 0,
  dailyTransactions: 0,
  usersByRole: {
    patients: 6,
    doctors: 0,
    pharmacies: 0,
    admins: 0
  },
  signupStats: {
    today: 0,
    thisWeek: 0,
    thisMonth: 6
  },
  activityStats: {
    totalAppointments: 8,
    totalPrescriptions: 5,
    dailyTransactions: 0
  },
  socialLoginStats: {},
  trends: {
    usersGrowth: 15,
    appointmentsGrowth: 8,
    prescriptionsGrowth: 5
  }
}

const mockSystemAlerts = [
  {
    id: "1",
    type: "warning",
    title: "서버 응답 시간 지연",
    description: "평균 응답 시간이 정상 수치를 초과했습니다",
    time: "10분 전",
    severity: "medium"
  },
  {
    id: "2",
    type: "error",
    title: "데이터베이스 연결 오류",
    description: "일부 사용자의 데이터베이스 연결에 문제가 발생했습니다",
    time: "25분 전",
    severity: "high"
  },
  {
    id: "3",
    type: "info",
    title: "정기 백업 완료",
    description: "오늘 03:00 정기 백업이 성공적으로 완료되었습니다",
    time: "2시간 전",
    severity: "low"
  }
]

const mockRecentActivities = [
  {
    id: "1",
    user: "김민지",
    action: "의료진 회원가입",
    target: "doctor",
    time: "5분 전",
    status: "pending"
  },
  {
    id: "2",
    user: "박성우",
    action: "처방전 발급",
    target: "prescription",
    time: "12분 전",
    status: "completed"
  },
  {
    id: "3",
    user: "이영미",
    action: "재고 업데이트",
    target: "inventory",
    time: "18분 전",
    status: "completed"
  },
  {
    id: "4",
    user: "최지혜",
    action: "환자 진료 기록 작성",
    target: "record",
    time: "23분 전",
    status: "completed"
  }
]

function AdminDashboardContent() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 사용자 데이터가 없을 경우 목업 데이터 사용
  const displayUser = session?.user || mockUser

  // Fetch admin statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (status !== 'authenticated') {
        setStats(mockStats)
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/admin/stats', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        if (!response.ok) {
          throw new Error('통계 데이터를 불러오는데 실패했습니다')
        }
        const data = await response.json()
        setStats(data.stats)
      } catch (err) {
        console.error('Failed to fetch admin stats:', err)
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
        // Fallback to mock data
        setStats(mockStats)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [status])

  // Display stats (real data or fallback)
  const displayStats = stats || mockStats

  // Show loading spinner if data is still loading
  if (isLoading) {
    return (
      <DashboardLayout userRole="admin" user={displayUser}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">통계 데이터를 불러오는 중...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="admin" user={displayUser}>
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {error} 현재 샘플 데이터를 표시하고 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-admin to-admin-dark rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">관리자 대시보드</h2>
          <p className="text-admin-light">
            현재 시스템에 {displayStats.activeUsers.toLocaleString()}명의 활성 사용자가 있습니다.
            {displayStats.systemAlerts > 0 && ` ${displayStats.systemAlerts}개의 시스템 알림이 있습니다.`}
          </p>
          {displayStats.signupStats.today > 0 && (
            <p className="text-admin-light mt-2">
              오늘 {displayStats.signupStats.today}명의 신규 사용자가 가입했습니다.
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="전체 사용자"
            value={displayStats.totalUsers}
            description="등록된 총 사용자 수"
            icon={Users}
            variant="admin"
            trend={{
              value: displayStats.trends.usersGrowth,
              label: "이번 달",
              isPositive: displayStats.trends.usersGrowth > 0
            }}
          />
          <StatsCard
            title="활성 사용자"
            value={displayStats.activeUsers}
            description="최근 30일 내 활동"
            icon={Activity}
            variant="admin"
          />
          <StatsCard
            title="시스템 알림"
            value={displayStats.systemAlerts}
            description="확인 필요한 알림"
            icon={Shield}
            variant="admin"
          />
          <StatsCard
            title="일일 거래"
            value={displayStats.dailyTransactions}
            description="오늘 처리된 거래"
            icon={TrendingUp}
            variant="admin"
            trend={{
              value: displayStats.trends.appointmentsGrowth,
              label: "전월 대비",
              isPositive: displayStats.trends.appointmentsGrowth > 0
            }}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>관리자 도구</CardTitle>
            <CardDescription>시스템 관리를 위한 주요 기능들입니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button className="h-20 flex-col space-y-2" variant="admin">
                <Users className="h-6 w-6" />
                <span>사용자 관리</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <Database className="h-6 w-6" />
                <span>데이터 관리</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <Settings className="h-6 w-6" />
                <span>시스템 설정</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <TrendingUp className="h-6 w-6" />
                <span>통계 분석</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>사용자 역할별 분포</CardTitle>
              <CardDescription>등록된 사용자의 역할별 현황입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">환자</span>
                  <span className="text-lg font-bold text-patient">{displayStats.usersByRole.patients}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">의료진</span>
                  <span className="text-lg font-bold text-doctor">{displayStats.usersByRole.doctors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">약사</span>
                  <span className="text-lg font-bold text-pharmacy">{displayStats.usersByRole.pharmacies}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">관리자</span>
                  <span className="text-lg font-bold text-admin">{displayStats.usersByRole.admins}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signup Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>가입 통계</CardTitle>
              <CardDescription>최근 가입 현황 요약입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">오늘</span>
                  <Badge variant="outline">{displayStats.signupStats.today}명</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">이번 주</span>
                  <Badge variant="outline">{displayStats.signupStats.thisWeek}명</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">이번 달</span>
                  <Badge variant="secondary">{displayStats.signupStats.thisMonth}명</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>활동 요약</CardTitle>
              <CardDescription>전체 시스템 활동 통계입니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">총 예약</span>
                  <span className="text-lg font-bold">{displayStats.activityStats.totalAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">총 처방전</span>
                  <span className="text-lg font-bold">{displayStats.activityStats.totalPrescriptions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">오늘 거래</span>
                  <Badge variant="success">{displayStats.activityStats.dailyTransactions}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Social Login Statistics */}
        {Object.keys(displayStats.socialLoginStats).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>소셜 로그인 통계</CardTitle>
              <CardDescription>각 소셜 로그인 플랫폼별 사용자 수입니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(displayStats.socialLoginStats).map(([provider, count]) => (
                  <div key={provider} className="text-center p-4 border rounded-lg">
                    <p className="text-sm font-medium capitalize">{provider}</p>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>시스템 알림</CardTitle>
                <CardDescription>시스템 상태 및 중요 알림들입니다</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                전체보기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockSystemAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {alert.severity === 'high' && (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                    {alert.severity === 'medium' && (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    {alert.severity === 'low' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <Badge
                        variant={
                          alert.severity === 'high' ? 'destructive' :
                          alert.severity === 'medium' ? 'warning' : 'success'
                        }
                        className="text-xs"
                      >
                        {alert.severity === 'high' ? '긴급' :
                         alert.severity === 'medium' ? '주의' : '정보'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{alert.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>최근 활동</CardTitle>
                <CardDescription>시스템 내 최근 사용자 활동들입니다</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                전체보기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockRecentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(activity.user)}&background=8B5CF6&color=fff`} />
                      <AvatarFallback className="bg-admin text-white text-xs">
                        {activity.user.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={activity.status === 'completed' ? 'success' : 'secondary'}
                    >
                      {activity.status === 'completed' ? '완료' : '대기'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}