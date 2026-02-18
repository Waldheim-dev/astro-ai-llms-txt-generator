import { describe, it, expect } from 'vitest';
import {
  getMainSummaryPrompt,
  getDetailsPrompt,
  getFileListPrompt,
  getFullLlmsTxtPrompt,
} from '../src/prompt';

describe('Prompt templates', () => {
  it('getMainSummaryPrompt returns correct prompts', () => {
    expect(getMainSummaryPrompt()).toContain('Markdown H1');
    expect(getMainSummaryPrompt('de')).toContain('Antworte auf Deutsch');
  });

  it('getDetailsPrompt returns correct prompts', () => {
    expect(getDetailsPrompt()).toContain('llms.txt');
    expect(getDetailsPrompt('de')).toContain('Antworte auf Deutsch');
  });

  it('getFileListPrompt returns correct prompts', () => {
    expect(getFileListPrompt()).toContain('Markdown H2');
    expect(getFileListPrompt('de')).toContain('Antworte auf Deutsch');
  });

  it('getFullLlmsTxtPrompt returns correct prompts', () => {
    expect(getFullLlmsTxtPrompt()).toContain('llms.txt');
    expect(getFullLlmsTxtPrompt('de')).toContain('Antworte auf Deutsch');
  });
});
