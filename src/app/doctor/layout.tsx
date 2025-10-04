"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/use-auth"
import { useEffect, useState } from "react"

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated, token } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ProtectedRoute requiredRole="doctor">
      <DashboardLayout userRole="doctor" user={user}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  )
}