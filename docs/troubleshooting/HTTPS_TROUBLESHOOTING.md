# HTTPS 접속 문제 해결 가이드

## 🔍 현재 상태 점검 결과

### ✅ 확인된 사항
- **포트 80 (HTTP)**: 열려있음 ✓
- **포트 443 (HTTPS)**: 열려있음 ✓
- **포트 3000 (Next.js)**: 실행 중 ✓

### ❌ 문제점
- **SSL 인증서**: 설치되지 않음
- Let's Encrypt 인증서 디렉토리가 없습니다

## 🚨 문제 원인

HTTPS 접속이 안 되는 이유는 **SSL 인증서가 설치되지 않았기 때문**입니다.

443 포트는 열려있지만, SSL 인증서가 없어서 HTTPS 연결을 처리할 수 없습니다.

## ✅ 해결 방법

### 1단계: SSL 인증서 설치

자동 스크립트 사용 (권장):
```bash
cd /home/nbg/바탕화면/obesity1
sudo ./setup-ssl.sh
```

또는 수동 설치:
```bash
# Certbot 설치
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급 (이메일 주소 입력 필요)
sudo certbot --nginx -d obesity.ai.kr -d www.obesity.ai.kr
```

### 2단계: Nginx 설정 확인

SSL 인증서 설치 후 Nginx 설정이 자동으로 업데이트됩니다.

확인:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 3단계: 환경 변수 업데이트

`.env.production` 파일 수정:
```bash
nano .env.production
```

다음 줄을 수정:
```env
# 이 줄의 주석을 해제
NEXTAUTH_URL=https://obesity.ai.kr

# 이 줄을 주석 처리
# NEXTAUTH_URL=http://localhost:3000
```

### 4단계: Docker 재시작

```bash
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

## 🔐 SSL 인증서 발급 시 필요한 것

1. **도메인 DNS가 서버 IP를 가리켜야 함**
   ```bash
   # DNS 확인
   nslookup obesity.ai.kr
   dig obesity.ai.kr
   ```

2. **80번 포트가 열려있어야 함** (Let's Encrypt 검증용)
   ```bash
   sudo ufw status | grep 80
   ```

3. **이메일 주소** (인증서 만료 알림용)

## 🧪 테스트 방법

### SSL 설치 전 (현재 상태)
```bash
# HTTP만 작동
curl http://obesity.ai.kr

# HTTPS는 실패
curl https://obesity.ai.kr
# 예상 오류: SSL certificate problem 또는 connection refused
```

### SSL 설치 후 (정상 상태)
```bash
# HTTP 자동 리다이렉트
curl -I http://obesity.ai.kr
# 301 Moved Permanently → https://obesity.ai.kr

# HTTPS 정상 작동
curl -I https://obesity.ai.kr
# HTTP/2 200 OK
```

## 📝 빠른 체크리스트

SSL 인증서 설치 전에 확인할 것:

- [ ] DNS 설정 완료 (obesity.ai.kr → 서버 IP)
- [ ] 도메인 전파 완료 (최대 24시간 소요)
- [ ] 80, 443 포트 열림
- [ ] Nginx 실행 중
- [ ] 방화벽 설정 완료

확인 명령어:
```bash
# 1. DNS 확인
nslookup obesity.ai.kr

# 2. 포트 확인
sudo netstat -tulpn | grep -E ':80|:443'

# 3. Nginx 상태
sudo systemctl status nginx

# 4. 방화벽 확인
sudo ufw status
```

## 🔧 일반적인 오류와 해결

### 오류 1: DNS가 전파되지 않음
```
증상: nslookup으로 조회 시 IP가 안 나옴
해결: DNS 전파 대기 (최대 24시간)
임시: /etc/hosts 파일에 추가
     echo "서버IP obesity.ai.kr" | sudo tee -a /etc/hosts
```

### 오류 2: 80번 포트가 사용 중
```
증상: Certbot 실행 시 80번 포트 사용 중 오류
해결: 다른 서비스가 80번 포트 사용 중인지 확인
     sudo lsof -i :80
     필요시 해당 서비스 중지
```

### 오류 3: 방화벽 차단
```
증상: 외부에서 접속 안 됨
해결: 방화벽 80, 443 포트 열기
     sudo ufw allow 80/tcp
     sudo ufw allow 443/tcp
```

### 오류 4: 인증서 발급 실패
```
증상: Certbot에서 domain validation failed
해결:
  1. DNS가 올바른지 확인
  2. 80번 포트가 외부에서 접근 가능한지 확인
  3. Nginx가 실행 중인지 확인
```

## 💡 권장 순서

1. **DNS 설정 및 전파 확인**
   ```bash
   nslookup obesity.ai.kr
   ```

2. **방화벽 설정**
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw allow ssh
   sudo ufw enable
   ```

3. **SSL 인증서 설치**
   ```bash
   sudo ./setup-ssl.sh
   ```

4. **환경 변수 업데이트 및 재배포**
   ```bash
   # .env.production에서 NEXTAUTH_URL 수정
   docker-compose -f docker-compose.production.yml down
   docker-compose -f docker-compose.production.yml up -d --build
   ```

5. **테스트**
   ```bash
   curl -I https://obesity.ai.kr
   ```

## 📞 추가 지원이 필요한 경우

다음 정보를 수집하여 공유:

```bash
# 시스템 정보
uname -a
nginx -v

# 포트 상태
sudo netstat -tulpn | grep -E ':80|:443|:3000'

# DNS 상태
nslookup obesity.ai.kr

# Nginx 상태
sudo systemctl status nginx

# 인증서 확인
sudo ls -la /etc/letsencrypt/live/

# Nginx 설정
sudo cat /etc/nginx/sites-available/obesity.ai.kr

# 오류 로그
sudo tail -50 /var/log/nginx/error.log
```

## 🎯 요약

**현재 상태**: HTTP(80)는 작동하지만 HTTPS(443)는 SSL 인증서가 없어서 작동 안 함

**해결책**:
```bash
sudo ./setup-ssl.sh
```

이 스크립트가 자동으로:
- Certbot 설치
- SSL 인증서 발급
- Nginx 설정 업데이트
- 자동 갱신 설정

을 처리합니다.
