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

> **Status:** [View Live Site](https://your-deployment-link.com) *(Add link when deployed)*

---

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

---

## 📈 Future Enhancements

- Memory search and filtering  
- Tags and categorization  
- Memory sharing with permissions  
- Progressive Web App (PWA) support  
- AI-based memory organization  

---

## 👤 Author

**B. Rama Lakshmi**

- GitHub: https://github.com/yourusername  
- LinkedIn: https://linkedin.com/in/yourprofile  

---

## ⭐ Why This Project Stands Out

- Modern Supabase BaaS architecture  
- Secure authentication with RLS  
- Professional UI using shadcn/ui  
- Scalable and production-ready design  
- Portfolio-level frontend engineering  