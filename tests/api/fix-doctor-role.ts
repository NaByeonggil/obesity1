// 젤라의원 의사 역할 대문자로 통일
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixDoctorRole() {
  console.log('=== 의사 역할 대문자 통일 작업 ===\n')

  try {
    // 1. 소문자 doctor 찾기
    console.log('🔍 소문자 "doctor" 역할 검색...')
    const lowercaseDoctors = await prisma.users.findMany({
      where: {
        role: 'doctor'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clinic: true
      }
    })

    console.log(`발견된 소문자 doctor: ${lowercaseDoctors.length}명`)

    if (lowercaseDoctors.length > 0) {
      console.log('\n📋 변경 대상:')
      lowercaseDoctors.forEach((doctor, index) => {
        console.log(`${index + 1}. ${doctor.name} (${doctor.email}) - ${doctor.clinic || 'N/A'}`)
      })

      console.log('\n🔧 대문자로 변경 중...')

      // 2. 대문자로 업데이트
      const updateResult = await prisma.users.updateMany({
        where: {
          role: 'doctor'
        },
        data: {
          role: 'DOCTOR'
        }
      })

      console.log(`✅ ${updateResult.count}명의 역할을 "DOCTOR"로 변경 완료!`)

      // 3. 변경 확인
      console.log('\n📊 변경 후 확인:')
      const updatedDoctors = await prisma.users.findMany({
        where: {
          id: {
            in: lowercaseDoctors.map(d => d.id)
          }
        },
        select: {
          name: true,
          email: true,
          role: true
        }
      })

      updatedDoctors.forEach((doctor) => {
        console.log(`- ${doctor.name}: "${doctor.role}"`)
      })
    } else {
      console.log('✅ 모든 의사가 이미 "DOCTOR" 역할입니다.')
    }

    // 4. 전체 의사 역할 통계
    console.log('\n📊 전체 의사 역할 통계:')
    const allDoctors = await prisma.users.findMany({
      where: {
        OR: [
          { role: 'DOCTOR' },
          { role: 'doctor' },
          { role: 'Doctor' }
        ]
      }
    })

    const stats = {
      DOCTOR: allDoctors.filter(d => d.role === 'DOCTOR').length,
      doctor: allDoctors.filter(d => d.role === 'doctor').length,
      Doctor: allDoctors.filter(d => d.role === 'Doctor').length
    }

    console.log('DOCTOR (대문자):', stats.DOCTOR)
    console.log('doctor (소문자):', stats.doctor)
    console.log('Doctor (첫글자):', stats.Doctor)
    console.log('총 의사 수:', allDoctors.length)

  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 실행 확인
console.log('⚠️  이 스크립트는 DB를 수정합니다.')
console.log('진행하려면 주석을 해제하고 실행하세요.\n')

// 주석 해제하여 실행
fixDoctorRole()