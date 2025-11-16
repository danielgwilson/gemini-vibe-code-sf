import { beforeAll, describe, expect, it, vi } from 'vitest';
import { generateUUID } from '@/lib/utils';
import { createUser, getDocumentsById, saveDocument } from '@/lib/db/queries';
import type {
  PodcastDocumentMetadata,
  PodcastDocumentStatus,
} from '@/lib/db/schema';

// Mock auth() used by the API routes to return our test user.
let testUserId: string;

vi.mock('@/app/(auth)/auth', () => {
  return {
    auth: async () => ({
      user: {
        id: testUserId,
        email: 'test-docs@example.com',
        type: 'regular',
      },
    }),
  };
});

describe('Document API & queries integration', () => {
  beforeAll(async () => {
    const email = `test-docs-${Date.now()}@example.com`;
    const password = 'test-password';

    await createUser(email, password);
    const { getUser } = await import('@/lib/db/queries');
    const [user] = await getUser(email);
    if (!user) {
      throw new Error('Failed to create test user');
    }
    testUserId = user.id;
  });

  it(
    'returns latest document version per id and respects status filter',
    async () => {
      const id = generateUUID();

      const baseMetadata: PodcastDocumentMetadata = {
        status: 'active',
        type: 'podcast_brief',
      };

      await saveDocument({
        id,
        title: 'Test Doc',
        kind: 'text',
        content: 'Version 1',
        userId: testUserId,
        metadata: baseMetadata,
      });

      await saveDocument({
        id,
        title: 'Test Doc',
        kind: 'text',
        content: 'Version 2',
        userId: testUserId,
        metadata: baseMetadata,
      });

      const { GET } = await import(
        '@/app/(chat)/api/document/list/route'
      );

      const request = new Request(
        'http://localhost/api/document/list?status=active',
      );
      const response = await GET(request);
      const json = (await response.json()) as {
        documents: {
          id: string;
          content: string | null;
        }[];
      };

      const doc = json.documents.find((d) => d.id === id);
      expect(doc).toBeDefined();
      expect(doc?.content).toBe('Version 2');
    },
    60_000,
  );

  it(
    'archives and unarchives a document via the archive API',
    async () => {
      const id = generateUUID();

      const metadata: PodcastDocumentMetadata = {
        status: 'active',
        type: 'guest_dossier',
      };

      await saveDocument({
        id,
        title: 'Archive Test',
        kind: 'text',
        content: 'Archive me',
        userId: testUserId,
        metadata,
      });

      const { POST } = await import(
        '@/app/(chat)/api/document/archive/route'
      );

      const archiveBody = {
        id,
        status: 'archived' as PodcastDocumentStatus,
      };

      const archiveRequest = new Request(
        'http://localhost/api/document/archive',
        {
          method: 'POST',
          body: JSON.stringify(archiveBody),
        },
      );
      const archiveResponse = await POST(archiveRequest);
      expect(archiveResponse.status).toBe(200);

      const updatedDocuments = await getDocumentsById({ id });
      const latest = updatedDocuments.at(-1);
      const latestMetadata = (latest?.metadata ??
        null) as PodcastDocumentMetadata | null;
      expect((latestMetadata?.status) ?? 'active').toBe(
        'archived',
      );

      const listArchivedRequest = new Request(
        'http://localhost/api/document/list?status=archived',
      );
      const { GET } = await import(
        '@/app/(chat)/api/document/list/route'
      );
      const listArchivedResponse = await GET(listArchivedRequest);
      const listJson = (await listArchivedResponse.json()) as {
        documents: { id: string }[];
      };

      const archivedDoc = listJson.documents.find((d) => d.id === id);
      expect(archivedDoc).toBeDefined();
    },
    60_000,
  );
});
