import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function WeaknessStrengthChart({ strong = [], weak = [], loading }) {
  if (loading) {
    return (
      <div className="space-y-2" aria-label="Loading topic data">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded-lg shimmer" />
        ))}
      </div>
    )
  }

  if (!strong.length && !weak.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Complete some quizzes to see your topic breakdown here.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {strong.length > 0 && (
        <div>
          <p className="text-xs text-green-400 font-medium mb-2 flex items-center gap-1">
            <CheckCircle2 size={12} aria-hidden /> Strengths
          </p>
          <div className="flex flex-wrap gap-2">
            {strong.map((t) => (
              <span key={t} className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
      {weak.length > 0 && (
        <div>
          <p className="text-xs text-red-400 font-medium mb-2 flex items-center gap-1">
            <AlertCircle size={12} aria-hidden /> Needs Work
          </p>
          <div className="flex flex-wrap gap-2">
            {weak.map((t) => (
              <span key={t} className="text-xs bg-red-500/15 text-red-400 border border-red-500/20 px-3 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
