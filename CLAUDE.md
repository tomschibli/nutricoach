# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev         # Start frontend dev server at localhost:8080
npm run server      # Start Express API server at localhost:3001
npm run dev:full    # Start both servers concurrently
npm run build       # Production build to dist/
npm run lint        # ESLint check
npm run preview     # Preview production build locally
npm start           # Production API server (used on Railway/Render)
```

### iOS / Capacitor
```bash
npm run build && npx cap sync   # Build and sync to iOS
npx cap open ios                # Open Xcode
```

## Architecture

React 19 SPA built with Vite + TypeScript, deployed on Vercel (SPA routing via `vercel.json` rewrites).

**Routing:** All routes live in `src/App.tsx`. Add new routes there. New pages go in `src/pages/`. The main/default page is `src/pages/Index.tsx` — any new component must be wired into this page to be visible.

**UI:** Use shadcn/ui components exclusively (all 50+ are pre-installed in `src/components/ui/`). Do not edit files in `src/components/ui/` — create new components in `src/components/` that compose them instead. Use Tailwind CSS for all styling. Use Lucide React for icons.

**Provider stack** (in `App.tsx`): `QueryClientProvider` → `TooltipProvider` → `BrowserRouter` → route `<Toaster>` components.

**Path alias:** `@/` maps to `src/`.

**TypeScript config is lenient** — strict mode off, unused vars ignored. Zod + React Hook Form are available for form validation.
