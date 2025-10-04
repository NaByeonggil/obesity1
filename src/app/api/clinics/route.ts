import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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

// 진료비 조회 함수
function getConsultationFee(doctor: any, department: string | null): { fee: number, isOffline: boolean } {
  const departmentNames: { [key: string]: string } = {
    "obesity-treatment": "마운자로",
    "obesity": "비만",
    "eye-care": "안과",
    "cold": "감기",
    "internal-medicine": "내과",
    "pediatrics": "소아과",
    "dermatology": "피부과",
    "orthopedics": "정형외과",
    "neurosurgery": "신경외과",
    "ent": "이비인후과",
    "obgyn": "산부인과",
    "urology": "비뇨기과",
    "gastroenterology": "소화기내과",
    "proctology": "항문외과",
    "bowel-disorder": "대변"
  }

  const targetDepartmentName = department ? departmentNames[department] : null

  // 비만 관련 과목들은 모두 대면 진료로 처리
  const obesityDepartments = ['obesity-treatment', 'obesity']
  const offlineDepartments = ['obesity-treatment', 'obesity', 'orthopedics', 'neurosurgery', 'dermatology']

  const isOffline = department ? offlineDepartments.includes(department) : false
  const consultationType = isOffline ? 'OFFLINE' : 'ONLINE'

  // 해당 의사의 진료비 찾기
  if (doctor.clinic_fees && doctor.clinic_fees.length > 0) {
    let matchingFee;

    // 비만 관련 과목일 때는 유연한 매칭
    if (department && obesityDepartments.includes(department)) {
      matchingFee = doctor.clinic_fees.find((fee: any) =>
        fee.consultationType === consultationType &&
        fee.isActive &&
        (fee.departments.name.includes("비만") ||
         fee.departments.name.includes("마운자로") ||
         fee.departments.name.includes("체중") ||
         fee.departments.name.includes("다이어트"))
      )
    } else {
      // 다른 과목들은 정확한 매칭
      matchingFee = doctor.clinic_fees.find((fee: any) =>
        (!targetDepartmentName || fee.departments.name.includes(targetDepartmentName)) &&
        fee.consultationType === consultationType &&
        fee.isActive
      )
    }

    if (matchingFee) {
      return { fee: matchingFee.basePrice, isOffline }
    }

    // 정확한 매칭이 없으면 같은 consultationType의 첫 번째 활성 진료비 사용
    const fallbackFee = doctor.clinic_fees.find((fee: any) =>
      fee.consultationType === consultationType && fee.isActive
    )

    if (fallbackFee) {
      return { fee: fallbackFee.basePrice, isOffline }
    }
  }

  // 기본 진료비 (DB에 데이터가 없는 경우)
  const baseFees: { [key: string]: number } = {
    '소화기내과': 25000,
    '항문외과': 30000,
    '내과': 20000,
    '외과': 35000,
    '비만치료 전문의': 40000,
    '내분비내과 전문의': 35000,
    '피부과 전문의': 30000,
    '정형외과 전문의': 35000,
    '이비인후과 전문의': 25000,
    '마운자로': 80000
  }

  const baseFee = baseFees[doctor.specialization || ''] || 20000
  const finalFee = isOffline ? Math.floor(baseFee * 1.2) : baseFee

  return { fee: finalFee, isOffline }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const department = searchParams.get('department')
    const district = searchParams.get('district')
    const userLat = searchParams.get('lat')
    const userLng = searchParams.get('lng')
    const sortBy = searchParams.get('sortBy') || 'auto' // auto, distance, price

    // 의사 정보와 함께 클리닉 정보 조회
    let whereClause: any = {
      role: 'DOCTOR'
    }

    // 진료과목별 필터링
    if (department && department !== 'all') {
      const departmentNames: { [key: string]: string } = {
        "obesity-treatment": "마운자로",
        "obesity": "비만",
        "eye-care": "안과",
        "cold": "감기",
        "internal-medicine": "내과",
        "pediatrics": "소아과",
        "dermatology": "피부과",
        "orthopedics": "정형외과",
        "neurosurgery": "신경외과",
        "ent": "이비인후과",
        "obgyn": "산부인과",
        "urology": "비뇨기과",
        "gastroenterology": "소화기내과",
        "proctology": "항문외과",
        "bowel-disorder": "대변"
      }

      // 비만 관련 과목들은 모두 함께 보여주기
      const obesityDepartments = ['obesity-treatment', 'obesity']

      if (obesityDepartments.includes(department)) {
        // 비만 관련 과목 선택 시 '비만' 또는 '마운자로' 포함된 의원들 모두 표시
        whereClause.OR = [
          { specialization: { contains: "비만" } },
          { specialization: { contains: "마운자로" } },
          { specialization: { contains: "체중" } },
          { specialization: { contains: "다이어트" } }
        ]
      } else {
        const departmentName = departmentNames[department]
        if (departmentName) {
          whereClause.specialization = {
            contains: departmentName
          }
        }
      }
    }

    const doctors = await prisma.users.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        specialization: true,
        clinic: true,
        address: true,
        phone: true,
        avatar: true,
        clinic_fees: {
          include: {
            departments: true
          }
        }
      }
    })

    // 의사 정보를 클리닉 형태로 변환
    const clinics = doctors.map((doctor, index) => {
      // 주소 기반 좌표 매핑 (더 정확한 위치)
      const addressCoords: { [key: string]: { lat: number, lng: number } } = {
        '강남': { lat: 37.5172, lng: 127.0473 },
        '서초': { lat: 37.4837, lng: 127.0324 },
        '송파': { lat: 37.5145, lng: 127.1059 },
        '영등포': { lat: 37.5263, lng: 126.8968 },
        '중구': { lat: 37.5640, lng: 126.9805 },
        '역삼': { lat: 37.5007, lng: 127.0366 },
        '신사': { lat: 37.5203, lng: 127.0230 },
        '청담': { lat: 37.5223, lng: 127.0463 }
      }

      // 주소에서 지역 추출하여 좌표 결정
      let clinicCoord = { lat: 37.5665, lng: 126.9780 } // 기본값: 서울역

      if (doctor.address) {
        for (const [area, coord] of Object.entries(addressCoords)) {
          if (doctor.address.includes(area)) {
            clinicCoord = coord
            break
          }
        }
      }

      // 같은 지역 내에서 약간의 랜덤 오프셋 (더 자연스러운 분포)
      const randomOffset = () => (Math.random() - 0.5) * 0.005
      clinicCoord = {
        lat: clinicCoord.lat + randomOffset(),
        lng: clinicCoord.lng + randomOffset()
      }

      let distance = null
      // 사용자 위치가 있으면 실제 거리 계산, 없으면 기본 위치(서울역)에서 계산
      const defaultLat = userLat ? parseFloat(userLat) : 37.5665
      const defaultLng = userLng ? parseFloat(userLng) : 126.9780

      const R = 6371 // 지구 반지름 (km)
      const dLat = (clinicCoord.lat - defaultLat) * Math.PI / 180
      const dLon = (clinicCoord.lng - defaultLng) * Math.PI / 180
      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(defaultLat * Math.PI / 180) * Math.cos(clinicCoord.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      distance = R * c // 거리 (km)

      // 지역별 필터링
      const clinicDistrict = doctor.address?.includes('강남') ? '강남구' :
                           doctor.address?.includes('서초') ? '서초구' :
                           doctor.address?.includes('송파') ? '송파구' :
                           doctor.address?.includes('영등포') ? '영등포구' : '중구'

      if (district && district !== 'all' && district !== clinicDistrict) {
        return null
      }

      return {
        id: doctor.id,
        name: doctor.clinic || `${doctor.name} 클리닉`,
        doctorName: doctor.name,
        doctorImage: doctor.avatar,
        address: doctor.address || '주소 정보 없음',
        phone: doctor.phone || '전화번호 정보 없음',
        specialization: doctor.specialization || "일반의",
        distance: `${distance.toFixed(1)}km`,
        district: clinicDistrict,
        coordinates: clinicCoord,
        hours: {
          mon_fri: "09:00 - 18:00",
          sat: "09:00 - 13:00",
          sun: "휴진"
        },
        consultationType: getConsultationFee(doctor, department).isOffline ? 'offline' : 'online',
        consultationFee: getConsultationFee(doctor, department).fee
      }
    }).filter(Boolean)

    // 정렬 로직
    if (sortBy === 'price') {
      // 진료비 싼 순으로 정렬
      clinics.sort((a, b) => a.consultationFee - b.consultationFee)
    } else if (sortBy === 'distance') {
      // 거리 가까운 순으로 정렬
      clinics.sort((a, b) => {
        const distA = parseFloat(a.distance.replace('km', ''))
        const distB = parseFloat(b.distance.replace('km', ''))
        return distA - distB
      })
    } else {
      // 자동 정렬 (기존 로직): 진료 타입에 따른 정렬
      const isOnlineConsultation = clinics.length > 0 && clinics[0].consultationType === 'online'

      if (isOnlineConsultation) {
        // 비대면 진료: 진료비 싼 순으로 정렬
        clinics.sort((a, b) => a.consultationFee - b.consultationFee)
      } else {
        // 대면 진료: 거리 가까운 순으로 정렬
        clinics.sort((a, b) => {
          const distA = parseFloat(a.distance.replace('km', ''))
          const distB = parseFloat(b.distance.replace('km', ''))
          return distA - distB
        })
      }
    }

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        clinics: clinics
      }),
      req
    )

  } catch (error) {
    console.error('Clinics API error:', error)
    return addCorsHeaders(
      NextResponse.json(
        { error: "클리닉 정보를 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      ),
      req
    )
  } finally {
    await prisma.$disconnect()
  }
}