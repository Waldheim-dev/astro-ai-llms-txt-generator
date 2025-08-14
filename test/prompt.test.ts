import { describe, it, expect } from 'vitest';
import { getPrompt } from '../src/prompt';

describe('getPrompt', () => {
  it('returns English prompt by default', () => {
    expect(getPrompt()).toBe('Summarize the following website content for LLMs in 2 concise sentences:');
  });
  it('returns German prompt', () => {
    expect(getPrompt('de')).toBe('Fasse den folgenden Webseiteninhalt für LLMs in 2 Sätzen prägnant zusammen:');
  });
  it('returns French prompt', () => {
    expect(getPrompt('fr')).toBe('Résumez le contenu de la page Web suivante pour les LLMs en 2 phrases concises :');
  });
});
