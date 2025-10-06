#!/bin/bash

# obesity.ai.kr SSL 인증서 설치 스크립트 (Let's Encrypt)

set -e

echo "=================================="
echo "SSL 인증서 설치 (Let's Encrypt)"
echo "=================================="

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 이메일 주소 입력
echo -e "\n${YELLOW}SSL 인증서 발급을 위한 이메일 주소를 입력하세요:${NC}"
read -p "이메일: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}✗ 이메일 주소를 입력해야 합니다.${NC}"
    exit 1
fi

# 1. Certbot 설치 확인
echo -e "\n${YELLOW}[1/4] Certbot 설치 확인...${NC}"
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Certbot를 설치합니다...${NC}"
    sudo apt update
    sudo apt install certbot python3-certbot-nginx -y
    echo -e "${GREEN}✓ Certbot 설치 완료${NC}"
else
    echo -e "${GREEN}✓ Certbot이 이미 설치되어 있습니다${NC}"
fi

# 2. 방화벽 설정
echo -e "\n${YELLOW}[2/4] 방화벽 설정...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw allow 'Nginx Full'
    echo -e "${GREEN}✓ 방화벽 설정 완료${NC}"
else
    echo -e "${YELLOW}! UFW가 설치되어 있지 않습니다. 수동으로 80, 443 포트를 열어주세요.${NC}"
fi

# 3. SSL 인증서 발급
echo -e "\n${YELLOW}[3/4] SSL 인증서 발급...${NC}"
echo -e "${YELLOW}도메인: obesity.ai.kr, www.obesity.ai.kr${NC}"
sudo certbot --nginx -d obesity.ai.kr -d www.obesity.ai.kr --email $EMAIL --agree-tos --non-interactive

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSL 인증서 발급 완료${NC}"
else
    echo -e "${RED}✗ SSL 인증서 발급 실패${NC}"
    exit 1
fi

# 4. 자동 갱신 확인
echo -e "\n${YELLOW}[4/4] 인증서 자동 갱신 설정 확인...${NC}"
sudo systemctl status certbot.timer --no-pager
echo -e "${GREEN}✓ 자동 갱신이 활성화되어 있습니다${NC}"

# 5. .env.production 파일 업데이트 안내
echo -e "\n${YELLOW}=================================="
echo "SSL 인증서 설치 완료!"
echo "==================================${NC}"
echo -e "\n${GREEN}다음 단계:${NC}"
echo "1. .env.production 파일에서 NEXTAUTH_URL 업데이트:"
echo "   NEXTAUTH_URL=https://obesity.ai.kr"
echo ""
echo "2. Docker 재빌드:"
echo "   docker-compose -f docker-compose.production.yml down"
echo "   docker-compose -f docker-compose.production.yml up -d --build"
echo ""
echo -e "${GREEN}접속 URL:${NC}"
echo "  - https://obesity.ai.kr"
echo "  - https://www.obesity.ai.kr"
echo ""
echo -e "${YELLOW}인증서는 자동으로 갱신됩니다.${NC}"
