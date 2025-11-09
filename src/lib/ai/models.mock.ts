import type { ImageModel, LanguageModel } from 'ai';

const createMockModel = (): LanguageModel => {
  return {
    specificationVersion: 'v2',
    provider: 'mock',
    modelId: 'mock-model',
    defaultObjectGenerationMode: 'tool',
    supportedUrls: [],
    supportsImageUrls: false,
    supportsStructuredOutputs: false,
    doGenerate: async () => ({
      rawCall: { rawPrompt: null, rawSettings: {} },
      finishReason: 'stop',
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
      content: [{ type: 'text', text: 'Hello, world!' }],
      warnings: [],
    }),
    doStream: async () => ({
      stream: new ReadableStream({
        start(controller) {
          controller.enqueue({
            type: 'text-delta',
            id: 'mock-id',
            delta: 'Mock response',
          });
          controller.close();
        },
      }),
      rawCall: { rawPrompt: null, rawSettings: {} },
    }),
  } as unknown as LanguageModel;
};

const createMockImageModel = (): ImageModel => {
  // Create a 1x1 transparent PNG as base64
  const transparentPngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  return {
    specificationVersion: 'v2',
    provider: 'mock',
    modelId: 'mock-image-model',
    doGenerate: async () => ({
      rawCall: { rawPrompt: null, rawSettings: {} },
      image: Buffer.from(transparentPngBase64, 'base64'),
      usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
    }),
  } as unknown as ImageModel;
};

export const chatModel = createMockModel();
export const reasoningModel = createMockModel();
export const liteModel = createMockModel();
export const titleModel = createMockModel();
export const artifactModel = createMockModel();
export const imageModel = createMockImageModel();
