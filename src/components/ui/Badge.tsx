import { BookStatus } from '@/lib/types'
import clsx from 'clsx'

const statusConfig: Record<BookStatus, { label: string; className: string }> = {
  'À lire': { label: 'À lire', className: 'bg-border text-text-secondary' },
  'En cours': { label: 'En cours', className: 'bg-blue-950/50 text-blue-300 border border-blue-800/30' },
  'Terminé': { label: 'Terminé', className: 'bg-green-950/50 text-green-300 border border-green-800/30' },
}

export function StatusBadge({ status }: { status: BookStatus }) {
  const config = statusConfig[status]
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium', config.className)}>
      {config.label}
    </span>
  )
}

export function TagBadge({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-accent-muted text-accent px-2.5 py-1 rounded-lg text-xs font-medium">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-accent-hover transition-colors leading-none">×</button>
      )}
    </span>
  )
}
