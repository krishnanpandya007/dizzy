# Agent Guidelines for Interactive Personal Page

This document provides guidelines for AI agents working on this codebase.

## Local Setup

```bash
# Install dependencies (pnpm is the package manager)
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Project Overview

- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript 5.7.3
- **Styling**: Tailwind CSS 3.4.17 with CSS variables
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Package Manager**: pnpm
- **Validation**: Zod + React Hook Form
- **State**: React hooks + localStorage

## Directory Structure

```
├── app/                    # Next.js App Router pages/layouts
├── components/
│   ├── ui/                # shadcn/ui base components (DO NOT EDIT)
│   ├── *.tsx              # Feature components
│   └── *.tsx              # Sheet/form components
├── hooks/                  # Custom React hooks (use-*.ts/.tsx)
├── lib/                    # Utilities (utils.ts, encryption.ts)
├── styles/                 # Global styles
└── public/                 # Static assets
```

## Code Style Guidelines

### TypeScript
- Enable `strict: true` in tsconfig.json
- Define interfaces for props (e.g., `AppTileProps`)
- Use explicit return types for functions
- Avoid `any`; use `unknown` with type narrowing when needed
- Use `type` for simple types, `interface` for objects with potential extension

### Components
- Use `"use client"` directive for client components
- Props interfaces defined at component file top-level
- Destructure props in component signature
- Use descriptive component names (PascalCase)
- Use Tailwind CSS classes with `cn()` utility for conditional classes
- Follow shadcn/ui patterns for prop naming (e.g., `hasPin`, `onClick`)

### Imports
```typescript
// Absolute imports (configured via tsconfig paths)
import { useState } from "react"
import type { AppItem } from "@/hooks/use-apps"
import { cn } from "@/lib/utils"

// Relative imports for local files
import { SomeComponent } from "./some-component"

// Third-party imports (alphabetical within groups)
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
```

### Naming Conventions
- **Components**: PascalCase (`AppTile`, `PinDialog`)
- **Hooks**: camelCase with `use` prefix (`useApps`, `useMobile`)
- **Files**: kebab-case for components (`app-form-sheet.tsx`)
- **Variables/functions**: camelCase
- **Constants**: SCREAMING_SNAKE_CASE for config values
- **Types/Interfaces**: PascalCase

### Tailwind CSS
- Use CSS variables: `bg-primary`, `text-foreground`
- Follow color system: `background`, `foreground`, `card`, `muted`, `accent`
- Use semantic sizes: `sm`, `md`, `lg` for border-radius
- Responsive classes: `md:flex`, `lg:grid-cols-3`

### Error Handling
- Use try/catch for localStorage and JSON parsing
- Return empty arrays/objects on error (don't throw)
- Use early returns for validation
- Silent fail gracefully in UI components

### Forms & Validation
- Use React Hook Form + Zod resolvers
- Define Zod schemas for validation
- Use shadcn/ui Form components
- Handle server/client hydration for forms

### React Patterns
- Use `useCallback` for functions passed as props
- Use `useEffect` for side effects only
- Use functional state updates: `setApps(prev => ...)`
- Handle SSR: check `typeof window !== "undefined"`

## Build & Lint Commands

```bash
# Development
pnpm dev                          # Start dev server (port 3000)
pnpm dev --turbo                  # Turbopack (faster builds)

# Production
pnpm build                        # Build for production
pnpm start                        # Start production server

# Linting
pnpm lint                         # Run ESLint on entire project

# Type checking
npx tsc --noEmit                  # Type check without emitting files
```

## Important Notes

- **shadcn/ui components**: Located in `components/ui/` - these are auto-generated and should not be manually edited. Run `npx shadcn@latest add <component>` to add new ones.
- **Build errors**: `next.config.mjs` has `ignoreBuildErrors: true` - do not disable this without fixing type issues
- **Images**: Next.js images are unoptimized (`unoptimized: true` in next.config.mjs)
- **CSS Variables**: Define in `app/globals.css`, reference in `tailwind.config.ts`

## Key Dependencies

- `@radix-ui/react-*`: Unstyled accessible components
- `lucide-react`: Icon library
- `clsx`, `tailwind-merge`: Class name utilities (`cn()`)
- `zod`: Schema validation
- `react-hook-form`: Form handling
- `next-themes`: Dark mode support
- `jspdf`: PDF generation for data export

## PWA Support

PWA is implemented via manual service worker approach (more reliable with Next.js 16 App Router):

1. **Service Worker**: `public/sw.js` - Caches static assets for offline support
2. **Registration**: `components/service-worker-register.tsx` - Registers SW on client
3. **Manifest**: `public/manifest.json` - App metadata for "Add to Home Screen"

## Data Export

Export functionality allows users to backup their data:

1. **Access**: Tap the export icon (top-right) in the dashboard
2. **PIN Selection**: Shows all saved PINs with checkboxes
3. **Decryption**: Enter PINs for protected items you want to include
4. **Export Formats**:
   - **JSON**: Raw data export (apps + notes)
   - **PDF**: Formatted document with sections for apps and notes

### Export Behavior
- Unprotected data is always included
- Protected data requires selecting the PIN and entering correct value
- Only items with valid PINs are decrypted and included
- Failed decryptions are silently skipped

## PWA Support

PWA is implemented via manual service worker approach (more reliable with Next.js 16 App Router):

1. **Service Worker**: `public/sw.js` - Caches static assets for offline support
2. **Registration**: `components/service-worker-register.tsx` - Registers SW on client
3. **Manifest**: `public/manifest.json` - App metadata for "Add to Home Screen"
