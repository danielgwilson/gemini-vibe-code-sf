import { beforeAll, describe, expect, it, vi } from 'vitest';
import { createDocument } from '@/lib/ai/tools/create-document';

type TestUIMessagePart =
  | { type: 'data-kind'; data: string; transient: boolean }
  | { type: 'data-id'; data: string; transient: boolean }
  | { type: 'data-title'; data: string; transient: boolean }
  | { type: 'data-clear'; data: null; transient: boolean }
  | { type: 'data-finish'; data: null; transient: boolean };

describe('createDocument tool - integration with model', () => {
  const uiParts: TestUIMessagePart[] = [];

  beforeAll(() => {
    // Mock out saveDocument so we don't hit the real database in this test.
    vi.mock('@/lib/db/queries', async (importOriginal) => {
      const actual = await importOriginal<
        typeof import('@/lib/db/queries')
      >();
      return {
        ...actual,
        saveDocument: vi.fn(async () => {
          // no-op: pretend the document was saved successfully
          return;
        }),
      };
    });

    // Simple fake session for the tool
    const fakeSession = {
      user: {
        id: '00000000-0000-4000-8000-000000000000',
        email: 'test-createdoc@example.com',
        type: 'regular',
      },
    } as any;

    // Fake UI data stream that just records parts
    const fakeDataStream = {
      write: (part: TestUIMessagePart) => {
        uiParts.push(part);
      },
    } as any;

    // Prepare createDocument tool in the same way chat route would
    const createDocumentTool = createDocument({
      session: fakeSession,
      dataStream: fakeDataStream,
    });

    // Attach the tool instance to a global for use in tests
    (globalThis as any).__TEST_CREATE_DOCUMENT_TOOL__ = createDocumentTool;
  });

  it(
    'invokes createDocument tool and streams UI events when asked to create a guest dossier',
    async () => {
      // Use the same tool instance the chat route would wire up, but call it directly
      const createDocumentTool = (globalThis as any)
        .__TEST_CREATE_DOCUMENT_TOOL__;

      uiParts.length = 0;

      const result = await createDocumentTool.execute({
        title:
          'Guest dossier: Daniel G Wilson (co-founder of Legion) – podcast interview',
        kind: 'text',
      });

      // Assert data stream emitted the core UI parts in a reasonable order
      const kinds = uiParts.filter((p) => p.type === 'data-kind');
      const ids = uiParts.filter((p) => p.type === 'data-id');
      const titles = uiParts.filter((p) => p.type === 'data-title');
      const finishes = uiParts.filter((p) => p.type === 'data-finish');

      expect(kinds.length).toBeGreaterThan(0);
      expect(ids.length).toBeGreaterThan(0);
      expect(titles.length).toBeGreaterThan(0);
      expect(finishes.length).toBeGreaterThan(0);

      // Basic sanity checks on values
      const firstKind = kinds[0]!.data;
      expect(firstKind === 'text' || firstKind === 'code').toBe(true);

      const firstId = ids[0]!.data;
      expect(typeof firstId).toBe('string');
      expect(firstId.length).toBeGreaterThan(0);

      const firstTitle = titles[0]!.data;
      expect(typeof firstTitle).toBe('string');
      expect(firstTitle.toLowerCase()).toContain('daniel');

      // And the tool result should indicate a document was created
      expect(result).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        kind: 'text',
      });
    },
    90_000,
  );
});
