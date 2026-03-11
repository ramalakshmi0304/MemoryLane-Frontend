-- Profiles: Extends Supabase Auth users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation: Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    new.email,
    new.raw_user_meta_data->>'avatar_url', 
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

  -- Memories table
CREATE TABLE public.memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  memory_date DATE NOT NULL,
  location TEXT,
  is_milestone BOOLEAN DEFAULT FALSE,
  milestone_number INT4,
  shared_with UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media table (Handles multiple files per memory)
CREATE TABLE public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('image', 'video', 'audio')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Albums
CREATE TABLE public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags (Categorization)
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction Table: Links Memories to Tags
CREATE TABLE public.memory_tags (
  memory_id UUID REFERENCES public.memories(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (memory_id, tag_id),
  CONSTRAINT unique_memory_tag UNIQUE (memory_id, tag_id)
);

CREATE OR REPLACE FUNCTION get_memories_on_this_day(user_id_param UUID, month_param INT, day_param INT)
RETURNS SETOF memories AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM memories
  WHERE (user_id = user_id_param OR shared_with @> ARRAY[user_id_param])
  AND EXTRACT(MONTH FROM memory_date) = month_param
  AND EXTRACT(DAY FROM memory_date) = day_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


## 🔐 Row-Level Security (RLS) Policies

| Table    | Policy Name        | Access Type | Rule                                      |
|----------|--------------------|-------------|-------------------------------------------|
| Profiles | Manage own profile | ALL         | auth.uid() = id                          |
| Memories | Owner full access  | ALL         | auth.uid() = user_id                     |
| Memories | Shared access     | SELECT      | auth.uid() = ANY(shared_with)            |
| Memories | Admin access      | ALL         | 'admin' = auth.jwt() ->> 'role'          |
| Albums   | Owner manage      | ALL         | auth.uid() = user_id                     |
| Media    | Public Read       | SELECT      | true (or restricted to owners)           |



-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- --- PROFILES POLICIES ---

-- Users can only view and edit their own profile data
CREATE POLICY "Manage own profile" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- --- MEMORIES POLICIES ---

-- Owners have full control over their own memories
CREATE POLICY "Owner full access" 
ON public.memories 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Viewers can see memories if their ID is in the shared_with array
CREATE POLICY "Shared access" 
ON public.memories 
FOR SELECT 
TO authenticated 
USING (auth.uid() = ANY(shared_with));

-- Admin override: Admins can see and manage all memories
CREATE POLICY "Admin access" 
ON public.memories 
FOR ALL 
TO authenticated 
USING ('admin' = auth.jwt() ->> 'role');

-- --- ALBUMS POLICIES ---

-- Users manage only their own albums
CREATE POLICY "Owner manage albums" 
ON public.albums 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- --- MEDIA POLICIES ---

-- Allows public read access to media (useful for shared links)
-- Alternatively, change 'true' to 'EXISTS (SELECT 1 FROM memories WHERE memories.id = media.memory_id AND memories.user_id = auth.uid())' for stricter security.
CREATE POLICY "Public Read Media" 
ON public.media 
FOR SELECT 
USING (true);

-- Only owners of the memory can add media to it
CREATE POLICY "Owner insert media" 
ON public.media 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM memories 
    WHERE memories.id = media.memory_id 
    AND memories.user_id = auth.uid()
  )
);