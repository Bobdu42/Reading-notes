'use client'

import { useState } from 'react'
import { Pencil, Trash2, ChevronDown, ChevronUp, Lightbulb, Target, FileText } from 'lucide-react'
import { Chapter } from '@/lib/types'

interface ChapterCardProps {
  chapter: Chapter
  onEdit: () => void
  onDelete: () => void
}

export default function ChapterCard({ chapter, onEdit, onDelete }: ChapterCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-card-hover transition-colors"
      >
        <span className="flex-shrink-0 w-8 h-8 bg-accent-muted text-accent rounded-lg flex items-center justify-center text-sm font-bold">
          {chapter.numero}
        </span>
        <span className="flex-1 font-medium text-text-primary">{chapter.titre}</span>
        {expanded ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border animate-fade-in">
          {chapter.résumé && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-3.5 h-3.5 text-text-secondary" />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Résumé</span>
              </div>
              <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{chapter.résumé}</p>
            </div>
          )}

          {chapter.idées_clés && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Idées clés</span>
              </div>
              <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{chapter.idées_clés}</p>
            </div>
          )}

          {chapter.application_pratique && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Application pratique</span>
              </div>
              <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{chapter.application_pratique}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-border">
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
      )}
    </div>
  )
}
