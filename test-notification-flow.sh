#!/bin/bash

echo "======================================"
echo "알림 기능 테스트 시나리오"
echo "======================================"
echo ""

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 테스트 시나리오:${NC}"
echo "1. 환자 계정으로 로그인"
echo "2. 의사에게 예약 생성"
echo "3. 의사 계정으로 로그인"
echo "4. 알림 토스트가 오른쪽 상단에 자동으로 나타나는지 확인"
echo ""

echo -e "${YELLOW}🌐 브라우저에서 다음 주소로 접속하세요:${NC}"
echo "http://localhost:3001"
echo ""

echo -e "${GREEN}✅ 테스트 계정 정보:${NC}"
echo ""
echo "환자 계정:"
echo "  이메일: patient@test.com"
echo "  비밀번호: password123"
echo ""
echo "의사 계정:"
echo "  이메일: doctor@test.com"
echo "  비밀번호: password123"
echo ""

echo -e "${BLUE}📝 테스트 순서:${NC}"
echo ""
echo "1단계: 환자로 예약 생성"
echo "  → http://localhost:3001 접속"
echo "  → patient@test.com 로그인"
echo "  → '예약 하기' 메뉴 클릭"
echo "  → 의사 선택 후 예약 생성"
echo ""
echo "2단계: 의사에게 알림 확인"
echo "  → 로그아웃"
echo "  → doctor@test.com 로그인"
echo "  → 로그인 후 30초 이내에 오른쪽 상단에 알림 토스트 팝업 확인"
echo "  → 벨 아이콘 클릭하여 알림 목록 확인"
echo ""

echo -e "${GREEN}✨ 기대 결과:${NC}"
echo "  ✓ 의사 로그인 후 오른쪽 상단에 알림 토스트가 자동으로 나타남"
echo "  ✓ 알림 내용: '새로운 예약' + 환자 이름 + 진료과 + 날짜/시간"
echo "  ✓ X 버튼으로 즉시 닫기 가능"
echo "  ✓ 5초 후 자동으로 사라짐"
echo "  ✓ 벨 아이콘에 읽지 않은 알림 배지 표시"
echo ""

echo -e "${YELLOW}⚙️  개발 서버 상태:${NC}"
echo "  서버: http://localhost:3001"
echo "  상태: 실행 중"
echo ""

echo "======================================"
