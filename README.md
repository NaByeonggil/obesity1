# obesity.ai.kr - 비만 치료 의료 플랫폼

한국어 기반 다중 역할 의료 플랫폼

## 🌐 접속 주소

**메인 사이트**: https://obesity.ai.kr

## 🚀 빠른 시작

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 배포
```bash
# 전체 배포 자동화
./deploy.sh

# 또는 수동 배포
docker-compose -f docker-compose.production.yml up -d --build
```

### SSL 인증서 설치
```bash
./setup-ssl.sh
```

## 📚 문서

모든 문서는 [`docs/`](docs/) 폴더에 정리되어 있습니다.

### 빠른 링크

#### 배포 관련
- [배포 가이드](docs/deployment/DEPLOYMENT.md)
- [빠른 시작](docs/deployment/QUICK_START.md)
- [포트 설정](docs/deployment/PORTS.md)

#### 문제 해결
- [⭐ 외부 WiFi 접속 문제 간단 해결](docs/troubleshooting/SIMPLE_FIX.md)
- [NAT 헤어핀 문제](docs/troubleshooting/NAT_HAIRPIN_ISSUE.md)
- [외부 접속 문제](docs/troubleshooting/EXTERNAL_ACCESS_ISSUE.md)
- [HTTPS 문제 해결](docs/troubleshooting/HTTPS_TROUBLESHOOTING.md)
- [SSL 상태 보고서](docs/troubleshooting/SSL_STATUS_REPORT.md)

#### 개발
- [Docker 가이드](docs/README.docker.md)
- [프로젝트 구조 및 개발 가이드](CLAUDE.md)

## 🎯 주요 기능

### 4가지 사용자 역할
- **환자 (PATIENT)**: 예약, 처방전 조회, 의사 검색
- **의사 (DOCTOR)**: 예약 관리, 처방전 발행, 환자 기록
- **약국 (PHARMACY)**: 처방전 처리, 재고 관리, 정산
- **관리자 (ADMIN)**: 시스템 관리 및 통계

### 기술 스택
- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL/MariaDB
- **Authentication**: NextAuth.js + JWT
- **Deployment**: Docker, Nginx, Let's Encrypt SSL

## 🔧 개발 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 타입 체크
npm run type-check

# 데이터베이스 시드
npm run db:seed

# Prisma Studio
npx prisma studio
```

## 📊 현재 상태

### ✅ 정상 작동
- HTTPS: https://obesity.ai.kr ✓
- SSL 인증서: 유효 (2026년 1월까지) ✓
- 모바일 접속: 가능 ✓
- 서버 내부: 가능 ✓

### ⚠️ 알려진 이슈
- **다른 WiFi에서 접속 불가**: NAT 헤어핀 문제
  - 해결 방법: [SIMPLE_FIX.md](docs/troubleshooting/SIMPLE_FIX.md) 참고

## 🏗️ 프로젝트 구조

```
obesity1/
├── src/                    # 소스 코드
│   ├── app/               # Next.js 앱
│   ├── components/        # React 컴포넌트
│   └── lib/               # 유틸리티
├── prisma/                # 데이터베이스 스키마
├── docs/                  # 문서
│   ├── deployment/       # 배포 관련
│   └── troubleshooting/  # 문제 해결
├── scripts/               # 유틸리티 스크립트
├── deploy.sh             # 배포 스크립트
├── setup-ssl.sh          # SSL 설치 스크립트
└── CLAUDE.md             # 개발 가이드
```

## 🤝 기여

프로젝트 개발 가이드는 [CLAUDE.md](CLAUDE.md)를 참고하세요.

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

---

**문제가 있나요?** [docs/troubleshooting/](docs/troubleshooting/) 폴더를 확인하세요.
