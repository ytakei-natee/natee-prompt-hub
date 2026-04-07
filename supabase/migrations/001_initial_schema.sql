-- Natee Prompt Hub: 初期スキーマ

-- profiles テーブル
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  avatar_url text,
  role text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- prompts テーブル
create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete set null,
  role text not null,
  task text not null,
  title text not null,
  role_setting text not null default '',
  background text not null default '',
  task_description text not null default '',
  constraints text not null default '',
  output_format text not null default '',
  likes_count int not null default 0,
  comments_count int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- likes テーブル
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, prompt_id)
);

-- comments テーブル
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  body text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- インデックス
create index if not exists idx_prompts_role_task on public.prompts(role, task);
create index if not exists idx_likes_user_prompt on public.likes(user_id, prompt_id);
create index if not exists idx_comments_prompt on public.comments(prompt_id, created_at);

-- RLS有効化
alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;

-- profiles RLS
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- prompts RLS
create policy "prompts_select" on public.prompts for select using (true);
create policy "prompts_insert" on public.prompts for insert with check (auth.uid() = author_id);
create policy "prompts_update" on public.prompts for update using (auth.uid() = author_id);
create policy "prompts_delete" on public.prompts for delete using (auth.uid() = author_id);

-- likes RLS
create policy "likes_select" on public.likes for select using (true);
create policy "likes_insert" on public.likes for insert with check (auth.uid() = user_id);
create policy "likes_delete" on public.likes for delete using (auth.uid() = user_id);

-- comments RLS
create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments_update" on public.comments for update using (auth.uid() = user_id);
create policy "comments_delete" on public.comments for delete using (auth.uid() = user_id);

-- toggle_like 関数
create or replace function public.toggle_like(p_prompt_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing uuid;
begin
  select id into v_existing
    from public.likes
    where user_id = v_user_id and prompt_id = p_prompt_id;

  if v_existing is not null then
    delete from public.likes where id = v_existing;
    update public.prompts set likes_count = greatest(likes_count - 1, 0) where id = p_prompt_id;
    return false;
  else
    insert into public.likes (user_id, prompt_id) values (v_user_id, p_prompt_id);
    update public.prompts set likes_count = likes_count + 1 where id = p_prompt_id;
    return true;
  end if;
end;
$$;

-- コメント数の自動更新トリガー
create or replace function public.update_comments_count()
returns trigger
language plpgsql
security definer
as $$
begin
  if tg_op = 'INSERT' then
    update public.prompts set comments_count = comments_count + 1 where id = new.prompt_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.prompts set comments_count = greatest(comments_count - 1, 0) where id = old.prompt_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute function public.update_comments_count();

-- updated_at 自動更新
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger prompts_updated_at
  before update on public.prompts
  for each row execute function public.handle_updated_at();

create trigger comments_updated_at
  before update on public.comments
  for each row execute function public.handle_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
