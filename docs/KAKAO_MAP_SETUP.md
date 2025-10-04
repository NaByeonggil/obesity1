# 카카오맵 API 설정 가이드

## 1. 카카오 개발자 계정 생성

1. [카카오 개발자 사이트](https://developers.kakao.com/) 접속
2. 카카오 계정으로 로그인
3. 개발자 등록 완료

## 2. 애플리케이션 생성

1. "내 애플리케이션" 메뉴 클릭
2. "애플리케이션 추가하기" 버튼 클릭
3. 앱 이름 입력 (예: "의료 플랫폼")
4. 사업자명 입력
5. 저장

## 3. JavaScript 키 발급

1. 생성한 앱 클릭
2. "앱 키" 섹션에서 "JavaScript 키" 확인
3. JavaScript 키 복사

## 4. 플랫폼 등록

1. "플랫폼" 메뉴 클릭
2. "Web 플랫폼 등록" 클릭
3. 사이트 도메인 입력:
   - 개발: `http://localhost:3000`
   - 운영: `https://your-domain.com`
4. 저장

## 5. 환경 변수 설정

`.env` 파일에 JavaScript 키 추가:

```bash
# 카카오맵 API (개발용)
NEXT_PUBLIC_KAKAO_MAP_API_KEY="발급받은_JavaScript_키를_여기에_붙여넣기"
```

예시:
```bash
NEXT_PUBLIC_KAKAO_MAP_API_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

## 6. 개발 서버 재시작

환경 변수를 변경한 후 개발 서버를 재시작해야 합니다:

```bash
# 기존 서버 종료 (Ctrl+C)

# 개발 서버 재시작
npm run dev
```

## 7. 확인

1. 브라우저에서 `http://localhost:3000` 접속
2. 환자 로그인
3. "처방전 관리" > "지도 보기" 탭 클릭
4. 지도가 정상적으로 표시되는지 확인

## 주의사항

### 무료 할당량
- 카카오맵 API는 일일 300,000회 호출 무료
- 초과 시 과금 발생 가능
- [요금제 안내](https://developers.kakao.com/docs/latest/ko/local/common#guide)

### 보안
- `.env` 파일은 절대 Git에 커밋하지 마세요
- `.gitignore`에 `.env` 포함 필수
- 운영 환경에서는 환경 변수를 서버에 직접 설정

### 도메인 설정
- 운영 배포 전 실제 도메인을 카카오 개발자 콘솔에 등록해야 합니다
- 등록되지 않은 도메인에서는 API 호출이 차단됩니다

## 문제 해결

### 지도가 표시되지 않는 경우

1. **API 키 확인**
   - 환경 변수가 올바르게 설정되었는지 확인
   - 브라우저 콘솔에서 에러 메시지 확인

2. **도메인 확인**
   - 카카오 개발자 콘솔에서 도메인이 등록되었는지 확인
   - `http://localhost:3000` 정확히 입력

3. **네트워크 확인**
   - 브라우저 개발자 도구 > Network 탭에서 API 요청 확인
   - 401 에러: API 키 문제
   - 403 에러: 도메인 미등록

4. **브라우저 캐시**
   - 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
   - 시크릿 모드에서 테스트

## 참고 문서

- [카카오맵 Web API 가이드](https://apis.map.kakao.com/web/guide/)
- [카카오맵 JavaScript API 문서](https://apis.map.kakao.com/web/)
- [카카오 개발자 포럼](https://devtalk.kakao.com/)
