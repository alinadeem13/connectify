create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  username text not null unique,
  password_hash text not null,
  role text not null check (role in ('creator', 'consumer')),
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  token text primary key,
  user_id text not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  title text not null,
  caption text not null,
  location text not null,
  people_present text[] not null default '{}',
  image_url text not null,
  storage_path text not null,
  uploaded_by_id text not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id text primary key,
  text text not null,
  post_id text not null references public.posts(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.ratings (
  id text primary key,
  value integer not null check (value between 1 and 5),
  post_id text not null references public.posts(id) on delete cascade,
  user_id text not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists posts_uploaded_by_id_idx on public.posts(uploaded_by_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists comments_post_id_idx on public.comments(post_id);
create index if not exists comments_user_id_idx on public.comments(user_id);
create index if not exists ratings_post_id_idx on public.ratings(post_id);
create index if not exists ratings_user_id_idx on public.ratings(user_id);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.users to anon, authenticated;
grant select, insert, update, delete on public.sessions to anon, authenticated;
grant select, insert, update, delete on public.posts to anon, authenticated;
grant select, insert, update, delete on public.comments to anon, authenticated;
grant select, insert, update, delete on public.ratings to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

drop policy if exists "Allow public image reads" on storage.objects;
create policy "Allow public image reads"
on storage.objects for select
to anon
using (bucket_id = 'images');

drop policy if exists "Allow public image uploads" on storage.objects;
create policy "Allow public image uploads"
on storage.objects for insert
to anon
with check (bucket_id = 'images');

notify pgrst, 'reload schema';
