import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

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

/**
 * JWT 토큰에서 사용자 정보 추출
 */
function getUserFromToken(request: NextRequest): { userId: string; email: string; role: string } | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'your-secret-key') as any

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }
  } catch (error) {
    console.error('JWT 토큰 검증 실패:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions)

    // JWT 토큰 확인 (Flutter 앱용)
    const tokenUser = getUserFromToken(request)

    const user = session?.user || tokenUser

    if (!user) {
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 }),
        request
      )
    }

    const userId = session?.user?.id || tokenUser?.userId
    const userRole = session?.user?.role || tokenUser?.role

    if (userRole?.toLowerCase() !== 'patient') {
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '환자만 접근 가능합니다' }, { status: 403 }),
        request
      )
    }

    console.log('[API] 환자 ID:', userId, '예약 조회 시작')

    // 환자의 예약 목록 조회
    const appointments = await prisma.appointments.findMany({
      where: {
        patientId: userId
      },
      include: {
        users_appointments_doctorIdTousers: {
          select: {
            id: true,
            name: true,
            specialization: true,
            clinic: true,
            avatar: true
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
      orderBy: [
        {
          createdAt: 'desc'  // 최신 예약 우선
        },
        {
          appointmentDate: 'desc'
        }
      ]
    })

    console.log('[API] 조회된 예약 수:', appointments.length)

    // 프론트엔드가 기대하는 형식으로 변환
    const formattedAppointments = appointments.map((appointment: any) => ({
      ...appointment,
      type: appointment.type,
      notes: appointment.notes,
      users_appointments_doctorIdTousers: appointment.users_appointments_doctorIdTousers,
      departments: appointment.departments,
      prescriptions: appointment.prescriptions
    }))

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        appointments: formattedAppointments
      }),
      request
    )

  } catch (error) {
    console.error('예약 조회 오류:', error)
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: '예약 조회에 실패했습니다' },
        { status: 500 }
      ),
      request
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // NextAuth 세션 확인
    const session = await getServerSession(authOptions)

    // JWT 토큰 확인 (Flutter 앱용)
    const tokenUser = getUserFromToken(request)

    const user = session?.user || tokenUser

    if (!user) {
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '로그인이 필요합니다' }, { status: 401 }),
        request
      )
    }

    const userId = session?.user?.id || tokenUser?.userId
    const userRole = session?.user?.role || tokenUser?.role

    if (userRole?.toLowerCase() !== 'patient') {
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '환자만 접근 가능합니다' }, { status: 403 }),
        request
      )
    }

    const body = await request.json()
    const { doctorId, date, time, type, symptoms, department, notes } = body

    console.log('[예약 생성] 요청 데이터:', {
      doctorId,
      date,
      time,
      type,
      symptoms,
      department,
      notes,
      patientId: userId
    })

    // Validation
    if (!userId) {
      console.error('❌ [예약 생성 실패] 사용자 ID 없음')
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '사용자 ID를 확인할 수 없습니다' }, { status: 400 }),
        request
      )
    }

    if (!doctorId) {
      console.error('❌ [예약 생성 실패] 의사 ID 없음')
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '의사를 선택해주세요' }, { status: 400 }),
        request
      )
    }

    if (!date || !time) {
      console.error('❌ [예약 생성 실패] 날짜/시간 없음:', { date, time })
      return addCorsHeaders(
        NextResponse.json({ success: false, error: '날짜와 시간을 선택해주세요' }, { status: 400 }),
        request
      )
    }

    // 의사 정보 확인
    const doctor = await prisma.users.findUnique({
      where: { id: doctorId },
      select: { id: true, name: true, clinic: true, specialization: true }
    })

    if (!doctor) {
      return addCorsHeaders(
        NextResponse.json(
          { success: false, error: '선택한 의사를 찾을 수 없습니다' },
          { status: 400 }
        ),
        request
      )
    }

    // Combine date and time into a DateTime object
    const appointmentDateTime = new Date(`${date}T${time}:00.000Z`)

    // Get department ID
    let departmentId = 'dept-internal-001'

    // 예약 생성
    const appointmentType = (type === 'telehealth' || type === 'online') ? 'ONLINE' : 'OFFLINE'

    const appointment = await prisma.appointments.create({
      data: {
        id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        patientId: userId,
        doctorId: doctorId,
        departmentId: departmentId,
        appointmentDate: appointmentDateTime,
        type: appointmentType,
        symptoms: symptoms || '',
        notes: notes || '',
        status: 'PENDING',
        updatedAt: new Date()
      }
    })

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        appointment: {
          id: appointment.id,
          date: date,
          time: time,
          type: appointment.type,
          status: appointment.status,
          appointmentDate: appointment.appointmentDate
        }
      }),
      request
    )

  } catch (error) {
    console.error('예약 생성 오류:', error)
    return addCorsHeaders(
      NextResponse.json(
        { success: false, error: '예약 생성에 실패했습니다' },
        { status: 500 }
      ),
      request
    )
  }
}
