import { describe, expect, test } from 'bun:test';
import { parseLessonBody } from '@/lib/lessonBody';

describe('lesson body parsing', () => {
  test('prose becomes one paragraph per line and blank lines disappear', () => {
    expect(parseLessonBody('the request lands\n\nthe worker picks it up')).toEqual([
      { type: 'paragraph', text: 'the request lands' },
      { type: 'paragraph', text: 'the worker picks it up' },
    ]);
  });

  test('a fenced svg block becomes a single figure with its markup intact', () => {
    const nodes = parseLessonBody(
      'hold this picture:\n```svg\n<svg viewBox="0 0 640 200">\n  <rect x="8" y="8" width="120" height="48" />\n</svg>\n```\nthe box on the left is the API',
    );

    expect(nodes.map((node) => node.type)).toEqual(['paragraph', 'figure', 'paragraph']);
    if (nodes[1].type === 'figure') {
      expect(nodes[1].svg).toBe('<svg viewBox="0 0 640 200">\n  <rect x="8" y="8" width="120" height="48" />\n</svg>');
    }
  });

  test('the further-reading directive becomes a link, not a sentence of brackets', () => {
    const [node] = parseLessonBody(
      '[[source: Requirements clarification · fanout.sh | https://fanout.sh/system/archive/requirements-clarification]]',
    );

    expect(node).toEqual({
      type: 'source',
      label: 'Requirements clarification · fanout.sh',
      url: 'https://fanout.sh/system/archive/requirements-clarification',
    });
  });

  test('a directive missing its url stays visible as prose', () => {
    expect(parseLessonBody('[[source: half an author mistake]]')).toEqual([
      { type: 'paragraph', text: '[[source: half an author mistake]]' },
    ]);
  });
});
