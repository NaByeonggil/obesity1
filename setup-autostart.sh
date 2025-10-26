#!/bin/bash

# Obesity1 Healthcare Platform 자동 시작 설정 스크립트

echo "=== Obesity1 자동 시작 설정 ==="
echo ""

# Docker 서비스 활성화
echo "1. Docker 서비스 부팅 시 자동 시작 설정..."
sudo systemctl enable docker
if [ $? -eq 0 ]; then
    echo "   ✅ Docker 서비스 활성화 완료"
else
    echo "   ❌ Docker 서비스 활성화 실패"
    exit 1
fi

# systemd 서비스 파일 복사
echo ""
echo "2. systemd 서비스 파일 설치..."
sudo cp obesity1-docker.service /etc/systemd/system/
if [ $? -eq 0 ]; then
    echo "   ✅ 서비스 파일 복사 완료"
else
    echo "   ❌ 서비스 파일 복사 실패"
    exit 1
fi

# systemd 데몬 리로드
echo ""
echo "3. systemd 데몬 리로드..."
sudo systemctl daemon-reload
if [ $? -eq 0 ]; then
    echo "   ✅ systemd 데몬 리로드 완료"
else
    echo "   ❌ systemd 데몬 리로드 실패"
    exit 1
fi

# Obesity1 서비스 활성화
echo ""
echo "4. Obesity1 서비스 부팅 시 자동 시작 설정..."
sudo systemctl enable obesity1-docker.service
if [ $? -eq 0 ]; then
    echo "   ✅ Obesity1 서비스 활성화 완료"
else
    echo "   ❌ Obesity1 서비스 활성화 실패"
    exit 1
fi

# 서비스 시작
echo ""
echo "5. Obesity1 서비스 시작..."
sudo systemctl start obesity1-docker.service
if [ $? -eq 0 ]; then
    echo "   ✅ Obesity1 서비스 시작 완료"
else
    echo "   ❌ Obesity1 서비스 시작 실패"
    exit 1
fi

# 상태 확인
echo ""
echo "6. 서비스 상태 확인..."
sudo systemctl status obesity1-docker.service --no-pager

echo ""
echo "=== 설정 완료 ==="
echo ""
echo "이제 시스템 재부팅 후에도 Obesity1 애플리케이션이 자동으로 시작됩니다."
echo ""
echo "유용한 명령어:"
echo "  - 서비스 상태 확인: sudo systemctl status obesity1-docker"
echo "  - 서비스 중지: sudo systemctl stop obesity1-docker"
echo "  - 서비스 시작: sudo systemctl start obesity1-docker"
echo "  - 서비스 재시작: sudo systemctl restart obesity1-docker"
echo "  - Docker 컨테이너 확인: docker-compose -f docker-compose.production.yml ps"
echo ""
