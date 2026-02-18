import { describe, it, expect, vi } from 'vitest';
import { sha256, cleanPath, debugLog } from '../src/utils';

describe('sha256', () => {
  it('returns correct SHA256 hash for a string', () => {
    expect(sha256('test')).toBe('9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});

describe('cleanPath', () => {
  it('normalizes backslashes and slashes', () => {
    expect(cleanPath('foo\\bar/baz')).toBe('foo/bar/baz');
    expect(cleanPath('C:\\Users\\Test\\index.html')).toBe('C:/Users/Test/index.html');
    expect(cleanPath('foo////bar\\\\baz')).toBe('foo/bar/baz');
  });
});

describe('debugLog', () => {
  const originalEnv = process.env.DEBUG_LLMS_TXT;
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  it('logs when DEBUG_LLMS_TXT=1', () => {
    process.env.DEBUG_LLMS_TXT = '1';
    debugLog('foo', 'bar');
    expect(logSpy).toHaveBeenCalledWith('[llms-txt]', 'foo', 'bar');
  });

  it('does not log when DEBUG_LLMS_TXT!=1', () => {
    process.env.DEBUG_LLMS_TXT = '0';
    debugLog('foo', 'bar');
    expect(logSpy).not.toHaveBeenCalled();
  });
});
