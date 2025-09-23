import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Adding additional dummy data...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  // 추가 환자 5명
  const additionalPatients = await Promise.all([
    prisma.users.create({
      data: {
        id: 'patient_006',
        email: 'kang.jiwon@example.com',
        password: hashedPassword,
        name: '강지원',
        phone: '010-6666-7777',
        role: 'PATIENT',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.users.create({
      data: {
        id: 'patient_007',
        email: 'yoon.sangho@example.com',
        password: hashedPassword,
        name: '윤상호',
        phone: '010-7777-8888',
        role: 'PATIENT',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.users.create({
      data: {
        id: 'patient_008',
        email: 'oh.minju@example.com',
        password: hashedPassword,
        name: '오민주',
        phone: '010-8888-9999',
        role: 'PATIENT',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.users.create({
      data: {
        id: 'patient_009',
        email: 'kim.soobin@example.com',
        password: hashedPassword,
        name: '김수빈',
        phone: '010-9999-0000',
        role: 'PATIENT',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.users.create({
      data: {
        id: 'patient_010',
        email: 'lee.donghyun@example.com',
        password: hashedPassword,
        name: '이동현',
        phone: '010-0000-1111',
        role: 'PATIENT',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  // 추가 의사 3명
  const additionalDoctors = await Promise.all([
    prisma.users.create({
      data: {
        id: 'doc_006',
        email: 'choi.youngseok@hospital.com',
        password: hashedPassword,
        name: '최영석',
        phone: '010-6666-7777',
        role: 'DOCTOR',
        specialization: '피부과 전문의',
        license: 'DOC67890',
        clinic: '청담 피부과 의원',
        address: '서울시 강남구 청담동 123-45',
        avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face&auto=format',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.users.create({
      data: {
        id: 'doc_007',
        email: 'shin.minhee@clinic.com',
        password: hashedPassword,
        name: '신민희',
        phone: '010-7777-8888',
        role: 'DOCTOR',
        specialization: '정형외과 전문의',
        license: 'DOC78901',
        clinic: '신촌 정형외과',
        address: '서울시 서대문구 신촌동 567-89',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face&auto=format',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.users.create({
      data: {
        id: 'doc_008',
        email: 'park.jaehoon@clinic.com',
        password: hashedPassword,
        name: '박재훈',
        phone: '010-8888-9999',
        role: 'DOCTOR',
        specialization: '이비인후과 전문의',
        license: 'DOC89012',
        clinic: '이대 이비인후과',
        address: '서울시 서대문구 이대앞 789-01',
        avatar: 'https://ui-avatars.com/api/?name=박재훈&background=10B981&color=fff',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  // 추가 약품 5개
  const additionalMedications = await Promise.all([
    prisma.medications.create({
      data: {
        id: 'med_007',
        name: '타이레놀',
        description: '해열 진통제',
        price: 12000,
        manufacturerId: 'johnson'
      }
    }),
    prisma.medications.create({
      data: {
        id: 'med_008',
        name: '애드빌',
        description: '소염 진통제',
        price: 15000,
        manufacturerId: 'pfizer'
      }
    }),
    prisma.medications.create({
      data: {
        id: 'med_009',
        name: '베아제',
        description: '소화효소제',
        price: 8000,
        manufacturerId: 'daewoong'
      }
    }),
    prisma.medications.create({
      data: {
        id: 'med_010',
        name: '겔포스',
        description: '제산제',
        price: 6000,
        manufacturerId: 'yuhan'
      }
    }),
    prisma.medications.create({
      data: {
        id: 'med_011',
        name: '후시딘',
        description: '항생제 연고',
        price: 18000,
        manufacturerId: 'dongkook'
      }
    })
  ])

  // 추가 예약 5개
  const additionalAppointments = await Promise.all([
    prisma.appointments.create({
      data: {
        id: 'apt_006',
        patientId: 'patient_006',
        doctorId: 'doc_006',
        departmentId: 'dept_007', // 피부과
        type: 'ONLINE',
        status: 'PENDING',
        appointmentDate: new Date('2024-09-25T14:00:00'),
        symptoms: '아토피 피부염으로 가려움',
        notes: '최근 증상 악화됨',
        personalInfo: {
          phoneNumber: '010-6666-7777',
          patientName: '강지원',
          patientEmail: 'kang.jiwon@example.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.appointments.create({
      data: {
        id: 'apt_007',
        patientId: 'patient_007',
        doctorId: 'doc_007',
        departmentId: 'dept_008', // 정형외과
        type: 'OFFLINE',
        status: 'CONFIRMED',
        appointmentDate: new Date('2024-09-26T10:30:00'),
        symptoms: '무릎 통증 및 부종',
        notes: '계단 오르내릴 때 통증 심함',
        personalInfo: {
          phoneNumber: '010-7777-8888',
          patientName: '윤상호',
          patientEmail: 'yoon.sangho@example.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.appointments.create({
      data: {
        id: 'apt_008',
        patientId: 'patient_008',
        doctorId: 'doc_008',
        departmentId: 'dept_009', // 이비인후과
        type: 'ONLINE',
        status: 'PENDING',
        appointmentDate: new Date('2024-09-27T16:00:00'),
        symptoms: '만성 비염과 코막힘',
        notes: '환절기마다 증상 심해짐',
        personalInfo: {
          phoneNumber: '010-8888-9999',
          patientName: '오민주',
          patientEmail: 'oh.minju@example.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.appointments.create({
      data: {
        id: 'apt_009',
        patientId: 'patient_009',
        doctorId: 'doc_001', // 기존 의사
        departmentId: 'dept_001', // 비만치료
        type: 'OFFLINE',
        status: 'COMPLETED',
        appointmentDate: new Date('2024-09-20T11:00:00'),
        symptoms: '체중 감량 상담',
        notes: '식단 관리 및 운동 계획 필요',
        personalInfo: {
          phoneNumber: '010-9999-0000',
          patientName: '김수빈',
          patientEmail: 'kim.soobin@example.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.appointments.create({
      data: {
        id: 'apt_010',
        patientId: 'patient_010',
        doctorId: 'doc_002', // 기존 의사
        departmentId: 'dept_003', // 인공눈물
        type: 'ONLINE',
        status: 'CONFIRMED',
        appointmentDate: new Date('2024-09-28T15:30:00'),
        symptoms: '안구건조증 심화',
        notes: '컴퓨터 작업으로 인한 안구피로',
        personalInfo: {
          phoneNumber: '010-0000-1111',
          patientName: '이동현',
          patientEmail: 'lee.donghyun@example.com'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  // 추가 처방전 3개
  const additionalPrescriptions = await Promise.all([
    prisma.prescriptions.create({
      data: {
        id: 'presc_004',
        prescriptionNumber: 'RX004-240920',
        patientId: 'patient_009',
        doctorId: 'doc_001',
        appointmentId: 'apt_009',
        status: 'DISPENSED',
        diagnosis: '비만증',
        notes: '식사 30분 전 복용',
        issuedAt: new Date('2024-09-20T11:30:00'),
        validUntil: new Date('2024-10-20T23:59:59'),
        totalPrice: 85000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.prescriptions.create({
      data: {
        id: 'presc_005',
        prescriptionNumber: 'RX005-240925',
        patientId: 'patient_006',
        doctorId: 'doc_006',
        status: 'ISSUED',
        diagnosis: '아토피 피부염',
        notes: '외용제, 하루 2회 도포',
        issuedAt: new Date('2024-09-25T14:30:00'),
        validUntil: new Date('2024-10-25T23:59:59'),
        totalPrice: 45000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.prescriptions.create({
      data: {
        id: 'presc_006',
        prescriptionNumber: 'RX006-240926',
        patientId: 'patient_007',
        doctorId: 'doc_007',
        status: 'ISSUED',
        diagnosis: '무릎 관절염',
        notes: '식후 복용, 위장장애 주의',
        issuedAt: new Date('2024-09-26T11:00:00'),
        validUntil: new Date('2024-11-26T23:59:59'),
        totalPrice: 32000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  // 처방약품 연결
  await Promise.all([
    // 처방전 4번 (비만치료)
    prisma.prescription_medications.create({
      data: {
        id: 'pm_010',
        prescriptionId: 'presc_004',
        medicationId: 'med_001', // 마운자로
        dosage: '2.4mg',
        frequency: '주 1회',
        duration: '8주',
        quantity: '8회분',
        substituteAllowed: false,
        price: 85000
      }
    }),
    // 처방전 5번 (피부염)
    prisma.prescription_medications.create({
      data: {
        id: 'pm_011',
        prescriptionId: 'presc_005',
        medicationId: 'med_011', // 후시딘
        dosage: '적량',
        frequency: '1일 2회',
        duration: '2주',
        quantity: '1개',
        substituteAllowed: true,
        price: 18000
      }
    }),
    prisma.prescription_medications.create({
      data: {
        id: 'pm_012',
        prescriptionId: 'presc_005',
        medicationId: 'med_004', // 세티리진
        dosage: '10mg',
        frequency: '1일 1회',
        duration: '2주',
        quantity: '14정',
        substituteAllowed: true,
        price: 27000
      }
    }),
    // 처방전 6번 (관절염)
    prisma.prescription_medications.create({
      data: {
        id: 'pm_013',
        prescriptionId: 'presc_006',
        medicationId: 'med_008', // 애드빌
        dosage: '200mg',
        frequency: '1일 2회',
        duration: '1주',
        quantity: '14정',
        substituteAllowed: true,
        price: 15000
      }
    }),
    prisma.prescription_medications.create({
      data: {
        id: 'pm_014',
        prescriptionId: 'presc_006',
        medicationId: 'med_009', // 베아제
        dosage: '1정',
        frequency: '식후 3회',
        duration: '1주',
        quantity: '21정',
        substituteAllowed: true,
        price: 17000
      }
    })
  ])

  // 추가 사용자 알림
  await Promise.all([
    prisma.user_notifications.create({
      data: {
        id: 'notif_004',
        userId: 'patient_006',
        title: '피부과 진료 예약 확정',
        message: '9월 25일 14:00 피부과 온라인 진료가 확정되었습니다.',
        type: 'APPOINTMENT_CONFIRMED',
        read: false,
        createdAt: new Date()
      }
    }),
    prisma.user_notifications.create({
      data: {
        id: 'notif_005',
        userId: 'patient_007',
        title: '정형외과 진료 예약 확정',
        message: '9월 26일 10:30 정형외과 대면 진료가 확정되었습니다.',
        type: 'APPOINTMENT_CONFIRMED',
        read: false,
        createdAt: new Date()
      }
    }),
    prisma.user_notifications.create({
      data: {
        id: 'notif_006',
        userId: 'patient_009',
        title: '처방전 발급 완료',
        message: '비만치료 처방전이 발급되었습니다. 약국에서 수령하세요.',
        type: 'PRESCRIPTION_ISSUED',
        read: true,
        createdAt: new Date()
      }
    })
  ])

  // 추가 진료과 3개
  await Promise.all([
    prisma.departments.create({
      data: {
        id: 'dept_007',
        name: '피부과',
        description: '피부 질환 전문 진료',
        consultationType: 'online',
        featured: false
      }
    }),
    prisma.departments.create({
      data: {
        id: 'dept_008',
        name: '정형외과',
        description: '근골격계 질환 전문',
        consultationType: 'offline',
        featured: false
      }
    }),
    prisma.departments.create({
      data: {
        id: 'dept_009',
        name: '이비인후과',
        description: '귀, 코, 목 질환 전문',
        consultationType: 'online',
        featured: false
      }
    })
  ])

  console.log('✅ Additional dummy data seeded successfully!')
  console.log('📧 Additional test accounts created:')
  console.log('   New Patients (5):')
  console.log('      - kang.jiwon@example.com (강지원)')
  console.log('      - yoon.sangho@example.com (윤상호)')
  console.log('      - oh.minju@example.com (오민주)')
  console.log('      - kim.soobin@example.com (김수빈)')
  console.log('      - lee.donghyun@example.com (이동현)')
  console.log('   New Doctors (3):')
  console.log('      - choi.youngseok@hospital.com (최영석 - 피부과)')
  console.log('      - shin.minhee@clinic.com (신민희 - 정형외과)')
  console.log('      - park.jaehoon@clinic.com (박재훈 - 이비인후과)')
  console.log('📊 Additional data created:')
  console.log('   - 5 New appointments')
  console.log('   - 3 New prescriptions')
  console.log('   - 5 New medications')
  console.log('   - 3 New departments')
  console.log('   - 3 New notifications')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })