import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bibliothèque — Notes de lecture',
  description: 'Votre bibliothèque personnelle de notes de lecture',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
