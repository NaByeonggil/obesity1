// 미리보기 화면용 데모 데이터 + 타입.
// 인증/DB 시드 상태와 무관하게 항상 동작하도록 큐레이션된 샘플 데이터입니다.
// 실제 Prisma 데이터로 교체하려면 각 getter를 prisma 쿼리로 바꾸면 됩니다.

export interface PreviewUser {
  id: string
  name: string
  email: string
  avatar: string
  membership: string
}

export interface Clinic {
  id: string
  name: string
  department: string
  doctorName: string
  rating: number
  reviewCount: number
  distanceKm: number
  address: string
  imageUrl: string
  open: boolean
  openHours: string
  consultationType: "OFFLINE" | "ONLINE" | "BOTH"
  fee: number
  tags: string[]
}

export interface TimeSlot {
  date: string // YYYY-MM-DD
  times: string[] // ["09:30", ...]
}

export interface Appointment {
  id: string
  clinicId: string
  clinicName: string
  doctorName: string
  department: string
  date: string
  time: string
  type: "OFFLINE" | "ONLINE"
  status: "REQUESTED" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  fee: number
  address: string
}

export interface PrescriptionMed {
  name: string
  dosage: string
  frequency: string
  durationDays: number
}

export interface Prescription {
  id: string
  prescriptionNumber: string
  doctorName: string
  clinicName: string
  issuedAt: string
  status: "ISSUED" | "SENT" | "DISPENSING" | "READY" | "PICKED_UP"
  medications: PrescriptionMed[]
}

export interface Pharmacy {
  id: string
  name: string
  address: string
  distanceKm: number
  open: boolean
  openHours: string
  phone: string
  rating: number
  prepTimeMin: number
}

export interface PaymentMethod {
  id: string
  type: "card" | "kakao" | "naver" | "bank"
  label: string
  detail: string
  icon: string
}

export interface PaymentHistory {
  id: string
  title: string
  date: string
  amount: number
  status: "PAID" | "REFUNDED"
}

export interface DispensingStep {
  key: string
  label: string
  done: boolean
  current: boolean
  at: string | null
}

// ──────────────────────────────────────────────────────────────────────────

export const previewUser: PreviewUser = {
  id: "u-demo-001",
  name: "김민준",
  email: "minjun.kim@example.com",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCBiX9vL2jxRSNhhskw82N9FtEyJmahyAgP6ATHPdwPqy4XQ7nZDWhRdzoeIZbfXNoTRyA3VEA46iaEYAvlyWrSOFmSCHkaekHUcwMK1Ty7aVO6EQggD6qFlcbqcTeebCpTevj_Yh07PJ3qGP-19EIc49Gwgy3RhR1Qi58wZIsPbFOJBU82NpOLwfEFrySzsk-KcUh-6wPSrQawtZbhW5AQOYTu4gcNhC6D9s9T15kPOelwq_oNjSIxJEmHUVkXBu2vUPT22OubVyV_",
  membership: "프리미엄",
}

export const clinics: Clinic[] = [
  {
    id: "c-001",
    name: "강남 비만클리닉",
    department: "비만/체중관리",
    doctorName: "이서연 원장",
    rating: 4.9,
    reviewCount: 1284,
    distanceKm: 0.4,
    address: "서울 강남구 테헤란로 152",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-clinic1",
    open: true,
    openHours: "오후 8:30까지 영업",
    consultationType: "BOTH",
    fee: 30000,
    tags: ["비만치료", "마운자로", "삭센다"],
  },
  {
    id: "c-002",
    name: "테헤란 내과의원",
    department: "내과",
    doctorName: "박준호 원장",
    rating: 4.7,
    reviewCount: 642,
    distanceKm: 0.9,
    address: "서울 강남구 테헤란로 201",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-clinic2",
    open: true,
    openHours: "오후 6:00까지 영업",
    consultationType: "ONLINE",
    fee: 15000,
    tags: ["감기", "건강검진"],
  },
  {
    id: "c-003",
    name: "역삼 피부과",
    department: "피부과",
    doctorName: "최지우 원장",
    rating: 4.8,
    reviewCount: 980,
    distanceKm: 1.3,
    address: "서울 강남구 역삼로 45",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-clinic3",
    open: false,
    openHours: "오전 10:00 오픈",
    consultationType: "OFFLINE",
    fee: 25000,
    tags: ["여드름", "미용"],
  },
]

export const pharmacies: Pharmacy[] = [
  {
    id: "p-001",
    name: "메디컬정문약국",
    address: "서울 중구 남대문로 84",
    distanceKm: 0.2,
    open: true,
    openHours: "오후 8:30까지 영업",
    phone: "02-123-4567",
    rating: 4.9,
    prepTimeMin: 10,
  },
  {
    id: "p-002",
    name: "건강드림약국",
    address: "서울 강남구 테헤란로 150",
    distanceKm: 0.5,
    open: true,
    openHours: "오후 9:00까지 영업",
    phone: "02-234-5678",
    rating: 4.8,
    prepTimeMin: 15,
  },
  {
    id: "p-003",
    name: "온누리약국 강남점",
    address: "서울 강남구 강남대로 320",
    distanceKm: 1.1,
    open: false,
    openHours: "오전 9:00 오픈",
    phone: "02-345-6789",
    rating: 4.6,
    prepTimeMin: 20,
  },
]

export const appointments: Appointment[] = [
  {
    id: "a-001",
    clinicId: "c-001",
    clinicName: "강남 비만클리닉",
    doctorName: "이서연 원장",
    department: "비만/체중관리",
    date: "2024-06-12",
    time: "14:30",
    type: "OFFLINE",
    status: "CONFIRMED",
    fee: 30000,
    address: "서울 강남구 테헤란로 152",
  },
]

export const prescriptions: Prescription[] = [
  {
    id: "rx-001",
    prescriptionNumber: "20240612-0042",
    doctorName: "이서연 원장",
    clinicName: "강남 비만클리닉",
    issuedAt: "2024-06-12T15:10:00+09:00",
    status: "ISSUED",
    medications: [
      { name: "마운자로 2.5mg", dosage: "1펜", frequency: "주 1회 피하주사", durationDays: 28 },
      { name: "메트포르민 500mg", dosage: "1정", frequency: "1일 2회 식후", durationDays: 28 },
    ],
  },
]

export const paymentMethods: PaymentMethod[] = [
  { id: "pm-card", type: "card", label: "신한카드", detail: "**** 4567", icon: "credit_card" },
  { id: "pm-kakao", type: "kakao", label: "카카오페이", detail: "간편결제", icon: "account_balance_wallet" },
  { id: "pm-naver", type: "naver", label: "네이버페이", detail: "간편결제", icon: "payments" },
]

export const paymentHistory: PaymentHistory[] = [
  { id: "ph-001", title: "강남 비만클리닉 진료비", date: "2024-06-12", amount: 30000, status: "PAID" },
  { id: "ph-002", title: "메디컬정문약국 조제비", date: "2024-06-12", amount: 18500, status: "PAID" },
  { id: "ph-003", title: "테헤란 내과의원 진료비", date: "2024-05-28", amount: 15000, status: "PAID" },
]

export function getDispensingSteps(): DispensingStep[] {
  return [
    { key: "received", label: "처방전 접수", done: true, current: false, at: "15:12" },
    { key: "preparing", label: "조제 중", done: false, current: true, at: null },
    { key: "ready", label: "조제 완료", done: false, current: false, at: null },
    { key: "pickup", label: "수령 대기", done: false, current: false, at: null },
  ]
}

export function findClinic(id: string): Clinic | undefined {
  return clinics.find((c) => c.id === id)
}
export function findPharmacy(id: string): Pharmacy | undefined {
  return pharmacies.find((p) => p.id === id)
}
export function findAppointment(id: string): Appointment | undefined {
  return appointments.find((a) => a.id === id) ?? appointments[0]
}
export function findPrescription(id: string): Prescription | undefined {
  return prescriptions.find((p) => p.id === id) ?? prescriptions[0]
}

export function getTimeSlots(): TimeSlot[] {
  return [
    { date: "2024-06-12", times: ["09:30", "10:00", "11:30", "14:30", "15:00", "16:30"] },
    { date: "2024-06-13", times: ["09:00", "10:30", "13:00", "15:30", "17:00"] },
    { date: "2024-06-14", times: ["10:00", "11:00", "14:00", "16:00"] },
  ]
}
