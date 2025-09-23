"use client"

import * as React from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { appointmentsApi, prescriptionsApi, medicationsApi, ApiError } from "@/lib/api-client"
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  FileText,
  User,
  Stethoscope,
  Loader2,
  AlertCircle,
  Plus,
  Phone,
  MessageCircle
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Appointment {
  id: string
  type: 'ONLINE' | 'OFFLINE'
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  appointmentDate: string
  symptoms?: string
  notes?: string
  createdAt: string
  updatedAt: string
  patient: {
    id: string
    name: string
    phone?: string
    avatar?: string
  }
  department: {
    id: string
    name: string
    consultationType: string
  }
  prescription?: {
    id: string
    prescriptionNumber: string
    status: string
    issuedAt: string
  }
}

interface Medication {
  id: string
  name: string
  description?: string
  unit: string
}

interface PrescriptionForm {
  appointmentId: string
  diagnosis: string
  notes: string
  medications: Array<{
    medicationId: string
    dosage: string
    frequency: string
    duration: string
    instructions: string
  }>
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [medications, setMedications] = React.useState<Medication[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("pending")
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = React.useState(false)
  const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)
  const [prescriptionForm, setPrescriptionForm] = React.useState<PrescriptionForm>({
    appointmentId: '',
    diagnosis: '',
    notes: '',
    medications: [{ medicationId: '', dosage: '', frequency: '', duration: '', instructions: '' }]
  })

  const { user, token, isAuthenticated } = useAuth()

  // 데이터 로딩
  const fetchData = React.useCallback(async () => {
    if (!token || !isAuthenticated) return

    try {
      setLoading(true)
      setError(null)

      const [appointmentsResponse, medicationsResponse] = await Promise.all([
        appointmentsApi.getAppointments(token),
        medicationsApi.getMedications()
      ])

      setAppointments(appointmentsResponse.appointments || [])
      setMedications(medicationsResponse.medications || [])
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
    }
  }, [token, isAuthenticated])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // 처방전 작성 핸들러
  const handleCreatePrescription = async () => {
    if (!token) return

    try {
      await prescriptionsApi.createPrescription(token, prescriptionForm)
      setPrescriptionDialogOpen(false)
      fetchData() // 데이터 새로고침
      alert('처방전이 성공적으로 작성되었습니다.')
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`처방전 작성 실패: ${err.message}`)
      } else {
        alert('처방전 작성 중 오류가 발생했습니다.')
      }
    }
  }

  // 예약 상태 업데이트
  const handleUpdateAppointmentStatus = async (appointmentId: string, status: string) => {
    if (!token) return

    try {
      await appointmentsApi.updateAppointment(token, appointmentId, { status })
      fetchData() // 데이터 새로고침
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`상태 업데이트 실패: ${err.message}`)
      } else {
        alert('상태 업데이트 중 오류가 발생했습니다.')
      }
    }
  }

  // 처방전 대화상자 열기
  const openPrescriptionDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setPrescriptionForm({
      appointmentId: appointment.id,
      diagnosis: '',
      notes: '',
      medications: [{ medicationId: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    })
    setPrescriptionDialogOpen(true)
  }

  // 약물 추가
  const addMedication = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [...prev.medications, { medicationId: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }))
  }

  // 약물 제거
  const removeMedication = (index: number) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  // 상태별 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { variant: 'default' as const, text: '확정' }
      case 'PENDING':
        return { variant: 'warning' as const, text: '대기 중' }
      case 'COMPLETED':
        return { variant: 'success' as const, text: '완료' }
      case 'CANCELLED':
        return { variant: 'destructive' as const, text: '취소' }
      default:
        return { variant: 'secondary' as const, text: '알 수 없음' }
    }
  }

  // 예약 필터링
  const filteredAppointments = appointments.filter(appointment => {
    if (activeTab === 'pending') return appointment.status === 'PENDING'
    if (activeTab === 'confirmed') return appointment.status === 'CONFIRMED'
    if (activeTab === 'completed') return appointment.status === 'COMPLETED'
    return true
  })

  if (loading) {
    return (
      <DashboardLayout userRole="doctor" user={user}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">예약 정보를 불러오는 중...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="doctor" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">예약 관리</h1>
          <p className="text-gray-600">환자 예약을 관리하고 처방전을 작성하세요</p>
        </div>

        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              대기 중 ({appointments.filter(a => a.status === 'PENDING').length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              확정 ({appointments.filter(a => a.status === 'CONFIRMED').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              완료 ({appointments.filter(a => a.status === 'COMPLETED').length})
            </TabsTrigger>
            <TabsTrigger value="all">
              전체 ({appointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">예약이 없습니다</h3>
                  <p className="text-sm">해당 상태의 예약이 없습니다.</p>
                </div>
              </Card>
            ) : (
              filteredAppointments.map((appointment) => {
                const statusBadge = getStatusBadge(appointment.status)
                return (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={appointment.patient.avatar || `https://ui-avatars.com/api/?name=${appointment.patient.name}&background=3B82F6&color=fff`}
                              alt={appointment.patient.name}
                            />
                            <AvatarFallback className="bg-patient text-white text-lg">
                              {appointment.patient.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{appointment.patient.name}</h3>
                              <Badge variant={statusBadge.variant}>
                                {statusBadge.text}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(appointment.appointmentDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(appointment.appointmentDate)}</span>
                              </div>
                              <Badge variant={appointment.type === 'ONLINE' ? 'default' : 'secondary'}>
                                {appointment.type === 'ONLINE' ? '화상진료' : '방문진료'}
                              </Badge>
                            </div>
                            {appointment.symptoms && (
                              <p className="text-sm text-gray-600 mt-2">증상: {appointment.symptoms}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2">
                          {appointment.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-doctor hover:bg-doctor-dark"
                                onClick={() => handleUpdateAppointmentStatus(appointment.id, 'CONFIRMED')}
                              >
                                승인
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateAppointmentStatus(appointment.id, 'CANCELLED')}
                              >
                                거부
                              </Button>
                            </>
                          )}

                          {appointment.status === 'CONFIRMED' && (
                            <>
                              {appointment.type === 'ONLINE' && (
                                <Button size="sm" className="bg-patient hover:bg-patient-dark">
                                  <Video className="h-4 w-4 mr-2" />
                                  화상진료 시작
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPrescriptionDialog(appointment)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                처방전 작성
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateAppointmentStatus(appointment.id, 'COMPLETED')}
                              >
                                진료 완료
                              </Button>
                            </>
                          )}

                          {appointment.status === 'COMPLETED' && appointment.prescription && (
                            <Button size="sm" variant="outline">
                              처방전 보기
                            </Button>
                          )}

                          <div className="flex space-x-2">
                            {appointment.patient.phone && (
                              <Button size="sm" variant="ghost">
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>
        </Tabs>

        {/* 처방전 작성 다이얼로그 */}
        <Dialog open={prescriptionDialogOpen} onOpenChange={setPrescriptionDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>처방전 작성</DialogTitle>
              <DialogDescription>
                {selectedAppointment?.patient.name} 환자의 처방전을 작성합니다.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="diagnosis">진단명</Label>
                  <Input
                    id="diagnosis"
                    value={prescriptionForm.diagnosis}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="진단명을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">특이사항</Label>
                  <Input
                    id="notes"
                    value={prescriptionForm.notes}
                    onChange={(e) => setPrescriptionForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="특이사항을 입력하세요"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>처방 의약품</Label>
                  <Button type="button" onClick={addMedication} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    약물 추가
                  </Button>
                </div>

                <div className="space-y-4">
                  {prescriptionForm.medications.map((medication, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <Label>약물명</Label>
                          <Select
                            value={medication.medicationId}
                            onValueChange={(value) => {
                              const newMeds = [...prescriptionForm.medications]
                              newMeds[index].medicationId = value
                              setPrescriptionForm(prev => ({ ...prev, medications: newMeds }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="약물 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {medications.map(med => (
                                <SelectItem key={med.id} value={med.id}>
                                  {med.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>용량</Label>
                          <Input
                            value={medication.dosage}
                            onChange={(e) => {
                              const newMeds = [...prescriptionForm.medications]
                              newMeds[index].dosage = e.target.value
                              setPrescriptionForm(prev => ({ ...prev, medications: newMeds }))
                            }}
                            placeholder="예: 1정"
                          />
                        </div>
                        <div>
                          <Label>복용법</Label>
                          <Input
                            value={medication.frequency}
                            onChange={(e) => {
                              const newMeds = [...prescriptionForm.medications]
                              newMeds[index].frequency = e.target.value
                              setPrescriptionForm(prev => ({ ...prev, medications: newMeds }))
                            }}
                            placeholder="예: 1일 2회"
                          />
                        </div>
                        <div>
                          <Label>복용기간</Label>
                          <Input
                            value={medication.duration}
                            onChange={(e) => {
                              const newMeds = [...prescriptionForm.medications]
                              newMeds[index].duration = e.target.value
                              setPrescriptionForm(prev => ({ ...prev, medications: newMeds }))
                            }}
                            placeholder="예: 7일"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMedication(index)}
                            disabled={prescriptionForm.medications.length === 1}
                          >
                            제거
                          </Button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label>복용 지시사항</Label>
                        <Textarea
                          value={medication.instructions}
                          onChange={(e) => {
                            const newMeds = [...prescriptionForm.medications]
                            newMeds[index].instructions = e.target.value
                            setPrescriptionForm(prev => ({ ...prev, medications: newMeds }))
                          }}
                          placeholder="복용 시 주의사항을 입력하세요"
                          rows={2}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setPrescriptionDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreatePrescription} className="bg-doctor hover:bg-doctor-dark">
                  처방전 작성
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}