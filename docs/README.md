# obesity.ai.kr 문서 모음

## 📁 문서 구조

### 배포 관련 (`deployment/`)
- **DEPLOYMENT.md** - 상세 배포 가이드
- **QUICK_START.md** - 빠른 시작 가이드
- **PORTS.md** - 포트 설정 가이드

### 문제 해결 (`troubleshooting/`)
- **SIMPLE_FIX.md** - 간단한 해결 방법 (hosts 파일 수정) ⭐ 추천
- **NAT_HAIRPIN_ISSUE.md** - NAT 헤어핀 문제 상세 가이드
- **EXTERNAL_ACCESS_ISSUE.md** - 외부 접속 문제 해결
- **HTTPS_TROUBLESHOOTING.md** - HTTPS 문제 해결
- **SSL_STATUS_REPORT.md** - SSL 인증서 상태 보고서

### 기타
- **README.docker.md** - Docker 사용 가이드

---

## 🚀 빠른 접근

### 외부 WiFi에서 접속 안 됨
→ [`troubleshooting/SIMPLE_FIX.md`](troubleshooting/SIMPLE_FIX.md) 참고

### 처음 배포하기
→ [`deployment/QUICK_START.md`](deployment/QUICK_START.md) 참고

### HTTPS 문제
→ [`troubleshooting/SSL_STATUS_REPORT.md`](troubleshooting/SSL_STATUS_REPORT.md) 참고

### 포트 설정
→ [`deployment/PORTS.md`](deployment/PORTS.md) 참고

---

## 📞 현재 상태 요약

### ✅ 정상 작동
- HTTPS: https://obesity.ai.kr ✓
- SSL 인증서: 유효 (2026년 1월까지) ✓
- 모바일 접속: 가능 ✓
- 서버 내부: 가능 ✓

### ⚠️ 알려진 이슈
- **다른 WiFi에서 접속 불가**: NAT 헤어핀 문제
  - 해결: [`troubleshooting/SIMPLE_FIX.md`](troubleshooting/SIMPLE_FIX.md) 참고

---

## 🛠️ 배포 스크립트

루트 디렉토리에 있는 스크립트:
- `deploy.sh` - 전체 배포 자동화
- `setup-ssl.sh` - SSL 인증서 설치

---

프로젝트 관련 정보는 루트의 `CLAUDE.md` 파일을 참고하세요.
