import { createClient } from '@/lib/supabase/server'
import { BookOpen, BookMarked, Quote, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import StatsCard from '@/components/dashboard/StatsCard'
import { StatusBadge } from '@/components/ui/Badge'
import StarRating from '@/components/ui/StarRating'
import { Book } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [booksResult, quotesResult] = await Promise.all([
    supabase
      .from('books')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('quotes')
      .select('id, book_id, books!inner(user_id)')
      .eq('books.user_id', user!.id),
  ])

  const books: Book[] = booksResult.data ?? []
  const totalQuotes = quotesResult.data?.length ?? 0

  const stats = {
    total: books.length,
    read: books.filter(b => b.statut === 'Terminé').length,
    reading: books.filter(b => b.statut === 'En cours').length,
    toRead: books.filter(b => b.statut === 'À lire').length,
  }

  const recentBooks = books.slice(0, 4)

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Tableau de bord</h1>
        <p className="text-text-secondary mt-1">Bienvenue dans votre bibliothèque personnelle</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatsCard label="Livres lus" value={stats.read} icon={BookOpen} color="green" />
        <StatsCard label="En cours" value={stats.reading} icon={BookMarked} color="blue" />
        <StatsCard label="À lire" value={stats.toRead} icon={Clock} color="purple" />
        <StatsCard label="Citations" value={totalQuotes} icon={Quote} color="accent" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-primary">Derniers ajouts</h2>
          <Link href="/library" className="text-sm text-accent hover:text-accent-hover transition-colors">
            Voir tout →
          </Link>
        </div>

        {recentBooks.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <BookOpen className="w-10 h-10 text-border mx-auto mb-3" />
            <p className="text-text-secondary">Aucun livre pour l&apos;instant.</p>
            <Link
              href="/library"
              className="inline-block mt-4 bg-accent hover:bg-accent-hover text-background text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Ajouter un livre
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentBooks.map(book => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-lg transition-all group"
              >
                <div className="relative h-48 bg-border/50 flex items-center justify-center overflow-hidden">
                  {book.couverture ? (
                    <Image
                      src={book.couverture}
                      alt={book.titre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <BookOpen className="w-10 h-10 text-border" />
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={book.statut} />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2">{book.titre}</h3>
                  <p className="text-text-secondary text-xs mt-1">{book.auteur}</p>
                  {book.note !== null && (
                    <div className="mt-2">
                      <StarRating value={book.note} readonly size="sm" />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
