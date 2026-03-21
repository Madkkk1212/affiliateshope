-- Hook Manager Schema
-- Run this in your Supabase SQL Editor

-- 1. Main Hooks Table
create table if not exists hooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  category text,
  status text default 'draft',
  visual_config jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- 2. Hook Products Association (with Sorting)
create table if not exists hook_products (
  id uuid primary key default gen_random_uuid(),
  hook_id uuid references hooks(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  position int default 0,
  show_in_popup boolean default false,
  created_at timestamp with time zone default now()
);

-- 3. Hook Gallery Images
create table if not exists hook_images (
  id uuid primary key default gen_random_uuid(),
  hook_id uuid references hooks(id) on delete cascade,
  image_url text not null,
  created_at timestamp with time zone default now()
);

-- 4. Hook Popups Configuration
create table if not exists hook_popups (
  id uuid primary key default gen_random_uuid(),
  hook_id uuid references hooks(id) on delete cascade,
  title text,
  description text,
  cta_text text default 'Lihat Detail',
  trigger_type text default 'delay', -- click / scroll / delay
  trigger_value int default 5,
  show_once boolean default true,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- 5. Popup Specific Images
create table if not exists popup_images (
  id uuid primary key default gen_random_uuid(),
  popup_id uuid references hook_popups(id) on delete cascade,
  image_url text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS (Optional, recommended to follow existing patterns)
alter table hooks enable row level security;
alter table hook_products enable row level security;
alter table hook_images enable row level security;
alter table hook_popups enable row level security;
alter table popup_images enable row level security;

-- Policies (Simplified: Admin full access, Public read access for published hooks)
create policy "Allow public read for published hooks" on hooks for select using (status = 'publish');
create policy "Allow admin all on hooks" on hooks for all using (true) with check (true);

create policy "Allow public read for hook products" on hook_products for select using (true);
create policy "Allow admin all on hook products" on hook_products for all using (true) with check (true);

create policy "Allow public read for hook images" on hook_images for select using (true);
create policy "Allow admin all on hook images" on hook_images for all using (true) with check (true);

create policy "Allow public read for hook popups" on hook_popups for select using (true);
create policy "Allow admin all on hook popups" on hook_popups for all using (true) with check (true);

create policy "Allow public read for popup images" on popup_images for select using (true);
create policy "Allow admin all on popup images" on popup_images for all using (true) with check (true);
