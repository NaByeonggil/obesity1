# NAT 헤어핀(Hairpin NAT) 문제 해결 가이드

## 🔍 현재 상황

### ✅ 작동하는 경우
- **모바일 데이터(LTE/5G)**: 접속 가능 ✓
- **서버 내부(같은 네트워크)**: 접속 가능 ✓

### ❌ 작동하지 않는 경우
- **다른 공유기의 WiFi**: 접속 실패 ✗

---

## 🚨 문제 원인: NAT 헤어핀(Hairpin NAT) 미지원

### 문제 설명

```
[다른 WiFi 네트워크]
        ↓
   인터넷 (공인 IP: 182.221.232.82)
        ↓
   [당신의 공유기] ← 헤어핀 NAT 필요!
        ↓
   [서버: 192.168.219.106]
```

**헤어핀 NAT란?**
- 외부에서 공인 IP로 들어온 요청을 다시 내부 네트워크로 되돌려 보내는 기능
- 일부 공유기는 이 기능을 지원하지 않음
- 공유기가 "외부에서 온 요청"과 "같은 네트워크에서 공인 IP로 가는 요청"을 다르게 처리

### 왜 모바일은 되고 다른 WiFi는 안 되나?

| 접속 방법 | 경로 | 결과 |
|----------|------|------|
| 모바일 데이터 | 진짜 외부 → 공인 IP → 포트포워딩 → 서버 | ✅ 성공 |
| 다른 WiFi | 다른 네트워크 → 공인 IP → **헤어핀 필요** → 서버 | ❌ 실패 |
| 같은 WiFi | 내부 네트워크 → localhost → 서버 | ✅ 성공 |

---

## ✅ 해결 방법

### 방법 1: 공유기 설정에서 헤어핀 NAT 활성화 (권장)

일부 공유기는 이 기능을 지원합니다. 다음 이름으로 찾아보세요:

**설정 이름 (공유기마다 다름)**:
- Hairpin NAT
- NAT Loopback
- NAT Reflection
- Full Cone NAT
- 내부 네트워크 포트포워딩 허용

**위치**:
```
공유기 관리 페이지 (http://192.168.219.1)
→ 고급 설정
→ NAT 설정 / 포트포워딩
→ "NAT Loopback" 또는 "Hairpin NAT" 찾기
→ 활성화
```

**LG U+ 공유기**:
- 일부 모델은 지원하지 않을 수 있음
- 펌웨어 업데이트 확인

---

### 방법 2: Split DNS 설정 (매우 효과적)

공유기에서 **내부 DNS 설정**을 추가하여 같은 네트워크에서는 내부 IP로, 외부에서는 공인 IP로 연결되게 합니다.

#### 2-1. 공유기 DNS 설정 (지원하는 경우)

```
공유기 관리 페이지
→ DHCP 설정
→ DNS 설정 / 로컬 DNS
→ 다음 추가:

도메인: obesity.ai.kr
IP 주소: 192.168.219.106
```

#### 2-2. 또는 서버에 dnsmasq 설치

서버를 DNS 서버로 만들어 내부 요청 처리:

```bash
# dnsmasq 설치
sudo apt update
sudo apt install dnsmasq -y

# 설정 파일 생성
sudo bash -c 'cat > /etc/dnsmasq.d/local.conf << EOL
# 로컬 도메인 설정
address=/obesity.ai.kr/192.168.219.106

# 업스트림 DNS
server=8.8.8.8
server=8.8.4.4

# 인터페이스 설정
interface=enp3s0
bind-interfaces
EOL'

# dnsmasq 재시작
sudo systemctl restart dnsmasq
sudo systemctl enable dnsmasq

# 포트 53 열기
sudo ufw allow 53/tcp
sudo ufw allow 53/udp
```

**공유기 DHCP 설정에서 DNS를 서버 IP로 변경**:
```
DHCP 설정
→ DNS 서버: 192.168.219.106
```

---

### 방법 3: /etc/hosts 파일 수정 (클라이언트별)

각 클라이언트(접속하는 컴퓨터)에서 수동으로 설정:

**Windows**:
```cmd
# 관리자 권한으로 실행
notepad C:\Windows\System32\drivers\etc\hosts

# 다음 줄 추가
192.168.219.106 obesity.ai.kr www.obesity.ai.kr
```

**macOS/Linux**:
```bash
sudo nano /etc/hosts

# 다음 줄 추가
192.168.219.106 obesity.ai.kr www.obesity.ai.kr
```

**단점**: 각 기기마다 수동 설정 필요

---

### 방법 4: Cloudflare Tunnel 사용 (가장 확실)

포트포워딩과 NAT 문제를 완전히 우회:

```bash
# Cloudflared 설치
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Cloudflare 로그인 및 터널 생성
cloudflared tunnel login
cloudflared tunnel create obesity-tunnel

# 터널 라우팅
cloudflared tunnel route dns obesity-tunnel obesity.ai.kr

# 설정 파일
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << EOL
tunnel: obesity-tunnel
credentials-file: /home/$(whoami)/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: obesity.ai.kr
    service: http://localhost:3000
  - hostname: www.obesity.ai.kr
    service: http://localhost:3000
  - service: http_status:404
EOL

# 서비스로 등록
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

**장점**:
- 포트포워딩 불필요
- NAT 문제 완전 해결
- 모든 네트워크에서 접속 가능
- Cloudflare CDN 및 DDoS 보호 제공

---

### 방법 5: 공유기 교체 또는 펌웨어 업데이트

헤어핀 NAT를 지원하는 공유기로 교체하거나 펌웨어 업데이트:

**지원하는 공유기**:
- ipTIME (대부분 모델)
- ASUS 라우터
- TP-Link (고급 모델)
- 오픈소스 펌웨어 (OpenWrt, DD-WRT)

---

## 🧪 테스트 방법

### 1. 헤어핀 NAT 작동 확인

다른 WiFi 네트워크에서:
```bash
# DNS 확인
nslookup obesity.ai.kr
# 결과: 182.221.232.82 (공인 IP)

# 접속 테스트
curl -I https://obesity.ai.kr
```

### 2. Split DNS 작동 확인

같은 네트워크에서:
```bash
# DNS 확인
nslookup obesity.ai.kr
# 결과: 192.168.219.106 (내부 IP) ← 성공!

# 접속 테스트
curl -I https://obesity.ai.kr
```

---

## 📊 해결 방법 비교

| 방법 | 난이도 | 효과 | 비용 | 권장도 |
|------|--------|------|------|--------|
| 헤어핀 NAT 활성화 | 쉬움 | ⭐⭐⭐⭐⭐ | 무료 | ⭐⭐⭐⭐⭐ |
| Split DNS | 중간 | ⭐⭐⭐⭐⭐ | 무료 | ⭐⭐⭐⭐ |
| /etc/hosts 수정 | 쉬움 | ⭐⭐⭐ | 무료 | ⭐⭐ |
| Cloudflare Tunnel | 중간 | ⭐⭐⭐⭐⭐ | 무료 | ⭐⭐⭐⭐⭐ |
| 공유기 교체 | 어려움 | ⭐⭐⭐⭐⭐ | 5~20만원 | ⭐⭐ |

---

## 🎯 추천 해결 순서

### 1순위: 공유기에서 헤어핀 NAT 찾기
```
http://192.168.219.1 접속
→ 고급 설정에서 "NAT Loopback" 검색
→ 있으면 활성화
```

### 2순위: Cloudflare Tunnel (가장 확실)
```bash
# 위의 방법 4 실행
```

### 3순위: Split DNS 설정
```bash
# 위의 방법 2-2 실행 (dnsmasq)
```

---

## 🔧 현재 상태 진단 스크립트

```bash
#!/bin/bash

echo "=== NAT 헤어핀 진단 ==="
echo ""

echo "1. 내부 IP:"
ip addr show enp3s0 | grep "inet " | awk '{print $2}'

echo ""
echo "2. 공인 IP:"
curl -s ifconfig.me

echo ""
echo "3. 게이트웨이:"
ip route | grep default | awk '{print $3}'

echo ""
echo "4. DNS 조회 (obesity.ai.kr):"
nslookup obesity.ai.kr | grep "Address:" | tail -1

echo ""
echo "5. 로컬 접속 테스트:"
curl -I -s http://localhost:3000 | head -1

echo ""
echo "6. 내부 IP 접속 테스트:"
curl -I -s http://192.168.219.106 | head -1

echo ""
echo "7. 도메인 접속 테스트:"
curl -I -s https://obesity.ai.kr | head -1

echo ""
echo "=== 진단 완료 ==="
```

---

## 💡 왜 이런 문제가 생기나?

**기술적 설명**:

1. **다른 WiFi에서 접속 시도**:
   ```
   클라이언트 → "obesity.ai.kr로 가자!"
   DNS → "182.221.232.82야"
   클라이언트 → 182.221.232.82로 요청
   ```

2. **공유기의 혼란**:
   ```
   공유기: "어? 182.221.232.82는 나 자신인데?"
   공유기: "내부에서 나한테 오는 요청은 어떻게 처리하지?"
   ```

3. **헤어핀 NAT 미지원 공유기**:
   ```
   공유기: "모르겠다, 버려!" → 연결 실패
   ```

4. **헤어핀 NAT 지원 공유기**:
   ```
   공유기: "아, 포트포워딩 규칙을 확인해서 192.168.219.106으로 보내자!"
   → 연결 성공
   ```

---

## 📞 추가 확인 사항

### 공유기 모델 확인
```bash
# 공유기 본체 뒷면 스티커 확인
# 모델명: _________________
# 제조사: LG U+ / KT / SK / ipTIME / 기타
```

### 펌웨어 버전
```
공유기 관리 페이지
→ 시스템 정보
→ 펌웨어 버전 확인
→ 업데이트 가능 여부 확인
```

---

## ✅ 결론

**현재 상황**: 모바일 데이터로는 접속 가능 → 포트포워딩은 정상 ✓

**문제**: 다른 WiFi에서 접속 불가 → 공유기가 헤어핀 NAT 미지원

**해결책**:
1. 공유기 설정에서 헤어핀 NAT 활성화 (가능한 경우)
2. Cloudflare Tunnel 사용 (가장 확실하고 권장)
3. Split DNS 설정 (내부 네트워크용)

**가장 빠른 해결**: Cloudflare Tunnel 설치 (위 방법 4)

