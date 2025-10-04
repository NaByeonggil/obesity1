'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from '@react-pdf/renderer'

// PDF 스타일 정의
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  hospitalInfo: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    width: 80,
  },
  value: {
    fontSize: 11,
    flex: 1,
  },
  medicationHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    padding: 5,
    marginBottom: 5,
  },
  medicationRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottom: 1,
    borderBottomColor: '#ccc',
  },
  medCol1: { width: '25%', fontSize: 10 },
  medCol2: { width: '15%', fontSize: 10 },
  medCol3: { width: '15%', fontSize: 10 },
  medCol4: { width: '15%', fontSize: 10 },
  medCol5: { width: '15%', fontSize: 10 },
  medCol6: { width: '15%', fontSize: 10 },
  footer: {
    marginTop: 30,
    borderTop: 1,
    borderTopColor: '#000000',
    paddingTop: 10,
    fontSize: 10,
  },
  signature: {
    marginTop: 20,
    textAlign: 'right',
  },
  date: {
    textAlign: 'right',
    fontSize: 11,
    marginTop: 10,
  }
})

interface PrescriptionData {
  prescriptionNumber: string
  patientName: string
  patientPhone: string
  patientEmail: string
  doctorName: string
  clinicName: string
  diagnosis: string
  notes: string
  medications: Array<{
    medicationId: string
    dosage: string
    frequency: string
    duration: string
    quantity: string
    price: number
  }>
  issuedAt: string
  appointmentType: 'online' | 'offline'
}

// PDF 문서 컴포넌트
const PrescriptionDocument: React.FC<{ data: PrescriptionData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>처 방 전</Text>
        <Text style={styles.hospitalInfo}>{data.clinicName}</Text>
        <Text style={styles.hospitalInfo}>의사: {data.doctorName}</Text>
      </View>

      {/* 환자 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>환자 정보</Text>
        <View style={styles.row}>
          <Text style={styles.label}>성명:</Text>
          <Text style={styles.value}>{data.patientName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>연락처:</Text>
          <Text style={styles.value}>{data.patientPhone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>이메일:</Text>
          <Text style={styles.value}>{data.patientEmail}</Text>
        </View>
      </View>

      {/* 진료 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>진료 정보</Text>
        <View style={styles.row}>
          <Text style={styles.label}>처방전번호:</Text>
          <Text style={styles.value}>{data.prescriptionNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>진료유형:</Text>
          <Text style={styles.value}>{data.appointmentType === 'online' ? '비대면 진료' : '대면 진료'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>진단명:</Text>
          <Text style={styles.value}>{data.diagnosis}</Text>
        </View>
        {data.notes && (
          <View style={styles.row}>
            <Text style={styles.label}>참고사항:</Text>
            <Text style={styles.value}>{data.notes}</Text>
          </View>
        )}
      </View>

      {/* 처방 약물 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>처방 약물</Text>

        {/* 테이블 헤더 */}
        <View style={styles.medicationHeader}>
          <Text style={styles.medCol1}>약물명</Text>
          <Text style={styles.medCol2}>용량</Text>
          <Text style={styles.medCol3}>복용법</Text>
          <Text style={styles.medCol4}>복용기간</Text>
          <Text style={styles.medCol5}>수량</Text>
          <Text style={styles.medCol6}>가격</Text>
        </View>

        {/* 약물 목록 */}
        {data.medications.map((med, index) => (
          <View key={index} style={styles.medicationRow}>
            <Text style={styles.medCol1}>{med.medicationId}</Text>
            <Text style={styles.medCol2}>{med.dosage}</Text>
            <Text style={styles.medCol3}>{med.frequency}</Text>
            <Text style={styles.medCol4}>{med.duration}</Text>
            <Text style={styles.medCol5}>{med.quantity}</Text>
            <Text style={styles.medCol6}>{med.price.toLocaleString()}원</Text>
          </View>
        ))}
      </View>

      {/* 발행일 */}
      <Text style={styles.date}>발행일: {new Date(data.issuedAt).toLocaleDateString('ko-KR')}</Text>

      {/* 서명 */}
      <View style={styles.signature}>
        <Text>의사: {data.doctorName} (인)</Text>
      </View>

      {/* 푸터 */}
      <View style={styles.footer}>
        <Text>※ 본 처방전은 전자처방전으로 발행되었습니다.</Text>
        <Text>※ 약국에서 조제 시 신분증을 지참하시기 바랍니다.</Text>
        <Text>※ 처방전 유효기간: 발행일로부터 3일</Text>
      </View>
    </Page>
  </Document>
)

// PDF 다운로드 링크 컴포넌트
interface PrescriptionPDFProps {
  data: PrescriptionData
  fileName?: string
  children: React.ReactNode
}

export const PrescriptionPDFDownload: React.FC<PrescriptionPDFProps> = ({
  data,
  fileName = `처방전_${data.patientName}_${new Date().toISOString().split('T')[0]}.pdf`,
  children
}) => (
  <PDFDownloadLink
    document={<PrescriptionDocument data={data} />}
    fileName={fileName}
  >
    {({ blob, url, loading, error }) =>
      loading ? 'PDF 생성 중...' : children
    }
  </PDFDownloadLink>
)

// PDF Blob 생성 함수 (API에서 사용)
export const generatePrescriptionPDF = async (data: PrescriptionData): Promise<Blob> => {
  const doc = <PrescriptionDocument data={data} />
  return await pdf(doc).toBlob()
}

export default PrescriptionDocument