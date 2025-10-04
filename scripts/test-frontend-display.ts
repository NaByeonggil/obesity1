import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFrontendDisplay() {
  try {
    // Get the latest ONLINE appointment
    const appointment = await prisma.appointments.findFirst({
      where: { type: 'ONLINE' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        notes: true,
        type: true,
        status: true,
        appointmentDate: true
      }
    });

    if (!appointment) {
      console.log('❌ No ONLINE appointments found');
      return;
    }

    console.log('✅ Latest ONLINE Appointment:');
    console.log('ID:', appointment.id);
    console.log('Type:', appointment.type);
    console.log('Status:', appointment.status);
    console.log('Notes:', appointment.notes);
    console.log('\n📋 Frontend Display Logic Test:');

    // Simulate the frontend logic
    const isPhoneConsultation = appointment.notes?.includes('전화 진료');
    console.log('- includes("전화 진료"):', isPhoneConsultation);
    console.log('- includes("화상 진료"):', appointment.notes?.includes('화상 진료'));

    if (appointment.type === 'ONLINE') {
      if (isPhoneConsultation) {
        console.log('\n✅ Frontend should display: 📞 전화진료 대기 / 진료 대기 중');
      } else {
        console.log('\n✅ Frontend should display: 📹 화상진료 입장 / 진료 대기 중');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFrontendDisplay();
