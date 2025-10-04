// 주남씨(junam670@gmail.com) 예약 데이터 초기화
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearJunamAppointments() {
  console.log('=== 주남씨 예약 데이터 초기화 ===\n')

  try {
    // 1. 주남씨 계정 확인
    console.log('👤 환자 계정 확인...')
    const patient = await prisma.users.findFirst({
      where: {
        email: 'junam670@gmail.com'
      }
    })

    if (!patient) {
      console.log('❌ junam670@gmail.com 계정을 찾을 수 없습니다.')
      return
    }

    console.log('✅ 환자 정보:')
    console.log(`이름: ${patient.name}`)
    console.log(`이메일: ${patient.email}`)
    console.log(`ID: ${patient.id}`)
    console.log(`역할: ${patient.role}`)

    // 2. 기존 예약 조회 (백업용)
    console.log('\n📋 기존 예약 데이터 조회 (백업)...')
    const existingAppointments = await prisma.appointments.findMany({
      where: {
        patientId: patient.id
      },
      include: {
        users_appointments_doctorIdTousers: {
          select: {
            name: true,
            clinic: true
          }
        },
        departments: {
          select: {
            name: true
          }
        }
      }
    })

    console.log(`총 ${existingAppointments.length}개 예약 발견\n`)

    if (existingAppointments.length > 0) {
      console.log('📊 예약 목록 (백업):')
      existingAppointments.forEach((apt, index) => {
        console.log(`${index + 1}. 예약 ID: ${apt.id}`)
        console.log(`   의사: ${apt.users_appointments_doctorIdTousers?.name} (${apt.users_appointments_doctorIdTousers?.clinic})`)
        console.log(`   진료과: ${apt.departments?.name}`)
        console.log(`   날짜: ${apt.appointmentDate}`)
        console.log(`   상태: ${apt.status}`)
        console.log(`   증상: ${apt.symptoms}`)
        console.log('')
      })

      // 3. 예약 데이터 삭제 확인
      console.log('⚠️  경고: 모든 예약 데이터가 삭제됩니다!')
      console.log('삭제할 예약 ID:')
      existingAppointments.forEach(apt => {
        console.log(`- ${apt.id}`)
      })

      // 4. 예약 삭제 실행
      console.log('\n🗑️  예약 데이터 삭제 중...')
      const deleteResult = await prisma.appointments.deleteMany({
        where: {
          patientId: patient.id
        }
      })

      console.log(`✅ ${deleteResult.count}개 예약이 삭제되었습니다.`)

      // 5. 삭제 확인
      console.log('\n📊 삭제 후 확인...')
      const remainingAppointments = await prisma.appointments.count({
        where: {
          patientId: patient.id
        }
      })

      if (remainingAppointments === 0) {
        console.log('✅ 모든 예약이 성공적으로 삭제되었습니다.')
      } else {
        console.log(`⚠️ ${remainingAppointments}개 예약이 여전히 존재합니다.`)
      }

      // 6. 전체 시스템 예약 현황
      console.log('\n📈 전체 시스템 예약 현황:')
      const totalAppointments = await prisma.appointments.count()
      const doctorGroups = await prisma.appointments.groupBy({
        by: ['doctorId'],
        _count: true
      })

      console.log(`전체 예약 수: ${totalAppointments}개`)
      console.log(`의사별 예약 분포:`)

      for (const group of doctorGroups) {
        const doctor = await prisma.users.findUnique({
          where: { id: group.doctorId },
          select: { name: true, clinic: true }
        })
        console.log(`- ${doctor?.name || 'Unknown'} (${doctor?.clinic || 'N/A'}): ${group._count}개`)
      }

    } else {
      console.log('❌ 삭제할 예약이 없습니다.')
    }

    console.log('\n✅ 초기화 작업 완료!')

  } catch (error) {
    console.error('❌ 초기화 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 실행
console.log('주남씨(junam670@gmail.com) 예약 데이터를 초기화합니다.\n')
clearJunamAppointments()