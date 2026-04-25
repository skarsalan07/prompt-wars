import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ─── Learning ─────────────────────────────────────────────────────────────
export const learningApi = {
  explain: (topic, level) => api.post('/learning/explain', { topic, level }),
  quiz: (topic, difficulty, num_questions = 3) =>
    api.post('/learning/quiz', { topic, difficulty, num_questions }),
  evaluate: (data) => api.post('/learning/evaluate', data),
}

// ─── Chat ─────────────────────────────────────────────────────────────────
export const chatApi = {
  send: (message, history, topic_context) =>
    api.post('/chat', { message, history, topic_context }),
  history: () => api.get('/chat/history'),
}

// ─── Users ────────────────────────────────────────────────────────────────
export const usersApi = {
  me: () => api.get('/users/me'),
  progress: () => api.get('/users/progress'),
  recommendations: () => api.get('/users/recommendations'),
}

export default api
