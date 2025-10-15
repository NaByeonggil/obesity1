# 카카오맵 API 설정 가이드

약국 찾기 기능을 사용하려면 카카오맵 API 키가 필요합니다.

## 1. 카카오 개발자 계정 생성

1. [카카오 개발자 사이트](https://developers.kakao.com/)에 접속
2. 카카오 계정으로 로그인
3. "내 애플리케이션" 메뉴에서 "애플리케이션 추가하기" 클릭

## 2. 애플리케이션 등록

1. 앱 이름: `obesity1` (또는 원하는 이름)
2. 사업자명: 개인 또는 회사명 입력
3. 생성 완료

## 3. JavaScript 키 발급

1. 생성한 애플리케이션 선택
2. "앱 키" 탭에서 **JavaScript 키** 복사
3. 예시: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

## 4. 플랫폼 등록

1. "플랫폼" 탭으로 이동
2. "Web 플랫폼 등록" 클릭
3. 사이트 도메인 등록:
   - 개발: `http://localhost:3000`
   - 개발: `http://localhost:3001`
   - 프로덕션: `https://obesity.ai.kr` (실제 도메인)

## 5. 환경 변수 설정

`.env` 파일에서 카카오맵 API 키 설정:

```bash
# Kakao Map API
NEXT_PUBLIC_KAKAO_MAP_KEY=여기에_발급받은_JavaScript_키_입력
```

예시:
```bash
NEXT_PUBLIC_KAKAO_MAP_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## 6. 서버 재시작

환경 변수 변경 후 개발 서버 재시작:

```bash
# 개발 서버
npm run dev

# 또는 도커 프로덕션
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

## 7. 기능 확인

1. 환자 계정으로 로그인
2. "약국 찾기" 클릭
3. 지도에 약국 위치가 표시되는지 확인

## 주의사항

- **NEXT_PUBLIC_** 접두사가 있어야 클라이언트에서 사용 가능합니다
- API 키는 공개 저장소에 커밋하지 마세요
- `.gitignore`에 `.env` 파일이 포함되어 있는지 확인하세요

## 문제 해결

### 지도가 표시되지 않는 경우

1. 브라우저 콘솔에서 에러 확인
2. API 키가 올바르게 설정되었는지 확인
3. 도메인이 카카오 개발자 사이트에 등록되어 있는지 확인
4. 서버를 재시작했는지 확인

### 위치 권한 오류

- 브라우저 설정에서 위치 정보 사용 권한 허용
- HTTPS 환경에서는 위치 정보가 더 잘 작동합니다
