import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function formatMarkdown(book: {
  titre: string
  auteur: string
  statut: string
  note: number | null
  date_lecture: string | null
  résumé: string | null
  chapters: { numero: number; titre: string; résumé: string | null; idées_clés: string | null; application_pratique: string | null }[]
  quotes: { contenu: string }[]
}): string {
  const lines: string[] = []

  lines.push(`# ${book.titre}`)
  lines.push('')
  lines.push(`**Auteur :** ${book.auteur}`)
  lines.push(`**Statut :** ${book.statut}`)
  if (book.note !== null) lines.push(`**Note :** ${'★'.repeat(book.note)}${'☆'.repeat(5 - book.note)}`)
  if (book.date_lecture) {
    const date = new Date(book.date_lecture).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    lines.push(`**Date de lecture :** ${date}`)
  }
  lines.push('')

  if (book.résumé) {
    lines.push('## Résumé général')
    lines.push('')
    lines.push(book.résumé)
    lines.push('')
  }

  if (book.chapters.length > 0) {
    lines.push('## Chapitres')
    lines.push('')
    for (const ch of book.chapters) {
      lines.push(`### Chapitre ${ch.numero} — ${ch.titre}`)
      lines.push('')
      if (ch.résumé) {
        lines.push('**Résumé**')
        lines.push('')
        lines.push(ch.résumé)
        lines.push('')
      }
      if (ch.idées_clés) {
        lines.push('**Idées clés**')
        lines.push('')
        ch.idées_clés.split('\n').filter(Boolean).forEach(l => lines.push(`- ${l.replace(/^[-•*]\s*/, '')}`))
        lines.push('')
      }
      if (ch.application_pratique) {
        lines.push('**Application pratique**')
        lines.push('')
        lines.push(ch.application_pratique)
        lines.push('')
      }
    }
  }

  if (book.quotes.length > 0) {
    lines.push('## Citations')
    lines.push('')
    for (const q of book.quotes) {
      lines.push(`> ${q.contenu}`)
      lines.push('')
    }
  }

  return lines.join('\n')
}

function formatTxt(book: {
  titre: string
  auteur: string
  statut: string
  note: number | null
  date_lecture: string | null
  résumé: string | null
  chapters: { numero: number; titre: string; résumé: string | null; idées_clés: string | null; application_pratique: string | null }[]
  quotes: { contenu: string }[]
}): string {
  const sep = '─'.repeat(60)
  const lines: string[] = []

  lines.push(book.titre.toUpperCase())
  lines.push(sep)
  lines.push(`Auteur : ${book.auteur}`)
  lines.push(`Statut : ${book.statut}`)
  if (book.note !== null) lines.push(`Note   : ${'★'.repeat(book.note)}${'☆'.repeat(5 - book.note)}`)
  if (book.date_lecture) {
    const date = new Date(book.date_lecture).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
    lines.push(`Date   : ${date}`)
  }
  lines.push('')

  if (book.résumé) {
    lines.push('RÉSUMÉ GÉNÉRAL')
    lines.push(sep)
    lines.push(book.résumé)
    lines.push('')
  }

  if (book.chapters.length > 0) {
    lines.push('CHAPITRES')
    lines.push(sep)
    lines.push('')
    for (const ch of book.chapters) {
      lines.push(`Chapitre ${ch.numero} — ${ch.titre}`)
      lines.push('─'.repeat(40))
      if (ch.résumé) {
        lines.push('Résumé :')
        lines.push(ch.résumé)
        lines.push('')
      }
      if (ch.idées_clés) {
        lines.push('Idées clés :')
        ch.idées_clés.split('\n').filter(Boolean).forEach(l => lines.push(`  • ${l.replace(/^[-•*]\s*/, '')}`))
        lines.push('')
      }
      if (ch.application_pratique) {
        lines.push('Application pratique :')
        lines.push(ch.application_pratique)
        lines.push('')
      }
    }
  }

  if (book.quotes.length > 0) {
    lines.push('CITATIONS')
    lines.push(sep)
    lines.push('')
    for (const q of book.quotes) {
      lines.push(`« ${q.contenu} »`)
      lines.push('')
    }
  }

  return lines.join('\n')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const bookId = searchParams.get('bookId')
  const format = searchParams.get('format') as 'md' | 'txt' | null

  if (!bookId || !format || !['md', 'txt'].includes(format)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const [bookRes, chaptersRes, quotesRes] = await Promise.all([
    supabase.from('books').select('*').eq('id', bookId).eq('user_id', user.id).single(),
    supabase.from('chapters').select('*').eq('book_id', bookId).order('numero'),
    supabase.from('quotes').select('*').eq('book_id', bookId),
  ])

  if (bookRes.error || !bookRes.data) {
    return NextResponse.json({ error: 'Livre introuvable' }, { status: 404 })
  }

  const data = {
    ...bookRes.data,
    chapters: chaptersRes.data ?? [],
    quotes: quotesRes.data ?? [],
  }

  const content = format === 'md' ? formatMarkdown(data) : formatTxt(data)
  const filename = `${data.titre.replace(/[^a-zA-Z0-9À-ɏ\s]/g, '').trim().replace(/\s+/g, '_')}.${format}`
  const mimeType = format === 'md' ? 'text/markdown' : 'text/plain'

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': `${mimeType}; charset=utf-8`,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
