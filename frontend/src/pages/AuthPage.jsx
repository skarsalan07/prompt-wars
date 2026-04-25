import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/services/api'
import {
  auth, googleProvider, signInWithPopup,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
} from '@/services/firebase'
import { cn } from '@/lib/utils'

export default function AuthPage() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', display_name: '' })
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const isRegister = mode === 'register'

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Use Firebase Auth client-side, then exchange for backend JWT
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
        const idToken = await cred.user.getIdToken()
        // Also register in our backend
        const res = await authApi.firebaseLogin(idToken)
        login(res.data.user, res.data.access_token)
      } else {
        const cred = await signInWithEmailAndPassword(auth, form.email, form.password)
        const idToken = await cred.user.getIdToken()
        const res = await authApi.firebaseLogin(idToken)
        login(res.data.user, res.data.access_token)
      }
      navigate('/app/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Something went wrong'
      setError(msg.replace('Firebase: ', '').replace(' (auth/', ' (').replace(')', ''))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      const idToken = await cred.user.getIdToken()
      const res = await authApi.firebaseLogin(idToken)
      login(res.data.user, res.data.access_token)
      navigate('/app/dashboard')
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Google sign-in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 noise-bg">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          aria-label="Back to home"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={14} aria-hidden /> Back to home
        </button>

        <div className="glass rounded-2xl p-8 border border-border">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center glow-sm">
              <GraduationCap size={20} className="text-white" aria-hidden />
            </div>
            <div>
              <p className="font-bold gradient-text">Learning Companion</p>
              <p className="text-xs text-muted-foreground">
                {isRegister ? 'Create your account' : 'Welcome back'}
              </p>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex bg-secondary rounded-xl p-1 mb-6" role="tablist" aria-label="Auth mode">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                onClick={() => { setMode(m); setError('') }}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                  mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate aria-label={isRegister ? 'Registration form' : 'Login form'}>
            <AnimatePresence mode="wait">
              {isRegister && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <label htmlFor="display_name" className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
                    <input
                      id="display_name"
                      name="display_name"
                      type="text"
                      required={isRegister}
                      minLength={2}
                      value={form.display_name}
                      onChange={handleChange}
                      placeholder="Your name"
                      autoComplete="name"
                      className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mb-4">
              <label htmlFor="email" className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className="w-full bg-secondary border border-border rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff size={14} aria-hidden /> : <Eye size={14} aria-hidden />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="alert"
                aria-live="assertive"
                className="text-xs text-destructive mb-4 bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full gradient-bg text-white py-2.5 rounded-xl font-semibold text-sm glow hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            aria-label="Continue with Google"
            className="flex items-center justify-center gap-2.5 w-full glass border border-border py-2.5 rounded-xl text-sm font-medium hover:bg-secondary disabled:opacity-50 transition-all"
          >
            {/* Note: In a real app we'd use a proper Google icon, using text here as fallback */}
            G
            Continue with Google
          </button>
        </div>
      </motion.div>
    </div>
  )
}
