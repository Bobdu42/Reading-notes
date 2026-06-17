'use client'

import { Pencil, Trash2, Quote } from 'lucide-react'
import { Quote as QuoteType } from '@/lib/types'

interface QuoteCardProps {
  quote: QuoteType
  onEdit: () => void
  onDelete: () => void
}

export default function QuoteCard({ quote, onEdit, onDelete }: QuoteCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-all group">
      <Quote className="w-5 h-5 text-accent/40 mb-3" />
      <p className="text-text-primary text-sm leading-relaxed italic">{quote.contenu}</p>
      <div className="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-accent-muted"
        >
          <Pencil className="w-3 h-3" />
          Modifier
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-danger transition-colors px-2 py-1 rounded-lg hover:bg-red-950/30"
        >
          <Trash2 className="w-3 h-3" />
          Supprimer
        </button>
      </div>
    </div>
  )
}
