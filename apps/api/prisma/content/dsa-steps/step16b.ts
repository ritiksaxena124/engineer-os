import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';

/**
 * Step 16b — the knapsack and two-string half of the dynamic-programming step: the fifteen rows where
 * the state is a capacity or a pair of prefixes, and where the only thing separating a correct answer
 * from a wrong one is the order in which the loops run. A sweep that goes down spends each item once;
 * a sweep that goes up spends it as often as it fits. An item-outer count enumerates combinations; an
 * amount-outer count enumerates orderings. A table over two prefixes reads its answer off the diagonal
 * when the characters match, and the palindrome rows are that table wearing one string.
 */

export const concepts: Record<string, ConceptSpec> = {
  'dsa-dp16b-sweep-direction-decides-item-reuse': {
    slug: 'dsa-dp16b-sweep-direction-decides-item-reuse',
    name: 'A 1-D capacity sweep reads down for 0/1 items and up for unbounded ones',
    detail:
      'Iterating the capacity from high to low means dp[c - w] still holds the previous item-pass, so an item is spent once; iterating low to high lets the same item feed itself again and again.',
    terms: ['reverse capacity sweep', 'forward capacity sweep', 'item spent once', 'unbounded reuse', 'in-place rolling'],
    weight: 5,
  },
  'dsa-dp16b-loop-order-encodes-the-question': {
    slug: 'dsa-dp16b-loop-order-encodes-the-question',
    name: 'Item-outer counts combinations, target-outer counts orderings',
    detail:
      'Once the outer loop is the coin or item list, a state only ever grows in that fixed order and each multiset is written once; swapping the loops makes every position free to choose any item and the count becomes permutations.',
    terms: ['coin outer loop', 'amount outer loop', 'combinations versus permutations', 'fixed build order', 'order-invariant minimum'],
    weight: 5,
  },
  'dsa-dp16b-operator-decides-which-dp-it-is': {
    slug: 'dsa-dp16b-operator-decides-which-dp-it-is',
    name: 'The same include-or-exclude skeleton is a decision, a count or an optimum',
    detail:
      'Branching on take and skip gives a reachable boolean with an or, a subset count with a plus and a best value with a max; swapping the operator silently changes which of the three questions is being answered.',
    terms: ['or folds a decision', 'plus counts branches', 'max optimises', 'same recurrence three questions', 'seed follows the operator'],
    weight: 4,
  },
  'dsa-dp16b-partition-difference-reads-the-reachability-table': {
    slug: 'dsa-dp16b-partition-difference-reads-the-reachability-table',
    name: 'A partition difference is read off the reachability table as total minus twice a sum',
    detail:
      'Two group sums are s and total minus s, so the difference is the absolute value of total minus two s, and by complement symmetry only reachable sums up to half the total need be scanned.',
    terms: ['complement symmetry', 'half the total', 'largest reachable sum', 'parity floor', 'twice the side'],
    weight: 4,
  },
  'dsa-dp16b-pseudo-polynomial-versus-exponential-in-n': {
    slug: 'dsa-dp16b-pseudo-polynomial-versus-exponential-in-n',
    name: 'A sum axis is polynomial in the values, a subset enumeration is exponential in the count',
    detail:
      'A capacity table costs magnitude of the target times items, while a bitmask or meet-in-the-middle walk costs two to the power of the item count and never looks at how large the numbers are; the input shape picks the algorithm.',
    terms: ['pseudo-polynomial', 'exponential in n', 'meet in the middle', 'bitmask enumeration', 'int32 shift ceiling'],
    weight: 5,
  },
  'dsa-dp16b-zeros-double-a-subset-count': {
    slug: 'dsa-dp16b-zeros-double-a-subset-count',
    name: 'A zero in a counting DP doubles every reachable state',
    detail:
      'A zero can be taken or left without changing the sum, so each one multiplies the count by two; a counting table that treats it as an ordinary item or skips it reports the wrong number of subsets.',
    terms: ['free choice doubles', 'zero weight item', 'empty subset counts once', 'duplicate values stay distinct', 'index identifies the item'],
    weight: 4,
  },
  'dsa-dp16b-sign-assignment-reduces-to-subset-count': {
    slug: 'dsa-dp16b-sign-assignment-reduces-to-subset-count',
    name: 'Assigning plus and minus signs is counting subsets at one derived target',
    detail:
      'If the plus group sums to (total + target) / 2 then the signs add up to the target, so the count of assignments is the subset count at that derived target behind a parity gate on total plus target.',
    terms: ['plus group', 'derived target sum', 'parity gate', 'sign assignment', 'complement group'],
    weight: 4,
  },
  'dsa-dp16b-exact-fill-versus-leftover-capacity': {
    slug: 'dsa-dp16b-exact-fill-versus-leftover-capacity',
    name: 'A rod must be fully cut, a knapsack may leave capacity unused',
    detail:
      'Both are unbounded item loops, but a rod state only accepts partitions that consume the whole length, so its recurrence splits the length rather than comparing a value against unused slack.',
    terms: ['exact fill', 'leftover capacity', 'length split', 'price not monotone', 'revenue table'],
    weight: 4,
  },
  'dsa-dp16b-ratio-greedy-needs-a-proof': {
    slug: 'dsa-dp16b-ratio-greedy-needs-a-proof',
    name: 'Best value per unit weight fills optimally only when divisibility is free',
    detail:
      'Unbounded greed by ratio loses on indivisible weights and can fail to reach the capacity at all; the DP is what proves the leftover capacity was really unusable.',
    terms: ['value per unit', 'integrality gap', 'leftover capacity', 'greedy counterexample', 'exchange argument'],
    weight: 3,
  },
  'dsa-dp16b-two-prefix-table-diagonal-encodes-a-match': {
    slug: 'dsa-dp16b-two-prefix-table-diagonal-encodes-a-match',
    name: 'A match takes the diagonal plus one, a mismatch takes the better of top and left',
    detail:
      'The state is a pair of prefix lengths, so a matching pair of final characters extends the shorter-prefix answer one cell back on both axes and a mismatch drops exactly one character from one side.',
    terms: ['two prefix state', 'diagonal plus one', 'top or left', 'never diagonal on a mismatch', 'base row and column of zeros'],
    weight: 5,
  },
  'dsa-dp16b-answer-is-the-max-cell-not-the-corner': {
    slug: 'dsa-dp16b-answer-is-the-max-cell-not-the-corner',
    name: 'A substring table stores a run length, so the answer is the best cell not the corner',
    detail:
      'Continuity is enforced by writing zero whenever the characters differ, which makes every cell the run ending there; the corner is only the common suffix, and the real answer is the largest value anywhere.',
    terms: ['run length per cell', 'reset to zero', 'max over the table', 'corner is the suffix', 'contiguity by reset'],
    weight: 4,
  },
  'dsa-dp16b-reconstruction-forfeits-the-rolling-array': {
    slug: 'dsa-dp16b-reconstruction-forfeits-the-rolling-array',
    name: 'Printing the answer means keeping the table the rolling array threw away',
    detail:
      'A reconstruction walks the table backwards through the branches that were taken, so it needs every cell or an explicit keep pointer; two rolling rows answer the length and nothing else.',
    terms: ['backtrack the table', 'keep pointer', 'rolling rows lose history', 'full table space', 'tie broken by convention'],
    weight: 4,
  },
  'dsa-dp16b-palindrome-is-self-lcs-by-length-only': {
    slug: 'dsa-dp16b-palindrome-is-self-lcs-by-length-only',
    name: 'The longest palindromic subsequence is the self-LCS length, not the self-LCS string',
    detail:
      'Matching a string against its own reversal gives the right length because a palindrome reads the same both ways, but the witness that table names can pair the two copies of a character inconsistently.',
    terms: ['interval dp', 'span increasing order', 'self LCS length', 'witness may not be a palindrome', 'insertions equal length minus lps'],
    weight: 4,
  },
  'dsa-dp16b-replacement-is-two-steps-when-not-priced': {
    slug: 'dsa-dp16b-replacement-is-two-steps-when-not-priced',
    name: 'Without a replace move a mismatch costs a deletion and an insertion',
    detail:
      'Converting one string into the other by insertions and deletions keeps their longest common subsequence untouched and charges everything else, giving n plus m minus two times the LCS length.',
    terms: ['no replace move', 'delete then insert costs two', 'supersequence keeps one shared copy', 'lcs is the kept set', 'edit distance differs'],
    weight: 4,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 16,
    name: 'Partition Set Into 2 Subsets With Min Absolute Sum Diff',
    difficulty: 'Hard',
    topicSlug: 'dp-greedy',
    stem: "Split every number into one of two groups and report the smallest possible absolute difference between the group sums, then say which axis of the input makes that cheap or expensive.",
    brief:
      "Input: a list of positive integers. Output: the minimum of |sum(A) - sum(B)| over the pairs of disjoint groups that together use every element. The constraint that decides the approach is that only the sum of one side matters, since the other side is whatever is left, so the question is which sums are reachable.",
    concepts: [
      'dsa-dp16b-partition-difference-reads-the-reachability-table',
      'dsa-dp16b-pseudo-polynomial-versus-exponential-in-n',
      'dsa-dp16b-sweep-direction-decides-item-reuse',
      'dsa-reachability-set',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      "Reachability table over sums up to half the total, reverse sweep per number, then answer total minus twice the largest reachable sum not above the half; the complement side is automatic.",
    idealAnswer:
      "Every split puts one group at some sum s and the other at total minus s, so the difference is the absolute value of total minus two s and only the reachable values of s matter. That makes the state the subset-sum reachability set restricted to sums at most half the total, and the answer total minus twice the largest reachable cell. Restricting to the lower half is not a micro-optimisation but the symmetry itself: a subset above the half is the complement of one below it, so the smaller side always carries the information. Cost is O(n * total/2) time with a reverse sweep, since a number may be spent at most once, and O(total/2) space. That cost is what the Hard tag is really about, because the table is polynomial in the magnitude of the numbers and not in how many there are: twenty items near a million imply a ten-million-wide array, while forty items near forty are trivial. When n is the small axis the right tool enumerates subsets instead - a bitmask walk at O(2^n) or meet-in-the-middle at O(2^(n/2)), both exponential in the count and blind to the values, with the JavaScript caveat that one-shift thirty-one is already an int32 sign flip. Impose an equal card count and the single row stops being enough: keeping exactly floor(n/2) elements on one side needs a second axis over counts, and it can be strictly worse than the unconstrained answer.",
    walkthrough:
      "Take [1,5,11,5]: total 22, half 11, seed reachable[0] = true. Spending 1 lights {0,1}; the first 5 lights {5,6}; 11 lights {11,12 capped, so only 11 and the 11+1, 11+5 above the ceiling drop out}; the second 5 changes nothing new below 11. The largest reachable cell at or below 11 is 11 itself, giving 22 - 22 = 0, and the split is {11} against {1,5,5}. Now [1,2,3,6]: total 12, half 6, and the table reaches 0,1,2,3,4,5,6, so the answer is 0 via {6} against {1,2,3}. Add the equal-size rule to that same array and it answers 2: with exactly two elements per side the reachable sums are 3 from {1,2}, 4 from {1,3}, 5 from {2,3}, and every pair with the 6 overshoots the half of 6, so the best is 5 and 12 - 10 = 2. Parity is a floor, not a guess: [1,2,3,4,5] totals 15 which is odd, so zero is impossible and the table reaches 7 from {3,4} for a difference of 1; [1,2,5] totals 8 which is even and still answers 2, because the reachable sums at or below 4 stop at 3 and the split is {1,2} against {5}. The bitmask walk over [10,20,30,40,50] tests all 32 subsets and returns 10, which is exactly what the table returns - the cross-check worth writing once.",
    commonMistake:
      "Returning the total modulo 2 as the answer, or reusing the equal-partition decision table and calling every even total a zero-difference split.",
    whyWrong:
      "[1,2,5] totals 8, an even number, yet the sums reachable at or below the half of 4 stop at 3, so the best split is {1,2} against {5} with a difference of 2 and the parity answer of 0 is confidently wrong; evenness is necessary for a zero difference and nowhere near sufficient. The mirror failure is the one the equal-size variant exposes: [1,2,3,6] does have a zero split, but it is one element against three, and a candidate who has just decided equal halves answers 0 for the constrained question too, when the true constrained answer is 2 from {2,3} against {1,6}. Both mistakes come from reading the table as a yes-or-no decision, which is what the earlier partition row asks; here the same table has to be scanned for its largest reachable cell, and the scan is where the answer actually lives.",
    followUps: [
      "Add the equal-card-count rule to the table. Why can the sum axis still sweep downward, and how many axes does the state now have?",
      "Give the meet-in-the-middle algorithm for n = 40 with values near 10^9. Which two lists get sorted, and what does the two-pointer walk prove about skipped candidates?",
      "Why is scanning only up to half the total enough? State it as the complement map and say what a cell above the half would contribute.",
      "Your bitmask loop stops being exact past n = 30. What does the first wrong subset list look like, and which two fixes keep the enumeration honest?",
    ],
    solution:
      'function minSubsetDiff(nums) {\n' +
      '  const total = nums.reduce((acc, num) => acc + num, 0);\n' +
      '  const half = Math.floor(total / 2);\n' +
      '  const reachable = new Array(half + 1).fill(false);\n' +
      '  reachable[0] = true;\n' +
      '  for (let idx = 0; idx < nums.length; idx += 1) {\n' +
      '    const num = nums[idx];\n' +
      '    for (let j = half; j >= num; j -= 1) {\n' +
      '      if (reachable[j - num]) reachable[j] = true;\n' +
      '    }\n' +
      '  }\n' +
      '  for (let j = half; j >= 0; j -= 1) {\n' +
      '    if (reachable[j]) return total - 2 * j;\n' +
      '  }\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function minEqualSizeSubsetDiff(nums) {\n' +
      '  const total = nums.reduce((acc, num) => acc + num, 0);\n' +
      '  const half = Math.floor(total / 2);\n' +
      '  const wanted = Math.floor(nums.length / 2);\n' +
      '  const dp = [];\n' +
      '  for (let c = 0; c <= wanted; c += 1) dp.push(new Array(half + 1).fill(false));\n' +
      '  dp[0][0] = true;\n' +
      '  for (let idx = 0; idx < nums.length; idx += 1) {\n' +
      '    const num = nums[idx];\n' +
      '    for (let c = wanted; c >= 1; c -= 1) {\n' +
      '      for (let j = half; j >= num; j -= 1) {\n' +
      '        if (dp[c - 1][j - num]) dp[c][j] = true;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  for (let j = half; j >= 0; j -= 1) {\n' +
      '    if (dp[wanted][j]) return total - 2 * j;\n' +
      '  }\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function minSubsetDiffBitmask(nums) {\n' +
      '  const total = nums.reduce((acc, num) => acc + num, 0);\n' +
      '  const n = nums.length;\n' +
      '  let best = total;\n' +
      '  for (let mask = 0; mask < (1 << n); mask += 1) {\n' +
      '    let side = 0;\n' +
      '    for (let i = 0; i < n; i += 1) {\n' +
      '      if (mask & (1 << i)) side += nums[i];\n' +
      '    }\n' +
      '    const diff = Math.abs(total - 2 * side);\n' +
      '    if (diff < best) best = diff;\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify:
      "Report the difference under an equal-size rule AND list one of the two groups. Which extra axis enters the table, and what predecessor bookkeeping does the reverse sweep have to give up to name the elements?",
  },
  {
    step: 16,
    name: 'Count Subsets with Sum K',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Count how many subsets of a list add up to exactly k, and be able to say what a zero and a repeated value each do to that count.",
    brief:
      "Input: a list of non-negative integers and a target k. Output: the number of subsets whose elements sum to k, counting subsets by which indices they hold rather than by which values. The constraint is that this is the subset-sum decision with the or replaced by a plus, so the same reverse sweep is still required.",
    concepts: [
      'dsa-dp16b-operator-decides-which-dp-it-is',
      'dsa-dp16b-sweep-direction-decides-item-reuse',
      'dsa-dp16b-zeros-double-a-subset-count',
      'dsa-count-by-adding-branches',
      'dsa-memo-decision-table',
    ],
    shortAnswer:
      "dp[j] becomes a count: dp[0] = 1 for the empty subset, and each item adds dp[j - num] to dp[j] while j sweeps downward, so take-and-skip are two disjoint families being added.",
    idealAnswer:
      "The decision row asked whether some subset reaches j; this row asks how many, and the only change is the operator: a target j is reached either by skipping the current item, which leaves dp[j] as it was, or by taking it, which brings in every subset of the earlier items that reached j - num. Those two families are disjoint because they differ on the current index, so adding is the correct merge and the seed dp[0] = 1 is the empty subset, without which every take-branch would add zero. Keeping the sweep downward is not optional: a forward sweep would read a dp[j - num] that this same item already wrote, i.e. it would count subsets that use the item twice, which is the unbounded coin question and not this one. Cost is O(n * k) time and O(k) space, pseudo-polynomial in the target like every row in this family. The two contract details that decide most wrong answers are about identity, not arithmetic: items at different indices with the same value are different subsets, so [1,1,1,1] at k = 2 counts six and not one, and a zero doubles every count it touches because taking it or leaving it is a free choice that preserves the sum. A count also has no ceiling, so a long list of small numbers grows past 2^53 and the honest version needs BigInt or a modulo.",
    walkthrough:
      "nums = [1,2,2,3], k = 5. dp starts 1,0,0,0,0,0. Spend the 1 (downward from 5): 1,1,0,0,0,0. Spend the first 2: 1,1,1,1,0,0. Spend the second 2: dp[4] gains dp[2] which is now 1, dp[5] gains dp[3] = 1, dp[3] gains dp[1] = 1 giving 2, so the row reads 1,1,2,2,1,1. Spend the 3: dp[5] += dp[2] = 2 and dp[4] += dp[1] = 1 giving 1,1,2,3,2,3. The answer is dp[5] = 3, and the three subsets are the first 2 with the 3, the second 2 with the 3, and 1 with both 2s - two of them hold the same values and are still distinct because they hold different indices. Now the zero case: [2,0,0,3] at k = 2 answers 4, which is the subset {2} times the four ways to choose from two zeros, and each zero pass simply doubles the whole row. The empty target: countSubsetsWithSum([1,2,2,3], 0) is 1, the empty subset alone, while countSubsetsWithSum([0], 0) is 2 because {} and {0} both sum to zero. Run the same [1,2,2,3] sweep forward instead and dp[5] reads 9, since the two 1s and the two 2s start being reused; that single loop direction is the difference between three subsets and nine.",
    commonMistake:
      "Sweeping j upward in the 1-D table, or de-duplicating equal values so that [1,1,1,1] at k = 2 reports one subset instead of six.",
    whyWrong:
      "The forward sweep is the unbounded loop: on [1,2,2,3] with k = 5 it reports 9 because a state already written by the current item gets spent again, which counts multisets with repeated use rather than subsets of these four indices; countSubsetsWithSum([1,2,2,3], 5) is 3 and the 2d variant agrees, so the direction of one loop is the entire bug. De-duplicating is the second failure and it is a misreading of what a subset is: the four indices of [1,1,1,1] give C(4,2) = 6 pairs, and collapsing them into the value 1 answers a different question about multisets of values. The mirror of that error is treating a zero as uninteresting and skipping it, which halves the count per zero: [2,0,0,3] at k = 2 is 4, not 1.",
    followUps: [
      "Switch the seed dp[0] = 1 to dp[0] = 0. Which answers survive and which collapse, and what does that say about the empty subset?",
      "The counts grow past 2^53 on forty ones. Where does BigInt enter, and does the reverse sweep still hold with it?",
      "Give the 2-D table version and read one actual subset off it. What extra predecessor information does the rolling 1-D row lose?",
      "Now every element may be used at most twice. Which single axis does the state gain, and what does the sweep order have to become?",
    ],
    solution:
      'function countSubsetsWithSum(nums, k) {\n' +
      '  if (k < 0) return 0;\n' +
      '  const dp = new Array(k + 1).fill(0);\n' +
      '  dp[0] = 1;\n' +
      '  for (let idx = 0; idx < nums.length; idx += 1) {\n' +
      '    const num = nums[idx];\n' +
      '    for (let j = k; j >= num; j -= 1) {\n' +
      '      dp[j] += dp[j - num];\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[k];\n' +
      '}\n' +
      '\n' +
      'function countSubsetsWithSum2d(nums, k) {\n' +
      '  if (k < 0) return 0;\n' +
      '  const n = nums.length;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= n; i += 1) {\n' +
      '    dp.push(new Array(k + 1).fill(0));\n' +
      '    dp[i][0] = 1;\n' +
      '  }\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    const num = nums[i - 1];\n' +
      '    for (let j = 0; j <= k; j += 1) {\n' +
      '      dp[i][j] = dp[i - 1][j];\n' +
      '      if (j >= num) dp[i][j] += dp[i - 1][j - num];\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[n][k];\n' +
      '}\n' +
      '\n' +
      'function countSubsetsForwardSweepReusesItems(nums, k) {\n' +
      '  if (k < 0) return 0;\n' +
      '  const dp = new Array(k + 1).fill(0);\n' +
      '  dp[0] = 1;\n' +
      '  for (let idx = 0; idx < nums.length; idx += 1) {\n' +
      '    const num = nums[idx];\n' +
      '    for (let j = num; j <= k; j += 1) {\n' +
      '      dp[j] += dp[j - num];\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[k];\n' +
      '}',
    modify:
      "Report the number of subsets that hit k while using at most limit elements. Which axis is added to the state, and does the target still sweep downward?",
  },
  {
    step: 16,
    name: 'Count Partitions with Given Difference',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Count the ways to split a list into two groups whose sums differ by exactly d, and derive the single target you have to count subsets at.",
    brief:
      "Input: a list of positive integers and a difference d. Output: the number of ways to choose one side so that side minus the other equals d. The constraint is that the two side sums add to the total, so one of them is fixed at (total + d) / 2 and the count is a subset count at that target.",
    concepts: [
      'dsa-dp16b-sign-assignment-reduces-to-subset-count',
      'dsa-dp16b-partition-difference-reads-the-reachability-table',
      'dsa-dp16b-operator-decides-which-dp-it-is',
      'dsa-count-by-adding-branches',
    ],
    shortAnswer:
      "Write s1 + s2 = total and s1 - s2 = d, so s1 = (total + d) / 2; return 0 when total + d is odd or d exceeds the total, otherwise count subsets at that s1.",
    idealAnswer:
      "The two sums are not independent: they add to the total by construction, so a difference of d pins the larger side to (total + d) / 2 and the smaller to (total - d) / 2. That algebra is the whole reduction, and it converts a two-group counting question into the single-target subset count of the previous row. Two gates have to be checked before any table is built, and the first is the one people get wrong: parity is on total plus d, not on total, because two integers with sum total and difference d exist exactly when total and d have the same parity. [1,1,2,3] has an odd total of 7 and still offers three partitions at d = 1, so a candidate who reuses the equal-partition even-total gate rejects a valid input outright. The second gate is d greater than the total, which pushes the derived target past every reachable sum and answers 0 - the case where the smaller side would have to be negative. Counting subsets at the larger target counts each partition exactly once, because the chosen side is the one that carries the plus sign; the complement symmetry means counting at (total - d) / 2 gives the identical number, since the complement map is a bijection between the two families, which is worth stating because it is the argument that nothing is double counted. Cost is O(n * total/2) time and O(total) space, pseudo-polynomial and inherited from the row above.",
    walkthrough:
      "nums = [1,1,2,3], d = 1. total = 7, so total + d = 8 is even and the larger side must be 4; total - d = 6 gives the smaller side 3. Run the subset count at k = 4 with the reverse sweep: after the first 1 the row is 1,1,0,0,0; after the second 1 it is 1,2,1,0,0; after the 2 it is 1,2,2,2,1; after the 3 it is 1,2,2,3,3. So dp[4] = 3 and dp[3] = 3 - the same number read off either side of the complement map, which is the bijection showing itself. The three partitions are the side {1,3} against {1,2} twice, once for each 1, plus {1,1,2} against {3}. Now the parity gate on a different input: [1,2,2,3] totals 8, and d = 1 asks for sides summing to 4.5, so countPartitionsWithDiff returns 0 even though subsets at 4 and 3 both exist; the odd total of the earlier example and the even total here differ in which gate fires, which is exactly why the test belongs on total plus d. Finally [1,2,3] at d = 6 gives the target (6 + 6) / 2 = 6, reached by the whole array against the empty group, so the count is 1, and d = 7 fails the parity gate and answers 0. The raw mask walk over [1,1,2,3] at d = 1 finds six subsets whose side differs from the complement by one - three at sum 4 and three at sum 3 - and halves that to three, because each partition is named once from each of its two sides; that halving is the clearest argument for normalising the count onto one derived target instead of scanning both.",
    commonMistake:
      "Requiring the total to be even before counting, or counting at both (total + d) / 2 and (total - d) / 2 and adding the two results.",
    whyWrong:
      "The parity test is on total plus d, so gating on total rejects [1,1,2,3] with d = 1, which has three valid partitions at side sums 4 and 3, and the same wrong gate silently accepts [1,2,2,3] with d = 1, which has none because the required sides are 4.5. Doubling the count is the opposite error and it is a category mistake about what a partition is: one group uniquely determines the other, so the count at 4 already enumerates all three splits and counting the 3 side as well reports 6 for the same three partitions. The mirror is dividing by two to remove a symmetry that was never counted, which turns the correct answer of 3 into 1.",
    followUps: [
      "Prove that counting subsets at (total + d) / 2 and at (total - d) / 2 give the same number. Which map is the bijection?",
      "Allow negative entries. Which of the two gates stops making sense, and what has to happen to the index range of the table?",
      "Turn the count into a list of the actual partitions. What does the reverse sweep have to give up, and what does the reconstruction walk read?",
      "Now d may be matched by either side being larger. Does the answer double, and for which single input would doubling be wrong?",
    ],
    solution:
      'function partitionTargetFor(total, d) {\n' +
      '  const wanted = Math.abs(d);\n' +
      '  if ((total + wanted) % 2 !== 0) return -1;\n' +
      '  const side = (total + wanted) / 2;\n' +
      '  if (side > total) return -1;\n' +
      '  return side;\n' +
      '}\n' +
      '\n' +
      'function countPartitionsWithDiff(nums, d) {\n' +
      '  const total = nums.reduce((acc, num) => acc + num, 0);\n' +
      '  const side = partitionTargetFor(total, d);\n' +
      '  if (side < 0) return 0;\n' +
      '  const dp = new Array(side + 1).fill(0);\n' +
      '  dp[0] = 1;\n' +
      '  for (let idx = 0; idx < nums.length; idx += 1) {\n' +
      '    const num = nums[idx];\n' +
      '    for (let j = side; j >= num; j -= 1) {\n' +
      '      dp[j] += dp[j - num];\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[side];\n' +
      '}\n' +
      '\n' +
      'function countPartitionsBrute(nums, d) {\n' +
      '  const total = nums.reduce((acc, num) => acc + num, 0);\n' +
      '  const n = nums.length;\n' +
      '  let masks = 0;\n' +
      '  for (let mask = 0; mask < (1 << n); mask += 1) {\n' +
      '    let side = 0;\n' +
      '    for (let i = 0; i < n; i += 1) {\n' +
      '      if (mask & (1 << i)) side += nums[i];\n' +
      '    }\n' +
      '    if (Math.abs(total - 2 * side) === Math.abs(d)) masks += 1;\n' +
      '  }\n' +
      '  return masks / 2;\n' +
      '}',
    modify:
      "Count partitions whose difference is at most d instead of exactly d. Which scan over the finished table replaces the single dp[side] read?",
  },
  {
    step: 16,
    name: '0/1 Knapsack',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Fill a bag of capacity W with items that each either go in or stay out, maximising total value, and name the sweep order that keeps an item from being taken twice.",
    brief:
      "Input: parallel arrays of values and weights plus an integer capacity. Output: the greatest value reachable with total weight at most capacity. The constraint is the at-most budget together with each item being available once, which is what forces the capacity axis to be swept downward.",
    concepts: [
      'dsa-dp16b-sweep-direction-decides-item-reuse',
      'dsa-dp16b-operator-decides-which-dp-it-is',
      'dsa-dp16b-exact-fill-versus-leftover-capacity',
      'dsa-include-exclude-branch',
      'dsa-memo-decision-table',
    ],
    shortAnswer:
      "dp[c] is the best value inside budget c; for each item sweep c from the capacity down and set dp[c] to the better of dp[c] and dp[c - weight] + value. O(n * W) time, O(W) space, and the downward sweep is what makes the item 0/1.",
    idealAnswer:
      "The state is the best value achievable from the items considered so far inside a budget of at most c, and the recurrence is the include-or-exclude branch that every row in this family shares: excluding the item leaves dp[c] exactly as the previous pass wrote it, and including it pays value plus the best the earlier items did inside c - weight. Those are the only two options, because a set either contains the item or does not. Taking the max rather than the or of the decision row is the whole difference between deciding feasibility and optimising value, and the seed changes with it: a max table starts at zero everywhere because an empty selection is always legal, whereas an exact-fill table would start at minus or plus infinity. Cost is O(n * W) time and, after rolling the item axis away, O(W) space. The rolling step is where the trap lives: with one array, dp[c - weight] has to be the value from the previous item pass, and that is true exactly when c is visited from high to low, because the smaller budgets have not yet been overwritten by this item. Sweeping upward lets the item feed on its own writes and the answer becomes the unbounded problem two rows later. Two more contracts matter. Capacity is an upper bound, not an equality, so a bag that finishes with slack is legal and the best answer may use far less than W; and value alone cannot be reconstructed from the rolled array - naming the chosen items needs the two-dimensional table, or an explicit keep flag per item, which is the same forfeit the printed-string rows make.",
    walkthrough:
      "Items values [60,100,120], weights [10,20,30], capacity 50. Read dp at budgets 0,10,20,30,40,50. Pass 1 (weight 10, value 60) leaves 0,60,60,60,60,60 - the item fits anywhere from 10 up and it is the only thing on the table. Pass 2 (weight 20, value 100) reads dp[c - 20] from pass 1, so dp[20] = max(60, 0 + 100) = 100, dp[30] = max(60, 60 + 100) = 160, and dp[40] and dp[50] stay 160, giving 0,60,100,160,160,160. Pass 3 (weight 30, value 120) gives dp[30] = max(160, 0 + 120) = 160, dp[40] = max(160, 60 + 120) = 180 and dp[50] = max(160, 100 + 120) = 220, so knapsack01 answers 220. Walking the two-dimensional table back from (3,50) shows the value change at row 3 and again at row 2 with nothing at row 1, so knapsack01Picked returns the indices 1 and 2 - weights 20 plus 30 spend the budget exactly. Now run the same three items with the capacity swept upward: dp[50] reports 300, because pass 1 alone writes 60 at budget 10, then 120 at 20, 180 at 30, 240 at 40, 300 at 50, which is five copies of an item that exists once. The one-item version makes the same point in one line: knapsack01([10],[5],10) is 10 and the upward sweep returns 20.",
    commonMistake:
      "Sweeping the capacity upward, or seeding the table with minus infinity so that only exactly full bags count as legal.",
    whyWrong:
      "The upward sweep is the unbounded loop wearing a 0/1 label: on values [60,100,120] and weights [10,20,30] at capacity 50 it returns 300, which is five copies of the weight-10 item, against the true 220, and on a single item of weight 5 and value 10 it returns 20 for a capacity of 10 that holds that item once. The minus-infinity seed is a different bug and it costs points rather than correctness of the loop: a budget is an upper bound, so with values [10,40,30,50] and weights [5,4,6,3] at capacity 10 the best at-most selection is items 1 and 3 for 90 inside weight 7, while an exact-fill table refuses the slack and answers 70 from the only exact fits, weights 4 plus 6. The third variant is claiming the item list from the rolled array - two rows of the same table can share a value, so the backward walk needs the per-item rows or a keep flag to know which item produced which write.",
    followUps: [
      "Roll the item axis away and sweep downward. Prove that dp[c - weight] is still last pass value at the moment you read it, and say which c is visited first.",
      "Give the version that returns the chosen indices. Why does the two-dimensional table make it easy and the rolled array make it impossible without extra state?",
      "Values may be equal but weights differ, so ties appear. Which branch wins in your reconstruction, and does the reported value change?",
      "Capacity reaches 10^9 with 30 items. Your table is unusable - which two algorithms replace it, and what does each one become exponential in?",
    ],
    solution:
      'function knapsack01(values, weights, capacity) {\n' +
      '  const dp = new Array(capacity + 1).fill(0);\n' +
      '  for (let idx = 0; idx < values.length; idx += 1) {\n' +
      '    const weight = weights[idx];\n' +
      '    for (let c = capacity; c >= weight; c -= 1) {\n' +
      '      const candidate = dp[c - weight] + values[idx];\n' +
      '      if (candidate > dp[c]) dp[c] = candidate;\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[capacity];\n' +
      '}\n' +
      '\n' +
      'function knapsack01Table(values, weights, capacity) {\n' +
      '  const n = values.length;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= n; i += 1) dp.push(new Array(capacity + 1).fill(0));\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    for (let c = 0; c <= capacity; c += 1) {\n' +
      '      dp[i][c] = dp[i - 1][c];\n' +
      '      if (c >= weights[i - 1]) {\n' +
      '        const candidate = dp[i - 1][c - weights[i - 1]] + values[i - 1];\n' +
      '        if (candidate > dp[i][c]) dp[i][c] = candidate;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[n][capacity];\n' +
      '}\n' +
      '\n' +
      'function knapsack01Picked(values, weights, capacity) {\n' +
      '  const n = values.length;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= n; i += 1) dp.push(new Array(capacity + 1).fill(0));\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    for (let c = 0; c <= capacity; c += 1) {\n' +
      '      dp[i][c] = dp[i - 1][c];\n' +
      '      if (c >= weights[i - 1]) {\n' +
      '        const candidate = dp[i - 1][c - weights[i - 1]] + values[i - 1];\n' +
      '        if (candidate > dp[i][c]) dp[i][c] = candidate;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  const picked = [];\n' +
      '  let row = n;\n' +
      '  let budget = capacity;\n' +
      '  while (row > 0 && budget > 0) {\n' +
      '    if (dp[row][budget] !== dp[row - 1][budget]) {\n' +
      '      picked.push(row - 1);\n' +
      '      budget -= weights[row - 1];\n' +
      '    }\n' +
      '    row -= 1;\n' +
      '  }\n' +
      '  return picked.reverse();\n' +
      '}\n' +
      '\n' +
      'function knapsack01ForwardReusesItems(values, weights, capacity) {\n' +
      '  const dp = new Array(capacity + 1).fill(0);\n' +
      '  for (let idx = 0; idx < values.length; idx += 1) {\n' +
      '    const weight = weights[idx];\n' +
      '    for (let c = weight; c <= capacity; c += 1) {\n' +
      '      const candidate = dp[c - weight] + values[idx];\n' +
      '      if (candidate > dp[c]) dp[c] = candidate;\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[capacity];\n' +
      '}',
    modify:
      "Each item may now be taken at most twice rather than once. Which axis is added to the state, and can the capacity still be swept in a single pass?",
  },
  {
    step: 16,
    name: 'Coin Change',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Give the fewest coins that add up to an amount from an unlimited supply, return -1 when no combination reaches it, and say why largest-first is not a shortcut.",
    brief:
      "Input: an array of coin denominations and a non-negative amount. Output: the minimum number of coins summing to that amount, or -1. The constraint is unlimited supply of each coin together with a minimisation, which makes the amount axis an unbounded sweep and makes the answer order-invariant.",
    concepts: [
      'dsa-dp16b-loop-order-encodes-the-question',
      'dsa-dp16b-sweep-direction-decides-item-reuse',
      'dsa-dp16b-ratio-greedy-needs-a-proof',
      'dsa-dp16b-operator-decides-which-dp-it-is',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      "dp[a] is the fewest coins for a, seeded dp[0] = 0 and everything else infinity; relax dp[a] against dp[a - coin] + 1 for every coin, and report -1 when the target is still infinity.",
    idealAnswer:
      "The state is one integer - the amount still to be covered - and the recurrence says the last coin placed is any denomination c at most a, so dp[a] is one plus the best dp[a - c] over all of them. That is a minimisation over branches rather than a count or a decision, and it is what fixes the seed: dp[0] = 0 because paying nothing covers nothing, and every other cell starts at infinity so that an unreachable amount stays visibly unreachable instead of looking cheap. Cost is O(amount * |coins|) time and O(amount) space, pseudo-polynomial in the amount like every other row here. Because the operator is a min, the two loop orders agree: coins outer with the amount sweeping up, or amount outer with the coins inner, both produce the same table, which is worth stating out loud because the counting sibling two rows down is exactly the case where they disagree - minimality cannot see the order the coins were laid down, counting can. The forward sweep is not a mistake here but the requirement: a denomination may be spent repeatedly, so dp[a - c] is allowed to be a value this coin already wrote. The contract has three edges that candidates lose points on. An amount of 0 needs 0 coins, not 1. An unreachable amount must be reported as -1, and the check has to be on the sentinel rather than on a plausible-looking integer. And a greedy largest-first walk is only correct for canonical denomination systems, so it is a proof obligation, not a heuristic: on [1,3,4] with amount 6 it spends 4 plus 1 plus 1 for three coins where two threes suffice.",
    walkthrough:
      "coins [1,2,5], amount 11. The table reads dp[0] = 0, then 1,1,2,2,1 at amounts 1 through 5 - amount 5 is a single coin, which is the cell that makes the rest cheap - then 2,2,3,3,2,3 for amounts 6 through 11. So coinChange([1,2,5], 11) = 3, and the three coins are 5 + 5 + 1. Now coins [1,3,4], amount 6: dp runs 0,1,2,1,1,2,2, so the answer is 2 from 3 + 3, while the greedy walk takes 4 first and is left with 2, which costs two ones, for 3 coins in total - coinChangeGreedy([1,3,4], 6) returns exactly that 3. Reachability is the other half of the contract: coinChange([3,5], 4) is -1 because amounts 1,2 and 4 stay at infinity, coinChange([], 5) is -1 with no coin to try at all, and coinChange([1,2,5], 0) is 0, the empty payment. The adversarial set [186,419,83,408] at amount 6249 is the one to memorise for the greedy argument: the table answers 20 while largest-first cannot close the amount and reports -1, so the greedy attempt does not merely cost a coin, it fails to produce an answer. Both loop orders agree everywhere the table is finite: coinChangeCoinOuter([1,3,4], 6) is also 2 and coinChangeCoinOuter([1,2,5], 11) is also 3.",
    commonMistake:
      "Sorting the coins and taking as many as fit from the top, or seeding dp[a] = a as a safe upper bound on the assumption that a one-coin exists.",
    whyWrong:
      "Largest-first is wrong on [1,3,4] at amount 6 - it spends 4 + 1 + 1 for three coins against the true two - and it is worse than wrong on [186,419,83,408] at 6249, where it returns -1 for a problem whose answer is 20, because the greedy remainder cannot be repaired. The penny-assumption seed is the subtler failure: it quietly encodes a denomination that may not be in the input, so coinChangePenniesAssumption([3,5], 4) answers 2, reading as if a 1-coin existed, while the honest infinity seed returns -1. That second bug is dangerous precisely because the output looks like a coin count; an unreachable amount becomes a small number instead of the sentinel the caller is written to check.",
    followUps: [
      "Write both loop orders and prove they give the same table for a min. Which property of min makes the order invisible, and which row in this batch loses that property?",
      "Seed dp[a] = a instead of infinity. Which inputs are still answered correctly and which are silently corrupted?",
      "Report the coins actually used rather than their count. What does the rolling array have to keep to make that possible?",
      "Give a denomination set where the greedy answer is short by one and the amount is under fifteen. What does the table see that the greedy walk does not?",
    ],
    solution:
      'function coinChange(coins, amount) {\n' +
      '  const dp = new Array(amount + 1).fill(Infinity);\n' +
      '  dp[0] = 0;\n' +
      '  for (let a = 1; a <= amount; a += 1) {\n' +
      '    for (let idx = 0; idx < coins.length; idx += 1) {\n' +
      '      const coin = coins[idx];\n' +
      '      if (coin <= a && dp[a - coin] + 1 < dp[a]) dp[a] = dp[a - coin] + 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return Number.isFinite(dp[amount]) ? dp[amount] : -1;\n' +
      '}\n' +
      '\n' +
      'function coinChangeCoinOuter(coins, amount) {\n' +
      '  const dp = new Array(amount + 1).fill(Infinity);\n' +
      '  dp[0] = 0;\n' +
      '  for (let idx = 0; idx < coins.length; idx += 1) {\n' +
      '    const coin = coins[idx];\n' +
      '    for (let a = coin; a <= amount; a += 1) {\n' +
      '      if (dp[a - coin] + 1 < dp[a]) dp[a] = dp[a - coin] + 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return Number.isFinite(dp[amount]) ? dp[amount] : -1;\n' +
      '}\n' +
      '\n' +
      'function coinChangeGreedy(coins, amount) {\n' +
      '  const sorted = coins.slice().sort((a, b) => b - a);\n' +
      '  let left = amount;\n' +
      '  let used = 0;\n' +
      '  for (let idx = 0; idx < sorted.length; idx += 1) {\n' +
      '    const coin = sorted[idx];\n' +
      '    if (coin <= 0) continue;\n' +
      '    while (left >= coin) {\n' +
      '      left -= coin;\n' +
      '      used += 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return left === 0 ? used : -1;\n' +
      '}\n' +
      '\n' +
      'function coinChangePenniesAssumption(coins, amount) {\n' +
      '  const dp = new Array(amount + 1).fill(0);\n' +
      '  dp[0] = 0;\n' +
      '  for (let a = 1; a <= amount; a += 1) dp[a] = a;\n' +
      '  for (let a = 1; a <= amount; a += 1) {\n' +
      '    for (let idx = 0; idx < coins.length; idx += 1) {\n' +
      '      const coin = coins[idx];\n' +
      '      if (coin <= a && dp[a - coin] + 1 < dp[a]) dp[a] = dp[a - coin] + 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[amount];\n' +
      '}',
    modify:
      "Add a limit so no single denomination may be used more than three times. Which axis enters the state, and does the amount sweep still go upward?",
  },
  {
    step: 16,
    name: 'Target Sum',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Count the ways to put a plus or minus sign in front of every number so the expression equals a target, and reduce it to one subset count.",
    brief:
      "Input: an array of non-negative integers and a target that may be negative. Output: the number of sign assignments whose signed sum equals the target. The constraint is that the numbers are only ever added or subtracted, so the plus group alone determines the whole assignment.",
    concepts: [
      'dsa-dp16b-sign-assignment-reduces-to-subset-count',
      'dsa-dp16b-zeros-double-a-subset-count',
      'dsa-dp16b-operator-decides-which-dp-it-is',
      'dsa-count-by-adding-branches',
      'dsa-memo-decision-table',
    ],
    shortAnswer:
      "If the plus group sums to t then the total is 2t - total, so t = (total + target) / 2; return 0 when total + target is odd or t is negative, otherwise count subsets at t.",
    idealAnswer:
      "Split the indices into a plus group P and a minus group M. Their signed sum is sum(P) - sum(M), and sum(P) + sum(M) is the total, so subtracting gives signed = 2 * sum(P) - total and the target pins sum(P) at (total + target) / 2. The count of assignments is therefore exactly the count of subsets at that derived target - the same reverse-sweep counting table as the subset row, with the seed dp[0] = 1. Two properties of that formula are worth saying before writing code. It handles a negative target without any special case, because (total + target) / 2 simply moves below half the total and names the smaller plus group; a candidate who reaches for the absolute value of the target is describing a different question. And the gate is parity on total plus target, not on the total alone, because two integers with that sum and difference exist exactly when the two parities agree: five ones can never produce an even target at all, since every sign pattern over five odd numbers sums to an odd value. The zeros are the counting trap. A zero contributes nothing to either group, so each zero doubles the number of assignments while leaving the sum untouched, and the doubling falls out of the same dp pass that any zero runs - the target axis is swept from the top so dp[j] += dp[j] for every j, which is why four zeros in front of a single one give eight ways rather than one. Cost is O(n * t) time and O(t) space, and the honest alternative for small n is the direct two-branch recursion over signs, memoised on (index, running sum), which is the version that generalises when negative entries are allowed.",
    walkthrough:
      "nums [1,1,1,1,1], target 3. total = 5, so the plus group must be (5 + 3) / 2 = 4. The counting table at k = 4 is built one 1 at a time and reads 1,1,0,0,0 then 1,2,1,0,0 then 1,3,3,1,0 then 1,4,6,4,1 then 1,5,10,10,5, so dp[4] = 5 - the five ways to choose which single index carries the minus sign, matching the targetSumBrute walk over all 32 sign patterns. Ask for target 2 instead: total + target = 7 is odd, targetSubsetSumIndex returns -1 and the answer is 0, which the brute force confirms because five odd numbers can only ever combine to an odd value. Ask for target -3: the plus group is (5 - 3) / 2 = 1, and dp[1] = 5, so the count is again five - the same five assignments with every sign flipped. Now the zeros: nums [0,0,0,1], target 1. total = 1 and the plus group must be 1, and the three zero passes double the whole row each time so dp[1] ends at 8, which is the one forced choice for the 1 times the eight sign assignments of three zeros. [1,1,1,1] at target 0 asks for the plus group 2 and answers C(4,2) = 6. Finally [1,2,3] at target 7 exceeds the total, so the derived index is 5 above nothing reachable and the answer is 0.",
    commonMistake:
      "Gating on the total being even, or handling a negative target by flipping signs by hand and losing the zeros in the count.",
    whyWrong:
      "The parity gate belongs to total plus target: nums [1,1,1,1,1] with target 2 fails it and correctly returns 0, while the same array with target 3 has an odd total of 5 and still offers five assignments, so an even-total gate throws away the valid case and keeps nothing. Treating the negative target as its own problem is the second failure: [1,1,1,1,1] at target -3 is answered by the identical table at plus-group sum 1, giving the same 5, and a hand-rolled sign flip that recomputes from the absolute target double-counts whenever a zero is present. That is where the zeros bite: [0,0,0,1] at target 1 has 8 assignments and targetSumBrute over the 16 sign patterns reports exactly 8, so a version that counts the subset {1} once and calls it done is off by a factor of eight - one per zero, for a choice that is invisible in the sum but real in the count.",
    followUps: [
      "Derive why the plus group is (total + target) / 2 from the two equations, then say what the same table answers if you count subsets at (total - target) / 2 instead.",
      "Three zeros in front of one number. What is the multiplier, and which line of your loop produces it?",
      "Give the memoised (index, running sum) version. Why is it the one that survives when the array may hold negative numbers, and what is its state count?",
      "Now the target must be reached by every assignment, not counted - i.e. decide reachability. Which operator in the table changes, and what does the seed become?",
    ],
    solution:
      'function targetSubsetSumIndex(total, target) {\n' +
      '  if ((total + target) % 2 !== 0) return -1;\n' +
      '  const side = (total + target) / 2;\n' +
      '  if (side < 0) return -1;\n' +
      '  return side;\n' +
      '}\n' +
      '\n' +
      'function targetSumWays(nums, target) {\n' +
      '  const total = nums.reduce((acc, num) => acc + num, 0);\n' +
      '  const side = targetSubsetSumIndex(total, target);\n' +
      '  if (side < 0) return 0;\n' +
      '  const dp = new Array(side + 1).fill(0);\n' +
      '  dp[0] = 1;\n' +
      '  for (let idx = 0; idx < nums.length; idx += 1) {\n' +
      '    const num = nums[idx];\n' +
      '    for (let j = side; j >= num; j -= 1) dp[j] += dp[j - num];\n' +
      '  }\n' +
      '  return dp[side];\n' +
      '}\n' +
      '\n' +
      'function targetSumBrute(nums, target) {\n' +
      '  const n = nums.length;\n' +
      '  let ways = 0;\n' +
      '  for (let mask = 0; mask < (1 << n); mask += 1) {\n' +
      '    let sum = 0;\n' +
      '    for (let i = 0; i < n; i += 1) {\n' +
      '      if (mask & (1 << i)) sum += nums[i];\n' +
      '      else sum -= nums[i];\n' +
      '    }\n' +
      '    if (sum === target) ways += 1;\n' +
      '  }\n' +
      '  return ways;\n' +
      '}',
    modify:
      "Every number must carry a sign and you must report the number of assignments that reach the target using at most limit pluses. Which axis joins the table?",
  },
  {
    step: 16,
    name: 'Coin Change 2',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Count the unordered ways to make an amount from an unlimited supply of each denomination, and say which loop order is doing the counting.",
    brief:
      "Input: an array of denominations and a non-negative amount. Output: the number of combinations of coins summing to it, where 1 + 2 + 2 and 2 + 1 + 2 are one way. The constraint is that the supply is unlimited yet the order of laying coins down must be invisible, which is a property of the loop nesting and not of the recurrence.",
    concepts: [
      'dsa-dp16b-loop-order-encodes-the-question',
      'dsa-dp16b-sweep-direction-decides-item-reuse',
      'dsa-dp16b-operator-decides-which-dp-it-is',
      'dsa-count-by-adding-branches',
      'dsa-dp16b-zeros-double-a-subset-count',
    ],
    shortAnswer:
      "dp[a] counts combinations, dp[0] = 1 for the empty set; put the coin list in the OUTER loop and sweep the amount upward, so every combination is written in non-decreasing coin order and appears exactly once.",
    idealAnswer:
      "The recurrence is the same relaxation as the minimum row - a way to reach a is a way to reach a - coin plus this coin - but the operator is a plus, so the question stops being about the best route and becomes about enumerating all of them, and enumeration is where order starts to matter. With the coin list outside, when the table works on denomination c it may only ever build amounts out of the denominations up to c, so a combination is written exactly once: in the order the outer loop discovered its coin types. That is not a convention but a canonical form - non-decreasing by denomination index - and it is the entire reason 1 + 2 + 2 is counted once rather than three times. Swap the loops and the canonical form disappears: with the amount outside, the last coin is chosen freely from every denomination, so the same multiset is written once per distinct sequence and the count becomes permutations. The minimum row is immune to this because min is order-invariant, which is the sharpest way to state what the loop order encodes. The inner sweep must go upward because the supply is unlimited - dp[a - coin] is allowed to be a value this very coin pass wrote, which is what makes repetition legal - and reversing it turns the table into the count of subsets of the denomination set, where each coin type contributes at most one coin. Cost is O(amount * |coins|) time and O(amount) space, and the counts themselves are the real hazard: they grow like a quasi-polynomial in the amount, so the answer for amount 100 with [1,2,5] is already four digits and long amounts want BigInt.",
    walkthrough:
      "coins [1,2,5], amount 5, coin-outer. Seed 1,0,0,0,0,0. Pass 1 fills every cell to 1 (all ones is the only combination using the 1-coin alone): 1,1,1,1,1,1. Pass 2 adds the ways ending in a 2, reading dp[a - 2] from the pass that already knows the 1-coin, giving 1,1,2,2,3,3. Pass 5 adds dp[0] to dp[5], so the row ends 1,1,2,2,3,4. The four combinations are 5, and 2 + 2 + 1, and 2 + 1 + 1 + 1, and five ones. Run the amount-outer version on the same input and the table reads 1,1,2,3,5,9: dp[2] = dp[1] + dp[0] = 2 because 1 + 1 and the single 2 are different sequences, dp[3] = 3, dp[4] = 5, dp[5] = 9 - and the extra five are the orderings of 1 + 2 + 2 against 2 + 1 + 2 against 2 + 2 + 1 plus the orderings of 1 + 1 + 1 + 2, so 9 counts sequences where 4 counts multisets. The base case is the one people argue about: coinChangeCombinations([1,2,5], 0) is 1, the empty selection, and it is the seed rather than a bug, because every combination that uses exactly one coin is built on top of it. A denomination above the amount contributes nothing, so coinChangeCombinations([2], 5) is 0 and coinChangeCombinations([2], 3) is 0, and the restricted variant that sweeps downward - one coin of each type at most - answers 1 for [1,2,5] at amount 5, the single 5 coin, and 0 for [2] at amount 3. Scale the same seven lines up and the count grows fast: amount 11 is 11 combinations and amount 100 is 541. A zero denomination is the one seed the doubling cannot survive: coinChangeCombinations([0,1,2], 2) is 4, twice the two real combinations, because the pass for the coin of value 0 adds dp[a] to itself at every amount, which is the subset-count doubling rather than a new way to make change. A zero denomination is the one seed the doubling cannot survive: coinChangeCombinations([0,1,2], 2) is 4, twice the two real combinations, because the pass for the coin of value 0 adds dp[a] to itself at every amount, which is the subset-count doubling this batch names rather than a new way to make change.",
    commonMistake:
      "Putting the amount in the outer loop, or sweeping the amount downward inside a coin-outer loop because the 0/1 row said so.",
    whyWrong:
      "The amount-outer loop is a correct counter of a different question: on coins [1,2,5] with amount 5 it reports 9 while the combinations are 4, and on [1,2,3] with amount 4 it reports 7 against the true 4, because it lets the last coin be any denomination and therefore distinguishes 1 + 3 from 3 + 1. The effect compounds rather than staying proportional - coins [2,5,3,7,8,1,9] at amount 12 give 42 combinations and 1276 sequences, a factor of thirty that a caller asking for change-making schedules would read as the answer. The downward sweep inside a coin-outer loop is the opposite failure and it is undercounting: coinChangeEachCoinAtMostOnce([1,2,5], 5) returns 1 instead of 4, since each pass may spend its denomination once, which is the subset-of-denominations question and not one about unlimited supply.",
    followUps: [
      "Swap the two loops and name exactly which combination gets counted twice. Then prove the coin-outer order cannot miss any multiset.",
      "Why does the same loop swap leave the minimum-coin answer untouched? Say it as a property of min versus plus.",
      "Turn the count into a decision, then into a minimum. Which of the three tables still cares about the outer loop, and why?",
      "The counts exceed 2^53 by amount 300 on four denominations. Which fix keeps them exact, and does the modulo variant still answer a real question?",
    ],
    solution:
      'function coinChangeCombinations(coins, amount) {\n' +
      '  const dp = new Array(amount + 1).fill(0);\n' +
      '  dp[0] = 1;\n' +
      '  for (let idx = 0; idx < coins.length; idx += 1) {\n' +
      '    const coin = coins[idx];\n' +
      '    for (let a = coin; a <= amount; a += 1) {\n' +
      '      dp[a] += dp[a - coin];\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[amount];\n' +
      '}\n' +
      '\n' +
      'function coinChangePermutations(coins, amount) {\n' +
      '  const dp = new Array(amount + 1).fill(0);\n' +
      '  dp[0] = 1;\n' +
      '  for (let a = 1; a <= amount; a += 1) {\n' +
      '    for (let idx = 0; idx < coins.length; idx += 1) {\n' +
      '      const coin = coins[idx];\n' +
      '      if (coin <= a) dp[a] += dp[a - coin];\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[amount];\n' +
      '}\n' +
      '\n' +
      'function coinChangeEachCoinAtMostOnce(coins, amount) {\n' +
      '  const dp = new Array(amount + 1).fill(0);\n' +
      '  dp[0] = 1;\n' +
      '  for (let idx = 0; idx < coins.length; idx += 1) {\n' +
      '    const coin = coins[idx];\n' +
      '    for (let a = amount; a >= coin; a -= 1) {\n' +
      '      dp[a] += dp[a - coin];\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[amount];\n' +
      '}',
    modify:
      "Count only the combinations that use at least one of a required denomination. Which second table, or which subtraction on dp, expresses that constraint?",
  },
  {
    step: 16,
    name: 'Unbounded Knapsack',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Maximise the value packed into a capacity when every item type may be taken repeatedly, and name the single loop direction that makes repetition legal.",
    brief:
      "Input: parallel arrays of values and weights plus a capacity. Output: the greatest value reachable with total weight at most capacity, with unlimited copies of each item. The constraint is the unlimited supply, which turns the 0/1 row downward sweep into an upward one and makes the greedy ratio argument the thing to defend.",
    concepts: [
      'dsa-dp16b-sweep-direction-decides-item-reuse',
      'dsa-dp16b-ratio-greedy-needs-a-proof',
      'dsa-dp16b-exact-fill-versus-leftover-capacity',
      'dsa-include-exclude-branch',
      'dsa-memo-decision-table',
    ],
    shortAnswer:
      "Same table as 0/1 knapsack but the capacity sweeps upward inside each item, so dp[c - weight] may already contain this item; that self-reference is the unlimited supply, at O(n * W) time and O(W) space.",
    idealAnswer:
      "Read dp[c] as the best value inside a budget of at most c using any number of copies, and the recurrence is a max over item types rather than a take-or-skip over items: dp[c] = max over i of value[i] + dp[c - weight[i]], with the branch simply absent when the item does not fit. The one change from the 0/1 row is the visit order of the capacity, and it is not cosmetic. Sweeping upward means that when the pass for item i reaches c, the cell c - weight[i] has already been relaxed by item i itself, so the relaxation composes one more copy onto an answer that already contains copies - the fixpoint the unlimited supply asks for. Sweeping downward means c - weight[i] still holds the previous item pass, which forbids a second copy and silently answers the 0/1 question. Both tables are the same size and both are pseudo-polynomial in the capacity, so the whole difference between the two rows of this batch is one comparison sign in a for header. Because the state is at-most-capacity, leftover budget is legal, which is what separates this from the rod row where every unit of length must be sold. The greedy shortcut deserves its own paragraph: taking as many as fit of the best value-per-weight item is optimal only when the capacity is a multiple of that weight, and the integrality gap in between is exactly where the DP earns its keep - on values [5,6,8] with weights [3,4,5] at capacity 10 the ratio-best item is 5 over 3, so greedy buys three copies, spends 9 of the budget and reports 15, while the table reaches 16 from weights 3, 3 and 4 paying 5 + 5 + 6, a combination no single item type can produce.",
    walkthrough:
      "Items (value, weight) = (10,5), (30,10), (20,15), capacity 30. Pass 1 sweeps upward and fills every multiple of 5: dp[5] = 10, dp[10] = 20, dp[15] = 30 and dp[30] = 60, since each cell reads the cell five below it, which pass 1 already wrote - the reuse the 0/1 row forbids. Pass 2 with weight 10 and value 30 then reads dp[0] = 0 for dp[10] and gets 30, then dp[10] for dp[20] and gets 60, then dp[20] for dp[30] and gets 90, so the row becomes 0,0,0,0,0,10,10,10,10,10,30,30,30,30,30,40,40,40,40,40,60,60,60,60,60,70,70,70,70,70,90. Pass 3 with weight 15, value 20 cannot beat anything - dp[15] stays 40 against 20 and dp[30] stays 90 against dp[15] + 20 = 60 - so the answer is 90, three copies of the second item. Run the same three items through the 0/1 sweep and the answer is 60, which is all three items once each; the gap between 90 and 60 is not an arithmetic difference but a different problem statement. The greedy argument on a second input: values [5,6,8] with weights [3,4,5] at capacity 10 has best ratio 5/3 on item 0, so unboundedGreedyByRatio fills three copies, weight 9, value 15 - while the table answers 16, reached by weights 3, 3 and 4 for 5 + 5 + 6 = 16, a combination no single-ratio item can produce. A single item of weight 5 and value 10 at capacity 10 gives 20 here against 10 in the 0/1 row, and values [6,10,12] with weights [1,2,3] at capacity 5 gives 30 - five copies of the weight-1 item - against the 22 the 0/1 sweep returns on the same input.",
    commonMistake:
      "Sweeping the capacity downward out of muscle memory from the 0/1 row, or filling greedily by value per unit weight and calling the leftover capacity harmless.",
    whyWrong:
      "The downward sweep is the 0/1 loop: on values [10,30,20] and weights [5,10,15] at capacity 30 it reports 60 - each item used at most once - instead of the true 90, and on a single item of weight 5 and value 10 at capacity 10 it reports 10 where the unlimited supply clearly allows 20. Greedy by ratio is the second failure and it is a value loss rather than a crash: on [5,6,8] with weights [3,4,5] at capacity 10 it commits to item 0, buys three copies for 15, and strands one unit of capacity, while the table reaches 16 by mixing weights 3, 3 and 4 - the ratio order and the fill order are not the same thing when weights do not divide. A third variant is seeding the table at minus infinity to force an exactly-full bag, which is the rod-cutting contract and not this one; here an unused budget is legal and dp[c] = 0 for every c is the correct seed.",
    followUps: [
      "Change one character in the loop header and re-derive the 0/1 answer from the same table. Which cell do you read, and why does it stop being self-referential?",
      "Give the capacity-recursive memo form, where the item loop is inside. Why is that shape immune to the sweep-direction bug, and what does it cost?",
      "Two items share a weight but differ in value. Which one can be deleted from the input outright, and what does that say about the table?",
      "Prove the greedy-by-ratio answer is within a factor of the optimum for unbounded knapsack. Where does the leftover capacity bound the loss?",
    ],
    solution:
      'function unboundedKnapsack(values, weights, capacity) {\n' +
      '  const dp = new Array(capacity + 1).fill(0);\n' +
      '  for (let idx = 0; idx < values.length; idx += 1) {\n' +
      '    const weight = weights[idx];\n' +
      '    if (weight <= 0) continue;\n' +
      '    for (let c = weight; c <= capacity; c += 1) {\n' +
      '      const candidate = dp[c - weight] + values[idx];\n' +
      '      if (candidate > dp[c]) dp[c] = candidate;\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[capacity];\n' +
      '}\n' +
      '\n' +
      'function unboundedKnapsackMemo(values, weights, capacity) {\n' +      '  const memo = new Array(capacity + 1).fill(-1);\n' +
      '  const solve = (budget) => {\n' +
      '    if (budget <= 0) return 0;\n' +
      '    if (memo[budget] !== -1) return memo[budget];\n' +
      '    let best = 0;\n' +
      '    for (let idx = 0; idx < values.length; idx += 1) {\n' +
      '      if (weights[idx] <= budget) {\n' +
      '        const candidate = values[idx] + solve(budget - weights[idx]);\n' +
      '        if (candidate > best) best = candidate;\n' +
      '      }\n' +
      '    }\n' +
      '    memo[budget] = best;\n' +
      '    return best;\n' +
      '  };\n' +
      '  return solve(capacity);\n' +
      '}\n' +
      '\n' +
      'function unboundedGreedyByRatio(values, weights, capacity) {\n' +
      '  let best = -1;\n' +
      '  let bestRatio = 0;\n' +
      '  for (let idx = 0; idx < values.length; idx += 1) {\n' +
      '    if (weights[idx] <= 0) continue;\n' +
      '    const ratio = values[idx] / weights[idx];\n' +
      '    if (ratio > bestRatio) {\n' +
      '      bestRatio = ratio;\n' +
      '      best = idx;\n' +
      '    }\n' +
      '  }\n' +
      '  if (best < 0) return 0;\n' +
      '  return Math.floor(capacity / weights[best]) * values[best];\n' +
      '}\n' +
      '\n' +
      'function unboundedKnapsackDownwardSweep(values, weights, capacity) {\n' +
      '  const dp = new Array(capacity + 1).fill(0);\n' +
      '  for (let idx = 0; idx < values.length; idx += 1) {\n' +
      '    const weight = weights[idx];\n' +
      '    if (weight <= 0) continue;\n' +
      '    for (let c = capacity; c >= weight; c -= 1) {\n' +
      '      const candidate = dp[c - weight] + values[idx];\n' +
      '      if (candidate > dp[c]) dp[c] = candidate;\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[capacity];\n' +
      '}',
    modify:
      "Add a per-item copy limit so item i may appear at most count[i] times. Which axis joins the state, and how does the sweep direction change for that axis?",
  },
  {
    step: 16,
    name: 'Rod Cutting Problem',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Cut a rod of length n into pieces to maximise the revenue from a price table, and say why the price of a longer piece proves nothing.",
    brief:
      "Input: an array where entry i is the price of a piece of length i + 1, and the rod length is the array length. Output: the greatest revenue from cutting and selling the whole rod. The constraint is that every unit of length must be sold, so this is the unbounded item loop with exact fill rather than at-most capacity.",
    concepts: [
      'dsa-dp16b-exact-fill-versus-leftover-capacity',
      'dsa-dp16b-sweep-direction-decides-item-reuse',
      'dsa-dp16b-operator-decides-which-dp-it-is',
      'dsa-recursive-decomposition',
      'dsa-memo-decision-table',
    ],
    shortAnswer:
      "dp[len] is the best revenue for a rod of exactly len: max over first cut c of price[c] + dp[len - c]. O(n^2) time, O(n) space, and a stored first-cut table is what turns the revenue back into pieces.",
    idealAnswer:
      "Every cut of a rod of length len starts by detaching some first piece of length c between 1 and len, and what is left is a rod of length len - c that must be solved on its own terms, so dp[len] = max over c of price[c - 1] + dp[len - c]. The branch at c = len is the no-cut option, which is why the table needs no separate baseline. This is unbounded knapsack wearing a different costume: length plays both roles at once - it is the weight of the item and its value - and the item set is exactly the lengths that fit, which is why the same length can be sold repeatedly. The difference from the knapsack row is the fill semantics: a rod has no leftover, so the state is indexed by the exact remaining length and every unit must be accounted for, whereas a bag may finish under budget. That is also why the cost is O(n^2) and not O(n * total): the capacity here is the rod length, so the pseudo-polynomial axis is small by construction. The monotonicity assumption is the trap that this row exists to teach. A price table is a list of numbers, not a function, so price[len] can be below the best split of len in either direction: [3,5,6] prices a length-3 rod at 6 while three unit pieces give 9, and [5,8,10] prices length 3 at 10 while three unit pieces give 15. No comparison between neighbouring entries can detect that, and only the table can. Reconstructing the pieces is the third move: dp alone answers revenue, and naming the pieces needs a first-cut array written in the same loop, which costs O(n) and is the same keep-pointer trade the printed-string rows make.",
    walkthrough:
      "price = [1,5,8,9,10,17,17,20] for lengths 1 through 8. dp[0] = 0. dp[1] = price[0] = 1. dp[2] = max(price[1] = 5, price[0] + dp[1] = 2) = 5. dp[3] = max(8, 1 + 5 = 6, 5 + 1 = 6) = 8. dp[4] = max(9, 1 + 8 = 9, 5 + 5 = 10, 8 + 1 = 9) = 10. dp[5] = max(10, 1 + 10 = 11, 5 + 8 = 13, 8 + 5 = 13, 9 + 1 = 10) = 13. dp[6] = max(17, 1 + 13 = 14, 5 + 10 = 15, 8 + 8 = 16, 9 + 5 = 14, 10 + 1 = 11) = 17. dp[7] = 18 and dp[8] = max(20, 1 + 18 = 19, 5 + dp[6] = 22, 8 + dp[5] = 21, ...) = 22. The table reads 0,1,5,8,10,13,17,18,22 and rodRevenue returns 22, which rodCutPieces reconstructs as lengths 2 and 6 - price 5 plus 17. The revenue-only memo recursion returns the same 22. Now the two inputs that punish assumptions: price [3,5,6] gives dp[1] = 3, dp[2] = max(5, 3 + 3 = 6) = 6, dp[3] = max(6, 3 + 6 = 9, 5 + 3 = 8) = 9, so the length-3 rod is sold as three unit pieces even though a whole-rod price exists, and rodCutPieces returns 1,1,1. price [2,5,7,8] gives dp = 0,2,5,7,10 so the answer is 10 from two pieces of length 2, again beating the printed price of the full rod. Restrict the top split to exactly two pieces and [3,5,6] answers 8 instead of 9, because the third unit piece is unreachable in one cut.",
    commonMistake:
      "Splitting the rod into exactly two pieces at every length, or assuming the price table is non-decreasing and that a longer piece is therefore worth more than any split of it.",
    whyWrong:
      "The two-piece split is the missing recursion: rodRevenueTwoCutsOnly([3,5,6]) returns 8 from the best pair 3 + 5, while the true optimum is 9 from three unit cuts, so a price that is not reachable in one split becomes unreachable entirely; the recurrence has to read dp[len - c] and not price[len - c]. The monotonicity assumption fails on printed data, not on edge cases: [3,5,6] prices length 3 at 6 below the 9 that three length-1 sales make, and [2,5,7,8] prices length 4 at 8 below the 10 of two length-2 pieces, so a candidate who compares dp[len] only against price[len] reports 8 and 6 respectively. The third failure is carrying the knapsack seed forward: leaving dp of an unfilled length at negative infinity is right for exact fill and wrong for the at-most-budget row, and mixing the two makes the no-cut branch disappear, which silently forbids selling the rod whole.",
    followUps: [
      "Roll the recurrence into the unbounded-knapsack shape with length as weight and price as value. Which loop order do you get, and does it still force exact fill?",
      "Report the multiset of pieces. What does the first-cut array cost, and why can a revenue-only table not name them?",
      "Give an input where the optimum uses the same piece length five times. What does that say about the depth of the cut tree versus the size of the table?",
      "Add a saw cost per cut. Which term of the recurrence changes, and does the no-cut branch still cost zero?",
    ],
    solution:
      'function rodRevenue(price) {\n' +
      '  const n = price.length;\n' +
      '  const dp = new Array(n + 1).fill(0);\n' +
      '  for (let len = 1; len <= n; len += 1) {\n' +
      '    let best = 0;\n' +
      '    for (let cut = 1; cut <= len; cut += 1) {\n' +
      '      const candidate = price[cut - 1] + dp[len - cut];\n' +
      '      if (candidate > best) best = candidate;\n' +
      '    }\n' +
      '    dp[len] = best;\n' +
      '  }\n' +
      '  return dp[n];\n' +
      '}\n' +
      '\n' +
      'function rodRevenueMemo(price) {\n' +
      '  const n = price.length;\n' +
      '  const memo = new Array(n + 1).fill(-1);\n' +
      '  const solve = (len) => {\n' +
      '    if (len <= 0) return 0;\n' +
      '    if (memo[len] !== -1) return memo[len];\n' +
      '    let best = 0;\n' +
      '    for (let cut = 1; cut <= len; cut += 1) {\n' +
      '      const candidate = price[cut - 1] + solve(len - cut);\n' +
      '      if (candidate > best) best = candidate;\n' +
      '    }\n' +
      '    memo[len] = best;\n' +
      '    return best;\n' +
      '  };\n' +
      '  return solve(n);\n' +
      '}\n' +
      '\n' +
      'function rodCutPieces(price) {\n' +
      '  const n = price.length;\n' +
      '  const dp = new Array(n + 1).fill(0);\n' +
      '  const first = new Array(n + 1).fill(0);\n' +
      '  for (let len = 1; len <= n; len += 1) {\n' +
      '    let best = 0;\n' +
      '    let bestCut = 1;\n' +
      '    for (let cut = 1; cut <= len; cut += 1) {\n' +
      '      const candidate = price[cut - 1] + dp[len - cut];\n' +
      '      if (candidate > best) {\n' +
      '        best = candidate;\n' +
      '        bestCut = cut;\n' +
      '      }\n' +
      '    }\n' +
      '    dp[len] = best;\n' +
      '    first[len] = bestCut;\n' +
      '  }\n' +
      '  const pieces = [];\n' +
      '  let rest = n;\n' +
      '  while (rest > 0) {\n' +
      '    pieces.push(first[rest]);\n' +
      '    rest -= first[rest];\n' +
      '  }\n' +
      '  return pieces;\n' +
      '}\n' +
      '\n' +
      'function rodRevenueTwoCutsOnly(price) {\n' +
      '  const n = price.length;\n' +
      '  if (n === 0) return 0;\n' +
      '  const dp = new Array(n + 1).fill(0);\n' +
      '  for (let len = 1; len <= n; len += 1) {\n' +
      '    let best = price[len - 1];\n' +
      '    for (let cut = 1; cut < len; cut += 1) {\n' +
      '      const candidate = price[cut - 1] + price[len - cut - 1];\n' +
      '      if (candidate > best) best = candidate;\n' +
      '    }\n' +
      '    dp[len] = best;\n' +
      '  }\n' +
      '  return dp[n];\n' +
      '}',
    modify:
      "The saw costs one coin per cut and pieces of length above a limit cannot be sold. Which term of the recurrence changes, and which branch becomes illegal?",
  },
  {
    step: 16,
    name: 'Longest Common Subsequence',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Return the length of the longest sequence that appears in both strings in the same order, and say what a table cell is storing to make skipping legal.",
    brief:
      "Input: two strings, up to a few thousand characters each. Output: one integer, the length of their longest common subsequence, where characters may be skipped arbitrarily in either string but the relative order is kept. The constraint is that a match needs no fixed offset between the strings, so the state has to be a pair of prefix lengths and no single pointer can carry it.",
    concepts: [
      'dsa-dp16b-two-prefix-table-diagonal-encodes-a-match',
      'dsa-subsequence-not-substring',
      'dsa-coordinate-loops',
      'dsa-include-exclude-branch',
      'dsa-complexity-counting',
    ],
    shortAnswer:
      "dp[i][j] is the answer for the first i characters of a against the first j of b: the diagonal plus one when the two characters agree, otherwise the better of the cell above and the cell to the left. O(n * m) time, O(n * m) space, O(min(n, m)) with a rolling pair of rows.",
    idealAnswer:
      "Say the invariant out loud before writing the recurrence: dp[i][j] is the length of the longest sequence that is a subsequence of both a.slice(0, i) and b.slice(0, j). There are two cases and they are exhaustive. If a[i - 1] and b[j - 1] agree, that character can close an optimal answer: take any longest common subsequence of the two shorter prefixes, append the shared character, and you have a common subsequence one longer, so dp[i][j] = dp[i - 1][j - 1] + 1. If they disagree, no common subsequence can end with both of them, so at least one of the two final characters is unused and the answer lives in a neighbour: dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]). The extra row and column of zeros are the base case, one prefix empty, and they are the reason the loops need no special handling. Both axes are real input length, so the cost is O(n * m) time and space and nothing here is pseudo-polynomial in the way the capacity rows are - there is no exponential blow-up hiding, and no cleverer general algorithm exists to fall back on. The rolling pair of rows is legal because the recurrence reads exactly one row back plus the current row's left neighbour, which cuts space to O(min(n, m)); it still reports from the corner, because the max propagates monotonically right and down, so the corner is the best over the whole table. That is a property of this recurrence and not of two-dimensional tables in general: the substring row keeps a run length in each cell, and there the corner is a lie. The trap the row exists to teach is the diagonal. On a mismatch the diagonal must not be candidates at all; letting dp[i][j] be one plus the maximum of all three neighbours inflates the count with characters nobody shares, and the value then exceeds what the shorter string could supply.",
    walkthrough:
      "Columns are the prefixes of AEDFHR, rows the prefixes of ABCDGH. Row 1, the A, reads 0,1,1,1,1,1,1: the A matches the A in column 1 through the diagonal 0 plus 1, and every later cell in that row inherits the 1 from the left. Rows 2 and 3, B and C, are also 0,1,1,1,1,1,1 - neither character occurs in AEDFHR, so every cell takes the top neighbour. Row 4, D, reads 0,1,1,2,2,2,2: at column 3 the characters agree and the diagonal is dp[3][2] = 1, so the cell becomes 2 and AD is now a shared subsequence. Row 5, G, changes nothing because G is absent from AEDFHR. Row 6, H, reads 0,1,1,2,2,3,3: at column 5 the characters agree, the diagonal dp[5][4] is 2, so the cell is 3 and the answer for the pair is 3, one witness being ADH. Now the input with more than one answer: ABCBDAB against BDCABA is 4 and the four-character common subsequences are exactly BCAB, BCBA and BDAB - three of them, which is why any row that prints one of them has to declare a tie rule. AGGTAB against GXTXAYB is also 4 but has a single representative, GTAB. The two rolling rows return the same 4, 4 and 3 on those three pairs. The two wrong recurrences on the same data: scoring one plus the best of all three neighbours gives 6 for ABCBDAB against BDCABA and 3 for abc against acb, where the true answers are 4 and 2; walking both strings one character at a time and counting the positions that agree gives 2 for ABCBDAB against BDCABA and 1 for AGGTAB against GXTXAYB, while giving 3 for abc against abc - the right number for the wrong reason.",
    commonMistake:
      "Aligning the two strings by index with a two-pointer and counting the agreements, or letting a match be scored from the maximum of all three neighbours instead of the diagonal.",
    whyWrong:
      "The pointer walk is a correct algorithm only for the common subsequence that happens to sit on the diagonal: ABCBDAB against BDCABA walks A over B, B over D, C over C, B over A, D over B and A over A, so it reports 2 against a true 4, and AGGTAB against GXTXAYB reports 1 against a true 4. It fails because a match at offset i in one string does not have to be at offset j in the other - the drift of offsets is the whole subject of the problem - and it stays dangerous because on abc against abc it answers 3, so a candidate can pass a self-test and still fail the interview input. The three-neighbour variant fails upward: allowing the diagonal plus one on a mismatch adds length without adding a shared character, so ABCBDAB against BDCABA returns 6, which is the entire length of the second string, and abc against acb returns 3, longer than the two characters that pair actually shares.",
    followUps: [
      "Prove the two-case split is exhaustive. Why can a mismatch never use both final characters, and where exactly does the diagonal become legal again?",
      "Roll the table to two rows. Which three cells does a cell read in that version, and why is the corner still the maximum of the whole table?",
      "Count the distinct longest common subsequences instead of their length. Which state has to grow, and why do the ties in ABCBDAB against BDCABA make that harder than it looks?",
      "Give an input where every common subsequence of maximum length uses characters from strictly increasing but unequal index pairs. What does that say about any algorithm that walks the two strings in lockstep?",
    ],
    solution:
      'function lcsLength(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) {\n' +
      '    dp.push(new Array(b.length + 1).fill(0));\n' +
      '  }\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      if (a[i - 1] === b[j - 1]) {\n' +
      '        dp[i][j] = dp[i - 1][j - 1] + 1;\n' +
      '      } else {\n' +
      '        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[a.length][b.length];\n' +
      '}\n' +
      '\n' +
      'function lcsLengthRolling(a, b) {\n' +
      '  let previous = new Array(b.length + 1).fill(0);\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    const current = new Array(b.length + 1).fill(0);\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      if (a[i - 1] === b[j - 1]) {\n' +
      '        current[j] = previous[j - 1] + 1;\n' +
      '      } else {\n' +
      '        current[j] = Math.max(previous[j], current[j - 1]);\n' +
      '      }\n' +
      '    }\n' +
      '    previous = current;\n' +
      '  }\n' +
      '  return previous[b.length];\n' +
      '}\n' +
      '\n' +
      'function lcsLengthWithThreeWayMax(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) {\n' +
      '    dp.push(new Array(b.length + 1).fill(0));\n' +
      '  }\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      dp[i][j] = Math.max(dp[i - 1][j - 1] + 1, dp[i - 1][j], dp[i][j - 1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[a.length][b.length];\n' +
      '}\n' +
      '\n' +
      'function lcsLengthByPointerAlignment(a, b) {\n' +
      '  let count = 0;\n' +
      '  for (let i = 0; i < a.length && i < b.length; i += 1) {\n' +
      '    if (a[i] === b[i]) count += 1;\n' +
      '  }\n' +
      '  return count;\n' +
      '}',
    modify:
      "Report the length of the longest common subsequence shared by k strings instead of two. Which axis does the state gain, and what does the table cost when k is five?",
  },
  {
    step: 16,
    name: 'Print Longest Common Subsequence',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Return one longest common subsequence itself rather than its length, and name the array you must keep to be able to do it.",
    brief:
      "Input: two strings. Output: a string of maximal length that is a subsequence of both; when several tie, any one of them is acceptable. The constraint is that the answer is a sequence and not a number, so the table has to retain the choices that produced each value - the rolling pair of rows that answers the length question cannot produce it.",
    concepts: [
      'dsa-dp16b-reconstruction-forfeits-the-rolling-array',
      'dsa-dp16b-two-prefix-table-diagonal-encodes-a-match',
      'dsa-subsequence-not-substring',
      'dsa-coordinate-loops',
    ],
    shortAnswer:
      "Fill the whole (n + 1) by (m + 1) table, then walk it from the bottom-right: emit a character on a diagonal step at a match, otherwise move to the neighbour that still holds the current value. The emission comes out backwards, so reverse it. O(n * m) time and space.",
    idealAnswer:
      "The walk maintains one invariant: when it stands on cell (i, j) with value v, it still has exactly v characters to emit, all of them inside a.slice(0, i) and b.slice(0, j). Start at the corner where v is the answer. If a[i - 1] and b[j - 1] agree, that character belongs to an optimal completion - the table says dp[i][j] is dp[i - 1][j - 1] + 1, so emitting it and stepping to the diagonal restores the invariant with v - 1. If they disagree, the value came from one of the two neighbours, and moving into the neighbour whose value equals the current one keeps v intact while shrinking the problem; on a tie either direction is legal, and that choice is what selects which of the several longest answers you print, so the convention must be stated rather than discovered by the reviewer. The loop ends when i or j reaches 0, because the only row and column of zeros is the base case and any value still outstanding there would contradict the table. Characters are emitted from the end backwards, so the result needs one reversal; skipping it is the most common single bug in this row. The honest cost is the table: O(n * m) cells retained. The two-row rolling version keeps two of the n + 1 rows, and since the walk follows a path of diagonal steps through every row, that history is exactly what was thrown away - the length row and this row are the same recurrence priced differently. When the requirement is only to count answers, the walk generalises into a second table of path counts, and then the tie rule stops being cosmetic because the number of paths is the answer.",
    walkthrough:
      "Take AGGTAB against GXTXAYB. The finished table has rows, one per character of AGGTAB: A is 0,0,0,0,0,1,1,1; G is 0,1,1,1,1,1,1,1; the second G repeats it; T is 0,1,1,2,2,2,2,2; A is 0,1,1,2,2,3,3,3; B is 0,1,1,2,2,3,3,4. Walk from (6,7) with value 4. a[5] and b[6] are both B, so emit B and step to (5,6), value 3. There a[4] is A and b[5] is Y: mismatch, top is dp[4][6] = 2 and left is dp[5][5] = 3, so the value only survives by going left to (5,5). Now both characters are A: emit A, step diagonally to (4,4), value 2. T against X mismatches, top is 1 and left is 2, so left to (4,3); T against T matches, emit T, diagonal to (3,2), value 1. G against X mismatches with top dp[2][2] = 1 and left dp[3][1] = 1, a genuine tie, and the go-up-on-ties rule takes (2,2). G against X again mismatches, top is 0, left is 1, so left to (2,1); G against G matches, emit G, diagonal to (1,0), and the column is zero so the walk stops. Emitted order was B, A, T, G, and reversed it is GTAB, length 4, matching the table. On ABCBDAB against BDCABA the same rule prints BCBA; replacing the tie test from greater-or-equal to strictly-greater prints BDAB instead, and the complete list of four-character answers is BCAB, BCBA, BDAB. The two-row rolling version prints nothing at all: it returns 4 and holds two rows. A single greedy scan of a against b, taking every character that still finds a home to the right, returns ABA on ABCBDAB against BDCABA and AB on AGGTAB against GXTXAYB - real common subsequences, wrong lengths. Drop the diagonal step instead, emitting on a match but advancing only the row pointer, and ABCBDAB against BDCABA prints ABBA: four characters, the right length, and not a subsequence of BDCABA at all, because the only B after its last A is a single one. That same bug on AGGTAB against GXTXAYB prints GTAB, which is the answer.",
    commonMistake:
      "Reconstructing from a rolling two-row table, or emitting on a match while stepping only the row pointer instead of moving to the diagonal.",
    whyWrong:
      "The rolling table has no history to walk: lcsLengthRolling returns 4 for AGGTAB against GXTXAYB and keeps only rows 5 and 6, so the diagonal steps through rows 1 to 4 that produced that value no longer exist, and any pointer chase over it either stops early or invents characters. The single-pointer backtrack is worse than incomplete, it fabricates: emitting a[i - 1] and decrementing only i lets one row of the table contribute several characters, because a match never releases the column it was read against. On aaa against a it prints aaa - three characters from a second string that has one - where the true answer is 1. It survives AGGTAB against GXTXAYB only because that table happens to be walked one row per character, which is the coincidence no reviewer should have to trust. Forgetting the final reversal is the third failure and it is silent under the same input: the walk emits BATG, which is the right multiset in the wrong order and is not a subsequence of either string.",
    followUps: [
      "Rewrite the walk so that it prefers the left neighbour on a tie. Print both outputs for ABCBDAB against BDCABA and show they are different valid answers.",
      "Keep only the row index of each cell choice as a byte per cell instead of the value table. What does that cost, and why is it still not two rows?",
      "Count the distinct longest common subsequences. Why does a sum over the tie branches double-count, and what extra structure stops it?",
      "Adapt the walk to the longest palindromic subsequence of one string, where the two axes are the same string. Which cell do you start from, and what does the emitted string have to satisfy?",
    ],
    solution:
      'function buildLcsTable(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) {\n' +
      '    dp.push(new Array(b.length + 1).fill(0));\n' +
      '  }\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      if (a[i - 1] === b[j - 1]) {\n' +
      '        dp[i][j] = dp[i - 1][j - 1] + 1;\n' +
      '      } else {\n' +
      '        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return dp;\n' +
      '}\n' +
      '\n' +
      'function lcsEmittedBackward(a, b) {\n' +
      '  const dp = buildLcsTable(a, b);\n' +
      '  let i = a.length;\n' +
      '  let j = b.length;\n' +
      '  let out = "";\n' +
      '  while (i > 0 && j > 0) {\n' +
      '    if (a[i - 1] === b[j - 1]) {\n' +
      '      out += a[i - 1];\n' +
      '      i -= 1;\n' +
      '      j -= 1;\n' +
      '    } else if (dp[i - 1][j] >= dp[i][j - 1]) {\n' +
      '      i -= 1;\n' +
      '    } else {\n' +
      '      j -= 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function printLcs(a, b) {\n' +
      '  return lcsEmittedBackward(a, b).split("").reverse().join("");\n' +
      '}\n' +
      '\n' +
      'function printLcsWithoutDiagonalStep(a, b) {\n' +
      '  const dp = buildLcsTable(a, b);\n' +
      '  let i = a.length;\n' +
      '  let j = b.length;\n' +
      '  let out = "";\n' +
      '  while (i > 0 && j > 0) {\n' +
      '    if (a[i - 1] === b[j - 1]) {\n' +
      '      out += a[i - 1];\n' +
      '      i -= 1;\n' +
      '    } else if (dp[i - 1][j] >= dp[i][j - 1]) {\n' +
      '      i -= 1;\n' +
      '    } else {\n' +
      '      j -= 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return out.split("").reverse().join("");\n' +
      '}\n' +
      '\n' +
      'function lcsLengthRolling(a, b) {\n' +
      '  let previous = new Array(b.length + 1).fill(0);\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    const current = new Array(b.length + 1).fill(0);\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      if (a[i - 1] === b[j - 1]) {\n' +
      '        current[j] = previous[j - 1] + 1;\n' +
      '      } else {\n' +
      '        current[j] = Math.max(previous[j], current[j - 1]);\n' +
      '      }\n' +
      '    }\n' +
      '    previous = current;\n' +
      '  }\n' +
      '  return previous[b.length];\n' +
      '}\n' +
      '\n' +
      'function lcsByGreedyScan(a, b) {\n' +
      '  let from = 0;\n' +
      '  let out = "";\n' +
      '  for (let i = 0; i < a.length; i += 1) {\n' +
      '    const at = b.indexOf(a[i], from);\n' +
      '    if (at !== -1) {\n' +
      '      out += a[i];\n' +
      '      from = at + 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function isSubsequence(part, whole) {\n' +
      '  let idx = 0;\n' +
      '  for (let k = 0; k < whole.length && idx < part.length; k += 1) {\n' +
      '    if (whole[k] === part[idx]) idx += 1;\n' +
      '  }\n' +
      '  return idx === part.length;\n' +
      '}',
    modify:
      "Print every longest common subsequence, without duplicates. Which branch of the walk has to be explored twice, and what memo stops the enumeration from repeating a suffix?",
  },
  {
    step: 16,
    name: 'Longest Common Substring',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Find the longest block of consecutive characters shared by two strings, and say why the answer is not in the corner of your table.",
    brief:
      "Input: two strings. Output: the length of the longest contiguous block that occurs in both, optionally the block itself. The constraint is contiguity: a single mismatched character ends a run, so a cell records how long the run ending there is rather than the best answer so far.",
    concepts: [
      'dsa-dp16b-answer-is-the-max-cell-not-the-corner',
      'dsa-dp16b-two-prefix-table-diagonal-encodes-a-match',
      'dsa-subsequence-not-substring',
      'dsa-coordinate-loops',
    ],
    shortAnswer:
      "Same two-prefix table shape, but dp[i][j] is dp[i - 1][j - 1] + 1 on a match and 0 on a mismatch, and the answer is the largest cell anywhere in the table, not the bottom-right one. O(n * m) time, O(min(n, m)) space if only the length is wanted.",
    idealAnswer:
      "Redefine the state honestly: dp[i][j] is the length of the longest block that ends exactly at a[i - 1] and b[j - 1]. That ending-exactly clause is the whole row. If the two characters agree, the block ending there is the block ending at the diagonal plus this character, so dp[i][j] = dp[i - 1][j - 1] + 1; if they disagree, no block ends at both, and the cell is 0 rather than a carried-over best - a mismatch does not merely fail to extend a run, it destroys the run. Consequences follow from the definition rather than from a trick. The maximum is attained at whichever cell closes the longest block, and cells after it may hold smaller values or zeros, so the answer is max over all i, j of dp[i][j]; reading the corner returns the longest shared suffix, a different quantity that happens to be a subsequence of the right one. The corner is correct only when the longest block happens to end at both strings, and a row that reports from the corner passes that accident and fails the general case. Space: a row of the table reads only the previous row at the column one to the left, so one rolling array swept right to left with a saved diagonal is enough for the length, which is a smaller forfeit than the subsequence row asks - the length needs no history. To return the block itself, keep the row index of the best cell and slice a from end - best to end: no backtracking is needed because the run length is stored in the cell, which is why this row can print an answer at O(min) space while printing a subsequence cannot. Cost is O(n * m) time either way, and the suffix-automaton or binary-search-plus-hashing formulations beat it on huge inputs, which is the follow-up worth volunteering.",
    walkthrough:
      "Columns are GeeksQuiz, rows are GeeksforGeeks. Row 1, the leading G, is 0,1,0,0,0,0,0,0,0,0: it matches column 1 on a diagonal of 0, so it scores 1 and everything else is a mismatch, hence 0. Row 2, the first e, is 0,0,2,1,0,0,0,0,0,0: the 2 at column 3 is the diagonal 1 plus one, and the 1 at column 4 is an e against the second e of Geeks whose diagonal neighbour is 0, so the run restarts at one instead of accumulating - that single cell is the clearest statement of the else branch. Row 3, the second e, is 0,0,1,3,0,0,0,0,0,0, so the run through Ge is three. Row 4 reaches 4 at the k, row 5 reaches 5 at the s, and the largest cell in the whole table is that 5, which is the block Geeks. Rows 9 through 13 reproduce the identical five cells for the second Geeks in the first string, and they raise nothing new because the maximum is already 5. Now the corner: the cell at row 13, column 9 is 0, because Geeks ends in s and Quiz ends in z, so the longest shared suffix is empty and a corner-reading implementation reports 0 for an answer of 5. A smaller picture of the same geometry: abcde against zbcdx is all zeros except a diagonal run 1, 2, 3 closing on the d at row 4, column 4, so the block is bcd, the answer 3, and the corner again 0. Same shape as the subsequence row, different question: ABCBDAB against BDCABA has a longest common subsequence of 4 and a longest common substring of 2, one witness being AB.",
    commonMistake:
      "Returning the bottom-right cell, or reusing the subsequence recurrence that carries the top and left neighbours through a mismatch.",
    whyWrong:
      "The corner stores the block ending at both final characters, which is a common suffix: it is 0 on GeeksforGeeks against GeeksQuiz where the answer is 5 for Geeks, and 0 on abcde against zbcdx where the answer is 3 for bcd. It is right on aaa against aa, which returns 2 either way, and that single coincidence is what makes the bug survive a candidate's mental test. Importing the subsequence recurrence changes the question instead: it scores 4 on ABCBDAB against BDCABA where the contiguous answer is 2, because the max of the top and left neighbours lets a block leap over characters that do not match. The lighter version of the same error - zeroing on a mismatch but copying the diagonal instead of nothing when the characters disagree - keeps blocks alive across gaps: on abcd against abxd it reports 3, as if abd were contiguous, against a true 2 for ab.",
    followUps: [
      "Roll the table to one array swept right to left. Which cell must be saved before it is overwritten, and why does the sweep direction flip from the 0/1 row?",
      "Report the block, not its length. Why does that need no backtracking here while the subsequence row needs the whole table?",
      "Two blocks tie for longest. Which one do you return, and how would the answer change if the question asked for the block that starts earliest in the first string?",
      "Give the binary-search-on-length plus rolling-hash algorithm and its cost. What does it trade for beating O(n * m), and which input makes that trade lose?",
    ],
    solution:
      'function longestCommonSubstringLength(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) {\n' +
      '    dp.push(new Array(b.length + 1).fill(0));\n' +
      '  }\n' +
      '  let best = 0;\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      if (a[i - 1] === b[j - 1]) {\n' +
      '        dp[i][j] = dp[i - 1][j - 1] + 1;\n' +
      '        if (dp[i][j] > best) best = dp[i][j];\n' +
      '      } else {\n' +
      '        dp[i][j] = 0;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function longestCommonSubstring(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) {\n' +
      '    dp.push(new Array(b.length + 1).fill(0));\n' +
      '  }\n' +
      '  let best = 0;\n' +
      '  let endRow = 0;\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      if (a[i - 1] === b[j - 1]) {\n' +
      '        dp[i][j] = dp[i - 1][j - 1] + 1;\n' +
      '        if (dp[i][j] > best) {\n' +
      '          best = dp[i][j];\n' +
      '          endRow = i;\n' +
      '        }\n' +
      '      } else {\n' +
      '        dp[i][j] = 0;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return a.slice(endRow - best, endRow);\n' +
      '}\n' +
      '\n' +
      'function longestCommonSubstringFromCorner(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) {\n' +
      '    dp.push(new Array(b.length + 1).fill(0));\n' +
      '  }\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : 0;\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[a.length][b.length];\n' +
      '}\n' +
      '\n' +
      'function longestCommonSubstringWithoutReset(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) {\n' +
      '    dp.push(new Array(b.length + 1).fill(0));\n' +
      '  }\n' +
      '  let best = 0;\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : dp[i - 1][j - 1];\n' +
      '      if (dp[i][j] > best) best = dp[i][j];\n' +
      '    }\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function lcsLength(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) {\n' +
      '    dp.push(new Array(b.length + 1).fill(0));\n' +
      '  }\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      dp[i][j] = a[i - 1] === b[j - 1]\n' +
      '        ? dp[i - 1][j - 1] + 1\n' +
      '        : Math.max(dp[i - 1][j], dp[i][j - 1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[a.length][b.length];\n' +
      '}',
    modify:
      "Return the longest block that occurs in the first string and at least twice, at different offsets, in the second. Which cell of the table now has to record the second coordinate, and where does the maximum get taken?",
  },
  {
    step: 16,
    name: 'Longest Palindromic Subsequence',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Return the length of the longest subsequence of one string that reads the same in both directions, and say why the fill order of the table is a correctness condition.",
    brief:
      "Input: a single string. Output: the length of its longest palindromic subsequence, characters skippable but order kept and the result symmetric. The constraint is that the state is an interval, so each cell depends on the row below it and the column to its left, and a table written in the wrong order is read before it is filled.",
    concepts: [
      'dsa-dp16b-palindrome-is-self-lcs-by-length-only',
      'dsa-dp16b-operator-decides-which-dp-it-is',
      'dsa-subsequence-not-substring',
      'dsa-coordinate-loops',
    ],
    shortAnswer:
      "dp[i][j] is the best answer inside s.slice(i, j + 1): 2 plus dp[i + 1][j - 1] when the two ends agree, otherwise the better of dp[i + 1][j] and dp[i][j - 1], with dp[i][i] = 1. Sweep i downward and j upward; O(n^2) time and space.",
    idealAnswer:
      "Index the state by the interval still in play: dp[i][j] is the length of the longest palindromic subsequence of s.slice(i, j + 1), the answer is dp[0][n - 1], the single-character base is dp[i][i] = 1, and an inverted interval with i greater than j reads as 0. If the two ends agree they can be paired around the best answer of the inside, so dp[i][j] = 2 + dp[i + 1][j - 1], and the guard for an empty inside is what makes a two-character match score 2 rather than 3. If they disagree, no palindrome can use both ends as a pair, so at least one of them is dropped and the answer is the better of the two narrower intervals. Every dependency arrow points from a strictly shorter interval, which is what makes the fill order load-bearing: the three cells a value reads are the row below at the same column, this row one column to the left, and the row below one column to the left. Sweeping i from n - 1 down to 0 with j from i + 1 upward guarantees all three are already written; sweeping i upward reads cells that still hold 0, and because the operator is a max those phantom zeros are simply out-competed - the number comes back small and no assertion fires. Space is O(n^2) for the table and O(n) for the length alone, since row i reads only row i + 1, and any reconstruction pays the table back. The other formulation is the one interviews actually probe: the length equals the longest common subsequence of the string against its own reverse. Both bounds hold - a palindrome reads the same backwards, so it is a common subsequence, and a common subsequence of the two orderings can be uncrossed into a palindrome of the same length - so the two numbers always agree, but the string a self-LCS walk prints need not be symmetric, which makes the identity a way to get the length and not a way to get the answer.",
    walkthrough:
      "s = bbbab, five cells wide, and only the upper triangle is meaningful. i = 4, the final b: dp[4][4] = 1. i = 3, the a: dp[3][3] = 1, then j = 4 compares a with b, a mismatch, so dp[3][4] = max(dp[4][4] = 1, dp[3][3] = 1) = 1. i = 2, the middle b: dp[2][2] = 1; j = 3 pairs b against a, a mismatch, max(dp[3][3] = 1, dp[2][2] = 1) = 1; j = 4 pairs b against b, and the inside of the window 2 to 4 is the single character at index 3, so it is 2 + dp[3][3] = 3. i = 1: dp[1][1] = 1, dp[1][2] = 2 for the adjacent pair bb, dp[1][3] = 2, dp[1][4] = 3. i = 0: dp[0][1] = 2, dp[0][2] = 3, dp[0][3] = max(dp[1][3] = 2, dp[0][2] = 3) = 3, and dp[0][4] = 2 + dp[1][3] = 2 + 2 = 4. Row 0 is therefore 1, 2, 3, 3, 4 and the answer is 4, witnessed by bbbb, which the interval walk prints. The same table on abcda has row 0 equal to 1, 1, 1, 1, 3, so the length is 3 with three witnesses - ada, aba and aca - and on character it is 5, printed as carac. Fill that table with i running upward instead and the same inputs report 2 for bbbab, 1 for cbbd, 2 for character and 1 for geeks, because every interval that wants a pair reads a row that has not been written. The reverse-LCS formulation returns 4, 3, 5 and 9 for bbbab, abcda, character and aacabdkacaa, matching the interval table every time; the strings are where the two part company, since on aaabacbab the length is 5 and enumerating the longest common subsequences of the string against its reverse gives eight of them, two of which are not palindromes at all.",
    commonMistake:
      "Iterating the left endpoint upward so the recurrence reads rows that have not been written, or reporting the string produced by matching the string against its own reverse.",
    whyWrong:
      "The upward sweep is quiet rather than loud: on bbbab it answers 2 where the interval table says 4, on cbbd it answers 1 against 2, on character 2 against 5 and on geeks 1 against 2, because dp[i + 1][j] is still zero and the max discards the pairs that would have used it; aab returns 2 either way, which is the input that convinces a candidate the order does not matter. The reverse-LCS string is the more expensive error because it looks like an answer. For aaabacbab the length is 5, and enumerating the longest common subsequences of the string against its reverse gives eight of them - aaaaa, aabaa, ababa, abcab, abcba, babab, bacab and bacba - of which abcab and bacba are not palindromes, so a solution that reconstructs from the self-LCS table can hand back an asymmetric string for a question about symmetry. The length survives the shortcut because the uncrossing argument is about counts; the witness does not, and only the interval walk pairs each emitted character with its mirror by construction.",
    followUps: [
      "Prove the matching case is optimal: why can a longest palindromic subsequence of an interval whose ends agree always be chosen to use both ends?",
      "Roll the table to one row. Which cell must be saved before it is overwritten, and what exactly is lost when the question asks for the string?",
      "Give a string whose self-LCS walk returns a non-palindrome and show that the length still agrees. What does that say about the uncrossing argument?",
      "Swap subsequence for substring here. Which recurrence changes, which cell do you read, and why does the answer stop being dp[0][n - 1]?",
    ],
    solution:
      'function lcsLength(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) {\n' +
      '    dp.push(new Array(b.length + 1).fill(0));\n' +
      '  }\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      dp[i][j] = a[i - 1] === b[j - 1]\n' +
      '        ? dp[i - 1][j - 1] + 1\n' +
      '        : Math.max(dp[i - 1][j], dp[i][j - 1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[a.length][b.length];\n' +
      '}\n' +
      '\n' +
      'function buildLpsTable(s) {\n' +
      '  const n = s.length;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i < n; i += 1) dp.push(new Array(n).fill(0));\n' +
      '  for (let i = n - 1; i >= 0; i -= 1) {\n' +
      '    dp[i][i] = 1;\n' +
      '    for (let j = i + 1; j < n; j += 1) {\n' +
      '      if (s[i] === s[j]) {\n' +
      '        dp[i][j] = 2 + (i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0);\n' +
      '      } else {\n' +
      '        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return dp;\n' +
      '}\n' +
      '\n' +
      'function lpsLength(s) {\n' +
      '  if (s.length === 0) return 0;\n' +
      '  return buildLpsTable(s)[0][s.length - 1];\n' +
      '}\n' +
      '\n' +
      'function lpsLengthWrongFillOrder(s) {\n' +
      '  const n = s.length;\n' +
      '  if (n === 0) return 0;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i < n; i += 1) dp.push(new Array(n).fill(0));\n' +
      '  for (let i = 0; i < n; i += 1) {\n' +
      '    dp[i][i] = 1;\n' +
      '    for (let j = i + 1; j < n; j += 1) {\n' +
      '      if (s[i] === s[j]) {\n' +
      '        dp[i][j] = 2 + (i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0);\n' +
      '      } else {\n' +
      '        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[0][n - 1];\n' +
      '}\n' +
      '\n' +
      'function lpsString(s) {\n' +
      '  const n = s.length;\n' +
      '  if (n === 0) return "";\n' +
      '  const dp = buildLpsTable(s);\n' +
      '  let i = 0;\n' +
      '  let j = n - 1;\n' +
      '  let front = "";\n' +
      '  let back = "";\n' +
      '  while (i < j) {\n' +
      '    if (s[i] === s[j]) {\n' +
      '      front += s[i];\n' +
      '      back = s[i] + back;\n' +
      '      i += 1;\n' +
      '      j -= 1;\n' +
      '    } else if (dp[i + 1][j] >= dp[i][j - 1]) {\n' +
      '      i += 1;\n' +
      '    } else {\n' +
      '      j -= 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return front + (i === j ? s[i] : "") + back;\n' +
      '}\n' +
      '\n' +
      'function lpsLengthViaSelfLcs(s) {\n' +
      '  return lcsLength(s, s.split("").reverse().join(""));\n' +
      '}\n' +
      '\n' +
      'function selfLcsStrings(s) {\n' +
      '  const reversed = s.split("").reverse().join("");\n' +
      '  const target = lcsLength(s, reversed);\n' +
      '  const found = new Set();\n' +
      '  for (let mask = 0; mask < (1 << s.length); mask += 1) {\n' +
      '    let candidate = "";\n' +
      '    for (let i = 0; i < s.length; i += 1) {\n' +
      '      if (mask & (1 << i)) candidate += s[i];\n' +
      '    }\n' +
      '    if (candidate.length !== target) continue;\n' +
      '    let idx = 0;\n' +
      '    for (let k = 0; k < reversed.length && idx < candidate.length; k += 1) {\n' +
      '      if (reversed[k] === candidate[idx]) idx += 1;\n' +
      '    }\n' +
      '    if (idx === candidate.length) found.add(candidate);\n' +
      '  }\n' +
      '  return Array.from(found).sort();\n' +
      '}',
    modify:
      "Ask for the longest palindromic substring instead of the subsequence. Which cell definition replaces the interval max, and why does the answer stop living at dp[0][n - 1]?",
  },
  {
    step: 16,
    name: 'Minimum insertions to make string palindrome',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Insert as few characters as possible, anywhere in the string, so that it reads the same in both directions, and say why the count is a complement rather than a simulation.",
    brief:
      "Input: a string. Output: the fewest single-character insertions that turn it into a palindrome, insertions allowed at any position. The constraint is that nothing forces you to touch the characters you keep, so the real question is which largest set of characters stays where it is, and that set has to read the same both ways.",
    concepts: [
      'dsa-dp16b-palindrome-is-self-lcs-by-length-only',
      'dsa-removals-complement-the-kept-set',
      'dsa-dp16b-operator-decides-which-dp-it-is',
      'dsa-dp16b-reconstruction-forfeits-the-rolling-array',
    ],
    shortAnswer:
      "The characters you never insert around are still a subsequence and still read the same both ways, so there are at most one longest palindromic subsequence of them: the answer is n minus the LPS length, in O(n^2) time, and mirroring every discarded character achieves it.",
    idealAnswer:
      "This row has no new recurrence, and saying so is the answer. Take any insertion script of k steps that produces a palindrome p from s. Read p left to right and mark the characters that were already in s: the unmarked ones were inserted, they come in mirrored pairs, and removing a matched pair from a palindrome leaves a palindrome, so the marked characters themselves form a palindrome. They are a subsequence of s, so there are at most LPS(s) of them and k is at least n minus LPS(s). The other direction is a construction rather than an argument: keep one longest palindromic subsequence and insert a copy of every other character on the opposite side, at the mirror of the position it is skipped from, which yields a palindrome of exactly n plus (n - LPS) characters with s inside it as a subsequence. The two bounds meet, so the count is the complement of the kept set and the engine is the same interval table as the previous row - this row is one subtraction away from the LPS, which is exactly why it should not have its own recurrence. Deletions are priced identically, for the same reason in the other direction: removing the characters outside a longest palindromic subsequence costs the same n - LPS, so insertions and deletions agree here. That agreement is a property of the move set and not of palindromes: once a replace is legal and costs one, a mismatch can be fixed for less than a delete plus an insert and the two counts split, which is the conversion row. Building the result rather than counting it needs the full table, not the rolling row, because the walk has to know which side of each mismatched pair is the one being dropped and mirrored - the same forfeit the printed-subsequence row pays.",
    walkthrough:
      "s = abcda, length 5. Its interval table has row 0 equal to 1, 1, 1, 1, 3, so the longest palindromic subsequence is 3 - ada, aba and aca all work - and the answer is 5 - 3 = 2. Walk it with i at 0 and j at 4: both ends are a, so they are kept and the pointers close to 1 and 3. Now b against d disagree with dp[2][3] = 1 and dp[1][2] = 1, a tie, and the tie-break that advances the left pointer drops b and mirrors it onto the far side; then c against d disagree with dp[3][3] = 1 and dp[2][2] = 1, a tie again, so c is dropped and mirrored too; the pointers meet on d, which is the middle. Kept ends, the two mirrors and the middle give abcdcba: 7 characters, a palindrome, with abcda inside it as a subsequence, which is the certificate that 2 is achievable rather than merely a lower bound. geeks: the LPS is ee at length 2, so 3 insertions, and the same walk mirrors three characters into gskeeksg, 8 characters. ab: LPS 1, so 1 insertion, giving aba. bbbab: LPS 4, so 1 insertion, giving babbab. aabbcc: LPS 2, the pair cc, so 4 insertions and aabbccbbaa. Already-symmetric inputs cost nothing: gfg has LPS 3 and answer 0, a has LPS 1 and answer 0, and the empty string is 0. Now the sweep that counts disagreeing end pairs instead: abcda has one such pair, b against d, against a true answer of 2; geeks has two against a true 3; aabbcc has two against a true 4; and eccbc has two against a true 2, which is the input that survives a self-test.",
    commonMistake:
      "Counting the disagreeing pairs a two-pointer sweep finds from the two ends, or assuming insertions and deletions must cost different amounts because they are different moves.",
    whyWrong:
      "The pair count is not the answer. abcda has exactly one disagreeing pair, b against d, and needs two insertions: the cheapest palindrome keeps a, d and a and mirrors both b and c, so the pair the sweep sees is only half of the work. geeks has two disagreeing pairs against a true 3, and aabbcc has two - the two a against c pairs, while b faces b - against a true 4, because the kept set is only the pair cc and every other character needs a mirror. eccbc returns 2 from both methods and character returns 4 from both, so a candidate can validate the shortcut on two inputs and still be wrong on the third. The second error is modelling rather than arithmetic: here both quantities equal n minus the LPS, so insertions and deletions agree, and the reason is that either move set leaves the same untouched kept set. Allow a replacement and the equality breaks immediately - heap against peat is 2 with a priced replace and 4 without one - so a solution that argues the two are always the same has mistaken a coincidence of the move set for a theorem.",
    followUps: [
      "Only insertions at the two ends are legal. What does the answer become for abcda, and which state replaces the interval?",
      "Each inserted character costs its own price from a map. Why does the complement argument stop being enough, and what does the recurrence add?",
      "Report the lexicographically smallest cheapest palindrome. Which tie in the walk becomes load-bearing, and what does resolving it cost?",
      "Prove insertions and deletions always agree here, then give the one-line input where allowing a replace breaks the equality.",
    ],
    solution:
      'function buildLpsTable(s) {\n' +
      '  const n = s.length;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i < n; i += 1) dp.push(new Array(n).fill(0));\n' +
      '  for (let i = n - 1; i >= 0; i -= 1) {\n' +
      '    dp[i][i] = 1;\n' +
      '    for (let j = i + 1; j < n; j += 1) {\n' +
      '      if (s[i] === s[j]) {\n' +
      '        dp[i][j] = 2 + (i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0);\n' +
      '      } else {\n' +
      '        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return dp;\n' +
      '}\n' +
      '\n' +
      'function lpsLength(s) {\n' +
      '  if (s.length === 0) return 0;\n' +
      '  return buildLpsTable(s)[0][s.length - 1];\n' +
      '}\n' +
      '\n' +
      'function minInsertionsToPalindrome(s) {\n' +
      '  return s.length - lpsLength(s);\n' +
      '}\n' +
      '\n' +
      'function minDeletionsToPalindrome(s) {\n' +
      '  return s.length - lpsLength(s);\n' +
      '}\n' +
      '\n' +
      'function buildPalindromeWithInsertions(s) {\n' +
      '  const n = s.length;\n' +
      '  if (n === 0) return "";\n' +
      '  const dp = buildLpsTable(s);\n' +
      '  let i = 0;\n' +
      '  let j = n - 1;\n' +
      '  const left = [];\n' +
      '  const right = [];\n' +
      '  while (i < j) {\n' +
      '    if (s[i] === s[j]) {\n' +
      '      left.push(s[i]);\n' +
      '      right.push(s[j]);\n' +
      '      i += 1;\n' +
      '      j -= 1;\n' +
      '    } else if (dp[i + 1][j] >= dp[i][j - 1]) {\n' +
      '      left.push(s[i]);\n' +
      '      right.push(s[i]);\n' +
      '      i += 1;\n' +
      '    } else {\n' +
      '      left.push(s[j]);\n' +
      '      right.push(s[j]);\n' +
      '      j -= 1;\n' +
      '    }\n' +
      '  }\n' +
      '  const middle = i === j ? s[i] : "";\n' +
      '  return left.join("") + middle + right.reverse().join("");\n' +
      '}\n' +
      '\n' +
      'function insertionsByMismatchedEndPairs(s) {\n' +
      '  let count = 0;\n' +
      '  let i = 0;\n' +
      '  let j = s.length - 1;\n' +
      '  while (i < j) {\n' +
      '    if (s[i] !== s[j]) count += 1;\n' +
      '    i += 1;\n' +
      '    j -= 1;\n' +
      '  }\n' +
      '  return count;\n' +
      '}\n' +
      '\n' +
      'function isSubsequence(part, whole) {\n' +
      '  let idx = 0;\n' +
      '  for (let k = 0; k < whole.length && idx < part.length; k += 1) {\n' +
      '    if (whole[k] === part[idx]) idx += 1;\n' +
      '  }\n' +
      '  return idx === part.length;\n' +
      '}',
    modify:
      "Insertions may now go only at the front or the back, never in the middle. Which half of the complement argument survives, and what does the answer become for abcda?",
  },
  {
    step: 16,
    name: 'Minimum Insertions/Deletions to Convert String A to String B',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Turn the first string into the second using only insertions and deletions, and say what a disagreeing pair costs when a replace is not on the menu.",
    brief:
      "Input: two strings. Output: the fewest single-character insertions and deletions that transform the first into the second. The constraint is the move set: with no replacement, a character can survive the conversion only if both strings already share it in the same relative order.",
    concepts: [
      'dsa-dp16b-replacement-is-two-steps-when-not-priced',
      'dsa-dp16b-two-prefix-table-diagonal-encodes-a-match',
      'dsa-removals-complement-the-kept-set',
      'dsa-dp16b-operator-decides-which-dp-it-is',
    ],
    shortAnswer:
      "Keep a longest common subsequence of length l, delete the other n - l characters of a and insert the other m - l characters of b, for n + m - 2l steps. The LCS table is O(n * m) time and space and the rest is arithmetic.",
    idealAnswer:
      "Mark the characters of the original that are still present at the end of a conversion. Deletions only remove and insertions only add, so the marked characters appear in the final string untouched and in their original order, and since that final string is b they form a common subsequence: at most l survive, so at least n - l deletions are owed. The target has m characters and l of them are supplied by the survivors, so at least m - l insertions are owed, and the two lower bounds add to n + m - 2l. The matching strategy is one longest common subsequence itself: delete everything outside it, then insert the characters b wants at the positions b wants them, which costs exactly that. So the row is a subtraction on the subsequence table, and the interview value is in stating the reduction rather than inventing a recurrence - the answer is the size of the symmetric difference of two prefix-ordered sets, and the kept set is what the DP is really buying. What the question actually tests is whether the price list is being read. Levenshtein allows a replace at cost one, and a replace settles a mismatch for half the work: heap against peat is 4 here - delete h and p, insert p and t - against 2 when h to p and p to t are priced as replaces; ABCD against ACF is 3 against 2; abc against def is 6 against 3, exactly twice as many whenever every character is swapped. The two figures coincide when the shared characters do the work - ABCBDAB against BDCABA is 5 either way, because l is 4 - so knowing which regime an input sits in is the sentence n + m - 2l is for. The function is symmetric in its arguments despite the asymmetric wording, and the boundaries follow from the same formula rather than from special cases: an empty first string costs m, an empty second costs n, equal strings cost nothing and disjoint alphabets cost n + m.",
    walkthrough:
      "a = heap, b = peat. Rows are the prefixes of heap and columns the prefixes of peat: the h row is 0,0,0,0,0; the e row 0,0,1,1,1; the a row 0,0,1,2,2; the p row 0,1,1,2,2. The corner is 2, witnessed by ea; the 1 at row 4, column 1 is the alternative survivor p, which the max discards because ea is longer. With l = 2 the answer is (4 - 2) + (4 - 2) = 4: delete h and p, leaving ea, then insert p in front of it and t after it. Subtracting the LCS only once gives 4 + 4 - 2 = 6 and charges the survivors for work they do not need; the difference in lengths gives 0, which is absurd for two different strings; and Levenshtein reports 2 by replacing h with p and p with t, a move this row does not own. Second input, ABCD against ACF: the corner is 2 for the shared AC, so the answer is (4 - 2) + (3 - 2) = 3 - delete B and D, insert F - against 2 for a priced replace and 5 for the single-subtraction error. Empty sides behave: converting the empty string to abc is 3, since l = 0 and the a-side term vanishes; abc to the empty string is 3; abc against abc is 0 with l = 3; abc against acb is 2 with l = 2, one deletion and one insertion; and abc against def is 6 with l = 0. And the previous row is a special case: abcda against its own reverse adcba has corner 3, which is exactly its longest palindromic subsequence, so the conversion costs 2 + 2 = 4, which is twice the 2 insertions that row needs - the same kept set, charged once for the characters it discards from each side.",
    commonMistake:
      "Reporting the edit distance with replacements, or subtracting the LCS length once from the combined length instead of once per string.",
    whyWrong:
      "The priced-replace figure is systematically smaller and answers a different contract: heap against peat returns 2 from a Levenshtein table and 4 from this one, because replacing h by p is not a legal move when only insertions and deletions are on the list; ABCD against ACF returns 2 against 3, and abc against def returns 3 against 6, exactly half whenever every character is swapped rather than skipped. ABCBDAB against BDCABA is 5 by both measures, so a candidate who tests only that input concludes the algorithms agree. The single-subtraction variant is arithmetic rather than conceptual: it reports 6 for heap against peat against a true 4, and 5 for ABCD against ACF against a true 3, because the l kept characters appear in both strings and are already accounted for in each of the two terms - the expression subtracts 2l, not l. A third collapse, reporting the absolute difference of the lengths, answers 0 for heap against peat and 1 for ABCD against ACF, and is wrong whenever a shared character has to move.",
    followUps: [
      "Add a replacement priced at one and restate the recurrence. Why does the LCS-only bound stop holding, and what does the third neighbour of each cell become?",
      "The two strings share no characters at all. Give the answer without building the table, then give the input where the table is unavoidable.",
      "Report the actual script of deletions and insertions in order. Which table must be retained, and how does the walk differ from printing the LCS?",
      "Only deletions from a are allowed. State the condition on b for a conversion to exist at all, and the cost for heap against ea under that restriction.",
    ],
    solution:
      'function lcsLength(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) {\n' +
      '    dp.push(new Array(b.length + 1).fill(0));\n' +
      '  }\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      dp[i][j] = a[i - 1] === b[j - 1]\n' +
      '        ? dp[i - 1][j - 1] + 1\n' +
      '        : Math.max(dp[i - 1][j], dp[i][j - 1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[a.length][b.length];\n' +
      '}\n' +
      '\n' +
      'function minStepsToConvert(a, b) {\n' +
      '  const shared = lcsLength(a, b);\n' +
      '  return (a.length - shared) + (b.length - shared);\n' +
      '}\n' +
      '\n' +
      'function minStepsSubtractingLcsOnce(a, b) {\n' +
      '  return a.length + b.length - lcsLength(a, b);\n' +
      '}\n' +
      '\n' +
      'function levenshteinDistance(a, b) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= a.length; i += 1) {\n' +
      '    dp.push(new Array(b.length + 1).fill(0));\n' +
      '    dp[i][0] = i;\n' +
      '  }\n' +
      '  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;\n' +
      '  for (let i = 1; i <= a.length; i += 1) {\n' +
      '    for (let j = 1; j <= b.length; j += 1) {\n' +
      '      if (a[i - 1] === b[j - 1]) {\n' +
      '        dp[i][j] = dp[i - 1][j - 1];\n' +
      '      } else {\n' +
      '        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[a.length][b.length];\n' +
      '}',
    modify:
      "Allow a replacement at cost one but forbid inserting a character that already occurs in the string. Which of the three neighbours changes value, and what does the answer become for heap against peat?",
  },
];

export const expects: Record<string, string> = {
  'Partition Set Into 2 Subsets With Min Absolute Sum Diff':
    '(() => { const a = minSubsetDiff([1,5,11,5]); const b = minSubsetDiff([1,2,3,6]); const c = minSubsetDiff([1,2,5]); return a === 0 && b === 0 && c === 2 && minSubsetDiff([1,2,3,4,5]) === 1 && minSubsetDiff([100,100,100,100,100]) === 100 && minSubsetDiff([7]) === 7 && minSubsetDiff([]) === 0 && minEqualSizeSubsetDiff([1,2,3,6]) === 2 && minEqualSizeSubsetDiff([1,2,3,4,5,6]) === 1 && minEqualSizeSubsetDiff([4,1,2,3,6,10]) === 0 && minSubsetDiffBitmask([1,2,3,6]) === 0 && minSubsetDiffBitmask([10,20,30,40,50]) === 10 && minSubsetDiffBitmask([1,2,5]) === 2; })()',
  'Count Subsets with Sum K':
    '(() => { const a = countSubsetsWithSum([1,2,2,3], 5); const b = countSubsetsWithSum([1,1,1,1], 2); return a === 3 && b === 6 && countSubsetsWithSum2d([1,2,2,3], 5) === 3 && countSubsetsWithSum([1,2,2,3], 0) === 1 && countSubsetsWithSum([0], 0) === 2 && countSubsetsWithSum([2,0,0,3], 2) === 4 && countSubsetsWithSum([0,0,0,3], 3) === 8 && countSubsetsWithSum([1,2,2,3], 11) === 0 && countSubsetsWithSum([5], 15) === 0 && countSubsetsForwardSweepReusesItems([1,2,2,3], 5) === 9 && countSubsetsForwardSweepReusesItems([1,2,2,3], 5) > countSubsetsWithSum([1,2,2,3], 5); })()',
  'Count Partitions with Given Difference':
    '(() => { const a = countPartitionsWithDiff([1,1,2,3], 1); const side = partitionTargetFor(7, 1); return a === 3 && side === 4 && countPartitionsWithDiff([1,1,2,3], 3) === 2 && countPartitionsWithDiff([1,2,2,3], 1) === 0 && countPartitionsWithDiff([1,1,1,1], 2) === 4 && countPartitionsWithDiff([1,2,3], 6) === 1 && countPartitionsWithDiff([1,2,3], 7) === 0 && countPartitionsWithDiff([1,1,2,3], 10) === 0 && countPartitionsBrute([1,1,2,3], 1) === 3 && countPartitionsBrute([1,1,2,3], 3) === 2 && partitionTargetFor(8, 1) === -1; })()',
  '0/1 Knapsack':
    '(() => { const v = [60,100,120]; const w = [10,20,30]; const a = knapsack01(v, w, 50); const picked = knapsack01Picked(v, w, 50); return a === 220 && knapsack01Table(v, w, 50) === 220 && picked.join(",") === "1,2" && knapsack01(v, w, 100) === 280 && knapsack01Picked(v, w, 100).join(",") === "0,1,2" && knapsack01([10,40,30,50],[5,4,6,3],10) === 90 && knapsack01Picked([10,40,30,50],[5,4,6,3],10).join(",") === "1,3" && knapsack01([10],[5],10) === 10 && knapsack01ForwardReusesItems([10],[5],10) === 20 && knapsack01ForwardReusesItems(v, w, 50) === 300 && knapsack01([10],[15],10) === 0 && knapsack01(v, w, 0) === 0 && knapsack01([10,10],[5,5],5) === 10; })()',
  'Coin Change':
    '(() => { const a = coinChange([1,2,5], 11); const outer = coinChangeCoinOuter([1,2,5], 11); return a === 3 && outer === 3 && coinChange([1,3,4], 6) === 2 && coinChangeCoinOuter([1,3,4], 6) === 2 && coinChangeGreedy([1,3,4], 6) === 3 && coinChange([186,419,83,408], 6249) === 20 && coinChangeGreedy([186,419,83,408], 6249) === -1 && coinChange([2,5,10,1], 27) === 4 && coinChange([3,5], 4) === -1 && coinChangePenniesAssumption([3,5], 4) === 2 && coinChange([1,2,5], 0) === 0 && coinChange([], 5) === -1 && coinChange([5,10,20,50,100,200,500,1000], 163) === -1; })()',
  'Target Sum':
    '(() => { const a = targetSumWays([1,1,1,1,1], 3); const side = targetSubsetSumIndex(5, 3); return a === 5 && side === 4 && targetSumWays([1,1,1,1,1], -3) === 5 && targetSumWays([1,1,1,1,1], 2) === 0 && targetSumWays([1,1,1,1], 0) === 6 && targetSumWays([0,0,0,1], 1) === 8 && targetSumBrute([1,1,1,1,1], 3) === 5 && targetSumBrute([1,1,1,1,1], 2) === 0 && targetSumBrute([0,0,0,1], 1) === 8 && targetSumWays([10,20,30,40,50], 10) === 3 && targetSumWays([1,2,3], 7) === 0 && targetSumWays([1], 1) === 1 && targetSubsetSumIndex(7, 2) === -1; })()',
  'Coin Change 2':
    '(() => { const combos = coinChangeCombinations([1,2,5], 5); const perms = coinChangePermutations([1,2,5], 5); const once = coinChangeEachCoinAtMostOnce([1,2,5], 5); return combos === 4 && perms === 9 && once === 1 && combos < perms && once < combos && coinChangeCombinations([1,2,5], 0) === 1 && coinChangeCombinations([], 0) === 1 && coinChangeCombinations([2], 5) === 0 && coinChangeCombinations([2], 3) === 0 && coinChangeCombinations([2], 4) === 1 && coinChangeEachCoinAtMostOnce([2], 3) === 0 && coinChangeCombinations([1,2,3], 4) === 4 && coinChangePermutations([1,2,3], 4) === 7 && coinChangeCombinations([2,5,3,7,8,1,9], 12) === 42 && coinChangePermutations([2,5,3,7,8,1,9], 12) === 1276 && coinChangeCombinations([1,2,5], 11) === 11 && coinChangeCombinations([1,2,5], 100) === 541 && coinChangeCombinations([0,1,2], 2) === 4; })()',
  'Unbounded Knapsack':
    '(() => { const v = [10,30,20]; const w = [5,10,15]; const a = unboundedKnapsack(v, w, 30); return a === 90 && unboundedKnapsackMemo(v, w, 30) === 90 && unboundedKnapsackDownwardSweep(v, w, 30) === 60 && a > 60 && unboundedKnapsack([5,6,8],[3,4,5],10) === 16 && unboundedGreedyByRatio([5,6,8],[3,4,5],10) === 15 && unboundedKnapsack([10],[5],10) === 20 && unboundedKnapsackDownwardSweep([10],[5],10) === 10 && unboundedGreedyByRatio([10],[5],10) === 20 && unboundedKnapsack([6,10,12],[1,2,3],5) === 30 && unboundedKnapsackMemo([6,10,12],[1,2,3],5) === 30 && unboundedKnapsackDownwardSweep([6,10,12],[1,2,3],5) === 22 && unboundedKnapsack([60,100],[10,20],50) === 300 && unboundedGreedyByRatio(v, w, 30) === 90 && unboundedKnapsack(v, w, 0) === 0 && unboundedKnapsack([10],[15],10) === 0 && unboundedKnapsack([5],[9],7) === 0; })()',
  'Rod Cutting Problem':
    '(() => { return rodRevenue([1,5,8,9,10,17,17,20]) === 22 && rodRevenueMemo([1,5,8,9,10,17,17,20]) === 22 && rodCutPieces([1,5,8,9,10,17,17,20]).join(",") === "2,6" && rodRevenue([3,5,6]) === 9 && rodCutPieces([3,5,6]).join(",") === "1,1,1" && rodRevenueTwoCutsOnly([3,5,6]) === 8 && rodRevenue([3,5,6]) > rodRevenueTwoCutsOnly([3,5,6]) && rodRevenue([2,5,7,8]) === 10 && rodCutPieces([2,5,7,8]).join(",") === "2,2" && rodRevenue([5,8,10]) === 15 && rodRevenueTwoCutsOnly([5,8,10]) === 13 && rodRevenue([10,40,50,70]) === 80 && rodCutPieces([10,40,50,70]).join(",") === "2,2" && rodRevenue([1,5,8,9]) === 10 && rodRevenue([7]) === 7 && rodRevenue([1]) === 1 && rodRevenue([]) === 0 && rodRevenueMemo([1]) === 1 && rodRevenueMemo([3,5,6]) === 9; })()',
  'Longest Common Subsequence':
    '(() => { return lcsLength("ABCBDAB","BDCABA") === 4 && lcsLength("AGGTAB","GXTXAYB") === 4 && lcsLength("ABCDGH","AEDFHR") === 3 && lcsLength("abc","acb") === 2 && lcsLength("a","a") === 1 && lcsLength("","abc") === 0 && lcsLength("abc","") === 0 && lcsLength("abc","def") === 0 && lcsLength("abc","abc") === 3 && lcsLength("abcde","ace") === 3 && lcsLength("heap","peat") === 2 && lcsLength("aaa","aa") === 2 && lcsLength("GeeksforGeeks","GeeksQuiz") === 5 && lcsLength("BDCABA","ABCBDAB") === lcsLength("ABCBDAB","BDCABA") && lcsLengthRolling("ABCBDAB","BDCABA") === 4 && lcsLengthRolling("AGGTAB","GXTXAYB") === 4 && lcsLengthRolling("ABCDGH","AEDFHR") === 3 && lcsLengthRolling("abc","acb") === 2 && lcsLengthWithThreeWayMax("ABCBDAB","BDCABA") === 6 && lcsLengthWithThreeWayMax("abc","acb") === 3 && lcsLengthWithThreeWayMax("ABCBDAB","BDCABA") > lcsLength("ABCBDAB","BDCABA") && lcsLengthByPointerAlignment("ABCBDAB","BDCABA") === 2 && lcsLengthByPointerAlignment("AGGTAB","GXTXAYB") === 1 && lcsLengthByPointerAlignment("abc","abc") === 3; })()',
  'Print Longest Common Subsequence':
    '(() => { const one = printLcs("AGGTAB","GXTXAYB"); const two = printLcs("ABCBDAB","BDCABA"); const loose = printLcsWithoutDiagonalStep("aaa","a"); return one === "GTAB" && isSubsequence(one,"AGGTAB") && isSubsequence(one,"GXTXAYB") && one.length === lcsLengthRolling("AGGTAB","GXTXAYB") && two === "BCBA" && isSubsequence(two,"ABCBDAB") && isSubsequence(two,"BDCABA") && two.length === lcsLengthRolling("ABCBDAB","BDCABA") && lcsEmittedBackward("AGGTAB","GXTXAYB") === "BATG" && printLcs("abc","acb") === "ab" && printLcs("abcde","ace") === "ace" && printLcs("abc","abc") === "abc" && printLcs("abc","def") === "" && printLcs("","abc") === "" && printLcsWithoutDiagonalStep("ABCBDAB","BDCABA") === "ABBA" && !isSubsequence("ABBA","BDCABA") && loose === "aaa" && loose.length > lcsLengthRolling("aaa","a") && !isSubsequence(loose,"a") && lcsByGreedyScan("ABCBDAB","BDCABA") === "ABA" && lcsByGreedyScan("AGGTAB","GXTXAYB") === "AB" && buildLcsTable("AGGTAB","GXTXAYB")[6].join(",") === "0,1,1,2,2,3,3,4"; })()',
  'Longest Common Substring':
    '(() => { const a = longestCommonSubstringLength("GeeksforGeeks","GeeksQuiz"); const block = longestCommonSubstring("GeeksforGeeks","GeeksQuiz"); return a === 5 && block === "Geeks" && longestCommonSubstringLength("abcde","zbcdx") === 3 && longestCommonSubstring("abcde","zbcdx") === "bcd" && longestCommonSubstringLength("ABCBDAB","BDCABA") === 2 && longestCommonSubstring("ABCBDAB","BDCABA") === "AB" && longestCommonSubstringWithoutReset("ABCBDAB","BDCABA") === 2 && lcsLength("ABCBDAB","BDCABA") === 4 && longestCommonSubstringFromCorner("GeeksforGeeks","GeeksQuiz") === 0 && longestCommonSubstringFromCorner("abcde","zbcdx") === 0 && longestCommonSubstringFromCorner("aaa","aa") === 2 && longestCommonSubstringLength("aaa","aa") === 2 && longestCommonSubstring("aaa","aa") === "aa" && longestCommonSubstringWithoutReset("abcd","abxd") === 3 && longestCommonSubstringLength("abcd","abxd") === 2 && longestCommonSubstring("abc","abc") === "abc" && longestCommonSubstring("banana","ananask") === "anana" && longestCommonSubstringLength("","abc") === 0 && longestCommonSubstringLength("abc","") === 0 && longestCommonSubstringLength("abc","xyz") === 0; })()',
  'Longest Palindromic Subsequence':
    '(() => { const a = lpsLength("bbbab"); const witness = lpsString("bbbab"); const set = selfLcsStrings("aaabacbab"); return a === 4 && witness === "bbbb" && witness === witness.split("").reverse().join("") && lpsLength("cbbd") === 2 && lpsLength("character") === 5 && lpsString("character") === "carac" && lpsLength("abcda") === 3 && lpsString("abcda") === "ada" && lpsLength("aacabdkacaa") === 9 && lpsLength("geeks") === 2 && lpsLength("aab") === 2 && lpsLength("aa") === 2 && lpsLength("a") === 1 && lpsLength("") === 0 && lpsString("a") === "a" && lpsString("") === "" && buildLpsTable("bbbab")[0].join(",") === "1,2,3,3,4" && buildLpsTable("abcda")[0].join(",") === "1,1,1,1,3" && lpsLengthViaSelfLcs("bbbab") === 4 && lpsLengthViaSelfLcs("abcda") === 3 && lpsLengthViaSelfLcs("character") === 5 && lpsLengthViaSelfLcs("aacabdkacaa") === 9 && lpsLengthViaSelfLcs("aaabacbab") === lpsLength("aaabacbab") && lpsLengthWrongFillOrder("bbbab") === 2 && lpsLengthWrongFillOrder("cbbd") === 1 && lpsLengthWrongFillOrder("character") === 2 && lpsLengthWrongFillOrder("geeks") === 1 && lpsLengthWrongFillOrder("aab") === 2 && set.length === 8 && set.join(" ") === "aaaaa aabaa ababa abcab abcba babab bacab bacba" && set.includes("abcab") && set.filter((x) => x !== x.split("").reverse().join("")).length === 2 && lpsLength("aaabacbab") === 5; })()',
  'Minimum insertions to make string palindrome':
    '(() => { const a = minInsertionsToPalindrome("abcda"); const built = buildPalindromeWithInsertions("abcda"); return a === 2 && built === "abcdcba" && built.length === 7 && isSubsequence("abcda", built) && built === built.split("").reverse().join("") && minInsertionsToPalindrome("geeks") === 3 && buildPalindromeWithInsertions("geeks") === "gskeeksg" && minInsertionsToPalindrome("ab") === 1 && buildPalindromeWithInsertions("ab") === "aba" && minInsertionsToPalindrome("bbbab") === 1 && buildPalindromeWithInsertions("bbbab") === "babbab" && minInsertionsToPalindrome("aabbcc") === 4 && buildPalindromeWithInsertions("aabbcc") === "aabbccbbaa" && isSubsequence("aabbcc", buildPalindromeWithInsertions("aabbcc")) && buildPalindromeWithInsertions("").length === 0 && minInsertionsToPalindrome("gfg") === 0 && minInsertionsToPalindrome("a") === 0 && minInsertionsToPalindrome("") === 0 && minInsertionsToPalindrome("eccbc") === 2 && minDeletionsToPalindrome("abcda") === a && minDeletionsToPalindrome("geeks") === minInsertionsToPalindrome("geeks") && minDeletionsToPalindrome("aabbcc") === 4 && minDeletionsToPalindrome("") === 0 && minDeletionsToPalindrome("character") === 4 && insertionsByMismatchedEndPairs("abcda") === 1 && insertionsByMismatchedEndPairs("abcda") < a && insertionsByMismatchedEndPairs("geeks") === 2 && insertionsByMismatchedEndPairs("aabbcc") === 2 && insertionsByMismatchedEndPairs("eccbc") === 2 && insertionsByMismatchedEndPairs("character") === 4; })()',
  'Minimum Insertions/Deletions to Convert String A to String B':
    '(() => { const a = minStepsToConvert("heap","peat"); return a === 4 && lcsLength("heap","peat") === 2 && levenshteinDistance("heap","peat") === 2 && minStepsSubtractingLcsOnce("heap","peat") === 6 && minStepsToConvert("ABCD","ACF") === 3 && levenshteinDistance("ABCD","ACF") === 2 && minStepsSubtractingLcsOnce("ABCD","ACF") === 5 && minStepsToConvert("ACF","ABCD") === 3 && minStepsToConvert("peat","heap") === a && minStepsToConvert("geeks","geskef") === 5 && levenshteinDistance("geeks","geskef") === 3 && minStepsToConvert("","abc") === 3 && minStepsToConvert("abc","") === 3 && minStepsToConvert("abc","abc") === 0 && minStepsToConvert("abc","def") === 6 && levenshteinDistance("abc","def") === 3 && minStepsToConvert("abc","acb") === 2 && minStepsToConvert("ABCBDAB","BDCABA") === 5 && levenshteinDistance("ABCBDAB","BDCABA") === 5 && minStepsToConvert("abcda","adcba") === 4 && lcsLength("abcda","adcba") === 3; })()',
};
