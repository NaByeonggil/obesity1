'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, User, Video, UserCheck, X, Check, Edit2, Phone, FileText, Loader2, Pill, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
}

interface Appointment {
  id: string
  patient: Patient
  date: string
  time: string
  type: 'online' | 'offline'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  symptoms: string
  notes?: string
  department: string
  appointmentDate: string
  hasPrescription?: boolean
  prescriptionId?: string
}

function DoctorAppointmentsContent() {
  const { data: session, status } = useSession()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('all')
  const [showPatientList, setShowPatientList] = useState(false)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [notes, setNotes] = useState('')
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
  const [prescriptionForm, setPrescriptionForm] = useState({
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
  const [prescriptionPdfFile, setPrescriptionPdfFile] = useState<File | null>(null)
  const [isPrescribing, setIsPrescribing] = useState(false)
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  })
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null)

  // 예약 데이터 가져오기
  useEffect(() => {
    if (status === 'authenticated') {
      fetchAppointments()
    }
  }, [status, session])

  const fetchAppointments = async () => {
    if (status !== 'authenticated' || !session?.user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
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
          setAppointments(data.appointments)
          setStats(data.stats)
        }
      } else {
        console.error('Failed to fetch appointments')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 예약 상태 업데이트
  const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string) => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/doctor/appointments', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          appointmentId,
          status,
          notes
        })
      })

      if (response.ok) {
        // 로컬 상태 업데이트
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointmentId
              ? { ...apt, status: status.toLowerCase() as any, notes }
              : apt
          )
        )
        // 전체 데이터 다시 가져오기
        fetchAppointments()
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  // 대면진료 예약 승인
  const handleApproveInPerson = async (id: string) => {
    await updateAppointmentStatus(id, 'CONFIRMED')
    alert('대면진료 예약이 승인되었습니다.')
  }

  // 비대면진료 예약 승인
  const handleApproveTelehealth = async (id: string) => {
    await updateAppointmentStatus(id, 'CONFIRMED')
    alert('비대면진료 예약이 승인되었습니다.')
  }

  // 예약 취소 클릭
  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment)
    setShowCancelConfirm(true)
  }

  // 예약 취소 확인
  const handleCancelConfirm = async () => {
    if (!appointmentToCancel) return

    setCancellingId(appointmentToCancel.id)
    try {
      const response = await fetch(`/api/appointments/${appointmentToCancel.id}/cancel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ 예약 취소 성공:', data)

        // 예약 목록 새로고침
        await fetchAppointments()

        // 모달 닫기
        setShowCancelConfirm(false)
        setAppointmentToCancel(null)

        alert('예약이 성공적으로 취소되었습니다.')
      } else {
        const errorData = await response.json()
        console.error('❌ 예약 취소 실패:', errorData)
        alert(errorData.error || '예약 취소 중 오류가 발생했습니다.')
      }
    } catch (err) {
      console.error('❌ 예약 취소 예외:', err)
      alert('예약 취소 중 오류가 발생했습니다.')
    } finally {
      setCancellingId(null)
    }
  }

  // 예약 취소 모달 닫기
  const handleCancelClose = () => {
    setShowCancelConfirm(false)
    setAppointmentToCancel(null)
  }

  // 진료 완료 처리
  const handleComplete = async (id: string) => {
    await updateAppointmentStatus(id, 'COMPLETED', notes)
    alert('진료가 완료 처리되었습니다.')
    setNotes('')
  }

  // 일정 조정 모달 열기
  const handleRescheduleOpen = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setNewDate(appointment.date.split(' ')[0]) // 날짜 부분만 추출
    setNewTime(appointment.time)
    setNotes(appointment.notes || '')
    setIsRescheduleModalOpen(true)
  }

  // 일정 조정 저장
  const handleRescheduleSave = async () => {
    if (selectedAppointment) {
      await updateAppointmentStatus(selectedAppointment.id, 'CONFIRMED', notes)
      alert(`예약이 승인되었습니다.`)
      setIsRescheduleModalOpen(false)
      setSelectedAppointment(null)
      setNotes('')
    }
  }

  // 처방전 발행 모달 열기
  const handlePrescriptionOpen = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setPrescriptionForm({
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
    setIsPrescriptionModalOpen(true)
  }

  // 처방전 발행
  const handlePrescriptionSubmit = async () => {
    if (!selectedAppointment || !prescriptionForm.diagnosis) {
      alert('진단명을 입력해주세요.')
      return
    }

    if (isPrescribing) {
      return // 이미 처방전 발행 중이면 중복 실행 방지
    }

    setIsPrescribing(true)
    try {
      if (!session?.user) {
        alert('로그인이 필요합니다. 다시 로그인해주세요.')
        return
      }

      // FormData 생성 (PDF 파일 업로드 지원)
      const formData = new FormData()
      formData.append('appointmentId', selectedAppointment.id)
      formData.append('diagnosis', prescriptionForm.diagnosis)
      formData.append('notes', prescriptionForm.notes)
      formData.append('medications', JSON.stringify(prescriptionForm.medications))

      // PDF 파일이 있으면 추가
      if (prescriptionPdfFile) {
        formData.append('pdfFile', prescriptionPdfFile)
      }

      const response = await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        credentials: 'include',
        body: formData // Content-Type 헤더는 자동 설정됨
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert(data.message)

        // 처방전 PDF 다운로드 (자동 생성된 PDF 또는 업로드된 PDF)
        if (data.prescription?.id) {
          await downloadPrescriptionPDF(data.prescription.id, selectedAppointment.patient.name)
        }

        setIsPrescriptionModalOpen(false)
        setSelectedAppointment(null)
        setPrescriptionForm({
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
        setPrescriptionPdfFile(null) // PDF 파일 초기화
        fetchAppointments() // 목록 새로고침
      } else {
        alert(data.error || '처방전 발행에 실패했습니다.')
      }
    } catch (error) {
      console.error('Prescription creation error:', error)
      alert('처방전 발행 중 오류가 발생했습니다.')
    } finally {
      setIsPrescribing(false)
    }
  }

  // PDF 다운로드 함수
  const downloadPrescriptionPDF = async (prescriptionId: string, patientName: string) => {
    try {
      const response = await fetch(`/api/doctor/prescriptions/pdf?id=${prescriptionId}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // PDF 생성 및 다운로드
          const fileName = `처방전_${patientName}_${new Date().toISOString().split('T')[0]}.pdf`
          await generateAndDownloadPDF(result.data, fileName)
        }
      } else {
        console.error('PDF 다운로드 실패')
        alert('PDF 다운로드에 실패했습니다.')
      }
    } catch (error) {
      console.error('PDF 다운로드 오류:', error)
      alert('PDF 다운로드 중 오류가 발생했습니다.')
    }
  }

  // PDF 생성 및 다운로드
  const generateAndDownloadPDF = async (prescriptionData: any, fileName: string) => {
    try {
      // 동적 import를 사용하여 React-PDF 컴포넌트 로드
      const { pdf } = await import('@react-pdf/renderer')
      const { default: PrescriptionDocument } = await import('@/components/prescription/PrescriptionPDF')
      const React = await import('react')

      // PDF 문서 생성
      const doc = React.createElement(PrescriptionDocument, { data: prescriptionData })
      const pdfBlob = await pdf(doc).toBlob()

      // 다운로드 링크 생성
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      console.log('PDF 다운로드 완료:', fileName)
    } catch (error) {
      console.error('PDF 생성 오류:', error)
      alert('PDF 생성 중 오류가 발생했습니다.')
    }
  }

  // 기존 처방전 PDF 다운로드 (이미 발행된 처방전용)
  const downloadExistingPrescription = async (appointment: Appointment) => {
    if (!appointment.prescriptionId) {
      alert('처방전 정보를 찾을 수 없습니다.')
      return
    }
    await downloadPrescriptionPDF(appointment.prescriptionId, appointment.patient.name)
  }

  // 필터링된 예약 목록
  const filteredAppointments = appointments.filter(apt => {
    if (selectedTab === 'all') return true
    if (selectedTab === 'in-person') return apt.type === 'offline'
    if (selectedTab === 'telehealth') return apt.type === 'online'
    if (selectedTab === 'pending') return apt.status === 'pending'
    if (selectedTab === 'confirmed') return apt.status === 'confirmed'
    if (selectedTab === 'completed') return apt.status === 'completed'
    if (selectedTab === 'patients') return apt.status === 'confirmed' // 승인된 환자만 표시
    return true
  })

  // 환자 목록 탭에서는 중복 제거
  const getUniquePatients = () => {
    const uniquePatients = new Map()
    filteredAppointments.forEach(apt => {
      if (!uniquePatients.has(apt.patient.id)) {
        uniquePatients.set(apt.patient.id, apt)
      }
    })
    return Array.from(uniquePatients.values())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">예약 정보를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">예약 관리</h1>
          <p className="text-gray-600 mt-2">
            대면진료와 비대면진료 예약을 관리하세요
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.todayAppointments}</div>
            <p className="text-sm text-gray-600">오늘 예약</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.totalAppointments}</div>
            <p className="text-sm text-gray-600">전체 예약</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</div>
            <p className="text-sm text-gray-600">대기중</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">{stats.completedAppointments}</div>
            <p className="text-sm text-gray-600">완료</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">예약 승인 안내</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <UserCheck className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
              <span><strong>대면진료:</strong> 예약 요청을 검토하고 승인하세요</span>
            </li>
            <li className="flex items-start">
              <Video className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
              <span><strong>비대면진료:</strong> 환자가 원하는 시간에 승인하거나 일정을 조정하세요</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="pending">대기중</TabsTrigger>
          <TabsTrigger value="confirmed">승인됨</TabsTrigger>
          <TabsTrigger value="patients">환자목록</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
          <TabsTrigger value="in-person">대면진료</TabsTrigger>
          <TabsTrigger value="telehealth">비대면진료</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4 mt-6">
          {selectedTab === 'patients' ? (
            // 환자 목록 탭 전용 UI
            <>
              <h3 className="text-lg font-semibold mb-4">승인된 환자 목록</h3>
              {getUniquePatients().length === 0 ? (
                <Card>
                  <CardContent className="text-center py-10">
                    <p className="text-gray-500">승인된 예약이 없습니다.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getUniquePatients().map((appointment) => (
                    <Card key={appointment.patient.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{appointment.patient.name}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{appointment.patient.email}</p>
                            <p className="text-sm text-gray-600">{appointment.patient.phone}</p>
                          </div>
                          <Badge variant="success">승인됨</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>최근 예약: {appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span>증상: {appointment.symptoms || '없음'}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                          {appointment.hasPrescription ? (
                            <>
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700 w-full justify-center py-2">
                                <Check className="h-3 w-3 mr-1" />
                                처방전 발행 완료
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => downloadExistingPrescription(appointment)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                처방전 PDF
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              className="w-full"
                              onClick={() => handlePrescriptionOpen(appointment)}
                            >
                              <Pill className="h-4 w-4 mr-1" />
                              처방전 발행
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <p className="text-gray-500">예약이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => (
              <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">
                          {appointment.patient.name}
                        </CardTitle>
                        <Badge variant={
                          appointment.status === 'confirmed' ? 'success' :
                          appointment.status === 'pending' ? 'warning' :
                          appointment.status === 'cancelled' ? 'destructive' :
                          appointment.status === 'completed' ? 'default' :
                          'secondary'
                        }>
                          {appointment.status === 'confirmed' ? '승인됨' :
                           appointment.status === 'pending' ? '대기중' :
                           appointment.status === 'cancelled' ? '취소됨' :
                           appointment.status === 'completed' ? '완료' :
                           appointment.status}
                        </Badge>
                        <Badge variant={appointment.type === 'offline' ? 'default' : 'secondary'}>
                          {appointment.type === 'offline' ? (
                            <><UserCheck className="h-3 w-3 mr-1" /> 대면진료</>
                          ) : (
                            <><Video className="h-3 w-3 mr-1" /> 비대면진료</>
                          )}
                        </Badge>
                        {appointment.hasPrescription && (
                          <Badge variant="outline">
                            <FileText className="h-3 w-3 mr-1" /> 처방전
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>진료과: {appointment.department}</div>
                        <div>증상: {appointment.symptoms}</div>
                        {appointment.notes && (
                          <div className="mt-1">메모: {appointment.notes}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {appointment.status === 'pending' && (
                        <>
                          {appointment.type === 'offline' ? (
                            // 대면진료 승인 버튼
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApproveInPerson(appointment.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              예약 승인
                            </Button>
                          ) : (
                            // 비대면진료 승인 및 조정 버튼
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApproveTelehealth(appointment.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                예약 승인
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRescheduleOpen(appointment)}
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                메모 추가
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelClick(appointment)}
                            disabled={cancellingId === appointment.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {cancellingId === appointment.id ? '취소 중...' : '예약 취소'}
                          </Button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <>
                          {appointment.hasPrescription ? (
                            <>
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                <Check className="h-3 w-3 mr-1" />
                                처방전 발행 완료
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadExistingPrescription(appointment)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                처방전 PDF
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handlePrescriptionOpen(appointment)}
                            >
                              <Pill className="h-4 w-4 mr-1" />
                              처방전 발행
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleComplete(appointment.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            진료 완료
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{appointment.patient.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* 처방전 발행 모달 */}
      {isPrescriptionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">처방전 발행</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedAppointment?.patient.name}님의 {selectedAppointment?.type === 'online' ? '비대면' : '대면'} 진료 처방전을 발행합니다.
              </p>
              <div className="mt-2 flex items-center gap-4 text-sm">
                <span className="font-medium">예약 정보:</span>
                <span>{selectedAppointment?.date} {selectedAppointment?.time}</span>
                <Badge variant={selectedAppointment?.type === 'online' ? 'secondary' : 'default'}>
                  {selectedAppointment?.type === 'online' ? '비대면' : '대면'}
                </Badge>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">진단명 *</Label>
                <Input
                  id="diagnosis"
                  value={prescriptionForm.diagnosis}
                  onChange={(e) => setPrescriptionForm({
                    ...prescriptionForm,
                    diagnosis: e.target.value
                  })}
                  placeholder="진단명을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prescriptionNotes">처방 참고사항</Label>
                <Textarea
                  id="prescriptionNotes"
                  value={prescriptionForm.notes}
                  onChange={(e) => setPrescriptionForm({
                    ...prescriptionForm,
                    notes: e.target.value
                  })}
                  placeholder="처방전 참고사항을 입력하세요"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdfFile">처방전 PDF 첨부 (선택사항)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="pdfFile"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.type !== 'application/pdf') {
                          alert('PDF 파일만 업로드 가능합니다.')
                          e.target.value = ''
                          return
                        }
                        if (file.size > 10 * 1024 * 1024) { // 10MB 제한
                          alert('파일 크기는 10MB 이하여야 합니다.')
                          e.target.value = ''
                          return
                        }
                        setPrescriptionPdfFile(file)
                      }
                    }}
                    className="flex-1"
                  />
                  {prescriptionPdfFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPrescriptionPdfFile(null)
                        const fileInput = document.getElementById('pdfFile') as HTMLInputElement
                        if (fileInput) fileInput.value = ''
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {prescriptionPdfFile && (
                  <p className="text-sm text-gray-600">
                    선택된 파일: {prescriptionPdfFile.name} ({(prescriptionPdfFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  * PDF 파일을 첨부하지 않으면 시스템이 자동으로 처방전 PDF를 생성합니다.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setIsPrescriptionModalOpen(false)} disabled={isPrescribing}>
                취소
              </Button>
              <Button onClick={handlePrescriptionSubmit} disabled={isPrescribing}>
                {isPrescribing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    발행 중...
                  </>
                ) : (
                  <>
                    <Pill className="h-4 w-4 mr-2" />
                    처방전 발행
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 메모 추가 모달 */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">예약 승인 및 메모</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedAppointment?.patient.name}님의 예약을 승인하고 메모를 추가합니다.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">진료 메모</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="환자에게 전달할 메모를 입력하세요"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t">
              <Button variant="outline" onClick={() => setIsRescheduleModalOpen(false)}>
                취소
              </Button>
              <Button onClick={handleRescheduleSave}>
                승인 및 저장
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 예약 취소 확인 모달 */}
      {showCancelConfirm && appointmentToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">예약 취소 확인</h2>
              <p className="text-sm text-gray-600 mt-1">
                다음 예약을 취소하시겠습니까?
              </p>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">환자:</span>
                  <span className="text-sm font-medium">{appointmentToCancel.patient?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">진료과:</span>
                  <span className="text-sm font-medium">{appointmentToCancel.department}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">일시:</span>
                  <span className="text-sm font-medium">
                    {appointmentToCancel.date} {appointmentToCancel.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">진료 방식:</span>
                  <span className="text-sm font-medium">
                    {appointmentToCancel.type === 'online' ? '비대면 진료' : '방문 진료'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-red-600 font-medium">
                취소된 예약은 복구할 수 없습니다.
              </p>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t">
              <Button
                variant="outline"
                onClick={handleCancelClose}
                disabled={cancellingId !== null}
              >
                닫기
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelConfirm}
                disabled={cancellingId !== null}
              >
                {cancellingId !== null ? '취소 중...' : '예약 취소'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DoctorAppointmentsPage() {
  return (
    <ProtectedRoute requiredRole="doctor">
      <DoctorAppointmentsContent />
    </ProtectedRoute>
  )
}