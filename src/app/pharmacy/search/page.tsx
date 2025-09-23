"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/ui/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MapPin,
  Phone,
  Clock,
  Star,
  Navigation2,
  Filter,
  ChevronRight,
  Pill,
  DollarSign,
  Building
} from "lucide-react"

interface Medicine {
  id: string
  name: string
  category: string
  description: string
  price: number
  manufacturer: string
  isOTC: boolean // Over-the-counter (비급여)
}

interface Pharmacy {
  id: string
  name: string
  address: string
  phone: string
  distance: string
  rating: number
  hours: {
    weekday: string
    saturday: string
    sunday: string
  }
  medicines: string[] // Available medicine IDs
  coordinates: {
    lat: number
    lng: number
  }
}

export default function PharmacySearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [showMap, setShowMap] = useState(false)

  // Mock data for OTC medicines
  const mockMedicines: Medicine[] = [
    {
      id: "1",
      name: "마운자로 2.5mg",
      category: "비만치료제",
      description: "GLP-1 수용체 작용제로 체중감량에 효과적",
      price: 400000,
      manufacturer: "릴리",
      isOTC: true
    },
    {
      id: "2",
      name: "위고비 0.25mg",
      category: "비만치료제",
      description: "세마글루타이드 성분의 주사형 비만치료제",
      price: 350000,
      manufacturer: "노보노디스크",
      isOTC: true
    },
    {
      id: "3",
      name: "삭센다 3mg",
      category: "비만치료제",
      description: "리라글루타이드 성분의 체중관리 의약품",
      price: 300000,
      manufacturer: "노보노디스크",
      isOTC: true
    },
    {
      id: "4",
      name: "콘택600",
      category: "감기약",
      description: "종합감기약 (해열진통제)",
      price: 8000,
      manufacturer: "유한양행",
      isOTC: true
    },
    {
      id: "5",
      name: "타이레놀 500mg",
      category: "진통제",
      description: "아세트아미노펜 해열진통제",
      price: 3000,
      manufacturer: "한국얀센",
      isOTC: true
    },
    {
      id: "6",
      name: "게보린",
      category: "진통제",
      description: "아스피린 복합 진통제",
      price: 2500,
      manufacturer: "삼진제약",
      isOTC: true
    },
    {
      id: "7",
      name: "인공눈물 히알엔드",
      category: "안약",
      description: "히알루론산나트륨 점안액",
      price: 15000,
      manufacturer: "한미약품",
      isOTC: true
    },
    {
      id: "8",
      name: "리프레쉬 플러스",
      category: "안약",
      description: "인공눈물 안약",
      price: 12000,
      manufacturer: "앨러간",
      isOTC: true
    }
  ]

  // Mock pharmacy data - 5개 약국 더미 데이터
  const mockPharmacies: Pharmacy[] = [
    {
      id: "1",
      name: "서울중앙약국",
      address: "서울특별시 강남구 테헤란로 123-45 메디컬프라자 1층",
      phone: "02-1234-5678",
      distance: "500m",
      rating: 4.8,
      hours: {
        weekday: "09:00-21:00",
        saturday: "09:00-18:00",
        sunday: "10:00-17:00"
      },
      medicines: ["1", "2", "3", "4", "5", "7"],
      coordinates: { lat: 37.5665, lng: 126.9780 }
    },
    {
      id: "2",
      name: "행복한약국",
      address: "서울특별시 강남구 역삼로 456-78 헬스케어빌딩 지하1층",
      phone: "02-9876-5432",
      distance: "800m",
      rating: 4.6,
      hours: {
        weekday: "08:30-20:00",
        saturday: "09:00-17:00",
        sunday: "휴무"
      },
      medicines: ["1", "3", "4", "5", "6", "8"],
      coordinates: { lat: 37.5651, lng: 126.9785 }
    },
    {
      id: "3",
      name: "건강플러스약국",
      address: "서울특별시 서초구 서초대로 789-01 웰빙센터 2층",
      phone: "02-3456-7890",
      distance: "1.2km",
      rating: 4.9,
      hours: {
        weekday: "09:00-22:00",
        saturday: "09:00-20:00",
        sunday: "10:00-18:00"
      },
      medicines: ["2", "3", "5", "6", "7", "8"],
      coordinates: { lat: 37.5640, lng: 126.9770 }
    },
    {
      id: "4",
      name: "미래약국",
      address: "서울특별시 마포구 월드컵북로 234-56 라이프타워 1층",
      phone: "02-4567-8901",
      distance: "1.5km",
      rating: 4.7,
      hours: {
        weekday: "08:00-20:30",
        saturday: "09:00-19:00",
        sunday: "10:00-16:00"
      },
      medicines: ["1", "2", "4", "6", "7", "8"],
      coordinates: { lat: 37.5571, lng: 126.9368 }
    },
    {
      id: "5",
      name: "온누리약국",
      address: "서울특별시 송파구 잠실로 567-89 메디컬몰 1층",
      phone: "02-5678-9012",
      distance: "2.1km",
      rating: 4.5,
      hours: {
        weekday: "09:30-21:30",
        saturday: "09:00-18:30",
        sunday: "11:00-17:00"
      },
      medicines: ["1", "3", "4", "5", "7", "8"],
      coordinates: { lat: 37.5133, lng: 127.1028 }
    }
  ]

  useEffect(() => {
    // Initialize with mock data
    setMedicines(mockMedicines)
    setPharmacies(mockPharmacies)
  }, [])

  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          medicine.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || medicine.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = Array.from(new Set(medicines.map(m => m.category)))

  const getPharmaciesWithMedicine = (medicineId: string) => {
    return pharmacies.filter(pharmacy => pharmacy.medicines.includes(medicineId))
  }

  const handleMedicineSelect = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    const availablePharmacies = getPharmaciesWithMedicine(medicine.id)
    if (availablePharmacies.length > 0) {
      setShowMap(true)
    }
  }

  const openInMaps = (pharmacy: Pharmacy) => {
    // Open in Google Maps or Naver Maps
    const mapsUrl = `https://maps.google.com/maps?q=${pharmacy.coordinates.lat},${pharmacy.coordinates.lng}`
    window.open(mapsUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">비급여 의약품 검색</h1>
          <p className="text-gray-600">
            처방전 없이 구매 가능한 의약품을 검색하고 근처 약국을 찾아보세요
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="의약품명 또는 증상으로 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="all">전체 카테고리</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  필터
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medicine List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">의약품 목록</h2>
            <div className="space-y-4">
              {filteredMedicines.map(medicine => (
                <Card
                  key={medicine.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow ${
                    selectedMedicine?.id === medicine.id ? 'ring-2 ring-pharmacy' : ''
                  }`}
                  onClick={() => handleMedicineSelect(medicine)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Pill className="h-5 w-5 text-pharmacy" />
                          {medicine.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {medicine.manufacturer}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{medicine.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{medicine.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-pharmacy">
                        {medicine.price.toLocaleString()}원
                      </span>
                      <span className="text-sm text-gray-500">
                        {getPharmaciesWithMedicine(medicine.id).length}개 약국 보유
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Pharmacy List */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {selectedMedicine ? `"${selectedMedicine.name}" 보유 약국` : '근처 약국'}
            </h2>
            <div className="space-y-4">
              {(selectedMedicine
                ? getPharmaciesWithMedicine(selectedMedicine.id)
                : pharmacies
              ).map(pharmacy => (
                <Card key={pharmacy.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building className="h-5 w-5 text-pharmacy" />
                          {pharmacy.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{pharmacy.distance}</Badge>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm ml-1">{pharmacy.rating}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => openInMaps(pharmacy)}
                      >
                        <Navigation2 className="h-4 w-4 mr-1" />
                        지도
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{pharmacy.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{pharmacy.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>평일: {pharmacy.hours.weekday}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">보유 의약품</p>
                      <div className="flex flex-wrap gap-1">
                        {pharmacy.medicines.slice(0, 3).map(medId => {
                          const med = medicines.find(m => m.id === medId)
                          return med ? (
                            <Badge key={medId} variant="outline" className="text-xs">
                              {med.name}
                            </Badge>
                          ) : null
                        })}
                        {pharmacy.medicines.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{pharmacy.medicines.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      전화 문의
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Map Modal */}
        {showMap && selectedMedicine && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>약국 위치</CardTitle>
                  <CardDescription>
                    "{selectedMedicine.name}"을(를) 보유한 약국 위치
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowMap(false)}
                  className="text-gray-500"
                >
                  ✕
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">지도 API 연동 예정</p>
                    <p className="text-sm text-gray-500 mt-2">
                      카카오맵 또는 네이버맵 API를 통해 실제 지도가 표시됩니다
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}