# Bibliothèque — Notes de lecture

Application personnelle de gestion de notes de lecture. Stack : Next.js 15, TypeScript, Tailwind CSS, Supabase.

---

## Arborescence

```
reading-notes/
├── middleware.ts                    # Auth guard
├── next.config.ts
├── tailwind.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Redirect
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (app)/
│   │       ├── layout.tsx           # Sidebar + auth check
│   │       ├── dashboard/page.tsx
│   │       ├── library/page.tsx
│   │       ├── books/[id]/page.tsx
│   │       └── search/page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── StarRating.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Desktop nav
│   │   │   └── MobileNav.tsx        # Mobile top + bottom nav
│   │   ├── books/
│   │   │   ├── BookCard.tsx
│   │   │   └── BookForm.tsx
│   │   ├── chapters/
│   │   │   ├── ChapterCard.tsx
│   │   │   └── ChapterForm.tsx
│   │   ├── quotes/
│   │   │   ├── QuoteCard.tsx
│   │   │   └── QuoteForm.tsx
│   │   └── dashboard/
│   │       └── StatsCard.tsx
│   └── lib/
│       ├── types.ts
│       └── supabase/
│           ├── client.ts            # Browser client
│           └── server.ts            # Server client (SSR)
└── supabase/
    └── schema.sql                   # Tables, RLS, trigger, demo data
```

---

## Installation

### 1. Cloner et installer

```bash
git clone <repo> reading-notes
cd reading-notes
npm install
```

### 2. Créer le projet Supabase

1. Allez sur [supabase.com](https://supabase.com) → **New project**
2. Notez votre **Project URL** et votre **anon public key** (Settings → API)

### 3. Appliquer le schéma SQL

Dans votre dashboard Supabase → **SQL Editor** → **New query**, copiez-collez le contenu de `supabase/schema.sql` et exécutez.

### 4. Variables d'environnement

Créez `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 5. Lancer en développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

---

## Données de démonstration

Après avoir créé votre compte :

1. Dans Supabase → **Authentication → Users**, copiez votre UUID
2. Dans **SQL Editor**, décommentez le bloc `/* ... */` en bas de `schema.sql`
3. Remplacez `YOUR-USER-UUID` par votre UUID
4. Exécutez

Cela crée 3 livres (Atomic Habits, Deep Work, The Psychology of Money) avec chapitres, citations et tags.

---

## Déploiement sur Netlify

### Option A — Via CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### Option B — Via interface Netlify

1. Poussez le projet sur GitHub
2. Dans [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
3. Connectez votre dépôt GitHub
4. **Build settings** :
   - Build command : `npm run build`
   - Publish directory : `.next`
5. Ajoutez les variables d'environnement dans **Site configuration → Environment variables** :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Cliquez **Deploy site**

### Fichier netlify.toml (optionnel mais recommandé)

Créez `netlify.toml` à la racine :

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Installez le plugin :

```bash
npm install -D @netlify/plugin-nextjs
```

---

## Variables d'environnement nécessaires

| Variable | Description | Où la trouver |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anonyme | Dashboard → Settings → API |

---

## Fonctionnalités

- **Auth** : Inscription / connexion / déconnexion (Supabase Auth)
- **Tableau de bord** : Stats (livres lus, en cours, à lire, citations) + derniers ajouts
- **Bibliothèque** : Grille de livres avec filtres par statut, CRUD complet
- **Détail livre** : Onglets Chapitres / Citations / Tags, CRUD pour chaque section
- **Recherche** : Recherche full-text sur titres, auteurs et citations
- **Responsive** : Sidebar desktop + navigation mobile (top bar + bottom nav)
- **RLS** : Chaque utilisateur ne voit que ses propres données

---

## Stack

- **Next.js 15** (App Router, Server Components)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL + Auth + RLS)
- **Lucide React** (icônes)
