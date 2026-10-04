export interface PromptFit {
  satisfied: boolean;
  /** One entry per unsatisfied group, named by its first accepted term. */
  missing: string[];
  hit: string[];
}

/**
 * A group is accepted terms separated by '|', groups separated by ';'. Text rather than Json so
 * the term list reads inline in the authored scenario and needs no migration of a structured blob.
 */
export function parseRequired(required: string): string[][] {
  return required
    .split(';')
    .map((group) => group.split('|').map((term) => term.trim()).filter((term) => term.length > 0))
    .filter((group) => group.length > 0);
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function containsTerm(haystack: string, term: string): boolean {
  const needle = normalize(term);
  if (needle.length === 0) return false;
  // Anchored on the left so 'key' cannot hide inside 'monkey', but a term may stand for the stem of
  // a longer word: a candidate writing "cancelled" about a cancel path means it.
  return ` ${haystack}`.includes(` ${needle}`);
}

export function fitPrompt(prompt: string, required: string | string[][]): PromptFit {
  const groups = typeof required === 'string' ? parseRequired(required) : required;
  const haystack = normalize(prompt);
  const missing: string[] = [];
  const hit: string[] = [];
  for (const group of groups) {
    const matched = group.find((term) => containsTerm(haystack, term));
    if (matched === undefined) missing.push(group[0]);
    else hit.push(matched);
  }
  return { satisfied: missing.length === 0 && groups.length > 0, missing, hit };
}
