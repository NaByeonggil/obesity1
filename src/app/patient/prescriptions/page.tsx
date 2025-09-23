"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PrescriptionViewer } from "@/components/prescriptions/prescription-viewer"
import { PharmacyCard } from "@/components/pharmacy/pharmacy-list"
import { PharmacyMap } from "@/components/pharmacy/pharmacy-map"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { prescriptionsApi, ApiError } from "@/lib/api-client"
import {
  FileText,
  MapPin,
  List,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  Stethoscope,
  Plus
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Prescription {
  id: string
  prescriptionNumber: string
  diagnosis: string
  notes?: string
  status: 'PENDING' | 'DISPENSED' | 'COMPLETED'
  issuedAt: string
  appointment: {
    patient: {
      id: string
      name: string
      phone?: string
      avatar?: string
    }
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
    }
  }
  medications: Array<{
    id: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
    medication: {
      id: string
      name: string
      description?: string
      unit: string
    }
  }>
}

const mockPrescription = {
  id: "1",
  patientName: "김민지",
  patientSSN: "950101-2******",
  doctorName: "박성우 원장",
  clinicName: "서울비만클리닉",
  issueDate: "2024-01-20",
  medications: [
    {
      name: "마운자로 2.5mg",
      dosage: "주 1회 피하주사",
      frequency: "주 1회",
      duration: "4주",
      substituteAllowed: false
    },
    {
      name: "메트포르민 500mg",
      dosage: "1정",
      frequency: "1일 2회",
      duration: "30일",
      substituteAllowed: true
    }
  ],
  diagnosis: "비만증 (E66.9)",
  notes: "식사와 함께 복용하시기 바랍니다. 부작용 발생 시 즉시 의료진과 상담하세요."
}

const mockPharmacies = [
  {
    id: "1",
    name: "건강약국",
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&h=600&fit=crop",
    address: "서울특별시 강남구 테헤란로 100 1층",
    phone: "02-555-1234",
    hours: {
      weekday: "09:00 - 21:00",
      saturday: "09:00 - 18:00",
      sunday: "10:00 - 16:00"
    },
    distance: "500m",
    rating: 4.8,
    reviews: 156,
    available: true,
    lat: 37.5012,
    lng: 127.0396,
    nonCoveredPrices: {
      mounjaro: {
        name: "마운자로 2.5mg",
        price: 450000,
        description: "4주분"
      },
      wegovy: {
        name: "위고비 0.25mg",
        price: 380000,
        description: "4주분"
      },
      saxenda: {
        name: "삭센다 3ml",
        price: 120000,
        description: "1펜"
      }
    }
  },
  {
    id: "2",
    name: "온누리약국",
    image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800&h=600&fit=crop",
    address: "서울특별시 강남구 강남대로 200 B1",
    phone: "02-555-5678",
    hours: {
      weekday: "08:30 - 22:00",
      saturday: "09:00 - 20:00",
      sunday: "휴무"
    },
    distance: "800m",
    rating: 4.6,
    reviews: 89,
    available: true,
    lat: 37.4985,
    lng: 127.0276,
    nonCoveredPrices: {
      mounjaro: {
        name: "마운자로 2.5mg",
        price: 440000,
        description: "4주분"
      },
      wegovy: {
        name: "위고비 0.25mg",
        price: 375000,
        description: "4주분"
      },
      saxenda: {
        name: "삭센다 3ml",
        price: 125000,
        description: "1펜"
      }
    }
  },
  {
    id: "3",
    name: "새봄약국",
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&h=600&fit=crop",
    address: "서울특별시 서초구 서초대로 300",
    phone: "02-555-9999",
    hours: {
      weekday: "09:00 - 20:00",
      saturday: "09:00 - 15:00",
      sunday: "휴무"
    },
    distance: "1.2km",
    rating: 4.7,
    reviews: 124,
    available: false,
    lat: 37.4915,
    lng: 127.0074,
    nonCoveredPrices: {
      mounjaro: {
        name: "마운자로 2.5mg",
        price: 455000,
        description: "4주분"
      },
      wegovy: {
        name: "위고비 0.25mg",
        price: 385000,
        description: "4주분"
      },
      saxenda: {
        name: "삭센다 3ml",
        price: 130000,
        description: "1펜"
      }
    }
  }
]

export default function PatientPrescriptionsPage() {
  const [activeTab, setActiveTab] = React.useState("prescriptions")
  const [selectedPharmacy, setSelectedPharmacy] = React.useState<string | null>(null)
  const [prescriptions, setPrescriptions] = React.useState<Prescription[]>([])
  const [selectedPrescription, setSelectedPrescription] = React.useState<Prescription | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const { user, token, isAuthenticated } = useAuth()

  // Fetch prescriptions from API
  const fetchPrescriptions = React.useCallback(async () => {
    if (!token || !isAuthenticated) return

    try {
      setLoading(true)
      setError(null)
      const response = await prescriptionsApi.getPrescriptions(token)
      setPrescriptions(response.prescriptions || [])

      // 가장 최근 처방전을 기본 선택
      if (response.prescriptions && response.prescriptions.length > 0) {
        setSelectedPrescription(response.prescriptions[0])
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('처방전 정보를 불러오는 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [token, isAuthenticated])

  React.useEffect(() => {
    fetchPrescriptions()
  }, [fetchPrescriptions])

  const handleSendPrescription = (pharmacyId: string) => {
    setSelectedPharmacy(pharmacyId)
    alert(`처방전이 약국으로 전송되었습니다.\n약국에서 확인 후 연락드리겠습니다.`)
  }

  const handleShowMap = () => {
    setActiveTab("map")
  }

  const handlePrescriptionSelect = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setActiveTab("prescription")
  }

  // 상태별 배지 변환
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { variant: 'warning' as const, text: '조제 대기' }
      case 'DISPENSED':
        return { variant: 'default' as const, text: '조제 완료' }
      case 'COMPLETED':
        return { variant: 'success' as const, text: '수령 완료' }
      default:
        return { variant: 'secondary' as const, text: '알 수 없음' }
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (loading) {
    return (
      <DashboardLayout userRole="patient" user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">처방전 정보를 불러오는 중...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="patient" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">처방전 관리</h1>
          <p className="text-gray-600 mt-1">
            처방전을 확인하고 약국으로 전송할 수 있습니다
          </p>
        </div>

        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="prescriptions" className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              처방전 목록
            </TabsTrigger>
            <TabsTrigger value="prescription" className="flex items-center" disabled={!selectedPrescription}>
              <FileText className="h-4 w-4 mr-2" />
              처방전 보기
            </TabsTrigger>
            <TabsTrigger value="pharmacies" className="flex items-center" disabled={!selectedPrescription}>
              <List className="h-4 w-4 mr-2" />
              약국 선택
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              지도 보기
            </TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions" className="space-y-4">
            {prescriptions.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">처방전이 없습니다</h3>
                  <p className="text-sm">아직 발급받은 처방전이 없습니다.</p>
                </div>
              </Card>
            ) : (
              prescriptions.map((prescription) => {
                const statusBadge = getStatusBadge(prescription.status)
                return (
                  <Card key={prescription.id} className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handlePrescriptionSelect(prescription)}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              처방전 #{prescription.prescriptionNumber}
                            </h3>
                            <Badge variant={statusBadge.variant}>
                              {statusBadge.text}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>발급일: {formatDate(prescription.issuedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Stethoscope className="h-4 w-4" />
                              <span>의사: {prescription.appointment.doctor.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>진료과: {prescription.appointment.department.name}</span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">진단명</p>
                            <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              처방 의약품 ({prescription.medications.length}개)
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {prescription.medications.slice(0, 3).map((med) => (
                                <Badge key={med.id} variant="outline" className="text-xs">
                                  {med.medication.name}
                                </Badge>
                              ))}
                              {prescription.medications.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{prescription.medications.length - 3}개 더
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          <Button
                            size="sm"
                            className="bg-patient hover:bg-patient-dark"
                          >
                            상세 보기
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          <TabsContent value="prescription" className="space-y-6">
            {selectedPrescription ? (
              <>
                <Card className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          처방전 #{selectedPrescription.prescriptionNumber}
                        </h2>
                        <p className="text-gray-600">
                          발급일: {formatDate(selectedPrescription.issuedAt)}
                        </p>
                      </div>
                      <Badge variant={getStatusBadge(selectedPrescription.status).variant} className="text-sm">
                        {getStatusBadge(selectedPrescription.status).text}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">환자 정보</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">환자명:</span>
                            <span className="font-medium">{selectedPrescription.appointment.patient.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">연락처:</span>
                            <span className="font-medium">{selectedPrescription.appointment.patient.phone || '-'}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">의료진 정보</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">담당의:</span>
                            <span className="font-medium">{selectedPrescription.appointment.doctor.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">진료과:</span>
                            <span className="font-medium">{selectedPrescription.appointment.department.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">병원명:</span>
                            <span className="font-medium">{selectedPrescription.appointment.doctor.clinic || '병원'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">진단명</h3>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedPrescription.diagnosis}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">처방 의약품</h3>
                      <div className="space-y-3">
                        {selectedPrescription.medications.map((medication, index) => (
                          <div key={medication.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {index + 1}. {medication.medication.name}
                                </h4>
                                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">용량:</span> {medication.dosage}
                                  </div>
                                  <div>
                                    <span className="font-medium">복용법:</span> {medication.frequency}
                                  </div>
                                  <div>
                                    <span className="font-medium">복용기간:</span> {medication.duration}
                                  </div>
                                  <div>
                                    <span className="font-medium">단위:</span> {medication.medication.unit}
                                  </div>
                                </div>
                                {medication.instructions && (
                                  <p className="mt-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                                    💡 {medication.instructions}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedPrescription.notes && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">특이사항</h3>
                        <p className="text-gray-700 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                          ⚠️ {selectedPrescription.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    처방전 이용 안내
                  </h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• 처방전은 발급일로부터 3일간 유효합니다</li>
                    <li>• 약국 선택 탭에서 원하시는 약국으로 처방전을 전송할 수 있습니다</li>
                    <li>• 비급여 의약품 가격을 미리 확인하실 수 있습니다</li>
                    <li>• 약국에서 처방전 확인 후 조제가 완료되면 알림을 받으실 수 있습니다</li>
                  </ul>
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    className="bg-pharmacy hover:bg-pharmacy-dark"
                    onClick={() => setActiveTab("pharmacies")}
                  >
                    약국 선택하고 처방전 전송하기
                  </Button>
                </div>
              </>
            ) : (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">처방전을 선택해주세요</h3>
                  <p className="text-sm">처방전 목록에서 확인할 처방전을 선택해주세요.</p>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pharmacies" className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                💊 처방전을 전송할 약국을 선택해주세요. 비급여 의약품 가격을 미리 확인하실 수 있습니다.
              </p>
            </div>

            {mockPharmacies.map((pharmacy) => (
              <PharmacyCard
                key={pharmacy.id}
                pharmacy={pharmacy}
                onSendPrescription={() => handleSendPrescription(pharmacy.id)}
                onShowMap={handleShowMap}
              />
            ))}
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <PharmacyMap
              pharmacies={mockPharmacies}
              currentLocation={{ lat: 37.5000, lng: 127.0300 }}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">영업중인 약국</h4>
                <p className="text-sm text-green-700">
                  현재 {mockPharmacies.filter(p => p.available).length}개 약국이 영업 중입니다
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">가까운 약국</h4>
                <p className="text-sm text-blue-700">
                  가장 가까운 약국은 {mockPharmacies[0].distance} 거리에 있습니다
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}