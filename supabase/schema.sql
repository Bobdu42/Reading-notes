-- =============================================
-- READING NOTES — SUPABASE SCHEMA
-- =============================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  created_at timestamptz default now() not null
);

create table public.books (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  titre text not null,
  auteur text not null,
  couverture text,
  note integer check (note >= 1 and note <= 5),
  statut text not null default 'À lire' check (statut in ('À lire', 'En cours', 'Terminé')),
  date_lecture date,
  résumé text,
  created_at timestamptz default now() not null
);

create table public.chapters (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  numero integer not null,
  titre text not null,
  résumé text,
  idées_clés text,
  application_pratique text
);

create table public.quotes (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  contenu text not null
);

create table public.tags (
  id uuid default gen_random_uuid() primary key,
  nom text not null unique
);

create table public.book_tags (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  unique(book_id, tag_id)
);

-- =============================================
-- INDEXES
-- =============================================

create index books_user_id_idx on public.books(user_id);
create index chapters_book_id_idx on public.chapters(book_id);
create index quotes_book_id_idx on public.quotes(book_id);
create index book_tags_book_id_idx on public.book_tags(book_id);
create index book_tags_tag_id_idx on public.book_tags(tag_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.chapters enable row level security;
alter table public.quotes enable row level security;
alter table public.tags enable row level security;
alter table public.book_tags enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Books
create policy "Users can select own books"
  on public.books for select
  using (auth.uid() = user_id);

create policy "Users can insert own books"
  on public.books for insert
  with check (auth.uid() = user_id);

create policy "Users can update own books"
  on public.books for update
  using (auth.uid() = user_id);

create policy "Users can delete own books"
  on public.books for delete
  using (auth.uid() = user_id);

-- Chapters (inherited access via books)
create policy "Users can select own chapters"
  on public.chapters for select
  using (exists (select 1 from public.books where books.id = chapters.book_id and books.user_id = auth.uid()));

create policy "Users can insert own chapters"
  on public.chapters for insert
  with check (exists (select 1 from public.books where books.id = chapters.book_id and books.user_id = auth.uid()));

create policy "Users can update own chapters"
  on public.chapters for update
  using (exists (select 1 from public.books where books.id = chapters.book_id and books.user_id = auth.uid()));

create policy "Users can delete own chapters"
  on public.chapters for delete
  using (exists (select 1 from public.books where books.id = chapters.book_id and books.user_id = auth.uid()));

-- Quotes
create policy "Users can select own quotes"
  on public.quotes for select
  using (exists (select 1 from public.books where books.id = quotes.book_id and books.user_id = auth.uid()));

create policy "Users can insert own quotes"
  on public.quotes for insert
  with check (exists (select 1 from public.books where books.id = quotes.book_id and books.user_id = auth.uid()));

create policy "Users can update own quotes"
  on public.quotes for update
  using (exists (select 1 from public.books where books.id = quotes.book_id and books.user_id = auth.uid()));

create policy "Users can delete own quotes"
  on public.quotes for delete
  using (exists (select 1 from public.books where books.id = quotes.book_id and books.user_id = auth.uid()));

-- Tags (public read, authenticated write)
create policy "Anyone can read tags"
  on public.tags for select
  using (true);

create policy "Authenticated users can create tags"
  on public.tags for insert
  with check (auth.uid() is not null);

-- Book tags
create policy "Users can select own book_tags"
  on public.book_tags for select
  using (exists (select 1 from public.books where books.id = book_tags.book_id and books.user_id = auth.uid()));

create policy "Users can insert own book_tags"
  on public.book_tags for insert
  with check (exists (select 1 from public.books where books.id = book_tags.book_id and books.user_id = auth.uid()));

create policy "Users can delete own book_tags"
  on public.book_tags for delete
  using (exists (select 1 from public.books where books.id = book_tags.book_id and books.user_id = auth.uid()));

-- =============================================
-- TRIGGER — Auto-create profile on signup
-- =============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =============================================
-- DEMO DATA (optional — replace USER_ID)
-- =============================================
-- Run this after creating your account.
-- Replace 'YOUR-USER-UUID' with your actual user ID from auth.users.

/*
do $$
declare
  uid uuid := 'YOUR-USER-UUID';
  b1 uuid := gen_random_uuid();
  b2 uuid := gen_random_uuid();
  b3 uuid := gen_random_uuid();
  t1 uuid := gen_random_uuid();
  t2 uuid := gen_random_uuid();
  t3 uuid := gen_random_uuid();
begin

insert into public.books (id, user_id, titre, auteur, couverture, note, statut, date_lecture, résumé) values
(
  b1, uid,
  'Atomic Habits',
  'James Clear',
  'https://covers.openlibrary.org/b/id/10483868-L.jpg',
  5,
  'Terminé',
  '2024-11-15',
  'Un guide pratique pour construire de bonnes habitudes et en éliminer les mauvaises, en se concentrant sur de petits changements cumulatifs qui produisent des résultats remarquables.'
),
(
  b2, uid,
  'Deep Work',
  'Cal Newport',
  'https://covers.openlibrary.org/b/id/8360592-L.jpg',
  4,
  'Terminé',
  '2025-01-20',
  'La capacité à se concentrer sans distraction sur une tâche cognitivement exigeante est la compétence la plus précieuse de notre époque.'
),
(
  b3, uid,
  'The Psychology of Money',
  'Morgan Housel',
  'https://covers.openlibrary.org/b/id/10515242-L.jpg',
  5,
  'En cours',
  null,
  'Des leçons intemporelles sur la richesse, la cupidité et le bonheur, racontées à travers des histoires fascinantes.'
);

insert into public.chapters (book_id, numero, titre, résumé, idées_clés, application_pratique) values
(
  b1, 1, 'Les fondements des habitudes',
  'Les habitudes sont des comportements automatiques déclenchés par des signaux contextuels.',
  '- Les habitudes suivent une boucle : Signal → Routine → Récompense
- 1% d''amélioration par jour = 37x mieux en un an
- L''identité façonne les habitudes',
  'Identifier mes habitudes actuelles et cartographier leur boucle. Commencer par une amélioration de 1% dans ma routine matinale.'
),
(
  b1, 2, 'La règle des deux minutes',
  'Toute nouvelle habitude devrait pouvoir être réduite à deux minutes pour en faciliter le démarrage.',
  '- Réduire l''habitude à sa forme la plus simple
- Le plus difficile est de commencer
- La cohérence prime sur la performance',
  'Pour l''habitude de lecture : ouvrir le livre et lire une page. C''est tout. Le reste suit naturellement.'
),
(
  b2, 1, 'Travail profond vs travail superficiel',
  'Le travail profond désigne les activités professionnelles effectuées dans un état de concentration totale. Le travail superficiel, lui, est logistique et peu stimulant cognitivement.',
  '- Deep Work = concentration maximale = valeur maximale
- Le travail superficiel dégrade notre capacité de concentration
- La concentration est un muscle qui s''entraîne',
  'Bloquer 2h de Deep Work chaque matin, téléphone en mode avion, notifications désactivées.'
);

insert into public.quotes (book_id, contenu) values
(b1, 'Vous n''élevez pas au niveau de vos objectifs. Vous descendez au niveau de vos systèmes.'),
(b1, 'Chaque action que vous effectuez est un vote pour le type de personne que vous souhaitez devenir.'),
(b1, 'Les habitudes sont le composé de l''amélioration personnelle.'),
(b2, 'Une vie bien vécue est une vie concentrée.'),
(b2, 'Si vous ne produisez pas, vous ne vous épanouissez pas — peu importe à quel point vous vous affairez.'),
(b3, 'Le génie financier, c''est de savoir quand s''arrêter de courir après plus.');

insert into public.tags (id, nom) values
(t1, 'productivité'),
(t2, 'habitudes'),
(t3, 'finance');

insert into public.book_tags (book_id, tag_id) values
(b1, t1), (b1, t2),
(b2, t1),
(b3, t3);

end $$;
*/
