import axios from 'axios'
import { supabase } from '../config/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// API interceptor - add auth for protected endpoints
api.interceptors.request.use(async (config) => {
  try {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    
    // Protected endpoints that need auth (even for GET requests)
    const protectedEndpoints = [
      '/posts/user/my-posts',
      '/auth/me',
      '/users/profile'
    ]
    
    // Check if this is a protected endpoint or non-GET request
    const needsAuth = config.method?.toLowerCase() !== 'get' || 
                     protectedEndpoints.some(endpoint => config.url?.includes(endpoint))
    
    if (needsAuth) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
        console.log('Added auth header for', config.method?.toUpperCase(), config.url)
      }
    }
    
    return config
  } catch (error) {
    console.error('API interceptor error:', error)
    return config
  }
})

// Handle token expiration and errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url)
    return response
  },
  async (error) => {
    console.error('API Error:', error.response?.status, error.response?.data, error.config?.url)
    
    if (error.response?.status === 401) {
      // Try to refresh the session
      try {
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !session) {
          // If refresh fails, sign out and redirect
          await supabase.auth.signOut()
          window.location.href = '/login'
        } else {
          // Retry the original request with new token
          const originalRequest = error.config
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`
          return api.request(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        await supabase.auth.signOut()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
}

// Posts API
export const postsAPI = {
  getAllPosts: async (params) => {
    try {
      console.log('getAllPosts: Starting request with params:', params)
      
      // Direct axios call to bypass interceptors for testing
      const directResponse = await axios.get(`${API_URL}/posts`, { 
        params,
        timeout: 10000 // 10 second timeout
      })
      
      console.log('getAllPosts: Direct response success:', directResponse.status, directResponse.data)
      return directResponse
    } catch (error) {
      console.error('getAllPosts: Direct request failed:', error.message, error.response?.data)
      
      // Fallback to regular api call
      try {
        console.log('getAllPosts: Trying fallback with api instance...')
        const response = await api.get('/posts', { params })
        console.log('getAllPosts: Fallback success:', response)
        return response
      } catch (fallbackError) {
        console.error('getAllPosts: Fallback also failed:', fallbackError)
        throw fallbackError
      }
    }
  },
  getPost: (id) => api.get(`/posts/${id}`),
  getUserPosts: (params) => api.get('/posts/user/my-posts', { params }),
  createPost: (postData) => api.post('/posts', postData),
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
  togglePublish: (id) => api.patch(`/posts/${id}/toggle-publish`)
}

// Users API
export const usersAPI = {
  getUser: (id) => api.get(`/users/${id}`),
  getUserPosts: (id, params) => api.get(`/users/${id}/posts`, { params }),
  updateProfile: (userData) => api.put('/users/profile', userData)
}

export default api