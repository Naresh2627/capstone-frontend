import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api'

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
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
  getAllPosts: (params) => api.get('/posts', { params }),
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