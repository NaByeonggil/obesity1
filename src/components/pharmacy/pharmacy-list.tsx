"use client"

import * as React from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Phone,
  Clock,
  Send,
  Info,
  DollarSign,
  Navigation,
  Star
} from "lucide-react"

interface PharmacyProps {
  pharmacy: {
    id: string
    name: string
    image: string
    address: string
    phone: string
    hours: {
      weekday: string
      saturday: string
      sunday: string
    }
    distance: string
    rating: number
    reviews: number
    available: boolean
    lat?: number
    lng?: number
    nonCoveredPrices?: {
      [key: string]: {
        name: string
        price: number
        description?: string
      }
    }
  }
  onSendPrescription?: () => void
  onShowMap?: () => void
}

export function PharmacyCard({ pharmacy, onSendPrescription, onShowMap }: PharmacyProps) {
  const [showPrices, setShowPrices] = React.useState(false)

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* 왼쪽: 이미지 */}
          <div className="relative w-full md:w-64 h-48 md:h-64 flex-shrink-0">
            <Image
              src={pharmacy.image}
              alt={pharmacy.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 256px"
            />
            {pharmacy.available && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-green-500 text-white">
                  영업중
                </Badge>
              </div>
            )}
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-white/90 backdrop-blur-sm text-gray-900">
                <Navigation className="h-3 w-3 mr-1" />
                {pharmacy.distance}
              </Badge>
            </div>
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-xs">{pharmacy.rating}</span>
            </div>
          </div>

          {/* 오른쪽: 정보 */}
          <div className="flex-1 p-6 space-y-4">
            {/* 약국명 */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {pharmacy.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{pharmacy.reviews}개 리뷰</span>
                <span>•</span>
                <span>{pharmacy.distance} 거리</span>
              </div>
            </div>

            {/* 주소 */}
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">주소</p>
                <p className="text-gray-600 text-sm">{pharmacy.address}</p>
              </div>
            </div>

            {/* 전화번호 */}
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">전화번호</p>
                <p className="text-gray-600 text-sm">{pharmacy.phone}</p>
              </div>
            </div>

            {/* 영업시간 */}
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">영업시간</p>
                <div className="text-sm text-gray-600 space-y-0.5">
                  <p>평일: {pharmacy.hours.weekday}</p>
                  <p>토요일: {pharmacy.hours.saturday}</p>
                  <p className={pharmacy.hours.sunday === "휴무" ? "text-red-600" : ""}>
                    일요일: {pharmacy.hours.sunday}
                  </p>
                </div>
              </div>
            </div>

            {/* 비급여 의약품 가격 정보 */}
            {pharmacy.nonCoveredPrices && (
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrices(!showPrices)}
                  className="mb-3"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  비급여 의약품 가격 {showPrices ? '숨기기' : '보기'}
                </Button>

                {showPrices && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {Object.entries(pharmacy.nonCoveredPrices).map(([key, item]) => (
                      <div key={key} className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-gray-500">{item.description}</p>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {item.price.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                className="flex-1 bg-pharmacy hover:bg-pharmacy-dark"
                onClick={onSendPrescription}
              >
                <Send className="h-4 w-4 mr-2" />
                처방전 전송하기
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={onShowMap}
              >
                <MapPin className="h-4 w-4 mr-2" />
                지도에서 보기
              </Button>
              <Button
                variant="outline"
                className="sm:flex-initial"
              >
                <Info className="h-4 w-4 mr-2" />
                상세정보
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}