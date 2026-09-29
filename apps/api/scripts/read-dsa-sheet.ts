/**
 * Striver's A2Z sheet is the source list for the DSA drill bank, so the app never re-types it:
 * this reads the workbook, checks every authored problem against it (same name, same difficulty,
 * same step) and reports how much of the 476 is actually authored yet.
 *
 * The workbook's LeetCode column is not treated as data — rows link to unrelated problems, so the
 * app carries the problem, not a link it cannot trust.
 *
 *   bun run scripts/read-dsa-sheet.ts list 3
 *   bun run scripts/read-dsa-sheet.ts verify
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';
import { DSA_PROBLEMS, sheetKey } from '../prisma/content/dsa-problems';

const SHEET = fileURLToPath(new URL('../../../Strivers_A2Z_DSA_Sheet_476_Questions.xls', import.meta.url));
const SHEET_NAME = 'All 476 Problems';

export interface SheetRow {
  /** the sheet's own 1-based id, so a report can point back at the row someone is reading */
  id: number;
  step: number;
  subtopic: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  url: string | null;
}

function readSheet(): SheetRow[] {
  const workbook = XLSX.read(readFileSync(SHEET), { type: 'buffer', cellFormula: true, cellHyperlinks: true });
  const page = workbook.Sheets[SHEET_NAME];
  if (!page) throw new Error(`"${SHEET_NAME}" is not in ${SHEET}`);

  const rows: SheetRow[] = [];
  for (let index = 5; page[`A${index}`]; index += 1) {
    const name = String(page[`E${index}`]?.v ?? '').trim();
    if (!name) continue;
    rows.push({
      id: Number(page[`A${index}`]?.v),
      step: Number(/^Step (\d+)/.exec(String(page[`C${index}`]?.v ?? ''))?.[1] ?? NaN),
      subtopic: String(page[`D${index}`]?.v ?? '').trim(),
      name,
      difficulty: String(page[`F${index}`]?.v ?? 'Easy').trim() as SheetRow['difficulty'],
      url: linkOf(page[`G${index}`]),
    });
  }
  return rows;
}

/** The workbook stores the judge link as a HYPERLINK(...) formula, not as a cell value. */
function linkOf(cell: XLSX.CellObject | undefined): string | null {
  if (!cell) return null;
  const target = cell.l?.Target ?? /HYPERLINK\("([^"]+)"/.exec(String(cell.f ?? ''))?.[1];
  return target ? target : null;
}

const sheet = readSheet();
const byKey = new Map(sheet.map((row) => [sheetKey(row.step, row.name), row]));
const command = process.argv[2] ?? 'verify';

if (command === 'list') {
  const wanted = Number(process.argv[3] ?? NaN);
  const subtopic = process.argv[4];
  for (const row of sheet) {
    if (!Number.isNaN(wanted) && row.step !== wanted) continue;
    if (subtopic && row.subtopic !== subtopic) continue;
    console.log(`${row.step}\t${row.subtopic}\t${row.difficulty}\t${row.name}\t${row.url ?? '-'}`);
  }
  process.exit(0);
}

const problems: string[] = [];
for (const authored of DSA_PROBLEMS) {
  const row = byKey.get(sheetKey(authored.step, authored.name));
  if (!row) {
    problems.push(`"${authored.name}" (step ${authored.step}) is not in the sheet — the app cannot claim a problem the list does not have`);
    continue;
  }
  if (row.difficulty !== authored.difficulty) {
    problems.push(`"${authored.name}": sheet says ${row.difficulty}, the app says ${authored.difficulty}`);
  }
}

const authoredKeys = new Set(DSA_PROBLEMS.map((entry) => sheetKey(entry.step, entry.name)));
const perStep = new Map<number, { total: number; done: number }>();
for (const row of sheet) {
  const bucket = perStep.get(row.step) ?? { total: 0, done: 0 };
  bucket.total += 1;
  if (authoredKeys.has(sheetKey(row.step, row.name))) bucket.done += 1;
  perStep.set(row.step, bucket);
}

console.log(`${DSA_PROBLEMS.length} authored / ${sheet.length} on the sheet`);
for (const [step, bucket] of [...perStep].sort((a, b) => a[0] - b[0])) {
  console.log(`  step ${String(step).padStart(2)}: ${bucket.done}/${bucket.total}`);
}

if (problems.length > 0) {
  console.error(`\nthe sheet and the app disagree:\n${problems.join('\n')}`);
  process.exit(1);
}
