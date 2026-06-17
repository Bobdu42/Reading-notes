'use client'

import { useState } from 'react'
import { Download, FileText, ChevronDown } from 'lucide-react'

interface ExportButtonProps {
  bookId: string
  bookTitle: string
}

type Format = 'md' | 'txt'

const formats: { value: Format; label: string; icon: string }[] = [
  { value: 'md', label: 'Markdown (.md)', icon: '# ' },
  { value: 'txt', label: 'Texte (.txt)', icon: 'T ' },
]

export default function ExportButton({ bookId, bookTitle }: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<Format | null>(null)

  async function handleExport(format: Format) {
    setLoading(format)
    setOpen(false)

    try {
      const res = await fetch(`/api/export-book?bookId=${bookId}&format=${format}`)
      if (!res.ok) throw new Error('Export échoué')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${bookTitle.replace(/[^a-zA-Z0-9À-ɏ\s]/g, '').trim().replace(/\s+/g, '_')}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors de l\'export.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading !== null}
        className="flex items-center gap-2 px-3 py-2 border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all disabled:opacity-50"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        Exporter
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl z-20 overflow-hidden animate-slide-up">
            {formats.map(f => (
              <button
                key={f.value}
                onClick={() => handleExport(f.value)}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-border/50 transition-colors text-left"
              >
                <span className="w-6 h-6 bg-accent-muted rounded flex items-center justify-center text-accent text-xs font-bold">
                  {f.icon}
                </span>
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
