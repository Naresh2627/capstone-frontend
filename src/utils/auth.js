import { supabase } from '../config/supabase'

// Get current JWT token
export const getAccessToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    return null
  }
  return session.access_token
}

// Get refresh token
export const getRefreshToken = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) {
    return null
  }
  return session.refresh_token
}

// Check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Math.floor(Date.now() / 1000)
    return payload.exp < currentTime
  } catch (error) {
    return true
  }
}

// Refresh session manually
export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession()
  if (error) {
    console.error('Error refreshing session:', error)
    return null
  }
  return data.session
}

// Get user from JWT token
export const getUserFromToken = (token) => {
  if (!token) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat
    }
  } catch (error) {
    console.error('Error parsing token:', error)
    return null
  }
}

// Set up automatic token refresh (Auth v2)
export const setupTokenRefresh = () => {
  // Supabase Auth v2 handles this automatically with improved reliability
  supabase.auth.onAuthStateChange((event, session) => {
    switch (event) {
      case 'TOKEN_REFRESHED':
        console.log('Auth v2: Token refreshed successfully')
        break
      case 'SIGNED_OUT':
        console.log('Auth v2: User signed out')
        break
      case 'SIGNED_IN':
        console.log('Auth v2: User signed in')
        break
      case 'USER_UPDATED':
        console.log('Auth v2: User profile updated')
        break
      default:
        console.log('Auth v2 event:', event)
    }
  })
}

// Auth v2: Enhanced session management
export const getSessionWithRetry = async (maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.warn(`Session retrieval attempt ${i + 1} failed:`, error)
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

// Auth v2: Enhanced user management
export const updateUserMetadata = async (metadata) => {
  const { data, error } = await supabase.auth.updateUser({
    data: metadata
  })
  if (error) throw error
  return data
}