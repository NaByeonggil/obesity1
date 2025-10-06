# obesity.ai.kr 서빙에 필요한 포트 설정

## 🔌 필수 포트 (반드시 열어야 함)

### 1. **포트 80 (HTTP)**
- **용도**: 웹사이트 HTTP 접속
- **프로토콜**: TCP
- **설명**:
  - 사용자가 http://obesity.ai.kr 로 접속할 때 사용
  - SSL 설치 후에는 443으로 자동 리다이렉트됨
  - Let's Encrypt 인증서 발급 시에도 필요
- **방화벽 설정**:
  ```bash
  sudo ufw allow 80/tcp
  # 또는
  sudo ufw allow http
  ```

### 2. **포트 443 (HTTPS)**
- **용도**: 웹사이트 HTTPS 접속 (SSL)
- **프로토콜**: TCP
- **설명**:
  - SSL 인증서 설치 후 https://obesity.ai.kr 로 접속할 때 사용
  - 안전한 연결을 위해 필수
- **방화벽 설정**:
  ```bash
  sudo ufw allow 443/tcp
  # 또는
  sudo ufw allow https
  ```

### 3. **포트 22 (SSH)**
- **용도**: 서버 원격 접속
- **프로토콜**: TCP
- **설명**:
  - 서버 관리 및 배포를 위한 SSH 접속
  - 보안을 위해 포트 변경 권장
- **방화벽 설정**:
  ```bash
  sudo ufw allow 22/tcp
  # 또는
  sudo ufw allow ssh
  ```

## 🔒 내부 포트 (외부에서 접근 불가, Docker 내부용)

### 4. **포트 3000 (Next.js 애플리케이션)**
- **용도**: Next.js 앱 실행
- **접근**: localhost에서만 접근 가능
- **설명**:
  - Nginx가 리버스 프록시로 이 포트에 연결
  - 외부에서 직접 접근하면 안 됨
- **Docker 설정**: 내부 포트로만 바인딩됨

### 5. **포트 3306 (MySQL/MariaDB)**
- **용도**: 데이터베이스
- **접근**: Docker 네트워크 내부에서만 접근
- **설명**:
  - 애플리케이션에서 DB 접속용
  - 외부에서 직접 접근하면 안 됨 (보안상 위험)
  - 외부 DB 관리 툴 사용 시에만 열기
- **Docker 설정**: 내부 포트로만 바인딩됨

## 🛠️ 전체 방화벽 설정 (UFW)

### 한번에 모든 포트 열기
```bash
# 1. UFW 초기화 (기존 설정이 있다면)
sudo ufw --force reset

# 2. 기본 정책 설정
sudo ufw default deny incoming
sudo ufw default allow outgoing

# 3. 필수 포트 열기
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# 4. UFW 활성화
sudo ufw enable

# 5. 상태 확인
sudo ufw status verbose
```

### 간단한 방법 (Nginx Full 프로필 사용)
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw enable
sudo ufw status
```

## 🌐 클라우드 제공업체별 설정

### AWS (EC2)
Security Group에서 Inbound Rules 설정:
```
Type        Protocol    Port Range    Source
HTTP        TCP         80            0.0.0.0/0
HTTPS       TCP         443           0.0.0.0/0
SSH         TCP         22            내 IP (권장) 또는 0.0.0.0/0
```

### Azure (VM)
Network Security Group에서 Inbound security rules 설정:
```
Priority    Name        Port    Protocol    Source        Destination
100         HTTP        80      TCP         Any           Any
110         HTTPS       443     TCP         Any           Any
120         SSH         22      TCP         Any           Any
```

### GCP (Compute Engine)
Firewall rules 설정:
```
Name            Targets     Filters                 Protocols/Ports
allow-http      All         IP ranges: 0.0.0.0/0   tcp:80
allow-https     All         IP ranges: 0.0.0.0/0   tcp:443
allow-ssh       All         IP ranges: 0.0.0.0/0   tcp:22
```

### 네이버 클라우드 (Server)
ACG(Access Control Group) 설정:
```
프로토콜    접근 소스         허용 포트
TCP        0.0.0.0/0        80
TCP        0.0.0.0/0        443
TCP        내 IP(권장)       22
```

## 📊 포트 사용 현황 확인

### 열려있는 포트 확인
```bash
# 현재 리스닝 중인 포트
sudo netstat -tulpn | grep LISTEN

# 또는 (ss 사용)
sudo ss -tulpn | grep LISTEN

# UFW 상태
sudo ufw status numbered
```

### 특정 포트 확인
```bash
# 80번 포트
sudo lsof -i :80

# 443번 포트
sudo lsof -i :443

# 3000번 포트 (Next.js)
sudo lsof -i :3000

# 3306번 포트 (MySQL)
sudo lsof -i :3306
```

## 🔐 보안 권장사항

### 1. SSH 포트 변경 (선택사항)
```bash
# /etc/ssh/sshd_config 편집
sudo nano /etc/ssh/sshd_config

# Port 22를 다른 번호로 변경 (예: Port 2222)
Port 2222

# SSH 재시작
sudo systemctl restart ssh

# 새 포트 허용
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp
```

### 2. 불필요한 포트 차단
```bash
# 3000번 포트는 외부에서 접근 불가하도록 설정
sudo ufw deny 3000/tcp

# 3306번 포트도 외부 접근 차단
sudo ufw deny 3306/tcp
```

### 3. IP 기반 접근 제한 (선택사항)
```bash
# 특정 IP에서만 SSH 접근 허용
sudo ufw allow from 123.456.789.000 to any port 22

# 사무실 IP에서만 접근 허용 (예시)
sudo ufw allow from 123.456.789.000/24
```

### 4. Fail2Ban 설치 (무차별 대입 공격 방지)
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 📝 포트 요약표

| 포트 | 서비스 | 외부 접근 | 용도 | 필수 여부 |
|------|--------|----------|------|----------|
| 22   | SSH    | ✅ 제한 권장 | 서버 관리 | ✅ 필수 |
| 80   | HTTP   | ✅ 허용 | 웹 접속 | ✅ 필수 |
| 443  | HTTPS  | ✅ 허용 | 보안 웹 접속 | ✅ 필수 |
| 3000 | Next.js | ❌ 차단 | 앱 서버 (내부) | ⚠️ 내부 전용 |
| 3306 | MySQL  | ❌ 차단 | 데이터베이스 (내부) | ⚠️ 내부 전용 |

## 🚨 주의사항

1. **3000, 3306 포트는 절대 외부에 노출하지 마세요!**
   - 보안 취약점이 될 수 있습니다
   - Nginx를 통해서만 접근해야 합니다

2. **SSH 포트 보안**
   - 가능하면 22번 포트 변경
   - 키 기반 인증 사용 권장
   - 특정 IP에서만 접근 허용

3. **방화벽 활성화 전 SSH 접속 확인**
   - SSH 포트가 허용되었는지 확인
   - 그렇지 않으면 서버 접속 불가!

## 🔍 문제 해결

### 웹사이트에 접속이 안 됨
```bash
# 1. Nginx 상태 확인
sudo systemctl status nginx

# 2. 포트 80, 443이 열려있는지 확인
sudo ufw status | grep -E '80|443'

# 3. Nginx가 80, 443 포트를 리스닝하는지 확인
sudo netstat -tulpn | grep nginx
```

### Docker 컨테이너 포트 확인
```bash
# 실행 중인 컨테이너의 포트 매핑 확인
docker ps --format "table {{.Names}}\t{{.Ports}}"

# 또는
docker-compose -f docker-compose.production.yml ps
```

### 외부에서 포트 접근 테스트
```bash
# 다른 컴퓨터에서 실행
# 80번 포트 확인
telnet obesity.ai.kr 80

# 또는 nmap 사용
nmap -p 80,443 obesity.ai.kr
```
