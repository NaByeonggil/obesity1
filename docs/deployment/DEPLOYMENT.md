# obesity.ai.kr 도메인 배포 가이드

## 1. 사전 준비

### DNS 설정
도메인 관리 페이지에서 다음 DNS 레코드를 추가하세요:

```
A 레코드: obesity.ai.kr → 서버 IP 주소
A 레코드: www.obesity.ai.kr → 서버 IP 주소
```

## 2. Nginx 설치 (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 3. Nginx 설정

### 설정 파일 복사
```bash
sudo cp /home/nbg/바탕화면/obesity1/nginx.conf /etc/nginx/sites-available/obesity.ai.kr
sudo ln -s /etc/nginx/sites-available/obesity.ai.kr /etc/nginx/sites-enabled/
```

### 기본 설정 비활성화 (선택사항)
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 설정 테스트
```bash
sudo nginx -t
```

### Nginx 재시작
```bash
sudo systemctl restart nginx
```

## 4. SSL 인증서 설치 (Let's Encrypt)

### Certbot 설치
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### SSL 인증서 발급
```bash
sudo certbot --nginx -d obesity.ai.kr -d www.obesity.ai.kr
```

이메일 입력 및 약관 동의 후 인증서가 자동으로 설치됩니다.

### 자동 갱신 설정
```bash
sudo systemctl status certbot.timer
```

## 5. Next.js 애플리케이션 실행

### Docker Compose 사용
```bash
cd /home/nbg/바탕화면/obesity1
docker-compose -f docker-compose.production.yml up -d
```

### 애플리케이션이 3000 포트에서 실행 중인지 확인
```bash
curl http://localhost:3000
```

## 6. 방화벽 설정 (UFW 사용 시)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
```

## 7. 환경 변수 설정

`.env.production` 파일에서 도메인 관련 설정 확인:

```env
NEXTAUTH_URL=https://obesity.ai.kr
NEXT_PUBLIC_API_URL=https://obesity.ai.kr/api
```

도메인 변경 후 Docker 재빌드:
```bash
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

## 8. 배포 확인

브라우저에서 다음 URL로 접속:
- http://obesity.ai.kr (HTTP)
- https://obesity.ai.kr (HTTPS - SSL 설치 후)

## 9. 로그 확인

### Nginx 로그
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Docker 로그
```bash
docker-compose -f docker-compose.production.yml logs -f
```

## 10. 문제 해결

### 502 Bad Gateway 오류
- Next.js 애플리케이션이 실행 중인지 확인: `docker ps`
- 3000 포트가 열려있는지 확인: `netstat -tulpn | grep 3000`

### DNS 전파 확인
```bash
nslookup obesity.ai.kr
dig obesity.ai.kr
```

### Nginx 설정 오류
```bash
sudo nginx -t
sudo systemctl status nginx
```

## 11. 성능 최적화

### PM2를 사용한 프로세스 관리 (선택사항)
Docker 대신 직접 실행 시:
```bash
npm install -g pm2
pm2 start npm --name "obesity-platform" -- start
pm2 startup
pm2 save
```

### Nginx 캐싱
설정 파일에 이미 포함되어 있습니다.

## 12. 모니터링

### 시스템 리소스 모니터링
```bash
htop
docker stats
```

### 애플리케이션 상태 확인
```bash
curl -I https://obesity.ai.kr
```

## 보안 권장사항

1. **정기적인 업데이트**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **SSH 보안 강화**
   - 키 기반 인증 사용
   - 포트 변경
   - 루트 로그인 비활성화

3. **백업 설정**
   - 데이터베이스 정기 백업
   - 환경 변수 파일 백업

4. **모니터링 도구 설치**
   - Uptime monitoring (예: UptimeRobot)
   - Error tracking (예: Sentry)

## 참고 자료

- Next.js Production Deployment: https://nextjs.org/docs/deployment
- Nginx Documentation: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org/
- Docker Compose: https://docs.docker.com/compose/
