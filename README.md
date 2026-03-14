# 🎞️ Memory Lane  
### *Your life, archived in a high-fidelity digital vault.*

[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-Fast%20Build-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20Storage%20%7C%20DB-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn-ui-black?style=for-the-badge)](https://ui.shadcn.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-Animations-pink?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)

Memory Lane is a **cinematic personal memory archiving platform** designed as a private digital vault. It allows users to securely store, explore, and relive their memories through immersive timelines, voice narratives, and a distraction-free interface.

Built using a modern **Backend-as-a-Service (BaaS)** architecture powered by Supabase, the application ensures secure authentication, scalable storage, and seamless session management.

---

## 🚀 Live Demo

> **Status:** [View Live Site](https://memory-lane-frontend-three.vercel.app/) *
---
admin credentials:
email: admin@gmail.com
password:admin@123

## ✨ Key Features

### 🎭 Archive Timeline  
- Cinematic vertical timeline of memories.
- Adaptive layouts for high-resolution images and audio clips.
- Smooth and immersive scrolling experience.

### 🎲 Reminisce Mode (Shuffle Engine)  
- Randomly rediscover past memories with a single click.
- Efficient database randomization powered by PostgreSQL.

### 🎙️ Voice-Over Narratives  
- Attach personal audio recordings to specific memories.
- Preserve the emotional context and stories behind the moments.

### 🔐 Secure Authentication  
- Supabase Auth with permanent session persistence.
- Automatic token refresh logic for uninterrupted access.
- **Row-Level Security (RLS)** ensures complete data privacy—users only see what they own.

### 🎨 Modern UI System  
- Built using **shadcn/ui** and Tailwind CSS for a premium feel.
- Fully responsive and accessible components across all devices.
- Native Dark and Light mode support.

### ⚡ Smooth Animations  
- Powered by Framer Motion.
- Physics-based transitions and haptic-feeling interactions.

---

## 🛠️ Tech Stack

| Category | Technology |
|:--- |:--- |
| **Frontend** | React 18, Vite |
| **Authentication** | Supabase Auth (JWT/Session) |
| **Database** | PostgreSQL (hosted on Supabase) |
| **Storage** | Multer and Supabase Bucket Storage |
| **UI Components** | shadcn/ui |
| **Styling** | Tailwind CSS |
| **Animations** | Framer Motion |
| **State Management** | React Context API |

---

## 🧱 Architecture

Memory Lane utilizes a **decoupled BaaS architecture**:



- **Supabase** manages the heavy lifting of authentication and session tokens.
- **PostgreSQL** handles complex queries for the "Reminisce" shuffle mode.
- **Supabase Storage** provides secure, authenticated buckets for media assets.
- **Row-Level Security (RLS)** acts as a firewall directly on the database level.

---

## 📁 Folder Structure

```text
src/
├── components/
│   ├── ui/        # shadcn/ui reusable primitives
│   ├── layout/    # Sidebar, Navbar, and Layout wrappers
│   └── memory/    # Memory cards and timeline components
├── context/       # Supabase Authentication provider
├── hooks/         # Custom React hooks (useAuth, useMemories)
├── lib/           # Supabase client configuration & Utils
├── pages/         # Dashboard, Timeline, Reminisce view
└── App.jsx        # Routing and global provider setup


---

## ⚙️ Installation and Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/memory-lane.git
cd memory-lane
npm install
---

### Environment Variables

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
---

### Enable Row-Level Security

alter table memories enable row level security;

create policy "Users can access own memories"
on memories
for all
using (auth.uid() = user_id);

---

## 🔐 Security Features

- Secure Supabase authentication  
- Row-Level Security for database protection  
- Signed URLs for secure media access  
- Automatic session refresh  
- Private user-only memory access  

---

## 🎨 Design Philosophy

Memory Lane is designed to be:

- Private – No social metrics or public exposure  
- Minimal – Focus on memories, not distractions  
- Immersive – Smooth, cinematic experience  
- Secure – Built with modern authentication and data protection  
- Memory search and filtering  
- Tags and categorization  
- Smart Title Refinement: Uses AI to transform basic descriptions into polished, high-fidelity titles, ensuring the digital vault remains professional and organized.

---

## 📈 Future Enhancements
🧠 Phase 1: AI & Discovery
Semantic Memory Search: Implementing pgvector in Supabase to allow users to search by "feeling" or "vibe" (e.g., "Find memories where I felt happy") rather than just keywords.

AI Narrative Generation: Integration with Gemini API to automatically generate poetic or nostalgic captions based on uploaded image content.

📱 Phase 2: Platform Growth
Progressive Web App (PWA): Adding service workers and a web manifest to allow users to "install" Memory Lane on their phones with offline viewing capabilities.

Collaborative Vaults: Secure, permission-based sharing for family albums using Supabase Invitations.

⚙️ Phase 3: Performance & Ops
Edge Function Optimizations: Moving heavy image processing and metadata extraction to Supabase Edge Functions for faster client-side performance.

Automated Backups: Scripted exports of user data to ensure 100% "digital vault" reliability.


---

## 👤 Author

**B. Rama Lakshmi**

- GitHub: https://github.com/ramalakshmi0304
- LinkedIn: www.linkedin.com/in/rama-lakshmi-31ab19a8
---

## ⭐ Why This Project Stands Out

- Modern Supabase BaaS architecture  
- Secure authentication with RLS  
- Professional UI using shadcn/ui  
- Scalable and production-ready design  
- Portfolio-level frontend engineering  


-- 1. Create the Memories Table
CREATE TABLE public.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the Media Table (for Images/Audio)
CREATE TABLE public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES public.memories(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- e.g., 'image', 'audio'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- 4. Create Security Policies
-- Memories: Users can only see/edit their own records
CREATE POLICY "Users can manage their own memories" 
ON public.memories FOR ALL 
USING (auth.uid() = user_id);

-- Media: Users can only see/edit media linked to their memories
CREATE POLICY "Users can manage media for their own memories" 
ON public.media FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.memories 
        WHERE public.memories.id = public.media.memory_id 
        AND public.memories.user_id = auth.uid()
    )
);