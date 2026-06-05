#!/bin/bash
# 처방전 OCR 서비스 실행 (Qwen3-VL-32B-Instruct MLX 4-bit)
# 사용법: ./ocr-service/run.sh
cd "$(dirname "$0")"

if [ ! -d .venv ]; then
  echo "가상환경이 없습니다. 먼저 설정하세요:"
  echo "  python3.12 -m venv .venv"
  echo "  .venv/bin/pip install mlx-vlm fastapi 'uvicorn[standard]' pymupdf python-multipart"
  exit 1
fi

exec .venv/bin/python server.py
