"""처방전 PDF → 텍스트 변환 OCR 서비스.

Qwen3-VL-32B-Instruct (MLX 4-bit)를 로컬(Apple Silicon)에서 구동하여
처방전 PDF/이미지를 약국 프로그램 입력용 구조화 텍스트(JSON)로 변환합니다.

실행:
    .venv/bin/python server.py            # 기본 포트 8400
    OCR_PORT=8500 .venv/bin/python server.py

엔드포인트:
    GET  /health   모델 로딩 상태
    POST /extract  multipart(file=PDF|PNG|JPG) → { rawText, structured, pages }
"""

import asyncio
import json
import os
import re
import tempfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor

import fitz  # PyMuPDF
import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile

MODEL_ID = os.environ.get("OCR_MODEL_ID", "mlx-community/Qwen3-VL-32B-Instruct-4bit")
PORT = int(os.environ.get("OCR_PORT", "8400"))
# 150 DPI: 비전 프리필 토큰을 줄여 M1 Max 기준 페이지당 ~2분 내 처리 (정확도 충분)
RENDER_DPI = int(os.environ.get("OCR_RENDER_DPI", "150"))
MAX_TOKENS = int(os.environ.get("OCR_MAX_TOKENS", "3072"))

# 처방전 추출 프롬프트: 약국 프로그램 입력에 필요한 필드를 JSON으로 강제
EXTRACT_PROMPT = """당신은 한국 의료기관의 전자처방전을 판독하는 OCR 전문가입니다.
이미지는 처방전 1페이지입니다. 보이는 내용을 빠짐없이 읽고, 아래 JSON 스키마로만 응답하세요.
읽을 수 없거나 없는 항목은 null로 두세요. 임의로 값을 지어내지 마세요.

{
  "prescriptionNumber": "교부번호/처방전번호",
  "issueDate": "발행일 (YYYY-MM-DD)",
  "validUntil": "사용기간/유효기간 (YYYY-MM-DD)",
  "patient": { "name": "환자 성명", "registrationNumber": "주민등록번호(앞자리만 보여도 그대로)", "phone": "연락처" },
  "clinic": { "name": "의료기관명", "phone": "전화번호", "doctorName": "처방 의사명", "licenseNumber": "면허번호" },
  "diagnosis": "질병분류기호/진단명",
  "medications": [
    {
      "name": "약품명(성분/함량 포함)",
      "code": "약품코드(보이는 경우)",
      "dosePerTime": "1회 투약량",
      "timesPerDay": "1일 투여횟수",
      "totalDays": "총 투약일수",
      "instructions": "용법/복용 지시"
    }
  ],
  "pharmacistNotes": "조제 시 참고사항",
  "rawText": "처방전에 보이는 모든 텍스트를 읽은 그대로 전부 옮긴 전문"
}

JSON 외의 다른 텍스트는 출력하지 마세요."""

app = FastAPI(title="prescription-ocr", version="1.0.0")

_model = None
_processor = None
_config = None
_model_lock = threading.Lock()  # MLX 추론 직렬화
_load_error: str | None = None

# MLX 스트림은 생성된 스레드에 묶이므로, 로딩과 추론을 모두
# 단일 전용 워커 스레드에서 수행해야 함 (스레드 불일치 시 RuntimeError)
_mlx_worker = ThreadPoolExecutor(max_workers=1, thread_name_prefix="mlx")


def _load_model():
    """모델을 1회 로딩 (약 19GB, 최초 다운로드 시 HF에서 수신)."""
    global _model, _processor, _config, _load_error
    if _model is not None:
        return
    with _model_lock:
        if _model is not None:
            return
        try:
            from mlx_vlm import load
            from mlx_vlm.utils import load_config

            print(f"[ocr] 모델 로딩 시작: {MODEL_ID}")
            t0 = time.time()
            _model, _processor = load(MODEL_ID)
            _config = load_config(MODEL_ID)
            print(f"[ocr] 모델 로딩 완료 ({time.time() - t0:.1f}s)")
        except Exception as e:  # noqa: BLE001
            _load_error = str(e)
            print(f"[ocr] 모델 로딩 실패: {e}")
            raise


def _pdf_to_page_images(pdf_bytes: bytes) -> list[str]:
    """PDF 각 페이지를 PNG 임시파일로 렌더링하고 경로 목록을 반환."""
    paths: list[str] = []
    zoom = RENDER_DPI / 72.0
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for page in doc:
            pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
            f = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
            f.write(pix.tobytes("png"))
            f.close()
            paths.append(f.name)
    return paths


def _generate_for_image(image_path: str) -> str:
    """이미지 1장에 대해 VLM 추론을 수행하고 응답 텍스트를 반환."""
    from mlx_vlm import generate
    from mlx_vlm.prompt_utils import apply_chat_template

    prompt = apply_chat_template(_processor, _config, EXTRACT_PROMPT, num_images=1)
    with _model_lock:
        result = generate(
            _model,
            _processor,
            prompt,
            image=[image_path],
            max_tokens=MAX_TOKENS,
            temperature=0.0,
            verbose=False,
        )
    # mlx-vlm 버전에 따라 str 또는 GenerationResult 반환
    return result.text if hasattr(result, "text") else str(result)


def _parse_json_block(text: str) -> dict | None:
    """모델 응답에서 JSON 블록을 관대하게 파싱."""
    candidate = text.strip()
    # ```json ... ``` 펜스 제거
    m = re.search(r"```(?:json)?\s*(\{.*\})\s*```", candidate, re.DOTALL)
    if m:
        candidate = m.group(1)
    else:
        m = re.search(r"\{.*\}", candidate, re.DOTALL)
        if m:
            candidate = m.group(0)
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        return None


def _merge_pages(pages: list[dict | None], raw_texts: list[str]) -> dict:
    """다중 페이지 결과 병합: 첫 페이지 기준 + 약품 목록은 전체 합산."""
    merged: dict = {}
    medications: list = []
    for parsed in pages:
        if not parsed:
            continue
        for key, value in parsed.items():
            if key == "medications":
                if isinstance(value, list):
                    medications.extend(value)
            elif key != "rawText" and merged.get(key) in (None, "", []) and value not in (None, ""):
                merged[key] = value
    merged["medications"] = medications
    merged["rawText"] = "\n\n--- page break ---\n\n".join(raw_texts)
    return merged


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": MODEL_ID,
        "loaded": _model is not None,
        "loadError": _load_error,
    }


@app.post("/extract")
async def extract(file: UploadFile = File(...)):
    loop = asyncio.get_running_loop()
    if _model is None:
        try:
            await loop.run_in_executor(_mlx_worker, _load_model)
        except Exception as e:  # noqa: BLE001
            raise HTTPException(status_code=503, detail=f"모델 로딩 실패: {e}")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="빈 파일입니다")

    filename = (file.filename or "").lower()
    is_pdf = filename.endswith(".pdf") or data[:5] == b"%PDF-"

    image_paths: list[str] = []
    try:
        if is_pdf:
            image_paths = _pdf_to_page_images(data)
        else:
            f = tempfile.NamedTemporaryFile(suffix=os.path.splitext(filename)[1] or ".png", delete=False)
            f.write(data)
            f.close()
            image_paths = [f.name]

        t0 = time.time()
        page_results: list[dict | None] = []
        raw_texts: list[str] = []
        for path in image_paths:
            response_text = await loop.run_in_executor(_mlx_worker, _generate_for_image, path)
            parsed = _parse_json_block(response_text)
            page_results.append(parsed)
            raw_texts.append((parsed or {}).get("rawText") or response_text)

        structured = _merge_pages(page_results, raw_texts)
        return {
            "success": True,
            "model": MODEL_ID,
            "pages": len(image_paths),
            "elapsedSec": round(time.time() - t0, 1),
            "rawText": structured.get("rawText", ""),
            "structured": structured,
        }
    finally:
        for path in image_paths:
            try:
                os.unlink(path)
            except OSError:
                pass


if __name__ == "__main__":
    # 서버 시작과 동시에 모델을 MLX 전용 워커 스레드에서 로딩 (첫 요청 지연 방지)
    _mlx_worker.submit(_load_model)
    uvicorn.run(app, host="127.0.0.1", port=PORT)
