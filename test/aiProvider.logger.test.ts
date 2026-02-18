import { describe, it, expect, vi } from 'vitest';
import { generateAISummary, AISummaryOptions } from '../src/aiProvider';
import * as aiProvider from '../src/aiProvider';

describe('Logger fix verification', () => {
  it('should preserve logger methods when they are on the prototype', async () => {
    // Create a logger where methods are on the prototype
    const loggerProto = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    };
    const protoInstance = Object.create(loggerProto);

    // Verify that the protoInstance itself doesn't have the properties
    expect(Object.prototype.hasOwnProperty.call(protoInstance, 'error')).toBe(false);
    expect(protoInstance.error).toBeDefined();

    // Mock getOpenAISummary to check the logger it receives
    const getOpenAISummarySpy = vi
      .spyOn(aiProvider, 'getOpenAISummary')
      .mockImplementation(async ({ logger }) => {
        logger.error('test error');
        return 'summary';
      });

    const opts: AISummaryOptions = {
      logger: protoInstance,
      provider: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4',
      prompt: 'p',
      text: 't',
      cacheDir: undefined,
    };

    await generateAISummary(opts);

    expect(loggerProto.error).toHaveBeenCalled();
    getOpenAISummarySpy.mockRestore();
  });
});
