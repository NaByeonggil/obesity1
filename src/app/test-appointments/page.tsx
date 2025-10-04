"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"

export default function TestAppointmentsPage() {
  const [appointments, setAppointments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log('Fetching appointments...')
        const response = await fetch('/api/patient/appointments', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        console.log('Response status:', response.status)
        const data = await response.json()
        console.log('Response data:', data)

        if (data.success && data.appointments) {
          setAppointments(data.appointments)
        } else {
          setError(data.error || 'Failed to load appointments')
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to fetch appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Appointments Page</h1>
      <p className="mb-4">Total appointments: {appointments.length}</p>

      <div className="space-y-4">
        {appointments.map((apt, index) => (
          <Card key={apt.id} className="p-4">
            <h3 className="font-semibold">Appointment {index + 1}</h3>
            <p>ID: {apt.id}</p>
            <p>Type: {apt.type}</p>
            <p>Status: {apt.status}</p>
            <p>Date: {new Date(apt.appointmentDate).toLocaleString()}</p>
            <p>Doctor: {apt.users_appointments_doctorIdTousers?.name || 'N/A'}</p>
            <p>Department: {apt.departments?.name || 'N/A'}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}