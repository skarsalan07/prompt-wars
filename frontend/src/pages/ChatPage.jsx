import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User as UserIcon, Sparkles } from 'lucide-react'
import { chatApi } from '@/services/api'
import { useChatStore } from '@/store/chatStore'
import { useLearningStore } from '@/store/learningStore'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const { messages, addMessage, isLoading, setLoading, loadHistory } = useChatStore()
  const { currentTopic } = useLearningStore()
  const [input, setInput] = useState('')
  const [initLoad, setInitLoad] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await chatApi.history()
        loadHistory(res.data)
      } catch (e) {
        console.error('Failed to load history', e)
      } finally {
        setInitLoad(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    setInput('')
    addMessage({ role: 'user', content: userMsg })
    setLoading(true)

    try {
      const res = await chatApi.send(userMsg, messages, currentTopic)
      addMessage({ role: 'assistant', content: res.data.reply })
    } catch (err) {
      addMessage({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (initLoad) {
    return <div className="flex h-full items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto glass rounded-2xl overflow-hidden border border-border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-secondary/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center glow-sm">
            <Bot size={16} className="text-white" aria-hidden />
          </div>
          <div>
            <h2 className="text-sm font-bold">AI Tutor</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles size={10} className="text-primary" /> Powered by Gemini
            </p>
          </div>
        </div>
        {currentTopic && (
          <div className="text-xs px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-medium">
            Topic Context: {currentTopic}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6" role="log" aria-label="Chat messages">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Bot size={32} className="text-muted-foreground" aria-hidden />
            </div>
            <h3 className="text-lg font-bold mb-2">How can I help you learn?</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Ask me to explain a concept, give you an example, or quiz you on a specific topic.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user'
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex gap-4 max-w-[85%]", isUser ? "ml-auto flex-row-reverse" : "")}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                isUser ? "bg-secondary text-muted-foreground" : "gradient-bg text-white shadow-sm"
              )}>
                {isUser ? <UserIcon size={14} aria-hidden /> : <Bot size={14} aria-hidden />}
              </div>
              <div className={cn(
                "px-5 py-3.5 rounded-2xl text-sm leading-relaxed",
                isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary text-foreground rounded-tl-sm border border-border"
              )}>
                {/* Basic markdown simulation for bot responses */}
                {isUser ? msg.content : msg.content.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 last:mb-0">
                    {line.includes('**') ? (
                      <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    ) : line}
                  </p>
                ))}
              </div>
            </motion.div>
          )
        })}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%]">
             <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center shrink-0 text-white shadow-sm">
              <Bot size={14} aria-hidden />
            </div>
            <div className="px-5 py-4 rounded-2xl bg-secondary rounded-tl-sm border border-border flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background shrink-0">
        <form onSubmit={handleSend} className="relative flex items-center" aria-label="Message form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI tutor anything..."
            disabled={isLoading}
            aria-label="Message input"
            className="w-full bg-secondary border border-border rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className="absolute right-2 w-9 h-9 flex items-center justify-center rounded-lg gradient-bg text-white disabled:opacity-50 hover:opacity-90 transition-opacity disabled:grayscale"
          >
            <Send size={16} aria-hidden />
          </button>
        </form>
      </div>
    </div>
  )
}
