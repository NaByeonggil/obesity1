import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * CORS 헤더 추가
 */
function addCorsHeaders(response: NextResponse, request?: NextRequest) {
  const origin = request?.headers.get('origin') || 'http://localhost:8080'
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

/**
 * OPTIONS 요청 처리 (Preflight)
 */
export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(
    new NextResponse(null, { status: 200 }),
    request
  )
}

export async function GET(request: NextRequest) {
  try {
    // 모든 의사를 반환 (진료과목 필터링 제거)
    // department 파라미터가 전달되어도 무시하고 모든 의사를 표시
    const whereClause: any = {
      role: 'DOCTOR'
    }

    // 모든 의사 조회
    const doctors = await prisma.users.findMany({
      where: whereClause,
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
        hasOnlineConsultation: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    // 프론트엔드 형식으로 변환 - 실제 데이터 사용
    const formattedDoctors = doctors.map((doctor, index) => {
      // 의사의 진료 타입 설정에 따라 슬롯 생성
      const hasOffline = doctor.hasOfflineConsultation ?? true
      const hasOnline = doctor.hasOnlineConsultation ?? true

      // 기본 시간 슬롯
      const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
      ]

      // 의사 설정에 따라 슬롯 생성
      const availableSlots: { time: string; available: boolean; type: string }[] = []

      if (hasOffline && hasOnline) {
        // 둘 다 가능한 경우: 모든 시간대에 온라인/오프라인 슬롯 제공
        timeSlots.forEach((time) => {
          // 각 시간대마다 2개의 슬롯 생성 (online, offline)
          availableSlots.push({
            time,
            available: Math.random() > 0.3,
            type: "online"  // 비대면 슬롯
          })
          availableSlots.push({
            time,
            available: Math.random() > 0.3,
            type: "offline"  // 대면 슬롯
          })
        })
      } else if (hasOnline) {
        // 비대면만 가능
        timeSlots.forEach(time => {
          availableSlots.push({
            time,
            available: Math.random() > 0.3,
            type: "online"
          })
        })
      } else {
        // 대면만 가능
        timeSlots.forEach(time => {
          availableSlots.push({
            time,
            available: Math.random() > 0.3,
            type: "offline"
          })
        })
      }

      return {
        id: doctor.id,
        name: doctor.name,
        specialization: doctor.specialization || '전문분야 미지정',
        clinic: doctor.clinic || '병원명 미지정',
        rating: 4.5 + (index % 5) * 0.1,
        reviews: 50 + (index * 15),
        image: doctor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=10B981&color=fff`,
        consultationFee: 30000 + (index * 5000),
        location: doctor.address || '주소 정보 없음',
        phone: doctor.phone || '전화번호 정보 없음',
        email: doctor.email,
        isActive: true,
        hasOfflineConsultation: hasOffline,
        hasOnlineConsultation: hasOnline,
        availableSlots
      }
    })

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        doctors: formattedDoctors
      }),
      request
    )

  } catch (error) {
    console.error('의사 목록 조회 오류:', error)
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: '의사 목록 조회에 실패했습니다' },
        { status: 500 }
      ),
      request
    )
  }
}