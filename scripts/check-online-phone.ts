import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOnlinePhone() {
  try {
    // 가장 최근 ONLINE 타입 예약 조회
    const onlineAppointment = await prisma.appointments.findFirst({
      where: {
        type: 'ONLINE'
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        notes: true,
        type: true,
        createdAt: true,
        appointmentDate: true
      }
    });

    console.log('✅ 최근 ONLINE 예약:');
    console.log(JSON.stringify(onlineAppointment, null, 2));

    if (onlineAppointment?.notes) {
      console.log('\n📋 Notes 분석:');
      console.log('- 전체 notes:', onlineAppointment.notes);
      console.log('- includes("전화 진료"):', onlineAppointment.notes.includes('전화 진료'));
      console.log('- includes("화상 진료"):', onlineAppointment.notes.includes('화상 진료'));
      console.log('- includes("비대면 진료"):', onlineAppointment.notes.includes('비대면 진료'));
    }
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOnlinePhone();
