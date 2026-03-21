-- ==========================================
-- SHOPEE AFFILIATE HUB - DATABASE SCHEMA
-- ==========================================

-- 1. Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    images TEXT[] DEFAULT '{}'::TEXT[],
    price TEXT,
    discount_price TEXT,
    price_min BIGINT,
    price_max BIGINT,
    shopee_url TEXT,            -- Link Asli Shopee
    affiliate_url TEXT NOT NULL, -- Link an_redir (Affiliate)
    category TEXT,
    badge TEXT,
    hook TEXT,
    clicks INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create profiles table (Only for Admin Role)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin')),
    affiliate_id TEXT,         -- Shopee Affiliate ID User
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for products
-- Public read access for active products
DROP POLICY IF EXISTS "Public read for active products" ON public.products;
CREATE POLICY "Public read for active products" ON public.products
    FOR SELECT USING (is_active = true);

-- Admin full access
DROP POLICY IF EXISTS "Admin full access for products" ON public.products;
CREATE POLICY "Admin full access for products" ON public.products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 5. RLS Policies for profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- 6. Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. REFRESH SCHEMA CACHE (Wajib dijalankan jika ada Error kolom tidak ketemu)
NOTIFY pgrst, 'reload schema';
