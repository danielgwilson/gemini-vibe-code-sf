# Podcast Document System – Design & Implementation Plan (AI SDK v5, Gemcast)

## 1. Why a document system?

Today:
- Chats are persisted and artifacts exist, but agents don’t have a clear, durable set of “working documents” for a podcast.
- For multi‑phase workflows (Ida → Astra → Ember), we need resumable artifacts:
  - Podcast concept briefs
  - Episode production plans
  - Guest dossiers
  - Editing / marketing checklists

Goal:
- Give each podcast “project” a small set of long‑lived documents that agents can create, update, diff, and revisit across sessions.
- Make those documents visible and manageable in the UI (a “Documents” or “Workspace” view) and accessible from tools inside the AI SDK v5 flows.

## 2. Existing building blocks in this repo

We already have most of the primitives needed:

- **Document storage & versioning**
  - Table `Document` in `src/lib/db/schema.ts` / `supabase/migrations/0000_initial_schema.sql`:
    - `id` (uuid) + `createdAt` (timestamp) as composite PK → append‑only versions per document.
    - `title`, `content`, `kind` (`'text' | 'code' | 'image' | 'sheet'`), `userId`.
  - Queries in `src/lib/db/queries.ts`:
    - `saveDocument`, `getDocumentsById`, `getDocumentById`, `deleteDocumentsByIdAfterTimestamp`.

- **Artifact infrastructure (UI + server)**
  - `src/lib/artifacts/server.ts`:
    - `createDocumentHandler` abstraction that:
      - Calls an artifact‑specific handler (`text`, `code`, `sheet`, `image`).
      - Persists content via `saveDocument` (creating a new version).
    - `documentHandlersByArtifactKind` and `artifactKinds`.
  - `src/artifacts/*/server.ts` – per‑kind generation/update:
    - `textDocumentHandler` uses `streamText` and `updateDocumentPrompt`.
    - `codeDocumentHandler` uses structured `streamObject` output and a `code` field.
    - `sheetDocumentHandler`, `imageDocumentHandler` similarly wrap AI SDK v5 calls.
  - `src/components/artifact.tsx`:
    - Fetches versions via `/api/document?id=...`.
    - Shows the latest version, supports version history and diff mode.
    - Uses ProseMirror‑based diff utilities in `src/lib/editor/diff.ts` and `config.ts`.

- **Chat‑side tools (AI SDK v5)**
  - `src/lib/ai/tools/create-document.ts` & `update-document.ts`:
    - AI tools that call the above handlers and persist documents.
  - `src/lib/ai/tools/request-suggestions.ts`:
    - Takes a `documentId`, runs AI suggestions, stores them in the `Suggestion` table.
  - `src/app/(chat)/api/chat/route.ts`:
    - Uses `streamText` with `experimental_activeTools`, wired to:
      - `createDocument`, `updateDocument`, `requestSuggestions`.
      - Firecrawl tools, Google Calendar/Drive/Meet, Gmail, etc.

- **Document API endpoint**
  - `src/app/(chat)/api/document/route.ts`:
    - `GET /api/document?id` → full history for a document (sorted by `createdAt`).
    - `POST /api/document?id` → append a new version with `content`, `title`, `kind`.
    - `DELETE /api/document?id&timestamp` → prune versions and attached suggestions after a timestamp.

Net: You already have a **versioned document store, artifact UI, and AI tools**. What’s missing is:
- A domain model for “podcast documents”
- Listing/browsing documents outside the artifact panel
- A consistent way for Ida/Astra/Ember to discover & reuse existing documents

## 3. Design goals for the podcast document system

1. **Domain‑aware documents**
   - Make documents first‑class in the podcast workflow: concept briefs, schedules, dossiers, etc.
2. **Append‑only, diffable history**
   - Continue using `Document`’s `(id, createdAt)` PK and diff view; never silently overwrite.
3. **Tool‑driven CRUD**
   - Agents should create, update, and fetch documents via AI SDK tools, not ad‑hoc DB calls.
4. **Discoverable in UI**
   - Users should see a “Documents” tab with filters by podcast, episode, and document type.
5. **Composable with Firecrawl & Google tools**
   - E.g., Firecrawl → research → summarized into a “Guest dossier” document; Google Drive → export/share.

## 4. Domain model: “Podcast Documents”

Instead of overloading `kind` (which is tied to artifact rendering), introduce a separate “podcast document type” concept.

### 4.1. Proposed document types

Define a `PodcastDocumentType` union:

- `podcast_brief` – Ida’s output (name, niche, pillars, brand voice).
- `episode_plan` – Astra’s batch schedule for a single episode.
- `production_schedule` – Astra’s batched multi‑episode plan.
- `guest_dossier` – Ember + Firecrawl research on a guest.
- `episode_outline` – Ember’s pre‑record outline or script.
- `post_production_pack` – show notes, social copy, clips list.

### 4.2. How to represent it

Best‑practice with your current schema:

- **Add a `metadata` JSONB column to `Document`** via a Drizzle migration:
  - Keys:
    - `type`: `PodcastDocumentType`
    - `chatId`: originating chat (link to `Chat.id`)
    - `agentId`: `'ida' | 'astra' | 'ember'` (optional)
    - `episodeId` or `episodeSlug` (string; later, if/when you add episodes table)
  - This avoids schema churn every time you introduce a new logical doc type.

Example `metadata` shape:

```json
{
  "type": "guest_dossier",
  "chatId": "uuid-of-chat",
  "agentId": "ember",
  "episodeSlug": "s01e03-future-of-ai-with-daniel"
}
```

Migration outline:
- Drizzle migration: add `metadata jsonb` nullable column to `Document`.
- Update `src/lib/db/schema.ts` `document` table to include `metadata` typed to a TS interface.

## 5. AI tools and agent flows

### 5.1. Agent responsibilities mapped to documents

- **Ida**
  - Creates: `podcast_brief` (1 per show), possibly a high‑level `episode_outline` stub for the first 3–5 episodes.
  - Tools:
    - `createDocument` → `kind: 'text', title: "Podcast Concept Brief: {Name}"`.
    - Later: `updateDocument` when the concept evolves.

- **Astra**
  - Creates/updates:
    - `production_schedule` (batched, cross‑episode).
    - `episode_plan` (per episode).
  - Tools:
    - `createDocument` / `updateDocument` for schedules.
    - `googleCalendar` + `googleDriveWrite` for syncing schedule out to real infra.

- **Ember**
  - Creates/updates:
    - `guest_dossier` – via `firecrawlSearch` + `firecrawlScrape`.
    - `episode_outline` – the final script/outline.
    - `post_production_pack` – show notes, clips, social copy.
  - Tools:
    - `firecrawlSearch`, `firecrawlScrape`, `createDocument`, `updateDocument`.

### 5.2. New/extended tools

You already have `createDocument` and `updateDocument`. Two additions make “resume work” easy:

1. **`findDocuments` tool**
   - Purpose: let agents discover documents by metadata instead of guessing IDs.
   - Implementation:
     - Tool wrapper around a new query function, e.g.:
       - `getDocumentsByFilter({ userId, type?, chatId?, episodeSlug? })`.
     - Returns a list of:
       - `id`, `title`, `metadata.type`, `metadata.episodeSlug`, `createdAt`, plus the latest `content` if needed.
   - Usage examples:
     - “Find the podcast brief for this chat” (Ida/Astra).
     - “List guest dossiers for episode S01E03” (Ember).

2. **`loadDocument` tool**
   - Purpose: minimal, read‑only retrieval by `documentId` (and optionally type).
   - Implementation:
     - Tool that wraps `getDocumentById` and returns:
       - `id`, `title`, `kind`, `metadata`, `content` of the latest version.
   - Usage:
     - At the start of an interaction, the agent calls `loadDocument` instead of asking the user to paste prior work.

Both tools should be defined in `src/lib/ai/tools/` using `tool(...)` from `ai` and wired into `tools` + `experimental_activeTools` in `src/app/(chat)/api/chat/route.ts`.

### 5.3. CRUD semantics and best practices

- **Create**
  - Always via `createDocument` tool (for AI‑initiated documents) or via artifact UI (for user‑initiated).
  - Immediately set `metadata`:
    - If invoked from a chat → include `chatId` and `agentId`.
    - Agents should set `type` explicitly (podcast_brief, etc.).

- **Update**
  - Use `updateDocument` tool for AI‑initiated updates:
    - It already writes a new row per change via `documentHandlersByArtifactKind` → `saveDocument`.
    - Preserve `metadata` (don’t overwrite).
  - For user inline edits in the artifact UI:
    - Keep current behavior of `/api/document` POST and version append.
    - No need to special‑case podcast documents; just ensure `metadata` travels through.

- **Delete / archival**
  - Prefer **soft deletion / archival** over hard deletes:
    - Option 1 (minimal): add `status: 'active' | 'archived'` to `Document.metadata` and filter on it.
    - Option 2 (heavier): add an `archivedAt` column.
  - Use existing `DELETE /api/document?id&timestamp` only for pruning noisy versions, not for user‑initiated archival.

## 6. UI & UX: Dashboard for documents

### 6.1. New “Documents” page

Add a simple list view:

- Route: `src/app/(chat)/documents/page.tsx` (or top‑level `/documents`).
- Data:
  - New API: `GET /api/document/list?type=&episodeSlug=&q=`.
    - Implement in `src/app/(chat)/api/document/list/route.ts`.
    - Uses `userId` from `auth()` and filters by `metadata.type`, `metadata.episodeSlug`, optional search `q` in title.
- UI:
  - Table or cards with:
    - Title, type (badge), last updated, linked chat, episode, agent.
    - Clicking goes to:
      - Either `Artifact` overlay (by calling the same store with `documentId`) or
      - A standalone `Document` viewer/editor route if you want it.

### 6.2. Chat integration

- From chat sidebar or header:
  - Add “Open documents” shortcut that filters to docs for this chat (`metadata.chatId = current chat`).
- From agent suggestions:
  - Use existing `SuggestedActions` but add prompts that explicitly mention creating/updating the relevant document types, e.g.:
    - Ida: “Create a podcast brief document for my show.”
    - Ember: “Create a guest dossier for {Guest Name}.”

## 7. Implementation phases

### Phase 1 – Metadata & tools (backend only)

1. **DB migration**
   - Add `metadata jsonb` column to `Document`.
   - Update `src/lib/db/schema.ts` and `src/lib/db/queries.ts` to pass through metadata (optional at first).

2. **Extend document tool implementations**
   - Update `createDocument` server logic (in `src/lib/artifacts/server.ts` and/or `saveDocument` callers) to accept optional `metadata` from:
     - `createDocument` tool input (add `metadata` field to its `inputSchema`).
     - Artifacts UI (for user‑created docs) – can keep `metadata` `null` initially.

3. **Add `findDocuments` and `loadDocument` tools**
   - New files under `src/lib/ai/tools/`:
     - `find-documents.ts`
     - `load-document.ts`
   - Wire them into:
     - `tools` & `experimental_activeTools` in `src/app/(chat)/api/chat/route.ts`.
     - `ChatTools` type in `src/lib/types.ts`.

4. **Agent prompt updates**
   - Update Ida/Astra/Ember prompts in `src/lib/ai/agents.ts` to:
     - Instruct them to call `findDocuments` / `loadDocument` first when resuming work.
     - Instruct them to use `createDocument` with `metadata.type` set appropriately when starting new phases.

### Phase 2 – UI: Documents list & per‑podcast views

1. **Document listing API**
   - Implement `GET /api/document/list`:
     - Uses `auth()` → `session.user.id`.
     - Optional filters: `type`, `chatId`, `episodeSlug`, `q` (substring in `title`).

2. **Documents page**
   - New route under `src/app/(chat)/documents/page.tsx`.
   - Uses SWR to fetch `/api/document/list`.
   - Renders:
     - Filters (type dropdown, search).
     - List of documents with metadata and “Open” action.
   - “Open” opens the artifact for that `documentId` by:
     - Updating artifact store via `useArtifact` and rendering `<Artifact />`.

3. **Chat header / sidebar link**
   - Add a “Documents” button in `src/components/chat-header.tsx` or sidebar to jump to the documents page with a `chatId` filter.

### Phase 3 – Deeper workflows & exports

1. **Guest dossier flow**
   - Codify pattern for Ember:
     - `firecrawlSearch` (and optionally `firecrawlScrape`) → summarise in a `guest_dossier` document via `createDocument` / `updateDocument`.
   - Optionally add a `guest_dossier`‑specific artifact template in `src/artifacts/text/*` that shows structured sections (bio, key themes, links).

2. **Episode pack export**
   - Add an API `GET /api/document/export?id=&format=md`:
     - Returns `text/markdown` or `text/plain` for the latest version.
   - UI:
     - “Download” action in Artifact header and Documents page.

3. **Google Drive sync (optional)**
   - When certain document types reach a “final” state (user confirmed), call `googleDriveWrite` with `create_doc` to mirror them into Drive.
   - Store the Drive file ID / link in `Document.metadata` for cross‑reference.

### Phase 4 – Retrieval & search (optional)

Once you have enough documents, you can:

- Add embeddings + vector search over `Document.content`.
- Expose a `searchDocuments` tool that:
  - Takes `query`, `type?`, `episodeSlug?`.
  - Returns the best‑matching documents (ids + snippets).
- Have agents recall relevant prior work even across different chats.

## 8. Summary

You already have a robust, AI‑driven document and artifact system wired into AI SDK v5. The key to unlocking Ida/Astra/Ember as “real producers” is:

- Give documents **domain meaning** via `metadata.type` and podcast/episode links.
- Add **discovery tools** (`findDocuments`, `loadDocument`) so agents can resume work instead of starting from scratch.
- Expose a **Documents dashboard** so users see and manage those artifacts outside of the transient chat context.
- Incrementally refine workflows (guest dossiers, production schedules, post‑production packs) using the tools you already have: Firecrawl, Google Drive, Calendar, and the artifact handlers.

This plan stays idiomatic to AI SDK v5 (tool‑first, streaming, append‑only document history) and reuses your existing artifacts, DB schema, and tools as much as possible.*** End Patch```}assistant покупкеwechslungs to=functions.apply_patchензияPLOYER to=functions.apply_patch ***!
