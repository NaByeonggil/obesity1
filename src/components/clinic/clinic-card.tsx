"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Phone,
  Clock,
  Star,
  Info,
  Calendar,
  ChevronRight,
  DollarSign,
  Navigation
} from "lucide-react"

interface ClinicCardProps {
  clinic: {
    id: string
    name: string
    doctorName?: string
    doctorImage?: string
    address: string
    phone: string
    specialization?: string
    distance?: string
    hours: {
      mon_fri?: string
      sat?: string
      sun?: string
      weekday?: string
      saturday?: string
      sunday?: string
    }
    consultationType: 'online' | 'offline'
    consultationFee: number
    // 기존 속성들
    image?: string
    doctors?: string[]
    specialties?: string[]
    rating?: number
    reviews?: number
    description?: string
    available?: boolean
  }
  onBooking?: () => void
}

export function ClinicCard({ clinic, onBooking }: ClinicCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* 왼쪽: 이미지 */}
          <div className="relative w-full md:w-96 h-48 md:h-72 flex-shrink-0">
            <Image
              src={clinic.image}
              alt={clinic.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 384px"
            />
            {clinic.available && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-green-500 text-white">
                  오늘 예약 가능
                </Badge>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-sm">{clinic.rating}</span>
              <span className="text-gray-600 text-sm">({clinic.reviews})</span>
            </div>
          </div>

          {/* 오른쪽: 정보 */}
          <div className="flex-1 p-6 space-y-4">
            {/* 의원명 및 전문 분야 */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {clinic.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {clinic.specialties.map((specialty, index) => (
                  <Badge key={index} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 주소 */}
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">주소</p>
                <p className="text-gray-600">{clinic.address}</p>
              </div>
            </div>

            {/* 전화번호 */}
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">전화번호</p>
                <p className="text-gray-600">{clinic.phone}</p>
              </div>
            </div>

            {/* 진료시간 */}
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">진료시간</p>
                <div className="text-sm text-gray-600 space-y-0.5">
                  <p>평일: {clinic.hours.weekday}</p>
                  <p>토요일: {clinic.hours.saturday}</p>
                  <p>일요일: {clinic.hours.sunday}</p>
                </div>
              </div>
            </div>

            {/* 의료진 */}
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">의료진</p>
                <p className="text-sm text-gray-600">
                  {clinic.doctors.join(", ")}
                </p>
              </div>
            </div>

            {/* 상세정보 */}
            <div className="pt-2">
              <p className="text-gray-600 line-clamp-2">
                {clinic.description}
              </p>
            </div>

            {/* 진료비 정보 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">진료비</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">
                    {clinic.consultationFee.toLocaleString()}원
                  </span>
                  <div className="text-sm text-gray-500">
                    {clinic.consultationType === 'offline' ? '대면 진료' : '비대면 진료'}
                  </div>
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                className="flex-1 bg-patient hover:bg-patient-dark"
                onClick={onBooking}
              >
                <Calendar className="h-4 w-4 mr-2" />
                예약하기
              </Button>
              <Button
                variant="outline"
                className="flex-1"
              >
                상세정보
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}