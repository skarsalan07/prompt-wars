import { motion } from 'framer-motion'
import { Sparkles, CheckCircle2, ChevronRight } from 'lucide-react'

export default function ExplanationPanel({ data, loading, onQuiz }) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="glass rounded-2xl p-8 space-y-4"
        aria-busy="true"
      >
        <div className="h-6 w-1/3 rounded bg-secondary shimmer" />
        <div className="space-y-2">
          <div className="h-4 rounded bg-secondary shimmer" />
          <div className="h-4 rounded bg-secondary shimmer" />
          <div className="h-4 w-4/5 rounded bg-secondary shimmer" />
        </div>
      </motion.div>
    )
  }

  if (!data) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="glass rounded-2xl p-6 md:p-8"
      role="region"
      aria-label="Topic explanation"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">{data.topic}</h3>
        <span className="text-xs gradient-bg text-white px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
          {data.level}
        </span>
      </div>

      <div className="prose prose-invert max-w-none text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
        {/* Simple markdown rendering (newlines to paragraphs) */}
        {data.explanation.split('\n\n').map((p, i) => (
          <p key={i} className="mb-4">{p}</p>
        ))}
      </div>

      {data.key_concepts?.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Key Concepts</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-label="Key concepts">
            {data.key_concepts.map((concept) => (
              <li key={concept} className="flex items-start gap-2 bg-secondary/50 rounded-lg p-3 border border-border">
                <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" aria-hidden />
                <span className="text-sm">{concept}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.suggested_next_levels?.length > 0 && (
        <div className="mb-8">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">Next Steps</p>
          <div className="flex flex-wrap gap-2">
            {data.suggested_next_levels.map((topic) => (
              <span key={topic} className="text-xs glass border border-border px-3 py-1.5 rounded-full text-muted-foreground">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-border flex justify-end">
        <button
          onClick={onQuiz}
          aria-label="Take a quiz on this topic"
          className="flex items-center gap-2 gradient-bg text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity glow-sm"
        >
          <Sparkles size={16} aria-hidden /> Test Your Knowledge <ChevronRight size={16} aria-hidden />
        </button>
      </div>
    </motion.div>
  )
}
