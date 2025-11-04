import { createContext, useContext, useReducer, useEffect } from 'react'
import { supabase } from '../config/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload.session,
        user: action.payload.user,
        isAuthenticated: !!action.payload.session,
        loading: false
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        session: null,
        isAuthenticated: false,
        loading: false
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Initializing session...')
        
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
        
        if (error) {
          console.error('Error getting session:', error)
          dispatch({ type: 'SET_SESSION', payload: { session: null, user: null } })
          return
        }

        if (session) {
          console.log('AuthContext: Session found, user:', session.user.email)
          // Use session user data directly, don't make API calls during init
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url
          }
          dispatch({ 
            type: 'SET_SESSION', 
            payload: { 
              session, 
              user: userData 
            } 
          })
        } else {
          console.log('AuthContext: No session found')
          dispatch({ type: 'SET_SESSION', payload: { session: null, user: null } })
        }
      } catch (error) {
        console.error('Session initialization error:', error)
        dispatch({ type: 'SET_SESSION', payload: { session: null, user: null } })
      }
    }

    getInitialSession()

    // Listen for auth changes (Auth v2 improved event handling)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth v2 state changed:', event, session?.user?.email || 'No user')
        
        // Handle different Auth v2 events
        switch (event) {
          case 'INITIAL_SESSION':
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            if (session) {
              // Use session user data directly to avoid API call loops
              const userData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.email.split('@')[0],
                avatar_url: session.user.user_metadata?.avatar_url
              }
              dispatch({ 
                type: 'SET_SESSION', 
                payload: { 
                  session, 
                  user: userData 
                } 
              })
            }
            break
          case 'SIGNED_OUT':
            dispatch({ type: 'SET_SESSION', payload: { session: null, user: null } })
            break
          case 'PASSWORD_RECOVERY':
            console.log('Password recovery initiated')
            break
          case 'USER_UPDATED':
            console.log('User metadata updated')
            break
          default:
            console.log('Unhandled auth event:', event)
        }
      }
    )

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const login = async (credentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials)
      
      if (error) {
        toast.error(error.message)
        throw error
      }

      // Only show success toast for email/password login
      // OAuth login success is handled by AuthCallback component
      toast.success('Login successful!')
      return data
    } catch (error) {
      const message = error.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      console.log('Attempting to register:', userData.email)
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      })
      
      if (error) {
        console.error('Registration error:', error)
        toast.error(error.message)
        throw error
      }

      console.log('Registration successful:', data)

      if (data.user && !data.session) {
        toast.success('Please check your email to confirm your account!')
        return data
      }

      // If auto-confirmed, use session data directly
      if (data.session) {
        const userData = {
          id: data.session.user.id,
          email: data.session.user.email,
          name: data.session.user.user_metadata?.name || data.session.user.email.split('@')[0],
          avatar_url: data.session.user.user_metadata?.avatar_url
        }
        
        dispatch({ 
          type: 'SET_SESSION', 
          payload: { 
            session: data.session, 
            user: userData 
          } 
        })
        toast.success('Registration successful!')
      }

      return data
    } catch (error) {
      console.error('Registration failed:', error)
      const message = error.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  const loginWithGoogle = async () => {
    try {
      console.log('Initiating Google OAuth...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })

      if (error) {
        console.error('Google OAuth error:', error)
        toast.error(error.message)
        throw error
      }

      console.log('Google OAuth initiated successfully')
      // Don't show success message here as user will be redirected
      return data
    } catch (error) {
      console.error('Google login failed:', error)
      const message = error.message || 'Google login failed'
      toast.error(message)
      throw error
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      }
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      dispatch({ type: 'LOGOUT' })
      toast.success('Logged out successfully')
    }
  }

  const updateUser = (userData) => {
    dispatch({ 
      type: 'SET_SESSION', 
      payload: { 
        session: state.session, 
        user: userData 
      } 
    })
  }

  const getAccessToken = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) {
      return null
    }
    return session.access_token
  }

  const getRefreshToken = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) {
      return null
    }
    return session.refresh_token
  }

  const isTokenValid = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return !error && !!session
  }

  const value = {
    ...state,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
    getAccessToken,
    getRefreshToken,
    isTokenValid
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}