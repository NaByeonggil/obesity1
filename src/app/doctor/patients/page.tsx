'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, User, FileText, Loader2, Pill, Download, Phone, Mail, Search } from 'lucide-react'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  totalAppointments: number
  completedAppointments: number
  prescriptionCount: number
  lastVisit?: string
  lastDepartment?: string
  lastSymptoms?: string
}

interface AppointmentDetail {
  id: string
  date: string
  time: string
  type: 'online' | 'offline'
  status: string
  department: string
  symptoms: string
  hasPrescription: boolean
  prescriptionId?: string
}

function DoctorPatientsContent() {
  const { data: session, status } = useSession()
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [patientAppointments, setPatientAppointments] = useState<AppointmentDetail[]>([])
  const [showPatientDetail, setShowPatientDetail] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPatients()
    }
  }, [status, session])

  const fetchPatients = async () => {
    if (status !== 'authenticated' || !session?.user) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/doctor/patients', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPatients(data.patients)
        }
      } else {
        console.error('Failed to fetch patients')
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPatientAppointments = async (patientId: string) => {
    try {
      const response = await fetch(`/api/doctor/patients/${patientId}/appointments`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setPatientAppointments(data.appointments)
        }
      }
    } catch (error) {
      console.error('Error fetching patient appointments:', error)
    }
  }

  const handleViewPatient = async (patient: Patient) => {
    setSelectedPatient(patient)
    setShowPatientDetail(true)
    await fetchPatientAppointments(patient.id)
  }

  const downloadPrescriptionPDF = async (prescriptionId: string, patientName: string) => {
    try {
      const response = await fetch(`/api/doctor/prescriptions/pdf?id=${prescriptionId}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type')

        if (contentType === 'application/pdf') {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `처방전_${patientName}_${new Date().toISOString().split('T')[0]}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        } else {
          const result = await response.json()
          if (result.success) {
            const fileName = `처방전_${patientName}_${new Date().toISOString().split('T')[0]}.pdf`
            await generateAndDownloadPDF(result.data, fileName)
          }
        }
      }
    } catch (error) {
      console.error('PDF 다운로드 오류:', error)
      alert('PDF 다운로드 중 오류가 발생했습니다.')
    }
  }

  const generateAndDownloadPDF = async (prescriptionData: any, fileName: string) => {
    try {
      const { generatePrescriptionPDF } = await import('@/components/prescription/PrescriptionPDF')
      const pdfBlob = await generatePrescriptionPDF(prescriptionData)
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('PDF 생성 오류:', error)
      alert('PDF 생성 중 오류가 발생했습니다.')
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">환자 정보를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">환자 관리</h1>
          <p className="text-gray-600 mt-2">
            진료한 환자 목록과 진료 이력을 확인하세요
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-sm text-gray-600">전체 환자</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {patients.reduce((sum, p) => sum + p.totalAppointments, 0)}
            </div>
            <p className="text-sm text-gray-600">총 예약 건수</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">
              {patients.reduce((sum, p) => sum + p.prescriptionCount, 0)}
            </div>
            <p className="text-sm text-gray-600">발행 처방전</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="환자 이름, 이메일, 전화번호로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 환자 목록 */}
      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-gray-500">
              {searchQuery ? '검색 결과가 없습니다.' : '환자가 없습니다.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={patient.avatar} alt={patient.name} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {patient.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <Mail className="h-3 w-3" />
                      <span>{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{patient.phone}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">총 예약</span>
                    <Badge variant="outline">{patient.totalAppointments}회</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">완료 진료</span>
                    <Badge variant="default">{patient.completedAppointments}회</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">처방전</span>
                    <Badge variant="secondary">{patient.prescriptionCount}개</Badge>
                  </div>
                  {patient.lastVisit && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>최근 방문: {patient.lastVisit}</span>
                      </div>
                      {patient.lastDepartment && (
                        <div className="text-xs text-gray-600 mt-1">
                          진료과: {patient.lastDepartment}
                        </div>
                      )}
                    </div>
                  )}
                  <Button
                    className="w-full mt-2"
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPatient(patient)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    진료 이력 보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 환자 상세 모달 */}
      {showPatientDetail && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
            <div className="p-6 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedPatient.avatar} alt={selectedPatient.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      {selectedPatient.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPatient.name}</h2>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{selectedPatient.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{selectedPatient.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowPatientDetail(false)
                    setSelectedPatient(null)
                    setPatientAppointments([])
                  }}
                >
                  닫기
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">{selectedPatient.totalAppointments}</div>
                    <p className="text-sm text-gray-600">총 예약</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedPatient.completedAppointments}
                    </div>
                    <p className="text-sm text-gray-600">완료 진료</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedPatient.prescriptionCount}
                    </div>
                    <p className="text-sm text-gray-600">처방전</p>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-lg font-semibold mb-4">진료 이력</h3>
              {patientAppointments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-6">
                    <p className="text-gray-500">진료 이력이 없습니다.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {patientAppointments.map((appointment) => (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={
                                appointment.status === 'completed' ? 'default' :
                                appointment.status === 'confirmed' ? 'success' :
                                'warning'
                              }>
                                {appointment.status === 'completed' ? '완료' :
                                 appointment.status === 'confirmed' ? '승인됨' :
                                 appointment.status === 'pending' ? '대기중' : '취소됨'}
                              </Badge>
                              <Badge variant={appointment.type === 'offline' ? 'default' : 'secondary'}>
                                {appointment.type === 'offline' ? '대면' : '비대면'}
                              </Badge>
                              {appointment.hasPrescription && (
                                <Badge variant="outline">
                                  <Pill className="h-3 w-3 mr-1" />
                                  처방전
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>{appointment.date} {appointment.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span>진료과: {appointment.department}</span>
                              </div>
                              {appointment.symptoms && (
                                <div className="text-gray-600 mt-2">
                                  증상: {appointment.symptoms}
                                </div>
                              )}
                            </div>
                          </div>
                          {appointment.hasPrescription && appointment.prescriptionId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadPrescriptionPDF(
                                appointment.prescriptionId!,
                                selectedPatient.name
                              )}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              처방전 PDF
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DoctorPatientsPage() {
  return (
    <ProtectedRoute requiredRole="doctor">
      <DoctorPatientsContent />
    </ProtectedRoute>
  )
}
