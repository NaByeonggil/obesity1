"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Navigation,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers
} from "lucide-react"

declare global {
  interface Window {
    kakao: any
  }
}

interface PharmacyMapProps {
  pharmacies: {
    id: string
    name: string
    address: string
    lat: number
    lng: number
    available: boolean
  }[]
  currentLocation?: {
    lat: number
    lng: number
  }
}

export function PharmacyMap({ pharmacies, currentLocation }: PharmacyMapProps) {
  const mapRef = React.useRef<HTMLDivElement>(null)
  const [map, setMap] = React.useState<any>(null)
  const [markers, setMarkers] = React.useState<any[]>([])
  const [userLocation, setUserLocation] = React.useState(currentLocation)
  const [isLoadingLocation, setIsLoadingLocation] = React.useState(false)

  // 사용자 현재 위치 가져오기
  React.useEffect(() => {
    if (!currentLocation && navigator.geolocation) {
      setIsLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다. 기본 위치(서울)를 사용합니다.', error)
          setUserLocation({ lat: 37.5665, lng: 126.9780 })
          setIsLoadingLocation(false)
        }
      )
    }
  }, [currentLocation])

  React.useEffect(() => {
    // 카카오맵 API 키 확인
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || 'your-kakao-map-api-key'

    // 카카오맵 API 스크립트 로드
    const script = document.createElement('script')
    script.async = true
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services`
    document.head.appendChild(script)

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapRef.current) {
          const centerLocation = userLocation || { lat: 37.5665, lng: 126.9780 }

          const options = {
            center: new window.kakao.maps.LatLng(centerLocation.lat, centerLocation.lng),
            level: 5
          }

          const mapInstance = new window.kakao.maps.Map(mapRef.current, options)
          setMap(mapInstance)

          // 현재 위치 마커 추가
          if (userLocation) {
            const currentMarker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
              map: mapInstance,
              image: new window.kakao.maps.MarkerImage(
                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                new window.kakao.maps.Size(24, 35)
              )
            })

            // 현재 위치 인포윈도우
            const currentInfowindow = new window.kakao.maps.InfoWindow({
              content: `
                <div style="padding:10px;min-width:150px;text-align:center;">
                  <strong style="color:#2563eb;">📍 현재 위치</strong>
                </div>
              `
            })

            window.kakao.maps.event.addListener(currentMarker, 'click', () => {
              currentInfowindow.open(mapInstance, currentMarker)
            })
          }

          // 약국 마커 추가
          const newMarkers = pharmacies.map((pharmacy) => {
            // 거리 계산 (userLocation이 있을 경우)
            let distance = ''
            if (userLocation) {
              const R = 6371 // 지구 반경 (km)
              const dLat = (pharmacy.lat - userLocation.lat) * Math.PI / 180
              const dLon = (pharmacy.lng - userLocation.lng) * Math.PI / 180
              const a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(pharmacy.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
              const d = R * c
              distance = d < 1 ? `${Math.round(d * 1000)}m` : `${d.toFixed(1)}km`
            }

            const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(pharmacy.lat, pharmacy.lng),
              map: mapInstance,
              title: pharmacy.name
            })

            // 인포윈도우 생성
            const infowindow = new window.kakao.maps.InfoWindow({
              content: `
                <div style="padding:12px;min-width:220px;font-family:sans-serif;">
                  <div style="font-size:16px;font-weight:700;color:#1f2937;margin-bottom:6px;">
                    💊 ${pharmacy.name}
                  </div>
                  <div style="color:#666;font-size:13px;line-height:1.4;margin-bottom:4px;">
                    📍 ${pharmacy.address}
                  </div>
                  ${distance ? `<div style="color:#666;font-size:12px;margin-bottom:4px;">📏 거리: ${distance}</div>` : ''}
                  <div style="margin-top:8px;">
                    <span style="display:inline-block;padding:4px 8px;border-radius:4px;font-size:12px;font-weight:600;background-color:${pharmacy.available ? '#dcfce7' : '#fee2e2'};color:${pharmacy.available ? '#16a34a' : '#dc2626'};">
                      ${pharmacy.available ? '✓ 영업중' : '✕ 영업종료'}
                    </span>
                  </div>
                </div>
              `
            })

            // 마커 클릭 이벤트
            window.kakao.maps.event.addListener(marker, 'click', () => {
              infowindow.open(mapInstance, marker)
            })

            return marker
          })

          setMarkers(newMarkers)

          // 모든 마커가 보이도록 지도 범위 재설정
          if (pharmacies.length > 0) {
            const bounds = new window.kakao.maps.LatLngBounds()

            // 현재 위치 포함
            if (userLocation) {
              bounds.extend(new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng))
            }

            // 모든 약국 위치 포함
            pharmacies.forEach((pharmacy) => {
              bounds.extend(new window.kakao.maps.LatLng(pharmacy.lat, pharmacy.lng))
            })

            mapInstance.setBounds(bounds)
          }
        }
      })
    }

    return () => {
      // 스크립트 정리 (이미 로드된 경우 제거하지 않음)
      const existingScript = document.querySelector(`script[src*="dapi.kakao.com"]`)
      if (existingScript && existingScript === script) {
        document.head.removeChild(script)
      }
    }
  }, [pharmacies, userLocation])

  const handleZoomIn = () => {
    if (map) {
      map.setLevel(map.getLevel() - 1)
    }
  }

  const handleZoomOut = () => {
    if (map) {
      map.setLevel(map.getLevel() + 1)
    }
  }

  const handleCurrentLocation = () => {
    if (navigator.geolocation && map) {
      setIsLoadingLocation(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          const moveLatLon = new window.kakao.maps.LatLng(lat, lng)
          map.setCenter(moveLatLon)
          map.setLevel(3) // 더 가까운 줌 레벨로 설정
          setUserLocation({ lat, lng })
          setIsLoadingLocation(false)
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error)
          alert('위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.')
          setIsLoadingLocation(false)
        }
      )
    } else if (!navigator.geolocation) {
      alert('이 브라우저는 위치 서비스를 지원하지 않습니다.')
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            주변 약국 위치
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {pharmacies.filter(p => p.available).length}개 영업중
            </Badge>
            <Badge variant="outline">
              총 {pharmacies.length}개
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 relative">
        {/* 지도 컨테이너 */}
        <div
          ref={mapRef}
          className="w-full h-[500px]"
          style={{ minHeight: '400px' }}
        />

        {/* 지도 컨트롤 버튼 */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
          <Button
            size="icon"
            variant="secondary"
            className="bg-white shadow-md hover:bg-gray-100"
            onClick={handleZoomIn}
            disabled={!map}
            title="확대"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-white shadow-md hover:bg-gray-100"
            onClick={handleZoomOut}
            disabled={!map}
            title="축소"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-white shadow-md hover:bg-gray-100"
            onClick={handleCurrentLocation}
            disabled={!map || isLoadingLocation}
            title="현재 위치로 이동"
          >
            <Navigation className={`h-4 w-4 ${isLoadingLocation ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* 범례 */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-700">내 위치</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-700">약국 위치</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-700">영업중</span>
            </div>
          </div>
        </div>

        {/* 지도 로딩 중 표시 */}
        {!map && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pharmacy mx-auto mb-4"></div>
              <p className="text-gray-600">지도를 불러오는 중...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}