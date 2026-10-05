import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';

/**
 * Step 16a — the opening run of the dynamic-programming step: the fifteen rows that trade an
 * exponential re-walk for a table. Everything here is the same three moves — define the state,
 * write the recurrence over a smaller state, decide whether to fill it top-down with a memo or
 * bottom-up with loops — and then the bookkeeping that turns a table into an answer: rolling the
 * last two rows down to two variables, cutting a ring into two linear passes, widening a 2-D grid
 * to a 3-D "two robots, same step" state, and reading a partition off a subset-sum table.
 */

export const concepts: Record<string, ConceptSpec> = {
  'dsa-dp16a-overlapping-subproblems-memo-tab': {
    slug: 'dsa-dp16a-overlapping-subproblems-memo-tab',
    name: 'DP is a recursion that met itself, memoised top-down or filled bottom-up',
    detail:
      'A naive recursion recomputes the same state exponentially because its calls overlap; a memo caches each state once, and a tabulation instead fills the same states in dependency order — equal cost, different shape.',
    terms: ['overlapping subproblems', 'top-down memo', 'bottom-up tabulation', 'optimal substructure', 'state cache'],
    weight: 5,
  },
  'dsa-dp16a-rolling-two-state-1d': {
    slug: 'dsa-dp16a-rolling-two-state-1d',
    name: 'A 1-D recurrence that only reads its neighbours collapses to two variables',
    detail:
      'When state i depends just on i-1 and i-2, the whole table is dead weight: two rolling scalars — or three for a window of neighbours — reproduce it in O(1) memory.',
    terms: ['rolling variables', 'space optimisation', 'previous two states', 'O(1) space', 'drop the array'],
    weight: 4,
  },
  'dsa-dp16a-frog-k-neighbourhood-relaxation': {
    slug: 'dsa-dp16a-frog-k-neighbourhood-relaxation',
    name: 'Jump up to k distances and the state gains an inner min over the last k cells',
    detail:
      'A fixed-step recurrence is a min (or max) taken over a sliding window of the previous k entries, so the base two-jump case generalises by adding one loop, trading constant work per cell for k.',
    terms: ['k-window min', 'inner relaxation loop', 'bounded jump', 'window of states', 'cost per transition'],
    weight: 4,
  },
  'dsa-dp16a-take-skip-non-adjacent': {
    slug: 'dsa-dp16a-take-skip-non-adjacent',
    name: 'Non-adjacent selection is a per-item take or skip, never take-then-take',
    detail:
      'dp[i] = max(dp[i-1], dp[i-2] + value[i]) encodes "either skip i and keep the best before it, or take i and add it to the best two back" — the skip branch is what forbids two neighbours.',
    terms: ['take or skip', 'no two adjacent', 'include exclude max', 'skip branch', 'house robber recurrence'],
    weight: 4,
  },
  'dsa-dp16a-ring-cuts-to-two-linear-passes': {
    slug: 'dsa-dp16a-ring-cuts-to-two-linear-passes',
    name: 'A ring of dependencies becomes two linear passes, one dropping each end',
    detail:
      'Once the first and last items are adjacent, one of them can never be taken, so solve the chain that excludes the last and the chain that excludes the first and return the better — the only safe way to break a cycle in DP.',
    terms: ['circular constraint', 'exclude first or last', 'two linear passes', 'break the ring', 'house robber ii'],
    weight: 5,
  },
  'dsa-dp16a-previous-choice-state-dimension': {
    slug: 'dsa-dp16a-previous-choice-state-dimension',
    name: 'A "cannot repeat the last choice" rule adds the last choice to the state',
    detail:
      'When today depends on which option yesterday took, the day alone under-specifies the state; carrying the previous choice as a second dimension turns the whole row into a tiny table over the allowed transitions.',
    terms: ['last choice dimension', 'adjacent-day constraint', 'state carries history', '3 options row', 'dp[day][last]'],
    weight: 4,
  },
  'dsa-dp16a-count-paths-overflow-or-modulo': {
    slug: 'dsa-dp16a-count-paths-overflow-or-modulo',
    name: 'A counting DP grows combinatorially and its sum overflows before O(n) memory does',
    detail:
      'Grid path counts are central binomials C(m+n-2, m-1); the recurrence only adds, so the numbers cross 2^53 fast — the honest fixes are BigInt or a running modulo, never a float that silently rounds.',
    terms: ['combinatorial growth', 'integer overflow', 'BigInt', 'modulo arithmetic', 'counting vs deciding'],
    weight: 4,
  },
  'dsa-dp16a-two-robots-same-step-3d': {
    slug: 'dsa-dp16a-two-robots-same-step-3d',
    name: 'Two walkers descending in lockstep need a 3-D state: the row plus both columns',
    detail:
      'Because both advance one row per move their row is shared, so the state is (row, colA, colB); when the two columns coincide the cell is collected once, which is the only term the sum must special-case.',
    terms: ['3-D dp', 'same step row', 'two column axes', 'double count guard', 'cherry pickup'],
    weight: 5,
  },
  'dsa-dp16a-subset-sum-pseudo-polynomial': {
    slug: 'dsa-dp16a-subset-sum-pseudo-polynomial',
    name: 'Subset-sum DP is polynomial in the target, not the item count — a number is a dimension',
    detail:
      'The table is O(n * target), so its cost scales with the magnitude of the requested sum rather than how many items you have; that is why a 10^9 target with 30 items is hopeless and why the problem is not truly polynomial.',
    terms: ['pseudo-polynomial', 'target as a dimension', 'np-complete', 'capacity states', 'sum magnitude blowup'],
    weight: 5,
  },
  'dsa-dp16a-rolling-target-reverse-for-0-1': {
    slug: 'dsa-dp16a-rolling-target-reverse-for-0-1',
    name: 'A 1-D subset table rolls the target backward so each item is spent once',
    detail:
      'Filling a single dp[0..target] array while iterating the target from high to low means a fresh item can only reference the previous item-pass, which is the whole difference between 0/1 knapsack and unbounded.',
    terms: ['reverse target loop', 'one dimensional dp', '0/1 versus unbounded', 'item used once', 'in-place rolling'],
    weight: 5,
  },
  'dsa-dp16a-first-row-col-base-of-grid-dp': {
    slug: 'dsa-dp16a-first-row-col-base-of-grid-dp',
    name: 'A grid DP seeds its first row and column as forced prefix paths',
    detail:
      'With only right and down moves there is exactly one route along the top edge and down the left edge, so those cells are running sums (or running 1s for counting) and every interior cell then needs only its top and left neighbour.',
    terms: ['prefix first row', 'forced edge path', 'top or left recurrence', 'grid base case', 'min path seed'],
    weight: 3,
  },
  'dsa-dp16a-bottom-up-collapses-triangle': {
    slug: 'dsa-dp16a-bottom-up-collapses-triangle',
    name: 'A triangular grid collapses bottom-up into one shrinking array',
    detail:
      'Starting from the base row and pushing dp[j] = value[j] + min(dp[j], dp[j+1]) upward, each row folds into the one below it and the last surviving cell is the answer — no second array, no recursion.',
    terms: ['bottom-up triangle', 'shrinking array', 'adjacent j and j+1', 'fold a row up', 'no extra memory'],
    weight: 4,
  },
  'dsa-dp16a-three-way-window-falling-path': {
    slug: 'dsa-dp16a-three-way-window-falling-path',
    name: 'A falling path reads a three-wide window of the previous row with edge guards',
    detail:
      'Each cell takes the best of the parent directly above and its two neighbours, so the row DP scans col-1, col, col+1; the two edge columns must mask out the off-grid neighbour with infinity rather than index past the end.',
    terms: ['three parent window', 'edge column guard', 'infinity masking', 'downward dp', 'falling path'],
    weight: 3,
  },
  'dsa-dp16a-partition-reduces-to-half-target': {
    slug: 'dsa-dp16a-partition-reduces-to-half-target',
    name: 'Equal partition is subset-sum at half the total behind an even-sum gate',
    detail:
      'Two equal halves exist only when the total is even, and then exactly when some subset hits total/2 — the second half is whatever remains, so the whole question collapses to one subset-sum decision.',
    terms: ['half target', 'even sum gate', 'complement subset', 'partition equals subset sum', 'remainder is other side'],
    weight: 4,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 16,
    name: 'Introduction to DP (Memoization & Tabulation)',
    difficulty: 'Easy',
    topicSlug: 'dp-greedy',
    stem: 'Given the n-th Fibonacci number as the running example, explain what makes a problem dynamic programming and ship both the memoised recursion and the tabulated loop.',
    brief:
      'Input: a non-negative index n. Output: fib(n) with fib(0)=0, fib(1)=1. The naive definition calls itself twice per step, so the constraint that decides the approach is that the same sub-index is reached through many different routes and asked to return the same number each time.',
    concepts: [
      'dsa-dp16a-overlapping-subproblems-memo-tab',
      'dsa-memoization',
      'dsa-recursive-decomposition',
      'dsa-call-stack-cost',
    ],
    shortAnswer:
      'DP is a recursion whose calls overlap: memoise the answer to each state so it is computed once, or fill the same states bottom-up in dependency order. On Fibonacci both land at O(n) time.',
    idealAnswer:
      'The naive definition fib(n)=fib(n-1)+fib(n-2) is not slow because addition is expensive — it is slow because the call tree is a mess of duplicates. The number of calls it makes is exactly 2*fib(n+1)-1, so fib(10) asks 177 times and fib(30) asks over 2.6 million times, all to learn that fib(28) has one value. Two facts fix it. First, optimal substructure: the answer for n is a fixed function of the answers for n-1 and n-2, so a solved state never needs re-solving. Second, overlapping subproblems: the same small state is reached through many paths, which is what turns the exponential tree into a linear set of distinct sub-questions. Memoisation keeps the recursion and bolts a cache onto it — top-down, lazy, filling only the states the answer actually touches. Tabulation throws away the recursion and iterates bottom-up over 0..n, filling every state in an order that guarantees its dependencies are already written. Same O(n) time, and the real trade is shape: memo pays for a call stack (O(n) frames deep before it settles) and only touches needed states, while tabulation is a flat loop that can be rolled to O(1) space but computes states a recursive answer would skip.',
    walkthrough:
      'Trace fib(4). The naive tree fans out as fib(4) -> fib(3) + fib(2), fib(3) -> fib(2) + fib(1), and now fib(2) is requested three separate times and fib(1) twice: countNaiveFib(4) returns 9 calls for a single number. Attach a memo and the picture changes completely — fib(4) asks fib(3), fib(3) asks fib(2), fib(2) asks fib(1) and fib(0), both cached, fib(2) fills and returns 1, fib(3) fills as 2, fib(4) as 3; the cache holds 0,1,1,2,3 and was consulted, not recomputed, on the repeat. countMemoFibCalls(4) confirms exactly 7 calls, and at n=30 the memo has collapsed 2,692,537 exponential calls to just 59 — one fill per index from 2 up plus the two bases. The tabulation loop writes the very same array front-to-back: dp[0]=0, dp[1]=1, then dp[2]=1, dp[3]=2, dp[4]=3, dp[5]=5, dp[6]=8, dp[7]=13, dp[8]=21, dp[9]=34, dp[10]=55, so fibTabulated(10)=55 and fibRolling(50)=12586269025, which stays below 2^53 and so is exact.',
    commonMistake:
      'Calling any memoised recursion "dynamic programming" and any loop "not DP", or rolling the tabulation to two variables and then claiming the table can no longer answer a prefix query.',
    whyWrong:
      'The two are the same algorithm seen from opposite ends; the interview question is whether you can state the recurrence and then choose the fill direction, not whether a cache or an array appears in the code. Rolling to two variables is genuinely O(1) for fib(n) alone, but the moment the follow-up asks for fib(k) for every k up to n, or fib(0)+fib(1)+...+fib(n), the discarded rows were the answer — collapsing space and losing reusable states are different decisions, and a candidate who conflates them cannot answer the second query without a second pass.',
    followUps: [
      'Give the recurrence for counting binary strings of length n with no two consecutive 1s. Where does the memo go, and what are the two base states?',
      'Your rolling fib uses two scalars. Restore the table for free — which query becomes O(1) once you keep it, and what does it cost?',
      'Why is the tabulation able to drop the recursion while the memo cannot drop the stack, and what does that mean for n = one million?',
      'fib(93) overflows a JavaScript double. Which of your three versions first returns a wrong-but-plausible number, and how do you catch it?',
    ],
    solution:
      'function fibRecursive(n) {\n' +
      '  if (n < 2) return n;\n' +
      '  return fibRecursive(n - 1) + fibRecursive(n - 2);\n' +
      '}\n' +
      '\n' +
      'function countNaiveFib(n) {\n' +
      '  if (n <= 1) return 1;\n' +
      '  return 1 + countNaiveFib(n - 1) + countNaiveFib(n - 2);\n' +
      '}\n' +
      '\n' +
      'function fibMemo(n) {\n' +
      '  const memo = new Array(n + 1).fill(-1);\n' +
      '  const go = (i) => {\n' +
      '    if (i < 2) return i;\n' +
      '    if (memo[i] !== -1) return memo[i];\n' +
      '    memo[i] = go(i - 1) + go(i - 2);\n' +
      '    return memo[i];\n' +
      '  };\n' +
      '  return go(n);\n' +
      '}\n' +
      '\n' +
      'function countMemoFibCalls(n) {\n' +
      '  let calls = 0;\n' +
      '  const memo = new Array(n + 1).fill(-1);\n' +
      '  const go = (i) => {\n' +
      '    calls += 1;\n' +
      '    if (i < 2) return i;\n' +
      '    if (memo[i] !== -1) return memo[i];\n' +
      '    memo[i] = go(i - 1) + go(i - 2);\n' +
      '    return memo[i];\n' +
      '  };\n' +
      '  go(n);\n' +
      '  return calls;\n' +
      '}\n' +
      '\n' +
      'function fibTabulated(n) {\n' +
      '  if (n < 2) return n;\n' +
      '  const dp = new Array(n + 1).fill(0);\n' +
      '  dp[0] = 0;\n' +
      '  dp[1] = 1;\n' +
      '  for (let i = 2; i <= n; i += 1) dp[i] = dp[i - 1] + dp[i - 2];\n' +
      '  return dp[n];\n' +
      '}\n' +
      '\n' +
      'function fibRolling(n) {\n' +
      '  if (n < 2) return n;\n' +
      '  let a = 0;\n' +
      '  let b = 1;\n' +
      '  for (let i = 2; i <= n; i += 1) {\n' +
      '    const c = a + b;\n' +
      '    a = b;\n' +
      '    b = c;\n' +
      '  }\n' +
      '  return b;\n' +
      '}',
    modify:
      'Now report fib(n) modulo a supplied m so the result stays bounded for n into the millions. Which of the four functions changes in one line, and why does the rolling form beat the memo here?',
  },
  {
    step: 16,
    name: 'Climbing Stars',
    difficulty: 'Easy',
    topicSlug: 'dp-greedy',
    stem: 'Count the ways to reach the top of an n-step staircase taking one or two steps at a time, and say why that count is a Fibonacci number in disguise.',
    brief:
      "Input: a stair count n >= 0. Output: the number of distinct sequences of {1,2}-steps that sum to n. The constraint that decides the approach is that the last move is either a single step or a double, so the count for n is the sum of the counts for n-1 and n-2 — a recurrence, not a formula you are handed.",
    concepts: [
      'dsa-dp16a-overlapping-subproblems-memo-tab',
      'dsa-dp16a-rolling-two-state-1d',
      'dsa-count-by-adding-branches',
      'dsa-memoization',
    ],
    shortAnswer:
      'ways(n) = ways(n-1) + ways(n-2) with ways(0)=1, ways(1)=1, because the final stride is a 1 or a 2 and those two sets of sequences are disjoint and exhaustive — the same recurrence as Fibonacci with an offset.',
    idealAnswer:
      'This is Fibonacci with the labels changed, and naming that relationship is the strong answer. The reasoning to give out loud: any valid climb ends with either one step (so what came before is a full climb of n-1) or two steps (so what came before is a full climb of n-2), and no climb can end both ways, so the two families are disjoint and together exhaustive — hence count, not max, is the combination operator. That "count by adding branches" is exactly why the empty staircase has 1 way rather than 0: the all-singles climb reaches step 0 without moving, and it is the base every longer climb grows from; treating ways(0) as 0 would silently make ways(2)=1. Memory is O(1) once you see that state n only reads n-1 and n-2, so two rolling variables reproduce the whole ladder; the tabulation array earns its space only if the question shifts to counting ways for every n up to a bound. The trap is that this is a count, so it inherits the growth problem the path-counting rows inherit — ways(45) is close to 2 billion and ways(79) overflows a double — and a correct O(n) loop can still hand back a wrong-but-plausible integer.',
    walkthrough:
      'Climb four steps. ways(0)=1 (stand still), ways(1)=1 (just 1). ways(2)=ways(1)+ways(0)=1+1=2: the sequences are 1+1 and 2. ways(3)=ways(2)+ways(1)=2+1=3: 1+1+1, 1+2, 2+1. ways(4)=ways(3)+ways(2)=3+2=5. The array reads 1,1,2,3,5 and the tail 1,2,3,5 confirms the offset — ways(n)=fib(n+1). Now the empty case: the recurrence for n=2 needs ways(0), and if you had stored ways(0)=0 then ways(2)=ways(1)+ways(0)=1+0=1, which undercounts — the double-stride climb 2 is real. Keep the base at 1 and the rolling pair advances (1,1)->(1,2)->(2,3)->(3,5)->(5,8), so climbWays(5)=8 and climbWays(20)=10946=fib(21).',
    commonMistake:
      'Setting ways(0)=0, or returning ways(n-1)+ways(n-2) but forgetting the answer is a count so it must not be clipped to the better branch like a max-recurrence neighbour.',
    whyWrong:
      "With ways(0)=0 the ladder comes out 0,1,1,2,3 and climbWays(2) reports 1 instead of the two ways {1+1, 2}, so every even-topped staircase is short by exactly one — the bug shows up first at n=2 and grows. The other reading, taking max(ways(n-1), ways(n-2)) because the house-robber row right after this one uses a max, is a category error: here you are enumerating sequences, and 1+2 and 2+1 are two distinct ways to top the third step, so adding the branches is the only correct merge; the two rows share the shape of the recurrence and differ entirely in how the branches combine.",
    followUps: [
      'Generalise to steps of 1, 2 or 3 (the Tribonacci). What is the base now, and how many rolling variables do you need?',
      'The staircase has k fixed allowed step sizes given at run time, not {1,2}. Which fill order — iterate steps outer or stair outer — counts each sequence exactly once?',
      'Return the list of sequences instead of the count. Does that change the recurrence, or only what a state stores?',
      'ways(n) equals fib(n+1). Use that to answer ways for n = 10^18 in O(log n) — what does that cost you in correctness?',
    ],
    solution:
      'function climbWays(n) {\n' +
      '  if (n <= 1) return 1;\n' +
      '  const dp = new Array(n + 1).fill(0);\n' +
      '  dp[0] = 1;\n' +
      '  dp[1] = 1;\n' +
      '  for (let i = 2; i <= n; i += 1) dp[i] = dp[i - 1] + dp[i - 2];\n' +
      '  return dp[n];\n' +
      '}\n' +
      '\n' +
      'function climbWaysRolling(n) {\n' +
      '  if (n <= 1) return 1;\n' +
      '  let a = 1;\n' +
      '  let b = 1;\n' +
      '  for (let i = 2; i <= n; i += 1) {\n' +
      '    const c = a + b;\n' +
      '    a = b;\n' +
      '    b = c;\n' +
      '  }\n' +
      '  return b;\n' +
      '}\n' +
      '\n' +
      'function climbWaysMemo(n) {\n' +
      '  const memo = new Array(n + 1).fill(-1);\n' +
      '  const go = (i) => {\n' +
      '    if (i <= 1) return 1;\n' +
      '    if (memo[i] !== -1) return memo[i];\n' +
      '    memo[i] = go(i - 1) + go(i - 2);\n' +
      '    return memo[i];\n' +
      '  };\n' +
      '  return go(n);\n' +
      '}',
    modify:
      'The staircase has some steps that are broken and cannot be landed on. Which base case and which transition change, and what does ways over a broken step return?',
  },
  {
    step: 16,
    name: 'Frog Jump (DP-3)',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'A frog crosses n stones and may jump one or two stones at a time, paying the height difference; give the minimum total energy to reach the last stone.',
    brief:
      'Input: an array of stone heights, stone 0 to stone n-1. Output: the least accumulated absolute height difference. The constraint that decides the approach is a cost that depends on the jump taken, so a greedy single-step choice is unsafe and the last move is either one or two stones back.',
    concepts: [
      'dsa-dp16a-frog-k-neighbourhood-relaxation',
      'dsa-dp16a-rolling-two-state-1d',
      'dsa-recursive-decomposition',
      'dsa-memo-decision-table',
    ],
    shortAnswer:
      'dp[i] = min(dp[i-1] + |h[i]-h[i-1]|, dp[i-2] + |h[i]-h[i-2]|) because the final hop is one or two stones, and you take the cheaper of the two sub-caminos; dp[0]=0 and dp[1]=|h[1]-h[0]|.',
    idealAnswer:
      'The state is "cheapest energy to stand on stone i", and it is well defined because energy only accumulates and every path to i must have passed through either i-1 or i-2 as its last stone, so the two branches are exhaustive and disjoint in their last hop. The greedy temptation — always take the smaller next step — fails because a locally cheap hop can force an expensive one right after, whereas dp[i] commits to no future and simply asks the two predecessors for their best totals. Cost is O(n) time and, with the recurrence reading only i-1 and i-2, O(1) space via a rolling pair; the memo version keeps O(n) arrays and O(n) stack but mirrors the definition directly, which is easier to defend in an interview than the rolled loop. The contract traps: a single stone costs 0 (nowhere to jump), two stones cost exactly |h[1]-h[0]|, and because heights may be equal the recurrence has to compare two real totals rather than assume one branch dominates. The sibling row widens this to k jumps by adding an inner min over the previous k cells.',
    walkthrough:
      'Take heights [30, 10, 60, 10]. dp[0]=0 by definition. After index 1: dp[1]=|10-30|=20. After index 2: one stone back costs dp[1]+|60-10|=20+50=70, two stones back costs dp[0]+|60-30|=0+30=30, so dp[2]=min(70,30)=30 — the frog leaps the two tall stones and lands cheaper. After index 3: one back dp[2]+|10-60|=30+50=80, two back dp[1]+|10-10|=20+0=20, so dp[3]=min(80,20)=20. The dp array reads 0, 20, 30, 20, and the minimum energy is 20. Run the memoised forward definition on the same input and best(3) returns the same 20. On [10,20,30] the dp array is 0,10,20 so frogJump=20, and a single stone [10] returns 0 with no jump taken.',
    commonMistake:
      'Greeding toward the shorter next stone, or reading dp[i-2] when i is 1 so the array is indexed at -1.',
    whyWrong:
      'On [30,10,60,10] a greedy frog at stone 0 sees |10-30|=20 forward versus |60-30|=30 and jumps one to stone 1, then is forced into the 50-step to stone 2 and pays 70 total; the correct answer is 20, reached by taking the two-stone leap first — the locally cheap hop is the expensive move. The off-by-one crash is the second half: dp[1] has only one predecessor, so the two-back branch must be guarded, and an unguarded dp[i-2] reads undefined at i=1, makes Math.abs(heights[1]-heights[-1]) NaN, and poisons every later min because Math.min(NaN, x) is NaN all the way to the last stone.',
    followUps: [
      'Roll the two-row table down to three variables. Which state is the third variable and why is dp[0]=0 the right seed for both the loop and the memo?',
      'Reconstruct the actual sequence of stones the optimal path landed on. What extra array does that need, and can you recover it from the two rolling variables alone?',
      'Heights can be equal so the two branches sometimes tie. Does dp change, and does the reconstructed path?',
      'Turn the minimisation into "reach the end with the fewest jumps" ignoring height. Why does that variant stop being a DP problem at all?',
    ],
    solution:
      'function frogJump(heights) {\n' +
      '  const n = heights.length;\n' +
      '  if (n <= 1) return 0;\n' +
      '  let prev2 = 0;\n' +
      '  let prev1 = Math.abs(heights[1] - heights[0]);\n' +
      '  for (let i = 2; i < n; i += 1) {\n' +
      '    const one = prev1 + Math.abs(heights[i] - heights[i - 1]);\n' +
      '    const two = prev2 + Math.abs(heights[i] - heights[i - 2]);\n' +
      '    const cur = Math.min(one, two);\n' +
      '    prev2 = prev1;\n' +
      '    prev1 = cur;\n' +
      '  }\n' +
      '  return prev1;\n' +
      '}\n' +
      '\n' +
      'function frogJumpFrom(heights) {\n' +
      '  const n = heights.length;\n' +
      '  const memo = new Array(n).fill(-1);\n' +
      '  const best = (i) => {\n' +
      '    if (i === 0) return 0;\n' +
      '    if (memo[i] !== -1) return memo[i];\n' +
      '    let cost = best(i - 1) + Math.abs(heights[i] - heights[i - 1]);\n' +
      '    if (i > 1) cost = Math.min(cost, best(i - 2) + Math.abs(heights[i] - heights[i - 2]));\n' +
      '    memo[i] = cost;\n' +
      '    return cost;\n' +
      '  };\n' +
      '  return best(n - 1);\n' +
      '}',
    modify:
      'Return the minimum energy to reach ANY stone at or beyond the target rather than exactly the last one. Which base case and which return line move?',
  },
  {
    step: 16,
    name: 'Frog Jump with K distances (DP-4)',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Extend the frog to jump any distance from one to k stones, still paying height difference, and give the minimum energy to reach the last stone.',
    brief:
      'Input: an array of heights and an integer k. Output: the least accumulated absolute height difference where the frog may hop 1..k stones. The constraint is that the last move can come from any of the previous k stones, so the state gains an inner min over a window of width k.',
    concepts: [
      'dsa-dp16a-frog-k-neighbourhood-relaxation',
      'dsa-recursive-decomposition',
      'dsa-memo-decision-table',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      'dp[i] = min over jump j=1..k, i-j>=0, of dp[i-j] + |h[i]-h[i-j]|; the k=2 case is exactly the two-branch DP-3 row, and generalising is one added loop over the last k cells.',
    idealAnswer:
      'The DP-3 recurrence is the special case k=2 of this one, and seeing it that way is the answer: instead of comparing two named predecessors you sweep a window of up to k predecessors and take their best, guarded by i-j>=0 so the frog never reads before the first stone. Cost is O(n*k) time because each cell does k constant work, and O(n) space for the table (O(k) if you keep only the last k values in a ring buffer). The two traps are the boundary — for the first k stones the window is shorter than k, and dp[0]=0 is the only free cell — and the assumption that a bigger jump is automatically cheaper: |h[i]-h[i-j]| is not monotone in j, so allowing three-stone hops does not simply dominate two-stone hops, it opens routes the smaller k physically could not take. That is exactly the sibling contrast: on a fixed input the k=2 answer and the k=3 answer can differ, and the k=2 one is not a rounding of the k=3 one but a genuinely larger cost forced by missing the cheap long hop.',
    walkthrough:
      'Take heights [20, 30, 40, 10, 20, 50] with k=3. dp[0]=0. dp[1]=|30-20|=10. dp[2]=min(dp[1]+|40-30|=20, dp[0]+|40-20|=20)=20. dp[3]=min(dp[2]+|10-40|=20+30=50, dp[1]+|10-30|=10+20=30, dp[0]+|10-20|=0+10=10)=10 — the three-stone hop straight from the start wins. dp[4]=min(dp[3]+|20-10|=10+10=20, dp[2]+|20-40|=20+20=40, dp[1]+|20-30|=10+10=20)=20. dp[5]=min(dp[4]+|50-20|=20+30=50, dp[3]+|50-10|=10+40=50, dp[2]+|50-40|=20+10=30)=30. So frogJumpK(heights,3)=30. Re-run the identical array with k=2 and the third branch vanishes: dp[3]=min(50,30)=30, dp[5]=70 — the two-stone frog cannot make the cheap three-stone hop and pays 70 where the three-stone frog pays 30. The dp arrays are [0,10,20,10,20,30] for k=3 against [0,10,20,30,40,70] for k=2, and that divergence is the specific input where the simpler DP-3 version breaks.',
    commonMistake:
      'Sweeping the window from i-1 down without the i-j>=0 guard, or reusing the DP-3 rolling two-scalar trick when k is larger than 2.',
    whyWrong:
      "Drop the boundary guard and at i=1 the j=2 term reads heights[-1] and memo[-1], both undefined, so the first few cells collapse to NaN and Math.min over NaN returns NaN for the whole run. The rolling-pair reuse is subtler and wrong on cost rather than correctness: two scalars encode only i-1 and i-2, so with k=3 the i-3 predecessor is missing from memory and dp[3] cannot see the 10-cost three-hop, silently reporting the k=2 answer of 70 on the array above. To roll this you need a ring of the last k values, not two variables, which is why DP-3's space trick does not lift straight to DP-4.",
    followUps: [
      'k can exceed n. Where does the window shrink and what does the answer become when k >= n-1?',
      'Swap min for max over the window to get the most expensive route the frog is forced away from. Which boundary value changes from 0 to negative infinity in the guard?',
      'Give the O(n) time version for k=3 using a monotonic deque over dp[i]-heights[i] style terms. What does it buy you and is it worth the complexity?',
      'Make the jump cost k^2 rather than the height difference. Which part of the recurrence stops decomposing cleanly?',
    ],
    solution:
      'function frogJumpK(heights, k) {\n' +
      '  const n = heights.length;\n' +
      '  if (n <= 1) return 0;\n' +
      '  const dp = new Array(n).fill(Infinity);\n' +
      '  dp[0] = 0;\n' +
      '  for (let i = 1; i < n; i += 1) {\n' +
      '    for (let j = 1; j <= k; j += 1) {\n' +
      '      if (i - j >= 0) {\n' +
      '        const cost = dp[i - j] + Math.abs(heights[i] - heights[i - j]);\n' +
      '        if (cost < dp[i]) dp[i] = cost;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[n - 1];\n' +
      '}',
    modify:
      'Allow the frog to skip to any earlier stone at unbounded jump but forbid landing on flagged stones. Which loop bound and which guard change, and how does the dp array mark a forbidden cell?',
  },
  {
    step: 16,
    name: 'Maximum Sum of Non-Adjacent Elements (House Robber)',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Given values along a street, choose a subset with no two neighbours so the total is maximised, and justify why you cannot just take every positive value.",
    brief:
      "Input: an array of non-negative values in line. Output: the largest sum of a subset with no two adjacent indices. The constraint is adjacency, so taking an element forbids its neighbours and a greedy 'take the biggest then its neighbours are gone' is unsafe.",
    concepts: [
      'dsa-dp16a-take-skip-non-adjacent',
      'dsa-dp16a-rolling-two-state-1d',
      'dsa-include-exclude-branch',
      'dsa-memo-decision-table',
    ],
    shortAnswer:
      'dp[i] = max(dp[i-1], dp[i-2] + a[i]): either skip i and inherit the best before it, or take i and add it to the best two back; the two rolling variables prev1 and prev2 carry it in O(1) space.',
    idealAnswer:
      'The state is "best sum over the prefix ending at i", and the recurrence splits on the single decision that matters: did the optimum take i or not. If it took i then it could not take i-1, so the value is dp[i-2]+a[i]; if it skipped i the value is just dp[i-1]. Taking the max of those two is the whole algorithm, and it is exactly why greed fails — the two branches are the only options, and picking by which element looks bigger ignores that taking a small element can unlock (by removing a neighbour) a much better pair. O(n) time, O(1) space once you notice only dp[i-1] and dp[i-2] are ever read, which the two-variable form exploits: prev2 holds dp[i-2], prev1 holds dp[i-1], and each step writes max(prev1, prev2 + a[i]). The contract edge cases are a single house (return its value) and the empty street (return 0); with non-negative values the max over the two branches always has dp[i-1] >= dp[i-2] as a baseline so no element is ever negative enough to distort, but that assumption breaks the moment negatives are allowed and then the empty set is genuinely better.',
    walkthrough:
      'Take [2, 1, 4, 9, 6]. prev2=0 (dp before the start), prev1=2 after house 0. House 1: cur=max(prev1=2, prev2+1=1)=2, so prev2=2,prev1=2. House 2: cur=max(2, 2+4=6)=6, prev2=2,prev1=6. House 3: cur=max(6, 2+9=11)=11, prev2=6,prev1=11. House 4: cur=max(11, 6+6=12)=12. The dp array reads 2,2,6,11,12 so the answer is 12 — houses 0, 3 and ... wait 2+9=11 uses {0,3} but 12 uses indices 2 and 4 (4+6=10) — recheck: dp[4]=max(dp[3]=11, dp[2]+6=6+6=12)=12, achieved by 11 plus nothing adjacent, i.e. the optimum is {1,4}? no; it is dp[2] (best of the first three) plus house 4. The memoised form returns the same 12. Classic checks: [1,2,3,1] gives max(dp)=4 (take 1 and 3), [5,1,1,5] gives 10 (take both 5s), [10] gives 10, [5,5] gives 5 (one of them), and [] gives 0.',
    commonMistake:
      'Summing all values then subtracting the smallest adjacent pairs, or rolling with prev1 and prev2 but updating them in the wrong order so prev2 already equals the new dp[i-1].',
    whyWrong:
      'The "take everything then fix" idea is not a DP at all and fails immediately on [5,1,1,5]: the total is 12 and no single subtraction of adjacent pairs reaches the true 10 by removing just the two 1s without also touching a 5, so the repair heuristic has no rule that lands on the optimum. The update-order bug is the classic implementation error: you must compute cur from the old prev2 and prev1, then set prev2=prev1 and prev1=cur; if you write prev1=cur first and then prev2=prev1, prev2 becomes cur and the next step uses dp[i] where it needed dp[i-1], effectively allowing two adjacent picks and returning 15 instead of 12 on [2,1,4,9,6] by double-counting the neighbours.',
    followUps: [
      'Allow negative values. Why does the empty subset become a real candidate and which base value must change to reflect it?',
      'Return the chosen indices, not the sum. Which extra array (keep or prev-pointer) turns the rolling form back into a table?',
      'This is maximum-weight independent set on a path. Show the same take-or-skip skeleton on a cycle, and explain why it is the sibling House Robber II row rather than a local fix.',
      'Add a third option to skip and take with a gap of at least two. How many rolling variables does a gap-of-two constraint need?',
    ],
    solution:
      'function maxNonAdjacent(arr) {\n' +
      '  let prev2 = 0;\n' +
      '  let prev1 = 0;\n' +
      '  for (let i = 0; i < arr.length; i += 1) {\n' +
      '    const take = prev2 + arr[i];\n' +
      '    const skip = prev1;\n' +
      '    const cur = Math.max(take, skip);\n' +
      '    prev2 = prev1;\n' +
      '    prev1 = cur;\n' +
      '  }\n' +
      '  return prev1;\n' +
      '}\n' +
      '\n' +
      'function maxNonAdjacentMemo(arr) {\n' +
      '  const n = arr.length;\n' +
      '  const memo = new Array(n).fill(-1);\n' +
      '  const solve = (i) => {\n' +
      '    if (i < 0) return 0;\n' +
      '    if (i === 0) return arr[0];\n' +
      '    if (memo[i] !== -1) return memo[i];\n' +
      '    memo[i] = Math.max(solve(i - 1), solve(i - 2) + arr[i]);\n' +
      '    return memo[i];\n' +
      '  };\n' +
      '  return solve(n - 1);\n' +
      '}',
    modify:
      'Upgrade the adjacency rule so no two chosen houses may be within two doors of each other. How many rolling predecessors does the recurrence then need?',
  },
  {
    step: 16,
    name: 'House Robber II',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Rob the same street now bent into a circle where the first and last houses are neighbours, and explain why one linear pass is no longer enough.',
    brief:
      'Input: an array of values whose ends are adjacent. Output: the max sum with no two adjacent, where index 0 and index n-1 now count as adjacent. The constraint is the ring, which the sibling linear DP cannot express directly.',
    concepts: [
      'dsa-dp16a-ring-cuts-to-two-linear-passes',
      'dsa-dp16a-take-skip-non-adjacent',
      'dsa-include-exclude-branch',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      'The ring means house 0 and house n-1 cannot both be robbed, so at least one is excluded: run the linear house-robber over houses[0..n-2] and over houses[1..n-1] and return the larger; n=1 returns that single value and n=0 returns 0.',
    idealAnswer:
      'The linear sibling assumed each house only touched its two neighbours, but the ring welds house 0 to house n-1, and no take-or-skip recurrence on a single path can see that far edge. The fix is to break the cycle by forcing one of the two welded ends out: in any legal circular selection, house 0 and house n-1 are never both taken, so the optimum lives entirely inside either "houses 0..n-2, ignore the last" or "houses 1..n-1, ignore the first". Running the ordinary linear DP on those two windows and taking the max is exact and costs 2*O(n) = O(n), O(1) space. This is the general "cut a ring into two linear passes" move and worth naming as such. The contract traps are all at the ends: a single house returns its value directly (both windows would be empty and lose it), an empty street returns 0, and two houses return the bigger one because they are mutually adjacent. Do not fold the two passes into one by reusing a shared array — the windows are genuinely different ranges and a merged state re-admits the illegal both-ends pick.',
    walkthrough:
      'Take [1, 2, 3]. Pass A over houses[0..1]=[1,2] gives max(1,2)=2. Pass B over houses[1..2]=[2,3] gives max(2,3)=3. robRing=max(2,3)=3. But the linear sibling maxNonAdjacent([1,2,3]) returns 4, which robs houses 0 and 2 — adjacent on the ring, so 4 is illegal and 3 is correct. Now [2, 7, 9, 3, 1]: Pass A over [2,7,9,3] runs prev 2,7,9,10 to 11 and Pass B over [7,9,3,1] runs 7,9,10,10 to 10, so robRing=max(11,10)=11 (the linear run of the whole array would also read 11 here, but that is coincidence — on [1,2,3] the two answers diverge). Single house robRing([1])=1, empty robRing([])=0, and robRow([2,7,9,3,1],1,4) isolates the second window and returns its 10.',
    commonMistake:
      'Running the linear DP once over all houses and then post-hoc rejecting a pick of both ends, or forgetting that n=2 has no legal two-house solution.',
    whyWrong:
      'The post-hoc reject cannot work because the linear DP does not record which houses it chose, only the sum — on [1,2,3] it hands back 4 and offers no way to see that 4 came from the two welded ends, so "reject it" has nothing to reject and there is no clean second-best to fall back to; the two-window split is what makes the ends mutually exclusive by construction. Forgetting n=2 gives robRing([1,2]) wrongly: two houses on a ring are neighbours, so you can only take one and the answer is 2, which the split recovers as max(robRing on [1], robRing on [2]) = 2 — but a naive single pass returning 3 would be a silent illegal double-take.',
    followUps: [
      'Why are exactly two windows sufficient and three not needed? Argue that every legal ring solution is inside at least one of them.',
      'Generalise to a ring where a house cannot be robbed if any of its two neighbours is robbed. Does the two-cut still hold, and what changes in the inner recurrence?',
      'Houses are on a ring AND some are booby-trapped (value 0). Which pass might now prefer a different window, and does the split logic survive?',
      'Return the actual robbed indices for the circular case. How do you recover them from two separate linear runs without mixing their tables?',
    ],
    solution:
      'function robRow(houses, lo, hi) {\n' +
      '  let prev2 = 0;\n' +
      '  let prev1 = 0;\n' +
      '  for (let i = lo; i <= hi; i += 1) {\n' +
      '    const take = prev2 + houses[i];\n' +
      '    const skip = prev1;\n' +
      '    const cur = Math.max(take, skip);\n' +
      '    prev2 = prev1;\n' +
      '    prev1 = cur;\n' +
      '  }\n' +
      '  return prev1;\n' +
      '}\n' +
      '\n' +
      'function robRing(houses) {\n' +
      '  const n = houses.length;\n' +
      '  if (n === 0) return 0;\n' +
      '  if (n === 1) return houses[0];\n' +
      '  const dropLast = robRow(houses, 0, n - 2);\n' +
      '  const dropFirst = robRow(houses, 1, n - 1);\n' +
      '  return Math.max(dropLast, dropFirst);\n' +
      '}\n' +
      '\n' +
      'function maxNonAdjacentLinear(houses) {\n' +
      '  return robRow(houses, 0, houses.length - 1);\n' +
      '}',
    modify:
      'The ring is now a neighbourhood watch where robbing a house alerts its two neighbours on either side. Which recurrence inside robRow changes and do the two cut passes still cover every legal choice?',
  },
  {
    step: 16,
    name: "Ninja's Training",
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: "Over N days a trainee does exactly one of three tasks each day, never the same task twice running; maximise the total points from a day-by-task points table.",
    brief:
      "Input: an N x 3 grid points[day][task]. Output: the max total points choosing one task per day with no two consecutive days on the same task. The constraint is the last-task carry-over, so the state must remember which task the previous day used.",
    concepts: [
      'dsa-dp16a-previous-choice-state-dimension',
      'dsa-include-exclude-branch',
      'dsa-recursive-decomposition',
      'dsa-memo-decision-table',
    ],
    shortAnswer:
      'dp[day][last] = points[day][last] + max over other of dp[day-1][other]; each state is a day plus the task taken that day, and the constraint is exactly which previous-day task is disallowed.',
    idealAnswer:
      "The single index day is not enough state here, because today's best depends on which task yesterday picked, not merely on the best total through yesterday: the day that maximised its own total may have done it on the very task you now want. So the state carries a second dimension, dp[day][lastTask], and the recurrence for taking task t today is points[day][t] plus the best of dp[day-1][u] over the other two tasks u != t. That 'add the previous choice to the state whenever a rule constrains consecutive choices' is the transferable idea — it is the same reason House Robber tracks whether the last house was taken. Cost is O(N*3*3) = O(N) time and O(N*3) table (O(3) rolling, since only the previous row is read). Contract traps: a single day returns the max of that day's three tasks with no carry-over to respect, and because there are exactly three tasks you can hardcode the two-other branches (a+b+c minus the two equal terms) rather than loop, which is faster and is the form most interviewers expect you to derive by hand.",
    walkthrough:
      "Grid [[10,40,70],[20,50,80],[30,60,90]]. Day 0 seeds dp=[10,40,70]. Day 1: task0 = 20+max(40,70)=90, task1 = 50+max(10,70)=120, task2 = 80+max(10,40)=120, so dp=[90,120,120]. Day 2: task0 = 30+max(120,120)=150, task1 = 60+max(90,120)=180, task2 = 90+max(90,120)=210. The answer is max(150,180,210)=210, the route 70 then 50 then 90 (tasks 2,1,2 — never two running). The memoised solve(2,2) returns the same 210. Single day [[1,2,3]] returns 3 (no previous day constrains it). Two days [[5,5,5],[5,5,5]] return 10: pick task0 day0 and task1 day1, and the third 5 is unreachable because both remaining tasks on day 1 would each be a different task, giving 5+5. For [[1,100,100],[100,1,100],[100,100,1]] the day-by-day dp ends at day2 = [300,300,201] and the max is 300.",
    commonMistake:
      'Keeping only dp[day] as the single best total and then adding today on top, or allowing the same task on consecutive days because the previous-day best "looks compatible".',
    whyWrong:
      "A one-dimensional dp[day] throws away exactly the information the rule needs: on [[10,40,70],[20,50,80]] dp[0] collapses to 70 (task2), and at day 1 it then cannot tell that its own best 120 came from task1 or task2, so a day[0]-only state happily adds task2's 80 to reach 150 while day 0 also used task2 — an illegal same-task run. Collapsing to a scalar is precisely the mistake the second state dimension exists to prevent, and on the 3x3 grid above it inflates the answer past the true 210 by allowing a repeated task the constraint forbids.",
    followUps: [
      'You hardcode the two-other branches for three tasks. Write the loop form for an arbitrary number of tasks and name its cost.',
      'Roll the table to O(3) space. Which previous-day values must you snapshot before overwriting so a day does not read its own partially-updated row?',
      'Change the rule so the same task is banned for the last two days. How many days back must the state dimension now remember?',
      'Return the winning task sequence, not the score. What does the reconstruction walk through, and does the rolling form still allow it?',
    ],
    solution:
      'function ninjaTraining(points) {\n' +
      '  const days = points.length;\n' +
      '  if (days === 0) return 0;\n' +
      '  let prev = points[0].slice();\n' +
      '  for (let d = 1; d < days; d += 1) {\n' +
      '    const cur = new Array(3).fill(0);\n' +
      '    for (let last = 0; last < 3; last += 1) {\n' +
      '      let bestPrev = 0;\n' +
      '      for (let other = 0; other < 3; other += 1) {\n' +
      '        if (other === last) continue;\n' +
      '        if (prev[other] > bestPrev) bestPrev = prev[other];\n' +
      '      }\n' +
      '      cur[last] = points[d][last] + bestPrev;\n' +
      '    }\n' +
      '    prev = cur;\n' +
      '  }\n' +
      '  return Math.max(prev[0], prev[1], prev[2]);\n' +
      '}\n' +
      '\n' +
      'function ninjaTrainingMemo(points) {\n' +
      '  const days = points.length;\n' +
      '  const memo = [];\n' +
      '  for (let d = 0; d < days; d += 1) memo.push(new Array(3).fill(-1));\n' +
      '  const solve = (d, last) => {\n' +
      '    if (d < 0) return 0;\n' +
      '    if (memo[d][last] !== -1) return memo[d][last];\n' +
      '    let bestPrev = 0;\n' +
      '    for (let other = 0; other < 3; other += 1) {\n' +
      '      if (other === last) continue;\n' +
      '      const cand = solve(d - 1, other);\n' +
      '      if (cand > bestPrev) bestPrev = cand;\n' +
      '    }\n' +
      '    memo[d][last] = points[d][last] + bestPrev;\n' +
      '    return memo[d][last];\n' +
      '  };\n' +
      '  if (days === 0) return 0;\n' +
      '  return Math.max(solve(days - 1, 0), solve(days - 1, 1), solve(days - 1, 2));\n' +
      '}',
    modify:
      "The task list grows from three to an arbitrary count given per day. Where does the hardcoded two-other max have to become a loop, and what is the new cost?",
  },
  {
    step: 16,
    name: 'Grid Unique Paths',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Count the routes from the top-left to the bottom-right of an m x n grid moving only right or down, and say when the count stops fitting a machine integer.',
    brief:
      'Input: grid dimensions m and n, no obstacles. Output: the number of distinct monotone paths. The constraint is that every path is right+down so each cell has at most two parents, making the count additive; the count is the binomial C(m+n-2, m-1), which grows fast.',
    concepts: [
      'dsa-dp16a-count-paths-overflow-or-modulo',
      'dsa-dp16a-first-row-col-base-of-grid-dp',
      'dsa-count-by-adding-branches',
      'dsa-recursive-decomposition',
    ],
    shortAnswer:
      'dp[i][j] = dp[i-1][j] + dp[i][j-1] with the first row and column all 1s (one forced route along each edge), which equals C(m+n-2, m-1); use BigInt or a modulo once the binomial nears 2^53.',
    idealAnswer:
      'A monotone path into cell (i,j) arrives either from above or from the left, and those two route families are disjoint by their last step, so the count is a sum, not a max — that is the difference from the minimisation rows and the reason the numbers explode combinatorially. The first row and first column are all 1 because there is exactly one way to hug a top edge (only rights) or a left edge (only downs); that seed is the base and every interior cell just adds its two parents. Closed form: a path is a permutation of (m-1) downs and (n-1) rights, hence C(m+n-2, m-1), and the multiplicative BigInt product computes that in O(min(m,n)) without the O(mn) table. The contract trap is overflow, not the recurrence: uniquePaths(20,20)=C(38,19)=35345263800 is the last comfortable double, (30,30)=C(58,29) is already past 2^53, and the sum-only DP would silently round a float. The two honest fixes are BigInt (exact) or a modulo DP that reduces each cell by a prime like 10^9+7 — and modulo is valid here only because the recurrence is pure addition, so it never breaks mid-sum.',
    walkthrough:
      'A 3x7 grid. Seed row0 = 1,1,1,1,1,1,1 and column0 all 1s. Filling the interior: row1 = 1,2,3,4,5,6,7 and row2 = 1,3,6,10,15,21,28, so uniquePaths(3,7)=28 = C(8,2). A 10x10 grid ends at uniquePaths(10,10)=48620 = C(18,9), matching the multiplicative BigInt formula. Now the overflow edge: uniquePathsBig(20,20) is exactly 35345263800n — still a clean double value. Pushing further, uniquePathsMod(20,20,1000) runs the same addition DP but reduces each cell mod 1000, and 35345263800 mod 1000 = 800, while uniquePathsMod(10,10,97) gives 48620 mod 97 = 23. A single-row grid uniquePaths(1,5)=1 and uniquePaths(5,1)=1 because there is only the straight route along that edge.',
    commonMistake:
      "Using the closed form C(m+n-2, m-1) with floating factorials, or seeding dp[0][0]=0 and forgetting the destination cell needs a 1 to represent the empty arrival.",
    whyWrong:
      'Computing C via factorial(m+n-2)/(factorial(m-1)*factorial(n-1)) in floating point overflows to Infinity around m+n ~ 170 and is inexact long before that, because it divides huge rounded numbers; the additive DP never multiplies so it stays integral up to 2^53 and BigInt keeps it integral forever. Seeding dp[0][0]=0 makes the count of ways to be already at the start vanish, so dp[0][1]=dp[0][0]=0 and the entire first row and column collapse to zero, and the destination reports 0 — the single 1 at the origin is the base case that every path is built on.',
    followUps: [
      'Roll the 2-D counting table to a single row. Why does the one-dimensional rolling work even though a naive 2-D loop "needs" both axes?',
      'Count paths moving in four directions instead of two. Does the add-two-parents recurrence survive, and if not, what breaks it?',
      'Report the count modulo a non-prime that is not coprime to the divisor used in the multiplicative form. Which of your three functions still gives a correct answer?',
      'A path must pass through a given waypoint (r,c). Factor the count into two smaller uniquePaths calls and justify the product.',
    ],
    solution:
      'function uniquePaths(m, n) {\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i < m; i += 1) dp.push(new Array(n).fill(1));\n' +
      '  for (let i = 1; i < m; i += 1) {\n' +
      '    for (let j = 1; j < n; j += 1) dp[i][j] = dp[i - 1][j] + dp[i][j - 1];\n' +
      '  }\n' +
      '  return dp[m - 1][n - 1];\n' +
      '}\n' +
      '\n' +
      'function uniquePathsBig(m, n) {\n' +
      '  const total = m + n - 2;\n' +
      '  const k = Math.min(m, n) - 1;\n' +
      '  let res = 1n;\n' +
      '  for (let i = 1; i <= k; i += 1) {\n' +
      '    res = (res * BigInt(total - k + i)) / BigInt(i);\n' +
      '  }\n' +
      '  return res;\n' +
      '}\n' +
      '\n' +
      'function uniquePathsMod(m, n, mod) {\n' +
      '  const row = new Array(n).fill(1);\n' +
      '  for (let i = 1; i < m; i += 1) {\n' +
      '    for (let j = 1; j < n; j += 1) row[j] = (row[j] + row[j - 1]) % mod;\n' +
      '  }\n' +
      '  return row[n - 1];\n' +
      '}',
    modify:
      'Add a step limit so a path may use at most D down-moves total. Which state does the count now need, and does the closed form still apply?',
  },
  {
    step: 16,
    name: 'Grid Unique Paths II',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Count the same right/down paths but with blocked cells, and specify the two blocked positions that collapse the whole count.',
    brief:
      'Input: a grid where 1 marks an obstacle and 0 an open cell. Output: the number of monotone paths avoiding obstacles. The constraint is that an obstacle zeroes a cell, and an obstacle on either the start or the goal forces the answer to 0 regardless of the rest.',
    concepts: [
      'dsa-dp16a-count-paths-overflow-or-modulo',
      'dsa-dp16a-first-row-col-base-of-grid-dp',
      'dsa-boundary-conditions',
      'dsa-coordinate-loops',
    ],
    shortAnswer:
      'dp[i][j] = 0 if (i,j) is blocked, else dp[i-1][j] + dp[i][j-1]; the base dp[0][0] = 1 unless the start is blocked, and an obstacle anywhere on the forced top/left edge cuts every path behind it to 0.',
    idealAnswer:
      'The sibling row counts with a pure two-parent sum; an obstacle simply makes that sum read 0 at the blocked cell and propagate, so the same DP works with one guard: a blocked cell contributes 0 ways and thereby starves everything downstream. The two positions that decide the whole answer are the corners. An obstacle on the start (0,0) means you never enter the grid, and an obstacle on the goal (m-1,n-1) means you can never finish — both give 0, and a candidate who seeds dp[0][0]=1 unconditionally gets the start case wrong. The subtler trap is the forced edges: with only right/down moves, cell (0,j) is reachable only along the top row, so a single obstacle at (0,2) makes every (0,j) for j>=2 zero, and the seed loop must stop filling 1s at the first obstacle rather than blanket-filling the row. Everything past those edges then behaves like the clean row, and the count still inherits the overflow concern the clean row raised.',
    walkthrough:
      'Grid [[0,0,0],[0,1,0],[0,0,0]] with the obstacle at the centre (1,1). Seed dp[0][0]=1, row0=1,1,1; column0=1,1,1. Filling: dp[1][1]=0 (obstacle). dp[1][2]=dp[0][2]+dp[1][1]=1+0=1. dp[2][1]=dp[1][1]+dp[2][0]=0+1=1. dp[2][2]=dp[1][2]+dp[2][1]=1+1=2. So uniquePathsWithObstacles=2 — the centre obstacle kills the four straight-through routes and leaves the two that hug an edge. Now the boundary cases: [[1]] has the start blocked, answer 0; [[0,0],[0,1]] has the goal blocked, answer 0; [[1,0],[0,0]] has the start blocked, answer 0 even though open cells exist. A no-obstacle [[0,0,0],[0,0,0],[0,0,0]] reproduces the clean row and gives 6, and [[0]] gives 1.',
    commonMistake:
      'Blanket-filling the first row and column with 1s before checking for obstacles, or setting the start cell to 1 without looking at whether it is itself blocked.',
    whyWrong:
      'Blanket 1-seeding is wrong the moment an obstacle sits on a forced edge: on [[0,1,0],[0,0,0]] the top row past (0,1) is unreachable, yet a blanket seed marks (0,2)=1 and then leaks a phantom route into every cell below-right, overcounting paths that "teleport" across the obstacle. Similarly dp[0][0]=1 unconditionally makes [[1,0],[0,0]] report a positive count for a grid with a blocked start; the correct seed is dp[0][0] = (grid[0][0] === 1 ? 0 : 1), which is the whole start-blocked contract in one ternary.',
    followUps: [
      'Roll the counting to one row. What does an obstacle do to that single dp[j] cell, and why must you reset it to 0 rather than skip it?',
      'Obstacles can now also be removed at a cost of k coins. What extra state does that add and how does the two-parent sum change?',
      'Give an obstacle layout where the answer is 0 despite both the start and goal being open. What property of the grid made it unreachable?',
      'The grid is 10^5 x 10^5 sparse with obstacles given as a list. Why does a full DP table fail and what replaces it?',
    ],
    solution:
      'function uniquePathsWithObstacles(grid) {\n' +
      '  const m = grid.length;\n' +
      '  const n = grid[0].length;\n' +
      '  if (grid[0][0] === 1) return 0;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i < m; i += 1) dp.push(new Array(n).fill(0));\n' +
      '  dp[0][0] = 1;\n' +
      '  for (let j = 1; j < n; j += 1) dp[0][j] = grid[0][j] === 1 ? 0 : dp[0][j - 1];\n' +
      '  for (let i = 1; i < m; i += 1) dp[i][0] = grid[i][0] === 1 ? 0 : dp[i - 1][0];\n' +
      '  for (let i = 1; i < m; i += 1) {\n' +
      '    for (let j = 1; j < n; j += 1) {\n' +
      '      if (grid[i][j] === 1) dp[i][j] = 0;\n' +
      '      else dp[i][j] = dp[i - 1][j] + dp[i][j - 1];\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[m - 1][n - 1];\n' +
      '}',
    modify:
      'Treat an obstacle as passable at most once. Which second state dimension (obstacle used or not) turns the single count into a pair of counts per cell?',
  },
  {
    step: 16,
    name: 'Minimum Path Sum in Grid',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Walk right and down across a cost grid and return the cheapest total cost from the top-left to the bottom-right, contrasting it with the counting sibling.',
    brief:
      'Input: an m x n grid of positive cell costs. Output: the minimum sum of costs along a right/down path. The constraint is the same two-parent structure as unique paths, but the combination operator flips from sum to min-plus.',
    concepts: [
      'dsa-dp16a-first-row-col-base-of-grid-dp',
      'dsa-memo-decision-table',
      'dsa-coordinate-loops',
      'dsa-complexity-counting',
    ],
    shortAnswer:
      'dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]); the top row and left column are forced running sums (only one way to reach them), and every interior cell adds its own cost to the cheaper of the two parents.',
    idealAnswer:
      'This is the counting grid with min instead of +: a path into (i,j) still comes from above or from the left, but you now want the cheapest so you take the min of the two parent totals and pay grid[i][j] once. That single swap turns an enumeration into an optimisation and it is the exact structural twin of the DP-3 frog — min over two named predecessors. The base matters most here: the first row is a prefix sum of the costs going right (there is no alternative), the first column likewise going down, so dp[0][j]=dp[0][j-1]+grid[0][j] and dp[i][0]=dp[i-1][0]+grid[i][0]. Cost is O(mn) time, and O(n) space by rolling one row, because a cell only reads its top (previous row, same column) and left (current row, previous column). The trap is treating dp[0][0] as 0 and then double-counting grid[0][0], or seeding interior cells before the edges so a min silently reads an unfilled neighbour.',
    walkthrough:
      'Grid [[1,3,1],[1,5,1],[4,2,1]]. Seed dp[0][0]=1; row0 = 1, 4, 5; column0 = 1, 2, 6. Interior: dp[1][1]=5+min(dp[0][1]=4, dp[1][0]=2)=5+2=7; dp[1][2]=1+min(dp[0][2]=5, dp[1][1]=7)=1+5=6; dp[2][1]=2+min(dp[1][1]=7, dp[2][0]=6)=2+6=8; dp[2][2]=1+min(dp[1][2]=6, dp[2][1]=8)=1+6=7. The dp array reads row0 1,4,5 | row1 2,7,6 | row2 6,8,7, so minPathSum=7 (route 1->3->1->1). The memoised form returns 7 too. A single cell [[5]]=5, a single row [[1,2,3]]=6 (no choice, must traverse all), and [[1,2],[3,4]] = 1+2+4 = 7 (minPathSum) versus the alternative 1+3+4=8. The wider grid [[7,1,3,5],[9,6,4,2],[8,3,1,6],[1,9,5,4]] bottoms out at 25.',
    commonMistake:
      'Seeding dp with grid[0][0] separately from a dp[0][0]=0 origin and then adding grid[0][0] again, or min-ing over an unfilled interior neighbour.',
    whyWrong:
      'A common way to write this is dp[0][0]=grid[0][0] with the edges as running sums; if instead you leave a 0 origin and add costs, the start cell is counted once in the seed and again when it is read as a parent, inflating every path by grid[0][0]. The unfilled-neighbour bug is subtler and shows on [[1,2],[3,4]]: fill row-major correctly and dp[1][1]=4+min(3,3)... wait the parents are dp[0][1]=3 and dp[1][0]=4, giving 4+3=7; if you had left dp[0][1] unfilled (0) the min would read 0 and report 4, a route that does not exist, because you are comparing against a cell that has not earned its cost yet.',
    followUps: [
      'Roll to O(n) space. Which cell in the rolling array holds the previous row value and which the current-row left neighbour?',
      'Reconstruct the actual cheapest route as coordinates. Does the rolling form lose the ability to do that, and what extra array restores it?',
      'Flip min to max for the costliest right/down route. Which seed values (the edge prefix sums) have to change, and does the code otherwise stay identical?',
      'Allow diagonal moves down-right too. Add the third parent and state whether the space-rolling still works.',
    ],
    solution:
      'function minPathSum(grid) {\n' +
      '  const m = grid.length;\n' +
      '  const n = grid[0].length;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i < m; i += 1) dp.push(new Array(n).fill(0));\n' +
      '  dp[0][0] = grid[0][0];\n' +
      '  for (let j = 1; j < n; j += 1) dp[0][j] = dp[0][j - 1] + grid[0][j];\n' +
      '  for (let i = 1; i < m; i += 1) dp[i][0] = dp[i - 1][0] + grid[i][0];\n' +
      '  for (let i = 1; i < m; i += 1) {\n' +
      '    for (let j = 1; j < n; j += 1) dp[i][j] = grid[i][j] + Math.min(dp[i - 1][j], dp[i][j - 1]);\n' +
      '  }\n' +
      '  return dp[m - 1][n - 1];\n' +
      '}\n' +
      '\n' +
      'function minPathSumMemo(grid) {\n' +
      '  const m = grid.length;\n' +
      '  const n = grid[0].length;\n' +
      '  const memo = [];\n' +
      '  for (let i = 0; i < m; i += 1) memo.push(new Array(n).fill(-1));\n' +
      '  const solve = (i, j) => {\n' +
      '    if (i === 0 && j === 0) return grid[0][0];\n' +
      '    if (i < 0 || j < 0) return Infinity;\n' +
      '    if (memo[i][j] !== -1) return memo[i][j];\n' +
      '    memo[i][j] = grid[i][j] + Math.min(solve(i - 1, j), solve(i, j - 1));\n' +
      '    return memo[i][j];\n' +
      '  };\n' +
      '  return solve(m - 1, n - 1);\n' +
      '}',
    modify:
      'Costs can now be negative. Which of the two seed loops (first row, first column) becomes risky, and why does the interior recurrence still hold?',
  },
  {
    step: 16,
    name: 'Minimum Path Sum in Triangular Grid',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Find the cheapest top-to-bottom path through a number triangle where each step moves to an adjacent row cell, and do it with a single shrinking array.',
    brief:
      'Input: a triangle as a list of rows where row i has i+1 entries. Output: the minimum root-to-base path sum, moving down to index j or j+1. The constraint is the adjacency in a widening index space, so bottom-up collapses each row into one array.',
    concepts: [
      'dsa-dp16a-bottom-up-collapses-triangle',
      'dsa-memo-decision-table',
      'dsa-recursive-decomposition',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      'Work bottom-up: seed with the base row, then dp[j] = triangle[i][j] + min(dp[j], dp[j+1]) as each row folds up into the one below; the single surviving cell is the answer. Top-down, dp[i][j] = val + min(under j, under j+1).',
    idealAnswer:
      'The triangle is a DAG where cell (i,j) can step to (i+1,j) or (i+1,j+1), so the minimum path from the top is val plus the cheaper of the two cells below it. Written top-down you need a memo because the same lower cell is reached from two parents. The elegant form is bottom-up: start dp as a copy of the base row and push each higher row down, dp[j] = triangle[i][j] + min(dp[j], dp[j+1]); the adjacency means the two parents of any cell are exactly dp[j] and dp[j+1], so a single array of the widest-row length is reused in place and the last surviving dp[0] is the answer — O(rows^2) time, O(rows) space, and no recursion. The trap is the index mapping: from cell (i,j) the reachable cells below are j and j+1, not j and j-1, so an off-by-one here silently re-routes every path; and a single-row triangle must return that lone value, negative included, with no min to take.',
    walkthrough:
      'Triangle [[2],[3,4],[6,5,7],[4,1,8,3]]. Seed dp from the base row = [4,1,8,3]. Fold row [6,5,7]: dp[0]=6+min(4,1)=7, dp[1]=5+min(1,8)=6, dp[2]=7+min(8,3)=10, so dp=[7,6,10,3]. Fold row [3,4]: dp[0]=3+min(7,6)=9, dp[1]=4+min(6,10)=10, dp=[9,10,...]. Fold row [2]: dp[0]=2+min(9,10)=11. The answer is 11, the route 2->3->5->1. The memoised top-down gives the same 11. Edges: [[5]]=5 (single value, no parent min), [[-1]]=-1 keeps the negative, [[1],[1,1]]=1+1=2, and [[1],[2,3],[4,5,6]] folds to 1+min(2+min(4,5), 3+min(5,6)) = 1+min(6,8)=7.',
    commonMistake:
      'Folding top-down with a fixed-width array and reading dp[j] and dp[j-1] instead of dp[j] and dp[j+1], or taking Math.min over the whole row below rather than the two adjacent cells.',
    whyWrong:
      'The adjacency of this triangle is j and j+1 (a lower-left and lower-right neighbour both at index j and j+1 beneath column j); using dp[j-1] shifts every fold one cell and, at dp[0], reads dp[-1]=undefined, so min(undefined, x)=NaN and the whole array turns to NaN. Reading the entire row below is the other error: it assumes the frog can land on any lower cell, which is the k-unbounded jump of DP-4, not this adjacency-restricted triangle; on [[1],[1,100],[1,1,1]] the wrong rule lets a path dodge to a cheap far cell and returns a total no legal j/j+1 walk can reach.',
    followUps: [
      'Prove dp[0] at the end is the answer, not the min of the array. Why does the top cell dominate?',
      'Do it top-down with memo over (i,j). What are the two base conditions and where is Infinity needed instead of a hard min?',
      'Return the path values, not the sum. Which direction of reconstruction (top-down or bottom-up) is easier with the collapsed array, and why?',
      'The triangle is given as a flat array with row boundaries. What index arithmetic maps (i,j) and (i+1,j+1) and where does it overflow?',
    ],
    solution:
      'function minimumTriangleSum(triangle) {\n' +
      '  const rows = triangle.length;\n' +
      '  if (rows === 0) return 0;\n' +
      '  const dp = triangle[rows - 1].slice();\n' +
      '  for (let i = rows - 2; i >= 0; i -= 1) {\n' +
      '    for (let j = 0; j <= i; j += 1) {\n' +
      '      dp[j] = triangle[i][j] + Math.min(dp[j], dp[j + 1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[0];\n' +
      '}\n' +
      '\n' +
      'function minimumTriangleMemo(triangle) {\n' +
      '  const rows = triangle.length;\n' +
      '  if (rows === 0) return 0;\n' +
      '  const memo = [];\n' +
      '  for (let i = 0; i < rows; i += 1) memo.push(new Array(triangle[i].length).fill(-1));\n' +
      '  const solve = (i, j) => {\n' +
      '    if (i === rows - 1) return triangle[i][j];\n' +
      '    if (memo[i][j] !== -1) return memo[i][j];\n' +
      '    memo[i][j] = triangle[i][j] + Math.min(solve(i + 1, j), solve(i + 1, j + 1));\n' +
      '    return memo[i][j];\n' +
      '  };\n' +
      '  return solve(0, 0);\n' +
      '}',
    modify:
      'Change the movement rule so from (i,j) you may drop to any cell of row i+1 whose column is within [j, j+2]. Which index bound in the inner loop widens and what does the collapse array length become?',
  },
  {
    step: 16,
    name: 'Minimum / Maximum Falling Path Sum',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Drop a path from any top-row cell to the bottom, moving down or diagonally down by one column, and return both the cheapest and the most expensive such total.',
    brief:
      'Input: an n x n matrix. Output: the minimum and maximum falling-path sums, where a falling step from (i,j) goes to (i+1, j-1), (i+1, j) or (i+1, j+1) within bounds. The constraint is the three-wide parent window and the two extreme edge columns that lose a neighbour.',
    concepts: [
      'dsa-dp16a-three-way-window-falling-path',
      'dsa-include-exclude-branch',
      'dsa-boundary-conditions',
      'dsa-coordinate-loops',
    ],
    shortAnswer:
      'dp[i][j] = a[i][j] + best-of(dp[i-1][j-1], dp[i-1][j], dp[i-1][j+1]); the top row seeds from a[0]; out-of-range columns are masked with +Infinity for the min and -Infinity for the max so an edge never reaches off-grid.',
    idealAnswer:
      'A falling path is a chain that descends one row at a time and drifts at most one column, so each cell has up to three parents in the row above and the DP is min (or max) over that three-wide window plus the cell cost. Unlike the right/down grid you may start from any top-row cell, so the base is the entire first row rather than one seeded corner. The single structural trap is the two edge columns: column 0 has no j-1 parent and column n-1 has no j+1 parent, and the correct handling is to treat a missing parent as +Infinity for the minimum and -Infinity for the maximum so it can never win the comparison — a candidate who instead clamps the index (reading dp[i][0] for a nonexistent dp[i][-1]) double-counts the edge column and lets a legal path look illegally cheap or expensive. Cost is O(n^2) time, O(n) space rolled row, and the min and max are the same loop with the operator and the infinity signs flipped.',
    walkthrough:
      'Matrix [[2,1,3],[6,5,4],[7,8,9]] (min) = 13: row0 dp=[2,1,3]; row1 dp=[6+min(2,1)=7, 5+min(2,1,3)=6, 4+min(1,3)=5]; row2 dp=[7+min(7,6)=13, 8+min(7,6,5)=13, 9+min(6,5)=14], so minFallingPathSum=13 via the route 1 -> 4 -> 8. Same matrix (max): row1 max [6+max(2,1)=8, 5+max(2,1,3)=8, 4+max(1,3)=7]; row2 max [7+max(8,8)=15, 8+max(8,8,7)=16, 9+max(8,7)=17], so maxFallingPathSum=17 via 3 -> 4 -> 9? actually 3 -> 4 -> 9 sums to 16 while 3 -> 5 -> 9 hits 17 once the max-parent rule sees row1 dp=[8,8,7] and col2 takes 7+9=16; the rolled row is what makes the answer 17, so read the parent maxes, not the values themselves. Edge masking shows at column 0 and column m-1: a single row [[40]] gives min=max=40; [[1,2,3]] gives min=1 and max=3 because there is no descent to make. The wider 4x4 grid [[-19,15,7,0],[8,15,15,9],[4,-16,-7,-5],[3,2,-8,8]] bottoms the min at -35, the route -19 (row0 col0) then 8 (row1 col0) then -16 (row2 col1) then -8 (row3 col2); the last step is legal because column 2 sits within one of column 1, which is exactly why the three-wide window and the negative-infinity edge mask matter — clamp dp[i-1][j-1] at column 0 and the whole chain shifts.',
    commonMistake:
      'Clamping an out-of-range parent column to the nearest valid column, or seeding only dp[0][0] instead of the whole top row.',
    whyWrong:
      "Clamping dp[i-1][-1] to dp[i-1][0] fabricates a parent for the left edge; on [[1,2],[3,4]] it makes column 0 of row 1 see dp[0][0]=1 twice, and the min at row1 col0 becomes 3+1 while the real window (no left neighbour, dp[0][0] and dp[0][1]) is what you get with correct +Infinity masking — but on wider grids the clamp lets an illegal diagonal-into-the-wall path win, changing results like the -22 grid to a smaller bogus value. Seeding only dp[0][0]=a[0][0] and leaving the rest of row 0 at 0 would let any path start from column 0 with no cost and then claim to have come from the top-left, silently forbidding the legal starts at other top cells; a falling path may begin at any column, so the whole first row is the base.",
    followUps: [
      'Roll the falling DP to two rows. Which three values from the previous row must you keep so the edge columns still mask correctly?',
      'Return the falling path that achieves the max, as a list of columns. What per-cell pointer does the rolled form have to restore?',
      'Make the fall also pay the absolute column shift. Where in the three-window does that extra term go and does it break the min/max symmetry?',
      'Extend to a 3-wide window that can also skip a row (fall two rows at once). How many parents per cell now, and what does that do to the constant?',
    ],
    solution:
      'function fallingBest(grid, pick, worse) {\n' +
      '  const n = grid.length;\n' +
      '  const m = grid[0].length;\n' +
      '  let prev = grid[0].slice();\n' +
      '  for (let i = 1; i < n; i += 1) {\n' +
      '    const cur = new Array(m);\n' +
      '    for (let j = 0; j < m; j += 1) {\n' +
      '      let best = prev[j];\n' +
      '      if (j > 0 && pick(prev[j - 1], best) === prev[j - 1]) best = prev[j - 1];\n' +
      '      if (j + 1 < m && pick(prev[j + 1], best) === prev[j + 1]) best = prev[j + 1];\n' +
      '      cur[j] = grid[i][j] + best;\n' +
      '    }\n' +
      '    prev = cur;\n' +
      '  }\n' +
      '  let res = prev[0];\n' +
      '  for (let j = 1; j < m; j += 1) if (pick(prev[j], res) === prev[j]) res = prev[j];\n' +
      '  return res;\n' +
      '}\n' +
      '\n' +
      'function minFallingPathSum(grid) {\n' +
      '  return fallingBest(grid, (a, b) => Math.min(a, b), Infinity);\n' +
      '}\n' +
      '\n' +
      'function maxFallingPathSum(grid) {\n' +
      '  return fallingBest(grid, (a, b) => Math.max(a, b), -Infinity);\n' +
      '}',
    modify:
      'Restrict the fall so the path may never move diagonally, only straight down. Which two of the three parent reads disappear and what does the answer reduce to per column?',
  },
  {
    step: 16,
    name: 'Cherry Pickup II (3D DP)',
    difficulty: 'Hard',
    topicSlug: 'dp-greedy',
    stem: 'Two robots start at the top corners and descend one row at a time collecting grid values; maximise the cherries they gather together, counting a shared cell once.',
    brief:
      'Input: a rows x cols grid of cherry counts. Output: the maximum cherries collected by robot A starting at (0,0) and robot B at (0, cols-1), each stepping to col-1/col/col+1 per row. The constraint is that both move in lockstep, so the state is (row, colA, colB).',
    concepts: [
      'dsa-dp16a-two-robots-same-step-3d',
      'dsa-include-exclude-branch',
      'dsa-recursive-decomposition',
      'dsa-memo-decision-table',
    ],
    shortAnswer:
      'dp[row][a][b] = collected(row,a,b) + max over the 3x3 next-column pairs of dp[row+1][a2][b2], where collected adds grid[row][a] plus grid[row][b] but counts the cell once when a === b; the shared row is why the state is 3-D not 4-D.',
    idealAnswer:
      'The key insight that collapses the state: because both robots move down exactly one row each step, their rows are always equal, so you do not need (rowA, colA, rowB, colB) — (row, colA, colB) suffices, three dimensions not four, cutting the table from O((mn)^2)-ish to O(rows * cols^2). Each state adds what the two robots collect on this row: grid[row][colA] + grid[row][colB], minus one of them if the columns coincide so a shared cell is double-counted otherwise. The transition enumerates the 3x3 grid of next positions (colA-1..colA+1 crossed with colB-1..colB+1) and keeps the best; out-of-range next columns and past-the-last-row are masked with negative infinity so a dead branch loses. Cost is O(rows * cols^2) states times a constant 9 transitions; the trap is forgetting the a===b term, which makes the answer too big exactly when the robots meet, and the boundary when cols=1 forces both robots onto the same single column every row.',
    walkthrough:
      'Grid [[3,1,1],[2,5,1],[1,5,5],[2,1,1]]. At row 0 robot A is at col 0 (3 cherries) and B at col 2 (1), differing, so the top row contributes 4. The memoised fill finds the best descent reaching A down the left-ish and B down the middle, meeting the shared 5s once each; the maximum is 24, the value cherryPickup returns. On [[0,3],[2,1]] the two robots start on different columns so row 0 pays 0+3=3; row 1 admits four (colA, colB) pairs, of which (0,1) and (1,0) keep the columns distinct and each pay 2+1=3, while (0,0) and (1,1) meet on the same cell and pay only the shared value — so the a === b guard is what stops (1,1) from claiming both 2s of the top row and (0,0) from claiming both 1s of the second. The shared-cell guard shows in the degenerate single-column grids: [[5]] has both robots on the one cell so collected(0,0,0)=5 not 10; [[2],[9],[5]] has A and B locked to column 0 every row so it sums 2+9+5=16, counting each row once; [[1,2,3]] is a single row with A at col 0 (1) and B at col 2 (3), distinct, giving 4.',
    commonMistake:
      'Using a 4-D state that also tracks each robot row separately, or adding grid[row][colA] + grid[row][colB] unconditionally so a shared cell is counted twice.',
    whyWrong:
      'The 4-D state is not wrong but wasteful: since the two robots advance in lockstep their row is always identical, so rowA and rowB are the same variable and you carry O(rows^2) states where O(rows) would do — a real 1000x1000 blow-up. The double-count bug is a genuine error and it hides until the paths cross: on [[5]] it returns 10 instead of 5, and on [[2],[9],[5]] it returns 32 instead of 16, because every row has the two robots on the same single column and the missing a===b guard pays each cell twice. The guard is the entire contract of "collect a shared cell once" and dropping it makes the robots look like they cooperate while actually claiming the same cherry.',
    followUps: [
      'Roll the 3-D table to a 2-D colA x colB plane per row. Which two rows do you swap and does the 3x3 transition still fit in-place?',
      'The two robots may start at any two top cells rather than the corners. What loop over start columns wraps this, and does the same-step argument still hold?',
      'Make robot B move at half speed. Does the shared row survive, and what state must the slower robot add?',
      'Report the cherries collected by each robot separately rather than the total. What extra arrays does the reconstruction need beyond the memo?',
    ],
    solution:
      'function cherryPickup(grid) {\n' +
      '  const rows = grid.length;\n' +
      '  const cols = grid[0].length;\n' +
      '  const memo = [];\n' +
      '  for (let r = 0; r < rows; r += 1) {\n' +
      '    const plane = [];\n' +
      '    for (let a = 0; a < cols; a += 1) plane.push(new Array(cols).fill(-1));\n' +
      '    memo.push(plane);\n' +
      '  }\n' +
      '  const solve = (row, a, b) => {\n' +
      '    if (row === rows) return 0;\n' +
      '    if (memo[row][a][b] !== -1) return memo[row][a][b];\n' +
      '    let gain = grid[row][a];\n' +
      '    if (a !== b) gain += grid[row][b];\n' +
      '    let bestNext = 0;\n' +
      '    let seen = false;\n' +
      '    for (let da = -1; da <= 1; da += 1) {\n' +
      '      for (let db = -1; db <= 1; db += 1) {\n' +
      '        const na = a + da;\n' +
      '        const nb = b + db;\n' +
      '        if (na < 0 || na >= cols || nb < 0 || nb >= cols) continue;\n' +
      '        const cand = solve(row + 1, na, nb);\n' +
      '        if (!seen || cand > bestNext) {\n' +
      '          bestNext = cand;\n' +
      '          seen = true;\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '    memo[row][a][b] = gain + bestNext;\n' +
      '    return memo[row][a][b];\n' +
      '  };\n' +
      '  return solve(0, 0, cols - 1);\n' +
      '}',
    modify:
      'The robots may also swap columns freely on the same row for no cost. Does the same-step row still hold as the only shared axis, and which transition branches collapse?',
  },
  {
    step: 16,
    name: 'Subset Sum Equal to K',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Decide whether some subset of given positive integers adds up to exactly k, and be ready to explain why a huge k is the hard part rather than a long list.',
    brief:
      'Input: an array of non-negative integers and a target k. Output: true if a subset sums to k. The constraint that decides the approach is that the target is part of the state, so the cost is pseudo-polynomial in k, not in the number of items.',
    concepts: [
      'dsa-dp16a-subset-sum-pseudo-polynomial',
      'dsa-dp16a-rolling-target-reverse-for-0-1',
      'dsa-include-exclude-branch',
      'dsa-memo-decision-table',
    ],
    shortAnswer:
      'dp[j] = "some subset reaches j", seeded dp[0]=true; for each number update j from k down to num with dp[j] |= dp[j-num]. The reverse sweep is what makes each item 0/1, and the O(n*k) cost is pseudo-polynomial.',
    idealAnswer:
      'The recurrence is include-or-exclude on each item: a target j is reachable if it was reachable without this item (dp[j]) or if j - num was reachable before spending this item. That is the whole 0/1 decision, and the two forms differ only in how the "before spending it" is enforced. With a 2-D table over (index, j) it reads naturally and costs O(n*k) space; collapse to 1-D and the requirement that num be used at most once forces you to iterate j downward, so that dp[j-num] still refers to the previous item-pass rather than a value already updated by the current item. The defining cost story is the one an interviewer probes: this is O(n*k) in the magnitude of k, and because k can be as large as the sum of the inputs (which is exponential in the number of bits needed to write the inputs), subset-sum is pseudo-polynomial and NP-complete — a list of thirty items totalling 10^9 makes the table impossible even though n is tiny, which is why meet-in-the-middle exists. Contract edges: target 0 is trivially true (empty subset), a target above the sum is false, and the empty list is false for any k > 0.',
    walkthrough:
      'nums=[3,34,4,12,5,2], k=15. Seed reachable[0]=1, rest 0. After 3: {3}=1. After 34 (skipped at j<34): {3,34,37}. After 4: adds 4,7,38 (4+3,4+34... capped to 15 keeps {4,7}). After 12: 12,15(12+3),... so 15 lights up — subset {3,4,...} wait 12+3=15, confirmed. After 5 and 2 the array (length 16) reads reachable at 0,2,3,4,5,6,7,8,9,10,11,12,14,15 and unreachable only at 1 and 13 — 1 is out because every item is at least 2, and 13 is out because none of {3,4,12,5,2} plus their combinations lands there while 34 is above the ceiling. The same run with the target loop going forward instead of backward would let a single 34 spawn 34,68 within one pass — the reverse order is what prevents re-spending. Edge cases: k=0 returns true (the empty subset sums to 0), and the sum of the whole array is 60, so k=64 is false because no subset can reach it while k=60 (all items) is true.',
    commonMistake:
      'Sweeping j upward in the 1-D table, or returning false for k=0 because you think the empty set has no subset.',
    whyWrong:
      'A forward sweep is the unbounded-knapsack loop: when you update dp[j] using a dp[j-num] that was already set true by this same item, you allow num to be spent multiple times, and on [3,34,4,12,5,2] a forward pass marks 6 reachable from two 3s — which is actually legal here — but on [5] with k=15 it would mark 15 reachable by spending the single 5 three times, returning true for a one-element array that can only make 0 or 5. The reverse loop is the difference. Returning false for k=0 is wrong because the empty subset has sum 0, which the dp[0]=true seed encodes; treating k=0 as false fails the very first base case and cascades into wrong answers for every target the empty set should reach.',
    followUps: [
      'Switch the loop to count subsets that sum to k rather than deciding existence. Where does |= become +=, and does the reverse-order rule still hold for counting?',
      'Give the meet-in-the-middle algorithm for n up to 40 with huge values. Why does it escape the pseudo-polynomial wall the table cannot?',
      'Numbers can be negative. Why does a single bounded dp[0..k] array stop working and what extra index range do you need?',
      'Reconstruct one subset that reaches k. What predecessor bookkeeping must the rolling array give up to stay 1-D?',
    ],
    solution:
      'function subsetSumsReachable(nums, k) {\n' +
      '  if (k < 0) return [];\n' +
      '  const dp = new Array(k + 1).fill(false);\n' +
      '  dp[0] = true;\n' +
      '  for (let idx = 0; idx < nums.length; idx += 1) {\n' +
      '    const num = nums[idx];\n' +
      '    for (let j = k; j >= num; j -= 1) {\n' +
      '      if (dp[j - num]) dp[j] = true;\n' +
      '    }\n' +
      '  }\n' +
      '  return dp;\n' +
      '}\n' +
      '\n' +
      'function subsetSumEqualsK(nums, k) {\n' +
      '  if (k < 0) return false;\n' +
      '  const dp = new Array(k + 1).fill(false);\n' +
      '  dp[0] = true;\n' +
      '  for (let idx = 0; idx < nums.length; idx += 1) {\n' +
      '    const num = nums[idx];\n' +
      '    for (let j = k; j >= num; j -= 1) {\n' +
      '      if (dp[j - num]) dp[j] = true;\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[k];\n' +
      '}\n' +
      '\n' +
      'function subsetSumEqualsK2d(nums, k) {\n' +
      '  const n = nums.length;\n' +
      '  const dp = [];\n' +
      '  for (let i = 0; i <= n; i += 1) {\n' +
      '    dp.push(new Array(k + 1).fill(false));\n' +
      '    dp[i][0] = true;\n' +
      '  }\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    for (let j = 1; j <= k; j += 1) {\n' +
      '      if (nums[i - 1] > j) dp[i][j] = dp[i - 1][j];\n' +
      '      else dp[i][j] = dp[i - 1][j] || dp[i - 1][j - nums[i - 1]];\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[n][k];\n' +
      '}',
    modify:
      'The same nums may be reused an unlimited number of times (unbounded coin reachability). Which one loop direction change turns 0/1 into unbounded, and what does k=15 reach on [5] then?',
  },
  {
    step: 16,
    name: 'Partition Equal Subset Sum',
    difficulty: 'Medium',
    topicSlug: 'dp-greedy',
    stem: 'Decide whether a list of positive integers splits into two groups with equal sums, and name the parity gate that rejects most inputs before any table is built.',
    brief:
      'Input: a non-empty array of positive integers. Output: true if it can be partitioned into two subsets of equal sum. The constraint is that equal halves require an even total, and then the problem is exactly subset-sum to total/2.',
    concepts: [
      'dsa-dp16a-partition-reduces-to-half-target',
      'dsa-dp16a-subset-sum-pseudo-polynomial',
      'dsa-dp16a-rolling-target-reverse-for-0-1',
      'dsa-memo-decision-table',
    ],
    shortAnswer:
      'If the total is odd return false; otherwise ask whether some subset sums to total/2, because whatever that subset leaves behind is the second half. That single reduction is the subset-sum table at k = total/2.',
    idealAnswer:
      'The partition question and the subset-sum question are the same decision wearing different hats: a subset summing to total/2 exists if and only if its complement also sums to total/2, so finding one half is finding the split. This immediately exposes the gate that must run before any O(n * total/2) work: an odd total has no integer half, so it is false outright, and checking parity first turns most random inputs into a constant-time rejection instead of a doomed table. The table itself is the sibling subset-sum 1-D DP with dp[0]=true and a reverse sweep, so it inherits pseudo-polynomial behaviour — the target is total/2, which for a 200-item array of large numbers is enormous, and no reordering of items shrinks the target because a number is a dimension here, not a count. The contract edges to assert: a single element is false (you cannot split one number into two non-empty equal halves, total/2 equals nothing it can reach), the empty array is true by the trivial 0=0 convention, and a minimum element larger than total/2 makes the table unreachable.',
    walkthrough:
      'nums=[1,5,11,5], total=22, half=11 (even, gate passes). The reverse-sweep table over j in 0..11 lights up reachable sums; 11 is hit by the single 11 itself, so canPartition=true and the halves are {11} and {1,5,5}. Now [1,2,3,5], total=11, which is odd, so the parity gate returns false without ever building a column — no subset can make a fractional half. [3,3,3,4,5] totals 18, half=9, and {4,5}=9, so true. [2,2,3,5] totals 12, half=6; reachable subset sums to 6? {2,... } 2+... 2+2=4, 2+5=7, 3+... no 6, so false, and canPartition([2,2,3,5])=false. [2,2] totals 4, half 2 reachable, true. Single [1] totals 1, odd, false; [100, 100, 100, 100] totals 400, half 200, and two 100s make exactly 200, so true; by contrast [100, 100, 100, 100, 100] totals 500 (half 250) and no subset of 100s reaches 250, so canPartition returns false even though the parity gate is passed — that is the target-magnitude trap this row inherits from its subset-sum sibling. The empty [] totals 0, half 0, and the seed dp[0]=true makes it trivially true.',
    commonMistake:
      'Building the full half-target table before checking parity, or treating the problem as "find any two subsets with equal sums" rather than "a subset and its exact complement".',
    whyWrong:
      "Skipping the parity gate is a correctness-adjacent performance trap: for an odd total like [1,2,3,5]=11 the table runs to completion and returns false anyway, wasting O(n*5) space and time on inputs the one-line total%2 test rejects instantly — on a 10^5-item array with huge values that is the difference between an answer and an out-of-memory crash. The 'any two equal subsets' misreading is the real bug: two disjoint subsets can have equal sums while still leaving leftover elements (on [1,2,3,3] you can find {1,2} and {3}, both sum 3, but the array cannot partition into two equal halves since its total is 9, odd), so requiring the subset to be exactly the complement of itself — sum precisely total/2, using every element once — is the constraint that makes this a partition and not a collision test.",
    followUps: [
      'You already have the 1-D reachable bit for the half target. How do you also report the size of the smaller partition without a second table?',
      'Change the ask to minimise the absolute difference between the two partition sums. Which reachable sum below half gives the best answer and why is it the largest such j?',
      'The array is all multiples of 3 and the total is even. Can that ever be false, and what does scaling the target by 3 do to the pseudo-polynomial cost?',
      'Report an actual partition. Which predecessor array must the rolling reverse sweep give up, and what does that cost in space?',
    ],
    solution:
      'function canPartition(nums) {\n' +
      '  const total = nums.reduce((a, b) => a + b, 0);\n' +
      '  if (total % 2 !== 0) return false;\n' +
      '  const half = total / 2;\n' +
      '  const dp = new Array(half + 1).fill(false);\n' +
      '  dp[0] = true;\n' +
      '  for (let idx = 0; idx < nums.length; idx += 1) {\n' +
      '    const num = nums[idx];\n' +
      '    for (let j = half; j >= num; j -= 1) {\n' +
      '      if (dp[j - num]) dp[j] = true;\n' +
      '    }\n' +
      '  }\n' +
      '  return dp[half];\n' +
      '}\n' +
      '\n' +
      'function partitionDifference(nums) {\n' +
      '  const total = nums.reduce((a, b) => a + b, 0);\n' +
      '  const half = Math.floor(total / 2);\n' +
      '  const dp = new Array(half + 1).fill(false);\n' +
      '  dp[0] = true;\n' +
      '  for (let idx = 0; idx < nums.length; idx += 1) {\n' +
      '    const num = nums[idx];\n' +
      '    for (let j = half; j >= num; j -= 1) {\n' +
      '      if (dp[j - num]) dp[j] = true;\n' +
      '    }\n' +
      '  }\n' +
      '  let best = 0;\n' +
      '  for (let j = half; j >= 0; j -= 1) {\n' +
      '    if (dp[j]) {\n' +
      '      best = j;\n' +
      '      break;\n' +
      '    }\n' +
      '  }\n' +
      '  return total - 2 * best;\n' +
      '}',
    modify:
      'You must split into exactly two groups that are also equal in count of elements, not just equal in sum. Which extra dimension (number of items used) has to enter the table?',
  },
];

export const expects: Record<string, string> = {
  'Introduction to DP (Memoization & Tabulation)':
    '(() => { return fibRecursive(0) === 0 && fibRecursive(1) === 1 && fibRecursive(10) === 55 && fibMemo(10) === 55 && fibMemo(20) === 6765 && fibTabulated(20) === 6765 && fibTabulated(30) === 832040 && fibRolling(30) === 832040 && fibRolling(50) === 12586269025 && fibMemo(0) === 0 && fibTabulated(0) === 0 && fibRolling(1) === 1 && countNaiveFib(10) === 177 && countMemoFibCalls(4) === 7 && countMemoFibCalls(30) === 59 && fibMemo(30) === fibTabulated(30); })()',
  'Climbing Stars':
    '(() => { return climbWays(1) === 1 && climbWays(2) === 2 && climbWays(3) === 3 && climbWays(5) === 8 && climbWays(10) === 89 && climbWays(20) === 10946 && climbWaysMemo(20) === 10946 && climbWaysRolling(10) === 89 && climbWaysRolling(1) === 1 && climbWays(0) === 1 && climbWaysRolling(0) === 1 && climbWaysMemo(0) === 1 && climbWays(20) === climbWaysRolling(20); })()',
  'Frog Jump (DP-3)':
    '(() => { const a = [10, 20, 30]; const b = [30, 10, 60, 10]; const c = [10]; const d = [40, 30, 10, 20, 25]; return frogJump(a) === 20 && frogJump(b) === 20 && frogJumpFrom(b) === 20 && frogJumpFrom(a) === 20 && frogJump(c) === 0 && frogJumpFrom(c) === 0 && frogJump([10, 20]) === 10 && frogJump(d) === 25 && frogJumpFrom(d) === 25; })()',
  'Frog Jump with K distances (DP-4)':
    '(() => { const h = [20, 30, 40, 10, 20, 50]; return frogJumpK(h, 1) === 90 && frogJumpK(h, 2) === 70 && frogJumpK(h, 3) === 30 && frogJumpK([10, 20, 30], 2) === 20 && frogJumpK([10], 3) === 0 && frogJumpK([10, 20], 1) === 10 && frogJumpK([30, 10, 60, 10], 2) === 20 && frogJumpK([5], 10) === 0; })()',
  'Maximum Sum of Non-Adjacent Elements (House Robber)':
    '(() => { const a = [1, 2, 3, 1]; const b = [5, 1, 1, 5]; const c = [2, 1, 4, 9, 6]; return maxNonAdjacent(a) === 4 && maxNonAdjacentMemo(a) === 4 && maxNonAdjacent(b) === 10 && maxNonAdjacentMemo(b) === 10 && maxNonAdjacent(c) === 12 && maxNonAdjacentMemo(c) === 12 && maxNonAdjacent([10]) === 10 && maxNonAdjacent([5, 5]) === 5 && maxNonAdjacent([]) === 0 && maxNonAdjacentMemo([]) === 0; })()',
  'House Robber II':
    '(() => { return robRing([2, 3, 2]) === 3 && robRing([1, 2, 3, 1]) === 4 && robRing([2, 7, 9, 3, 1]) === 11 && robRing([1]) === 1 && robRing([]) === 0 && robRing([1, 2]) === 2 && robRing([1, 2, 3]) === 3 && maxNonAdjacentLinear([1, 2, 3]) === 4 && robRing([1, 2, 3]) < maxNonAdjacentLinear([1, 2, 3]) && robRow([2, 7, 9, 3, 1], 1, 4) === 10; })()',
  "Ninja's Training":
    '(() => { const p = [[10, 40, 70], [20, 50, 80], [30, 60, 90]]; return ninjaTraining(p) === 210 && ninjaTrainingMemo(p) === 210 && ninjaTraining([[1, 2, 3]]) === 3 && ninjaTraining([]) === 0 && ninjaTraining([[5, 5, 5], [5, 5, 5]]) === 10 && ninjaTraining([[1, 100, 100], [100, 1, 100], [100, 100, 1]]) === 300 && ninjaTrainingMemo([[1, 100, 100], [100, 1, 100], [100, 100, 1]]) === 300; })()',
  'Grid Unique Paths':
    '(() => { return uniquePaths(3, 7) === 28 && uniquePaths(7, 3) === 28 && uniquePaths(1, 1) === 1 && uniquePaths(2, 2) === 2 && uniquePaths(3, 3) === 6 && uniquePaths(10, 10) === 48620 && uniquePaths(1, 5) === 1 && uniquePaths(5, 1) === 1 && uniquePathsBig(10, 10) === 48620n && uniquePathsBig(20, 20) === 35345263800n && uniquePathsMod(20, 20, 1000) === 800 && uniquePathsMod(10, 10, 97) === 23; })()',
  'Grid Unique Paths II':
    '(() => { return uniquePathsWithObstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]) === 2 && uniquePathsWithObstacles([[0, 1], [0, 0]]) === 1 && uniquePathsWithObstacles([[1]]) === 0 && uniquePathsWithObstacles([[0, 0], [0, 1]]) === 0 && uniquePathsWithObstacles([[0]]) === 1 && uniquePathsWithObstacles([[0, 0, 0], [0, 0, 0], [0, 0, 0]]) === 6 && uniquePathsWithObstacles([[1, 0], [0, 0]]) === 0 && uniquePathsWithObstacles([[0, 1, 0], [0, 0, 0]]) === 1; })()',
  'Minimum Path Sum in Grid':
    '(() => { const g = [[1, 3, 1], [1, 5, 1], [4, 2, 1]]; const w = [[7, 1, 3, 5], [9, 6, 4, 2], [8, 3, 1, 6], [1, 9, 5, 4]]; return minPathSum(g) === 7 && minPathSumMemo(g) === 7 && minPathSum([[5]]) === 5 && minPathSum([[1, 2, 3]]) === 6 && minPathSum([[1, 2], [3, 4]]) === 7 && minPathSum(w) === 25 && minPathSumMemo(w) === 25 && minPathSum([[1, 2], [1, 100]]) === 102 && minPathSumMemo([[1, 2], [1, 100]]) === 102; })()',
  'Minimum Path Sum in Triangular Grid':
    '(() => { const t = [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]; return minimumTriangleSum(t) === 11 && minimumTriangleMemo(t) === 11 && minimumTriangleSum([[5]]) === 5 && minimumTriangleSum([[-1]]) === -1 && minimumTriangleSum([[1], [1, 1]]) === 2 && minimumTriangleSum([[1], [2, 3], [4, 5, 6]]) === 7 && minimumTriangleMemo([[1], [2, 3], [4, 5, 6]]) === 7 && minimumTriangleSum([[2], [9, 5]]) === 7; })()',
  'Minimum / Maximum Falling Path Sum':
    '(() => { const m = [[2, 1, 3], [6, 5, 4], [7, 8, 9]]; const big = [[-19, 15, 7, 0], [8, 15, 15, 9], [4, -16, -7, -5], [3, 2, -8, 8]]; return minFallingPathSum(m) === 13 && maxFallingPathSum(m) === 17 && minFallingPathSum([[40]]) === 40 && maxFallingPathSum([[40]]) === 40 && minFallingPathSum(big) === -35 && minFallingPathSum([[1, 2, 3]]) === 1 && maxFallingPathSum([[1, 2, 3]]) === 3 && maxFallingPathSum([[40]]) === 40; })()',
  'Cherry Pickup II (3D DP)':
    '(() => { const a = [[3, 1, 1], [2, 5, 1], [1, 5, 5], [2, 1, 1]]; return cherryPickup(a) === 24 && cherryPickup([[0, 3], [2, 1]]) === 6 && cherryPickup([[1, 2, 3]]) === 4 && cherryPickup([[5]]) === 5 && cherryPickup([[2], [9], [5]]) === 16 && cherryPickup([[0, 0], [0, 0]]) === 0; })()',
  'Subset Sum Equal to K':
    '(() => { const a = [3, 34, 4, 12, 5, 2]; return subsetSumEqualsK(a, 15) === true && subsetSumEqualsK(a, 1) === false && subsetSumEqualsK(a, 13) === false && subsetSumEqualsK(a, 30) === false && subsetSumEqualsK(a, 0) === true && subsetSumEqualsK(a, 60) === true && subsetSumEqualsK(a, 64) === false && subsetSumEqualsK2d(a, 15) === true && subsetSumEqualsK2d(a, 1) === false && subsetSumEqualsK([], 5) === false && subsetSumEqualsK([], 0) === true && subsetSumEqualsK([2], 2) === true && subsetSumEqualsK([2], 1) === false && subsetSumEqualsK([5], 15) === false && subsetSumsReachable(a, 15)[3] === true && subsetSumsReachable(a, 15)[1] === false; })()',
  'Partition Equal Subset Sum':
    '(() => { return canPartition([1, 5, 11, 5]) === true && canPartition([1, 2, 3, 5]) === false && canPartition([3, 3, 3, 4, 5]) === true && canPartition([1]) === false && canPartition([]) === true && canPartition([2, 2]) === true && canPartition([1, 1]) === true && canPartition([2, 2, 3, 5]) === false && canPartition([100, 100, 100, 100]) === true && partitionDifference([1, 2, 3, 5]) === 1 && partitionDifference([1, 2, 3, 4]) === 0 && partitionDifference([1, 5, 11, 5]) === 0; })()',
};
