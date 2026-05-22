-- Enable the pgvector extension to store and search embeddings
create extension if not exists vector;

-- 1. Products Table
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  base_price numeric(12, 2) not null,
  images text[] default '{}',
  attributes jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Product Variants Table
create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  sku text not null unique,
  price numeric(12, 2) not null,
  stock integer not null default 0,
  variant_metadata jsonb default '{}'::jsonb, -- e.g., { "shade": "Vanilla Cream", "hex": "#F3E5AB", "image_url": "/images/vanilla.png" }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Bundles Table
create table if not exists bundles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity integer not null,
  discount_percentage numeric(5, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Orders Table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, -- Nullable for guest checkouts
  total_amount numeric(12, 2) not null,
  payment_status text not null default 'pending', -- 'pending', 'settlement', 'capture', 'expire', 'deny'
  shipping_status text not null default 'pending', -- 'pending', 'processing', 'shipped', 'delivered'
  tracking_number text,
  shipping_address jsonb not null, -- { "name": "Rian", "phone": "0812...", "city_id": "152", "address": "Jl. Merdeka No. 10", "postal_code": "40111", "shipping_cost": 15000, "shipping_service": "JNE REG" }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Subscriptions Table
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, -- Nullable for guest subscriptions
  product_id uuid references products(id) on delete cascade not null,
  frequency text not null, -- '30 days', '60 days', '90 days'
  next_billing_date timestamp with time zone not null,
  status text not null default 'active', -- 'active', 'paused', 'cancelled'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Store Knowledge Table (RAG Vector Store)
create table if not exists store_knowledge (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536), -- 1536 dimensions for text-embedding-3-small
  metadata jsonb default '{}'::jsonb, -- { "category": "ingredients" | "products" | "shipping" | "subscriptions" }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_product_variants_product_id on product_variants(product_id);
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);

-- Postgres function for perform cosine similarity vector search
create or replace function match_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    store_knowledge.id,
    store_knowledge.content,
    store_knowledge.metadata,
    1 - (store_knowledge.embedding <=> query_embedding) as similarity
  from store_knowledge
  where 1 - (store_knowledge.embedding <=> query_embedding) > match_threshold
  order by store_knowledge.embedding <=> query_embedding
  limit match_count;
$$;

-- 7. Journals Table (Blog Posts)
create table if not exists journals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text not null,
  excerpt text,
  category text not null,
  read_time text default '5 Menit Baca',
  author text default 'dr. Livia W.',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index if not exists idx_journals_slug on journals(slug);

-- 8. Coupons Table
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'percentage', -- 'percentage' atau 'fixed'
  discount_value numeric(12, 2) not null,
  min_purchase numeric(12, 2) default 0,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create index if not exists idx_coupons_code on coupons(code);

