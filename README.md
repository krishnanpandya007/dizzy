# Dizzy - Your Personal App Launcher

<div align="center">

![Dizzy Logo](./public/icon-192.svg)

**A secure, offline-capable personal dashboard for managing apps and encrypted notes**

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-black)](https://ui.shadcn.com/)

</div>

---

## ✨ Features

### 🔐 Secure PIN Protection
- Create and manage multiple PINs with hints
- Apps and notes can be protected with PIN encryption
- SHA-256 hash verification (raw PINs never stored)
- AES-256-GCM encryption for data (HTTPS/localhost)
- XOR fallback encryption for HTTP environments

### 🔑 Google Authentication (Optional)
- Sign in with Google via Supabase
- Optional - app works without authentication
- Protected routes redirect to sign-in
- User menu with sign-out option

### 📱 Progressive Web App (PWA)
- Install on mobile and desktop
- Works offline with service worker caching
- "Add to Home Screen" support
- Native app-like experience

### 📝 Encrypted Notes
- Create notes with optional PIN protection
- Only you can decrypt and read protected notes
- Automatic timestamp tracking

### 🚀 Quick App Launcher
- Add your favorite apps with custom icons
- One-click launch with optional PIN security
- Organized grid layout

### 📤 Data Export
- Export all data to JSON (backup)
- Export to formatted PDF document
- Selective decryption - only export what you unlock
- Choose which PINs to validate before export

### 🌙 Dark Mode
- Automatic system theme detection
- Smooth transitions
- Consistent design language

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5.7.3 |
| Styling | Tailwind CSS 3.4.17 |
| Components | shadcn/ui (Radix UI primitives) |
| State | React Hooks + localStorage |
| Validation | Zod + React Hook Form |
| Auth | Supabase (Google OAuth) |
| Encryption | Web Crypto API (AES-GCM/SHA-256) |
| PDF Export | jsPDF 4.1.0 |
| Icons | Lucide React |
| Theme | next-themes |

---

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/krishnanpandya007/dizzy.git
cd dizzy

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

---

## 🔐 Authentication (Optional)

Dizzy includes optional Google authentication via Supabase.

### Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Authentication > Providers** and enable Google
3. Go to **Settings > API** and copy:
   - Project URL
   - Anon public key
4. Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

5. Add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   ```
   https://your-supabase-project.auth.supabase.co/auth/v1/callback
   ```
6. Add the Google provider in Supabase dashboard

### How It Works

- **Without Supabase**: App works fully without authentication
- **With Supabase**: Users must sign in with Google to access the dashboard
- **Data Storage**: All data remains local (localStorage) - auth is for access control only

---

## 🏗 Build & Deploy

### Production Build

```bash
pnpm build
pnpm start
```

### Deploy to Vercel (Recommended)

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com)
3. Configure:
   - Framework: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`

### Deploy Anywhere

```bash
pnpm build
# Serve the .next directory with any Node.js server
```

---

## 📱 Mobile Access (Local Network)

```bash
# Find your IP address
ipconfig

# Run dev server
pnpm dev

# On mobile, navigate to:
http://YOUR_IP_ADDRESS:3000
```

### Install as PWA on Mobile

**iOS (Safari):**
1. Open the app
2. Tap Share → Add to Home Screen

**Android (Chrome):**
1. Open the app
2. Tap Menu → Install App

---

## 🔒 Security Details

### Encryption Architecture

```
┌─────────────────────────────────────────┐
│           User PIN                       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        SHA-256 Hash (stored)             │
│     (for PIN verification only)         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    PBKDF2 Key Derivation (100K iter)    │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      AES-256-GCM Encryption             │
│    (salt + IV + encrypted data)         │
└─────────────────────────────────────────┘
```

### Security Features

- **PIN Hashing**: SHA-256 (never stores raw PINs)
- **Key Derivation**: PBKDF2 with 100K iterations
- **Encryption**: AES-256-GCM with random salt and IV
- **Fallback**: XOR encryption for HTTP environments
- **localStorage**: All data persists locally on device

### Limitations

- PINs are remembered per device (browser localStorage)
- No cloud sync (by design for privacy)
- HTTP mode uses weaker XOR encryption (use HTTPS when possible)

---

## 📂 Project Structure

```
dizzy/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Main dashboard page
│   └── (auth)/               # Auth routes
│       └── sign-in/          # Sign-in page
├── components/
│   ├── ui/                   # shadcn/ui base components
│   ├── dizzy-dashboard.tsx   # Main dashboard component
│   ├── export-sheet.tsx      # Data export modal
│   ├── ip-display.tsx        # IP display with copy button
│   └── auth-guard.tsx        # Route protection component
├── contexts/
│   └── auth-context.tsx      # Auth provider and hooks
├── hooks/
│   ├── use-apps.ts           # Apps state management
│   ├── use-notes.ts          # Notes state management
│   ├── use-saved-pins.ts     # PINs state management
│   └── use-pin-manager.ts     # PIN-item mappings
├── lib/
│   ├── encryption.ts         # Encryption/decryption utilities
│   └── supabase.ts          # Supabase client configuration
├── public/
│   ├── sw.js                 # Service worker (PWA)
│   ├── manifest.json         # PWA manifest
│   └── icon-*.svg           # App icons
├── styles/
│   └── globals.css           # Global styles
├── .env.example              # Environment variables template
├── AGENTS.md                 # AI agent guidelines
└── README.md                 # This file
```
dizzy/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with providers
│   └── page.tsx              # Main dashboard page
├── components/
│   ├── ui/                   # shadcn/ui base components
│   ├── dizzy-dashboard.tsx   # Main dashboard component
│   ├── export-sheet.tsx      # Data export modal
│   ├── ip-display.tsx        # IP display with copy button
│   └── *.tsx                 # Feature components
├── hooks/
│   ├── use-apps.ts           # Apps state management
│   ├── use-notes.ts          # Notes state management
│   ├── use-saved-pins.ts     # PINs state management
│   └── use-pin-manager.ts     # PIN-item mappings
├── lib/
│   ├── encryption.ts         # Encryption/decryption utilities
│   └── utils.ts              # Shared utilities
├── public/
│   ├── sw.js                 # Service worker (PWA)
│   ├── manifest.json         # PWA manifest
│   └── icon-*.svg            # App icons
├── styles/
│   └── globals.css           # Global styles
├── AGENTS.md                 # AI agent guidelines
└── README.md                 # This file
```

---

## 🎨 Design System

### Spacing Scale
- `0.5` to `1` gap for tight layouts
- `2` to `4` gap for component spacing
- `6` to `8` padding for sections
- `24` to `28` padding for page containers

### Border Radius
- `sm`: 0.125rem (2px) - Small elements
- `md`: 0.375rem (6px) - Buttons, inputs
- `lg`: 0.5rem (8px) - Cards, tiles
- `xl`: 0.75rem (12px) - Modals
- `2xl`: 1rem (16px) - Sheets
- `full`: 9999px - Pills, circles

### Color Palette (CSS Variables)
- `background` / `foreground` - Page background
- `card` / `card-foreground` - Card components
- `primary` / `primary-foreground` - Main actions
- `secondary` / `secondary-foreground` - Subtle backgrounds
- `muted` / `muted-foreground` - Disabled/hint text
- `accent` / `accent-foreground` - Highlights
- `destructive` - Error states
- `border` / `ring` - Borders

---

## 📤 Export Format

### JSON Export
```json
{
  "exportedAt": "2026-02-08T12:00:00.000Z",
  "apps": [
    {
      "id": "uuid",
      "name": "Gmail",
      "link": "https://gmail.com",
      "imageUrl": "https://..."
    }
  ],
  "notes": [
    {
      "id": "uuid",
      "title": "My Secret Note",
      "encryptedContent": "decrypted content here",
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  ]
}
```

### PDF Export
- Formatted document with sections
- Title and export timestamp
- Apps section with names and links
- Notes section with full content
- Clean typography and spacing

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [AGENTS.md](./AGENTS.md) for development guidelines.

---

## 📄 License

MIT License - Feel free to use and modify.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [Radix UI](https://radix-ui.com/) - Accessible primitives
- [Lucide](https://lucide.dev/) - Beautiful icons
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [Supabase](https://supabase.com/) - Authentication

---

<div align="center">

**Built with 🔐 by Krishnan**

</div>
