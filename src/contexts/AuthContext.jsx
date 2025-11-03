import { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token)
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      }
    case 'LOGOUT':
      localStorage.removeItem('token')
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false
      }
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const response = await authAPI.getCurrentUser()
          dispatch({ type: 'SET_USER', payload: response.data.user })
        } catch (error) {
          localStorage.removeItem('token')
          dispatch({ type: 'SET_USER', payload: null })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data })
      toast.success('Login successful!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      dispatch({ type: 'LOGIN_SUCCESS', payload: response.data })
      toast.success('Registration successful!')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const updateUser = (userData) => {
    dispatch({ type: 'SET_USER', payload: userData })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser
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