import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNotes() {
  try {
    const appointment = await prisma.appointments.findFirst({
      where: { type: 'ONLINE' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, notes: true, type: true, createdAt: true }
    });

    console.log('최근 ONLINE 예약:');
    console.log(JSON.stringify(appointment, null, 2));
    console.log('\nnotes 내용:');
    console.log(appointment?.notes);
    console.log('\n전화 진료 포함 여부:', appointment?.notes?.includes('전화 진료'));
    console.log('화상 진료 포함 여부:', appointment?.notes?.includes('화상 진료'));
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotes();
