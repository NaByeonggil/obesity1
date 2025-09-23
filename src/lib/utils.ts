import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function getRoleColor(role: string): string {
  switch (role) {
    case 'patient':
      return 'text-patient bg-patient-light border-patient'
    case 'doctor':
      return 'text-doctor bg-doctor-light border-doctor'
    case 'pharmacy':
      return 'text-pharmacy bg-pharmacy-light border-pharmacy'
    case 'admin':
      return 'text-admin bg-admin-light border-admin'
    default:
      return 'text-gray-600 bg-gray-100 border-gray-300'
  }
}