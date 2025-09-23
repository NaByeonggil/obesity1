import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addClinicFeesData() {
  try {
    console.log('진료비 데이터 추가 시작...')

    // 기존 진료비 데이터 삭제
    await prisma.clinic_fees.deleteMany()

    // 모든 의사 조회
    const doctors = await prisma.users.findMany({
      where: { role: 'DOCTOR' },
      select: { id: true, specialization: true }
    })

    // 모든 진료과목 조회
    const departments = await prisma.departments.findMany()

    const clinicFeesData = []

    for (const doctor of doctors) {
      for (const department of departments) {
        // 의사의 전문과목과 진료과목 매칭
        const isSpecialist = doctor.specialization?.includes(department.name.replace('과', ''))

        // 기본 진료비 설정
        const baseFees: { [key: string]: number } = {
          '소화기내과': 25000,
          '항문외과': 30000,
          '내과': 20000,
          '외과': 35000,
          '비만치료': 40000,
          '내분비내과': 35000,
          '피부과': 30000,
          '정형외과': 35000,
          '이비인후과': 25000,
          '마운자로': 80000,
          '안과': 28000,
          '산부인과': 35000,
          '비뇨기과': 32000,
          '신경외과': 45000,
          '소아과': 22000,
          '정신건강의학과': 30000
        }

        const departmentKey = department.name.replace('과', '').replace(' 전문의', '')
        let basePrice = baseFees[departmentKey] || 20000

        // 전문의인 경우 10% 추가
        if (isSpecialist) {
          basePrice = Math.floor(basePrice * 1.1)
        }

        // 랜덤 변동 ±3000원
        const variation = Math.floor(Math.random() * 6000) - 3000
        basePrice = Math.max(15000, basePrice + variation)

        // 온라인/오프라인 진료비 설정
        const consultationTypes = ['ONLINE', 'OFFLINE']

        for (const consultationType of consultationTypes) {
          let finalPrice = basePrice

          // 오프라인 진료는 20% 추가
          if (consultationType === 'OFFLINE') {
            finalPrice = Math.floor(basePrice * 1.2)
          }

          // 응급 진료비는 50% 추가
          const emergencyPrice = Math.floor(finalPrice * 1.5)

          clinicFeesData.push({
            id: `fee_${doctor.id}_${department.id}_${consultationType}`,
            doctorId: doctor.id,
            departmentId: department.id,
            consultationType,
            basePrice: finalPrice,
            emergencyPrice,
            description: `${department.name} ${consultationType === 'ONLINE' ? '비대면' : '대면'} 진료`,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }
    }

    // 배치로 데이터 삽입
    const batchSize = 100
    for (let i = 0; i < clinicFeesData.length; i += batchSize) {
      const batch = clinicFeesData.slice(i, i + batchSize)
      await prisma.clinic_fees.createMany({
        data: batch,
        skipDuplicates: true
      })
      console.log(`진료비 데이터 ${i + batch.length}/${clinicFeesData.length} 추가 완료`)
    }

    console.log(`총 ${clinicFeesData.length}개의 진료비 데이터가 추가되었습니다.`)

    // 데이터 확인
    const count = await prisma.clinic_fees.count()
    console.log(`데이터베이스에 ${count}개의 진료비 레코드가 있습니다.`)

    // 샘플 데이터 조회
    const sampleFees = await prisma.clinic_fees.findMany({
      take: 5,
      include: {
        users: { select: { name: true, specialization: true } },
        departments: { select: { name: true } }
      }
    })

    console.log('샘플 진료비 데이터:')
    sampleFees.forEach(fee => {
      console.log(`- ${fee.users.name} (${fee.users.specialization}) - ${fee.departments.name}: ${fee.basePrice.toLocaleString()}원 (${fee.consultationType})`)
    })

  } catch (error) {
    console.error('진료비 데이터 추가 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addClinicFeesData()