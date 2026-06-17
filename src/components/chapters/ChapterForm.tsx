'use client'

import { useState } from 'react'
import { Chapter } from '@/lib/types'

interface ChapterFormProps {
  initial?: Partial<Chapter>
  defaultNumero?: number
  onSubmit: (data: Partial<Chapter>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function ChapterForm({ initial, defaultNumero = 1, onSubmit, onCancel, loading }: ChapterFormProps) {
  const [form, setForm] = useState({
    numero: initial?.numero ?? defaultNumero,
    titre: initial?.titre ?? '',
    résumé: initial?.résumé ?? '',
    idées_clés: initial?.idées_clés ?? '',
    application_pratique: initial?.application_pratique ?? '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit({
      ...form,
      résumé: form.résumé || null,
      idées_clés: form.idées_clés || null,
      application_pratique: form.application_pratique || null,
    })
  }

  const field = 'w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors text-sm resize-none'
  const label = 'block text-sm font-medium text-text-secondary mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className={label}>N°</label>
          <input
            type="number"
            min={1}
            className={field}
            value={form.numero}
            onChange={e => setForm(f => ({ ...f, numero: parseInt(e.target.value) || 1 }))}
            required
          />
        </div>
        <div className="col-span-3">
          <label className={label}>Titre *</label>
          <input
            className={field}
            value={form.titre}
            onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
            placeholder="Titre du chapitre"
            required
          />
        </div>
      </div>

      <div>
        <label className={label}>Résumé</label>
        <textarea
          className={field}
          rows={3}
          value={form.résumé}
          onChange={e => setForm(f => ({ ...f, résumé: e.target.value }))}
          placeholder="Résumé du chapitre…"
        />
      </div>

      <div>
        <label className={label}>Idées clés</label>
        <textarea
          className={field}
          rows={3}
          value={form.idées_clés}
          onChange={e => setForm(f => ({ ...f, idées_clés: e.target.value }))}
          placeholder="Les idées principales à retenir…"
        />
      </div>

      <div>
        <label className={label}>Application pratique</label>
        <textarea
          className={field}
          rows={3}
          value={form.application_pratique}
          onChange={e => setForm(f => ({ ...f, application_pratique: e.target.value }))}
          placeholder="Comment appliquer ces idées dans ma vie…"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors"
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
