import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Pencil, Trash2 } from 'lucide-react'
import { Book } from '@/lib/types'
import { StatusBadge } from '@/components/ui/Badge'
import StarRating from '@/components/ui/StarRating'

interface BookCardProps {
  book: Book
  onEdit: () => void
  onDelete: () => void
}

export default function BookCard({ book, onEdit, onDelete }: BookCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/30 hover:shadow-lg transition-all group">
      <Link href={`/books/${book.id}`}>
        <div className="relative h-52 bg-border/40 flex items-center justify-center overflow-hidden">
          {book.couverture ? (
            <Image
              src={book.couverture}
              alt={book.titre}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <BookOpen className="w-12 h-12 text-border" />
          )}
          <div className="absolute top-3 left-3">
            <StatusBadge status={book.statut} />
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/books/${book.id}`}>
          <h3 className="font-semibold text-text-primary leading-snug line-clamp-2 hover:text-accent transition-colors">
            {book.titre}
          </h3>
          <p className="text-text-secondary text-sm mt-1">{book.auteur}</p>
        </Link>

        {book.note !== null && (
          <div className="mt-2">
            <StarRating value={book.note} readonly size="sm" />
          </div>
        )}

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
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
    </div>
  )
}
