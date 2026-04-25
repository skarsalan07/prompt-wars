import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-2xl p-5 flex flex-col gap-3"
      role="region"
      aria-label={label}
    >
      <div className={`w-8 h-8 rounded-xl bg-secondary flex items-center justify-center ${color}`}>
        <Icon size={16} aria-hidden />
      </div>
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </motion.div>
  )
}
