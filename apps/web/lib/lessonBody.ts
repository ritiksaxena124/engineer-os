/**
 * Lesson bodies are plain text with two authoring directives: a fenced ```svg block that the
 * lesson page inlines as a diagram, and a `[[source: label | url]]` line that renders as further
 * reading. Both ride inside the section body so the content model stays a single string column.
 */
export type LessonNode =
  | { type: 'paragraph'; text: string }
  | { type: 'figure'; svg: string }
  | { type: 'source'; label: string; url: string };

const SOURCE = /^\[\[source:\s*([^|\]]+?)\s*\|\s*(https?:\/\/[^\]\s]+)\s*\]\]$/;

export function parseLessonBody(body: string): LessonNode[] {
  const lines = body.split('\n');
  const nodes: LessonNode[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === '') continue;

    if (line.trim() === '```svg') {
      const markup: string[] = [];
      index += 1;
      while (index < lines.length && lines[index].trim() !== '```') {
        markup.push(lines[index]);
        index += 1;
      }
      nodes.push({ type: 'figure', svg: markup.join('\n') });
      continue;
    }

    const source = SOURCE.exec(line.trim());
    if (source) {
      nodes.push({ type: 'source', label: source[1], url: source[2] });
      continue;
    }

    nodes.push({ type: 'paragraph', text: line });
  }

  return nodes;
}
