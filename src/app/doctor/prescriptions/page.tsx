'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Video, Eye, Plus, Calendar, Clock, Loader2, AlertCircle, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface Patient {
  id: string
  name: string
  phone: string
  email: string
}

interface Appointment {
  id: string
  type: string
  status: string
  date: string
  symptoms: string
  department: string
}

interface Medication {
  id: string
  name: string
  description: string
  dosage: string
  frequency: string
  duration: string
  quantity: string
  price: number
  substituteAllowed: boolean
}

interface Prescription {
  id: string
  prescriptionNumber: string
  patient: Patient
  appointment: Appointment | null
  status: string
  diagnosis: string
  notes: string
  issuedAt: string
  validUntil: string
  totalPrice: number
  medications: Medication[]
}

interface PrescriptionStats {
  totalPrescriptions: number
  todayPrescriptions: number
  pendingPrescriptions: number
  completedPrescriptions: number
}

function DoctorPrescriptionsContent() {
  const { data: session, status } = useSession()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [stats, setStats] = useState<PrescriptionStats>({
    totalPrescriptions: 0,
    todayPrescriptions: 0,
    pendingPrescriptions: 0,
    completedPrescriptions: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [availableAppointments, setAvailableAppointments] = useState<any[]>([])

  const [newPrescription, setNewPrescription] = useState({
    appointmentId: '',
    diagnosis: '',
    notes: '',
    medications: [{
      medicationId: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: '',
      price: 0,
      substituteAllowed: false
    }]
  })

  // 처방전 목록 및 통계 가져오기
  useEffect(() => {
    if (status === 'authenticated') {
      fetchPrescriptions()
      fetchAvailableAppointments()
    }
  }, [status, session])

  const fetchPrescriptions = async () => {
    if (status !== 'authenticated' || !session?.user) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/doctor/prescriptions', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPrescriptions(data.prescriptions)
          setStats(data.stats)
        } else {
          setError(data.error || '처방전 데이터를 불러오는데 실패했습니다.')
        }
      } else {
        setError('처방전 데이터를 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('Prescriptions fetch error:', error)
      setError('처방전 데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 처방전 발행 가능한 예약 목록 가져오기 (비대면 + 승인됨)
  const fetchAvailableAppointments = async () => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/doctor/appointments', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // 비대면 진료이면서 승인된 예약만 필터링
          const eligibleAppointments = data.appointments.filter((apt: any) =>
            apt.type === 'ONLINE' && apt.status === 'CONFIRMED'
          )
          setAvailableAppointments(eligibleAppointments)
        }
      }
    } catch (error) {
      console.error('Available appointments fetch error:', error)
    }
  }

  const handleCreatePrescription = async () => {
    if (!newPrescription.appointmentId || !newPrescription.diagnosis) {
      alert('예약과 진단명을 입력해주세요.')
      return
    }

    try {
      if (!session?.user) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.')
        return
      }

      const response = await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPrescription)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert(data.message)
        setIsCreateModalOpen(false)
        setNewPrescription({
          appointmentId: '',
          diagnosis: '',
          notes: '',
          medications: [{
            medicationId: '',
            dosage: '',
            frequency: '',
            duration: '',
            quantity: '',
            price: 0,
            substituteAllowed: false
          }]
        })
        fetchPrescriptions() // 목록 새로고침
        fetchAvailableAppointments() // 가능한 예약 목록 새로고침
      } else {
        alert(data.error || '처방전 발행에 실패했습니다.')
      }
    } catch (error) {
      console.error('Prescription creation error:', error)
      alert('처방전 발행 중 오류가 발생했습니다.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return 'default'
      case 'DISPENSED':
        return 'success'
      case 'EXPIRED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ISSUED':
        return '발행됨'
      case 'DISPENSED':
        return '조제완료'
      case 'EXPIRED':
        return '만료됨'
      default:
        return status
    }
  }

  const filteredPrescriptions = prescriptions.filter(p => {
    if (selectedTab === 'all') return true
    if (selectedTab === 'issued') return p.status === 'ISSUED'
    if (selectedTab === 'dispensed') return p.status === 'DISPENSED'
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">처방전 정보를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">처방전 관리</h1>
          <p className="text-gray-600 mt-2">
            비대면 진료 처방전을 발행하고 관리하세요
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={availableAppointments.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          처방전 발행
        </Button>
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.totalPrescriptions}</div>
            <p className="text-sm text-gray-600">전체 처방전</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.todayPrescriptions}</div>
            <p className="text-sm text-gray-600">오늘 발행</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.pendingPrescriptions}</div>
            <p className="text-sm text-gray-600">발행됨</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{stats.completedPrescriptions}</div>
            <p className="text-sm text-gray-600">조제완료</p>
          </CardContent>
        </Card>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Video className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong>비대면 진료 전용:</strong> 승인된 비대면 진료 예약에서만 처방전을 발행할 수 있습니다.
        </AlertDescription>
      </Alert>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">전체 ({prescriptions.length})</TabsTrigger>
          <TabsTrigger value="issued">
            발행됨 ({prescriptions.filter(p => p.status === 'ISSUED').length})
          </TabsTrigger>
          <TabsTrigger value="dispensed">
            조제완료 ({prescriptions.filter(p => p.status === 'DISPENSED').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4 mt-6">
          {filteredPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">처방전이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">
                          {prescription.patient.name}
                        </CardTitle>
                        <Badge variant={getStatusColor(prescription.status)}>
                          {getStatusText(prescription.status)}
                        </Badge>
                        <Badge variant="secondary">
                          <Video className="h-3 w-3 mr-1" />
                          비대면진료
                        </Badge>
                        <span className="text-sm text-gray-500">
                          #{prescription.prescriptionNumber}
                        </span>
                      </div>
                      <CardDescription>
                        진단: {prescription.diagnosis}
                        {prescription.appointment && (
                          <> • {prescription.appointment.department}</>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        상세보기
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">처방 약물</p>
                      {prescription.medications.length > 0 ? (
                        <div className="space-y-1">
                          {prescription.medications.map((med, index) => (
                            <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                              <span className="font-medium">{med.name}</span>
                              <span className="text-gray-600 ml-2">
                                {med.dosage} • {med.frequency} • {med.duration}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">약물 정보 없음</p>
                      )}
                    </div>
                    {prescription.notes && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-1">참고사항</p>
                        <p className="text-sm text-gray-600">{prescription.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        발행: {prescription.issuedAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        유효기간: {prescription.validUntil}
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      ₩{prescription.totalPrice.toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* 처방전 발행 모달 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">처방전 발행</h2>
              <p className="text-sm text-gray-600 mt-1">
                승인된 비대면 진료 예약에 대해 처방전을 발행합니다.
              </p>
            </div>

            <div className="p-6 space-y-6">
              {availableAppointments.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    처방전을 발행할 수 있는 승인된 비대면 진료 예약이 없습니다.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="appointmentId">예약 선택 *</Label>
                    <Select
                      value={newPrescription.appointmentId}
                      onValueChange={(value) => setNewPrescription({
                        ...newPrescription,
                        appointmentId: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="처방전을 발행할 예약을 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAppointments.map((appointment) => (
                          <SelectItem key={appointment.id} value={appointment.id}>
                            {appointment.patient.name} - {appointment.department}
                            ({new Date(appointment.appointmentDate).toLocaleDateString('ko-KR')})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">진단명 *</Label>
                    <Input
                      id="diagnosis"
                      value={newPrescription.diagnosis}
                      onChange={(e) => setNewPrescription({
                        ...newPrescription,
                        diagnosis: e.target.value
                      })}
                      placeholder="진단명을 입력하세요"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">참고사항</Label>
                    <Textarea
                      id="notes"
                      value={newPrescription.notes}
                      onChange={(e) => setNewPrescription({
                        ...newPrescription,
                        notes: e.target.value
                      })}
                      placeholder="환자에게 전달할 참고사항을 입력하세요"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>처방 약물</Label>
                    {newPrescription.medications.map((medication, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>약물명</Label>
                            <Input
                              value={medication.medicationId}
                              onChange={(e) => {
                                const updatedMedications = [...newPrescription.medications]
                                updatedMedications[index].medicationId = e.target.value
                                setNewPrescription({
                                  ...newPrescription,
                                  medications: updatedMedications
                                })
                              }}
                              placeholder="약물명을 입력하세요"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>용량</Label>
                            <Input
                              value={medication.dosage}
                              onChange={(e) => {
                                const updatedMedications = [...newPrescription.medications]
                                updatedMedications[index].dosage = e.target.value
                                setNewPrescription({
                                  ...newPrescription,
                                  medications: updatedMedications
                                })
                              }}
                              placeholder="1정, 5ml 등"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>복용횟수</Label>
                            <Input
                              value={medication.frequency}
                              onChange={(e) => {
                                const updatedMedications = [...newPrescription.medications]
                                updatedMedications[index].frequency = e.target.value
                                setNewPrescription({
                                  ...newPrescription,
                                  medications: updatedMedications
                                })
                              }}
                              placeholder="1일 3회"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>복용기간</Label>
                            <Input
                              value={medication.duration}
                              onChange={(e) => {
                                const updatedMedications = [...newPrescription.medications]
                                updatedMedications[index].duration = e.target.value
                                setNewPrescription({
                                  ...newPrescription,
                                  medications: updatedMedications
                                })
                              }}
                              placeholder="7일분"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>총 수량</Label>
                            <Input
                              value={medication.quantity}
                              onChange={(e) => {
                                const updatedMedications = [...newPrescription.medications]
                                updatedMedications[index].quantity = e.target.value
                                setNewPrescription({
                                  ...newPrescription,
                                  medications: updatedMedications
                                })
                              }}
                              placeholder="21정"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>가격 (원)</Label>
                            <Input
                              type="number"
                              value={medication.price}
                              onChange={(e) => {
                                const updatedMedications = [...newPrescription.medications]
                                updatedMedications[index].price = Number(e.target.value)
                                setNewPrescription({
                                  ...newPrescription,
                                  medications: updatedMedications
                                })
                              }}
                              placeholder="10000"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={medication.substituteAllowed}
                                onChange={(e) => {
                                  const updatedMedications = [...newPrescription.medications]
                                  updatedMedications[index].substituteAllowed = e.target.checked
                                  setNewPrescription({
                                    ...newPrescription,
                                    medications: updatedMedications
                                  })
                                }}
                              />
                              <span className="text-sm">대체조제 허용</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                취소
              </Button>
              <Button
                onClick={handleCreatePrescription}
                disabled={!newPrescription.appointmentId || !newPrescription.diagnosis}
              >
                <Check className="h-4 w-4 mr-2" />
                처방전 발행
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DoctorPrescriptionsPage() {
  return (
    <ProtectedRoute requiredRole="doctor">
      <DoctorPrescriptionsContent />
    </ProtectedRoute>
  )
}