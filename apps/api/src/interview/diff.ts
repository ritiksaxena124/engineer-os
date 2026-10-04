export interface DiffLine {
  sign: ' ' | '-' | '+';
  text: string;
}

/**
 * Line diff by longest common subsequence. Scenario files are short, so the table is affordable and
 * the result is exact, which matters because the candidate reads this to see what their prompt bought.
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split('\n');
  const b = after.split('\n');
  const width = b.length + 1;
  const table = new Uint32Array((a.length + 1) * width);
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      table[i * width + j] =
        a[i] === b[j]
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }
  const raw: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      raw.push({ sign: ' ', text: a[i] });
      i += 1;
      j += 1;
    } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
      raw.push({ sign: '-', text: a[i] });
      i += 1;
    } else {
      raw.push({ sign: '+', text: b[j] });
      j += 1;
    }
  }
  while (i < a.length) {
    raw.push({ sign: '-', text: a[i] });
    i += 1;
  }
  while (j < b.length) {
    raw.push({ sign: '+', text: b[j] });
    j += 1;
  }
  return collapseUnchanged(raw);
}

/** Long unchanged runs collapse to a marker so the changed region stays on screen. */
export function collapseUnchanged(lines: DiffLine[], context = 3): DiffLine[] {
  const out: DiffLine[] = [];
  const changed = new Set<number>();
  lines.forEach((line, index) => {
    if (line.sign === ' ') return;
    for (let offset = -context; offset <= context; offset += 1) changed.add(index + offset);
  });
  let hidden = 0;
  lines.forEach((line, index) => {
    if (changed.has(index)) {
      if (hidden > 0) {
        out.push({ sign: ' ', text: `... ${hidden} unchanged` });
        hidden = 0;
      }
      out.push(line);
    } else hidden += 1;
  });
  if (hidden > 0) out.push({ sign: ' ', text: `... ${hidden} unchanged` });
  return out;
}

export function diffStats(lines: DiffLine[]): { added: number; removed: number } {
  return {
    added: lines.filter((line) => line.sign === '+').length,
    removed: lines.filter((line) => line.sign === '-').length,
  };
}
