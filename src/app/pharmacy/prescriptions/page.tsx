"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { pharmacyApi, ApiError } from "@/lib/api-client"
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
  status: 'PENDING' | 'DISPENSED' | 'COMPLETED'
  urgent: boolean
  diagnosis?: string
  notes?: string
}

export default function PharmacyPrescriptionsPage() {
  const [activeTab, setActiveTab] = React.useState("pending")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [prescriptions, setPrescriptions] = React.useState<PrescriptionData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const { user, token, isAuthenticated } = useAuth()

  const loadPrescriptions = React.useCallback(async () => {
    if (!token || !isAuthenticated) return

    try {
      setLoading(true)
      setError(null)

      const response = await pharmacyApi.getPrescriptions(token)
      setPrescriptions(response.prescriptions || [])
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('처방전 목록을 불러오는 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [token, isAuthenticated])

  React.useEffect(() => {
    loadPrescriptions()
  }, [loadPrescriptions])

  const handleViewPrescription = (prescriptionId: string) => {
    console.log("처방전 보기:", prescriptionId)
  }

  const handlePrintPrescription = (prescriptionId: string) => {
    console.log("처방전 프린트:", prescriptionId)
    window.print()
  }

  const handleUpdateStatus = async (prescriptionId: string, status: string) => {
    if (!token) return

    try {
      await pharmacyApi.updatePrescriptionStatus(token, prescriptionId, { status })
      loadPrescriptions()
    } catch (err) {
      console.error('처방전 상태 업데이트 오류:', err)
    }
  }

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientName.includes(searchTerm) ||
    prescription.id.includes(searchTerm) ||
    prescription.doctorName.includes(searchTerm)
  )

  const getStatusBadge = (status: string, urgent: boolean) => {
    if (urgent) {
      return <Badge variant="destructive">긴급</Badge>
    }

    switch (status) {
      case "PENDING":
        return <Badge variant="secondary">접수 대기</Badge>
      case "DISPENSED":
        return <Badge variant="default">조제중</Badge>
      case "COMPLETED":
        return <Badge variant="success">완료</Badge>
      default:
        return <Badge variant="secondary">대기</Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="pharmacy" user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">처방전 목록을 불러오는 중...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="pharmacy" user={user}>
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
                          activeTab === "dispensed" ? p.status === "DISPENSED" :
                          p.status === "COMPLETED")
              .map((prescription) => (
                <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          처방전 번호: {prescription.id}
                          {getStatusBadge(prescription.status, prescription.urgent)}
                        </CardTitle>
                        <CardDescription>
                          환자: {prescription.patientName} | 의사: {prescription.doctorName} | {prescription.clinic}
                        </CardDescription>
                        <p className="text-sm text-gray-500 mt-1">
                          접수시간: {prescription.receivedTime}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPrescription(prescription.id)}
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
                        <h4 className="font-semibold text-gray-900 mb-3">처방 의약품</h4>
                        <div className="space-y-3">
                          {prescription.medications.map((med, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-900">{med.name}</p>
                                  <Badge variant="secondary">
                                    {med.dosage}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  수량: {med.quantity}개 | {med.frequency} | {med.duration}
                                </p>
                                {med.manufacturer && (
                                  <p className="text-xs text-gray-500">제조사: {med.manufacturer}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  {(med.price * med.quantity).toLocaleString()}원
                                </p>
                                <p className="text-xs text-gray-500">
                                  단가: {med.price.toLocaleString()}원
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
                            onClick={() => handleUpdateStatus(prescription.id, 'DISPENSED')}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            조제 시작
                          </Button>
                          <Button variant="outline">
                            거부
                          </Button>
                        </div>
                      )}

                      {prescription.status === "DISPENSED" && (
                        <div className="flex space-x-2 pt-2">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleUpdateStatus(prescription.id, 'COMPLETED')}
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
              activeTab === "dispensed" ? p.status === "DISPENSED" :
              p.status === "COMPLETED"
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
      </div>
    </DashboardLayout>
  )
}