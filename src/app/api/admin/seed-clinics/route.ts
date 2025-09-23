import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('Adding clinic dummy data...')

    // 기존 의원 사용자들 조회
    const existingDoctors = await prisma.users.findMany({
      where: { role: 'DOCTOR' }
    })

    if (existingDoctors.length > 0) {
      return NextResponse.json({
        message: 'Doctors already exist. Skipping clinic creation.',
        existing: existingDoctors.length
      })
    }

    // 의원 더미 사용자 데이터 생성
    const clinicData = [
      {
        email: 'seoul.family.clinic@example.com',
        name: '서울 가정의학과의원',
        role: 'DOCTOR' as const,
        phoneNumber: '02-1234-5678',
        address: '서울특별시 강남구 테헤란로 123',
        specialization: '가정의학과',
        experience: 15,
        rating: 4.8
      },
      {
        email: 'busan.internal.clinic@example.com',
        name: '부산 내과클리닉',
        role: 'DOCTOR' as const,
        phoneNumber: '051-2345-6789',
        address: '부산광역시 해운대구 센텀로 456',
        specialization: '내과',
        experience: 12,
        rating: 4.6
      },
      {
        email: 'daegu.ortho.clinic@example.com',
        name: '대구 정형외과의원',
        role: 'DOCTOR' as const,
        phoneNumber: '053-3456-7890',
        address: '대구광역시 중구 중앙대로 789',
        specialization: '정형외과',
        experience: 20,
        rating: 4.9
      },
      {
        email: 'incheon.pediatric.clinic@example.com',
        name: '인천 소아과클리닉',
        role: 'DOCTOR' as const,
        phoneNumber: '032-4567-8901',
        address: '인천광역시 연수구 컨벤시아대로 321',
        specialization: '소아과',
        experience: 8,
        rating: 4.7
      },
      {
        email: 'gwangju.derma.clinic@example.com',
        name: '광주 피부과의원',
        role: 'DOCTOR' as const,
        phoneNumber: '062-5678-9012',
        address: '광주광역시 서구 상무대로 654',
        specialization: '피부과',
        experience: 10,
        rating: 4.5
      }
    ]

    // 의원 사용자 생성
    const createdDoctors = []
    for (const clinic of clinicData) {
      const doctor = await prisma.users.create({
        data: {
          ...clinic,
          id: `doctor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          password: 'hashed_password', // 실제로는 해시된 비밀번호를 사용해야 함
          updatedAt: new Date()
        }
      })
      createdDoctors.push(doctor)
      console.log(`Created doctor: ${doctor.name}`)
    }

    // 진료과목 조회 또는 생성
    const departments = ['가정의학과', '내과', '정형외과', '소아과', '피부과']
    const departmentRecords = []

    for (const deptName of departments) {
      let department = await prisma.departments.findFirst({
        where: { name: deptName }
      })

      if (!department) {
        department = await prisma.departments.create({
          data: {
            id: `dept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: deptName,
            description: `${deptName} 전문 진료`,
            consultationType: Math.random() > 0.3 ? 'BOTH' : 'OFFLINE' // 70% 확률로 온라인 진료 가능
          }
        })
        console.log(`Created department: ${department.name}`)
      }
      departmentRecords.push(department)
    }

    // 각 의원의 진료과목 연결 및 진료비 설정
    for (let i = 0; i < createdDoctors.length; i++) {
      const doctor = createdDoctors[i]
      const department = departmentRecords[i]

      // 오프라인 진료비 설정
      await prisma.clinic_fees.create({
        data: {
          id: `fee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          doctorId: doctor.id,
          departmentId: department.id,
          consultationType: 'OFFLINE',
          basePrice: 15000 + Math.floor(Math.random() * 20000), // 15,000 ~ 35,000원
          emergencyPrice: 25000 + Math.floor(Math.random() * 15000), // 25,000 ~ 40,000원
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      // 온라인 진료가 가능한 경우 온라인 진료비도 설정
      if (department.consultationType === 'BOTH') {
        await prisma.clinic_fees.create({
          data: {
            id: `fee_online_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            doctorId: doctor.id,
            departmentId: department.id,
            consultationType: 'ONLINE',
            basePrice: 10000 + Math.floor(Math.random() * 15000), // 10,000 ~ 25,000원 (오프라인보다 저렴)
            emergencyPrice: 20000 + Math.floor(Math.random() * 10000), // 20,000 ~ 30,000원
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      }

      console.log(`Set up fees for ${doctor.name} - ${department.name}`)
    }

    // 진료비 데이터 확인
    const fees = await prisma.clinic_fees.findMany({
      include: {
        users: { select: { name: true } },
        departments: { select: { name: true } }
      }
    })

    return NextResponse.json({
      message: 'Clinic dummy data created successfully!',
      doctors: createdDoctors.length,
      departments: departmentRecords.length,
      fees: fees.length,
      feeDetails: fees.map((fee: any) => ({
        clinic: fee.users.name,
        department: fee.departments.name,
        type: fee.consultationType,
        price: fee.basePrice
      }))
    })

  } catch (error) {
    console.error('Error creating clinic dummy data:', error)
    return NextResponse.json(
      { error: 'Failed to create clinic dummy data' },
      { status: 500 }
    )
  }
}