'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, LayoutDashboard, Library, Search, LogOut } from 'lucide-react'
import clsx from 'clsx'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/library', label: 'Bibliothèque', icon: Library },
  { href: '/search', label: 'Recherche', icon: Search },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-accent-muted rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="font-semibold text-text-primary text-sm leading-none">Bibliothèque</p>
            <p className="text-text-secondary text-xs mt-0.5">Notes de lecture</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                ? 'bg-accent-muted text-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-border/50'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-danger hover:bg-red-950/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
