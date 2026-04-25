import { motion } from 'framer-motion'
import { GraduationCap, Brain, BarChart3, MessageSquare, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const features = [
  { icon: Brain,       title: 'AI-Powered Learning',    desc: 'Gemini 1.5 Pro explains any concept at your level — beginner to expert.' },
  { icon: BarChart3,   title: 'Smart Personalization',  desc: 'Tracks your strengths and weaknesses to build a custom learning path.' },
  { icon: MessageSquare, title: 'Conversational AI',    desc: 'Chat with your AI tutor, ask follow-up questions, go deep.' },
  { icon: Zap,         title: 'Adaptive Quizzes',       desc: 'MCQs that adapt to your pace. Instant semantic feedback on every answer.' },
  { icon: BarChart3,   title: 'Progress Dashboard',     desc: 'Beautiful charts tracking streaks, accuracy, and mastered topics.' },
  { icon: Shield,      title: 'Secure & Private',       desc: 'Firebase Auth + JWT. Your data is yours, always.' },
]

const stats = [
  { value: '100+', label: 'Topics Supported' },
  { value: '3x',   label: 'Faster Learning'  },
  { value: '98%',  label: 'User Satisfaction' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground noise-bg overflow-x-hidden">
      {/* Glow backdrop */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto" role="navigation" aria-label="Main navigation">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center glow-sm">
            <GraduationCap size={16} className="text-white" aria-hidden />
          </div>
          <span className="font-bold gradient-text text-lg">Learning Companion</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/auth')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/auth?mode=register')}
            aria-label="Get started for free"
            className="text-sm gradient-bg text-white px-5 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity glow-sm"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-24 max-w-5xl mx-auto" aria-labelledby="hero-heading">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-8">
            <Sparkles size={12} className="text-primary" aria-hidden />
            Powered by Google Gemini 1.5 Pro
          </div>
          <h1
            id="hero-heading"
            className="text-6xl md:text-7xl font-black leading-tight mb-6"
          >
            Learn anything,{' '}
            <span className="gradient-text">10x faster</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Your AI-powered learning companion that adapts to your pace, explains concepts at your level, quizzes you intelligently, and builds your personalized learning path.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate('/auth?mode=register')}
              aria-label="Start learning for free"
              className="flex items-center gap-2 gradient-bg text-white px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all glow text-sm"
            >
              Start Learning Free <ArrowRight size={16} aria-hidden />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 glass border border-border px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-secondary transition-all"
            >
              Sign In
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex items-center justify-center gap-12 mt-16 flex-wrap"
          aria-label="Platform statistics"
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-black gradient-text">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto" aria-labelledby="features-heading">
        <h2 id="features-heading" className="text-3xl font-bold text-center mb-12">
          Everything you need to <span className="gradient-text">master any topic</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl gradient-bg/20 border border-primary/20 flex items-center justify-center mb-4 group-hover:glow-sm transition-all">
                <Icon size={18} className="text-primary" aria-hidden />
              </div>
              <h3 className="font-semibold text-sm mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 text-center px-6 pb-24" aria-labelledby="cta-heading">
        <div className="glass rounded-3xl p-12 max-w-2xl mx-auto border-primary/20">
          <h2 id="cta-heading" className="text-3xl font-bold mb-4">Ready to start learning?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of learners accelerating their knowledge with AI.</p>
          <button
            onClick={() => navigate('/auth?mode=register')}
            aria-label="Create a free account"
            className="gradient-bg text-white px-10 py-3.5 rounded-xl font-semibold glow hover:opacity-90 transition-opacity text-sm"
          >
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-xs text-muted-foreground border-t border-border" role="contentinfo">
        <p>© 2025 Learning Companion · Built with Google Gemini &amp; Firebase</p>
      </footer>
    </div>
  )
}
