import { Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/app/dashboard': 'Dashboard',
  '/app/learn': 'Learn',
  '/app/chat': 'AI Chat',
  '/app/profile': 'Profile',
}

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'Learning Companion'

  return (
    <header
      className="h-14 border-b border-border flex items-center justify-between px-6 glass shrink-0"
      role="banner"
    >
      <h1 className="text-base font-semibold">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} aria-hidden /> : <Moon size={16} aria-hidden />}
        </button>
        <button
          aria-label="Notifications"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Bell size={16} aria-hidden />
        </button>
      </div>
    </header>
  )
}
