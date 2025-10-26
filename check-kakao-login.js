// 카카오 로그인 구현 확인
const fs = require('fs')
const path = require('path')

console.log('🔍 카카오 로그인 구현 상태 확인\n')
console.log('═══════════════════════════════════════════════')

// 1. NextAuth 설정 확인
console.log('\n1️⃣ NextAuth 설정 확인')
const authConfigPath = path.join(__dirname, 'src/app/api/auth/[...nextauth]/route.ts')
const authConfig = fs.readFileSync(authConfigPath, 'utf8')

const hasKakaoProvider = authConfig.includes('KakaoProvider')
const hasNaverProvider = authConfig.includes('NaverProvider')
const hasAutoRegister = authConfig.includes('role: "PATIENT"')

console.log('   ✅ NextAuth 설정 파일:', authConfigPath)
console.log('   ✅ KakaoProvider 등록:', hasKakaoProvider ? '✓' : '✗')
console.log('   ✅ NaverProvider 등록:', hasNaverProvider ? '✓' : '✗')
console.log('   ✅ 자동 환자 계정 생성:', hasAutoRegister ? '✓' : '✗')

// 2. 환경 변수 확인
console.log('\n2️⃣ 환경 변수 확인')

let envVars = {}
try {
  const envContent = fs.readFileSync('.env', 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      envVars[key.trim()] = value.trim()
    }
  })
} catch (e) {
  console.log('   ⚠️  .env 파일 없음')
}

const kakaoClientId = process.env.KAKAO_CLIENT_ID || envVars.KAKAO_CLIENT_ID
const kakaoClientSecret = process.env.KAKAO_CLIENT_SECRET || envVars.KAKAO_CLIENT_SECRET

console.log('   KAKAO_CLIENT_ID:', kakaoClientId ? '설정됨 ✓' : '미설정 ✗')
console.log('   KAKAO_CLIENT_SECRET:', kakaoClientSecret && kakaoClientSecret !== '""' ? '설정됨 ✓' : '미설정 ✗')

// 3. 로그인 페이지 UI 확인
console.log('\n3️⃣ 로그인 페이지 UI 확인')
const loginPagePath = path.join(__dirname, 'src/app/auth/login/page.tsx')
const loginPage = fs.readFileSync(loginPagePath, 'utf8')

const hasKakaoButton = loginPage.includes('handleSocialLogin("kakao")')
const hasNaverButton = loginPage.includes('handleSocialLogin("naver")')
const hasGoogleButton = loginPage.includes('handleSocialLogin("google")')
const hasKakaoIcon = loginPage.includes('MessageSquare')

console.log('   ✅ 로그인 페이지:', loginPagePath)
console.log('   ✅ 카카오 로그인 버튼:', hasKakaoButton ? '✓' : '✗')
console.log('   ✅ 카카오 아이콘:', hasKakaoIcon ? '✓' : '✗')
console.log('   ✅ 네이버 로그인 버튼:', hasNaverButton ? '✓' : '✗')
console.log('   ✅ 구글 로그인 버튼:', hasGoogleButton ? '✓ (설정 필요)' : '✗')

// 4. 카카오 OAuth 콜백 확인
console.log('\n4️⃣ 카카오 OAuth 콜백 처리')
const hasSignInCallback = authConfig.includes('account?.provider === "kakao"')
const createsPatientAccount = authConfig.includes('role: "PATIENT"')

console.log('   ✅ 카카오 로그인 콜백:', hasSignInCallback ? '✓' : '✗')
console.log('   ✅ PATIENT 역할 자동 설정:', createsPatientAccount ? '✓' : '✗')

// 5. 전체 요약
console.log('\n═══════════════════════════════════════════════')
console.log('📊 카카오 로그인 구현 요약')
console.log('═══════════════════════════════════════════════\n')

const allImplemented = hasKakaoProvider && hasKakaoButton && hasSignInCallback && createsPatientAccount
const allConfigured = kakaoClientId && kakaoClientSecret && kakaoClientSecret !== '""'

if (allImplemented && allConfigured) {
  console.log('✅ 카카오 로그인 완전히 구현되고 설정됨!')
} else if (allImplemented && !allConfigured) {
  console.log('⚠️  카카오 로그인 구현됨, 환경 변수 설정 필요')
} else {
  console.log('❌ 카카오 로그인 구현 불완전')
}

console.log('\n구현 상태:')
console.log('  - NextAuth KakaoProvider:', hasKakaoProvider ? '✅' : '❌')
console.log('  - 로그인 버튼 UI:', hasKakaoButton ? '✅' : '❌')
console.log('  - OAuth 콜백 처리:', hasSignInCallback ? '✅' : '❌')
console.log('  - 자동 환자 계정 생성:', createsPatientAccount ? '✅' : '❌')

console.log('\n환경 변수:')
console.log('  - KAKAO_CLIENT_ID:', kakaoClientId ? '✅' : '❌')
console.log('  - KAKAO_CLIENT_SECRET:', kakaoClientSecret && kakaoClientSecret !== '""' ? '✅' : '⚠️  확인 필요')

console.log('\n동작 방식:')
console.log('  1. 사용자가 "카카오로 시작하기" 버튼 클릭')
console.log('  2. 카카오 로그인 페이지로 리다이렉트')
console.log('  3. 카카오 로그인 성공 시 콜백 URL로 복귀')
console.log('  4. NextAuth가 카카오 사용자 정보 받음')
console.log('  5. 데이터베이스에 사용자 존재 확인')
console.log('  6. 없으면 PATIENT 역할로 자동 생성')
console.log('  7. 있으면 기존 정보 업데이트')
console.log('  8. /patient 페이지로 리다이렉트')

console.log('\n필요한 카카오 설정:')
console.log('  - 카카오 개발자 센터에서 앱 등록')
console.log('  - REST API 키 → KAKAO_CLIENT_ID')
console.log('  - Client Secret → KAKAO_CLIENT_SECRET')
console.log('  - 리다이렉트 URI 설정:')
console.log('    http://localhost:3001/api/auth/callback/kakao (개발)')
console.log('    https://obesity.ai.kr/api/auth/callback/kakao (프로덕션)')

if (!allConfigured) {
  console.log('\n⚠️  주의사항:')
  if (!kakaoClientSecret || kakaoClientSecret === '""') {
    console.log('  - KAKAO_CLIENT_SECRET이 비어있습니다.')
    console.log('  - 카카오 개발자 센터에서 Client Secret 발급 필요')
  }
  console.log('  - .env 파일에 환경 변수를 설정해야 합니다.')
  console.log('  - 서버 재시작 후 적용됩니다.')
}

console.log('\n═══════════════════════════════════════════════')
