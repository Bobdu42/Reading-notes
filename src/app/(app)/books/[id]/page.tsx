'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft, BookOpen, Plus, Calendar, Pencil, Trash2, Tag, X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Book, Chapter, Quote, Tag as TagType } from '@/lib/types'
import { StatusBadge, TagBadge } from '@/components/ui/Badge'
import StarRating from '@/components/ui/StarRating'
import Modal from '@/components/ui/Modal'
import BookForm from '@/components/books/BookForm'
import ExportButton from '@/components/books/ExportButton'
import ChapterCard from '@/components/chapters/ChapterCard'
import ChapterForm from '@/components/chapters/ChapterForm'
import QuoteCard from '@/components/quotes/QuoteCard'
import QuoteForm from '@/components/quotes/QuoteForm'

type Tab = 'chapitres' | 'citations' | 'tags'

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [book, setBook] = useState<Book | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [bookTags, setBookTags] = useState<TagType[]>([])
  const [allTags, setAllTags] = useState<TagType[]>([])
  const [tab, setTab] = useState<Tab>('chapitres')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // Modals
  const [editBookOpen, setEditBookOpen] = useState(false)
  const [deleteBookOpen, setDeleteBookOpen] = useState(false)
  const [chapterModal, setChapterModal] = useState<{ open: boolean; chapter?: Chapter }>({ open: false })
  const [deleteChapter, setDeleteChapter] = useState<Chapter | null>(null)
  const [quoteModal, setQuoteModal] = useState<{ open: boolean; quote?: Quote }>({ open: false })
  const [deleteQuote, setDeleteQuote] = useState<Quote | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [tagModalOpen, setTagModalOpen] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchAll = useCallback(async () => {
    const [bookRes, chapRes, quoteRes, bookTagRes, tagRes] = await Promise.all([
      supabase.from('books').select('*').eq('id', id).single(),
      supabase.from('chapters').select('*').eq('book_id', id).order('numero'),
      supabase.from('quotes').select('*').eq('book_id', id),
      supabase.from('book_tags').select('tag_id, tags(id, nom)').eq('book_id', id),
      supabase.from('tags').select('*').order('nom'),
    ])

    setBook(bookRes.data)
    setChapters(chapRes.data ?? [])
    setQuotes(quoteRes.data ?? [])
    setAllTags(tagRes.data ?? [])
    const tags = (bookTagRes.data ?? []).map((bt: { tags: { id: string; nom: string } | { id: string; nom: string }[] | null }) => {
      const t = Array.isArray(bt.tags) ? bt.tags[0] : bt.tags
      return t as TagType
    }).filter(Boolean)
    setBookTags(tags)
    setLoading(false)
  }, [id, supabase])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleEditBook(data: Partial<Book>) {
    setSaving(true)
    await supabase.from('books').update(data).eq('id', id)
    await fetchAll()
    setEditBookOpen(false)
    showToast('Livre modifié')
    setSaving(false)
  }

  async function handleDeleteBook() {
    await supabase.from('books').delete().eq('id', id)
    router.push('/library')
  }

  async function handleAddChapter(data: Partial<Chapter>) {
    setSaving(true)
    await supabase.from('chapters').insert({ ...data, book_id: id })
    await fetchAll()
    setChapterModal({ open: false })
    showToast('Chapitre ajouté')
    setSaving(false)
  }

  async function handleEditChapter(data: Partial<Chapter>) {
    if (!chapterModal.chapter) return
    setSaving(true)
    await supabase.from('chapters').update(data).eq('id', chapterModal.chapter.id)
    await fetchAll()
    setChapterModal({ open: false })
    showToast('Chapitre modifié')
    setSaving(false)
  }

  async function handleDeleteChapter() {
    if (!deleteChapter) return
    await supabase.from('chapters').delete().eq('id', deleteChapter.id)
    await fetchAll()
    setDeleteChapter(null)
    showToast('Chapitre supprimé')
  }

  async function handleAddQuote(data: { contenu: string }) {
    setSaving(true)
    await supabase.from('quotes').insert({ ...data, book_id: id })
    await fetchAll()
    setQuoteModal({ open: false })
    showToast('Citation ajoutée')
    setSaving(false)
  }

  async function handleEditQuote(data: { contenu: string }) {
    if (!quoteModal.quote) return
    setSaving(true)
    await supabase.from('quotes').update(data).eq('id', quoteModal.quote.id)
    await fetchAll()
    setQuoteModal({ open: false })
    showToast('Citation modifiée')
    setSaving(false)
  }

  async function handleDeleteQuote() {
    if (!deleteQuote) return
    await supabase.from('quotes').delete().eq('id', deleteQuote.id)
    await fetchAll()
    setDeleteQuote(null)
    showToast('Citation supprimée')
  }

  async function handleAddTag() {
    if (!tagInput.trim()) return
    const nom = tagInput.trim().toLowerCase()
    let tagId: string

    const existing = allTags.find(t => t.nom === nom)
    if (existing) {
      tagId = existing.id
    } else {
      const { data } = await supabase.from('tags').insert({ nom }).select().single()
      if (!data) return
      tagId = data.id
    }

    if (bookTags.find(t => t.id === tagId)) {
      setTagInput('')
      return
    }

    await supabase.from('book_tags').insert({ book_id: id, tag_id: tagId })
    await fetchAll()
    setTagInput('')
    showToast('Tag ajouté')
  }

  async function handleRemoveTag(tagId: string) {
    await supabase.from('book_tags').delete().eq('book_id', id).eq('tag_id', tagId)
    await fetchAll()
    showToast('Tag retiré')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-card rounded w-32 mb-8" />
        <div className="flex gap-8">
          <div className="w-40 h-56 bg-card rounded-xl" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-card rounded w-2/3" />
            <div className="h-5 bg-card rounded w-1/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary">Livre introuvable.</p>
        <Link href="/library" className="text-accent hover:text-accent-hover mt-4 inline-block">← Retour</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Link href="/library" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Bibliothèque
      </Link>

      {/* Book header */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex gap-6">
          <div className="flex-shrink-0 w-32 h-44 lg:w-40 lg:h-56 bg-border/40 rounded-xl overflow-hidden flex items-center justify-center">
            {book.couverture ? (
              <Image src={book.couverture} alt={book.titre} width={160} height={220} className="object-cover w-full h-full" />
            ) : (
              <BookOpen className="w-10 h-10 text-border" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-text-primary leading-tight">{book.titre}</h1>
                <p className="text-text-secondary mt-1">{book.auteur}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <ExportButton bookId={id} bookTitle={book.titre} />
                <button
                  onClick={() => setEditBookOpen(true)}
                  className="p-2 text-text-secondary hover:text-accent hover:bg-accent-muted rounded-lg transition-all"
                  title="Modifier"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteBookOpen(true)}
                  className="p-2 text-text-secondary hover:text-danger hover:bg-red-950/30 rounded-lg transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <StatusBadge status={book.statut} />
              {book.note !== null && <StarRating value={book.note} readonly size="sm" />}
              {book.date_lecture && (
                <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Calendar className="w-3 h-3" />
                  {new Date(book.date_lecture).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </div>

            {bookTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {bookTags.map(tag => (
                  <TagBadge key={tag.id} label={tag.nom} onRemove={() => handleRemoveTag(tag.id)} />
                ))}
              </div>
            )}

            {book.résumé && (
              <p className="text-text-secondary text-sm mt-4 leading-relaxed line-clamp-3">{book.résumé}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-6">
        {(['chapitres', 'citations', 'tags'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
              tab === t ? 'bg-accent text-background' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t} {t === 'chapitres' ? `(${chapters.length})` : t === 'citations' ? `(${quotes.length})` : `(${bookTags.length})`}
          </button>
        ))}
      </div>

      {/* Chapitres */}
      {tab === 'chapitres' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex justify-end">
            <button
              onClick={() => setChapterModal({ open: true })}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-background font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un chapitre
            </button>
          </div>
          {chapters.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <p className="text-text-secondary text-sm">Aucun chapitre. Ajoutez vos premières notes !</p>
            </div>
          ) : (
            chapters.map(ch => (
              <ChapterCard
                key={ch.id}
                chapter={ch}
                onEdit={() => setChapterModal({ open: true, chapter: ch })}
                onDelete={() => setDeleteChapter(ch)}
              />
            ))
          )}
        </div>
      )}

      {/* Citations */}
      {tab === 'citations' && (
        <div className="animate-fade-in">
          <div className="flex justify-end mb-3">
            <button
              onClick={() => setQuoteModal({ open: true })}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-background font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter une citation
            </button>
          </div>
          {quotes.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <p className="text-text-secondary text-sm">Aucune citation enregistrée.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quotes.map(q => (
                <QuoteCard
                  key={q.id}
                  quote={q}
                  onEdit={() => setQuoteModal({ open: true, quote: q })}
                  onDelete={() => setDeleteQuote(q)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {tab === 'tags' && (
        <div className="animate-fade-in space-y-5">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-text-secondary" />
              <span className="text-sm font-medium text-text-secondary">Ajouter un tag</span>
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors text-sm"
                placeholder="ex: philosophie, productivité…"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
                list="tag-suggestions"
              />
              <datalist id="tag-suggestions">
                {allTags.filter(t => !bookTags.find(bt => bt.id === t.id)).map(t => (
                  <option key={t.id} value={t.nom} />
                ))}
              </datalist>
              <button
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-background font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                Ajouter
              </button>
            </div>
          </div>

          {bookTags.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <p className="text-text-secondary text-sm">Aucun tag pour ce livre.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex flex-wrap gap-2">
                {bookTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleRemoveTag(tag.id)}
                    className="flex items-center gap-1.5 bg-accent-muted text-accent px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-950/30 hover:text-danger transition-colors group"
                  >
                    {tag.nom}
                    <X className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={editBookOpen} onClose={() => setEditBookOpen(false)} title="Modifier le livre" size="lg">
        <BookForm initial={book} onSubmit={handleEditBook} onCancel={() => setEditBookOpen(false)} loading={saving} />
      </Modal>

      <Modal isOpen={deleteBookOpen} onClose={() => setDeleteBookOpen(false)} title="Supprimer le livre" size="sm">
        <div className="text-center">
          <p className="text-text-secondary mb-6">
            Supprimer définitivement <span className="text-text-primary font-medium">&quot;{book.titre}&quot;</span> et toutes ses données ?
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteBookOpen(false)} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors">Annuler</button>
            <button onClick={handleDeleteBook} className="flex-1 px-4 py-2.5 bg-danger hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors">Supprimer</button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={chapterModal.open}
        onClose={() => setChapterModal({ open: false })}
        title={chapterModal.chapter ? 'Modifier le chapitre' : 'Ajouter un chapitre'}
        size="lg"
      >
        <ChapterForm
          initial={chapterModal.chapter}
          defaultNumero={chapters.length + 1}
          onSubmit={chapterModal.chapter ? handleEditChapter : handleAddChapter}
          onCancel={() => setChapterModal({ open: false })}
          loading={saving}
        />
      </Modal>

      <Modal isOpen={!!deleteChapter} onClose={() => setDeleteChapter(null)} title="Supprimer le chapitre" size="sm">
        <div className="text-center">
          <p className="text-text-secondary mb-6">Supprimer le chapitre <span className="text-text-primary font-medium">&quot;{deleteChapter?.titre}&quot;</span> ?</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteChapter(null)} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors">Annuler</button>
            <button onClick={handleDeleteChapter} className="flex-1 px-4 py-2.5 bg-danger hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors">Supprimer</button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={quoteModal.open}
        onClose={() => setQuoteModal({ open: false })}
        title={quoteModal.quote ? 'Modifier la citation' : 'Ajouter une citation'}
        size="md"
      >
        <QuoteForm
          initial={quoteModal.quote}
          onSubmit={quoteModal.quote ? handleEditQuote : handleAddQuote}
          onCancel={() => setQuoteModal({ open: false })}
          loading={saving}
        />
      </Modal>

      <Modal isOpen={!!deleteQuote} onClose={() => setDeleteQuote(null)} title="Supprimer la citation" size="sm">
        <div className="text-center">
          <p className="text-text-secondary mb-6">Supprimer cette citation ?</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteQuote(null)} className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors">Annuler</button>
            <button onClick={handleDeleteQuote} className="flex-1 px-4 py-2.5 bg-danger hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors">Supprimer</button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border text-text-primary text-sm font-medium px-5 py-3 rounded-xl shadow-2xl animate-slide-up z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
