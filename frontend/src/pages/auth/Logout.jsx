import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    useAuthStore.getState().logout()
    navigate('/login', { replace: true })
  }, [navigate])

  return null
}
