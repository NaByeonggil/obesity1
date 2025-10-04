"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Coins,
  FileText,
  TrendingUp,
  TrendingDown,
  Pill,
  Users,
  AlertTriangle,
  Loader2,
  Download,
  RefreshCw
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DailySettlement {
  date: string
  totalPrescriptions: number
  completedPrescriptions: number
  totalAmount: number
  patientPayment: number // 본인 부담금 (30%)
  insurancePayment: number // 보험 부담금 (70%)
  uniquePatients: number
  prescriptions: Array<{
    id: string
    prescriptionNumber: string
    patientName: string
    issuedAt: string
    status: string
    totalPrice: number
    patientPayment: number
    insurancePayment: number
    medicationCount: number
  }>
}

interface MonthlyStats {
  totalRevenue: number
  totalPrescriptions: number
  averageDailyRevenue: number
  topDay: {
    date: string
    revenue: number
  }
}

function DailySettlementContent() {
  const { data: session } = useSession()
  const [selectedDate, setSelectedDate] = React.useState(
    new Date().toISOString().split('T')[0]
  )
  const [settlement, setSettlement] = React.useState<DailySettlement | null>(null)
  const [monthlyStats, setMonthlyStats] = React.useState<MonthlyStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadSettlement = React.useCallback(async (date: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/pharmacy/settlement?date=${date}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('정산 내역 조회 실패')
      }

      const data = await response.json()
      setSettlement(data.settlement)
      setMonthlyStats(data.monthlyStats)
    } catch (err) {
      console.error('정산 조회 오류:', err)
      setError('정산 내역을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadSettlement(selectedDate)
  }, [selectedDate, loadSettlement])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">접수 대기</Badge>
      case "DISPENSING":
        return <Badge variant="default">조제중</Badge>
      case "DISPENSED":
        return <Badge variant="success">조제 완료</Badge>
      case "COMPLETED":
        return <Badge variant="success">수령 완료</Badge>
      default:
        return <Badge variant="secondary">대기</Badge>
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <DashboardLayout userRole="pharmacy" user={session?.user || null}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">정산 내역을 불러오는 중...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="pharmacy" user={session?.user || null}>
      <div className="space-y-6">
        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">일일 정산</h1>
            <p className="text-gray-600 mt-1">
              당일 처방전 조제 내역 및 본인 부담금 정산
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleToday}
            >
              <Calendar className="h-4 w-4 mr-2" />
              오늘
            </Button>
            <Button
              variant="outline"
              onClick={() => loadSettlement(selectedDate)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>
        </div>

        {/* Date Selector */}
        <Card>
          <CardHeader>
            <CardTitle>정산 날짜 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="max-w-xs"
            />
          </CardContent>
        </Card>

        {/* Daily Stats */}
        {settlement && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    총 처방전
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-pharmacy">
                    {settlement.totalPrescriptions}건
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    완료: {settlement.completedPrescriptions}건
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    방문 고객
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-pharmacy">
                    {settlement.uniquePatients}명
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    본인 부담금 (30%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {settlement.patientPayment.toLocaleString()}원
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    환자 부담
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    보험 부담금 (70%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {settlement.insurancePayment.toLocaleString()}원
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    보험 청구
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Total Amount */}
            <Card className="bg-gradient-to-r from-pharmacy to-pharmacy-dark text-white">
              <CardHeader>
                <CardTitle className="text-white">총 매출액</CardTitle>
                <CardDescription className="text-pharmacy-light">
                  {new Date(selectedDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {settlement.totalAmount.toLocaleString()}원
                </div>
                <div className="mt-4 pt-4 border-t border-pharmacy-light/30 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-pharmacy-light">본인 부담금</p>
                    <p className="text-xl font-semibold">
                      {settlement.patientPayment.toLocaleString()}원
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-pharmacy-light">보험 부담금</p>
                    <p className="text-xl font-semibold">
                      {settlement.insurancePayment.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Stats */}
            {monthlyStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      월 누적 매출
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-pharmacy">
                      {monthlyStats.totalRevenue.toLocaleString()}원
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      총 {monthlyStats.totalPrescriptions}건
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      일 평균 매출
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-pharmacy">
                      {Math.round(monthlyStats.averageDailyRevenue).toLocaleString()}원
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      최고 매출일
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-pharmacy">
                      {monthlyStats.topDay.revenue.toLocaleString()}원
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(monthlyStats.topDay.date).toLocaleDateString('ko-KR')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Prescription List */}
            <Card>
              <CardHeader>
                <CardTitle>처방전 내역 ({settlement.prescriptions.length}건)</CardTitle>
                <CardDescription>
                  당일 조제한 처방전 상세 내역
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settlement.prescriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">처방전 내역이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {settlement.prescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                #{prescription.prescriptionNumber}
                              </h4>
                              {getStatusBadge(prescription.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              환자: {prescription.patientName}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDateTime(prescription.issuedAt)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Pill className="h-3 w-3" />
                                의약품 {prescription.medicationCount}개
                              </div>
                            </div>
                          </div>

                          <div className="text-right ml-4 space-y-2">
                            <div>
                              <p className="text-xs text-gray-600">총액</p>
                              <p className="text-lg font-bold text-gray-900">
                                {prescription.totalPrice.toLocaleString()}원
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-gray-600">본인부담</p>
                                <p className="font-semibold text-green-600">
                                  {prescription.patientPayment.toLocaleString()}원
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">보험부담</p>
                                <p className="font-semibold text-blue-600">
                                  {prescription.insurancePayment.toLocaleString()}원
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function DailySettlementPage() {
  return (
    <ProtectedRoute requiredRole="pharmacy">
      <DailySettlementContent />
    </ProtectedRoute>
  )
}
