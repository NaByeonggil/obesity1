"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Pill,
  Package,
  Users,
  Clock,
  ChevronRight,
  Phone,
  MessageCircle,
  AlertTriangle,
  TrendingUp,
  Search,
  FileText,
  Loader2
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PharmacyStats {
  pendingPrescriptions: number
  totalCustomers: number
  lowStockItems: number
  completedToday: number
  trends: {
    newCustomersThisMonth: number
  }
}

interface PendingPrescription {
  id: string
  patientName: string
  patientPhone?: string
  doctorName: string
  clinic: string
  receivedTime: string
  medications: Array<{
    name: string
    quantity: number
    dosage: string
    frequency: string
    duration: string
    price: number
    manufacturer?: string
  }>
  totalPrice: number
  urgent: boolean
  estimatedTime: string
  diagnosis?: string
  notes?: string
}

interface LowStockItem {
  id: string
  name: string
  currentStock: number
  minStock: number
  supplier?: string
  lastOrderDate?: string
  category?: string
  price: number
}

// 목업 데이터
const mockStats: PharmacyStats = {
  pendingPrescriptions: 5,
  totalCustomers: 234,
  lowStockItems: 8,
  completedToday: 12,
  trends: {
    newCustomersThisMonth: 15
  }
}

const mockPrescriptions: PendingPrescription[] = [
  {
    id: "1",
    patientName: "김민지",
    patientPhone: "010-1234-5678",
    doctorName: "박성우 원장",
    clinic: "서울대학교병원",
    receivedTime: new Date().toISOString(),
    medications: [
      {
        name: "타이레놀",
        quantity: 20,
        dosage: "500mg",
        frequency: "3회",
        duration: "7일",
        price: 5000
      },
      {
        name: "부루펜",
        quantity: 14,
        dosage: "400mg",
        frequency: "2회",
        duration: "7일",
        price: 7000
      }
    ],
    totalPrice: 12000,
    urgent: true,
    estimatedTime: "15분",
    diagnosis: "감기"
  },
  {
    id: "2",
    patientName: "이철수",
    patientPhone: "010-2345-6789",
    doctorName: "김지수 원장",
    clinic: "강남내과",
    receivedTime: new Date().toISOString(),
    medications: [
      {
        name: "아스피린",
        quantity: 30,
        dosage: "100mg",
        frequency: "1회",
        duration: "30일",
        price: 10000
      }
    ],
    totalPrice: 10000,
    urgent: false,
    estimatedTime: "10분",
    diagnosis: "고혈압"
  }
]

const mockLowStock: LowStockItem[] = [
  {
    id: "1",
    name: "타이레놀 500mg",
    currentStock: 5,
    minStock: 20,
    supplier: "한국얀센",
    lastOrderDate: "2024-01-10",
    category: "진통제",
    price: 5000
  },
  {
    id: "2",
    name: "부루펜 400mg",
    currentStock: 8,
    minStock: 30,
    supplier: "삼일제약",
    lastOrderDate: "2024-01-08",
    category: "소염진통제",
    price: 7000
  }
]

function PharmacyDashboardContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = React.useState<PharmacyStats | null>(null)
  const [pendingPrescriptions, setPendingPrescriptions] = React.useState<PendingPrescription[]>([])
  const [lowStockItems, setLowStockItems] = React.useState<LowStockItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [useMockData, setUseMockData] = React.useState(false)

  const loadDashboardData = React.useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) {
      // 인증되지 않은 경우 목업 데이터 사용
      setUseMockData(true)
      setStats(mockStats)
      setPendingPrescriptions(mockPrescriptions)
      setLowStockItems(mockLowStock)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setUseMockData(false)

      const [statsResponse, prescriptionsResponse, inventoryResponse] = await Promise.all([
        fetch('/api/pharmacy/stats', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/pharmacy/prescriptions', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        }),
        fetch('/api/pharmacy/inventory', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        })
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      }

      if (prescriptionsResponse.ok) {
        const prescData = await prescriptionsResponse.json()
        // API 응답을 PendingPrescription 형식으로 변환
        const formattedPrescriptions = prescData.prescriptions.map((presc: any) => ({
          id: presc.id,
          patientName: presc.patient?.name || '환자',
          patientPhone: presc.patient?.phone,
          doctorName: presc.doctor?.name || '담당의',
          clinic: presc.doctor?.clinic || '',
          receivedTime: presc.issuedAt || new Date().toISOString(),
          medications: presc.medications || [],
          totalPrice: presc.totalPrice || 0,
          urgent: false,
          estimatedTime: '15분',
          diagnosis: presc.diagnosis,
          notes: presc.notes
        }))
        setPendingPrescriptions(formattedPrescriptions.slice(0, 3))
      }

      if (inventoryResponse.ok) {
        const invData = await inventoryResponse.json()
        setLowStockItems(invData.lowStockItems.slice(0, 3))
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
      setError('대시보드 정보를 불러오는 중 오류가 발생했습니다.')
      // Fallback to mock data
      setUseMockData(true)
      setStats(mockStats)
      setPendingPrescriptions(mockPrescriptions)
      setLowStockItems(mockLowStock)
    } finally {
      setLoading(false)
    }
  }, [status, session])

  React.useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const formatTime = (dateString: string | undefined | null) => {
    if (!dateString) {
      return '-'
    }

    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return '-'
      }
      return date.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } catch (error) {
      console.error('시간 포맷 오류:', error, dateString)
      return '-'
    }
  }

  const handleViewPDF = async (prescriptionId: string) => {
    if (useMockData) {
      alert('데모 모드에서는 PDF를 볼 수 없습니다. 로그인 후 이용해주세요.')
      return
    }

    try {
      const response = await fetch(`/api/pharmacy/prescriptions/pdf?prescriptionId=${prescriptionId}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 404) {
          alert('의사가 아직 처방전 파일을 첨부하지 않았습니다.\n의사에게 문의해주세요.')
        } else {
          alert(errorData.error || 'PDF 조회에 실패했습니다.')
        }
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('PDF 조회 오류:', error)
      alert('PDF 조회 중 오류가 발생했습니다.')
    }
  }

  const handleUpdatePrescriptionStatus = async (prescriptionId: string, status: string) => {
    if (!session?.user) return

    try {
      const response = await fetch(`/api/pharmacy/prescriptions/${prescriptionId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        alert('처방전 상태가 업데이트되었습니다.')
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.error || '상태 업데이트에 실패했습니다.')
      }
    } catch (err) {
      console.error('처방전 상태 업데이트 오류:', err)
      alert('처방전 상태 업데이트 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    const loadingUser = session?.user || {
      name: "약사",
      email: "pharmacy@example.com",
      image: undefined
    }

    return (
      <DashboardLayout userRole="pharmacy" user={loadingUser}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">대시보드를 불러오는 중...</span>
        </div>
      </DashboardLayout>
    )
  }

  // 데모 사용자 데이터
  const demoUser = useMockData && !session?.user ? {
    name: "김약사",
    email: "pharmacy@example.com",
    image: undefined
  } : session?.user || null

  return (
    <DashboardLayout userRole="pharmacy" user={demoUser}>
      <div className="space-y-6">
      {error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {useMockData && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            데모 모드로 실행 중입니다. 로그인하면 실제 데이터를 볼 수 있습니다.
          </AlertDescription>
        </Alert>
      )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-pharmacy to-pharmacy-dark rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">안녕하세요, {demoUser?.name || '약사'} 약사님!</h2>
          <p className="text-pharmacy-light">
            현재 {stats?.pendingPrescriptions || 0}건의 처방전이 조제 대기 중입니다.
            오늘 {stats?.completedToday || 0}건을 완료하셨습니다.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="대기 중인 처방전"
            value={stats?.pendingPrescriptions || 0}
            description="조제 대기 건수"
            icon={Pill}
            variant="pharmacy"
          />
          <StatsCard
            title="총 고객 수"
            value={stats?.totalCustomers || 0}
            description="관리 중인 고객"
            icon={Users}
            variant="pharmacy"
            trend={{
              value: stats?.trends?.newCustomersThisMonth || 0,
              label: "이번 달 신규",
              isPositive: true
            }}
          />
          <StatsCard
            title="재고 부족 품목"
            value={stats?.lowStockItems || 0}
            description="주문 필요 의약품"
            icon={Package}
            variant="pharmacy"
          />
          <StatsCard
            title="오늘 완료"
            value={stats?.completedToday || 0}
            description="조제 완료 건수"
            icon={Clock}
            variant="pharmacy"
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
              <Button
                className="h-20 flex-col space-y-2"
                variant="pharmacy"
                onClick={() => router.push('/pharmacy/prescriptions')}
              >
                <Pill className="h-6 w-6" />
                <span>처방전 조제</span>
              </Button>
              <Button
                className="h-20 flex-col space-y-2"
                variant="outline"
                onClick={() => router.push('/pharmacy/medication-pricing')}
              >
                <Package className="h-6 w-6" />
                <span>비급여 의약품 가격</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <Search className="h-6 w-6" />
                <span>의약품 검색</span>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline">
                <TrendingUp className="h-6 w-6" />
                <span>매출 분석</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Prescriptions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>대기 중인 처방전</CardTitle>
                <CardDescription>조제가 필요한 처방전 목록입니다</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                전체보기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingPrescriptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>대기 중인 처방전이 없습니다.</p>
                </div>
              ) : (
                pendingPrescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">{formatTime(prescription.receivedTime)}</div>
                        <div className="text-xs text-gray-500 mt-1">{prescription.estimatedTime}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900">{prescription.patientName}</p>
                          {prescription.urgent && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{prescription.doctorName}</p>
                        <p className="text-xs text-gray-500">{prescription.clinic}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {prescription.medications.slice(0, 2).map((med, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {med.name}
                            </Badge>
                          ))}
                          {prescription.medications.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{prescription.medications.length - 2}개
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewPDF(prescription.id)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        처방전 보기
                      </Button>
                      <Button
                        size="sm"
                        variant="pharmacy"
                        onClick={() => handleUpdatePrescriptionStatus(prescription.id, 'DISPENSED')}
                      >
                        조제 시작
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
                        연락
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Low Stock Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>재고 부족 품목</CardTitle>
                <CardDescription>주문이 필요한 의약품 목록입니다</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                전체보기
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>재고 부족 품목이 없습니다.</p>
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Package className="h-8 w-8 text-pharmacy" />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.supplier || '공급업체 정보 없음'}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="destructive" className="text-xs">
                            재고: {item.currentStock}개
                          </Badge>
                          <span className="text-xs text-gray-500">
                            최소: {item.minStock}개
                          </span>
                        </div>
                        {item.lastOrderDate && (
                          <p className="text-xs text-gray-400 mt-1">
                            최근 주문: {new Date(item.lastOrderDate).toLocaleDateString('ko-KR')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button size="sm" variant="outline">
                        주문하기
                      </Button>
                      <Button size="sm" variant="ghost">
                        <FileText className="h-4 w-4 mr-1" />
                        내역
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function PharmacyDashboard() {
  return (
    <ProtectedRoute requiredRole="pharmacy">
      <PharmacyDashboardContent />
    </ProtectedRoute>
  )
}