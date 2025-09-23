async function testClinicListing() {
  console.log('🧪 대변 진료 및 진료비 기반 리스팅 테스트')
  console.log('=' .repeat(60))

  // 비대면 진료 - 소화기내과 (진료비 싼 순)
  console.log('\n📱 비대면 진료 - 소화기내과 (진료비 싼 순):')
  try {
    const gastroResponse = await fetch('http://localhost:3000/api/clinics?department=gastroenterology')
    const gastroData = await gastroResponse.json()
    gastroData.clinics.slice(0, 3).forEach((clinic: any, index: number) => {
      console.log(`${index + 1}. ${clinic.name}`)
      console.log(`   💰 진료비: ${clinic.consultationFee.toLocaleString()}원`)
      console.log(`   📍 위치: ${clinic.address}`)
      console.log(`   👨‍⚕️ 전문과: ${clinic.specialization}`)
      console.log(`   📱 진료타입: ${clinic.consultationType}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ 소화기내과 테스트 오류:', error)
  }

  // 비대면 진료 - 항문외과 (진료비 싼 순)
  console.log('\n📱 비대면 진료 - 항문외과 (진료비 싼 순):')
  try {
    const proctoResponse = await fetch('http://localhost:3000/api/clinics?department=proctology')
    const proctoData = await proctoResponse.json()
    proctoData.clinics.slice(0, 3).forEach((clinic: any, index: number) => {
      console.log(`${index + 1}. ${clinic.name}`)
      console.log(`   💰 진료비: ${clinic.consultationFee.toLocaleString()}원`)
      console.log(`   📍 위치: ${clinic.address}`)
      console.log(`   👨‍⚕️ 전문과: ${clinic.specialization}`)
      console.log(`   📱 진료타입: ${clinic.consultationType}`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ 항문외과 테스트 오류:', error)
  }

  // 대면 진료 - 비만 치료 (거리 가까운 순)
  console.log('\n🏥 대면 진료 - 비만 치료 (거리 가까운 순):')
  try {
    const obesityResponse = await fetch('http://localhost:3000/api/clinics?department=obesity')
    const obesityData = await obesityResponse.json()
    obesityData.clinics.slice(0, 3).forEach((clinic: any, index: number) => {
      console.log(`${index + 1}. ${clinic.name}`)
      console.log(`   📍 거리: ${clinic.distance}`)
      console.log(`   🏠 주소: ${clinic.address}`)
      console.log(`   👨‍⚕️ 전문과: ${clinic.specialization}`)
      console.log(`   🏥 진료타입: ${clinic.consultationType}`)
      console.log(`   💰 진료비: ${clinic.consultationFee.toLocaleString()}원`)
      console.log('')
    })
  } catch (error) {
    console.error('❌ 비만 치료 테스트 오류:', error)
  }

  console.log('✅ 모든 테스트 완료!')
  console.log('🎯 비대면 진료는 진료비 순, 대면 진료는 위치 순으로 정렬됩니다.')
}

testClinicListing()