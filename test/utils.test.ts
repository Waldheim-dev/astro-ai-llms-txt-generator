import { describe, it, expect } from 'vitest';
import { sha256, cleanPath } from '../src/utils';

describe('utils', () => {
  it('calculates sha256 hash', () => {
    expect(sha256('test')).toMatch(/[a-f0-9]{64}/);
  });

  it('cleans path to use forward slashes', () => {
    expect(cleanPath('C:\\Users\\Test\\index.html')).toBe('C:/Users/Test/index.html');
    expect(cleanPath('foo/bar\\baz')).toBe('foo/bar/baz');
  });
});
