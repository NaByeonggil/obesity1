"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Search,
  Eye,
  Printer,
  Download,
  Clock,
  Check,
  AlertTriangle,
  Phone,
  MessageCircle,
  Loader2
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PrescriptionData {
  id: string
  prescriptionNumber: string
  patient: {
    id: string
    name: string
    phone: string
    email: string
  }
  doctor: {
    id: string
    name: string
    clinic: string
    specialization: string
  }
  department: {
    id: string
    name: string
  }
  status: string
  diagnosis: string
  notes?: string
  issuedAt: string
  validUntil: string
  totalPrice: number
  medications: Array<{
    id: string
    medicationId: string
    name: string
    description?: string
    dosage: string
    frequency: string
    duration: string
    quantity: string
    price: number
    substituteAllowed: boolean
    originalPrice: number
  }>
}

function PharmacyPrescriptionsContent() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = React.useState("pending")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [prescriptions, setPrescriptions] = React.useState<PrescriptionData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedPrescription, setSelectedPrescription] = React.useState<PrescriptionData | null>(null)
  const [showDetailModal, setShowDetailModal] = React.useState(false)

  const loadPrescriptions = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/pharmacy/prescriptions', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('처방전 조회 실패')
      }

      const data = await response.json()
      setPrescriptions(data.prescriptions || [])
    } catch (err) {
      console.error('처방전 조회 오류:', err)
      setError('처방전 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadPrescriptions()
  }, [loadPrescriptions])

  const handleViewPrescription = (prescription: PrescriptionData) => {
    setSelectedPrescription(prescription)
    setShowDetailModal(true)
  }

  const handlePrintPrescription = (prescriptionId: string) => {
    console.log("처방전 프린트:", prescriptionId)
    window.print()
  }

  const handleViewPDF = async (prescriptionId: string) => {
    try {
      const response = await fetch(`/api/pharmacy/prescriptions/pdf?prescriptionId=${prescriptionId}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('PDF 로드 실패')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('PDF 보기 오류:', error)
      alert('처방전 PDF를 불러오는 중 오류가 발생했습니다.')
    }
  }

  const handlePrintPDF = async (prescriptionId: string) => {
    try {
      const response = await fetch(`/api/pharmacy/prescriptions/pdf?prescriptionId=${prescriptionId}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('PDF 로드 실패')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Create an iframe to print the PDF
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      iframe.src = url
      document.body.appendChild(iframe)

      iframe.onload = () => {
        iframe.contentWindow?.print()
      }
    } catch (error) {
      console.error('PDF 프린트 오류:', error)
      alert('처방전 PDF를 인쇄하는 중 오류가 발생했습니다.')
    }
  }

  const handleUpdateStatus = async (prescriptionId: string, status: string) => {
    try {
      const response = await fetch('/api/pharmacy/prescriptions', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prescriptionId,
          status
        })
      })

      if (response.ok) {
        loadPrescriptions()
      }
    } catch (err) {
      console.error('처방전 상태 업데이트 오류:', err)
    }
  }

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patient?.name?.includes(searchTerm) ||
    prescription.prescriptionNumber?.includes(searchTerm) ||
    prescription.doctor?.name?.includes(searchTerm)
  )

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
          <span className="ml-2">처방전 목록을 불러오는 중...</span>
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
          <h1 className="text-2xl font-bold text-gray-900">처방전 관리</h1>
          <p className="text-gray-600 mt-1">
            접수된 처방전을 확인하고 조제를 진행하세요
          </p>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>처방전 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="환자명, 처방전번호, 의사명으로 검색"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                전체 목록
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Prescription List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">접수 대기</TabsTrigger>
            <TabsTrigger value="dispensed">조제 진행</TabsTrigger>
            <TabsTrigger value="completed">조제 완료</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredPrescriptions
              .filter(p => activeTab === "pending" ? p.status === "PENDING" :
                          activeTab === "dispensed" ? p.status === "DISPENSING" :
                          p.status === "DISPENSED" || p.status === "COMPLETED")
              .map((prescription) => (
                <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          처방전 #{prescription.prescriptionNumber}
                          {getStatusBadge(prescription.status)}
                        </CardTitle>
                        <CardDescription>
                          환자: {prescription.patient.name} | 의사: {prescription.doctor.name} | {prescription.doctor.clinic}
                        </CardDescription>
                        <p className="text-sm text-gray-500 mt-1">
                          발급일: {formatDate(prescription.issuedAt)} | 유효기간: {formatDate(prescription.validUntil)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPrescription(prescription)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          처방전 보기
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintPrescription(prescription.id)}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          프린트
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">처방 의약품 ({prescription.medications.length}개)</h4>
                        <div className="space-y-3">
                          {prescription.medications.map((med) => (
                            <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900">{med.name}</p>
                                  <Badge variant="secondary">
                                    {med.dosage}
                                  </Badge>
                                  {med.substituteAllowed && (
                                    <Badge variant="outline" className="text-xs">대체 가능</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  수량: {med.quantity} | {med.frequency} | {med.duration}
                                </p>
                                {med.description && (
                                  <p className="text-xs text-gray-500">{med.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {med.price.toLocaleString()}원
                                </p>
                                <p className="text-xs text-gray-500">
                                  원가: {med.originalPrice.toLocaleString()}원
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-1" />
                            환자 연락
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            메모
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">총 처방전 약값</p>
                          <p className="text-xl font-bold text-pharmacy">
                            {prescription.totalPrice.toLocaleString()}원
                          </p>
                        </div>
                      </div>

                      {prescription.status === "PENDING" && (
                        <div className="flex space-x-2 pt-2">
                          <Button
                            className="flex-1 bg-pharmacy hover:bg-pharmacy-dark"
                            onClick={() => handleUpdateStatus(prescription.id, 'DISPENSING')}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            조제 시작
                          </Button>
                          <Button variant="outline">
                            거부
                          </Button>
                        </div>
                      )}

                      {prescription.status === "DISPENSING" && (
                        <div className="flex space-x-2 pt-2">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleUpdateStatus(prescription.id, 'DISPENSED')}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            조제 완료
                          </Button>
                          <Button variant="outline">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            문제 신고
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

            {filteredPrescriptions.filter(p =>
              activeTab === "pending" ? p.status === "PENDING" :
              activeTab === "dispensed" ? p.status === "DISPENSING" :
              p.status === "DISPENSED" || p.status === "COMPLETED"
            ).length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {activeTab === "pending" && "접수 대기 중인 처방전이 없습니다"}
                    {activeTab === "dispensed" && "조제 진행 중인 처방전이 없습니다"}
                    {activeTab === "completed" && "조제 완료된 처방전이 없습니다"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* 처방전 상세 보기 모달 */}
        {showDetailModal && selectedPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  처방전 상세 정보
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
                {/* 처방전 기본 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle>처방전 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">처방전 번호</p>
                      <p className="font-semibold">{selectedPrescription.prescriptionNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">상태</p>
                      <div className="mt-1">{getStatusBadge(selectedPrescription.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">발급일</p>
                      <p className="font-semibold">{formatDate(selectedPrescription.issuedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">유효기간</p>
                      <p className="font-semibold">{formatDate(selectedPrescription.validUntil)}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* 환자 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle>환자 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">이름</p>
                      <p className="font-semibold">{selectedPrescription.patient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">연락처</p>
                      <p className="font-semibold">{selectedPrescription.patient.phone || '-'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* 의사 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle>의사 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">담당의</p>
                      <p className="font-semibold">{selectedPrescription.doctor.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">전문과목</p>
                      <p className="font-semibold">{selectedPrescription.doctor.specialization || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">병원명</p>
                      <p className="font-semibold">{selectedPrescription.doctor.clinic}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">진료과</p>
                      <p className="font-semibold">{selectedPrescription.department.name}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* 진단명 */}
                <Card>
                  <CardHeader>
                    <CardTitle>진단명</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{selectedPrescription.diagnosis}</p>
                  </CardContent>
                </Card>

                {/* 처방 의약품 */}
                <Card>
                  <CardHeader>
                    <CardTitle>처방 의약품 ({selectedPrescription.medications.length}개)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPrescription.medications.map((med, index) => (
                      <div key={med.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {index + 1}. {med.name}
                            </h4>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>용량: {med.dosage}</div>
                              <div>복용법: {med.frequency}</div>
                              <div>복용기간: {med.duration}</div>
                              <div>수량: {med.quantity}</div>
                            </div>
                            {med.description && (
                              <p className="mt-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                                💡 {med.description}
                              </p>
                            )}
                            {med.substituteAllowed && (
                              <Badge variant="outline" className="mt-2">대체 조제 가능</Badge>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-semibold text-gray-900">
                              {med.price.toLocaleString()}원
                            </p>
                            <p className="text-xs text-gray-500">
                              원가: {med.originalPrice.toLocaleString()}원
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* 처방전 PDF */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>처방전 PDF</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewPDF(selectedPrescription.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          처방전 보기
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintPDF(selectedPrescription.id)}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          프린트
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="text-sm text-blue-900">
                        📄 처방전을 PDF로 확인하고 인쇄할 수 있습니다.
                      </p>
                      {selectedPrescription.notes && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-sm font-semibold text-blue-900 mb-1">⚠️ 특이사항</p>
                          <p className="text-sm text-blue-800">{selectedPrescription.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 총 금액 */}
                <div className="text-right">
                  <p className="text-sm text-gray-600">총 처방전 금액</p>
                  <p className="text-2xl font-bold text-pharmacy">
                    {selectedPrescription.totalPrice.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function PharmacyPrescriptionsPage() {
  return (
    <ProtectedRoute requiredRole="pharmacy">
      <PharmacyPrescriptionsContent />
    </ProtectedRoute>
  )
}