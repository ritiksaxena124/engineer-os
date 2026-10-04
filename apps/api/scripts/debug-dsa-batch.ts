/**
 * Print which assertion inside a batch check is the one that fails.
 *
 *   bun run scripts/debug-dsa-batch.ts 14a [problem name filter]
 *
 * A check is one expression that has to be true, so "does not satisfy its check" points at nothing.
 * The checks are written as `(() => { ...; return A && B && C; })()`, so this rewrites the final
 * `return` to carry one conjunct at a time and reports each verdict.
 */
import { fileURLToPath } from 'node:url';

const id = process.argv[2];
if (!id) {
  console.error('usage: bun run scripts/debug-dsa-batch.ts <batch id> [problem name filter]');
  process.exit(2);
}

const batch = await import(fileURLToPath(new URL(`../prisma/content/dsa-steps/step${id}.ts`, import.meta.url)));
const expects = batch.expects as Record<string, string>;
const filter = process.argv[3];

/** Split on && that is not inside (), [], {} or a string literal. */
function topLevelConjuncts(expression: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  for (let i = 0; i < expression.length; i += 1) {
    const char = expression[i];
    if (quote) {
      if (char === '\\') i += 1;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '(' || char === '[' || char === '{') depth += 1;
    else if (char === ')' || char === ']' || char === '}') depth -= 1;
    else if (depth === 0 && char === '&' && expression[i + 1] === '&') {
      parts.push(expression.slice(start, i));
      i += 1;
      start = i + 1;
    }
  }
  parts.push(expression.slice(start));
  return parts.map((part) => part.trim()).filter((part) => part.length > 0);
}

function evaluate(solution: string, expression: string): unknown {
  return new Function(
    `${solution}\nconst logged = [];\nconst console = { log: (value) => logged.push(String(value)) };\nreturn (${expression});`,
  )();
}

for (const problem of batch.problems) {
  if (filter && !problem.name.toLowerCase().includes(filter.toLowerCase())) continue;
  const expression = expects[problem.name];
  if (!expression) {
    console.log(`\n${problem.name}: NO CHECK`);
    continue;
  }
  let verdict: unknown;
  try {
    verdict = evaluate(problem.solution, expression);
  } catch (cause) {
    console.log(`\n${problem.name}: THROWS — ${(cause as Error).message}`);
    continue;
  }
  if (verdict === true) {
    console.log(`${problem.name}: ok`);
    continue;
  }

  const at = expression.lastIndexOf('return ');
  const tail = expression.slice(at + 7);
  const end = tail.lastIndexOf('; })()');
  if (at === -1 || end === -1) {
    console.log(`\n${problem.name}: false (${String(verdict)}) — cannot split a non-IIFE check`);
    continue;
  }
  const body = tail.slice(0, end);
  const parts = topLevelConjuncts(body);
  console.log(`\n${problem.name}: false — ${parts.length} top-level conjuncts`);
  parts.forEach((part, index) => {
    const single = `${expression.slice(0, at + 7)}${part}${tail.slice(end)}`;
    let value: unknown;
    try {
      value = evaluate(problem.solution, single);
    } catch (cause) {
      value = `throws: ${(cause as Error).message}`;
    }
    if (value !== true) console.log(`  [${index}] FAIL = ${String(value).slice(0, 80)} :: ${part.slice(0, 160)}`);
  });
}
