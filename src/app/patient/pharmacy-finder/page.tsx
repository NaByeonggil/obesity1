'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Search,
  Loader2,
  Map as MapIcon,
  List
} from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
// Script 컴포넌트 대신 useEffect에서 직접 로드

interface Pharmacy {
  id: string
  name: string
  pharmacyName: string
  pharmacyAddress: string
  pharmacyPhone: string
  latitude: number | null
  longitude: number | null
  distance?: number
}

function PharmacyFinderContent() {
  const { data: session } = useSession()
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [map, setMap] = useState<any>(null)
  const [kakaoLoaded, setKakaoLoaded] = useState(false)
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | null>(null)

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
      const response = await fetch('/api/patient/pharmacies', {
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
        }
      }
    } catch (error) {
      console.error('Failed to fetch pharmacies:', error)
    } finally {
      setLoading(false)
    }
  }, [userLocation, calculateDistance])

  // 카카오맵 초기화
  const initializeMap = useCallback(() => {
    if (!kakaoLoaded || !window.kakao) return

    const container = document.getElementById('map')
    if (!container) return

    // 선택된 약국 찾기
    const selectedPharmacy = selectedPharmacyId
      ? pharmacies.find(p => p.id === selectedPharmacyId)
      : null

    // 지도 중심 설정 - 선택된 약국 우선, 그 다음 가장 가까운 약국
    let centerLat = 37.5665
    let centerLng = 126.9780
    let centerLevel = 5

    if (selectedPharmacy && selectedPharmacy.latitude && selectedPharmacy.longitude) {
      // 선택된 약국이 있으면 그 약국을 중심으로
      centerLat = selectedPharmacy.latitude
      centerLng = selectedPharmacy.longitude
      centerLevel = 3 // 확대해서 표시
    } else if (pharmacies.length > 0 && pharmacies[0].latitude && pharmacies[0].longitude) {
      // 선택된 약국이 없으면 첫 번째 약국 (거리순 정렬되어 있으므로 가장 가까운 약국)
      centerLat = pharmacies[0].latitude
      centerLng = pharmacies[0].longitude
    } else if (userLocation) {
      centerLat = userLocation.lat
      centerLng = userLocation.lng
    }

    const options = {
      center: new window.kakao.maps.LatLng(centerLat, centerLng),
      level: centerLevel
    }

    const kakaoMap = new window.kakao.maps.Map(container, options)
    setMap(kakaoMap)

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
          content: `<div style="padding:10px;font-size:12px;min-width:150px;">
            <div style="font-weight:bold;margin-bottom:3px;">${pharmacy.pharmacyName}</div>
            ${pharmacy.pharmacyAddress ? `<div style="color:#666;font-size:11px;margin-bottom:3px;">${pharmacy.pharmacyAddress}</div>` : ''}
            ${pharmacy.distance ? `<div style="color:#10b981;font-weight:500;">${pharmacy.distance.toFixed(1)}km</div>` : ''}
          </div>`
        })

        window.kakao.maps.event.addListener(marker, 'click', function() {
          infowindow.open(kakaoMap, marker)
        })

        // 선택된 약국 또는 첫 번째 약국의 인포윈도우는 자동으로 열기
        if ((selectedPharmacy && pharmacy.id === selectedPharmacy.id) || (!selectedPharmacy && index === 0)) {
          infowindow.open(kakaoMap, marker)
        }
      }
    })

    // 사용자 위치 마커 (별 모양) - 약국 마커보다 나중에 추가하여 위에 표시
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
  }, [kakaoLoaded, userLocation, pharmacies, selectedPharmacyId])

  // 카카오맵 SDK 로드
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=398db3379079dc2538892e3969bdb399&autoload=false'
    script.async = true
    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          console.log('카카오맵 SDK 로드 완료')
          setKakaoLoaded(true)
        })
      }
    }
    script.onerror = () => {
      console.error('카카오맵 SDK 로드 실패')
    }
    document.head.appendChild(script)

    return () => {
      // cleanup: script 태그 제거
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

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
        pharmacy.pharmacyAddress?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">약국 찾기</h1>
            <p className="text-gray-600 mt-2">
              내 주변 약국을 거리순으로 확인하세요
            </p>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">주변에 약국이 없습니다</p>
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
                          {pharmacy.distance !== undefined && (
                            <Badge variant="secondary" className="mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {pharmacy.distance.toFixed(1)}km
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                          <span>{pharmacy.pharmacyAddress || '주소 정보 없음'}</span>
                        </div>
                        {pharmacy.pharmacyPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <a
                              href={`tel:${pharmacy.pharmacyPhone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {pharmacy.pharmacyPhone}
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
                            const url = `https://map.kakao.com/link/to/${pharmacy.pharmacyName},${pharmacy.latitude},${pharmacy.longitude}`
                            window.open(url, '_blank')
                          }
                        }}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        길찾기
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (pharmacy.latitude && pharmacy.longitude) {
                            setSelectedPharmacyId(pharmacy.id)
                            setViewMode('map')
                          }
                        }}
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

export default function PharmacyFinderPage() {
  return (
    <ProtectedRoute requiredRole="patient">
      <PharmacyFinderContent />
    </ProtectedRoute>
  )
}
