# 외부 WiFi 접속 문제 - 간단한 해결 방법

## 📝 현재 상황
- ✅ **모바일 데이터**: 접속 가능
- ❌ **다른 WiFi**: 접속 불가

## ✅ 해결 방법: hosts 파일 수정

다른 WiFi에서 접속하는 **컴퓨터**에서 hosts 파일에 한 줄만 추가하면 됩니다.

---

## 🪟 Windows 컴퓨터

### 1단계: 메모장을 관리자 권한으로 실행

1. 키보드에서 `Windows 키` 누르기
2. "메모장" 입력
3. 메모장에서 **마우스 우클릭**
4. **"관리자 권한으로 실행"** 클릭

### 2단계: hosts 파일 열기

메모장에서:
1. **파일 → 열기** 클릭
2. 파일 경로에 다음 입력:
   ```
   C:\Windows\System32\drivers\etc\hosts
   ```
3. **중요!** 오른쪽 아래 "파일 형식"을 **"모든 파일 (*.*)"**로 변경
4. `hosts` 파일 선택 → 열기

### 3단계: 내용 추가

파일 **맨 아래**에 다음 두 줄 추가:
```
192.168.219.106 obesity.ai.kr
192.168.219.106 www.obesity.ai.kr
```

### 4단계: 저장

1. **파일 → 저장** (Ctrl+S)
2. 메모장 닫기

### 5단계: DNS 캐시 초기화 (선택사항)

명령 프롬프트(관리자)를 열고:
```cmd
ipconfig /flushdns
```

### 6단계: 테스트

브라우저에서 접속:
```
https://obesity.ai.kr
```

---

## 🍎 Mac 컴퓨터

### 1단계: 터미널 열기

1. `Command + Space` (Spotlight 검색)
2. "터미널" 입력 → Enter

### 2단계: hosts 파일 수정

터미널에서 다음 명령어 실행:
```bash
sudo nano /etc/hosts
```

암호 입력 (Mac 로그인 암호)

### 3단계: 내용 추가

파일 **맨 아래**에 다음 추가:
```
192.168.219.106 obesity.ai.kr
192.168.219.106 www.obesity.ai.kr
```

### 4단계: 저장

1. `Ctrl + O` (저장)
2. `Enter` (확인)
3. `Ctrl + X` (종료)

### 5단계: DNS 캐시 초기화

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### 6단계: 테스트

브라우저에서 접속:
```
https://obesity.ai.kr
```

---

## 🐧 Linux 컴퓨터

### 터미널에서 실행:

```bash
# hosts 파일 수정
sudo nano /etc/hosts

# 맨 아래에 추가:
192.168.219.106 obesity.ai.kr
192.168.219.106 www.obesity.ai.kr

# 저장: Ctrl+O, Enter, Ctrl+X

# DNS 캐시 초기화 (선택사항)
sudo systemd-resolve --flush-caches
```

---

## 📱 스마트폰

스마트폰은 hosts 파일 수정이 어렵습니다.

**해결책**:
- **모바일 데이터로 접속** (이미 작동 확인됨)
- WiFi 환경에서는 위의 방법으로 컴퓨터에서 접속

---

## 🔍 잘 안 되면 확인할 것

### 1. hosts 파일 형식 확인

다음과 같은 형식이어야 합니다:
```
# 기존 내용들...

192.168.219.106 obesity.ai.kr
192.168.219.106 www.obesity.ai.kr
```

**주의**:
- IP와 도메인 사이는 **탭(Tab)** 또는 **공백**
- 줄 앞에 `#`이 있으면 안 됨 (주석 처리됨)

### 2. 브라우저 캐시 삭제

- `Ctrl + Shift + Delete` (Windows/Linux)
- `Command + Shift + Delete` (Mac)
- "캐시된 이미지 및 파일" 선택 → 삭제

### 3. 시크릿/프라이빗 모드로 테스트

- Chrome: `Ctrl + Shift + N`
- Firefox: `Ctrl + Shift + P`
- Safari: `Command + Shift + N`

---

## ⚠️ 주의사항

### 장점
- ✅ 설정이 매우 간단 (5분이면 완료)
- ✅ 추가 프로그램 설치 불필요
- ✅ 무료

### 단점
- ⚠️ 접속하는 **각 컴퓨터마다** 설정 필요
- ⚠️ 서버 IP가 바뀌면 다시 수정 필요
- ⚠️ 스마트폰에서는 설정 어려움

---

## 💡 언제 사용하나요?

### 이 방법을 사용하기 좋은 경우:
- 접속하는 컴퓨터가 1~3대 정도
- 빠르게 테스트하고 싶을 때
- 일시적인 해결책으로 충분할 때

### 더 나은 방법이 필요한 경우:
- 많은 사람이 접속해야 할 때
- 스마트폰에서도 접속이 필요할 때
- 영구적인 해결책이 필요할 때

→ 이런 경우 **Cloudflare Tunnel** 또는 **공유기 헤어핀 NAT 설정** 필요

자세한 내용은 `NAT_HAIRPIN_ISSUE.md` 참고

---

## ✅ 요약

1. **관리자 권한으로 메모장 실행** (Windows)
2. **C:\Windows\System32\drivers\etc\hosts 열기**
3. **맨 아래에 추가**:
   ```
   192.168.219.106 obesity.ai.kr
   192.168.219.106 www.obesity.ai.kr
   ```
4. **저장**
5. **브라우저에서 https://obesity.ai.kr 접속**

끝!
