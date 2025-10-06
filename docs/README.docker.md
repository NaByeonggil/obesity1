# Docker 프로덕션 배포 가이드

이 문서는 obesity1 헬스케어 플랫폼을 Docker를 사용하여 프로덕션 환경에 배포하는 방법을 설명합니다.

## 사전 요구사항

- Docker Engine 20.10+
- Docker Compose 2.0+
- 최소 2GB RAM
- 최소 10GB 디스크 공간

## 빠른 시작

### 1. 환경 변수 설정

`.env.production.example` 파일을 `.env.production`으로 복사하고 실제 값으로 수정하세요:

```bash
cp .env.production.example .env.production
```

필수 환경 변수:
- `NEXTAUTH_SECRET`: 안전한 랜덤 문자열 (최소 32자)
- `JWT_SECRET`: 안전한 랜덤 문자열 (최소 32자)
- `MYSQL_ROOT_PASSWORD`: MariaDB root 비밀번호
- `MYSQL_PASSWORD`: 애플리케이션 DB 사용자 비밀번호

랜덤 시크릿 생성:
```bash
openssl rand -base64 32
```

### 2. 프로덕션 빌드 및 실행

```bash
# 컨테이너 빌드 및 시작
docker-compose -f docker-compose.production.yml up -d --build

# 로그 확인
docker-compose -f docker-compose.production.yml logs -f

# 헬스 체크
docker-compose -f docker-compose.production.yml ps
```

### 3. 애플리케이션 접속

- 애플리케이션: http://localhost:3000
- 데이터베이스: localhost:3307

## Docker Compose 서비스

### 서비스 구성

#### `db` (MariaDB)
- **이미지**: mariadb:10.11
- **포트**: 3307:3306
- **볼륨**: mariadb_data (영구 데이터 저장)
- **헬스체크**: 자동 헬스 모니터링

#### `app` (Next.js 애플리케이션)
- **포트**: 3000:3000
- **의존성**: db 서비스 (헬스체크 통과 후 시작)
- **자동 실행**:
  - Prisma 마이그레이션 자동 적용
  - 애플리케이션 서버 시작

## 주요 명령어

### 컨테이너 관리

```bash
# 시작
docker-compose -f docker-compose.production.yml up -d

# 중지
docker-compose -f docker-compose.production.yml down

# 재시작
docker-compose -f docker-compose.production.yml restart

# 전체 제거 (볼륨 포함)
docker-compose -f docker-compose.production.yml down -v
```

### 로그 및 디버깅

```bash
# 전체 로그 보기
docker-compose -f docker-compose.production.yml logs

# 특정 서비스 로그
docker-compose -f docker-compose.production.yml logs app
docker-compose -f docker-compose.production.yml logs db

# 실시간 로그 추적
docker-compose -f docker-compose.production.yml logs -f app
```

### 데이터베이스 관리

```bash
# Prisma 마이그레이션 실행
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy

# Prisma Studio 실행 (개발용)
docker-compose -f docker-compose.production.yml exec app npx prisma studio

# 데이터베이스 직접 접속
docker-compose -f docker-compose.production.yml exec db mysql -u obesity1user -p obesity1

# 데이터베이스 백업
docker-compose -f docker-compose.production.yml exec db mysqldump -u obesity1user -p obesity1 > backup.sql

# 데이터베이스 복원
docker-compose -f docker-compose.production.yml exec -T db mysql -u obesity1user -p obesity1 < backup.sql
```

### 애플리케이션 관리

```bash
# 컨테이너 내부 접속
docker-compose -f docker-compose.production.yml exec app sh

# 애플리케이션 재빌드
docker-compose -f docker-compose.production.yml up -d --build app

# 리소스 사용량 확인
docker-compose -f docker-compose.production.yml stats
```

## 프로덕션 배포 체크리스트

### 보안
- [ ] `.env.production` 파일에 강력한 비밀번호 설정
- [ ] `NEXTAUTH_SECRET`와 `JWT_SECRET`을 랜덤 문자열로 설정
- [ ] 데이터베이스 포트 방화벽 설정 (필요시)
- [ ] HTTPS 설정 (리버스 프록시 사용 권장)

### 성능
- [ ] Next.js 빌드 최적화 확인 (`output: 'standalone'`)
- [ ] 이미지 최적화 설정 확인
- [ ] 데이터베이스 인덱스 확인

### 모니터링
- [ ] 로그 수집 시스템 구성
- [ ] 헬스체크 엔드포인트 모니터링
- [ ] 데이터베이스 백업 자동화

### 업데이트
- [ ] 무중단 배포 전략 수립
- [ ] 데이터베이스 마이그레이션 테스트
- [ ] 롤백 계획 수립

## 문제 해결

### 애플리케이션이 시작되지 않음

```bash
# 로그 확인
docker-compose -f docker-compose.production.yml logs app

# 데이터베이스 연결 확인
docker-compose -f docker-compose.production.yml exec app ping db
```

### 데이터베이스 연결 오류

```bash
# 데이터베이스 헬스체크 확인
docker-compose -f docker-compose.production.yml ps db

# 데이터베이스 로그 확인
docker-compose -f docker-compose.production.yml logs db
```

### 포트 충돌

기본 포트를 변경하려면 `docker-compose.production.yml` 파일의 `ports` 섹션을 수정:

```yaml
services:
  app:
    ports:
      - "8080:3000"  # 호스트:컨테이너
  db:
    ports:
      - "3308:3306"  # 호스트:컨테이너
```

## 프로덕션 권장 사항

### 리버스 프록시 사용 (Nginx)

프로덕션 환경에서는 Nginx를 리버스 프록시로 사용하여 HTTPS를 제공하는 것을 권장합니다:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 데이터 백업

정기적인 데이터베이스 백업을 설정하세요:

```bash
# 크론탭에 추가 (매일 오전 2시 백업)
0 2 * * * cd /path/to/project && docker-compose -f docker-compose.production.yml exec -T db mysqldump -u obesity1user -p${MYSQL_PASSWORD} obesity1 > backups/backup-$(date +\%Y\%m\%d).sql
```

### 로그 로테이션

Docker 로그가 너무 커지지 않도록 로그 로테이션을 설정하세요:

```yaml
# docker-compose.production.yml에 추가
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 성능 최적화

### 메모리 제한 설정

```yaml
# docker-compose.production.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
```

### CPU 제한 설정

```yaml
# docker-compose.production.yml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
```

## 지원

문제가 발생하면 다음을 확인하세요:
1. Docker 및 Docker Compose 버전
2. 시스템 리소스 사용량
3. 애플리케이션 및 데이터베이스 로그
4. 환경 변수 설정

## 라이센스

이 프로젝트의 라이센스를 확인하세요.
