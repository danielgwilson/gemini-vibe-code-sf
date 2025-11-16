# AGENTS.md – Guidelines for AI assistants in this repo

This file is for AI coding assistants (ChatGPT, Claude, etc.) working inside the **Gemcast** repo. It explains how to behave so changes are safe, consistent, and easy to maintain.

These guidelines apply to the **entire repository** unless a more specific `AGENTS.md` is added in a subdirectory later.

---

## 1. Goals & context

- Gemcast is an **AI‑powered podcast workspace** built with **Next.js 16**, **AI SDK v5**, **Supabase/Postgres + Drizzle**, and a shadcn‑style UI.
- The core experiences are:
  - Chat (`/chat`) with agents (Ida/Astra/Ember) and artifacts.
  - Workspace dashboard (`/workspace`) for recent chats & documents.
  - Documents library & viewer (`/documents`).
- The repo also embeds an `ai-chatbot-reference` app, but the primary product is the root app in `src/`.

When in doubt, prioritize:

1. **Stability of the main chat flow and workspace.**
2. **Clarity and safety of DB schema and migrations.**
3. **Minimal, focused diffs that respect existing patterns.**

---

## 2. Tooling & commands

- Use **pnpm** for all node tasks:
  - `pnpm install`
  - `pnpm dev`
  - `pnpm typecheck`
  - `pnpm vitest` or `pnpm vitest run <file>` for tests.
- Before finishing non‑trivial changes, run:
  - `pnpm typecheck`
  - Relevant `pnpm vitest` tests if they touch the code you changed.

---

## 3. Code style & architecture

- **TypeScript / React**
  - Keep components small and composable.
  - Prefer existing UI primitives in `src/components/ui` over bespoke CSS.
  - Use Tailwind utility classes from the existing design system; avoid arbitrary pixel values unless necessary.
  - Ensure server vs client boundaries are clear: add `'use client'` only where needed, and don’t use client hooks on the server.

- **Next.js**
  - Use the App Router conventions already in place: `src/app/(chat)` is the authenticated shell.
  - Prefer server components for data fetching, client components for interactions.
  - Follow existing patterns for API routes under `src/app/(chat)/api`.

- **AI / agents**
  - Reuse the existing abstractions:
    - `src/lib/ai/agents.ts` for agent definitions.
    - `src/lib/ai/providers.ts` for models.
    - `src/lib/ai/tools/*` for tools (`tool(...)` from `ai`).
    - `src/app/(chat)/api/chat/route.ts` as the central streaming endpoint.
  - When adding a new tool:
    - Put it in `src/lib/ai/tools`.
    - Wire it into `tools` and `experimental_activeTools` in `api/chat/route.ts`.
    - Add types to `src/lib/types.ts` if it’s used in the UI.

- **Documents / artifacts**
  - Respect the existing document pipeline:
    - Storage via `Document` + `metadata` in `src/lib/db/schema.ts`.
    - Read/write via `saveDocument` / `getDocument*` queries.
    - Artifact handlers in `src/artifacts/*/server.ts` and `src/lib/artifacts/server.ts`.
  - When adding new document types or metadata:
    - Extend `PodcastDocumentMetadata` in `schema.ts`.
    - Use migrations (see below).

---

## 4. Database & migrations

- Schema lives in `src/lib/db/schema.ts`.
- Migrations:
  - Drizzle migrations are in `src/lib/db/migrations`.
  - Supabase SQL migrations are in `supabase/migrations`.
- When changing schema:
  - Prefer creating a new Drizzle migration file (don’t edit existing ones).
  - If the change affects production, mirror it into a new Supabase migration.
  - Avoid destructive operations unless explicitly requested (dropping columns/tables, mass deletes).
- The helper script `src/lib/db/add-document-metadata-column.ts` exists as a one‑off safety script; don’t reuse this pattern unless necessary—prefer migrations.

---

## 5. Navigation & layout conventions

- The app shell uses the shadcn **inset sidebar** pattern:
  - `SidebarProvider` wraps everything in `(chat)/layout.tsx`.
  - `AppSidebar` defines app‑level nav (New chat, Workspace, Documents).
  - `SidebarInset` wraps the main content area and is responsible for the rounded card and shadow.
- When adding new main pages inside `(chat)`:
  - Keep them visually consistent with `workspace` and `documents` in terms of padding, typography, and card layout.

---

## 6. Testing & safety

- For any change that touches:
  - `api/chat` routing,
  - AI tools, or
  - document APIs,
  run or extend the corresponding Vitest integration tests when possible:
  - `src/tests/chat-firecrawl-ida.test.ts`
  - `src/tests/document-api.test.ts`
- Prefer **small, focused tests** that exercise the real route handlers over heavy end‑to‑end tests.

---

## 7. Things to avoid

- Don’t:
  - Introduce new build tools or package managers.
  - Change authentication flows or provider secrets.
  - Add large, opinionated dependencies (state management, UI frameworks) without strong justification.
  - Break the existing `/chat` flow or artifact behavior to ship experimental features.
  - Add copyright / license headers (owner will handle legal text).

If unsure about a large refactor, prefer proposing it in a markdown doc (e.g. under `docs/` or in a new `DESIGN_NOTE.md`) rather than implementing it directly.

