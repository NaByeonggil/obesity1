'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Pill,
  MapPin,
  Phone,
  Navigation,
  Loader2,
  ArrowLeft,
  Map as MapIcon,
  List,
  Store,
  Package
} from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Script from 'next/script'

interface Medication {
  id: string
  name: string
  description?: string
  price: number
}

interface Pharmacy {
  id: string
  name: string
  pharmacyName: string
  pharmacistName: string
  address: string
  pharmacyAddress: string
  phone: string
  pharmacyPhone: string
  latitude: number | null
  longitude: number | null
  currentStock: number
  distance?: number
  medication: Medication
}

function MedicationPharmaciesContent() {
  const router = useRouter()
  const params = useParams()
  const medicationId = params?.medicationId as string
  const { data: session } = useSession()

  const [medication, setMedication] = useState<Medication | null>(null)
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [map, setMap] = useState<any>(null)
  const [kakaoLoaded, setKakaoLoaded] = useState(false)

  // 거리 계산 함수 (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }, [])

  // 사용자 위치 가져오기
  const getUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error)
          // 기본 위치 (서울시청)
          setUserLocation({ lat: 37.5665, lng: 126.9780 })
        }
      )
    } else {
      // 기본 위치 (서울시청)
      setUserLocation({ lat: 37.5665, lng: 126.9780 })
    }
  }, [])

  // 약국 데이터 로드
  const fetchPharmacies = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/medications/${medicationId}/pharmacies`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.pharmacies) {
          let pharmacyList = data.pharmacies

          // 거리 계산 및 정렬
          if (userLocation) {
            pharmacyList = pharmacyList
              .map((pharmacy: Pharmacy) => {
                if (pharmacy.latitude && pharmacy.longitude) {
                  const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    pharmacy.latitude,
                    pharmacy.longitude
                  )
                  return { ...pharmacy, distance }
                }
                return pharmacy
              })
              .sort((a: Pharmacy, b: Pharmacy) => {
                if (a.distance === undefined) return 1
                if (b.distance === undefined) return -1
                return a.distance - b.distance
              })
          }

          setPharmacies(pharmacyList)
          if (data.medication) {
            setMedication(data.medication)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch pharmacies:', error)
    } finally {
      setLoading(false)
    }
  }, [medicationId, userLocation, calculateDistance])

  // 카카오맵 초기화
  const initializeMap = useCallback(() => {
    if (!kakaoLoaded || !window.kakao) return

    const container = document.getElementById('map')
    if (!container) return

    // 지도 중심 설정 (약국이 있으면 첫 번째 약국, 없으면 사용자 위치)
    let centerLat = 37.5665
    let centerLng = 126.9780

    if (pharmacies.length > 0 && pharmacies[0].latitude && pharmacies[0].longitude) {
      centerLat = pharmacies[0].latitude
      centerLng = pharmacies[0].longitude
    } else if (userLocation) {
      centerLat = userLocation.lat
      centerLng = userLocation.lng
    }

    const options = {
      center: new window.kakao.maps.LatLng(centerLat, centerLng),
      level: 5
    }

    const kakaoMap = new window.kakao.maps.Map(container, options)
    setMap(kakaoMap)

    // 사용자 위치 마커 (파란색)
    if (userLocation) {
      const userMarkerPosition = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng)
      const userMarkerImage = new window.kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
        new window.kakao.maps.Size(24, 35)
      )
      const userMarker = new window.kakao.maps.Marker({
        position: userMarkerPosition,
        map: kakaoMap,
        image: userMarkerImage
      })

      const userInfowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:10px;font-size:12px;"><strong>내 위치</strong></div>`
      })

      window.kakao.maps.event.addListener(userMarker, 'click', function() {
        userInfowindow.open(kakaoMap, userMarker)
      })
    }

    // 약국 마커들
    pharmacies.forEach((pharmacy, index) => {
      if (pharmacy.latitude && pharmacy.longitude) {
        const markerPosition = new window.kakao.maps.LatLng(pharmacy.latitude, pharmacy.longitude)
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
          map: kakaoMap
        })

        // 인포윈도우
        const infowindow = new window.kakao.maps.InfoWindow({
          content: `<div style="padding:10px;font-size:12px;min-width:200px;">
            <div style="font-weight:bold;margin-bottom:5px;">${pharmacy.pharmacyName}</div>
            <div style="color:#666;margin-bottom:3px;">${pharmacy.address}</div>
            <div style="color:#2563eb;font-weight:500;">재고: ${pharmacy.currentStock}개</div>
            ${pharmacy.distance ? `<div style="color:#10b981;margin-top:3px;">${pharmacy.distance.toFixed(1)}km</div>` : ''}
          </div>`
        })

        window.kakao.maps.event.addListener(marker, 'click', function() {
          infowindow.open(kakaoMap, marker)
        })
      }
    })
  }, [kakaoLoaded, userLocation, pharmacies])

  useEffect(() => {
    getUserLocation()
  }, [getUserLocation])

  useEffect(() => {
    if (userLocation) {
      fetchPharmacies()
    }
  }, [userLocation, fetchPharmacies])

  useEffect(() => {
    if (viewMode === 'map' && kakaoLoaded) {
      setTimeout(() => initializeMap(), 100)
    }
  }, [viewMode, kakaoLoaded, initializeMap])

  const filteredPharmacies = searchQuery
    ? pharmacies.filter((pharmacy) =>
        pharmacy.pharmacyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pharmacy.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pharmacies

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">약국 정보를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY || 'YOUR_KAKAO_MAP_KEY'}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => {
          window.kakao.maps.load(() => {
            setKakaoLoaded(true)
          })
        }}
      />

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/patient/medications')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Pill className="h-8 w-8 text-patient" />
              <h1 className="text-3xl font-bold">{medication?.name || '의약품'}</h1>
            </div>
            <div className="flex items-center gap-4">
              {medication?.price && (
                <Badge variant="secondary" className="text-base">
                  {medication.price.toLocaleString()}원
                </Badge>
              )}
              <p className="text-gray-600">
                보유 약국 {pharmacies.length}곳
              </p>
            </div>
            {medication?.description && (
              <p className="text-sm text-gray-500 mt-2">{medication.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              목록
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              지도
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="약국명 또는 주소로 검색"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={getUserLocation}>
                <Navigation className="h-4 w-4 mr-2" />
                내 위치
              </Button>
            </div>
            {userLocation && (
              <p className="text-sm text-gray-500 mt-2">
                현재 위치: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Map View */}
        {viewMode === 'map' && (
          <Card>
            <CardContent className="p-0">
              <div id="map" style={{ width: '100%', height: '600px' }}></div>
              {!kakaoLoaded && (
                <div className="flex items-center justify-center h-[600px]">
                  <div className="text-center">
                    <MapIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">지도를 불러오는 중...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="grid gap-4">
            {filteredPharmacies.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">이 의약품을 보유한 약국이 없습니다</p>
                  <p className="text-sm text-gray-400 mt-2">다른 의약품을 검색해보세요</p>
                </CardContent>
              </Card>
            ) : (
              filteredPharmacies.map((pharmacy, index) => (
                <Card key={pharmacy.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{pharmacy.pharmacyName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {pharmacy.distance !== undefined && (
                              <Badge variant="secondary">
                                <MapPin className="h-3 w-3 mr-1" />
                                {pharmacy.distance.toFixed(1)}km
                              </Badge>
                            )}
                            <Badge className="bg-green-100 text-green-700">
                              <Package className="h-3 w-3 mr-1" />
                              재고 {pharmacy.currentStock}개
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                          <span>{pharmacy.address || '주소 정보 없음'}</span>
                        </div>
                        {pharmacy.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <a
                              href={`tel:${pharmacy.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {pharmacy.phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (pharmacy.latitude && pharmacy.longitude) {
                            const url = `https://map.kakao.com/link/to/${encodeURIComponent(pharmacy.pharmacyName)},${pharmacy.latitude},${pharmacy.longitude}`
                            window.open(url, '_blank')
                          } else {
                            alert('위치 정보가 없습니다')
                          }
                        }}
                        disabled={!pharmacy.latitude || !pharmacy.longitude}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        길찾기
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (pharmacy.latitude && pharmacy.longitude) {
                            setViewMode('map')
                            setTimeout(() => {
                              if (map) {
                                const moveLatLon = new window.kakao.maps.LatLng(
                                  pharmacy.latitude,
                                  pharmacy.longitude
                                )
                                map.setCenter(moveLatLon)
                                map.setLevel(3)
                              }
                            }, 200)
                          } else {
                            alert('위치 정보가 없습니다')
                          }
                        }}
                        disabled={!pharmacy.latitude || !pharmacy.longitude}
                      >
                        <MapIcon className="h-3 w-3 mr-1" />
                        지도에서 보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default function MedicationPharmaciesPage() {
  return (
    <ProtectedRoute requiredRole="patient">
      <MedicationPharmaciesContent />
    </ProtectedRoute>
  )
}
