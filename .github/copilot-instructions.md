# AI Agent Guide
- Stack: Next.js 15 (App Router) + React 19 + TypeScript; Tailwind CSS v4 via globals; shadcn/ui primitives in [src/components/ui](src/components/ui).
- Scripts: `dev`, `build`, `start`, `lint` in [package.json](package.json). Use `pnpm`, `npm`, or `yarn` (no tests configured).
- Imports: Path alias `@/*` → [src/*](src). Keep new imports aligned.

## Architecture
- Shell: [src/app/layout.tsx](src/app/layout.tsx) loads Geist and wraps with next-themes [ThemeProvider](src/components/theme-provider.tsx). Add `"use client"` on components using hooks/browser APIs.
- Entry: [src/app/page.tsx](src/app/page.tsx) chooses [home/page.tsx](src/app/home/page.tsx) (desktop) vs [home/mpage.tsx](src/app/home/mpage.tsx) (mobile) via [`useMediaQuery`](src/lib/hooks/use-media-query.ts). Preserve this split for new landing variants.
- Info pages: Splash in [src/app/mhome/page.tsx](src/app/mhome/page.tsx); static details in [src/app/about/page.tsx](src/app/about/page.tsx) and [src/app/privacy/page.tsx](src/app/privacy/page.tsx).

## Forms & Data Flow
- Primary form: [src/app/signup/page.tsx](src/app/signup/page.tsx) using `react-hook-form` + `zod`. Validates selfie (JPEG/PNG, <8MB), converts to base64, uploads to Apps Script (urlencoded), then POSTs enriched payload (`selfieId`, `selfieUrl`) to `/api/mform1`. On success, redirects to WhatsApp.
- Chat variants: [src/app/signup/promptwise.tsx](src/app/signup/promptwise.tsx) and [src/app/signup/ss.tsx](src/app/signup/ss.tsx) follow the same selfie-upload then submit pattern, posting to `/api/submit`.
- Expected shapes: Uploads return `{ status: "success", fileId?, url? }`; API proxy responses should include `{ status: "success" }`. Short-circuit failures with user alerts.

## API Proxies
- `/api/mform1`: [src/app/api/mform1/route.ts](src/app/api/mform1/route.ts) forwards JSON to a hard-coded Apps Script URL and checks `data.status === "success"`.
- `/api/submit`: [src/app/api/submit/route.ts](src/app/api/submit/route.ts) mirrors the same proxy behavior and response shape.
- Keep `Content-Type: application/json`; do not mutate the payload schema without coordinating downstream scripts.

## UI, Theming, Responsiveness
- Navbar: [src/components/Navbar.tsx](src/components/Navbar.tsx) uses [`useIsMobile`](src/hooks/useIsMobile.ts) for responsive state; toggle in [src/components/ThemeToggle.tsx](src/components/ThemeToggle.tsx) requires ThemeProvider context.
- Styles: global tokens/Tailwind in [src/app/globals.css](src/app/globals.css); page styles in [src/app/page.module.css](src/app/page.module.css). Prefer utilities + module styles over inline CSS.
- Hooks: Reuse [`useMediaQuery`](src/lib/hooks/use-media-query.ts) and [`useIsMobile`](src/hooks/useIsMobile.ts) rather than introducing new window-width logic.

## Developer Workflow
- Run dev: `pnpm dev` (or `npm run dev`). Build/start: `pnpm build`, `pnpm start`. Lint: `pnpm lint`.
- Debug proxies: Inspect console logs in [src/app/api/*](src/app/api/mform1/route.ts) when testing submissions. Verify Apps Script responses include `status: "success"`.
- Assets live under [public/](public). File names are referenced directly in CSS/JSX—avoid renames without updating usages.

## Conventions & Gotchas
- Most components are client components—add `"use client"` at the top when using hooks.
- External endpoints (Apps Script, WhatsApp link) are production-affecting and hard-coded; confirm before changing.
- Keep new files under `src/*` and import via `@/*`. Align with shadcn/ui primitives in [src/components/ui](src/components/ui).

## Example Patterns
- New landing variant: add a client component, then update [src/app/page.tsx](src/app/page.tsx) selection via `useMediaQuery` if needed.
- New form step: follow selfie upload → Apps Script JSON → enrich payload → POST via `/api/*` → success redirect pattern as in [src/app/signup/page.tsx](src/app/signup/page.tsx).