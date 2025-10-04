import fetch from 'node-fetch'

async function testClinicAPI() {
  try {
    console.log('🔍 병원 API 실제 응답 테스트\n')
    console.log('=' .repeat(80))

    // API 호출
    const response = await fetch('http://localhost:3000/api/clinics?department=obesity')
    const data = await response.json()

    if (!data.success) {
      console.log('❌ API 호출 실패:', data.error)
      return
    }

    console.log(`\n✅ API 응답 성공! 병원 수: ${data.clinics.length}개\n`)

    // 각 병원 정보 출력
    console.log('📋 반환된 병원 정보:')
    console.log('-' .repeat(80))

    data.clinics.forEach((clinic: any, index: number) => {
      console.log(`\n${index + 1}. ${clinic.name}`)
      console.log(`   ID: ${clinic.id}`)
      console.log(`   의사명: ${clinic.doctorName}`)
      console.log(`   주소: ${clinic.address}`)
      console.log(`   전화: ${clinic.phone}`)
      console.log(`   전문분야: ${clinic.specialization}`)
      console.log(`   거리: ${clinic.distance}`)
      console.log(`   진료비: ${clinic.consultationFee}원`)
      console.log(`   진료타입: ${clinic.consultationType}`)

      // 주소 데이터 확인
      if (clinic.address && clinic.address !== '주소 정보 없음') {
        console.log(`   ✅ 실제 주소 데이터 표시됨`)
      } else {
        console.log(`   ⚠️  주소 데이터 없음`)
      }

      // 전화번호 데이터 확인
      if (clinic.phone && clinic.phone !== '전화번호 정보 없음') {
        console.log(`   ✅ 실제 전화번호 데이터 표시됨`)
      } else {
        console.log(`   ⚠️  전화번호 데이터 없음`)
      }
    })

    // 데이터 품질 요약
    console.log('\n📊 데이터 품질 요약:')
    console.log('=' .repeat(80))

    const clinicsWithAddress = data.clinics.filter((c: any) => c.address !== '주소 정보 없음')
    const clinicsWithPhone = data.clinics.filter((c: any) => c.phone !== '전화번호 정보 없음')

    console.log(`\n✅ 주소 있음: ${clinicsWithAddress.length}/${data.clinics.length}개`)
    console.log(`✅ 전화번호 있음: ${clinicsWithPhone.length}/${data.clinics.length}개`)

    if (clinicsWithAddress.length === data.clinics.length) {
      console.log('\n🎉 모든 병원의 실제 주소가 표시되고 있습니다!')
    }

    if (clinicsWithPhone.length === data.clinics.length) {
      console.log('🎉 모든 병원의 실제 전화번호가 표시되고 있습니다!')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testClinicAPI()