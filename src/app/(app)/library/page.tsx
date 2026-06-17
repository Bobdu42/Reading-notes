'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, BookOpen, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Book, BookStatus } from '@/lib/types'
import BookCard from '@/components/books/BookCard'
import BookForm from '@/components/books/BookForm'
import Modal from '@/components/ui/Modal'

const STATUTS: (BookStatus | 'Tous')[] = ['Tous', 'À lire', 'En cours', 'Terminé']

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filter, setFilter] = useState<BookStatus | 'Tous'>('Tous')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editBook, setEditBook] = useState<Book | null>(null)
  const [deleteBook, setDeleteBook] = useState<Book | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const supabase = createClient()

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const fetchBooks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('books')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setBooks(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { fetchBooks() }, [fetchBooks])

  async function handleAdd(data: Partial<Book>) {
    setSaving(true)
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        console.error('USER ERROR:', userError)
        showToast('Utilisateur non connecté')
        return
      }

      // Upsert profile au cas où le trigger n'aurait pas fonctionné
      await supabase.from('profiles').upsert({
        id: userData.user.id,
        email: userData.user.email,
      })

      const { data: insertData, error: insertError } = await supabase
        .from('books')
        .insert({ ...data, user_id: userData.user.id })
        .select()

      console.log('INSERT DATA:', insertData)
      console.log('INSERT ERROR:', insertError)

      if (insertError) {
        console.error('INSERT FAILED:', insertError.message)
        showToast('Erreur : ' + insertError.message)
        return
      }

      await fetchBooks()
      setModalOpen(false)
      showToast('Livre ajouté avec succès')
    } catch (err) {
      console.error('UNEXPECTED ERROR:', err)
      showToast('Erreur inattendue')
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(data: Partial<Book>) {
    if (!editBook) return
    setSaving(true)
    await supabase.from('books').update(data).eq('id', editBook.id)
    await fetchBooks()
    setEditBook(null)
    showToast('Livre modifié')
    setSaving(false)
  }

  async function handleDelete() {
    if (!deleteBook) return
    await supabase.from('books').delete().eq('id', deleteBook.id)
    await fetchBooks()
    setDeleteBook(null)
    showToast('Livre supprimé')
  }

  const filtered = filter === 'Tous' ? books : books.filter(b => b.statut === filter)

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Bibliothèque</h1>
          <p className="text-text-secondary mt-1">{books.length} livre{books.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-background font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter className="w-4 h-4 text-text-secondary" />
        {STATUTS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === s
                ? 'bg-accent text-background'
                : 'bg-card border border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
              <div className="h-52 bg-border/40" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-border rounded w-3/4" />
                <div className="h-3 bg-border rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <BookOpen className="w-10 h-10 text-border mx-auto mb-3" />
          <p className="text-text-secondary">
            {filter === 'Tous' ? 'Aucun livre. Ajoutez votre premier livre !' : `Aucun livre "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onEdit={() => setEditBook(book)}
              onDelete={() => setDeleteBook(book)}
            />
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ajouter un livre" size="lg">
        <BookForm onSubmit={handleAdd} onCancel={() => setModalOpen(false)} loading={saving} />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editBook} onClose={() => setEditBook(null)} title="Modifier le livre" size="lg">
        {editBook && (
          <BookForm
            initial={editBook}
            onSubmit={handleEdit}
            onCancel={() => setEditBook(null)}
            loading={saving}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={!!deleteBook} onClose={() => setDeleteBook(null)} title="Supprimer le livre" size="sm">
        <div className="text-center">
          <p className="text-text-secondary mb-2">
            Supprimer <span className="text-text-primary font-medium">&quot;{deleteBook?.titre}&quot;</span> ?
          </p>
          <p className="text-xs text-text-secondary mb-6">
            Toutes les notes et citations associées seront supprimées.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteBook(null)}
              className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2.5 bg-danger hover:bg-red-600 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border text-text-primary text-sm font-medium px-5 py-3 rounded-xl shadow-2xl animate-slide-up z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
