import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ─── Request interceptor: attach JWT ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response interceptor: handle 401 ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  firebaseLogin: (idToken) => api.post('/auth/firebase-login', { id_token: idToken }),
}

// ─── Learning ─────────────────────────────────────────────────────────
export const learningApi = {
  explain: (topic, level) => api.post('/learning/explain', { topic, level }),
  quiz: (topic, difficulty, num_questions = 3) =>
    api.post('/learning/quiz', { topic, difficulty, num_questions }),
  evaluate: (data) => api.post('/learning/evaluate', data),
}

// ─── Chat ─────────────────────────────────────────────────────────────
export const chatApi = {
  send: (message, history, topic_context) =>
    api.post('/chat', { message, history, topic_context }),
  history: () => api.get('/chat/history'),
}

// ─── Users ────────────────────────────────────────────────────────────
export const usersApi = {
  me: () => api.get('/users/me'),
  progress: () => api.get('/users/progress'),
  recommendations: () => api.get('/users/recommendations'),
}

export default api
