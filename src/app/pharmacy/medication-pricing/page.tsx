"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Pill,
  Search,
  Plus,
  Edit,
  Save,
  X,
  AlertTriangle,
  Loader2,
  DollarSign,
  Trash2
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Medication {
  id: string
  name: string
  description?: string
  price: number
  manufacturerId?: string
}

interface PricingData extends Medication {
  isEditing?: boolean
  newPrice?: number
  newName?: string
  newDescription?: string
}

function MedicationPricingContent() {
  const { data: session } = useSession()
  const [medications, setMedications] = React.useState<PricingData[]>([])
  const [filteredMedications, setFilteredMedications] = React.useState<PricingData[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [showAddForm, setShowAddForm] = React.useState(false)
  const [newMedication, setNewMedication] = React.useState({
    name: "",
    description: "",
    price: ""
  })

  const loadMedications = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/pharmacy/medications', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('의약품 목록 조회 실패')
      }

      const data = await response.json()
      setMedications(data.medications || [])
      setFilteredMedications(data.medications || [])
    } catch (err) {
      console.error('의약품 조회 오류:', err)
      setError('의약품 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadMedications()
  }, [loadMedications])

  React.useEffect(() => {
    const filtered = medications.filter(med =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredMedications(filtered)
  }, [searchTerm, medications])

  const handleEdit = (medicationId: string) => {
    setMedications(prev => prev.map(med =>
      med.id === medicationId
        ? {
            ...med,
            isEditing: true,
            newPrice: med.price,
            newName: med.name,
            newDescription: med.description || ''
          }
        : med
    ))
  }

  const handleCancelEdit = (medicationId: string) => {
    setMedications(prev => prev.map(med =>
      med.id === medicationId
        ? {
            ...med,
            isEditing: false,
            newPrice: undefined,
            newName: undefined,
            newDescription: undefined
          }
        : med
    ))
  }

  const handleFieldChange = (medicationId: string, field: 'name' | 'description' | 'price', value: string) => {
    setMedications(prev => prev.map(med => {
      if (med.id !== medicationId) return med

      if (field === 'price') {
        const numericPrice = parseFloat(value)
        if (isNaN(numericPrice) || numericPrice < 0) return med
        return { ...med, newPrice: numericPrice }
      } else if (field === 'name') {
        return { ...med, newName: value }
      } else {
        return { ...med, newDescription: value }
      }
    }))
  }

  const handleSave = async (medicationId: string) => {
    const medication = medications.find(m => m.id === medicationId)
    if (!medication) return

    // 검증
    if (!medication.newName || medication.newName.trim() === '') {
      alert('의약품명은 필수입니다.')
      return
    }

    if (medication.newPrice === undefined || medication.newPrice < 0) {
      alert('올바른 가격을 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/pharmacy/medications', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          medicationId,
          name: medication.newName,
          description: medication.newDescription,
          price: medication.newPrice
        })
      })

      if (!response.ok) {
        throw new Error('의약품 업데이트 실패')
      }

      setMedications(prev => prev.map(med =>
        med.id === medicationId
          ? {
              ...med,
              name: medication.newName!,
              description: medication.newDescription || undefined,
              price: medication.newPrice!,
              isEditing: false,
              newPrice: undefined,
              newName: undefined,
              newDescription: undefined
            }
          : med
      ))
    } catch (err) {
      console.error('의약품 업데이트 오류:', err)
      alert('의약품 업데이트 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (medicationId: string, medicationName: string) => {
    if (!confirm(`"${medicationName}" 의약품을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch('/api/pharmacy/medications', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          medicationId
        })
      })

      if (!response.ok) {
        throw new Error('의약품 삭제 실패')
      }

      setMedications(prev => prev.filter(med => med.id !== medicationId))
    } catch (err) {
      console.error('의약품 삭제 오류:', err)
      alert('의약품 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleAddMedication = async () => {
    if (!newMedication.name || !newMedication.price) {
      alert('의약품명과 가격은 필수 입력 항목입니다.')
      return
    }

    const price = parseFloat(newMedication.price)
    if (isNaN(price) || price < 0) {
      alert('올바른 가격을 입력해주세요.')
      return
    }

    try {
      const response = await fetch('/api/pharmacy/medications', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newMedication.name,
          description: newMedication.description,
          price: price
        })
      })

      if (!response.ok) {
        throw new Error('의약품 추가 실패')
      }

      setNewMedication({ name: "", description: "", price: "" })
      setShowAddForm(false)
      loadMedications()
    } catch (err) {
      console.error('의약품 추가 오류:', err)
      alert('의약품 추가 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole="pharmacy" user={session?.user || null}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">의약품 목록을 불러오는 중...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="pharmacy" user={session?.user || null}>
      <div className="space-y-6">
        {error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div>
          <h1 className="text-2xl font-bold text-gray-900">비급여 의약품 가격 관리</h1>
          <p className="text-gray-600 mt-1">
            비급여 의약품의 가격을 관리하세요
          </p>
        </div>

        {/* Search and Add */}
        <Card>
          <CardHeader>
            <CardTitle>의약품 검색 및 추가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="의약품명 또는 설명으로 검색"
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-pharmacy hover:bg-pharmacy-dark"
              >
                <Plus className="h-4 w-4 mr-2" />
                의약품 추가
              </Button>
            </div>

            {/* Add Form */}
            {showAddForm && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border space-y-4">
                <h3 className="font-semibold text-gray-900">새 의약품 추가</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      의약품명 *
                    </label>
                    <Input
                      placeholder="의약품명 입력"
                      value={newMedication.name}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      설명
                    </label>
                    <Input
                      placeholder="의약품 설명 (선택사항)"
                      value={newMedication.description}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      가격 (원) *
                    </label>
                    <Input
                      type="number"
                      placeholder="가격 입력"
                      value={newMedication.price}
                      onChange={(e) => setNewMedication(prev => ({ ...prev, price: e.target.value }))}
                      min="0"
                      step="100"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddMedication}
                    className="bg-pharmacy hover:bg-pharmacy-dark"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewMedication({ name: "", description: "", price: "" })
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medications List */}
        <Card>
          <CardHeader>
            <CardTitle>의약품 목록 ({filteredMedications.length}개)</CardTitle>
            <CardDescription>
              비급여 의약품 가격을 확인하고 수정할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredMedications.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm ? '검색 결과가 없습니다.' : '등록된 의약품이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMedications.map((medication) => (
                  <div
                    key={medication.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {medication.isEditing ? (
                      /* 편집 모드 */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              의약품명 *
                            </label>
                            <Input
                              value={medication.newName}
                              onChange={(e) => handleFieldChange(medication.id, 'name', e.target.value)}
                              placeholder="의약품명 입력"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              설명
                            </label>
                            <Input
                              value={medication.newDescription}
                              onChange={(e) => handleFieldChange(medication.id, 'description', e.target.value)}
                              placeholder="설명 (선택사항)"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
                              가격 (원) *
                            </label>
                            <Input
                              type="number"
                              value={medication.newPrice}
                              onChange={(e) => handleFieldChange(medication.id, 'price', e.target.value)}
                              placeholder="가격 입력"
                              min="0"
                              step="100"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(medication.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4 mr-1" />
                            저장
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelEdit(medication.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            취소
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* 보기 모드 */
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="bg-pharmacy/10 p-3 rounded-lg">
                            <Pill className="h-6 w-6 text-pharmacy" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                            {medication.description && (
                              <p className="text-sm text-gray-600 mt-1">{medication.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                비급여
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-pharmacy">
                              {medication.price.toLocaleString()}원
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(medication.id)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              수정
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(medication.id, medication.name)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              삭제
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function MedicationPricingPage() {
  return (
    <ProtectedRoute requiredRole="pharmacy">
      <MedicationPricingContent />
    </ProtectedRoute>
  )
}
