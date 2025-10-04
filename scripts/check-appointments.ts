#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAppointments() {
  try {
    console.log('🔍 최근 예약 데이터 확인\n')

    const appointments = await prisma.appointments.findMany({
      include: {
        users_appointments_doctorIdTousers: {
          select: { id: true, name: true, clinic: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    console.log(`📋 최근 ${appointments.length}개 예약 데이터:`)
    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. 예약 ID: ${apt.id}`)
      console.log(`   의사 ID: ${apt.doctorId}`)
      console.log(`   의사 이름: ${apt.users_appointments_doctorIdTousers?.name || '정보없음'}`)
      console.log(`   병원: ${apt.users_appointments_doctorIdTousers?.clinic || '정보없음'}`)
      console.log(`   생성일: ${apt.createdAt}`)
      console.log()
    })

    // 젤라의원 예약 특별 확인
    console.log('🏥 젤라의원 예약 확인:')
    const jellaAppointments = await prisma.appointments.findMany({
      where: {
        users_appointments_doctorIdTousers: {
          clinic: '젤라의원'
        }
      },
      include: {
        users_appointments_doctorIdTousers: {
          select: { id: true, name: true, clinic: true }
        }
      }
    })

    console.log(`젤라의원 예약 총 ${jellaAppointments.length}개:`)
    jellaAppointments.forEach((apt, index) => {
      console.log(`${index + 1}. 의사ID: ${apt.doctorId}, 의사명: ${apt.users_appointments_doctorIdTousers?.name}, 병원: ${apt.users_appointments_doctorIdTousers?.clinic}`)
    })

    // 특정 의사 ID로 예약 확인
    console.log('\n🎯 김병만 의사 ID로 예약 확인:')
    const kimAppointments = await prisma.appointments.findMany({
      where: {
        doctorId: 'user-1758725864737-25c92gi9m'
      },
      include: {
        users_appointments_doctorIdTousers: {
          select: { id: true, name: true, clinic: true }
        }
      }
    })

    console.log(`김병만 의사(user-1758725864737-25c92gi9m) 예약 총 ${kimAppointments.length}개:`)
    kimAppointments.forEach((apt, index) => {
      console.log(`${index + 1}. 예약ID: ${apt.id}, 병원: ${apt.users_appointments_doctorIdTousers?.clinic}, 생성일: ${apt.createdAt}`)
    })

  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAppointments()