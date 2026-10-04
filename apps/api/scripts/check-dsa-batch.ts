/**
 * Verify one authored batch of sheet problems before it is merged into the bank.
 *
 *   bun run scripts/check-dsa-batch.ts 14
 *   bun run scripts/check-dsa-batch.ts 15a
 *
 * A batch is a file at prisma/content/dsa-steps/step<id>.ts exporting `concepts`, `problems` and
 * `expects`. This is the same bar the bank's own content test holds every row to — the sheet says
 * the name and difficulty, every cited concept resolves, and the shipped solution actually runs
 * and returns true for the expression that claims to prove it. Run it until it prints "clean".
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ALL_TOPICS } from '../prisma/content/curriculum';
import { DSA_CONCEPTS, DSA_PROBLEMS, sheetKey } from '../prisma/content/dsa-problems';
import { readSheet } from './read-dsa-sheet';

const id = process.argv[2];
if (!id) {
  console.error('usage: bun run scripts/check-dsa-batch.ts <step id, e.g. 14 or 15a>');
  process.exit(2);
}

const stepsDir = fileURLToPath(new URL('../prisma/content/dsa-steps', import.meta.url));
const modulePath = fileURLToPath(new URL(`../prisma/content/dsa-steps/step${id}.ts`, import.meta.url));
const batch = await import(modulePath);

/**
 * Batches cite each other freely because they merge into one concept table, so a concept defined by
 * a sibling batch is as real as one defined here — but defining it twice is a merge conflict.
 */
const siblingConcepts = new Map<string, string>();
for (const file of readdirSync(stepsDir)) {
  if (!file.startsWith('step') || !file.endsWith('.ts') || file === `step${id}.ts`) continue;
  const sibling = await import(new URL(`../prisma/content/dsa-steps/${file}`, import.meta.url));
  for (const slug of Object.keys(sibling.concepts ?? {})) siblingConcepts.set(slug, file.replace('.ts', ''));
}

const sheet = readSheet();
const rows = new Map(sheet.map((row) => [sheetKey(row.step, row.name), row]));
const concepts = batch.concepts as Record<string, { slug: string; name: string; detail: string; terms: string[] }>;
const expects = batch.expects as Record<string, string>;
/**
 * A merged batch is part of the bank already, and re-running it must stay clean: its own rows and
 * concepts are subtracted before the duplicate checks, so what is left is genuinely someone else.
 */
const ownKeys = new Set((batch.problems as typeof DSA_PROBLEMS).map((problem) => sheetKey(problem.step, problem.name)));
const ownNames = new Set((batch.problems as typeof DSA_PROBLEMS).map((problem) => problem.name));
const ownConcepts = new Set(Object.keys(concepts));
const authored = new Set(
  DSA_PROBLEMS.filter((problem) => !ownKeys.has(sheetKey(problem.step, problem.name))).map((problem) => sheetKey(problem.step, problem.name)),
);
/** The question slug and the executable check are both keyed by name alone, so a name is global. */
const authoredNames = new Set(DSA_PROBLEMS.map((problem) => problem.name).filter((name) => !ownNames.has(name)));
const topics = new Set(ALL_TOPICS.filter((topic) => topic.phaseKey === 'p03').map((topic) => topic.slug));

const problems: string[] = [];

function run(solution: string, expression: string): boolean {
  return new Function(
    `${solution}\nconst logged = [];\nconst console = { log: (value) => logged.push(String(value)) };\nreturn (${expression});`,
  )() as boolean;
}

for (const [key, concept] of Object.entries(concepts ?? {})) {
  if (key !== concept.slug) problems.push(`concept "${key}": slug says "${concept.slug}"`);
  if (DSA_CONCEPTS[key as keyof typeof DSA_CONCEPTS] && !ownConcepts.has(key)) problems.push(`concept "${key}": already defined by the core bank`);
  if (siblingConcepts.has(key)) problems.push(`concept "${key}": also defined by ${siblingConcepts.get(key)}, so the merge would collide`);
  if (concept.name.trim().length < 5) problems.push(`concept "${key}": name missing`);
  if (concept.detail.trim().length < 20) problems.push(`concept "${key}": detail too thin to be guidance`);
  if (concept.terms.length === 0) problems.push(`concept "${key}": no terms, so never matchable`);
}

const seen = new Set<string>();
const names = new Set<string>();
for (const problem of batch.problems as typeof DSA_PROBLEMS) {
  const at = `step ${problem.step} "${problem.name}"`;
  const key = sheetKey(problem.step, problem.name);

  const row = rows.get(key);
  if (!row) problems.push(`${at}: not a row on the sheet`);
  else if (row.difficulty !== problem.difficulty) problems.push(`${at}: sheet says ${row.difficulty}, batch says ${problem.difficulty}`);
  if (authored.has(key)) problems.push(`${at}: already in the bank`);
  if (authoredNames.has(problem.name)) problems.push(`${at}: the bank already carries this name, and both the slug and the check are keyed by name — one would overwrite the other`);
  if (names.has(problem.name)) problems.push(`${at}: this name is used by two rows of the batch`);
  if (seen.has(key)) problems.push(`${at}: listed twice in this batch`);
  seen.add(key);
  names.add(problem.name);

  if (!topics.has(problem.topicSlug)) problems.push(`${at}: topic "${problem.topicSlug}" is not a p03 topic`);
  if (problem.concepts.length === 0) problems.push(`${at}: no concepts, so nothing to grade`);
  for (const cited of problem.concepts) {
    if (!concepts[cited] && !siblingConcepts.has(cited) && !DSA_CONCEPTS[cited as keyof typeof DSA_CONCEPTS]) {
      problems.push(`${at}: cites a concept that does not exist (${cited})`);
    }
  }

  if (problem.stem.trim().length < 15) problems.push(`${at}: stem too short`);
  if (problem.brief.trim().length < 20) problems.push(`${at}: brief too short`);
  if (problem.walkthrough.length <= 150) problems.push(`${at}: walkthrough must explain the mechanism (>150 chars)`);
  if (problem.followUps.length < 3) problems.push(`${at}: needs at least three follow-ups`);
  if (problem.modify.length <= 20) problems.push(`${at}: modify too thin`);

  const expression = expects?.[problem.name];
  if (!expression) {
    problems.push(`${at}: no executable check`);
  } else {
    // A check that never calls the solution proves nothing about it, so require the call and at
    // least one assertion: `true === true` is what an author writes when they have not run anything.
    const declared = [...problem.solution.matchAll(/(?:function|class)\s+([A-Za-z_$][\w$]*)/g)].map((match) => match[1]);
    const used = declared.some((name) => new RegExp(`\\b${name}\\s*[.(]`).test(expression));
    if (!used) problems.push(`${at}: its check never calls ${declared.join('/') || 'anything the solution declares'}, so it cannot fail`);
    if ((expression.match(/&&|[=!]==?/g) ?? []).length < 1) problems.push(`${at}: no assertion — compare the result against what the explanation claims`);
    try {
      if (run(problem.solution, expression) !== true) problems.push(`${at}: the shipped solution does not satisfy its check`);
    } catch (cause) {
      problems.push(`${at}: the solution throws — ${(cause as Error).message}`);
    }
  }
}

const missing = sheet
  .filter((row) => Number(String(id).slice(0, 2)) === row.step && !seen.has(sheetKey(row.step, row.name)) && !authored.has(sheetKey(row.step, row.name)))
  .map((row) => `step ${row.step} "${row.name}" (${row.difficulty}) is on the sheet and not in this batch`);

console.log(`${seen.size} problems in batch ${id}`);
if (problems.length > 0) {
  console.error(`\n${problems.length} problems:\n${problems.join('\n')}`);
  process.exit(1);
}
if (missing.length > 0 && process.argv[3] !== '--partial') {
  console.error(`\nnot covered yet:\n${missing.join('\n')}`);
  console.error('\n(pass --partial while authoring a step in more than one batch)');
  process.exit(1);
}
console.log('clean');
