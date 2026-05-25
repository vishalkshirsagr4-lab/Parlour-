import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = 'https://parlour-vr34.onrender.com/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Handle FormData: don't set Content-Type header, let axios auto-detect
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  
  return config
})

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          withCredentials: true,
        })
        const { token } = response.data

        useAuthStore.getState().setAuth(
          useAuthStore.getState().user,
          token
        )

        originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
