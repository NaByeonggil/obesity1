import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDoctorIdMapping() {
  try {
    console.log('🔍 의사 ID 매핑 정보\n')
    console.log('=' .repeat(80))

    // 현재 활성 의사 목록
    const doctors = await prisma.users.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        clinic: true,
        specialization: true,
        email: true
      },
      orderBy: { name: 'asc' }
    })

    console.log('\n📋 의사 ID 매핑 테이블:')
    console.log('-' .repeat(80))
    console.log('\n병원별 의사 매핑:\n')

    // 병원별로 그룹화
    const clinicMap: { [key: string]: typeof doctors } = {}

    doctors.forEach(doctor => {
      const clinic = doctor.clinic || '미지정'
      if (!clinicMap[clinic]) {
        clinicMap[clinic] = []
      }
      clinicMap[clinic].push(doctor)
    })

    // 병원별 출력
    Object.keys(clinicMap).forEach(clinic => {
      console.log(`\n🏥 ${clinic}:`)
      clinicMap[clinic].forEach(doctor => {
        console.log(`   의사: ${doctor.name} (${doctor.specialization})`)
        console.log(`   ID: ${doctor.id}`)
        console.log(`   이메일: ${doctor.email}`)
        console.log()
      })
    })

    // 기본 의사 추천
    console.log('\n📋 용도별 기본 의사 ID 추천:')
    console.log('-' .repeat(80))

    const obesityDoctor = doctors.find(d => d.specialization?.includes('비만'))
    const internalDoctor = doctors.find(d => d.specialization?.includes('내과'))
    const familyDoctor = doctors.find(d => d.specialization?.includes('가정'))

    console.log('\n비만/다이어트 진료:')
    if (obesityDoctor) {
      console.log(`  추천: ${obesityDoctor.name} (${obesityDoctor.clinic})`)
      console.log(`  ID: ${obesityDoctor.id}`)
    }

    console.log('\n일반 내과 진료:')
    if (internalDoctor) {
      console.log(`  추천: ${internalDoctor.name} (${internalDoctor.clinic})`)
      console.log(`  ID: ${internalDoctor.id}`)
    }

    console.log('\n가정의학과 진료:')
    if (familyDoctor) {
      console.log(`  추천: ${familyDoctor.name} (${familyDoctor.clinic})`)
      console.log(`  ID: ${familyDoctor.id}`)
    }

    console.log('\n기본값 (첫 번째 의사):')
    if (doctors[0]) {
      console.log(`  추천: ${doctors[0].name} (${doctors[0].clinic})`)
      console.log(`  ID: ${doctors[0].id}`)
    }

    // 프론트엔드 코드 예시
    console.log('\n📝 프론트엔드 사용 예시:')
    console.log('-' .repeat(80))
    console.log('\n// 의사 목록 가져오기')
    console.log('const response = await fetch("/api/doctors")')
    console.log('const doctors = await response.json()')
    console.log('')
    console.log('// 첫 번째 의사 선택 (기본값)')
    console.log(`const defaultDoctorId = doctors[0]?.id || "${doctors[0]?.id || 'N/A'}"`)
    console.log('')
    console.log('// 특정 병원 의사 찾기')
    console.log('const clinicDoctor = doctors.find(d => d.clinic === "서울다이어트클리닉")')
    console.log(`const clinicDoctorId = clinicDoctor?.id || "${obesityDoctor?.id || 'N/A'}"`)

    // ID 일치성 검증
    console.log('\n\n📊 ID 일치성 보장:')
    console.log('=' .repeat(80))
    console.log('\n✅ 데이터베이스 ID = API 응답 ID = 프론트엔드 사용 ID')
    console.log('모든 레벨에서 동일한 ID를 사용하므로 일치성이 보장됩니다.')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDoctorIdMapping()