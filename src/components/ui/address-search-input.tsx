'use client'

import React, { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import { usePostcode, type PostcodeData } from '@/hooks/usePostcode'
import { Input } from './input'
import { Button } from './button'
import { Label } from './label'

interface AddressSearchInputProps {
  value: string
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void
  disabled?: boolean
  placeholder?: string
  label?: string
  id?: string
}

export const AddressSearchInput: React.FC<AddressSearchInputProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "주소를 검색하세요",
  label = "주소",
  id = "address"
}) => {
  const { openPostcode } = usePostcode()
  const [isLoading, setIsLoading] = useState(false)

  const handleAddressSearch = () => {
    if (disabled) return

    setIsLoading(true)

    openPostcode(
      async (data: PostcodeData) => {
        const fullAddress = data.roadAddress || data.jibunAddress

        // 좌표 정보 가져오기 (Geocoding)
        try {
          const coordinates = await getCoordinatesFromAddress(fullAddress)
          onChange(fullAddress, coordinates)
        } catch (error) {
          // 좌표 변환 실패해도 주소는 설정
          onChange(fullAddress)
          console.warn('좌표 변환 실패:', error)
        }

        setIsLoading(false)
      },
      {
        onClose: () => setIsLoading(false)
      }
    )
  }

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  // 주소를 좌표로 변환하는 함수 (Kakao Local API 사용)
  const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
    try {
      // 실제 구현에서는 Kakao Local API를 사용하여 주소를 좌표로 변환
      // API 키가 있는 경우에만 실제 Geocoding을 수행
      const API_KEY = process.env.NEXT_PUBLIC_KAKAO_API_KEY

      if (API_KEY) {
        const response = await fetch(
          `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
          {
            headers: {
              'Authorization': `KakaoAK ${API_KEY}`
            }
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.documents && data.documents.length > 0) {
            const location = data.documents[0]
            return {
              lat: parseFloat(location.y),
              lng: parseFloat(location.x)
            }
          }
        }
      }

      // Fallback: 사용자의 현재 위치 또는 기본 서울 좌표
      return new Promise((resolve) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              })
            },
            () => {
              // 기본 서울 좌표
              resolve({
                lat: 37.5665,
                lng: 126.9780
              })
            }
          )
        } else {
          // 기본 서울 좌표
          resolve({
            lat: 37.5665,
            lng: 126.9780
          })
        }
      })
    } catch (error) {
      console.warn('Geocoding API 오류:', error)
      // 오류 시 기본 서울 좌표 반환
      return { lat: 37.5665, lng: 126.9780 }
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={handleManualInput}
          disabled={disabled}
          placeholder={placeholder}
          icon={<MapPin className="h-4 w-4" />}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddressSearch}
          disabled={disabled || isLoading}
          className="flex items-center gap-2 px-3 py-2 whitespace-nowrap"
        >
          <Search className="h-4 w-4" />
          {isLoading ? '검색중...' : '주소 검색'}
        </Button>
      </div>
      {value && (
        <p className="text-sm text-gray-600">
          선택된 주소: {value}
        </p>
      )}
    </div>
  )
}