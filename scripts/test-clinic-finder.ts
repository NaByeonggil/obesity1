import fetch from 'node-fetch'

async function testClinicFinder() {
  try {
    console.log('🔍 Patient 의원찾기 페이지 테스트\n')
    console.log('=' .repeat(80))

    // 1. 의사 API 확인
    console.log('📋 1. 의사 API 응답 확인:')
    console.log('-' .repeat(80))

    const doctorsResponse = await fetch('http://localhost:3001/api/doctors')
    const doctorsData: any = await doctorsResponse.json()

    if (doctorsData.success) {
      console.log(`✅ 의사 API 성공! ${doctorsData.doctors.length}개 의사 데이터`)
      doctorsData.doctors.forEach((doctor: any, index: number) => {
        console.log(`${index + 1}. ${doctor.name}`)
        console.log(`   병원: ${doctor.clinic}`)
        console.log(`   주소: ${doctor.location}`)
        console.log(`   전화: ${doctor.phone}`)
        console.log(`   진료비: ${doctor.consultationFee}원`)
      })
    } else {
      console.log('❌ 의사 API 실패:', doctorsData.error)
      console.log('   → 의사 데이터가 없어도 의원찾기 페이지가 정상 작동해야 합니다.')
    }

    // 2. 클리닉 API 확인 (비만치료과)
    console.log('\n📋 2. 클리닉 API 응답 확인 (비만치료과):')
    console.log('-' .repeat(80))

    const clinicsResponse = await fetch('http://localhost:3001/api/clinics?department=obesity-treatment')
    const clinicsData: any = await clinicsResponse.json()

    if (clinicsData.success) {
      console.log(`✅ 클리닉 API 성공! ${clinicsData.clinics.length}개 클리닉`)
      clinicsData.clinics.slice(0, 3).forEach((clinic: any, index: number) => {
        console.log(`${index + 1}. ${clinic.name}`)
        console.log(`   의사: ${clinic.doctorName}`)
        console.log(`   주소: ${clinic.address}`)
        console.log(`   전화: ${clinic.phone}`)
        console.log(`   진료비: ${clinic.consultationFee}원`)
        console.log(`   거리: ${clinic.distance}`)

        // 실제 데이터인지 확인
        if (clinic.address !== '주소 정보 없음' && !clinic.address.includes('가상주소')) {
          console.log(`   ✅ 실제 주소 데이터`)
        } else {
          console.log(`   ⚠️ 모의 주소 데이터`)
        }
      })
    } else {
      console.log('❌ 클리닉 API 실패:', clinicsData.error)
    }

    // 3. 데이터 품질 요약
    console.log('\n📊 3. 의원찾기 페이지 실데이터 반영 현황:')
    console.log('=' .repeat(80))

    if (doctorsData.success && doctorsData.doctors.length > 0) {
      console.log('✅ 의사 데이터베이스: 있음')
      console.log('✅ 실제 의사 정보가 의원찾기에 반영됩니다.')
      console.log('✅ 실제 병원명, 주소, 전화번호가 표시됩니다.')
      console.log('✅ 실제 진료비가 표시됩니다.')
    } else {
      console.log('⚠️ 의사 데이터베이스: 없음')
      console.log('ℹ️ 의사 가입 후 실제 데이터가 반영됩니다.')
      console.log('ℹ️ 현재는 모의 데이터로 페이지가 표시됩니다.')
    }

    console.log('\n💡 사용 방법:')
    console.log('1. http://localhost:3001/patient 접속')
    console.log('2. 원하는 진료과목 선택 (예: 마운자로·위고비)')
    console.log('3. 의원 목록에서 실제 의사 데이터 확인')
    console.log('4. 의사 가입 후 새로고침하면 실제 데이터 반영')

  } catch (error) {
    console.error('❌ 테스트 오류:', error)
  }
}

testClinicFinder()