export type BookStatus = 'À lire' | 'En cours' | 'Terminé'

export interface Profile {
  id: string
  email: string
  created_at: string
}

export interface Book {
  id: string
  user_id: string
  titre: string
  auteur: string
  couverture: string | null
  note: number | null
  statut: BookStatus
  date_lecture: string | null
  résumé: string | null
  created_at: string
  chapters?: Chapter[]
  quotes?: Quote[]
  book_tags?: { tags: Tag }[]
}

export interface Chapter {
  id: string
  book_id: string
  numero: number
  titre: string
  résumé: string | null
  idées_clés: string | null
  application_pratique: string | null
}

export interface Quote {
  id: string
  book_id: string
  contenu: string
}

export interface Tag {
  id: string
  nom: string
}

export interface BookTag {
  id: string
  book_id: string
  tag_id: string
  tags?: Tag
}

export interface DashboardStats {
  totalBooks: number
  readBooks: number
  readingBooks: number
  toReadBooks: number
  totalQuotes: number
  recentBooks: Book[]
}
