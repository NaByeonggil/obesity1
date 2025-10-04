const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiOptions {
  method?: string
  headers?: Record<string, string>
  body?: any
  token?: string
}

async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    token
  } = options

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  }

  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    }
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const url = `${API_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(response.status, data.error || 'API request failed', data)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Network error or server is unavailable')
  }
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    }),

  getMe: (token: string) =>
    apiRequest('/api/auth/me', {
      token
    })
}

// Appointments API
export const appointmentsApi = {
  getAppointments: (token: string, params?: { status?: string; doctorId?: string }) => {
    // 환자용 예약 조회 엔드포인트 사용
    const endpoint = `/api/patient/appointments`

    return apiRequest(endpoint, {
      token,
      headers: {
        'Cookie': `auth-token=${token}`
      }
    })
  },

  getAppointment: (token: string, id: string) =>
    apiRequest(`/api/appointments/${id}`, { token }),

  createAppointment: (token: string, data: any) =>
    apiRequest('/api/appointments', {
      method: 'POST',
      body: data,
      token
    }),

  updateAppointment: (token: string, id: string, data: any) =>
    apiRequest(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: data,
      token
    })
}

// Prescriptions API
export const prescriptionsApi = {
  getPrescriptions: (token: string, params?: { status?: string; patientId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.patientId) searchParams.append('patientId', params.patientId)

    const query = searchParams.toString()
    const endpoint = `/api/patient/prescriptions${query ? `?${query}` : ''}`

    return apiRequest(endpoint, { token })
  },

  createPrescription: (token: string, data: any) =>
    apiRequest('/api/prescriptions', {
      method: 'POST',
      body: data,
      token
    })
}

// Departments API
export const departmentsApi = {
  getDepartments: () =>
    apiRequest('/api/departments')
}

// Medications API
export const medicationsApi = {
  getMedications: () =>
    apiRequest('/api/medications')
}

// Doctors API
export const doctorsApi = {
  getStats: (token: string) =>
    apiRequest('/api/doctors/stats', { token }),

  getTodaySchedule: (token: string) => {
    // 오늘 예약만 가져오기 위해 appointments API 사용
    return appointmentsApi.getAppointments(token)
  },

  getRecentPatients: (token: string) =>
    apiRequest('/api/doctors/recent-patients', { token })
}

// Pharmacy API
export const pharmacyApi = {
  getStats: (token: string) =>
    apiRequest('/api/pharmacy/stats', { token }),

  getPendingPrescriptions: (token: string) =>
    apiRequest('/api/pharmacy/pending-prescriptions', { token }),

  getPrescriptions: (token: string, params?: { status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)

    const query = searchParams.toString()
    const endpoint = `/api/pharmacy/prescriptions${query ? `?${query}` : ''}`

    return apiRequest(endpoint, { token })
  },

  getLowStockItems: (token: string) =>
    apiRequest('/api/pharmacy/inventory', { token }),

  getPrescriptionDetail: (token: string, id: string) =>
    apiRequest(`/api/pharmacy/prescriptions/${id}`, { token }),

  updatePrescriptionStatus: (token: string, id: string, data: { status: string; notes?: string }) =>
    apiRequest(`/api/pharmacy/prescriptions/${id}`, {
      method: 'PATCH',
      body: data,
      token
    })
}

export { ApiError }