export type UserRole = 'patient' | 'doctor' | 'pharmacy' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  profile: UserProfile
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  firstName: string
  lastName: string
  phone?: string
  avatar?: string
  specialization?: string // for doctors
  licenseNumber?: string // for doctors/pharmacies
  clinicId?: string // for doctors
  pharmacyId?: string // for pharmacy staff
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  clinicId: string
  date: Date
  time: string
  type: 'online' | 'offline'
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  symptoms?: string
  notes?: string
  patient?: User
  doctor?: User
  createdAt: Date
  updatedAt: Date
}

export interface Clinic {
  id: string
  name: string
  address: string
  phone: string
  description?: string
  image?: string
  specializations: string[]
  rating: number
  reviews: number
}

export interface Prescription {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  pharmacyId?: string
  medications: Medication[]
  instructions: string
  status: 'pending' | 'filled' | 'ready' | 'completed'
  createdAt: Date
  updatedAt: Date
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export interface DashboardStats {
  totalAppointments: number
  todayAppointments: number
  pendingAppointments: number
  completedAppointments: number
  totalPatients?: number
  totalPrescriptions?: number
}