import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  color?: 'accent' | 'blue' | 'green' | 'purple'
}

const colors = {
  accent: 'bg-accent-muted text-accent',
  blue: 'bg-blue-950/50 text-blue-400',
  green: 'bg-green-950/50 text-green-400',
  purple: 'bg-purple-950/50 text-purple-400',
}

export default function StatsCard({ label, value, icon: Icon, color = 'accent' }: StatsCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-accent/30 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-text-primary mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
