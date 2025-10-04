import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create departments
  const departments = await Promise.all([
    prisma.departments.create({
      data: {
        id: 'dept_001',
        name: '마운자로 위고비',
        description: '비만 치료 전문',
        consultationType: 'offline',
        featured: true
      }
    }),
    prisma.departments.create({
      data: {
        id: 'dept_002',
        name: '비만관련 처방',
        description: '비만 관련 처방 전문',
        consultationType: 'offline',
        featured: false
      }
    }),
    prisma.departments.create({
      data: {
        id: 'dept_003',
        name: '인공눈물',
        description: '안구건조증 치료',
        consultationType: 'online',
        featured: false
      }
    }),
    prisma.departments.create({
      data: {
        id: 'dept_004',
        name: '감기관련',
        description: '감기 및 호흡기 질환',
        consultationType: 'online',
        featured: false
      }
    }),
    prisma.departments.create({
      data: {
        id: 'dept_005',
        name: '내과',
        description: '내과 진료',
        consultationType: 'online',
        featured: false
      }
    }),
    prisma.departments.create({
      data: {
        id: 'dept_006',
        name: '소아과',
        description: '소아 질환 전문',
        consultationType: 'online',
        featured: false
      }
    }),
    prisma.departments.create({
      data: {
        id: 'dept_007',
        name: '피부과',
        description: '피부 질환 전문',
        consultationType: 'online',
        featured: false
      }
    }),
    prisma.departments.create({
      data: {
        id: 'dept_008',
        name: '정형외과',
        description: '근골격계 질환',
        consultationType: 'online',
        featured: false
      }
    }),
    prisma.departments.create({
      data: {
        id: 'dept_009',
        name: '신경외과',
        description: '신경계 질환',
        consultationType: 'online',
        featured: false
      }
    })
  ])

  // Create users with hashed passwords
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create patients (5개)
  const patient1 = await prisma.users.create({
    data: {
      id: 'pat_001',
      email: 'kim.minji@example.com',
      password: hashedPassword,
      name: '김민지',
      phone: '010-1234-5678',
      ssn: '9501012******',
      role: 'PATIENT',
      avatar: 'https://ui-avatars.com/api/?name=김민지&background=3B82F6&color=fff',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const patient2 = await prisma.users.create({
    data: {
      id: 'pat_002',
      email: 'lee.chulsu@example.com',
      password: hashedPassword,
      name: '이철수',
      phone: '010-2345-6789',
      ssn: '7803151******',
      role: 'PATIENT',
      avatar: 'https://ui-avatars.com/api/?name=이철수&background=3B82F6&color=fff',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const patient3 = await prisma.users.create({
    data: {
      id: 'pat_003',
      email: 'park.younghee@example.com',
      password: hashedPassword,
      name: '박영희',
      phone: '010-3456-7890',
      ssn: '7205202******',
      role: 'PATIENT',
      avatar: 'https://ui-avatars.com/api/?name=박영희&background=3B82F6&color=fff',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const patient4 = await prisma.users.create({
    data: {
      id: 'pat_004',
      email: 'choi.hojun@example.com',
      password: hashedPassword,
      name: '최호준',
      phone: '010-4567-8901',
      ssn: '9011011******',
      role: 'PATIENT',
      avatar: 'https://ui-avatars.com/api/?name=최호준&background=3B82F6&color=fff',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const patient5 = await prisma.users.create({
    data: {
      id: 'pat_005',
      email: 'jung.sunmi@example.com',
      password: hashedPassword,
      name: '정선미',
      phone: '010-5678-9012',
      ssn: '8508082******',
      role: 'PATIENT',
      avatar: 'https://ui-avatars.com/api/?name=정선미&background=3B82F6&color=fff',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Create doctors
  const doctor1 = await prisma.users.create({
    data: {
      id: 'doc_001',
      email: 'kim.minsu@hospital.com',
      password: hashedPassword,
      name: '김민수',
      phone: '010-1111-2222',
      role: 'DOCTOR',
      specialization: '비만치료 전문의',
      license: 'DOC-2024-001',
      clinic: '서울비만클리닉',
      address: '서울시 강남구 테헤란로 123 메디컬빌딩 5층',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face&auto=format',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const doctor2 = await prisma.users.create({
    data: {
      id: 'doc_002',
      email: 'park.sungwoo@clinic.com',
      password: hashedPassword,
      name: '박성우',
      phone: '010-2222-3333',
      role: 'DOCTOR',
      specialization: '비만치료 전문의',
      license: 'DOC-2024-002',
      clinic: '프리미어 다이어트 의원',
      address: '서울시 서초구 서초대로 456 헬스케어센터 3층',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face&auto=format',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const doctor3 = await prisma.users.create({
    data: {
      id: 'doc_003',
      email: 'lee.jihye@clinic.com',
      password: hashedPassword,
      name: '이지혜',
      phone: '010-3333-4444',
      role: 'DOCTOR',
      specialization: '내분비내과 전문의',
      license: 'DOC-2024-003',
      clinic: '건강한 체중관리 클리닉',
      address: '서울시 마포구 월드컵북로 789 웰니스타워 7층',
      avatar: 'https://images.unsplash.com/photo-1594824804732-ca8b3f4d3a36?w=150&h=150&fit=crop&crop=face&auto=format',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const doctor4 = await prisma.users.create({
    data: {
      id: 'doc_004',
      email: 'jung.minwoo@clinic.com',
      password: hashedPassword,
      name: '정민우',
      phone: '010-4444-5555',
      role: 'DOCTOR',
      specialization: '비만치료 전문의',
      license: 'DOC-2024-004',
      clinic: '송파 체중관리의원',
      address: '서울시 송파구 잠실로 345 의료빌딩 4층',
      avatar: 'https://ui-avatars.com/api/?name=정민우&background=10B981&color=fff',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  const doctor5 = await prisma.users.create({
    data: {
      id: 'doc_005',
      email: 'han.seungwoo@clinic.com',
      password: hashedPassword,
      name: '한승우',
      phone: '010-5555-6666',
      role: 'DOCTOR',
      specialization: '비만치료 전문의',
      license: 'DOC-2024-005',
      clinic: '용산 다이어트 클리닉',
      address: '서울시 용산구 한강대로 678 메디컬타워 2층',
      avatar: 'https://ui-avatars.com/api/?name=한승우&background=10B981&color=fff',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  // 젤라의원 의사 추가
  const zellaPassword = await bcrypt.hash('123456', 10)  // 비밀번호 123456
  const doctorZella = await prisma.users.create({
    data: {
      id: 'doc_zella',
      email: 'kim@naver.com',  // 변경된 이메일
      password: zellaPassword,  // 비밀번호 123456
      name: '김원장',
      phone: '010-6666-7777',
      role: 'DOCTOR',
      specialization: '비만치료 전문의',
      license: 'DOC-2024-ZELLA',
      clinic: '젤라의원',
      address: '경기도 부천시 심곡동 668',  // 변경된 주소
      avatar: 'https://ui-avatars.com/api/?name=김원장&background=3B82F6&color=fff',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Create pharmacy
  const pharmacy1 = await prisma.users.create({
    data: {
      id: 'phar_001',
      email: 'lee.youngmi@pharmacy.com',
      password: hashedPassword,
      name: '이영미',
      phone: '010-7890-1234',
      role: 'PHARMACY',
      pharmacyName: '건강약국',
      pharmacyAddress: '서울시 강남구 역삼로 321',
      pharmacyPhone: '02-1234-5678',
      avatar: 'https://ui-avatars.com/api/?name=이영미&background=F59E0B&color=fff',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Create admin
  const admin = await prisma.users.create({
    data: {
      id: 'admin_001',
      email: 'admin@healthcare.com',
      password: hashedPassword,
      name: '관리자',
      phone: '010-8901-2345',
      role: 'ADMIN',
      avatar: 'https://ui-avatars.com/api/?name=관리자&background=8B5CF6&color=fff',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })

  // Create medications
  const medications = await Promise.all([
    prisma.medications.create({
      data: {
        id: 'med_001',
        name: '마운자로 2.5mg',
        description: '비만치료용 주사제',
        price: 450000
      }
    }),
    prisma.medications.create({
      data: {
        id: 'med_002',
        name: '위고비 0.25mg',
        description: '비만치료용 주사제',
        price: 520000
      }
    }),
    prisma.medications.create({
      data: {
        id: 'med_003',
        name: '삭센다 6mg',
        description: '비만치료용 주사제',
        price: 380000
      }
    }),
    prisma.medications.create({
      data: {
        id: 'med_004',
        name: '메트포르민 500mg',
        description: '당뇨병 치료제',
        price: 25000
      }
    }),
    prisma.medications.create({
      data: {
        id: 'med_005',
        name: '인공눈물 히알엔드',
        description: '안구건조증 치료제',
        price: 15000
      }
    }),
    prisma.medications.create({
      data: {
        id: 'med_006',
        name: '감기약 종합',
        description: '감기 증상 완화제',
        price: 8000
      }
    })
  ])

  // Create appointments (오늘 날짜 기준으로 생성)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const appointments = await Promise.all([
    // 완료된 예약들 (과거)
    prisma.appointments.create({
      data: {
        id: 'apt_001',
        patientId: patient1.id,
        doctorId: doctor1.id,
        departmentId: departments[0].id,
        type: 'OFFLINE',
        status: 'COMPLETED',
        appointmentDate: yesterday,
        symptoms: '비만 치료 상담',
        notes: '초기 상담 완료',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.appointments.create({
      data: {
        id: 'apt_002',
        patientId: patient2.id,
        doctorId: doctor2.id,
        departmentId: departments[1].id,
        type: 'OFFLINE',
        status: 'CONFIRMED',
        appointmentDate: today,
        symptoms: '체중 관리 상담',
        notes: '정기 검진',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.appointments.create({
      data: {
        id: 'apt_003',
        patientId: patient3.id,
        doctorId: doctor3.id,
        departmentId: departments[0].id,
        type: 'OFFLINE',
        status: 'PENDING',
        appointmentDate: tomorrow,
        symptoms: '마운자로 처방 상담',
        notes: '신규 환자',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.appointments.create({
      data: {
        id: 'apt_004',
        patientId: patient4.id,
        doctorId: doctor1.id,
        departmentId: departments[0].id,
        type: 'OFFLINE',
        status: 'PENDING',
        appointmentDate: tomorrow,
        symptoms: '경과 관찰',
        notes: '2차 상담',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.appointments.create({
      data: {
        id: 'apt_005',
        patientId: patient5.id,
        doctorId: doctor2.id,
        departmentId: departments[1].id,
        type: 'ONLINE',
        status: 'CONFIRMED',
        appointmentDate: today,
        symptoms: '비만 관련 상담',
        personalInfo: {
          name: '정선미',
          phone: '010-5678-9012',
          address: '서울시 강남구'
        },
        notes: '비대면 진료',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  // Create prescriptions
  const prescriptions = await Promise.all([
    prisma.prescriptions.create({
      data: {
        id: 'presc_001',
        prescriptionNumber: 'RX2024001',
        patientId: patient1.id,
        doctorId: doctor1.id,
        appointmentId: appointments[0].id,
        pharmacyId: pharmacy1.id,
        status: 'COMPLETED',
        diagnosis: '비만증 (E66.9)',
        notes: '식사와 함께 복용하시기 바랍니다.',
        issuedAt: yesterday,
        validUntil: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        totalPrice: 475000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.prescriptions.create({
      data: {
        id: 'presc_002',
        prescriptionNumber: 'RX2024002',
        patientId: patient2.id,
        doctorId: doctor2.id,
        status: 'ISSUED',
        diagnosis: '고도비만 (E66.8)',
        notes: '주 1회 피하주사. 투약 시간을 일정하게 유지하세요.',
        issuedAt: new Date(),
        validUntil: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        totalPrice: 520000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }),
    prisma.prescriptions.create({
      data: {
        id: 'presc_003',
        prescriptionNumber: 'RX2024003',
        patientId: patient3.id,
        doctorId: doctor3.id,
        status: 'SENT_TO_PHARMACY',
        diagnosis: '비만증 (E66.9)',
        notes: '첫 처방입니다. 용량 조절이 필요할 수 있습니다.',
        issuedAt: new Date(),
        validUntil: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        totalPrice: 455000,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
  ])

  // Create prescription medications
  await Promise.all([
    // Prescription 1 medications
    prisma.prescription_medications.create({
      data: {
        id: 'prescmed_001',
        prescriptionId: prescriptions[0].id,
        medicationId: medications[0].id, // 마운자로 2.5mg
        dosage: '주 1회 피하주사',
        frequency: '주 1회',
        duration: '4주',
        quantity: '4주분',
        substituteAllowed: false,
        price: 450000
      }
    }),
    prisma.prescription_medications.create({
      data: {
        id: 'prescmed_002',
        prescriptionId: prescriptions[0].id,
        medicationId: medications[3].id, // 메트포르민 500mg
        dosage: '1정',
        frequency: '1일 2회',
        duration: '30일',
        quantity: '60정',
        substituteAllowed: true,
        price: 25000
      }
    }),
    // Prescription 2 medications
    prisma.prescription_medications.create({
      data: {
        id: 'prescmed_003',
        prescriptionId: prescriptions[1].id,
        medicationId: medications[1].id, // 위고비 0.25mg
        dosage: '주 1회 피하주사',
        frequency: '주 1회',
        duration: '4주',
        quantity: '4주분',
        substituteAllowed: false,
        price: 520000
      }
    }),
    // Prescription 3 medications
    prisma.prescription_medications.create({
      data: {
        id: 'prescmed_004',
        prescriptionId: prescriptions[2].id,
        medicationId: medications[2].id, // 삭센다 6mg
        dosage: '주 1회 피하주사',
        frequency: '주 1회',
        duration: '4주',
        quantity: '4주분',
        substituteAllowed: false,
        price: 380000
      }
    }),
    prisma.prescription_medications.create({
      data: {
        id: 'prescmed_005',
        prescriptionId: prescriptions[2].id,
        medicationId: medications[3].id, // 메트포르민 500mg
        dosage: '2정',
        frequency: '1일 2회',
        duration: '30일',
        quantity: '120정',
        substituteAllowed: true,
        price: 75000
      }
    })
  ])

  // Create pharmacy inventory
  await Promise.all([
    prisma.pharmacy_inventory.create({
      data: {
        id: 'inv_001',
        pharmacyId: pharmacy1.id,
        medicationId: medications[0].id, // 마운자로
        currentStock: 15,
        minStock: 10,
        maxStock: 50,
        lastOrderDate: new Date('2024-01-15'),
        supplier: '노보노디스크'
      }
    }),
    prisma.pharmacy_inventory.create({
      data: {
        id: 'inv_002',
        pharmacyId: pharmacy1.id,
        medicationId: medications[1].id, // 위고비
        currentStock: 8,
        minStock: 5,
        maxStock: 30,
        lastOrderDate: new Date('2024-01-10'),
        supplier: '노보노디스크'
      }
    }),
    prisma.pharmacy_inventory.create({
      data: {
        id: 'inv_003',
        pharmacyId: pharmacy1.id,
        medicationId: medications[2].id, // 삭센다
        currentStock: 20,
        minStock: 15,
        maxStock: 50,
        supplier: '노보노디스크'
      }
    }),
    prisma.pharmacy_inventory.create({
      data: {
        id: 'inv_004',
        pharmacyId: pharmacy1.id,
        medicationId: medications[3].id, // 메트포르민
        currentStock: 100,
        minStock: 50,
        maxStock: 200,
        supplier: '유한양행'
      }
    })
  ])

  // Create user notifications
  await Promise.all([
    prisma.user_notifications.create({
      data: {
        id: 'notif_001',
        userId: doctor1.id,
        title: '새로운 예약 요청',
        message: `${patient3.name}님이 진료를 예약하셨습니다.`,
        type: 'APPOINTMENT',
        read: false
      }
    }),
    prisma.user_notifications.create({
      data: {
        id: 'notif_002',
        userId: patient1.id,
        title: '처방전 발급 완료',
        message: '마운자로 처방전이 발급되었습니다.',
        type: 'PRESCRIPTION',
        read: false
      }
    }),
    prisma.user_notifications.create({
      data: {
        id: 'notif_003',
        userId: pharmacy1.id,
        title: '재고 부족 알림',
        message: '위고비 재고가 부족합니다.',
        type: 'INVENTORY',
        read: false
      }
    })
  ])

  // Create system alerts
  await Promise.all([
    prisma.system_alerts.create({
      data: {
        id: 'alert_001',
        type: 'info',
        title: '정기 백업 완료',
        description: '오늘 03:00 정기 백업이 성공적으로 완료되었습니다',
        severity: 'low'
      }
    }),
    prisma.system_alerts.create({
      data: {
        id: 'alert_002',
        type: 'warning',
        title: '재고 부족 경고',
        description: '일부 의약품의 재고가 최소 기준을 하회했습니다',
        severity: 'medium'
      }
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`📧 Test accounts created:`)
  console.log(`   Patients (5):`)
  console.log(`      - kim.minji@example.com (password: password123)`)
  console.log(`      - lee.chulsu@example.com (password: password123)`)
  console.log(`      - park.younghee@example.com (password: password123)`)
  console.log(`      - choi.hojun@example.com (password: password123)`)
  console.log(`      - jung.sunmi@example.com (password: password123)`)
  console.log(`   Doctors (5):`)
  console.log(`      - kim.minsu@hospital.com (password: password123)`)
  console.log(`      - park.sungwoo@clinic.com (password: password123)`)
  console.log(`      - lee.jihye@clinic.com (password: password123)`)
  console.log(`      - jung.minwoo@clinic.com (password: password123)`)
  console.log(`      - han.seungwoo@clinic.com (password: password123)`)
  console.log(`   Pharmacy: lee.youngmi@pharmacy.com (password: password123)`)
  console.log(`   Admin: admin@healthcare.com (password: password123)`)
  console.log(`📊 Data created:`)
  console.log(`   - 5 Appointments (1 completed, 2 confirmed, 2 pending)`)
  console.log(`   - 3 Prescriptions with medications`)
  console.log(`   - 9 Departments`)
  console.log(`   - 6 Medications`)
  console.log(`   - 4 Pharmacy inventory items`)
  console.log(`   - 3 User notifications`)
  console.log(`   - 2 System alerts`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })