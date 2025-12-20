# AI Agent Guide
- Stack: Next.js 15 (app router) with React 19 and TypeScript; Tailwind CSS v4 imported via globals; shadcn/ui components live in [src/components/ui](src/components/ui).
- Package scripts: `pnpm dev|build|start|lint` equivalents are defined in package.json; no tests configured.
- Path alias `@/*` points to `src/*` (tsconfig paths). Keep imports aligned with this convention.

## Routing & Layout
- Root shell in [src/app/layout.tsx](src/app/layout.tsx) injects Geist fonts and wraps the app with the next-themes [ThemeProvider](src/components/theme-provider.tsx); add `use client` to components that need hooks.
- Entry [src/app/page.tsx](src/app/page.tsx) dynamically picks desktop [src/app/home/page.tsx](src/app/home/page.tsx) vs mobile [src/app/home/mpage.tsx](src/app/home/mpage.tsx) using the `useMediaQuery` hook. Preserve this split when adding new landing content.
- Additional flows: splash gate in [src/app/mhome/page.tsx](src/app/mhome/page.tsx); static info in [src/app/about/page.tsx](src/app/about/page.tsx) and [src/app/privacy/page.tsx](src/app/privacy/page.tsx).

## Forms & Data Flow
- Main application form lives in [src/app/signup/page.tsx](src/app/signup/page.tsx) using `react-hook-form` + `zod`. It validates a selfie `File` (JPEG/PNG, <8MB), converts it to base64, uploads to a Google Apps Script (urlencoded body), then POSTs the enriched payload (with `selfieId`/`selfieUrl`) to `/api/mform1`. Success redirects to the WhatsApp number.
- Chat-style variants are in [src/app/signup/promptwise.tsx](src/app/signup/promptwise.tsx) and [src/app/signup/ss.tsx](src/app/signup/ss.tsx); they also upload the selfie to per-file Apps Script endpoints and then POST to `/api/submit`. Maintain required question order and the `selfie` URL substitution.
- File uploads expect an Apps Script JSON shape `{ status: "success", fileId?, url? }`; backend fetches expect `{ status: "success" }`. Handle failures by short-circuiting with user alerts.

## API Proxies
- `/api/mform1` ([src/app/api/mform1/route.ts](src/app/api/mform1/route.ts)) and `/api/submit` ([src/app/api/submit/route.ts](src/app/api/submit/route.ts)) simply forward JSON bodies to hard-coded Apps Script URLs. Keep headers as `Content-Type: application/json` and preserve the response shape checks.

## UI, Theming, Responsiveness
- Navbar uses [src/components/Navbar.tsx](src/components/Navbar.tsx) with `useIsMobile` for responsive behavior; dark-mode toggle at [src/components/ThemeToggle.tsx](src/components/ThemeToggle.tsx) requires next-themes context.
- Styling: global tokens and Tailwind setup are in [src/app/globals.css](src/app/globals.css); page-level styles rely on the CSS module [src/app/page.module.css](src/app/page.module.css). Prefer existing utility classes + module styles over ad-hoc inline CSS.
- Custom viewport hooks: `useMediaQuery` in [src/lib/hooks/use-media-query.ts](src/lib/hooks/use-media-query.ts) (used for desktop/mobile split) and `useIsMobile` in [src/hooks/useIsMobile.ts](src/hooks/useIsMobile.ts) (used by Navbar). Reuse instead of adding new window width logic.

## Conventions & Gotchas
- Most pages/components are client components; include the `"use client"` directive when adding hooks or browser APIs.
- External dependencies (Google Apps Script URLs, WhatsApp redirect) are hard-coded; changing them affects production submissions—confirm before modifying.
- Assets (hero images, slides) live under `public/`; keep file names stable because backgrounds are referenced directly in CSS and JSX.