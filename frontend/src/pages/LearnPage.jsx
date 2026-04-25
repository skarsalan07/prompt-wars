import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, ChevronRight, BookOpen, Brain, Zap } from 'lucide-react'
import { useLearningStore } from '@/store/learningStore'
import { learningApi } from '@/services/api'
import ExplanationPanel from '@/components/learning/ExplanationPanel'
import QuizPanel from '@/components/learning/QuizPanel'
import { cn } from '@/lib/utils'

const LEVELS = [
  { key: 'simple',       icon: BookOpen, label: 'Simple',       desc: 'Beginner-friendly' },
  { key: 'intermediate', icon: Brain,    label: 'Intermediate', desc: 'With technical depth' },
  { key: 'advanced',     icon: Zap,      label: 'Advanced',     desc: 'Expert level'      },
]

const POPULAR = ['Binary Trees', 'Machine Learning', 'React Hooks', 'SQL Joins', 'Big O Notation', 'Neural Networks', 'REST APIs', 'Recursion']

export default function LearnPage() {
  const {
    currentTopic, setTopic,
    currentLevel, setLevel,
    explanation, setExplanation,
    isLoadingExplain, setLoadingExplain,
    quiz, setQuiz,
    isLoadingQuiz, setLoadingQuiz,
  } = useLearningStore()

  const [input, setInput] = useState(currentTopic)
  const [view, setView] = useState('explain') // 'explain' | 'quiz'

  async function handleExplain(e) {
    e?.preventDefault()
    if (!input.trim()) return
    setTopic(input.trim())
    setLoadingExplain(true)
    setExplanation(null)
    try {
      const res = await learningApi.explain(input.trim(), currentLevel)
      setExplanation(res.data)
    } finally {
      setLoadingExplain(false)
    }
  }

  async function handleQuiz() {
    if (!currentTopic) return
    setView('quiz')
    setLoadingQuiz(true)
    setQuiz(null)
    try {
      const difficulty = currentLevel === 'simple' ? 'easy' : currentLevel === 'intermediate' ? 'medium' : 'hard'
      const res = await learningApi.quiz(currentTopic, difficulty, 3)
      setQuiz(res.data)
    } finally {
      setLoadingQuiz(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Topic search */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold mb-1">What do you want to learn?</h2>
        <p className="text-sm text-muted-foreground mb-5">Enter any topic and your AI tutor will explain it at your level.</p>

        <form onSubmit={handleExplain} aria-label="Topic search form">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                id="topic-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Binary Trees, Machine Learning, Recursion…"
                aria-label="Topic to learn"
                className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoadingExplain}
              aria-label="Explain topic"
              className="flex items-center gap-2 gradient-bg text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity glow-sm whitespace-nowrap"
            >
              <Sparkles size={14} aria-hidden />
              {isLoadingExplain ? 'Thinking…' : 'Explain'}
            </button>
          </div>
        </form>

        {/* Quick picks */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Popular topics</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((t) => (
              <button
                key={t}
                onClick={() => { setInput(t); setTopic(t) }}
                aria-label={`Learn ${t}`}
                className="text-xs glass border border-border px-3 py-1 rounded-full hover:border-primary/40 hover:text-primary transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Level selector */}
      <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Learning level">
        {LEVELS.map(({ key, icon: Icon, label, desc }) => (
          <button
            key={key}
            role="radio"
            aria-checked={currentLevel === key}
            onClick={() => setLevel(key)}
            className={cn(
              'glass rounded-xl p-4 text-left transition-all duration-200 border',
              currentLevel === key
                ? 'border-primary/50 bg-primary/10'
                : 'border-border hover:border-primary/30'
            )}
          >
            <Icon size={16} className={cn('mb-2', currentLevel === key ? 'text-primary' : 'text-muted-foreground')} aria-hidden />
            <p className={cn('text-sm font-semibold', currentLevel === key ? 'text-primary' : '')}>{label}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </button>
        ))}
      </div>

      {/* View toggle (shown after first explain) */}
      {(explanation || quiz) && (
        <div className="flex gap-2" role="tablist" aria-label="Content view">
          {['explain', 'quiz'].map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => { setView(v); if (v === 'quiz' && !quiz) handleQuiz() }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                view === v ? 'gradient-bg text-white glow-sm' : 'glass border border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {v === 'explain' ? <><BookOpen size={13} aria-hidden /> Explanation</> : <><Zap size={13} aria-hidden /> Quiz Me</>}
            </button>
          ))}
        </div>
      )}

      {/* Content panels */}
      <AnimatePresence mode="wait">
        {view === 'explain' && (explanation || isLoadingExplain) && (
          <ExplanationPanel key="explain" data={explanation} loading={isLoadingExplain} onQuiz={() => { setView('quiz'); if (!quiz) handleQuiz() }} />
        )}
        {view === 'quiz' && (quiz || isLoadingQuiz) && (
          <QuizPanel key="quiz" data={quiz} loading={isLoadingQuiz} topic={currentTopic} />
        )}
      </AnimatePresence>
    </div>
  )
}
