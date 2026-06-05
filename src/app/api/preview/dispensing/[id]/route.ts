import { NextRequest, NextResponse } from "next/server"
import { getDispensingSteps, findPrescription, pharmacies } from "@/lib/preview/data"

// 조제 진행 상태
export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params
  const prescription = findPrescription(params.id)
  const steps = getDispensingSteps()
  const current = steps.find((s) => s.current) ?? null
  return NextResponse.json({
    success: true,
    prescriptionId: prescription?.id ?? params.id,
    pharmacy: pharmacies[0],
    steps,
    currentStep: current,
    estimatedReadyMin: 8,
  })
}
