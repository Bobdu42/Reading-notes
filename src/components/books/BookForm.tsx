'use client'

import { useState } from 'react'
import { Book, BookStatus } from '@/lib/types'
import StarRating from '@/components/ui/StarRating'

interface BookFormProps {
  initial?: Partial<Book>
  onSubmit: (data: Partial<Book>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const STATUTS: BookStatus[] = ['À lire', 'En cours', 'Terminé']

export default function BookForm({ initial, onSubmit, onCancel, loading }: BookFormProps) {
  const [form, setForm] = useState({
    titre: initial?.titre ?? '',
    auteur: initial?.auteur ?? '',
    couverture: initial?.couverture ?? '',
    note: initial?.note ?? null as number | null,
    statut: initial?.statut ?? 'À lire' as BookStatus,
    date_lecture: initial?.date_lecture ?? '',
    résumé: initial?.résumé ?? '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      ...form,
      note: form.note,
      couverture: form.couverture || null,
      date_lecture: form.date_lecture || null,
      résumé: form.résumé || null,
    })
  }

  const field = 'w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors text-sm'
  const label = 'block text-sm font-medium text-text-secondary mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className={label}>Titre *</label>
          <input
            className={field}
            value={form.titre}
            onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
            placeholder="Titre du livre"
            required
          />
        </div>

        <div>
          <label className={label}>Auteur *</label>
          <input
            className={field}
            value={form.auteur}
            onChange={e => setForm(f => ({ ...f, auteur: e.target.value }))}
            placeholder="Nom de l'auteur"
            required
          />
        </div>

        <div>
          <label className={label}>Statut</label>
          <select
            className={field}
            value={form.statut}
            onChange={e => setForm(f => ({ ...f, statut: e.target.value as BookStatus }))}
          >
            {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={label}>URL de couverture</label>
          <input
            className={field}
            type="url"
            value={form.couverture}
            onChange={e => setForm(f => ({ ...f, couverture: e.target.value }))}
            placeholder="https://..."
          />
        </div>

        <div>
          <label className={label}>Date de lecture</label>
          <input
            className={field}
            type="date"
            value={form.date_lecture}
            onChange={e => setForm(f => ({ ...f, date_lecture: e.target.value }))}
          />
        </div>

        <div>
          <label className={label}>Note</label>
          <div className="flex items-center h-[46px]">
            <StarRating
              value={form.note}
              onChange={v => setForm(f => ({ ...f, note: v === f.note ? null : v }))}
            />
            {form.note !== null && (
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, note: null }))}
                className="ml-3 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={label}>Résumé</label>
          <textarea
            className={`${field} resize-none`}
            rows={4}
            value={form.résumé}
            onChange={e => setForm(f => ({ ...f, résumé: e.target.value }))}
            placeholder="Résumé général du livre…"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent-hover text-background font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Enregistrement…' : initial?.id ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </form>
  )
}
