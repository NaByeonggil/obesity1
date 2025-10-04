"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  FileText,
  Pill,
  AlertTriangle,
  Loader2,
  ChevronRight
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  firstVisit: string
  lastVisit: string
  totalPrescriptions: number
  totalAmount: number
  prescriptions: Array<{
    id: string
    prescriptionNumber: string
    issuedAt: string
    status: string
    totalPrice: number
    diagnosis: string
    medicationCount: number
  }>
}

function PharmacyCustomersContent() {
  const { data: session } = useSession()
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = React.useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [showDetailModal, setShowDetailModal] = React.useState(false)

  const loadCustomers = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/pharmacy/customers', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('고객 목록 조회 실패')
      }

      const data = await response.json()
      setCustomers(data.customers || [])
      setFilteredCustomers(data.customers || [])
    } catch (err) {
      console.error('고객 조회 오류:', err)
      setError('고객 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  React.useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    )
    setFilteredCustomers(filtered)
  }, [searchTerm, customers])

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDetailModal(true)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
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
          <span className="ml-2">고객 목록을 불러오는 중...</span>
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

        <div>
          <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
          <p className="text-gray-600 mt-1">
            처방전을 전송받은 고객 정보를 관리하세요
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">총 고객 수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pharmacy">
                {customers.length}명
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">총 처방전</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pharmacy">
                {customers.reduce((sum, c) => sum + c.totalPrescriptions, 0)}건
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">총 거래액</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pharmacy">
                {customers.reduce((sum, c) => sum + c.totalAmount, 0).toLocaleString()}원
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>고객 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="이름, 이메일, 전화번호로 검색"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle>고객 목록 ({filteredCustomers.length}명)</CardTitle>
            <CardDescription>
              처방전을 전송받은 고객들의 정보입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? '검색 결과가 없습니다.' : '등록된 고객이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleViewCustomer(customer)}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-pharmacy/10 p-3 rounded-full">
                        <Users className="h-6 w-6 text-pharmacy" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>첫 방문: {formatDate(customer.firstVisit)}</span>
                          <span>최근 방문: {formatDate(customer.lastVisit)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">처방전</div>
                        <div className="text-lg font-bold text-pharmacy">
                          {customer.totalPrescriptions}건
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">총 거래액</div>
                        <div className="text-lg font-bold text-pharmacy">
                          {customer.totalAmount.toLocaleString()}원
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Detail Modal */}
        {showDetailModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  고객 상세 정보
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  닫기
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>고객 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">이름</p>
                      <p className="font-semibold">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">이메일</p>
                      <p className="font-semibold">{selectedCustomer.email}</p>
                    </div>
                    {selectedCustomer.phone && (
                      <div>
                        <p className="text-sm text-gray-600">연락처</p>
                        <p className="font-semibold">{selectedCustomer.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">첫 방문일</p>
                      <p className="font-semibold">{formatDate(selectedCustomer.firstVisit)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">최근 방문일</p>
                      <p className="font-semibold">{formatDate(selectedCustomer.lastVisit)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">총 처방전</p>
                      <p className="font-semibold">{selectedCustomer.totalPrescriptions}건</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">총 거래액</p>
                      <p className="font-semibold text-pharmacy">
                        {selectedCustomer.totalAmount.toLocaleString()}원
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Prescription History */}
                <Card>
                  <CardHeader>
                    <CardTitle>처방전 내역 ({selectedCustomer.prescriptions.length}건)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCustomer.prescriptions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>처방전 내역이 없습니다.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedCustomer.prescriptions.map((prescription) => (
                          <div
                            key={prescription.id}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">
                                    처방전 #{prescription.prescriptionNumber}
                                  </h4>
                                  {getStatusBadge(prescription.status)}
                                </div>
                                <p className="text-sm text-gray-600 mb-1">
                                  진단명: {prescription.diagnosis}
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
                              <div className="text-right ml-4">
                                <p className="text-sm text-gray-600">처방 금액</p>
                                <p className="text-xl font-bold text-pharmacy">
                                  {prescription.totalPrice.toLocaleString()}원
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function PharmacyCustomersPage() {
  return (
    <ProtectedRoute requiredRole="pharmacy">
      <PharmacyCustomersContent />
    </ProtectedRoute>
  )
}
