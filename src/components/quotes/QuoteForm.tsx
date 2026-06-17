'use client'

import { useState } from 'react'
import { Quote } from '@/lib/types'

interface QuoteFormProps {
  initial?: Partial<Quote>
  onSubmit: (data: { contenu: string }) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function QuoteForm({ initial, onSubmit, onCancel, loading }: QuoteFormProps) {
  const [contenu, setContenu] = useState(initial?.contenu ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({ contenu })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">Citation *</label>
        <textarea
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors text-sm resize-none"
          rows={5}
          value={contenu}
          onChange={e => setContenu(e.target.value)}
          placeholder="Saisissez la citation…"
          required
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading || !contenu.trim()}
          className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent-hover text-background font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Enregistrement…' : initial?.id ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}
