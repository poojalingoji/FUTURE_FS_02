
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Profiles selectable by owner" on public.profiles for select using (auth.uid() = id);
create policy "Profiles updatable by owner" on public.profiles for update using (auth.uid() = id);
create policy "Profiles insertable by owner" on public.profiles for insert with check (auth.uid() = id);

-- auto create profile + auto-confirm trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- leads
create type public.lead_status as enum ('new','contacted','qualified','converted','lost');
create type public.lead_priority as enum ('low','medium','high');

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  company text,
  source text not null default 'Website',
  message text,
  status public.lead_status not null default 'new',
  priority public.lead_priority not null default 'medium',
  follow_up_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.leads enable row level security;

-- Public can insert (contact form)
create policy "Anyone can submit lead" on public.leads for insert with check (true);
-- Only authenticated can read/update/delete
create policy "Authenticated can view leads" on public.leads for select to authenticated using (true);
create policy "Authenticated can update leads" on public.leads for update to authenticated using (true);
create policy "Authenticated can delete leads" on public.leads for delete to authenticated using (true);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger leads_updated_at before update on public.leads
for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- notes
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  note_text text not null,
  created_at timestamptz not null default now()
);
alter table public.notes enable row level security;
create policy "Authenticated view notes" on public.notes for select to authenticated using (true);
create policy "Authenticated insert notes" on public.notes for insert to authenticated with check (true);
create policy "Authenticated delete notes" on public.notes for delete to authenticated using (true);

-- activity_logs
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  activity_type text not null,
  activity_description text not null,
  created_at timestamptz not null default now()
);
alter table public.activity_logs enable row level security;
create policy "Authenticated view logs" on public.activity_logs for select to authenticated using (true);
create policy "Authenticated insert logs" on public.activity_logs for insert to authenticated with check (true);

-- Log lead creation/status changes
create or replace function public.log_lead_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.activity_logs (lead_id, activity_type, activity_description)
    values (new.id, 'created', 'Lead created from ' || coalesce(new.source,'Unknown'));
  elsif (tg_op = 'UPDATE') then
    if new.status is distinct from old.status then
      insert into public.activity_logs (lead_id, actor_id, activity_type, activity_description)
      values (new.id, auth.uid(), 'status_change', 'Status changed from ' || old.status || ' to ' || new.status);
    end if;
  end if;
  return new;
end; $$;
create trigger leads_log_insert after insert on public.leads
for each row execute function public.log_lead_change();
create trigger leads_log_update after update on public.leads
for each row execute function public.log_lead_change();

create index on public.leads (status);
create index on public.leads (created_at desc);
create index on public.notes (lead_id);
create index on public.activity_logs (lead_id);
