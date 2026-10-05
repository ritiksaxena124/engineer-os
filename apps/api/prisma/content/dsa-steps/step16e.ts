import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';

/**
 * Step 16e — the closing batch of the DP step: the four rows the sheet repeats at the end of its own
 * list, one memoised and one tabulated copy of problems it already asked, a substring table after the
 * subsequence table, and MCM again with the fill order in the title. The rows are not padding. A
 * duplicate is the one place in the bank where the same recurrence can be written two ways and the
 * difference between the two answers is the lesson, so each row here cites the concept its original
 * defines and spends its length on what the other half of the pair costs.
 */

export const concepts: Record<string, ConceptSpec> = {
  'dsa-dp16e-memo-key-is-the-whole-state': {
    slug: 'dsa-dp16e-memo-key-is-the-whole-state',
    name: 'A memo key that leaves out part of the state caches the wrong answer',
    detail:
      'Memoisation is correct exactly when the value depends on everything in the key: caching subset-sum by remaining target alone lets a decision made at index 2 be reused at index 5, where fewer items are still available.',
    terms: ['state tuple', 'cache key', 'index and remaining', 'collision in the memo', 'value depends on key'],
    weight: 5,
  },
  'dsa-dp16e-tabulation-pays-for-dead-cells': {
    slug: 'dsa-dp16e-tabulation-pays-for-dead-cells',
    name: 'A recursion fills only the states it can reach, a table fills the whole rectangle',
    detail:
      'The memo version visits the reachable subset of (index, target) pairs and returns as soon as a state is true; the table writes n times capacity cells whether or not any path reads them, which is what buys it loop order and no call stack.',
    terms: ['reachable states', 'full rectangle', 'early exit', 'table overhead', 'top-down versus bottom-up cost'],
    weight: 4,
  },
  'dsa-dp16e-row-is-first-i-items': {
    slug: 'dsa-dp16e-row-is-first-i-items',
    name: 'Table row i means "decided using the first i items", which is what makes copy-or-add legal',
    detail:
      'The two reads a 0/1 row performs — dp[i-1][w] for skipping and dp[i-1][w-weight] for taking — both come from the previous row, so each item is spent at most once; reading the current row instead re-spends it and answers the unbounded variant.',
    terms: ['prefix of items', 'previous row only', 'take or skip', 'one dimension per decision', 'row semantics'],
    weight: 5,
  },
  'dsa-dp16e-descending-column-holds-one-row': {
    slug: 'dsa-dp16e-descending-column-holds-one-row',
    name: 'Collapsing a 0/1 table to one array means sweeping capacity downwards',
    detail:
      'A descending column loop writes high capacities before the low ones a later read needs, so the array still holds the previous item row; ascending writes low first, and the same item then combines with itself, which solves a different problem and returns a larger value.',
    terms: ['descending capacity', 'rolling array', 'reuse of one item', 'unbounded by accident', 'loop direction decides'],
    weight: 5,
  },
  'dsa-dp16e-longest-cell-not-the-corner': {
    slug: 'dsa-dp16e-longest-cell-not-the-corner',
    name: 'A substring table stores a suffix length and answers with its largest cell, not its corner',
    detail:
      'Forcing zero on a mismatch is what makes dp[i][j] mean "common suffix ending here", and that makes the run continue past the last row: the answer is the maximum over every cell, whereas the subsequence table keeps its best in the corner.',
    terms: ['common suffix state', 'zero on mismatch', 'maximum over cells', 'substring versus subsequence', 'corner is not the answer'],
    weight: 5,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 16,
    name: "Subset sum equals target using memoization",
    difficulty: "Medium",
    topicSlug: "dp-greedy",
    stem: "The sheet already asked subset sum; this row asks for the memoised version. Write the recursion over (index, remaining), cache it, and say what the cache key has to contain and what the table version writes that this one does not.",
    brief:
      "Input: an array of positive integers and a target. Output: whether some subset sums exactly to the target, plus the number of distinct states the memo actually computed. The empty subset is a legal answer for target 0.",
    concepts: [
      "dsa-dp16e-memo-key-is-the-whole-state",
      "dsa-dp16e-tabulation-pays-for-dead-cells",
      "dsa-dp16a-subset-sum-pseudo-polynomial",
      "dsa-memoization",
    ],
    shortAnswer:
      "solve(i, remaining) is true if remaining hits 0, false if the index runs out, and otherwise solve(i+1, remaining - arr[i]) OR solve(i+1, remaining). Cache on the pair — both of them — and the recursion only ever computes states its own branches reach.",
    idealAnswer:
      "The recurrence is three lines and the row is not really about it. It is about the two things the memoised shape gets right and wrong relative to the table. The first is the key: the state is the pair (index, remaining) and a cache keyed on remaining alone is a correctness bug, because the same remaining reached later in the array has strictly fewer items left to spend, so a true stored at index 1 gets replayed at index 5 where the items that produced it are gone. The second is reachability: the recursion explores the states its branches actually arrive at and stops the instant a branch returns true, since the row is an existential question — while the table writes n times target cells for every instance, including the ones no subset touches. That is why the memo version usually wins on early exit and the table wins when you need the whole row for counting or reconstruction, which is the honest trade to state rather than a preference. Cost is O(n * target) time and space in the worst case for both, with the worst case being an array whose subset sums are all distinct; the constant, the stack depth, and the number of cells genuinely written are what differ. The boundary work is the same in both: target 0 is true through the empty subset before any index is consulted, a remaining that goes negative is false rather than a signal to keep going, and an item larger than the current remaining is a wasted branch worth pruning.",
    walkthrough:
      "On [3, 34, 4, 12, 5, 2] with target 9 the first call is solve(0, 9). Take 3, so solve(1, 6): 34 overshoots and its take branch is refused by the negative guard, so the skip chain moves to index 2, take 4 gives solve(3, 2), 12 and 5 both overshoot, and at index 5 the take of 2 hits remaining 0 — true. Six states were computed to prove it, each one a pair (index, remaining) that a real partial subset produced, and the recursion never touched the other 54 cells of the 6-by-10 rectangle it could have filled. Ask target 30 on the same array and the shape of the work inverts: the sum of everything except 34 is 26, so 30 is unreachable, and to answer false the function must exhaust both branches of every state it can reach — 32 computed states, all of them cached, failures included, which is the only reason a second visit to a pair is free. That contrast is the row: a yes can be found by walking one path, a no has to prove there is none. Target 0 returns true before any index is consulted, on [1, 2] or on an empty array, because the empty subset is a legal witness; target 1 on [3, 4] returns false because every take overshoots and the skip chain runs off the end.",
    commonMistake:
      "Caching on the remaining target alone, or caching true results without caching the failures that the second branch was meant to avoid.",
    whyWrong:
      "A key of just the remaining value claims the verdict for a target is independent of which items are still in hand, and it is not. The state remaining 6 at index 2 of [3, 4, 1, 1] is false — one of the 1s has already been passed — while the state remaining 6 at index 0 is true, because 4 plus the two 1s makes 6; a memo that stores only one verdict per remaining value replays whichever was written first, and on that array the shipped bad-key version answers false for a target the subset {4, 1, 1} hits. It fails by under-claiming, which is the direction that hides longest, because a false answer on a decision problem looks like a correct rejection. Caching only the successes is the other half of the mistake: every failed state is then recomputed on every path that reaches it, the exponential recursion survives with a cache that almost never hits, and the state counter in this row's solution reads like an un-memoised search.",
    followUps: [
      "Which states does your memo write for target 30 that it never writes for target 9 on the same array, and why?",
      "You now need the subset itself, not the verdict. Why does the memo version reconstruct worse than the table, and what would you store to fix it?",
      "Rewrite the key as a string of the pair. What is the per-lookup cost versus an array of arrays, and where does it show on n = 200, target = 10000?",
      "The array contains a zero. What does your base case do, and can an item of value zero make the memo key ambiguous?",
    ],
    solution:
      'function subsetSumMemo(arr, target) {\n' +
      '  const memo = {};\n' +
      '  let states = 0;\n' +
      '  function solve(i, remaining) {\n' +
      '    if (remaining === 0) return true;\n' +
      '    if (i === arr.length || remaining < 0) return false;\n' +
      '    const at = i + ":" + remaining;\n' +
      '    if (memo[at] !== undefined) return memo[at];\n' +
      '    states += 1;\n' +
      '    const answer = solve(i + 1, remaining - arr[i]) || solve(i + 1, remaining);\n' +
      '    memo[at] = answer;\n' +
      '    return answer;\n' +
      '  }\n' +
      '  const found = solve(0, target);\n' +
      '  return { found: found === true, states: states };\n' +
      '}\n' +
      '\n' +
      'function subsetSumTabular(arr, target) {\n' +
      '  const reachable = new Array(target + 1).fill(false);\n' +
      '  reachable[0] = true;\n' +
      '  for (const value of arr) {\n' +
      '    for (let sum = target; sum >= value; sum -= 1) {\n' +
      '      if (reachable[sum - value] === true) reachable[sum] = true;\n' +
      '    }\n' +
      '  }\n' +
      '  return reachable[target];\n' +
      '}\n' +
      '\n' +
      'function subsetSumBadKey(arr, target) {\n' +
      '  const memo = {};\n' +
      '  function solve(i, remaining) {\n' +
      '    if (remaining === 0) return true;\n' +
      '    if (i === arr.length || remaining < 0) return false;\n' +
      '    if (memo[remaining] !== undefined) return memo[remaining];\n' +
      '    const answer = solve(i + 1, remaining - arr[i]) || solve(i + 1, remaining);\n' +
      '    memo[remaining] = answer;\n' +
      '    return answer;\n' +
      '  }\n' +
      '  return solve(0, target);\n' +
      '}',
    modify:
      "The array may now contain zeros and the question becomes how many subsets hit the target instead of whether one does. Which of the two shapes survives that change without storing counts in a memo keyed by a boolean?",
  },
  {
    step: 16,
    name: "0/1 Knapsack problem tabulation",
    difficulty: "Medium",
    topicSlug: "dp-greedy",
    stem: "Fill the 0/1 knapsack table bottom-up and read the answer off it, then collapse it to one array. The row is graded on explaining why the collapsed loop must run downwards.",
    brief:
      "Input: parallel arrays of weights and values, plus a capacity. Output: the maximum value using each item at most once, the item indices that achieve it read back out of the table, and the same value from a one-dimensional fill.",
    concepts: [
      "dsa-dp16e-row-is-first-i-items",
      "dsa-dp16e-descending-column-holds-one-row",
      "dsa-dp16a-rolling-target-reverse-for-0-1",
      "dsa-coordinate-loops",
    ],
    shortAnswer:
      "Row i of the table is the best value obtainable from the first i items at each capacity, so every cell is either the cell above it (skip item i) or the cell above-and-left plus the value (take it). Collapsed to one array the same reads still have to come from the previous row, and only a downward capacity sweep guarantees that.",
    idealAnswer:
      "The table is the definition made literal: dp[i][w] is the optimum over the first i items with capacity w, and because item i either goes in or does not, the two candidate reads are dp[i-1][w] and dp[i-1][w - weight[i]] + value[i]. Both reads are in the row above, and that is not a stylistic detail — it is the entire expression of the 0/1 constraint. Put the second read in the current row and the same item is added to a solution that already contains it, so the table answers the unbounded variant; the numbers come out larger, not smaller, and no error is raised. The one-array collapse is the same fact one level down. dp[w] holds the previous row's value until it is overwritten, so the update must consume low capacities last: descending from capacity to weight[i] means dp[w - weight[i]] is still the pre-item value when it is read, and the row above is preserved inside a single array. Ascending overwrites dp[w - weight[i]] first, so the item sees itself, and the code that is two characters shorter is solving a different problem. Reconstruction is the part tabulation earns: walk the table from dp[n][C], compare each row with the one above, and wherever they differ an item was taken, which subtracts its weight and moves left — a linear pass over the table that the memo version cannot do without storing decisions at every state.",
    walkthrough:
      "Take weights [1,3,4,5] and values [1,4,6,10] with capacity 7. Row 0 is all zeros — no items, no value. Row 1 (item of weight 1) is 0,1,1,1,1,1,1,1: every capacity at or above 1 takes it once. Row 2 adds weight 3 value 4, giving 0,1,1,5,5,5,5 at capacities 0..5 and then 5 at 6 and 7 combined with the weight-1 item. Row 3 with weight 4 value 6 and row 4 with weight 5 value 10 finish at dp[4][7] = 11, achieved by items 0 and 3 — weight 1 plus 5 equals 6, value 1 plus 10 equals 11 — which is better than the 3+4 pair worth 10. Read the table backwards from capacity 7: dp[4][7] differs from dp[3][7], so item 3 is in and the capacity moves to 2; dp[3][2] equals dp[2][2], items 1 and 2 are out; dp[2][2] equals dp[1][2], and dp[1][2] differs from dp[0][2] so item 0 is in — the chosen list is [0,3]. The one-array fill over the same input returns 11. Now the direction: on weights [2,3], values [4,5], capacity 6, the correct 0/1 answer is 9 (both items, weight 5), but the ascending sweep builds 2+2+2 and reports 12, which is the unbounded optimum — a larger number from the same four lines.",
    commonMistake:
      "Sweeping capacity upwards after collapsing the table, or reading dp[i][w - weight] instead of dp[i-1][w - weight] in the two-dimensional form.",
    whyWrong:
      "Both are the same bug wearing different clothes: a read from the current item row means item i is combined with a solution that already used item i. The ascending one-array version returns 12 where the truth is 9 on the two-item instance above, and because it returns a plausible larger value rather than crashing, the only way to catch it is to know that 0/1 means the answer cannot exceed the sum of all values of distinct items — or to check it against the two-dimensional table, which is why the row ships both. The equivalent mistake in the 2-D form is invisible to the loop order and equally wrong: dp[i][w] built from dp[i][w - weight[i]] makes the row self-referential, so the fill order within the row decides the answer, which is a signal that the state is not well-defined.",
    followUps: [
      "Prove the descending sweep keeps the previous row. What exactly is dp[c] equal to just before the write at capacity c?",
      "You need the chosen items from the one-array version. Why can you not get them, and what does restoring them cost?",
      "Same table, capacity a million and weights all even. What does the fill do with the odd cells, and what does that say about pseudo-polynomial cost?",
      "Rewrite the recurrence so items may be taken at most twice. Which read changes, and does the one-array collapse still work downward?",
    ],
    solution:
      'function knapsackTable(weights, values, capacity) {\n' +
      '  const n = weights.length;\n' +
      '  const dp = [];\n' +
      '  for (let row = 0; row <= n; row += 1) dp.push(new Array(capacity + 1).fill(0));\n' +
      '  for (let row = 1; row <= n; row += 1) {\n' +
      '    for (let w = 0; w <= capacity; w += 1) {\n' +
      '      dp[row][w] = dp[row - 1][w];\n' +
      '      const weight = weights[row - 1];\n' +
      '      if (weight <= w) {\n' +
      '        const taken = dp[row - 1][w - weight] + values[row - 1];\n' +
      '        if (taken > dp[row][w]) dp[row][w] = taken;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return dp;\n' +
      '}\n' +
      '\n' +
      'function knapsackValue(weights, values, capacity) {\n' +
      '  return knapsackTable(weights, values, capacity)[weights.length][capacity];\n' +
      '}\n' +
      '\n' +
      'function knapsackChosen(weights, values, capacity) {\n' +
      '  const dp = knapsackTable(weights, values, capacity);\n' +
      '  const chosen = [];\n' +
      '  let w = capacity;\n' +
      '  for (let row = weights.length; row >= 1; row -= 1) {\n' +
      '    if (dp[row][w] !== dp[row - 1][w]) {\n' +
      '      chosen.push(row - 1);\n' +
      '      w -= weights[row - 1];\n' +
      '    }\n' +
      '  }\n' +
      '  return chosen.reverse();\n' +
      '}\n' +
      '\n' +
      'function knapsackOneDimension(weights, values, capacity) {\n' +
      '  const dp = new Array(capacity + 1).fill(0);\n' +
      '  for (let item = 0; item < weights.length; item += 1) {\n' +
      '    for (let w = capacity; w >= weights[item]; w -= 1) {\n' +
      '      const taken = dp[w - weights[item]] + values[item];\n' +
      '      if (taken > dp[w]) dp[w] = taken;\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[capacity];\n' +
      '}\n' +
      '\n' +
      'function knapsackAscendingBug(weights, values, capacity) {\n' +
      '  const dp = new Array(capacity + 1).fill(0);\n' +
      '  for (let item = 0; item < weights.length; item += 1) {\n' +
      '    for (let w = weights[item]; w <= capacity; w += 1) {\n' +
      '      const taken = dp[w - weights[item]] + values[item];\n' +
      '      if (taken > dp[w]) dp[w] = taken;\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[capacity];\n' +
      '}',
    modify:
      "Capacity is now 10^7 and every weight is at least 1000. What does the table cost, and which different DP shape — over values instead of weights — answers the same question?",
  },
  {
    step: 16,
    name: "Longest Common Substring DP",
    difficulty: "Medium",
    topicSlug: "dp-greedy",
    stem: "The sheet asked longest common subsequence already; this row asks for the substring table. Fill it, read the answer from it, and say why the answer is not in its corner.",
    brief:
      "Input: two strings. Output: the length of their longest shared contiguous block and the block itself. dp[i][j] is the length of the longest common suffix of the first i characters of a and the first j of b.",
    concepts: [
      "dsa-dp16e-longest-cell-not-the-corner",
      "dsa-dp16c-two-prefix-edit-table",
      "dsa-dp16e-tabulation-pays-for-dead-cells",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "Same recurrence shape as the subsequence table except the mismatch branch: a mismatch writes 0 instead of the best of two neighbours, because a run that breaks is over. That is also why the answer is the largest cell anywhere in the table rather than dp[n][m].",
    idealAnswer:
      "Both tables have one cell per pair of prefixes, and they differ in exactly one clause — which is the cleanest illustration in the whole step of the claim that the state definition is the algorithm. Subsequence dp[i][j] means \"best over these two prefixes\", so a mismatch inherits the better neighbour and the corner holds the global best. Substring dp[i][j] means \"the common run ending exactly at these two characters\", so a mismatch has no run to report and must write 0, and a match extends the run diagonally by one. Change either clause and you get the other problem with no complaint from the code. Forcing the zero has the second consequence the row asks about: the best run may end in the middle of both strings, so the answer is the maximum over the whole rectangle, tracked as you fill, and reading dp[n][m] returns 0 whenever the final characters disagree — on \"xabcy\" against \"zabc\" that is the difference between 3 and 0. Returning the string rather than its length is a free extra because the state says where the run ends: hold the (i, j) of the record cell and slice a from i - best to i. Cost is n*m time and space, reducible to two rows or one rolling array for the length only — but not for the reconstruction, which needs either the record position kept live or the full table. On equal characters the diagonal read is the only legal one: there is no choice to make about skipping, because skipping is what the substring problem forbids.",
    walkthrough:
      "Compare \"abcdxyz\" and \"xyzabcd\" cell by cell. Matches appear along two diagonal bands: the leading abcd of one against the trailing abcd of the other, and the trailing xyz against the leading xyz. Each diagonal run of matches increments by one, so the cells for a, ab, abc, abcd read 1, 2, 3, 4, and the same happens on the x-y-z band, so the maximum cell in the table is 4 — with a tie, and the first one recorded gives \"abcd\" while the last would give \"xyz\"; both are correct answers to the length question and the string question needs the tie rule stated. Now the corner trap: \"xabcy\" against \"zabc\" has its run a-b-c along the diagonal, giving a record of 3 at the cell for prefixes \"xabc\" and \"zabc\", but the last characters y and c disagree, so dp[5][4] is 0. An implementation that returns the corner reports 0 for two strings sharing three characters. Against the subsequence table the difference is visible in one clause: for \"abcde\" and \"abxde\" the substring answer is 2 (\"ab\", and \"de\" also runs two long) while the subsequence answer is 4, because the subsequence table's mismatch branch carries \"ab\" forward across the x and adds \"de\" to it.",
    commonMistake:
      "Returning dp[n][m] as the answer, or letting the mismatch branch inherit a neighbour value instead of writing 0.",
    whyWrong:
      "The corner is only the record when the best run happens to end at both last characters, and most strings disagree there: on \"xabcy\" and \"zabc\" the corner reads 0 while the table holds a 3, so the answer is wrong on the second test you try rather than the first. Inheriting on mismatch is subtler and worse, because it silently converts the table into the subsequence table — the maximum cell then reads 4 on \"abcde\" and \"abxde\" where the substring answer is 2, and the number is still plausible, which is how this bug ships. The tell is the state sentence: if the cell is allowed to survive a mismatch it no longer describes a run ending here, and once it does not describe that, the diagonal extension is meaningless too.",
    followUps: [
      "Write the sentence that defines one cell, then write the other table's sentence. Which clause in the code is each sentence responsible for?",
      "You want the lexicographically smallest record among ties. What changes in the fill, and does the position still cost nothing to keep?",
      "Collapse the table to one row. Why does the diagonal read survive a downward loop and not an upward one?",
      "Now the question is the longest common substring appearing at least twice in one string. What extra information does a cell need?",
    ],
    solution:
      'function substringTable(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) dp.push(new Array(b.length + 1).fill(0));\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;\n' +
      '      else dp[i][j] = 0;\n' +
      '    }\n' +
      '  }\n' +
      '  return dp;\n' +
      '}\n' +
      '\n' +
      'function longestCommonSubstringLength(a, b) {\n' +
      '  const dp = substringTable(a, b);\n' +
      '  let best = 0;\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) best = Math.max(best, dp[i][j]);\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function longestCommonSubstring(a, b) {\n' +
      '  const dp = substringTable(a, b);\n' +
      '  let best = 0;\n' +
      '  let endRow = 0;\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      if (dp[i][j] > best) {\n' +
      '        best = dp[i][j];\n' +
      '        endRow = i;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return a.slice(endRow - best, endRow);\n' +
      '}\n' +
      '\n' +
      'function cornerReadBug(a, b) {\n' +
      '  const dp = substringTable(a, b);\n' +
      '  return dp[a.length][b.length];\n' +
      '}\n' +
      '\n' +
      'function subsequenceTable(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) dp.push(new Array(b.length + 1).fill(0));\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;\n' +
      '      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[a.length][b.length];\n' +
      '}',
    modify:
      "Both strings are a million characters and you are allowed a hash plus a binary search instead of a table. What property of substring length makes the search monotone, and what does the hash answer per guess?",
  },
  {
    step: 16,
    name: "Matrix Chain Multiplication tabulation",
    difficulty: "Hard",
    topicSlug: "dp-greedy",
    stem: "The sheet asked MCM once already; this row asks for the bottom-up table. Fill it by span length, and account for why the length loop has to be the outer one.",
    brief:
      "Input: a chain of dimension numbers d0..dn, meaning matrix i is d(i-1) by d(i). Output: the minimum number of scalar multiplications over all parenthisations, plus the split index table that reproduces one optimal order.",
    concepts: [
      "dsa-dp16d-interval-length-iteration",
      "dsa-dp16d-split-point-decision",
      "dsa-dp16e-tabulation-pays-for-dead-cells",
      "dsa-divide-and-conquer",
    ],
    shortAnswer:
      "dp[i][j] is the cheapest way to multiply matrices i through j, and it takes the minimum over every split k of dp[i][k] + dp[k+1][j] + d(i-1)*d(k)*d(j). Fill by increasing span so both reads are already written, and the answer is dp[1][n].",
    idealAnswer:
      "The recursion is the easy half: a parenthesisation has a last multiplication, that split divides the chain into two independent chains, and the cost of the merge is fixed by the dimensions at the two ends, so the optimum over a whole is a minimum over splits of two optima plus the merge. The tabulated version has to add an order, and the dependency forces it: dp[i][j] reads spans strictly shorter than itself, so the outer loop counts span width from a single merge upward — a loop over the start index walking downward reads cells nobody has written and returns Infinity without complaining. The base of the table is the diagonal, zero, because one matrix needs no multiplication; every other cell is a minimum over j - i candidates, so the fill is cubic and no candidate can be skipped with this recurrence. The split table is the free product of the same loops: store the k that won and the parenthesisation reconstructs by splitting intervals recursively, which is what makes a table beat a memo here — the decisions are already written down. Two hazards are worth naming rather than skipping. Starting the span loop one step too high leaves every two-matrix cell at the diagonal value, so the first real merge is priced as free and the answer is a plausible number that is too small; and the count of parenthesisations is the Catalan sequence, so enumerating orders costs exponential time and the DP is the difference between n = 10 and n = 400, not a micro-optimisation.",
    walkthrough:
      "Take dimensions [40, 20, 30, 10, 30], which is four matrices: A 40x20, B 20x30, C 30x10, D 10x30. The diagonal is zero. A span of two matrices is one merge: AB costs 40*20*30 = 24000, BC = 20*30*10 = 6000, CD = 30*10*30 = 9000. Three matrices: ABC tries a split after A, giving 0 + 6000 + 40*20*10 = 14000, and after B, giving 24000 + 0 + 40*30*10 = 36000, so 14000 with the split recorded after A; BCD takes min(0 + 9000 + 20*30*30, 6000 + 0 + 20*10*30) = min(27000, 12000) = 12000, split after C. The full chain: split after A gives 0 + 12000 + 40*20*30 = 36000; after B gives 24000 + 9000 + 40*30*30 = 69000; after C gives 14000 + 0 + 40*10*30 = 26000. The answer is 26000, split after C, and the split table unpacks it as ((A(BC))D) — B by C for 6000, A by that 20x10 result for 8000, then by D for 12000, and 6000 + 8000 + 12000 is 26000, which is the check on the table. The order matters as a fact, not a preference: the same input parenthesised as ((AB)(CD)) costs 24000 + 9000 + 36000 = 69000, nearly three times the optimum on four matrices, so the row is about a real decision and not about arithmetic practice.",
    commonMistake:
      "Filling the table by start index instead of by span length, or pricing a split with the wrong three dimensions.",
    whyWrong:
      "A start-index outer loop asks dp[i][j] before any dp[i][k] with a wider left part has been written, so the cell is computed from zeros or undefined entries and returns a number that is too small — the worst failure mode, because Infinity at least looks broken. Walking by length makes the dependency a theorem: every split of i..j produces spans shorter than j - i. The second bug is subtler and shows up as a plausible wrong number: the merge cost for a split at k is d[i-1] * d[k] * d[j], the left result's rows, the shared inner dimension and the right result's columns; using d[i] * d[k] * d[j] shifts every product by one matrix and, on the four-matrix chain above, gives 26000 for a different input. The way to catch it is the split table: reconstruct the order and hand-multiply one small case.",
    followUps: [
      "Prove the length loop covers every cell before it is read. What exactly is already written when span L is being filled?",
      "Return the parenthesised string from the split table. What is the recursion and what does it cost?",
      "The same table shape appears in burst balloons and stick cutting. Which term in your recurrence is the one that changes between them?",
      "n is 500 now. What is the cost, and what does a Knuth-style optimisation buy if the quadrangle inequality holds?",
    ],
    solution:
      'function mcmTable(dims) {\n' +
      '  const n = dims.length;\n' +
      '  const dp = [];\n' +
      '  const split = [];\n' +
      '  for (let i = 0; i < n; i += 1) {\n' +
      '    dp.push(new Array(n).fill(0));\n' +
      '    split.push(new Array(n).fill(-1));\n' +
      '  }\n' +
      '  for (let span = 1; span < n; span += 1) {\n' +
      '    for (let i = 1; i + span < n; i += 1) {\n' +
      '      const j = i + span;\n' +
      '      dp[i][j] = Infinity;\n' +
      '      for (let k = i; k < j; k += 1) {\n' +
      '        const cost = dp[i][k] + dp[k + 1][j] + dims[i - 1] * dims[k] * dims[j];\n' +
      '        if (cost < dp[i][j]) {\n' +
      '          dp[i][j] = cost;\n' +
      '          split[i][j] = k;\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return { dp: dp, split: split };\n' +
      '}\n' +
      '\n' +
      'function mcmCost(dims) {\n' +
      '  return mcmTable(dims).dp[1][dims.length - 1];\n' +
      '}\n' +
      '\n' +
      'function mcmOrder(split, i, j) {\n' +
      '  if (i === j) return String.fromCharCode(64 + i);\n' +
      '  const k = split[i][j];\n' +
      '  return "(" + mcmOrder(split, i, k) + mcmOrder(split, k + 1, j) + ")";\n' +
      '}\n' +
      '\n' +
      'function mcmRecursive(dims, i, j) {\n' +
      '  if (i === j) return 0;\n' +
      '  let best = Infinity;\n' +
      '  for (let k = i; k < j; k += 1) {\n' +
      '    const cost = mcmRecursive(dims, i, k) + mcmRecursive(dims, k + 1, j) + dims[i - 1] * dims[k] * dims[j];\n' +
      '    if (cost < best) best = cost;\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify:
      "Report, for each span, the number of splits that tie with the optimum instead of the cost. What does the count live in, and why does it not need a big integer until n reaches the forties?",
  },
];

export const expects: Record<string, string> = {
  "Subset sum equals target using memoization":
    '(() => { const yes = subsetSumMemo([3, 34, 4, 12, 5, 2], 9); const no = subsetSumMemo([3, 34, 4, 12, 5, 2], 30); const zero = subsetSumMemo([1, 2], 0); const oversize = subsetSumMemo([3, 4], 1); const table = subsetSumTabular([3, 34, 4, 12, 5, 2], 9) === true && subsetSumTabular([3, 34, 4, 12, 5, 2], 30) === false && subsetSumTabular([2, 4, 6, 8], 5) === false && subsetSumTabular([2, 4, 6, 8], 10) === true; const key = subsetSumMemo([3, 4, 1, 1], 6).found === true && subsetSumBadKey([3, 4, 1, 1], 6) === false; const fewer = yes.states >= 1 && yes.states < 60 && no.states > yes.states; return table && key && fewer && yes.found === true && no.found === false && zero.found === true && oversize.found === false; })()',
  "0/1 Knapsack problem tabulation":
    '(() => { const value = knapsackValue([1, 3, 4, 5], [1, 4, 6, 10], 7); const chosen = knapsackChosen([1, 3, 4, 5], [1, 4, 6, 10], 7).join(","); const rolled = knapsackOneDimension([1, 3, 4, 5], [1, 4, 6, 10], 7); const bug = knapsackAscendingBug([2, 3], [4, 5], 6); const honest = knapsackOneDimension([2, 3], [4, 5], 6) === 9 && knapsackValue([2, 3], [4, 5], 6) === 9; const empty = knapsackValue([], [10], 5) === 0 && knapsackValue([9], [10], 5) === 0; return value === 11 && chosen === "0,3" && rolled === 11 && bug === 12 && honest && empty; })()',
  "Longest Common Substring DP":
    '(() => { const length = longestCommonSubstringLength("abcdxyz", "xyzabcd"); const text = longestCommonSubstring("abcdxyz", "xyzabcd"); const cornerTrap = cornerReadBug("xabcy", "zabc") === 0 && longestCommonSubstringLength("xabcy", "zabc") === 3; const versusSubsequence = longestCommonSubstringLength("abcde", "abxde") === 2 && subsequenceTable("abcde", "abxde") === 4; const none = longestCommonSubstringLength("abc", "def") === 0 && longestCommonSubstring("abc", "def") === ""; return length === 4 && text === "abcd" && cornerTrap && versusSubsequence && none; })()',
  "Matrix Chain Multiplication tabulation":
    '(() => { const main = mcmCost([40, 20, 30, 10, 30]); const unpacked = mcmOrder(mcmTable([40, 20, 30, 10, 30]).split, 1, 4); const recursive = mcmRecursive([40, 20, 30, 10, 30], 1, 4); const pair = mcmCost([10, 20, 30]) === 6000 && mcmCost([10, 20, 30, 40]) === mcmRecursive([10, 20, 30, 40], 1, 3); const single = mcmCost([7, 9]) === 0; return main === 26000 && recursive === 26000 && unpacked === "((A(BC))D)" && pair && single; })()',
};
