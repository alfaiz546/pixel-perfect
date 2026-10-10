create type public.account_type as enum ('worker','hirer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  account_type public.account_type not null default 'hirer',
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);

create table public.workers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  name text not null,
  skill text not null,
  city text not null,
  area text,
  experience_years int not null default 0,
  rate text,
  tags text[] not null default '{}',
  languages text[] not null default '{}',
  about text,
  avatar_url text,
  available boolean not null default true,
  team_available boolean not null default false,
  rating numeric(2,1) not null default 0,
  reviews_count int not null default 0,
  verified_jobs int not null default 0,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.workers to anon, authenticated;
grant insert, update, delete on public.workers to authenticated;
grant all on public.workers to service_role;
alter table public.workers enable row level security;
create policy "public read workers" on public.workers for select to anon, authenticated using (true);
create policy "own worker insert" on public.workers for insert to authenticated with check (auth.uid() = user_id);
create policy "own worker update" on public.workers for update to authenticated using (auth.uid() = user_id);
create policy "own worker delete" on public.workers for delete to authenticated using (auth.uid() = user_id);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  posted_by uuid,
  title text not null,
  skill text not null,
  city text not null,
  area text,
  budget text,
  timing text,
  hire_type text not null default 'Individual',
  description text,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.jobs to anon, authenticated;
grant insert, update, delete on public.jobs to authenticated;
grant all on public.jobs to service_role;
alter table public.jobs enable row level security;
create policy "public read jobs" on public.jobs for select to anon, authenticated using (true);
create policy "own job insert" on public.jobs for insert to authenticated with check (auth.uid() = posted_by);
create policy "own job update" on public.jobs for update to authenticated using (auth.uid() = posted_by);
create policy "own job delete" on public.jobs for delete to authenticated using (auth.uid() = posted_by);

create table public.hire_requests (
  id uuid primary key default gen_random_uuid(),
  hirer_id uuid not null,
  worker_id uuid references public.workers(id) on delete set null,
  kind text not null default 'individual',
  title text not null,
  description text,
  city text not null,
  preferred_date date,
  budget text,
  roles jsonb not null default '[]',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.hire_requests to authenticated;
grant all on public.hire_requests to service_role;
alter table public.hire_requests enable row level security;
create policy "own requests read" on public.hire_requests for select to authenticated using (auth.uid() = hirer_id or worker_id in (select id from public.workers where user_id = auth.uid()));
create policy "own requests insert" on public.hire_requests for insert to authenticated with check (auth.uid() = hirer_id);
create policy "own requests update" on public.hire_requests for update to authenticated using (auth.uid() = hirer_id or worker_id in (select id from public.workers where user_id = auth.uid()));

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  ref text not null default upper(substr(md5(random()::text),1,8)),
  user_id uuid,
  category text not null,
  subject text not null,
  description text not null,
  rating int,
  email text,
  created_at timestamptz not null default now()
);
grant insert on public.feedback to anon, authenticated;
grant all on public.feedback to service_role;
alter table public.feedback enable row level security;
create policy "anyone submit feedback" on public.feedback for insert to anon, authenticated with check (length(subject) between 1 and 150 and length(description) between 1 and 2000 and (rating is null or rating between 1 and 5));

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone, account_type)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.raw_user_meta_data->>'phone',
    case when new.raw_user_meta_data->>'account_type' = 'worker' then 'worker'::public.account_type else 'hirer'::public.account_type end);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create policy "avatar public read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatar own upload" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar own update" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatar own delete" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

insert into public.workers (name, skill, city, area, experience_years, rate, tags, languages, about, rating, reviews_count, verified_jobs, team_available, is_sample) values
('Ravi Kumar','Electrician','Bengaluru','Indiranagar',8,'₹500+','{Wiring,Repairs,Installation}','{Hindi,Kannada,English}','Residential and small-business electrical work, including safe wiring, lighting and appliance installation.',4.8,42,38,true,true),
('Asha Singh','Painter','Bengaluru','HSR Layout',6,'₹700+','{Interior,Texture,Finishing}','{Hindi,English}','Careful interior and exterior painting with surface preparation and clean finishing.',4.9,31,29,true,true),
('Imran Shaikh','Carpenter','Mumbai','Andheri West',10,'₹800+','{Furniture,Fittings,Repairs}','{Hindi,Marathi}','Custom shelves, furniture assembly, door fitting and wood repair for homes and shops.',4.7,28,25,false,true),
('Meena Patel','Tailor','Pune','Kothrud',7,'₹250+','{Alterations,Blouses,Stitching}','{Hindi,Gujarati,Marathi}','Custom tailoring and alterations with a focus on fit, detail and timely delivery.',4.9,24,22,false,true),
('Suresh Reddy','Plumber','Hyderabad','Madhapur',9,'₹450+','{"Leak repair",Pipes,Fixtures}','{Telugu,Hindi}','Plumbing repairs, bathroom fittings, leak detection and routine maintenance.',4.6,36,31,true,true),
('Pooja Verma','Mason','Delhi','Dwarka',5,'₹650+','{Tiling,Plaster,Repair}','{Hindi}','Small construction, tiling, plaster work and home renovation finishing.',4.8,19,17,true,true);

insert into public.jobs (title, skill, city, area, budget, timing, hire_type, is_sample) values
('Home wiring inspection','Electrician','Bengaluru','Koramangala','₹1,500–₹2,500','This week','Individual',true),
('2BHK interior painting','Painter','Pune','Baner','₹12k–₹18k','Within 10 days','Team',true),
('Kitchen cabinet repair','Carpenter','Mumbai','Powai','₹2,000–₹4,000','Flexible','Individual',true);