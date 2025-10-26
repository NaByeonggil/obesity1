# 자동 시작 설정 완료

## ✅ 설정 완료 사항

시스템 재부팅 후에도 Obesity1 헬스케어 플랫폼이 자동으로 시작되도록 설정되었습니다.

### 설정된 내용

1. **Docker 서비스 자동 시작**: 시스템 부팅 시 Docker 데몬이 자동으로 시작됩니다.
2. **Obesity1 systemd 서비스**: `/etc/systemd/system/obesity1-docker.service` 설치 완료
3. **자동 시작 활성화**: 부팅 시 Docker Compose 컨테이너들이 자동으로 시작됩니다.

### 현재 상태

```
● obesity1-docker.service - Obesity1 Healthcare Platform Docker Compose Service
     Loaded: loaded (/etc/systemd/system/obesity1-docker.service; enabled)
     Active: active (exited)
```

**실행 중인 컨테이너:**
- `obesity1_app_production` - Next.js 애플리케이션 (포트 3000)
- `obesity1_mariadb_production` - MariaDB 데이터베이스 (포트 3307)

## 📋 유용한 명령어

### 서비스 관리

```bash
# 서비스 상태 확인
sudo systemctl status obesity1-docker

# 서비스 중지
sudo systemctl stop obesity1-docker

# 서비스 시작
sudo systemctl start obesity1-docker

# 서비스 재시작
sudo systemctl restart obesity1-docker

# 자동 시작 비활성화
sudo systemctl disable obesity1-docker

# 자동 시작 활성화
sudo systemctl enable obesity1-docker
```

### Docker 컨테이너 관리

```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.production.yml ps

# 로그 확인
docker-compose -f docker-compose.production.yml logs

# 실시간 로그 확인
docker-compose -f docker-compose.production.yml logs -f

# 앱 로그만 확인
docker-compose -f docker-compose.production.yml logs app

# 데이터베이스 로그만 확인
docker-compose -f docker-compose.production.yml logs db

# 컨테이너 중지
docker-compose -f docker-compose.production.yml down

# 컨테이너 시작
docker-compose -f docker-compose.production.yml up -d

# 컨테이너 재시작
docker-compose -f docker-compose.production.yml restart
```

## 🔄 재부팅 테스트

시스템을 재부팅하여 자동 시작이 정상적으로 작동하는지 확인할 수 있습니다:

```bash
# 시스템 재부팅
sudo reboot

# 재부팅 후 서비스 상태 확인
sudo systemctl status obesity1-docker
docker-compose -f /home/nbg/바탕화면/obesity1/docker-compose.production.yml ps
```

## 🌐 접속 정보

재부팅 후 다음 URL로 접속 가능합니다:
- **웹사이트**: http://obesity.ai.kr 또는 http://localhost:3000
- **데이터베이스**: localhost:3307 (MariaDB)

## 📝 작동 원리

1. **시스템 부팅**
   - systemd가 `docker.service` 시작
   - Docker 데몬 실행

2. **Obesity1 서비스 시작**
   - systemd가 `obesity1-docker.service` 시작
   - Docker Compose가 컨테이너들을 시작:
     - MariaDB 컨테이너 (먼저 시작, healthcheck 대기)
     - Next.js 애플리케이션 (DB 준비 후 시작)

3. **자동 재시작 정책**
   - `restart: always` 정책으로 컨테이너 충돌 시 자동 재시작
   - Docker 데몬 재시작 시에도 컨테이너 자동 재시작

## 🛠️ 문제 해결

### 서비스가 시작되지 않는 경우

```bash
# 서비스 로그 확인
sudo journalctl -u obesity1-docker.service -n 50

# Docker 서비스 확인
sudo systemctl status docker

# Docker 컨테이너 로그 확인
cd /home/nbg/바탕화면/obesity1
docker-compose -f docker-compose.production.yml logs
```

### 수동으로 다시 설정하기

```bash
cd /home/nbg/바탕화면/obesity1
bash setup-autostart.sh
```

## ⚠️ 주의사항

- 시스템 재부팅 시 컨테이너 시작까지 약 30초~1분 정도 소요될 수 있습니다.
- MariaDB 컨테이너가 먼저 완전히 시작된 후 애플리케이션이 시작됩니다.
- 포트 3000과 3307이 다른 애플리케이션에서 사용되지 않도록 주의하세요.

## 📅 설정 일시

설정 완료: 2025-10-26 20:48:29 KST
