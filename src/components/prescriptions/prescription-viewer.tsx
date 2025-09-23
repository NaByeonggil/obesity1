"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Eye,
  Printer,
  FileText,
  Calendar,
  User,
  Building2,
  Pill
} from "lucide-react"

interface PrescriptionProps {
  prescription: {
    id: string
    patientName: string
    patientSSN: string // 마스킹 처리된 주민번호
    doctorName: string
    clinicName: string
    issueDate: string
    medications: {
      name: string
      dosage: string
      frequency: string
      duration: string
      substituteAllowed: boolean
    }[]
    diagnosis: string
    notes?: string
  }
}

export function PrescriptionViewer({ prescription }: PrescriptionProps) {
  const [showPDF, setShowPDF] = React.useState(false)

  const handleDownload = () => {
    // PDF 다운로드 로직
    console.log("처방전 다운로드:", prescription.id)
    // 실제로는 PDF 생성 및 다운로드
    const pdfUrl = `/api/prescriptions/${prescription.id}/pdf`
    window.open(pdfUrl, '_blank')
  }

  const handleView = () => {
    setShowPDF(true)
    handleDownload()
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>전자 처방전</CardTitle>
              <CardDescription>
                발급일: {prescription.issueDate}
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
            >
              <Eye className="h-4 w-4 mr-2" />
              보기
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              다운로드
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              프린트
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* 환자 정보 */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center text-gray-900">
              <User className="h-5 w-5 mr-2" />
              환자 정보
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">성명</span>
                <span className="font-medium">{prescription.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">주민등록번호</span>
                <span className="font-medium">{prescription.patientSSN}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center text-gray-900">
              <Building2 className="h-5 w-5 mr-2" />
              의료기관 정보
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">의료기관</span>
                <span className="font-medium">{prescription.clinicName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">처방의</span>
                <span className="font-medium">{prescription.doctorName}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 진단명 */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-900">진단명</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900">{prescription.diagnosis}</p>
          </div>
        </div>

        {/* 처방 내역 */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center text-gray-900">
            <Pill className="h-5 w-5 mr-2" />
            처방 내역
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">약품명</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">용법/용량</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">복용 횟수</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">투약 일수</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">대체조제</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {prescription.medications.map((med, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {med.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {med.dosage}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {med.frequency}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {med.duration}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={med.substituteAllowed ? "success" : "secondary"}>
                        {med.substituteAllowed ? "가능" : "불가"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 주의사항 */}
        {prescription.notes && (
          <div>
            <h3 className="font-semibold mb-3 text-gray-900">주의사항</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-900 text-sm">{prescription.notes}</p>
            </div>
          </div>
        )}

        {/* 유효기간 안내 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p>• 이 처방전은 발급일로부터 3일간 유효합니다</p>
              <p>• 약국에 방문하여 처방약을 수령하시기 바랍니다</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}