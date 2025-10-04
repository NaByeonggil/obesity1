"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import SortOptions from "@/components/clinic/sort-options"
import {
  Search,
  Filter,
  MapPin,
  ArrowLeft,
  Clock,
  Phone,
  Star,
  Calendar,
  ChevronRight,
  Building,
  User,
  CheckCircle,
  DollarSign
} from "lucide-react"

interface Clinic {
  id: string
  name: string
  doctorName: string
  doctorImage?: string
  address: string
  phone: string
  specialization: string
  distance: string
  district?: string
  coordinates?: { lat: number, lng: number }
  hours?: {
    mon_fri: string
    sat: string
    sun: string
  }
  consultationType: 'online' | 'offline'
  consultationFee: number
}

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const department = searchParams.get('department') || ''
  const clinicId = searchParams.get('clinicId')
  const clinicName = searchParams.get('clinicName')
  const doctorName = searchParams.get('doctorName')
  const address = searchParams.get('address')
  const phone = searchParams.get('phone')
  const consultationFee = searchParams.get('consultationFee')

  const [clinics, setClinics] = React.useState<Clinic[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedDistrict, setSelectedDistrict] = React.useState("all")
  const [userLocation, setUserLocation] = React.useState<{lat: number, lng: number} | null>(null)
  const [locationPermission, setLocationPermission] = React.useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [sortBy, setSortBy] = React.useState('auto')
  const [selectedDate, setSelectedDate] = React.useState<string>('')
  const [selectedTime, setSelectedTime] = React.useState<string>('')

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
    "neurosurgery": "신경외과",
    "ent": "이비인후과",
    "obgyn": "산부인과",
    "urology": "비뇨기과"
  }

  const departmentName = departmentNames[department] || "진료과목"

  // 서울시 주요 구 목록
  const districts = [
    { value: 'all', label: '전체 지역' },
    { value: '강남구', label: '강남구' },
    { value: '서초구', label: '서초구' },
    { value: '마포구', label: '마포구' },
    { value: '송파구', label: '송파구' },
    { value: '용산구', label: '용산구' },
    { value: '종로구', label: '종로구' },
    { value: '강북구', label: '강북구' },
    { value: '영등포구', label: '영등포구' },
    { value: '관악구', label: '관악구' }
  ]

  // 위치 권한 요청
  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          setLocationPermission('granted')
          fetchClinics(location)
        },
        (error) => {
          console.error('Location error:', error)
          setLocationPermission('denied')
          fetchClinics() // 위치 없이 fetch
        }
      )
    } else {
      setLocationPermission('denied')
      fetchClinics()
    }
  }

  const fetchClinics = async (location?: {lat: number, lng: number}) => {
    try {
      let url = `/api/clinics?department=${department}&sortBy=${sortBy}`

      if (selectedDistrict !== 'all') {
        url += `&district=${selectedDistrict}`
      }

      if (location) {
        url += `&lat=${location.lat}&lng=${location.lng}`
      } else if (userLocation) {
        url += `&lat=${userLocation.lat}&lng=${userLocation.lng}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.success && data.clinics) {
        setClinics(data.clinics)
      }
    } catch (error) {
      console.error('Failed to fetch clinics:', error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    // URL 파라미터로 특정 클리닉 정보를 받았다면 해당 정보만 표시
    if (clinicId && clinicName) {
      const selectedClinic: Clinic = {
        id: clinicId,
        name: clinicName,
        doctorName: doctorName || '',
        address: address || '',
        phone: phone || '',
        specialization: departmentName,
        distance: '',
        consultationType: 'offline',
        consultationFee: parseInt(consultationFee || '0')
      }
      setClinics([selectedClinic])
      setLoading(false)
    } else {
      // 페이지 로드 시 위치 권한 요청
      if (locationPermission === 'prompt') {
        requestLocation()
      } else {
        fetchClinics()
      }
    }
  }, [department, clinicId])

  React.useEffect(() => {
    // 지역 선택 변경 시 재조회
    fetchClinics()
  }, [selectedDistrict])

  React.useEffect(() => {
    // 정렬 기준 변경 시 재조회
    fetchClinics()
  }, [sortBy])

  const handleBookAppointment = (clinicId: string) => {
    // 예약 모달 또는 예약 페이지로 이동
    router.push(`/patient/booking/confirm?clinic=${clinicId}&department=${department}`)
  }

  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-patient mx-auto"></div>
            <p className="mt-4 text-gray-600">의원 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* 헤더 섹션 */}
      <div className="bg-gradient-to-r from-patient to-patient-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Building className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{departmentName}</h1>
              <p className="text-patient-light mt-1">
                {filteredClinics.length}개의 의원이 진료 가능합니다
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 섹션 */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="의원명, 의사명, 지역으로 검색"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white min-w-[120px]"
              >
                {districts.map(district => (
                  <option key={district.value} value={district.value}>
                    {district.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={requestLocation}
                disabled={locationPermission === 'granted'}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {locationPermission === 'granted' ? '내 위치' : '위치 찾기'}
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                필터
              </Button>
            </div>
          </div>

          {/* 위치 정보 */}
          {locationPermission === 'granted' && userLocation && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">현재 위치 기준으로 가까운 순으로 정렬됩니다</span>
              </div>
            </div>
          )}

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

      {/* 특정 병원이 선택된 경우 예약 UI 표시 */}
      {clinicId && clinics.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>{clinics[0].name} 예약하기</CardTitle>
              <CardDescription>
                {clinics[0].doctorName} • {clinics[0].address}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 예약 날짜 선택 */}
                <div>
                  <h3 className="font-semibold mb-3">예약 날짜 선택</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                      const date = new Date();
                      date.setDate(date.getDate() + dayOffset);
                      const dateStr = date.toISOString().split('T')[0];
                      const dayName = date.toLocaleDateString('ko-KR', { weekday: 'short' });
                      const dayNum = date.getDate();

                      return (
                        <Button
                          key={dayOffset}
                          variant={selectedDate === dateStr ? 'default' : 'outline'}
                          onClick={() => setSelectedDate(dateStr)}
                          className="flex-col h-16"
                        >
                          <span className="text-xs">{dayName}</span>
                          <span className="text-lg font-semibold">{dayNum}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* 예약 시간 선택 */}
                {selectedDate && (
                  <div>
                    <h3 className="font-semibold mb-3">예약 시간 선택</h3>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {[
                        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
                        '17:00', '17:30', '18:00'
                      ].map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          onClick={() => setSelectedTime(time)}
                          className="text-sm"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 진료비 정보 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">예상 진료비</span>
                    <span className="text-xl font-bold text-blue-600">
                      {clinics[0].consultationFee.toLocaleString()}원
                    </span>
                  </div>
                </div>

                {/* 예약 확인 버튼 */}
                {selectedDate && selectedTime && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      router.push(`/patient/booking/confirm?clinic=${clinics[0].id}&date=${selectedDate}&time=${selectedTime}&department=${department}`);
                    }}
                  >
                    예약 확인하기
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 병원 선택이 안 된 경우 의원 리스트 표시 */}
      {!clinicId && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 정렬 옵션 */}
        {filteredClinics.length > 0 && (
          <SortOptions
            onSortChange={setSortBy}
            consultationType={
              filteredClinics.every(c => c.consultationType === 'online') ? 'online' :
              filteredClinics.every(c => c.consultationType === 'offline') ? 'offline' : 'mixed'
            }
            defaultSort={sortBy}
          />
        )}

        <div className="space-y-6">
          {filteredClinics.map((clinic) => (
            <Card key={clinic.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* 왼쪽: 의사 사진 */}
                  <div className="flex-shrink-0">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={clinic.doctorImage || undefined}
                        alt={clinic.doctorName}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                        {clinic.doctorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* 오른쪽: 의원 정보 */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <CardTitle className="text-xl mb-1">{clinic.name}</CardTitle>
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{clinic.doctorName}</span>
                          <span>•</span>
                          <span>{clinic.specialization}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className="bg-green-100 text-green-700">예약 가능</Badge>
                        <Badge variant={clinic.consultationType === 'online' ? 'default' : 'outline'}>
                          {clinic.consultationType === 'online' ? '💻 비대면' : '🏥 대면'}
                        </Badge>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {clinic.consultationFee.toLocaleString()}원
                        </Badge>
                      </div>
                    </div>
                <div className="space-y-3">
                  {/* 진료비 및 거리 정보 */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {clinic.consultationFee.toLocaleString()}원
                      </span>
                      <span className="text-xs text-gray-500">
                        ({clinic.consultationType === 'online' ? '비대면 진료' : '대면 진료'})
                      </span>
                    </div>
                    {clinic.distance && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-600 font-medium">
                          {clinic.distance}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 주소 */}
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">{clinic.address}</span>
                    </div>
                  </div>

                  {/* 전화번호 */}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{clinic.phone}</span>
                  </div>

                  {/* 진료시간 */}
                  {clinic.hours && (
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div className="text-sm text-gray-600">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="font-medium text-gray-700">평일:</span><br/>
                            <span>{clinic.hours.mon_fri}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">토요일:</span><br/>
                            <span>{clinic.hours.sat}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">일요일:</span><br/>
                            <span className={clinic.hours.sun === '휴진' ? 'text-red-500' : ''}>{clinic.hours.sun}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 전문분야 */}
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {clinic.specialization}
                    </Badge>
                  </div>
                </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleBookAppointment(clinic.id)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        예약하기
                      </Button>
                      <Button variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        전화 문의
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredClinics.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">해당 조건에 맞는 의원이 없습니다.</p>
            </CardContent>
          </Card>
        )}

        {/* 더 보기 버튼 */}
        {filteredClinics.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              더 많은 의원 보기
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
      )}
    </div>
  )
}