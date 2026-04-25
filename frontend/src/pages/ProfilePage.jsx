import { motion } from 'framer-motion'
import { User as UserIcon, Mail, Calendar, Shield } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-6">Your Profile</h2>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8"
      >
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center text-4xl font-bold text-white shadow-lg shrink-0">
            L
          </div>
          <div>
            <h3 className="text-2xl font-bold">Learner</h3>
            <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
              <Mail size={14} /> guest@learning.ai
            </p>
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Session</p>
                <p className="text-xs text-muted-foreground">Your current learning session</p>
              </div>
            </div>
            <p className="text-sm font-semibold">Active Now</p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Account Status</p>
                <p className="text-xs text-muted-foreground">Your current access level</p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-semibold">
              Active Learner
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
            <div className="flex items-center gap-3">
              <UserIcon size={18} className="text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Access Mode</p>
                <p className="text-xs text-muted-foreground">How you access the platform</p>
              </div>
            </div>
            <span className="text-xs px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full font-semibold">
              Open Access
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
