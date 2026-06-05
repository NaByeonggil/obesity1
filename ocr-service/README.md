# 처방전 OCR 서비스 (Qwen3-VL-32B-Instruct MLX 4-bit)

의원에서 발행한 처방전 PDF를 텍스트/구조화 JSON으로 변환하는 로컬 서비스입니다.
환자가 처방전을 약국으로 전송하면 자동으로 변환되어 `prescriptions.ocrText` /
`ocrData`에 저장되고, 약국 프로그램 입력에 사용됩니다.

## 요구 사항

- Apple Silicon Mac (테스트: M1 Max 64GB — 모델 메모리 약 19GB)
- Python 3.12 (3.14는 일부 휠 미지원)
- 모델: `mlx-community/Qwen3-VL-32B-Instruct-4bit` (~18GB, HF 캐시)

## 설정

```bash
cd ocr-service
python3.12 -m venv .venv
.venv/bin/pip install mlx-vlm fastapi 'uvicorn[standard]' pymupdf python-multipart

# 모델 다운로드 (최초 1회, ~18GB)
.venv/bin/hf download mlx-community/Qwen3-VL-32B-Instruct-4bit
```

## 실행

```bash
./ocr-service/run.sh
# 또는
ocr-service/.venv/bin/python ocr-service/server.py
```

서버 시작과 함께 모델이 백그라운드로 로딩됩니다(약 1~2분).

환경 변수:

| 변수 | 기본값 | 설명 |
|---|---|---|
| `OCR_MODEL_ID` | `mlx-community/Qwen3-VL-32B-Instruct-4bit` | 사용할 MLX VLM 모델 |
| `OCR_PORT` | `8400` | 서비스 포트 |
| `OCR_RENDER_DPI` | `150` | PDF → 이미지 렌더링 해상도 (150 ≈ 페이지당 2분 / M1 Max) |
| `OCR_MAX_TOKENS` | `3072` | 페이지당 최대 생성 토큰 |

## API

```bash
# 상태 확인
curl http://localhost:8400/health

# PDF 변환
curl -F "file=@public/prescriptions/presc_xxx.pdf" http://localhost:8400/extract
```

응답:

```json
{
  "success": true,
  "pages": 1,
  "elapsedSec": 42.3,
  "rawText": "처방전 전문 텍스트...",
  "structured": {
    "prescriptionNumber": "...",
    "patient": { "name": "..." },
    "clinic": { "name": "...", "doctorName": "..." },
    "medications": [
      { "name": "마운자로 2.5mg", "dosePerTime": "1펜", "timesPerDay": "주 1회", "totalDays": "28" }
    ]
  }
}
```

## Next.js 연동

- `src/lib/ocr-client.ts` — 서비스 호출 + DB 저장 (`OCR_SERVICE_URL` env로 주소 변경 가능)
- 환자 약국 전송 시 자동 트리거: `POST /api/patient/prescriptions/send-to-pharmacy`
- 수동 (재)변환·결과 조회: `GET|POST /api/prescriptions/{id}/ocr`

DB 컬럼 (`prisma/schema.prisma` → `prescriptions`): `ocrStatus`, `ocrText`, `ocrData`, `ocrAt`
스키마 적용: `npx prisma db push` (MySQL 기동 상태에서)
