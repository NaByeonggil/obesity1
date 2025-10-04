import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDoctorConnection() {
  try {
    console.log('=== 젤라의원과 서울비만클리닉 연관성 확인 ===\n')

    // 1. 모든 의사 정보 조회
    const doctors = await prisma.users.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        clinic: true,
        specialization: true,
        email: true,
        phone: true
      },
      orderBy: { name: 'asc' }
    })

    console.log('📋 전체 의사 목록:')
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ID: ${doctor.id}`)
      console.log(`   이름: ${doctor.name}`)
      console.log(`   클리닉: ${doctor.clinic}`)
      console.log(`   전문분야: ${doctor.specialization}`)
      console.log(`   이메일: ${doctor.email}`)
      console.log(`   전화: ${doctor.phone}`)
      console.log('---')
    })

    // 2. 젤라의원 관련 의사 확인
    const jellaDoctor = doctors.find(d => d.clinic?.includes('젤라'))
    console.log('\n🏥 젤라의원 의사:')
    if (jellaDoctor) {
      console.log(`ID: ${jellaDoctor.id}`)
      console.log(`이름: ${jellaDoctor.name}`)
      console.log(`클리닉: ${jellaDoctor.clinic}`)
    } else {
      console.log('젤라의원 의사가 없습니다.')
    }

    // 3. 서울비만클리닉 관련 의사 확인
    const seoulObesityDoctor = doctors.find(d => d.clinic?.includes('서울비만'))
    console.log('\n🏥 서울비만클리닉 의사:')
    if (seoulObesityDoctor) {
      console.log(`ID: ${seoulObesityDoctor.id}`)
      console.log(`이름: ${seoulObesityDoctor.name}`)
      console.log(`클리닉: ${seoulObesityDoctor.clinic}`)
    } else {
      console.log('서울비만클리닉 의사가 없습니다.')
    }

    // 4. 최근 예약 현황 확인
    console.log('\n📅 최근 예약 현황 (최근 5개):')
    const recentAppointments = await prisma.appointments.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        users_appointments_doctorIdTousers: {
          select: {
            id: true,
            name: true,
            clinic: true,
            specialization: true
          }
        },
        users_appointments_patientIdTousers: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    recentAppointments.forEach((apt, index) => {
      console.log(`${index + 1}. 예약 ID: ${apt.id}`)
      console.log(`   의사 ID: ${apt.doctorId}`)
      console.log(`   의사 이름: ${apt.users_appointments_doctorIdTousers?.name}`)
      console.log(`   클리닉: ${apt.users_appointments_doctorIdTousers?.clinic}`)
      console.log(`   환자 ID: ${apt.patientId}`)
      console.log(`   환자 이름: ${apt.users_appointments_patientIdTousers?.name}`)
      console.log(`   생성일: ${apt.createdAt}`)
      console.log('---')
    })

    // 5. doc_001 ID 확인
    console.log('\n🔍 doc_001 의사 상세 정보:')
    const doc001 = await prisma.users.findUnique({
      where: { id: 'doc_001' },
      select: {
        id: true,
        name: true,
        clinic: true,
        specialization: true,
        email: true,
        phone: true,
        createdAt: true
      }
    })

    if (doc001) {
      console.log('존재함!')
      console.log(`이름: ${doc001.name}`)
      console.log(`클리닉: ${doc001.clinic}`)
      console.log(`전문분야: ${doc001.specialization}`)
      console.log(`이메일: ${doc001.email}`)
      console.log(`생성일: ${doc001.createdAt}`)
    } else {
      console.log('doc_001 의사가 존재하지 않습니다.')
    }

    // 6. 젤라의원 의사 ID 확인
    if (jellaDoctor) {
      console.log(`\n🔍 젤라의원 의사(${jellaDoctor.name}) 상세 정보:`)
      console.log(`ID: ${jellaDoctor.id}`)
      console.log(`이름: ${jellaDoctor.name}`)
      console.log(`클리닉: ${jellaDoctor.clinic}`)

      // 이 의사로 만들어진 예약이 있는지 확인
      const jellaAppointments = await prisma.appointments.findMany({
        where: { doctorId: jellaDoctor.id },
        select: {
          id: true,
          createdAt: true,
          status: true
        },
        orderBy: { createdAt: 'desc' }
      })

      console.log(`젤라의원 의사로 만들어진 예약 수: ${jellaAppointments.length}`)
      if (jellaAppointments.length > 0) {
        console.log('최근 예약들:')
        jellaAppointments.slice(0, 3).forEach((apt, index) => {
          console.log(`  ${index + 1}. ${apt.id} (${apt.status}) - ${apt.createdAt}`)
        })
      }
    }

    // 7. 클리닉명 중복 확인
    console.log('\n🔄 클리닉명별 의사 수:')
    const clinicGroups = doctors.reduce((acc: any, doctor) => {
      const clinic = doctor.clinic || '미지정'
      if (!acc[clinic]) {
        acc[clinic] = []
      }
      acc[clinic].push(doctor)
      return acc
    }, {})

    Object.entries(clinicGroups).forEach(([clinic, doctors]: [string, any]) => {
      console.log(`${clinic}: ${doctors.length}명`)
      doctors.forEach((doc: any) => {
        console.log(`  - ${doc.name} (${doc.id})`)
      })
    })

  } catch (error) {
    console.error('오류 발생:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDoctorConnection()