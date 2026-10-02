/**
 * Who asks what.
 *
 * These are editorial tags, not verified hiring data: they say where a problem is a well-known
 * interview staple, so a learner can pull up "the Amazon half of the array band" and drill it.
 * Nothing in the sheet or the app claims to know what any company asked a specific candidate, and
 * the tags deliberately cover only the questions whose reputation is broad enough to name. Refine
 * the map here — an untagged question is not hidden, it is filtered under "untagged".
 */
export interface CompanyRow {
  key: string;
  label: string;
}

export const COMPANIES: CompanyRow[] = [
  { key: 'amazon', label: 'Amazon' },
  { key: 'google', label: 'Google' },
  { key: 'microsoft', label: 'Microsoft' },
];

/** question slug -> company keys */
export const ASKED_AT: Record<string, string[]> = {
  // arrays: the rounds every company opens with
  'dsa-2sum-problem': ['amazon', 'google', 'microsoft'],
  'dsa-find-missing-number-in-an-array': ['amazon', 'microsoft'],
  'dsa-find-the-number-that-appears-once-and-other-numbers-twice': ['amazon', 'microsoft'],
  'dsa-majority-element-n-2-times': ['amazon', 'microsoft'],
  'dsa-majority-elements-n-3-times': ['microsoft'],
  'dsa-maximum-subarray-sum-kadane-s-algorithm': ['amazon', 'microsoft'],
  'dsa-stock-buy-and-sell': ['amazon', 'microsoft'],
  'dsa-longest-consecutive-sequence-in-an-array': ['amazon', 'google'],
  'dsa-sort-an-array-of-0s-1s-and-2s-dutch-national-flag': ['microsoft', 'amazon'],
  'dsa-next-permutation': ['amazon', 'google'],
  'dsa-leaders-in-an-array': ['amazon'],
  'dsa-remove-duplicates-from-sorted-array': ['microsoft', 'amazon'],
  'dsa-move-zeros-to-end': ['microsoft'],
  'dsa-left-rotate-an-array-by-d-places': ['microsoft'],
  'dsa-second-largest-element-in-an-array': ['microsoft'],
  'dsa-find-the-union-and-intersection-of-two-sorted-arrays': ['microsoft'],
  'dsa-merge-two-sorted-arrays-without-extra-space': ['amazon', 'microsoft'],

  // subarrays and windows — the follow-up half of the array round
  'dsa-longest-subarray-with-given-sum-k-positives': ['amazon'],
  'dsa-longest-subarray-with-sum-k-positives-negatives': ['amazon', 'google'],
  'dsa-count-subarray-sum-equals-k': ['amazon', 'google'],
  'dsa-largest-subarray-with-0-sum': ['amazon'],
  'dsa-count-number-of-subarrays-with-given-xor-k': ['amazon'],
  'dsa-maximum-product-subarray': ['amazon'],

  // matrices
  'dsa-set-matrix-zeroes': ['amazon', 'microsoft'],
  'dsa-rotate-matrix-by-90-degrees': ['amazon', 'google'],
  'dsa-print-the-matrix-in-spiral-manner': ['amazon', 'microsoft'],
  'dsa-search-in-a-2d-matrix': ['amazon'],
  'dsa-find-peak-element-2d-matrix': ['google'],
  'dsa-matrix-median': ['amazon'],
  'dsa-find-the-row-with-maximum-number-of-1-s': ['amazon'],

  // sorting and its cost
  'dsa-merge-sort': ['google', 'microsoft'],
  'dsa-quick-sort': ['google', 'microsoft'],
  'dsa-count-inversions': ['google', 'amazon'],
  'dsa-reverse-pairs': ['google'],

  // binary search, then the answer space
  'dsa-binary-search-to-find-x-in-sorted-array': ['amazon', 'microsoft'],
  'dsa-find-first-and-last-position-of-element-in-sorted-array': ['amazon', 'microsoft'],
  'dsa-search-insert-position': ['amazon'],
  'dsa-search-in-rotated-sorted-array-i': ['amazon', 'google'],
  'dsa-find-minimum-in-rotated-sorted-array': ['amazon', 'google'],
  'dsa-find-peak-element': ['google', 'amazon'],
  'dsa-single-element-in-a-sorted-array': ['amazon'],
  'dsa-find-the-element-that-appears-once-in-sorted-array': ['amazon'],
  'dsa-search-in-a-row-and-column-wise-sorted-matrix': ['amazon', 'google'],
  'dsa-kth-missing-positive-number': ['amazon', 'microsoft'],
  'dsa-aggressive-cows': ['google'],
  'dsa-book-allocation-problem': ['amazon', 'google'],
  'dsa-split-array-largest-sum': ['google', 'amazon'],
  'dsa-capacity-to-ship-packages-within-d-days': ['amazon'],
  'dsa-koko-eating-bananas': ['amazon', 'google'],
  'dsa-median-of-two-sorted-arrays-of-different-sizes': ['google'],
  'dsa-kth-element-of-two-sorted-arrays': ['microsoft', 'amazon'],

  // strings
  'dsa-reverse-words-in-a-string': ['amazon', 'microsoft'],
  'dsa-longest-palindromic-substring': ['amazon', 'google'],
  'dsa-check-if-a-string-is-palindrome': ['microsoft'],
  'dsa-isomorphic-string': ['amazon'],
  'dsa-longest-common-prefix': ['amazon', 'microsoft'],
  'dsa-string-to-integer-atoi': ['amazon', 'microsoft'],
  'dsa-integer-to-roman': ['microsoft', 'amazon'],
  'dsa-roman-to-integer': ['microsoft'],
  'dsa-check-if-two-strings-are-anagrams-of-each-other': ['amazon', 'microsoft'],
  'dsa-count-number-of-substrings-with-k-distinct-characters': ['amazon'],
  'dsa-sort-characters-by-frequency': ['amazon'],
  'dsa-sum-of-beauty-of-all-substrings': ['amazon'],
  'dsa-remove-outermost-parentheses': ['amazon'],

  // linked lists — the round Microsoft and Amazon open with
  'dsa-deleting-a-node-in-linkedlist': ['amazon', 'microsoft'],
  'dsa-reverse-a-doubly-linked-list': ['amazon', 'microsoft'],
  'dsa-search-an-element-in-the-ll': ['microsoft'],

  // the systems half, where the reputation is equally broad
  'drill-design-webhook-fanout': ['amazon'],
  'drill-what-not-to-build': ['google'],
  'drill-interview-event-loop': ['amazon', 'microsoft'],
  'drill-interview-process-model': ['google'],
  'drill-scale-before-shape': ['google', 'amazon'],

  // the 2026 interview bank: LLMs as production dependencies, and the backend rounds that stayed
  'int-what-is-a-token': ['google', 'microsoft'],
  'int-ai-assistant-workflow': ['amazon', 'google', 'microsoft'],
  'int-p99-not-average': ['amazon', 'google', 'microsoft'],
  'int-llm-call-as-flaky-infra': ['amazon', 'google', 'microsoft'],
  'int-structured-json-output': ['amazon', 'google'],
  'int-nondeterministic-test': ['google'],
  'int-chunk-boundary': ['amazon'],
  'int-ttft-four-seconds': ['google', 'amazon'],
  'int-agent-ran-forty-turns': ['google'],
  'int-idempotent-llm-retry': ['amazon', 'microsoft'],
  'int-cache-stampede': ['amazon', 'google', 'microsoft'],
  'int-payment-webhook-duplicate': ['amazon', 'microsoft'],
  'int-hiring-signal-under-ai': ['microsoft'],
  'int-instructions-in-retrieved-pdf': ['google'],
  'int-eval-for-unshipped-feature': ['google'],
  'int-model-deprecation-two-weeks': ['amazon'],
  'int-agent-write-tools': ['microsoft', 'google'],
  'int-self-host-or-api': ['google', 'microsoft'],
  'int-per-tenant-token-budget': ['amazon', 'microsoft'],
  'int-quality-drop-silent': ['amazon'],
  'int-when-not-to-build-rag': ['microsoft', 'google'],
};

/**
 * A tag pointing at a question that was renamed is a silent hole in the filter, and a filter facet
 * with no rows behind it is a dead button, so both are refused at seed time.
 */
export function validateCompanies(questionSlugs: Set<string>): string[] {
  const problems: string[] = [];
  const companyKeys = new Set(COMPANIES.map((company) => company.key));

  for (const [slug, tags] of Object.entries(ASKED_AT)) {
    if (!questionSlugs.has(slug)) problems.push(`ASKED_AT: question "${slug}" does not exist`);
    if (tags.length === 0) problems.push(`ASKED_AT: "${slug}" is tagged with no company`);
    const seen = new Set<string>();
    for (const tag of tags) {
      if (seen.has(tag)) problems.push(`ASKED_AT: "${slug}" lists company "${tag}" twice`);
      seen.add(tag);
      if (!companyKeys.has(tag)) problems.push(`ASKED_AT: "${slug}" cites unknown company "${tag}"`);
    }
  }

  const tagged = Object.values(ASKED_AT).filter((tags) => tags.length > 0).length;
  for (const company of COMPANIES) {
    const asked = Object.values(ASKED_AT).some((tags) => tags.includes(company.key));
    if (!asked) problems.push(`company "${company.key}" is a facet no question is tagged with`);
  }
  if (tagged === 0) problems.push('ASKED_AT tags no question, so the company filter can only ever return nothing');

  return problems;
}
