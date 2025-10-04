import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDoctorSpecialization() {
  try {
    console.log('🔍 의사 전문분야 확인\n')
    console.log('=' .repeat(80))

    // 모든 의사 확인
    const doctors = await prisma.users.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        clinic: true,
        specialization: true,
        address: true,
        phone: true
      }
    })

    console.log(`총 의사 수: ${doctors.length}명\n`)

    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name}`)
      console.log(`   이메일: ${doctor.email}`)
      console.log(`   병원: ${doctor.clinic}`)
      console.log(`   전문분야: "${doctor.specialization}"`)
      console.log(`   주소: ${doctor.address || '없음'}`)
      console.log(`   전화: ${doctor.phone || '없음'}`)
      console.log()
    })

    // 비만 관련 전문분야 필터링 테스트
    console.log('📋 비만치료과 필터링 테스트:')
    console.log('-' .repeat(80))

    const obesityDoctors = doctors.filter(d =>
      d.specialization?.includes('비만') ||
      d.specialization?.includes('마운자로') ||
      d.specialization?.includes('체중') ||
      d.specialization?.includes('다이어트')
    )

    console.log(`비만 관련 의사: ${obesityDoctors.length}명`)
    obesityDoctors.forEach(d => {
      console.log(`- ${d.name}: "${d.specialization}"`)
    })

    // 내과 필터링 테스트
    const internalDoctors = doctors.filter(d =>
      d.specialization?.includes('내과')
    )

    console.log(`\n내과 의사: ${internalDoctors.length}명`)
    internalDoctors.forEach(d => {
      console.log(`- ${d.name}: "${d.specialization}"`)
    })

    // 전체 의사 (모든 과목)
    console.log(`\n전체 의사 (모든 과목): ${doctors.length}명`)

    console.log('\n💡 클리닉 API 테스트 URL:')
    console.log('- 비만치료: http://localhost:3000/api/clinics?department=obesity-treatment')
    console.log('- 비만관리: http://localhost:3000/api/clinics?department=obesity')
    console.log('- 내과: http://localhost:3000/api/clinics?department=internal-medicine')
    console.log('- 전체: http://localhost:3000/api/clinics?department=all')

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDoctorSpecialization()