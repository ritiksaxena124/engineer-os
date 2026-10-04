import { describe, expect, test } from 'bun:test';
import { collapseUnchanged, diffLines, diffStats } from '../src/interview/diff';

describe('interview fix diff', () => {
  test('a one-line change prints the removed line and the added line', () => {
    const diff = diffLines('const a = 1;\nconst b = 2;\n', 'const a = 1;\nconst b = 3;\n');
    expect(diff.filter((line) => line.sign === '-').map((line) => line.text)).toEqual(['const b = 2;']);
    expect(diff.filter((line) => line.sign === '+').map((line) => line.text)).toEqual(['const b = 3;']);
  });

  test('no change means no plus or minus lines', () => {
    const diff = diffLines('x\n', 'x\n');
    expect(diffStats(diff)).toEqual({ added: 0, removed: 0 });
  });

  test('inserted lines are additions, removed lines are deletions', () => {
    expect(diffStats(diffLines('a\nc\n', 'a\nb\nc\n'))).toEqual({ added: 1, removed: 0 });
    expect(diffStats(diffLines('a\nb\nc\n', 'a\nc\n'))).toEqual({ added: 0, removed: 1 });
  });

  test('an unchanged tail collapses to a marker instead of scrolling the change away', () => {
    const before = ['head();', ...Array.from({ length: 20 }, (_, index) => `keep${index}();`)].join('\n');
    const after = ['head2();', ...Array.from({ length: 20 }, (_, index) => `keep${index}();`)].join('\n');
    const diff = diffLines(before, after);
    expect(diff.some((line) => line.text.includes('unchanged'))).toBe(true);
    expect(diff.length).toBeLessThan(10);
  });

  test('collapse keeps context on both sides of a change', () => {
    const lines = [
      ...Array.from({ length: 10 }, (_, index) => ({ sign: ' ' as const, text: `l${index}` })),
      { sign: '-' as const, text: 'old' },
      { sign: '+' as const, text: 'new' },
      ...Array.from({ length: 10 }, (_, index) => ({ sign: ' ' as const, text: `r${index}` })),
    ];
    const collapsed = collapseUnchanged(lines, 2);
    const texts = collapsed.map((line) => line.text);
    expect(texts).toEqual(['... 8 unchanged', 'l8', 'l9', 'old', 'new', 'r0', 'r1', '... 8 unchanged']);
    expect(collapsed.filter((line) => line.sign !== ' ')).toHaveLength(2);
  });
});
