// 의사 김 계정 예약 내용 점검
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDoctorKimAppointments() {
  console.log('=== 의사 김 계정 예약 내용 점검 ===\n')

  try {
    // 1. 의사 김 계정 확인
    console.log('👨‍⚕️ 의사 김 계정 조회...')
    const doctorKim = await prisma.users.findFirst({
      where: {
        OR: [
          { email: 'kim@naver.com' },
          { name: { contains: '김' } },
          { role: 'DOCTOR' }
        ]
      }
    })

    if (!doctorKim) {
      console.log('❌ 의사 김 계정을 찾을 수 없습니다.')

      // 모든 의사 계정 조회
      console.log('\n📋 등록된 의사 계정 목록:')
      const allDoctors = await prisma.users.findMany({
        where: { role: 'DOCTOR' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      })

      if (allDoctors.length === 0) {
        console.log('등록된 의사 계정이 없습니다.')
      } else {
        allDoctors.forEach((doctor, index) => {
          console.log(`${index + 1}. 이름: ${doctor.name}`)
          console.log(`   이메일: ${doctor.email}`)
          console.log(`   ID: ${doctor.id}`)
          console.log(`   가입일: ${doctor.createdAt}`)
          console.log('')
        })
      }
      return
    }

    console.log('✅ 의사 김 계정 정보:')
    console.log(`이름: ${doctorKim.name}`)
    console.log(`이메일: ${doctorKim.email}`)
    console.log(`ID: ${doctorKim.id}`)
    console.log(`역할: ${doctorKim.role}`)

    // 2. 해당 의사의 예약 목록 조회
    console.log('\n📅 예약 목록 조회...')
    const appointments = await prisma.appointments.findMany({
      where: {
        doctorId: doctorKim.id
      },
      include: {
        users_appointments_patientIdTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        departments: {
          select: {
            id: true,
            name: true,
            consultationType: true
          }
        },
        prescriptions: {
          select: {
            id: true,
            prescriptionNumber: true,
            status: true,
            issuedAt: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    })

    console.log(`총 예약 수: ${appointments.length}개\n`)

    if (appointments.length === 0) {
      console.log('❌ 의사 김에게 예약된 환자가 없습니다.')

      // 전체 예약 현황 확인
      console.log('\n📊 전체 예약 현황 확인...')
      const allAppointments = await prisma.appointments.findMany({
        include: {
          users_appointments_doctorIdTousers: {
            select: { name: true, email: true }
          },
          users_appointments_patientIdTousers: {
            select: { name: true, email: true }
          }
        }
      })

      console.log(`전체 예약 수: ${allAppointments.length}개`)

      if (allAppointments.length > 0) {
        console.log('\n전체 예약 목록:')
        allAppointments.forEach((apt, index) => {
          console.log(`${index + 1}. 의사: ${apt.users_appointments_doctorIdTousers?.name || 'Unknown'} (${apt.users_appointments_doctorIdTousers?.email || apt.doctorId})`)
          console.log(`   환자: ${apt.users_appointments_patientIdTousers?.name || 'Unknown'} (${apt.users_appointments_patientIdTousers?.email || apt.patientId})`)
          console.log(`   날짜: ${apt.appointmentDate}`)
          console.log(`   상태: ${apt.status}`)
          console.log(`   유형: ${apt.type}`)
          console.log('')
        })
      }
    } else {
      // 예약 상세 정보 출력
      console.log('📋 예약 상세 내용:')
      appointments.forEach((appointment, index) => {
        console.log(`\n${index + 1}. 예약 ID: ${appointment.id}`)
        console.log(`   환자: ${appointment.users_appointments_patientIdTousers?.name || '환자 정보 없음'}`)
        console.log(`   환자 이메일: ${appointment.users_appointments_patientIdTousers?.email || 'N/A'}`)
        console.log(`   환자 전화: ${appointment.users_appointments_patientIdTousers?.phone || 'N/A'}`)
        console.log(`   예약 날짜: ${appointment.appointmentDate}`)
        console.log(`   예약 유형: ${appointment.type === 'ONLINE' ? '화상진료' : '방문진료'}`)
        console.log(`   상태: ${appointment.status}`)
        console.log(`   진료과: ${appointment.departments?.name || 'N/A'}`)
        console.log(`   증상: ${appointment.symptoms || 'N/A'}`)
        console.log(`   메모: ${appointment.notes || 'N/A'}`)

        if (appointment.prescriptions && Array.isArray(appointment.prescriptions) && appointment.prescriptions.length > 0) {
          console.log(`   처방전: ${appointment.prescriptions.length}개`)
          appointment.prescriptions.forEach((prescription: any, pIndex: number) => {
            console.log(`     ${pIndex + 1}. 처방번호: ${prescription.prescriptionNumber}`)
            console.log(`        상태: ${prescription.status}`)
            console.log(`        발행일: ${prescription.issuedAt}`)
          })
        } else {
          console.log(`   처방전: 없음`)
        }

        console.log(`   생성일: ${appointment.createdAt}`)
        console.log(`   수정일: ${appointment.updatedAt}`)
      })

      // 통계 정보
      console.log('\n📊 예약 통계:')
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate)
        return aptDate >= today && aptDate < tomorrow
      })

      const pendingCount = appointments.filter(apt => apt.status === 'PENDING').length
      const confirmedCount = appointments.filter(apt => apt.status === 'CONFIRMED').length
      const completedCount = appointments.filter(apt => apt.status === 'COMPLETED').length
      const cancelledCount = appointments.filter(apt => apt.status === 'CANCELLED').length
      const onlineCount = appointments.filter(apt => apt.type === 'ONLINE').length
      const offlineCount = appointments.filter(apt => apt.type === 'OFFLINE').length

      console.log(`오늘 예약: ${todayAppointments.length}개`)
      console.log(`대기 중: ${pendingCount}개`)
      console.log(`확정: ${confirmedCount}개`)
      console.log(`완료: ${completedCount}개`)
      console.log(`취소: ${cancelledCount}개`)
      console.log(`화상진료: ${onlineCount}개`)
      console.log(`방문진료: ${offlineCount}개`)
    }

  } catch (error) {
    console.error('❌ 예약 점검 중 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDoctorKimAppointments()