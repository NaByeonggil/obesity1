import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAllDoctorFields() {
  try {
    const doctors = await prisma.users.findMany({
      where: { role: 'DOCTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        clinic: true,
        specialization: true,
        phone: true,
        avatar: true,
        address: true,
        hasOfflineConsultation: true,
        hasOnlineConsultation: true,
        role: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    })

    console.log('의사 상세 정보 (총 ' + doctors.length + '명):')
    console.log('='.repeat(100))

    doctors.forEach((doctor: any, index: number) => {
      console.log(`\n[${index + 1}] ${doctor.name}`)
      console.log('  ID:', doctor.id)
      console.log('  이메일:', doctor.email || '없음')
      console.log('  의원명:', doctor.clinic || '없음')
      console.log('  전문과목:', doctor.specialization || '없음')
      console.log('  전화번호:', doctor.phone || '없음')
      console.log('  주소:', doctor.address || '없음')
      console.log('  아바타:', doctor.avatar || '없음')
      console.log('  대면진료:', doctor.hasOfflineConsultation ? 'O' : 'X')
      console.log('  비대면진료:', doctor.hasOnlineConsultation ? 'O' : 'X')
      console.log('  등록일:', doctor.createdAt)
    })

    console.log('\n' + '='.repeat(100))
    console.log('필드별 데이터 유무 통계:')
    const stats = {
      email: doctors.filter(d => d.email).length,
      clinic: doctors.filter(d => d.clinic).length,
      specialization: doctors.filter(d => d.specialization).length,
      phone: doctors.filter(d => d.phone).length,
      address: doctors.filter(d => d.address).length,
      avatar: doctors.filter(d => d.avatar).length,
      hasOfflineConsultation: doctors.filter(d => d.hasOfflineConsultation).length,
      hasOnlineConsultation: doctors.filter(d => d.hasOnlineConsultation).length
    }

    console.log(`  이메일: ${stats.email}/${doctors.length}`)
    console.log(`  의원명: ${stats.clinic}/${doctors.length}`)
    console.log(`  전문과목: ${stats.specialization}/${doctors.length}`)
    console.log(`  전화번호: ${stats.phone}/${doctors.length}`)
    console.log(`  주소: ${stats.address}/${doctors.length}`)
    console.log(`  아바타: ${stats.avatar}/${doctors.length}`)
    console.log(`  대면진료: ${stats.hasOfflineConsultation}/${doctors.length}`)
    console.log(`  비대면진료: ${stats.hasOnlineConsultation}/${doctors.length}`)

  } catch (error) {
    console.error('오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAllDoctorFields()
