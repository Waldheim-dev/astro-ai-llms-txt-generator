import { describe, it, expect } from 'vitest';
import {
  getMainSummaryPrompt,
  getDetailsPrompt,
  getFileListPrompt,
  getOptionalSectionPrompt,
  getFullLlmsTxtPrompt
} from '../src/prompt';

describe('Prompt templates', () => {
  it('getMainSummaryPrompt returns correct prompts', () => {
    expect(getMainSummaryPrompt()).toContain('Markdown H1');
    expect(getMainSummaryPrompt('de')).toContain('Markdown-H1');
    expect(getMainSummaryPrompt('fr')).toContain('H1 Markdown');
  });

  it('getDetailsPrompt returns correct prompts', () => {
    expect(getDetailsPrompt()).toContain('Markdown paragraph');
    expect(getDetailsPrompt('de')).toContain('Markdown-Absatz');
    expect(getDetailsPrompt('fr')).toContain('paragraphe Markdown');
  });

  it('getFileListPrompt returns correct prompts', () => {
    expect(getFileListPrompt()).toContain('Markdown H2');
    expect(getFileListPrompt('de')).toContain('Markdown-H2');
    expect(getFileListPrompt('fr')).toContain('H2 Markdown');
    expect(getFileListPrompt('en', 'Docs')).toContain("section name ('Docs')");
  });

  it('getOptionalSectionPrompt returns correct prompts', () => {
    expect(getOptionalSectionPrompt()).toContain('Optional');
    expect(getOptionalSectionPrompt('de')).toContain('Optional');
    expect(getOptionalSectionPrompt('fr')).toContain('Optional');
  });

  it('getFullLlmsTxtPrompt returns correct prompts', () => {
    expect(getFullLlmsTxtPrompt()).toContain('llms.txt');
    expect(getFullLlmsTxtPrompt('de')).toContain('llms.txt');
    expect(getFullLlmsTxtPrompt('fr')).toContain('llms.txt');
  });
});
