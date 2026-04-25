import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Target, Flame, CheckCircle2, TrendingUp, Lightbulb, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLearningStore } from '@/store/learningStore'
import { useAuthStore } from '@/store/authStore'
import { usersApi } from '@/services/api'
import ProgressRing from '@/components/dashboard/ProgressRing'
import WeaknessStrengthChart from '@/components/dashboard/WeaknessStrengthChart'
import StatCard from '@/components/dashboard/StatCard'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { progress, setProgress, recommendations, setRecommendations } = useLearningStore()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const [prog, recs] = await Promise.all([
          usersApi.progress(),
          usersApi.recommendations(),
        ])
        setProgress(prog.data)
        setRecommendations(recs.data)
      } catch {
        // Silently fail — show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const accuracy = progress
    ? progress.total_questions_answered > 0
      ? Math.round((progress.correct_answers / progress.total_questions_answered) * 100)
      : 0
    : 0

  return (
    <div className="max-w-5xl mx-auto space-y-6" aria-label="Dashboard">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold">
            Good {getGreeting()},{' '}
            <span className="gradient-text">{user?.display_name?.split(' ')[0] ?? 'Learner'}</span> 👋
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Here's your learning overview</p>
        </div>
        <button
          onClick={() => navigate('/app/learn')}
          aria-label="Start a new learning session"
          className="flex items-center gap-2 gradient-bg text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity glow-sm"
        >
          <BookOpen size={15} aria-hidden /> Start Learning <ArrowRight size={14} aria-hidden />
        </button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen,     label: 'Topics Studied',  value: loading ? '…' : progress?.topics_studied?.length ?? 0,         color: 'text-blue-400'   },
          { icon: Target,       label: 'Questions Done',  value: loading ? '…' : progress?.total_questions_answered ?? 0,        color: 'text-purple-400' },
          { icon: CheckCircle2, label: 'Accuracy',        value: loading ? '…' : `${accuracy}%`,                                 color: 'text-green-400'  },
          { icon: Flame,        label: 'Day Streak',      value: loading ? '…' : `${progress?.learning_streak ?? 0}🔥`,          color: 'text-orange-400' },
        ].map((stat, i) => (
          <StatCard key={stat.label} {...stat} delay={i * 0.1} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Progress ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 flex flex-col items-center justify-center"
          aria-label="Accuracy ring"
        >
          <ProgressRing value={accuracy} size={120} strokeWidth={10} />
          <p className="text-sm font-medium mt-3">Overall Accuracy</p>
          <p className="text-xs text-muted-foreground">{progress?.correct_answers ?? 0} / {progress?.total_questions_answered ?? 0} correct</p>
        </motion.div>

        {/* Strength/Weakness */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
          aria-label="Strengths and weaknesses"
        >
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={14} className="text-primary" aria-hidden /> Topic Breakdown
          </h3>
          <WeaknessStrengthChart
            strong={progress?.strong_areas ?? []}
            weak={progress?.weak_areas ?? []}
            loading={loading}
          />
        </motion.div>
      </div>

      {/* Recommendations */}
      {recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
          aria-labelledby="rec-heading"
        >
          <h3 id="rec-heading" className="text-sm font-semibold mb-1 flex items-center gap-2">
            <Lightbulb size={14} className="text-yellow-400" aria-hidden /> AI Recommendations
          </h3>
          <p className="text-xs text-muted-foreground mb-4">{recommendations.rationale}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">Next Up</p>
              <div className="flex flex-wrap gap-2">
                {recommendations.next_topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => { navigate('/app/learn') }}
                    aria-label={`Learn ${t}`}
                    className="text-xs bg-primary/15 text-primary border border-primary/20 px-3 py-1 rounded-full hover:bg-primary/25 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">Revise</p>
              <div className="flex flex-wrap gap-2">
                {recommendations.revision_topics.map((t) => (
                  <span key={t} className="text-xs bg-orange-500/15 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
