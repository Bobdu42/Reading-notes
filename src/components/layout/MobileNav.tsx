'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, LayoutDashboard, Library, Search, LogOut } from 'lucide-react'
import clsx from 'clsx'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Accueil', icon: LayoutDashboard },
  { href: '/library', label: 'Livres', icon: Library },
  { href: '/search', label: 'Chercher', icon: Search },
]

export default function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Top bar */}
      <header className="lg:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-muted rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-accent" />
          </div>
          <span className="font-semibold text-text-primary text-sm">Bibliothèque</span>
        </Link>
        <button
          onClick={handleLogout}
          className="p-2 text-text-secondary hover:text-danger transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
                pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                  ? 'text-accent'
                  : 'text-text-secondary'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
