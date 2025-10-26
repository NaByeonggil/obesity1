# 카카오 로그인 설정 가이드 (프로덕션 포함)

## 🌐 환경별 주소

### 개발 환경
- URL: `http://localhost:3001`
- Redirect URI: `http://localhost:3001/api/auth/callback/kakao`

### 프로덕션 환경 ⭐
- URL: `https://obesity.ai.kr`
- Redirect URI: `https://obesity.ai.kr/api/auth/callback/kakao`

---

## 🔧 카카오 개발자 콘솔 설정 (완전판)

### 1단계: 카카오 개발자 콘솔 접속
1. https://developers.kakao.com/ 접속
2. 로그인
3. "내 애플리케이션" → "비만닥터부천" 선택

---

### 2단계: 플랫폼 설정

**좌측 메뉴 > 앱 설정 > 플랫폼 > Web 플랫폼 등록**

#### 추가할 사이트 도메인:
```
http://localhost:3001
https://obesity.ai.kr
```

⚠️ **주의:**
- http와 https 구분 필수
- 포트 번호 포함 (개발만)
- 슬래시(/) 제외

---

### 3단계: Redirect URI 등록 ⭐⭐⭐ 가장 중요!

**좌측 메뉴 > 제품 설정 > 카카오 로그인**

#### 1) 카카오 로그인 활성화
- "카카오 로그인 활성화" → **ON**

#### 2) Redirect URI 추가

**개발 환경용:**
```
http://localhost:3001/api/auth/callback/kakao
```

**프로덕션 환경용:**
```
https://obesity.ai.kr/api/auth/callback/kakao
```

⚠️ **정확히 입력:**
- http vs https 구분
- localhost:3001 (포트 번호 포함)
- /api/auth/callback/kakao (경로 정확히)

---

### 4단계: 동의 항목 설정

**좌측 메뉴 > 제품 설정 > 카카오 로그인 > 동의 항목**

| 항목 | 설정 | 이유 |
|------|------|------|
| 닉네임 | **필수 동의** | 사용자 이름 표시 |
| 프로필 사진 | 선택 동의 | 아바타 표시 |
| 카카오계정(이메일) | **필수 동의** | 로그인 식별자 |

---

### 5단계: 앱 상태 및 테스터 관리

**좌측 메뉴 > 앱 설정 > 고급**

#### 현재 앱 상태 확인:

**A. 개발 중 (테스트용) - 현재 상태 추정**
- 테스터로 등록된 카카오 계정만 로그인 가능
- 검수 없이 즉시 사용 가능

**테스터 추가 방법:**
1. **앱 설정 > 고급** 메뉴
2. **테스터 관리** 섹션
3. **+ 추가** 버튼
4. 테스트할 카카오 계정 이메일 입력
5. 저장

**B. 서비스 중 (운영용)**
- 모든 사용자 로그인 가능
- 검수 신청 필요
- 개인정보 처리방침 등록 필요

---

### 6단계: 보안 설정 (Client Secret)

**좌측 메뉴 > 제품 설정 > 카카오 로그인 > 보안**

1. "Client Secret" 섹션 확인
2. 코드 생성되어 있는지 확인
3. 활성화 상태 확인: **사용함**

---

## 📋 전체 체크리스트

### 개발 환경
- [ ] Web 플랫폼: `http://localhost:3001` 등록
- [ ] Redirect URI: `http://localhost:3001/api/auth/callback/kakao` 등록
- [ ] 카카오 로그인 활성화 ON
- [ ] 테스터 계정 추가 (본인 카카오 이메일)

### 프로덕션 환경
- [ ] Web 플랫폼: `https://obesity.ai.kr` 등록
- [ ] Redirect URI: `https://obesity.ai.kr/api/auth/callback/kakao` 등록
- [ ] SSL 인증서 확인 (Let's Encrypt)

### 공통
- [ ] 동의 항목: 닉네임, 이메일 필수 설정
- [ ] Client Secret 활성화 및 .env 설정

---

## 🔐 환경 변수 설정

### 개발 환경 (.env)
```bash
# 카카오 OAuth
KAKAO_CLIENT_ID=4976057b86815b637a1411a279fda223
KAKAO_CLIENT_SECRET=your_client_secret_here

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=2xcYDbRWYIUU0o9DBX0t6nV5hpcM8393xoFOy4O0lWc=
```

### 프로덕션 환경 (.env.production)
```bash
# 카카오 OAuth
KAKAO_CLIENT_ID=4976057b86815b637a1411a279fda223
KAKAO_CLIENT_SECRET=your_client_secret_here

# NextAuth
NEXTAUTH_URL=https://obesity.ai.kr
NEXTAUTH_SECRET=2xcYDbRWYIUU0o9DBX0t6nV5hpcM8393xoFOy4O0lWc=
```

---

## 🧪 테스트 방법

### 개발 환경 테스트
1. 개발 서버 실행
   ```bash
   npm run dev
   ```

2. 브라우저 접속
   ```
   http://localhost:3001/auth/login
   ```

3. "카카오로 시작하기" 버튼 클릭

4. 확인사항:
   - ✅ 카카오 로그인 페이지로 이동
   - ✅ 로그인 후 앱 권한 동의
   - ✅ `/patient` 페이지로 리다이렉트
   - ✅ 사용자 정보 자동 저장 (PATIENT 역할)

### 프로덕션 환경 테스트
1. 프로덕션 사이트 접속
   ```
   https://obesity.ai.kr/auth/login
   ```

2. "카카오로 시작하기" 버튼 클릭

3. 동일한 흐름 확인

---

## ⚠️ 자주 발생하는 문제 및 해결

### 문제 1: KOE006 에러
```
앱 관리자 설정 오류 (KOE006)
```

**원인:**
- Redirect URI 미등록
- 테스터 미추가 (개발 중 상태)

**해결:**
1. Redirect URI 정확히 등록
2. 테스터 관리에서 본인 계정 추가

---

### 문제 2: Redirect URI mismatch
```
redirect_uri_mismatch
```

**원인:**
- 등록된 URI와 실제 요청 URI 불일치

**해결:**
```
등록: http://localhost:3001/api/auth/callback/kakao
실제: http://localhost:3001/api/auth/callback/kakao
→ 완전히 일치해야 함 (포트, 경로, 슬래시 모두)
```

---

### 문제 3: 프로덕션에서 작동 안함
**원인:**
- HTTPS 미설정
- Redirect URI 미등록

**해결:**
1. SSL 인증서 확인 (Let's Encrypt)
2. `https://obesity.ai.kr/api/auth/callback/kakao` 등록
3. `.env.production` 파일에 `NEXTAUTH_URL=https://obesity.ai.kr` 설정

---

## 📸 카카오 개발자 콘솔 화면 참고

### Redirect URI 등록 화면 예시:
```
┌─────────────────────────────────────────────┐
│ Redirect URI                                │
├─────────────────────────────────────────────┤
│ http://localhost:3001/api/auth/callback/kakao  [삭제]  │
│ https://obesity.ai.kr/api/auth/callback/kakao  [삭제]  │
│                                             │
│ [+ Redirect URI 추가]                       │
└─────────────────────────────────────────────┘
```

---

## 🚀 배포 후 확인사항

프로덕션 배포 후:

1. ✅ HTTPS 작동 확인
   ```bash
   curl -I https://obesity.ai.kr
   ```

2. ✅ 카카오 로그인 페이지 접속
   ```
   https://obesity.ai.kr/auth/login
   ```

3. ✅ 카카오 로그인 테스트
   - 로그인 버튼 클릭
   - 카카오 인증 후 리다이렉트
   - 데이터베이스에 사용자 저장 확인

---

## 📞 추가 정보

### 현재 설정 정보
- **앱 이름:** 비만닥터부천
- **REST API 키:** 4976057b86815b637a1411a279fda223
- **개발 환경:** http://localhost:3001
- **프로덕션 환경:** https://obesity.ai.kr

### 카카오 개발자 문서
- 카카오 로그인 가이드: https://developers.kakao.com/docs/latest/ko/kakaologin/common
- Redirect URI 설정: https://developers.kakao.com/docs/latest/ko/kakaologin/prerequisite#redirect-uri

---

**작성일:** 2025-10-26
**개발 서버:** http://localhost:3001
**프로덕션:** https://obesity.ai.kr ⭐
