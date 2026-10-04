import { describe, expect, test } from 'bun:test';
import { fitPrompt, parseRequired } from '../src/interview/promptFit';

const required = 'ttl|expiry|expiration ; invalidate|clear the cache|purge ; write path|write-path|on write';

describe('interview prompt fit', () => {
  test('a group is satisfied by any of its terms', () => {
    expect(parseRequired(required).map((group) => group.length)).toEqual([3, 3, 3]);
    const fit = fitPrompt('the cache entry has no ttl and writes never invalidate it, so fix the write path', required);
    expect(fit.satisfied).toBe(true);
    expect(fit.missing).toEqual([]);
  });

  test('an unsatisfied group is named by its first term, which is what the candidate is told', () => {
    const fit = fitPrompt('add an expiry to the cached order', required);
    expect(fit.satisfied).toBe(false);
    expect(fit.missing).toEqual(['invalidate', 'write path']);
  });

  test('terms match on word edges, not inside other words', () => {
    expect(fitPrompt('the monkey is cached', 'ttl|expiry').satisfied).toBe(false);
    expect(fitPrompt('set a ttl', 'ttl|expiry').satisfied).toBe(true);
  });

  test('a term stands for the stem of a longer word, because candidates write in tenses', () => {
    expect(fitPrompt('the cancelled order is still shipping', 'cancel|write path').satisfied).toBe(true);
    expect(fitPrompt('it keeps retrying the request', 'retry|attempt').satisfied).toBe(true);
    expect(fitPrompt('the keyboard is cached', 'key').satisfied).toBe(true);
  });

  test('punctuation, case and hyphens do not matter', () => {
    expect(fitPrompt('  TTL, then INVALIDATE! ', required).missing).toEqual(['write path']);
    expect(fitPrompt('invalidate and set the ttl on the WRITE-PATH', required).satisfied).toBe(true);
  });

  test('an empty requirement can never be satisfied, so a mis-authored fix cannot pass silently', () => {
    expect(fitPrompt('anything at all', '').satisfied).toBe(false);
    expect(fitPrompt('anything at all', []).satisfied).toBe(false);
  });
});
