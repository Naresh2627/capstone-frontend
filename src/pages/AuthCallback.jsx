import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const AuthCallback = () => {
  const navigate = useNavigate()
  const { updateUser, isAuthenticated, user } = useAuth()
  const [processed, setProcessed] = useState(false)
  const toastShownRef = useRef(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (processed) return // Prevent multiple executions
      
      try {
        console.log('AuthCallback: Processing OAuth callback...')
        console.log('Current URL:', window.location.href)
        
        // Check if we have URL fragments (OAuth callback)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          console.log('Found OAuth tokens in URL')
          
          // Set the session with the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('Error setting session:', error)
            toast.error(`Authentication failed: ${error.message}`)
            navigate('/login')
            return
          }
          
          if (data.session) {
            console.log('OAuth session set successfully:', data.session.user.email)
            if (!toastShownRef.current) {
              toastShownRef.current = true
              toast.success('Welcome back!')
            }
            setProcessed(true)
            navigate('/dashboard')
            return
          }
        }
        
        // Fallback: check for existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          toast.error('Authentication failed')
          navigate('/login')
          return
        }
        
        if (sessionData.session) {
          console.log('Found existing session:', sessionData.session.user.email)
          setProcessed(true)
          navigate('/dashboard')
        } else {
          console.log('No session found')
          toast.error('Authentication incomplete. Please try again.')
          navigate('/login')
        }
        
      } catch (error) {
        console.error('Auth callback error:', error)
        toast.error('Authentication failed')
        navigate('/login')
      }
    }

    if (!processed) {
      handleAuthCallback()
    }
  }, [navigate, updateUser, processed])

  // Navigate to dashboard when authenticated (without showing toast here)
  useEffect(() => {
    if (!processed && isAuthenticated && user) {
      console.log('Auth state changed - user is now authenticated:', user.email)
      setProcessed(true)
      navigate('/dashboard')
    }
  }, [isAuthenticated, user, navigate, processed])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}

export default AuthCallback