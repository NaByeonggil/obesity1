# Docker 배포 및 재부팅 영속성 가이드

이 문서는 시스템 재부팅 후에도 Docker 컨테이너가 자동으로 시작되고 데이터가 보존되도록 설정하는 방법을 설명합니다.

## 자동 재시작 및 데이터 영속성 설정

### 1. Docker Compose 설정 확인

`docker-compose.production.yml` 파일에는 다음 설정이 포함되어 있습니다:

#### 자동 재시작 정책
```yaml
services:
  db:
    restart: always  # 시스템 재부팅 시 자동 시작
  app:
    restart: always  # 시스템 재부팅 시 자동 시작
```

#### 데이터 영속성 볼륨
```yaml
volumes:
  mariadb_data:          # 데이터베이스 데이터
  prescriptions_data:    # 처방전 PDF 파일
  app_cache:            # Next.js 캐시
```

### 2. Systemd 서비스 설정 (권장)

Docker 데몬이 시작되면 자동으로 애플리케이션을 실행하도록 systemd 서비스를 설정합니다.

#### 설치 방법

```bash
# 1. systemd 서비스 파일을 시스템 디렉토리로 복사
sudo cp obesity1.service /etc/systemd/system/

# 2. systemd 데몬 리로드
sudo systemctl daemon-reload

# 3. 서비스 활성화 (부팅 시 자동 시작)
sudo systemctl enable obesity1.service

# 4. 서비스 시작
sudo systemctl start obesity1.service

# 5. 서비스 상태 확인
sudo systemctl status obesity1.service
```

#### 서비스 관리 명령어

```bash
# 서비스 시작
sudo systemctl start obesity1.service

# 서비스 중지
sudo systemctl stop obesity1.service

# 서비스 재시작
sudo systemctl restart obesity1.service

# 서비스 상태 확인
sudo systemctl status obesity1.service

# 서비스 로그 확인
sudo journalctl -u obesity1.service -f

# 부팅 시 자동 시작 비활성화
sudo systemctl disable obesity1.service
```

### 3. Docker Compose만 사용하는 방법 (대안)

systemd 서비스를 사용하지 않는 경우, Docker의 `restart: always` 정책만으로도 재부팅 시 자동 시작이 가능합니다.

```bash
# Docker 컨테이너 시작
docker compose -f docker-compose.production.yml up -d

# Docker 데몬이 재시작되면 컨테이너도 자동으로 시작됨
```

**주의**: 이 방법은 Docker 데몬이 부팅 시 자동으로 시작되도록 설정되어 있어야 합니다:

```bash
# Docker 서비스 자동 시작 활성화
sudo systemctl enable docker.service
sudo systemctl enable containerd.service
```

## 환경 설정

### .env.production 파일 생성

프로덕션 환경 변수 파일을 생성합니다:

```bash
cp .env .env.production
```

`.env.production` 파일 예시:
```env
# Database Configuration
DATABASE_URL="mysql://obesity1user:obesity1password@db:3306/obesity1"
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=obesity1
MYSQL_USER=obesity1user
MYSQL_PASSWORD=obesity1password

# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://obesity.ai.kr
JWT_SECRET=your-jwt-secret-here

# OAuth Providers
KAKAO_CLIENT_ID=your-kakao-client-id
KAKAO_CLIENT_SECRET=your-kakao-client-secret
NAVER_CLIENT_ID=your-naver-client-id
NAVER_CLIENT_SECRET=your-naver-client-secret

# Node Environment
NODE_ENV=production
```

## 데이터 백업 및 복원

### 데이터베이스 백업

```bash
# 데이터베이스 백업
docker compose -f docker-compose.production.yml exec db \
  mysqldump -u obesity1user -p obesity1 > backup_$(date +%Y%m%d).sql

# 또는 볼륨 전체 백업
docker run --rm -v obesity1_mariadb_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mariadb_backup_$(date +%Y%m%d).tar.gz -C /data .
```

### 데이터베이스 복원

```bash
# SQL 파일에서 복원
docker compose -f docker-compose.production.yml exec -T db \
  mysql -u obesity1user -p obesity1 < backup_20251007.sql

# 볼륨 백업에서 복원
docker run --rm -v obesity1_mariadb_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/mariadb_backup_20251007.tar.gz -C /data
```

### 처방전 파일 백업

```bash
# 처방전 볼륨 백업
docker run --rm -v obesity1_prescriptions_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/prescriptions_backup_$(date +%Y%m%d).tar.gz -C /data .
```

## 볼륨 관리

### 볼륨 목록 확인

```bash
docker volume ls | grep obesity1
```

### 볼륨 상세 정보 확인

```bash
docker volume inspect obesity1_mariadb_data
docker volume inspect obesity1_prescriptions_data
docker volume inspect obesity1_app_cache
```

### 볼륨 삭제 (주의!)

```bash
# 모든 컨테이너 중지 후
docker compose -f docker-compose.production.yml down

# 볼륨까지 삭제하려면 (데이터가 완전히 삭제됨!)
docker compose -f docker-compose.production.yml down -v
```

## 배포 프로세스

### 전체 배포 절차

```bash
# 1. 최신 코드 가져오기
git pull origin main

# 2. 환경 변수 확인
cat .env.production

# 3. 이미지 빌드 및 컨테이너 재시작
docker compose -f docker-compose.production.yml up -d --build

# 4. 로그 확인
docker compose -f docker-compose.production.yml logs -f

# 5. 헬스체크 확인
docker compose -f docker-compose.production.yml ps
```

### 롤링 업데이트 (무중단 배포)

```bash
# 1. 새 이미지 빌드
docker compose -f docker-compose.production.yml build

# 2. 앱만 재시작 (DB는 유지)
docker compose -f docker-compose.production.yml up -d --no-deps --build app
```

## 문제 해결

### 컨테이너가 재부팅 후 시작되지 않는 경우

```bash
# 1. Docker 서비스 상태 확인
sudo systemctl status docker

# 2. Docker 로그 확인
sudo journalctl -u docker.service -f

# 3. 컨테이너 로그 확인
docker compose -f docker-compose.production.yml logs

# 4. 수동으로 시작
docker compose -f docker-compose.production.yml up -d
```

### 볼륨 데이터가 손실된 경우

```bash
# 볼륨 마운트 확인
docker inspect obesity1_mariadb_production | grep -A 10 Mounts

# 볼륨이 존재하는지 확인
docker volume inspect obesity1_mariadb_data
```

### 네트워크 문제

```bash
# 네트워크 확인
docker network ls | grep obesity1

# 네트워크 재생성
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d
```

## 모니터링

### 컨테이너 리소스 사용량 확인

```bash
docker stats obesity1_app_production obesity1_mariadb_production
```

### 디스크 사용량 확인

```bash
docker system df -v
```

## 보안 권장사항

1. **환경 변수 보안**: `.env.production` 파일의 권한을 제한하세요
   ```bash
   chmod 600 .env.production
   ```

2. **정기 백업**: 크론잡으로 자동 백업 설정
   ```bash
   # 매일 새벽 2시에 백업
   0 2 * * * cd /home/nbg/바탕화면/obesity1 && ./backup.sh
   ```

3. **로그 모니터링**: 정기적으로 로그를 확인하고 이상 징후를 모니터링하세요

4. **업데이트**: Docker 이미지와 시스템 패키지를 정기적으로 업데이트하세요
