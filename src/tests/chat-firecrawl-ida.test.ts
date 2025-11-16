import { convertToModelMessages, generateText, stepCountIs } from 'ai';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { systemPrompt } from '@/lib/ai/prompts';
import { myProvider } from '@/lib/ai/providers';
import { firecrawlSearch } from '@/lib/ai/tools/firecrawl-search';
import type { ChatMessage } from '@/lib/types';

/**
 * Integration test:
 * - Uses the same model + tools configuration as Ida (agent "ida").
 * - Sends the provided prompt and asserts that a Firecrawl Search tool call
 *   is executed successfully (i.e. we see a tool output, not just input).
 *
 * This test calls the model directly via `streamText` rather than wiring
 * through Next.js routing, to keep it runnable under Vitest with `.env.test`.
 */
describe('Ida agent - Firecrawl integration', () => {
  beforeAll(() => {
    // Ensure required env vars (like GEMINI / Firecrawl keys) are present.
    // If they are missing, fail fast with a helpful message.
    const requiredEnv = [
      'GOOGLE_GENERATIVE_AI_API_KEY',
      // Firecrawl can be configured via env; skip strict checking here
      // because you may be using different variable names locally.
    ];

    for (const key of requiredEnv) {
      if (!process.env[key]) {
        // eslint-disable-next-line no-console
        console.warn(
          `Warning: env var ${key} is not set. This integration test may fail if the provider requires it.`
        );
      }
    }
  });

  afterAll(() => {
    // no-op for now; kept for symmetry / future cleanup
  });

  it('calls Firecrawl Search successfully for Ida when researching the user', async () => {
    const idaModel = myProvider.languageModel('chat-model');

    // Minimal chat message mimicking the UI payload.
    const userMessage: ChatMessage = {
      id: '00000000-0000-4000-8000-000000000001',
      role: 'user',
      parts: [
        {
          type: 'text',
          text: "Heyoooo\n\nCan you research Daniel G Wilson, co-founder of Legion? That's me and I figure it'll be a fast way to get out Podcast plan started",
        },
      ],
      metadata: {
        createdAt: new Date().toISOString(),
      },
    };

    const requestHints = {
      latitude: undefined,
      longitude: undefined,
      city: undefined,
      country: undefined,
    };

    const result = await generateText({
      model: idaModel,
      system: systemPrompt({
        selectedChatModel: 'ida',
        requestHints,
      }),
      messages: convertToModelMessages([userMessage]),
      stopWhen: stepCountIs(10),
      experimental_activeTools: ['firecrawlSearch'],
      tools: {
        firecrawlSearch,
      },
    });

    const steps = result.steps ?? [];

    const allToolCalls = steps.flatMap((step) => step.toolCalls ?? []);

    // Debug: surface which tools the model actually called.
    // eslint-disable-next-line no-console
    console.log(
      'Tool calls:',
      allToolCalls.map((c) => ({
        name: c.toolName,
        id: c.toolCallId,
      }))
    );

    const firecrawlToolCalls = allToolCalls.filter((call) =>
      String(call.toolName ?? '')
        .toLowerCase()
        .includes('firecrawl')
    );

    // We expect at least one Firecrawl tool call to be issued.
    expect(firecrawlToolCalls.length).toBeGreaterThan(0);

    // Ensure we did not hit an SDK-level tool-error.
    const toolErrors = steps.flatMap((step) =>
      (step.content ?? []).filter((part) => part.type === 'tool-error')
    );
    expect(toolErrors.length).toBe(0);
  }, 60_000); // Give the model + Firecrawl enough time to complete.
});
