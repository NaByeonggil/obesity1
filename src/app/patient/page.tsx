"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/ui/navigation"
import { DepartmentCard } from "@/components/ui/department-card"
import {
  Calendar,
  Clock,
  FileText,
  Heart,
  Activity,
  Pill,
  Phone,
  MapPin,
  Stethoscope,
  Eye,
  Thermometer,
  Send,
  Search,
  Building,
  ChevronRight,
  Syringe,
  ArrowRight,
  Baby,
  Brain,
  Bone,
  Sparkles
} from "lucide-react"

interface Appointment {
  id: string
  date: string
  time: string
  doctor: string
  department: string
  type: 'online' | 'offline'
  status: 'confirmed' | 'pending' | 'completed'
}

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  remainingDays: number
  doctor: string
  status: 'active' | 'ready_to_send' | 'sent_to_pharmacy'
}

export default function PatientDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data representing current health services
        setAppointments([
          {
            id: "1",
            date: "2024-01-15",
            time: "14:00",
            doctor: "김민수 원장",
            department: "비만치료",
            type: "online",
            status: "confirmed"
          },
          {
            id: "2",
            date: "2024-01-20",
            time: "10:30",
            doctor: "박지은 원장",
            department: "안과",
            type: "online",
            status: "pending"
          }
        ])

        setPrescriptions([
          {
            id: "1",
            medication: "마운자로 2.5mg",
            dosage: "2.5mg",
            frequency: "주 1회",
            remainingDays: 5,
            doctor: "김민수 원장",
            status: "ready_to_send"
          },
          {
            id: "2",
            medication: "인공눈물 히알엔드",
            dosage: "1방울",
            frequency: "1일 4회",
            remainingDays: 15,
            doctor: "박지은 원장",
            status: "active"
          }
        ])
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-patient mx-auto"></div>
            <p className="mt-4 text-gray-600">서비스를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleViewPrescription = (prescriptionId: string) => {
    router.push(`/patient/prescriptions/${prescriptionId}`)
  }

  const handlePharmacySearch = () => {
    router.push('/pharmacy/search')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            안녕하세요, {session?.user?.name || '환자'}님
          </h1>
          <p className="text-gray-600">필요한 의료 서비스를 선택해 주세요</p>
          {/* 디버깅용 세션 상태 표시 */}
          <div className="mt-2 text-sm text-gray-500 bg-gray-100 p-2 rounded">
            세션 상태: {session ? '로그인됨' : '로그인 안됨'}
            {session && ` | 사용자: ${session.user?.email}`}
          </div>
        </div>

        {/* Department Selection Section - 진료 과목 선택 */}
        <section className="py-6 md:py-10 lg:py-12 bg-gradient-to-b from-white to-gray-50 rounded-lg mb-8">
          <div className="w-full px-4 md:px-6 lg:px-8">
            <div className="text-center mb-6 md:mb-8 lg:mb-10">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                원하시는 진료를 선택하세요
              </h2>
              <p className="text-sm md:text-base lg:text-lg text-gray-600">
                다양한 진료 과목을 온라인/오프라인으로 편리하게 이용할 수 있습니다
              </p>
            </div>

            {/* 메인페이지와 동일: 모바일(3열), 태블릿(3열), 데스크톱(4열), Full HD(6열) */}
            <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-4 lg:gap-6">
              <DepartmentCard
                title="마운자로 · 위고비"
                subtitle="비만 치료"
                description="GLP-1 기반 최신 비만 치료제로 체중 감량을 도와드립니다"
                icon={Syringe}
                available="offline"
                color="bg-gradient-to-r from-purple-500 to-pink-500"
                href="/patient/booking?department=obesity-treatment"
                featured={true}
                requireLogin={true}
              />
              <DepartmentCard
                title="비만 관련 처방"
                subtitle="체중 관리"
                description="전문 의료진과 함께 건강한 체중 감량 프로그램"
                icon={Activity}
                available="offline"
                color="bg-gradient-to-r from-orange-500 to-red-500"
                href="/patient/booking?department=obesity"
                featured={true}
                requireLogin={true}
              />
              <DepartmentCard
                title="인공눈물"
                subtitle="안구 건조"
                description="안구 건조증 치료를 위한 인공눈물 처방"
                icon={Eye}
                available="online"
                color="bg-gradient-to-r from-blue-500 to-cyan-500"
                href="/patient/booking?department=eye-care"
                requireLogin={true}
              />
              <DepartmentCard
                title="감기 관련"
                subtitle="일반 감기"
                description="감기 증상 완화를 위한 처방 및 상담"
                icon={Thermometer}
                available="online"
                color="bg-gradient-to-r from-green-500 to-emerald-500"
                href="/patient/booking?department=cold"
                requireLogin={true}
              />
              <DepartmentCard
                title="내과"
                subtitle="일반 내과"
                description="소화기, 호흡기, 순환기 등 내과 진료"
                icon={Stethoscope}
                available="online"
                color="bg-gradient-to-r from-indigo-500 to-purple-500"
                href="/patient/booking?department=internal-medicine"
                requireLogin={true}
              />
              <DepartmentCard
                title="소아과"
                subtitle="어린이 진료"
                description="영유아 및 어린이 전문 진료 서비스"
                icon={Baby}
                available="online"
                color="bg-gradient-to-r from-pink-500 to-rose-500"
                href="/patient/booking?department=pediatrics"
                requireLogin={true}
              />
              <DepartmentCard
                title="피부과"
                subtitle="피부 질환"
                description="여드름, 아토피, 두드러기 등 피부 질환 진료"
                icon={Sparkles}
                available="online"
                color="bg-gradient-to-r from-yellow-500 to-orange-500"
                href="/patient/booking?department=dermatology"
                requireLogin={true}
              />
              <DepartmentCard
                title="정형외과"
                subtitle="근골격계"
                description="관절, 척추, 근육 통증 진료 및 재활 상담"
                icon={Bone}
                available="online"
                color="bg-gradient-to-r from-gray-600 to-gray-800"
                href="/patient/booking?department=orthopedics"
                requireLogin={true}
              />
              <DepartmentCard
                title="신경외과"
                subtitle="신경계 질환"
                description="두통, 어지럼증, 신경통 등 신경계 질환 진료"
                icon={Brain}
                available="online"
                color="bg-gradient-to-r from-purple-600 to-indigo-600"
                href="/patient/booking?department=neurosurgery"
                requireLogin={true}
              />
              <DepartmentCard
                title="이비인후과"
                subtitle="귀코목"
                description="중이염, 축농증, 편도염 등 이비인후과 진료"
                icon={Activity}
                available="online"
                color="bg-gradient-to-r from-teal-500 to-green-500"
                href="/patient/booking?department=ent"
                requireLogin={true}
              />
              <DepartmentCard
                title="산부인과"
                subtitle="여성 건강"
                description="여성 질환 및 산전 관리 전문 진료"
                icon={Heart}
                available="offline"
                color="bg-gradient-to-r from-red-500 to-pink-500"
                href="/patient/booking?department=obgyn"
                requireLogin={true}
              />
              <DepartmentCard
                title="비뇨기과"
                subtitle="비뇨기 질환"
                description="비뇨기계 질환 전문 진료 및 상담"
                icon={Activity}
                available="offline"
                color="bg-gradient-to-r from-blue-600 to-indigo-600"
                href="/patient/booking?department=urology"
                requireLogin={true}
              />
            </div>

            <div className="mt-8 md:mt-10 text-center">
              <Button size="lg" variant="outline" className="text-sm md:text-base">
                더 많은 진료 과목 보기
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Active Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                활성 처방전
              </CardTitle>
              <CardDescription>
                전자 처방전 확인 및 약국 전송
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => handleViewPrescription(prescription.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{prescription.medication}</div>
                      <div className="flex gap-2">
                        {prescription.status === 'ready_to_send' && (
                          <Badge className="bg-blue-100 text-blue-700">
                            <Send className="h-3 w-3 mr-1" />
                            전송 대기
                          </Badge>
                        )}
                        <Badge variant={prescription.remainingDays > 7 ? 'default' : 'destructive'}>
                          {prescription.remainingDays}일 남음
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {prescription.dosage} • {prescription.frequency}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      처방의: {prescription.doctor}
                    </div>
                    {prescription.status === 'ready_to_send' && (
                      <Button size="sm" className="mt-2">
                        <Send className="h-3 w-3 mr-1" />
                        약국으로 전송
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {prescriptions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  현재 활성 처방전이 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                예약 현황
              </CardTitle>
              <CardDescription>
                예정된 진료 일정 및 상태
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{appointment.doctor}</div>
                      <div className="text-sm text-gray-600">{appointment.department}</div>
                      <div className="text-sm text-gray-500">
                        {appointment.date} {appointment.time}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={appointment.type === 'online' ? 'default' : 'secondary'}
                        className="mb-2"
                      >
                        {appointment.type === 'online' ? '비대면' : '대면'}
                      </Badge>
                      <div>
                        <Badge
                          variant={
                            appointment.status === 'confirmed' ? 'default' :
                            appointment.status === 'pending' ? 'secondary' : 'outline'
                          }
                        >
                          {appointment.status === 'confirmed' ? '확정' :
                           appointment.status === 'pending' ? '대기' : '완료'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {appointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  예정된 진료가 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 서비스</CardTitle>
            <CardDescription>
              자주 사용하는 기능들을 빠르게 이용하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-24 flex-col"
                onClick={handlePharmacySearch}
              >
                <Search className="h-6 w-6 mb-2" />
                <span className="text-center">
                  비급여 의약품<br/>검색
                </span>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                <span className="text-center">
                  진료 기록<br/>조회
                </span>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <Phone className="h-6 w-6 mb-2" />
                <span className="text-center">
                  의료진<br/>상담
                </span>
              </Button>
              <Button variant="outline" className="h-24 flex-col">
                <Building className="h-6 w-6 mb-2" />
                <span className="text-center">
                  약국<br/>찾기
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}