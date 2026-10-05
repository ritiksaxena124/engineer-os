import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';

/**
 * Step 18a — the first half of the string-matching step: the six rows that stop comparing a pattern
 * against a window over and over and start writing down what has already been compared. The Z array
 * and the KMP prefix table are the same idea aimed at two different questions, the palindrome row is
 * that table read at one cell, the two Rabin-Karp rows trade certainty for an O(1) window update, and
 * Count and Say is here to catch everyone who calls a run-length loop a dynamic program.
 */

/** The KMP prefix table, shared by the KMP row and the palindrome row. */
const lpsTable =
  'function buildLps(pattern) {\n' +
  '  const lps = new Array(pattern.length).fill(0);\n' +
  '  let length = 0;\n' +
  '  for (let i = 1; i < pattern.length; i += 1) {\n' +
  '    while (length > 0 && pattern[i] !== pattern[length]) length = lps[length - 1];\n' +
  '    if (pattern[i] === pattern[length]) length += 1;\n' +
  '    lps[i] = length;\n' +
  '  }\n' +
  '  return lps;\n' +
  '}\n';

/**
 * The rolling-hash scaffolding shared by the two Rabin-Karp rows. Base 26 and modulus 997 are toy
 * parameters on purpose: they keep the window arithmetic small enough to trace by hand, and they
 * collide often enough that the verification step is visibly load-bearing.
 */
const rollingHash =
  'const RB = 26;\n' +
  'const MOD = 997;\n' +
  '\n' +
  'function digitOf(ch) {\n' +
  '  return ch.charCodeAt(0) - 96;\n' +
  '}\n' +
  '\n' +
  'function hashOf(word) {\n' +
  '  let value = 0;\n' +
  '  for (let i = 0; i < word.length; i += 1) value = (value * RB + digitOf(word[i])) % MOD;\n' +
  '  return value;\n' +
  '}\n' +
  '\n' +
  'function leadingWeight(m) {\n' +
  '  let w = 1;\n' +
  '  for (let i = 1; i < m; i += 1) w = (w * RB) % MOD;\n' +
  '  return w;\n' +
  '}\n' +
  '\n' +
  'function windowMatches(text, at, pattern) {\n' +
  '  for (let k = 0; k < pattern.length; k += 1) {\n' +
  '    if (text[at + k] !== pattern[k]) return false;\n' +
  '  }\n' +
  '  return true;\n' +
  '}\n';

export const concepts: Record<string, ConceptSpec> = {
  "dsa-str18-prefix-table-reuses-compared-work": {
    slug: "dsa-str18-prefix-table-reuses-compared-work",
    name: "A prefix table is a receipt for comparisons already paid",
    detail:
      "z[i] and lps[i] both record how much of the prefix a scan already certified, so a later position starts at that length instead of at zero — which is exactly what turns an O(n * m) window rescan into O(n + m).",
    terms: ["prefix table", "already compared", "no re-comparison", "linear matching", "certified prefix"],
    weight: 5,
  },
  "dsa-str18-z-box-borrow-then-extend": {
    slug: "dsa-str18-z-box-borrow-then-extend",
    name: "Inside the Z-box you copy a clipped value, then extend past the right edge",
    detail:
      "While i stays inside the matched block [L, R], z[i] is at least min(R - i + 1, z[i - L]): the characters up to R were matched against the prefix when the box opened, so only the part that sticks past R can cost a fresh comparison.",
    terms: ["Z-box", "left right window", "clipped mirror", "borrow then extend", "right edge never shrinks"],
    weight: 5,
  },
  "dsa-str18-lps-fallback-steps-down-borders": {
    slug: "dsa-str18-lps-fallback-steps-down-borders",
    name: "A KMP mismatch walks the border chain with j = lps[j - 1] instead of restarting",
    detail:
      "lps[j - 1] is the next shorter prefix of the pattern that is also a suffix of what just matched, so the fallback keeps the alignment the text already certified and re-tests one character rather than the whole window.",
    terms: ["failure function", "border chain", "proper prefix that is a suffix", "j = lps[j-1]", "text index never rewinds"],
    weight: 5,
  },
  "dsa-str18-separator-locks-the-joined-scan": {
    slug: "dsa-str18-separator-locks-the-joined-scan",
    name: "A join character outside both alphabets stops a border leaking across the seam",
    detail:
      "Pattern + separator + text, or s + separator + reverse(s), is only readable as one string when no border may cross the join, which is why the separator has to be a character neither half can contain.",
    terms: ["sentinel separator", "cross-boundary border", "joined scan", "outside the alphabet", "seam"],
    weight: 4,
  },
  "dsa-str18-palindrome-prefix-is-match-against-reverse": {
    slug: "dsa-str18-palindrome-prefix-is-match-against-reverse",
    name: "A palindromic prefix is a prefix of the string that is also a suffix of its reverse",
    detail:
      "The last cell of the prefix table over s + # + reverse(s) is exactly the longest prefix of s that reads the same both ways, so the shortest palindrome you can prepend is one lookup and one slice away.",
    terms: ["longest palindromic prefix", "reverse join", "border of the concatenation", "prepend the mirrored tail", "one lookup"],
    weight: 4,
  },
  "dsa-str18-rolling-hash-window-update": {
    slug: "dsa-str18-rolling-hash-window-update",
    name: "Sliding a hash window is a multiply-add plus a place-value subtraction",
    detail:
      "hash(next) = ((hash(current) - leadingDigit * base^(m-1)) * base + newDigit) mod p. Subtract the leading digit without its weight and every later window in the scan is wrong by a growing amount.",
    terms: ["rolling update", "leading digit weight", "base to the m minus one", "modular subtraction", "drift"],
    weight: 5,
  },
  "dsa-str18-rolling-hash-is-probabilistic": {
    slug: "dsa-str18-rolling-hash-is-probabilistic",
    name: "A hash match is a candidate, not a match",
    detail:
      "Every modulus maps distinct strings onto the same value, so a Rabin-Karp answer is either verified character by character on each hash hit or run against a second independent hash; a single modulus presented as collision-free is a false-positive rate accepted in silence.",
    terms: ["collision", "false positive", "verify on hit", "double hashing", "probabilistic answer"],
    weight: 5,
  },
  "dsa-str18-modulus-keeps-js-numbers-safe": {
    slug: "dsa-str18-modulus-keeps-js-numbers-safe",
    name: "Reduce at every step or the window value leaves the 53-bit integer window",
    detail:
      "A base-256 rolling value is 2^56 after seven characters, past Number.MAX_SAFE_INTEGER, so the modulus has to be applied on each multiply — or the whole window moved to BigInt — before low digits are silently lost.",
    terms: ["safe integer", "float64 precision", "reduce each step", "BigInt", "overflow drift"],
    weight: 4,
  },
  "dsa-str18-row-describes-previous-row": {
    slug: "dsa-str18-row-describes-previous-row",
    name: "Count and Say is a run-length map from one row onto the next, not a dynamic program",
    detail:
      "Row n is read off row n - 1 as count-then-digit pairs. There is no choice to optimise, no overlapping subproblem and no recurrence to solve, so the state worth keeping is a single string.",
    terms: ["run-length encoding", "describe the previous row", "count then digit", "one row of state", "deterministic transition"],
    weight: 4,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 18,
    name: "Z-Function",
    difficulty: "Hard",
    topicSlug: "string-techniques",
    stem: "For every position of one string, return how much of the string's own prefix that position shares with it — in linear time.",
    brief:
      "Input: a single string over a small alphabet, up to about 10^6 characters. Output: an array z of the same length with z[0] fixed by convention at 0 and z[i] the length of the longest prefix of s that is also a prefix of the suffix s[i..]. The constraint that decides the approach is that comparing every suffix against the prefix from scratch is quadratic, which is unusable at that length.",
    concepts: [
      "dsa-str18-prefix-table-reuses-compared-work",
      "dsa-str18-z-box-borrow-then-extend",
      "dsa-complexity-counting",
      "dsa-amortised-pop-accounting",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "Keep the rightmost block of text that already matched the prefix. Inside that block, seed z[i] with the clipped value of an earlier cell; only compare characters that fall past its right edge, and move the block when a match reaches further.",
    idealAnswer:
      "The z array is a receipt for comparisons the walk has already paid. Whenever a match starting at L reaches right to R, the block s[L..R] is known to equal s[0..R-L] character for character, so a position inside it sits at a fixed offset from a position already measured: the suffix at i and the suffix at i - L agree up to the box edge. That is why the loop can seed z[i] at min(R - i + 1, z[i - L]) instead of 0, and both halves of that case are honest — a mirror value that stops before the edge was stopped by a mismatch inside a block copied exactly, so it is final without another comparison; one that reaches the edge has to be extended. Linearity is the amortised statement about R: only the extension loop moves it, it never decreases, and it cannot pass n, so the build costs at most 2n character comparisons with O(n) space — 31 of them on 32 a characters, against the naive definition's 496. The contract traps: z[0] is a convention (0 here, n in some texts), a borrowed value must never be trusted past R, and z measures prefix-sharing rather than substring presence, so searching means building the array over pattern + separator + text and reading the cells equal to the pattern length.",
    walkthrough:
      "Take s = aabcaabxaaaz. i = 1: outside the box, s[0]=a matches s[1]=a, then s[1]=a against s[2]=b fails, so z[1]=1 and the box becomes [1,1]. i = 2 and i = 3: s[0]=a against b and against c, so z[2]=z[3]=0, and a zero match owns no region, leaving the box alone. i = 4: fresh comparisons a, a, b against s[4..6], then s[3]=c against s[7]=x — z[4]=3, box [4,6]. i = 5: inside the box, mirror z[1]=1 with room 6-5+1=2, so 1 is borrowed and the extension test s[1]=a against s[6]=b fails at once — z[5]=1 for free. i = 6: mirror z[2]=0, room 1, borrow nothing, and s[0]=a against s[6]=b fails — z[6]=0. i = 7: outside the box, a against x — 0. i = 8: fresh match a, a, then s[2]=b against s[10]=a — z[8]=2, box [8,9]. i = 9: mirror z[1]=1, room 1, so the borrowed value reaches exactly the box edge and extension continues: s[1]=a against s[10]=a matches, s[2]=b against s[11]=z fails — z[9]=2 and the box moves to [9,10]. i = 10: mirror z[1]=1, room 1, then s[1]=a against s[11]=z fails — z[10]=1. i = 11: a against z — 0. The array reads 0,1,0,0,3,1,0,0,2,2,1,0, built with 18 character comparisons and 3 borrowed cells. Note what a cell means, because row 2 needs the other one: z[i] is the prefix shared between s and the suffix starting at i, read forward from that text position, not a property of the block s[0..i].",
    commonMistake:
      "Recomputing every z[i] with a fresh comparison loop from index 0, or copying the mirror value z[i - L] straight through without clipping it to the box.",
    whyWrong:
      "The from-scratch loop is the definition of z, not the algorithm: on aabcaabxaaaz it costs 21 comparisons against 18 for the box version, and the gap is the whole point — on the 32-character string of all a it is 496 against 31, quadratic where linear was available, and it is exactly the input (repetitive text) that a prefix table exists to serve. Dropping the clip is a silent correctness bug rather than a slow one: on aaaaaaa the box at i = 2 is [1,6] with mirror z[1]=6 but only 5 characters of room left, so an unclipped copy writes z[2]=6, a match longer than the text that remains, which then poisons every later borrowed value and disagrees with the definition (the true array is 0,6,5,4,3,2,1). A third variant, refusing to enter the extension loop at all because the mirror looked authoritative, is wrong whenever the mirror reaches the box edge — aabcaabxaaaz at i = 9 borrows 1, and only the extension finds the second a.",
    followUps: [
      "Can you answer how many positions share a prefix of length at least k without storing the array? What is the smallest state that survives a streaming input?",
      "Give the pattern search built on this table: pattern + separator + text. Which cells answer it, why must the separator be outside both alphabets, and what does that cost in space?",
      "Name an input where the naive scan and the Z-box version do identical work. Why does the box never open there, and what does that say about the constant factor?",
      "The total length of every prefix that is also a suffix of s is a classic follow-up on this array. Read it off in one pass: which cells qualify and what does the sum cost?",
    ],
    solution:
      'function zFunction(s, stats) {\n' +
      '  const n = s.length;\n' +
      '  const z = new Array(n).fill(0);\n' +
      '  let left = 0;\n' +
      '  let right = 0;\n' +
      '  let compares = 0;\n' +
      '  let borrowed = 0;\n' +
      '  for (let i = 1; i < n; i += 1) {\n' +
      '    if (i <= right) {\n' +
      '      const remaining = right - i + 1;\n' +
      '      const mirror = z[i - left];\n' +
      '      z[i] = remaining < mirror ? remaining : mirror;\n' +
      '      if (z[i] > 0) borrowed += 1;\n' +
      '    }\n' +
      '    while (i + z[i] < n) {\n' +
      '      compares += 1;\n' +
      '      if (s[z[i]] !== s[i + z[i]]) break;\n' +
      '      z[i] += 1;\n' +
      '    }\n' +
      '    if (z[i] > 0 && i + z[i] - 1 > right) {\n' +
      '      left = i;\n' +
      '      right = i + z[i] - 1;\n' +
      '    }\n' +
      '  }\n' +
      '  if (stats) {\n' +
      '    stats.compares = compares;\n' +
      '    stats.borrowed = borrowed;\n' +
      '  }\n' +
      '  return z;\n' +
      '}\n' +
      '\n' +
      'function zFunctionNaive(s, stats) {\n' +
      '  const n = s.length;\n' +
      '  const z = new Array(n).fill(0);\n' +
      '  let compares = 0;\n' +
      '  for (let i = 1; i < n; i += 1) {\n' +
      '    let k = 0;\n' +
      '    while (k < n - i) {\n' +
      '      compares += 1;\n' +
      '      if (s[k] !== s[i + k]) break;\n' +
      '      k += 1;\n' +
      '    }\n' +
      '    z[i] = k;\n' +
      '  }\n' +
      '  if (stats) stats.compares = compares;\n' +
      '  return z;\n' +
      '}\n' +
      '\n' +
      'function zBorderLengths(s) {\n' +
      '  const z = zFunction(s);\n' +
      '  const out = [];\n' +
      '  for (let i = 1; i < s.length; i += 1) {\n' +
      '    if (i + z[i] === s.length) out.push(s.length - i);\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify:
      "Report the longest suffix of s that is also a prefix of s, plus every position where a prefix match runs to the end of the string, without a second comparison pass. Which cells of the finished array already answer both, and what does reading them cost?",
  },
  {
    step: 18,
    name: "KMP Algorithm / Find the Index of First Occurrence",
    difficulty: "Medium",
    topicSlug: "string-techniques",
    stem: "Find the first index at which a pattern occurs inside a text, touching each text character at most once.",
    brief:
      "Input: text and pattern as strings over a lowercase alphabet; the pattern may be empty, may be longer than the text, and may occur overlapping itself. Output: the smallest index i at which the pattern matches, or -1. The constraint that decides the approach is that the text index must never move backwards, because the text may be arriving as a stream and rescan work cannot be paid twice.",
    concepts: [
      "dsa-str18-prefix-table-reuses-compared-work",
      "dsa-str18-lps-fallback-steps-down-borders",
      "dsa-complexity-counting",
      "dsa-character-codes",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "Build the prefix table over the pattern, where lps[i] is the longest proper prefix of pattern[0..i] that is also a suffix of it. Scan the text once; on a mismatch step the pattern index down the border chain with j = lps[j - 1], and never move the text index.",
    idealAnswer:
      "KMP works because a mismatch in the middle of a partial match does not erase the comparisons that got there. After j pattern characters have matched, the text's last j characters are exactly pattern[0..j-1], so any suffix of that run which is also a prefix of the pattern is an alignment the text has already certified — and lps[j - 1] is the longest such suffix. Stepping j down that chain instead of restarting from 0 skips every alignment that cannot match, and the text pointer never moves back, so the scan does at most one comparison per character plus one per fallback: O(n) once the O(m) table exists. That is the difference from the Z array of the previous row: z[i] is a property of the text and the suffix starting at i, measured forward through the string, while lps[i] is a property of the pattern's own prefix pattern[0..i] and says nothing about where that prefix sits in the text. Space is O(m) for the table and O(1) for the scan state. The traps are contractual: an empty pattern has to be answered by a stated convention (index 0 here, matching String.prototype.indexOf), a pattern longer than the text is -1 rather than a crash, and after a full match the search must fall back through lps[m - 1] instead of to 0 if overlapping occurrences are wanted.",
    walkthrough:
      "Build the table for pattern ababaca. lps[0] = 0: no proper border. i = 1: b against p[0]=a fails, lps[1]=0. i = 2: a against a, lps[2]=1. i = 3: b against p[1]=b, lps[3]=2 (border ab). i = 4: a against p[2]=a, lps[4]=3 (aba). i = 5: c against p[3]=b fails, fall to lps[2]=1, fail against p[1]=b, fall to lps[0]=0, fail against p[0]=a, so lps[5]=0 — the double fallback is the table refusing to inherit the border of abab. i = 6: a against p[0]=a, lps[6]=1. The table reads 0,0,1,2,3,0,1. Now search text abababaca: the first five characters match pattern positions 0..4, so j = 5. At index 5 the text has b and the pattern wants c; the loop compares once, falls back to lps[4] = 3, and re-reads the alignment as the border aba — legitimate, because the text's last three characters really are a, b, a. Then b matches p[3], index 6 gives a, index 7 c, index 8 a, j = 7 = m, answer 8 - 7 + 1 = 2. Ten text comparisons, one fallback, and the text index never moved backward. The naive scan spends 14 comparisons on the same pair; on aaaaaaaaaaaab with pattern aaaaab it spends 48 where this search spends 20 with 7 border steps, because every naive restart re-compares five a characters already seen. That is the contrast with row 1: lps says the pattern shares aba with its own tail, the only reason the text pointer could stay put, while z[i] is a statement about where a suffix of the text begins.",
    commonMistake:
      "Resetting the pattern index to 0 on a mismatch, or writing the fallback as j = lps[j] instead of j = lps[j - 1] — and separately, reading the finished table's lps[m - 1] as a length of the whole pattern.",
    whyWrong:
      "Resetting to 0 is correct output and wrong complexity: on aaaaaaaaaaaab with pattern aaaaab it re-compares five matching a characters at every one of the seven failed starts, which is the 48-comparison scan above against KMP's 20, and it is O(n * m) on exactly the repetitive inputs where the table was supposed to pay off. The off-by-one fallback is a hang: with pattern aaaa the table is 0,1,2,3, so at j = 3 on text aaab the buggy step assigns lps[3] = 3, which is the same j, and the while loop re-tests the same character forever — the correct lps[j - 1] = 2 strictly decreases every time because a proper border is shorter than its string. The third one is a reading error with consequences two rows down: a table built so that the last cell can equal m lets a caller treat the whole pattern as its own border, which is how a Shortest Palindrome answer comes back claiming the entire string is a palindromic prefix when it is only a self-match.",
    followUps: [
      "Return every occurrence including overlapping ones. Which single line changes after a full match, and why is lps[m - 1] the right value to fall back to rather than 0?",
      "The text arrives one character at a time and the pattern is fixed. What state can you keep between arrivals, and what makes the total still O(n + m)?",
      "The alphabet is only {a, b}. Give an input pair where the naive scan does fewer comparisons than KMP and explain what KMP is paying for.",
      "Compress the table: which positions can share a border and what does the shortest counterexample to lps[i] > lps[i - 1] + 1 look like?",
    ],
    solution:
      lpsTable + '\n' +
      'function kmpIndexOf(text, pattern, counter) {\n' +
      '  const m = pattern.length;\n' +
      '  if (counter) {\n' +
      '    counter.compares = 0;\n' +
      '    counter.fallbacks = 0;\n' +
      '  }\n' +
      '  if (m === 0) return 0;\n' +
      '  if (m > text.length) return -1;\n' +
      '  const lps = buildLps(pattern);\n' +
      '  let compares = 0;\n' +
      '  let fallbacks = 0;\n' +
      '  let j = 0;\n' +
      '  for (let i = 0; i < text.length; i += 1) {\n' +
      '    while (j > 0 && text[i] !== pattern[j]) {\n' +
      '      compares += 1;\n' +
      '      fallbacks += 1;\n' +
      '      j = lps[j - 1];\n' +
      '    }\n' +
      '    if (text[i] === pattern[j]) {\n' +
      '      compares += 1;\n' +
      '      j += 1;\n' +
      '      if (j === m) {\n' +
      '        if (counter) {\n' +
      '          counter.compares = compares;\n' +
      '          counter.fallbacks = fallbacks;\n' +
      '        }\n' +
      '        return i - m + 1;\n' +
      '      }\n' +
      '      continue;\n' +
      '    }\n' +
      '    compares += 1;\n' +
      '  }\n' +
      '  if (counter) {\n' +
      '    counter.compares = compares;\n' +
      '    counter.fallbacks = fallbacks;\n' +
      '  }\n' +
      '  return -1;\n' +
      '}\n' +
      '\n' +
      'function kmpAllIndexes(text, pattern) {\n' +
      '  const m = pattern.length;\n' +
      '  if (m === 0 || m > text.length) return [];\n' +
      '  const lps = buildLps(pattern);\n' +
      '  const out = [];\n' +
      '  let j = 0;\n' +
      '  for (let i = 0; i < text.length; i += 1) {\n' +
      '    while (j > 0 && text[i] !== pattern[j]) j = lps[j - 1];\n' +
      '    if (text[i] === pattern[j]) {\n' +
      '      j += 1;\n' +
      '      if (j === m) {\n' +
      '        out.push(i - m + 1);\n' +
      '        j = lps[j - 1];\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function naiveIndexOf(text, pattern, counter) {\n' +
      '  let compares = 0;\n' +
      '  for (let start = 0; start + pattern.length <= text.length; start += 1) {\n' +
      '    let k = 0;\n' +
      '    while (k < pattern.length) {\n' +
      '      compares += 1;\n' +
      '      if (text[start + k] !== pattern[k]) break;\n' +
      '      k += 1;\n' +
      '    }\n' +
      '    if (k === pattern.length) {\n' +
      '      if (counter) counter.compares = compares;\n' +
      '      return start;\n' +
      '    }\n' +
      '  }\n' +
      '  if (counter) counter.compares = compares;\n' +
      '  return -1;\n' +
      '}',
    modify:
      "Make the search case-insensitive without rebuilding the pattern twice. Which side of the table has to know about the folding, and what breaks if only the text is folded?",
  },
  {
    step: 18,
    name: "Shortest Palindrome",
    difficulty: "Hard",
    topicSlug: "string-techniques",
    stem: "Prepend the fewest characters that turn a string into a palindrome, and name the one table cell that decides the answer.",
    brief:
      "Input: a string of lowercase letters, up to about 10^5 characters. Output: the shortest palindrome that ends with the input, formed by adding characters only to the front; the empty string and an already-palindromic input are legal. The constraint that decides the approach is that nothing may be inserted or appended, so the answer is fully determined by the longest palindromic prefix.",
    concepts: [
      "dsa-str18-palindrome-prefix-is-match-against-reverse",
      "dsa-str18-separator-locks-the-joined-scan",
      "dsa-str18-lps-fallback-steps-down-borders",
      "dsa-str18-prefix-table-reuses-compared-work",
      "dsa-centre-expansion",
    ],
    shortAnswer:
      "Run the KMP prefix table over s + separator + reverse(s). Its last cell is the length k of the longest palindromic prefix, and the answer is reverse(s.slice(k)) followed by s.",
    idealAnswer:
      "Anything you may add goes in front, so the only freedom is how much of the original string can be left untouched at the front — and untouched means palindromic, because the mirrored copy of the tail lands on top of it. The problem is therefore one number: k, the length of the longest palindromic prefix. Reading it directly costs a palindrome test per prefix, which is O(n^2) once slices count as work. The trick is to ask a different question with the same answer: a prefix of s is a palindrome exactly when it is also a suffix of reverse(s), because reversing turns prefixes into suffixes. So build the KMP table over joined = s + # + reverse(s) and read its last cell, the longest prefix of joined that is also a suffix of it — a prefix living in the s half and a suffix living in the reversed half, which is precisely the longest palindromic prefix of s. Cost is O(n) time and O(n) space for the join and the table, and the cell is trustworthy because the table never re-compares a character it already certified. Two contract traps decide correctness: the separator must be outside the alphabet, or a border can straddle the seam and report a length greater than n; and the join order matters, because reverse(s) + # + s reads the longest palindromic suffix instead.",
    walkthrough:
      "Take s = aacecaaa, so reverse(s) = aaacecaa and joined = aacecaaa#aaacecaa, seventeen characters. The table fills 0,1,0,0,0,1,2,2,0,1,2,2,3,4,5,6,7. Cell 0 is the lone a: 0, no proper border. Cell 1, the second a, matches the leading a: 1. Cells 2, 3, 4 are c, e, c: the chain falls to 0 and none of them is a, so 0 each. Cell 5 (a) is 1 and cell 6 (a) extends that border to aa: 2. Cell 7 is a again: it wants the prefix's third character, c, fails, steps down to lps[1] = 1, re-matches, so 2. Cell 8 is the # and nothing starts with #: 0 — that zero is the seam doing its job. From cell 9 the reversed half rebuilds: 1, 2, then 2 again at cell 11 because the third a hits c and falls back, then c, e, c, a, a climb to 3, 4, 5, 6 and finally 7, so joined's last seven characters are aacecaa, its first seven. Seven is the longest palindromic prefix: aacecaa reads the same backwards, aacecaaa does not. The tail is s.slice(7) = a, its mirror is a, so the answer is a + aacecaaa = aaacecaaa — eight characters, one added, isPalindrome true. Two more: racecarxx reports 7 and gives xxracecarxx; abcd reports 1 and gives dcbabcd. Read that last cell against row 2: there it described the pattern's own border, here the same cell measures a match between two halves of one string, legal only because the # forbids any border crossing the seam.",
    commonMistake:
      "Testing prefixes for palindromes with centre expansion or slices and calling the answer linear, or joining in the wrong order (reverse(s) + # + s) and reading the palindromic suffix as if it were the prefix.",
    whyWrong:
      "The per-prefix test is correct and quadratic: on a string of 10^5 characters it inspects roughly n^2/4 character pairs, and if the slices are counted as work it is quadratic in space too, which is exactly the answer this row exists to replace. The reversed join is wrong rather than slow: on aacecaaa the table over aaacecaa#aacecaaa ends at 3, the length of the palindromic suffix aaa, so the same formula mirrors five characters instead of one and returns aaaceaacecaaa — thirteen characters that are not even a palindrome, against the true aaacecaaa. Dropping the separator is the third failure, and it breaks the bound rather than the comparison: for aaba the seam-less join is aabaabaa, whose last cell is 5, a border longer than the four-character input, so s.slice(5) comes back empty and the function confidently returns aaba, which is not a palindrome; with the # in place the same cell is 2 (the prefix aa) and the answer is ab + aaba = abaaba, which is. A fourth variant reads the largest cell anywhere in the table instead of the last one, which answers where the best border occurred rather than how much of the string the reversed copy covers.",
    followUps: [
      "Give the version that finds the longest palindromic prefix in O(n) time and O(1) extra space using Manacher or expansion with a bound. What do you give up in clarity?",
      "The input is only legal if it is lowercase; make the function safe on arbitrary bytes without a second alphabet pass. Which separator choice is always available, and at what cost?",
      "You are asked for the fewest appends instead of prepends. Which single change to the join turns the same table into that answer?",
      "Report the insertion point rather than the new string when the caller owns the buffer. What must be true about the tail you mirror, and can the mirroring be done lazily?",
    ],
    solution:
      lpsTable + '\n' +
      'function reverseOf(s) {\n' +
      '  return s.split("").reverse().join("");\n' +
      '}\n' +
      '\n' +
      'function longestPalindromicPrefix(s) {\n' +
      '  if (s.length === 0) return 0;\n' +
      '  const joined = s + "#" + reverseOf(s);\n' +
      '  const lps = buildLps(joined);\n' +
      '  return lps[lps.length - 1];\n' +
      '}\n' +
      '\n' +
      'function shortestPalindrome(s) {\n' +
      '  const k = longestPalindromicPrefix(s);\n' +
      '  return reverseOf(s.slice(k)) + s;\n' +
      '}\n' +
      '\n' +
      'function isPalindrome(s) {\n' +
      '  for (let i = 0; i < s.length / 2; i += 1) {\n' +
      '    if (s[i] !== s[s.length - 1 - i]) return false;\n' +
      '  }\n' +
      '  return true;\n' +
      '}\n' +
      '\n' +
      'function longestPalindromicPrefixByExpansion(s) {\n' +
      '  let best = 0;\n' +
      '  for (let end = 0; end < s.length; end += 1) {\n' +
      '    if (isPalindrome(s.slice(0, end + 1))) best = end + 1;\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify:
      "The input may contain the # character. Replace the single separator with a guard that keeps the same linear bound — either a separator pair drawn from a wider alphabet or a bound on the table value — and say which one costs nothing in time.",
  },
  {
    step: 18,
    name: "Repeated String Match (Rabin-Karp)",
    difficulty: "Medium",
    topicSlug: "string-techniques",
    stem: "Return how many copies of a string you must concatenate before the target appears inside them, locating it with a rolling hash.",
    brief:
      "Input: two non-empty lowercase strings a and b. Output: the smallest k such that b occurs inside a concatenated with itself k times, or -1 when no k exists. The constraint that decides the approach is that the haystack is not given, it is generated, and a correct search never needs more than two candidate lengths, so the work must be a single linear scan over at most a.length + b.length + b.length characters.",
    concepts: [
      "dsa-str18-rolling-hash-window-update",
      "dsa-str18-rolling-hash-is-probabilistic",
      "dsa-doubled-text-window",
      "dsa-complexity-counting",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "k = ceil(b.length / a.length) is the only place a match can first fit; test the k-fold and the (k + 1)-fold concatenation, finding b with a rolling hash that drops the leading digit times base^(m-1), reduces modulo a prime, and verifies every hit character by character.",
    idealAnswer:
      "Two observations set the shape of the answer. First, if b occurs anywhere in the infinite repetition of a, periodicity slides that occurrence back to a start position p with 0 <= p < a.length, and it then ends before a.length + b.length, which the (k + 1)-fold concatenation always covers — so two haystacks are enough and a growing while loop is a bug. Second, k = ceil(b.length / a.length) is the smallest haystack that can hold b at all, so the text is O(a.length + b.length) characters and the only question is how to pay for the scan. A rolling hash pays in O(1) per step: the window drops its leading digit times that digit's place weight, multiplies by the base, adds the entering digit, and reduces modulo a prime so it never leaves the safe integer range. That hash carries the honest caveat: equality makes a candidate, so each hit must be confirmed character by character; a verification-free version is a probabilistic claim. Cost is O(n + m) expected, O(m) for the pattern hash and leading weight, plus the haystack — the space a streaming solution would refuse to pay. Traps: a character of b outside the alphabet of a answers -1 without building anything, an occurrence straddling the fold boundary is why the second haystack exists, and base 26 is injective only on fixed-length words over digits 1..26.",
    walkthrough:
      "Take a = abcd and b = cdabcdab, so m = 8 and k = ceil(8 / 4) = 2. With base 26 and modulus 997 the target value is hash(cdabcdab) = 35 and the weight that leaves the window is 26^7 mod 997 = 110. The two-fold haystack abcdabcd is exactly eight characters, so it holds one window, value 586, which is not 35 — nothing found at k = 2. Extend to three folds: abcdabcdabcd is twelve characters and five windows. Slide instead of rehashing. From 586 subtract digit(a) = 1 times 110 to get 476, multiply by 26, add the entering haystack[8] = a (digit 1) to get 12377, reduce to 413 — hash(bcdabcda) built from scratch is 413 too. From 413 subtract digit(b) = 2 times 110 to get 193, multiply by 26 and add haystack[9] = b, digit 2, giving 5020, which reduces to 35: hash(cdabcdab), so window index 2 is a candidate. Verify it against haystack[2..9] = cdabcdab, find it equal, return k = 3; plainIndexOf returns the same index 2, and the fifth window comes back to 586 because the text is periodic. The alphabet prefilter settles the hopeless case cheaply: a = abc, b = wxyz fails on w before anything is concatenated and answers -1 rather than looping. A fourth fold is never needed because the occurrence starts at 2, inside a.length, and ends at 9, which three folds cover with two characters to spare.",
    commonMistake:
      "Searching only the ceil-fold haystack, or returning the first hash equality without verifying the characters behind it.",
    whyWrong:
      "The k-fold haystack is the smallest one that can hold b, not the smallest one that can hold an occurrence of b: an occurrence may start near the end of one copy and finish inside the next, so on a = abcd, b = cdabcdab the two-fold haystack is eight characters with exactly one window (abcdabcd, value 586) and the search answers -1 while three folds answer 3. Skipping verification turns a fast scan into a wrong one, and the collision is not hypothetical at these parameters: hash(aaa) and hash(bmj) are both 703 modulo 997, so a hash-only search of the haystack bmjay for aaa reports a hit at index 0 in text that does not contain it, and a repeated-string-match wrapper would answer with a fold count that is simply false. The related third mistake is assuming base 26 is injective on any text: it is injective only for equal-length words over a..z with digit values 1..26, so an input containing other characters needs a wider base, which in turn needs the modulus re-checked against 2^53.",
    followUps: [
      "Refuse to materialise the haystack. What state does the rolling window need to read a virtual repetition of a, and what does that do to the space claim?",
      "Your modulus is 997 and collisions are frequent. Give the second independent hash that makes the answer wrong only with probability you can name, and say what it costs per step.",
      "Which inputs make this answer -1 fastest, and why is the alphabet prefilter better than a length bound? Give the pair where the prefilter saves the whole scan.",
      "Suppose a.length divides b.length. Does the second haystack still matter? Name the input that decides it.",
    ],
    solution:
      rollingHash + '\n' +
      'function hashIndexOf(haystack, pattern) {\n' +
      '  const m = pattern.length;\n' +
      '  if (m === 0) return 0;\n' +
      '  if (m > haystack.length) return -1;\n' +
      '  const target = hashOf(pattern);\n' +
      '  const lead = leadingWeight(m);\n' +
      '  let current = hashOf(haystack.slice(0, m));\n' +
      '  for (let i = 0; i + m <= haystack.length; i += 1) {\n' +
      '    if (i > 0) {\n' +
      '      current = (current - digitOf(haystack[i - 1]) * lead) % MOD;\n' +
      '      if (current < 0) current += MOD;\n' +
      '      current = (current * RB + digitOf(haystack[i + m - 1])) % MOD;\n' +
      '    }\n' +
      '    if (current === target && windowMatches(haystack, i, pattern)) return i;\n' +
      '  }\n' +
      '  return -1;\n' +
      '}\n' +
      '\n' +
      'function plainIndexOf(haystack, pattern) {\n' +
      '  for (let start = 0; start + pattern.length <= haystack.length; start += 1) {\n' +
      '    if (windowMatches(haystack, start, pattern)) return start;\n' +
      '  }\n' +
      '  return -1;\n' +
      '}\n' +
      '\n' +
      'function repeated(a, times) {\n' +
      '  let out = "";\n' +
      '  for (let i = 0; i < times; i += 1) out += a;\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function repeatedStringMatch(a, b) {\n' +
      '  if (b.length === 0) return 1;\n' +
      '  if (a.length === 0) return -1;\n' +
      '  const alphabet = new Set(a.split(""));\n' +
      '  for (const ch of b.split("")) if (!alphabet.has(ch)) return -1;\n' +
      '  const k = Math.ceil(b.length / a.length);\n' +
      '  const first = repeated(a, k);\n' +
      '  if (hashIndexOf(first, b) !== -1) return k;\n' +
      '  if (hashIndexOf(first + a, b) !== -1) return k + 1;\n' +
      '  return -1;\n' +
      '}',
    modify:
      "Return the start index of the occurrence inside the k-fold haystack as well as k, and let the caller reuse the haystack instead of rebuilding it. Which of the two candidate lengths must then be built first, and how does the alphabet prefilter change?",
  },
  {
    step: 18,
    name: "Rabin Karp Algorithm",
    difficulty: "Hard",
    topicSlug: "string-techniques",
    stem: "Find every occurrence of a pattern in a text with a rolling hash, and say what your answer means when two different windows share a hash value.",
    brief:
      "Input: text and pattern over a 26-letter lowercase alphabet. Output: the start indices of every occurrence in increasing order, overlapping ones included, and the empty list when there is none. The constraint that decides the approach is that the window value must be updated in constant time per step, which forces a modulus, which makes the raw hash answer probabilistic unless each hit is confirmed.",
    concepts: [
      "dsa-str18-rolling-hash-window-update",
      "dsa-str18-rolling-hash-is-probabilistic",
      "dsa-str18-modulus-keeps-js-numbers-safe",
      "dsa-prefix-sum",
      "dsa-double-precision",
    ],
    shortAnswer:
      "Treat the window as a base-b numeral reduced modulo a prime. Slide it by subtracting the leading digit times base^(m-1), multiplying by b and adding the entering digit, then verify the characters on every hash equality and record the index.",
    idealAnswer:
      "A rolling hash is a weighted prefix sum taken modulo a prime: the window over m characters is the numeral d0 * b^(m-1) + ... + d(m-1), and the next window comes from it in constant time by removing the leading digit with its place weight, shifting left one digit and appending the entrant. That is why the scan is O(n + m) instead of O(n * m): the pattern is hashed once and each text window costs three operations rather than m comparisons. Two honest costs come with it. The first is collisions — any modulus maps more strings onto a value than the alphabet can supply distinct words, so hash equality is evidence, not proof, and the shipped search compares characters on every hit; worst case that is O(n * m) again on adversarial text, but it buys a correct answer rather than a fast wrong one. The second is numeric: float64 has a 53-bit integer window, an unreduced base-256 numeral reaches 2^56 after seven characters, so the modulus must be applied at each multiply or the arithmetic moved to BigInt — reducing every step rather than at the end is what keeps every intermediate exact. Traps to name: a pattern longer than the text is no occurrences, an empty pattern is a stated convention rather than a crash, overlapping hits must all be reported, and a double hash or 64-bit natural overflow is what you reach for when the input is chosen against you.",
    walkthrough:
      "Use base 26, modulus 997, letters as digits a=1 .. z=26. Text abcab, window m = 3. The first window is abc = 1*676 + 2*26 + 3 = 731, and the weight that leaves the window is 26^2 mod 997 = 676. Slide to bca: subtract digit(a) = 1 times 676 to get 55, multiply by 26, add the entering a, get 1431, reduce to 434 — hash(bca) from scratch is 2*676 + 3*26 + 1 = 1431, also 434, so the roll agrees. Slide to cab: 434 - 2*676 = -918, back in range as 79, then 79*26 + 2 = 2056 reduces to 62 = hash(cab). The window values are 731, 434, 62. Now drop the place weight instead of subtracting it — the classic drift: 731 minus 1 is 730, times 26 plus 1 is 18981, reduced to 38 rather than 434, and the next window lands on 938 instead of 62, so a search on those values never hits its target and reports no matches. For the search, take text abracadabra and pattern abra: hash(abra) = 1*17576 + 2*676 + 18*26 + 1 = 19397 reduces to 454, and the eight window values are 454, 490, 77, 691, 668, 368, 263, 454 — the target reappears only at window 7, both hits verify character by character, so the answer is 0,7, the list plainSearch produces. Finally the collision the modulus guarantees: hash(aaa) = 703 and hash(bmj) = 2*676 + 13*26 + 10 = 1700 = 703 (mod 997), so searching bmjay for aaa gives candidate 0 from the hash alone and no occurrences after verification — only the verification says which is true.",
    commonMistake:
      "Subtracting the leading digit's value instead of its place weight, letting the window value grow unreduced, or presenting one 32-bit modulus as collision-free.",
    whyWrong:
      "The missing weight is not a rounding issue, it is a different number: on abcab with m = 3 the correct rolls are 731 then 434 then 62, while subtracting the digit gives 731 then 38 then 938, so the search for bca in its own text misses — and because the error compounds with every slide the windows never recover, which is why the bug shows up as no matches on long texts and one stray match on short ones. Skipping the reduction is a JavaScript-specific failure: a base-256 window is 2^56 at seven characters and Number.MAX_SAFE_INTEGER is 9007199254740991, so past that point the value stops being exact and the hash silently stops being a function of the text; BigInt or a per-step modulus is the fix, not a bigger double. And the single-modulus claim is falsifiable on the shipped parameters: aaa and bmj both hash to 703, so a verification-free scan of bmjay answers index 0 for a pattern that does not occur, and on a 10^9 prime an adversary who knows the base can construct collisions by solving for a digit combination with the same residue — hence double hashing or 64-bit natural overflow in production.",
    followUps: [
      "Give the double-hash version with two independent moduli. What is the collision probability you are now claiming, and what does the extra multiply cost per window?",
      "Report all occurrences in a streaming text with only O(m) state. Which value must be cached for the subtraction to stay O(1), and can you verify a hit when the characters have already been dropped?",
      "Name an input on which Rabin-Karp with verification degenerates to O(n * m), and say which algorithm keeps the linear bound on it.",
      "The alphabet is unknown bytes rather than a..z. What base and modulus do you pick so that every intermediate product stays inside 2^53, and how did you check that?",
    ],
    solution:
      rollingHash + '\n' +
      'function rabinKarpSearch(text, pattern) {\n' +
      '  const m = pattern.length;\n' +
      '  if (m === 0 || m > text.length) return [];\n' +
      '  const target = hashOf(pattern);\n' +
      '  const lead = leadingWeight(m);\n' +
      '  const out = [];\n' +
      '  let current = hashOf(text.slice(0, m));\n' +
      '  for (let i = 0; i + m <= text.length; i += 1) {\n' +
      '    if (i > 0) {\n' +
      '      current = (current - digitOf(text[i - 1]) * lead) % MOD;\n' +
      '      if (current < 0) current += MOD;\n' +
      '      current = (current * RB + digitOf(text[i + m - 1])) % MOD;\n' +
      '    }\n' +
      '    if (current === target && windowMatches(text, i, pattern)) out.push(i);\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function rabinKarpCandidates(text, pattern) {\n' +
      '  const m = pattern.length;\n' +
      '  if (m === 0 || m > text.length) return [];\n' +
      '  const target = hashOf(pattern);\n' +
      '  const lead = leadingWeight(m);\n' +
      '  const out = [];\n' +
      '  let current = hashOf(text.slice(0, m));\n' +
      '  for (let i = 0; i + m <= text.length; i += 1) {\n' +
      '    if (i > 0) {\n' +
      '      current = (current - digitOf(text[i - 1]) * lead) % MOD;\n' +
      '      if (current < 0) current += MOD;\n' +
      '      current = (current * RB + digitOf(text[i + m - 1])) % MOD;\n' +
      '    }\n' +
      '    if (current === target) out.push(i);\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function plainSearch(text, pattern) {\n' +
      '  const out = [];\n' +
      '  for (let start = 0; start + pattern.length <= text.length; start += 1) {\n' +
      '    if (windowMatches(text, start, pattern)) out.push(start);\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify:
      "Swap the single modulus for two independent ones and report only windows that pass both. What does the extra reduce cost per slide, which counterexample disappears, and which collision risk survives?",
  },
  {
    step: 18,
    name: "Count and Say",
    difficulty: "Medium",
    topicSlug: "string-techniques",
    stem: "Return the nth row of the sequence in which each row describes the previous one, and state plainly whether that is a dynamic program.",
    brief:
      "Input: an integer n with n >= 1. Output: the nth row as a string, where row 1 is 1 and every later row is the run-length reading of the row before it — each run written as its count followed by the character it counts. The constraint that decides the approach is that a row reads only its immediate predecessor, so the recurrence is deterministic and has nothing to optimise over.",
    concepts: [
      "dsa-str18-row-describes-previous-row",
      "dsa-set-run-start",
      "dsa-row-building",
      "dsa-loop-invariant",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "Iterate n - 1 times, and each time sweep the row left to right counting equal characters and emitting count then digit. It is run-length encoding composed with itself, not a DP: no choice, no overlapping subproblem, no table.",
    idealAnswer:
      "The row is read, not computed: a two-pointer sweep walks the previous row, extends a run while the characters agree, and writes the pairs in count-then-digit order. One row of state is enough because row n is a function of row n - 1 alone, so the answer costs O(L) space for the current row and O(sum of row lengths) time, the final length up to a constant because the rows grow geometrically. That growth is the interesting arithmetic: each row is about 1.3036 times the one before, Conway's constant, so row 20 is 302 characters and row 30 is 4462 — holding every row in an array keeps roughly thirty times more text than the answer needs. The row sits in a DP ladder largely to test whether you call it a DP. The honest answer is no: dynamic programming means a recurrence over choices with optimal substructure or overlapping subproblems, and here the transition is one deterministic function with nothing to minimise, so memoising caches a chain rather than a table. It is a recurrence, which is the weaker claim. The contract traps are where the points are lost: count before digit, the final run has to be flushed when the sweep reaches the end of the string, n = 1 returns 1 rather than the empty string, and rows generated from the seed never contain a digit above 3 — worth checking rather than assuming when the caller wants an alphabet bound.",
    walkthrough:
      "Row 4 is 1211. Sweep it: at i = 0 the character is 1 and the run is one long before the digit changes, so it emits 11; at i = 1 it is 2, the run (1, 2), emitting 12; at i = 2 the 1 equals i = 3, so the run is two long and emits 21. Concatenated in sweep order that is 111221, row 5. Read row 5 the same way for row 6: the leading three 1 characters form one run emitting 31, two 2 characters emit 22, a single 1 emits 11 — 312211. The flush detail is at the end of row 5: the inner comparison stops when the index walks off the string, so the last run (one 1) still has to be written after the loop exits, and code that emits only inside the mismatch branch loses it and returns 3122 for row 6. The base case is not a computation: row 1 is the seed 1, so a loop that runs n - 1 times from the seed produces row n and n = 1 returns the seed unchanged. Two anchors on the growth claim: row 10 is 13211311123113112211 at twenty characters, row 20 is 302 characters, and every character in both is a 1, a 2 or a 3, because no generated row ever holds a run longer than three — that is what closes the alphabet, since a run of four would make the encoder write a 4 and the next row would have to describe it as 14. The closure is a theorem about the sequence, not something this function enforces, so describeRuns on an arbitrary input still returns 4a for four a characters: a legal description of a row the sequence never produces.",
    commonMistake:
      "Reaching for a DP table of all n rows, or emitting digit-then-count instead of count-then-digit.",
    whyWrong:
      "The order swap is a wrong answer on the smallest input that shows it: describing 1211 digit-first gives 11 then 21 then 12, which is 112112, while row 5 is 111221 — so from n = 5 onward the function is generating a different sequence, and the row 6 the interviewer checks (312211) does not appear at all. The table is not wrong, it is the wrong claim: storing every row keeps roughly the sum of thirty growing strings to answer a question that reads one predecessor, and calling it dynamic programming invites the follow-up about the recurrence relation and the overlapping subproblem, of which there are none — the transition is deterministic. There is a third, quieter bug in the same family: a sweep that advances the outer index by 1 instead of by the run length re-reads characters inside a run it already described, so aaa becomes 1a1a1a rather than 3a, and the row lengths stop matching the sequence at n = 4.",
    followUps: [
      "Which rows can you answer without ever holding the previous row, and why does the growth rate make that a false economy here?",
      "Call it a DP anyway and write the table version. Which line proves the memo has nothing to overlap, and what does it cost against the one-row version at n = 30?",
      "Prove, or refute, that no row generated from the seed 1 contains a digit above 3. Where does a 4 have to come from for that to fail?",
      "Generalise the encoder to describe runs up to length 9 and split longer ones. Which input of length 40 forces the split, and does the sequence change?",
    ],
    solution:
      'function describeRuns(s) {\n' +
      '  let out = "";\n' +
      '  let i = 0;\n' +
      '  while (i < s.length) {\n' +
      '    let j = i;\n' +
      '    while (j < s.length && s[j] === s[i]) j += 1;\n' +
      '    out += String(j - i) + s[i];\n' +
      '    i = j;\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function countAndSay(n) {\n' +
      '  if (n <= 0) return "";\n' +
      '  let row = "1";\n' +
      '  for (let step = 1; step < n; step += 1) row = describeRuns(row);\n' +
      '  return row;\n' +
      '}\n' +
      '\n' +
      'function describeRunsDigitFirst(s) {\n' +
      '  let out = "";\n' +
      '  let i = 0;\n' +
      '  while (i < s.length) {\n' +
      '    let j = i;\n' +
      '    while (j < s.length && s[j] === s[i]) j += 1;\n' +
      '    out += s[i] + String(j - i);\n' +
      '    i = j;\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify:
      "Let the caller seed any string instead of 1 and ask for the kth row from it. Which line is the only one that changes, and does the no-digit-above-3 property survive a seed containing a 4?",
  },
];

export const expects: Record<string, string> = {
  'Z-Function':
    '(() => { const box = {}; const slow = {}; const z = zFunction("aabcaabxaaaz", box); const naive = zFunctionNaive("aabcaabxaaaz", slow); const many = "a".repeat(32); const boxWide = {}; const slowWide = {}; zFunction(many, boxWide); zFunctionNaive(many, slowWide); return z.join(",") === "0,1,0,0,3,1,0,0,2,2,1,0" && naive.join(",") === z.join(",") && box.compares === 18 && slow.compares === 21 && box.borrowed === 3 && boxWide.compares === 31 && slowWide.compares === 496 && zFunction("aaaaaaa").join(",") === "0,6,5,4,3,2,1" && zFunction("a").join(",") === "0" && zFunction("").join(",") === "" && zBorderLengths("ababa").join(",") === "3,1" && zBorderLengths("aabcaabxaaaz").join(",") === ""; })()',
  'KMP Algorithm / Find the Index of First Occurrence':
    '(() => { const table = buildLps("ababaca"); const hit = {}; const slow = {}; const at = kmpIndexOf("abababaca", "ababaca", hit); const naiveAt = naiveIndexOf("abababaca", "ababaca", slow); const hard = {}; const hardSlow = {}; const atHard = kmpIndexOf("aaaaaaaaaaaab", "aaaaab", hard); const naiveHard = naiveIndexOf("aaaaaaaaaaaab", "aaaaab", hardSlow); return table.join(",") === "0,0,1,2,3,0,1" && at === 2 && naiveAt === 2 && hit.compares === 10 && hit.fallbacks === 1 && atHard === 7 && naiveHard === 7 && hard.compares === 20 && hardSlow.compares === 48 && buildLps("aaaa").join(",") === "0,1,2,3" && kmpAllIndexes("aaaaa", "aaa").join(",") === "0,1,2" && kmpAllIndexes("aabaacaabaab", "aba").join(",") === "1,7" && kmpIndexOf("abcde", "xyz") === -1 && kmpIndexOf("ab", "abc") === -1 && kmpIndexOf("a", "a") === 0 && kmpIndexOf("abc", "") === 0; })()',
  'Shortest Palindrome':
    '(() => { const joined = "aacecaaa#aaacecaa"; const table = buildLps(joined); const made = shortestPalindrome("aacecaaa"); return table[table.length - 1] === 7 && longestPalindromicPrefix("aacecaaa") === 7 && longestPalindromicPrefixByExpansion("aacecaaa") === 7 && made === "aaacecaaa" && isPalindrome(made) === true && longestPalindromicPrefix("racecarxx") === 7 && shortestPalindrome("racecarxx") === "xxracecarxx" && shortestPalindrome("abcd") === "dcbabcd" && shortestPalindrome("abba") === "abba" && shortestPalindrome("aaaa") === "aaaa" && shortestPalindrome("a") === "a" && shortestPalindrome("") === "" && isPalindrome(shortestPalindrome("aabba")) === true; })()',
  'Repeated String Match (Rabin-Karp)':
    '(() => { const two = "abcdabcd"; const three = "abcdabcdabcd"; return repeatedStringMatch("abcd", "cdabcdab") === 3 && hashIndexOf(two, "cdabcdab") === -1 && hashIndexOf(three, "cdabcdab") === 2 && plainIndexOf(three, "cdabcdab") === 2 && hashOf("cdabcdab") === 35 && leadingWeight(8) === 110 && repeatedStringMatch("a", "aa") === 2 && repeatedStringMatch("aa", "a") === 1 && repeatedStringMatch("abc", "wxyz") === -1 && repeatedStringMatch("abcd", "abcda") === 2 && repeatedStringMatch("abc", "abcabca") === 3 && hashIndexOf("bmjay", "aaa") === -1 && hashOf("aaa") === hashOf("bmj"); })()',
  'Rabin Karp Algorithm':
    '(() => { const windows = [hashOf("abc"), hashOf("bca"), hashOf("cab")]; const hits = rabinKarpSearch("abracadabra", "abra"); const plain = plainSearch("abracadabra", "abra"); return windows.join(",") === "731,434,62" && leadingWeight(3) === 676 && hits.join(",") === "0,7" && plain.join(",") === hits.join(",") && rabinKarpSearch("aaaaa", "aaa").join(",") === "0,1,2" && rabinKarpSearch("bmjay", "aaa").join(",") === "" && rabinKarpCandidates("bmjay", "aaa").join(",") === "0" && hashOf("aaa") === 703 && hashOf("bmj") === 703 && rabinKarpSearch("abcde", "xyz").join(",") === "" && rabinKarpSearch("abc", "abcd").join(",") === "" && rabinKarpSearch("abc", "").join(",") === "" && rabinKarpSearch("a", "a").join(",") === "0"; })()',
  'Count and Say':
    '(() => { const row5 = countAndSay(5); return countAndSay(1) === "1" && countAndSay(2) === "11" && countAndSay(3) === "21" && countAndSay(4) === "1211" && row5 === "111221" && describeRuns("1211") === "111221" && describeRuns("21") === "1211" && countAndSay(6) === "312211" && countAndSay(7) === "13112221" && countAndSay(10) === "13211311123113112211" && countAndSay(20).length === 302 && describeRunsDigitFirst("1211") === "112112" && describeRuns("aaa") === "3a" && describeRuns("") === "" && countAndSay(0) === "" && /^[123]+$/.test(countAndSay(20)) === true; })()',
};
