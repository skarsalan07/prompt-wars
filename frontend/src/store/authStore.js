import { create } from 'zustand'

const GUEST = {
  id: 'guest',
  email: 'guest@learning.ai',
  display_name: 'Learner',
  created_at: new Date().toISOString(),
}

export const useAuthStore = create(() => ({
  user: GUEST,
  token: null,
  isAuthenticated: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
}))
