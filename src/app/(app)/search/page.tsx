'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, BookOpen, Quote } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/ui/Badge'
import { Book, Quote as QuoteType } from '@/lib/types'

interface SearchResults {
  books: Book[]
  quotes: (QuoteType & { books: { titre: string; auteur: string } })[]
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults(null); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const term = `%${q}%`

    const [booksRes, quotesRes] = await Promise.all([
      supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .or(`titre.ilike.${term},auteur.ilike.${term},résumé.ilike.${term}`)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('quotes')
        .select('*, books!inner(titre, auteur, user_id)')
        .eq('books.user_id', user.id)
        .ilike('contenu', term)
        .limit(20),
    ])

    setResults({
      books: booksRes.data ?? [],
      quotes: (quotesRes.data ?? []) as (QuoteType & { books: { titre: string; auteur: string } })[],
    })
    setLoading(false)
  }, [supabase])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    const timer = setTimeout(() => search(val), 300)
    return () => clearTimeout(timer)
  }

  const totalResults = (results?.books.length ?? 0) + (results?.quotes.length ?? 0)

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-1">Recherche</h1>
        <p className="text-text-secondary">Cherchez dans vos livres, auteurs et citations</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Titre, auteur, citation…"
          autoFocus
          className="w-full bg-card border border-border rounded-2xl pl-12 pr-5 py-4 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors text-base"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {!query && (
        <div className="text-center py-16">
          <Search className="w-10 h-10 text-border mx-auto mb-3" />
          <p className="text-text-secondary">Commencez à taper pour chercher…</p>
        </div>
      )}

      {query && results && !loading && (
        <div className="space-y-8 animate-fade-in">
          <p className="text-text-secondary text-sm">
            {totalResults} résultat{totalResults !== 1 ? 's' : ''} pour &quot;{query}&quot;
          </p>

          {results.books.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-text-secondary" />
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                  Livres ({results.books.length})
                </h2>
              </div>
              <div className="space-y-2">
                {results.books.map(book => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-accent/40 transition-all"
                  >
                    <div className="w-10 h-14 bg-border/40 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {book.couverture ? (
                        <Image src={book.couverture} alt={book.titre} width={40} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-border" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">{book.titre}</p>
                      <p className="text-text-secondary text-sm">{book.auteur}</p>
                    </div>
                    <StatusBadge status={book.statut} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.quotes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Quote className="w-4 h-4 text-text-secondary" />
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                  Citations ({results.quotes.length})
                </h2>
              </div>
              <div className="space-y-3">
                {results.quotes.map(quote => (
                  <Link
                    key={quote.id}
                    href={`/books/${quote.book_id}`}
                    className="block bg-card border border-border rounded-xl p-5 hover:border-accent/40 transition-all"
                  >
                    <p className="text-text-primary text-sm italic leading-relaxed mb-2">&ldquo;{quote.contenu}&rdquo;</p>
                    <p className="text-text-secondary text-xs">
                      — {quote.books.auteur}, <span className="text-accent">{quote.books.titre}</span>
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {totalResults === 0 && (
            <div className="text-center py-12">
              <p className="text-text-secondary">Aucun résultat pour &quot;{query}&quot;</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
