import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const AuthSuccess = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { updateUser } = useAuth()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const token = searchParams.get('token')
      
      if (!token) {
        toast.error('No authentication token found')
        navigate('/login')
        return
      }

      try {
        // Store token
        localStorage.setItem('token', token)
        
        // Fetch user data with the new token
        const response = await authAPI.getCurrentUser()
        
        // Update auth context
        updateUser(response.data.user)
        
        toast.success('Login successful!')
        navigate('/dashboard')
      } catch (error) {
        console.error('Auth success error:', error)
        localStorage.removeItem('token')
        toast.error('Authentication failed. Please try again.')
        navigate('/login')
      } finally {
        setIsProcessing(false)
      }
    }

    handleAuthSuccess()
  }, [searchParams, navigate, updateUser])

  if (!isProcessing) {
    return null // Component will unmount after navigation
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}

export default AuthSuccess