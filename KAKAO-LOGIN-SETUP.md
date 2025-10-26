# 카카오 로그인 설정 가이드 (KOE006 에러 해결)

## ❌ 발생한 에러
```
앱 관리자 설정 오류 (KOE006)
비만닥터부천 서비스 설정에 오류가 있어, 이용할 수 없습니다.
서비스 관리자의 확인이 필요합니다.
```

## 🔧 해결 방법

### 1단계: 카카오 개발자 콘솔 접속

1. https://developers.kakao.com/ 접속
2. 로그인
3. "내 애플리케이션" 선택
4. "비만닥터부천" 앱 선택

---

### 2단계: 플랫폼 설정 확인

**좌측 메뉴 > 앱 설정 > 플랫폼**

#### 추가할 플랫폼:

**Web 플랫폼 등록:**
- 사이트 도메인: `http://localhost:3001` (개발용)
- 사이트 도메인: `https://obesity.ai.kr` (프로덕션용)

---

### 3단계: Redirect URI 설정 ⭐ 가장 중요!

**좌측 메뉴 > 제품 설정 > 카카오 로그인**

#### ✅ 활성화 설정:
1. "카카오 로그인 활성화" → **ON**
2. "OpenID Connect 활성화" → **ON** (선택)

#### ✅ Redirect URI 등록:

**개발 환경:**
```
http://localhost:3001/api/auth/callback/kakao
```

**프로덕션 환경:**
```
https://obesity.ai.kr/api/auth/callback/kakao
```

⚠️ **중요:**
- URL은 정확하게 입력해야 합니다 (슬래시 하나도 틀리면 안됨)
- http와 https 구분 필수
- 포트 번호 포함 (개발: 3001)

---

### 4단계: 동의 항목 설정

**좌측 메뉴 > 제품 설정 > 카카오 로그인 > 동의 항목**

#### 필수 설정:
- **닉네임**: 필수 동의
- **프로필 사진**: 선택 동의
- **카카오계정(이메일)**: 필수 동의

---

### 5단계: 앱 상태 확인

**좌측 메뉴 > 앱 설정 > 요약 정보**

#### 앱 상태 두 가지:

**A. 개발 중 (테스트용) - 현재 추천 ⭐**
- 앱 상태: "개발 중"
- 테스터 관리 필요
- 테스터 목록에 추가된 카카오 계정만 로그인 가능

**테스터 추가 방법:**
1. 좌측 메뉴 > **앱 설정 > 고급**
2. **테스터 관리** 섹션
3. **카카오계정 추가** 버튼 클릭
4. 테스트할 카카오 계정 이메일 입력
5. 추가 완료

**B. 서비스 중 (운영용)**
- 검수 신청 필요
- 승인 후 모든 사용자 로그인 가능
- 개인정보 처리방침 등록 필요

---

### 6단계: Client Secret 확인

**좌측 메뉴 > 제품 설정 > 카카오 로그인 > 보안**

1. "Client Secret" 섹션
2. "코드 생성" 클릭 (없는 경우)
3. 생성된 코드 복사
4. `.env` 파일의 `KAKAO_CLIENT_SECRET` 업데이트

---

## 📋 체크리스트

설정 완료 여부를 확인하세요:

- [ ] Web 플랫폼 등록 (`http://localhost:3001`)
- [ ] Web 플랫폼 등록 (`https://obesity.ai.kr`)
- [ ] 카카오 로그인 활성화 **ON**
- [ ] Redirect URI 등록 (`http://localhost:3001/api/auth/callback/kakao`)
- [ ] Redirect URI 등록 (`https://obesity.ai.kr/api/auth/callback/kakao`)
- [ ] 동의 항목 설정 (닉네임, 이메일 필수)
- [ ] 테스터 계정 추가 (개발 중인 경우)
- [ ] Client Secret 확인 및 `.env` 업데이트

---

## 🧪 테스트 방법

### 설정 후 테스트:

1. **개발 서버 재시작**
   ```bash
   # 현재 서버 종료 후
   npm run dev
   ```

2. **브라우저 접속**
   ```
   http://localhost:3001/auth/login
   ```

3. **카카오 로그인 시도**
   - "카카오로 시작하기" 버튼 클릭
   - 카카오 로그인 페이지로 이동 확인
   - 로그인 후 `/patient` 페이지로 리다이렉트 확인

---

## 🔍 현재 설정 확인

### 환경 변수 (.env):
```bash
KAKAO_CLIENT_ID=4976057b86815b637a1411a279fda223
KAKAO_CLIENT_SECRET=your_client_secret_here
```

### 개발 서버:
- URL: http://localhost:3001
- 포트: 3001

---

## ⚠️ 자주 발생하는 문제

### 문제 1: "Redirect URI mismatch"
**원인:** Redirect URI가 정확히 일치하지 않음
**해결:** 카카오 콘솔에서 정확한 URI 등록
```
http://localhost:3001/api/auth/callback/kakao
```

### 문제 2: KOE006 에러
**원인:** 테스터 계정이 아님 (개발 중 상태)
**해결:** 카카오 개발자 콘솔 > 앱 설정 > 고급 > 테스터 관리에서 계정 추가

### 문제 3: KOE101 에러
**원인:** Client Secret 불일치
**해결:** 카카오 콘솔에서 Client Secret 재확인 및 `.env` 업데이트

---

## 📞 추가 도움말

### 카카오 개발자 문서:
- 카카오 로그인: https://developers.kakao.com/docs/latest/ko/kakaologin/common
- 에러 코드: https://developers.kakao.com/docs/latest/ko/kakaologin/trouble-shooting

### 현재 앱 정보:
- 앱 이름: 비만닥터부천
- REST API 키: 4976057b86815b637a1411a279fda223

---

## ✅ 완료 후 확인사항

설정을 완료한 후:

1. ✅ 카카오 로그인 버튼 클릭 시 카카오 로그인 페이지로 이동
2. ✅ 로그인 후 앱 권한 동의 화면 표시
3. ✅ 동의 후 `/patient` 페이지로 리다이렉트
4. ✅ 사용자 정보가 데이터베이스에 PATIENT 역할로 저장
5. ✅ 대시보드에서 카카오 프로필 정보 표시

---

**작성일:** 2025-10-26
**개발 서버:** http://localhost:3001
**프로덕션:** https://obesity.ai.kr
