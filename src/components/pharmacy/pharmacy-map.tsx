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

  React.useEffect(() => {
    // 카카오맵 API 스크립트 로드
    const script = document.createElement('script')
    script.async = true
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&autoload=false&libraries=services`
    document.head.appendChild(script)

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (mapRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(
              currentLocation?.lat || 37.5665,
              currentLocation?.lng || 126.9780
            ),
            level: 5
          }

          const mapInstance = new window.kakao.maps.Map(mapRef.current, options)
          setMap(mapInstance)

          // 현재 위치 마커 추가
          if (currentLocation) {
            const currentMarker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng),
              map: mapInstance,
              image: new window.kakao.maps.MarkerImage(
                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                new window.kakao.maps.Size(24, 35)
              )
            })
          }

          // 약국 마커 추가
          const newMarkers = pharmacies.map((pharmacy) => {
            const marker = new window.kakao.maps.Marker({
              position: new window.kakao.maps.LatLng(pharmacy.lat, pharmacy.lng),
              map: mapInstance,
              title: pharmacy.name
            })

            // 인포윈도우 생성
            const infowindow = new window.kakao.maps.InfoWindow({
              content: `
                <div style="padding:10px;min-width:200px;">
                  <strong>${pharmacy.name}</strong><br/>
                  <span style="color:#666;font-size:12px;">${pharmacy.address}</span><br/>
                  <span style="color:${pharmacy.available ? '#10b981' : '#ef4444'};font-size:12px;font-weight:600;">
                    ${pharmacy.available ? '영업중' : '영업종료'}
                  </span>
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
        }
      })
    }

    return () => {
      // 스크립트 정리
      document.head.removeChild(script)
    }
  }, [pharmacies, currentLocation])

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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const moveLatLon = new window.kakao.maps.LatLng(lat, lng)
        map.setCenter(moveLatLon)
      })
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
            className="bg-white shadow-md"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-white shadow-md"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="bg-white shadow-md"
            onClick={handleCurrentLocation}
          >
            <Navigation className="h-4 w-4" />
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