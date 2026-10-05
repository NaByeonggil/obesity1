#!/bin/bash

# obesity.ai.kr 배포 스크립트 (Docker Compose + Caddy)
# HTTPS 인증서는 Caddy가 Let's Encrypt에서 자동 발급/갱신합니다.

set -e  # 오류 발생 시 스크립트 중단

# .env.production 을 치환용으로도 읽어 빌드 인자(NEXT_PUBLIC_KAKAO_MAP_KEY)를 채움
COMPOSE="docker compose --env-file .env.production -f docker-compose.production.yml"

echo "=================================="
echo "obesity.ai.kr 배포 시작"
echo "=================================="

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 사전 확인
echo -e "\n${YELLOW}[1/4] 사전 확인...${NC}"
if ! docker compose version &> /dev/null; then
    echo -e "${RED}✗ docker compose 를 찾을 수 없습니다. Docker를 먼저 설치하세요.${NC}"
    exit 1
fi
for f in .env.production .env.caddy Caddyfile; do
    if [ ! -f "$f" ]; then
        echo -e "${RED}✗ $f 파일이 없습니다. 배포를 중단합니다.${NC}"
        exit 1
    fi
done
$COMPOSE config --quiet
echo -e "${GREEN}✓ 사전 확인 완료${NC}"

# 2. 이미지 빌드 및 컨테이너 시작
echo -e "\n${YELLOW}[2/4] 이미지 빌드 및 컨테이너 시작...${NC}"
$COMPOSE up -d --build
echo -e "${GREEN}✓ Docker 컨테이너 시작 완료${NC}"

# 3. 애플리케이션이 준비될 때까지 대기
echo -e "\n${YELLOW}[3/4] 애플리케이션 시작 대기...${NC}"
READY=0
for i in {1..30}; do
    if curl -s -o /dev/null http://127.0.0.1:3000; then
        READY=1
        break
    fi
    echo -n "."
    sleep 2
done
if [ "$READY" -ne 1 ]; then
    echo -e "\n${RED}✗ 애플리케이션이 응답하지 않습니다. 로그를 확인하세요:${NC}"
    echo "  $COMPOSE logs --tail 50 app"
    exit 1
fi
echo -e "${GREEN}✓ 애플리케이션이 준비되었습니다${NC}"

# 4. HTTPS 점검
echo -e "\n${YELLOW}[4/4] HTTPS 점검...${NC}"
./setup-ssl.sh || echo -e "${YELLOW}! HTTPS 점검에 실패했습니다. 위 출력을 확인하세요.${NC}"

echo -e "\n${GREEN}=================================="
echo "배포가 완료되었습니다!"
echo -e "==================================${NC}"
echo -e "\n접속 URL: ${GREEN}https://obesity.ai.kr${NC}"
echo ""
echo -e "${YELLOW}로그 확인:${NC}"
echo "  - 전체:  $COMPOSE logs -f"
echo "  - Caddy: $COMPOSE logs -f caddy"
