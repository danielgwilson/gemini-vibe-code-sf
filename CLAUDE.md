# CLAUDE.md – Instructions for Claude in the Gemcast repo

This file is aimed at Anthropic’s Claude models working inside the **Gemcast** codebase. It summarizes how to behave, what’s important, and how to avoid breaking the app while making useful changes.

For more detailed project context, see `RERAMP.md` and `PODCAST_DOCUMENT_SYSTEM.md`.

---

## 1. Mindset

Think of yourself as a **senior engineer/editor** inside an existing product:

- Preserve the current user experience (chat, workspace, documents).
- Make **small, safe, high‑impact changes** instead of broad rewrites.
- When something is ambiguous, prefer:
  - Leaving a clear note in a markdown file, or
  - Adding a small test to illustrate intent,
  rather than guessing and shipping a risky refactor.

---

## 2. Where to focus

- Core flows:
  - Chat streaming (`src/app/(chat)/api/chat/route.ts` + `src/components/chat.tsx`).
  - Workspace dashboard (`/workspace`).
  - Documents library + viewer (`/documents`).
- AI / agents:
  - Agent definitions in `src/lib/ai/agents.ts`.
  - Tools in `src/lib/ai/tools/*`.
  - Provider wiring in `src/lib/ai/providers.ts`.
- Data:
  - DB schema in `src/lib/db/schema.ts`.
  - Queries in `src/lib/db/queries.ts`.

When adding or modifying behavior, try to plug into these existing abstractions instead of inventing parallel ones.

---

## 3. Coding guidelines

- Use **TypeScript** and existing patterns:
  - Follow the component structure under `src/components`.
  - Prefer `className`‑based styling using Tailwind utilities (`bg-`, `text-`, `p-`, `gap-`) over inline styles.
  - Use design‑system primitives in `src/components/ui` instead of raw HTML whenever possible (e.g. `Button`, `Card`, `Badge`, `Input`).
- Next.js:
  - Keep server components for data fetching, client components for stateful UI.
  - Use `(chat)/layout.tsx` as the shell for authenticated pages; new pages go under `src/app/(chat)/...`.
- AI SDK v5:
  - For new tools, use `tool(...)` from `ai` and define them in `src/lib/ai/tools`.
  - Wire tools into the `tools` map and `experimental_activeTools` in the chat route.
  - When changing prompts or agents, keep system messages concise and focused on behavior that matters.

---

## 4. DB & migrations

- Don’t edit existing migrations.
- For schema changes:
  - Update `src/lib/db/schema.ts`.
  - Add a new migration under `src/lib/db/migrations`.
  - If the change must go to production, mirror it in `supabase/migrations`.
- Avoid destructive operations unless explicitly requested (dropping columns/tables, mass data modifications).

---

## 5. Testing & verification

- Use `pnpm`:
  - `pnpm dev` – run the app.
  - `pnpm typecheck` – check types (run before finishing changes).
  - `pnpm vitest` – run tests.
- Prefer adding or updating tests in:
  - `src/tests/chat-firecrawl-ida.test.ts` for chat + tool behavior.
  - `src/tests/document-api.test.ts` for document listing/archiving.

If you change anything under `src/app/(chat)/api`, strongly consider adding a targeted Vitest spec that calls the handler directly (like the existing tests do).

---

## 6. UX polish

When touching UI:

- Keep spacing and typography consistent with existing components:
  - Use Tailwind’s spacing scale (`p-2`, `p-3`, `gap-2`, `gap-4`, etc.) instead of arbitrary pixels.
  - Reuse card + header patterns from Workspace and Documents (`Card` + header/body sections).
  - Maintain the inset sidebar layout (left nav + rounded content card).
- For any new view:
  - Consider whether it belongs as:
    - A new page under `(chat)` (e.g. `/workspace/...`), or
    - A card/widget on the Workspace dashboard.

---

## 7. Things to avoid

- Changing auth flows or environment variable names without explicit instruction.
- Introducing heavy new dependencies (UI kits, state managers, etc.).
- Modifying `ai-chatbot-reference` unless specifically asked; the primary product is the root app under `src/`.
- Adding boilerplate comments or license headers.

When in doubt, ask (via a markdown design note or in comments) rather than silently changing critical infrastructure.

