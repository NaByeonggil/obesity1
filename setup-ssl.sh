#!/bin/bash

# obesity.ai.kr SSL 인증서 점검 스크립트
#
# 인증서는 Caddy 컨테이너가 Let's Encrypt에서 자동 발급/갱신합니다.
# certbot/nginx는 사용하지 않습니다 (설치하면 80/443 포트가 Caddy와 충돌합니다).
#
# 사용법:
#   ./setup-ssl.sh           # 상태 점검
#   ./setup-ssl.sh --retry   # Caddy 재시작으로 발급 즉시 재시도 후 점검

DOMAIN="obesity.ai.kr"
CADDY="obesity1_caddy_production"

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

FAIL=0
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
warn() { echo -e "${YELLOW}! $1${NC}"; }
bad()  { echo -e "${RED}✗ $1${NC}"; FAIL=1; }

echo "=================================="
echo "SSL 인증서 점검 (Caddy / Let's Encrypt)"
echo "=================================="

# 1. Caddy 컨테이너
echo -e "\n${YELLOW}[1/4] Caddy 컨테이너...${NC}"
if [ "$(docker inspect -f '{{.State.Running}}' "$CADDY" 2>/dev/null)" != "true" ]; then
    bad "$CADDY 컨테이너가 실행 중이 아닙니다"
    echo "  docker compose -f docker-compose.production.yml up -d caddy"
    exit 1
fi
ok "Caddy 실행 중"

if [ "$1" = "--retry" ]; then
    warn "Caddy를 재시작하여 인증서 발급을 재시도합니다..."
    docker restart "$CADDY" > /dev/null
    sleep 30
fi

# 2. DNS ↔ 공인 IP
echo -e "\n${YELLOW}[2/4] DNS 확인...${NC}"
PUBLIC_IP=$(curl -s -m 5 https://api.ipify.org)
for host in "$DOMAIN" "www.$DOMAIN"; do
    RESOLVED=$(getent ahostsv4 "$host" | awk 'NR==1{print $1}')
    if [ -n "$RESOLVED" ] && [ "$RESOLVED" = "$PUBLIC_IP" ]; then
        ok "$host → $RESOLVED"
    else
        bad "$host → ${RESOLVED:-조회 실패} (서버 공인 IP: ${PUBLIC_IP:-확인 실패})"
    fi
done

# 3. 인증서
echo -e "\n${YELLOW}[3/4] 인증서 확인...${NC}"
for host in "$DOMAIN" "www.$DOMAIN"; do
    CERT=$(echo | timeout 10 openssl s_client -connect "$host:443" -servername "$host" 2>/dev/null \
        | openssl x509 -noout -issuer -enddate 2>/dev/null)
    if [ -z "$CERT" ]; then
        bad "$host: 인증서를 가져올 수 없습니다 (미발급 또는 443 접속 불가)"
        continue
    fi
    END=$(echo "$CERT" | sed -n 's/^notAfter=//p')
    DAYS=$(( ($(date -d "$END" +%s) - $(date +%s)) / 86400 ))
    if [ "$DAYS" -lt 15 ]; then
        bad "$host: 만료 ${DAYS}일 남음 ($END) - 자동 갱신이 동작하지 않고 있습니다"
    else
        ok "$host: 만료 ${DAYS}일 남음 ($END)"
    fi
done

# 4. HTTP → HTTPS 응답
echo -e "\n${YELLOW}[4/4] 응답 확인...${NC}"
CODE=$(curl -s -m 10 -o /dev/null -w '%{http_code}' "https://$DOMAIN/")
if [ "$CODE" = "200" ]; then ok "https://$DOMAIN → $CODE"; else bad "https://$DOMAIN → $CODE"; fi
CODE=$(curl -s -m 10 -o /dev/null -w '%{http_code}' "http://$DOMAIN/")
if [ "$CODE" = "308" ]; then ok "http://$DOMAIN → $CODE (HTTPS 리다이렉트)"; else bad "http://$DOMAIN → $CODE"; fi

if [ "$FAIL" -ne 0 ]; then
    echo -e "\n${RED}문제가 발견되었습니다. 최근 Caddy 인증서 로그:${NC}"
    docker logs --since 2h "$CADDY" 2>&1 | grep -E '"logger":"tls\.obtain"' | tail -5 | cut -c1-300
    echo ""
    echo "확인할 것:"
    echo "  1. 공유기 포트포워딩: 80, 443 (TCP) → 이 서버의 내부 IP ($(hostname -I | awk '{print $1}'))"
    echo "  2. DNS A 레코드가 서버 공인 IP를 가리키는지"
    echo "  3. 조치 후 즉시 재시도: ./setup-ssl.sh --retry"
    echo "     (Caddy는 실패 시 최대 1시간 간격으로 재시도합니다)"
    exit 1
fi

echo -e "\n${GREEN}모든 항목 정상. 인증서는 Caddy가 자동으로 갱신합니다.${NC}"
