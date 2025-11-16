# Gemcast Re‑Ramp Guide (2025‑11‑16)

This document is a fast ramp‑up for future you when you’ve been away from the project for a while. It focuses on **what Gemcast is**, **how it’s structured**, and **where the important AI/agent pieces live**.

---

## 1. Product vision

**Gemcast** is an AI‑powered podcast workspace that:

- Guides a creator from **idea → schedule → production → post‑production**.
- Uses three high‑level “agents” (Ida, Astra, Ember) specialized for:
  - **Ida** – concept & branding.
  - **Astra** – planning & scheduling.
  - **Ember** – guests, prep, and editing artifacts.
- Integrates with:
  - **Gemini / AI SDK v5** for chat + tools.
  - **Firecrawl** for web research.
  - **Google Calendar / Drive / Meet / Gmail** for real‑world workflow.
- Persists:
  - Chat conversations.
  - Versioned “documents” (podcast briefs, guest dossiers, outlines, etc.).

High‑level user surfaces:

- **Chat** (`/chat`): main conversational UI with agents + artifacts.
- **Workspace** (`/workspace`): dashboard with recent chats, recent documents, and room for upcoming episodes, inspiration, etc.
- **Documents** (`/documents` & `/documents/:id`): library + viewer for AI‑created docs.

---

## 2. Tech stack snapshot

- **Framework**: Next.js 16 (App Router).
- **UI**:
  - shadcn/ui–style components under `src/components/ui`.
  - Custom sidebar shell (`SidebarProvider`, `Sidebar`, `SidebarInset`) for ChatGPT‑style left rail.
- **AI**:
  - `ai` (AI SDK v5) for `useChat`, `streamText`, `generateText`, tools, UI message streams.
  - Providers:
    - `@ai-sdk/google` via `myProvider` wrapper.
    - Tools under `src/lib/ai/tools`.
- **DB**:
  - Postgres (Supabase) + Drizzle ORM.
  - Migrations in:
    - `src/lib/db/migrations` (drizzle).
    - `supabase/migrations` (SQL mirror).
- **Auth**: NextAuth + Google OAuth (via `src/app/(auth)`).
- **Tooling**:
  - `pnpm` workspace.
  - TypeScript + Biome.
  - Vitest for integration tests (including Firecrawl + document APIs).

Key scripts (`package.json`):

- `pnpm dev` – dev server.
- `pnpm typecheck` – TS typecheck.
- `pnpm db:migrate` – run Drizzle migrations.
- `pnpm vitest` – tests.

---

## 3. Repo layout (what matters most)

Top‑level:

- `src/app` – Next.js routes.
  - `/page.tsx` – marketing/landing.
  - `/(chat)` – **authenticated app shell** (chat, workspace, docs).
    - `layout.tsx` – wraps pages in `SidebarProvider`, `AppSidebar`, `SidebarInset`.
    - `page.tsx` – entry to chat (redirects to login if needed).
    - `chat/[id]/page.tsx` – existing chat detail view.
    - `workspace/page.tsx` – dashboard (recent chats + docs + greeting/quote).
    - `documents/page.tsx` – documents list view.
    - `documents/[id]/page.tsx` – document viewer (markdown via `Response`).
    - API routes:
      - `api/chat` – core chat streaming route.
      - `api/document` – CRUD for document versions.
      - `api/document/list` – list latest version of docs for user.
      - `api/document/archive` – archive/unarchive documents.
      - `api/history` – chat history pagination + delete all (still available via API).
      - Tool‑related APIs (files, suggestions, etc.).
- `src/components` – UI + chat components.
  - `app-sidebar.tsx` – **app‑level nav** (Gemcast header, New chat, Workspace, Documents).
  - `chat.tsx` / `chat-wrapper.tsx` – chat container + `useChat` wiring.
  - `messages.tsx` – streaming messages list (scrolling area).
  - `artifact.tsx` – artifact side panel (docs/code/sheets/images).
  - `documents-view.tsx` – client component for `/documents`.
  - `sidebar-toggle.tsx` – button to collapse/expand sidebar.
  - `elements/response.tsx` – markdown rendering (`Streamdown`) used in chat + docs viewer.
- `src/lib/ai`
  - `agents.ts` – definitions for **Ida, Astra, Ember** (id, name, prompt, modelId, colors, etc.).
  - `models.ts` – mapping of agent IDs + legacy model IDs.
  - `providers.ts` – `myProvider` (Google Gemini models, image model).
  - `prompts.ts` – system prompt builder, including agent prompts + artifacts prompt.
  - `tools/*` – AI tools:
    - `create-document`, `update-document`, `request-suggestions`.
    - Firecrawl: `firecrawl-search`, `firecrawl-scrape`, `firecrawl-crawl`, `firecrawl-map`, `firecrawl-extract`.
    - Google: `google-calendar`, `google-drive-write`, `google-meet-create`, `gmail`, `read-google-meet-recording`.
    - `get-weather`, etc.
- `src/lib/artifacts`
  - `server.ts` – document handler abstraction and registration.
  - `text`, `code`, `sheet`, `image` (under `src/artifacts/`) – how each artifact kind is generated/updated by AI.
- `src/lib/db`
  - `schema.ts` – Drizzle schema; note particularly:
    - `Chat`, `Message_v2`, `Document`, `Suggestion`, `Stream`.
    - `Document.metadata` (`PodcastDocumentMetadata`) – status/type/etc.
  - `queries.ts` – DB helpers:
    - `saveChat`, `getChatsByUserId`, `getChatById`.
    - `saveDocument`, `getDocumentsById`, `getDocumentsByUserId`, `setDocumentStatus`.
    - Suggestion helpers.
  - `migrate.ts` – Drizzle migration runner.
  - `add-document-metadata-column.ts` – one‑off script to ensure `Document.metadata` exists.
- `PODCAST_DOCUMENT_SYSTEM.md` – design doc for podcast documents (briefs, plans, dossiers, etc.).

---

## 4. Chat & agent flow (server side)

Entry point: `src/app/(chat)/api/chat/route.ts`.

High‑level:

1. Validate request body with Zod (`postRequestBodySchema`).
2. Auth via `auth()`, enforce per‑user entitlements.
3. Load or create `Chat` row + save user message.
4. Build `uiMessages` and `requestHints` (geolocation).
5. Map `selectedChatModel` → agent → actual model id.
6. Call `createUIMessageStream` with:
   - `streamText` using `myProvider.languageModel(actualModelId)`.
   - `systemPrompt` from `prompts.ts` (agent‑aware + artifacts instructions).
   - Tools via `experimental_activeTools` and `tools` map.
   - Usage telemetry via TokenLens.
7. Pipe stream → SSE + persist resulting assistant messages & usage in DB.

Client side (chat):

- `Chat` component uses `useChat` from `@ai-sdk/react` with:
  - `DefaultChatTransport` → `/api/chat`.
  - `onData` → updates artifact data stream + usage.
  - `Messages` → scrollable message list.
  - `MultimodalInput` → text + attachments + model/agent selection.

Agents:

- The **agents** file centralizes persona, model selection and prompts.
- The UI treats agent IDs as “models”; `MultimodalInput` and `ChatHeader` read from `agents.ts` to show name, description, icon, and gradient.

---

## 5. Documents & workspace

**Documents (library + viewer)**:

- Storage:
  - `Document` rows are **append‑only versions** keyed by `(id, createdAt)`.
  - `metadata` (JSONB) carries:
    - `status: 'active' | 'archived'`.
    - `type` (podcast_brief, guest_dossier, etc. – not fully wired yet).
    - `chatId`, `agentId`, `episodeSlug`, etc. (future use).
- API:
  - `/api/document` – version append/read/delete.
  - `/api/document/list` – “latest per id” for list view with `status` and `q` filters.
  - `/api/document/archive` – flips `metadata.status`.
- UI:
  - `/documents`:
    - Uses `DocumentsView` client component.
    - Features:
      - Filters (Active/Archived).
      - Search by title.
      - List/grid toggle.
      - Cards showing title, snippet, type badges, status, and agent pill (when `agentId` is set).
  - `/documents/[id]`:
    - Viewer:
      - For images: renders base64 → `<img>`.
      - For everything else: uses `Response` (`Streamdown`) for markdown.
      - Shows status/type badges and updated time.

**Workspace dashboard** (`/workspace`):

- Header: `Workspace` + “Recent chats and documents”.
- Greeting:
  - `Hi, {firstName}` when user name is known; otherwise `Good {morning|afternoon|evening}`.
- Quote:
  - Fetched from ZenQuotes (`https://zenquotes.io/api/random`), cached for 1 hour.
  - Rendered below greeting as italic text + author.
- Cards:
  - **Recent chats** – uses `getChatsByUserId` to show the latest 8 chats with titles and relative timestamps.
  - **Recent documents** – latest version per document id, with type/status badges.
  - Placeholder row for future widgets (upcoming episodes, inspiration, analytics).

---

## 6. Tests & integration checks

Vitest config: `vitest.config.ts`

- Loads `.env.test`.
- Uses `jsdom` environment.
- Aliases `server-only` to a lightweight mock for testing server modules.

Notable tests:

- `src/tests/chat-firecrawl-ida.test.ts`
  - Calls `generateText` with Ida’s model and your “research Daniel G Wilson, co‑founder of Legion” prompt.
  - Verifies at least one `firecrawlSearch` tool call with no `tool-error` parts.
- `src/tests/document-api.test.ts`
  - Validates:
    - `/api/document/list` returns only latest version per id (content = “Version 2”).
    - `/api/document/archive` flips `metadata.status` and that archived docs are visible when listing with `status=archived`.

---

## 7. How to develop safely

- **Depend on `pnpm`**:
  - `pnpm install`
  - `pnpm dev`
  - `pnpm typecheck` before pushing.
- **DB schema changes**:
  - Prefer adding Drizzle migrations in `src/lib/db/migrations`.
  - Mirror them into `supabase/migrations` when they affect production.
  - For one‑off safety checks (like `Document.metadata`), keep scripts in `src/lib/db/` but try to replace them with migrations once stable.
- **AI flows**:
  - When changing tools or agent prompts, verify:
    - `/api/chat` still streams correctly.
    - Firecrawl and Google tools still work for your core flows (guest research, scheduling, etc.).
  - Keep an eye on `experimental_activeTools` gating (e.g., reasoning models vs tools).

If you need more depth on a specific subsystem, start with:

- `PODCAST_DOCUMENT_SYSTEM.md` – document types/metadata plan.
- `src/lib/ai/agents.ts` – how Ida/Astra/Ember are defined & used.
- `src/app/(chat)/api/chat/route.ts` – the main AI SDK v5 streaming implementation.

