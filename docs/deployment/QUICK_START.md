# obesity.ai.kr 빠른 배포 가이드

## 📋 사전 준비 체크리스트

- [ ] 서버에 Docker 및 Docker Compose 설치됨
- [ ] DNS 설정 완료 (A 레코드: obesity.ai.kr → 서버 IP)
- [ ] 서버의 80, 443, 3306 포트 열림
- [ ] sudo 권한 있음

## 🚀 빠른 배포 (3단계)

### 1단계: 초기 배포
```bash
cd /home/nbg/바탕화면/obesity1
sudo ./deploy.sh
```

이 스크립트는 자동으로:
- Nginx 설치 및 설정
- Docker 컨테이너 시작
- 애플리케이션 실행
- Nginx 재시작

**예상 소요 시간: 2-3분**

### 2단계: DNS 확인
```bash
# DNS 전파 확인 (최대 24시간 소요 가능)
nslookup obesity.ai.kr
```

### 3단계: SSL 인증서 설치 (선택사항, 권장)
```bash
sudo ./setup-ssl.sh
```

이메일 주소를 입력하면 자동으로 SSL 인증서가 발급됩니다.

## ✅ 배포 확인

브라우저에서 접속:
- HTTP: http://obesity.ai.kr
- HTTPS: https://obesity.ai.kr (SSL 설치 후)

## 🔧 수동 배포 단계별 가이드

자동 스크립트를 사용하지 않는 경우:

### 1. Nginx 설치
```bash
sudo apt update
sudo apt install nginx -y
```

### 2. Nginx 설정
```bash
sudo cp nginx.conf /etc/nginx/sites-available/obesity.ai.kr
sudo ln -s /etc/nginx/sites-available/obesity.ai.kr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Docker 실행
```bash
docker-compose -f docker-compose.production.yml up -d
```

### 4. SSL 설치
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d obesity.ai.kr -d www.obesity.ai.kr
```

## 🔄 재배포 (코드 업데이트 후)

```bash
cd /home/nbg/바탕화면/obesity1
git pull  # 또는 코드 업데이트
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

## 📊 상태 확인 명령어

### 서비스 상태
```bash
# Nginx 상태
sudo systemctl status nginx

# Docker 컨테이너 상태
docker ps

# 애플리케이션 로그
docker-compose -f docker-compose.production.yml logs -f
```

### 로그 확인
```bash
# Nginx 에러 로그
sudo tail -f /var/log/nginx/error.log

# Nginx 접속 로그
sudo tail -f /var/log/nginx/access.log

# 애플리케이션 로그
docker-compose -f docker-compose.production.yml logs -f app
```

## 🐛 문제 해결

### 502 Bad Gateway
```bash
# 애플리케이션이 실행 중인지 확인
docker ps
curl http://localhost:3000

# 없으면 재시작
docker-compose -f docker-compose.production.yml restart
```

### DNS가 작동하지 않음
```bash
# DNS 전파 확인
nslookup obesity.ai.kr
dig obesity.ai.kr

# /etc/hosts 파일에 임시로 추가 (테스트용)
echo "서버IP obesity.ai.kr" | sudo tee -a /etc/hosts
```

### SSL 인증서 갱신 실패
```bash
# 수동 갱신
sudo certbot renew

# 자동 갱신 확인
sudo systemctl status certbot.timer
```

## 📝 환경 변수 설정

배포 후 `.env.production` 파일에서 도메인 업데이트:

```env
# 이 줄의 주석을 해제
NEXTAUTH_URL=https://obesity.ai.kr

# 이 줄을 주석 처리
# NEXTAUTH_URL=http://localhost:3000
```

변경 후 재배포:
```bash
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

## 🔐 보안 권장사항

1. **방화벽 설정**
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

2. **강력한 비밀번호 사용**
   - .env.production 파일의 비밀번호 변경
   - 데이터베이스 비밀번호 변경

3. **정기 업데이트**
```bash
sudo apt update && sudo apt upgrade -y
```

## 📞 지원

문제가 발생하면 다음 정보를 수집하여 공유:
```bash
# 시스템 정보
uname -a
docker --version
nginx -v

# 서비스 상태
sudo systemctl status nginx
docker ps -a

# 로그
sudo tail -n 50 /var/log/nginx/error.log
docker-compose -f docker-compose.production.yml logs --tail=50
```

## 📚 추가 문서

- 상세 배포 가이드: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 프로젝트 설명: [CLAUDE.md](./CLAUDE.md)
- Docker Compose 설정: [docker-compose.production.yml](./docker-compose.production.yml)
