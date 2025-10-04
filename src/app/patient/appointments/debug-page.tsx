"use client"

import * as React from "react"

export default function DebugAppointmentsPage() {
  const [appointments, setAppointments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchAppointments = async () => {
      try {
        console.log('[DEBUG] Fetching appointments...')
        const response = await fetch('/api/patient/appointments', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        console.log('[DEBUG] Response status:', response.status)
        const data = await response.json()
        console.log('[DEBUG] Response data:', data)

        if (data.success && data.appointments) {
          console.log('[DEBUG] Setting appointments:', data.appointments.length)
          setAppointments(data.appointments)
        } else {
          console.log('[DEBUG] No appointments or failed response')
          setError(data.error || 'Failed to load appointments')
        }
      } catch (err) {
        console.error('[DEBUG] Error:', err)
        setError('Failed to fetch appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  console.log('[DEBUG] Render - loading:', loading, 'appointments:', appointments.length, 'error:', error)

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Appointments Page</h1>
      <p className="mb-4">Total appointments: {appointments.length}</p>

      <div className="space-y-4">
        {appointments.map((apt, index) => (
          <div key={apt.id || index} className="border p-4 rounded">
            <h3 className="font-semibold">Appointment {index + 1}</h3>
            <p>ID: {apt.id}</p>
            <p>Type: {apt.type}</p>
            <p>Status: {apt.status}</p>
            <p>Date: {apt.appointmentDate}</p>
            <p>Doctor: {apt.users_appointments_doctorIdTousers?.name || 'N/A'}</p>
            <p>Department: {apt.departments?.name || 'N/A'}</p>
          </div>
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>No appointments found.</p>
        </div>
      )}
    </div>
  )
}