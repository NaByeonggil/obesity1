"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/ui/navigation"
import { ClinicCard } from "@/components/clinic/clinic-card"
import { BookingModal } from "@/components/appointments/booking-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Filter,
  MapPin,
  ArrowLeft,
  Syringe,
  Activity,
  Eye,
  Thermometer,
  Stethoscope,
  Baby,
  Sparkles,
  Bone,
  Brain
} from "lucide-react"

// 진료과목별 아이콘 매핑
const departmentIcons: { [key: string]: any } = {
  "obesity-treatment": Syringe,
  "obesity": Activity,
  "eye-care": Eye,
  "cold": Thermometer,
  "internal-medicine": Stethoscope,
  "pediatrics": Baby,
  "dermatology": Sparkles,
  "orthopedics": Bone,
  "neurosurgery": Brain
}

// 진료과목별 한글 이름
const departmentNames: { [key: string]: string } = {
  "obesity-treatment": "마운자로 · 위고비",
  "obesity": "비만 관련 처방",
  "eye-care": "인공눈물",
  "cold": "감기 관련",
  "internal-medicine": "내과",
  "pediatrics": "소아과",
  "dermatology": "피부과",
  "orthopedics": "정형외과",
  "neurosurgery": "신경외과"
}

interface Clinic {
  id: string
  name: string
  doctorName: string
  doctorImage?: string
  address: string
  phone: string
  specialization: string
  distance: string
  district: string
  coordinates: { lat: number, lng: number }
  hours: {
    mon_fri: string
    sat: string
    sun: string
  }
  consultationType: 'online' | 'offline'
  consultationFee: number
}

export default function DepartmentClinicListPage() {
  const params = useParams()
  const department = params.department as string
  const departmentName = departmentNames[department] || "진료과목"
  const DepartmentIcon = departmentIcons[department] || Stethoscope

  const [clinics, setClinics] = React.useState<Clinic[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedClinic, setSelectedClinic] = React.useState<Clinic | null>(null)
  const [bookingModalOpen, setBookingModalOpen] = React.useState(false)
  const [consultationType, setConsultationType] = React.useState<'online' | 'offline'>('offline')
  const [searchQuery, setSearchQuery] = React.useState("")
  const [sortBy, setSortBy] = React.useState("auto")

  // 클리닉 데이터 가져오기
  React.useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/clinics?department=${department}&sortBy=${sortBy}`)
        if (response.ok) {
          const data = await response.json()
          setClinics(data.clinics || [])
        }
      } catch (error) {
        console.error('클리닉 데이터 가져오기 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClinics()
  }, [department, sortBy])

  const handleBooking = (clinicId: string) => {
    const clinic = clinics.find(c => c.id === clinicId)
    if (clinic) {
      setSelectedClinic(clinic)

      // 비대면 진료 가능한 과목들
      const onlineDepartments = ['eye-care', 'cold', 'internal-medicine', 'pediatrics', 'dermatology', 'orthopedics', 'neurosurgery']

      if (clinic.consultationType === 'both') {
        // 대면/비대면 선택 모달 표시 (여기서는 간단히 비대면으로 설정)
        setConsultationType('offline')
      } else if (onlineDepartments.includes(department)) {
        setConsultationType('online')
      } else {
        setConsultationType('offline')
      }

      setBookingModalOpen(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-patient to-patient-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <DepartmentIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{departmentName}</h1>
              <p className="text-patient-light mt-1">
                {clinics.length}개의 의원이 진료 가능합니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 섹션 */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="의원명, 지역으로 검색"
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                지역 선택
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                필터
              </Button>
            </div>
          </div>

          {/* 빠른 필터 태그 */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
              오늘 예약 가능
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
              주말 진료
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
              야간 진료
            </Badge>
            <Badge variant="secondary" className="cursor-pointer hover:bg-gray-200">
              비대면 진료
            </Badge>
          </div>
        </div>
      </div>

      {/* 의원 리스트 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {clinics.map((clinic) => (
            <ClinicCard
              key={clinic.id}
              clinic={clinic}
              onBooking={() => handleBooking(clinic.id)}
            />
          ))}
        </div>

        {/* 더 보기 버튼 */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            더 많은 의원 보기
          </Button>
        </div>
      </div>

      {/* 예약 모달 */}
      {selectedClinic && (
        <BookingModal
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          clinic={selectedClinic}
          appointmentType={consultationType}
        />
      )}
    </div>
  )
}