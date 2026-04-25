import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, BookOpen, MessageSquare, User, GraduationCap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/learn',     icon: BookOpen,         label: 'Learn'     },
  { to: '/app/chat',      icon: MessageSquare,    label: 'AI Chat'   },
  { to: '/app/profile',   icon: User,             label: 'Profile'   },
]

export default function Sidebar() {
  return (
    <aside
      className="w-64 h-screen flex flex-col glass border-r border-border shrink-0"
      aria-label="Sidebar navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center glow-sm shrink-0">
          <GraduationCap size={18} className="text-white" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-bold gradient-text">Learning</p>
          <p className="text-xs text-muted-foreground -mt-0.5">Companion</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Primary navigation">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                  aria-hidden
                />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Branding footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Powered by{' '}
          <span className="gradient-text font-semibold">Gemini AI</span>
        </p>
      </div>
    </aside>
  )
}
