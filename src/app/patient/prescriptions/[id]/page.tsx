"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/ui/navigation"
import {
  FileText,
  Send,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Calendar,
  User,
  Building,
  ArrowLeft,
  Pill,
  AlertCircle
} from "lucide-react"

interface Prescription {
  id: string
  prescriptionNumber: string
  diagnosis: string
  notes: string
  status: string
  issuedAt: string
  validUntil: string
  totalPrice: number
  doctorName: string
  clinicName: string
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
    quantity: string
    price: number
  }>
  pharmacy?: {
    name: string
    address: string
    phone: string
  }
}

export default function PrescriptionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const prescriptionId = params.id as string

  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null)
  const [showPharmacyModal, setShowPharmacyModal] = useState(false)

  // Mock prescription data
  useEffect(() => {
    // In real app, fetch from API
    const mockPrescription: Prescription = {
      id: prescriptionId,
      prescriptionNumber: "RX-2024-001234",
      diagnosis: "비만 관리",
      notes: "3개월 치료 프로그램",
      status: "ISSUED",
      issuedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      totalPrice: 450000,
      doctorName: "김민수 원장",
      clinicName: "서울비만클리닉",
      medications: [
        {
          name: "마운자로 2.5mg",
          dosage: "2.5mg",
          frequency: "주 1회",
          duration: "4주",
          quantity: "4개",
          price: 400000
        },
        {
          name: "비타민D 보충제",
          dosage: "1000IU",
          frequency: "1일 1회",
          duration: "30일",
          quantity: "30정",
          price: 50000
        }
      ]
    }
    setPrescription(mockPrescription)
    setIsLoading(false)
  }, [prescriptionId])

  const handleSendToPharmacy = async () => {
    setShowPharmacyModal(true)
  }

  const confirmSendToPharmacy = async (pharmacy: any) => {
    setIsSending(true)
    setSelectedPharmacy(pharmacy)

    try {
      // API call to send prescription to pharmacy
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call

      if (prescription) {
        setPrescription({
          ...prescription,
          status: "SENT_TO_PHARMACY",
          pharmacy: {
            name: pharmacy.name,
            address: pharmacy.address,
            phone: pharmacy.phone
          }
        })
      }

      setShowPharmacyModal(false)
    } catch (error) {
      console.error("Failed to send prescription:", error)
    } finally {
      setIsSending(false)
    }
  }

  const getStatusOrder = (status: string) => {
    const statusOrder = {
      'ISSUED': 0,
      'SENT_TO_PHARMACY': 1,
      'RECEIVED_BY_PHARMACY': 2,
      'PHARMACY_ACCEPTED': 3,
      'PROCESSING': 4,
      'READY_FOR_PICKUP': 5,
      'COMPLETED': 6,
      'CANCELLED': -1
    }
    return statusOrder[status as keyof typeof statusOrder] || -1
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ISSUED":
        return <Badge variant="secondary">발행됨</Badge>
      case "SENT_TO_PHARMACY":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">약국 전송됨</Badge>
      case "RECEIVED_BY_PHARMACY":
        return <Badge variant="outline" className="bg-green-50 text-green-700">약국 수령 확인</Badge>
      case "PHARMACY_ACCEPTED":
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700">약국 접수</Badge>
      case "PROCESSING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">조제 중</Badge>
      case "READY_FOR_PICKUP":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">조제 완료 - 수령 대기</Badge>
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-50 text-green-700">처방 완료</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">취소됨</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-patient mx-auto"></div>
            <p className="mt-4 text-gray-600">처방전 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">처방전을 찾을 수 없습니다.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          뒤로가기
        </Button>

        {/* Prescription Status Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>처방전 진행 상황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status Timeline */}
              <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                {[
                  { status: 'ISSUED', label: '처방전 발행', icon: FileText },
                  { status: 'SENT_TO_PHARMACY', label: '약국 전송', icon: Send },
                  { status: 'RECEIVED_BY_PHARMACY', label: '약국 수령', icon: CheckCircle },
                  { status: 'PHARMACY_ACCEPTED', label: '약국 접수', icon: Building },
                  { status: 'PROCESSING', label: '조제 중', icon: Clock },
                  { status: 'READY_FOR_PICKUP', label: '조제 완료', icon: Pill },
                  { status: 'COMPLETED', label: '처방 완료', icon: CheckCircle }
                ].map((step, index) => {
                  const Icon = step.icon
                  const isActive = prescription.status === step.status
                  const isCompleted = getStatusOrder(prescription.status) > getStatusOrder(step.status)

                  return (
                    <div key={step.status} className="flex items-center">
                      <div className="flex flex-col items-center min-w-0">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${isCompleted || isActive
                            ? 'bg-patient text-white'
                            : 'bg-gray-200 text-gray-400'
                          }
                        `}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`
                          text-xs mt-2 text-center whitespace-nowrap
                          ${isCompleted || isActive
                            ? 'text-patient font-medium'
                            : 'text-gray-500'
                          }
                        `}>
                          {step.label}
                        </span>
                      </div>
                      {index < 6 && (
                        <div className={`
                          w-8 h-0.5 mx-2
                          ${isCompleted
                            ? 'bg-patient'
                            : 'bg-gray-200'
                          }
                        `} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Current Status */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">현재 상태:</span>
                  {getStatusBadge(prescription.status)}
                </div>
                {prescription.status === 'READY_FOR_PICKUP' && prescription.pharmacy && (
                  <p className="text-sm text-gray-600 mt-2">
                    📍 {prescription.pharmacy.name}에서 수령 가능합니다.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescription Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="h-6 w-6" />
                  전자 처방전
                </CardTitle>
                <CardDescription className="mt-2">
                  처방전 번호: {prescription.prescriptionNumber}
                </CardDescription>
              </div>
              {getStatusBadge(prescription.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">담당의:</span>
                  <span className="font-medium">{prescription.doctorName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">의료기관:</span>
                  <span className="font-medium">{prescription.clinicName}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">발행일:</span>
                  <span className="font-medium">
                    {new Date(prescription.issuedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">유효기간:</span>
                  <span className="font-medium">
                    {new Date(prescription.validUntil).toLocaleDateString('ko-KR')}까지
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>진단 내용</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{prescription.diagnosis}</p>
            {prescription.notes && (
              <p className="text-sm text-gray-600 mt-2">{prescription.notes}</p>
            )}
          </CardContent>
        </Card>

        {/* Medications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              처방 의약품
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prescription.medications.map((med, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-lg">{med.name}</h4>
                    <span className="font-medium text-patient">
                      {med.price.toLocaleString()}원
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">용량:</span>
                      <span className="ml-1 font-medium">{med.dosage}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">복용법:</span>
                      <span className="ml-1 font-medium">{med.frequency}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">기간:</span>
                      <span className="ml-1 font-medium">{med.duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">수량:</span>
                      <span className="ml-1 font-medium">{med.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">총 금액</span>
                <span className="text-2xl font-bold text-patient">
                  {prescription.totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pharmacy Information */}
        {prescription.pharmacy && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>전송된 약국</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{prescription.pharmacy.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{prescription.pharmacy.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{prescription.pharmacy.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          {prescription.status === "ISSUED" && (
            <Button
              onClick={handleSendToPharmacy}
              className="flex-1"
              disabled={isSending}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "전송 중..." : "약국으로 전송"}
            </Button>
          )}
          {prescription.status === "SENT_TO_PHARMACY" && (
            <Button variant="outline" className="flex-1" disabled>
              <Clock className="h-4 w-4 mr-2" />
              약국 수령 대기 중
            </Button>
          )}
          {prescription.status === "RECEIVED_BY_PHARMACY" && (
            <Button variant="outline" className="flex-1" disabled>
              <CheckCircle className="h-4 w-4 mr-2" />
              약국에서 처리 중
            </Button>
          )}
          {prescription.status === "PHARMACY_ACCEPTED" && (
            <Button variant="outline" className="flex-1" disabled>
              <Clock className="h-4 w-4 mr-2" />
              약국 접수 완료
            </Button>
          )}
          {prescription.status === "PROCESSING" && (
            <Button variant="outline" className="flex-1" disabled>
              <Clock className="h-4 w-4 mr-2" />
              조제 진행 중
            </Button>
          )}
          {prescription.status === "READY_FOR_PICKUP" && prescription.pharmacy && (
            <Button
              className="flex-1"
              onClick={() => window.open(`tel:${prescription.pharmacy?.phone}`, '_self')}
            >
              <Phone className="h-4 w-4 mr-2" />
              약국 연락하기
            </Button>
          )}
          {prescription.status === "COMPLETED" && (
            <Button variant="outline" className="flex-1" disabled>
              <CheckCircle className="h-4 w-4 mr-2" />
              처방 완료
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <FileText className="h-4 w-4 mr-2" />
            인쇄하기
          </Button>
        </div>
      </div>

      {/* Pharmacy Selection Modal */}
      {showPharmacyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>약국 선택</CardTitle>
              <CardDescription>처방전을 전송할 약국을 선택하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "서울중앙약국",
                    address: "서울특별시 강남구 테헤란로 123-45 메디컬프라자 1층",
                    phone: "02-1234-5678",
                    distance: "500m"
                  },
                  {
                    name: "행복한약국",
                    address: "서울특별시 강남구 역삼로 456-78 헬스케어빌딩 지하1층",
                    phone: "02-9876-5432",
                    distance: "800m"
                  },
                  {
                    name: "건강플러스약국",
                    address: "서울특별시 서초구 서초대로 789-01 웰빙센터 2층",
                    phone: "02-3456-7890",
                    distance: "1.2km"
                  },
                  {
                    name: "미래약국",
                    address: "서울특별시 마포구 월드컵북로 234-56 라이프타워 1층",
                    phone: "02-4567-8901",
                    distance: "1.5km"
                  },
                  {
                    name: "온누리약국",
                    address: "서울특별시 송파구 잠실로 567-89 메디컬몰 1층",
                    phone: "02-5678-9012",
                    distance: "2.1km"
                  }
                ].map((pharmacy, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => confirmSendToPharmacy(pharmacy)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{pharmacy.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{pharmacy.address}</p>
                        <p className="text-sm text-gray-600">{pharmacy.phone}</p>
                      </div>
                      <Badge variant="secondary">{pharmacy.distance}</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPharmacyModal(false)}
                >
                  취소
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}