import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';

/**
 * Step 16c — the half of the DP step where the state shape is the answer. The string rows are
 * tables over two prefixes; the six stock rows are one machine over (day, holding, trades left)
 * whose greedy answers are collapses of that machine; the four LIS rows show what the patience
 * tails trick can and cannot give back once the learner wants the subsequence itself.
 */

export const concepts: Record<string, ConceptSpec> = {
  'dsa-dp16c-state-shape-is-the-answer': {
    slug: 'dsa-dp16c-state-shape-is-the-answer',
    name: 'The state tuple is decided before the recurrence is written',
    detail:
      'What dp[i][j] is allowed to mean — prefix against prefix, day against holdings, index against a remaining budget — is what makes the transition forced; no clever recurrence rescues a state that cannot express the subproblem.',
    terms: ['state definition', 'what dp[i][j] means', 'forced transition', 'parameters of the subproblem', 'state shape'],
    weight: 5,
  },
  'dsa-dp16c-scs-is-lcs-complement': {
    slug: 'dsa-dp16c-scs-is-lcs-complement',
    name: 'A shortest common supersequence is both strings minus what they share',
    detail:
      'Characters belonging to a common subsequence are written once and shared by both, so the length is n plus m minus the LCS, and the same table read forward decides which side emits the next character.',
    terms: ['n + m - lcs', 'shared characters written once', 'forward read of the table', 'tie decides the side', 'supersequence'],
    weight: 4,
  },
  'dsa-dp16c-count-branches-not-arrangements': {
    slug: 'dsa-dp16c-count-branches-not-arrangements',
    name: 'Counting matches adds branch results instead of listing them',
    detail:
      'A count over two prefixes is the skip branch plus, only when the characters agree, the take branch; nothing is ever collected, which is why an exponential enumeration collapses to the product of the two lengths.',
    terms: ['count not collect', 'skip branch plus take branch', 'conditional add', 'distinct ways', 'counts compose'],
    weight: 4,
  },
  'dsa-dp16c-two-prefix-edit-table': {
    slug: 'dsa-dp16c-two-prefix-edit-table',
    name: 'Alignment cost lives in a table over two prefixes with three neighbours',
    detail:
      'A cell is the cheapest way to turn one prefix into another, so it takes the minimum of delete, insert and replace; the diagonal is reused free when the two characters already agree.',
    terms: ['three neighbours', 'diagonal costs nothing', 'min of three moves', 'prefix alignment', 'read back the path'],
    weight: 4,
  },
  'dsa-dp16c-star-backtrack-is-the-table-in-linear-space': {
    slug: 'dsa-dp16c-star-backtrack-is-the-table-in-linear-space',
    name: 'A star with a backtrack pointer is the table compressed to one number',
    detail:
      'Greedy matching keeps the last star and the text index where it started eating; on a mismatch the star simply takes one more character, which is the same decision the sticky row of the DP table makes.',
    terms: ['last star', 'backtrack pointer', 'star eats one more', 'linear space', 'sticky row'],
    weight: 4,
  },
  'dsa-dp16c-stock-machine-states': {
    slug: 'dsa-dp16c-stock-machine-states',
    name: 'The stock family is one machine over day, holdings and trades left',
    detail:
      'Holding or not holding is the only thing the future cares about, and every row of the family is the same table with a different cap on the third axis, so the greedy answers are collapses of it rather than different algorithms.',
    terms: ['holding state', 'day by day', 'transactions left', 'machine collapse', 'same table different cap'],
    weight: 5,
  },
  'dsa-dp16c-transaction-budget-as-dimension': {
    slug: 'dsa-dp16c-transaction-budget-as-dimension',
    name: 'A trade cap is a third axis, and it is the axis that can be cut off',
    detail:
      'Trades left must be carried because two paths to the same day can differ only in remaining budget; once the budget reaches half the number of days it stops binding and the axis disappears.',
    terms: ['budget axis', 'k transactions left', 'a trade costs two days', 'k at least n over two', 'axis disappears'],
    weight: 4,
  },
  'dsa-dp16c-transition-not-new-dimension': {
    slug: 'dsa-dp16c-transition-not-new-dimension',
    name: 'A cooldown or a fee is a change of edge, not a new axis',
    detail:
      'Forcing a rest day redirects which state a buy may come from; a fee subtracts on one transition. Neither needs an extra parameter, and adding one turns a three-variable walk into a four-dimensional table.',
    terms: ['edge modified', 'redirect the transition', 'subtract on the sell', 'no extra parameter', 'state count unchanged'],
    weight: 4,
  },
  'dsa-dp16c-best-ending-here-dp': {
    slug: 'dsa-dp16c-best-ending-here-dp',
    name: 'A subsequence answer needs the qualifier ending at i',
    detail:
      'The best run of the whole array is not composable, but the best run ending exactly at each index is: every earlier index with a smaller value offers its length plus one, a quadratic scan that can also remember where it came from.',
    terms: ['ending at i', 'prefix scan', 'length plus one', 'composable qualifier', 'quadratic table'],
    weight: 4,
  },
  'dsa-dp16c-patience-tails-are-not-the-answer': {
    slug: 'dsa-dp16c-patience-tails-are-not-the-answer',
    name: 'The patience tails array has the right length and the wrong contents',
    detail:
      'Each pile top only certifies that some increasing run of that length exists; replacements overwrite earlier positions, so the final array can be decreasing and is never a subsequence to be handed back.',
    terms: ['pile tops', 'length is correct', 'contents are not a subsequence', 'replacement destroys order', 'printing needs more'],
    weight: 5,
  },
  'dsa-dp16c-predecessor-array-prints-the-chain': {
    slug: 'dsa-dp16c-predecessor-array-prints-the-chain',
    name: 'Printing an answer means storing the pointer you optimised away',
    detail:
      'A length table plus one predecessor per index turns the argmax into a walk backwards; the tie-break that chooses which argmax wins is what makes the printed chain deterministic.',
    terms: ['predecessor array', 'walk back from the argmax', 'reverse the chain', 'tie-break decides which chain', 'pointer storage'],
    weight: 4,
  },
  'dsa-dp16c-transitive-relation-collapses-the-check': {
    slug: 'dsa-dp16c-transitive-relation-collapses-the-check',
    name: 'A transitive relation lets a chain be checked against its tail only',
    detail:
      'Sorted order plus divisibility means that if the tail divides the newcomer then everything below it in the chain does too, so a pairwise subset test becomes one modulus per candidate predecessor.',
    terms: ['transitivity', 'sorted order', 'check the tail only', 'one modulus', 'chain not subset'],
    weight: 4,
  },
  'dsa-dp16c-topological-order-enables-the-sweep': {
    slug: 'dsa-dp16c-topological-order-enables-the-sweep',
    name: 'Sort the words so every predecessor is already solved',
    detail:
      'A chain step only ever shortens a word, so processing in increasing length puts every possible predecessor behind the cursor, and one sweep with a hash of solved lengths answers the whole list.',
    terms: ['sort by length', 'predecessors already computed', 'one sweep', 'hash of best lengths', 'topological order'],
    weight: 4,
  },
  'dsa-dp16c-rolling-array-shrinkage': {
    slug: 'dsa-dp16c-rolling-array-shrinkage',
    name: 'A table that only reads the previous row can be one array',
    detail:
      'Keeping two rows, or one row iterated right to left so the diagonal value is not yet overwritten, is the same recurrence with the storage of finished rows dropped — and with the ability to print dropped too.',
    terms: ['two rows', 'reverse iteration', 'diagonal preserved', 'space O(m)', 'printing is what you lose'],
    weight: 3,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 16,
    name: 'Shortest Common Supersequence',
    difficulty: 'Hard',
    topicSlug: 'dp-greedy',
    stem: 'Given two strings, hand back the shortest string that contains both of them as subsequences, and say exactly how long it has to be.',
    brief:
      'Input: two strings a few hundred characters at most, order significant, repeated characters allowed. Output: one shortest supersequence as a string plus its length. The constraint that decides the approach is that the answer is a string rather than a number, so a counting table is not enough — the construction has to read the same table back.',
    concepts: [
      'dsa-dp16c-scs-is-lcs-complement',
      'dsa-dp16c-state-shape-is-the-answer',
      'dsa-dp16c-predecessor-array-prints-the-chain',
      'dsa-subsequence-not-substring',
      'dsa-memo-decision-table',
    ],
    shortAnswer:
      'Build the LCS table over suffixes and walk it forward: where the two strings agree one character is written for both, and where they disagree the character is taken from whichever side keeps the longer common subsequence still ahead.',
    idealAnswer:
      'The length claim is the cheap half: a supersequence must account for every character of both strings, except that characters belonging to a common subsequence can be written once and shared, so the shortest has length n + m - LCS(a, b), and anything shorter would be sharing more than an LCS permits. The construction is where the state shape matters. Counting the LCS is not enough because the deliverable is a string, so the table must be indexed by suffix positions — dp[i][j] is the LCS of a[i..] against b[j..] — and filled from the bottom right so a forward walk from (0, 0) always steps onto a cell that already exists. On agreement emit one character and advance both cursors; on disagreement emit a[i] when dp[i + 1][j] is at least dp[i][j + 1], because spending a[i] on the output costs the shared run nothing, and otherwise emit b[j]. Cost is O(n * m) time and space. The length alone needs only O(min(n, m)) with a rolling row, and that is the trap: shrinking the table is precisely what removes the basis for choosing a side.',
    walkthrough:
      'Take a = "abc" and b = "acb". The suffix LCS table by rows i = 0..3 against j = 0..3 reads 2,1,1,0 then 1,1,1,0 then 1,1,0,0 then 0,0,0,0, so the LCS is 2 and the answer must be 3 + 3 - 2 = 4 characters. Walk forward from (0,0): a[0] and b[0] are both "a", so emit "a" and move to (1,1). There "b" and "c" differ, and dp[2][1] = 1 equals dp[1][2] = 1, so the tie goes to side a, "b" is emitted, and the cursor is at (2,1). At (2,1) both characters are "c": emit "c" and move to (3,2). Row 3 is the empty suffix, so what is left of b is appended verbatim: "b". The output is "abcb", four characters, with "abc" at positions 0,1,2 and "acb" at 0,2,3 — both as subsequences, not substrings. On a = "aggtab" and b = "gxtxayb" the shared run is "gtab" of length 4, so the length is 6 + 7 - 4 = 9 and the walk emits "aggxtxayb". On a = "abac" and b = "cab" the walk opens by taking "c" from b because dp[0][1] beats dp[1][0], and the result is "cabac", five characters.',
    commonMistake:
      'Returning n + m - LCS as the answer, or reconstructing the string from a rolling one-row table after shrinking the space.',
    whyWrong:
      'The number is half the deliverable: for a = "abc" and b = "acb" the required output is a four-character string such as "abcb", and "4" is a supersequence of nothing. The second failure is silent and worse — once the table is collapsed to two rows the cells above and to the left no longer exist, so the walk has no basis for choosing a side, and it either reads an out-of-range cell or applies a stand-in rule that emits the right number of characters without containing both inputs: always taking from a on a tie of dp[2][1] against dp[1][2] is only safe here because both are 1, and a rule of just finish a first would print "abcccb" style padding rather than a common supersequence.',
    followUps: [
      'Prove that a supersequence of length n + m - L forces a common subsequence of length L. Why does that make your construction optimal rather than merely short?',
      'Count the distinct shortest supersequences of "abc" and "acb". What extra table would you need to count them without enumerating strings?',
      'Reduce the space to O(min(n, m)) for the length only while keeping reconstruction available. What is the cheapest structure that still supports the forward walk?',
      'Both strings arrive as streams and are never held in full. Which pass can you not afford, and what does that do to the answer?',
    ],
    solution:
      'function lcsSuffixTable(a, b) {\n' +
      '  const n = a.length;\n' +
      '  const m = b.length;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= n; i += 1) dp.push(new Array(m + 1).fill(0));\n' +
      '  for (let i = n - 1; i >= 0; i -= 1) {\n' +
      '    for (let j = m - 1; j >= 0; j -= 1) {\n' +
      '      if (a[i] === b[j]) dp[i][j] = 1 + dp[i + 1][j + 1];\n' +
      '      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return dp;\n' +
      '}\n' +
      '\n' +
      'function lcsLength(a, b) {\n' +
      '  return lcsSuffixTable(a, b)[0][0];\n' +
      '}\n' +
      '\n' +
      'function scsLength(a, b) {\n' +
      '  return a.length + b.length - lcsLength(a, b);\n' +
      '}\n' +
      '\n' +
      'function shortestCommonSupersequence(a, b) {\n' +
      '  const dp = lcsSuffixTable(a, b);\n' +
      '  const out = [];\n' +
      '  let i = 0;\n' +
      '  let j = 0;\n' +
      '  while (i < a.length && j < b.length) {\n' +
      '    if (a[i] === b[j]) {\n' +
      '      out.push(a[i]);\n' +
      '      i += 1;\n' +
      '      j += 1;\n' +
      '    } else if (dp[i + 1][j] >= dp[i][j + 1]) {\n' +
      '      out.push(a[i]);\n' +
      '      i += 1;\n' +
      '    } else {\n' +
      '      out.push(b[j]);\n' +
      '      j += 1;\n' +
      '    }\n' +
      '  }\n' +
      '  while (i < a.length) {\n' +
      '    out.push(a[i]);\n' +
      '    i += 1;\n' +
      '  }\n' +
      '  while (j < b.length) {\n' +
      '    out.push(b[j]);\n' +
      '    j += 1;\n' +
      '  }\n' +
      '  return out.join("");\n' +
      '}\n' +
      '\n' +
      'function isSubsequenceOf(host, needle) {\n' +
      '  let k = 0;\n' +
      '  for (let i = 0; i < host.length && k < needle.length; i += 1) {\n' +
      '    if (host[i] === needle[k]) k += 1;\n' +
      '  }\n' +
      '  return k === needle.length;\n' +
      '}',
    modify:
      'Return the lexicographically smallest shortest supersequence instead of whatever your tie rule happens to emit. Which comparison changes in the disagreement branch, and what does it cost?',
  },
  {
    step: 16,
    name: 'Distinct Subsequences',
    difficulty: 'Hard',
    topicSlug: 'dp-greedy',
    stem: 'Count how many different sets of deletions turn one string into another, without listing any of them.',
    brief:
      'Input: a host string and a needle string, both short enough for a quadratic table, repeated characters expected. Output: the number of distinct index choices in the host that leave the needle behind. The constraint that decides the approach is that two different index sets count as two ways even when the surviving characters look identical, so this is a count over a decision tree, not a yes-or-no reachability.',
    concepts: [
      'dsa-dp16c-count-branches-not-arrangements',
      'dsa-count-by-adding-branches',
      'dsa-include-exclude-branch',
      'dsa-dp16c-state-shape-is-the-answer',
      'dsa-dp16c-rolling-array-shrinkage',
    ],
    shortAnswer:
      'dp[i][j] counts the ways to build t[0..j) from s[0..i): take the ways that ignore s[i-1], and when the two characters agree add the ways that spend s[i-1] on t[j-1].',
    idealAnswer:
      'The state is the only defensible one: a way of matching is a choice of indices in s, and the future needs to know only how much of s has been consumed and how much of t is still owed, so dp[i][j] counts ways to form t[0..j) from s[0..i). The recurrence is the include-or-exclude fork written as arithmetic: every way either ignores s[i - 1], contributing dp[i - 1][j], or, precisely when s[i - 1] equals t[j - 1], spends it on the last needle character and contributes dp[i - 1][j - 1]. Adding rather than maxing is what makes this a count and not a decision, and it is why nothing gets enumerated: the leaf total is computed by summing children. The base column dp[i][0] = 1 is load-bearing — the empty needle is formed in exactly one way from any prefix, by deleting everything — while dp[0][j] = 0 for j above 0 says a non-empty needle cannot come from nothing. Cost is O(n * m) time and space. Space drops to O(m) with one array iterated right to left, because the update dp[j] += dp[j - 1] has to read last row diagonal and a left-to-right sweep would read a value this row just wrote.',
    walkthrough:
      'For s = "rabbbit" and t = "rabbit" the rows dp[i][0..6], top to bottom, are 1,0,0,0,0,0,0 then 1,1,0,0,0,0,0 then 1,1,1,0,0,0,0 then 1,1,1,1,0,0,0 then 1,1,1,2,1,0,0 then 1,1,1,3,3,0,0 then 1,1,1,3,3,3,0 and finally 1,1,1,3,3,3,3. Read the cells that carry the argument: row 4 is the state after the first b, and its column 3 is 2 because the third needle character can already be matched to either of the two b characters seen. Row 5 raises that column to 3, and row 6, after the third b, leaves it at 3 — the extra b feeds the fourth needle character, whose column is the first to gain, not the third. The bottom-right cell is 3, the three ways being the three choices of which internal b to delete. The comparisons that define the contract: s = "babgbag" and t = "bag" answers 5; s = "aaa" and t = "aa" answers 3, because picking any two of the three a characters is a different choice even though all three results read "aa"; an empty t answers 1 from any s, including s = "" ; and t longer than s answers 0, since every column of row 0 above 0 is zero and nothing ever adds to them.',
    commonMistake:
      'Using max instead of addition, or leaving dp[i][0] at 0 because the empty needle looks like it should contribute nothing.',
    whyWrong:
      'Max converts the count into a decision: on "rabbbit" and "rabbit" it reports that a match exists and answers 1 instead of 3, which is the previous row on the sheet and not this one. Zeroing the base column is the arithmetic failure — the very first real match is cell (1,1) of "rabbbit", whose value is dp[0][1] + dp[0][0] = 0 + 1, so with a zero there the whole first needle column stays zero and "babgbag" against "bag" comes out 0 instead of 5. A third variant that under-counts is the greedy one: match the needle character to its first occurrence, move on, and multiply by nothing — on "aaa" against "aa" it reports 1 where the honest answer is 3, because the three ways differ in which index was skipped, not in what survives.',
    followUps: [
      'Shrink the table to one array. Why must the inner loop run right to left, and what value does a left-to-right sweep read on "rabbbit"?',
      'The host arrives as a stream that cannot be rewound. Which single row of state is enough, and what can you no longer report?',
      'Change the contract so that two index sets producing the same visible string count once. Does the table already answer that, and why?',
      'Report the answer modulo a prime for strings of length 1000. Where does the raw sum first leave the exact-integer window, and what changes?',
    ],
    solution:
      'function distinctSubsequencesTable(s, t) {\n' +
      '  const n = s.length;\n' +
      '  const m = t.length;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= n; i += 1) {\n' +
      '    const row = new Array(m + 1).fill(0);\n' +
      '    row[0] = 1;\n' +
      '    dp.push(row);\n' +
      '  }\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    for (let j = 1; j <= m; j += 1) {\n' +
      '      dp[i][j] = dp[i - 1][j];\n' +
      '      if (s[i - 1] === t[j - 1]) dp[i][j] += dp[i - 1][j - 1];\n' +
      '    }\n' +
      '  }\n' +
      '  return dp;\n' +
      '}\n' +
      '\n' +
      'function distinctSubsequences(s, t) {\n' +
      '  return distinctSubsequencesTable(s, t)[s.length][t.length];\n' +
      '}\n' +
      '\n' +
      'function distinctSubsequences1d(s, t) {\n' +
      '  const m = t.length;\n' +
      '  const dp = new Array(m + 1).fill(0);\n' +
      '  dp[0] = 1;\n' +
      '  for (let i = 1; i <= s.length; i += 1) {\n' +
      '    for (let j = Math.min(i, m); j >= 1; j -= 1) {\n' +
      '      if (s[i - 1] === t[j - 1]) dp[j] += dp[j - 1];\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[m];\n' +
      '}',
    modify:
      'Count distinct shortest supersequences of the same two strings instead. Which state has to change, and does the add-a-branch rule survive?',
  },
  {
    step: 16,
    name: 'Edit Distance',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Give the cheapest sequence of insert, delete and replace operations that turns one word into another, and read the operations back off the table.',
    brief:
      'Input: two words, lowercase, possibly empty, of equal or unequal length. Output: the minimum number of unit-cost operations, plus one minimal script that achieves it. The constraint that decides the approach is that all three operations cost one, so the question is an alignment and a character-by-character comparison cannot see the trade.',
    concepts: [
      'dsa-dp16c-two-prefix-edit-table',
      'dsa-dp16c-state-shape-is-the-answer',
      'dsa-memo-decision-table',
      'dsa-dp16c-rolling-array-shrinkage',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      'dp[i][j] is the cheapest cost of turning a prefix of length i into a prefix of length j: the minimum of the up cell plus one for a delete, the left cell plus one for an insert, and the diagonal plus one for a replace, with the diagonal free when the two characters agree.',
    idealAnswer:
      'The state has to be two prefixes rather than one index because the answer is an alignment: any optimal script finishes by consuming a character of a, consuming a character of b, or consuming both together, and those three endings are exactly the three neighbours of the current cell. That last-move argument is why the recurrence is a minimum of three rather than something invented at the moment. The boundary lines carry the contract: dp[i][0] = i and dp[0][j] = j say that emptying a prefix or building one from nothing is paid character by character, and an author who leaves them at zero gets answers short by exactly the unmatched prefix. Cost is O(n * m) time and space; two rows, or one row with a saved diagonal, gives O(min(n, m)) space — but the printed script needs the whole table, since reading the path back is a walk over cells that no longer exist once the storage is shrunk. Contrast with the row above: distinct subsequences adds its branches because it counts, and this row minises them because it optimises, which is the same table shape with two different combines and the reason the pair belongs together.',
    walkthrough:
      'For a = "horse" and b = "ros" the rows i = 0..5 against j = 0..3 read 0,1,2,3 then 1,1,2,3 then 2,2,1,2 then 3,2,2,2 then 4,3,3,2 then 5,4,4,3, so the answer is 3. Read the path backwards from dp[5][3]: the diagonal dp[4][2] = 3 plus one is 4 and the up cell dp[4][3] = 2 plus one is 3, so this is a delete of "e"; at (4,3) the characters are both "s", so the diagonal is free and the walk jumps to (3,2); there the up cell dp[2][2] = 1 beats the diagonal dp[2][1] = 2 and the left dp[3][1] = 2, so delete "r"; at (2,2) both are "o", jump to (1,1); there the diagonal dp[0][0] = 0 is smallest, so replace "h" with "r". Reversed, the script reads replace h with r, keep o, delete r, keep s, delete e — three paid operations, the classic horse to rorse to rose to ros. The contrasts worth naming: on "intention" and "execution" the answer is 5, and the counting row over the same two strings would have been adding ways rather than comparing costs; on the edges, "" against "abc" is 3, identical strings are 0, and "ab" against "ba" is 2 because two replaces tie a delete-and-insert exactly and neither beats the other.',
    commonMistake:
      'Charging the diagonal even when the characters match, or leaving the first row and column at zero so the empty-string cases come out free.',
    whyWrong:
      'Charging the diagonal throws away the only free steps in the walk: the two keep operations in the script above are diagonal moves that cost nothing, and pricing them makes "horse" against "ros" come out 5 instead of 3, which is the cost of the alignment that ignores every match. Zeroing the boundaries is quieter and fails the first edge case an interviewer tries: with dp[i][0] = 0 the walk can drop an unmatched prefix for nothing, so "" against "abc" answers 0 or 1 instead of 3, and the same hole makes "a" against "abc" short by the missing insert. The third failure is the greedy two-pointer that replaces at the first mismatch and never looks further: it is right on "ab" and "ba" and wrong whenever a delete earlier would have shifted a whole run of matches into place, which is exactly the situation "horse" and "ros" is in.',
    followUps: [
      'Compress the space to O(min(n, m)) and say precisely which part of the answer you can no longer return.',
      'Make replace cost 2 and insert and delete cost 1. Which term of the recurrence changes, and does "ab" to "ba" change its answer?',
      'The operations come from a priced edit list in a spellchecker. What must be true of the prices for a minimum of three to still be optimal?',
      'Adversarial: two strings of length 5000 with no character in common. What is the answer, and what does your walk cost to find out?',
    ],
    solution:
      'function editDistanceTable(a, b) {\n' +
      '  const n = a.length;\n' +
      '  const m = b.length;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= n; i += 1) {\n' +
      '    const row = new Array(m + 1).fill(0);\n' +
      '    row[0] = i;\n' +
      '    dp.push(row);\n' +
      '  }\n' +
      '  for (let j = 0; j <= m; j += 1) dp[0][j] = j;\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    for (let j = 1; j <= m; j += 1) {\n' +
      '      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];\n' +
      '      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return dp;\n' +
      '}\n' +
      '\n' +
      'function editDistance(a, b) {\n' +
      '  return editDistanceTable(a, b)[a.length][b.length];\n' +
      '}\n' +
      '\n' +
      'function editDistanceRolling(a, b) {\n' +
      '  if (a.length < b.length) {\n' +
      '    const held = a;\n' +
      '    a = b;\n' +
      '    b = held;\n' +
      '  }\n' +
      '  let previous = [];\n' +
      '  for (let j = 0; j <= b.length; j += 1) previous.push(j);\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    const current = [i];\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      if (a[i - 1] === b[j - 1]) current.push(previous[j - 1]);\n' +
      '      else current.push(1 + Math.min(previous[j], current[j - 1], previous[j - 1]));\n' +
      '    }\n' +
      '    previous = current;\n' +
      '  }\n' +
      '  return previous[b.length];\n' +
      '}\n' +
      '\n' +
      'function editOperations(a, b) {\n' +
      '  const dp = editDistanceTable(a, b);\n' +
      '  let i = a.length;\n' +
      '  let j = b.length;\n' +
      '  const out = [];\n' +
      '  while (i > 0 || j > 0) {\n' +
      '    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {\n' +
      '      out.push("keep " + a[i - 1]);\n' +
      '      i -= 1;\n' +
      '      j -= 1;\n' +
      '      continue;\n' +
      '    }\n' +
      '    const diagonal = i > 0 && j > 0 ? dp[i - 1][j - 1] : Infinity;\n' +
      '    const up = i > 0 ? dp[i - 1][j] : Infinity;\n' +
      '    const left = j > 0 ? dp[i][j - 1] : Infinity;\n' +
      '    if (diagonal <= up && diagonal <= left) {\n' +
      '      out.push("replace " + a[i - 1] + " with " + b[j - 1]);\n' +
      '      i -= 1;\n' +
      '      j -= 1;\n' +
      '    } else if (up <= left) {\n' +
      '      out.push("delete " + a[i - 1]);\n' +
      '      i -= 1;\n' +
      '    } else {\n' +
      '      out.push("insert " + b[j - 1]);\n' +
      '      j -= 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return out.reverse();\n' +
      '}',
    modify:
      'Report the operations in forward order with their positions so a client can offer undo. Which part of the backward walk has to change to keep the positions stable?',
  },
  {
    step: 16,
    name: 'Wildcard Matching',
    difficulty: 'Hard',
    topicSlug: 'dp-greedy',
    stem: 'Decide whether a pattern of letters, question marks and stars covers a whole string — in linear space.',
    brief:
      'Input: a text string and a pattern over lowercase letters where ? covers exactly one character and * covers any run including the empty one, with adjacent stars allowed. Output: a boolean for total coverage, not prefix coverage. The constraint that decides the approach is that a star is unbounded, so a plain two-pointer walk is not enough on its own — but the table it stands for can be compressed.',
    concepts: [
      'dsa-dp16c-star-backtrack-is-the-table-in-linear-space',
      'dsa-dp16c-state-shape-is-the-answer',
      'dsa-two-pointer',
      'dsa-memo-decision-table',
      'dsa-dp16c-rolling-array-shrinkage',
    ],
    shortAnswer:
      'Walk both strings and remember the most recent star together with the text index where it started eating; on a mismatch, if a star is open reset the pattern cursor to just after it and let it swallow one more character, otherwise fail.',
    idealAnswer:
      'The honest formulation is a table: dp[i][j] says the first i text characters are covered by the first j pattern characters, a letter or ? cell copies the diagonal, and a star cell is dp[i - 1][j] or dp[i][j - 1] — the star either takes this character or is finished taking characters. That is O(n * m) in time and space, and the linear-space answer works because a star column, once true, can never turn false again: a star that already swallowed i characters can always swallow the i plus first. So the sticky run of star decisions collapses into one number, the position where the current star began eating, and the greedy walk is that table with the compression applied. Two contract points are not optional. Matching is not enough — the pattern must be exhausted as well, so trailing stars are skipped before the return, and text running out is not success. And a star is not free: the pattern "*a*b" against "adceb" only works because the second star can reach forward to a later b, which is precisely the fact a backtrack pointer records rather than recomputes. Where the edit row above minised three neighbours and needed the whole table to print its script, this row is boolean and can drop the table: a star column only ever turns more true.',
    walkthrough:
      'Run text = "adceb" against pattern = "*a*b" with cursors si, pi, a remembered star and its mark. At si = 0, pi = 0 the pattern cell is a star: record star = 0, mark = 0, advance pi to 1. Pattern pi = 1 is "a" and text[0] is "a", so both cursors move to si = 1, pi = 2. pi = 2 is another star: record star = 2, mark = 1, pi = 3. Now pi = 3 is "b" against text[1] = "d": a mismatch with an open star, so the star eats one more — pi resets to star + 1 = 3, mark becomes 2, si follows to 2. The identical mismatch repeats at text[2] = "c" (mark 3) and text[3] = "e" (mark 4). At text[4] = "b" they agree: si = 5, pi = 4, the text is exhausted and pi is at the pattern length, so the answer is true. The failure input is as instructive: "acdcb" against "a*c?b" — "a" matches, the star opens at pi = 1 with mark 1, "c" matches text[1] = "c" and "?" eats "d", so si = 3, pi = 4 where "b" meets text "c": the star eats, restarting at mark 2 and then mark 3, which realigns "c" with text[3] = "c" and lets "?" eat the final "b"; now si = 5 = text length but pi = 4 still points at a literal "b" with no text left and no star to blame, so it is false. On the edges, "" against "*" is true, "" against "" is true, "aa" against "a" is false, and "a" against "ab*" is false because the pattern still owes a "b".',
    commonMistake:
      'Backtracking to the start of the pattern instead of to just after the last star, or returning true the moment the text is consumed.',
    whyWrong:
      'Restarting the whole pattern re-matches text that is already committed and can loop; the correct reset is pi = star + 1 with the mark advanced by exactly one, because everything before that star is already pinned against text that cannot move backwards. Returning when the text ends is the coverage bug: on "a" against "ab*" the walk consumes the single character and would answer true while the pattern still owes a literal "b" that no star can refund — the tail loop that skips stars then finds pi short of the length and the answer is false. The mirror version of the same bug is treating a star as a single-character wildcard, which makes "aa" against "*" false when the empty-and-all-runs reading makes it true, and "acdcb" against "a*c?b" would then be judged on the wrong alignment entirely.',
    followUps: [
      'Point at the exact cells of the DP table the backtrack pointer replaces on "adceb" against "*a*b". Which column is the sticky one?',
      'Collapse adjacent stars in a preprocessing pass. Does the answer ever change, and what does that save the greedy walk on a pattern of fifty stars?',
      'Now the pattern only has to match a prefix of the text, and the text arrives as a stream. Which cursor can you stop maintaining?',
      'Regular-expression matching adds a repeat of the previous character. Why does that break the single backtrack pointer that works here?',
    ],
    solution:
      'function wildcardMatch(text, pattern) {\n' +
      '  let si = 0;\n' +
      '  let pi = 0;\n' +
      '  let star = -1;\n' +
      '  let mark = 0;\n' +
      '  while (si < text.length) {\n' +
      '    if (pi < pattern.length && (pattern[pi] === "?" || pattern[pi] === text[si])) {\n' +
      '      si += 1;\n' +
      '      pi += 1;\n' +
      '    } else if (pi < pattern.length && pattern[pi] === "*") {\n' +
      '      star = pi;\n' +
      '      mark = si;\n' +
      '      pi += 1;\n' +
      '    } else if (star !== -1) {\n' +
      '      pi = star + 1;\n' +
      '      mark += 1;\n' +
      '      si = mark;\n' +
      '    } else {\n' +
      '      return false;\n' +
      '    }\n' +
      '  }\n' +
      '  while (pi < pattern.length && pattern[pi] === "*") pi += 1;\n' +
      '  return pi === pattern.length;\n' +
      '}\n' +
      '\n' +
      'function wildcardMatchTable(text, pattern) {\n' +
      '  const n = text.length;\n' +
      '  const m = pattern.length;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= n; i += 1) dp.push(new Array(m + 1).fill(false));\n' +
      '  dp[0][0] = true;\n' +
      '  for (let j = 1; j <= m; j += 1) dp[0][j] = pattern[j - 1] === "*" && dp[0][j - 1];\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    for (let j = 1; j <= m; j += 1) {\n' +
      '      if (pattern[j - 1] === "*") dp[i][j] = dp[i - 1][j] || dp[i][j - 1];\n' +
      '      else dp[i][j] = dp[i - 1][j - 1] && (pattern[j - 1] === "?" || pattern[j - 1] === text[i - 1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[n][m];\n' +
      '}\n' +
      '\n' +
      'function collapseStars(pattern) {\n' +
      '  const out = [];\n' +
      '  for (let i = 0; i < pattern.length; i += 1) {\n' +
      '    if (pattern[i] === "*" && out.length > 0 && out[out.length - 1] === "*") continue;\n' +
      '    out.push(pattern[i]);\n' +
      '  }\n' +
      '  return out.join("");\n' +
      '}',
    modify:
      'Add a pattern token that matches zero or one of the preceding character. Which of the two versions still works with a one-line change, and which one stops being linear?',
  },
  {
    step: 16,
    name: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    topicSlug: 'dp-greedy',
    stem: 'With one buy and one sell allowed, return the largest profit a price series offers — and name the state you are carrying.',
    brief:
      'Input: an array of daily prices, possibly empty, possibly monotonically falling, duplicates allowed. Output: the maximum of price[j] - price[i] over pairs with i before j, and 0 when no pair is profitable. The constraint that decides the approach is the budget of one transaction, which reduces the holding state to a single question: what was the cheapest day before this one.',
    concepts: [
      'dsa-dp16c-stock-machine-states',
      'dsa-running-minimum',
      'dsa-single-pass-tracking',
      'dsa-dp16c-state-shape-is-the-answer',
      'dsa-kadane-reset',
    ],
    shortAnswer:
      'Track the cheapest price seen so far and read the candidate profit off the current day: sell against that minimum, keep the larger answer. One pass, O(1) space, because with one trade nothing else about the past matters.',
    idealAnswer:
      'The one-pass answer is a collapse of a machine, and saying it that way is the interview answer. The full state is (day, holding, transactions left): on any day you either hold one share or hold none, a buy moves value from the not-holding side into the holding side, and a sell moves it back. With a budget of exactly one transaction the holding state can never be re-entered after its sell, so all the future needs from the past is the cheapest price you could still have bought at — which is why the table degenerates into one variable and one pass. Written as states, cash is the best value holding nothing and hold is the best value holding one share, initialised to negative infinity so that no sale can precede its purchase; the machine run at k = 1 returns the same 5 on [7,1,5,3,6,4] as the running-minimum loop, and it is the form the next five rows modify rather than replace. The contract edges are the empty array, the single day where no ordered pair exists, and a strictly falling series, where every difference is negative and the answer is 0 rather than the least loss — the problem says at most one transaction, and doing nothing is a legal plan worth zero.',
    walkthrough:
      'Walk [7,1,5,3,6,4] carrying (cheapest so far, best profit). Price 7: cheapest becomes 7 and selling today earns 0. Price 1: 1 is cheaper, so cheapest is 1, profit still 0. Price 5: 5 - 1 = 4, best becomes 4. Price 3: 3 - 1 = 2 does not beat 4, and a higher price never overwrites the cheaper minimum. Price 6: 6 - 1 = 5, best becomes 5. Price 4: nothing improves. The answer is 5, buy at 1 and sell at 6. The same walk as a two-state machine with a budget of 1 reads: after price 7 cash 0 hold -7; after 1 hold rises to -1; after 5 cash becomes 4; after 6 cash becomes 5 — identical numbers, and the same machine at k = 2 on this series returns 7, which is the next rows contract and not this one. Falling series [7,6,4,1]: the minimum follows every price down, every candidate profit is negative, and the answer is 0. Single day [3]: there is no later day to sell into, so 0. The comparison input is [1,2,4,3,5]: one transaction caps at 4 by buying at 1 and selling at 5, while the unlimited row reports 5, so the sibling over-counts here by buying again at 3 after the only allowed trade is already spent.',
    commonMistake:
      'Returning the maximum price minus the minimum price of the whole array, or resetting the minimum after a sale as though the trade budget refreshed.',
    whyWrong:
      'Max minus min ignores order, and order is the only constraint: on [7,6,4,1] it reports 6 while the answer is 0, because the cheapest day is the last day and nothing can be sold after it; on [2,1,2,1,0,1] it reports 2 while the honest single transaction is worth 1. Resetting the minimum after a sale is the uncapped machine wearing a budget it does not have: on [1,2,4,3,5] it produces 5 — the row-6 answer — by buying at 3 after already spending the one legal trade on the run from 1 to 4. Both failures come from the same place, which is dropping the day-ordered pair from the state and keeping only the values.',
    followUps: [
      'Write the two-state cash-and-hold machine at k = 1 and argue it equals the running minimum on every input. Which initialisation makes disagreement impossible?',
      'Prices stream in and the answer is requested after each arrival. Which state survives, and does the answer stay correct when a later day is cheaper?',
      'Report the buy and sell day indices too. What extra tracker do you need, and on which input is it ambiguous?',
      'All prices equal, and exactly two days: what do the two versions each return, and why is a flat series not an edge case for one of them?',
    ],
    solution:
      'function maxProfitOne(prices) {\n' +
      '  let cheapest = Infinity;\n' +
      '  let best = 0;\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    if (price < cheapest) cheapest = price;\n' +
      '    if (price - cheapest > best) best = price - cheapest;\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function maxProfitMachine(prices, budget) {\n' +
      '  const k = Math.min(budget, Math.floor(prices.length / 2));\n' +
      '  const rows = [];\n' +
      '  for (let t = 0; t <= k; t += 1) rows.push([0, -Infinity]);\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    for (let t = 1; t <= k; t += 1) {\n' +
      '      rows[t][0] = Math.max(rows[t][0], rows[t][1] + price);\n' +
      '      rows[t][1] = Math.max(rows[t][1], rows[t - 1][0] - price);\n' +
      '    }\n' +
      '  }\n' +
      '  return rows[k][0];\n' +
      '}\n' +
      '\n' +
      'function maxProfitPairEnumerated(prices) {\n' +
      '  let best = 0;\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    for (let j = i + 1; j < prices.length; j += 1) {\n' +
      '      if (prices[j] - prices[i] > best) best = prices[j] - prices[i];\n' +
      '    }\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function maxProfitMaxMinusMin(prices) {\n' +
      '  if (prices.length === 0) return 0;\n' +
      '  let low = prices[0];\n' +
      '  let high = prices[0];\n' +
      '  for (let i = 1; i < prices.length; i += 1) {\n' +
      '    if (prices[i] < low) low = prices[i];\n' +
      '    if (prices[i] > high) high = prices[i];\n' +
      '  }\n' +
      '  return high - low;\n' +
      '}',
    modify:
      'Report the buy and sell day indices with the profit, breaking ties toward the earliest buy and then the earliest sell. Which tracker has to hold more than a number?',
  },
  {
    step: 16,
    name: 'Buy and Sell Stock - II',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Any number of trades but never two shares at once: give the profit ceiling and explain why the greedy and the table agree.',
    brief:
      'Input: a price array, empty allowed, with equal prices on consecutive days allowed. Output: the maximum total profit from as many buy-sell pairs as you like, each buy after the previous sell. The constraint that decides the approach is that trades may be unlimited in count but never overlap in holdings, which is what makes every rise collectable.',
    concepts: [
      'dsa-dp16c-stock-machine-states',
      'dsa-dp16c-transition-not-new-dimension',
      'dsa-kadane-reset',
      'dsa-order-preserving-split',
      'dsa-dp16c-state-shape-is-the-answer',
    ],
    shortAnswer:
      'Either add up every positive day-to-day rise, or run the two-state machine cash and hold; they agree because an unbounded budget lets the sell transition fire whenever the price improves on the day before.',
    idealAnswer:
      'Two answers belong in this row and the second is the general one. The greedy is total = sum over i of max(0, price[i] - price[i - 1]). It is correct because a rise spread across several days can be collected either as one trade or as one trade per day for exactly the same money, so nothing is lost by pretending you sell and rebuy every morning; consecutive equal prices contribute 0, which is why duplicates cannot break it. The machine keeps the state honest: cash is the best value at the end of a day holding nothing, hold is the best value holding one share, and the two transitions are sell, which moves hold plus price into cash, and buy, which moves cash minus price into hold. With no budget there is no third axis, so the walk is O(n) time and O(1) space, and it is literally the k = 1 machine with the budget axis deleted rather than a new algorithm. Reading hold as a negative quantity is what makes a buy after a sell legal; the update order is a real constraint, because cash must be computed from the previous days hold or a same-day round trip manufactures profit out of nothing. The trap to name is that this answer is not a bound on the previous rows: on [1,2,4,3,5] the total here is 5 while a single transaction caps at 4.',
    walkthrough:
      'On [1,2,4,3,5] the rise sum is (2-1) + (4-2) + 0 + (5-3) = 1 + 2 + 2 = 5, the two trades buy 1 sell 4 and buy 3 sell 5. The machine tells the same story day by day as (cash, hold): after price 1, cash 0 and hold -1; after 2, selling would give 1, so cash 1 and hold -1; after 4, cash becomes 3; after 3, cash stays 3 while hold improves from -1 to 0, which reads as having banked the 3 and rebought at 3, because selling at 4 and buying back at 3 is worth exactly the missed 1; after 5, cash becomes 5. That hold value of 0 is the state the previous row cannot represent, which is why it answers 4 on the same input. The empty array answers 0 with nothing to walk and the flat [1,1,1] answers 0 because every rise is zero. Where a naive initialisation bites: with hold at 0 instead of negative infinity the very first sell computes cash = max(0, 0 + 3) = 3 on [3,2,1,0,2], banking money from a share that was never paid for, and the walk ends at 5 where the honest answer is the single rise from 0 to 2, which is 2; the same slip on the flat [1,1,1] reports 1 instead of 0. The update-order twin of that bug is computing hold from the freshly written cash and then cash from that same fresh hold, which turns one day into a free round trip.',
    commonMistake:
      'Summing valley-to-peak swings instead of positive adjacent differences, or initialising the holding state at 0.',
    whyWrong:
      'The valley-peak version and the adjacent-difference version total the same, so the first is not arithmetically wrong — it is the wrong answer to give, because it needs the notion of a peak, which means lookahead or a second pass: on [1,2,4,3,5] it has to decide what the dip at 3 does to the run, and max(0, difference) absorbs that decision as a zero contribution in one streaming pass. Initialising hold at 0 is a genuine correctness failure: on [3,2,1,0,2] the first sell computes cash = max(0, 0 + 3) = 3, banking a profit from a share that cost nothing, and the same slip on the flat [1,1,1] answers 1 rather than 0. The point of the negative-infinity initialisation is that it is the statement no position exists before the first buy.',
    followUps: [
      'Prove the rise sum equals the two-state machine on every input. Which inequality about selling and rebuying is the whole argument?',
      'Now cap the trades at k. Which axis has to come back, and what does a single day cost in updates?',
      'Prices arrive one per tick and memory is fixed. Which version survives a stream, and which one needs to know that tomorrow is a peak?',
      'Adversarial: the sawtooth [1,2,1,2,1,2]. What do your two versions report, and what does a cap of two trades report?',
    ],
    solution:
      'function maxProfitUnlimited(prices) {\n' +
      '  let total = 0;\n' +
      '  for (let i = 1; i < prices.length; i += 1) {\n' +
      '    const rise = prices[i] - prices[i - 1];\n' +
      '    if (rise > 0) total += rise;\n' +
      '  }\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function maxProfitTwoState(prices) {\n' +
      '  let cash = 0;\n' +
      '  let hold = -Infinity;\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    const sold = hold === -Infinity ? -Infinity : hold + price;\n' +
      '    const nextCash = Math.max(cash, sold);\n' +
      '    const nextHold = Math.max(hold, cash - price);\n' +
      '    cash = nextCash;\n' +
      '    hold = nextHold;\n' +
      '  }\n' +
      '  return cash;\n' +
      '}\n' +
      '\n' +
      'function maxProfitHoldInitialisedAtZero(prices) {\n' +
      '  let cash = 0;\n' +
      '  let hold = 0;\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    const nextCash = Math.max(cash, hold + price);\n' +
      '    hold = Math.max(hold, cash - price);\n' +
      '    cash = nextCash;\n' +
      '  }\n' +
      '  return cash;\n' +
      '}\n' +
      '\n' +
      'function maxProfitSingle(prices) {\n' +
      '  let cheapest = Infinity;\n' +
      '  let best = 0;\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    if (prices[i] < cheapest) cheapest = prices[i];\n' +
      '    if (prices[i] - cheapest > best) best = prices[i] - cheapest;\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify:
      'Cap the trades at three but keep the single O(n) pass. How many state variables does that take, and which one is shared with the next row?',
  },
  {
    step: 16,
    name: 'Buy and Sell Stock - III',
    difficulty: 'Hard',
    topicSlug: 'dp-greedy',
    stem: 'At most two transactions with no overlapping holdings: return the best total and show the input where two trades beat the best single one.',
    brief:
      'Input: a price array, possibly flat, possibly shorter than four days. Output: the maximum profit from at most two non-overlapping buy-sell pairs. The constraint that decides the approach is the cap: a second buy is only legal once the first sell has banked, so trades left becomes part of the state even though its value is the constant two.',
    concepts: [
      'dsa-dp16c-stock-machine-states',
      'dsa-dp16c-transaction-budget-as-dimension',
      'dsa-dp16c-state-shape-is-the-answer',
      'dsa-suffix-maximum',
      'dsa-neighbour-rule-needs-both-sweeps',
    ],
    shortAnswer:
      'Unroll the two-transaction machine into four variables in the order buy one, sell one, buy two, sell two, and update all four on every day. The fourth is the answer.',
    idealAnswer:
      'With a cap of two the state is still (day, holding, trades left), and because the cap is a constant the machine unrolls into four scalars: b1 is the best position while holding the first share, s1 the best after banking the first sale, b2 the best while holding the second share, s2 the best after banking it. Updating in that order within a day is what enforces the no-overlap rule, since b2 is allowed to use the same days s1 — selling and rebuying at the same price is legal and free — while nothing may flow backwards from s2 into b1. This row is a table and not a greedy for one specific reason: the best first trade and the best second trade compete for the same days, so the prefix-suffix alternative has to try every cut point, because the best single window to the left of a cut is not the best single window in the whole array. Cost is O(n) time and O(1) space for the four variables, O(n) space for the cut-point version, and both are the k = 2 case of the general machine. The numbers that show the cap is real: on [1,2,1,2,1,2] two trades collect 2 where the uncapped row collects 3, while on [1,2,4,3,5] two trades already reach the uncapped 5.',
    walkthrough:
      'On [3,3,5,0,0,3,1,4] the four variables (b1, s1, b2, s2) run: day 1 price 3 gives -3, 0, -3, 0; price 3 again changes nothing; price 5 lifts s1 to 2 and s2 to 2; price 0 improves b1 to 0 while s1 stays 2 and b2 becomes 2, which is the machine banking the sale at 5 and buying again at 0; the second 0 holds; price 3 lifts s1 to 3 and s2 to 5 while b2 stays 2; price 1 lifts nothing; price 4 lifts s1 to 4 and s2 to 6. The answer is 6 — buy 3 sell 5 for 2, then buy 0 sell 4 for 4 — while the k = 1 machine on the same series reports 4, which is buy 0 sell 4 alone, so the second trade is worth exactly 2 here. Now the two comparisons this row exists for: [1,2,1,2,1,2] returns s2 = 2 at the cap while the uncapped row returns 3, so the budget binds, and [1,2,4,3,5] returns 5 at the cap, equal to uncapped, so the budget is loose. The cut-point version on [1,2,4,1,5] wins at the split after index 2: left 3 from buy 1 sell 4 plus right 4 from buy 1 sell 5 is 7, where the best single window alone is only 4.',
    commonMistake:
      'Taking the best single trade, deleting that window, and taking the best single trade in what remains — or updating the four variables in an order that lets the second sale fund the first purchase.',
    whyWrong:
      'Greedy-then-residual fails on [1,2,4,1,5]: the best single window is buy 1 sell 5 for 4, removing it leaves nothing worth trading, so the answer comes out 4 while two jointly chosen trades give 7. The trades have to be selected together, which is what either the cut-point scan or the four-variable machine does. The order failure is the other half: computing b1 from s2 of the same day lets a sale refund a purchase that should have spent the budget, so on [1,2,1,2,1,2] the walk reports 3, the uncapped number, on a contract that only allows 2. A third slip is declaring s2 = s1 + (best second window) after the fact, which double-counts the day the two windows share when the argmax windows overlap, and overlap is exactly what the state ordering forbids.',
    followUps: [
      'Write the prefix-suffix version and name the cut that wins on [1,2,4,1,5]. Why is O(n) space the price of that argument?',
      'Generalise four variables to 2k variables. Which line becomes a loop, and what is the new bound per day?',
      'On [1,2,4,3,5] the cap of two is already loose. Give the condition on a price series that makes the cap stop mattering.',
      'Forbid buying and selling on the same day. Which transition has to read a value one day stale, and does the answer change on [3,3,5,0,0,3,1,4]?',
    ],
    solution:
      'function maxProfitAtMostTwo(prices) {\n' +
      '  let buyOne = -Infinity;\n' +
      '  let sellOne = 0;\n' +
      '  let buyTwo = -Infinity;\n' +
      '  let sellTwo = 0;\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    if (-price > buyOne) buyOne = -price;\n' +
      '    if (buyOne + price > sellOne) sellOne = buyOne + price;\n' +
      '    if (sellOne - price > buyTwo) buyTwo = sellOne - price;\n' +
      '    if (buyTwo + price > sellTwo) sellTwo = buyTwo + price;\n' +
      '  }\n' +
      '  return sellTwo;\n' +
      '}\n' +
      '\n' +
      'function maxProfitK(prices, budget) {\n' +
      '  const k = Math.min(budget, Math.floor(prices.length / 2));\n' +
      '  const rows = [];\n' +
      '  for (let t = 0; t <= k; t += 1) rows.push([0, -Infinity]);\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    for (let t = 1; t <= k; t += 1) {\n' +
      '      rows[t][0] = Math.max(rows[t][0], rows[t][1] + price);\n' +
      '      rows[t][1] = Math.max(rows[t][1], rows[t - 1][0] - price);\n' +
      '    }\n' +
      '  }\n' +
      '  return rows[k][0];\n' +
      '}\n' +
      '\n' +
      'function maxProfitPrefixSuffix(prices) {\n' +
      '  const n = prices.length;\n' +
      '  if (n < 2) return 0;\n' +
      '  const left = new Array(n).fill(0);\n' +
      '  let cheapest = prices[0];\n' +
      '  for (let i = 1; i < n; i += 1) {\n' +
      '    left[i] = Math.max(left[i - 1], prices[i] - cheapest);\n' +
      '    if (prices[i] < cheapest) cheapest = prices[i];\n' +
      '  }\n' +
      '  const right = new Array(n).fill(0);\n' +
      '  let highest = prices[n - 1];\n' +
      '  for (let i = n - 2; i >= 0; i -= 1) {\n' +
      '    right[i] = Math.max(right[i + 1], highest - prices[i]);\n' +
      '    if (prices[i] > highest) highest = prices[i];\n' +
      '  }\n' +
      '  let best = 0;\n' +
      '  for (let cut = 0; cut < n; cut += 1) best = Math.max(best, left[cut] + right[cut]);\n' +
      '  return best;\n' +
      '}',
    modify:
      'Allow at most two trades but forbid a sell and a buy on the same day. Which of the three versions still answers, and which transition has to read yesterday?',
  },
  {
    step: 16,
    name: 'Buy and Sell Stock - IV',
    difficulty: 'Hard',
    topicSlug: 'dp-greedy',
    stem: 'Give the general machine: at most k transactions over a price series, and say the exact point at which the budget stops binding.',
    brief:
      'Input: an integer k that may be zero and a price array of length n that may be empty. Output: the maximum profit from at most k non-overlapping trades. The constraint that decides the approach is the pair (k, n): the answer needs both axes unless k reaches n over 2, at which point the budget axis collapses and the row becomes the sum of positive rises.',
    concepts: [
      'dsa-dp16c-transaction-budget-as-dimension',
      'dsa-dp16c-stock-machine-states',
      'dsa-dp16c-state-shape-is-the-answer',
      'dsa-dp16c-rolling-array-shrinkage',
      'dsa-complexity-counting',
    ],
    shortAnswer:
      'A table over trades left and holdings filled day by day: for each t from 1 to k, cash[t] = max(cash[t], hold[t] + price) and hold[t] = max(hold[t], cash[t - 1] - price). Clamp k to n over 2 first, because a larger k is the uncapped problem.',
    idealAnswer:
      'This is the row the other five are instances of. The state is (day, holding, trades left) and there are exactly two transitions per trade level: a sell moves hold[t] into cash[t], and a buy moves cash[t - 1] into hold[t] while consuming one unit of budget. The budget axis cannot be dropped, because two positions identical in day and holdings can still differ in how many trades remain — that is the definition of a third dimension being necessary. Ordering the two updates sell-then-buy inside a day keeps the same-day sell and rebuy legal while stopping a trade from funding itself. The bound is O(n * k) time and O(k) space, and the collapse rule comes from the transitions rather than from the story: a completed trade consumes at least two days, so once k is at least n over 2 it cannot bind and the answer is the uncapped rise sum. Computing the full table there is quadratic work for a number one pass already knows, which is the failure an interviewer waits for. The edge contract has three parts: k = 0 answers 0 for any prices, an empty or single-day array answers 0 for any k, and a clamped k of 0 must still index the table without lying.',
    walkthrough:
      'Take k = 2 with prices [3,2,6,5,0,3]. The rows end at cash[1] = 4, which is buy 2 sell 6, and cash[2] = 7 once the buy at 0 and the sell at 3 land on the second level, so the answer is 7 and the four-variable walk of the previous row agrees. Drop the budget to k = 1 on the same series and the answer is 4 — the cap is what the second trade is worth. Take k = 2 with [2,4,1]: cash[1] = 2 from buy 2 sell 4 and cash[2] ends at the same 2 rather than adding anything, because after selling at 4 there is only a cheaper day left and no day after it to sell into, so here the calendar binds and not the budget. Now the collapse: k = 100 with [1,2,3,4,5] has n = 5, so k clamps to 2 and cash[2] = 4, equal to the rise sum 1 + 1 + 1 + 1 = 4; without the clamp the same answer costs a hundred levels a day for five days, which is 500 updates to reproduce a number one pass knows. The one-unit difference between this row and the previous one is visible on k = 3 with [1,2,1,2,1,2]: n over 2 is exactly 3, so the budget stops binding and the answer is 3, while k = 2 on the identical input answers 2. Finally k = 0 returns 0 on any input, and [] returns 0 on any k.',
    commonMistake:
      'Running the O(n * k) table with a huge k, or letting the buy transition read the cash value the same iteration just wrote for the same trade level.',
    whyWrong:
      'The unclamped table is correct and wasteful: on n = 1000 days with k = 100000 it performs a hundred million updates to report the number the rise sum gives in one pass, and the memory claim is the same story — a budget larger than the calendar can hold cannot bind, so half the axis is decoration. Reading cash[t] instead of cash[t - 1] for the buy is a correctness failure: it lets one trade level pay for its own second share, so on [1,2,1,2,1,2] with k = 2 it reports 3, which is the uncapped answer, on a contract whose true two-trade profit is 2. A third variant, seeding the holding state at 0 instead of negative infinity, treats an unpurchased share as free money: at k = 2 on [3,2,1,0,2] it reports 5 where the honest machine reports 2, because the very first sale is credited with the whole price of a share no buy ever paid for.',
    followUps: [
      'Derive the clamp k at n over 2 from the transition rules instead of from the story. Which transition makes a trade cost two days?',
      'Reduce the space to O(k), then to O(1) for a fixed small k. Which previous row is that code exactly?',
      'k arrives after the prices are known and queries come for many different k. What would you precompute, and what does one query then cost?',
      'Add a one-day cooldown to this machine. Which axis appears, and does the n over 2 clamp still describe the uncapped case?',
    ],
    solution:
      'function maxProfitKTransactions(prices, k) {\n' +
      '  const n = prices.length;\n' +
      '  if (n < 2 || k <= 0) return 0;\n' +
      '  if (k >= Math.floor(n / 2)) {\n' +
      '    let total = 0;\n' +
      '    for (let i = 1; i < n; i += 1) {\n' +
      '      const rise = prices[i] - prices[i - 1];\n' +
      '      if (rise > 0) total += rise;\n' +
      '    }\n' +
      '    return total;\n' +
      '  }\n' +
      '  const cash = new Array(k + 1).fill(0);\n' +
      '  const hold = new Array(k + 1).fill(-Infinity);\n' +
      '  for (let i = 0; i < n; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    for (let t = 1; t <= k; t += 1) {\n' +
      '      cash[t] = Math.max(cash[t], hold[t] + price);\n' +
      '      hold[t] = Math.max(hold[t], cash[t - 1] - price);\n' +
      '    }\n' +
      '  }\n' +
      '  return cash[k];\n' +
      '}\n' +
      '\n' +
      'function maxProfitUnbounded(prices) {\n' +
      '  let total = 0;\n' +
      '  for (let i = 1; i < prices.length; i += 1) {\n' +
      '    const rise = prices[i] - prices[i - 1];\n' +
      '    if (rise > 0) total += rise;\n' +
      '  }\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function maxProfitWithoutClamp(prices, k) {\n' +
      '  const n = prices.length;\n' +
      '  if (n === 0 || k <= 0) return 0;\n' +
      '  let updates = 0;\n' +
      '  const cash = new Array(k + 1).fill(0);\n' +
      '  const hold = new Array(k + 1).fill(-Infinity);\n' +
      '  for (let i = 0; i < n; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    for (let t = 1; t <= k; t += 1) {\n' +
      '      updates += 1;\n' +
      '      cash[t] = Math.max(cash[t], hold[t] + price);\n' +
      '      hold[t] = Math.max(hold[t], cash[t - 1] - price);\n' +
      '    }\n' +
      '  }\n' +
      '  return { profit: cash[k], updates: updates };\n' +
      '}',
    modify:
      'Charge a fixed commission at every sell as well as the trade cap. Which line takes the subtraction, and does the n over 2 clamp still describe the uncapped case?',
  },
  {
    step: 16,
    name: 'Buy and Sell Stock with Cooldown',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Unlimited trades but a day of rest after every sale: return the profit and name the state the rest day forces you to keep.',
    brief:
      'Input: a price array, empty and single-day inputs allowed. Output: the maximum total profit when no buy may happen on the day after a sell. The constraint that decides the approach is that the legality of a buy now depends on what happened yesterday, which is the one thing the earlier stock rows never had to look at.',
    concepts: [
      'dsa-dp16c-transition-not-new-dimension',
      'dsa-dp16c-stock-machine-states',
      'dsa-dp16c-state-shape-is-the-answer',
      'dsa-dp16c-rolling-array-shrinkage',
      'dsa-include-exclude-branch',
    ],
    shortAnswer:
      'Three states per day: resting with no share, holding a share, and having just sold. A sale may only be followed by the resting state, and the answer is the better of resting and just-sold on the last day — never holding.',
    idealAnswer:
      'The cooldown is not a fourth axis, and that is the row. With trades uncapped the machine was two states; a rule about the day after a sale needs a name for that day, so the not-holding side splits in two: rest, where a buy is legal, and sold, where it is not. The transitions are rest = max(previous rest, previous sold), hold = max(previous hold, rest - price), sold = previous hold + price. Three numbers, O(n) time, O(1) space, and no trade counter anywhere, because a counter would be describing a budget the contract never imposes. Two details carry the correctness. The answer is max(rest, sold), not rest: a sale on the final day is perfectly legal and its cooldown is owed by nobody, so a walk that returns rest reports 2 where the plan earns 3 on [1,2,3,0,2]. The buy transition reads rest and not sold, and that single pointer change is the cooldown written down — reading sold instead makes the rule invisible. Compare against the uncapped sibling: on [1,2,3,0,2] the answer falls from 4 to 3, because collecting the two small rises forces a sale on day 3 and forfeits the cheap buy the next morning.',
    walkthrough:
      'On [1,2,3,0,2] the states (rest, hold, sold) move as follows. Price 1: rest 0, hold -1, sold unreachable. Price 2: rest 0, hold -1, sold 1 — the share bought at 1 sold at 2. Price 3: rest becomes 1, promoted from the previous sold, hold stays -1 because buying at 3 from rest 0 is worse than the -1 already held, and sold becomes 2. Price 0: rest becomes 2, the better of the previous rest 1 and the previous sold 2; hold becomes 1, which is the previous rest 1 minus 0, and that buy is legal because the 1 was promoted from the sale on day 2 and day 3 was already the cooldown; sold becomes -1, the old share bought at 1 sold for nothing. Price 2: rest 2, hold 1, sold 3 from the share bought at 0. The answer is max(2, 3) = 3, and the plan is buy 1 sell 2, sit out day 3, buy 0 sell 2. Return rest alone and the answer is 2, discarding the final sale — the bug this row is graded on. The same walk on [3,2,1,0,2] keeps rest at 0 all the way, lifts hold to 0 by buying at 0, and reaches sold = 2, so the answer is 2 where returning rest says 0. The uncapped sibling on [1,2,3,0,2] reports 4 by collecting 1 + 1 + 2, so the cooldown costs exactly 1 here, while on [3,2,1,0,2] both machines report 2 because that series only ever holds one trade.',
    commonMistake:
      'Returning the resting state as the final answer, or letting the buy transition read the just-sold state so the cooldown can be skipped.',
    whyWrong:
      'Returning rest is a real loss on the named input: on [1,2,3,0,2] the optimal plan sells on the last day and its cooldown runs past the horizon, so rest at the end holds 2 while sold holds 3, and on [3,2,1,0,2] rest ends at 0 while the answer is 2. Reading sold for the buy transition converts the problem back into the uncapped row: buying at 0 the morning after selling at 3 yields 4 on [1,2,3,0,2], which the contract forbids, and the same slip on [1,2,1,2] reports 2 for a plan whose two trades touch. Adding a fourth state for the day before the cooldown is not wrong but wasteful — it carries a distinction the transitions never read, since rest already absorbs every not-holding day older than one.',
    followUps: [
      'Merge rest and sold into one not-holding state and keep a two-day lag instead. What has to be remembered explicitly, and is the space really smaller?',
      'Prove three states are enough. Which property of the rule keeps a fourth axis unnecessary even when the cooldown is two days?',
      'Extend to a cooldown of c days. How many states does that cost, and what does the buy transition read at day i?',
      'Strictly rising input [1,2,3,4,5]: what do the uncapped and the cooldown machines each report, and why is the gap what it is?',
    ],
    solution:
      'function maxProfitCooldown(prices) {\n' +
      '  let rest = 0;\n' +
      '  let hold = -Infinity;\n' +
      '  let sold = -Infinity;\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    const nextRest = Math.max(rest, sold);\n' +
      '    const nextHold = Math.max(hold, rest - price);\n' +
      '    const nextSold = hold === -Infinity ? -Infinity : hold + price;\n' +
      '    rest = nextRest;\n' +
      '    hold = nextHold;\n' +
      '    sold = nextSold;\n' +
      '  }\n' +
      '  return Math.max(rest, sold);\n' +
      '}\n' +
      '\n' +
      'function maxProfitCooldownRestOnly(prices) {\n' +
      '  let rest = 0;\n' +
      '  let hold = -Infinity;\n' +
      '  let sold = -Infinity;\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    const nextRest = Math.max(rest, sold);\n' +
      '    const nextHold = Math.max(hold, rest - price);\n' +
      '    const nextSold = hold === -Infinity ? -Infinity : hold + price;\n' +
      '    rest = nextRest;\n' +
      '    hold = nextHold;\n' +
      '    sold = nextSold;\n' +
      '  }\n' +
      '  return rest;\n' +
      '}\n' +
      '\n' +
      'function maxProfitNoCooldown(prices) {\n' +
      '  let cash = 0;\n' +
      '  let hold = -Infinity;\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    const sold = hold === -Infinity ? -Infinity : hold + price;\n' +
      '    const nextCash = Math.max(cash, sold);\n' +
      '    const nextHold = Math.max(hold, cash - price);\n' +
      '    cash = nextCash;\n' +
      '    hold = nextHold;\n' +
      '  }\n' +
      '  return cash;\n' +
      '}',
    modify:
      'Make the cooldown two days instead of one. Which states now need separate names, and what does the buy transition read?',
  },
  {
    step: 16,
    name: 'Buy and Sell Stock with Transaction Fee',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Unlimited trades with a fixed fee per completed round trip: give the best profit and show why trimming every rise is not the answer.',
    brief:
      'Input: a price array and a non-negative fee charged once per sale. Output: the maximum total profit. The constraint that decides the approach is that the fee is per trade rather than per unit of price, so the number of trades now changes the value of a plan and cannot be optimised afterwards.',
    concepts: [
      'dsa-dp16c-transition-not-new-dimension',
      'dsa-dp16c-stock-machine-states',
      'dsa-dp16c-state-shape-is-the-answer',
      'dsa-greedy-can-fail-to-answer-at-all',
      'dsa-kadane-reset',
    ],
    shortAnswer:
      'The same two states as the uncapped machine with the fee subtracted on the sell edge: cash = max(cash, hold + price - fee) and hold = max(hold, cash - price). One edge changes and no axis is added.',
    idealAnswer:
      'The fee edits an edge, not the state space: with trades uncapped the machine is still (day, holding), and the only change is that the sell transition pays. Because the charge is per trade rather than per unit, the optimal plan can prefer to hold through a dip instead of paying twice, so the number of trades is decided by the values rather than fixed in advance — which is exactly why this row cannot be answered by taking the uncapped rise sum and subtracting a fee per rise. The two states are cash, the best money at the end of a day owning nothing, and hold, the best value owning one share; hold starts at negative infinity so nothing can be sold before it is bought, and the answer is cash, because finishing in hold has paid for a share nobody will ever sell. Time O(n), space O(1), no trade axis. With fee = 0 the transitions are literally the uncapped ones, and that is the first check to run. The comparison that makes the argument is that skipping a trade can be worth more than taking it: on [1,3,2,8,4,9] with fee 2 the three-rise plan collects 13 - 6 = 7 while the two-trade plan buy 1 sell 8 plus buy 4 sell 9 collects 5 + 3 = 8, so the trimmed-greedy answer under-counts by one unit on that exact input.',
    walkthrough:
      'Walk [1,3,2,8,4,9] with fee 2 carrying (cash, hold). Price 1: no sale is possible, hold becomes -1, cash 0. Price 3: selling gives 3 - 1 - 2 = 0, so cash stays 0 — the machine refuses the obvious first flip because the fee eats it whole, and this refusal is where the greedy version and the table part company. Price 2: nothing improves; buying at 2 from cash 0 gives -2, worse than the -1 already held. Price 8: cash becomes 8 - 1 - 2 = 5, a single trade buy 1 sell 8. Price 4: hold becomes 5 - 4 = 1, which reads as 5 banked plus a share costing 4, so the machine rebuys immediately. Price 9: cash becomes max(5, 1 + 9 - 2) = 8. The answer is 8. The same series with fee 0 gives cash 13, exactly the rise sum 2 + 6 + 5, with the hold state improving on every dip rather than only on large ones — the collapse this row must reproduce. Now the wrong greedy on the identical input: collect every rise and subtract the fee per rise gives (2-2) + (6-2) + (5-2) = 0 + 4 + 3 = 7, one short of 8, because it insists on the 1-to-3 flip that the machine correctly declines and then pays a fee for it. On [1,2,3,4] with fee 1 the answer is 2, one rise of 3 minus one fee; with fee 10 every candidate sale is negative and the answer is 0, which is the input where doing nothing is the whole plan.',
    commonMistake:
      'Charging the fee on both the buy and the sell, or post-processing the uncapped rise sum by subtracting one fee per collected rise.',
    whyWrong:
      'Double charging prices each round trip at twice the fee, so on [1,3,2,8,4,9] with fee 2 the correct 8 comes out 4 — and the damage is not the scaling but the selection: a fee that is too expensive to pay twice makes the machine skip trades the contract would have allowed it to take. The post-processing version is subtler and is the assumption that the set of trades is chosen before the fee is applied; on the same input it reports 7 by taking three trades when the optimum takes two, earning the extra unit by refusing the 1-to-3 flip and holding through the dip at 2. The third variant, subtracting the fee only from rises that exceed it, fails on [1,2,10] with fee 2: dropping the one-unit rise and charging the eight-unit one gives 6, while the machine holds through and buys at 1 to sell at 10 for 7 — and on [1,2,1,2] with fee 1 it agrees with the honest answer of 0 only by accident, because there every rise is worth exactly the fee it would be charged.',
    followUps: [
      'Show that charging the fee on the buy instead of the sell leaves the answer unchanged. What exactly moves between the two transitions?',
      'Make the fee proportional to trade size rather than fixed. Which transition changes, and does any greedy rise-sum form come back?',
      'Give the input where a large fee makes this machine answer 0 while the uncapped machine answers large. What is the threshold fee?',
      'Streaming version: prices arrive one per tick with a fixed fee. What has to be carried between ticks, and why are two numbers enough?',
    ],
    solution:
      'function maxProfitWithFee(prices, fee) {\n' +
      '  let cash = 0;\n' +
      '  let hold = -Infinity;\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    const sold = hold === -Infinity ? -Infinity : hold + price - fee;\n' +
      '    const nextCash = Math.max(cash, sold);\n' +
      '    const nextHold = Math.max(hold, cash - price);\n' +
      '    cash = nextCash;\n' +
      '    hold = nextHold;\n' +
      '  }\n' +
      '  return cash;\n' +
      '}\n' +
      '\n' +
      'function maxProfitFeeBothEnds(prices, fee) {\n' +
      '  let cash = 0;\n' +
      '  let hold = -Infinity;\n' +
      '  for (let i = 0; i < prices.length; i += 1) {\n' +
      '    const price = prices[i];\n' +
      '    const sold = hold === -Infinity ? -Infinity : hold + price - fee;\n' +
      '    const nextCash = Math.max(cash, sold);\n' +
      '    const nextHold = Math.max(hold, cash - price - fee);\n' +
      '    cash = nextCash;\n' +
      '    hold = nextHold;\n' +
      '  }\n' +
      '  return cash;\n' +
      '}\n' +
      '\n' +
      'function riseSumMinusFeePerRise(prices, fee) {\n' +
      '  let total = 0;\n' +
      '  for (let i = 1; i < prices.length; i += 1) {\n' +
      '    const rise = prices[i] - prices[i - 1];\n' +
      '    if (rise > 0) total += rise - fee;\n' +
      '  }\n' +
      '  return total;\n' +
      '}',
    modify:
      'Charge the fee once per day on which any trade happens instead of once per sale. Which state has to know that today already traded?',
  },
  {
    step: 16,
    name: 'Longest Increasing Subsequence',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Return the length of the longest strictly increasing subsequence, and say precisely what the fast tails array does and does not give you.',
    brief:
      'Input: an array of integers, duplicates allowed, possibly empty or single-element. Output: the length of the longest subsequence whose values strictly increase. The constraint that decides the approach is what the answer is asked to be: a quadratic table prints the subsequence for free, while the n log n tails array answers a length and cannot print anything.',
    concepts: [
      'dsa-dp16c-best-ending-here-dp',
      'dsa-dp16c-patience-tails-are-not-the-answer',
      'dsa-lower-bound',
      'dsa-dp16c-state-shape-is-the-answer',
      'dsa-complexity-counting',
    ],
    shortAnswer:
      'Either dp[i] = 1 plus the best dp[j] over earlier smaller values, which is quadratic and remembers where each run came from, or keep a tails array where each value replaces the first tail not smaller than itself and the array length is the answer.',
    idealAnswer:
      'The two state definitions are the answer, and they are not interchangeable. dp[i] is the length of the longest increasing subsequence ending exactly at index i; the qualifier ending at i is what makes the value composable, because a run ending at i extends only from an earlier j whose value is smaller, and each such j offers dp[j] + 1. Scanning all j costs O(n squared) time and O(n) space, and dp is a genuine record: add a predecessor per index and the run prints itself. The patience form carries a different state — tails[L - 1] is the smallest possible ending value of any increasing subsequence of length L, a claim about existence rather than about a particular run. Each value binary-searches for the first tail not smaller than itself and overwrites it, or extends the array when nothing qualifies, so the pile count is the largest L with a witness: O(n log n) time and O(n) space. Both bounds are tight for their own state. The trap is the reading: an overwrite can land on an earlier pile than the one above it, so the final tails array is not a subsequence of the input at all — it answers a length question and nothing else. With duplicates, replacing at the lower bound rather than the upper bound enforces strict increase: a repeated value must overwrite instead of extending.',
    walkthrough:
      'On [10,9,2,5,3,7,101,18] the quadratic table gives dp = 1,1,1,2,2,3,4,4 and the answer 4. The tails array evolves as 10, then 9 overwrites it, then 2, then 2/5 when 5 extends, then 2/3 when 3 replaces 5, then 2/3/7, then 2/3/7/101, and finally 2/3/7/18 when 18 replaces 101 — four extensions and four overwrites for eight values, length 4, correct. That last step is the one to read aloud: 18 does not follow 101 in any increasing run, it follows 2, 3 and 7, which is why the tails array states how small the end of a length-4 run can be rather than which run it is. The case where the fiction is visible is [3,4,1]: the answer is 2, and the tails go 3, then 3/4, then 1/4 when 1 replaces 3 — the final array [1,4] is not a subsequence of [3,4,1] in that order, because 1 sits after 4 in the input. Duplicates decide the comparison operator: on [2,2] the second value must replace rather than extend, so the answer is 1, and using an upper bound instead would give 2. On a strictly increasing input [1,2,3,4] the array only ever grows — 1, 1/2, 1/2/3, 1/2/3/4 — so its contents happen to equal the answer, which is precisely the coincidence that misleads people into printing it. Empty input gives 0, [7] gives 1, and [0,1,0,3,2,3] gives 4.',
    commonMistake:
      'Returning the tails array as the subsequence, or using an upper bound so that equal values extend the run.',
    whyWrong:
      'The tails array is not a subsequence: on [3,4,1] it ends as [1,4], and the input contains no increasing subsequence reading 1 then 4, so printing it hands back numbers that never occurred in that order while the true answer is any run of length 2. Using an upper bound breaks strictness: on [2,2] it extends to length 2 and on [1,1,1] it grows to 3, both violating the contract, and the fix is to replace at the first tail not smaller than the value — the lower bound — which is what the binary search predicate encodes. A third failure is carrying the pile trick into the divisible-subset row, where the extension relation is not a total order on values and the invariant that makes the piles monotone no longer holds.',
    followUps: [
      'State the invariant tails encodes and prove it survives an overwrite. Why can replacing a tail never destroy information about the lengths already achieved?',
      'Your quadratic table can print the answer. What exactly would the n log n version have to store per pile to do the same, and is a pile index enough?',
      'For a strictly increasing input of length n, what does each version do per element and what is the total cost of each?',
      'The array arrives as a stream and only the length is wanted. Which version is the streaming one, and can its state be reduced further?',
    ],
    solution:
      'function lisLength(nums) {\n' +
      '  let best = 0;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i < nums.length; i += 1) {\n' +
      '    dp.push(1);\n' +
      '    for (let j = 0; j < i; j += 1) {\n' +
      '      if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) dp[i] = dp[j] + 1;\n' +
      '    }\n' +
      '    if (dp[i] > best) best = dp[i];\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function lowerBoundIndex(tails, value) {\n' +
      '  let low = 0;\n' +
      '  let high = tails.length;\n' +
      '  while (low < high) {\n' +
      '    const mid = (low + high) >> 1;\n' +
      '    if (tails[mid] < value) low = mid + 1;\n' +
      '    else high = mid;\n' +
      '  }\n' +
      '  return low;\n' +
      '}\n' +
      '\n' +
      'function patienceTails(nums) {\n' +
      '  const tails = [];\n' +
      '  for (let i = 0; i < nums.length; i += 1) {\n' +
      '    const at = lowerBoundIndex(tails, nums[i]);\n' +
      '    if (at === tails.length) tails.push(nums[i]);\n' +
      '    else tails[at] = nums[i];\n' +
      '  }\n' +
      '  return tails;\n' +
      '}\n' +
      '\n' +
      'function lisLengthFast(nums) {\n' +
      '  return patienceTails(nums).length;\n' +
      '}\n' +
      '\n' +
      'function isSubsequenceList(host, picks) {\n' +
      '  let k = 0;\n' +
      '  for (let i = 0; i < host.length && k < picks.length; i += 1) {\n' +
      '    if (host[i] === picks[k]) k += 1;\n' +
      '  }\n' +
      '  return k === picks.length;\n' +
      '}',
    modify:
      'Change the contract to non-decreasing instead of strictly increasing. Which single comparison flips, and what does the answer become on [2, 2, 1]?',
  },
  {
    step: 16,
    name: 'Printing Longest Increasing Subsequence',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Print an actual longest increasing subsequence rather than its length, and name the tie-break that makes the printed run deterministic.',
    brief:
      'Input: an array of integers, duplicates allowed, with an answer that may not be unique. Output: one longest strictly increasing subsequence as values in input order, plus the dp and predecessor tables that justify it. The constraint that decides the approach is that a length-only state cannot be printed, so the pointer the fast version throws away has to be stored.',
    concepts: [
      'dsa-dp16c-predecessor-array-prints-the-chain',
      'dsa-dp16c-best-ending-here-dp',
      'dsa-dp16c-patience-tails-are-not-the-answer',
      'dsa-loop-invariant',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      'Fill dp[i] as the best length ending at i while recording prev[i] as the index that offered it, take the argmax index, then walk prev backwards and reverse: the printed run is the chain from that argmax.',
    idealAnswer:
      'Printing is a pointer problem, not a recurrence problem: the quadratic scan already visits every candidate extension, so recording which j won costs one predecessor per index, the runs become a forest of chains rooted at the single-element cases, and walking prev from the argmax reproduces one run. Cost stays O(n squared) time and the space that was one array becomes two — the price of a sequence answer over a number. Two details decide whether the printed run is legitimate. First the argmax tie-break: when two indices share the maximum length, choosing the smallest index prints the earliest-ending run and is deterministic, while an unordered scan could print either and change the answer between runs. Second, prev must be written inside the comparison that updates dp, so pointer and length can never disagree — recovering it afterwards from the dp values means re-deciding the tie-break and hoping it matches. The relation to the previous row is the trap this pair teaches: on [10,9,2,5,3,7,101,18] the tails end as 2,3,7,18 while the first-max walk prints 2,5,7,101 and the last-max walk 2,5,7,18 — three legal runs of length 4, so the tie-break must be a rule and not a result — while on [3,4,1] the tails array 1,4 is not legal at all, which is why printing uses the quadratic table.',
    walkthrough:
      'On [10,9,2,5,3,7,101,18] the scan fills dp = 1,1,1,2,2,3,4,4 and prev = -1,-1,-1,2,2,3,5,5: index 3 holds value 5 with length 2 taken from index 2, index 4 holds 3 also from index 2, index 5 holds 7 with length 3 from index 3, and both 101 and 18 claim length 4 from index 5. The maximum length 4 first appears at index 6, so the smallest-index argmax is 6, and the backward walk reads 6, then prev 5, then 3, then 2, then -1; reversing prints 2, 5, 7, 101, where every step is a real index increase and a real value increase — which is what a tails array cannot promise. Had the tie-break taken the last maximum, index 7, the walk would read 7, 5, 3, 2 and print 2, 5, 7, 18, a different legal run of length 4 that is not the printed one, which is why the rule has to be named rather than the run. On [3,4,1] the table is dp = 1,2,1 with prev = -1,0,-1, argmax 1, so the printed run is 3, 4 — a real subsequence of length 2, where the tails array there read 1, 4. The edges: an empty array has end = -1 and prints nothing, [7] prints 7, and [2,2] prints a single 2 because the second element extends nothing under a strict comparison; a strictly decreasing input keeps every dp at 1, so the argmax rule picks index 0 and prints its value alone.',
    commonMistake:
      'Reading the chain off the patience piles, or walking prev from an index whose dp is not the maximum.',
    whyWrong:
      'The pile version is not a subsequence: on [3,4,1] the pile tops are 1 and 4, so printing them gives a run whose first element appears after its second in the input, and a caller who checks indices finds nothing. Starting the walk anywhere but a maximal index silently prints a shorter run, because prev only ever leads to shorter chains: on the eight-value example, walking from index 3 prints 2, 5 and the answer looks like 2 instead of 4. And an unstated argmax tie-break is a broken test rather than a wrong answer — first-max prints 2,5,7,101 and last-max prints 2,5,7,18 on the same input, so any assertion about the exact printed list needs the rule written down before the code.',
    followUps: [
      'Can the predecessor information be attached to the patience version without returning to quadratic? What has to be stored per pile, and is a pile index enough?',
      'Count the distinct longest increasing subsequences instead of printing one. Which of the two tables generalises, and what does the base case become?',
      'Print the run in reverse input order without building an extra array. Which loop does the unwinding become, and what is the space?',
      'Adversarial: a strictly decreasing input of length n. What do dp, prev and the printed run look like, and which tie-break is doing the work?',
    ],
    solution:
      'function lisTableWithPredecessors(nums) {\n' +
      '  const dp = [];\n' +
      '  const prev = [];\n' +
      '  let end = -1;\n' +
      '  for (let i = 0; i < nums.length; i += 1) {\n' +
      '    dp.push(1);\n' +
      '    prev.push(-1);\n' +
      '    for (let j = 0; j < i; j += 1) {\n' +
      '      if (nums[j] < nums[i] && dp[j] + 1 > dp[i]) {\n' +
      '        dp[i] = dp[j] + 1;\n' +
      '        prev[i] = j;\n' +
      '      }\n' +
      '    }\n' +
      '    if (end === -1 || dp[i] > dp[end]) end = i;\n' +
      '  }\n' +
      '  return { dp: dp, prev: prev, end: end };\n' +
      '}\n' +
      '\n' +
      'function printingLis(nums) {\n' +
      '  const table = lisTableWithPredecessors(nums);\n' +
      '  if (table.end === -1) return [];\n' +
      '  const out = [];\n' +
      '  for (let k = table.end; k !== -1; k = table.prev[k]) out.push(nums[k]);\n' +
      '  return out.reverse();\n' +
      '}\n' +
      '\n' +
      'function isSubsequenceList(host, picks) {\n' +
      '  let k = 0;\n' +
      '  for (let i = 0; i < host.length && k < picks.length; i += 1) {\n' +
      '    if (host[i] === picks[k]) k += 1;\n' +
      '  }\n' +
      '  return k === picks.length;\n' +
      '}\n' +
      '\n' +
      'function isStrictlyIncreasing(values) {\n' +
      '  for (let i = 1; i < values.length; i += 1) {\n' +
      '    if (values[i] <= values[i - 1]) return false;\n' +
      '  }\n' +
      '  return true;\n' +
      '}',
    modify:
      'Print the lexicographically smallest longest increasing subsequence rather than the one that ends earliest. Which choice in the scan changes, and what extra comparison does it need?',
  },
  {
    step: 16,
    name: 'Largest Divisible Subset',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'From distinct positive integers, return the largest subset in which every pair divides evenly — and say why checking pairs is unnecessary.',
    brief:
      'Input: an array of distinct positive integers in arbitrary order, possibly empty, possibly with no divisibility at all. Output: one largest subset satisfying the pairwise condition. The constraint that decides the approach is that the divisibility relation is transitive on a sorted array, which turns a test over all pairs into a test against the tail of a chain.',
    concepts: [
      'dsa-dp16c-transitive-relation-collapses-the-check',
      'dsa-dp16c-best-ending-here-dp',
      'dsa-dp16c-predecessor-array-prints-the-chain',
      'dsa-index-order-loss',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      'Sort ascending, then run the ending-at-i table with the extension test nums[i] % nums[j] === 0: because the candidate is already a chain, one modulus against its largest element proves every pair in the enlarged subset.',
    idealAnswer:
      'The condition quantifies over every pair, so this row turns on seeing the transitivity that a naive subset search does not need: if x divides y and y divides z then x divides z. Sort ascending and ask the same state the LIS rows ask — dp[i] is the largest legal subset whose largest element is nums[i] — and the extension test against one candidate predecessor is sufficient, because everything counted by dp[j] already divides nums[j], and if nums[j] divides nums[i] then all of them divide nums[i]; nums[i] is the largest element, so the reverse direction is settled by construction. That makes this LIS machinery with the comparison replaced by a modulus: O(n squared) time and O(n) space, with prev recording which chain won so the subset is printable, and the sort costing O(n log n) while destroying input order, which is legal because a subset has no order. Without transitivity the one-modulus test would be a bug rather than a trick — the same code over a relation like differing by at most one silently over-counts, because a chain of near-neighbours is not a set of mutual near-neighbours. Edges: the empty array yields the empty subset, a single element yields it because a one-element subset satisfies a pairwise condition vacuously, and pairwise coprime values yield one element.',
    walkthrough:
      'Feed in [4,8,10,9]: sorted it reads 4, 8, 9, 10, dp is 1, 2, 1, 1 and prev is -1, 0, -1, -1, so the maximum is 2 at index 1 and the walk prints 4, 8 — 4 divides 8, while 10 is divisible by neither 4 nor 8 and 9 by nothing here. On [1,2,3] the table reads dp 1, 2, 2 with prev -1, 0, 0, the first maximum is index 1, so the printed answer is 1, 2, and 1, 3 is equally legal — the tie-break chooses, not the recurrence. On [3,5,7] no modulus is ever zero, every dp stays 1, the earliest argmax is index 0, and the answer is the single value 3, which is right because the pair 3 and 5 already fails. Where transitivity pays is [2,3,4,8,9,72]: sorted 2, 3, 4, 8, 9, 72 gives dp 1, 1, 2, 3, 2, 4 with prev -1, -1, 0, 2, 1, 3, and the chain from index 5 walks 72 back through 8, 4 and 2, printing 2, 4, 8, 72. Only three moduli were ever checked on that path — 4 by 2, 8 by 4 and 72 by 8 — yet the printed subset has six pairs, and the test 72 % 2 was never performed: it followed from 2 dividing 4 dividing 8 dividing 72. An empty input leaves the table with end = -1 and prints the empty subset, and [1] prints 1 because a single element satisfies the condition with nothing to check.',
    commonMistake:
      'Testing the newcomer against every element of the candidate subset, or skipping the sort and testing divisibility in input order.',
    whyWrong:
      'The all-pairs check answers the question literally and forfeits the argument: on [2,3,4,8,9,72] the chain 2, 4, 8 already certifies that 2 divides 8, so re-testing every pair is a modulus per member for information transitivity supplies free — and if instead you enumerate subsets to be safe, the search is exponential in n. Skipping the sort is a correctness failure: on distinct positive integers divisibility always runs from the smaller to the larger, so on input order [8,2,4] the scan can never extend 8 downwards, dp ends as 1, 1, 2 and the printed answer is 2, 4 while the true subset 2, 4, 8 needs 4 scanned before 8. A third slip is reporting the argmax value instead of walking prev, which returns the largest element of the subset rather than the subset.',
    followUps: [
      'Point at the exact line where transitivity is used, then name a relation that is not transitive and show the same code over-counts on it.',
      'Sort descending instead. Which transition has to be rewritten, and does the printed subset change?',
      'Now every answer element must also divide a fixed bound. Where does the filter go, and does the table still hold?',
      'Report how many largest subsets exist rather than one. Which combine replaces the maximum, and what does the base case become?',
    ],
    solution:
      'function divisibleTable(nums) {\n' +
      '  const sorted = nums.slice().sort(function (x, y) { return x - y; });\n' +
      '  const dp = [];\n' +
      '  const prev = [];\n' +
      '  let end = -1;\n' +
      '  for (let i = 0; i < sorted.length; i += 1) {\n' +
      '    dp.push(1);\n' +
      '    prev.push(-1);\n' +
      '    for (let j = 0; j < i; j += 1) {\n' +
      '      if (sorted[i] % sorted[j] === 0 && dp[j] + 1 > dp[i]) {\n' +
      '        dp[i] = dp[j] + 1;\n' +
      '        prev[i] = j;\n' +
      '      }\n' +
      '    }\n' +
      '    if (end === -1 || dp[i] > dp[end]) end = i;\n' +
      '  }\n' +
      '  return { sorted: sorted, dp: dp, prev: prev, end: end };\n' +
      '}\n' +
      '\n' +
      'function largestDivisibleSubset(nums) {\n' +
      '  const table = divisibleTable(nums);\n' +
      '  const out = [];\n' +
      '  for (let k = table.end; k !== -1; k = table.prev[k]) out.unshift(table.sorted[k]);\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function everyPairDivides(values) {\n' +
      '  for (let i = 0; i < values.length; i += 1) {\n' +
      '    for (let j = i + 1; j < values.length; j += 1) {\n' +
      '      const big = Math.max(values[i], values[j]);\n' +
      '      const small = Math.min(values[i], values[j]);\n' +
      '      if (big % small !== 0) return false;\n' +
      '    }\n' +
      '  }\n' +
      '  return true;\n' +
      '}',
    modify:
      'Allow duplicates, where equal values divide each other. Does the strict comparison or the modulus let them in, and what does the printed subset become on [2, 2, 4]?',
  },
  {
    step: 16,
    name: 'Longest String Chain',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Over a list of words, return the longest chain in which each word becomes the next by adding one letter anywhere, and say what makes one sweep enough.',
    brief:
      'Input: a list of distinct lowercase words of assorted lengths, possibly including the empty word. Output: the length of the longest chain where each step adds exactly one character, plus the chain itself. The constraint that decides the approach is the order the sweep needs: a word can only ever extend a strictly shorter word.',
    concepts: [
      'dsa-dp16c-topological-order-enables-the-sweep',
      'dsa-dp16c-predecessor-array-prints-the-chain',
      'dsa-dp16c-best-ending-here-dp',
      'dsa-hash-frequency',
      'dsa-order-preserving-split',
    ],
    shortAnswer:
      'Sort by length, then for each word try all of its one-character deletions, take the largest chain length found in a hash of already-solved words, store that plus one, and record which deletion won so the chain can be printed.',
    idealAnswer:
      'The relation is a directed acyclic graph — an edge runs from a word to a word exactly one character longer — and the state is the same ending-here length as the LIS rows, with the predecessor enumeration replaced by deletions instead of earlier indices. Two moves replace the quadratic scan. First, sorting by length is a topological order: every possible predecessor of a word is shorter, so when the cursor reaches a word all of them have already been solved and stored, which is why one sweep with a hash of best lengths answers the whole list rather than recursing over it. Second, the predecessors of a word are exactly its length-plus-one one-deletion variants, so the fan-in is generated by slicing instead of by scanning the word list, giving O(W * L squared) time and O(W * L) space for W words of length up to L. If the chain has to be printed, the pointer must be stored next to the length, and the reduction over deletions must be a maximum rather than a first hit, because a word can have several legal predecessors and only the deepest one carries the chain. The edge contract is small but load-bearing: the empty word has no deletions and seeds at 1, duplicates must not inflate the answer because a chain step strictly increases length, and a single-word list answers 1.',
    walkthrough:
      'On ["a","b","ba","bca","bda","bdca"] the length sort keeps that order and the hash fills: a = 1, b = 1, ba = 2 — its deletions "a" and "b" are both at 1, so the first wins — bca = 3, whose deletions "ca", "ba", "bc" leave only "ba" at 2, bda = 3 from the middle deletion "ba" since "da" and "bd" are absent, and bdca = 4 from two candidates at 3 where the first, "bca", is taken. The best chain is 4, and walking the stored pointers back from bdca reads bdca, bca, ba, a, so the printed chain is a, ba, bca, bdca — one insertion per step. That bda row punishes a first-hit search: its deletion at position 0, "da", is absent, so returning the first predecessor found would work only by accident. Change the list to ["b","ba","da","bda"] and the accident disappears: the deletion at position 0 is "da", solved at length 1, while position 1 gives "ba" at length 2, so a first-hit search prints a chain of 2 where the answer is 3. On ["xbc","pcxbcf","xb","cxbc","pcxbc"] the sorted order is xb, xbc, cxbc, pcxbc, pcxbcf and each word has exactly one deletion present, so the hash reads 1, 2, 3, 4, 5 and the chain is the whole list. Duplicates such as ["a","a","a"] answer 1 because a chain step must lengthen the word, and [""] answers 1 from the seed rule.',
    commonMistake:
      'Scanning the whole word list for a predecessor of each word, or accepting the first deletion that exists in the set instead of the one with the longest chain.',
    whyWrong:
      'The scan is a cost failure with a correctness tail: comparing every word against every other is O(W squared * L) and forfeits the only reason sorting by length was worth doing, which is that shorter words are already solved and a hash lookup replaces the scan. The first-hit search is a wrong answer on the named input: on ["b","ba","da","bda"] the deletions of "bda" in position order are "da" at chain length 1 then "ba" at 2, so stopping at the first hit answers 2 while the recurrence is 1 + max over all deletions = 3. A third slip is chaining words of equal length, which the strict length ordering forbids: allowing a same-length step makes the graph cyclic and the one-deletion fan-in is no longer finite.',
    followUps: [
      'Prove that sorting by length is a topological order of this graph. Which edge direction would break the argument if the step became a deletion instead of an insertion?',
      'Generate predecessors by trying insertions of all 26 letters instead of deletions. What does each version cost per word, and which wins for long words?',
      'Now the chain must start at a given word. Which part of the sweep changes, and can it still be one pass?',
      'Words arrive as a stream and queries ask for the chain length of the prefix seen so far. What has to be recomputed, and what does the hash cost you?',
    ],
    solution:
      'function chainLengths(words) {\n' +
      '  const sorted = words.slice().sort(function (x, y) { return x.length - y.length; });\n' +
      '  const best = new Map();\n' +
      '  const from = new Map();\n' +
      '  let answer = 0;\n' +
      '  for (let i = 0; i < sorted.length; i += 1) {\n' +
      '    const word = sorted[i];\n' +
      '    let longest = 0;\n' +
      '    let parent = null;\n' +
      '    for (let cut = 0; cut < word.length; cut += 1) {\n' +
      '      const smaller = word.slice(0, cut) + word.slice(cut + 1);\n' +
      '      const held = best.get(smaller);\n' +
      '      if (held !== undefined && held > longest) {\n' +
      '        longest = held;\n' +
      '        parent = smaller;\n' +
      '      }\n' +
      '    }\n' +
      '    best.set(word, longest + 1);\n' +
      '    from.set(word, parent);\n' +
      '    if (longest + 1 > answer) answer = longest + 1;\n' +
      '  }\n' +
      '  return { best: best, from: from, answer: answer };\n' +
      '}\n' +
      '\n' +
      'function longestStringChain(words) {\n' +
      '  if (words.length === 0) return 0;\n' +
      '  return chainLengths(words).answer;\n' +
      '}\n' +
      '\n' +
      'function stringChainOf(words) {\n' +
      '  if (words.length === 0) return [];\n' +
      '  const solved = chainLengths(words);\n' +
      '  let head = null;\n' +
      '  for (const entry of solved.best) {\n' +
      '    if (head === null || entry[1] > solved.best.get(head)) head = entry[0];\n' +
      '  }\n' +
      '  const out = [];\n' +
      '  for (let word = head; word !== null && word !== undefined; word = solved.from.get(word)) out.push(word);\n' +
      '  return out.reverse();\n' +
      '}\n' +
      '\n' +
      'function isChainStep(shorter, longer) {\n' +
      '  if (longer.length !== shorter.length + 1) return false;\n' +
      '  let i = 0;\n' +
      '  let skipped = false;\n' +
      '  for (let j = 0; j < longer.length; j += 1) {\n' +
      '    if (i < shorter.length && shorter[i] === longer[j]) {\n' +
      '      i += 1;\n' +
      '    } else if (skipped) {\n' +
      '      return false;\n' +
      '    } else {\n' +
      '      skipped = true;\n' +
      '    }\n' +
      '  }\n' +
      '  return i === shorter.length;\n' +
      '}',
    modify:
      'Count the number of longest chains rather than returning one of them. Which accumulator replaces the pointer, and what does the base case become for the empty word?',
  },
];

export const expects: Record<string, string> = {
  'Shortest Common Supersequence':
    '(() => { const ab = shortestCommonSupersequence("abc","acb"); const cab = shortestCommonSupersequence("abac","cab"); return ab === "abcb" && ab.length === scsLength("abc","acb") && scsLength("abc","acb") === 4 && lcsLength("abc","acb") === 2 && isSubsequenceOf(ab, "abc") === true && isSubsequenceOf(ab, "acb") === true && cab === "cabac" && cab.length === scsLength("abac","cab") && scsLength("aggtab","gxtxayb") === 9 && isSubsequenceOf(shortestCommonSupersequence("aggtab","gxtxayb"), "aggtab") === true && shortestCommonSupersequence("", "a") === "a" && scsLength("abc","abc") === 3; })()',
  'Distinct Subsequences':
    '(() => { const t = distinctSubsequencesTable("rabbbit","rabbit"); return distinctSubsequences("rabbbit","rabbit") === 3 && t[4][3] === 2 && t[5][3] === 3 && t[4][0] === 1 && distinctSubsequences("babgbag","bag") === 5 && distinctSubsequences("aaa","aa") === 3 && distinctSubsequences("abc","abc") === 1 && distinctSubsequences("abc","d") === 0 && distinctSubsequences("abc","abcd") === 0 && distinctSubsequences1d("rabbbit","rabbit") === 3 && distinctSubsequences1d("babgbag","bag") === 5 && distinctSubsequences1d("abc","") === 1; })()',
  'Edit Distance':
    '(() => { const t = editDistanceTable("horse","ros"); const ops = editOperations("horse","ros"); return editDistance("horse","ros") === 3 && t[5][3] === 3 && t[4][3] === 2 && t[0][3] === 3 && editDistanceRolling("horse","ros") === 3 && editDistanceRolling("abc","") === 3 && editDistance("", "abc") === 3 && editDistance("abc","abc") === 0 && editDistance("ab","ba") === 2 && editDistance("intention","execution") === 5 && editDistance("kitten","sitting") === 3 && ops.length === 5 && ops.join(" | ") === "replace h with r | keep o | delete r | keep s | delete e"; })()',
  'Wildcard Matching':
    '(() => { const table = wildcardMatchTable("adceb","*a*b"); return wildcardMatch("adceb","*a*b") === true && table === true && wildcardMatch("acdcb","a*c?b") === false && wildcardMatchTable("acdcb","a*c?b") === false && wildcardMatch("","*") === true && wildcardMatch("","") === true && wildcardMatch("aa","a") === false && wildcardMatch("a","ab*") === false && wildcardMatch("aa","*") === true && wildcardMatch("abcd","a*b?d") === true && wildcardMatch("abc","?***b*") === true && wildcardMatchTable("abc","?***b*") === true && collapseStars("**a**b**") === "*a*b*" && wildcardMatch("abc", collapseStars("**a**b**")) === true; })()',
  'Best Time to Buy and Sell Stock':
    '(() => { const series = [7,1,5,3,6,4]; return maxProfitOne(series) === 5 && maxProfitPairEnumerated(series) === 5 && maxProfitMachine(series, 1) === 5 && maxProfitMachine(series, 2) === 7 && maxProfitOne([7,6,4,1]) === 0 && maxProfitMaxMinusMin([7,6,4,1]) === 6 && maxProfitOne([1,2,4,3,5]) === 4 && maxProfitMachine([1,2,4,3,5], 2) === 5 && maxProfitOne([2,1,2,1,0,1]) === 1 && maxProfitMaxMinusMin([2,1,2,1,0,1]) === 2 && maxProfitOne([3]) === 0 && maxProfitOne([]) === 0 && maxProfitOne([1,1,1,1]) === 0; })()',
  'Buy and Sell Stock - II':
    '(() => { const hills = [1,2,4,3,5]; const saw = [3,2,1,0,2]; return maxProfitUnlimited(hills) === 5 && maxProfitTwoState(hills) === 5 && maxProfitSingle(hills) === 4 && maxProfitUnlimited(saw) === 2 && maxProfitTwoState(saw) === 2 && maxProfitHoldInitialisedAtZero(saw) === 5 && maxProfitTwoState([1,1,1]) === 0 && maxProfitHoldInitialisedAtZero([1,1,1]) === 1 && maxProfitUnlimited([1,2,1,2,1,2]) === 3 && maxProfitTwoState([1,2,1,2,1,2]) === 3 && maxProfitUnlimited([]) === 0 && maxProfitTwoState([]) === 0 && maxProfitSingle(saw) === 2; })()',
  'Buy and Sell Stock - III':
    '(() => { const cap = [3,3,5,0,0,3,1,4]; const saw = [1,2,1,2,1,2]; return maxProfitAtMostTwo(cap) === 6 && maxProfitK(cap, 1) === 4 && maxProfitK(cap, 2) === 6 && maxProfitAtMostTwo(saw) === 2 && maxProfitK(saw, 3) === 3 && maxProfitAtMostTwo([1,2,4,3,5]) === 5 && maxProfitAtMostTwo([1,2,4,1,5]) === 7 && maxProfitPrefixSuffix([1,2,4,1,5]) === 7 && maxProfitPrefixSuffix(cap) === 6 && maxProfitK([2,4,1], 2) === 2 && maxProfitAtMostTwo([7,6,4,1]) === 0 && maxProfitAtMostTwo([]) === 0; })()',
  'Buy and Sell Stock - IV':
    '(() => { const series = [3,2,6,5,0,3]; const saw = [1,2,1,2,1,2]; const huge = maxProfitWithoutClamp([1,2,3,4,5], 100); return maxProfitKTransactions(series, 2) === 7 && maxProfitKTransactions(series, 1) === 4 && maxProfitKTransactions(series, 5) === 7 && maxProfitKTransactions([2,4,1], 2) === 2 && maxProfitKTransactions([1,2,3,4,5], 100) === 4 && huge.profit === 4 && huge.updates === 500 && maxProfitKTransactions(saw, 3) === 3 && maxProfitKTransactions(saw, 2) === 2 && maxProfitUnbounded(saw) === 3 && maxProfitKTransactions([1,2,4,3,5], 0) === 0 && maxProfitKTransactions([], 5) === 0; })()',
  'Buy and Sell Stock with Cooldown':
    '(() => { const dip = [1,2,3,0,2]; const fall = [3,2,1,0,2]; return maxProfitCooldown(dip) === 3 && maxProfitCooldownRestOnly(dip) === 2 && maxProfitNoCooldown(dip) === 4 && maxProfitCooldown(fall) === 2 && maxProfitCooldownRestOnly(fall) === 0 && maxProfitNoCooldown(fall) === 2 && maxProfitCooldown([1,2,1,2]) === 1 && maxProfitNoCooldown([1,2,1,2]) === 2 && maxProfitCooldown([1,2,3,4,5]) === 4 && maxProfitNoCooldown([1,2,3,4,5]) === 4 && maxProfitCooldown([]) === 0 && maxProfitCooldown([5]) === 0; })()',
  'Buy and Sell Stock with Transaction Fee':
    '(() => { const p = [1,3,2,8,4,9]; return maxProfitWithFee(p, 2) === 8 && maxProfitWithFee(p, 0) === 13 && riseSumMinusFeePerRise(p, 2) === 7 && maxProfitFeeBothEnds(p, 2) === 4 && maxProfitWithFee([1,2,3,4], 1) === 2 && maxProfitWithFee([1,2,3,4], 10) === 0 && maxProfitWithFee([1,2,1,2], 1) === 0 && riseSumMinusFeePerRise([1,2,1,2], 1) === 0 && maxProfitWithFee([1,3,2,8,4,9], 2) > riseSumMinusFeePerRise([1,3,2,8,4,9], 2) && maxProfitWithFee([1,2,10], 2) === 7 && riseSumMinusFeePerRise([1,2,10], 2) === 5 && maxProfitWithFee([], 2) === 0 && maxProfitWithFee([1], 1) === 0; })()',
  'Longest Increasing Subsequence':
    '(() => { const p = [10,9,2,5,3,7,101,18]; const fake = patienceTails([3,4,1]); return lisLength(p) === 4 && lisLengthFast(p) === 4 && patienceTails(p).join(",") === "2,3,7,18" && lowerBoundIndex([2,3,7], 3) === 1 && lowerBoundIndex([2,3,7], 8) === 3 && fake.join(",") === "1,4" && lisLength([3,4,1]) === 2 && isSubsequenceList([3,4,1], fake) === false && lisLength([2,2]) === 1 && lisLengthFast([2,2]) === 1 && lisLength([]) === 0 && lisLength([0,1,0,3,2,3]) === 4 && patienceTails([1,2,3,4]).join(",") === "1,2,3,4"; })()',
  'Printing Longest Increasing Subsequence':
    '(() => { const p = [10,9,2,5,3,7,101,18]; const table = lisTableWithPredecessors(p); const run = printingLis(p); return table.dp.join(",") === "1,1,1,2,2,3,4,4" && table.prev.join(",") === "-1,-1,-1,2,2,3,5,5" && table.end === 6 && table.dp[7] === 4 && run.join(",") === "2,5,7,101" && isSubsequenceList(p, run) === true && isStrictlyIncreasing(run) === true && run.length === 4 && printingLis([3,4,1]).join(",") === "3,4" && printingLis([2,2]).join(",") === "2" && printingLis([5,4,3]).join(",") === "5" && printingLis([7]).join(",") === "7" && printingLis([]).length === 0 && lisTableWithPredecessors([]).end === -1; })()',
  'Largest Divisible Subset':
    '(() => { const six = largestDivisibleSubset([2,3,4,8,9,72]); const t = divisibleTable([4,8,10,9]); return six.join(",") === "2,4,8,72" && six.length === 4 && everyPairDivides(six) === true && t.dp.join(",") === "1,2,1,1" && t.prev.join(",") === "-1,0,-1,-1" && t.sorted.join(",") === "4,8,9,10" && t.end === 1 && largestDivisibleSubset([1,2,3]).join(",") === "1,2" && largestDivisibleSubset([3,5,7]).join(",") === "3" && largestDivisibleSubset([8,2,4]).join(",") === "2,4,8" && largestDivisibleSubset([]).length === 0 && largestDivisibleSubset([1]).join(",") === "1" && everyPairDivides([2,3]) === false; })()',
  'Longest String Chain':
    '(() => { const w = ["a","b","ba","bca","bda","bdca"]; const five = ["xbc","pcxbcf","xb","cxbc","pcxbc"]; const solved = chainLengths(w); return longestStringChain(w) === 4 && solved.best.get("bda") === 3 && solved.best.get("bdca") === 4 && stringChainOf(w).join(",") === "a,ba,bca,bdca" && longestStringChain(["b","ba","da","bda"]) === 3 && longestStringChain(five) === 5 && stringChainOf(five).join(",") === "xb,xbc,cxbc,pcxbc,pcxbcf" && longestStringChain(["a","a","a"]) === 1 && longestStringChain([""]) === 1 && longestStringChain([]) === 0 && isChainStep("ba","bca") === true && isChainStep("ab","bca") === false; })()',
};
