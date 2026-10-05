import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';

/**
 * Step 16d — the interval half of the DP step: the rows where the decision is not which element to
 * take but where to cut. Matrix chains, stick cuts, balloons, boolean parenthesisations and palindrome
 * partitions are the same table filled in the same order, and the two square/rectangle rows show the
 * other shape of the idea: a cell that stores a side length instead of a span.
 */

export const concepts: Record<string, ConceptSpec> = {
  "dsa-dp16d-interval-length-iteration": {
    slug: "dsa-dp16d-interval-length-iteration",
    name: "An interval table fills by span length, because a wider span reads narrower ones",
    detail:
      "Every split of i..j asks for two intervals that are strictly shorter than it, so the outer loop counts lengths from 1 up to n; a loop that walks the start index upward reads cells nobody has written yet.",
    terms: ["loop by length", "shorter intervals first", "fill order", "dp over i..j", "bottom-up interval"],
    weight: 5,
  },
  "dsa-dp16d-split-point-decision": {
    slug: "dsa-dp16d-split-point-decision",
    name: "Interval DP asks which split comes first or last, not which element to take",
    detail:
      "The recurrence maximises or minimises over every cut between i and j of left plus right plus whatever the cut itself pays; the cut is the decision variable and both sub-intervals are already solved when it is read.",
    terms: ["split point", "cut position", "min over splits", "two sub-intervals", "decision variable"],
    weight: 5,
  },
  "dsa-dp16d-sentinel-endpoints": {
    slug: "dsa-dp16d-sentinel-endpoints",
    name: "Sentinels turn an unordered list into the endpoints of an interval",
    detail:
      "A stick gains 0 and its length and a row of balloons gains a 1 at each end, so every piece or span is delimited by two positions that are never removed and their cost is always readable.",
    terms: ["add 0 and n", "padded array", "boundary sentinel", "sorted cuts", "endpoint survives"],
    weight: 4,
  },
  "dsa-dp16d-last-element-standing-interval": {
    slug: "dsa-dp16d-last-element-standing-interval",
    name: "Read the order backwards and the interval stops depending on itself",
    detail:
      "Forward, a burst or a cut destroys the neighbours that priced it; in reverse the last element of a span still sees both boundaries intact, so the state becomes the span between two survivors and the answer is a choice over the last one.",
    terms: ["reverse the order", "last one burst", "first cut in a fenced piece", "neighbours still standing", "order-free subproblems"],
    weight: 4,
  },
  "dsa-dp16d-pair-of-counts-per-interval": {
    slug: "dsa-dp16d-pair-of-counts-per-interval",
    name: "A count over intervals needs both verdicts per cell, not just the wanted one",
    detail:
      "An AND wants true times true, an XOR wants the two cross products and an OR wants the total of the other side, so a boolean parenthesisation cell holds a pair and every operator selects four products of it.",
    terms: ["two counts per cell", "true ways and false ways", "pair recurrence", "cross terms", "single count is not closed"],
    weight: 4,
  },
  "dsa-dp16d-validity-gated-split": {
    slug: "dsa-dp16d-validity-gated-split",
    name: "In a partition DP the split is only worth trying when the piece it isolates is legal",
    detail:
      "Palindrome partitioning charges one per cut and nothing else, so all the information sits in the spans that already cost zero — a legality table, filled by length before the cut table, decides which splits count.",
    terms: ["palindrome table", "legal piece", "zero cost when the whole span works", "two interval tables", "cost of a cut"],
    weight: 4,
  },
  "dsa-dp16d-ending-at-index-state": {
    slug: "dsa-dp16d-ending-at-index-state",
    name: "An anchored state says where the chain stops, which is what lets two sweeps meet",
    detail:
      "A prefix answer keeps only a length and loses its last element, so nothing can be attached to it; storing the best chain that ends exactly at i — or starts exactly at i — is what makes a peak, a join or a count well defined.",
    terms: ["ending at i", "starting at i", "anchored state", "lost tail value", "two directions meet"],
    weight: 4,
  },
  "dsa-dp16d-count-resets-on-longer": {
    slug: "dsa-dp16d-count-resets-on-longer",
    name: "Counting the longest resets the count on a longer length and adds on an equal one",
    detail:
      "Each cell carries a pair, best length ending there and the number of ways to reach it; a strictly better child replaces the count outright, an equal child is added, and the fold over the whole array obeys the same two rules.",
    terms: ["reset versus add", "pair of length and count", "sum over ties", "double count", "counting not optimising"],
    weight: 4,
  },
  "dsa-dp16d-bounded-window-partition": {
    slug: "dsa-dp16d-bounded-window-partition",
    name: "A partition with a size cap is a prefix DP over the last group, not interval DP",
    detail:
      "When every group is at most k long, the state is the answer for the first i elements and the transition only tries the k possible sizes of the final group, so the cost is n times k instead of the cubic interval sweep.",
    terms: ["last group size", "bounded window", "prefix state", "n times k", "no interval table"],
    weight: 3,
  },
  "dsa-dp16d-square-side-ending-here": {
    slug: "dsa-dp16d-square-side-ending-here",
    name: "A square cell stores the side ending there and three neighbours decide it",
    detail:
      "The largest all-ones square with its bottom-right corner at (r,c) is one more than the minimum of the cell above, the cell to the left and the diagonal, because the shortest of those three is the one that runs out first.",
    terms: ["side ending at cell", "min of three plus one", "bottom-right anchor", "reset on a zero", "cells sum to the count"],
    weight: 4,
  },
  "dsa-dp16d-rectangle-needs-stack-not-cell": {
    slug: "dsa-dp16d-rectangle-needs-stack-not-cell",
    name: "A rectangle has no corner recurrence, so a histogram and a stack replace it",
    detail:
      "Widening a rectangle is not decided by three neighbours, so each row becomes bar heights and the largest rectangle falls out of the monotonic stack in linear time per row — the same idea the square recurrence gets for free.",
    terms: ["histogram per row", "monotonic stack", "no cell recurrence", "width from the stack", "square versus rectangle"],
    weight: 4,
  },
  "dsa-dp16d-catalan-count-overflow": {
    slug: "dsa-dp16d-catalan-count-overflow",
    name: "Counting parenthesisations grows like a Catalan number and outgrows a double",
    detail:
      "Optimising returns one value and counting returns a distribution over Catalan(n-1) trees; that number passes Number.MAX_SAFE_INTEGER around thirty-one operands, which is why counting contracts say modulo 1e9+7.",
    terms: ["catalan growth", "modulo", "number.MAX_SAFE_INTEGER", "counting versus optimising", "precision loss"],
    weight: 3,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 16,
    name: "Longest Bitonic Subsequence",
    difficulty: "Medium",
    topicSlug: "dp-greedy",
    stem: "Return the length of the longest subsequence that strictly climbs to one peak and then strictly falls.",
    brief:
      "Input: an array of integers, order fixed, duplicates allowed. Output: the length of the longest bitonic subsequence — strictly increasing up to one index and strictly decreasing after it, with either flank allowed to be empty. The peak is not given, so no single left-to-right scan can decide the answer.",
    concepts: [
      "dsa-dp16d-ending-at-index-state",
      "dsa-recursive-decomposition",
      "dsa-boundary-conditions",
      "dsa-complexity-counting",
    ],
    shortAnswer:
      "Two anchored sweeps: f[i] is the longest increasing subsequence ending exactly at i, g[i] the longest decreasing one starting exactly at i, and the answer is the best f[i] + g[i] - 1 over the shared peak i.",
    idealAnswer:
      "The property is decided by one position, so the state has to be anchored there: f[i] reads 'the longest strictly increasing subsequence that ends at i' and g[i] 'the longest strictly decreasing one that leaves i'. A prefix answer — the LIS length of arr[0..i] — cannot be used, because it keeps a length and throws away the value it ended on, and a chain that stops somewhere else cannot be joined to a chain starting at i. With both halves anchored, i is enumerated as the peak and f[i] + g[i] - 1 is the mountain through it, minus one because the peak belongs to both sweeps. Each sweep is the ordinary quadratic LIS DP, one forward and one on the reversed array read back, so the whole answer is two O(n squared) passes with O(n) extra space instead of the exponential include-or-skip tree. The contract traps are strictness and degeneracy: equal values must not chain, so the test is arr[j] < arr[i] and not <=, and a purely increasing or purely decreasing array is still bitonic — its best peak simply has an empty other flank, which is why both flanks are allowed to be empty rather than required.",
    walkthrough:
      "On 8,1,2,5,7,6,1,3 the forward sweep reads f = 1,1,2,3,4,4,1,3: the 7 at index 4 sits behind 1,2,5, and the 6 at index 5 reaches 4 only through the 5, since the 7 ahead of it is bigger. The backward sweep, run as LIS on the reversed array 3,1,6,7,5,2,8 and flipped back, gives g = 4,1,2,2,3,2,1,1: from index 0 the fall is 8,7,6,3 and from index 4 it is 7,6,3. The scores f[i]+g[i]-1 are 4,1,3,4,6,5,1,3, so the answer is 6 with the peak at index 4 — the mountain 1,2,5,7,6,3, which is not contiguous, exactly as a subsequence requires. On 1,2,3,4,2,1 the scores are 1,3,5,6,3,1, so the whole six-element array is already a mountain and the answer is 6; on 1,2,3 they are 1,2,3 and the last index has g = 1, so a purely increasing array answers 3; on 2,2 both sweeps give 1s, so the answer is 1, and an empty array answers 0 without any sweep running.",
    commonMistake:
      "Adding f[i] and g[i] without removing the peak counted twice, or letting equal values extend a chain by using a non-strict comparison.",
    whyWrong:
      "The double count is visible on 1,2,3,4,2,1: f is 1,2,3,4,2,1 and g is 1,2,3,3,2,1, so f+g at index 3 is 7 for an array with six elements — no subsequence can be longer than the array, and the extra 1 is the peak 4 appearing in both halves. The non-strict comparison is the quieter bug: on 2,2 it makes f = 1,2 and g = 1,1, so the function answers 2 while 2,2 has no strictly increasing pair and the answer is 1. Interviewers read the second one as a broken contract rather than a typo, because the same <= then makes the decreasing sweep accept a plateau and report a mountain that does not fall at all.",
    followUps:
      [
        "Your sweeps are quadratic. Where does the patience-form LIS with binary search still give a correct bitonic answer, and why must g be anchored at the same index rather than just be the LIS length of a suffix?",
        "Reconstruct the mountain itself, not its length. What extra per-index state has to survive both sweeps, and why does the answer have to be rebuilt from the peak?",
        "The sheet's linked version asks for the minimum removals that leave a mountain array. How does the answer change when both flanks must be non-empty and n must be at least 3?",
        "Count instead of optimising: how many distinct longest bitonic subsequences does 1,2,3,4,2,1 have? What pair would each cell have to hold, and where do ties appear?",
      ],
    solution:
      'function increasingEndsAt(arr) {\n' +
      '  const best = new Array(arr.length).fill(1);\n' +
      '  for (let i = 1; i < arr.length; i += 1) {\n' +
      '    for (let j = 0; j < i; j += 1) {\n' +
      '      if (arr[j] < arr[i] && best[j] + 1 > best[i]) best[i] = best[j] + 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function decreasingStartsAt(arr) {\n' +
      '  const fromRight = increasingEndsAt(arr.slice().reverse());\n' +
      '  const out = new Array(arr.length);\n' +
      '  for (let i = 0; i < arr.length; i += 1) out[i] = fromRight[arr.length - 1 - i];\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function bitonicScores(arr) {\n' +
      '  const forward = increasingEndsAt(arr);\n' +
      '  const backward = decreasingStartsAt(arr);\n' +
      '  return forward.map((value, index) => value + backward[index] - 1);\n' +
      '}\n' +
      '\n' +
      'function longestBitonicSubsequence(arr) {\n' +
      '  let best = 0;\n' +
      '  for (const score of bitonicScores(arr)) if (score > best) best = score;\n' +
      '  return best;\n' +
      '}',
    modify:
      "Require both flanks to be non-empty, so a purely increasing or purely decreasing run stops being a legal answer. Which line decides that, and what should an array of length two return now?",
  },
  {
    step: 16,
    name: "Number of Longest Increasing Subsequences",
    difficulty: "Medium",
    topicSlug: 'dp-greedy',
    stem: "Report how many different longest strictly increasing subsequences an array has, not only how long they are.",
    brief:
      "Input: an array of integers, duplicates allowed. Output: the length L of the longest strictly increasing subsequence and the number of distinct index sets that achieve it — chains are counted by positions, so equal values in different slots are different chains. Exhaustive enumeration of the 2^n subsets is off the table; a quadratic pair sweep is the target.",
    concepts: [
      "dsa-dp16d-count-resets-on-longer",
      "dsa-dp16d-ending-at-index-state",
      "dsa-count-by-adding-branches",
      "dsa-complexity-counting",
    ],
    shortAnswer:
      "Each index stores a pair: the best length ending there and how many ways reach it. A strictly longer child replaces the count, an equal-length child is added to it, and the fold over all indices obeys the same two rules.",
    idealAnswer:
      "The count has to ride on the same anchored state as the length, because a chain can only be extended by a bigger value later, so each cell is the pair (longest chain ending here, number of such chains). The transition is the LIS transition with one extra rule: when a predecessor offers a strictly better length, the cell takes that length and adopts the predecessor count wholesale — the old count belongs to shorter chains and must not leak into it; when the offered length equals what the cell already holds, the counts add, because the two sets of chains are disjoint by their last index before i. The same two rules then fold the answer over all cells, which is the place people forget the reset and double count. Cost is O(n squared) time and O(n) space for two arrays; nothing is collected, only integers are added, so the shape stays DP rather than search. The contract traps are strictness and the base case: equal values never chain, so a run of four equal values is length 1 with count 4, and an empty array has no chain at all — reporting count 1 there is the single most common off-by-one, because the identity for a sum is not the identity for a count of objects.",
    walkthrough:
      "On 1,3,5,4,7 the cells come out 1:1, 2:1, 3:1, 3:1, 4:2 — the 7 sees two predecessors at length 3, the chains 1,3,5 and 1,3,4, so it adds rather than replaces and reports 4:2. The fold finds best length 4 with count 2, which is the report. On 1,2,1,2,1 the cells are 1:1, 2:1, 1:1, 2:2, 1:1: the last 2 at index 3 reaches length 2 twice, from the 1 at index 0 and the 1 at index 2, and the 2 at index 1 reaches it once, so the fold over the length-2 cells gives 1 + 2 = 3 chains of length 2. On 2,2,2,2 no comparison ever passes, every cell stays 1:1, and the answer is length 1 with count 4 — every single element is its own longest chain. Counting every extendable chain instead of only the best-length ones is what turns this into the total number of increasing subsequences: on 1,3,5,4,7 that misreading reports 4 ways for the 7 (it adds the counts of 1, 3, 5 and 4) instead of 2, so the total becomes 4 rather than 2 while the length stays right.",
    commonMistake:
      "Accumulating a count for every shorter chain that can be extended, instead of replacing the count when a longer length appears and only adding when the length ties.",
    whyWrong:
      "The two rules price different things: an equal length means disjoint sets of chains and the counts add, while a strictly better length means the old count describes chains that are no longer candidates at that cell and has to be thrown away. On 1,3,5,4,7 the accumulate-everything version gives the final cell a count of 4, because it lets the chains 1, 1,3 and the two length-3 chains all feed the total, and reports 4 longest chains where only 1,3,5,7 and 1,3,4,7 exist. The mirror bug at the fold is the same arithmetic in reverse: taking max length and then summing every cell count adds the length-2 and length-3 cells into the answer, which on 1,2,3 returns 1 + 1 + 1 = 3 instead of 1.",
    followUps:
      [
        "The shipped version is O(n squared). Sketch the n log n patience form: what does each pile have to carry besides its top value so that the counts still add correctly?",
        "Return the count modulo 1000000007 and then the count of longest chains that end at the maximum element. Which of the two rules changes, and which is only a filter?",
        "Give an input on which the count is exponential in n, and say what that does to the exact-integer contract once n passes about sixty.",
        "Count non-decreasing longest chains instead, allowing equal values to chain. Which two comparisons move, and what does 2,2,2,2 return?",
      ],
    solution:
      'function lisLengthAndCount(arr) {\n' +
      '  const length = new Array(arr.length).fill(1);\n' +
      '  const count = new Array(arr.length).fill(1);\n' +
      '  for (let i = 1; i < arr.length; i += 1) {\n' +
      '    for (let j = 0; j < i; j += 1) {\n' +
      '      if (arr[j] >= arr[i]) continue;\n' +
      '      if (length[j] + 1 > length[i]) {\n' +
      '        length[i] = length[j] + 1;\n' +
      '        count[i] = count[j];\n' +
      '      } else if (length[j] + 1 === length[i]) {\n' +
      '        count[i] += count[j];\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  let best = 0;\n' +
      '  let ways = 0;\n' +
      '  for (let i = 0; i < arr.length; i += 1) {\n' +
      '    if (length[i] > best) {\n' +
      '      best = length[i];\n' +
      '      ways = count[i];\n' +
      '    } else if (length[i] === best) {\n' +
      '      ways += count[i];\n' +
      '    }\n' +
      '  }\n' +
      '  return { length: best, count: arr.length === 0 ? 0 : ways };\n' +
      '}\n' +
      '\n' +
      'function lisCells(arr) {\n' +
      '  const length = new Array(arr.length).fill(1);\n' +
      '  const count = new Array(arr.length).fill(1);\n' +
      '  for (let i = 1; i < arr.length; i += 1) {\n' +
      '    for (let j = 0; j < i; j += 1) {\n' +
      '      if (arr[j] >= arr[i]) continue;\n' +
      '      if (length[j] + 1 > length[i]) {\n' +
      '        length[i] = length[j] + 1;\n' +
      '        count[i] = count[j];\n' +
      '      } else if (length[j] + 1 === length[i]) {\n' +
      '        count[i] += count[j];\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return length.map((value, index) => value + ":" + count[index]).join(" ");\n' +
      '}',
    modify:
      "Report the lexicographically smallest longest increasing subsequence as well as its count. What does each cell have to carry beyond the pair, and what does that do to the space bound?",
  },
  {
    step: 16,
    name: "Matrix Chain Multiplication",
    difficulty: "Hard",
    topicSlug: 'dp-greedy',
    stem: "Parenthesise a chain of matrix products so that the scalar multiplications are minimal, and name the split that achieves it.",
    brief:
      "Input: dims, an array of n+1 integers in which matrix i is dims[i-1] by dims[i]; the matrices must be multiplied in the given order and only fully binary parenthesisations are legal. Output: the minimum number of scalar multiplications, plus the split position for the outermost interval. Nothing about the chain is greedy-safe, so the state is an interval and the decision is a cut.",
    concepts: [
      "dsa-dp16d-interval-length-iteration",
      "dsa-dp16d-split-point-decision",
      "dsa-memoization",
      "dsa-complexity-counting",
    ],
    shortAnswer:
      "dp[i][j] is the cheapest way to multiply matrices i..j, and it is the minimum over cuts k of dp[i][k] + dp[k+1][j] + dims[i-1]*dims[k]*dims[j]; fill by increasing span length, because every cell reads two strictly shorter spans.",
    idealAnswer:
      "The last multiplication performed on the chain i..j splits it at some k, and nothing else about the plan matters: the left half collapses to a dims[i-1] by dims[k] matrix and the right to dims[k] by dims[j], so the price of finishing is fixed by the three endpoints the interval already knows. That is the state definition that makes the subproblems independent, and it is why the cost term sits outside the two recursive calls rather than inside them. Every split asks for two strictly shorter spans, so the tabulated form must count lengths upward — dp[i][j] is written only after dp[i][k] and dp[k+1][j] exist — and the base case dp[i][i] = 0 encodes that a single matrix is already evaluated and costs nothing. The cost is O(n cubed) time for the n squared intervals times the n splits, with O(n squared) space, and storing the winning k per interval is what turns the number back into the parenthesisation. Two traps decide the contract: dims is one longer than the number of matrices, so the multiply term is dims[i-1]*dims[k]*dims[j] and an off-by-one there prices every plan wrong; and a chain of one matrix answers 0 rather than Infinity, which is the cell every length-2 interval reads.",
    walkthrough:
      "On dims 40,20,30,10,30 (four matrices A1 40x20 through A4 10x30) the table fills by length. Length 1 is all zero. Length 2: 1..2 = 24000, 2..3 = 6000, 3..4 = 9000, each a single multiplication. Length 3: 1..3 takes k=1 and gives 0 + 6000 + 40x20x10 = 8000 for 14000, while k=2 would be 24000 + 0 + 40x30x10 = 36000; 2..4 takes k=3 for 6000 + 0 + 20x10x30 = 6000, giving 12000, beating k=2 at 27000. Length 4: 1..4 tries k=1 at 0 + 12000 + 24000 = 36000, k=2 at 24000 + 9000 + 36000 = 69000 and k=3 at 14000 + 0 + 12000 = 26000, so the answer is 26000 with the outermost cut after A3. The same shape on 2,1,3,4 gives 6 at 1..2 and 12 at 2..3, then 20 at k=1 versus 30 at k=2 — the split after the first matrix wins, which is the plan m1 x (m2 m3). On 10,20,30 there is one interval of length 2, 6000, and on 7,13 there is no interval at all, so the answer is 0.",
    commonMistake:
      "Filling the table by walking the start index upward instead of by span length, or picking the split greedily at the smallest dims value.",
    whyWrong:
      "A start-ordered sweep reads cells nobody has written: on 40,20,30,10,30 the shipped mcmUnordered writes 1..3 as 0 + 0 + 8000 = 8000 because 2..3 is still sitting at its zero initialisation, then reuses that phantom at k=3 of the full chain as 8000 + 0 + 12000 = 20000 — a plan cheaper than any real plan, and it fails silently because nothing inside the loops ever looks wrong. Greedy on the cheapest adjacent product fails on arithmetic instead: on 2,1,3,4 the cheapest first multiplication is the 6 at 1..2, and mcmCheapestFirst pays 6 + 24 = 30 for the chain while the table answers 20, because merging that pair first leaves a 2x3 matrix that has to be paid for again at 2x3x4; the same shortcut on 40,20,30,10,30 collects 36000 against 26000. It looks sane on 10,20,30,40, where it also answers 18000, and that is the trap — an unproven rule passes its first three examples.",
    followUps:
      [
        "Store the winning k per interval and print the full parenthesisation. Why does the reconstruction follow the same length order the fill used?",
        "Knuth optimisation claims to shrink a cubic interval DP to quadratic by bounding the split search. What monotonicity of the optimal k would MCM need, and does its cost function have it?",
        "Count the parenthesisations that achieve the minimum cost instead of returning it. Which of the two rules from the counting rows applies at a tie, and what does the base case become?",
        "Give a chain where multiplying the cheapest adjacent pair first is worst, not merely suboptimal. How large can mcmCheapestFirst's gap to the table get as the chain grows?",
      ],
    solution:
      'function mcm(dims) {\n' +
      '  const n = dims.length - 1;\n' +
      '  if (n < 1) return 0;\n' +
      '  const table = [];\n' +
      '  for (let i = 0; i <= n; i += 1) table.push(new Array(n + 1).fill(0));\n' +
      '  for (let len = 2; len <= n; len += 1) {\n' +
      '    for (let i = 1; i + len - 1 <= n; i += 1) {\n' +
      '      const j = i + len - 1;\n' +
      '      table[i][j] = Infinity;\n' +
      '      for (let k = i; k < j; k += 1) {\n' +
      '        const cost = table[i][k] + table[k + 1][j] + dims[i - 1] * dims[k] * dims[j];\n' +
      '        if (cost < table[i][j]) table[i][j] = cost;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return table[1][n];\n' +
      '}\n' +
      '\n' +
      'function mcmMemo(dims) {\n' +
      '  const n = dims.length - 1;\n' +
      '  if (n < 1) return 0;\n' +
      '  const memo = new Map();\n' +
      '  const solve = (i, j) => {\n' +
      '    if (i === j) return 0;\n' +
      '    const key = i + "-" + j;\n' +
      '    if (memo.has(key)) return memo.get(key);\n' +
      '    let best = Infinity;\n' +
      '    for (let k = i; k < j; k += 1) {\n' +
      '      const cost = solve(i, k) + solve(k + 1, j) + dims[i - 1] * dims[k] * dims[j];\n' +
      '      if (cost < best) best = cost;\n' +
      '    }\n' +
      '    memo.set(key, best);\n' +
      '    return best;\n' +
      '  };\n' +
      '  return solve(1, n);\n' +
      '}\n' +
      '\n' +
      'function mcmSplit(dims) {\n' +
      '  const n = dims.length - 1;\n' +
      '  if (n < 2) return -1;\n' +
      '  const table = [];\n' +
      '  const split = [];\n' +
      '  for (let i = 0; i <= n; i += 1) {\n' +
      '    table.push(new Array(n + 1).fill(0));\n' +
      '    split.push(new Array(n + 1).fill(0));\n' +
      '  }\n' +
      '  for (let len = 2; len <= n; len += 1) {\n' +
      '    for (let i = 1; i + len - 1 <= n; i += 1) {\n' +
      '      const j = i + len - 1;\n' +
      '      table[i][j] = Infinity;\n' +
      '      for (let k = i; k < j; k += 1) {\n' +
      '        const cost = table[i][k] + table[k + 1][j] + dims[i - 1] * dims[k] * dims[j];\n' +
      '        if (cost < table[i][j]) {\n' +
      '          table[i][j] = cost;\n' +
      '          split[i][j] = k;\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return split[1][n];\n' +
      '}\n' +
      '\n' +
      'function mcmUnordered(dims) {\n' +
      '  const n = dims.length - 1;\n' +
      '  if (n < 1) return 0;\n' +
      '  const table = [];\n' +
      '  for (let i = 0; i <= n; i += 1) table.push(new Array(n + 1).fill(0));\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    for (let j = i + 1; j <= n; j += 1) {\n' +
      '      let best = Infinity;\n' +
      '      for (let k = i; k < j; k += 1) {\n' +
      '        const cost = table[i][k] + table[k + 1][j] + dims[i - 1] * dims[k] * dims[j];\n' +
      '        if (cost < best) best = cost;\n' +
      '      }\n' +
      '      table[i][j] = best;\n' +
      '    }\n' +
      '  }\n' +
      '  return table[1][n];\n' +
      '}\n' +
      '\n' +
      'function mcmCheapestFirst(dims) {\n' +
      '  const row = dims.slice();\n' +
      '  let total = 0;\n' +
      '  while (row.length > 2) {\n' +
      '    let cheapest = Infinity;\n' +
      '    let at = 1;\n' +
      '    for (let i = 1; i < row.length - 1; i += 1) {\n' +
      '      const cost = row[i - 1] * row[i] * row[i + 1];\n' +
      '      if (cost < cheapest) {\n' +
      '        cheapest = cost;\n' +
      '        at = i;\n' +
      '      }\n' +
      '    }\n' +
      '    total += cheapest;\n' +
      '    row.splice(at, 1);\n' +
      '  }\n' +
      '  return total;\n' +
      '}',
    modify:
      "The chain is cyclic: the product may start at any matrix, because the caller will rotate the operands. Which interval state changes, and what does the table size become?",
  },
  {
    step: 16,
    name: "Minimum Cost to Cut a Stick",
    difficulty: "Hard",
    topicSlug: 'dp-greedy',
    stem: "Pay for the order you cut in: return the cheapest total cost of making all the given cuts in a stick of length n.",
    brief:
      "Input: n, the stick length, and cuts, an unordered list of strictly interior positions between 1 and n-1. Output: the minimum total cost, where making a cut costs the length of the piece being cut at that moment. The list arrives unsorted and the price of a cut depends on which cuts surround it, so the order is the decision.",
    concepts: [
      "dsa-dp16d-sentinel-endpoints",
      "dsa-dp16d-last-element-standing-interval",
      "dsa-dp16d-interval-length-iteration",
      "dsa-dp16d-split-point-decision",
    ],
    shortAnswer:
      "Sort the cuts, fence them with 0 and n, and let dp[i][j] be the cheapest way to make every cut strictly between two fence points: min over the interior k of dp[i][k] + dp[k][j] + (points[j] - points[i]), where k is the cut made first inside that fenced piece.",
    idealAnswer:
      "The forward question is unanswerable as a DP because a cut's price depends on cuts already made outside it; the interval question is answerable because the sentinels make the boundaries explicit. Sort the positions and add 0 and n, then dp[i][j] means: the piece running from points[i] to points[j] is already fenced off by earlier cuts, and these are the cuts still to be made inside it. Whichever interior k is cut first must cost the whole fenced length points[j] - points[i], and after that cut the two remaining pieces are independent subproblems — which is exactly the decomposition the recurrence needs, and the reason a first-cut reading works here while balloons want the last-burst one. Filling by increasing span length keeps both halves available, the base case j = i + 1 costs 0 because there is no cut inside, and the answer is dp[0][m-1] over m = cuts + 2 points, costing O(m cubed) time and O(m squared) space. The traps are the fence and the sort: without 0 and n the outer piece has no length and the first cut is never priced at n, and an unsorted list makes the interior points of an interval meaningless — the DP indexes positions, not their order of arrival.",
    walkthrough:
      "For n = 7 with cuts 1,3,4,5 the sorted fence reads 0,1,3,4,5,7, so m = 6. Length 2 spans hold one cut each and are priced as the fenced piece: [0,2] cuts 1 in a piece of length 3, [1,3] cuts 3 in a piece of length 3, [2,4] cuts 4 in a piece of length 2, [3,5] cuts 5 in a piece of length 3. Length 3: [0,3] = 7 either way, [1,4] takes k=2 for 0 + 2 + 4 = 6, [2,5] takes k=4 for 2 + 0 + 4 = 6. Length 4: [0,4] = 10 via k=2 (3 + 2 + 5) and [1,5] = 12. Length 5: [0,5] = 16 via k=2, so the first cut of the whole stick is at position 3 — then the piece [0,3] pays 3 for the cut at 1, and the piece [3,7] pays 4 for the cut at 5 and 2 for the cut at 4. Forward: 7 + 3 + 4 + 2 = 16. Cutting in ascending position order instead pays 7, 6, 4, 3 for 20, and descending order pays 19, so the order is worth four units on this input. With a single cut, n = 8 and cuts [3], the table has one length-2 span and answers 8, the whole stick, and with no cuts at all the fence is just 0 and n, the base cell answers 0 and nothing is ever priced.",
    commonMistake:
      "Running the interval DP over the raw cut list without the 0 and n sentinels, or returning the cost of one fixed cutting order.",
    whyWrong:
      "Without the fence the outer interval has no endpoints, so no cell ever charges the original length: the shipped code's first cut is priced points[j] - points[i] = n precisely because i and j are the ends, and dropping them turns the first cut into whatever the nearest interior points suggest — on n = 7, cuts 1,3,4,5 that reads the first cut as 4 instead of 7 and can even answer below the true minimum of 16. The fixed-order answer is the more common one and it is plainly wrong on the same input: ascending 1,3,4,5 costs 7 + 6 + 4 + 3 = 20 and descending costs 19, four units above the optimum, because a cut's price is the piece it splits and the pieces are decided by everything cut before it.",
    followUps:
      [
        "Your state charges the first cut in a fenced piece. Re-derive it as the last cut made in a piece and show that the same table appears — what makes the two readings agree here but not for balloons?",
        "This recurrence satisfies the quadrangle inequality. State the monotonicity of the optimal k and how it turns the inner sweep from O(m) into an amortised window.",
        "Return an actual cutting order, not the cost. What per-cell state has to survive the fill, and why is the order a pre-order of the split tree?",
        "Adversarial input: n = 100 with cuts 1..99. What does the DP pay, and what does a balanced-first heuristic pay?",
      ],
    solution:
      'function prepareStickCuts(n, cuts) {\n' +
      '  return [0].concat(cuts.slice().sort((a, b) => a - b), [n]);\n' +
      '}\n' +
      '\n' +
      'function minCutCost(n, cuts) {\n' +
      '  const points = prepareStickCuts(n, cuts);\n' +
      '  const m = points.length;\n' +
      '  const table = [];\n' +
      '  for (let i = 0; i < m; i += 1) table.push(new Array(m).fill(0));\n' +
      '  for (let len = 2; len < m; len += 1) {\n' +
      '    for (let i = 0; i + len < m; i += 1) {\n' +
      '      const j = i + len;\n' +
      '      table[i][j] = Infinity;\n' +
      '      for (let k = i + 1; k < j; k += 1) {\n' +
      '        const cost = table[i][k] + table[k][j] + (points[j] - points[i]);\n' +
      '        if (cost < table[i][j]) table[i][j] = cost;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return table[0][m - 1];\n' +
      '}\n' +
      '\n' +
      'function firstCutPosition(n, cuts) {\n' +
      '  const points = prepareStickCuts(n, cuts);\n' +
      '  const m = points.length;\n' +
      '  if (m < 3) return -1;\n' +
      '  const table = [];\n' +
      '  const chosen = [];\n' +
      '  for (let i = 0; i < m; i += 1) {\n' +
      '    table.push(new Array(m).fill(0));\n' +
      '    chosen.push(new Array(m).fill(-1));\n' +
      '  }\n' +
      '  for (let len = 2; len < m; len += 1) {\n' +
      '    for (let i = 0; i + len < m; i += 1) {\n' +
      '      const j = i + len;\n' +
      '      table[i][j] = Infinity;\n' +
      '      for (let k = i + 1; k < j; k += 1) {\n' +
      '        const cost = table[i][k] + table[k][j] + (points[j] - points[i]);\n' +
      '        if (cost < table[i][j]) {\n' +
      '          table[i][j] = cost;\n' +
      '          chosen[i][j] = points[k];\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return chosen[0][m - 1];\n' +
      '}\n' +
      '\n' +
      'function cutCostOfOrder(n, cuts) {\n' +
      '  const made = [];\n' +
      '  let total = 0;\n' +
      '  for (const position of cuts) {\n' +
      '    const marks = [0].concat(made.slice().sort((a, b) => a - b), [n]);\n' +
      '    for (let i = 0; i + 1 < marks.length; i += 1) {\n' +
      '      if (marks[i] < position && position < marks[i + 1]) {\n' +
      '        total += marks[i + 1] - marks[i];\n' +
      '        break;\n' +
      '      }\n' +
      '    }\n' +
      '    made.push(position);\n' +
      '  }\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function minCutCostMemo(n, cuts) {\n' +
      '  const points = prepareStickCuts(n, cuts);\n' +
      '  const memo = new Map();\n' +
      '  const solve = (i, j) => {\n' +
      '    if (j === i + 1) return 0;\n' +
      '    const key = i + "-" + j;\n' +
      '    if (memo.has(key)) return memo.get(key);\n' +
      '    let best = Infinity;\n' +
      '    for (let k = i + 1; k < j; k += 1) {\n' +
      '      const cost = solve(i, k) + solve(k, j) + (points[j] - points[i]);\n' +
      '      if (cost < best) best = cost;\n' +
      '    }\n' +
      '    memo.set(key, best);\n' +
      '    return best;\n' +
      '  };\n' +
      '  return solve(0, points.length - 1);\n' +
      '}',
    modify:
      "The stick is a circular bracelet and one cut may be made anywhere to open it first, free of charge. Which change to the state does that force, and what does the interval table become?",
  },
  {
    step: 16,
    name: "Burst Balloons",
    difficulty: "Hard",
    topicSlug: 'dp-greedy',
    stem: "Choose the bursting order that maximises the coins collected, and say why the obvious greedy is wrong by an order of magnitude.",
    brief:
      "Input: nums, a row of positive integers; bursting balloon i pays nums[i-1] * nums[i] * nums[i+1], a missing neighbour counts as 1, and the row closes up behind the burst. Output: the maximum total coins. Every burst re-prices its two neighbours, so a prefix or suffix DP cannot exist.",
    concepts: [
      "dsa-dp16d-sentinel-endpoints",
      "dsa-dp16d-last-element-standing-interval",
      "dsa-dp16d-split-point-decision",
      "dsa-greedy-can-fail-to-answer-at-all",
    ],
    shortAnswer:
      "Pad the row with 1s and read the order backwards: dp[i][j] is the best score from bursting everything strictly between the two balloons still standing at i and j, k is the last one burst there, and it pays padded[i] * padded[k] * padded[j].",
    idealAnswer:
      "Forward, a burst erases the very neighbours that priced it, so no suffix of the row is an independent question; backwards, the last balloon burst inside an interval still has both of its interval boundaries standing, which is what makes the price computable from the endpoints alone. That reversal is the state definition: with 1s padded at both ends, dp[i][j] covers the balloons strictly between positions i and j, and the maximisation is over which of them is burst last — the two sides then cost nothing more, because they were already collected before the last burst closed the gap. The 1 sentinels are not decoration: they are the two balloons that never burst, so the outermost interval [0][n+1] is well defined and every edge burst is priced against a real neighbour. Fill by increasing span length, keep dp[i][i+1] = 0 as the empty interior, and the answer is dp[0][m-1] for m = n + 2, at O(n cubed) time and O(n squared) space. The traps are mutation and the padded ends: solving by simulating bursts destroys the index the table is written over, so the DP runs on a copy, and the contract for the empty row is 0 while a single balloon is 1 * nums[0] * 1, both of which fall out of the padded table only if the sentinels were added.",
    walkthrough:
      "On 3,1,5,8 the padded row is 1,3,1,5,8,1. Length 2 spans hold one balloon and price it against its neighbours: [0,2] bursts 3 between 1 and 1 for 3; [1,3] bursts 1 between 3 and 5 for 15; [2,4] bursts 5 between 1 and 8 for 40; [3,5] bursts 8 between 5 and 1 for 40. Length 3: [0,3] = 30, taking k=1 and 0 + 15 + 1x3x5 = 30 over the 8 at k=2; [1,4] = 135 via k=3, 15 + 0 + 3x5x8; [2,5] = 48 via k=4, 40 + 0 + 1x8x1. Length 4: [0,4] = 159 via k=1, 0 + 135 + 1x3x8 = 24; [1,5] = 159 via k=4, 135 + 0 + 3x8x1 = 24. Length 5: [0,5] tries k=1 at 0 + 159 + 1x3x1 = 162, k=2 at 3 + 48 + 1x1x1 = 52, k=3 at 30 + 40 + 1x5x1 = 75 and k=4 at 159 + 0 + 1x8x1 = 167, so the 8 is burst last. Walking the split tree down gives the forward order: burst the 1 for 3x1x5 = 15, then the 5 for 3x5x8 = 120, then the 3 for 1x3x8 = 24, then the 8 for 1x8x1 = 8 — 167. Bursting the smallest balloon first, the intuitive greedy, collects 15, 15, 40, 8 for 78 on the same row, and 1,5 answers 10 with an empty row answering 0.",
    commonMistake:
      "Bursting greedily — the smallest or the largest balloon first — or running the interval DP over the raw array without the two 1 sentinels.",
    whyWrong:
      "Greedy is wrong by a factor, not by a rounding: on 3,1,5,8 always bursting the smallest remaining balloon collects 78 coins, which is the shipped simulation, while the DP finds 167 — the value of a balloon is not its own number but the product of whoever is left beside it, so a cheap burst that removes a big neighbour is the expensive move. Dropping the sentinels is the arithmetic bug: edge balloons then have no standing neighbour to price against, so a naive table either reads a missing neighbour as zero and reports the single balloon 5 as 0 instead of 5, or has to special-case both ends, which is exactly the case the padded 1s delete.",
    followUps:
      [
        "Explain why the last-burst reading works for balloons but the first-cut reading works for the stick. What is it about a cut that does not re-price the rest of the piece?",
        "Return the bursting order as an array of positions. What does the table have to store alongside each cell, and in which order is the reconstruction read?",
        "The scores can multiply past 2 to the 53 for long rows of big values. Where does the shipped recurrence need modulo or BigInt, and what does that do to the max?",
        "Now bursting any balloon costs its own value as a penalty and you want the minimum net. Which single line changes, and does the last-burst reading survive?",
      ],
    solution:
      'function withSentinels(nums) {\n' +
      '  return [1].concat(nums.slice(), [1]);\n' +
      '}\n' +
      '\n' +
      'function maxCoins(nums) {\n' +
      '  const padded = withSentinels(nums);\n' +
      '  const m = padded.length;\n' +
      '  const table = [];\n' +
      '  for (let i = 0; i < m; i += 1) table.push(new Array(m).fill(0));\n' +
      '  for (let len = 2; len < m; len += 1) {\n' +
      '    for (let i = 0; i + len < m; i += 1) {\n' +
      '      const j = i + len;\n' +
      '      for (let k = i + 1; k < j; k += 1) {\n' +
      '        const coins = table[i][k] + table[k][j] + padded[i] * padded[k] * padded[j];\n' +
      '        if (coins > table[i][j]) table[i][j] = coins;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return table[0][m - 1];\n' +
      '}\n' +
      '\n' +
      'function burstSmallestFirst(nums) {\n' +
      '  const row = [1].concat(nums.slice(), [1]);\n' +
      '  let total = 0;\n' +
      '  while (row.length > 2) {\n' +
      '    let pick = 1;\n' +
      '    for (let i = 2; i < row.length - 1; i += 1) if (row[i] < row[pick]) pick = i;\n' +
      '    total += row[pick - 1] * row[pick] * row[pick + 1];\n' +
      '    row.splice(pick, 1);\n' +
      '  }\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function maxCoinsMemo(nums) {\n' +
      '  const padded = withSentinels(nums);\n' +
      '  const memo = new Map();\n' +
      '  const solve = (i, j) => {\n' +
      '    if (j === i + 1) return 0;\n' +
      '    const key = i + "-" + j;\n' +
      '    if (memo.has(key)) return memo.get(key);\n' +
      '    let best = 0;\n' +
      '    for (let k = i + 1; k < j; k += 1) {\n' +
      '      const coins = solve(i, k) + solve(k, j) + padded[i] * padded[k] * padded[j];\n' +
      '      if (coins > best) best = coins;\n' +
      '    }\n' +
      '    memo.set(key, best);\n' +
      '    return best;\n' +
      '  };\n' +
      '  return solve(0, padded.length - 1);\n' +
      '}',
    modify:
      "Balloons now carry colours and bursting one also pays the product of the two nearest surviving balloons of its own colour. What does the state have to remember, and does the last-burst reading still decompose?",
  },
  {
    step: 16,
    name: "Evaluate Boolean Expression to True",
    difficulty: "Hard",
    topicSlug: 'dp-greedy',
    stem: "Count how many ways a boolean string can be parenthesised so that it evaluates to true, and say why one number per span will not do.",
    brief:
      "Input: an alternating string of operands T and F (or 1 and 0) and the operators &, | and ^, with no precedence and spaces ignored. Output: the number of complete parenthesisations that evaluate to true and the number that evaluate to false, modulo 1e9+7 for the shipped contract. With n operands there are Catalan(n-1) trees to account for, so evaluating the string once is not the question.",
    concepts: [
      "dsa-dp16d-pair-of-counts-per-interval",
      "dsa-dp16d-interval-length-iteration",
      "dsa-dp16d-split-point-decision",
      "dsa-dp16d-catalan-count-overflow",
      "dsa-double-precision",
    ],
    shortAnswer:
      "Each span i..j stores a pair — the ways it can be parenthesised to true and the ways to false — and every split at operator k combines the two child pairs through that operator's four product terms; fill by span length and return the true component of the whole string.",
    idealAnswer:
      "The interval is over operands, and the split is the operator applied last, so the two children are strictly shorter spans and the table fills by length like every other interval DP here. What is different is the payload: a single count is not closed under the operators. AND's true count is the product of the two true counts, but its false count needs all three other products; OR is the dual, and XOR has no true term at all without the cross products true-times-false and false-times-true. On the span T^F the entire true count is the false count of the right operand, so a table that only stores true answers 0 there and every span built above it inherits the loss. The pair costs one extra integer per cell and turns the recurrence into four products selected by the operator, at O(n squared) cells, O(n cubed) split work and O(n squared) pairs. Two contract traps decide correctness: the base case is one way, not zero — a lone T is 1/0 and a lone F is 0/1 — and the totals must be taken modulo 1e9+7, because the number of parenthesisations of n operands is the Catalan number C(n-1), and C(30) = 3814986502092304 still fits a double while C(31) = 14544636044513104 is past Number.MAX_SAFE_INTEGER, so exact integer counts stop being representable long before the table stops being computable.",
    walkthrough:
      "Read 1|0&1^1|0 as operands 1,0,1,1,0 over the operators |, &, ^ and |. Length 1 is the operand itself: 1/0, 0/1, 1/0, 1/0, 0/1. Length 2, one operator each: 0..1 is 1|0 = 1/0, 1..2 is 0&1 = 0/1, 2..3 is 1^1 = 0/1, 3..4 is 1|0 = 1/0. Length 3: 0..2 is 2/0, because splitting at the | gives 1 | (0&1) = true and at the & gives (1|0) & 1 = true; 1..3 is 1/1, since 0 & (1^1) = false while (0&1) ^ 1 = true; 2..4 is 0/2, both splits landing false. Length 4: 0..3 = 2/3 and 1..4 = 2/3. Length 5: 0..4 = 7/7 — and 7 + 7 = 14 is exactly Catalan(4), the number of trees over five operands, which is the arithmetic check that no split was double counted or dropped. The pair is load-bearing rather than tidy: on T|T&F^T the span 0..2, the sub-expression T|T&F, is 1/1, and the ^ split at the top reads that 1 false way to produce the fourth true way of the answer 4/1; a true-only table loses it.",
    commonMistake:
      "Storing one count per span and deriving the rest by subtraction, or evaluating the string once with an operator stack and reporting whether it came out true.",
    whyWrong:
      "The second one answers a different question outright: a precedence stack on 1|0&1^1|0 returns a single boolean, while the ask is 7 of 14 trees. The first is the subtler and more expensive error, because it looks symmetric: true plus false is the tree count, so one side seems free — but XOR never lets you recover the cross terms from a total, and on the span T^F the true count is precisely the false count of the right child, so a one-sided table reports 0/0 there instead of 1/0 and every enclosing span shrinks with it. On T|T&F^T that collapses the answer from 4 true ways to 3, which is the classic GFG counterexample, and it is invisible until somebody tests an expression with two operators of different kinds.",
    followUps:
      [
        "The shipped table is exact integers. Where do you insert the modulus, why is a sum of products safe to reduce at every cell, and what breaks if you try to reduce only at the end?",
        "Fold the space from O(n squared) pairs toward a diagonal sweep or toward Catalan arithmetic: what does the false count cost you if you insist on deriving it as total minus true?",
        "Add implies and negate. Which operator first needs a third quantity per span, and what does the recurrence look like then?",
        "Return one parenthesised witness that evaluates true. What per-cell state survives the fill, and why is the reconstruction a pre-order over the split tree?",
      ],
    solution:
      'function parseBoolean(expr) {\n' +
      '  const values = [];\n' +
      '  const operators = [];\n' +
      '  for (let i = 0; i < expr.length; i += 1) {\n' +
      '    const ch = expr[i];\n' +
      '    if (ch === "T" || ch === "F") values.push(ch === "T");\n' +
      '    else if (ch === "1" || ch === "0") values.push(ch === "1");\n' +
      '    else if (ch !== " ") operators.push(ch);\n' +
      '  }\n' +
      '  return { values: values, operators: operators };\n' +
      '}\n' +
      '\n' +
      'function booleanPairForOp(left, operator, right) {\n' +
      '  let tru = 0;\n' +
      '  let fal = 0;\n' +
      '  if (operator === "&") {\n' +
      '    tru = left[0] * right[0];\n' +
      '    fal = left[0] * right[1] + left[1] * right[0] + left[1] * right[1];\n' +
      '  } else if (operator === "|") {\n' +
      '    tru = left[0] * right[0] + left[0] * right[1] + left[1] * right[0];\n' +
      '    fal = left[1] * right[1];\n' +
      '  } else {\n' +
      '    tru = left[0] * right[1] + left[1] * right[0];\n' +
      '    fal = left[0] * right[0] + left[1] * right[1];\n' +
      '  }\n' +
      '  return [tru, fal];\n' +
      '}\n' +
      '\n' +
      'function booleanWays(expr) {\n' +
      '  const parsed = parseBoolean(expr);\n' +
      '  const m = parsed.values.length;\n' +
      '  if (m === 0) return [0, 0];\n' +
      '  const table = [];\n' +
      '  for (let i = 0; i < m; i += 1) {\n' +
      '    table.push(new Array(m).fill(null));\n' +
      '    table[i][i] = parsed.values[i] ? [1, 0] : [0, 1];\n' +
      '  }\n' +
      '  for (let len = 2; len <= m; len += 1) {\n' +
      '    for (let i = 0; i + len <= m; i += 1) {\n' +
      '      const j = i + len - 1;\n' +
      '      let tru = 0;\n' +
      '      let fal = 0;\n' +
      '      for (let k = i; k < j; k += 1) {\n' +
      '        const pair = booleanPairForOp(table[i][k], parsed.operators[k], table[k + 1][j]);\n' +
      '        tru += pair[0];\n' +
      '        fal += pair[1];\n' +
      '      }\n' +
      '      table[i][j] = [tru, fal];\n' +
      '    }\n' +
      '  }\n' +
      '  return table[0][m - 1];\n' +
      '}\n' +
      '\n' +
      'function booleanTrueWays(expr) {\n' +
      '  return booleanWays(expr)[0];\n' +
      '}\n' +
      '\n' +
      'function booleanTotalWays(expr) {\n' +
      '  const pair = booleanWays(expr);\n' +
      '  return pair[0] + pair[1];\n' +
      '}\n' +
      '\n' +
      'function booleanWaysMemo(expr) {\n' +
      '  const parsed = parseBoolean(expr);\n' +
      '  const m = parsed.values.length;\n' +
      '  if (m === 0) return [0, 0];\n' +
      '  const memo = new Map();\n' +
      '  const solve = (i, j) => {\n' +
      '    if (i === j) return parsed.values[i] ? [1, 0] : [0, 1];\n' +
      '    const key = i + "-" + j;\n' +
      '    if (memo.has(key)) return memo.get(key);\n' +
      '    let tru = 0;\n' +
      '    let fal = 0;\n' +
      '    for (let k = i; k < j; k += 1) {\n' +
      '      const pair = booleanPairForOp(solve(i, k), parsed.operators[k], solve(k + 1, j));\n' +
      '      tru += pair[0];\n' +
      '      fal += pair[1];\n' +
      '    }\n' +
      '    memo.set(key, [tru, fal]);\n' +
      '    return [tru, fal];\n' +
      '  };\n' +
      '  return solve(0, m - 1);\n' +
      '}',
    modify:
      "The expression may contain a NOT applied to a single operand. Where does the pair for that operand flip, and does the split loop still see only binary operators?",
  },
  {
    step: 16,
    name: "Palindrome Partitioning - II",
    difficulty: "Hard",
    topicSlug: 'dp-greedy',
    stem: "Return the fewest cuts that split a string into palindromic pieces, and say which splits are legal to try at all.",
    brief:
      "Input: a string of lowercase letters, length up to a few hundred. Output: the minimum number of cut positions, 0 when the whole string is already a palindrome and 0 for the empty string; every resulting piece must be a palindrome, and a one-character piece always is.",
    concepts: [
      "dsa-dp16d-validity-gated-split",
      "dsa-dp16d-interval-length-iteration",
      "dsa-dp16d-split-point-decision",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "Two length-ordered interval tables: pal[i][j] from pal[i+1][j-1] and the end characters, then cuts[i][j] = 0 when that span is already a palindrome and otherwise 1 plus the minimum of cuts[i][k] + cuts[k+1][j] over the splits.",
    idealAnswer:
      "The skeleton is the same interval DP as the matrix chain: the decision is a cut position, both halves are strictly shorter spans, so the fill is by length, and the cell is a minimum over splits. What differs is where the information lives. In the chain, each split contributes a real price computed from the enclosing endpoints, so the split loop itself discriminates. Here every cut costs exactly 1, so the arithmetic cannot discriminate — all the content sits in which spans cost zero because they are palindromes as a whole, and that legality is a second interval table with its own length order: pal[i][j] is true when the ends match and pal[i+1][j-1] is already known, which is why the inner span has to be filled first and why length 1 and length 2 must be base cases rather than reads of an empty interval. The recurrence is then cuts[i][j] = 0 if pal[i][j], else 1 + min over k of cuts[i][k] + cuts[k+1][j]; the ceiling for any span is its length minus one, because single characters are always legal, which is also why no span is ever unreachable. Cost is O(n cubed) time and O(n squared) space for the interval form; the prefix form — one number per ending index, scanning legal starts — is the same legality table charged once and runs in O(n squared), which is what you would ship if the string were long.",
    walkthrough:
      "On a b c c b c the legality table by row reads 100000, 010010, 001100, 000101, 000010, 000001 — so 2..3, the cc, is a palindrome at length 2, 3..5, cbc, is one at length 3 because the ends match and the inner 4..4 is trivially legal, and 1..4, bccb, is one at length 4 through the inner cc. The cut table then fills by length with zero for those spans and one plus a split minimum elsewhere: length 2 gives 0..1 = 1, 1..2 = 1, 2..3 = 0, 3..4 = 1, 4..5 = 1; length 3 gives 0..2 = 2, 1..3 = 1 (b | cc), 2..4 = 1 (cc | b) and 3..5 = 0; length 4 gives 0..3 = 2, 1..4 = 0 and 2..5 = 1; length 5 gives 0..4 = 1 (a | bccb) and 1..5 = 1 (bccb | c); and length 6 reads 0..5 = 2, from 0..0 plus 1..4 plus 1, so the partition is a | bccb | c with two cuts. On Striver's own example ababbbabbababa the same table answers 3, and 0..11 falls out as aba | bbbabb | ab | aba. The two degenerate spans matter: aab is aa | b at 1 cut, abba is a palindrome so 0, and the empty string returns 0 without building any table at all.",
    commonMistake:
      "Reporting the number of palindrome pieces instead of the number of cuts, or testing each candidate piece for palindrome-ness inside the split loop instead of filling a legality table once.",
    whyWrong:
      "The two differ by exactly one and the difference is the contract: on ababbbabbababa the pieces are four and the cuts are three, so the piece reading answers 4 where the row asks 3, and on the single character a the piece reading answers 1 while an uncut string is legal and the answer is 0 — the same error makes the empty string answer -1 in the version that subtracts afterwards. The per-split palindrome test is the performance failure: a slice-and-reverse check inside a cubic loop re-walks the piece for every split, which is O(n) on top of the O(n cubed) already spent, so a five-hundred-character string stops being a table lookup and becomes a string comparison marathon; the two length-ordered tables cost the same asymptotically as the split loop and make legality one boolean read.",
    followUps:
      [
        "Rewrite the answer as the O(n squared) prefix DP over ending indices. Which quantity is reused, and why does the legality table stay exactly the same?",
        "Return the partition itself, not the count. What per-cell state has to survive the split loop, and in what order is it read back?",
        "Knuth-style speedups need the optimal split to move monotonically with the interval. Does the all-palindromes string ababbbabbababa show ties that break that monotonicity?",
        "Count the ways to partition into the fewest palindromes instead of reporting the minimum. Which of the two counting rules from the LIS row applies at a tie?",
      ],
    solution:
      'function palindromeTable(str) {\n' +
      '  const n = str.length;\n' +
      '  const pal = [];\n' +
      '  for (let i = 0; i < n; i += 1) pal.push(new Array(n).fill(false));\n' +
      '  for (let len = 1; len <= n; len += 1) {\n' +
      '    for (let i = 0; i + len <= n; i += 1) {\n' +
      '      const j = i + len - 1;\n' +
      '      pal[i][j] = str[i] === str[j] && (j - i < 2 || pal[i + 1][j - 1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return pal;\n' +
      '}\n' +
      '\n' +
      'function minPalCuts(str) {\n' +
      '  const n = str.length;\n' +
      '  if (n === 0) return 0;\n' +
      '  const pal = palindromeTable(str);\n' +
      '  const table = [];\n' +
      '  for (let i = 0; i < n; i += 1) table.push(new Array(n).fill(0));\n' +
      '  for (let len = 2; len <= n; len += 1) {\n' +
      '    for (let i = 0; i + len <= n; i += 1) {\n' +
      '      const j = i + len - 1;\n' +
      '      if (pal[i][j]) {\n' +
      '        table[i][j] = 0;\n' +
      '        continue;\n' +
      '      }\n' +
      '      let best = len - 1;\n' +
      '      for (let k = i; k < j; k += 1) {\n' +
      '        const cost = table[i][k] + table[k + 1][j] + 1;\n' +
      '        if (cost < best) best = cost;\n' +
      '      }\n' +
      '      table[i][j] = best;\n' +
      '    }\n' +
      '  }\n' +
      '  return table[0][n - 1];\n' +
      '}\n' +
      '\n' +
      'function minPalPieces(str) {\n' +
      '  return str.length === 0 ? 0 : minPalCuts(str) + 1;\n' +
      '}\n' +
      '\n' +
      'function minPalCutsPrefix(str) {\n' +
      '  const n = str.length;\n' +
      '  if (n === 0) return 0;\n' +
      '  const pal = palindromeTable(str);\n' +
      '  const cuts = new Array(n).fill(0);\n' +
      '  for (let end = 0; end < n; end += 1) {\n' +
      '    if (pal[0][end]) {\n' +
      '      cuts[end] = 0;\n' +
      '      continue;\n' +
      '    }\n' +
      '    let best = end;\n' +
      '    for (let start = 1; start <= end; start += 1) {\n' +
      '      if (pal[start][end] && cuts[start - 1] + 1 < best) best = cuts[start - 1] + 1;\n' +
      '    }\n' +
      '    cuts[end] = best;\n' +
      '  }\n' +
      '  return cuts[n - 1];\n' +
      '}\n' +
      '\n' +
      'function minPalCutsMemo(str) {\n' +
      '  const pal = palindromeTable(str);\n' +
      '  const n = str.length;\n' +
      '  const memo = new Map();\n' +
      '  const solve = (i, j) => {\n' +
      '    if (i >= j || pal[i][j]) return 0;\n' +
      '    const key = i + "-" + j;\n' +
      '    if (memo.has(key)) return memo.get(key);\n' +
      '    let best = j - i;\n' +
      '    for (let k = i; k < j; k += 1) {\n' +
      '      const cost = solve(i, k) + solve(k + 1, j) + 1;\n' +
      '      if (cost < best) best = cost;\n' +
      '    }\n' +
      '    memo.set(key, best);\n' +
      '    return best;\n' +
      '  };\n' +
      '  return n === 0 ? 0 : solve(0, n - 1);\n' +
      '}',
    modify:
      "Every piece must be a palindrome of length at least two, and a leftover single character costs a penalty of one cut. Which of the two tables has to change, and what does the base case become?",
  },
  {
    step: 16,
    name: "Partition Array for Maximum Sum",
    difficulty: "Medium",
    topicSlug: 'dp-greedy',
    stem: "Split the array into consecutive groups of length at most k, replace each group by its maximum, and return the largest achievable total.",
    brief:
      "Input: an array of positive integers and an integer k of at least 1. Output: the greatest sum obtainable after replacing every element of a group by that group's maximum, where a group is a run of 1 to k consecutive elements and the groups must cover the array exactly once. The boundaries are the decision; the price of a group depends only on its own elements and its own length.",
    concepts: [
      "dsa-dp16d-bounded-window-partition",
      "dsa-dp16d-ending-at-index-state",
      "dsa-recursive-decomposition",
      "dsa-complexity-counting",
    ],
    shortAnswer:
      "best[i] is the answer for the first i elements and the transition enumerates the size s = 1..k of the last group, carrying its running maximum inward: best[i] = max over s of best[i-s] + maximum*s. Time O(n*k), space O(n).",
    idealAnswer:
      "Every legal partition of the first i elements ends in exactly one last group, and that group is a run of at most k elements taken from the tail, so enumerating its size enumerates every partition: best[i] = max over s = 1..k of best[i-s] + (maximum of arr[i-s..i-1])*s. This is interval DP with one endpoint frozen — the second index that the matrix chain and the cut rows need is replaced by the fixed ceiling k, which is what drops a cubic sweep to n times k and removes a whole table dimension. The state closes because the price of the last group depends on nothing outside it: no other group can change its maximum or its length, so best[i-s] is reused blindly. Two details carry the contract. The maximum for candidate s is accumulated while s grows inward — read arr[i-s], keep the running high — which makes each i cost k comparisons instead of k slice-and-reduce passes. And a group is allowed to be shorter than k: k is a ceiling, not a block size, so the loop bound is the smaller of k and i and a prefix shorter than k still gets a candidate that covers it whole. Space is O(n) for best, plus O(n) for the chosen size per index when the partition itself must be returned, in which case the walk-back starts at i = n and subtracts the stored s. Because the values are positive, initialising best to zero is safe; with negatives both the zero ceiling and the empty prefix stop being lower bounds and every cell but index 0 has to start at -Infinity.",
    walkthrough:
      "On 2,3,1,5,10 with k = 3 the prefix table reads 0,2,6,9,17,36. i=1 has one candidate, the group [2], for 2. i=2 tries s=1 (best[1] + 3 = 5) and s=2 ([2,3] priced 3x2 = 6) and keeps 6. i=3 tries s=1 (6 + 1 = 7), s=2 ([3,1] priced 3x2 on top of best[1] = 8) and s=3 ([2,3,1] priced 3x3 = 9). i=4 is where the window pays off: s=1 gives 9 + 5 = 14, s=2 gives best[2] + 5x2 = 16 and s=3 gives best[1] + 5x3 = 17, so the 5 rides with the 2 and the 3 instead of standing alone. i=5 reads s=1 at 27, s=2 at best[3] + 10x2 = 29 and s=3 at best[2] + 10x3 = 36 — the answer — and walking the stored sizes back from i=5 yields [2,3]->3x2 then [1,5,10]->10x3. On 1,15,7,9,2,5 with k = 3 the table is 0,1,30,45,54,63,72: 15 takes the first three slots for 45 and 9 covers 9,2,5 for 27 more, so 72 with the partition [1,15,7]->15x3 [9,2,5]->9x3. The window edges: k = 1 forces singletons and answers the plain sum 6 on 1,2,3, k = 5 clamps to a window of 2 on 1,2 and answers 2x2 = 4, and 7,2,5,10,6 with k = 3 answers 44 from [7,2]->7x2 plus [5,10,6]->10x3.",
    commonMistake:
      "Chunking the array into fixed blocks of exactly k and charging each block's maximum times k, instead of letting the last group of every prefix be shorter than k.",
    whyWrong:
      "The block reading solves a different problem: on 2,3,1,5,10 with k = 3 it splits as [2,3,1] priced 3x3 = 9 and [5,10] priced 10x2 = 20, so maxSumFixedBlocks returns 29 where the DP returns 36 — moving the boundary one place left lets the 1 ride with the 10 for free instead of diluting the 3 group, and a fixed grid cannot see that. Worse, the bug is invisible on the example that ships with the row: on 1,15,7,9,2,5 the blocks are [1,15,7] and [9,2,5], which is exactly the optimal partition, so the block function also answers 72 and looks correct. The clamped window is also a guard against inventing input — on 1,2 with k = 5 a version that pads the short tail to five slots charges 2x5 = 10 for three elements that are not there, where the legal answer is 4 from one group of two.",
    followUps:
      [
        "Shrink the O(n) best array to O(k). Which entries can be dropped once index i is written, and what breaks when the partition itself has to be reconstructed?",
        "Each i re-derives its own running maximum over k elements. Can a monotonic deque share that work between prefixes, and does it ever beat O(n*k) when k is a sizeable fraction of n?",
        "Change the price of a group to its maximum times its length plus the number of groups used so far. Does the prefix state still close, and how many quantities must the cell carry now?",
        "k can exceed the array length. Show the answer degenerates to maximum*n, and argue that clamping the window is the only guard the loop needs.",
      ],
    solution:
      'function partitionPrefix(arr, k) {\n' +
      '  const best = new Array(arr.length + 1).fill(0);\n' +
      '  const pick = new Array(arr.length + 1).fill(0);\n' +
      '  const window = Math.max(1, Math.min(k, arr.length));\n' +
      '  for (let i = 1; i <= arr.length; i += 1) {\n' +
      '    let highest = -Infinity;\n' +
      '    for (let size = 1; size <= window && size <= i; size += 1) {\n' +
      '      if (arr[i - size] > highest) highest = arr[i - size];\n' +
      '      const candidate = best[i - size] + highest * size;\n' +
      '      if (candidate > best[i]) {\n' +
      '        best[i] = candidate;\n' +
      '        pick[i] = size;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return { best: best, pick: pick };\n' +
      '}\n' +
      '\n' +
      'function maxSumAfterPartition(arr, k) {\n' +
      '  if (arr.length === 0) return 0;\n' +
      '  return partitionPrefix(arr, k).best[arr.length];\n' +
      '}\n' +
      '\n' +
      'function maxSumTable(arr, k) {\n' +
      '  return partitionPrefix(arr, k).best.join(",");\n' +
      '}\n' +
      '\n' +
      'function maxSumPartition(arr, k) {\n' +
      '  if (arr.length === 0) return "";\n' +
      '  const state = partitionPrefix(arr, k);\n' +
      '  const pieces = [];\n' +
      '  let end = arr.length;\n' +
      '  while (end > 0) {\n' +
      '    const size = state.pick[end] > 0 ? state.pick[end] : 1;\n' +
      '    const group = arr.slice(end - size, end);\n' +
      '    let highest = -Infinity;\n' +
      '    for (const value of group) if (value > highest) highest = value;\n' +
      '    pieces.unshift("[" + group.join(",") + "]->" + highest + "x" + size);\n' +
      '    end -= size;\n' +
      '  }\n' +
      '  return pieces.join(" ");\n' +
      '}\n' +
      '\n' +
      'function maxSumFixedBlocks(arr, k) {\n' +
      '  let total = 0;\n' +
      '  for (let start = 0; start < arr.length; start += k) {\n' +
      '    const size = Math.min(k, arr.length - start);\n' +
      '    let highest = -Infinity;\n' +
      '    for (let i = start; i < start + size; i += 1) if (arr[i] > highest) highest = arr[i];\n' +
      '    total += highest * size;\n' +
      '  }\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function maxSumMemo(arr, k) {\n' +
      '  const memo = new Map();\n' +
      '  const solve = (start) => {\n' +
      '    if (start >= arr.length) return 0;\n' +
      '    if (memo.has(start)) return memo.get(start);\n' +
      '    let highest = -Infinity;\n' +
      '    let best = 0;\n' +
      '    for (let size = 1; size <= k && start + size <= arr.length; size += 1) {\n' +
      '      if (arr[start + size - 1] > highest) highest = arr[start + size - 1];\n' +
      '      const candidate = highest * size + solve(start + size);\n' +
      '      if (candidate > best) best = candidate;\n' +
      '    }\n' +
      '    memo.set(start, best);\n' +
      '    return best;\n' +
      '  };\n' +
      '  return solve(0);\n' +
      '}',
    modify:
      "All groups must now have one common length chosen for the whole array, and a leftover shorter tail is charged at the maximum of the last full group. Which loop bound changes, and what extra candidate has to be tried at the end?",
  },
  {
    step: 16,
    name: "Maximum Rectangle Area with all 1's",
    difficulty: "Hard",
    topicSlug: 'dp-greedy',
    stem: "Return the area of the largest axis-aligned rectangle made entirely of 1s in a binary matrix.",
    brief:
      "Input: a matrix of rows of 0 and 1, all rows the same width, possibly empty. Output: the area (height times width) of the largest all-ones submatrix rectangle, 0 for an empty or all-zero matrix. A rectangle picks its width and its height independently, which is exactly what stops a single cell from deciding it.",
    concepts: [
      "dsa-dp16d-rectangle-needs-stack-not-cell",
      "dsa-histogram-per-row",
      "dsa-bar-owns-the-span-until-shorter",
      "dsa-index-stack-not-value-stack",
    ],
    shortAnswer:
      "Keep heights[c], the number of consecutive 1s ending at the current row in column c, and run the monotonic-stack largest-rectangle-in-histogram on each row of heights; the best over rows is the answer, in O(rows*cols) time and O(cols) space.",
    idealAnswer:
      "An all-ones rectangle has a bottom row, and at that row the columns it covers are precisely the bars at least as tall as the rectangle, so for each row r the problem reduces to the largest rectangle in the histogram of consecutive ones ending at r; maximising over rows is exhaustive because the bottom row of an optimal rectangle is one of them. That histogram is itself an anchored state one axis down: heights[c] either grows by one or resets to zero, the same ending-here idea the bitonic row uses. The square recurrence cannot stand in for it, and the reason is dimensional: dp[r][c] = 1 + min(up, left, diagonal) works because a square has one size number, so three neighbours bound the same quantity, while a bar in a rectangle is bounded by how far it can extend left and right before something shorter appears — a property of the whole row, not of the three cells around it. The stack supplies both boundaries at once: indices are kept in increasing height order and a bar is popped by the first strictly shorter bar to its right, at which moment its right boundary is the current index and its left boundary is the index now on top of the stack, so the candidate is height * (i - left - 1). Each index is pushed and popped once, so a row costs O(cols) amortised, the matrix O(rows*cols), and only the height array plus the stack are kept. Contract traps: a 0 resets its column rather than pausing it, the sentinel flush at i = cols is what empties a still-climbing stack, and an empty matrix must answer 0 before any row loop reads row zero.",
    walkthrough:
      "On the four-by-five matrix 10100 / 10111 / 11111 / 10010 the height rows read 1,0,1,0,0 | 2,0,2,1,1 | 3,1,3,2,2 | 4,0,0,3,0. The first row has nothing wider than one bar, so it answers 1; the second, 2,0,2,1,1, answers 3 from the run 2,1,1 priced at height 1 over width 3; the third is where the winner lives; the fourth, 4,0,0,3,0, answers 4 from the single column of four. Inside the third row, on 3,1,3,2,2, the index stack goes: push 0; the 1 at index 1 pops index 0 for 3x1 = 3, then is pushed; index 2 (height 3) is pushed; index 3 (height 2) pops index 2 for 3x1 = 3, then is pushed; index 4 (height 2) is pushed, since an equal height does not pop; the sentinel 0 at i = 5 pops index 4 for 2x1 = 2, pops index 3 whose left boundary is index 1 for 2x(5-1-1) = 6, and pops index 1 for 1x5 = 5. The best is 6 — the two rows 1..2 across the three columns 2..4, a rectangle that is not a square. Run the same matrix through the square recurrence and largestSquareArea answers 4: its table tops out at side 2, so no cell in it can state the 2x3 block the stack just found.",
    commonMistake:
      "Reporting the largest all-ones square from the min-of-three-neighbours recurrence as though it were the rectangle answer, or running the stack over each raw row of 0 and 1 values instead of the accumulated heights.",
    whyWrong:
      "On 10100 / 10111 / 11111 / 10010 the square recurrence returns 4 while the largest rectangle is 6: the block of rows 1..2 by columns 2..4 is a legal all-ones submatrix and a side length simply cannot name it, so the answer is short by a third on the smallest matrix that distinguishes the two questions. Dropping the accumulation is the quieter bug and needs only two rows to show: over the raw 0/1 values of 1,1 / 1,1 no bar ever grows past 1, the stack reports 2, and the whole four-cell block of ones — which maximalRectangle does return as 4 — is invisible, because a rectangle can extend upward through rows the current row does not itself contain.",
    followUps:
      [
        "Count every all-ones rectangle instead of maximising. What does each popped bar contribute, and why does the straightforward per-bar double loop go quartic?",
        "Give the histogram that makes a plain expand-left-and-right-per-bar scan cost its worst O(cols squared), and show the stack stays linear on it.",
        "Run the stack over column histograms instead of row histograms. When is that the cheaper orientation, and does the answer change?",
        "The largest plus-sign and the largest square can both be read off the same heights array. Which of the two stack boundaries changes, and which question becomes a per-cell minimum?",
      ],
    solution:
      'function rowHistograms(matrix) {\n' +
      '  if (matrix.length === 0 || matrix[0].length === 0) return "";\n' +
      '  const width = matrix[0].length;\n' +
      '  const heights = new Array(width).fill(0);\n' +
      '  const rows = [];\n' +
      '  for (let r = 0; r < matrix.length; r += 1) {\n' +
      '    for (let c = 0; c < width; c += 1) heights[c] = matrix[r][c] === 1 ? heights[c] + 1 : 0;\n' +
      '    rows.push(heights.join(","));\n' +
      '  }\n' +
      '  return rows.join(" | ");\n' +
      '}\n' +
      '\n' +
      'function largestRectangleInHistogram(heights) {\n' +
      '  const stack = [];\n' +
      '  let area = 0;\n' +
      '  for (let i = 0; i <= heights.length; i += 1) {\n' +
      '    const level = i === heights.length ? 0 : heights[i];\n' +
      '    while (stack.length > 0 && heights[stack[stack.length - 1]] > level) {\n' +
      '      const top = stack.pop();\n' +
      '      const left = stack.length === 0 ? -1 : stack[stack.length - 1];\n' +
      '      const candidate = heights[top] * (i - left - 1);\n' +
      '      if (candidate > area) area = candidate;\n' +
      '    }\n' +
      '    stack.push(i);\n' +
      '  }\n' +
      '  return area;\n' +
      '}\n' +
      '\n' +
      'function rowMaxRectangles(matrix) {\n' +
      '  if (matrix.length === 0 || matrix[0].length === 0) return "";\n' +
      '  const width = matrix[0].length;\n' +
      '  const heights = new Array(width).fill(0);\n' +
      '  const out = [];\n' +
      '  for (let r = 0; r < matrix.length; r += 1) {\n' +
      '    for (let c = 0; c < width; c += 1) heights[c] = matrix[r][c] === 1 ? heights[c] + 1 : 0;\n' +
      '    out.push(largestRectangleInHistogram(heights));\n' +
      '  }\n' +
      '  return out.join(",");\n' +
      '}\n' +
      '\n' +
      'function maximalRectangle(matrix) {\n' +
      '  if (matrix.length === 0 || matrix[0].length === 0) return 0;\n' +
      '  const width = matrix[0].length;\n' +
      '  const heights = new Array(width).fill(0);\n' +
      '  let best = 0;\n' +
      '  for (let r = 0; r < matrix.length; r += 1) {\n' +
      '    for (let c = 0; c < width; c += 1) heights[c] = matrix[r][c] === 1 ? heights[c] + 1 : 0;\n' +
      '    const area = largestRectangleInHistogram(heights);\n' +
      '    if (area > best) best = area;\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function largestSquareArea(matrix) {\n' +
      '  if (matrix.length === 0 || matrix[0].length === 0) return 0;\n' +
      '  const width = matrix[0].length;\n' +
      '  const dp = [];\n' +
      '  let side = 0;\n' +
      '  for (let r = 0; r < matrix.length; r += 1) {\n' +
      '    const row = new Array(width).fill(0);\n' +
      '    for (let c = 0; c < width; c += 1) {\n' +
      '      if (matrix[r][c] !== 1) continue;\n' +
      '      if (r === 0 || c === 0) row[c] = 1;\n' +
      '      else row[c] = 1 + Math.min(dp[r - 1][c], row[c - 1], dp[r - 1][c - 1]);\n' +
      '      if (row[c] > side) side = row[c];\n' +
      '    }\n' +
      '    dp.push(row);\n' +
      '  }\n' +
      '  return side * side;\n' +
      '}',
    modify:
      "Cells now carry integer weights and a rectangle's value is its area times the smallest weight inside it. Why does the accumulated height stop being a count of rows, and what does the stack have to compare instead?",
  },
  {
    step: 16,
    name: "Count Square Submatrices with All Ones",
    difficulty: "Medium",
    topicSlug: 'dp-greedy',
    stem: "Count every all-ones square submatrix of a binary matrix, of every side length, including the single cells.",
    brief:
      "Input: a matrix of rows of 0 and 1 of equal width, possibly empty or all zeros. Output: the total number of axis-aligned all-ones squares, so a matrix with a single 1 counts 1 and an empty matrix counts 0. Every side length from 1 up to the largest legal one contributes, which makes the answer a sum over cells rather than a maximum.",
    concepts: [
      "dsa-dp16d-square-side-ending-here",
      "dsa-row-recurrence",
      "dsa-coordinate-loops",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "dp[r][c] is the side of the largest all-ones square whose bottom-right corner is (r,c): 0 on a zero cell, else 1 + min(dp[r-1][c], dp[r][c-1], dp[r-1][c-1]); summing the table is the count, because a cell of value s owns exactly one square of each side 1 through s.",
    idealAnswer:
      "Anchoring the state on the bottom-right corner is what turns a square into a one-number question: a square of side s at (r,c) contains, and needs, three squares of side s-1 with corners above it, to its left and diagonally, so the largest legal s is one more than the smallest of those three — the shortest neighbour is the one that runs out of ones first and the other two cannot push past it. A zero cell resets to 0 because a square whose corner is a 0 does not exist at any size, and the first row and first column are 1 wherever the matrix has a 1 since a square anchored on an edge can only be 1x1. The count then costs nothing extra: dp[r][c] = s says the s nested squares of side 1..s at that corner are all ones, and every square has exactly one bottom-right corner, so summing the cells counts each square once — while the table maximum is a different quantity altogether, the side of the largest square. Time is O(rows*cols) and space O(rows*cols) for the table, or O(cols) with two rolling rows, in which case the diagonal has to be saved before the cell to the left overwrites the row above, which is the classic bug in this recurrence. Against the rectangle row the contrast is exact rather than stylistic: the three-neighbour minimum answers the squares question in constant work per cell and cannot answer the rectangle question at all, because a rectangle's reach is set by the nearest shorter bar on either side of a row, not by three adjacent cells.",
    walkthrough:
      "On 0111 / 1111 / 0111 the table reads 0,1,1,1 | 1,1,2,2 | 0,1,2,3 and sums to 15: ten 1x1 squares (the ten ones), four 2x2 and one 3x3. Every cell is a three-neighbour minimum — dp[1][1] = 1 + min(dp[0][1] = 1, dp[1][0] = 1, dp[0][0] = 0) = 1, because the missing corner 0 caps it; dp[1][2] = 1 + min(1, 1, 1) = 2; dp[2][3] = 1 + min(dp[1][3] = 2, dp[2][2] = 2, dp[1][2] = 2) = 3, and that 3 owns the squares of side 1, 2 and 3 that end on the last cell. On 101 / 110 / 110 the table is 1,0,1 | 1,1,0 | 1,2,0 for 7, a lone 1 answers 1, and an empty matrix answers 0 before any loop runs. The matrix used by the rectangle row, 10100 / 10111 / 11111 / 10010, gives the table 1,0,1,0,0 | 1,0,1,1,1 | 1,1,1,2,2 | 1,0,0,1,0: fifteen squares with a largest side of 2, so its square area is 4 where the stack's rectangle answer was 6.",
    commonMistake:
      "Returning the largest value in the table, or its square, as the answer instead of summing the table, and letting a zero cell keep a positive value so squares containing a 0 get counted.",
    whyWrong:
      "The two readings answer different questions: on 0111 / 1111 / 0111 the table maximum is 3 and the count is 15, so the maximum reports a side length for a row that asks how many squares exist; the gap shows on the smallest possible input too, since 1,1 / 1,1 has maximum 2 (area 4) and a true count of 5, the four single cells plus the one 2x2. Skipping the reset is the same class of error in the other direction: countSquares on 1,0 / 0,1 is 2, exactly the two ones present, and a table that leaves a value in the zero cells counts squares whose corner is a 0 — four of them here — which is the contract broken rather than a rounding choice.",
    followUps:
      [
        "Prove the sum-of-cells identity: why does every square have exactly one bottom-right corner, and what changes if you anchor on top-left corners instead?",
        "Roll the table down to a single O(cols) row. Which read must happen before which write, and why is the diagonal the only neighbour that needs its own variable?",
        "The same matrix asks for the number of all-ones rectangles. Why does the sum-of-cells trick fail and the histogram stack take over?",
        "On an all-ones n by n matrix the answer is the sum over s of (n - s + 1) squared. What closed form does that give, and at what n does it stop fitting a 32-bit integer?",
      ],
    solution:
      'function squareTable(matrix) {\n' +
      '  if (matrix.length === 0 || matrix[0].length === 0) return [];\n' +
      '  const width = matrix[0].length;\n' +
      '  const dp = [];\n' +
      '  for (let r = 0; r < matrix.length; r += 1) {\n' +
      '    const row = new Array(width).fill(0);\n' +
      '    for (let c = 0; c < width; c += 1) {\n' +
      '      if (matrix[r][c] !== 1) continue;\n' +
      '      if (r === 0 || c === 0) row[c] = 1;\n' +
      '      else row[c] = 1 + Math.min(dp[r - 1][c], row[c - 1], dp[r - 1][c - 1]);\n' +
      '    }\n' +
      '    dp.push(row);\n' +
      '  }\n' +
      '  return dp;\n' +
      '}\n' +
      '\n' +
      'function squareTableRows(matrix) {\n' +
      '  return squareTable(matrix).map((row) => row.join(",")).join(" | ");\n' +
      '}\n' +
      '\n' +
      'function countSquares(matrix) {\n' +
      '  let total = 0;\n' +
      '  for (const row of squareTable(matrix)) {\n' +
      '    for (const value of row) total += value;\n' +
      '  }\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function largestSquareSide(matrix) {\n' +
      '  let side = 0;\n' +
      '  for (const row of squareTable(matrix)) {\n' +
      '    for (const value of row) if (value > side) side = value;\n' +
      '  }\n' +
      '  return side;\n' +
      '}\n' +
      '\n' +
      'function countSquaresRolling(matrix) {\n' +
      '  if (matrix.length === 0 || matrix[0].length === 0) return 0;\n' +
      '  const width = matrix[0].length;\n' +
      '  let prev = new Array(width).fill(0);\n' +
      '  let total = 0;\n' +
      '  for (let r = 0; r < matrix.length; r += 1) {\n' +
      '    const row = new Array(width).fill(0);\n' +
      '    for (let c = 0; c < width; c += 1) {\n' +
      '      if (matrix[r][c] !== 1) continue;\n' +
      '      if (r === 0 || c === 0) row[c] = 1;\n' +
      '      else row[c] = 1 + Math.min(prev[c], row[c - 1], prev[c - 1]);\n' +
      '      total += row[c];\n' +
      '    }\n' +
      '    prev = row;\n' +
      '  }\n' +
      '  return total;\n' +
      '}',
    modify:
      "Only the border of a square has to be ones and its interior may be empty. Does the three-neighbour minimum still decide the cell, and what per-cell structure would let you test a border in constant time?",
  },
];

export const expects: Record<string, string> = {
  "Longest Bitonic Subsequence":
    '(() => { const t = [8,1,2,5,7,6,1,3]; return longestBitonicSubsequence(t) === 6 && bitonicScores(t).join(",") === "4,1,3,4,6,5,1,3" && longestBitonicSubsequence([1,2,3,4,2,1]) === 6 && increasingEndsAt([1,2,3,4,2,1]).join(",") === "1,2,3,4,2,1" && decreasingStartsAt([1,2,3,4,2,1]).join(",") === "1,2,3,3,2,1" && longestBitonicSubsequence([1,2,3]) === 3 && longestBitonicSubsequence([]) === 0; })()',
  "Number of Longest Increasing Subsequences":
    '(() => { const a = lisLengthAndCount([1,3,5,4,7]); return a.length === 4 && a.count === 2 && lisCells([1,3,5,4,7]) === "1:1 2:1 3:1 3:1 4:2" && lisLengthAndCount([1,2,1,2,1]).count === 3 && lisLengthAndCount([2,2,2,2]).count === 4 && lisLengthAndCount([1,2,4,3,5,4,7,2]).length === 5 && lisLengthAndCount([5]).count === 1 && lisLengthAndCount([]).count === 0; })()',
  "Matrix Chain Multiplication":
    '(() => { return mcm([10,20,30]) === 6000 && mcm([40,20,30,10,30]) === 26000 && mcmMemo([40,20,30,10,30]) === 26000 && mcmSplit([10,20,30,40]) === 2 && mcm([2,1,3,4]) === 20 && mcm([7,13]) === 0 && mcmUnordered([40,20,30,10,30]) === 20000 && mcmCheapestFirst([2,1,3,4]) === 30; })()',
  "Minimum Cost to Cut a Stick":
    '(() => { return prepareStickCuts(7, [1,3,4,5]).join(",") === "0,1,3,4,5,7" && minCutCost(7, [1,3,4,5]) === 16 && firstCutPosition(7, [1,3,4,5]) === 3 && minCutCostMemo(7, [1,3,4,5]) === 16 && minCutCost(9, [5,6,1,3,2]) === 23 && minCutCost(15, [8,3,10,7]) === 33 && minCutCost(10, []) === 0 && cutCostOfOrder(7, [1,3,4,5]) === 20; })()',
  "Burst Balloons":
    '(() => { return withSentinels([3,1,5,8]).join(",") === "1,3,1,5,8,1" && maxCoins([3,1,5,8]) === 167 && maxCoinsMemo([3,1,5,8]) === 167 && maxCoins([1,5]) === 10 && maxCoins([5]) === 5 && burstSmallestFirst([3,1,5,8]) === 78 && maxCoins([]) === 0; })()',
  "Evaluate Boolean Expression to True":
    '(() => { return booleanWays("T|T&F^T").join(",") === "4,1" && booleanWaysMemo("T|T&F^T").join(",") === "4,1" && booleanTrueWays("1|0&1^1|0") === 7 && booleanTotalWays("1|0&1^1|0") === 14 && booleanWays("T|F&T").join(",") === "2,0" && booleanWays("F&T|T").join(",") === "1,1" && booleanWays("F|F&F").join(",") === "0,2" && booleanWays("T").join(",") === "1,0"; })()',
  "Palindrome Partitioning - II":
    '(() => { return minPalCuts("abccbc") === 2 && minPalPieces("abccbc") === 3 && minPalCuts("aab") === 1 && minPalCuts("abba") === 0 && minPalCuts("ababbbabbababa") === 3 && minPalPieces("ababbbabbababa") === 4 && minPalCutsPrefix("ababbbabbababa") === 3 && minPalCutsMemo("abccbc") === 2; })()',
  "Partition Array for Maximum Sum":
    '(() => { return maxSumAfterPartition([1,15,7,9,2,5], 3) === 72 && maxSumTable([1,15,7,9,2,5], 3) === "0,1,30,45,54,63,72" && maxSumAfterPartition([2,3,1,5,10], 3) === 36 && maxSumPartition([2,3,1,5,10], 3) === "[2,3]->3x2 [1,5,10]->10x3" && maxSumFixedBlocks([2,3,1,5,10], 3) === 29 && maxSumMemo([1,15,7,9,2,5], 3) === 72 && maxSumAfterPartition([1,2], 5) === 4 && maxSumAfterPartition([1,2,3], 1) === 6; })()',
  "Maximum Rectangle Area with all 1's":
    '(() => { const m = [[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]]; return rowHistograms(m) === "1,0,1,0,0 | 2,0,2,1,1 | 3,1,3,2,2 | 4,0,0,3,0" && maximalRectangle(m) === 6 && rowMaxRectangles(m) === "1,3,6,4" && largestRectangleInHistogram([2,1,5,6,2,3]) === 10 && largestRectangleInHistogram([2,1,2]) === 3 && largestSquareArea(m) === 4 && maximalRectangle([[1,1],[1,1]]) === 4 && maximalRectangle([]) === 0; })()',
  "Count Square Submatrices with All Ones":
    '(() => { const m = [[0,1,1,1],[1,1,1,1],[0,1,1,1]]; const r = [[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]]; return squareTableRows(m) === "0,1,1,1 | 1,1,2,2 | 0,1,2,3" && countSquares(m) === 15 && countSquares([[1,0,1],[1,1,0],[1,1,0]]) === 7 && countSquares([[1,1],[1,1]]) === 5 && countSquares([[1,0],[0,1]]) === 2 && countSquares(r) === 15 && largestSquareSide(r) === 2 && countSquares([[1]]) === 1; })()',
};

