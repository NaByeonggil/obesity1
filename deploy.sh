#!/bin/bash

# obesity.ai.kr 배포 스크립트

set -e  # 오류 발생 시 스크립트 중단

echo "=================================="
echo "obesity.ai.kr 배포 시작"
echo "=================================="

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Nginx 설치 확인
echo -e "\n${YELLOW}[1/7] Nginx 설치 확인...${NC}"
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Nginx가 설치되어 있지 않습니다. 설치를 시작합니다...${NC}"
    sudo apt update
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
    echo -e "${GREEN}✓ Nginx 설치 완료${NC}"
else
    echo -e "${GREEN}✓ Nginx가 이미 설치되어 있습니다${NC}"
fi

# 2. Nginx 설정 복사
echo -e "\n${YELLOW}[2/7] Nginx 설정 파일 복사...${NC}"
sudo cp nginx.conf /etc/nginx/sites-available/obesity.ai.kr
sudo ln -sf /etc/nginx/sites-available/obesity.ai.kr /etc/nginx/sites-enabled/
echo -e "${GREEN}✓ Nginx 설정 파일 복사 완료${NC}"

# 3. 기본 사이트 비활성화
echo -e "\n${YELLOW}[3/7] 기본 Nginx 사이트 비활성화...${NC}"
sudo rm -f /etc/nginx/sites-enabled/default
echo -e "${GREEN}✓ 기본 사이트 비활성화 완료${NC}"

# 4. Nginx 설정 테스트
echo -e "\n${YELLOW}[4/7] Nginx 설정 테스트...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✓ Nginx 설정이 올바릅니다${NC}"
else
    echo -e "${RED}✗ Nginx 설정에 오류가 있습니다. 배포를 중단합니다.${NC}"
    exit 1
fi

# 5. Docker 컨테이너 재시작
echo -e "\n${YELLOW}[5/7] Docker 컨테이너 재시작...${NC}"
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d
echo -e "${GREEN}✓ Docker 컨테이너 시작 완료${NC}"

# 6. 애플리케이션이 준비될 때까지 대기
echo -e "\n${YELLOW}[6/7] 애플리케이션 시작 대기...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null; then
        echo -e "${GREEN}✓ 애플리케이션이 준비되었습니다${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# 7. Nginx 재시작
echo -e "\n${YELLOW}[7/7] Nginx 재시작...${NC}"
sudo systemctl restart nginx
echo -e "${GREEN}✓ Nginx 재시작 완료${NC}"

echo -e "\n${GREEN}=================================="
echo "배포가 완료되었습니다!"
echo "==================================${NC}"
echo -e "\n접속 URL:"
echo -e "  - HTTP:  ${GREEN}http://obesity.ai.kr${NC}"
echo -e "  - HTTPS: ${YELLOW}https://obesity.ai.kr${NC} (SSL 인증서 설치 후)"
echo ""
echo -e "${YELLOW}다음 단계:${NC}"
echo "1. DNS 설정 확인 (A 레코드: obesity.ai.kr → 서버 IP)"
echo "2. SSL 인증서 설치:"
echo "   sudo certbot --nginx -d obesity.ai.kr -d www.obesity.ai.kr"
echo ""
echo -e "${YELLOW}로그 확인:${NC}"
echo "  - Nginx: sudo tail -f /var/log/nginx/error.log"
echo "  - Docker: docker-compose -f docker-compose.production.yml logs -f"
