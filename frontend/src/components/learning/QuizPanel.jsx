import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, ChevronRight, AlertCircle } from 'lucide-react'
import { learningApi } from '@/services/api'
import { useLearningStore } from '@/store/learningStore'
import { cn } from '@/lib/utils'

export default function QuizPanel({ data, loading, topic }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedKey, setSelectedKey] = useState(null)
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState(null) // EvaluateResponse
  const { addEvaluation } = useLearningStore()

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 space-y-4" aria-busy="true">
        <div className="h-4 w-1/4 rounded bg-secondary shimmer mb-8" />
        <div className="h-6 w-3/4 rounded bg-secondary shimmer mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded-xl bg-secondary shimmer" />)}
        </div>
      </div>
    )
  }

  if (!data?.questions?.length) return null

  const question = data.questions[currentIndex]
  const isLast = currentIndex === data.questions.length - 1

  async function handleOptionSelect(key, text) {
    if (selectedKey || evaluating) return
    setSelectedKey(key)
    setEvaluating(true)
    
    try {
      // In a real app we'd pass the actual correct answer text, 
      // but since we only have the option text and the key we selected, 
      // we'll pass the selected option text as user_answer.
      // The AI will evaluate it semantically against its own context.
      const res = await learningApi.evaluate({
        question: question.question,
        correct_answer: question.explanation || "Correct answer from options", // Fallback if no specific expected string
        user_answer: text,
        topic: topic,
      })
      setResult(res.data)
      addEvaluation(res.data)
    } catch (err) {
      console.error('Eval failed', err)
    } finally {
      setEvaluating(false)
    }
  }

  function handleNext() {
    setSelectedKey(null)
    setResult(null)
    if (!isLast) setCurrentIndex((i) => i + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="glass rounded-2xl p-6 md:p-8"
      role="region"
      aria-label="Quiz"
    >
      <div className="flex items-center justify-between mb-8">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Question {currentIndex + 1} of {data.questions.length}
        </p>
        <span className={cn(
          "text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold border",
          data.difficulty === 'easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
          data.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
          'bg-red-500/10 text-red-400 border-red-500/20'
        )}>
          {data.difficulty}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-6 leading-relaxed">{question.question}</h3>

      <div className="space-y-3 mb-8" role="radiogroup" aria-label="Quiz options">
        {question.options.map((opt) => {
          const isSelected = selectedKey === opt.key
          const showResult = isSelected && result
          const isCorrect = showResult && result.is_correct
          const isWrong = showResult && !result.is_correct

          return (
            <button
              key={opt.key}
              role="radio"
              aria-checked={isSelected}
              disabled={!!selectedKey || evaluating}
              onClick={() => handleOptionSelect(opt.key, opt.text)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200",
                !selectedKey && "border-border hover:border-primary/50 hover:bg-secondary",
                isSelected && !result && "border-primary bg-primary/10",
                isCorrect && "border-green-500 bg-green-500/10",
                isWrong && "border-destructive bg-destructive/10",
                selectedKey && !isSelected && "border-border/50 opacity-50"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn(
                  "flex items-center justify-center w-6 h-6 rounded text-xs font-bold shrink-0",
                  isSelected && !result ? "bg-primary text-white" :
                  isCorrect ? "bg-green-500 text-white" :
                  isWrong ? "bg-destructive text-white" : "bg-secondary text-muted-foreground"
                )}>
                  {opt.key}
                </span>
                <span className="text-sm font-medium">{opt.text}</span>
              </div>
              {evaluating && isSelected && (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
                  <div className="w-1.5 h-1.5 rounded-full bg-primary typing-dot" />
                </div>
              )}
              {isCorrect && <CheckCircle2 size={18} className="text-green-500 shrink-0" aria-hidden />}
              {isWrong && <XCircle size={18} className="text-destructive shrink-0" aria-hidden />}
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
            className="overflow-hidden"
            role="alert"
            aria-live="polite"
          >
            <div className={cn(
              "p-5 rounded-xl border flex gap-4",
              result.is_correct ? "bg-green-500/5 border-green-500/20" : "bg-destructive/5 border-destructive/20"
            )}>
              <div className="mt-0.5 shrink-0">
                {result.is_correct ? (
                  <CheckCircle2 size={20} className="text-green-500" aria-hidden />
                ) : (
                  <AlertCircle size={20} className="text-destructive" aria-hidden />
                )}
              </div>
              <div className="flex-1">
                <p className={cn("text-sm font-bold mb-1", result.is_correct ? "text-green-400" : "text-destructive")}>
                  {result.is_correct ? 'Correct!' : 'Not quite.'} (Score: {Math.round(result.score * 100)}%)
                </p>
                <p className="text-sm text-muted-foreground mb-3">{result.feedback}</p>
                {question.explanation && (
                  <p className="text-xs text-muted-foreground border-l-2 border-border pl-3 mt-2">
                    <span className="font-semibold mr-1">Explanation:</span>
                    {question.explanation}
                  </p>
                )}
                
                <div className="mt-5 flex justify-end">
                  {!isLast ? (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 bg-background hover:bg-secondary border border-border px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Next Question <ChevronRight size={16} aria-hidden />
                    </button>
                  ) : (
                    <div className="text-sm font-semibold text-primary">
                      Quiz Complete! Check your Dashboard.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
