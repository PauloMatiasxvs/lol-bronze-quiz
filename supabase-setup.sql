-- Rodar este SQL no Supabase SQL Editor

-- Tabela de tentativas do quiz
create table if not exists quiz_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  username text not null,
  score integer not null,
  total integer not null,
  answers jsonb,
  created_at timestamptz default now()
);

-- Índice para ranking
create index if not exists quiz_attempts_score_idx on quiz_attempts(score desc, created_at asc);

-- RLS: usuários só podem inserir as próprias tentativas
alter table quiz_attempts enable row level security;

create policy "users can insert own attempts"
  on quiz_attempts for insert
  with check (auth.uid() = user_id);

create policy "anyone can read attempts"
  on quiz_attempts for select
  using (true);
