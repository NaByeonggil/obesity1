import { NextResponse } from "next/server"
import {
  previewUser,
  appointments,
  prescriptions,
  getDispensingSteps,
} from "@/lib/preview/data"

// 홈 대시보드: 사용자 요약 + 다가오는 예약 + 진행 중 처방/조제
export async function GET() {
  const nextAppointment = appointments[0] ?? null
  const activePrescription = prescriptions[0] ?? null
  const steps = getDispensingSteps()
  const currentStep = steps.find((s) => s.current) ?? null

  return NextResponse.json({
    success: true,
    user: previewUser,
    nextAppointment,
    activePrescription,
    dispensing: {
      prescriptionId: activePrescription?.id ?? null,
      currentStep,
      steps,
    },
    healthSummary: {
      weightKg: 78.4,
      weightChangeKg: -2.1,
      goalKg: 72.0,
      streakDays: 14,
    },
  })
}
