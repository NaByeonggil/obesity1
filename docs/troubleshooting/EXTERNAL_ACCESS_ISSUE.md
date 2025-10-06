# 외부 접속 불가 문제 진단 및 해결

## 🔍 문제 진단 결과

### ✅ 서버 상태 (정상)
- **서버 내부 IP**: 192.168.219.106 (로컬 네트워크)
- **공인 IP**: 182.221.232.82
- **DNS 설정**: obesity.ai.kr → 182.221.232.82 ✓
- **Nginx**: 0.0.0.0:80, 0.0.0.0:443 리스닝 ✓
- **SSL 인증서**: 정상 ✓

### ❌ 문제점 발견

**서버가 사설 IP(192.168.x.x)를 사용하는 가정/사무실 환경입니다.**

이는 서버가 공유기(라우터) 뒤에 있다는 의미이며, 외부에서 접속하려면 **포트포워딩** 설정이 필요합니다.

---

## 🚨 외부 접속이 안 되는 이유

### 현재 네트워크 구조:
```
인터넷 → 공유기(182.221.232.82) → 서버(192.168.219.106)
                 ↑
            포트포워딩 필요!
```

**문제**: 공유기에서 포트포워딩이 설정되어 있지 않아 외부 트래픽이 서버로 전달되지 않음

---

## ✅ 해결 방법

### 방법 1: 포트포워딩 설정 (권장)

공유기(라우터) 관리 페이지에서 포트포워딩을 설정해야 합니다.

#### 1단계: 공유기 관리 페이지 접속

보통 다음 주소 중 하나:
- http://192.168.219.1 (가장 일반적)
- http://192.168.0.1
- http://192.168.1.1
- http://10.0.0.1

또는:
```bash
# 기본 게이트웨이 확인
ip route | grep default
# 출력 예: default via 192.168.219.1
```

#### 2단계: 포트포워딩 규칙 추가

공유기 관리 페이지에서 다음 설정을 추가:

**규칙 1: HTTP (포트 80)**
```
서비스 이름: HTTP
외부 포트: 80
내부 IP 주소: 192.168.219.106
내부 포트: 80
프로토콜: TCP
상태: 활성화
```

**규칙 2: HTTPS (포트 443)**
```
서비스 이름: HTTPS
외부 포트: 443
내부 IP 주소: 192.168.219.106
내부 포트: 443
프로토콜: TCP
상태: 활성화
```

**규칙 3: SSH (포트 22) - 선택사항**
```
서비스 이름: SSH
외부 포트: 22 (또는 다른 포트)
내부 IP 주소: 192.168.219.106
내부 포트: 22
프로토콜: TCP
상태: 활성화
```

#### 3단계: 서버 IP 고정

포트포워딩이 계속 작동하려면 서버의 내부 IP를 고정해야 합니다.

**옵션 A: 공유기에서 DHCP 예약 (권장)**
- 공유기 관리 페이지 → DHCP 설정 → IP 예약/고정
- 서버의 MAC 주소에 192.168.219.106 IP 할당

**옵션 B: 서버에서 고정 IP 설정**
```bash
# NetworkManager 사용 (Ubuntu)
sudo nmcli connection modify "유선 연결 1" \
  ipv4.addresses 192.168.219.106/24 \
  ipv4.gateway 192.168.219.1 \
  ipv4.dns "8.8.8.8,8.8.4.4" \
  ipv4.method manual

sudo nmcli connection up "유선 연결 1"
```

---

### 방법 2: DMZ 설정 (간단하지만 보안 위험)

**주의**: DMZ는 서버를 인터넷에 직접 노출시키므로 보안상 권장하지 않음

공유기 관리 페이지에서:
1. DMZ 설정 메뉴 찾기
2. DMZ 호스트 IP: 192.168.219.106 입력
3. DMZ 활성화

**보안 위험**: 모든 포트가 열리므로 방화벽 설정 필수!

---

### 방법 3: Cloudflare Tunnel (포트포워딩 불가능할 때)

포트포워딩이 불가능한 환경(공용 네트워크, ISP 차단 등)에서 사용

#### 설치:
```bash
# Cloudflared 설치
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Cloudflare 로그인
cloudflared tunnel login

# 터널 생성
cloudflared tunnel create obesity-tunnel

# 터널 라우팅
cloudflared tunnel route dns obesity-tunnel obesity.ai.kr

# 설정 파일 생성
cat > ~/.cloudflared/config.yml << EOF
tunnel: obesity-tunnel
credentials-file: /home/$(whoami)/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: obesity.ai.kr
    service: http://localhost:3000
  - hostname: www.obesity.ai.kr
    service: http://localhost:3000
  - service: http_status:404
EOF

# 터널 실행
cloudflared tunnel run obesity-tunnel
```

---

## 🧪 포트포워딩 테스트

### 1. 외부에서 테스트 (스마트폰 LTE 사용)

스마트폰에서 WiFi를 끄고 모바일 데이터로:
```
http://obesity.ai.kr
https://obesity.ai.kr
```

### 2. 온라인 포트 체크 도구

다음 사이트에서 포트가 열려있는지 확인:
- https://www.yougetsignal.com/tools/open-ports/
- https://portchecker.co/

**입력**:
- IP: 182.221.232.82 (또는 obesity.ai.kr)
- Port: 80, 443

**예상 결과**:
- 포트포워딩 전: "Port is closed" ❌
- 포트포워딩 후: "Port is open" ✅

### 3. 명령어로 테스트

외부 서버(VPS 등)에서:
```bash
# HTTP 테스트
curl -I http://obesity.ai.kr

# HTTPS 테스트
curl -I https://obesity.ai.kr

# 포트 연결 테스트
nc -zv obesity.ai.kr 80
nc -zv obesity.ai.kr 443
```

---

## 📋 공유기별 포트포워딩 설정 방법

### 일반적인 공유기 메뉴 위치:

**공통 경로**:
```
관리자 페이지 로그인
→ 고급 설정 / Advanced
→ NAT / 포트포워딩 / Port Forwarding / Virtual Server
→ 새 규칙 추가
```

### 주요 공유기 제조사별:

1. **ipTIME (아이피타임)**
   - http://192.168.0.1
   - 관리도구 → 고급 설정 → NAT/라우터 관리 → 포트포워드 설정

2. **KT (olleh WiFi)**
   - http://172.30.1.254
   - 고급 설정 → NAT/라우터 기능 → 포트 포워딩

3. **SK 브로드밴드**
   - http://192.168.35.1
   - 관리도구 → 고급 설정 → 포트포워딩

4. **LG U+**
   - http://192.168.219.1
   - 고급설정 → 보안 → 포트포워딩

5. **TP-Link**
   - http://192.168.0.1
   - Advanced → NAT Forwarding → Virtual Servers

6. **ASUS**
   - http://192.168.1.1
   - WAN → Virtual Server/Port Forwarding

---

## 🔧 트러블슈팅

### 문제 1: 공유기 관리 페이지 접속 안 됨
```bash
# 기본 게이트웨이 확인
ip route | grep default

# 또는
route -n | grep "^0.0.0.0"
```

### 문제 2: 포트포워딩 설정했는데도 안 됨

**체크리스트**:
- [ ] 서버 IP가 맞는가? (192.168.219.106)
- [ ] 포트 번호가 맞는가? (80, 443)
- [ ] 프로토콜이 TCP인가?
- [ ] 규칙이 활성화되어 있는가?
- [ ] 공유기를 재시작했는가?
- [ ] 서버 방화벽이 꺼져있는가? (UFW 비활성 확인됨 ✓)

### 문제 3: ISP(통신사)에서 80, 443 포트 차단

일부 ISP는 가정용 인터넷에서 웹 서버 운영을 제한합니다.

**해결책**:
1. ISP에 문의하여 포트 개방 요청
2. 비표준 포트 사용 (예: 8080, 8443)
3. Cloudflare Tunnel 사용
4. 클라우드 서버(AWS, GCP 등)로 이전

### 문제 4: 동적 IP 문제

공인 IP가 주기적으로 바뀌는 경우:

**해결책 A: DDNS 사용**
```bash
# No-IP 또는 DuckDNS 사용
# 예: obesity.duckdns.org → 현재 IP로 자동 업데이트
```

**해결책 B: Cloudflare API로 자동 업데이트**
```bash
# 크론잡으로 IP 변경 시 자동 업데이트
```

---

## 📊 현재 상황 요약

### ✅ 정상 작동:
- 서버 내부에서 접속: ✓
- localhost 접속: ✓
- 같은 네트워크(192.168.219.x)에서 접속: ✓
- SSL 인증서: ✓
- DNS 설정: ✓

### ❌ 작동 안 함:
- 외부 인터넷에서 접속: ✗

### 🔧 필요한 조치:
1. **공유기 포트포워딩 설정** (필수)
   - 포트 80 → 192.168.219.106:80
   - 포트 443 → 192.168.219.106:443

2. **서버 IP 고정** (권장)
   - DHCP 예약 또는 고정 IP 설정

3. **테스트**
   - 모바일 데이터로 접속 확인

---

## 🎯 빠른 해결 가이드

### 1단계: 공유기 접속
```bash
# 게이트웨이 IP 확인
ip route | grep default
# 출력: default via 192.168.219.1

# 브라우저에서 접속
http://192.168.219.1
```

### 2단계: 포트포워딩 추가
```
포트 80:  192.168.219.106:80
포트 443: 192.168.219.106:443
```

### 3단계: 공유기 재시작

### 4단계: 테스트
```bash
# 스마트폰 LTE로
https://obesity.ai.kr
```

---

## 💡 대안: 클라우드 서버 사용

가정/사무실 환경의 제약이 많다면 클라우드 서버 사용 권장:

**장점**:
- 포트포워딩 불필요
- 고정 IP 제공
- 안정적인 네트워크
- 더 나은 성능

**옵션**:
- AWS EC2 (프리티어 1년 무료)
- Google Cloud Compute Engine (300$ 크레딧)
- DigitalOcean (5$/월~)
- Vultr (2.5$/월~)
- Oracle Cloud (무료 티어 평생)

---

## 📞 추가 지원

다음 정보 확인 필요:
```bash
# 1. 네트워크 정보
ip route
ip addr

# 2. 공유기 모델 확인
# (공유기 본체 뒷면 스티커 확인)

# 3. ISP(통신사) 확인
# KT, SK 브로드밴드, LG U+ 등
```

---

**결론**: 서버 자체는 정상이지만, **공유기 포트포워딩이 설정되지 않아** 외부에서 접속할 수 없습니다.
