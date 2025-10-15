'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Pill,
  Search,
  Loader2,
  ArrowLeft,
  Store
} from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface Medication {
  id: string
  name: string
  description?: string
  price: number
}

function MedicationsContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // 의약품 데이터 로드
  const fetchMedications = useCallback(async (search: string = '') => {
    try {
      setLoading(true)
      const url = search
        ? `/api/medications?search=${encodeURIComponent(search)}&limit=100`
        : '/api/medications?limit=100'

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.medications) {
          setMedications(data.medications)
        }
      }
    } catch (error) {
      console.error('Failed to fetch medications:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMedications()
  }, [fetchMedications])

  const handleSearch = () => {
    fetchMedications(searchQuery)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">의약품 정보를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.push('/patient')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">비급여 의약품 가격 조회</h1>
          <p className="text-gray-600 mt-2">
            의약품을 선택하면 보유한 약국을 확인할 수 있습니다
          </p>
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
                placeholder="의약품명을 입력하세요 (예: 타이레놀, 게보린)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-patient hover:bg-patient-dark"
            >
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {medications.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Pill className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">검색 결과가 없습니다</p>
              <p className="text-sm text-gray-400">다른 의약품명으로 검색해보세요</p>
            </CardContent>
          </Card>
        ) : (
          medications.map((medication) => (
            <Card
              key={medication.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/patient/medications/${medication.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-patient" />
                    <h3 className="text-lg font-semibold line-clamp-1">{medication.name}</h3>
                  </div>
                </CardTitle>
                <CardDescription>
                  <Badge variant="secondary" className="mt-2">
                    {medication.price.toLocaleString()}원
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {medication.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {medication.description}
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/patient/medications/${medication.id}`)
                  }}
                >
                  <Store className="h-4 w-4 mr-2" />
                  보유 약국 보기
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default function MedicationsPage() {
  return (
    <ProtectedRoute requiredRole="patient">
      <MedicationsContent />
    </ProtectedRoute>
  )
}
