import type { ConceptSpec } from './types';

/**
 * Striver's A2Z sheet, in the app's own terms.
 *
 * The sheet supplies the problem list — step, name, difficulty — and nothing else: its link
 * column points at unrelated LeetCode rows, so the statement, the technique concepts, the
 * JavaScript solution and the explanation are authored here against EngineerOS's rubric. A
 * problem lands in the bank only when all of that exists; the list is not padded with rows
 * that have a title and no answer model.
 */
export type SheetDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface DsaProblem {
  /** the sheet's `Step n`; the importer matches the row on step + name */
  step: number;
  /** exactly as the sheet writes it, so the verifier can find the row */
  name: string;
  difficulty: SheetDifficulty;
  topicSlug: string;
  /** the ask, in one line — this is what the learner reads first */
  stem: string;
  /** input, output and the constraint that decides the approach */
  brief: string;
  /** keys of DSA_CONCEPTS a strong answer has to touch */
  concepts: string[];
  shortAnswer: string;
  idealAnswer: string;
  /** why the mechanism works, not just that it does */
  walkthrough: string;
  commonMistake: string;
  whyWrong: string;
  followUps: string[];
  /** the reference JavaScript, plus the one change that breaks or extends it */
  solution: string;
  modify: string;
}

/**
 * Concepts are global rows in the schema, so each one is defined exactly once here and every
 * problem refers to it by key. Reusing a concept across problems is the point: the same term
 * set is what makes the ladder rung mean something rather than being one drill's vocabulary.
 */
export const DSA_CONCEPTS = {
  'dsa-digit-extraction': {
    slug: 'dsa-digit-extraction',
    name: 'Digits fall out through division and modulus',
    detail: 'n % 10 is the last digit, Math.floor(n / 10) drops it; repeat until zero.',
    terms: ['modulus', 'divide by ten', 'last digit', 'floor division', 'remainder'],
    weight: 2,
  },
  'dsa-double-precision': {
    slug: 'dsa-double-precision',
    name: 'JS numbers are doubles, not int32',
    detail: 'Everything is a float64 with a 53-bit integer window; overflow questions must be answered in JS terms.',
    terms: ['floating point', 'safe integer', 'number.MAX_SAFE_INTEGER', 'precision', 'float64'],
    weight: 2,
  },
  'dsa-euclid-gcd': {
    slug: 'dsa-euclid-gcd',
    name: "Euclid's algorithm for GCD",
    detail: 'gcd(a, b) = gcd(b, a % b); the remainder shrinks fast enough to be logarithmic.',
    terms: ['euclid', 'remainder', 'a % b', 'recursively', 'gcd'],
    weight: 2,
  },
  'dsa-trial-division-sqrt': {
    slug: 'dsa-trial-division-sqrt',
    name: 'Divisors come in pairs, so trial division stops at sqrt(n)',
    detail: 'Past the square root every factor has already been found as the pair of a smaller one.',
    terms: ['square root', 'pair', 'trial division', 'factor', 'i * i <= n'],
    weight: 2,
  },
  'dsa-recursive-decomposition': {
    slug: 'dsa-recursive-decomposition',
    name: 'A recursive function is one step plus a smaller copy',
    detail: 'The base case stops it; the body must strictly reduce the argument toward that case.',
    terms: ['base case', 'recursive case', 'smaller input', 'call itself', 'terminates'],
    weight: 2,
  },
  'dsa-call-stack-cost': {
    slug: 'dsa-call-stack-cost',
    name: 'Every call costs a stack frame',
    detail: 'Parameters, locals and the return address live in a frame until the call returns; depth is memory.',
    terms: ['stack frame', 'call stack', 'activation record', 'stack overflow', 'depth'],
    weight: 2,
  },
  'dsa-memoization': {
    slug: 'dsa-memoization',
    name: 'Memoization turns a call tree into a line',
    detail: 'Repeated subproblems are stored once and looked up, collapsing exponential branching to linear work.',
    terms: ['memo', 'cache', 'overlap', 'reuse results', 'exponential'],
    weight: 2,
  },
  'dsa-single-pass-tracking': {
    slug: 'dsa-single-pass-tracking',
    name: 'One pass with a running candidate beats sorting',
    detail: 'Track the best seen so far while scanning instead of paying to order the whole input.',
    terms: ['single pass', 'running', 'keep the best', 'one scan', 'without sorting'],
    weight: 2,
  },
  'dsa-two-pointer': {
    slug: 'dsa-two-pointer',
    name: 'Two pointers walk the array from ends or in lockstep',
    detail: 'Indices that move toward each other or trail one another give O(n) without extra memory.',
    terms: ['two pointers', 'left and right', 'converge', 'trailing index', 'in place'],
    weight: 2,
  },
  'dsa-write-index': {
    slug: 'dsa-write-index',
    name: 'A write index compacts an array in place',
    detail: 'Read ahead, write only the elements that survive, return the new length.',
    terms: ['write index', 'in place', 'overwrite', 'two index', 'length returned'],
    weight: 2,
  },
  'dsa-reversal-trick': {
    slug: 'dsa-reversal-trick',
    name: 'Rotation by three reversals',
    detail: 'Reverse the head, reverse the tail, reverse all: no extra array, still O(n).',
    terms: ['reverse', 'three reversals', 'segments', 'swap in place'],
    weight: 2,
  },
  'dsa-sorted-merge': {
    slug: 'dsa-sorted-merge',
    name: 'Sorted inputs can be consumed in one merge',
    detail: 'Because both sides are ordered, the smaller head is always the next answer; nothing is rescanned.',
    terms: ['merge', 'already sorted', 'two arrays', 'compare heads', 'linear'],
    weight: 2,
  },
  'dsa-hash-frequency': {
    slug: 'dsa-hash-frequency',
    name: 'A hash map counts occurrences in one pass',
    detail: 'Key to count: O(1) per update instead of a nested scan per element.',
    terms: ['hash map', 'object', 'frequency', 'count', 'lookup'],
    weight: 2,
  },
  'dsa-xor-cancellation': {
    slug: 'dsa-xor-cancellation',
    name: 'XOR cancels pairs',
    detail: 'a ^ a is 0 and ^ is commutative, so pairing values cancels everything but the odd one out.',
    terms: ['xor', 'cancels', 'commutative', 'bitwise', 'zero'],
    weight: 2,
  },
  'dsa-prefix-sum': {
    slug: 'dsa-prefix-sum',
    name: 'Prefix sums turn subarray sums into differences',
    detail: 'sum(i..j) = prefix[j] - prefix[i-1], so range sums become lookups.',
    terms: ['prefix sum', 'cumulative', 'running sum', 'difference of two'],
    weight: 2,
  },
  'dsa-positive-only-window': {
    slug: 'dsa-positive-only-window',
    name: 'A shrinking window only works while values are positive',
    detail: 'With negatives, growing the window can lower the sum, so dropping the left is no longer safe.',
    terms: ['sliding window', 'positive', 'monotonic', 'shrink', 'negative numbers'],
    weight: 2,
  },
  'dsa-complement-lookup': {
    slug: 'dsa-complement-lookup',
    name: 'Store what you would otherwise search for',
    detail: 'Ask for target - x in the map you have already built instead of scanning the rest of the array.',
    terms: ['complement', 'target minus', 'lookup', 'seen map', 'index stored'],
    weight: 2,
  },
  'dsa-index-order-loss': {
    slug: 'dsa-index-order-loss',
    name: 'Sorting an array loses the original indices',
    detail: 'Any answer that must report positions has to carry the index or skip the sort.',
    terms: ['sorting loses indices', 'original index', 'positions', 'index pairs'],
    weight: 2,
  },
  'dsa-three-way-partition': {
    slug: 'dsa-three-way-partition',
    name: 'Dutch national flag partitions in one pass',
    detail: 'Low, mid and high pointers place 0s, 1s and 2s with no extra storage.',
    terms: ['dutch national flag', 'three way', 'mid pointer', 'high pointer', 'partition'],
    weight: 2,
  },
  'dsa-boundary-conditions': {
    slug: 'dsa-boundary-conditions',
    name: 'The empty, single and all-same input is where these pass or fail',
    detail: 'Loop bounds and early returns get decided by the edge case, not the happy path.',
    terms: ['edge case', 'empty array', 'out of bounds', 'off by one', 'n - 1'],
    weight: 1,
  },
  'dsa-character-codes': {
    slug: 'dsa-character-codes',
    name: 'Characters are numbers you can range-check',
    detail: 'charCodeAt gives a code unit; A-Z, a-z and 0-9 are three contiguous ranges, so classification is arithmetic.',
    terms: ['charCodeAt', 'code point', 'ascii', 'contiguous range', 'alphabet block', 'range check'],
    weight: 2,
  },
  'dsa-branch-exhaustiveness': {
    slug: 'dsa-branch-exhaustiveness',
    name: 'An if chain is a decision table, and order is part of it',
    detail: 'Every input must land in exactly one branch; the final else decides what the unclassified case does.',
    terms: ['else', 'exhaustive', 'default case', 'order of checks', 'fall through the chain'],
    weight: 2,
  },
  'dsa-switch-fallthrough': {
    slug: 'dsa-switch-fallthrough',
    name: 'Switch cases run into each other unless you stop them',
    detail: 'Matching a case starts executing at that label and keeps going; stacked case labels sharing one body is the intended use.',
    terms: ['break', 'fallthrough', 'default', 'case label', 'strict equality'],
    weight: 2,
  },
  'dsa-loop-invariant': {
    slug: 'dsa-loop-invariant',
    name: 'A loop is a bound plus something that must change every turn',
    detail: 'The counter or the input has to move toward the exit condition, or the loop is a hang with extra steps.',
    terms: ['loop invariant', 'termination', 'counter', 'i += 1', 'while condition', 'off by one'],
    weight: 2,
  },
  'dsa-value-versus-reference': {
    slug: 'dsa-value-versus-reference',
    name: 'JavaScript passes the value, even when the value is a reference',
    detail: 'Reassigning a parameter never reaches the caller; writing through a copied object reference does.',
    terms: ['pass by value', 'reference', 'reassign', 'mutate', 'shared object', 'copy'],
    weight: 2,
  },
  'dsa-complexity-counting': {
    slug: 'dsa-complexity-counting',
    name: 'Complexity comes from iterations times work per iteration',
    detail: 'Count the body, not the lines: nested loops multiply, a doubling bound is logarithmic, a shrinking triangle is n squared over two.',
    terms: ['nested loop', 'n squared', 'log n', 'work per iteration', 'tight bound'],
    weight: 2,
  },
  'dsa-selection-min-scan': {
    slug: 'dsa-selection-min-scan',
    name: 'Selection places one element per pass by scanning for the minimum',
    detail: 'The unsorted tail is searched, the smallest is swapped to the boundary, so the work is fixed regardless of input order.',
    terms: ['minimum', 'swap', 'unsorted tail', 'boundary', 'n squared comparisons'],
    weight: 2,
  },
  'dsa-bubble-adjacent-pass': {
    slug: 'dsa-bubble-adjacent-pass',
    name: 'One adjacent-swap pass sinks exactly one element into place',
    detail: 'The largest remaining value travels to the end of the pass, which is why the bound shrinks every round.',
    terms: ['adjacent swap', 'pass', 'bubble', 'already sorted', 'early exit', 'n squared'],
    weight: 2,
  },
  'dsa-insertion-shift': {
    slug: 'dsa-insertion-shift',
    name: 'Insertion sorts by shifting a sorted prefix, not by swapping',
    detail: 'The new key is held, larger neighbours slide right, and it drops into the hole — cheap on nearly sorted data.',
    terms: ['shift', 'sorted prefix', 'key', 'nearly sorted', 'adaptive', 'insertion'],
    weight: 2,
  },
  'dsa-divide-and-conquer': {
    slug: 'dsa-divide-and-conquer',
    name: 'Divide, solve the halves, combine',
    detail: 'Splitting the array in two gives log n levels; the cost is whatever the combining step needs per level.',
    terms: ['divide', 'conquer', 'merge', 'recursion tree', 'log n levels', 'n log n'],
    weight: 2,
  },
  'dsa-pivot-partition': {
    slug: 'dsa-pivot-partition',
    name: 'Quick sort partitions around a pivot and recurses on the sides',
    detail: 'One pass puts the pivot at its final index; the split decides the cost, and a bad fixed pivot is quadratic.',
    terms: ['pivot', 'partition', 'lomuto', 'hoare', 'in place', 'worst case'],
    weight: 2,
  },
  'dsa-coordinate-loops': {
    slug: 'dsa-coordinate-loops',
    name: 'A nested loop is a grid address',
    detail: 'The outer index is the row and the inner index is the column, so any shape is a rule over (row, column) pairs.',
    terms: ['row', 'column', 'nested loop', 'outer loop', 'inner loop', 'coordinate'],
    weight: 2,
  },
  'dsa-padding-arithmetic': {
    slug: 'dsa-padding-arithmetic',
    name: 'Blank space is a count you compute, not gaps you guess',
    detail: 'Alignment comes from width minus row index; get that expression right and the shape aligns itself.',
    terms: ['padding', 'leading spaces', 'right align', 'width minus', 'indent'],
    weight: 2,
  },
  'dsa-symmetry-half': {
    slug: 'dsa-symmetry-half',
    name: 'A symmetric shape is one half mirrored',
    detail: 'Write the growing half, then emit it backwards; the axis is an index relation, not a second algorithm.',
    terms: ['mirror', 'symmetric', 'upper half', 'lower half', 'palindromic row'],
    weight: 2,
  },
  'dsa-index-parity': {
    slug: 'dsa-index-parity',
    name: 'Modulo two turns an index into an alternating signal',
    detail: 'Row or column parity selects the symbol, which is how checkerboards, 0/1 triangles and borders are written.',
    terms: ['parity', 'modulo', 'alternating', 'even index', 'odd index'],
    weight: 2,
  },
  'dsa-row-building': {
    slug: 'dsa-row-building',
    name: 'Build one row string, then stack the rows',
    detail: 'repeat and join keep the output in memory so a pattern can be tested; printing inside the loop cannot.',
    terms: ['repeat', 'join', 'row string', 'newline', 'accumulate'],
    weight: 1,
  },
  'dsa-boyer-moore-vote': {
    slug: 'dsa-boyer-moore-vote',
    name: 'A majority survives cancellation against everything else',
    detail: 'Pair off different elements and the > n/2 value is what remains standing; verify the candidate before trusting it.',
    terms: ['candidate', 'votes', 'cancel', 'majority', 'verify count'],
    weight: 2,
  },
  'dsa-kadane-reset': {
    slug: 'dsa-kadane-reset',
    name: 'A running sum that is worse than starting over should start over',
    detail: 'The best subarray ending here is either the element alone or the element extended onto the previous run.',
    terms: ['running sum', 'reset', 'ending here', 'drop the prefix', 'kadane'],
    weight: 2,
  },
  'dsa-running-minimum': {
    slug: 'dsa-running-minimum',
    name: 'Track the cheapest so far and read the best answer off the current value',
    detail: 'One pass over a monotone tracker replaces the O(n squared) pair enumeration.',
    terms: ['cheapest', 'minimum so far', 'best spread', 'one pass', 'before it'],
    weight: 2,
  },
  'dsa-suffix-maximum': {
    slug: 'dsa-suffix-maximum',
    name: 'A leader is defined by what comes after, so scan from the right',
    detail: 'Reversed, the question becomes "is this at least the tallest value I have seen", which one variable answers.',
    terms: ['from the right', 'suffix maximum', 'nothing greater', 'reverse scan'],
    weight: 2,
  },
  'dsa-lexicographic-successor': {
    slug: 'dsa-lexicographic-successor',
    name: 'The next permutation raises the rightmost liftable digit',
    detail: 'Find the pivot whose suffix descends, swap in the smallest larger value, then reverse the suffix to sort it again.',
    terms: ['pivot', 'swap', 'reverse the suffix', 'descending tail', 'lexicographic'],
    weight: 2,
  },
  'dsa-order-preserving-split': {
    slug: 'dsa-order-preserving-split',
    name: 'Split by a predicate and interleave to keep relative order',
    detail: 'Two filtered passes preserve the input order inside each group, which an in-place swap does not.',
    terms: ['filter', 'relative order', 'stable', 'interleave', 'two groups'],
    weight: 2,
  },
  'dsa-set-run-start': {
    slug: 'dsa-set-run-start',
    name: 'A run only begins where its predecessor is absent',
    detail: 'Hashing the input and skipping any value that has value - 1 makes the walk over a sequence linear overall.',
    terms: ['set', 'has', 'value - 1', 'start of the run', 'membership'],
    weight: 2,
  },
  'dsa-in-place-markers': {
    slug: 'dsa-in-place-markers',
    name: 'A decision can be recorded inside the data it will change',
    detail: 'Reserving the first row and column as markers keeps a grid update at O(1) extra space, if the markers themselves are handled last.',
    terms: ['marker row', 'marker column', 'first row', 'flag', 'in place', 'deferred update'],
    weight: 2,
  },
  'dsa-transpose-reverse': {
    slug: 'dsa-transpose-reverse',
    name: 'A quarter turn is a transpose plus a reversal',
    detail: 'Swapping across the diagonal then reversing each row is the rotation; the index map is the whole argument.',
    terms: ['transpose', 'diagonal', 'reverse', 'rotate', 'index map'],
    weight: 2,
  },
  'dsa-boundary-shrink': {
    slug: 'dsa-boundary-shrink',
    name: 'Four moving boundaries read a grid in layers',
    detail: 'Top, bottom, left and right each close by one after their edge is consumed, and the two guards stop the repeats.',
    terms: ['boundaries', 'top', 'bottom', 'shrink', 'layer', 'spiral'],
    weight: 2,
  },
  'dsa-prefix-count-map': {
    slug: 'dsa-prefix-count-map',
    name: 'Count the prefix sums a target is short of',
    detail: 'A map of how often each running total has occurred turns "how many subarrays" into a lookup per element.',
    terms: ['prefix sum', 'frequency of sums', 'running total', 'map lookup', 'seed with zero'],
    weight: 2,
  },
  'dsa-row-recurrence': {
    slug: 'dsa-row-recurrence',
    name: 'Each row is built from the row above it',
    detail: 'Interior cells are the sum of two neighbours in the previous row, so the whole triangle costs its own output.',
    terms: ['previous row', 'recurrence', 'boundary of one', 'interior cell', 'build from the row above'],
    weight: 2,
  },
  'dsa-two-candidate-vote': {
    slug: 'dsa-two-candidate-vote',
    name: 'A third threshold needs two candidate slots',
    detail: 'Decrement every slot on a foreign value; values above a third can only occupy the two survivors, and both need verifying.',
    terms: ['two candidates', 'second slot', 'decrement every slot', 'threshold', 'verify both'],
    weight: 2,
  },
  'dsa-sort-then-two-pointer': {
    slug: 'dsa-sort-then-two-pointer',
    name: 'Sorting turns a search for pairs into a closing window',
    detail: 'Once the array is ordered, fixing one element leaves a two-pointer walk whose moves are decided by the sum.',
    terms: ['sort first', 'two pointers', 'closing window', 'fixed element', 'skips duplicates'],
    weight: 2,
  },
  'dsa-duplicate-skip': {
    slug: 'dsa-duplicate-skip',
    name: 'Uniqueness is an index test, not a set of results',
    detail: 'Comparing each candidate against the value just consumed emits every combination once; deduplicating afterwards is slower and fuzzier.',
    terms: ['skip duplicates', 'same as previous', 'unique results', 'advance past repeats'],
    weight: 2,
  },
  'dsa-first-occurrence': {
    slug: 'dsa-first-occurrence',
    name: 'The first time a prefix appeared fixes the longest span',
    detail: 'Storing only the earliest index of each running total turns a repeat of that total into a window whose length is one subtraction.',
    terms: ['first occurrence', 'earliest index', 'running total', 'repeated prefix', 'distance between'],
    weight: 2,
  },
  'dsa-interval-sweep': {
    slug: 'dsa-interval-sweep',
    name: 'Ordering by start leaves only one interval that can overlap',
    detail: 'Sorted by left edge, each incoming interval can only meet the open merged one, so merging is a single sweep with a max on the end.',
    terms: ['sort by start', 'overlapping', 'running end', 'merged into', 'open interval'],
    weight: 2,
  },
  'dsa-gap-shrink': {
    slug: 'dsa-gap-shrink',
    name: 'Compare elements a shrinking gap apart',
    detail: 'Treating both arrays as one virtual sequence and swapping pairs gap positions apart exchanges out-of-order elements with no buffer.',
    terms: ['gap', 'shrinking gap', 'apart by gap', 'no extra array', 'round up the half'],
    weight: 2,
  },
  'dsa-sum-system': {
    slug: 'dsa-sum-system',
    name: 'Two aggregate equations recover two unknown values',
    detail: 'The expected minus actual sum gives one difference and the same on squares gives the matching sum, which pins down both unknowns.',
    terms: ['sum of squares', 'two equations', 'expected sum', 'difference of sums', 'solve the pair'],
    weight: 2,
  },
  'dsa-cycle-in-rings': {
    slug: 'dsa-cycle-in-rings',
    name: 'A rotation moves four cells per ring',
    detail: 'Each layer is turned by cycling top to left to bottom to right with one temporary, so every cell is written exactly once.',
    terms: ['four-way swap', 'ring', 'layer', 'one temporary', 'cycle four cells'],
    weight: 2,
  },
  'dsa-rotation-drop-count': {
    slug: 'dsa-rotation-drop-count',
    name: 'A rotated sorted array drops at most once',
    detail: 'Counting every adjacent pair that decreases, including the wrap from last back to first, is the whole sorted-and-rotated test.',
    terms: ['number of drops', 'at most one inversion', 'wrap around', 'adjacent pair', 'decreasing step'],
    weight: 2,
  },
  'dsa-pair-parity-search': {
    slug: 'dsa-pair-parity-search',
    name: 'Before the single value every pair starts on an even index',
    detail: 'Pairs occupy even-odd slots up to the answer and odd-even slots after it, so one comparison tells binary search which half to keep.',
    terms: ['even index', 'paired slot', 'binary search', 'parity breaks', 'which half'],
    weight: 2,
  },
  'dsa-inversion-count': {
    slug: 'dsa-inversion-count',
    name: 'A merge can count the pairs it is ordering',
    detail: 'With both halves sorted, taking from the right means every element still waiting on the left forms a pair with it, which is one addition.',
    terms: ['inversion', 'counted during merge', 'remaining left', 'sorted halves', 'crossing pairs'],
    weight: 2,
  },
  'dsa-dual-product-track': {
    slug: 'dsa-dual-product-track',
    name: 'A negative flips the best product, so carry the worst too',
    detail: 'The largest product ending here can come from the smallest so far, so Kadane over multiplication needs two running states.',
    terms: ['maximum ending here', 'minimum ending here', 'sign flip', 'two running states', 'negative times negative'],
    weight: 2,
  },
  'dsa-negation-mirror': {
    slug: 'dsa-negation-mirror',
    name: 'A value can address another slot in the same array',
    detail: 'Using the value as an index and negating what is there leaves a footprint that survives the scan, as long as the magnitude is read before the sign.',
    terms: ['negate in place', 'index from value', 'seen marker', 'absolute value', 'mutating the input'],
    weight: 2,
  },
  'dsa-binary-search-window': {
    slug: 'dsa-binary-search-window',
    name: 'The window is a claim, and halving has to keep it true',
    detail: 'Inclusive or exclusive bounds decide the loop condition and both updates together; mixing the two contracts is what breaks binary search.',
    terms: ['halve the window', 'lo and hi', 'invariant', 'discard a half', 'midpoint'],
    weight: 3,
  },
  'dsa-search-exit-index': {
    slug: 'dsa-search-exit-index',
    name: 'What the loop exits on is the answer',
    detail: 'A boundary search reports the position the window closes on, which is a gap as often as it is an element, so the return reads lo rather than a matched value.',
    terms: ['exit index', 'insertion point', 'loop ends', 'where it would go', 'the gap'],
    weight: 3,
  },
  'dsa-lower-bound': {
    slug: 'dsa-lower-bound',
    name: 'Lower bound is the first index that is not smaller',
    detail: 'The predicate flips from false to true along a sorted array, so the leftmost qualifying index is found by letting hi retreat to mid.',
    terms: ['lower bound', 'first index', 'not less than', 'at least the target', 'leftmost'],
    weight: 3,
  },
  'dsa-upper-bound': {
    slug: 'dsa-upper-bound',
    name: 'Upper bound is the first index strictly greater',
    detail: 'One comparison later than lower bound, and the returned index doubles as the count of everything at most the target.',
    terms: ['upper bound', 'strictly greater', 'first greater', 'past the run', 'count of at most'],
    weight: 3,
  },
  'dsa-rotated-half-sorted': {
    slug: 'dsa-rotated-half-sorted',
    name: 'One half of a rotated array is always in order',
    detail: 'The midpoint splits the array into a sorted run and a wrapped run, so the half test is which side is ordered and whether the target falls inside it.',
    terms: ['sorted half', 'pivot', 'which half', 'rotated', 'range check'],
    weight: 3,
  },
  'dsa-duplicate-ambiguity': {
    slug: 'dsa-duplicate-ambiguity',
    name: 'Equal endpoints decide nothing',
    detail: 'When an endpoint matches the midpoint the ordering test is silent, and the only sound move is to drop that endpoint one place.',
    terms: ['duplicates', 'cannot decide', 'shrink by one', 'ambiguous', 'worst case linear'],
    weight: 3,
  },
  'dsa-pivot-as-minimum': {
    slug: 'dsa-pivot-as-minimum',
    name: 'The minimum is the pivot, and its index is the rotation',
    detail: 'A rotated array is two sorted runs and the smallest element starts the second, so the same halving reports both the value and how far the array was turned.',
    terms: ['pivot', 'smallest element', 'start of the second run', 'rotation count', 'index of the minimum'],
    weight: 2,
  },
  'dsa-peak-gradient': {
    slug: 'dsa-peak-gradient',
    name: 'Rising toward a neighbour guarantees a peak that way',
    detail: 'Follow the larger neighbour and the first element that stops rising is a peak, because the outside of the array is treated as lower than anything.',
    terms: ['peak', 'larger neighbour', 'rising', 'ascent', 'ends count as lower'],
    weight: 2,
  },
  'dsa-neighbour-by-xor': {
    slug: 'dsa-neighbour-by-xor',
    name: 'One XOR gives the partner of a pair',
    detail: 'Flipping the lowest bit turns an even index into its odd partner and back, so a single expression replaces the branch on parity.',
    terms: ['xor with one', 'partner index', 'flip the last bit', 'pair neighbour', 'no parity branch'],
    weight: 2,
  },
  'dsa-answer-range-search': {
    slug: 'dsa-answer-range-search',
    name: 'Halve the range of answers, not the range of indices',
    detail: 'When a predicate is monotone in a candidate value, the window is the set of possible answers and the loop keeps the smallest or largest feasible one.',
    terms: ['search on the answer', 'feasible', 'monotone predicate', 'smallest feasible', 'candidate value'],
    weight: 3,
  },
  'dsa-feasibility-scan': {
    slug: 'dsa-feasibility-scan',
    name: 'One greedy pass says whether a candidate rate works',
    detail: 'A fixed candidate turns the ask into a count over the array, and the count is monotone in the candidate, so the check is linear and the search is logarithmic.',
    terms: ['feasibility check', 'greedy count', 'days needed', 'at most', 'running load'],
    weight: 3,
  },
  'dsa-minimize-maximum': {
    slug: 'dsa-minimize-maximum',
    name: 'A bottleneck objective is monotone in the budget',
    detail: 'Minimising the worst part becomes decidable once you fix a cap and ask whether the parts fit under it, which is what makes halving legal.',
    terms: ['minimise the maximum', 'bottleneck', 'worst part', 'cap', 'largest load'],
    weight: 3,
  },
  'dsa-capped-power': {
    slug: 'dsa-capped-power',
    name: 'Stop a power the moment it passes the target',
    detail: 'Comparing an exponentiated candidate only needs the first value that exceeds the target, which bounds the work and keeps the accumulator inside the exact range.',
    terms: ['overflow guard', 'stop early', 'exceeds the target', 'cap the product', 'safe integer range'],
    weight: 2,
  },
  'dsa-deficit-counting': {
    slug: 'dsa-deficit-counting',
    name: 'How far an array trails the natural numbers is a count',
    detail: 'For distinct increasing values, value minus index minus one is exactly how many numbers are missing before that position, and it never decreases.',
    terms: ['missing count', 'value minus index', 'deficit', 'gap before', 'falls behind'],
    weight: 2,
  },
  'dsa-partition-count': {
    slug: 'dsa-partition-count',
    name: 'A cap fixes how few groups the sequence needs',
    detail: 'Fill each group greedily until the next item would overflow it: for an ordered sequence of non-negative values that count is the minimum the cap allows, so it doubles as the feasibility predicate.',
    terms: ['greedy fill', 'overflow', 'number of groups', 'contiguous partition', 'at most the cap'],
    weight: 3,
  },
  'dsa-maximise-minimum': {
    slug: 'dsa-maximise-minimum',
    name: 'Maximising a minimum reads the predicate from the other end',
    detail: 'Spacing, bandwidth and load questions are monotone too, but the answer is the largest feasible value, so the window closes from the opposite side.',
    terms: ['largest feasible', 'maximise the minimum', 'opposite direction', 'keep the last true', 'place greedily'],
    weight: 3,
  },
  'dsa-real-valued-bisection': {
    slug: 'dsa-real-valued-bisection',
    name: 'A real answer is bisected to a tolerance, not to an index',
    detail: 'Nothing is discrete to stop on, so the loop runs a fixed number of halvings and the invariant is a window narrow enough to round.',
    terms: ['fixed iterations', 'tolerance', 'precision', 'window width', 'floating point'],
    weight: 3,
  },
  'dsa-split-invariant': {
    slug: 'dsa-split-invariant',
    name: 'A median is a split, not a scan',
    detail: 'Cutting two sorted arrays so the left halves together hold the lower middle and every left element is at most every right element; the split of one array decides the other.',
    terms: ['partition', 'left max', 'right min', 'equal halves', 'one search decides both'],
    weight: 3,
  },
  'dsa-k-elimination': {
    slug: 'dsa-k-elimination',
    name: 'Discard a settled prefix of one sequence per step',
    detail: 'Probe half the remaining rank in each array; the smaller probe proves its whole prefix cannot contain the answer, so it leaves the window.',
    terms: ['probe', 'drop half', 'kth smallest', 'rank', 'discard'],
    weight: 2,
  },
  'dsa-flattened-index-mapping': {
    slug: 'dsa-flattened-index-mapping',
    name: 'A matrix index is a quotient and a remainder',
    detail: 'Row-major cells are the integers in order, so one search over the flat range reads cells with division and modulus instead of building a flattened array.',
    terms: ['row equals mid over cols', 'mid modulo cols', 'row major', 'virtual flatten', 'one dimensional window'],
    weight: 2,
  },
  'dsa-saddle-descent': {
    slug: 'dsa-saddle-descent',
    name: 'A corner where every direction disagrees is a decision',
    detail: 'Start where a row maximum and a column minimum meet: each comparison eliminates a whole row or a whole column, so the walk costs the two dimensions added.',
    terms: ['top right', 'staircase', 'discard a row', 'discard a column', 'two dimensions added'],
    weight: 3,
  },
  'dsa-column-extreme-climb': {
    slug: 'dsa-column-extreme-climb',
    name: 'A column maximum points the way to a peak',
    detail: 'Binary search the columns, compare the tallest cell in the middle column with its horizontal neighbour, and follow the larger side; the descent cannot walk off a peak.',
    terms: ['column maximum', 'horizontal neighbour', 'halve the columns', 'ascent', 'ridge'],
    weight: 3,
  },
  'dsa-count-at-most': {
    slug: 'dsa-count-at-most',
    name: 'A rank is answerable by counting instead of sorting',
    detail: 'How many elements are at most a value can be summed across sorted runs without ordering anything, which turns an order statistic into a search over the value range.',
    terms: ['count less than or equal', 'rank', 'value range', 'per row upper bound', 'without merging'],
    weight: 3,
  },
  'dsa-parenthesis-depth': {
    slug: 'dsa-parenthesis-depth',
    name: 'A nesting level is one integer, not a stack',
    detail: 'When only the depth of balanced brackets matters, an incrementing counter answers emptiness, depth and which pairs are outermost without storing anything.',
    terms: ['counter', 'increment', 'depth', 'nesting level', 'no stack'],
    weight: 2,
  },
  'dsa-last-digit-divisibility': {
    slug: 'dsa-last-digit-divisibility',
    name: 'Divisibility of a decimal string lives in its tail',
    detail: 'Every higher place value is a multiple of ten, so parity and divisibility by two, five and ten are decided by the last digit alone and never need the number.',
    terms: ['place value', 'last digit', 'never needs conversion', 'prefix', 'modulo ten'],
    weight: 2,
  },
  'dsa-two-way-mapping': {
    slug: 'dsa-two-way-mapping',
    name: 'A one-to-one correspondence needs both maps',
    detail: 'One direction proves the pairing is a function; only the reverse direction proves it is injective, so a bijection check has to carry both.',
    terms: ['injective', 'both directions', 'reverse map', 'one to one', 'correspondence'],
    weight: 3,
  },
  'dsa-doubled-text-window': {
    slug: 'dsa-doubled-text-window',
    name: 'Doubling the text contains every rotation',
    detail: 'Concatenating a string with itself lays all cyclic shifts out as contiguous substrings, so rotation becomes one containment test at the cost of the length.',
    terms: ['concatenate with itself', 'cyclic shift', 'substring containment', 'same length', 'wrap around'],
    weight: 2,
  },
  'dsa-frequency-ordering': {
    slug: 'dsa-frequency-ordering',
    name: 'Ordering by count needs a stated tie-break',
    detail: 'A frequency sort is only deterministic once equal counts have a documented second key, because the comparator input is equal and the language makes no promise.',
    terms: ['sort by count', 'tie break', 'stable', 'descending frequency', 'second key'],
    weight: 2,
  },
  'dsa-subtractive-notation': {
    slug: 'dsa-subtractive-notation',
    name: 'A smaller symbol before a larger one subtracts',
    detail: 'Roman numerals are read by comparing each symbol with the next: the subtractive pairs are local, so one lookahead replaces a table of exceptions.',
    terms: ['lookahead', 'smaller before larger', 'subtractive pair', 'numeral', 'add otherwise'],
    weight: 2,
  },
  'dsa-greedy-numeral-table': {
    slug: 'dsa-greedy-numeral-table',
    name: 'A lookup table turns the numeral out',
    detail: 'Including the subtractive values in the table lets one greedy pass over descending values emit the whole symbol string, with no special cases in the writer.',
    terms: ['descending values', 'greedy subtract', 'lookup table', 'repeat the symbol', 'no if cascade'],
    weight: 2,
  },
  'dsa-saturating-parse': {
    slug: 'dsa-saturating-parse',
    name: 'A parser clamps at the range it cannot represent',
    detail: 'Digits accumulate past the representable integer window long before the string ends, so the honest answer is the boundary rather than the nearest double.',
    terms: ['clamp', 'saturate', 'out of range', 'accumulate', 'stop reading'],
    weight: 3,
  },
  'dsa-at-most-difference': {
    slug: 'dsa-at-most-difference',
    name: 'Exactly k is at most k minus at most k minus one',
    detail: 'A window that counts up to a bound is easy; the exact count falls out of subtracting the two bounds, which replaces a second window with a second call.',
    terms: ['at most', 'difference of counts', 'exactly k', 'two calls', 'inclusion exclusion'],
    weight: 3,
  },
  'dsa-centre-expansion': {
    slug: 'dsa-centre-expansion',
    name: 'Every substring has a centre to grow from',
    detail: 'Palindromes are determined by their middle, and there are twice the length minus one of them once even lengths are given their own centre.',
    terms: ['grow outward', 'odd and even centre', 'middle', 'two pointers apart', 'best so far'],
    weight: 3,
  },
  'dsa-node-holds-reference': {
    slug: 'dsa-node-holds-reference',
    name: 'A list is a value plus one link, not a range of memory',
    detail: 'Each node carries its payload and the address of one other node; the nodes sit wherever allocation put them.',
    terms: ['node', 'next pointer', 'payload', 'address', 'no indices'],
    weight: 2,
  },
  'dsa-linear-position-walk': {
    slug: 'dsa-linear-position-walk',
    name: 'Position in a list costs the walk to it',
    detail: 'Reaching the kth node takes k steps, so head work is constant and positional or tail work is linear unless a tail pointer is kept.',
    terms: ['walk from the head', 'random access', 'k steps', 'tail pointer', 'linear in position'],
    weight: 2,
  },
  'dsa-null-termination': {
    slug: 'dsa-null-termination',
    name: 'The loop condition tests the node, not the value',
    detail: 'A walk continues while the cursor is non-null; testing cursor.next instead ends one node early and skips the tail.',
    terms: ['while cursor', 'null terminator', 'tail node', 'loop condition', 'end of list'],
    weight: 2,
  },
  'dsa-sentinel-head': {
    slug: 'dsa-sentinel-head',
    name: 'A sentinel node deletes the special case for position zero',
    detail: 'A dummy node in front of the real head lets insert and delete at the front run the same rewiring code as anywhere else.',
    terms: ['dummy node', 'sentinel', 'predecessor', 'special case', 'return dummy.next'],
    weight: 3,
  },
  'dsa-link-splice-order': {
    slug: 'dsa-link-splice-order',
    name: 'Set the new links before breaking the old one',
    detail: 'Splicing means several pointer writes; overwriting a link before its target has been read detaches the rest of the list.',
    terms: ['assignment order', 'overwrite', 'lose the tail', 'read before write', 'two links'],
    weight: 3,
  },
  'dsa-doubly-mirror-links': {
    slug: 'dsa-doubly-mirror-links',
    name: 'A doubly linked edit is four writes that mirror each other',
    detail: 'Every link set one way has to be set the other way too, and a backward pointer means a node can be unlinked without knowing its predecessor.',
    terms: ['prev', 'four updates', 'both directions', 'backward link', 'unlink in place'],
    weight: 3,
  },
  'dsa-cursor-reassignment': {
    slug: 'dsa-cursor-reassignment',
    name: 'A walking pointer consumes the list it walks',
    detail: 'Reassigning the head variable to walk forward destroys the handle to the list; walk a copy and keep the original.',
    terms: ['cursor', 'head reference', 'lost list', 'copy the pointer', 'walk forward'],
    weight: 2,
  },
  'dsa-pointer-swap-mirror': {
    slug: 'dsa-pointer-swap-mirror',
    name: 'Reversing a doubly list is swapping each node with itself',
    detail: 'Exchange prev and next on every node and the chain runs backwards on its own; the old tail is the new head.',
    terms: ['swap prev and next', 'every node', 'old tail becomes head', 'in place', 'no new nodes'],
    weight: 3,
  },
  'dsa-fast-slow-pointers': {
    slug: 'dsa-fast-slow-pointers',
    name: 'Fast and slow pointers halve the traversal cost for midpoint and cycle detection',
    detail: 'One pointer advances by two steps per iteration while the other advances by one. When fast reaches the end, slow is at the middle. In a cycle they must meet because the gap closes by one per step.',
    terms: ['fast moves two', 'slow moves one', 'halfway', 'tortoise and hare', 'gap closes by one'],
    weight: 2,
  },
  'dsa-cycle-detection': {
    slug: 'dsa-cycle-detection',
    name: 'A cycle means a node is reachable from itself by following next repeatedly',
    detail: 'In a linked list, a cycle exists when some node\'s .next eventually points back to an earlier node. Floyd\'s algorithm detects this in O(1) space by proving that two pointers at different speeds must collide inside a loop.',
    terms: ['reachable from itself', 'points back', 'Floyd\'s algorithm', 'O(1) space', 'collision proves cycle'],
    weight: 2,
  },
  'dsa-cycle-entry-proof': {
    slug: 'dsa-cycle-entry-proof',
    name: 'Resetting one pointer to the head finds the loop entry',
    detail: 'After the collision, advance both pointers one step at a time — one from the head, one from the meeting node — and they meet at the first node of the loop, because each is then the same distance from it.',
    terms: ['reset to head', 'one step each', 'entry node', 'distance before the loop', 'same offset'],
    weight: 3,
  },
  'dsa-ring-measurement': {
    slug: 'dsa-ring-measurement',
    name: 'A ring is measured by walking back to where you started',
    detail: 'Counting next-links from a node until that same node is reached again gives the cycle length, and it needs no knowledge of where the cycle begins.',
    terms: ['walk until the same node', 'count the links', 'one full turn', 'ring length', 'start from the meeting node'],
    weight: 2,
  },
  'dsa-reverse-half-comparison': {
    slug: 'dsa-reverse-half-comparison',
    name: 'Reversing the second half turns a palindrome test into a walk',
    detail: 'Split at the middle, reverse the tail, then compare node against node: the list is read from both ends without an array, a recursion, or a copy.',
    terms: ['reverse the second half', 'compare from both ends', 'split at the middle', 'no extra array', 'restore the order'],
    weight: 3,
  },
  'dsa-gap-keeping-runner': {
    slug: 'dsa-gap-keeping-runner',
    name: 'A runner kept N nodes ahead turns a back index into a front one',
    detail: 'Advance the leader N nodes, then move both until the leader holds the last node; the trailer is then exactly N places from the end, without ever counting the length.',
    terms: ['advance the leader', 'hold the gap', 'leader at the tail', 'count from the back', 'trailer lands on the predecessor'],
    weight: 3,
  },
  'dsa-equalised-distance-walk': {
    slug: 'dsa-equalised-distance-walk',
    name: 'Switching heads at the end equalises the distance two pointers travel',
    detail: 'Let each pointer walk its own list and then continue on the other. Both then cover the same total length, so they arrive at the shared node at the same step or both reach null together.',
    terms: ['switch to the other head', 'same total distance', 'shared tail', 'difference in length', 'arrive together'],
    weight: 3,
  },
  'dsa-parity-chains': {
    slug: 'dsa-parity-chains',
    name: 'Two chains walked in lockstep, then stitched once',
    detail: 'Odd positions and even positions are separated into their own chains as they are visited, each keeping its own tail pointer, and joined by one final link so the order inside each chain survives.',
    terms: ['two chains', 'odd positions', 'even positions', 'stitch once at the end', 'relative order kept'],
    weight: 3,
  },
  'dsa-count-then-overwrite': {
    slug: 'dsa-count-then-overwrite',
    name: 'A bounded alphabet lets you rewrite values instead of relinking nodes',
    detail: 'Count the classes in one pass, then walk again assigning each class its share of nodes: no splicing, no new allocation, and no risk of losing the chain.',
    terms: ['counting pass', 'three buckets', 'overwrite the value', 'no relinking', 'bounded keys'],
    weight: 2,
  },
  'dsa-group-boundary-rewind': {
    slug: 'dsa-group-boundary-rewind',
    name: 'Reversing a fixed-size group means remembering both its ends',
    detail: 'Find the node before the group and the node after it, flip the links inside, then attach the predecessor to the old last node and the old first node to what follows. A short trailing group is the case that decides whether the walk stops.',
    terms: ['group head', 'group tail', 'node after the group', 'flip inside', 'short last group'],
    weight: 3,
  },
  'dsa-ring-closure-rotate': {
    slug: 'dsa-ring-closure-rotate',
    name: 'Close the ring, count round it, then break it once',
    detail: 'Joining tail to head turns a rotation into a single cut at a position derived from the length and the shift, which is also where a shift larger than the length is folded back.',
    terms: ['tail to head', 'one cut', 'length modulo shift', 'new head after the cut', 'ring'],
    weight: 3,
  },
  'dsa-carry-forward-pass': {
    slug: 'dsa-carry-forward-pass',
    name: 'A carry can outlive both inputs',
    detail: 'Digit-wise addition writes one node per step from two walkers and a carry, and the loop has to continue while any of the three is still alive, because a final carry becomes one extra node.',
    terms: ['least significant first', 'carry', 'two walkers', 'one node per step', 'extra final digit'],
    weight: 3,
  },
  'dsa-carry-stops-at-nine': {
    slug: 'dsa-carry-stops-at-nine',
    name: 'An increment only changes the rightmost non-nine and everything after it',
    detail: 'Adding one to a big-endian digit list leaves every node before the last non-nine untouched, raises that node, and zeroes the run of nines behind it — or grows a new leading node when there was no non-nine at all.',
    terms: ['rightmost non-nine', 'zero the trailing nines', 'leading one', 'no reversal needed', 'big-endian digits'],
    weight: 3,
  },
} satisfies Record<string, ConceptSpec>;

const MATHS = 'dsa-maths-foundations';
const ARRAYS = 'array-techniques';
const MECHANICS = 'language-mechanics';
const PATTERNS = 'pattern-printing';
const COMPLEXITY = 'complexity-analysis';
const SORTING = 'sorting-algorithms';
const SEARCH = 'binary-search';
const SPACE = 'search-space';
const STRINGS = 'string-techniques';
const NUMERIC = 'numeric-strings';
const LINKED = 'linked-lists';

export const DSA_PROBLEMS: DsaProblem[] = [
  {
    step: 1,
    name: 'Count Digits',
    difficulty: 'Easy',
    topicSlug: MATHS,
    stem: 'Count how many digits a positive integer has without turning it into a string.',
    brief: 'Input: n, a positive integer. Output: its digit count. String conversion is off the table — the point is the arithmetic.',
    concepts: ['dsa-digit-extraction', 'dsa-boundary-conditions'],
    shortAnswer: 'Divide by 10 until the number reaches zero, counting the divisions.',
    idealAnswer:
      'Each floor-division by 10 removes exactly one digit, so the number of divisions that still produce a non-zero ' +
      'value is the digit count. It runs in O(log10 n) time and O(1) space, and never allocates.',
    walkthrough:
      'The number is a base-10 representation, and dividing by the base shifts that representation one place right. ' +
      'Counting shifts is therefore counting places. The loop stops when the shifted value reaches zero, which is why ' +
      'n = 0 needs its own answer: zero has one digit and the loop would report none.',
    commonMistake: 'Writing String(n).length, or looping to n instead of looping on n /= 10.',
    whyWrong:
      'The string version is O(log n) with an allocation and dodges the question being asked. The loop-to-n version is ' +
      'O(n) and will run for minutes on a nine-digit input.',
    followUps: ['What does the same loop count in base 16?', 'How do you handle n = 0 and negative n?', 'Why is this log(n) and not n?'],
    solution:
      'function countDigits(n) {\n' +
      '  if (n === 0) return 1;\n' +
      '  let count = 0;\n' +
      '  for (let x = Math.abs(n); x > 0; x = Math.floor(x / 10)) count += 1;\n' +
      '  return count;\n' +
      '}',
    modify: 'Change the divisor to 2 and return the count: you now have the bit length of the number.',
  },
  {
    step: 1,
    name: 'Reverse a Number',
    difficulty: 'Medium',
    topicSlug: MATHS,
    stem: 'Reverse the digits of an integer, keeping the sign, and say what happens when the result does not fit.',
    brief: 'Input: a signed 32-bit integer. Output: its digits reversed. Decide first what your language actually guarantees about the result.',
    concepts: ['dsa-digit-extraction', 'dsa-double-precision', 'dsa-boundary-conditions'],
    shortAnswer: 'Peel the last digit off, push it onto the accumulator, and check the range you are allowed to return.',
    idealAnswer:
      'rev = rev * 10 + n % 10, then n = floor(n / 10), repeated until n is zero; the sign is preserved by working on ' +
      'the absolute value and applying it at the end. Time is O(log n), space O(1) — and the real interview answer is ' +
      'the overflow guard, not the loop.',
    walkthrough:
      'Multiplying the accumulator by ten opens a place for the digit you just peeled, which is exactly the inverse of ' +
      'the division that removed it. In JavaScript every number is a float64, so anything past 2^53 - 1 silently loses ' +
      'precision; a 32-bit contract still fits, but the moment the input range is unbounded you must check before ' +
      'multiplying rather than after, because after is already wrong.',
    commonMistake: 'Using parseInt(String(n).split("").reverse().join("")) and never mentioning what it does at the top of the range.',
    whyWrong:
      'The string route hides the arithmetic the question is testing, and parseInt silently returns a non-integer ' +
      'precision loss for large inputs instead of telling you the reversal overflowed.',
    followUps: ['Where exactly do you check for overflow — before or after the multiply, and why?', 'Does JS give you 32-bit semantics for free?', 'How would you reverse a number that arrives as a string of digits?'],
    solution:
      'function reverseInteger(n) {\n' +
      '  const limit = 2 ** 31 - 1;\n' +
      '  const sign = Math.sign(n);\n' +
      '  let rev = 0;\n' +
      '  for (let x = Math.abs(n); x > 0; x = Math.floor(x / 10)) {\n' +
      '    rev = rev * 10 + (x % 10);\n' +
      '    if (rev > limit) return 0;\n' +
      '  }\n' +
      '  return sign * rev;\n' +
      '}',
    modify: 'Return a BigInt instead and drop the limit check — then say what you gave up in call-site ergonomics.',
  },
  {
    step: 1,
    name: 'Check Palindrome',
    difficulty: 'Easy',
    topicSlug: MATHS,
    stem: 'Decide whether an integer reads the same both ways without converting it to a string.',
    brief: 'Input: an integer. Output: true or false. Negative numbers are not palindromes because of the sign.',
    concepts: ['dsa-digit-extraction', 'dsa-double-precision', 'dsa-boundary-conditions'],
    shortAnswer: 'Reverse the number arithmetically and compare, or peel digits from both ends and stop at the middle.',
    idealAnswer:
      'Build the reversed half with the same modulus-and-divide loop used for reversal, then compare it with what is ' +
      'left. Reversing only half the digits stops the accumulator at the middle and avoids the question of whether the ' +
      'full reversal overflowed; O(log n) time, O(1) space.',
    walkthrough:
      'A palindrome is symmetric about its middle, so the check does not need the whole mirror — the tail can be grown ' +
      'digit by digit until it is at least as long as what remains. Even-length inputs end with the two halves equal; ' +
      'odd-length ones end with one extra digit in the tail, which is the middle and is dropped by dividing it by ten.',
    commonMistake: 'Returning true for numbers ending in 0, or reversing the whole number and then worrying about overflow.',
    whyWrong:
      'A trailing zero makes the reversed half start with zero, so 10 reports as a palindrome against 1. Reversing ' +
      'everything buys you an overflow case you did not need to solve.',
    followUps: ['Why does the half-reversal version handle odd lengths with one extra division?', 'What does an input of 0 report?', 'Would the same trick work in base 16?'],
    solution:
      'function isPalindromeNumber(n) {\n' +
      '  if (n < 0 || (n % 10 === 0 && n !== 0)) return false;\n' +
      '  let half = 0;\n' +
      '  let x = n;\n' +
      '  while (x > half) {\n' +
      '    half = half * 10 + (x % 10);\n' +
      '    x = Math.floor(x / 10);\n' +
      '  }\n' +
      '  return x === half || x === Math.floor(half / 10);\n' +
      '}',
    modify: 'Make it work on a linked list of digits in place, using the fast and slow pointer to find the middle.',
  },
  {
    step: 1,
    name: 'GCD Or HCF',
    difficulty: 'Easy',
    topicSlug: MATHS,
    stem: 'Find the greatest common divisor of two positive integers, and say why Euclid converges so quickly.',
    brief: 'Input: a and b. Output: the largest integer dividing both. Do it by repeated remainder, not by listing factors.',
    concepts: ['dsa-euclid-gcd', 'dsa-trial-division-sqrt', 'dsa-boundary-conditions'],
    shortAnswer: 'gcd(a, b) = gcd(b, a % b) until the remainder is zero; then a is the answer.',
    idealAnswer:
      'Any common divisor of a and b also divides a - b, so the pair can be reduced by remainders without losing the ' +
      'answer. Each step at least halves the larger value, which makes it O(log min(a, b)) — compared with trial ' +
      'division up to the square root, which is only right if you also track the largest hit.',
    walkthrough:
      'The remainder is the interesting quantity: if d divides a and b, it divides a - kb for any k, including the a %% ' +
      'the algorithm walks the pair down to a point where one divides the other exactly, and at that point the smaller ' +
      'is the gcd. The base case is the zero, because every number divides zero.',
    commonMistake: 'Looping from min(a, b) downward looking for the first divisor, or forgetting the zero base case.',
    whyWrong:
      'Descending search is O(n) in the worst case — two consecutive large primes make it walk the whole range — and a ' +
      'missing base case turns the recursion into a stack overflow on b = 0.',
    followUps: ['Prove that gcd(a, b) = gcd(b, a mod b).', 'Extend it to a list of numbers — what is the identity element?', 'What is the relationship between gcd and lcm?'],
    solution:
      'function gcd(a, b) {\n' +
      '  let x = Math.abs(a), y = Math.abs(b);\n' +
      '  while (y !== 0) {\n' +
      '    const r = x % y;\n' +
      '    x = y;\n' +
      '    y = r;\n' +
      '  }\n' +
      '  return x;\n' +
      '}\n\nconst gcdAll = (ns) => ns.reduce((acc, n) => gcd(acc, n), 0);',
    modify: 'Add the lcm helper on top of it and check that lcm stays inside the safe integer range for your inputs.',
  },
  {
    step: 1,
    name: 'Armstrong Numbers',
    difficulty: 'Easy',
    topicSlug: MATHS,
    stem: 'Report whether a number equals the sum of its own digits each raised to the digit count.',
    brief: 'Input: n. Let d be its digit count; the check is sum(digit^d) === n. Work out the digit count before the sum, not during it.',
    concepts: ['dsa-digit-extraction', 'dsa-boundary-conditions'],
    shortAnswer: 'Count the digits first, then peel them again and accumulate each raised to that power.',
    idealAnswer:
      'The exponent is the digit count, so the pass that measures the number has to finish before the pass that uses ' +
      'it; two O(log n) loops, O(1) space. Trying to do it in one pass means guessing the exponent mid-loop and ' +
      'silently returning false for anything longer than three digits.',
    walkthrough:
      'Each peel gives one digit and drops it, so the number must be preserved (or measured first) to be re-peeled. ' +
      'For three-digit inputs the exponent is 3 and 153 = 1^3 + 5^3 + 3^3; the moment the input has four digits the ' +
      'same code with a hardcoded 3 stops being an Armstrong check and becomes a wrong answer that passes tests written ' +
      'against three-digit samples.',
    commonMistake: 'Hardcoding the power to 3 because every example in the notes was a three-digit number.',
    whyWrong:
      'The property is defined relative to the digit count, so a fixed power only reports correctly for the range you ' +
      'happened to test — 1634 is an Armstrong number and a hardcoded cube says no.',
    followUps: ['Why does the sum grow slower than the number and what does that say about how many exist?', 'How do you avoid two passes without losing the digit count?', 'What is the largest base-10 Armstrong number, and how would you find it?'],
    solution:
      'function isArmstrong(n) {\n' +
      '  let digits = 0;\n' +
      '  for (let x = n; x > 0; x = Math.floor(x / 10)) digits += 1;\n' +
      '  let sum = 0;\n' +
      '  for (let x = n; x > 0; x = Math.floor(x / 10)) sum += (x % 10) ** digits;\n' +
      '  return sum === n;\n' +
      '}',
    modify: 'Generalise to any base and any power k, then describe which combination of the two still terminates.',
  },
  {
    step: 1,
    name: 'Print all Divisors',
    difficulty: 'Easy',
    topicSlug: MATHS,
    stem: 'List every divisor of n exactly once, in ascending order, in O(sqrt n) time.',
    brief: 'Input: n. Output: all i where n % i === 0, no duplicates, sorted. Naively looping to n is the answer being rejected.',
    concepts: ['dsa-trial-division-sqrt', 'dsa-boundary-conditions', 'dsa-single-pass-tracking'],
    shortAnswer: 'Loop to the square root collecting pairs, then append the large halves in reverse.',
    idealAnswer:
      'Divisors come in pairs i and n / i, so scanning i up to sqrt(n) finds every pair and nothing beyond it is new. ' +
      'The small halves are already ascending; the large halves come out descending and have to be reversed. That is ' +
      'O(sqrt n) time and O(sqrt n) output space instead of O(n).',
    walkthrough:
      'If i * i > n then any divisor larger than i would have to be paired with something smaller than i, which the ' +
      'scan already visited. The one place this bites is a perfect square: sqrt(n) pairs with itself, and appending ' +
      'both halves adds a duplicate that the sorted list then shows twice.',
    commonMistake: 'Looping i from 1 to n, or pushing both i and n / i without guarding the perfect-square case.',
    whyWrong:
      'Looping to n is a factor of sqrt(n) slower on every call, which turns a helper inside a prime sieve into the ' +
      'bottleneck; the unguarded pair-push makes 4 report 1, 2, 2, 4.',
    followUps: ['Why exactly does the scan stop being productive past sqrt(n)?', 'How many divisors does a number under 10^6 have at most?', 'Would a Set be a good fix for the duplicate, and what does it cost you?'],
    solution:
      'function divisors(n) {\n' +
      '  const small = [], large = [];\n' +
      '  for (let i = 1; i * i <= n; i += 1) {\n' +
      '    if (n % i !== 0) continue;\n' +
      '    small.push(i);\n' +
      '    if (i !== n / i) large.push(n / i);\n' +
      '  }\n' +
      '  return small.concat(large.reverse());\n' +
      '}',
    modify: 'Return the divisors of every number up to N by sieving instead: same output, and say what it costs.',
  },
  {
    step: 1,
    name: 'Check for Prime',
    difficulty: 'Easy',
    topicSlug: MATHS,
    stem: 'Decide whether n is prime in O(sqrt n), and explain why 0, 1 and 2 need explicit handling.',
    brief: 'Input: n, a non-negative integer. Output: true if n has exactly two divisors. No Miller-Rabin, no table.',
    concepts: ['dsa-trial-division-sqrt', 'dsa-boundary-conditions'],
    shortAnswer: 'Reject anything below 2, then trial-divide up to the square root.',
    idealAnswer:
      'If n is composite it has a factor at most sqrt(n), so testing divisors up to sqrt(n) is sufficient — if none ' +
      'divides, the only divisors are 1 and n. O(sqrt n) time, O(1) space. The bounds are the content: 0 and 1 are not ' +
      'prime by definition, and 2 is prime even though the loop body never runs.',
    walkthrough:
      'The loop condition i * i <= n keeps the square root out of the arithmetic — comparing i against Math.sqrt(n) ' +
      'invites float error on large inputs, while i * i stays integral until it exceeds the safe range. Anything below ' +
      '2 must be rejected first, otherwise a negative input reaches the loop and answers with a nonsense true.',
    commonMistake: 'Looping to n / 2 because "a factor cannot be bigger than half", or testing divisibility by every i instead of only odd i after 2.',
    whyWrong:
      'Half of n is a real bound but a sqrt(n) one is twenty times cheaper at n = 400 and a million times cheaper at ' +
      'larger inputs, which is the difference between a primality helper you can call in a loop and one you cannot.',
    followUps: ['Why is checking even numbers past 2 wasted work?', 'What do you change to test a thousand numbers under 10^6?', 'Prove that a composite always has a factor at most its square root.'],
    solution:
      'function isPrime(n) {\n' +
      '  if (n < 2) return false;\n' +
      '  if (n % 2 === 0) return n === 2;\n' +
      '  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;\n' +
      '  return true;\n' +
      '}',
    modify: 'Sieve all primes up to 10^6 instead, then answer a thousand membership queries in O(1) each.',
  },
  {
    step: 1,
    name: 'Understand Recursion by Print 1 to N',
    difficulty: 'Easy',
    topicSlug: 'recursion',
    stem: 'Print 1..n with recursion and say what makes the output come out in that order.',
    brief: 'Input: n. Output: the numbers 1 through n, one per line, printed before the caller returns. No loops.',
    concepts: ['dsa-recursive-decomposition', 'dsa-call-stack-cost'],
    shortAnswer: 'Recurse on n - 1 first, then print n — the work after the call runs as the stack unwinds.',
    idealAnswer:
      'Base case at n === 0, otherwise call down to n - 1 and print n after that call returns. Because frames unwind in ' +
      'reverse order of creation, the deepest frame prints first, which is exactly ascending. O(n) time, and O(n) ' +
      'stack frames — that frame cost is the part that matters in production.',
    walkthrough:
      'Placing the print before the recursive call gives descending order and placing it after gives ascending, with ' +
      'identical call structure. The frames are real memory: each holds n and a return address, so a large n is a deep ' +
      'stack, and JavaScript gives you no tail-call optimisation to save it.',
    commonMistake: 'Writing the base case as n === 1 and calling with n - 1 without guarding n = 0, or putting the print before the call and calling it a bug.',
    whyWrong:
      'An input of zero then recurses into negative territory until the stack throws. And ordering is not luck: print ' +
      'before the call versus after the call is the entire difference between the two answers.',
    followUps: ['Where does the value of n live between the call and the print?', 'What does this blow up on for n = 100000?', 'How do you get ascending output from a function that recurses on n + 1?'],
    solution:
      'function printUpTo(n) {\n' +
      '  if (n <= 0) return;\n' +
      '  printUpTo(n - 1);\n' +
      '  console.log(n);\n' +
      '}',
    modify: 'Move the console.log above the recursive call, predict the output for n = 4, then run it.',
  },
  {
    step: 1,
    name: 'Print N to 1 using Recursion',
    difficulty: 'Easy',
    topicSlug: 'recursion',
    stem: 'Print n..1 recursively, then rewrite it as a loop and compare what each one costs.',
    brief: 'Input: n. Output: n down to 1. Then say which version you would ship and why.',
    concepts: ['dsa-recursive-decomposition', 'dsa-call-stack-cost'],
    shortAnswer: 'Print n, then recurse on n - 1 — the print happens on the way down this time.',
    idealAnswer:
      'Emit the current value before the recursive call, with a base case that stops at zero. Same O(n) time as the ' +
      'ascending version and the same O(n) frames, which is why the loop form is what you ship: identical output, O(1) ' +
      'space, no ceiling on n.',
    walkthrough:
      'The two orderings differ only in where the side effect sits relative to the call, which is a good illustration of ' +
      'the call stack being a real structure: work before the call runs outermost-first, work after it runs ' +
      'innermost-first. Recursion earns its frames when the shape of the data is recursive — a tree, a nested list — ' +
      'not when a counter is counting down.',
    commonMistake: 'Declaring recursion better because it looks shorter, or forgetting the base case entirely and reading a RangeError as a bug in the runtime.',
    whyWrong:
      'A "Maximum call stack size exceeded" on a countdown is self-inflicted: the loop has the same output at constant ' +
      'space, and shipping the recursive form puts a hard ceiling on n that has nothing to do with the problem.',
    followUps: ['At what n does the recursive version stop working in Node, and how do you measure it?', 'Which problems genuinely need the recursion?', 'Can you make the recursion O(1) space in JavaScript?'],
    solution:
      'function printDown(n) {\n' +
      '  if (n <= 0) return;\n' +
      '  console.log(n);\n' +
      '  printDown(n - 1);\n' +
      '}\n\nfunction printDownLoop(n) {\n' +
      '  for (let i = n; i >= 1; i -= 1) console.log(i);\n' +
      '}',
    modify: 'Convert printUpTo into the loop form and check that the order still comes out ascending.',
  },
  {
    step: 1,
    name: 'Sum of first N numbers',
    difficulty: 'Easy',
    topicSlug: 'recursion',
    stem: 'Sum 1..n recursively, then give the O(1) version and say when the recursive one is still the right call.',
    brief: 'Input: n. Output: the triangular number T(n). Two implementations: one recursive, one closed form.',
    concepts: ['dsa-recursive-decomposition', 'dsa-call-stack-cost', 'dsa-double-precision'],
    shortAnswer: 'T(n) = n + T(n - 1) with T(0) = 0; the closed form is n * (n + 1) / 2.',
    idealAnswer:
      'The recursion is O(n) time and O(n) stack; the closed form is O(1) both, and it is what you ship for a sum. The ' +
      'recursive shape stays correct when the recurrence is not linear — when the next term depends on more than one ' +
      'previous term, or on the structure of the input rather than on a counter.',
    walkthrough:
      'The closed form comes from pairing the sequence with itself reversed: n + 1 in each of n pairs, halved. Written ' +
      'in JS the multiplication is the risk, not the maths — n * (n + 1) overflows the safe integer window long before ' +
      'n reaches anything dramatic, so divide first: (n % 2 === 0 ? n / 2 : n) * (n % 2 === 0 ? n + 1 : (n + 1) / 2).',
    commonMistake: 'Recursing with a mutable accumulator that is never threaded through, or using n * (n + 1) / 2 for large n and trusting the result.',
    whyWrong:
      'An accumulator that is not returned by the recursive call computes a sum that is thrown away. And the closed ' +
      'form loses precision past 2^53, so a sum that looks exact is quietly rounded.',
    followUps: ['Derive the closed form.', 'What is the largest n your JS version answers exactly?', 'How would you keep the recursive version O(1) space?'],
    solution:
      'function sumRecursive(n) {\n' +
      '  return n === 0 ? 0 : n + sumRecursive(n - 1);\n' +
      '}\n\nfunction sumClosed(n) {\n' +
      '  return n % 2 === 0 ? (n / 2) * (n + 1) : n * ((n + 1) / 2);\n' +
      '}',
    modify: 'Sum the first n odd numbers instead and find the closed form for that one.',
  },
  {
    step: 1,
    name: 'Factorial of N numbers',
    difficulty: 'Easy',
    topicSlug: 'recursion',
    stem: 'Compute n! and state the largest n for which JavaScript still returns an exact answer.',
    brief: 'Input: n, a non-negative integer. Output: n factorial. Exactness, not the recursion, is the interesting part.',
    concepts: ['dsa-recursive-decomposition', 'dsa-double-precision', 'dsa-call-stack-cost'],
    shortAnswer: 'n! = n * (n - 1)! with 0! = 1; in JS the result stops being an integer at 18!.',
    idealAnswer:
      'The recursion is O(n) time and O(n) frames and an iterative loop does the same work at O(1) space. The number ' +
      'itself is the constraint: 17! is still under 2^53 - 1, 18! is not, so past 17 a float64 result is an ' +
      'approximation and BigInt is the only honest answer.',
    walkthrough:
      'Factorial grows faster than the input, which is why the precision ceiling arrives so early — each multiply costs ' +
      'a bit more than log2(n) extra, and the window runs out around eighteen. The base case at 0 is not a nicety: ' +
      'without it, factorial(0) recurses to negative inputs, and it is also the definition that makes the empty product ' +
      'correct in every combinatorics formula built on it.',
    commonMistake: 'Writing the base case as n === 1 and then calling factorial(0), or shipping 20! from a number type.',
    whyWrong:
      'The missing base case recurses forever on zero input, and 20! as a double prints 2432902008176640000 while ' +
      'holding the wrong low-order digits — it looks exact and is not.',
    followUps: ['What does 0! mean and why is it 1?', 'How many digits does 100! have?', 'When would you use a memoized table instead of the recurrence?'],
    solution:
      'function factorial(n) {\n' +
      '  if (n < 0) throw new RangeError("factorial needs a non-negative integer");\n' +
      '  if (n <= 1) return 1;\n' +
      '  return n * factorial(n - 1);\n' +
      '}\n\nfunction factorialBig(n) {\n' +
      '  let acc = 1n;\n' +
      '  for (let i = 2n; i <= BigInt(n); i += 1n) acc *= i;\n' +
      '  return acc;\n' +
      '}',
    modify: 'Return a BigInt from the loop version and measure where the number type starts disagreeing with it.',
  },
  {
    step: 1,
    name: 'Reverse an Array',
    difficulty: 'Easy',
    topicSlug: 'recursion',
    stem: 'Reverse an array in place with recursion, and say what a recursive version costs that the loop does not pay.',
    brief: 'Input: an array. Output: the same array, reversed — not a copy. Swap by index, do not build a second array.',
    concepts: ['dsa-two-pointer', 'dsa-call-stack-cost', 'dsa-recursive-decomposition'],
    shortAnswer: 'Swap the two ends and recurse on the inner slice; the loop version uses the same swap with two moving indices.',
    idealAnswer:
      'One swap per pair, n / 2 of them, so O(n) time either way. The recursive form spends O(n / 2) stack frames and ' +
      'the loop spends none — which is the whole argument for the loop unless the recursion is expressing something real.',
    walkthrough:
      'Reversing is symmetric, so the recursion narrows from both ends at once and the base case is the pointers ' +
      'crossing: left >= right. Doing it in place is what makes the array identity matter — the caller holds the same ' +
      'object, which is usually the point, and is a bug when something else still depends on the old order.',
    commonMistake: 'Returning a new array from [...arr].reverse() and calling it in place, or recursing without moving either index.',
    whyWrong:
      'A copy is O(n) extra memory and silently breaks every caller that aliased the original. An unmoving base case ' +
      'is an infinite recursion, which in JS arrives as a stack overflow rather than a clean error.',
    followUps: ['How do you reverse only a slice of the array, and where is that useful?', 'What does reversing in place do to an iterator you are holding?', 'Give the O(1)-space version.'],
    solution:
      'function reverseRecursive(arr, left = 0, right = arr.length - 1) {\n' +
      '  if (left >= right) return arr;\n' +
      '  [arr[left], arr[right]] = [arr[right], arr[left]];\n' +
      '  return reverseRecursive(arr, left + 1, right - 1);\n' +
      '}\n\nfunction reverseLoop(arr) {\n' +
      '  for (let l = 0, r = arr.length - 1; l < r; l += 1, r -= 1) [arr[l], arr[r]] = [arr[r], arr[l]];\n' +
      '  return arr;\n' +
      '}',
    modify: 'Reverse only the words of a sentence while leaving the characters of each word intact — two reversals, no split.',
  },
  {
    step: 1,
    name: 'Check if a String is Palindrome',
    difficulty: 'Easy',
    topicSlug: 'recursion',
    stem: 'Check a string for a palindrome recursively, then say why the loop version is the one you ship.',
    brief: 'Input: a string of letters. Output: true when it reads the same forwards and backwards. Recursion on the two ends first.',
    concepts: ['dsa-recursive-decomposition', 'dsa-two-pointer', 'dsa-call-stack-cost'],
    shortAnswer: 'Compare the ends, strip both, recurse; a mismatch is false and crossing indices is true.',
    idealAnswer:
      'The base cases are left >= right (true, the middle is reached) and s[left] !== s[right] (false). O(n) time and ' +
      'O(n) frames, versus O(n) time and O(1) space for the same comparison with two indices in a loop — which is why ' +
      'the loop ships.',
    walkthrough:
      'Palindrome is a definitionally symmetric property, so recursion on both ends reads naturally; each call frame ' +
      'holds left and right, and the crossing test is what stops it, which also handles even and odd lengths with the ' +
      'same line. The version to avoid is the one that slices the string at every step — that is O(n) copying per ' +
      'frame and quadratic overall.',
    commonMistake: 'Reversing the string and comparing, or recursing on s.slice(1, -1) instead of on indices.',
    whyWrong:
      'The reverse-and-compare answer builds a second string and answers a different question; the slicing version ' +
      'allocates on every frame, turning an O(n) check into O(n^2) with a large garbage cost.',
    followUps: ['How do you ignore case and punctuation without a regex per character?', 'What is the smallest base case that still handles ""?', 'Give the two-pointer loop form.'],
    solution:
      'function isPalindrome(s, left = 0, right = s.length - 1) {\n' +
      '  if (left >= right) return true;\n' +
      '  if (s[left] !== s[right]) return false;\n' +
      '  return isPalindrome(s, left + 1, right - 1);\n' +
      '}',
    modify: 'Now allow deleting at most one character — does the recursion still stop at the first mismatch?',
  },
  {
    step: 1,
    name: 'Fibonacci Number',
    difficulty: 'Easy',
    topicSlug: 'recursion',
    stem: 'Compute fib(n) three ways: naive recursion, memoized, and iterative — and give the cost of each.',
    brief: 'Input: n, a non-negative index. Output: the nth Fibonacci number. The three versions are the answer, not one of them.',
    concepts: ['dsa-memoization', 'dsa-recursive-decomposition', 'dsa-call-stack-cost', 'dsa-double-precision'],
    shortAnswer: 'Naive recursion is exponential, memoization is linear, and the two-variable loop is linear at O(1) space.',
    idealAnswer:
      'The naive tree re-derives every smaller fib call over and over — O(2^n) nodes. Memoizing each index once makes it ' +
      'O(n) time and O(n) space, and keeping only the last two values is O(n) time at O(1) space, which is the shipping ' +
      'form. Past n = 78 the double stops holding the value exactly.',
    walkthrough:
      'Overlapping subproblems are what memoization buys: fib(n) calls fib(n - 1) and fib(n - 2), both of which call ' +
      'fib(n - 3), so without storage the same index is recomputed along every path down. The loop drops the storage as ' +
      'well once you notice no call needs an older value than the previous two — that reduction from O(n) to O(1) space ' +
      'is the reason this problem is on every list.',
    commonMistake: 'Shipping the naive recursive version because it matches the definition, or memoizing with an array indexed by n for huge n.',
    whyWrong:
      'The naive version is unusable past about n = 40 — it is not slow, it is exponential — and an n-slot memo table ' +
      'trades the exponential blow-up for a memory one.',
    followUps: ['Why exactly is the naive call tree exponential?', 'What is the matrix form and its complexity?', 'Where does the number stop fitting in a double?'],
    solution:
      'function fib(n, memo = new Map([[0, 0], [1, 1]])) {\n' +
      '  if (memo.has(n)) return memo.get(n);\n' +
      '  const value = fib(n - 1, memo) + fib(n - 2, memo);\n' +
      '  memo.set(n, value);\n' +
      '  return value;\n' +
      '}\n\nfunction fibLoop(n) {\n' +
      '  let a = 0, b = 1;\n' +
      '  for (let i = 0; i < n; i += 1) [a, b] = [b, a + b];\n' +
      '  return a;\n' +
      '}',
    modify: 'Count the calls the naive version makes for fib(30) and confirm it is itself a Fibonacci number.',
  },
  {
    step: 1,
    name: 'Counting Frequencies of Array Elements',
    difficulty: 'Easy',
    topicSlug: 'hash-tables',
    stem: 'Count how many times each value appears in an array in one pass, and say what breaks when the values are objects.',
    brief: 'Input: an array. Output: a count per distinct value. Then: which key type are you actually relying on?',
    concepts: ['dsa-hash-frequency', 'dsa-single-pass-tracking', 'dsa-boundary-conditions'],
    shortAnswer: 'Walk the array and increment a map keyed by the value: O(n) time, O(distinct) space.',
    idealAnswer:
      'One pass with `map.set(value, (map.get(value) ?? 0) + 1)` counts everything in O(n) with no sort and no nested ' +
      'scan. The space is the number of distinct values, so the worst case is the array itself. A plain object works ' +
      'until a value is "constructor" or "__proto__"; a Map is the safe container.',
    walkthrough:
      'Hashing gives an expected O(1) update per element, which is what makes the single pass possible at all — the ' +
      'alternative is O(n) per element. Objects coerce every key to a string and inherit from Object.prototype, so ' +
      '`obj["constructor"]` finds something that was never in the array; Map keys keep their identity and their type, ' +
      'which is also why two structurally identical objects are two different entries.',
    commonMistake: 'Nesting a second loop to count each element, or using an object literal as the frequency table without a null prototype.',
    whyWrong:
      'The nested scan is O(n^2) and dies on a hundred thousand rows. The object literal silently picks up inherited ' +
      'properties, so a count of "constructor" comes back as a function instead of a number.',
    followUps: ['What changes if the values are objects?', 'How do you return the counts sorted by frequency?', 'Map versus Object versus Array for small integer keys — what is the actual trade?'],
    solution:
      'function frequencies(values) {\n' +
      '  const counts = new Map();\n' +
      '  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);\n' +
      '  return counts;\n' +
      '}',
    modify: 'Return a plain object with Object.create(null) instead of a Map and check that "toString" no longer reports a count.',
  },
  {
    step: 1,
    name: 'Find the Highest/Lowest Frequency Element',
    difficulty: 'Easy',
    topicSlug: 'hash-tables',
    stem: 'Return the most and least frequent values, and say which one wins the tie and why you get to choose.',
    brief: 'Input: an array. Output: the highest-frequency and lowest-frequency values. Ties are guaranteed to happen; decide the rule.',
    concepts: ['dsa-hash-frequency', 'dsa-single-pass-tracking', 'dsa-boundary-conditions'],
    shortAnswer: 'Count in one pass, then scan the counts keeping the best so far — and name the tie rule out loud.',
    idealAnswer:
      'Building the frequency map is O(n); walking its entries to find the extremes is O(distinct), so O(n) total with ' +
      'O(distinct) space. The interesting decision is the tie: first-seen wins, or smallest value wins, or the answer ' +
      'is a list. Whatever you pick, the code has to say it and the tests have to cover it.',
    walkthrough:
      'Sorting the entries by count and taking the ends is O(n log n) for information that a single comparison pass can ' +
      'find in O(n) — that is the same trade as a top-one versus top-k heap. Ties are where the bug lives: a `>` ' +
      'comparison keeps the earlier entry and a `>=` keeps the later one, and neither is wrong until the product says ' +
      'which it is.',
    commonMistake: 'Sorting the whole frequency table to read two values off it, or leaving the tie behaviour to whatever the comparison operator happened to do.',
    whyWrong:
      'The sort costs n log n to answer a question that is n, and an accidental tie rule is a flaky contract: the same ' +
      'input can report a different "most frequent" value after an unrelated refactor changes iteration order.',
    followUps: ['Now return the top k — what data structure?', 'Which tie rule do you want and where do you write it down?', 'How do you stream this over an unbounded input?'],
    solution:
      'function frequencyExtremes(values) {\n' +
      '  const counts = new Map();\n' +
      '  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);\n' +
      '  let high = null, low = null;\n' +
      '  for (const [value, count] of counts) {\n' +
      '    if (high === null || count > high.count) high = { value, count };\n' +
      '    if (low === null || count < low.count) low = { value, count };\n' +
      '  }\n' +
      '  return { high, low };\n' +
      '}',
    modify: 'Return every value tied at the maximum instead of one, then re-derive the complexity.',
  },
  {
    step: 3,
    name: 'Largest Element in an Array',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Find the largest element and its index in one pass, without sorting.',
    brief: 'Input: an array of integers, possibly negative, possibly empty. Output: the value and where it is.',
    concepts: ['dsa-single-pass-tracking', 'dsa-boundary-conditions'],
    shortAnswer: 'Keep a running candidate and compare each element once: O(n) time, O(1) space.',
    idealAnswer:
      'A single scan that replaces the candidate whenever an element is larger is O(n) and cannot be beaten — the ' +
      'largest value is a lower bound on the work, since every element has to be looked at. Sorting to take the last ' +
      'element is O(n log n) and destroys the index unless you carried it along.',
    walkthrough:
      'The candidate has to start from an element of the array, not from 0, or every negative input reports 0 as the ' +
      'maximum. Starting from -Infinity works and is the version that generalises, because it is smaller than anything ' +
      'the array can hold; the empty array still needs its own answer, since there is no maximum to report.',
    commonMistake: 'Initialising the best to 0, or sorting the array and reading the tail.',
    whyWrong:
      'A zero seed wins against every all-negative input, which is a wrong answer that passes a test suite built from ' +
      'positive samples. Sorting costs n log n and then cannot tell you the index.',
    followUps: ['How do you find the second largest in the same pass?', 'What does the answer become for an empty array?', 'Why can this not be sublinear?'],
    solution:
      'function largest(arr) {\n' +
      '  let best = -Infinity, index = -1;\n' +
      '  for (let i = 0; i < arr.length; i += 1) {\n' +
      '    if (arr[i] > best) { best = arr[i]; index = i; }\n' +
      '  }\n' +
      '  return index === -1 ? null : { value: best, index };\n' +
      '}',
    modify: 'Track the largest and the second largest in one pass with two candidates — what happens when they are equal?',
  },
  {
    step: 3,
    name: 'Second Largest Element in an Array',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Find the second largest distinct value in one pass, and decide what happens when there is none.',
    brief: 'Input: an array. Output: the largest value strictly below the maximum. Duplicates of the maximum do not count as a runner-up.',
    concepts: ['dsa-single-pass-tracking', 'dsa-boundary-conditions'],
    shortAnswer: 'Carry a best and a runner-up; promote on a new best, otherwise fill the runner-up.',
    idealAnswer:
      'One pass, two candidates: when a value beats the best, the old best becomes the runner-up; when it sits between ' +
      'them, it becomes the runner-up. O(n) time, O(1) space. "Second largest" means strictly second, so an array of ' +
      'all the same value has no answer and must report that rather than repeating the maximum.',
    walkthrough:
      'The order of the two tests is the whole trick: check the best first and demote it, otherwise a new maximum also ' +
      'qualifies as the runner-up and both slots end up holding the same element. Seeding both from -Infinity makes the ' +
      'no-runner-up case fall out naturally instead of needing a post-pass.',
    commonMistake: 'Sorting and taking the second entry, or comparing with >= so a duplicate maximum becomes the runner-up.',
    whyWrong:
      'Sorting is O(n log n) and then needs a dedup pass anyway. A >= comparison makes [5, 5, 3] report 5 as the second ' +
      'largest, which is the answer to a different question.',
    followUps: ['Same pass, now the third largest.', 'What is the answer for [7]? And for []?', 'How many comparisons does your version make per element?'],
    solution:
      'function secondLargest(arr) {\n' +
      '  let best = -Infinity, runnerUp = -Infinity;\n' +
      '  for (const value of arr) {\n' +
      '    if (value > best) { runnerUp = best; best = value; }\n' +
      '    else if (value > runnerUp && value < best) runnerUp = value;\n' +
      '  }\n' +
      '  return runnerUp === -Infinity ? null : runnerUp;\n' +
      '}',
    modify: 'Return the kth largest distinct value — do it by holding k candidates and say what that costs per element.',
  },
  {
    step: 3,
    name: 'Check if the array is sorted',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Decide whether an array is non-decreasing, then say what your answer means when the array has one element.',
    brief: 'Input: an array. Output: true when every element is <= the next. Define the answer for [] and [x] explicitly.',
    concepts: ['dsa-single-pass-tracking', 'dsa-boundary-conditions'],
    shortAnswer: 'Compare each adjacent pair once and return false at the first inversion.',
    idealAnswer:
      'A single scan of adjacent pairs is O(n) and stops early on the first violation. A one-element and an empty array ' +
      'are both sorted — there is no pair to violate — which is the vacuous-truth answer, and it is the one the loop ' +
      'gives you for free when the bound is i < n - 1.',
    walkthrough:
      'The bound is where the bugs are: running to i < n reads arr[n], which is undefined, and undefined <= x is false, ' +
      'so a perfectly sorted array reports unsorted. Strict versus non-decreasing is the other decision — ascending ' +
      'with duplicates is a different predicate, and a test suite that only uses distinct values cannot tell them apart.',
    commonMistake: 'Looping to arr.length and comparing against the out-of-range element, or sorting a copy and comparing arrays.',
    whyWrong:
      'The out-of-range read makes every answer false. The sort-and-compare version is O(n log n) plus a copy, and ' +
      'compares by identity, so it disagrees about NaN and about -0 versus 0.',
    followUps: ['How do you check that it is strictly increasing instead?', 'What does your function say for []?', 'Give the version that also returns the index of the first inversion.'],
    solution:
      'function isSorted(arr) {\n' +
      '  for (let i = 0; i < arr.length - 1; i += 1) if (arr[i] > arr[i + 1]) return false;\n' +
      '  return true;\n' +
      '}\n\nfunction firstInversion(arr) {\n' +
      '  for (let i = 0; i < arr.length - 1; i += 1) if (arr[i] > arr[i + 1]) return i;\n' +
      '  return -1;\n' +
      '}',
    modify: 'Now check that the array is a rotation of a sorted array — at most one inversion allowed.',
  },
  {
    step: 3,
    name: 'Remove duplicates from Sorted array',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Deduplicate a sorted array in place and return the new length.',
    brief: 'Input: a sorted array. Overwrite it so the distinct values occupy the front, and return how many there are. The tail is allowed to hold stale values.',
    concepts: ['dsa-write-index', 'dsa-sorted-merge', 'dsa-boundary-conditions'],
    shortAnswer: 'A read pointer scans, a write pointer keeps the compacted prefix, and only changes are written.',
    idealAnswer:
      'Because the input is sorted, duplicates are adjacent, so one comparison against the last written value decides ' +
      'membership: O(n) time, O(1) extra space. The function returns the length, not a sliced array — the caller reads ' +
      '0..length-1 and ignores whatever is past it.',
    walkthrough:
      'The write index trails the read index and only advances when a new value appears, which is the same structure as ' +
      'a merge that keeps one side. The invariant to state out loud is that everything before the write index is already ' +
      'the deduplicated answer. Slicing off the tail costs an allocation and changes the array identity, which is what ' +
      'in place was supposed to avoid.',
    commonMistake: 'Calling splice in a loop while iterating forward, or returning a fresh array from a Set.',
    whyWrong:
      'Splice inside a loop is O(n^2) — every removal shifts the rest of the array — and it skips the element that ' +
      'shifted into the current index, so duplicates survive. The Set version is correct but is not in place and ' +
      'forfeits the fact that the input was already sorted.',
    followUps: ['Why does this stop working on an unsorted array?', 'Adapt it to remove an element instead of duplicates.', 'What if you must keep the tail clean too?'],
    solution:
      'function dedupSorted(arr) {\n' +
      '  if (arr.length === 0) return 0;\n' +
      '  let write = 1;\n' +
      '  for (let read = 1; read < arr.length; read += 1) {\n' +
      '    if (arr[read] !== arr[write - 1]) arr[write++] = arr[read];\n' +
      '  }\n' +
      '  return write;\n' +
      '}',
    modify: 'Allow each value to appear at most twice — which comparison changes, and which one does not?',
  },
  {
    step: 3,
    name: 'Left Rotate an array by one place',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Rotate an array one place to the left in O(n) without a second array, and say what the naive version really costs.',
    brief: 'Input: an array. Move every element one index down, send the first element to the end, in place.',
    concepts: ['dsa-write-index', 'dsa-reversal-trick', 'dsa-boundary-conditions'],
    shortAnswer: 'Save the head, shift everything left, put the head at the end — one pass, constant space.',
    idealAnswer:
      'Hold arr[0], copy each element one slot down, write the saved value at the last index: O(n) time, O(1) space. ' +
      'The version that shifts right-to-left, or that pushes and shifts, does the same number of moves but is easy to ' +
      'get wrong at the boundaries.',
    walkthrough:
      'Any in-place rotation is a permutation walk: each element moves exactly once, so the lower bound is n writes. ' +
      'Doing it left-to-right with a temp is safe because the value being overwritten has already been copied; going ' +
      'the other direction needs the last element kept instead. The three-reversal form is what generalises to an ' +
      'arbitrary shift, and it is worth knowing both.',
    commonMistake:
      'Doing it with unshift(arr.pop()) after the fact, or building arr.slice(1).concat(arr[0]) — both read as one line ' +
      'of cleverness and both allocate.',
    whyWrong:
      'unshift is O(n) by itself and pop is O(1), so the one-liner is correct but reallocates and shifts the whole ' +
      'array — and concat builds a new array, which breaks the in-place contract the caller is relying on.',
    followUps: ['Rotate right instead — what changes?', 'Now rotate by k, for any k.', 'How do you rotate with zero extra variables?'],
    solution:
      'function rotateLeftOne(arr) {\n' +
      '  if (arr.length <= 1) return arr;\n' +
      '  const head = arr[0];\n' +
      '  for (let i = 0; i < arr.length - 1; i += 1) arr[i] = arr[i + 1];\n' +
      '  arr[arr.length - 1] = head;\n' +
      '  return arr;\n' +
      '}',
    modify: 'Call it k times and compare that against the rotate-by-k version you write next.',
  },
  {
    step: 3,
    name: 'Left rotate an array by D places',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Rotate left by d places in O(n) and handle d larger than the array.',
    brief: 'Input: an array and d >= 0, which may exceed arr.length. Output: rotated in place. Calling the one-step rotation d times is the answer being rejected.',
    concepts: ['dsa-reversal-trick', 'dsa-boundary-conditions', 'dsa-two-pointer'],
    shortAnswer: 'Reduce d modulo n, then reverse the head, reverse the tail, reverse the whole thing.',
    idealAnswer:
      'With d taken modulo n, reversing the first d elements, reversing the rest, then reversing the entire array puts ' +
      'everything in place with three passes and O(1) extra space. Running the single rotation d times is O(n * d) — ' +
      'quadratic in the worst case, and the modulo is what keeps even the naive version from looping pointlessly.',
    walkthrough:
      'Reversal works because it flips the order of two blocks at once: after the two local reversals each block is ' +
      'internally backwards but in the right positions, and the global reversal fixes the internals while swapping ' +
      'their order. d = 0 and d = n must be no-ops, and taking the modulo first is what makes them so without a special case.',
    commonMistake:
      'Calling the one-place rotation d times in a loop, or using d as written without reducing it, so a rotation of 12 ' +
      'on an 8-element array walks indices that no longer describe the shift.',
    whyWrong:
      'The repeated version is n*d moves, which on a million-element array rotated a thousand times is a billion ' +
      'writes. An unreduced d also means a 12-place rotation of an 8-element array walks the wrong number of steps ' +
      'unless every index is guarded.',
    followUps: ['Prove the three-reversal identity.', 'Rotate right by d with the same tool — which reversal comes first?', 'What is the juggling algorithm and when is it better?'],
    solution:
      'function rotateLeft(arr, d) {\n' +
      '  const n = arr.length;\n' +
      '  if (n < 2) return arr;\n' +
      '  const k = d % n;\n' +
      '  if (k === 0) return arr;\n' +
      '  const reverse = (from, to) => {\n' +
      '    for (let l = from, r = to - 1; l < r; l += 1, r -= 1) [arr[l], arr[r]] = [arr[r], arr[l]];\n' +
      '  };\n' +
      '  reverse(0, k);\n' +
      '  reverse(k, n);\n' +
      '  reverse(0, n);\n' +
      '  return arr;\n' +
      '}',
    modify: 'Rotate a string encoded as a char array the same way and count the reversals you needed.',
  },
  {
    step: 3,
    name: 'Move Zeros to end',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Push every zero to the end of an array while keeping the non-zero values in their original order.',
    brief: 'Input: an array. Output: the same array, non-zeros first in order, zeros at the tail. Order preservation is the requirement, not the zeros moving.',
    concepts: ['dsa-write-index', 'dsa-two-pointer', 'dsa-boundary-conditions'],
    shortAnswer: 'A write index claims every non-zero it sees; the rest of the array is then filled with zeros.',
    idealAnswer:
      'The read pointer visits every element and the write pointer only advances on a survivor, so the non-zero values ' +
      'keep their relative order — that is stability for free. One pass, O(n), O(1) space, and either tail-filling the ' +
      'remaining slots or swapping zeros backward as you go.',
    walkthrough:
      'Everything before the write index is the compacted prefix; everything after it is still to be examined. The ' +
      'swapping variant (swap the zero at write with the non-zero at read) does the same job in one pass without a '
      + 'second loop, and it is the version that generalises to "move all elements failing a predicate to the end".',
    commonMistake: 'Sorting by a predicate, or splicing zeros out while iterating.',
    whyWrong:
      'A comparator sort is O(n log n) and is not guaranteed stable in the way you expect once the predicate is the only ' +
      'signal; splicing during a forward loop skips the element that shifted into the index you just left behind.',
    followUps: ['Rewrite it with swaps so the tail is never touched.', 'Generalise to moving any chosen value.', 'Why does the write index never pass the read index?'],
    solution:
      'function moveZeros(arr) {\n' +
      '  let write = 0;\n' +
      '  for (const value of arr) if (value !== 0) arr[write++] = value;\n' +
      '  while (write < arr.length) arr[write++] = 0;\n' +
      '  return arr;\n' +
      '}',
    modify: 'Swap instead of overwrite so the zeros move as you scan — how many writes does the array with no zeros cost?',
  },
  {
    step: 3,
    name: 'Linear Search',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Search an unsorted array for a value and return its index, and say what you would have to know to do better.',
    brief: 'Input: an array and a target. Output: the index of the first match, or a signal that there is none.',
    concepts: ['dsa-single-pass-tracking', 'dsa-boundary-conditions', 'dsa-two-pointer'],
    shortAnswer: 'Compare every element in order and return on the first hit; O(n) is the honest floor for unsorted data.',
    idealAnswer:
      'Linear scan returns the first matching index, or -1 when the loop finishes without a hit. You cannot beat O(n) ' +
      'without a precondition: sorted input buys binary search at O(log n), and repeated queries buy a hash index at ' +
      'O(1) per lookup for O(n) space and a build pass.',
    walkthrough:
      'The -1 is the contract, and returning the loop index after it exits gives you n, which a caller will happily use ' +
      'as an index one element past the end. The early return is the whole cost model: on a hit you stop, which is why ' +
      'the average case is better than the worst case when the target is usually present.',
    commonMistake: 'Returning the loop counter on failure, or using indexOf and treating -1 as truthy.',
    whyWrong:
      'An out-of-range index is a silent bug at the call site. And `-1` is truthy in a JS sense only if you write ' +
      '`if (found)` by reflex — the guard has to be against -1 or use the nullish style.',
    followUps: ['What precondition would let you do better?', 'How do you return every matching index?', 'How many comparisons on average when the target is present exactly once?'],
    solution:
      'function linearSearch(arr, target) {\n' +
      '  for (let i = 0; i < arr.length; i += 1) if (arr[i] === target) return i;\n' +
      '  return -1;\n' +
      '}\n\nfunction allMatches(arr, target) {\n' +
      '  const hits = [];\n' +
      '  for (let i = 0; i < arr.length; i += 1) if (arr[i] === target) hits.push(i);\n' +
      '  return hits;\n' +
      '}',
    modify: 'Search for the first element greater than the target instead — what changes in the comparison, and what changes in the guarantee?',
  },
  {
    step: 3,
    name: 'Find the Union and Intersection of two sorted arrays',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Produce the union and the intersection of two sorted arrays in one merged pass, without duplicates.',
    brief: 'Input: two sorted arrays. Output: their union and their intersection, each with distinct values. Sorting both first is not the answer.',
    concepts: ['dsa-sorted-merge', 'dsa-two-pointer', 'dsa-hash-frequency', 'dsa-boundary-conditions'],
    shortAnswer: 'Two pointers walk both arrays; whichever head is smaller advances, and equal heads feed the intersection.',
    idealAnswer:
      'Because both sides are sorted, comparing the two heads decides everything: advance the smaller one into the ' +
      'union, and when they are equal emit it once and advance both. O(n + m) time, O(1) extra beyond the output — ' +
      'versus O(n * m) for the nested check or a hash-set build for each side.',
    walkthrough:
      'This is the merge half of merge sort with the emit rule changed, and the deduplication is local: a value is only ' +
      'appended if it differs from the last thing appended on that side. The trap is the exhausted array — once one ' +
      'pointer reaches its end, the remaining elements of the other belong to the union but cannot belong to the ' +
      'intersection, and forgetting that distinction is where the two outputs start disagreeing.',
    commonMistake: 'Advancing both pointers whenever either value is smaller, or continuing to look for intersections after one array is exhausted.',
    whyWrong:
      'Advancing both loses elements from the union. Chasing matches past exhaustion invents intersection members that ' +
      'the smaller array never contained.',
    followUps: ['Do the same thing on unsorted arrays — what structure and what cost?', 'Union of k sorted arrays?', 'What does the output change to if duplicates must be kept with multiplicity?'],
    solution:
      'function unionIntersectionSorted(a, b) {\n' +
      '  const union = [], intersection = [];\n' +
      '  let i = 0, j = 0;\n' +
      '  const pushUnion = (v) => { if (union[union.length - 1] !== v) union.push(v); };\n' +
      '  while (i < a.length || j < b.length) {\n' +
      '    if (j >= b.length || (i < a.length && a[i] < b[j])) { pushUnion(a[i]); i += 1; }\n' +
      '    else if (i >= a.length || b[j] < a[i]) { pushUnion(b[j]); j += 1; }\n' +
      '    else { pushUnion(a[i]); intersection.push(a[i]); i += 1; j += 1; }\n' +
      '  }\n' +
      '  return { union, intersection };\n' +
      '}',
    modify: 'Return the set difference a minus b using the same two-pointer walk.',
  },
  {
    step: 3,
    name: 'Find missing number in an array',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'One number is missing from 0..n; find it in O(n) and O(1) space, and say which of the two tricks breaks first.',
    brief: 'Input: an array containing n of the n + 1 values in 0..n, each at most once. Output: the missing value.',
    concepts: ['dsa-xor-cancellation', 'dsa-prefix-sum', 'dsa-double-precision', 'dsa-boundary-conditions'],
    shortAnswer: 'Either XOR every index and every element and keep what survives, or subtract the array sum from the expected sum.',
    idealAnswer:
      'XOR is self-cancelling and order-free, so XOR-ing 0..n against all elements leaves exactly the missing value: ' +
      'O(n) time, O(1) space, no overflow. The sum version is the same complexity but computes n(n+1)/2 - actual, and ' +
      'it is the one that breaks on large n in JS because the total leaves the safe integer window.',
    walkthrough:
      'Every value that is present appears twice in the XOR chain, once as an index and once as an element, and a ^ a ' +
      'is 0; what never appears twice is the answer. The sum trick has the same shape — the expected total minus what is ' +
      'really there — but arithmetic overflow is silent in a double, so the answer goes wrong long before the loop does.',
    commonMistake: 'Sorting and scanning for a gap, or using the sum formula without thinking about the magnitude of n.',
    whyWrong:
      'Sorting is O(n log n) plus a mutation of the input to answer an O(n) question. The sum formula looks elegant and ' +
      'starts lying past n around 2^26, where n(n+1)/2 passes 2^53.',
    followUps: ['Which version survives if the array is a stream you can only read once?', 'Now two numbers are missing.', 'Can you do it without modifying the array and without XOR?'],
    solution:
      'function missingNumber(arr) {\n' +
      '  let acc = arr.length;\n' +
      '  for (let i = 0; i < arr.length; i += 1) acc ^= i ^ arr[i];\n' +
      '  return acc;\n' +
      '}',
    modify: 'Switch to the sum version and find the smallest n where the two disagree.',
  },
  {
    step: 3,
    name: 'Max Consecutive Ones',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Find the longest run of 1s in a binary array in one pass.',
    brief: 'Input: an array of 0s and 1s. Output: the length of the longest contiguous run of 1s.',
    concepts: ['dsa-single-pass-tracking', 'dsa-boundary-conditions'],
    shortAnswer: 'Count up while you see ones, reset at a zero, and keep the maximum the counter reached.',
    idealAnswer:
      'A running streak resets on every zero and the answer is the maximum the streak ever held: O(n) time, O(1) ' +
      'space. Reading the max only at the end is the classic miss — by then the streak is whatever the tail was, which ' +
      'may be zero.',
    walkthrough:
      'This is the simplest case of the running-maximum pattern: the state is one integer and the transition is a reset. ' +
      'The all-ones and all-zeros inputs are the two boundary answers the code has to produce without special cases, and ' +
      'taking the max inside the loop rather than after it is what handles a trailing zero.',
    commonMistake: 'Returning the final streak instead of the largest streak seen.',
    whyWrong:
      'Any array that ends in a zero reports 0, including [1,1,1,0] — the answer is visibly 3, so the bug survives code ' +
      'review and dies in production on the first tail-zero input.',
    followUps: ['Now allow flipping at most one zero — what state do you need?', 'Same question for an array of k values with a target run.', 'How do you also return where the run starts?'],
    solution:
      'function maxConsecutiveOnes(arr) {\n' +
      '  let streak = 0, best = 0;\n' +
      '  for (const value of arr) {\n' +
      '    streak = value === 1 ? streak + 1 : 0;\n' +
      '    if (streak > best) best = streak;\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Track the start index of the best run as well, then return the slice.',
  },
  {
    step: 3,
    name: 'Find the number that appears once, and other numbers twice',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Every value appears twice except one; find it in O(n) time and O(1) space.',
    brief: 'Input: a non-empty array where exactly one value occurs once. Output: that value. Sorting and hashing are both disallowed by the space bound.',
    concepts: ['dsa-xor-cancellation', 'dsa-hash-frequency', 'dsa-boundary-conditions'],
    shortAnswer: 'XOR the whole array; pairs cancel and the singleton is what is left.',
    idealAnswer:
      'XOR is commutative and a ^ a === 0, so order does not matter and every duplicated pair annihilates itself, ' +
      'leaving the value that appeared once. O(n) time and O(1) space, with no hash map and no mutation of the input.',
    walkthrough:
      'The hash-map version is also O(n) but pays for a table sized by the distinct values, and the sort version is ' +
      'O(n log n) plus an in-place change. XOR wins because the invariant does not need the values remembered at all: ' +
      'it only needs the pairing to cancel, which is exactly what the constraint promises.',
    commonMistake: 'Summing the array and dividing, or assuming the array is sorted so the pair neighbours can be scanned.',
    whyWrong:
      'A sum has no way to separate one copy from three, and the neighbour scan produces a wrong answer on any unsorted ' +
      'input — which the constraint never said you would get.',
    followUps: ['Now every value appears three times except one — does XOR still work?', 'Two singletons instead of one: what changes?', 'Prove commutativity is what you are leaning on.'],
    solution: 'function singleton(arr) {\n  return arr.reduce((acc, value) => acc ^ value, 0);\n}',
    modify: 'Adapt it to find both missing numbers when exactly two values occur once.',
  },
  {
    step: 3,
    name: 'Longest Subarray with given Sum K (Positives)',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Find the longest contiguous subarray summing to k in a positive-only array, in one pass.',
    brief: 'Input: an array of positive integers and a target k. Output: the length of the longest window whose sum is exactly k.',
    concepts: ['dsa-positive-only-window', 'dsa-prefix-sum', 'dsa-two-pointer', 'dsa-boundary-conditions'],
    shortAnswer: 'Grow a right pointer, shrink from the left while the sum exceeds k, and record the length when it equals k.',
    idealAnswer:
      'With every value positive, extending the window strictly increases the sum, so a left pointer that only moves ' +
      'forward is safe: each element is added once and removed at most once, which is O(n) time and O(1) space. The ' +
      'moment a single negative appears, shrinking is no longer provably correct and the method has to change.',
    walkthrough:
      'This is monotonicity, not cleverness, doing the work: sum(window) increases with the right pointer and decreases ' +
      'with the left, so the two pointers never need to revisit a position. The condition to write first is `while sum ' +
      '> k shrink`, then check equality — checking equality before shrinking misses windows that overshoot and come back.',
    commonMistake: 'Brute-forcing every start and end in O(n^2), or applying the same window to an array with negatives.',
    whyWrong:
      'The quadratic scan dies on a long array. Worse is the negative case: [1, 2, -3, 3, 4] with k = 7 needs the window ' +
      'to grow past a sum of 7, and a shrinking-only pointer reports the shorter answer instead.',
    followUps: ['What breaks when negatives are allowed?', 'Do you get the longest or shortest if you reverse the shrink condition?', 'Return the window itself, not just its length.'],
    solution:
      'function longestPositiveWindow(arr, k) {\n' +
      '  let sum = 0, left = 0, best = 0;\n' +
      '  for (let right = 0; right < arr.length; right += 1) {\n' +
      '    sum += arr[right];\n' +
      '    while (left <= right && sum > k) { sum -= arr[left]; left += 1; }\n' +
      '    if (sum === k) best = Math.max(best, right - left + 1);\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Flip it to the shortest window with sum at least k and keep it O(n).',
  },
  {
    step: 3,
    name: 'Longest Subarray with sum K (Positives + Negatives)',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Same target, but negatives are allowed: find the longest subarray summing to k.',
    brief: 'Input: an array of integers, any sign, and a target k. The two-pointer window is gone; find something else that is still O(n).',
    concepts: ['dsa-prefix-sum', 'dsa-hash-frequency', 'dsa-positive-only-window', 'dsa-boundary-conditions'],
    shortAnswer: 'Prefix sums plus a map from a prefix value to the earliest index that held it.',
    idealAnswer:
      'A subarray sum is a difference of two prefix sums, so for the current prefix p you want the earliest earlier ' +
      'prefix equal to p - k; storing prefix values against their first index in a hash map finds it in O(1). One pass, ' +
      'O(n) time, O(n) space — and correctness survives negatives because nothing is being monotonically shrunk.',
    walkthrough:
      'Storing the first index only is what makes the window as long as possible: a later occurrence of the same prefix ' +
      'starts a shorter subarray, so overwriting would lose length. The prefix of length zero, value zero at index -1, ' +
      'is the entry that lets a subarray starting at index 0 be found — without it the answer at the head of the array ' +
      'is invisible.',
    commonMistake: 'Keeping the latest index for each prefix, or forgetting the zero prefix seed.',
    whyWrong:
      'The latest index answers the shortest subarray, not the longest — the two problems differ by exactly that choice. ' +
      'No seed prefix misses every answer that begins at element zero.',
    followUps: ['Switch to the shortest subarray with the same data. What is the one-line change?', 'Why does the two-pointer version fail here?', 'Count the subarrays instead of measuring the longest.'],
    solution:
      'function longestSubarrayAnySign(arr, k) {\n' +
      '  const firstAt = new Map([[0, -1]]);\n' +
      '  let prefix = 0, best = 0;\n' +
      '  for (let i = 0; i < arr.length; i += 1) {\n' +
      '    prefix += arr[i];\n' +
      '    if (!firstAt.has(prefix)) firstAt.set(prefix, i);\n' +
      '    const start = firstAt.get(prefix - k);\n' +
      '    if (start !== undefined) best = Math.max(best, i - start);\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Now count how many subarrays hit k instead of measuring the longest — which value does the map hold?',
  },
  {
    step: 3,
    name: '2Sum Problem',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Find two indices whose values sum to the target in O(n), and say what sorting the array would cost you.',
    brief: 'Input: an array of integers and a target. Output: the two indices, not the values. Exactly one answer is guaranteed.',
    concepts: ['dsa-complement-lookup', 'dsa-hash-frequency', 'dsa-index-order-loss', 'dsa-boundary-conditions'],
    shortAnswer: 'Look up target - x in a map of the values you have already passed.',
    idealAnswer:
      'One pass holding value to index: at each element ask whether its complement was seen, which is O(1) after the ' +
      'first occurrence, so O(n) time and O(n) space. The sorted two-pointer version is O(n) space-free but is O(n log ' +
      'n) and returns values rather than original indices unless you carry them.',
    walkthrough:
      'The map holds only what has already been scanned, so a pair is found when its second element arrives — which is ' +
      'why checking after inserting still cannot pair an element with itself, and why the same element is safe against ' +
      'a target of 2 * x. If you sort to save the space, the index contract is what breaks first.',
    commonMistake: 'Building the whole map first and then searching it, so an element pairs with itself.',
    whyWrong:
      'For [3, 2, 4] and target 6, the pre-built map finds 3 + 3 at index zero twice: the pair is not real. Searching as ' +
      'you insert makes every candidate pair consist of a past element and the current one.',
    followUps: ['Return the values instead — what changes?', 'Now the input is sorted: give the O(1)-space answer.', 'All pairs, not just one — what does that cost?'],
    solution:
      'function twoSum(nums, target) {\n' +
      '  const seen = new Map();\n' +
      '  for (let i = 0; i < nums.length; i += 1) {\n' +
      '    const pair = seen.get(target - nums[i]);\n' +
      '    if (pair !== undefined) return [pair, i];\n' +
      '    seen.set(nums[i], i);\n' +
      '  }\n' +
      '  return [];\n' +
      '}',
    modify: '3Sum without the O(n^2) hash: sort once, then fix an element and two-pointer the remainder — and say why duplicates need care.',
  },
  {
    step: 3,
    name: 'Sort an array of 0s, 1s and 2s (Dutch National Flag)',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Sort an array holding only 0s, 1s and 2s in one pass with no extra memory.',
    brief: 'Input: an array of 0s, 1s and 2s. Sort it in place. Counting passes and a general sort are both the answer being rejected.',
    concepts: ['dsa-three-way-partition', 'dsa-write-index', 'dsa-boundary-conditions'],
    shortAnswer: 'Three pointers — low, mid, high — so the mid pointer never has to backtrack.',
    idealAnswer:
      'Maintain the invariant that everything before low is 0, everything after high is 2, and the unexamined region ' +
      'starts at mid. A 0 swaps low and mid forward, a 2 swaps high down and leaves mid alone because what arrived is ' +
      'still unexamined, and a 1 just advances mid. One pass, O(n), O(1) space.',
    walkthrough:
      'The asymmetry between the two swap cases is the entire algorithm: after swapping with high, mid cannot advance ' +
      'because the incoming value was never looked at, while after swapping with low it can, because that region has ' +
      'already been cleared. Two counting passes over the array would also be O(n) and are simpler, but they rewrite ' +
      'every slot from a tally instead of sorting, and the partition is the thing you need again in quicksort.',
    commonMistake: 'Advancing mid after a swap with high, or calling sort() and claiming the linear bound.',
    whyWrong:
      'Advancing past an unexamined swapped-in value leaves a 2 in the middle — the classic single-test failure that ' +
      'passes on the sample and breaks on the second input. The library sort is O(n log n) and ignores that there are ' +
      'only three distinct keys.',
    followUps: ['Why can mid never move backwards?', 'Extend it to partition around an arbitrary pivot.', 'Two-pass counting versus one-pass partition: which do you ship and why?'],
    solution:
      'function sortFlags(arr) {\n' +
      '  let low = 0, mid = 0, high = arr.length - 1;\n' +
      '  while (mid <= high) {\n' +
      '    if (arr[mid] === 0) [arr[low++], arr[mid++]] = [arr[mid], arr[low]];\n' +
      '    else if (arr[mid] === 1) mid += 1;\n' +
      '    else [arr[mid], arr[high--]] = [arr[high], arr[mid]];\n' +
      '  }\n' +
      '  return arr;\n' +
      '}',
    modify: 'Use the same three-way partition to sort an array of colours given as strings, and count how many swaps each element takes.',
  },
  {
    step: 1,
    name: 'Find Character Case',
    difficulty: 'Easy',
    topicSlug: MECHANICS,
    stem: 'Given one character, say whether it is uppercase, lowercase, a digit or something else.',
    brief: 'Input: a single character. Output: "uppercase", "lowercase", "digit" or "other". Do it with the code unit, not a table of 62 strings.',
    concepts: ['dsa-character-codes', 'dsa-branch-exhaustiveness'],
    shortAnswer: 'charCodeAt(0) turns the character into a number and the three letter and digit ranges are contiguous, so it is range arithmetic.',
    idealAnswer:
      'Uppercase sits in 65..90, lowercase in 97..122 and digits in 48..57, so four ordered range tests classify every ' + 'ASCII character in O(1) with no allocations. The final branch is the answer for everything else, which is what makes the ' + 'function total rather than throwing on a space.',
    walkthrough:
      'The ranges are not arbitrary: ASCII laid the letters out in two contiguous blocks and the digits in a third, which ' +
      'is why a subtraction of 32 maps lowercase onto uppercase. Range tests beat a lookup array on clarity and on cost, ' +
      'and they extend to Unicode by moving to code points and explicit sets, where the contiguity assumption stops ' +
      'holding for scripts outside BMP basics.',
    commonMistake: 'Comparing the character against strings with < and >, or forgetting the fourth branch and returning undefined.',
    whyWrong:
      'String comparison in JavaScript goes through code-unit order with locale rules folded in, so "z" < "A" is false ' +
      'for a reason you did not choose. A missing final branch then reports the answer for punctuation as undefined, ' +
      'which the caller reads as a bug in the classification rather than in itself.',
    followUps: ['What does the function do for the empty string, and what should it do?', 'Why does a difference of 32 convert case for ASCII letters only?', 'How would this change for "é" or for a Cyrillic letter?'],
    solution:
      'function charCase(ch) {\n' +
      '  const code = ch.charCodeAt(0);\n' +
      '  if (code >= 65 && code <= 90) return "uppercase";\n' +
      '  if (code >= 97 && code <= 122) return "lowercase";\n' +
      '  if (code >= 48 && code <= 57) return "digit";\n' +
      '  return "other";\n' +
      '}',
    modify: 'Make it classify a whole string as "upper", "lower" or "mixed" by looking at every character — what is the new cost?',
  },
  {
    step: 1,
    name: 'Data Type Size',
    difficulty: 'Easy',
    topicSlug: MECHANICS,
    stem: 'Say where a plain JavaScript integer stops being exact, and prove it with an addition.',
    brief: 'Input: two integers. Output: their sum and a flag for whether the sum is trustworthy. Explain what number you actually get past the boundary.',
    concepts: ['dsa-double-precision', 'dsa-boundary-conditions'],
    shortAnswer: 'Every JS number is a float64, so integers are exact only inside the 53-bit window up to Number.MAX_SAFE_INTEGER.',
    idealAnswer:
      'Number.MAX_SAFE_INTEGER is 2^53 - 1, and past it the spacing between representable doubles is greater than one, ' +
      'so 2^53 + 1 evaluates to 2^53. The check is therefore not "is this an integer" but "is this inside the window", ' +
      'and past the window the answer is BigInt or a decimal library, not a bigger if.',
    walkthrough:
      'A double stores 52 explicit mantissa bits plus an implicit one, which is where 53 comes from; the exponent buys ' +
      'enormous magnitude at the price of granularity. This is the reason DSA advice written for C++ or Java says ' +
      '"int64 is safe for products of two 10^9 values" and the same code in JavaScript is not: the bound is 9.007e15, ' +
      'not 9.2e18.',
    commonMistake: 'Assuming Number.MAX_SAFE_INTEGER is the largest number, or that Math.floor fixes a lost digit.',
    whyWrong:
      'Number.MAX_VALUE is about 1.8e308 and is representable — it simply is not an integer you can do arithmetic with. ' +
      'Once the low bit has been rounded away no amount of flooring recovers it, so the loss has to be prevented by ' +
      'staying in the window or switching to BigInt before the operation.',
    followUps: ['What is the largest exact integer product of two 10^9 inputs here?', 'When would you reach for BigInt in a backend service, and what does it cost?', 'Why does 0.1 + 0.2 !== 0.3 have the same root cause?'],
    solution:
      'const MAX_SAFE = Number.MAX_SAFE_INTEGER;\n' +
      '\n' +
      'function addExact(a, b) {\n' +
      '  const sum = a + b;\n' +
      '  return { value: sum, exact: Math.abs(sum) <= MAX_SAFE };\n' +
      '}',
    modify: 'Write multiplyExact for two values up to 10^9 and state the largest inputs for which it can still promise an exact answer.',
  },
  {
    step: 1,
    name: 'If-Else Decision Making',
    difficulty: 'Easy',
    topicSlug: MECHANICS,
    stem: 'Band a score into A/B/C/F with one flat chain and say what the ordering of the tests buys you.',
    brief: 'Input: a value that should be a number in 0..100. Output: the band, or "invalid" for anything outside it. No nested pyramids.',
    concepts: ['dsa-branch-exhaustiveness', 'dsa-boundary-conditions'],
    shortAnswer: 'Test the invalid case first, then the bands from highest to lowest, so each guard is a single inequality.',
    idealAnswer:
      'An ordered chain of early returns reads as a decision table: the first test removes everything that is not in ' +
      'range, and after it each band needs only its lower bound because the upper bound was already settled by the ' +
      'tests above. Writing the bands lowest-first would need two comparisons per band and would be the version that ' +
      'eventually gets the boundary wrong.',
    walkthrough:
      'The reason to lead with the reject is that validation is the only test that must be exhaustive; band tests are ' +
      'allowed to assume the input is a number in range. That is also why typeof and NaN are checked instead of ' +
      'trusting the caller: NaN fails every comparison, so an unguarded chain hands it to the final else and returns F ' +
      'for a value that was never a score.',
    commonMistake: 'Using truthiness on the input, or nesting the bands three deep so the boundary moves when someone edits a branch.',
    whyWrong:
      'A truthy test treats 0 as missing and "95" as a number, and "95" >= 90 is true only because coercion decided it ' +
      'for you. Deep nesting makes each band depend on a path rather than on a table, so the next person adding a D ' +
      'band has to reason about four levels to know where it goes.',
    followUps: ['Where does a boundary of exactly 90 land, and is that written down anywhere?', 'What happens if the invalid test moves to the bottom?', 'How would you express these bands so the boundaries live in one place?'],
    solution:
      'function grade(score) {\n' +
      '  if (typeof score !== "number" || Number.isNaN(score) || score < 0 || score > 100) return "invalid";\n' +
      '  if (score >= 90) return "A";\n' +
      '  if (score >= 75) return "B";\n' +
      '  if (score >= 50) return "C";\n' +
      '  return "F";\n' +
      '}',
    modify: 'Turn the chain into a table of thresholds and loop over it — which version is easier to extend with a D band?',
  },
  {
    step: 1,
    name: 'Switch Statement',
    difficulty: 'Easy',
    topicSlug: MECHANICS,
    stem: 'Map a month to its day count with a switch and explain what a missing break would do.',
    brief: 'Input: a month number 1..12 and a year. Output: days in that month, with February following the leap rule, and null for an impossible month.',
    concepts: ['dsa-switch-fallthrough', 'dsa-boundary-conditions'],
    shortAnswer: 'Stack the case labels that share a body, return from each group, and keep default for the month that does not exist.',
    idealAnswer:
      'Switch matches by strict equality and then executes from the matched label onward, so consecutive labels with no ' +
      'statements between them are one group — seven months return 31 this way and four return 30. February needs the ' +
      'leap test, and default has to answer 0, 13 and non-integers or the function silently returns undefined.',
    walkthrough:
      'Fallthrough is the feature that makes grouped cases readable, and it is also the bug class: forgetting break ' +
      'keeps executing into the next body. TypeScript narrows on the case values, which is why an exhaustive switch over ' +
      'a union can replace default entirely — but a runtime month from an HTTP request is not a union, so the default ' +
      'branch stays load-bearing.',
    commonMistake: 'Expecting a case to stop on its own, or using a switch for range tests like score > 90.',
    whyWrong:
      'Without the return, case 8 falls into case 9 and reports 30 days for August. And because case labels compare ' +
      'strictly, switch (score) { case score > 90: ... } matches against true, which is the kind of thing that survives ' +
      'code review only when nobody tests a failing grade.',
    followUps: ['What is the difference between break, return and continue inside a switch?', 'Which inputs reach default here?', 'When is an object lookup table better than a switch?'],
    solution:
      'function daysInMonth(month, year) {\n' +
      '  switch (month) {\n' +
      '    case 1:\n' +
      '    case 3:\n' +
      '    case 5:\n' +
      '    case 7:\n' +
      '    case 8:\n' +
      '    case 10:\n' +
      '    case 12:\n' +
      '      return 31;\n' +
      '    case 4:\n' +
      '    case 6:\n' +
      '    case 9:\n' +
      '    case 11:\n' +
      '      return 30;\n' +
      '    case 2:\n' +
      '      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;\n' +
      '    default:\n' +
      '      return null;\n' +
      '  }\n' +
      '}',
    modify: 'Add a monthName(month) switch that returns the name, then replace both switches with lookup tables and compare the two styles.',
  },
  {
    step: 1,
    name: 'For Loops & While Loops',
    difficulty: 'Easy',
    topicSlug: MECHANICS,
    stem: 'Write the same count as a for loop, a while loop and a shrinking loop, and say where each one can hang.',
    brief: 'Input: n. Output: the sum 1..n from the first two, and the number of halvings until zero from the third.',
    concepts: ['dsa-loop-invariant', 'dsa-boundary-conditions'],
    shortAnswer: 'A for keeps the bound, condition and step in one line; a while puts them apart, which is where the missing step hides.',
    idealAnswer:
      'Both forms express the same invariant — total holds the sum of everything already visited and i is the next ' +
      'unvisited index — so the choice is about where the three parts of the loop live. The halving loop is the one ' +
      'whose bound is not a count: its cost is log n, and it terminates because integer division strictly decreases a ' +
      'positive input every turn.',
    walkthrough:
      'A while loop is the honest shape when the exit is a condition rather than a count, such as reading until a ' +
      'sentinel or following a linked list. It is the dangerous shape when the update moves into the body, because the ' +
      'compiler will not complain about a loop whose condition depends on a variable nobody touches. Every non-' +
      'terminating loop you will write is a while whose step got lost in a branch.',
    commonMistake: 'Writing i <= n in one place and i < n in another, or putting the increment behind the condition that can skip it.',
    whyWrong:
      'An off-by-one in the bound silently adds or drops exactly one element — it looks correct on the sample and wrong ' +
      'in production. A skipped increment inside an early-continue path is worse: the process does not return a wrong ' +
      'answer, it never returns.',
    followUps: ['Which of the three forms can loop forever on a negative input?', 'Why is sumHalving(0) zero steps rather than one?', 'Rewrite sumFor with reduce — what does that cost you in clarity for DSA?'],
    solution:
      'function sumFor(n) {\n' +
      '  let total = 0;\n' +
      '  for (let i = 1; i <= n; i += 1) total += i;\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function sumWhile(n) {\n' +
      '  let total = 0;\n' +
      '  let i = 1;\n' +
      '  while (i <= n) {\n' +
      '    total += i;\n' +
      '    i += 1;\n' +
      '  }\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function sumHalving(n) {\n' +
      '  let steps = 0;\n' +
      '  while (n > 0) {\n' +
      '    n = Math.floor(n / 2);\n' +
      '    steps += 1;\n' +
      '  }\n' +
      '  return steps;\n' +
      '}',
    modify: 'Add sumRecursion(n) and put all four beside each other — which would you accept in a code review, and why?',
  },
  {
    step: 1,
    name: 'Functions (Pass by Reference and Value)',
    difficulty: 'Easy',
    topicSlug: MECHANICS,
    stem: 'Show by running it why swapping two numbers inside a function never reaches the caller.',
    brief: 'Input: two numbers, then a two-element array. Output: one swap that works and one that cannot, plus the reason they differ.',
    concepts: ['dsa-value-versus-reference', 'dsa-boundary-conditions'],
    shortAnswer: 'JavaScript passes the value every time; for an object the value is the reference, so mutation shows but reassignment does not.',
    idealAnswer:
      'swapValues rebinds its own parameters, which are copies, so the caller sees nothing. swapInPlace writes through a ' +
      'copied reference onto the same array the caller holds, so the change is visible. The rule that decides both cases ' +
      'is one sentence: you can never change which object a caller-side variable points at from inside a function.',
    walkthrough:
      'This is why the idiomatic JavaScript "swap" returns a pair or takes a container, and why algorithms on arrays ' +
      'that mutate in place are written against the array rather than against indices handed to a helper. Passing by ' +
      'reference proper — an out parameter — does not exist here, so a function that needs to give back more than one ' +
      'value returns an object or an array and says so in its name.',
    commonMistake: 'Calling it pass by sharing and concluding that objects are copied, or reassigning a parameter and expecting the caller to see it.',
    whyWrong:
      'If objects were passed by reference, reassigning pair = [] inside a function would replace the caller\'s array; it ' +
      'does not, and the code that assumed it silently keeps operating on the old one. The opposite confusion makes ' +
      'people clone every argument defensively and lose the O(1) sharing that made the mutation version work.',
    followUps: ['Return a swapped tuple instead — what does that cost per call?', 'Why do algorithms books write swap(arr, i, j) with indices rather than swap(a, b)?', 'Does Array.from(input) at the top of a sort change this contract?'],
    solution:
      'function swapValues(a, b) {\n' +
      '  const t = a;\n' +
      '  a = b;\n' +
      '  b = t;\n' +
      '}\n' +
      '\n' +
      'function swapInPlace(pair) {\n' +
      '  const t = pair[0];\n' +
      '  pair[0] = pair[1];\n' +
      '  pair[1] = t;\n' +
      '  return pair;\n' +
      '}',
    modify: 'Write swapByIndex(arr, i, j) and use it in a reversal — why is that the form sorting code always uses?',
  },
  {
    step: 1,
    name: 'Time Complexity Analysis Practice',
    difficulty: 'Easy',
    topicSlug: COMPLEXITY,
    stem: 'Give the tight bound for four loops by counting iterations and work per iteration, not by looking at the line count.',
    brief: 'Four functions over an input of size n. Output: what each one computes as a count, and the bound that follows from it.',
    concepts: ['dsa-complexity-counting', 'dsa-loop-invariant', 'dsa-boundary-conditions'],
    shortAnswer: 'Multiply iterations by per-iteration work: n, n squared, log n, and the n(n+1)/2 triangle are the four answers.',
    idealAnswer:
      'A single linear loop is O(n); two nested full loops are O(n^2); a loop whose counter doubles is O(log n) because ' +
      'it runs until 2^k passes n; and a nested loop whose inner start moves with the outer index is the triangle ' +
      'n(n+1)/2, which is O(n^2) with a constant the big-O hides. Stating the bound is the easy half — the argument is ' +
      'what makes it checkable.',
    walkthrough:
      'The halving loop is the one people get wrong in both directions: it is not O(n/2) and it is not free, it is the ' +
      'number of times you can divide by two, which is log2 n rounded up. The triangle is not "half of n squared, so a ' +
      'different class" — constants do not change the class, which is exactly why binary search\'s log n and merge ' +
      'sort\'s n log n survive being written with ugly coefficients.',
    commonMistake: 'Reading complexity off the number of loops, or calling the triangle O(n) because each element appears once per row.',
    whyWrong:
      'A loop that halves is one loop and still logarithmic, while two loops where the inner runs fully are quadratic ' +
      'no matter how short the code looks. Counting rows instead of cells in the triangle under-states nothing about the ' +
      'class and hides the real constant, which is the one number that decides whether the job finishes.',
    followUps: ['Which of the four would you refuse to run at n = 10^6?', 'What is third(n) when n is not a power of two?', 'Rewrite fourth\'s inner bound so the loop is linear — is that possible at all?'],
    solution:
      'function linear(n) {\n' +
      '  let work = 0;\n' +
      '  for (let i = 0; i < n; i += 1) work += 1;\n' +
      '  return work;\n' +
      '}\n' +
      '\n' +
      'function quadratic(n) {\n' +
      '  let work = 0;\n' +
      '  for (let i = 0; i < n; i += 1) for (let j = 0; j < n; j += 1) work += 1;\n' +
      '  return work;\n' +
      '}\n' +
      '\n' +
      'function logarithmic(n) {\n' +
      '  let work = 0;\n' +
      '  for (let i = 1; i <= n; i *= 2) work += 1;\n' +
      '  return work;\n' +
      '}\n' +
      '\n' +
      'function triangle(n) {\n' +
      '  let work = 0;\n' +
      '  for (let i = 0; i < n; i += 1) for (let j = i; j < n; j += 1) work += 1;\n' +
      '  return work;\n' +
      '}',
    modify: 'Add a loop that runs j from 0 to i for every i and prove to yourself it is the same triangle, not twice it.',
  },
  {
    step: 2,
    name: 'Selection Sort',
    difficulty: 'Easy',
    topicSlug: SORTING,
    stem: 'Sort an array by repeatedly selecting the minimum of the tail, and say what the swaps cost.',
    brief: 'Input: an array of numbers. Output: a sorted array; the input must survive unchanged. Give the comparison and swap counts.',
    concepts: ['dsa-selection-min-scan', 'dsa-boundary-conditions', 'dsa-value-versus-reference'],
    shortAnswer: 'Scan the unsorted tail for the smallest index, swap it onto the boundary, and shrink the tail by one each pass.',
    idealAnswer:
      'The invariant is that everything before the boundary is final and nothing after it has been promised anything, so ' +
      'each pass costs n - i comparisons and at most one swap. That gives O(n^2) time in every input order and O(1) ' +
      'extra space, which is the whole argument for selection sort: it is the algorithm you pick when writes are ' +
      'expensive and comparisons are cheap.',
    walkthrough:
      'Because the scan is unconditional, a sorted input buys no speedup — the number of comparisons is fixed at ' +
      'n(n-1)/2 whether the data is already ordered or reversed. What does vary is swaps: skipping the swap when the ' +
      'minimum is already at the boundary keeps it at or below n - 1, so a nearly sorted array is still cheap to write. ' +
      'Copying the input first is what keeps the function pure enough to reason about.',
    commonMistake: 'Swapping on every comparison inside the scan, or sorting the original array and surprising the caller.',
    whyWrong:
      'Exchanging inside the inner loop turns one swap per pass into many and destroys the write-count property that is ' +
      'the only reason to choose this algorithm. Mutating the argument is worse in a service: the caller\'s array is now ' +
      'sorted, and the code that read it afterwards has no idea its order was someone else\'s business.',
    followUps: ['How many swaps does an already sorted array of 1000 elements take here?', 'Where does selection sort beat quicksort?', 'Make it sort an array of objects by a key — what changes in the comparison?'],
    solution:
      'function selectionSort(input) {\n' +
      '  const a = [...input];\n' +
      '  for (let i = 0; i < a.length; i += 1) {\n' +
      '    let min = i;\n' +
      '    for (let j = i + 1; j < a.length; j += 1) {\n' +
      '      if (a[j] < a[min]) min = j;\n' +
      '    }\n' +
      '    if (min !== i) {\n' +
      '      const t = a[i];\n' +
      '      a[i] = a[min];\n' +
      '      a[min] = t;\n' +
      '    }\n' +
      '  }\n' +
      '  return a;\n' +
      '}',
    modify: 'Sort both ends per pass — find the minimum and the maximum in one scan and place them — and say how many passes that saves.',
  },
  {
    step: 2,
    name: 'Bubble Sort',
    difficulty: 'Easy',
    topicSlug: SORTING,
    stem: 'Sort by adjacent swaps with an early exit, and explain what one pass actually guarantees.',
    brief: 'Input: an array of numbers. Output: a sorted copy. Say which input makes it linear and which makes it quadratic.',
    concepts: ['dsa-bubble-adjacent-pass', 'dsa-boundary-conditions'],
    shortAnswer: 'Each pass carries the largest remaining value to the end, so the bound shrinks by one and a clean pass means done.',
    idealAnswer:
      'The guarantee after pass k is that the last k slots hold the k largest values in order, which is why the inner ' +
      'bound is the shrinking frontier rather than the length. A swapped flag makes an already sorted array finish in one ' +
      'pass — O(n) best case — while a reversed array still needs every comparison, so O(n^2) worst. The invariant is ' +
      'what you state; the flag is free.',
    walkthrough:
      'Adjacent-only swaps mean an element can travel one slot per pass, which is exactly why a small value sitting at ' +
      'the far right is expensive to move left — turtles, in the classic analysis, versus rabbits that sink fast. That ' +
      'asymmetry is the reason insertion sort, which shifts instead of swapping, dominates bubble sort in practice with ' +
      'the same worst-case bound.',
    commonMistake: 'Keeping the inner bound at the full length every pass, or dropping the swapped flag and always running n passes.',
    whyWrong:
      'Re-scanning sorted tail slots wastes comparisons but does not break correctness, which is what makes it survive ' +
      'review; the missing flag is the same cost. The change that does break it is comparing j against j + 1 past the ' +
      'shrinking bound, which reads undefined at the end of the array and sorts nothing on the second pass.',
    followUps: ['Which single element is most expensive to move, and why?', 'Count the inversions in a reversed array and relate them to the swap count.', 'Would you ship this over insertion sort for a 20-element list?'],
    solution:
      'function bubbleSort(input) {\n' +
      '  const a = [...input];\n' +
      '  for (let i = a.length - 1; i >= 0; i -= 1) {\n' +
      '    let swapped = false;\n' +
      '    for (let j = 0; j < i; j += 1) {\n' +
      '      if (a[j] > a[j + 1]) {\n' +
      '        const t = a[j];\n' +
      '        a[j] = a[j + 1];\n' +
      '        a[j + 1] = t;\n' +
      '        swapped = true;\n' +
      '      }\n' +
      '    }\n' +
      '    if (!swapped) break;\n' +
      '  }\n' +
      '  return a;\n' +
      '}',
    modify: 'Track the index of the last swap and set the next pass bound to it instead of i - 1 — why is that always safe?',
  },
  {
    step: 2,
    name: 'Insertion Sort',
    difficulty: 'Easy',
    topicSlug: SORTING,
    stem: 'Sort by growing a sorted prefix and shifting larger elements out of the way.',
    brief: 'Input: an array of numbers. Output: a sorted copy. Explain why nearly sorted input is the interesting case.',
    concepts: ['dsa-insertion-shift', 'dsa-boundary-conditions', 'dsa-loop-invariant'],
    shortAnswer: 'Hold the key, slide every larger element of the sorted prefix one slot right, then drop the key into the hole.',
    idealAnswer:
      'The invariant is that the prefix up to i is sorted, so finding the insert point only needs comparisons inside that ' +
      'prefix and no scanning of the tail at all. Shifting rather than swapping means one write per displaced element, ' +
      'and an already sorted array performs zero shifts, giving O(n) best case and O(n^2) worst — the same bound as ' +
      'bubble sort with a far better constant.',
    walkthrough:
      'The cost is exactly the number of inversions: each shift removes one, so partially ordered data is cheap in a way ' +
      'that neither selection nor quicksort can match. This is why real sorts switch to insertion below a threshold and ' +
      'why TimSort spends its time extending runs you already paid for.',
    commonMistake: 'Swapping neighbours repeatedly instead of shifting, or writing the key back at index i instead of j + 1.',
    whyWrong:
      'Swapping makes the same number of writes as shifts but three times the assignments, and it obscures the invariant ' +
      'the algorithm rests on. Writing the key back at i is the subtle one: it leaves the hole unfilled, so the array is ' +
      'no longer a permutation of the input and duplicate data appears where a value should have moved.',
    followUps: ['Prove the number of shifts equals the inversion count.', 'Binary insertion sort halves the comparisons — why is it still O(n^2) writes?', 'When would you pick it in production rather than Array.prototype.sort?'],
    solution:
      'function insertionSort(input) {\n' +
      '  const a = [...input];\n' +
      '  for (let i = 1; i < a.length; i += 1) {\n' +
      '    const key = a[i];\n' +
      '    let j = i - 1;\n' +
      '    while (j >= 0 && a[j] > key) {\n' +
      '      a[j + 1] = a[j];\n' +
      '      j -= 1;\n' +
      '    }\n' +
      '    a[j + 1] = key;\n' +
      '  }\n' +
      '  return a;\n' +
      '}',
    modify: 'Sort strings with the same loop — which single character in the comparison has to change, and what breaks for equal keys?',
  },
  {
    step: 2,
    name: 'Merge Sort',
    difficulty: 'Medium',
    topicSlug: SORTING,
    stem: 'Sort by splitting in half and merging, and say what the merge step is buying you.',
    brief: 'Input: an array of numbers. Output: a sorted copy. Give the recurrence, the depth and the extra space.',
    concepts: ['dsa-divide-and-conquer', 'dsa-sorted-merge', 'dsa-call-stack-cost'],
    shortAnswer: 'Sort each half recursively, then merge two sorted runs in one pass; T(n) = 2T(n/2) + O(n).',
    idealAnswer:
      'A merge of two sorted runs is linear because each output slot consumes exactly one comparison and neither input ' +
      'ever moves backwards. log n levels times O(n) per level gives O(n log n) in every input order, and the cost is ' +
      'O(n) auxiliary space for the runs. That guaranteed bound is what quicksort does not offer.',
    walkthrough:
      'The recursion tree is the analysis: depth is log2 n because each split halves, and every element is touched once ' +
      'per level, which is why the work per level stays linear rather than growing. Using <= rather than < in the ' +
      'comparison is what makes equal keys keep their relative order, so the algorithm is stable — the property external ' +
      'sorts and database ORDER BY depend on.',
    commonMistake: 'Merging with indexOf or shift on the runs, or claiming O(n log n) space because the recursion is deep.',
    whyWrong:
      'shift on a JavaScript array is O(length), which turns a linear merge into a quadratic one and quietly removes the ' +
      'point of the algorithm. Space is n for the arrays alive at one level plus O(log n) frames, not n per level — ' +
      'getting that wrong is what makes people reject merge sort for reasons it does not have.',
    followUps: ['Why does the merge never need to look back?', 'What does stability buy you when sorting rows by two columns?', 'External merge sort on a 40GB file: what changes and what does not?'],
    solution:
      'function mergeSort(a) {\n' +
      '  if (a.length <= 1) return a;\n' +
      '  const mid = Math.floor(a.length / 2);\n' +
      '  const left = mergeSort(a.slice(0, mid));\n' +
      '  const right = mergeSort(a.slice(mid));\n' +
      '  const out = [];\n' +
      '  let i = 0;\n' +
      '  let j = 0;\n' +
      '  while (i < left.length && j < right.length) {\n' +
      '    if (left[i] <= right[j]) {\n' +
      '      out.push(left[i]);\n' +
      '      i += 1;\n' +
      '    } else {\n' +
      '      out.push(right[j]);\n' +
      '      j += 1;\n' +
      '    }\n' +
      '  }\n' +
      '  while (i < left.length) {\n' +
      '    out.push(left[i]);\n' +
      '    i += 1;\n' +
      '  }\n' +
      '  while (j < right.length) {\n' +
      '    out.push(right[j]);\n' +
      '    j += 1;\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify: 'Make it sort pairs [key, index] by key and show that equal keys keep their input order.',
  },
  {
    step: 2,
    name: 'Recursive Bubble Sort',
    difficulty: 'Easy',
    topicSlug: SORTING,
    stem: 'Rewrite bubble sort as a recursion that shrinks the bound, and say what the frames cost.',
    brief: 'Input: an array of numbers, sorted in place. Output: the same array ordered. Then compare the space to the loop form.',
    concepts: ['dsa-bubble-adjacent-pass', 'dsa-recursive-decomposition', 'dsa-call-stack-cost'],
    shortAnswer: 'One adjacent-sweep sinks the largest remaining value, then recurse on the array minus its last slot.',
    idealAnswer:
      'The recursive form states the invariant better — after the sweep the tail is final, so the subproblem is strictly ' +
      'smaller — and the base case is a bound of one. It is the same O(n^2) comparisons, and it pays n frames of stack ' +
      'to say it, which the loop form never does.',
    walkthrough:
      'This is the recursion that is a for loop in disguise: no branching structure in the data, no value coming back up ' +
      'the stack, just a countdown. It is worth writing once to see how the invariant reads, and worth rewriting as a ' +
      'loop before shipping, because Node\'s stack ceiling turns large n into a RangeError while the loop version simply ' +
      'takes longer.',
    commonMistake: 'Recreating the array on every call, or forgetting to pass the shrinking bound and recursing forever.',
    whyWrong:
      'Copying per frame makes the space O(n^2) and the constant huge, which is the opposite of the point of an in-place ' +
      'sort. A bound that never shrinks is not a bug you see in the output — you never get output, you get a stack ' +
      'overflow after a few tens of thousands of frames.',
    followUps: ['At what n does the recursive version blow the stack in Node, and how do you measure it?', 'Add the swapped flag to the recursive form — how do you stop early without a return value?', 'Which sorts genuinely benefit from being recursive?'],
    solution:
      'function bubbleRecursive(a, n = a.length) {\n' +
      '  if (n <= 1) return a;\n' +
      '  for (let j = 0; j < n - 1; j += 1) {\n' +
      '    if (a[j] > a[j + 1]) {\n' +
      '      const t = a[j];\n' +
      '      a[j] = a[j + 1];\n' +
      '      a[j + 1] = t;\n' +
      '    }\n' +
      '  }\n' +
      '  return bubbleRecursive(a, n - 1);\n' +
      '}',
    modify: 'Convert it back to a loop and keep both versions — which one would you leave in a pull request?',
  },
  {
    step: 2,
    name: 'Recursive Insertion Sort',
    difficulty: 'Easy',
    topicSlug: SORTING,
    stem: 'Sort by inserting one element per recursive call and say what the recursion is really carrying.',
    brief: 'Input: an array of numbers, sorted in place. Output: the same array ordered. Base case and the reducing argument, stated.',
    concepts: ['dsa-insertion-shift', 'dsa-recursive-decomposition', 'dsa-call-stack-cost'],
    shortAnswer: 'The prefix up to i is sorted; insert element i into it, then recurse on i + 1.',
    idealAnswer:
      'Each call holds one invariant: everything before i is ordered, so the work is a downward scan that shifts larger ' +
      'values right until the slot is found. The argument that strictly reduces is the index, and the base case is the ' +
      'index reaching the length. Cost is the same O(n^2) worst and O(n) best as the loop, plus O(n) stack.',
    walkthrough:
      'Reading it as recursion makes the invariant explicit — the call signature literally says "prefix of length i is ' +
      'sorted" — which is the pedagogical value and nothing more. The frames carry only the index, so unlike a genuine ' +
      'divide and conquer this builds no tree of subproblems; it is a loop with a countdown, and the honest rewrite is ' +
      'the iterative one.',
    commonMistake: 'Re-sorting the whole prefix on every call instead of inserting one element.',
    whyWrong:
      'Recursing into insertionSort(a.slice(0, i)) throws away the invariant and turns an adaptive O(n) best case into a ' +
      'quadratic one on sorted data, plus a copy per frame. The algorithm is only linear on ordered input when each call ' +
      'does exactly one insert.',
    followUps: ['Which argument strictly decreases, and what breaks if it does not?', 'Insert with binary search for the slot — does the complexity change?', 'Why is the loop version preferred even though this reads better?'],
    solution:
      'function insertionRecursive(a, i = 1) {\n' +
      '  if (i >= a.length) return a;\n' +
      '  const key = a[i];\n' +
      '  let j = i - 1;\n' +
      '  while (j >= 0 && a[j] > key) {\n' +
      '    a[j + 1] = a[j];\n' +
      '    j -= 1;\n' +
      '  }\n' +
      '  a[j + 1] = key;\n' +
      '  return insertionRecursive(a, i + 1);\n' +
      '}',
    modify: 'Make the inner scan recursive too, and say what the two stacks cost together at n = 100000.',
  },
  {
    step: 2,
    name: 'Quick Sort',
    difficulty: 'Medium',
    topicSlug: SORTING,
    stem: 'Sort in place around a pivot and say exactly which input makes your version quadratic.',
    brief: 'Input: an array of numbers, sorted in place. Output: the same array ordered. State the partition invariant, the average bound and the worst case.',
    concepts: ['dsa-pivot-partition', 'dsa-divide-and-conquer', 'dsa-boundary-conditions'],
    shortAnswer: 'Partition so smaller values collect left of the pivot, then recurse on both sides; the pivot lands at its final index.',
    idealAnswer:
      'The Lomuto scan keeps everything before i strictly below the pivot and everything between i and j at or above it, ' +
      'so one pass ends with the pivot swapped into i and in its final sorted position. Expected time is O(n log n) with ' +
      'O(log n) stack for the recursion, and it is in place — but picking the last element as pivot on an already ' +
      'sorted array splits off n-1 and 0, which is the O(n^2) case.',
    walkthrough:
      'What you pay for is decided by split balance, not by the pass itself: each level costs O(n) comparisons total and ' +
      'there are as many levels as the depth of the recursion tree. Median-of-three or a random pivot makes the ' +
      'pathological input unlikely rather than impossible, which is why real implementations do it and why an adversary ' +
      'who controls your input can still break the fixed-pivot version.',
    commonMistake: 'Including the pivot in the recursive ranges, or recursing on lo..i and i+1..hi after a Lomuto partition.',
    whyWrong:
      'A range that still contains the pivot either re-partitions it forever or double-counts it, and the forever case is ' +
      'a stack overflow rather than a wrong answer. The wrong-split case swaps the pivot out of position and produces an ' +
      'array that looks sorted on small samples and is not.',
    followUps: ['Which pivot choice makes the sorted input safe, and what does it cost per call?', 'Compare the constant factor against merge sort and say why quicksort usually wins.', 'Hoare partition does fewer swaps than Lomuto — where does the pointer cross?'],
    solution:
      'function quickSort(a, lo = 0, hi = a.length - 1) {\n' +
      '  if (lo >= hi) return a;\n' +
      '  const pivot = a[hi];\n' +
      '  let i = lo;\n' +
      '  for (let j = lo; j < hi; j += 1) {\n' +
      '    if (a[j] < pivot) {\n' +
      '      const t = a[i];\n' +
      '      a[i] = a[j];\n' +
      '      a[j] = t;\n' +
      '      i += 1;\n' +
      '    }\n' +
      '  }\n' +
      '  const t = a[i];\n' +
      '  a[i] = a[hi];\n' +
      '  a[hi] = t;\n' +
      '  quickSort(a, lo, i - 1);\n' +
      '  quickSort(a, i + 1, hi);\n' +
      '  return a;\n' +
      '}',
    modify: 'Replace the last-element pivot with median-of-three and time both on an already sorted array of 5000 elements.',
  },
  {
    step: 1,
    name: 'Pattern-1: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print a square of stars n rows by n columns, returned as one string rather than logged.',
    brief: 'Input: n. Output: n lines of n stars joined by newlines, so the test can compare strings. n = 0 gives the empty string.',
    concepts: ['dsa-coordinate-loops', 'dsa-row-building', 'dsa-boundary-conditions'],
    shortAnswer: 'The row is one string repeated n times, so the shape is a loop over rows with no inner loop at all.',
    idealAnswer:
      'A square has no per-column decision: every cell is a star, so the inner loop is redundant and building the row ' +
      'once with repeat is the correct reading of the grid. Returning the joined string instead of console.log inside ' +
      'the loop is what makes the function testable and reusable by anything that is not a terminal.',
    walkthrough:
      'The useful habit from this pattern onward is separating the shape from its destination: the function produces a ' +
      'string, the caller decides whether it goes to stdout, a response body or a test. That separation is exactly what ' +
      'makes the trivial case checkable — n = 0 must return the empty string, not a single newline, because joining an ' +
      'empty array of rows produces nothing.',
    commonMistake: 'Printing inside the function, or emitting a trailing newline that makes the string unequal to itself in a test.',
    whyWrong:
      'A function that writes to the console cannot be asserted on, so every later pattern becomes a manual review. And ' +
      'joining an array of rows differs from appending row plus newline in the loop, which leaves one extra line break ' +
      'at the end and fails the equality the moment the output is compared rather than eyeballed.',
    followUps: ['Why is join on an array of rows better than string concatenation in the loop?', 'What does the function return for n = 0 and why is that the right answer?', 'Which shape would actually need the inner loop?'],
    solution:
      'function squareStars(n) {\n' +
      '  const rows = [];\n' +
      '  const row = "*".repeat(n);\n' +
      '  for (let i = 0; i < n; i += 1) rows.push(row);\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Take rows and columns as two arguments, then check that swapping them rotates the output rather than breaking it.',
  },
  {
    step: 1,
    name: 'Pattern-2: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print an r by c rectangle of stars and name which of the two arguments is the outer loop.',
    brief: 'Input: r rows and c columns. Output: r lines of c stars. Say what the inner and outer indices each control.',
    concepts: ['dsa-coordinate-loops', 'dsa-row-building'],
    shortAnswer: 'The outer index counts rows and the inner one counts columns, so the row length is c and the line count is r.',
    idealAnswer:
      'Getting r and c the wrong way round is the only real failure mode, and the fix is to state the invariant out ' +
      'loud: after building a row it is exactly c characters wide, and after the outer loop there are exactly r of them. ' +
      'Time and space are both O(r * c) because the output itself is that large — a print pattern is never free.',
    walkthrough:
      'Rectangle is the first shape where the two axes are independent, which is why every later pattern asks "what is ' +
      'this in terms of row and column". Once the row is a function of the column index alone, the outer loop stops ' +
      'caring what it prints, and that asymmetry is what makes a triangle a one-line change from a rectangle.',
    commonMistake: 'Swapping the two bounds so an r by c request renders a c by r block.',
    whyWrong:
      'The mistake is invisible on a square sample, so a test with r = 2 and c = 5 is the one that matters — and passing ' +
      'the arguments in the wrong order produces a shape that is wrong for every non-square input while looking correct ' +
      'in review.',
    followUps: ['Which argument decides the string length and which decides the array length?', 'What is the output size in characters for r = 1000, c = 1000?', 'Give the same function a single space character and print a blank grid — what breaks?'],
    solution:
      'function rectangle(r, c) {\n' +
      '  const rows = [];\n' +
      '  const row = "*".repeat(Math.max(0, c));\n' +
      '  for (let i = 0; i < r; i += 1) rows.push(row);\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Print the rectangle border only — stars on the first and last row and on the first and last column, spaces elsewhere.',
  },
  {
    step: 1,
    name: 'Pattern-3: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print a right triangle whose row i holds i stars, and state the row-to-count rule.',
    brief: 'Input: n. Output: row 1 has one star, row n has n stars, left aligned.',
    concepts: ['dsa-coordinate-loops', 'dsa-row-building'],
    shortAnswer: 'The row length equals the one-based row number, so the whole shape is one line per row with no inner scan.',
    idealAnswer:
      'Read as coordinates, the rule is star when column <= row, which is a triangle in the grid; expressed as row ' +
      'construction it is simply "*".repeat(i). The one-based index is the thing to get right — starting i at 0 makes ' +
      'the first row empty and shifts the whole triangle by one line.',
    walkthrough:
      'Every later pattern is a variation on "what does row i contain". Writing the answer as a function of i rather ' +
      'than as a mutable counter you increment inside the loop is what keeps the shapes composable, because a function ' +
      'of i can be evaluated backwards for the mirrored versions without any state.',
    commonMistake: 'Using a running counter that grows per star instead of deriving the row from the index.',
    whyWrong:
      'A counter is state, so the inverted and aligned variants have to be rewritten instead of re-derived, and the ' +
      'first off-by-one in the counter silently changes every row length below it.',
    followUps: ['Rewrite it with an inner column loop and a comparison — which version extends to pattern 5?', 'What is the total character count as a function of n?', 'Which row is empty if i starts at 0?'],
    solution:
      'function growingTriangle(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) rows.push("*".repeat(i));\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Make the row length 2i - 1 instead of i and describe the shape that comes out.',
  },
  {
    step: 1,
    name: 'Pattern-4: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print the inverted right triangle: row i holds n - i + 1 stars.',
    brief: 'Input: n. Output: the first row is n stars wide and the last row is one star, left aligned.',
    concepts: ['dsa-coordinate-loops', 'dsa-padding-arithmetic'],
    shortAnswer: 'Count down from n by deriving the length from the row index instead of mutating a counter.',
    idealAnswer:
      'Length n - i + 1 for one-based i is the whole rule, and the plus one is the boundary: without it the last row is ' +
      'empty and the triangle has lost its tip. Deriving the value each iteration, rather than decrementing a variable, ' +
      'leaves the shape readable as a formula and makes the mirrored version a one-character edit.',
    walkthrough:
      'This is the pattern where the off-by-one question becomes visible: n rows means the row indices span one to n, so ' +
      'the length expression must be n at i = 1 and 1 at i = n. Check those two endpoints in your head before running ' +
      'anything, which is the same boundary reasoning that decides a binary search loop bound.',
    commonMistake: 'Writing n - i and losing the final row, or looping while i < n.',
    whyWrong:
      'Dropping the one removes exactly one star from every row, so the shape still looks like a triangle and the bug ' +
      'survives review; it shows up as a missing last line, which is the kind of defect a string test catches ' +
      'immediately and an eye never does.',
    followUps: ['Verify the two endpoints of your length expression before running it.', 'What does the shape look like if the loop runs n + 1 times?', 'Which other pattern in this set is its exact mirror?'],
    solution:
      'function shrinkingTriangle(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) rows.push("*".repeat(n - i + 1));\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Right-align this triangle instead of left-aligning it, and say what the padding expression becomes.',
  },
  {
    step: 1,
    name: 'Pattern-5: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print a right triangle aligned to the right edge, so the padding shrinks as the stars grow.',
    brief: 'Input: n. Output: row i is n - i spaces followed by i stars; every line is exactly n characters wide.',
    concepts: ['dsa-padding-arithmetic', 'dsa-coordinate-loops'],
    shortAnswer: 'Spaces n - i then stars i, because the two counts must add up to the width every row.',
    idealAnswer:
      'Alignment is arithmetic on the row index: the padding is the complement of the content, so spaces + stars = n ' +
      'holds on every line. Writing the row as two repeats concatenated together keeps that invariant obvious, and it is ' +
      'the reason the shape leans against the right edge rather than floating.',
    walkthrough:
      'Once you see a pattern as "content plus complement" the aligned family collapses into one expression. This is ' +
      'also the first shape where trailing whitespace is a real decision — the stars end the line here, so nothing has ' +
      'to pad the right, which is not true of the mirrored version and is where diff tools and linters start disagreeing ' +
      'with you.',
    commonMistake: 'Padding with i spaces instead of n - i, which right-aligns the wrong half of the triangle.',
    whyWrong:
      'Growing padding with growing content pushes the stars towards the middle and produces a shape that is neither ' +
      'aligned nor symmetric; every row is the wrong length, and the total width stops being n, which is the property ' +
      'the follow-up patterns depend on.',
    followUps: ['Why is there no trailing padding on these lines?', 'Which row is the only one with no spaces at all?', 'Convert it to a centred pyramid — what does the padding expression become?'],
    solution:
      'function rightAligned(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) rows.push(" ".repeat(n - i) + "*".repeat(i));\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Mirror it vertically so the padding grows with the row index, and check that the width invariant still holds.',
  },
  {
    step: 1,
    name: 'Pattern-6: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print an inverted right triangle hanging from the right edge.',
    brief: 'Input: n. Output: row i is i - 1 spaces followed by n - i + 1 stars, so the shape narrows downward on the right.',
    concepts: ['dsa-padding-arithmetic', 'dsa-boundary-conditions'],
    shortAnswer: 'Padding i - 1, content n - i + 1, and the two still sum to n on every row.',
    idealAnswer:
      'The two index offsets differ because padding starts at zero on the first row while content starts at full width, ' +
      'so one term carries the one and the other does not. Stating the invariant — pad plus content equals n — is what ' +
      'lets you set both expressions without guessing, and it is checkable on the first and last row alone.',
    walkthrough:
      'Patterns 5 and 6 together are the argument for deriving from the index: the only difference is which term gains ' +
      'the offset, and both keep the width constant. That constant width is not cosmetic — anything that later renders ' +
      'these shapes in a terminal or an ASCII table depends on it to line up borders.',
    commonMistake: 'Using i for the padding, which indents the first row by one star width.',
    whyWrong:
      'The first line then reads as a leading space the shape does not have, and every row below inherits the shift, so ' +
      'the whole triangle moves one column right and the left edge stops being straight where the pattern says it ' +
      'should be.',
    followUps: ['What is the width of the last row?', 'Why do patterns 5 and 6 differ only in where the +1 sits?', 'Would you pad the right side of these lines? Say why not.'],
    solution:
      'function inverseRightAligned(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) rows.push(" ".repeat(i - 1) + "*".repeat(n - i + 1));\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Right-justify these lines to a fixed width of 2n and describe what the extra padding does to the shape.',
  },
  {
    step: 1,
    name: 'Pattern-7: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print a centred pyramid: row i holds 2i - 1 stars under n - i spaces.',
    brief: 'Input: n. Output: a triangle whose rows grow by two characters, centred against the top padding.',
    concepts: ['dsa-padding-arithmetic', 'dsa-coordinate-loops'],
    shortAnswer: 'Odd widths give symmetry: 2i - 1 stars with n - i spaces keeps the apex centred.',
    idealAnswer:
      'A centred row must be odd, because the apex has to sit in the middle of the shape, so the growth is two ' +
      'characters per row and the count is 2i - 1. The padding is the same n - i as the right-aligned triangle, since ' +
      'one side of the indent is all the offset you need — the other side is implied by the odd width.',
    walkthrough:
      'The relationship between width and indent is what makes the pyramid centred rather than merely growing: reduce the ' +
      'padding by one each row and add two stars, and the left edge of the content moves right by one while the right ' +
      'edge moves right by three — the symmetry is a balance of two rates, not a coincidence.',
    commonMistake: 'Growing the row by one star, which gives a leaning triangle instead of a pyramid.',
    whyWrong:
      'Even widths have no centre column, so the shape drifts left by half a character each row and no amount of ' +
      'padding fixes it. This is the failure a string comparison catches: the apex line and the base line disagree about ' +
      'where the middle is.',
    followUps: ['Why must a centred row be an odd length?', 'What is the base row width, and how does that bound the total output?', 'Which two patterns combine into this one?'],
    solution:
      'function pyramid(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) rows.push(" ".repeat(n - i) + "*".repeat(2 * i - 1));\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Turn the stars into the row number so the pyramid reads 1, 222, 33333 — what stays the same?',
  },
  {
    step: 1,
    name: 'Pattern-8: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print the inverted centred pyramid and say which half of the width shrinks.',
    brief: 'Input: n. Output: row i is i - 1 spaces followed by 2(n - i) + 1 stars, widest at the top.',
    concepts: ['dsa-padding-arithmetic', 'dsa-symmetry-half'],
    shortAnswer: 'Same odd widths as the pyramid, walked backwards: padding grows by one, stars shrink by two.',
    idealAnswer:
      'Substituting the mirrored row index into the pyramid formula is the derivation — where the pyramid uses i, this ' +
      'one uses n - i + 1, which turns 2i - 1 into 2(n - i) + 1 and n - i padding into i - 1. Writing it as a ' +
      'substitution rather than a fresh formula is what keeps the pair consistent when someone changes n.',
    walkthrough:
      'Because both halves stay centred on the same axis, the two shapes tile into a diamond with no horizontal ' +
      'adjustment — that is the practical reason to build them as a matched pair. The rates matter more than the ' +
      'endpoints: one space in, two stars off per row, keeps the left slope and the right slope symmetric.',
    commonMistake: 'Shrinking the star count by one while growing the padding by one, which shears the triangle.',
    whyWrong:
      'Symmetry needs the two rates to match: a row that loses one character on the left and one on the right is a ' +
      'centred shape, while losing two on one side only slides the whole pyramid along the line and produces a parallelogram.',
    followUps: ['Which row is the widest and by how much?', 'Feed the pyramid function a mirrored index instead of writing a new one — what changes?', 'What does this shape and pattern 7 produce stacked together?'],
    solution:
      'function inversePyramid(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) rows.push(" ".repeat(i - 1) + "*".repeat(2 * (n - i) + 1));\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Reuse pyramid(n) to produce this output by reversing its rows — is the result identical? Say which row differs.',
  },
  {
    step: 1,
    name: 'Pattern-9: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print a diamond by mirroring the pyramid, and say which row must not be printed twice.',
    brief: 'Input: n. Output: the pyramid rows, then the same rows in reverse order excluding the widest one.',
    concepts: ['dsa-symmetry-half', 'dsa-boundary-conditions', 'dsa-padding-arithmetic'],
    shortAnswer: 'Emit rows 1..n then n-1..1 so the middle row appears exactly once.',
    idealAnswer:
      'A diamond is one half plus the mirror of the other half, and the axis row belongs to exactly one of them — ' +
      'starting the second loop at n rather than n - 1 duplicates the widest line and gives you a shape with two ' +
      'equators. Reusing the same row function for both loops is the point: the lower half has no independent logic, it ' +
      'is the upper half read backwards.',
    walkthrough:
      'The row is still a function of its distance from the axis, which is why mirroring costs nothing: the padding ' +
      'expression does not care whether the index arrived going up or coming down. This is the same trick used by every ' +
      'symmetric structure later — a mountain array, a bitonic tour, a palindrome window — where you build one side and ' +
      'let the index carry the other.',
    commonMistake: 'Running the second loop from n down to 1, or rebuilding the row formula for the lower half.',
    whyWrong:
      'The duplicated widest row makes the output n * 2 + 1 lines instead of 2n - 1 and breaks the vertical symmetry ' +
      'visibly at the equator. Rebuilding the formula for the bottom half instead of reusing it is how the two halves ' +
      'drift apart as soon as someone changes the padding rule.',
    followUps: ['How many rows does a diamond of height n have?', 'Which index appears in both loops, and should it?', 'Make the diamond hollow: which rows keep only their endpoints?'],
    solution:
      'function diamond(n) {\n' +
      '  const row = (i) => " ".repeat(n - i) + "*".repeat(2 * i - 1);\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) rows.push(row(i));\n' +
      '  for (let i = n - 1; i >= 1; i -= 1) rows.push(row(i));\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Print only the diamond border — the widest row stays full, every other row keeps two stars at its edges.',
  },
  {
    step: 1,
    name: 'Pattern-10: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print an n by n square of the digits 1..n and say what happens to the alignment past nine.',
    brief: 'Input: n. Output: every row reads 123...n as one string of digits.',
    concepts: ['dsa-coordinate-loops', 'dsa-row-building', 'dsa-padding-arithmetic'],
    shortAnswer: 'The row is the digits 1..n concatenated, and the same row repeats on every line.',
    idealAnswer:
      'Building the row once as a string of column values and reusing it for every row keeps the shape square in ' +
      'characters. The catch the pattern is really teaching is width: for n above nine each cell is more than one ' +
      'character, so a fixed-width layout needs a per-cell pad, which is exactly the padding arithmetic from pattern 5 ' +
      'applied to columns rather than rows.',
    walkthrough:
      'Number patterns expose the difference between a grid of cells and a grid of characters. Digits collapse that ' +
      'difference, so the moment the values exceed a single glyph the shape stops lining up unless the cell width is ' +
      'part of the format. Right-aligning each cell to the width of the largest value is what table printing in a ' +
      'terminal actually does.',
    commonMistake: 'Concatenating numbers with += and letting the row become a number, or assuming one cell is one character.',
    whyWrong:
      'String plus number is still string in JavaScript, but number plus string is where a sum turns into "12" instead ' +
      'of 3 — and a row built that way has the right length and the wrong content. The single-character assumption is ' +
      'worse because it is invisible until n = 12, where every column shifts.',
    followUps: ['Make each cell two characters wide and re-print n = 12.', 'What is the difference between the row string and the row array here?', 'Which patterns in this set would break the same way past nine?'],
    solution:
      'function numberSquare(n) {\n' +
      '  let row = "";\n' +
      '  for (let k = 1; k <= n; k += 1) row += String(k);\n' +
      '  const rows = [];\n' +
      '  for (let i = 0; i < n; i += 1) rows.push(row);\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Pad every cell to the width of the largest number so the grid lines up for n = 15.',
  },
  {
    step: 1,
    name: 'Pattern-11: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print a square where row i is the value i repeated across the whole width.',
    brief: 'Input: n. Output: row 1 is all ones, row 2 is all twos, up to row n.',
    concepts: ['dsa-coordinate-loops', 'dsa-row-building'],
    shortAnswer: 'The cell value depends only on the row, so the inner loop is a repeat of one character.',
    idealAnswer:
      'When a grid is constant along one axis the other axis carries all the information: String(i).repeat(n) replaces ' +
      'the column loop entirely. Recognising that the column index does not appear in the rule is the skill — the same ' +
      'observation turns many nested-loop problems into single passes.',
    walkthrough:
      'This is the first pattern where the printed value is the index rather than a fixed glyph, so the row number ' +
      'becomes data. Keep the one-based reading explicit: with i starting at 0 the top row is a line of zeros, which is ' +
      'a different shape and a common off-by-one in every numbered pattern that follows.',
    commonMistake: 'Looping the column and appending i each time, or starting the row counter at zero.',
    whyWrong:
      'The inner loop is not wrong, it is wasted work and an extra place for an off-by-one to hide. A zero-based row ' +
      'index prints a line of zeros on top and shifts every label under it, and that mismatch between the row a reader ' +
      'counts and the value the cell carries is what makes numbered patterns so easy to misread in review.',
    followUps: ['Which index does the cell value depend on — and which does it not?', 'What changes if you make the value depend on the column instead?', 'Combine patterns 10 and 11: what does a grid of (row + column) look like?'],
    solution:
      'function rowNumberSquare(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) rows.push(String(i).repeat(n));\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Print row i as the digits counting down from n - i + 1 so the square shears — write out n = 4 by hand first.',
  },
  {
    step: 1,
    name: 'Pattern-12: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print the number triangle where row i counts up from 1 to i.',
    brief: 'Input: n. Output: 1 on the first line, 12 on the second, up to 1..n, with no separators between the digits.',
    concepts: ['dsa-coordinate-loops', 'dsa-row-building'],
    shortAnswer: 'The inner loop runs to the row index rather than to n, which is what turns a square into a triangle.',
    idealAnswer:
      'Row i is the column values 1..i concatenated, so the inner bound is the outer index — that single dependency is ' +
      'the difference between n squared cells and the n(n+1)/2 triangle. Building the row as a string per iteration ' +
      'keeps the cell values as text, which is what lets 12 and 3 sit side by side without looking like a number.',
    walkthrough:
      'Read it as a coordinate rule and the shape is "print the column index wherever column <= row", the same triangle ' +
      'as pattern 3 in star clothing. The two-loop structure matters more than the output: it is the template for every ' +
      'upper-triangular traversal later, from adjacency matrices to the inversion counting loop.',
    commonMistake: 'Looping the column to n and filtering, or treating the row as a number instead of a string.',
    whyWrong:
      'A full-width inner loop with a condition is still correct but does n squared work to print half of it, and it ' +
      'hides the triangular bound you are supposed to be practising. Treating the row as a number loses leading digits ' +
      'the moment a value reaches ten.',
    followUps: ['What is the character count of row i and of the whole output?', 'Print the same triangle right aligned — which expression moves?', 'Which row is the first to stop being a valid number?'],
    solution:
      'function increasingTriangle(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    let row = "";\n' +
      '    for (let k = 1; k <= i; k += 1) row += String(k);\n' +
      '    rows.push(row);\n' +
      '  }\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Reverse the inner direction so the triangle reads 1, 32, 654 by carrying a running value across rows.',
  },
  {
    step: 1,
    name: 'Pattern-13: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print the triangle where row i repeats the value i exactly i times.',
    brief: 'Input: n. Output: 1, then 22, then 333, up to n repeated n times.',
    concepts: ['dsa-coordinate-loops', 'dsa-row-building'],
    shortAnswer: 'Both the cell value and the row length come from the same index, so the row is String(i).repeat(i).',
    idealAnswer:
      'The shape is a single expression because the row index feeds the content and the count at once — value and width ' +
      'are the same number. Recognising that collapse is the point: it is the moment a nested loop becomes a repeat ' +
      'call, and it is worth checking the two uses of i are genuinely the same quantity before you write it.',
    walkthrough:
      'Contrast with pattern 11, where the value came from the row and the width was constant: here both are the row, so ' +
      'the total character count is the triangle number n(n+1)/2 rather than n squared. Keeping that count in your head ' +
      'while writing the shape is how you notice a bound is wrong before the output is.',
    commonMistake: 'Repeating the row number n times, which prints pattern 11 instead of 13.',
    whyWrong:
      'Both versions are square-shaped, so the error is not visible as a shape — only the row lengths give it away, and ' +
      'a reviewer reading the last line sees n digits where the pattern asks for one. Test the base row, not the top.',
    followUps: ['Which two quantities share the row index here?', 'What is the total output length for n = 10?', 'Make the value (i + j) modulo 10 — what does the grid look like?'],
    solution:
      'function constantTriangle(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) rows.push(String(i).repeat(i));\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Switch the repeated value to n - i + 1 so the triangle counts down, and say which row becomes the widest.',
  },
  {
    step: 1,
    name: 'Pattern-14: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print the triangle whose row i counts down from i to 1.',
    brief: 'Input: n. Output: 1, then 21, then 321, each row reading its index down to one.',
    concepts: ['dsa-coordinate-loops', 'dsa-symmetry-half'],
    shortAnswer: 'Same triangular bound as pattern 12, walked from i downwards instead of from 1 upwards.',
    idealAnswer:
      'The inner loop starts at the row index and stops at one, so the shape is the mirror image of the counting-up ' +
      'triangle along the vertical axis of each row. Nothing about the bound changes; only the direction of iteration ' +
      'does, which is the cheapest symmetry available once the row is a function of the index.',
    walkthrough:
      'Row reversal is the one transformation that never affects the complexity or the alignment, and it is the trick ' +
      'that answers a whole family of these patterns once you have the base case written. It is also the first place ' +
      'where a descending loop needs care: the stop condition is k >= 1, not k > 1, or the final digit of every row ' +
      'disappears.',
    commonMistake: 'Writing k > 1 as the descending condition, or reusing the ascending row and calling it the same pattern.',
    whyWrong:
      'A strict inequality in a countdown drops exactly one element per row — the smallest, which in this pattern is ' +
      'always the digit 1, so every row ends early and the shape still looks plausible. That is the same off-by-one ' +
      'class that makes a descending binary search miss its boundary.',
    followUps: ['Which digit is missing from every row if the bound is k > 1?', 'How would you produce this from pattern 12 without a second loop?', 'What is the last character of the final row?'],
    solution:
      'function decreasingTriangle(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    let row = "";\n' +
      '    for (let k = i; k >= 1; k -= 1) row += String(k);\n' +
      '    rows.push(row);\n' +
      '  }\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Make each row the palindrome of the two directions — 1, 121, 12321 — and count how many digits the row holds.',
  },
  {
    step: 1,
    name: 'Pattern-15: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print the palindromic number triangle: 1, 121, 12321.',
    brief: 'Input: n. Output: row i counts up 1..i and back down i-1..1, so the peak digit appears once.',
    concepts: ['dsa-symmetry-half', 'dsa-coordinate-loops', 'dsa-boundary-conditions'],
    shortAnswer: 'Ascending 1..i then descending i-1..1; the peak is printed by the first loop only.',
    idealAnswer:
      'The row is symmetric about its middle, and the middle is the peak, so the descending half has to start at i - 1 ' +
      'rather than i — printing i twice is the entire bug class for this pattern. Length per row is 2i - 1, the same odd ' +
      'width as the star pyramid, which is why palindromic rows and centred pyramids compose so cleanly.',
    walkthrough:
      'Symmetry is easier to express as two half-loops than as one loop with a mirrored index, and the reason to write ' +
      'both is that the boundary between them is where the shape is defined. Past n = 9 the digits collide the same way ' +
      'they do in pattern 10, so a row that reads 123456789109... is the signal that the cell width, not the loop, is ' +
      'what needs fixing.',
    commonMistake: 'Starting the descending loop at i, or expecting the row to line up for n above nine.',
    whyWrong:
      'Duplicating the peak gives 1221 for row two, which is still a palindrome and so looks correct in a glance — the ' +
      'defect is the missing single centre, which a string equality catches. Above nine, columns shift by one per extra ' +
      'digit and no loop bound can repair it.',
    followUps: ['Which loop owns the peak digit, and what breaks if both print it?', 'Give each cell a fixed width and re-render n = 12.', 'How does the row length relate to the star pyramid of pattern 7?'],
    solution:
      'function palindromeTriangle(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    let row = "";\n' +
      '    for (let k = 1; k <= i; k += 1) row += String(k);\n' +
      '    for (let k = i - 1; k >= 1; k -= 1) row += String(k);\n' +
      '    rows.push(row);\n' +
      '  }\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Pad every cell to two characters so the triangle stays readable for n = 12.',
  },
  {
    step: 1,
    name: 'Pattern-16: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print a rhombus: n stars per row, each row indented one less than the row above.',
    brief: 'Input: n. Output: every row is n stars wide, with n - i leading spaces, so the block shears to the right.',
    concepts: ['dsa-padding-arithmetic', 'dsa-coordinate-loops'],
    shortAnswer: 'Content never changes — only the padding does, so the row is n - i spaces plus n stars.',
    idealAnswer:
      'This is pattern 1 with an indent that depends on the row index, and the point is the separation: content width ' +
      'and padding are two independent expressions. Reading a shape that way — pad(row) plus content(row) — is what ' +
      'makes the whole aligned family fall out of one template instead of twenty special cases.',
    walkthrough:
      'Because the content is constant, every row is the same length before the padding, so the shear is purely a ' +
      'function of the indent decreasing by one per line. It is worth noticing that the leading spaces here are ' +
      'load-bearing output, unlike the trailing ones in pattern 5: trimming the left of a line destroys the shape, ' +
      'which is why linters that strip trailing whitespace are safe and left-padding is not.',
    commonMistake: 'Growing the indent with the row index, which shears the block the other way.',
    whyWrong:
      'The two directions look similar in the first two rows and diverge completely by the base, so a sample of n = 3 ' +
      'shows the shape is wrong but not why. Naming the invariant — the top row is flush left and the bottom row is ' +
      'indented zero — is what makes the direction checkable before printing.',
    followUps: ['Which row is flush against the left margin?', 'Why does trailing whitespace not matter in this shape but leading whitespace does?', 'Add the mirrored lower half: what solid shape do you get?'],
    solution:
      'function rhombus(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) rows.push(" ".repeat(n - i) + "*".repeat(n));\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Make the indent grow instead of shrink, then confirm which corner the parallelogram leans on.',
  },
  {
    step: 1,
    name: 'Pattern-17: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print a hollow square: stars on the border, spaces in the interior.',
    brief: 'Input: n. Output: an n by n grid where a cell is a star if it is on the first or last row or column.',
    concepts: ['dsa-coordinate-loops', 'dsa-boundary-conditions', 'dsa-index-parity'],
    shortAnswer: 'A cell is border when i or j is at either extreme, which is four comparisons and no separate loops.',
    idealAnswer:
      'The rule is a disjunction over both axes, so it needs the inner loop back: unlike the constant-row patterns, the ' +
      'cell value depends on the column. Writing it as one predicate over (i, j) is the transferable move — borders, ' +
      'diagonals and checkerboards are all predicates on coordinates.',
    walkthrough:
      'Degenerate sizes are the interesting part: n = 1 is a single star and n = 2 is a full block, because a hollow ' +
      'square of side two has no interior. Any predicate written over coordinates handles those for free, while an ' +
      'implementation that prints the top row, then n - 2 middles, then the bottom row has to special-case them — and ' +
      'usually does not.',
    commonMistake: 'Building the top and bottom rows separately from the middle rows.',
    whyWrong:
      'Three hand-written cases is three places for an off-by-one, and the n = 1 and n = 2 inputs are exactly where the ' +
      'separate middle-row loop misbehaves — printing a negative number of rows, or printing the only row twice. One ' +
      'coordinate predicate over the grid has no such seam.',
    followUps: ['What does the function print for n = 2, and does the predicate explain it?', 'Hollow out the diamond from pattern 9 with the same idea.', 'Which cells are interior in terms of i and j?'],
    solution:
      'function hollowSquare(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    let row = "";\n' +
      '    for (let j = 1; j <= n; j += 1) {\n' +
      '      row += i === 1 || i === n || j === 1 || j === n ? "*" : " ";\n' +
      '    }\n' +
      '    rows.push(row);\n' +
      '  }\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Print only the frame of a rectangle that is twice as wide as it is tall, keeping the same predicate style.',
  },
  {
    step: 1,
    name: 'Pattern-18: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print an X across an n by n grid and give the two index relations that place it.',
    brief: 'Input: n. Output: a star on both diagonals of the grid, spaces everywhere else.',
    concepts: ['dsa-coordinate-loops', 'dsa-index-parity'],
    shortAnswer: 'j === i is one diagonal and j === n - 1 - i is the other, so the grid is two equalities.',
    idealAnswer:
      'A diagonal is a linear relation between the row and the column index: the main one is j = i and the anti-diagonal ' +
      'is j = n - 1 - i, so the shape is one predicate with two terms. That reframing — from drawing lines to naming ' +
      'relations — is what generalises to any grid figure, and it is why the diagonals of a matrix are O(n) to ' +
      'enumerate rather than O(n squared) to scan.',
    walkthrough:
      'For odd n the two relations meet in the centre cell, which is printed once because the predicate is an ' +
      'or- rather than two independent passes; that single detail is the difference between a clean X and a doubled ' +
      'middle. Coordinate predicates are also the cheapest way to reason about symmetry: reflecting a cell is a ' +
      'substitution in i or j, not a new loop.',
    commonMistake: 'Using j === n - i for the second diagonal, or drawing the two diagonals in separate loops.',
    whyWrong:
      'With zero-based indices n - i overshoots by one and the anti-diagonal walks off the grid; with one-based it ' +
      'would be right, which is exactly how index-base confusion becomes a shape that is correct on paper and wrong in ' +
      'code. Two separate loops also double-print the centre on odd n.',
    followUps: ['Which input makes the two diagonals share a cell?', 'Print the diagonals of a rectangle rather than a square — which relation changes?', 'What is the cost of enumerating only the diagonal cells instead of scanning the grid?'],
    solution:
      'function diagonalCross(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 0; i < n; i += 1) {\n' +
      '    let row = "";\n' +
      '    for (let j = 0; j < n; j += 1) row += j === i || j === n - 1 - i ? "*" : " ";\n' +
      '    rows.push(row);\n' +
      '  }\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Print only the anti-diagonal of a rectangle given as rows and columns, then state the relation you used.',
  },
  {
    step: 1,
    name: 'Pattern-19: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print the 0-1 triangle where the row starts with 1 on odd rows and 0 on even rows.',
    brief: 'Input: n. Output: 1, 01, 101, 0101 — digits alternate within the row and the starting digit alternates by row.',
    concepts: ['dsa-index-parity', 'dsa-coordinate-loops'],
    shortAnswer: 'The cell is chosen by the parity of i + j, which gives both alternations in one expression.',
    idealAnswer:
      'Two separate rules — alternate within a row, flip the starting symbol per row — collapse into one: the cell ' +
      'value is (i + j) modulo 2. Deriving the single predicate is the exercise, because it is the same move as ' +
      'indexing a checkerboard and the same trick as interleaving two sources without a flag.',
    walkthrough:
      'Parity of a sum is the coordinate form of alternation: moving one step in either direction flips it, and moving ' +
      'diagonally preserves it. Once you can see that, a checkerboard, a zigzag read of a matrix and an alternating ' +
      'run-length encoding are all the same one-line predicate rather than three algorithms.',
    commonMistake: 'Tracking the current digit in a variable that you flip inside the loop.',
    whyWrong:
      'A mutable flipper is state that spans iterations, so the row start is only correct if the previous row ended on ' +
      'the expected digit — which it does for the sample and stops doing the moment the bound shifts. A function of ' +
      'i and j has no such dependency and can be evaluated for any cell in isolation.',
    followUps: ['Which cell decides whether a row starts with 1?', 'Read the same grid by columns: does the triangle change?', 'Where does a parity predicate show up in your own code outside patterns?'],
    solution:
      'function zeroOneTriangle(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    let row = "";\n' +
      '    for (let j = 1; j <= i; j += 1) row += (i + j) % 2 === 0 ? "1" : "0";\n' +
      '    rows.push(row);\n' +
      '  }\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Replace the digits with stars and spaces to print a checkerboard of side n.',
  },
  {
    step: 1,
    name: 'Pattern-20: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print the letter triangle A, BC, DEF where the alphabet advances across rows instead of resetting.',
    brief: 'Input: n (at most 8 letters worth of rows). Output: row i holds i consecutive letters, continuing where the last row stopped.',
    concepts: ['dsa-coordinate-loops', 'dsa-character-codes', 'dsa-row-building'],
    shortAnswer: 'One counter runs across the whole triangle, so the letter is state carried between rows.',
    idealAnswer:
      'This is the first pattern whose cell value is not a function of its own coordinates: it depends on how many cells ' +
      'came before, which is the triangle number of the previous rows. Keeping a single running code across both loops ' +
      'is the honest expression of that, and deriving it arithmetically is the interview follow-up.',
    walkthrough:
      'String.fromCharCode on an incrementing code is the character counterpart of pattern 12, and the difference is ' +
      'instructive: row-local values are computed from the index, globally sequenced values need a cursor. A cursor ' +
      'inside nested loops is exactly the kind of state that makes a function uncacheable, which is why the same idea ' +
      'shows up as "keep an index while merging" in array work.',
    commonMistake: 'Resetting the letter at the start of each row, or starting from "a" and mixing cases.',
    whyWrong:
      'A per-row reset prints A, AB, ABC, which is a different pattern that looks entirely plausible next to the ' +
      'intended output. Mixed case is worse in a service than on paper: the letters become data that downstream ' +
      'comparisons treat as unequal.',
    followUps: ['What is the letter on the last row of n = 5, and how do you get it without counting?', 'Rewrite the cell as a function of i and j with no cursor.', 'What happens at row 27 — which assumption breaks?'],
    solution:
      'function letterTriangle(n) {\n' +
      '  const rows = [];\n' +
      '  let code = 65;\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    let row = "";\n' +
      '    for (let j = 1; j <= i; j += 1) {\n' +
      '      row += String.fromCharCode(code);\n' +
      '      code += 1;\n' +
      '    }\n' +
      '    rows.push(row);\n' +
      '  }\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Restart the alphabet on every row (A, AB, ABC) and then make the letter depend on both indices at once.',
  },
  {
    step: 1,
    name: 'Pattern-21: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print the butterfly: two star triangles facing away from each other, mirrored below.',
    brief: 'Input: n. Output: row i is n - i + 1 stars, 2(i - 1) spaces, n - i + 1 stars, then the same rows back up.',
    concepts: ['dsa-symmetry-half', 'dsa-padding-arithmetic', 'dsa-row-building'],
    shortAnswer: 'One row function of the index, emitted forward then backward, with the middle row once.',
    idealAnswer:
      'The upper half is two shrinking star blocks with a gap that grows by two, and the lower half is that same ' +
      'function on a descending index — so the whole figure is one expression plus a mirror, exactly like the diamond. ' +
      'The axis row is printed once, which is the boundary that decides whether the shape closes.',
    walkthrough:
      'Writing the row as a named helper is what makes the two directions cheap: the loops differ only in how they walk ' +
      'i, not in what they emit. Note the degenerate case — at n = 1 the two blocks touch and the output is two ' +
      'characters, which is the honest consequence of the formula rather than a bug to patch, and is worth stating ' +
      'before someone "fixes" it.',
    commonMistake: 'Growing the gap by one space per row instead of two, or repeating the widest row in the mirror.',
    whyWrong:
      'A one-space gap shifts the right block leftwards every row, so the figure leans instead of opening; it is a ' +
      'symmetry failure that looks like a rendering problem until the row widths are printed. Duplicating the middle ' +
      'row breaks the vertical mirror the same way it does in pattern 9.',
    followUps: ['Which row has no gap at all, and what does that say about n = 1?', 'How many rows does a butterfly of height n produce?', 'Replace the gap spaces with stars: what figure do you get?'],
    solution:
      'function butterfly(n) {\n' +
      '  const row = (i) => "*".repeat(n - i + 1) + " ".repeat(2 * (i - 1)) + "*".repeat(n - i + 1);\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) rows.push(row(i));\n' +
      '  for (let i = n - 1; i >= 1; i -= 1) rows.push(row(i));\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Print only the upper half and label it, then verify the full figure is that half plus its reverse minus one row.',
  },
  {
    step: 1,
    name: 'Pattern-22: Star & Number Patterns',
    difficulty: 'Easy',
    topicSlug: PATTERNS,
    stem: 'Print a centred palindromic number pyramid: row i is n - i spaces over 1..i..1.',
    brief: 'Input: n (at most 9 rows if cells are single digits). Output: the palindrome triangle of pattern 15, centred.',
    concepts: ['dsa-padding-arithmetic', 'dsa-symmetry-half', 'dsa-boundary-conditions'],
    shortAnswer: 'Two shapes from the set combined: the odd-width palindrome row and the pyramid padding rule.',
    idealAnswer:
      'The row content comes from pattern 15 and the indent from pattern 7, and they compose because both are ' +
      'functions of the same index with the same growth rate: the row gains two digits and the padding loses one space, ' +
      'which keeps the apex centred. Composition is the payoff of having written every earlier row as an expression ' +
      'rather than as accumulated state.',
    walkthrough:
      'This is the shape to check first on the boundaries — one row, and the base row width 2n - 1 against the indent ' +
      'n - 1 — because a centred figure fails symmetrically: get the padding wrong by one and both slopes shift ' +
      'together, which is harder to see than a wrong row length. Beyond nine rows the single-digit assumption breaks ' +
      'and the figure needs fixed-width cells.',
    commonMistake: 'Padding by n - i when the row is not odd, or counting the row length in digits rather than cells.',
    whyWrong:
      'Centring assumes the content has a middle, so an even-length row under an odd-length indent drifts half a cell ' +
      'per row and the pyramid is a wedge. Counting digits where cells were meant is the same confusion that breaks ' +
      'every number grid past nine.',
    followUps: ['Where is the centre column of the base row, and what is its index?', 'Which two earlier patterns does this one reuse?', 'What changes when n = 12 and cells become two digits wide?'],
    solution:
      'function centredNumbers(n) {\n' +
      '  const rows = [];\n' +
      '  for (let i = 1; i <= n; i += 1) {\n' +
      '    let body = "";\n' +
      '    for (let k = 1; k <= i; k += 1) body += String(k);\n' +
      '    for (let k = i - 1; k >= 1; k -= 1) body += String(k);\n' +
      '    rows.push(" ".repeat(n - i) + body);\n' +
      '  }\n' +
      '  return rows.join("\\n");\n' +
      '}',
    modify: 'Invert the pyramid using the same body function and confirm the two halves still share an axis.',
  },
  {
    step: 3,
    name: 'Majority Element (> n/2 times)',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Find the element that occurs more than n/2 times in O(1) space, and say why the answer still needs verifying.',
    brief: 'Input: an array of integers. Output: the majority value, or null when none exists. No frequency map.',
    concepts: ['dsa-boyer-moore-vote', 'dsa-single-pass-tracking', 'dsa-hash-frequency'],
    shortAnswer: 'Cancel pairs of different values; whatever survives is the only candidate, and a counting pass proves it.',
    idealAnswer:
      'Boyer-Moore keeps a candidate and a counter: matching values add, differing values subtract, and a zero counter ' +
      'hands the candidate slot to the next value. A majority cannot be fully cancelled because it has more copies than ' +
      'everything else combined, so the survivor is necessary but not sufficient — the guarantee is only "if a majority ' +
      'exists this is it", and the verify pass is what distinguishes the two statements.',
    walkthrough:
      'The cancellation is order-independent in effect: pairs of distinct values are removed from consideration, which ' +
      'is the same argument as voting down a motion twice and keeping the same winner. That is also why the counter is ' +
      'not a frequency — it is a debt ledger against the candidate, and reading it as a count at the end is the classic ' +
      'misinterpretation.',
    commonMistake: 'Returning the candidate without counting it, or treating the final vote count as a frequency.',
    whyWrong:
      'On [1, 2, 3] the algorithm hands back 3 with one vote and no majority exists, so the shipped function reports a ' +
      'value that occurs once as the answer for "more than half". That is a correctness bug your tests only find if ' +
      'someone remembers the no-majority input exists.',
    followUps: ['Why is the surviving candidate unique even though the path to it depends on order?', 'What breaks if the input is empty?', 'Now require more than n/3 — how many candidates do you need?'],
    solution:
      'function majorityElement(nums) {\n' +
      '  let candidate = null;\n' +
      '  let votes = 0;\n' +
      '  for (const value of nums) {\n' +
      '    if (votes === 0) {\n' +
      '      candidate = value;\n' +
      '      votes = 1;\n' +
      '    } else if (value === candidate) {\n' +
      '      votes += 1;\n' +
      '    } else {\n' +
      '      votes -= 1;\n' +
      '    }\n' +
      '  }\n' +
      '  const count = nums.filter((value) => value === candidate).length;\n' +
      '  return count > nums.length / 2 ? candidate : null;\n' +
      '}',
    modify: 'Return every value above n/4 with two candidate slots — why do you need two and not one?',
  },
  {
    step: 3,
    name: 'Maximum Subarray Sum (Kadane\'s Algorithm)',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Give the largest sum over contiguous elements in one pass and say what the running sum means.',
    brief: 'Input: an array of integers, all negative allowed. Output: the maximum subarray sum, and an empty array is not an option.',
    concepts: ['dsa-kadane-reset', 'dsa-single-pass-tracking', 'dsa-boundary-conditions'],
    shortAnswer: 'The best run ending here either extends the previous run or starts fresh; the answer is the maximum of those local bests.',
    idealAnswer:
      'Define the state as "best sum over subarrays that end at i" rather than "best so far", because the first is ' +
      'recurrences-ready: cur = max(a[i], cur + a[i]). The global answer is the max over those local values, which is ' +
      'why a single pass is enough and why resetting is not throwing the run away but declaring the prefix a liability. ' +
      'O(n) time, O(1) space.',
    walkthrough:
      'Seeding both values with a[0] rather than 0 is the whole all-negative case: a zero-seeded cur silently allows an ' +
      'empty subarray to win with 0, which is the answer to a different question. The recurrence form also generalises ' +
      'directly to the variants that ask for the product, the longest run, or the actual indices.',
    commonMistake: 'Initialising the best at zero, or clamping the running sum with Math.max(0, ...) and calling it Kadane.',
    whyWrong:
      'For [-3, -1, -2] a zero-seeded best reports 0, which is not the sum of any subarray in the input. The clamp ' +
      'version hides the same bug: it discards the negative run instead of choosing between the run and the element.',
    followUps: ['Which input separates max(0, cur + x) from max(x, cur + x)?', 'Return the sum and the indices — which extra state do you need?', 'Why does the same shape solve maximum profit with a cost per day?'],
    solution:
      'function maxSubarraySum(nums) {\n' +
      '  let best = nums[0];\n' +
      '  let current = nums[0];\n' +
      '  for (let i = 1; i < nums.length; i += 1) {\n' +
      '    current = Math.max(nums[i], current + nums[i]);\n' +
      '    best = Math.max(best, current);\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Allow one element to be skipped and keep it linear — what does the state become?',
  },
  {
    step: 3,
    name: 'Print subarray with maximum subarray sum',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Return the subarray that achieves the maximum sum, and say when a new run has to begin.',
    brief: 'Input: an array of integers. Output: the contiguous slice with the largest sum, in order.',
    concepts: ['dsa-kadane-reset', 'dsa-single-pass-tracking', 'dsa-boundary-conditions'],
    shortAnswer: 'Carry the start index with the running sum and move it the moment starting over beats extending.',
    idealAnswer:
      'The sum alone forgets geometry, so the state has to hold where the current run began as well as what it is worth. ' +
      'When the element on its own beats the extension, both the sum and the start move to i; when the running total ' +
      'beats the recorded best, the best start and end are copied from the live run. Still O(n) time and O(1) state ' +
      'besides the output slice.',
    walkthrough:
      'Recording the answer at the moment it is beaten — not after the loop — is what makes the indices correct, because ' +
      'the live run keeps moving. This is the pattern to reach for whenever a metric question turns into a "which one" ' +
      'question: the extra pointer costs nothing and the alternative is a second pass that has to rediscover the state.',
    commonMistake: 'Reconstructing the range after the loop from the final sum, or updating the best start on every extension.',
    whyWrong:
      'The run that produced the maximum is not the run that ends the array, so any post-loop reconstruction starts from ' +
      'the wrong place. Moving the start on every extension instead of every reset slides the window along and returns ' +
      'a suffix of the real answer — same sum, wrong slice.',
    followUps: ['Which tie do you report when two runs hold the same maximum?', 'Return the indices instead of the slice — what changes?', 'Can you do it without slicing, and why would a service prefer that?'],
    solution:
      'function maxSubarray(nums) {\n' +
      '  let best = { start: 0, end: 0, sum: nums[0] };\n' +
      '  let run = { start: 0, sum: nums[0] };\n' +
      '  for (let i = 1; i < nums.length; i += 1) {\n' +
      '    if (run.sum + nums[i] < nums[i]) {\n' +
      '      run = { start: i, sum: nums[i] };\n' +
      '    } else {\n' +
      '      run.sum += nums[i];\n' +
      '    }\n' +
      '    if (run.sum > best.sum) best = { start: run.start, end: i, sum: run.sum };\n' +
      '  }\n' +
      '  return nums.slice(best.start, best.end + 1);\n' +
      '}',
    modify: 'Report every maximum-sum subarray rather than the first one found — how much extra state does that need?',
  },
  {
    step: 3,
    name: 'Stock Buy and Sell',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Find the best single buy-then-sell profit in one pass and say why the order of the two updates matters.',
    brief: 'Input: prices by day. Output: the largest profit from one buy before one sell, or 0 when no trade pays.',
    concepts: ['dsa-running-minimum', 'dsa-single-pass-tracking', 'dsa-boundary-conditions'],
    shortAnswer: 'Keep the cheapest price seen so far and score the current price against it.',
    idealAnswer:
      'Two trackers, one pass: the minimum over days already passed, and the best spread the current day can produce ' +
      'against it. The buy can only ever be in the past, which is exactly what makes updating the minimum first and the ' +
      'profit second correct — and a same-day buy and sell is a zero profit, harmless to the answer.',
    walkthrough:
      'The O(n squared) pair enumeration is what this replaces, and the reason it collapses to one pass is that the best ' +
      'sell day for any future buy day only needs the minimum, never the identity of the day it happened on. Trackers ' +
      'like this are the linear form of "best pair with an ordering constraint", which shows up in matching, in ' +
      'drawdown, and in any max-spread question.',
    commonMistake: 'Subtracting the minimum from the last price, or updating the profit before the minimum on the first day.',
    whyWrong:
      'A single global minimum and the final price answer a question nobody asked — the sell has to be after the buy, so ' +
      '[7, 6, 4, 3, 1] is 0 and not 6. Updating profit first would let day one trade with itself against its own price ' +
      'and hides the case where the cheapest day is also the last day.',
    followUps: ['What does the function report for a strictly falling series?', 'Multiple transactions, buy again only after selling: which tracker changes?', 'Maximum drawdown of the same series — what is the mirror image here?'],
    solution:
      'function bestProfit(prices) {\n' +
      '  let cheapest = Infinity;\n' +
      '  let best = 0;\n' +
      '  for (const price of prices) {\n' +
      '    if (price < cheapest) cheapest = price;\n' +
      '    else if (price - cheapest > best) best = price - cheapest;\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Allow as many completed trades as you like and sum the rises — why does that become a greedy scan of differences?',
  },
  {
    step: 3,
    name: 'Rearrange Array Elements by Sign',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Alternate positives and negatives starting with a positive while keeping the order inside each group.',
    brief: 'Input: an array with equal counts of positive and negative numbers. Output: the rearranged array; relative order within a sign must survive.',
    concepts: ['dsa-order-preserving-split', 'dsa-write-index', 'dsa-boundary-conditions'],
    shortAnswer: 'Two filtered passes hold each group in order, then one interleave emits them in pairs.',
    idealAnswer:
      'Stability inside each group is the constraint that rules out the obvious in-place swap: partitioning by sign ' +
      'reverses or shuffles the order within a group. Two arrays built by filter keep the relative order for free, and ' +
      'the merge is a single loop over the shared length, so it is O(n) time and O(n) space — the space is the price of ' +
      'stability.',
    walkthrough:
      'The trade is the same one a stable sort makes against a quicksort: order-preservation costs memory. If the ' +
      'requirement were only "positives first, negatives after" the write-index partition from earlier array work ' +
      'would be in place and O(1), so reading which property is actually asked for decides the algorithm before you ' +
      'write it.',
    commonMistake: 'Swapping in place to alternate the signs, or assuming the counts stay equal.',
    whyWrong:
      'In-place swapping scrambles the order inside each sign, which is the one property the problem names. Unequal ' +
      'counts make the paired loop drop the leftover elements off the end of the output, and the array comes back short ' +
      'without any error to say so.',
    followUps: ['What is the invariant the interleave depends on, and how do you assert it?', 'Return the array unchanged when the counts differ — which loop guard moves?', 'Negatives first instead: what is the one-character change?'],
    solution:
      'function rearrangeBySign(nums) {\n' +
      '  const positive = nums.filter((value) => value > 0);\n' +
      '  const negative = nums.filter((value) => value <= 0);\n' +
      '  const out = [];\n' +
      '  for (let i = 0; i < positive.length; i += 1) {\n' +
      '    out.push(positive[i]);\n' +
      '    out.push(negative[i]);\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify: 'Handle unequal group sizes by appending the remainder, then say what changes if zero counts as negative.',
  },
  {
    step: 3,
    name: 'Next Permutation',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Advance an array to the next lexicographic ordering in place, and say what the descending tail means.',
    brief: 'Input: an array of numbers. Output: the same array reordered to the next permutation, wrapping to ascending when it is already the last.',
    concepts: ['dsa-lexicographic-successor', 'dsa-reversal-trick', 'dsa-boundary-conditions'],
    shortAnswer: 'Raise the right element that can be raised, swap in the smallest larger value from the tail, then reverse the tail.',
    idealAnswer:
      'Scanning right to left, the first index whose value is below its neighbour is the pivot; everything past it is ' +
      'already descending, which is the signature of a final permutation for that suffix. Swapping the pivot with the ' +
      'smallest value in the tail that still exceeds it makes the change minimal, and reversing the tail turns a ' +
      'descending suffix into the ascending, smallest-possible one. O(n) time, O(1) space, in place.',
    walkthrough:
      'The reason the tail is descending is that you have already enumerated every ordering of it while the pivot was ' +
      'fixed, so the next step must change the pivot and reset the suffix to its minimum — the same carry logic as ' +
      'adding one to a number. Skipping the verify step and sorting the tail instead of reversing it is O(n log n) for ' +
      'a property the reversal already gives you.',
    commonMistake: 'Swapping the pivot with the immediate successor, or forgetting to reverse the tail when there is no pivot.',
    whyWrong:
      'The immediate successor is not the smallest larger value in a descending tail — it happens to be adjacent, which ' +
      'is why the shortcut passes small tests and fails the ones that matter. And when the whole array is descending, ' +
      'there is no pivot, so the reversal of the entire array is the wrap-around; without it the last permutation ' +
      'repeats forever.',
    followUps: ['Why is the suffix descending at the moment you stop scanning?', 'What would you change to get the previous permutation?', 'How many permutations are after the last one for n = 4?'],
    solution:
      'function nextPermutation(a) {\n' +
      '  let i = a.length - 2;\n' +
      '  while (i >= 0 && a[i] >= a[i + 1]) i -= 1;\n' +
      '  if (i >= 0) {\n' +
      '    let j = a.length - 1;\n' +
      '    while (a[j] <= a[i]) j -= 1;\n' +
      '    const t = a[i];\n' +
      '    a[i] = a[j];\n' +
      '    a[j] = t;\n' +
      '  }\n' +
      '  for (let lo = i + 1, hi = a.length - 1; lo < hi; lo += 1, hi -= 1) {\n' +
      '    const t = a[lo];\n' +
      '    a[lo] = a[hi];\n' +
      '    a[hi] = t;\n' +
      '  }\n' +
      '  return a;\n' +
      '}',
    modify: 'Advance k permutations at once without looping k times — what does the rank of the suffix buy you?',
  },
  {
    step: 3,
    name: 'Leaders in an Array',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Report every element with nothing greater to its right and explain why the scan goes backwards.',
    brief: 'Input: an array of numbers. Output: the leaders in left-to-right order; a leader is >= every value after it, and the last element always qualifies.',
    concepts: ['dsa-suffix-maximum', 'dsa-single-pass-tracking', 'dsa-boundary-conditions'],
    shortAnswer: 'Scan right to left keeping the tallest value seen, and every element that meets it is a leader.',
    idealAnswer:
      'The definition talks about the suffix, so the suffix maximum is the only state you need; scanning forwards would ' +
      'make each candidate ask a question about elements it has not reached. Collect while scanning right to left and ' +
      'reverse at the end to restore left-to-right output. O(n) time, O(1) space beyond the answer.',
    walkthrough:
      'Reading the direction of a scan off the direction of the definition is the transferable move: any property about ' +
      '"everything after this" is a right-to-left pass with one accumulator, and any property about "everything before" ' +
      'is the mirror. The strict-versus-non-strict comparison is the second decision, and duplicates are what force you ' +
      'to state it out loud.',
    commonMistake: 'Comparing each element against the array maximum, or using a strict greater-than so duplicates stop being leaders.',
    whyWrong:
      'The global maximum only says which element is the tallest, not which elements dominate their own suffix — that ' +
      'loses every leader after the first. A strict comparison drops the second of two equal tallest values, and the ' +
      'definition says nothing greater, which equality satisfies.',
    followUps: ['Which two elements decide whether your comparison is >= or >?', 'Count the non-leaders instead — same pass?', 'What changes if leaders are defined against everything before them?'],
    solution:
      'function leaders(nums) {\n' +
      '  const found = [];\n' +
      '  let tallest = -Infinity;\n' +
      '  for (let i = nums.length - 1; i >= 0; i -= 1) {\n' +
      '    if (nums[i] >= tallest) {\n' +
      '      found.push(nums[i]);\n' +
      '      tallest = nums[i];\n' +
      '    }\n' +
      '  }\n' +
      '  return found.reverse();\n' +
      '}',
    modify: 'Return the leader indices instead of the values, then the right-to-left order is what you can keep — do you still reverse?',
  },
  {
    step: 3,
    name: 'Longest Consecutive Sequence in an Array',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Give the length of the longest run of consecutive values without sorting, and say why most starts are skipped.',
    brief: 'Input: an unsorted array of integers with duplicates. Output: the longest sequence length where consecutive means value + 1.',
    concepts: ['dsa-set-run-start', 'dsa-hash-frequency', 'dsa-boundary-conditions'],
    shortAnswer: 'Hash the values, walk forward only from a value whose predecessor is absent.',
    idealAnswer:
      'Sorting is O(n log n) and the question does not need order, only membership, so a Set gives O(1) lookups and the ' +
      'run length comes from walking value, value + 1, value + 2 while they exist. The start test — value - 1 is not in ' +
      'the Set — is what makes it linear: every element is visited at most once inside a walk and once as a candidate, ' +
      'so the nested loop is O(n) overall rather than O(n squared).',
    walkthrough:
      'Without the start test the walk from the middle of a run re-counts the same elements once per interior value, ' +
      'which is the amortised argument people skip and then fail to explain when asked why the double loop is linear. ' +
      'Duplicates cost nothing because a Set holds each value once, and the run length is about distinct values anyway.',
    commonMistake: 'Sorting the array first, or walking forward from every value instead of only from the start of a run.',
    whyWrong:
      'Sorting spends O(n log n) and O(n) space to answer a membership question, and the sort only becomes the right ' +
      'tool when the answer must be ordered. Walking from every value is the quadratic version that still returns the ' +
      'correct length — the failure is invisible in the output and only shows up on a long run.',
    followUps: ['Prove the total work is linear despite the inner while loop.', 'Return the run itself rather than its length — what extra state?', 'What does the answer become if the input is already sorted?'],
    solution:
      'function longestConsecutive(nums) {\n' +
      '  const pool = new Set(nums);\n' +
      '  let best = 0;\n' +
      '  for (const value of pool) {\n' +
      '    if (pool.has(value - 1)) continue;\n' +
      '    let length = 1;\n' +
      '    while (pool.has(value + length)) length += 1;\n' +
      '    if (length > best) best = length;\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Report the longest run of consecutive values that also appear in order in the array — does the Set still help?',
  },
  {
    step: 3,
    name: 'Set Matrix Zeroes',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Zero every row and column that contains a zero, without letting your own writes create new zeros.',
    brief: 'Input: a grid of numbers, mutated in place. Output: the same grid with each affected row and column cleared.',
    concepts: ['dsa-in-place-markers', 'dsa-boundary-conditions', 'dsa-hash-frequency'],
    shortAnswer: 'Record the rows and columns to clear first, then apply them — a write during the scan would corrupt later reads.',
    idealAnswer:
      'The naive in-place version fails because clearing a row on sight turns other cells into zeros that the scan has ' +
      'not reached yet, so the whole grid collapses. Holding the affected indices in two sets separates observation ' +
      'from mutation; the harder version of the same idea reuses the first row and column as the markers, which needs ' +
      'two extra flags because those markers are themselves part of the answer.',
    walkthrough:
      'This is the read-modify-write hazard in miniature: any pass that reads a structure it is also writing has to ' +
      'stage the writes. Staging in sets costs O(r + c) space, which is trivial; the marker trick costs O(1) and buys ' +
      'nothing here except the interview point, and it is the kind of complexity a service should not carry without a ' +
      'memory constraint to justify it.',
    commonMistake: 'Clearing rows and columns while still scanning the grid, or forgetting that the marker row is itself data.',
    whyWrong:
      'Write-during-scan propagates: one zero wipes a row, and a later cell in that row now looks like a zero and wipes ' +
      'its own column. The marker variant fails in the opposite direction — clearing the first row early erases the ' +
      'record of which columns were ever marked.',
    followUps: ['Which two cells need flags in the marker version?', 'Why is the staged version easier to review even though it costs space?', 'What changes if the grid must not be mutated at all?'],
    solution:
      'function setZeroes(grid) {\n' +
      '  const rows = new Set();\n' +
      '  const cols = new Set();\n' +
      '  for (let i = 0; i < grid.length; i += 1) {\n' +
      '    for (let j = 0; j < grid[i].length; j += 1) {\n' +
      '      if (grid[i][j] === 0) {\n' +
      '        rows.add(i);\n' +
      '        cols.add(j);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  for (const i of rows) grid[i].fill(0);\n' +
      '  for (const j of cols) {\n' +
      '    for (let i = 0; i < grid.length; i += 1) grid[i][j] = 0;\n' +
      '  }\n' +
      '  return grid;\n' +
      '}',
    modify: 'Do it with the first row and column as markers and say which two cells you have to remember separately.',
  },
  {
    step: 3,
    name: 'Rotate Matrix by 90 degrees',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Turn a square grid ninety degrees clockwise in place and give the index map that proves it.',
    brief: 'Input: an n by n grid, mutated in place. Output: the rotated grid; every element must move exactly once per phase.',
    concepts: ['dsa-transpose-reverse', 'dsa-coordinate-loops', 'dsa-boundary-conditions'],
    shortAnswer: 'Transpose across the diagonal, then reverse each row — together they send (i, j) to (j, n - 1 - i).',
    idealAnswer:
      'The composition is the proof: transposing maps (i, j) to (j, i) and reversing a row maps column j to n - 1 - j, ' +
      'so a cell ends where a clockwise rotation puts it. Doing it in place is what makes the two phases necessary — ' +
      'the direct alternative moves four cells at a time in rings, which is correct but has to carry the ring and offset ' +
      'bookkeeping that this version avoids entirely.',
    walkthrough:
      'Transposing only the upper triangle (starting the inner loop at the diagonal plus one) is what keeps every swap ' +
      'from being undone by its own mirror. The four-ring rotation has the same O(n squared) cost and no second pass, so ' +
      'the choice is between one dense loop and two obvious ones; in a review the two obvious ones win.',
    commonMistake: 'Transposing the whole grid instead of one side of the diagonal, or reversing columns instead of rows.',
    whyWrong:
      'A full transpose swaps each pair twice and returns the original grid, so the rotation is missing exactly the ' +
      'reversal — an output that looks plausible because every value is still present. Reversing columns instead of rows ' +
      'produces the counter-clockwise result, which is a different rotation of the same data and the hardest kind of bug ' +
      'to notice in a test that only checks the corners.',
    followUps: ['Write the index map for a counter-clockwise turn.', 'How many swaps does the transpose phase make on an n by n grid?', 'Which rotation can be done with rings alone, and what does it lose?'],
    solution:
      'function rotateMatrix(a) {\n' +
      '  const n = a.length;\n' +
      '  for (let i = 0; i < n; i += 1) {\n' +
      '    for (let j = i + 1; j < n; j += 1) {\n' +
      '      const t = a[i][j];\n' +
      '      a[i][j] = a[j][i];\n' +
      '      a[j][i] = t;\n' +
      '    }\n' +
      '  }\n' +
      '  for (const row of a) row.reverse();\n' +
      '  return a;\n' +
      '}',
    modify: 'Rotate 180 degrees using these two phases the right number of times, then rotate a non-square grid and say why it cannot be in place.',
  },
  {
    step: 3,
    name: 'Print the matrix in spiral manner',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Read a grid in a spiral inward and say which two guards stop rows being emitted twice.',
    brief: 'Input: an r by c grid. Output: its values in spiral order, from the top-left, each exactly once.',
    concepts: ['dsa-boundary-shrink', 'dsa-coordinate-loops', 'dsa-boundary-conditions'],
    shortAnswer: 'Emit the top row, right column, bottom row, left column, then close all four boundaries by one.',
    idealAnswer:
      'Four indices describe the unread rectangle; each of the four walks consumes one edge and then moves its boundary ' +
      'inward. The two returns to the start edge — the bottom and left walks — need a re-check of the bounds, because a ' +
      'single remaining row or column would otherwise be read forwards and backwards. Every cell is visited exactly once, ' +
      'so O(r * c) time and O(r * c) output.',
    walkthrough:
      'The asymmetry is that the first two walks of a layer always have cells left to read while the last two might not: ' +
      'advancing the top boundary can leave top greater than bottom, and retreating the right boundary can leave right ' +
      'below left. That single observation is the entire correctness argument, and it is the reason spiral code is ' +
      'usually wrong at the innermost layer rather than the outer one.',
    commonMistake: 'Forgetting the second guard before the bottom walk, or using one boundary flag for rows and columns.',
    whyWrong:
      'Without the guard a one-row remainder is emitted twice, and a one-column remainder does the same on its way up. ' +
      'Both failures are invisible on a square matrix larger than two, so a test set of 3 by 3 samples passes and the ' +
      'single-row case is where production finds it.',
    followUps: ['Which input shapes exercise both guards?', 'Could a visited set replace the boundary bookkeeping, and at what cost?', 'Return the spiral of a grid with more columns than rows and check the count.'],
    solution:
      'function spiralOrder(a) {\n' +
      '  const out = [];\n' +
      '  let top = 0;\n' +
      '  let bottom = a.length - 1;\n' +
      '  let left = 0;\n' +
      '  let right = a[0].length - 1;\n' +
      '  while (top <= bottom && left <= right) {\n' +
      '    for (let j = left; j <= right; j += 1) out.push(a[top][j]);\n' +
      '    top += 1;\n' +
      '    for (let i = top; i <= bottom; i += 1) out.push(a[i][right]);\n' +
      '    right -= 1;\n' +
      '    if (top <= bottom) {\n' +
      '      for (let j = right; j >= left; j -= 1) out.push(a[bottom][j]);\n' +
      '      bottom -= 1;\n' +
      '    }\n' +
      '    if (left <= right) {\n' +
      '      for (let i = bottom; i >= top; i -= 1) out.push(a[i][left]);\n' +
      '      left += 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify: 'Fill a grid with 1..n squared in spiral order instead of reading it — which boundaries move the same way?',
  },
  {
    step: 3,
    name: 'Count Subarray sum Equals K',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Count the subarrays whose sum is exactly k with negative values allowed, and say why the window slides no more.',
    brief: 'Input: an array of integers, negatives allowed, and a target k. Output: the number of contiguous subarrays summing to k.',
    concepts: ['dsa-prefix-count-map', 'dsa-prefix-sum', 'dsa-hash-frequency'],
    shortAnswer: 'Store how often each prefix sum has occurred and add the count of prefix - k at every step.',
    idealAnswer:
      'A subarray sum is a difference of two prefix sums, so the question "how many subarrays ending here equal k" is ' +
      '"how many earlier prefixes equal current - k". That is a frequency map lookup per element: O(n) time and O(n) ' +
      'space. The map has to be seeded with a prefix sum of zero occurring once, otherwise a subarray that starts at ' +
      'index zero is never counted.',
    walkthrough:
      'The sliding window is the tempting answer and it is wrong here: with negatives present, extending a window can ' +
      'decrease its sum, so shrinking past a target loses candidates rather than discarding them. Counting prefixes does ' +
      'not need monotonicity at all, which is exactly the property that makes it the right structure when the input can ' +
      'go backwards.',
    commonMistake: 'Using a two-pointer window because it worked for the positives-only version, or seeding the map empty.',
    whyWrong:
      'A window over negatives silently skips valid subarrays — it reports fewer than the truth and no sample makes ' +
      'that obvious. The unseeded map misses every prefix-reaching subarray, which shows up as an off-by-one in the ' +
      'count that looks like an indexing bug rather than a missing initial entry.',
    followUps: ['Which input separates this from the sliding window version?', 'Why is the seed a count of one rather than zero?', 'Now count subarrays whose sum is at most k — does the map still work?'],
    solution:
      'function countSubarraysWithSum(nums, k) {\n' +
      '  const seen = new Map([[0, 1]]);\n' +
      '  let prefix = 0;\n' +
      '  let count = 0;\n' +
      '  for (const value of nums) {\n' +
      '    prefix += value;\n' +
      '    count += seen.get(prefix - k) ?? 0;\n' +
      '    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);\n' +
      '  }\n' +
      '  return count;\n' +
      '}',
    modify: 'Return the indices of the first subarray that hits k — which value does the map have to hold instead of a count?',
  },
  {
    step: 3,
    name: "Pascal's Triangle",
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Build the first rows of Pascal\'s triangle from the row above and give the recurrence.',
    brief: 'Input: a row count. Output: the triangle as an array of rows, each built from its predecessor.',
    concepts: ['dsa-row-recurrence', 'dsa-coordinate-loops', 'dsa-boundary-conditions'],
    shortAnswer: 'Every row starts and ends with one; an interior cell is the sum of the two cells above it.',
    idealAnswer:
      'The recurrence value(i, j) = value(i - 1, j - 1) + value(i - 1, j) with ones at both edges defines the whole ' +
      'triangle, so building it row by row is O(n squared) time and output — which is the lower bound, because the ' +
      'answer itself has that many cells. Computing a single binomial coefficient by factorials is the other question, ' +
      'and it is the one that overflows.',
    walkthrough:
      'Keeping the previous row rather than the whole triangle is enough for generation, but then the answers are gone; ' +
      'holding all rows is what makes this a dynamic-programming table instead of a stream. The edge handling — a row of ' +
      'one element, then rows that push a trailing one — is where the loop bounds have to be exact.',
    commonMistake: 'Using factorials for each cell, or letting the first row gain a spurious second one.',
    whyWrong:
      'Factorials hit the 53-bit integer window very quickly, so a row that is arithmetically fine comes back rounded, ' +
      'while the additive recurrence never leaves the safe range for rows it can actually hold. A special case that ' +
      'forgets the single-element row prints "1,1" as the first line and shifts the whole triangle.',
    followUps: ['How large can n get before a cell exceeds Number.MAX_SAFE_INTEGER?', 'Generate only the nth row — what is the space cost then?', 'Which symmetry of the triangle does the loop take advantage of?'],
    solution:
      'function pascalTriangle(rows) {\n' +
      '  const out = [];\n' +
      '  for (let i = 0; i < rows; i += 1) {\n' +
      '    const row = [1];\n' +
      '    for (let j = 1; j < i; j += 1) row.push(out[i - 1][j - 1] + out[i - 1][j]);\n' +
      '    if (i > 0) row.push(1);\n' +
      '    out.push(row);\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify: 'Return only the nth row with a single backward-running array — why must the inner loop go right to left?',
  },
  {
    step: 3,
    name: 'Majority Elements (> n/3 times)',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Find every value occurring more than a third of the time using two candidate slots, and say why two is enough.',
    brief: 'Input: an array of integers. Output: the values above n/3, in any order, with no duplicates in the result.',
    concepts: ['dsa-two-candidate-vote', 'dsa-boyer-moore-vote', 'dsa-boundary-conditions'],
    shortAnswer: 'Two slots and a decrement-everything rule; at most two values can clear a third, and both need counting.',
    idealAnswer:
      'A threshold above n/3 admits at most two survivors, so two candidates and two counters replace the frequency map. ' +
      'Each foreign value either increments a matching slot or cancels one unit from both, which is the majority ' +
      'argument generalised: a value above the threshold cannot be cancelled completely. The survivors are candidates ' +
      'only, so a final counting pass decides which of them actually qualify.',
    walkthrough:
      'The subtlety is that cancelling two counters at once is not the same as tracking frequencies — the slots can hold ' +
      'values that end up below the threshold, and only the verify pass separates them. This is the shape of every ' +
      'Misra-Gries style summary: a bounded amount of state that is guaranteed to contain the heavy hitters, not a ' +
      'guarantee that everything it holds is one.',
    commonMistake: 'Reusing the n/2 algorithm with one slot, or returning the candidates without verifying them.',
    whyWrong:
      'One slot loses a legitimate second answer entirely — on [1, 1, 1, 2, 2, 2, 3] a single candidate stream keeps one ' +
      'of the two real thirds and silently discards the other. Returning unverified candidates invents values that never ' +
      'crossed the threshold, which is worse than missing one because the caller trusts the list.',
    followUps: ['How many slots does a threshold above n/4 need?', 'Why is the cancel step applied to both slots at once?', 'What does the verify pass cost, and can it be folded in?'],
    solution:
      'function majorityThird(nums) {\n' +
      '  const slots = [\n' +
      '    { value: null, votes: 0 },\n' +
      '    { value: null, votes: 0 },\n' +
      '  ];\n' +
      '  for (const value of nums) {\n' +
      '    const owned = slots.find((slot) => slot.value === value);\n' +
      '    if (owned) {\n' +
      '      owned.votes += 1;\n' +
      '      continue;\n' +
      '    }\n' +
      '    const open = slots.find((slot) => slot.votes === 0);\n' +
      '    if (open) {\n' +
      '      open.value = value;\n' +
      '      open.votes = 1;\n' +
      '      continue;\n' +
      '    }\n' +
      '    for (const slot of slots) slot.votes -= 1;\n' +
      '  }\n' +
      '  return slots\n' +
      '    .filter((slot) => slot.value !== null && nums.filter((v) => v === slot.value).length > nums.length / 3)\n' +
      '    .map((slot) => slot.value);\n' +
      '}',
    modify: 'Generalise it to k slots for a threshold above n/(k+1) and say what the cancel step becomes.',
  },
  {
    step: 3,
    name: '3-Sum Problem',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'List every distinct triple that sums to zero and say why the sort is not the expensive part.',
    brief: 'Input: an array of integers. Output: the unique triplets summing to zero, each reported once regardless of duplicates.',
    concepts: ['dsa-sort-then-two-pointer', 'dsa-two-pointer', 'dsa-duplicate-skip', 'dsa-complexity-counting'],
    shortAnswer: 'Sort, fix one element, then close a two-pointer window on the rest; skip equal values on every move.',
    idealAnswer:
      'Sorting turns the pair search into O(n) because the sum tells you which pointer has to move: too small advances ' +
      'the low end, too large retreats the high. Fixing the first element makes the total O(n squared) after an O(n log ' +
      'n) sort, and the duplicates are handled by never re-picking a value equal to the one just finished — uniqueness as ' +
      'an index rule rather than a set of result strings.',
    walkthrough:
      'The hash-set alternative is also O(n squared) but cannot be made to emit each triple once without either ' +
      'normalising the triple or comparing sorted key tuples, which is where it gets ugly. The two-pointer form gets ' +
      'uniqueness almost free, because sorted order means duplicates are adjacent and adjacent equality is one cheap ' +
      'test.',
    commonMistake: 'Collecting triplets into a set of joined strings, or skipping duplicates only on the first element.',
    whyWrong:
      'String-keyed deduplication works but pays a hash of a serialised array per candidate and hides the real invariant, ' +
      'so the next person cannot tell whether ordering was handled. Skipping only the outer element emits repeated ' +
      'triplets from repeated inner values, which is the failure that survives a test built from distinct numbers.',
    followUps: ['Why does the inner dedup test need the lo < hi guard?', 'Give the answer without sorting and name what you lose.', 'What is the complexity if the input is already sorted, and does the algorithm know?'],
    solution:
      'function threeSum(nums) {\n' +
      '  const a = [...nums].sort((x, y) => x - y);\n' +
      '  const out = [];\n' +
      '  for (let i = 0; i < a.length - 2; i += 1) {\n' +
      '    if (a[i] === a[i - 1]) continue;\n' +
      '    let lo = i + 1;\n' +
      '    let hi = a.length - 1;\n' +
      '    while (lo < hi) {\n' +
      '      const sum = a[i] + a[lo] + a[hi];\n' +
      '      if (sum === 0) {\n' +
      '        out.push([a[i], a[lo], a[hi]]);\n' +
      '        lo += 1;\n' +
      '        hi -= 1;\n' +
      '        while (lo < hi && a[lo] === a[lo - 1]) lo += 1;\n' +
      '      } else if (sum < 0) {\n' +
      '        lo += 1;\n' +
      '      } else {\n' +
      '        hi -= 1;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify: 'Return the count of triplets below a target instead of listing them — which moves can you stop making?',
  },
  {
    step: 3,
    name: '4-Sum Problem',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'List every distinct quadruplet that hits a target sum and account for the extra nesting.',
    brief: 'Input: an array of integers and a target. Output: unique quadruplets summing to the target.',
    concepts: ['dsa-sort-then-two-pointer', 'dsa-duplicate-skip', 'dsa-complexity-counting'],
    shortAnswer: 'Fix two elements, then two-pointer the remainder: O(n cubed) after sorting, with adjacency tests for uniqueness.',
    idealAnswer:
      'One more fixed element buys one more factor of n, so the naive enumeration is O(n to the fourth) and the sorted ' +
      'two-pointer tail brings it to O(n cubed). Uniqueness now needs a skip on both fixed levels — the second one ' +
      'compared against the previous value only when it is not the first choice for this outer element — and that ' +
      'condition is where 4Sum code is usually wrong.',
    walkthrough:
      'The general k-Sum recursion is the same idea with a loop that stops at k = 2, which is why writing 4Sum once by ' +
      'hand is worth it: you see that the innermost two-pointer step is the only place the target enters, and the ' +
      'rest is bookkeeping. Pruning helps the constant a lot — if the smallest possible completion already overshoots, ' +
      'the loop can stop rather than continue.',
    commonMistake: 'Skipping the second fixed element against its previous value unconditionally, or nesting four loops.',
    whyWrong:
      'An unconditional skip on the inner fixed index throws away the very first pair for every outer element, so valid ' +
      'quadruplets vanish — a silent under-report. Four nested loops are O(n to the fourth) and still need a dedup ' +
      'layer, which is the worst of both: slow and subtle.',
    followUps: ['Which skip condition needs the "not the first choice" test, and why?', 'Write the recursive k-Sum version and say what it costs.', 'What pruning is available on the sorted array that 3Sum did not need?'],
    solution:
      'function fourSum(nums, target) {\n' +
      '  const a = [...nums].sort((x, y) => x - y);\n' +
      '  const out = [];\n' +
      '  for (let i = 0; i < a.length - 3; i += 1) {\n' +
      '    if (a[i] === a[i - 1]) continue;\n' +
      '    for (let j = i + 1; j < a.length - 2; j += 1) {\n' +
      '      if (j > i + 1 && a[j] === a[j - 1]) continue;\n' +
      '      let lo = j + 1;\n' +
      '      let hi = a.length - 1;\n' +
      '      while (lo < hi) {\n' +
      '        const sum = a[i] + a[j] + a[lo] + a[hi];\n' +
      '        if (sum === target) {\n' +
      '          out.push([a[i], a[j], a[lo], a[hi]]);\n' +
      '          lo += 1;\n' +
      '          hi -= 1;\n' +
      '          while (lo < hi && a[lo] === a[lo - 1]) lo += 1;\n' +
      '        } else if (sum < target) {\n' +
      '          lo += 1;\n' +
      '        } else {\n' +
      '          hi -= 1;\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify: 'Add the smallest-and-largest pruning on both fixed levels and time the difference on an array of 500 values.',
  },
  {
    step: 3,
    name: 'Largest Subarray with 0 Sum',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Find the longest contiguous run whose sum is zero and say what the map has to store to keep it maximal.',
    brief: 'Input: an array of integers, both signs. Output: the length of the longest subarray summing to zero, or zero when there is none.',
    concepts: ['dsa-first-occurrence', 'dsa-prefix-sum', 'dsa-boundary-conditions'],
    shortAnswer: 'A zero-sum run is two equal prefix sums, so store each running total the first time it appears and subtract.',
    idealAnswer:
      'Every range is a difference of two prefix sums, so a range summing to zero is a prefix sum that repeats. One pass ' +
      'that records the earliest index at which each total occurred gives a candidate length at every repeat, which is ' +
      'O(n) time and O(n) space. The map has to start with a total of zero at the position before the first element, ' +
      'otherwise a run that begins at index zero has no earlier equal total to be measured against.',
    walkthrough:
      'Two decisions carry the whole algorithm. Keeping the first occurrence rather than the newest is what makes the ' +
      'span the longest one, since length is the gap between the two equal totals; and the seed entry is what lets a ' +
      'prefix that is itself zero count as a run. Both are invisible on a sample built so that no answer starts at the ' +
      'front, which is why they are usually written wrong and shipped.',
    commonMistake: 'Overwriting the stored index every time the total appears, or measuring between unequal prefix sums.',
    whyWrong:
      'Overwriting leaves the newest index in the map, so every measured span collapses to the distance since the last '
      + 'repeat — the length that was the answer is thrown away. Measuring between unequal totals answers a different ' +
      'question entirely and reports a run that does not sum to zero.',
    followUps: ['Switch the target from zero to k — which lookup changes and does the seed survive?', 'Return the run itself, not its length — what extra state does the map hold?', 'Why is the shortest such run a different algorithm?'],
    solution:
      'function longestZeroSum(nums) {\n' +
      '  const first = new Map([[0, -1]]);\n' +
      '  let prefix = 0;\n' +
      '  let best = 0;\n' +
      '  for (let i = 0; i < nums.length; i += 1) {\n' +
      '    prefix += nums[i];\n' +
      '    const seen = first.get(prefix);\n' +
      '    if (seen === undefined) first.set(prefix, i);\n' +
      '    else best = Math.max(best, i - seen);\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Now find the longest run whose sum equals k instead of zero, with negatives allowed — write the lookup.',
  },
  {
    step: 3,
    name: 'Count number of subarrays with given xor K',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Count the subarrays whose XOR is exactly k using prefix XOR, and say why no window can shrink here.',
    brief: 'Input: an array of non-negative integers and a target k. Output: how many contiguous subarrays have XOR equal to k.',
    concepts: ['dsa-prefix-count-map', 'dsa-xor-cancellation', 'dsa-complexity-counting'],
    shortAnswer: 'Prefix XOR is its own inverse, so count how many earlier prefixes equal current XOR combined with k.',
    idealAnswer:
      'The XOR of a range is the combination of two prefix XORs, and because a value XORed twice cancels, the range hits ' +
      'k exactly when an earlier prefix equals the current prefix combined with k. A frequency map of prefix values ' +
      'gives one lookup per element: O(n) time, O(n) space. The map is seeded with a prefix of zero occurring once so a ' +
      'range starting at index zero is counted.',
    walkthrough:
      'The same shape as the subarray-sum count, and the same two traps: without the seed the prefixes that reach k on ' +
      'their own are lost, and incrementing after the lookup rather than before it lets a range pair with itself. What ' +
      'differs is that no sliding window exists for XOR, so the frequency map is the only linear answer rather than the ' +
      'better of two.',
    commonMistake: 'Two nested loops over ranges, or reaching for a sliding window because it worked on the positive-sum version.',
    whyWrong:
      'Nested loops are O(n squared) on the sizes where the count matters, and they are the answer the question exists ' +
      'to retire. A window cannot shrink: the running XOR can move either direction when a value arrives, so dropping ' +
      'the left edge discards candidates that were valid.',
    followUps: ['Why does combining with k replace subtracting it?', 'Give the version that returns the ranges rather than the count.', 'What breaks if the input is not non-negative?'],
    solution:
      'function countXorSubarrays(nums, k) {\n' +
      '  const seen = new Map([[0, 1]]);\n' +
      '  let prefix = 0;\n' +
      '  let count = 0;\n' +
      '  for (const value of nums) {\n' +
      '    prefix ^= value;\n' +
      '    count += seen.get(prefix ^ k) ?? 0;\n' +
      '    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);\n' +
      '  }\n' +
      '  return count;\n' +
      '}',
    modify: 'Count the ranges whose XOR is at most k instead — does the frequency map still answer it?',
  },
  {
    step: 3,
    name: 'Merge Overlapping Subintervals',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Merge every overlapping interval into one and say which ordering makes a single sweep enough.',
    brief: 'Input: a list of start and end pairs. Output: a list covering the same ranges where no two intervals overlap.',
    concepts: ['dsa-interval-sweep', 'dsa-complexity-counting', 'dsa-boundary-conditions'],
    shortAnswer: 'Sort by start, then either extend the open interval or start a new one — after sorting only its neighbour can overlap.',
    idealAnswer:
      'Unsorted, an interval can overlap any other, so a pairwise merge is quadratic. Once ordered by the left edge, ' +
      'every later start is at least as large as the open one, so overlap is a single test against the running end and ' +
      'the fix is a max on that end. The sort is O(n log n) and the sweep O(n), and the merged list reuses its own rows ' +
      'rather than rebuilding them.',
    walkthrough:
      'The max on the end is not decoration: an interval completely inside the open one must not shrink it, which is the ' +
      'failure mode of a merge that assigns instead of comparing. Whether touching edges merge is a definition you have ' +
      'to state out loud — the comparison is less-than-or-equal when they merge and strict when they stay apart — and ' +
      'sorting by the end answers the scheduling question, not this one.',
    commonMistake: 'Comparing each interval with the previous input row instead of the open merged row, or sorting by end.',
    whyWrong:
      'After a merge the previous input row no longer describes what is covered, so a contained interval like a short one ' +
      'inside a long one starts a second row that overlaps the first. Sorting by end breaks the adjacency of starts ' +
      'entirely, and the sweep then needs a data structure it was supposed to avoid.',
    followUps: ['Should touching intervals merge, and where in the code does that choice live?', 'Why is sorting by end correct for a different question?', 'Insert one interval into a merged list — how much of the sweep do you reuse?'],
    solution:
      'function mergeIntervals(intervals) {\n' +
      '  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);\n' +
      '  const out = [];\n' +
      '  for (const row of sorted) {\n' +
      '    const open = out[out.length - 1];\n' +
      '    if (open && row[0] <= open[1]) {\n' +
      '      if (row[1] > open[1]) open[1] = row[1];\n' +
      '    } else {\n' +
      '      out.push([row[0], row[1]]);\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify: 'Now find the largest gap between merged intervals — which row of the output do you read?',
  },
  {
    step: 3,
    name: 'Merge two sorted arrays without extra space',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Merge two sorted arrays in place with no third array and give the bound you actually paid.',
    brief: 'Input: two sorted arrays, both mutated. Output: the first ends up holding the smallest elements and the second the rest.',
    concepts: ['dsa-gap-shrink', 'dsa-sorted-merge', 'dsa-complexity-counting'],
    shortAnswer: 'Treat both as one virtual sequence, swap pairs a gap apart, and halve the gap until it reaches one.',
    idealAnswer:
      'With the two arrays viewed as one sequence of length m plus n, a pass compares every index with the one gap ' +
      'positions later and swaps when they are out of order; halving the gap leaves the two sorted halves able to be ' +
      'out of order only at distances the passes already cleared. Nothing is allocated, so the space is O(1), and the ' +
      'time is logarithmic in the total length times that length — not the linear bound a buffered merge gets.',
    walkthrough:
      'Each half starts ordered, so the only inversions are the ones crossing the boundary between the arrays, and those ' +
      'sit at bounded distances that the shrinking gap walks from wide to narrow. The gap rounds up when it halves and ' +
      'the loop has to break at one, because rounding a gap of one up gives one again — that is where this style of loop ' +
      'hangs rather than fails.',
    commonMistake: 'Calling the gap merge linear, or allocating a third array and describing it as constant space.',
    whyWrong:
      'The passes are logarithmic in the combined length, so claiming linearity mis-states the trade the question is ' +
      'about — a reviewer asks for the linear merge, gets O(1) space instead, and wants both numbers named. A third ' +
      'array is exactly the memory the constraint removes.',
    followUps: ['Which array has spare room at the back, and what does that buy?', 'Why does the gap round up rather than down?', 'Give the rotation variant and compare its passes with this one.'],
    solution:
      'function mergeInPlace(a, b) {\n' +
      '  const total = a.length + b.length;\n' +
      '  const read = (index) => (index < a.length ? a[index] : b[index - a.length]);\n' +
      '  const write = (index, value) => {\n' +
      '    if (index < a.length) a[index] = value;\n' +
      '    else b[index - a.length] = value;\n' +
      '  };\n' +
      '  let gap = Math.ceil(total / 2);\n' +
      '  while (gap > 0) {\n' +
      '    for (let i = 0; i + gap < total; i += 1) {\n' +
      '      if (read(i) > read(i + gap)) {\n' +
      '        const held = read(i);\n' +
      '        write(i, read(i + gap));\n' +
      '        write(i + gap, held);\n' +
      '      }\n' +
      '    }\n' +
      '    if (gap === 1) break;\n' +
      '    gap = Math.ceil(gap / 2);\n' +
      '  }\n' +
      '}',
    modify: 'Now the first array has room at the back for all of the second — merge in linear time from the end.',
  },
  {
    step: 3,
    name: 'Find the repeating and missing number',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'One value is missing from a 1..n array and another appears twice — recover both without a hash table.',
    brief: 'Input: an array of length n holding each value from 1 to n, with one value absent and one doubled. Output: the repeating value and the missing one.',
    concepts: ['dsa-sum-system', 'dsa-boundary-conditions', 'dsa-double-precision'],
    shortAnswer: 'Two aggregate equations — the sum and the sum of squares against their expected values — pin down both unknowns.',
    idealAnswer:
      'Let the missing value be x and the repeating one r. Expected minus actual sum is x minus r, one equation in two ' +
      'unknowns; expected minus actual sum of squares is x squared minus r squared, which factors into that same ' +
      'difference times x plus r. Dividing the second by the first gives x plus r, so both values fall out of a sum and ' +
      'a difference pair. O(n) time, O(1) space, and the difference can never be zero because the two values differ.',
    walkthrough:
      'The algebra is the easy half; the part that marks a senior answer is naming where it stops working. The sum of ' +
      'squares grows with the cube of n, so past a few hundred thousand the accumulator leaves the exact integer range ' +
      'and the two equations quietly return a plausible wrong pair. The marker version — negate the slot each value ' +
      'points at — keeps O(1) extra space without the overflow, and costs a mutated input and a second reading rule.',
    commonMistake: 'Trying to recover both values from the sum alone, or reporting the pair in the wrong order.',
    whyWrong:
      'One equation in two unknowns has many solutions, so a sum-only argument is a guess dressed as a derivation. ' +
      'Swapping the order is worse than a crash: the caller is told a present value is absent and an absent value is a ' +
      'duplicate, and a symmetric sample will not show it.',
    followUps: ['At what n does the squares accumulator leave the safe integer range, and how do you check?', 'Give the negation-marker version and name what it destroys.', 'What if the range is 0..n-1 instead — which index rule changes?'],
    solution:
      'function repeatingMissing(nums) {\n' +
      '  const n = nums.length;\n' +
      '  const expectedSum = (n * (n + 1)) / 2;\n' +
      '  const expectedSquares = (n * (n + 1) * (2 * n + 1)) / 6;\n' +
      '  let sum = 0;\n' +
      '  let squares = 0;\n' +
      '  for (const value of nums) {\n' +
      '    sum += value;\n' +
      '    squares += value * value;\n' +
      '  }\n' +
      '  const difference = expectedSum - sum;\n' +
      '  const combined = (expectedSquares - squares) / difference;\n' +
      '  const missing = (difference + combined) / 2;\n' +
      '  return [missing - difference, missing];\n' +
      '}',
    modify: 'Do it with negation markers in the array itself and say which input shape breaks the markers.',
  },
  {
    step: 3,
    name: 'Count Inversions',
    difficulty: 'Hard',
    topicSlug: SORTING,
    stem: 'Count the pairs that are out of order and explain what the merge step is able to count for free.',
    brief: 'Input: an array. Output: the number of index pairs i before j where the value at i is larger than the value at j.',
    concepts: ['dsa-inversion-count', 'dsa-divide-and-conquer', 'dsa-complexity-counting'],
    shortAnswer: 'Count cross pairs while merging two sorted halves: taking from the right means every left element still waiting pairs with it.',
    idealAnswer:
      'An inversion lies either inside one half or across the two, and the recursive calls handle the inside ones while ' +
      'returning sorted halves. With both halves ordered, if the left cursor cannot be emitted before the right one, ' +
      'then every element behind it in the left half is also larger, so one addition of the remaining left count covers ' +
      'a whole block of pairs. The recurrence is merge sort exactly, so O(n log n) time and O(n) scratch space.',
    walkthrough:
      'The addition is only valid because the halves came back sorted — that is the invariant that turns a per-element ' +
      'question into a block question, and it is why counting without sorting cannot beat quadratic. The count is also ' +
      'the number of swaps bubble sort performs on the same array, which is the clearest way to see why a quadratic ' +
      'counter is really a sort you threw away.',
    commonMistake: 'Two nested loops comparing every pair, or adding the remaining right elements instead of the left.',
    whyWrong:
      'The nested scan is quadratic on precisely the input that makes the number interesting: a reverse-sorted array of ' +
      'a hundred thousand elements holds billions of pairs. Adding the wrong remainder is a matching-shaped bug — it is ' +
      'right on two-element samples and diverges as soon as the halves differ in length.',
    followUps: ['Why does taking from the left add nothing?', 'Relate the count to the swaps bubble sort makes.', 'Count only pairs at most a fixed distance apart — which pass changes?'],
    solution:
      'function countInversions(nums) {\n' +
      '  const work = [...nums];\n' +
      '  const scratch = new Array(work.length);\n' +
      '  const sort = (lo, hi) => {\n' +
      '    if (lo >= hi) return 0;\n' +
      '    const mid = (lo + hi) >> 1;\n' +
      '    let count = sort(lo, mid) + sort(mid + 1, hi);\n' +
      '    let i = lo;\n' +
      '    let j = mid + 1;\n' +
      '    let k = lo;\n' +
      '    while (i <= mid && j <= hi) {\n' +
      '      if (work[i] <= work[j]) {\n' +
      '        scratch[k++] = work[i++];\n' +
      '      } else {\n' +
      '        scratch[k++] = work[j++];\n' +
      '        count += mid - i + 1;\n' +
      '      }\n' +
      '    }\n' +
      '    while (i <= mid) scratch[k++] = work[i++];\n' +
      '    while (j <= hi) scratch[k++] = work[j++];\n' +
      '    for (let m = lo; m <= hi; m += 1) work[m] = scratch[m];\n' +
      '    return count;\n' +
      '  };\n' +
      '  return sort(0, work.length - 1);\n' +
      '}',
    modify: 'Count the pairs where the left value is more than twice the right — the merge comparison no longer answers it.',
  },
  {
    step: 3,
    name: 'Reverse Pairs',
    difficulty: 'Hard',
    topicSlug: SORTING,
    stem: 'Count the pairs where an earlier value exceeds twice a later one, and say why the merge cannot count them.',
    brief: 'Input: an array of integers. Output: the number of index pairs i before j with the value at i greater than twice the value at j.',
    concepts: ['dsa-inversion-count', 'dsa-sort-then-two-pointer', 'dsa-boundary-conditions'],
    shortAnswer: 'Same divide and conquer, but a separate two-pointer sweep counts the doubled pairs before the merge runs.',
    idealAnswer:
      'The doubling condition is not the ordering the merge uses, so the count needs its own pass over the two sorted ' +
      'halves: for each left element advance a cursor through the right half while twice the right value stays below ' +
      'it, and add how far the cursor moved. Both cursors only travel forward, so the sweep is linear per level and the ' +
      'total stays O(n log n) time with the merge sort scratch space.',
    walkthrough:
      'Counting before merging is what keeps the halves ordered for the sweep, because the decision that the cursor never ' +
      'has to retreat depends on the left values arriving in increasing order. The inversion count and the reverse-pair ' +
      'count disagree on ordinary input — a pair can satisfy the ordering test without satisfying the doubled one — so ' +
      'the two questions need two comparisons, not one.',
    commonMistake: 'Folding the doubling test into the merge step, or assuming the inversion count answers both.',
    whyWrong:
      'The merge cursor is consumed by the ordering comparison, so reusing it for a second predicate makes the count ' +
      'depend on which element was emitted first and silently under-reports. On the array four, three, one the inversion ' +
      'count and the reverse-pair count give different numbers, which is the counter-example to any single-pass answer.',
    followUps: ['Why must the sweep run before the merge rather than after?', 'Which cursor would break if the halves were unsorted?', 'Count pairs where the left value is at least the right plus a constant — what changes?'],
    solution:
      'function reversePairs(nums) {\n' +
      '  const work = [...nums];\n' +
      '  const scratch = new Array(work.length);\n' +
      '  const solve = (lo, hi) => {\n' +
      '    if (lo >= hi) return 0;\n' +
      '    const mid = (lo + hi) >> 1;\n' +
      '    let count = solve(lo, mid) + solve(mid + 1, hi);\n' +
      '    let j = mid + 1;\n' +
      '    for (let i = lo; i <= mid; i += 1) {\n' +
      '      while (j <= hi && work[i] > 2 * work[j]) j += 1;\n' +
      '      count += j - (mid + 1);\n' +
      '    }\n' +
      '    let i = lo;\n' +
      '    j = mid + 1;\n' +
      '    let k = lo;\n' +
      '    while (i <= mid && j <= hi) {\n' +
      '      if (work[i] <= work[j]) scratch[k++] = work[i++];\n' +
      '      else scratch[k++] = work[j++];\n' +
      '    }\n' +
      '    while (i <= mid) scratch[k++] = work[i++];\n' +
      '    while (j <= hi) scratch[k++] = work[j++];\n' +
      '    for (let m = lo; m <= hi; m += 1) work[m] = scratch[m];\n' +
      '    return count;\n' +
      '  };\n' +
      '  return solve(0, work.length - 1);\n' +
      '}',
    modify: 'Count the pairs across the two halves only, ignoring pairs inside either half — which recursion disappears?',
  },
  /*
   * The sheet lists five rows again at the end of step 3 under slightly different names. They are
   * authored as different drills rather than as copies: each one asks for the mechanism the first
   * version did not, so a learner who already passed the original is not graded twice for the same
   * sentence and the verifier still finds a row for every line the sheet has.
   */
  {
    step: 3,
    name: 'Maximum Product Subarray',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Find the largest product of a contiguous run and explain why one running best is not enough state.',
    brief: 'Input: a non-empty array of integers, negatives and zeros allowed. Output: the largest product over all non-empty contiguous subarrays.',
    concepts: ['dsa-dual-product-track', 'dsa-kadane-reset', 'dsa-boundary-conditions'],
    shortAnswer: 'Carry the largest and the smallest product ending here, because a negative turns the smallest into the largest candidate.',
    idealAnswer:
      'The best product ending at a position is the maximum of the value alone, the value times the best so far, and the ' +
      'value times the worst so far — the last term exists only because two negatives make a positive. Updating both ' +
      'states together, and taking the overall best from the maximum state at each step, is O(n) time and O(1) space. A ' +
      'zero clears both states, and an all-negative array is answered by the largest single element.',
    walkthrough:
      'Sum Kadane needs one state because addition cannot change the sign of what it is applied to; multiplication can, ' +
      'which is why the minimum is not a hedge but a required input. The array minus two, three, minus four is the whole ' +
      'case: the best product is twenty-four and it comes from multiplying the running minimum minus-six by the final ' +
      'minus-four, a pair a single-maximum tracker never even holds.',
    commonMistake: 'Tracking only the maximum and resetting it to one at a zero.',
    whyWrong:
      'A maximum-only tracker reports three for minus-two, three, minus-four when the answer is twenty-four, and the ' +
      'output looks reasonable enough to ship. Resetting the tracker to one at a zero is fine for the product but wrong ' +
      'for the overall best, which a fresh one would report for an all-negative array.',
    followUps: ['Give the input that proves the minimum state is load-bearing.', 'Why does the sum version not need this second state?', 'Where would exact precision break down on huge products?'],
    solution:
      'function maxProduct(nums) {\n' +
      '  let best = nums[0];\n' +
      '  let maxEnding = nums[0];\n' +
      '  let minEnding = nums[0];\n' +
      '  for (let i = 1; i < nums.length; i += 1) {\n' +
      '    const value = nums[i];\n' +
      '    const options = [value, value * maxEnding, value * minEnding];\n' +
      '    maxEnding = Math.max(...options);\n' +
      '    minEnding = Math.min(...options);\n' +
      '    best = Math.max(best, maxEnding);\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Report the index range of the best product too — which state has to remember where it started?',
  },
  {
    step: 3,
    name: 'Max Subarray Product',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Get the maximum subarray product with two sweeps and no pair of states, and say what the zero is doing.',
    brief: 'Input: a non-empty array of integers. Output: the largest contiguous product, found by scanning left to right and right to left.',
    concepts: ['dsa-kadane-reset', 'dsa-boundary-conditions', 'dsa-complexity-counting'],
    shortAnswer: 'Multiply forward, multiply backward, reset both at a zero, and keep the best value either sweep reached.',
    idealAnswer:
      'Between two zeros the sign pattern is fixed, so the best product in that segment is either the whole segment or ' +
      'the segment with a leading negative dropped, or one with a trailing negative dropped. The forward sweep discards ' +
      'prefixes and the backward sweep discards suffixes, so two linear passes cover both directions without carrying a ' +
      'minimum state. Each pass resets its running product at a zero, because otherwise the segment on the other side ' +
      'would keep multiplying through the zero and report nothing.',
    walkthrough:
      'The two directions are not symmetry for its own sake: a forward pass can only ever lose leading negatives, so an ' +
      'answer that needs a suffix — minus one followed by two — exists only in the backward sweep. Zeros are the split ' +
      'that makes both sweeps independent, and the reset has to happen after reading the zero itself, which is the ' +
      'off-by-one that turns a zero-containing array into an answer of one.',
    commonMistake: 'Running the forward sweep alone, or seeding the best with one instead of the first element.',
    whyWrong:
      'One sweep misses every answer whose leading term is negative, so the algorithm is correct on positive-majority ' +
      'samples and wrong on minus-one, two, where the true answer is two and the forward pass reports minus-one. ' +
      'Seeding the best with one claims an empty subarray is a candidate and beats every all-negative input.',
    followUps: ['Which array is answered only by the backward sweep?', 'Compare the states each pass holds with the two-state version.', 'Why must the reset come after the comparison rather than before?'],
    solution:
      'function maxProductTwoSweep(nums) {\n' +
      '  let best = nums[0];\n' +
      '  let forward = 1;\n' +
      '  for (const value of nums) {\n' +
      '    forward *= value;\n' +
      '    best = Math.max(best, forward);\n' +
      '    if (value === 0) forward = 1;\n' +
      '  }\n' +
      '  let backward = 1;\n' +
      '  for (let i = nums.length - 1; i >= 0; i -= 1) {\n' +
      '    backward *= nums[i];\n' +
      '    best = Math.max(best, backward);\n' +
      '    if (nums[i] === 0) backward = 1;\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Add a third pass that skips zeros entirely and say which of the three is actually redundant.',
  },
  {
    step: 3,
    name: 'Check if Array is Sorted',
    difficulty: 'Easy',
    topicSlug: ARRAYS,
    stem: 'Decide whether an array is sorted or a rotation of a sorted array in one pass, and name the pair a plain scan forgets.',
    brief: 'Input: an array of integers. Output: whether it is non-decreasing, or a rotation of a non-decreasing array.',
    concepts: ['dsa-rotation-drop-count', 'dsa-boundary-conditions', 'dsa-branch-exhaustiveness'],
    shortAnswer: 'Count the adjacent pairs that decrease, the wrap from the last element to the first included; at most one is allowed.',
    idealAnswer:
      'A non-decreasing array has no decreasing adjacent pair, and a rotation of one has exactly one — the join where ' +
      'the tail meets the head. Two drops would mean an inversion inside a run that was supposed to be ordered, so the ' +
      'test is a count of at most one over all cyclic neighbours. One pass with the index taken modulo the length is ' +
      'O(n) time and O(1) space.',
    walkthrough:
      'The wrap pair is the entire question, because it is the only adjacency that a linear scan does not visit by ' +
      'accident: without it the test silently becomes "at most one interior drop", which accepts two, one, three — an ' +
      'array no rotation of a sorted list can produce. Equal neighbours do not count as drops, so duplicates do not ' +
      'change the bound.',
    commonMistake: 'Checking interior neighbours only, or comparing the first and last elements as a separate rule.',
    whyWrong:
      'Dropping the wrap accepts anything with a single interior decrease, which is the shape a random test input often ' +
      'has. Treating the first-to-last comparison as a bolt-on rule rather than one more adjacency gets duplicated ' +
      'checks and a special case for length one that no cyclic loop needs.',
    followUps: ['Which input separates this from the plain sorted check?', 'What changes if the array must be strictly increasing?', 'Can the position of the single drop give you the rotation amount?'],
    solution:
      'function isRotatedSorted(nums) {\n' +
      '  let drops = 0;\n' +
      '  for (let i = 0; i < nums.length; i += 1) {\n' +
      '    if (nums[i] > nums[(i + 1) % nums.length]) drops += 1;\n' +
      '  }\n' +
      '  return drops <= 1;\n' +
      '}',
    modify: 'Return the rotation index when the array is a rotation, and report the ambiguity when it is not.',
  },
  {
    step: 3,
    name: 'Find the element that appears once in sorted array',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Every value appears twice but one in a sorted array — find the single value in logarithmic time.',
    brief: 'Input: a sorted array of odd length where each value occurs twice except one. Output: the value that occurs once.',
    concepts: ['dsa-pair-parity-search', 'dsa-index-parity', 'dsa-boundary-conditions'],
    shortAnswer: 'Every pair starts on an even index until the single value; force the midpoint even and binary search on where that stops.',
    idealAnswer:
      'Up to the answer, pairs occupy even-odd index slots; after it, they sit odd-even. Forcing the midpoint down to an ' +
      'even index and comparing it with its neighbour therefore says which side the invariant broke on, and the search ' +
      'keeps that half. Halving gives O(log n) time and O(1) space, which is the only logarithmic answer the sorted ' +
      'input makes possible.',
    walkthrough:
      'The invariant is positional rather than a value property — nothing about the single element is unusual, only where ' +
      'it sits in the pair layout — and that is why the comparison has to be with the neighbour at the paired index and ' +
      'not with a target. The parity fix is the step people drop: a midpoint that lands on the second half of a pair ' +
      'points the search into the fully paired side and returns a duplicate.',
    commonMistake: 'XORing the whole array and claiming the logarithmic bound, or comparing the midpoint with its neighbour without forcing parity.',
    whyWrong:
      'XOR is correct and simpler but linear, so it fails the ask rather than the output — the sorted input is exactly ' +
      'what buys the log n. Skipping the parity fix lets the window converge on a half with no answer in it, which on a ' +
      'short sample often still returns a plausible value.',
    followUps: ['Why does the window stay inclusive of the answer when hi moves to the midpoint?', 'Give the one-line linear version and name what it throws away.', 'What breaks if some value appears three times?'],
    solution:
      'function singleInSorted(nums) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length - 1;\n' +
      '  while (lo < hi) {\n' +
      '    let mid = (lo + hi) >> 1;\n' +
      '    if (mid % 2 === 1) mid -= 1;\n' +
      '    if (nums[mid] === nums[mid + 1]) lo = mid + 2;\n' +
      '    else hi = mid;\n' +
      '  }\n' +
      '  return nums[lo];\n' +
      '}',
    modify: 'Now every other value appears four times instead of twice — does the same parity rule decide the half?',
  },
  {
    step: 3,
    name: 'Rotate Matrix by 90 Degrees Clockwise',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Rotate a square grid ninety degrees clockwise by cycling four cells per ring, then compare it with transpose and reversal.',
    brief: 'Input: an n by n grid, mutated in place. Output: the clockwise rotation, with each cell written exactly once.',
    concepts: ['dsa-cycle-in-rings', 'dsa-coordinate-loops', 'dsa-boundary-conditions'],
    shortAnswer: 'Walk the rings and cycle four symmetric cells with one temporary, iterating only a quarter of each side.',
    idealAnswer:
      'A clockwise turn sends the position (i, j) to (j, n - 1 - i), and following that map four times returns to the ' +
      'start, so the cells of a ring fall into four-cycles. Holding one value and shifting the other three rotates a ' +
      'cycle; running the offset along a quarter of the side covers the ring, and the rings close toward the centre. ' +
      'Every cell is read and written once — O(n squared) time, O(1) space, one pass.',
    walkthrough:
      'The single pass is the difference from transpose-then-reverse, which is the same order but writes the grid twice, ' +
      'so the ring form wins on traffic and loses on legibility. The loop bound is the part to say out loud: iterating a ' +
      'whole side would replay each cycle from its other corner, and the odd-sized centre cell is a cycle of one that the ' +
      'bounds already exclude.',
    commonMistake: 'Iterating the full width of each side per ring, or using a temporary per cell instead of one per cycle.',
    whyWrong:
      'Covering a whole side rotates cells twice, so the ring ends up turned 180 degrees while the inner rings are ' +
      'scrambled — an output that has every value present and is still wrong. Allocating a copy of the grid to rotate it ' +
      'answers a different question, the one the in-place constraint was written to rule out.',
    followUps: ['Write the counter-clockwise cycle and say which neighbour moves first.', 'How many swaps does an n by n grid need in total?', 'Why does transpose-plus-reverse win in a code review anyway?'],
    solution:
      'function rotateRings(a) {\n' +
      '  const n = a.length;\n' +
      '  for (let ring = 0; ring < n / 2; ring += 1) {\n' +
      '    const last = n - 1 - ring;\n' +
      '    for (let offset = 0; offset < last - ring; offset += 1) {\n' +
      '      const top = a[ring][ring + offset];\n' +
      '      a[ring][ring + offset] = a[last - offset][ring];\n' +
      '      a[last - offset][ring] = a[last][last - offset];\n' +
      '      a[last][last - offset] = a[ring + offset][last];\n' +
      '      a[ring + offset][last] = top;\n' +
      '    }\n' +
      '  }\n' +
      '  return a;\n' +
      '}',
    modify: 'Rotate 180 degrees with the same four-cell cycle and count how many writes each cell takes.',
  },
  {
    step: 3,
    name: 'Find missing and repeating numbers',
    difficulty: 'Medium',
    topicSlug: ARRAYS,
    stem: 'Recover the duplicate and the gap by writing the answer into the array itself, and name what the input costs.',
    brief: 'Input: an array of length n holding the values 1 to n with one repeated and one absent; the array is mutated. Output: the repeating value and the missing one.',
    concepts: ['dsa-negation-mirror', 'dsa-in-place-markers', 'dsa-boundary-conditions'],
    shortAnswer: 'Use each value as an index and negate the slot it points at; the slot already negative when you arrive is the repeat.',
    idealAnswer:
      'A value in one to n addresses a slot of the same array, so the sign of that slot records whether the value has ' +
      'been seen. Reading the magnitude before the sign keeps the addressing valid after the first negation. The slot ' +
      'that is already negative when you reach it is the repeating value, and the only slot still positive after a full ' +
      'pass is the missing one — O(n) time and O(1) extra space.',
    walkthrough:
      'The pass must not break when it finds the repeat, because a value that only appears later still has to flip its ' +
      'own slot or it looks missing too. That is the difference between detecting and recording: detection lets you stop, '
      + 'recording has to finish the scan. The cost is a mutated input, which is why the arithmetic version exists for ' +
      'data you do not own.',
    commonMistake: 'Breaking out of the first loop as soon as the duplicate shows up, or reading the index without the absolute value.',
    whyWrong:
      'An early break leaves untouched slots that read as missing, so the second pass reports values that are present — ' +
      'a wrong answer that only shows up when the duplicate happens to sit early. Ignoring the magnitude turns a negated ' +
      'slot into a negative index, which is undefined behaviour rather than a bug you can see.',
    followUps: ['Which input position makes the early-break version report two missing values?', 'How do you restore the array afterwards, and should you?', 'What does the arithmetic version cost that this one does not?'],
    solution:
      'function repeatingMissingOnce(nums) {\n' +
      '  let repeating = -1;\n' +
      '  for (const value of nums) {\n' +
      '    const index = Math.abs(value) - 1;\n' +
      '    if (nums[index] < 0) repeating = index + 1;\n' +
      '    else nums[index] = -nums[index];\n' +
      '  }\n' +
      '  let missing = -1;\n' +
      '  for (let i = 0; i < nums.length; i += 1) {\n' +
      '    if (nums[i] > 0) missing = i + 1;\n' +
      '  }\n' +
      '  return [repeating, missing];\n' +
      '}',
    modify: 'Do it so the array is left exactly as it was found — which pass has to undo the marks?',
  },
  {
    step: 4,
    name: 'Binary Search to find X in sorted array',
    difficulty: 'Easy',
    topicSlug: SEARCH,
    stem: 'Find a target in a sorted array in logarithmic time and say which half you discard and why.',
    brief: 'Input: a sorted array of integers and a target. Output: the index of the target, or -1 when it is absent.',
    concepts: ['dsa-binary-search-window', 'dsa-search-exit-index', 'dsa-boundary-conditions'],
    shortAnswer: 'Compare the midpoint with the target and throw away the half that cannot contain it: logarithmic halvings.',
    idealAnswer:
      'Ordering is what lets the midpoint value decide which side the target can lie on, so every step halves the ' +
      'window: O(log n) comparisons and O(1) space, written as a loop rather than a recursion frame per level. The ' +
      'window has to be a stated claim — usually inclusive at both ends — and the loop condition, the two updates and ' +
      'the return value all have to agree with that one claim, which is the whole difficulty of binary search.',
    walkthrough:
      'An off-by-one here is not a typo but a broken contract: with an inclusive hi the condition is lo at most hi and ' +
      'both updates exclude the tested midpoint, while an exclusive hi wants a strict condition and hi moving to mid. ' +
      'Mixing the two either loops forever or exits without testing the last candidate. The correctness argument is ' +
      'that the target was never in the discarded half, and that holds only because the array is sorted — the ' +
      'precondition this function never checks.',
    commonMistake: 'Moving lo to mid instead of mid plus one, or writing the loop with a half-inclusive, half-exclusive window.',
    whyWrong:
      'Failing to exclude the tested midpoint stops the window shrinking once it is two wide, which hangs rather than ' +
      'returns. A mixed contract can exit without ever looking at the last element and report absent for a value that ' +
      'is present — the silent kind, and the reason a reviewer asks you to state the window out loud before the code.',
    followUps: ['Write the exclusive-hi version and keep its contract consistent.', 'Why does integer halving terminate rather than oscillate?', 'What does this return on an unsorted array, and who is to blame?'],
    solution:
      'function binarySearch(nums, target) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length - 1;\n' +
      '  while (lo <= hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] === target) return mid;\n' +
      '    if (nums[mid] < target) lo = mid + 1;\n' +
      '    else hi = mid - 1;\n' +
      '  }\n' +
      '  return -1;\n' +
      '}',
    modify: 'Rewrite it with hi exclusive and a strict loop condition, then re-run the two-edge inputs.',
  },
  {
    step: 4,
    name: 'Implement Lower Bound',
    difficulty: 'Easy',
    topicSlug: SEARCH,
    stem: 'Return the first index whose value is not smaller than the target, and say what an all-smaller array gives.',
    brief: 'Input: a sorted array and a value. Output: the leftmost index holding a value at least the target, or the length when every element is smaller.',
    concepts: ['dsa-lower-bound', 'dsa-search-exit-index', 'dsa-boundary-conditions'],
    shortAnswer: 'Keep every candidate inside the window: a midpoint that qualifies could be the answer, so hi retreats to mid.',
    idealAnswer:
      'The predicate "value at least the target" is false along the array and then true, so the question is where that ' +
      'flips. Halving with hi equal to mid when the midpoint qualifies and lo equal to mid plus one when it does not ' +
      'keeps the answer inside the window at every step, and the loop ends with both pointers on it. Returning the ' +
      'length when nothing qualifies is why the result is an index into a gap, not necessarily an element.',
    walkthrough:
      'This is a search for a boundary rather than for a value, which is exactly why it answers questions about absent ' +
      'targets: the index it returns is where the target would have to be inserted. Membership, counting a run, and ' +
      'finding the first element above a threshold are all arithmetic on the same primitive, so one loop serves several ' +
      'interview questions and each of them inherits its correctness.',
    commonMistake: 'Returning mid the moment the value equals the target, or moving hi to mid minus one when the midpoint qualifies.',
    whyWrong:
      'Returning on equality gives some occurrence rather than the first, which only looks right because test arrays ' +
      'tend to hold distinct values. Retreating past a qualifying midpoint throws away the only index that could be the ' +
      'answer, so a target above everything exits one short and points at a value that is not at least the target.',
    followUps: ['Which three separate questions does this one loop answer?', 'Why does hi start at the length instead of the length minus one?', 'Give the mirror version: the last index whose value is not greater.'],
    solution:
      'function lowerBound(nums, target) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length;\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] < target) lo = mid + 1;\n' +
      '    else hi = mid;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Use it to report the largest value not exceeding the target, without writing a second loop.',
  },
  {
    step: 4,
    name: 'Implement Upper Bound',
    difficulty: 'Easy',
    topicSlug: SEARCH,
    stem: 'Return the first index whose value is strictly greater than the target, and use it to count everything at most the target.',
    brief: 'Input: a sorted array and a value. Output: the leftmost index of an element greater than the target, or the length when none is.',
    concepts: ['dsa-upper-bound', 'dsa-lower-bound', 'dsa-search-exit-index'],
    shortAnswer: 'The same halving as lower bound with the predicate one step further: only a strictly greater value moves hi.',
    idealAnswer:
      'The flip point is now "value greater than the target", so the equal case stays on the false side and the window ' +
      'advances past a run of equals. The index it exits on is the count of everything at most the target, which is why ' +
      'the pair is worth writing: the number of occurrences of a value is upper bound minus lower bound over the same ' +
      'array, and both ends come free.',
    walkthrough:
      'With duplicates the two bounds differ and the difference is the run length, which is why they are taught as a ' +
      'pair and implemented as one loop with a flag. Strictness is the whole content of the exercise: getting it wrong ' +
      'makes upper bound identical to lower bound, and the two still look like working binary searches when inspected ' +
      'one at a time.',
    commonMistake: 'Reusing the non-strict comparison from lower bound, or adjusting the index inside the loop to point at the last equal value.',
    whyWrong:
      'An identical predicate makes the two bounds return the same index, so every occurrence count comes back zero or ' +
      'one regardless of how many repeats there are. Nudging the result inside the search breaks the window invariant ' +
      'for the halving that follows it — correct on two-element samples, wrong on a run of three.',
    followUps: ['Count the values inside a closed range using only these two bounds.', 'Which bound answers "is the target present" and with what extra check?', 'What does upper bound return on an array of equal values?'],
    solution:
      'function upperBound(nums, target) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length;\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] <= target) lo = mid + 1;\n' +
      '    else hi = mid;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Write one boundary function taking a flag and derive both bounds from it.',
  },
  {
    step: 4,
    name: 'Search Insert Position',
    difficulty: 'Easy',
    topicSlug: SEARCH,
    stem: 'Give the index a target would occupy when it is absent, and show that one loop also answers membership.',
    brief: 'Input: a sorted array of distinct integers and a target. Output: the index of the target if present, otherwise the index where inserting keeps the array sorted.',
    concepts: ['dsa-lower-bound', 'dsa-search-exit-index', 'dsa-boundary-conditions'],
    shortAnswer: 'It is lower bound with no special case: the exit index is the answer when present and the gap when absent.',
    idealAnswer:
      'The insertion point is the first index whose value is not smaller than the target, which is precisely what the ' +
      'boundary halving exits on, so presence is a single read of that index rather than a second search. O(log n) time ' +
      'and O(1) space. The two edges are the interesting inputs — before everything and after everything — and the same ' +
      'window gives zero and the length for them.',
    walkthrough:
      'Writing this as its own algorithm is how two subtly different binary searches end up in one codebase, one of them ' +
      'wrong on duplicates or on an edge. Keeping it as the boundary form means the membership question, the counting ' +
      'question and the insertion question all read the same loop exit and only the reporting differs, so a fix to the ' +
      'window reaches all three.',
    commonMistake: 'Running two searches — one for the value and one for the gap — or returning one past the exit index for an absent target.',
    whyWrong:
      'A second search is a second window to keep in sync, and it is the copy that goes stale when the ordering rule ' +
      'changes. Returning lo plus one places the insertion after an equal value, corrupting the very precondition the ' +
      'search depended on for the caller that reads the array next.',
    followUps: ['Why is no separate presence check needed to return the index?', 'What is returned when the target exceeds every element?', 'On an array with duplicates, which side of the run does the index land on?'],
    solution:
      'function searchInsert(nums, target) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length;\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] < target) lo = mid + 1;\n' +
      '    else hi = mid;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Insert the value into the array with splice and say what the operation really costs.',
  },
  {
    step: 4,
    name: 'Check if Input array is sorted',
    difficulty: 'Easy',
    topicSlug: SEARCH,
    stem: 'Binary search assumes order: write the check that costs one pass and say what the search reports when nobody ran it.',
    brief: 'Input: an array of integers and a target. Output: whether the array is non-decreasing, plus the index a boundary search gives for the target.',
    concepts: ['dsa-lower-bound', 'dsa-boundary-conditions', 'dsa-branch-exhaustiveness'],
    shortAnswer: 'Sortedness is one pass over adjacent pairs; a search exit is only meaningful if that pass was run first.',
    idealAnswer:
      'Every adjacent pair has to be in order, so the check is linear time and constant space, and it is either assumed ' +
      'by the contract or verified where the data arrives. Binary search cannot detect a violated assumption: it ' +
      'returns the index its own comparisons landed on, which is a plausible wrong answer, so a service accepting ' +
      'untrusted order either runs the check or sorts before searching.',
    walkthrough:
      'The failure is data-dependent, which is what makes it expensive: an unsorted array still terminates, and the ' +
      'index it reports can even hold the target by accident. That is the argument for putting sortedness in input ' +
      'validation rather than in documentation — either the producer guarantees the order, or a caller pays one linear ' +
      'pass to find out that it did not.',
    commonMistake: 'Treating a search result as evidence that the input was sorted, or checking order by comparing every pair of elements.',
    whyWrong:
      'A search has no way to report a broken precondition, so a wrong index arrives as a success and surfaces far away ' +
      'from the cause. Quadratic checking is the opposite mistake: it makes an O(n) precondition expensive enough that ' +
      'teams skip it, which is how the first one survives review.',
    followUps: ['Which unsorted array makes the search point at the target anyway?', 'When is paying the linear check worse than sorting first?', 'Where in a request path should this check live?'],
    solution:
      'function isNonDecreasing(nums) {\n' +
      '  for (let i = 1; i < nums.length; i += 1) {\n' +
      '    if (nums[i] < nums[i - 1]) return false;\n' +
      '  }\n' +
      '  return true;\n' +
      '}\n' +
      '\n' +
      'function boundaryIndex(nums, target) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length;\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] < target) lo = mid + 1;\n' +
      '    else hi = mid;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Make boundaryIndex refuse to answer unless the check passes, and pick an error style for it.',
  },
  {
    step: 4,
    name: 'Find First and Last Position of Element in Sorted Array',
    difficulty: 'Medium',
    topicSlug: SEARCH,
    stem: 'Return the first and last index of a target in a sorted array with duplicates, and say why two searches beat a scan.',
    brief: 'Input: a sorted array of integers, duplicates allowed, and a target. Output: the two end indices of the run, or -1 and -1 when the target is absent.',
    concepts: ['dsa-lower-bound', 'dsa-upper-bound', 'dsa-search-exit-index'],
    shortAnswer: 'Lower bound gives the first index and upper bound minus one the last, with one comparison deciding whether the run exists.',
    idealAnswer:
      'Each bound halves on its own, so the answer is two logarithmic searches with no dependence on how long the run ' +
      'is. The empty case needs to be explicit: lower bound returns the insertion gap for an absent value, so the ' +
      'element there has to equal the target before any last index is reported. Scanning outwards from one found index ' +
      'is linear on an all-equal array, which is precisely the input that makes the difference measurable.',
    walkthrough:
      'The two predicates differ by one comparison, which is why they are better written as one function taking a flag ' +
      'than as two copies — copies drift, and the drift only shows on duplicates. Reporting the pair as two negative ' +
      'ones is a contract decision rather than arithmetic: every index in the array is a legal bound, so no real answer ' +
      'can be confused with the absent marker.',
    commonMistake: 'Expanding outwards from a found index, or reporting the lower bound as the last index when the target is absent.',
    whyWrong:
      'Outward expansion is linear per query on the repeated input the question is about, so the two searches lose their ' +
      'entire point while still passing a sample built from short runs. Skipping the presence check turns an absent ' +
      'target into a fabricated run: the pair is the gap where the value would have been, and the caller reads elements ' +
      'that are not the target.',
    followUps: ['Write it as one function taking a boolean instead of two bounds.', 'Which single bound plus a run length gives the same pair?', 'What does the pair tell a caller that a count does not?'],
    solution:
      'function searchRange(nums, target) {\n' +
      '  const edge = (wantLast) => {\n' +
      '    let lo = 0;\n' +
      '    let hi = nums.length;\n' +
      '    while (lo < hi) {\n' +
      '      const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '      const before = wantLast ? nums[mid] <= target : nums[mid] < target;\n' +
      '      if (before) lo = mid + 1;\n' +
      '      else hi = mid;\n' +
      '    }\n' +
      '    return lo;\n' +
      '  };\n' +
      '  const first = edge(false);\n' +
      '  if (first === nums.length || nums[first] !== target) return [-1, -1];\n' +
      '  return [first, edge(true) - 1];\n' +
      '}',
    modify: 'Answer the same question with two calls to countOccurrences and one bound — which loop is now dead?',
  },
  {
    step: 4,
    name: 'Count Occurrences in Sorted Array',
    difficulty: 'Easy',
    topicSlug: SEARCH,
    stem: 'Count how many times a value appears in a sorted array without scanning, and name the two lookups the count needs.',
    brief: 'Input: a sorted array of integers and a value. Output: how many positions hold that value.',
    concepts: ['dsa-upper-bound', 'dsa-lower-bound', 'dsa-complexity-counting'],
    shortAnswer: 'The count is upper bound minus lower bound: two halvings and no third loop.',
    idealAnswer:
      'Everything at most the target sits before the upper bound and everything strictly below it before the lower ' +
      'bound, so the difference is exactly the run. Both are boundary searches: O(log n) time, O(1) space, and an ' +
      'absent value gives a difference of zero with no special case, because the two bounds land on the same gap.',
    walkthrough:
      'The zero case is where the understanding shows: no membership test is needed, since the bounds agree when the ' +
      'value is missing, so an extra check is dead code at best and a second place for the logic to diverge at worst. ' +
      'The same pair of predicates answers the first-and-last question, and writing the answer as a subtraction keeps ' +
      'it correct when the run is longer than the search.',
    commonMistake: 'Counting with a linear filter, or finding one index and expanding around it.',
    whyWrong:
      'A filter is linear per query, which is what the sorted input existed to avoid — on a hot path the array length ' +
      'becomes the latency. Expanding around a found index is the same linear cost wearing a logarithmic costume, and ' +
      'only a test with long runs ever catches it.',
    followUps: ['Which comparison decides absence in this version?', 'Count the values inside a closed range with the same two primitives.', 'What has to change if the array is not sorted?'],
    solution:
      'function countOccurrences(nums, target) {\n' +
      '  const bound = (strict) => {\n' +
      '    let lo = 0;\n' +
      '    let hi = nums.length;\n' +
      '    while (lo < hi) {\n' +
      '      const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '      if (strict ? nums[mid] <= target : nums[mid] < target) lo = mid + 1;\n' +
      '      else hi = mid;\n' +
      '    }\n' +
      '    return lo;\n' +
      '  };\n' +
      '  return bound(true) - bound(false);\n' +
      '}',
    modify: 'Report the number of distinct values in the sorted array in one pass — is a bound needed at all?',
  },
  {
    step: 4,
    name: 'Search in Rotated Sorted Array I',
    difficulty: 'Medium',
    topicSlug: SEARCH,
    stem: 'Find a target in a rotated sorted array in logarithmic time and say how you know which half is ordered.',
    brief: 'Input: an array of distinct integers sorted then rotated at an unknown point, and a target. Output: the index of the target, or -1.',
    concepts: ['dsa-rotated-half-sorted', 'dsa-binary-search-window', 'dsa-boundary-conditions'],
    shortAnswer: 'One half is always in order, so classify it first and then ask whether the target lies inside that range.',
    idealAnswer:
      'Comparing the endpoints of the window with the midpoint tells you whether the left half is ordered. If it is, the ' +
      'target is either inside that interval — keep the left half — or it cannot be, so go right; the mirrored test ' +
      'handles the other case. The cost stays one comparison per halving: O(log n) time and O(1) space, and the ' +
      'distinctness of the values is what makes the classification decidable.',
    walkthrough:
      'The mistake this row exists to catch is comparing the midpoint with the target before deciding anything about the ' +
      'halves — on a wrapped array that comparison says nothing about which side to keep, because the target can be ' +
      'smaller than the midpoint and still live to its right. Classify a half as sorted, then bound-check the target ' +
      'into it: that ordering is the entire algorithm, and it is the assumption the duplicates version quietly loses.',
    commonMistake: 'Choosing the side by comparing the midpoint with the target, or scanning for the pivot linearly first.',
    whyWrong:
      'A midpoint comparison alone picks the wrong half on any array whose rotation puts the target behind the pivot, ' +
      'and it does so while returning plausible indices for sorted samples. The linear pivot scan is correct but spends ' +
      'the whole logarithmic bound before the search starts, which reads as never having found the invariant.',
    followUps: ['Which comparison in your loop would stop deciding anything if duplicates were allowed?', 'Rewrite it as find-the-pivot then a plain search with an offset.', 'What does the function do on an array that was never rotated?'],
    solution:
      'function searchRotated(nums, target) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length - 1;\n' +
      '  while (lo <= hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] === target) return mid;\n' +
      '    if (nums[lo] <= nums[mid]) {\n' +
      '      if (target >= nums[lo] && target < nums[mid]) hi = mid - 1;\n' +
      '      else lo = mid + 1;\n' +
      '    } else {\n' +
      '      if (target > nums[mid] && target <= nums[hi]) lo = mid + 1;\n' +
      '      else hi = mid - 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return -1;\n' +
      '}',
    modify: 'Rotate the array back into order using the pivot index you now have, and say what that costs.',
  },
  {
    step: 4,
    name: 'Search in Rotated Sorted Array II',
    difficulty: 'Medium',
    topicSlug: SEARCH,
    stem: 'Duplicates make the half test undecidable: write the search that survives them and give its real worst case.',
    brief: 'Input: a rotated sorted array that may contain repeats, and a target. Output: whether the target is present.',
    concepts: ['dsa-duplicate-ambiguity', 'dsa-rotated-half-sorted', 'dsa-complexity-counting'],
    shortAnswer: 'When an endpoint equals the midpoint the window says nothing, so drop that endpoint by one and decide again.',
    idealAnswer:
      'The half test needs a strict comparison, and equality reveals nothing about where the pivot is. Dropping one edge ' +
      'is sound rather than lucky: the endpoint that matches the midpoint cannot be the only copy of the target, because ' +
      'then the midpoint would have matched and returned already. Each such step discards a single element, so the cost ' +
      'is logarithmic on distinct values and linear on an all-equal array, and the honest answer names both.',
    walkthrough:
      'That same argument is the proof that the bound cannot be repaired — an input of equal values forces a linear ' +
      'number of one-place shrinks before the window closes, because no comparison inside it can localise the pivot. So ' +
      'the design answer for duplicate-heavy data is to deduplicate when the index is built rather than pay the worst ' +
      'case per query, which is the part of this row a reviewer actually asks about.',
    commonMistake: 'Claiming the duplicate version stays logarithmic, or jumping a whole run of equal values at once.',
    whyWrong:
      'Skipping a run assumes you know where the pivot is not, and the pivot is the only thing the ordering argument ' +
      'rests on, so the search can discard the half holding the target. Naming the bound logarithmic instead hides a ' +
      'linear case inside a latency budget, which is precisely what a performance review is there to catch.',
    followUps: ['Prove that dropping the matching endpoint cannot lose the only copy of the target.', 'Give the input that forces the linear case.', 'Which preprocessing restores the logarithmic bound, and what does it cost once?'],
    solution:
      'function searchRotatedWithDuplicates(nums, target) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length - 1;\n' +
      '  while (lo <= hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] === target) return true;\n' +
      '    if (nums[lo] === nums[mid]) {\n' +
      '      lo += 1;\n' +
      '      continue;\n' +
      '    }\n' +
      '    if (nums[hi] === nums[mid]) {\n' +
      '      hi -= 1;\n' +
      '      continue;\n' +
      '    }\n' +
      '    if (nums[lo] < nums[mid]) {\n' +
      '      if (target >= nums[lo] && target < nums[mid]) hi = mid - 1;\n' +
      '      else lo = mid + 1;\n' +
      '    } else if (target > nums[mid] && target <= nums[hi]) lo = mid + 1;\n' +
      '    else hi = mid - 1;\n' +
      '  }\n' +
      '  return false;\n' +
      '}',
    modify: 'Make it return an index instead of a boolean — what extra state has to survive the shrink steps?',
  },
  {
    step: 4,
    name: 'Search in Rotated Sorted Array with Duplicates',
    difficulty: 'Medium',
    topicSlug: SEARCH,
    stem: 'Instead of shrinking on ambiguity, find the pivot and search an offset window — give both costs.',
    brief: 'Input: a rotated sorted array that may contain repeats, and a target. Output: the index of the target in the rotated array, or -1.',
    concepts: ['dsa-pivot-as-minimum', 'dsa-binary-search-window', 'dsa-duplicate-ambiguity'],
    shortAnswer: 'Two searches: locate the pivot, then binary search the virtual unrotated array through an offset index.',
    idealAnswer:
      'The pivot is the minimum, so the boundary halving on the right endpoint finds it, and reading index (lo + k) mod n ' +
      'turns the rotated array into a sorted one without moving a byte. The second search is then ordinary binary search ' +
      'over that virtual window. Two logarithmic passes instead of one, O(log n) space-free work, and the ambiguity ' +
      'handling that duplicates need lives in the pivot search alone.',
    walkthrough:
      'The trade against the single-pass version is worth stating in numbers: the direct search keeps one comparison per ' +
      'level but degrades to linear when the values repeat, while the pivot-first version degrades in exactly the same ' +
      'place — the pivot search itself — and pays an extra logarithmic pass otherwise. Neither escapes duplicates, which ' +
      'is the real lesson: the modulo hides rotation, not ambiguity.',
    commonMistake: 'Moduloing the midpoint into the window without carrying the offset, or deduplicating to fix the bound.',
    whyWrong:
      'An offset applied only at the read and not to the bounds makes the two searches disagree about which elements are ' +
      'in play, so the function returns an index from the wrong rotation of the array. Deduplicating into a copy is a ' +
      'linear pass plus a new allocation, which is the same cost the shrink version pays, only moved somewhere the ' +
      'reviewer cannot see it.',
    followUps: ['Which of the two searches is the one that degrades on repeats, and why?', 'Return the original index from the virtual search without a modulo in the loop.', 'Would you ship this or the single-pass version, and on what data?'],
    solution:
      'function searchRotatedByPivot(nums, target) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length - 1;\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] < nums[hi]) hi = mid;\n' +
      '    else if (nums[mid] > nums[hi]) lo = mid + 1;\n' +
      '    else hi -= 1;\n' +
      '  }\n' +
      '  const start = lo;\n' +
      '  const n = nums.length;\n' +
      '  if (n === 0) return -1;\n' +
      '  let low = 0;\n' +
      '  let high = n - 1;\n' +
      '  while (low <= high) {\n' +
      '    const mid = low + Math.floor((high - low) / 2);\n' +
      '    const value = nums[(start + mid) % n];\n' +
      '    if (value === target) return (start + mid) % n;\n' +
      '    if (value < target) low = mid + 1;\n' +
      '    else high = mid - 1;\n' +
      '  }\n' +
      '  return -1;\n' +
      '}',
    modify: 'Use the pivot index to read the array in unrotated order and return the median in constant space.',
  },
  {
    step: 4,
    name: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'Medium',
    topicSlug: SEARCH,
    stem: 'Find the smallest element of a rotated sorted array and say which endpoint the comparison has to use.',
    brief: 'Input: an array of distinct integers sorted then rotated, never empty. Output: the minimum element.',
    concepts: ['dsa-pivot-as-minimum', 'dsa-binary-search-window', 'dsa-boundary-conditions'],
    shortAnswer: 'Compare the midpoint with the right end: an ordered right half puts the answer at mid or to its left.',
    idealAnswer:
      'A rotated array is two sorted runs and the minimum begins the second, so the question is which side is ordered. ' +
      'If the midpoint is at most the right endpoint, everything from mid to hi is in order and the answer is mid or ' +
      'left of it, so hi moves to mid; otherwise the pivot is strictly right of mid and lo moves past it. The pointers ' +
      'meet on the pivot: O(log n) time, O(1) space.',
    walkthrough:
      'Comparing with the right endpoint is what makes the branches symmetric. Comparing with the left needs a third ' +
      'test for whether the array is rotated at all, because a plain sorted array has an ordered left half and looks ' +
      'exactly like the wrapped case. The loop condition is strict so the two pointers close on one index, which is why ' +
      'the return is a value read from lo rather than a candidate tracked beside it.',
    commonMistake: 'Comparing the midpoint with the left endpoint, or moving hi to mid minus one after ruling out the right half.',
    whyWrong:
      'A left-endpoint comparison cannot tell a fully sorted array from one whose left half is the wrapped run, so the ' +
      'unrotated input returns the wrong element unless it is special-cased. Retreating past a surviving candidate ' +
      'removes the answer from the window, and the loop then reports a value larger than the minimum with no error at ' +
      'all.',
    followUps: ['Why does the right-endpoint version need no unrotated case?', 'What changes when the array may contain duplicates?', 'Return the index of the minimum instead — is that the rotation count?'],
    solution:
      'function findMinimum(nums) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length - 1;\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] <= nums[hi]) hi = mid;\n' +
      '    else lo = mid + 1;\n' +
      '  }\n' +
      '  return nums[lo];\n' +
      '}',
    modify: 'Allow duplicates and keep the answer correct — which comparison stops being enough?',
  },
  {
    step: 4,
    name: 'Find how many times array has been rotated',
    difficulty: 'Medium',
    topicSlug: SEARCH,
    stem: 'Report how far a sorted array was rotated and name the convention your answer depends on.',
    brief: 'Input: an array of distinct integers sorted ascending then rotated right by an unknown amount, so three turns of one two three four five give three four five one two. Output: that number of turns.',
    concepts: ['dsa-pivot-as-minimum', 'dsa-search-exit-index', 'dsa-boundary-conditions'],
    shortAnswer: 'The count is the index of the minimum, because a right rotation moves that element exactly that far.',
    idealAnswer:
      'Rotating right by k puts the last k elements in front, so the smallest element — first in the original — lands at ' +
      'index k, which makes the answer a pivot search rather than a count of operations. The same halving that finds the ' +
      'minimum returns its index instead: O(log n) time, O(1) space, and an array that was never rotated answers zero, ' +
      'which is a result rather than a special case.',
    walkthrough:
      'Two conventions exist and only one is checkable in an interview, so the senior answer states which is meant before ' +
      'writing code: a left rotation by k leaves the pivot at n minus k, the same number read the other way. What the ' +
      'index actually buys is access without ordering — offset every read by the pivot and the array behaves as sorted, ' +
      'which is the trick that makes a rotated buffer usable as a ring.',
    commonMistake: 'Counting the places where adjacent values decrease, or returning one past the pivot index.',
    whyWrong:
      'A rotation of a sorted array has at most one decrease, so counting decreases answers whether anything was rotated ' +
      'and never how far. Reporting the pivot plus one is the off-by-one that passes a sample where the answer happens ' +
      'to equal the length, and then is wrong on every other input.',
    followUps: ['Give the answer for the left-rotation convention from the same index.', 'Which single comparison tells you the count is zero without searching?', 'What does the count let you do to the array without materialising it?'],
    solution:
      'function rotationCount(nums) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length - 1;\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] <= nums[hi]) hi = mid;\n' +
      '    else lo = mid + 1;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Read the element that would sit at any index of the unrotated array, using the count and no copy.',
  },
  {
    step: 4,
    name: 'Single Element in a Sorted Array',
    difficulty: 'Medium',
    topicSlug: SEARCH,
    stem: 'Find the unpaired value with the neighbour computed by an exclusive or, and say what that expression replaces.',
    brief: 'Input: a sorted array where every value appears twice except one, which appears once. Output: the unpaired value.',
    concepts: ['dsa-neighbour-by-xor', 'dsa-pair-parity-search', 'dsa-binary-search-window'],
    shortAnswer: 'XORing an index with one gives its pair partner, so compare mid with that and keep the half where the layout breaks.',
    idealAnswer:
      'Up to the single value pairs sit in even-odd slots, so an even index has its partner one right and an odd index ' +
      'one left — which is precisely what flipping the lowest bit does. A matching partner means the break is further ' +
      'right, so the window starts after the pair; a mismatch keeps the midpoint inside. The result is O(log n) time, ' +
      'O(1) space and no branch on the parity of the midpoint.',
    walkthrough:
      'One expression serving both parities is what removes the second comparison, and with it the chance that the two ' +
      'branches drift apart during a change. The cost is that the reader has to know the trick, which is an argument for ' +
      'naming the helper for what it means rather than what it does — and for the version without it, when the same code ' +
      'will be maintained by people who have not.',
    commonMistake: 'Applying the partner trick to an array that is not sorted, or comparing mid with mid plus one unconditionally.',
    whyWrong:
      'The partner relation is positional, not about values, so on an unsorted array a matching pair proves nothing about ' +
      'where the odd element sits. An unconditional forward neighbour comparison asks a different question for odd ' +
      'midpoints, and the search then narrows toward a half that is fully paired while still terminating cleanly.',
    followUps: ['Which invariant does the partner comparison actually test?', 'Give the parity-branch version and compare the two on one input.', 'What breaks if one value appears three times?'],
    solution:
      'function singleNonPair(nums) {\n' +
      '  const partner = (index) => index ^ 1;\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length - 1;\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] === nums[partner(mid)]) lo = mid + 1;\n' +
      '    else hi = mid;\n' +
      '  }\n' +
      '  return nums[lo];\n' +
      '}',
    modify: 'Report the index of the unpaired value too — does the partner rule still decide the half?',
  },
  {
    step: 4,
    name: 'Find Peak Element',
    difficulty: 'Medium',
    topicSlug: SEARCH,
    stem: 'Find an index whose value exceeds both neighbours in logarithmic time and justify the boundary convention.',
    brief: 'Input: an array of integers where adjacent values differ. Output: the index of any peak, with both ends treated as if the neighbour outside were smaller than everything.',
    concepts: ['dsa-peak-gradient', 'dsa-binary-search-window', 'dsa-boundary-conditions'],
    shortAnswer: 'Climb toward the larger neighbour: a rising run inside a bounded array has to end at a peak.',
    idealAnswer:
      'If the midpoint rises to the right, the right half contains a peak — follow the ascent until an element stops ' +
      'rising and that is one, because the far end is bounded by the convention. If it rises left, the identical ' +
      'argument holds on the left half. So the neighbour comparison is enough to halve: O(log n) time, O(1) space, and ' +
      'the answer is a peak, not the largest element.',
    walkthrough:
      'The existence argument is the reply to the obvious challenge: a strictly increasing array has a peak only because ' +
      'the outside counts as lower, which is why the convention is stated before the algorithm rather than assumed by it. ' +
      'Being clear about what the function does not promise matters as much — it cannot report the global maximum, and ' +
      'the unequal-neighbours condition is what stops the ascent from stalling on a plateau.',
    commonMistake: 'Scanning for the largest value, or comparing both neighbours without a rule for which side to keep.',
    whyWrong:
      'A linear scan answers a different question and forfeits the logarithmic bound the row is graded on. Comparing ' +
      'without a side rule leaves the window with no way to shrink: when the midpoint is not a peak exactly one ' +
      'neighbour is larger, and that is the only half with a guaranteed peak, so keeping both is a recursion over the ' +
      'whole array wearing a binary search name.',
    followUps: ['Why does an increasing array still have a peak under this convention?', 'What would have to change to return the global maximum?', 'Which condition stops working if adjacent values may be equal?'],
    solution:
      'function findPeak(nums) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length - 1;\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] < nums[mid + 1]) lo = mid + 1;\n' +
      '    else hi = mid;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Return the largest peak instead of any peak — what does that cost, and can halving still do it?',
  },
  {
    step: 4,
    name: 'Find square root of a number in O(log N)',
    difficulty: 'Easy',
    topicSlug: SPACE,
    stem: 'Return the integer square root without Newton and give the range you were actually searching.',
    brief: 'Input: a non-negative integer. Output: the largest integer whose square does not exceed it.',
    concepts: ['dsa-answer-range-search', 'dsa-search-exit-index', 'dsa-capped-power'],
    shortAnswer: 'Halve the answer range: the predicate that mid squared is at most n is monotone, so the last true mid is the root.',
    idealAnswer:
      'Nothing here is indexed — the window is the set of possible answers, and the loop keeps the largest candidate that ' +
      'satisfies the predicate. Halving a value range still takes logarithmic steps, and the upper bound has to be ' +
      'justified rather than guessed: half the number is enough for anything above one, so the window is defensible and ' +
      'not merely large. Keeping the best true midpoint as the answer is the ceiling-versus-floor decision made explicit.',
    walkthrough:
      'Choosing the range is the problem, because an index window comes free and an answer window does not: the ' +
      'justification is that once a candidate fails, every larger one fails too. The other choice worth stating is ' +
      'testing with division instead of squaring, which keeps the comparison inside the exact integer range for inputs ' +
      'whose squares would not fit — in JavaScript a double stops being exact long before it wraps.',
    commonMistake: 'Scanning upward until the square passes the number, or returning the first midpoint whose square is at least it.',
    whyWrong:
      'A linear scan forfeits the row entirely and is the answer that gets rejected on a large input. The first-true ' +
      'formulation returns the ceiling rather than the floor, so it is one too big on every value that is not a perfect ' +
      'square, which is most of them.',
    followUps: ['Why is half the number enough as an upper bound?', 'Which comparison changes if you must avoid squaring at all?', 'Add a tolerance: what does the loop stop on now?'],
    solution:
      'function integerSqrt(n) {\n' +
      '  if (n < 2) return n;\n' +
      '  let lo = 1;\n' +
      '  let hi = Math.floor(n / 2);\n' +
      '  let best = 1;\n' +
      '  while (lo <= hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (mid <= Math.floor(n / mid)) {\n' +
      '      best = mid;\n' +
      '      lo = mid + 1;\n' +
      '    } else {\n' +
      '      hi = mid - 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Return the root to three decimal places using the same window — what ends the loop now?',
  },
  {
    step: 4,
    name: 'Find the Nth root of a number',
    difficulty: 'Medium',
    topicSlug: SPACE,
    stem: 'Find the integer whose n-th power is the target, or report that none exists, without leaving the exact range.',
    brief: 'Input: a degree and a target. Output: the integer root when its power equals the target, otherwise a value saying there is none.',
    concepts: ['dsa-answer-range-search', 'dsa-capped-power', 'dsa-boundary-conditions'],
    shortAnswer: 'Halve the candidate range and abandon a power the moment it passes the target instead of finishing it.',
    idealAnswer:
      'Any candidate above the target would power past it, so the answer window is one to the target and halving covers ' +
      'it in logarithmic steps. The part worth the marks is the power routine: it stops as soon as the running product ' +
      'exceeds the target, which bounds the work for large degrees and keeps the accumulator inside the range where ' +
      'equality can be tested at all. A capped power above the target sends the window left, a finished one below it ' +
      'sends the window right.',
    walkthrough:
      'Two properties make this row worth doing rather than skipping: monotonicity of the power in the candidate, which ' +
      'is what licenses halving, and the early exit, which is what makes a large degree and a large target a bounded ' +
      'amount of work. In JavaScript the accumulator is a double, so the cap is not about wrapping but about losing low ' +
      'digits — once the power has left the exact range the equality test can never be true.',
    commonMistake: 'Computing the whole power before comparing, or taking the floating point root and rounding it.',
    whyWrong:
      'A full power on a large candidate leaves the exact integer window, so a root that genuinely exists is reported as ' +
      'absent. Rounding a floating result inherits the same error from the other side and answers with the nearest ' +
      'integer even when the target has no integer root — the wrong answer that always looks right.',
    followUps: ['Where exactly does the accumulator stop being exact?', 'Which two comparisons decide the direction of the step?', 'Give the version that accepts a tolerance and what changes in the test.'],
    solution:
      'function nthRoot(degree, target) {\n' +
      '  if (target === 0) return 0;\n' +
      '  if (degree === 1) return target;\n' +
      '  let lo = 1;\n' +
      '  let hi = target;\n' +
      '  while (lo <= hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    let power = 1;\n' +
      '    let over = false;\n' +
      '    for (let step = 0; step < degree; step += 1) {\n' +
      '      power *= mid;\n' +
      '      if (power > target) {\n' +
      '        over = true;\n' +
      '        break;\n' +
      '      }\n' +
      '    }\n' +
      '    if (over) hi = mid - 1;\n' +
      '    else if (power < target) lo = mid + 1;\n' +
      '    else return mid;\n' +
      '  }\n' +
      '  return -1;\n' +
      '}',
    modify: 'Use the same capped power to report the largest degree for which a base still fits.',
  },
  {
    step: 4,
    name: 'Koko Eating Bananas',
    difficulty: 'Medium',
    topicSlug: SPACE,
    stem: 'Find the least rate of bananas per hour that finishes every pile before the guard returns.',
    brief: 'Input: an array of pile sizes and an hour limit. Output: the smallest integer rate at which all piles are eaten within that many hours.',
    concepts: ['dsa-answer-range-search', 'dsa-feasibility-scan', 'dsa-minimize-maximum'],
    shortAnswer: 'Halve the rate and add up the hours each pile costs at it, rounding a partial hour up.',
    idealAnswer:
      'Finishing in the limit is monotone in the rate, so the answer is the smallest feasible one, and the window runs ' +
      'from one to the largest pile: a faster rate than that buys nothing, because an hour cannot be shared between ' +
      'piles. Each pile costs the ceiling of its size over the rate, which keeps the check in integers, so feasibility ' +
      'is a linear scan and the total cost is O(n log of the largest pile).',
    walkthrough:
      'The upper bound is where the row is lost: the largest pile rather than the sum, and the reason is that a pile is ' +
      'never split across hours, so no rate above the biggest pile can finish sooner. The ceiling is the other half of ' +
      'the argument — a pile of four at rate three takes two hours, not a third of an hour of slack — and writing it as ' +
      'an integer expression avoids a floating comparison against the limit entirely.',
    commonMistake: 'Bounding the window by the total number of bananas, or charging a partial hour as a fraction.',
    whyWrong:
      'The total makes the window needlessly wide and costs extra halvings for no correctness, and it hides the fact that ' +
      'the rate is bounded by a single pile. Fractional hours pass whenever the sizes happen to divide evenly and fail ' +
      'otherwise, presenting as an off-by-one rate that only an odd pile exposes.',
    followUps: ['Why is the largest pile the right upper bound and not the sum?', 'Which input makes the ceiling matter most?', 'What is the answer when the hour limit is below the number of piles?'],
    solution:
      'function minEatingSpeed(piles, hours) {\n' +
      '  const needed = (rate) => piles.reduce((total, pile) => total + Math.ceil(pile / rate), 0);\n' +
      '  let lo = 1;\n' +
      '  let hi = Math.max(...piles);\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (needed(mid) <= hours) hi = mid;\n' +
      '    else lo = mid + 1;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Report the rate that finishes in exactly the given hours, and say when no rate does.',
  },
  {
    step: 4,
    name: 'Minimum days to make M bouquets',
    difficulty: 'Medium',
    topicSlug: SPACE,
    stem: 'Find the earliest day on which the flowers allow the bouquets, and give the two resets the scan needs.',
    brief: 'Input: an array of bloom days, a bouquet count and a bouquet size. Output: the smallest day by which that many disjoint runs of adjacent bloomed flowers exist, or -1.',
    concepts: ['dsa-answer-range-search', 'dsa-feasibility-scan', 'dsa-boundary-conditions'],
    shortAnswer: 'Halve the day range; the check counts runs of bloomed flowers and hands over a run when it reaches the size.',
    idealAnswer:
      'By a given day the bloomed positions form runs, and a run of length L yields L divided by the size bouquets, so ' +
      'feasibility is one linear pass carrying a run length. The predicate is monotone because a later day can only ' +
      'bloom more flowers, and the window is from the earliest bloom day to the latest: O(n log of that spread). The ' +
      'impossible case is arithmetic, not search — if the flowers needed exceed the flowers planted, no day works.',
    walkthrough:
      'Two resets live in the scan and they are different rules: an unbloomed flower ends the current run, and a ' +
      'completed bouquet starts a fresh one because a stem cannot be used twice. Forgetting the second lets a long run ' +
      'be counted once and a half, and the check then claims feasibility at a day that cannot produce the bouquets. ' +
      'Bounding the window by the bloom days rather than by the calendar is the same discipline as the rate problems.',
    commonMistake: 'Counting bloomed neighbours without handing them over, or returning the largest day when the order is impossible.',
    whyWrong:
      'Without the second reset one run of flowers is reused across bouquets, so the search reports a day too early and ' +
      'the caller cannot build anything at it. Returning the upper bound for the impossible case is a wrong answer that ' +
      'looks like a slow one; the length check is what turns it into -1.',
    followUps: ['Which of the two resets is a rule about adjacency and which about reuse?', 'Why does the window start at the earliest bloom day?', 'Give the input where the answer is the latest bloom day.'],
    solution:
      'function minDays(bloomDay, m, k) {\n' +
      '  if (m * k > bloomDay.length) return -1;\n' +
      '  const possible = (day) => {\n' +
      '    let bouquets = 0;\n' +
      '    let run = 0;\n' +
      '    for (const value of bloomDay) {\n' +
      '      if (value <= day) {\n' +
      '        run += 1;\n' +
      '        if (run === k) {\n' +
      '          bouquets += 1;\n' +
      '          run = 0;\n' +
      '        }\n' +
      '      } else {\n' +
      '        run = 0;\n' +
      '      }\n' +
      '    }\n' +
      '    return bouquets >= m;\n' +
      '  };\n' +
      '  let lo = Math.min(...bloomDay);\n' +
      '  let hi = Math.max(...bloomDay);\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (possible(mid)) hi = mid;\n' +
      '    else lo = mid + 1;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Ask for the latest day that still leaves at least one spare bouquet — which side of the predicate moves?',
  },
  {
    step: 4,
    name: 'Find the smallest divisor given a threshold',
    difficulty: 'Medium',
    topicSlug: SPACE,
    stem: 'Find the least divisor whose rounded-up divisions of an array sum to at most a threshold.',
    brief: 'Input: an array of positive integers and a threshold. Output: the smallest divisor such that the sum of the ceilings is at most the threshold.',
    concepts: ['dsa-answer-range-search', 'dsa-feasibility-scan', 'dsa-minimize-maximum'],
    shortAnswer: 'Halve the divisor between one and the largest value and check the ceiling sum with one scan.',
    idealAnswer:
      'The sum of ceilings never increases as the divisor grows, so feasibility is monotone and the answer is the first ' +
      'divisor that brings the sum under the threshold. The window is one to the largest element, because above it ' +
      'every term is already one and the only thing left to shrink is the number of terms. Cost is O(n log of the ' +
      'largest value), the same shape as the eating-rate problem with a different check.',
    walkthrough:
      'The threshold has to be at least the length of the array or nothing works, since each positive term rounds up to ' +
      'at least one — naming that first is what makes the impossible case a decision rather than an artefact of where ' +
      'the loop happens to end. Keeping the ceiling in integer arithmetic matters for the same reason as before: the ' +
      'comparison is against an exact count, not an approximation of one.',
    commonMistake: 'Bounding the window by the sum of the array, or comparing the plain sum instead of the sum of ceilings.',
    whyWrong:
      'The sum is orders of magnitude wider than any answer, so the extra halvings are pure cost and the bound stops ' +
      'explaining anything about the problem. Dropping the ceiling under-counts the terms, so the check calls a divisor ' +
      'feasible when it is not and the search returns an answer the caller cannot satisfy.',
    followUps: ['What is the answer when the threshold equals the length?', 'Which two bounds would you defend if the values could be zero?', 'Give the version that maximises the divisor under a minimum sum.'],
    solution:
      'function smallestDivisor(nums, threshold) {\n' +
      '  if (threshold < nums.length) return -1;\n' +
      '  const cost = (divisor) => nums.reduce((total, value) => total + Math.ceil(value / divisor), 0);\n' +
      '  let lo = 1;\n' +
      '  let hi = Math.max(...nums);\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (cost(mid) <= threshold) hi = mid;\n' +
      '    else lo = mid + 1;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Now the threshold caps the largest single term instead of the sum — is that still monotone?',
  },
  {
    step: 4,
    name: 'Capacity to Ship Packages within D Days',
    difficulty: 'Medium',
    topicSlug: SPACE,
    stem: 'Find the least capacity that ships every package in order inside the day limit.',
    brief: 'Input: an array of weights in shipping order and a day limit. Output: the smallest per-day capacity that loads all of them within that many days without reordering.',
    concepts: ['dsa-answer-range-search', 'dsa-feasibility-scan', 'dsa-minimize-maximum'],
    shortAnswer: 'Halve the capacity; the check loads each day greedily and starts a new day when the next package would overflow.',
    idealAnswer:
      'A capacity below the heaviest package cannot ship at all and the sum of everything ships in one day, so those two ' +
      'numbers are the window. Feasibility is a single scan that opens a new day exactly when the next package would ' +
      'overflow, because the order is fixed and a greedy fill of an ordered sequence is optimal for it: O(n log of the ' +
      'weight range) time and O(1) space.',
    walkthrough:
      'The greedy check is correct only because reordering is forbidden — an optimal loading of a fixed sequence never ' +
      'leaves room on a day it could have used, so counting the breaks that become necessary is the true minimum day ' +
      'count for that capacity. Allow reordering and the same outer search is still monotone, but the inner problem ' +
      'becomes bin packing and the scan stops being exact.',
    commonMistake: 'Starting the window at zero or at the sum, or letting a package be split across two days.',
    whyWrong:
      'A lower bound under the heaviest package spends halvings on capacities that cannot be tested and can return one ' +
      'that leaves a package unshipped. Splitting a package is the silent failure: the day count is honest only in a ' +
      'model where cargo can be cut, so the real load overflows on the first day that carries half of something.',
    followUps: ['Why is the heaviest package a legal lower bound?', 'Which part of the proof needs the fixed order?', 'What does the answer become when the day limit equals the number of packages?'],
    solution:
      'function shipWithinDays(weights, days) {\n' +
      '  const needed = (capacity) => {\n' +
      '    let count = 1;\n' +
      '    let load = 0;\n' +
      '    for (const weight of weights) {\n' +
      '      if (load + weight > capacity) {\n' +
      '        count += 1;\n' +
      '        load = 0;\n' +
      '      }\n' +
      '      load += weight;\n' +
      '    }\n' +
      '    return count;\n' +
      '  };\n' +
      '  let lo = Math.max(...weights);\n' +
      '  let hi = weights.reduce((total, weight) => total + weight, 0);\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (needed(mid) <= days) hi = mid;\n' +
      '    else lo = mid + 1;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Report the day-by-day loading for the chosen capacity — how much of the scan do you keep?',
  },
  {
    step: 4,
    name: 'Kth Missing Positive Number',
    difficulty: 'Easy',
    topicSlug: SPACE,
    stem: 'Find the k-th positive integer absent from a sorted array and say what the gap at an index measures.',
    brief: 'Input: a sorted array of distinct positive integers and a k. Output: the k-th positive integer that is not in the array.',
    concepts: ['dsa-deficit-counting', 'dsa-search-exit-index', 'dsa-boundary-conditions'],
    shortAnswer: 'The count missing before an index is the value minus that index minus one, and it is non-decreasing.',
    idealAnswer:
      'For distinct increasing values, the quantity at a position that tells you how far the array trails the natural ' +
      'numbers is value minus index minus one, and it never decreases, so the window can halve on it. Keep the last ' +
      'position whose deficit is still below k; from there the missing numbers are consecutive, and the answer is that ' +
      'position plus k. O(log n) time and O(1) space, with both edges falling out of the same arithmetic.',
    walkthrough:
      'The formula survives a stretch with no gaps because a present value does not increase the deficit, so the quantity ' +
      'only grows when the array skips. Reading the answer as index plus k after the loop is the step people cannot ' +
      'justify: the window exits at the last position still short of k missing numbers, so the k-th one sits exactly k ' +
      'places further along the number line, not k places further along the array.',
    commonMistake: 'Walking the number line until k absent values are counted, or returning the value at the found index plus k.',
    whyWrong:
      'The walk costs the magnitude of the answer rather than the size of the input, which is not a fallback when k is ' +
      'large. Adding k to a value rather than to an index double-counts the deficit already paid at that position, so ' +
      'the result is too large by exactly how far the array had drifted — invisible on a gap-free sample.',
    followUps: ['Why does a present element leave the deficit unchanged?', 'Which index does the loop exit on when k exceeds every deficit?', 'What does the same formula answer on an array of consecutive values?'],
    solution:
      'function kthMissing(nums, k) {\n' +
      '  let lo = 0;\n' +
      '  let hi = nums.length - 1;\n' +
      '  while (lo <= hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (nums[mid] - mid - 1 < k) lo = mid + 1;\n' +
      '    else hi = mid - 1;\n' +
      '  }\n' +
      '  return lo + k;\n' +
      '}',
    modify: 'Return every missing value up to k — does the deficit formula still let you skip ahead?',
  },
  {
    step: 4,
    name: 'Find Kth missing positive number',
    difficulty: 'Easy',
    topicSlug: SPACE,
    stem: 'Solve the k-th missing number in one pass by spending each gap, and say when the linear form is the better answer.',
    brief: 'Input: a sorted array of distinct positive integers and a k. Output: the k-th missing positive integer, computed in a single scan.',
    concepts: ['dsa-deficit-counting', 'dsa-single-pass-tracking', 'dsa-complexity-counting'],
    shortAnswer: 'Carry the previous value, spend each gap from k, and answer inside the gap where k finally fits.',
    idealAnswer:
      'The gap between consecutive present values is how many numbers are missing there, so walking the array and ' +
      'subtracting each gap from k locates the answer as soon as k fits inside the current gap: the previous value plus ' +
      'the remaining k. O(n) time and O(1) space, with no indexing requirement — which is exactly the property that ' +
      'makes it the right form when the data arrives as a stream or the array is short.',
    walkthrough:
      'Both forms compute the same deficit; one halves over it and one accumulates it, so the choice is about access ' +
      'rather than cleverness. A binary search needs random access and a settled bound, and neither exists for a cursor ' +
      'over a page of results — that is the situation where the linear pass is not the worse answer. The tail case is ' +
      'the same code path: after the last element the remaining k is just added.',
    commonMistake: 'Iterating every integer up to the answer, or subtracting a gap without first testing whether k fits in it.',
    whyWrong:
      'Counting over the number line costs the magnitude of the answer, which is unbounded in k, while this pass costs ' +
      'only the length of the input. Subtracting a gap that contains the answer steps past it, and the returned value ' +
      'is too large by precisely the amount that was consumed — a drift that grows with the array.',
    followUps: ['Which input shape makes the linear pass the right choice?', 'What is the answer when k outlasts the whole array?', 'Compare the two forms on the cost they charge for a large k.'],
    solution:
      'function kthMissingLinear(nums, k) {\n' +
      '  let previous = 0;\n' +
      '  for (const value of nums) {\n' +
      '    const gap = value - previous - 1;\n' +
      '    if (k <= gap) return previous + k;\n' +
      '    k -= gap;\n' +
      '    previous = value;\n' +
      '  }\n' +
      '  return previous + k;\n' +
      '}',
    modify: 'Stream the values from a cursor instead of an array and keep the answer correct at the end of the stream.',
  },
  {
    step: 4,
    name: 'Aggressive Cows',
    difficulty: 'Hard',
    topicSlug: SPACE,
    stem: 'Place the cows so the closest pair is as far apart as possible, and say which way the predicate points.',
    brief: 'Input: stall positions on a line and a cow count. Output: the largest minimum distance achievable when every cow occupies its own stall.',
    concepts: ['dsa-maximise-minimum', 'dsa-feasibility-scan', 'dsa-answer-range-search'],
    shortAnswer: 'Halve the spacing: a distance is feasible when a greedy left-to-right placement fits every cow, and feasibility only dies as it grows.',
    idealAnswer:
      'Sorting first turns the stalls into positions, and then the question is about a number rather than an index: the ' +
      'window runs from one spacing to the whole spread, because nothing wider than the endpoints is reachable. A ' +
      'spacing is feasible if walking the stalls and taking a cow whenever the gap since the last one clears the spacing ' +
      'seats them all. That predicate is monotone in the direction that matters — if a spacing works, every smaller one ' +
      'works — so the answer is the last feasible one, found in O(n log of the spread) after the sort.',
    walkthrough:
      'The row is the mirror image of the minimise-the-maximum family, and the place learners break it is the direction ' +
      'of the window. Here the true answers form a prefix of the range, so a feasible midpoint is recorded as the best ' +
      'so far and the search moves right; the capacity problems had their true answers as a suffix, so they moved left. ' +
      'The greedy placement is correct because taking the leftmost legal stall never costs anything: any solution that ' +
      'skips it can be shifted left without reducing any gap, so the count the scan returns is the most cows that ' +
      'spacing admits.',
    commonMistake: 'Searching the stall indices instead of the distance, or moving the window left on a feasible midpoint.',
    whyWrong:
      'An index window answers a different question — there is no position in the array holding the spacing — and the ' +
      'search then has nothing to compare against. Closing the window on success is the direction mistake that survives ' +
      'a hand check on a symmetric example and fails everything else: it converges on the smallest feasible spacing, ' +
      'which is one whenever the stalls are integers.',
    followUps: ['Why is the full spread a legal upper bound?', 'Which way do the true answers run, and how would you show it to someone who disagrees?', 'What changes if the stalls are already sorted, and what does that cost the row?'],
    solution:
      'function aggressiveCows(stalls, cows) {\n' +
      '  const a = [...stalls].sort((x, y) => x - y);\n' +
      '  const fits = (gap) => {\n' +
      '    let placed = 1;\n' +
      '    let last = a[0];\n' +
      '    for (let i = 1; i < a.length; i += 1) {\n' +
      '      if (a[i] - last >= gap) {\n' +
      '        placed += 1;\n' +
      '        last = a[i];\n' +
      '      }\n' +
      '    }\n' +
      '    return placed >= cows;\n' +
      '  };\n' +
      '  let lo = 1;\n' +
      '  let hi = a[a.length - 1] - a[0];\n' +
      '  let best = 0;\n' +
      '  while (lo <= hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (fits(mid)) {\n' +
      '      best = mid;\n' +
      '      lo = mid + 1;\n' +
      '    } else {\n' +
      '      hi = mid - 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Return the placement itself, not the spacing — how much of the scan has to survive into the answer?',
  },
  {
    step: 4,
    name: 'Book Allocation Problem',
    difficulty: 'Hard',
    topicSlug: SPACE,
    stem: 'Find the smallest page load a student can be held to, and check feasibility without rescanning the books.',
    brief: 'Input: page counts of books in shelf order and a student count. Output: the least maximum any one student can be given over a contiguous allocation, or -1 when there are more students than books.',
    concepts: ['dsa-partition-count', 'dsa-prefix-sum', 'dsa-upper-bound'],
    shortAnswer: 'Halve the page cap and count the students it needs by jumping each one to their last affordable book with a binary search over the prefix sums.',
    idealAnswer:
      'The cap cannot be below the largest single book and cannot need more than the whole shelf, so those two numbers ' +
      'bracket the answer. For a cap, the fewest students is found by repeatedly taking the furthest book the current '
      + 'student can hold, which is a search over the running totals rather than a scan: prefix sums make the jump ' +
      'logarithmic, so the count costs the number of students times that logarithm instead of the shelf length. The ' +
      'predicate is monotone because a larger cap can never force an extra hand-over, and the impossible case is the ' +
      'arithmetic check up front — fewer books than students leaves someone empty-handed.',
    walkthrough:
      'This is the same objective as the shipping and eating rows, chosen to be solved a second way: once the prefix ' +
      'sums exist, the feasibility check is no longer obliged to read every book, which is the difference between an ' +
      'answer that scales when the shelf is fixed and the cap is queried a thousand times and one that does not. The ' +
      'jump search has to be written as a search for the last affordable position, not the first unaffordable one, and ' +
      'that is where the boundary work is. Its lower bound is the student must always take at least one book, which ' +
      'holds precisely because the window starts at the largest single value.',
    commonMistake: 'Counting students by scanning the shelf inside every midpoint, or letting the jump land on the current book.',
    whyWrong:
      'The scan is correct but throws away the only reason to write this variant, and turns a per-query cost of the ' +
      'students into one of the shelf. A jump that can land where it started makes the outer loop never finish: that ' +
      'is what the lower bound at the largest book is guarding, and reading the search without the guard hides it.',
    followUps: ['Which two bounds does the cap live between, and what breaks outside them?', 'Why does a jump always move strictly forward?', 'Give the input where the prefix-sum form beats the scan by the largest factor.'],
    solution:
      'function allocateBooks(pages, students) {\n' +
      '  if (students > pages.length) return -1;\n' +
      '  const prefix = [0];\n' +
      '  for (const page of pages) prefix.push(prefix[prefix.length - 1] + page);\n' +
      '  const last = pages.length;\n' +
      '  const needed = (cap) => {\n' +
      '    let index = 0;\n' +
      '    let count = 0;\n' +
      '    while (index < last) {\n' +
      '      let lo = index + 1;\n' +
      '      let hi = last;\n' +
      '      while (lo < hi) {\n' +
      '        const mid = lo + Math.ceil((hi - lo) / 2);\n' +
      '        if (prefix[mid] - prefix[index] <= cap) lo = mid;\n' +
      '        else hi = mid - 1;\n' +
      '      }\n' +
      '      index = lo;\n' +
      '      count += 1;\n' +
      '      if (count > students) return count;\n' +
      '    }\n' +
      '    return count;\n' +
      '  };\n' +
      '  let lo = Math.max(...pages);\n' +
      '  let hi = prefix[last];\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (needed(mid) <= students) hi = mid;\n' +
      '    else lo = mid + 1;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Report the split points as book indices — which pass do you rerun once, and over what?',
  },
  {
    step: 4,
    name: 'Split Array - Largest Sum',
    difficulty: 'Hard',
    topicSlug: SPACE,
    stem: 'Prove that filling each part to its cap is the fewest parts that cap allows.',
    brief: 'Input: an array of non-negative integers and a part count. Output: the smallest possible largest part sum when the array is cut into that many contiguous parts.',
    concepts: ['dsa-partition-count', 'dsa-answer-range-search', 'dsa-minimize-maximum'],
    shortAnswer: 'Halve the cap, count the parts a greedy fill needs, and take the first cap the count fits inside.',
    idealAnswer:
      'A cap below the largest element cannot be satisfied and the total needs only one part, so the answer lives ' +
      'between them. For a fixed cap the greedy scan that keeps loading until the next element would overflow produces ' +
      'the fewest parts that cap permits, because the order is fixed and no legal cut can start a part earlier than the ' +
      'greedy one without leaving more for its successor. The needed count never rises as the cap grows, so the first ' +
      'cap admitting the part limit is the answer, at linear work per halving.',
    walkthrough:
      'The exchange argument is the graded part of this row, not the loop. Suppose an optimal loading closes a part ' +
      'before the greedy one does; moving that boundary rightward cannot increase either side beyond the cap, so the ' +
      'greedy boundary is at least as good and the count it reports is minimal. Once that is settled the outer search ' +
      'is routine, which is why the row is worth doing exactly once: it is the shape underneath the books, the painters ' +
      'and the shipping machines, and each of those only renames the parts.',
    commonMistake: 'Searching for the cut positions directly, or starting the cap at the average part sum.',
    whyWrong:
      'Cut positions are not monotone in a way a window can exploit, so the search has no predicate to halve on and ' +
      'collapses into enumerating combinations. The average is not a lower bound on the maximum — a single element can ' +
      'tower over it — and starting there returns caps that cannot hold the array at all.',
    followUps: ['State the exchange step in one sentence. Which property of the input does it need?', 'What does the answer become when the part count equals the length?', 'Where would the argument fail if negative values were allowed?'],
    solution:
      'function splitArray(nums, parts) {\n' +
      '  const needed = (cap) => {\n' +
      '    let count = 1;\n' +
      '    let load = 0;\n' +
      '    for (const value of nums) {\n' +
      '      if (load + value > cap) {\n' +
      '        count += 1;\n' +
      '        load = 0;\n' +
      '      }\n' +
      '      load += value;\n' +
      '    }\n' +
      '    return count;\n' +
      '  };\n' +
      '  let lo = Math.max(...nums);\n' +
      '  let hi = nums.reduce((total, value) => total + value, 0);\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    if (needed(mid) <= parts) hi = mid;\n' +
      '    else lo = mid + 1;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Return one optimal set of cut indices and show the greedy scan that produced them.',
  },
  {
    step: 4,
    name: "Painter's Partition Problem",
    difficulty: 'Hard',
    topicSlug: SPACE,
    stem: 'Solve the partition objective by search over cut points, and name the input the monotone predicate cannot handle.',
    brief: 'Input: board lengths and a painter count, each painter taking a contiguous run and at least one board. Output: the minimum makespan, i.e. the largest total any painter carries.',
    concepts: ['dsa-divide-and-conquer', 'dsa-partition-count', 'dsa-memoization'],
    shortAnswer: 'Enumerate where the first painter stops and recurse on the rest, keeping the best worst-case; the memo turns the exponential tree into painters times cut points.',
    idealAnswer:
      'The first painter can stop anywhere from the first board to the position leaving one board per remaining painter, ' +
      'and for each stop the makespan is the larger of their load and the optimal makespan of the rest. That is a ' +
      'recurrence over a start position and a painter count with painters times length states and length transitions, ' +
      'so the memo form costs the product of those — comfortably more than the search on the cap, which is the right ' +
      'answer here. It is worth writing because it stays correct when the values stop being non-negative, and the ' +
      'greedy count that licenses the search is exactly the part that fails then.',
    walkthrough:
      'Two answers to one objective, and the difference is what each assumes. The search assumes that a bigger cap can ' +
      'never need more painters, which is true while a running load only grows; a negative board breaks the monotone ' +
      'fill, so the search returns a confident number that no assignment realises. The recurrence assumes nothing about ' +
      'sign, only that the last decision is where to cut, and pays for that generality with a factor of the length. ' +
      'Naming the assumption is the point of the row: it is the same distinction as between a prefix-sum trick that ' +
      'needs positivity and a segment tree that does not.',
    commonMistake: 'Cutting only between whole painters, or trusting the greedy search on boards that can be negative.',
    whyWrong:
      'Fixing whole painters at a time is a different, wrong problem: painters are indistinguishable but their runs are ' +
      'not, so the cut position is the state. Reusing the cap search on signed values keeps a predicate that no longer ' +
      'holds, and the failure is silent because the loop still terminates and still prints a number.',
    followUps: ['What is the state, and what is the transition?', 'Which assumption of the greedy fill does a negative board break?', 'Cost the memo form against the search and say when you would still choose the search.'],
    solution:
      'function painterMinutes(boards, painters) {\n' +
      '  const n = boards.length;\n' +
      '  const suffix = new Array(n + 1).fill(0);\n' +
      '  for (let i = n - 1; i >= 0; i -= 1) suffix[i] = suffix[i + 1] + boards[i];\n' +
      '  const memo = new Map();\n' +
      '  const solve = (start, people) => {\n' +
      '    if (people === 1) return suffix[start];\n' +
      '    if (n - start <= people) {\n' +
      '      let alone = boards[start];\n' +
      '      for (let i = start; i < n; i += 1) alone = Math.max(alone, boards[i]);\n' +
      '      return alone;\n' +
      '    }\n' +
      '    const key = start + ":" + people;\n' +
      '    if (memo.has(key)) return memo.get(key);\n' +
      '    let best = Infinity;\n' +
      '    let load = 0;\n' +
      '    for (let i = start; i <= n - people; i += 1) {\n' +
      '      load += boards[i];\n' +
      '      const rest = solve(i + 1, people - 1);\n' +
      '      best = Math.min(best, Math.max(load, rest));\n' +
      '    }\n' +
      '    memo.set(key, best);\n' +
      '    return best;\n' +
      '  };\n' +
      '  return solve(0, painters);\n' +
      '}',
    modify: 'Add a fourth painter without changing the boards: does the makespan drop, and by how much at most?',
  },
  {
    step: 4,
    name: 'Minimize Max Distance to Gas Station',
    difficulty: 'Hard',
    topicSlug: SPACE,
    stem: 'Bisect a real distance to a tolerance and count the stations each gap demands.',
    brief: 'Input: station positions on a highway and a budget of new stations. Output: the smallest achievable largest distance between neighbours, as a real number.',
    concepts: ['dsa-real-valued-bisection', 'dsa-answer-range-search', 'dsa-minimize-maximum'],
    shortAnswer: 'Halve the distance until the window is negligible; a distance is feasible when the stations every gap demands sum to at most the budget.',
    idealAnswer:
      'A gap of length L split into pieces of at most d costs the ceiling of L over d minus one new stations, which is ' +
      'the whole feasibility check and is monotone: a wider allowed distance never asks for more stations. The answer is ' +
      'a real number, so there is no index to exit on — the window runs from zero to the largest existing gap and the ' +
      'loop is given a fixed iteration budget sized so that the remaining width cannot change the rounded output.',
    walkthrough:
      'Nothing here is an integer, and that changes two habits at once. The stopping rule is arithmetic rather than a ' +
      'comparison of lo and hi, because the loop would otherwise run until the doubles stopped being distinguishable; ' +
      'sixty halvings of a range of one hundred million is well inside the exact window and cheaper than reasoning ' +
      'about an epsilon. And the returned value is the upper edge of the final window, never the midpoint, because the ' +
      'upper edge is the side known to be feasible.',
    commonMistake: 'Looping while the window is wider than a tolerance, or charging a fractional station per gap.',
    whyWrong:
      'A tolerance test on the window is fine in principle and fiddly in practice: the bound has to be smaller than the ' +
      'precision the caller reads, and getting it wrong is a silent truncation of the answer. Rounding the demand down ' +
      'instead of taking the ceiling calls gaps feasible that the budget cannot actually cover, so the search reports a ' +
      'distance too small to build.',
    followUps: ['Why is the largest existing gap the whole upper bound?', 'Which edge of the final window do you return, and why that one?', 'Give the heap-based alternative and cost it against this search.'],
    solution:
      'function minMaxDistance(stations, budget) {\n' +
      '  const a = [...stations].sort((x, y) => x - y);\n' +
      '  const gaps = [];\n' +
      '  let hi = 0;\n' +
      '  for (let i = 1; i < a.length; i += 1) {\n' +
      '    const gap = a[i] - a[i - 1];\n' +
      '    gaps.push(gap);\n' +
      '    if (gap > hi) hi = gap;\n' +
      '  }\n' +
      '  const demanded = (distance) => {\n' +
      '    let count = 0;\n' +
      '    for (const gap of gaps) count += Math.ceil(gap / distance) - 1;\n' +
      '    return count;\n' +
      '  };\n' +
      '  let lo = 0;\n' +
      '  for (let step = 0; step < 60; step += 1) {\n' +
      '    const mid = (lo + hi) / 2;\n' +
      '    if (demanded(mid) <= budget) hi = mid;\n' +
      '    else lo = mid;\n' +
      '  }\n' +
      '  return hi;\n' +
      '}',
    modify: 'Return the positions of the new stations for the chosen distance — which part of the check becomes a generator?',
  },
  {
    step: 4,
    name: 'Median of 2 Sorted Arrays of Different Sizes',
    difficulty: 'Hard',
    topicSlug: SPACE,
    stem: 'Cut the shorter array so the two left halves are the lower median, and search only one of them.',
    brief: 'Input: two sorted arrays of different lengths. Output: the median of the union, in logarithmic time in the shorter array.',
    concepts: ['dsa-split-invariant', 'dsa-answer-range-search', 'dsa-boundary-conditions'],
    shortAnswer: 'Binary search the split point of the shorter array; the other split follows, and the split is right when the left maxima do not exceed the right minima.',
    idealAnswer:
      'A median is a partition of the merged sequence into a lower half and an upper half of matching size, so it is ' +
      'enough to choose how many elements the first array contributes to the lower half — the second then contributes ' +
      'the remainder, which is why only one array is searched. Searching the shorter one keeps the window logarithmic ' +
      'in min of the two lengths, and it is what lets the partner index stay inside bounds. The test on a candidate ' +
      'split is two comparisons between the boundary elements, with infinities standing in for the ends of a half that ' +
      'a split leaves empty.',
    walkthrough:
      'The halves are correct as soon as every element on the left is at most every element on the right, and since each ' +
      'array is sorted that reduces to the two cross comparisons — which is why the row has an answer at all rather ' +
      'than needing a merge. Reading the split as a count instead of an index is the step people cannot justify: an ' +
      'empty left half is legal and has no last element, hence the sentinels, and the parity of the total decides ' +
      'whether the second-largest left element is also needed.',
    commonMistake: 'Searching the longer array, or treating the split as an element index rather than a count.',
    whyWrong:
      'Searching the longer array costs a logarithm in the wrong operand and, worse, can ask the shorter one for a ' +
      'partner index outside its bounds, which is the crash rather than a slow answer. An index-shaped split cannot ' +
      'represent contributing nothing, and the case where the answer lies entirely in one array is exactly the one that ' +
      'then reads off the end.',
    followUps: ['Why does one comparison per side prove the whole partition?', 'What do the sentinels stand for, and which two splits need them?', 'Adapt the same search to the kth smallest element: what changes in the target half-size?'],
    solution:
      'function medianOfTwo(a, b) {\n' +
      '  if (a.length > b.length) return medianOfTwo(b, a);\n' +
      '  const n = a.length;\n' +
      '  const m = b.length;\n' +
      '  const half = Math.floor((n + m + 1) / 2);\n' +
      '  let lo = 0;\n' +
      '  let hi = n;\n' +
      '  while (lo <= hi) {\n' +
      '    const i = lo + Math.floor((hi - lo) / 2);\n' +
      '    const j = half - i;\n' +
      '    const leftA = i === 0 ? -Infinity : a[i - 1];\n' +
      '    const rightA = i === n ? Infinity : a[i];\n' +
      '    const leftB = j === 0 ? -Infinity : b[j - 1];\n' +
      '    const rightB = j === m ? Infinity : b[j];\n' +
      '    if (leftA <= rightB && leftB <= rightA) {\n' +
      '      if ((n + m) % 2 === 1) return Math.max(leftA, leftB);\n' +
      '      return (Math.max(leftA, leftB) + Math.min(rightA, rightB)) / 2;\n' +
      '    }\n' +
      '    if (leftA > rightB) hi = i - 1;\n' +
      '    else lo = i + 1;\n' +
      '  }\n' +
      '  return NaN;\n' +
      '}',
    modify: 'Return the kth smallest instead of the median — which single line carries the change?',
  },
  {
    step: 4,
    name: 'Median of two sorted arrays of different sizes',
    difficulty: 'Hard',
    topicSlug: SPACE,
    stem: 'Get the same median by walking the merge, and say what the search form was buying.',
    brief: 'Input: two sorted arrays, at least one non-empty. Output: their median, computed by a single linear walk without building the merged array.',
    concepts: ['dsa-sorted-merge', 'dsa-boundary-conditions', 'dsa-complexity-counting'],
    shortAnswer: 'Advance the merge only as far as the middle, keeping the previous element so an even total can average the pair.',
    idealAnswer:
      'The median sits at one or two positions in the merged order, so walking the merge to that depth answers the ' +
      'question in linear time and constant space, with no array ever built. The carrying detail is that an even total ' +
      'needs the element before the middle as well, which is why the loop runs to the middle index inclusive and holds ' +
      'both values. Exhausting one array is not a special case in this shape: the comparison falls through to whichever ' +
      'array still has elements, so the shorter one never needs a sentinel.',
    walkthrough:
      'The pair of rows exists because the two answers trade different things. The partition search costs a logarithm ' +
      'in the shorter array and demands the split reasoning; the walk costs the sum of the lengths and is correct in a ' +
      'dozen lines that a reviewer can read once. On two arrays of a few thousand elements the walk is the better ' +
      'engineering answer, and on two arrays of a hundred million it is not, which is the whole of the argument. The ' +
      'walk also generalises to inputs that arrive as iterators, where random access — and with it the search — is not ' +
      'available at all.',
    commonMistake: 'Materialising the merged array to index the middle, or stopping one step early on an even total.',
    whyWrong:
      'Building the merge costs the total length in memory to answer a question about two elements, forfeiting the only ' +
      'advantage this form has over the naive sort. Stopping at the middle index alone leaves the previous element ' +
      'unset and reports the upper middle as the median, which is off by half a step on exactly the inputs where the ' +
      'total is even.',
    followUps: ['What does the walk cost that the search does not?', 'Which input shapes make the linear form the right engineering call?', 'Extend it to the lower and upper medians separately: how much of the loop changes?'],
    solution:
      'function medianByMergeWalk(a, b) {\n' +
      '  const total = a.length + b.length;\n' +
      '  const target = Math.floor(total / 2);\n' +
      '  let i = 0;\n' +
      '  let j = 0;\n' +
      '  let previous = 0;\n' +
      '  let current = 0;\n' +
      '  for (let step = 0; step <= target; step += 1) {\n' +
      '    previous = current;\n' +
      '    if (i < a.length && (j >= b.length || a[i] <= b[j])) {\n' +
      '      current = a[i];\n' +
      '      i += 1;\n' +
      '    } else {\n' +
      '      current = b[j];\n' +
      '      j += 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return total % 2 === 1 ? current : (previous + current) / 2;\n' +
      '}',
    modify: 'Make it answer the kth smallest for many k values in one pass — what do you keep between queries?',
  },
  {
    step: 4,
    name: 'Kth Element of two sorted arrays',
    difficulty: 'Medium',
    topicSlug: SPACE,
    stem: 'Find the kth smallest across two sorted arrays by discarding half the remaining rank at a time.',
    brief: 'Input: two sorted arrays and a k between one and their combined length. Output: the kth smallest element of the union, counted with multiplicity.',
    concepts: ['dsa-k-elimination', 'dsa-answer-range-search', 'dsa-boundary-conditions'],
    shortAnswer: 'Probe half of k in each array and discard the smaller probe side: its whole prefix is too small to be the answer.',
    idealAnswer:
      'Compare the elements sitting half the remaining rank into each array. Everything up to and including the smaller ' +
      'of the two probes is beaten by at least that many elements on the other side, so it cannot reach the kth place ' +
      'and leaves the window along with the same count of rank. Each step halves what is left of k, so the walk costs a ' +
      'logarithm, and an exhausted array is answered directly rather than by padding it with sentinels.',
    walkthrough:
      'The elimination is the general shape behind finding the kth of several sorted sequences, which is why it is ' +
      'worth separating from the median split: the split argument needs the total half-size and this one only needs ' +
      'that the discarded prefix is short. Clamping the probe to the end of a short array is the boundary that decides ' +
      'whether the code is correct — probing past the end has to be read as an element larger than anything available, ' +
      'which sends the step to the other array, and both probes cannot be out of range at once because the remaining ' +
      'elements still have to cover the rank being asked for.',
    commonMistake: 'Discarding from both arrays each step, or comparing only the heads of the two arrays.',
    whyWrong:
      'Removing from both halves the rank twice as fast as the elements justify, so the answer is overshot by the ' +
      'difference and the bug grows with k. A head-to-head comparison is the merge one element at a time: correct, and ' +
      'charged at the rank rather than its logarithm, which is the cost the row exists to avoid.',
    followUps: ['Why can both probes never be out of range?', 'What is the invariant linking left and the unexplored tails?', 'Give the version for m sorted arrays and cost it.'],
    solution:
      'function kthInTwo(a, b, k) {\n' +
      '  let i = 0;\n' +
      '  let j = 0;\n' +
      '  let left = k;\n' +
      '  for (;;) {\n' +
      '    if (i >= a.length) return b[j + left - 1];\n' +
      '    if (j >= b.length) return a[i + left - 1];\n' +
      '    if (left === 1) return Math.min(a[i], b[j]);\n' +
      '    const half = Math.floor(left / 2);\n' +
      '    const aProbe = i + half - 1;\n' +
      '    const bProbe = j + half - 1;\n' +
      '    const aVal = aProbe < a.length ? a[aProbe] : Infinity;\n' +
      '    const bVal = bProbe < b.length ? b[bProbe] : Infinity;\n' +
      '    if (aVal <= bVal) i += half;\n' +
      '    else j += half;\n' +
      '    left -= half;\n' +
      '  }\n' +
      '}',
    modify: 'Return the kth largest instead, without reversing either array — which probes move?',
  },
  {
    step: 4,
    name: "Find the row with maximum number of 1's",
    difficulty: 'Medium',
    topicSlug: SEARCH,
    stem: 'Report the topmost row holding the most 1s, and read each row without counting its zeros.',
    brief: 'Input: a matrix of 0s and 1s whose rows are sorted ascending. Output: the index of the row with the greatest number of 1s, or -1 when there are none.',
    concepts: ['dsa-lower-bound', 'dsa-first-occurrence', 'dsa-complexity-counting'],
    shortAnswer: 'One binary search per row for the first 1 turns its length minus that index into the count; keep the strict best.',
    idealAnswer:
      'A sorted binary row is fully described by the position of its first 1, so the count is the length minus that ' +
      'index and costs a logarithm instead of the row. Walking the rows and keeping the running best gives the linear ' +
      'number of searches times the logarithm of the width. Ties want a strict comparison, because the ask is the ' +
      'topmost row, and an all-zero row is the same arithmetic returning zero rather than a special case.',
    walkthrough:
      'The lower bound is the whole technique, and writing it as a count-up loop is what the row is testing: the shape ' +
      'stays O(rows times columns) and looks as though it were optimised. A strict better-than keeps the earliest row ' +
      'when two tie, which is the convention the sheet expects and the one that silently flips if the comparison ' +
      'becomes non-strict. The empty matrix falls out of the same code as -1 because no row ever beats a count of zero.',
    commonMistake: 'Counting 1s by scanning each row, or using a greater-than-or-equal test for the best row.',
    whyWrong:
      'The scan forfeits the only property the input offers, and on a wide matrix it is the difference between a row ' +
      'costing its logarithm and its length. A non-strict comparison answers with the last row among ties, which is a ' +
      'wrong index on the first matrix where two rows match — the commonest shape a test fixture happens to have.',
    followUps: ['What does the found index mean on a row of all zeros, and on a row of all ones?', 'Which comparison decides the tie, and what would the caller expect instead?', 'Can you beat rows times log columns when every row has the same length?'],
    solution:
      'function rowWithMostOnes(matrix) {\n' +
      '  let best = -1;\n' +
      '  let bestCount = 0;\n' +
      '  for (let row = 0; row < matrix.length; row += 1) {\n' +
      '    const cells = matrix[row];\n' +
      '    let lo = 0;\n' +
      '    let hi = cells.length;\n' +
      '    while (lo < hi) {\n' +
      '      const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '      if (cells[mid] === 1) hi = mid;\n' +
      '      else lo = mid + 1;\n' +
      '    }\n' +
      '    const ones = cells.length - lo;\n' +
      '    if (ones > bestCount) {\n' +
      '      bestCount = ones;\n' +
      '      best = row;\n' +
      '    }\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Return every row tied for the most 1s — does the strict comparison still cost anything?',
  },
  {
    step: 4,
    name: 'Search in a 2D Matrix',
    difficulty: 'Medium',
    topicSlug: SEARCH,
    stem: 'Search a row-major matrix as one sorted sequence without copying it into memory.',
    brief: 'Input: a matrix whose rows are sorted and whose first element exceeds the previous row last element, plus a target. Output: whether the target occurs.',
    concepts: ['dsa-flattened-index-mapping', 'dsa-binary-search-window', 'dsa-boundary-conditions'],
    shortAnswer: 'Halve the flat cell range and read each midpoint as row mid over columns, column mid modulo columns.',
    idealAnswer:
      'The stated ordering makes the cells one sorted sequence laid out in rows, so the window is the range of cell ' +
      'numbers rather than an index into any array, and a midpoint becomes a pair of subscripts by division and ' +
      'modulus. That is the whole trick: no flattening pass, no extra memory, and a logarithm in rows times columns. ' +
      'The arithmetic depends on a rectangular matrix, which is the assumption worth stating before the code is read.',
    walkthrough:
      'Two search shapes are in play across this band and they are not interchangeable. Flattening with one index is ' +
      'right only when the rows join into a single increasing sequence; the staircase row below is right when they do ' +
      'not, and it costs the sum of the dimensions instead of their product under a logarithm. Getting the subscript ' +
      'order backwards — dividing by the row count, say — is invisible on a square matrix and wrong on every other one, ' +
      'so it is worth testing on a tall example.',
    commonMistake: 'Materialising a flattened array first, or dividing the midpoint by the number of rows.',
    whyWrong:
      'The copy costs the size of the matrix in time and space to save nothing the search did not already have, and it ' +
      'is the answer the row exists to avoid. Division by the row count gives subscripts outside the matrix on any ' +
      'non-square input, and on a square one it walks the transpose, so a miss is reported as a hit only when the ' +
      'target happens to sit symmetrically.',
    followUps: ['Which property of the rows licenses a single window?', 'What does the mapping become for a column-major layout?', 'Why can the staircase search not be used on this input, and vice versa?'],
    solution:
      'function searchMatrix(matrix, target) {\n' +
      '  if (matrix.length === 0 || matrix[0].length === 0) return false;\n' +
      '  const cols = matrix[0].length;\n' +
      '  let lo = 0;\n' +
      '  let hi = matrix.length * cols - 1;\n' +
      '  while (lo <= hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    const value = matrix[Math.floor(mid / cols)][mid % cols];\n' +
      '    if (value === target) return true;\n' +
      '    if (value < target) lo = mid + 1;\n' +
      '    else hi = mid - 1;\n' +
      '  }\n' +
      '  return false;\n' +
      '}',
    modify: 'Return the cell coordinates instead of a boolean — which two lines change, and what do they answer when the target is absent?',
  },
  {
    step: 4,
    name: 'Search in a Row and Column-wise Sorted Matrix',
    difficulty: 'Medium',
    topicSlug: SEARCH,
    stem: 'Search a matrix that is sorted along rows and columns but not across them, and account for the work you delete per step.',
    brief: 'Input: a matrix increasing left to right and top to bottom, not necessarily row-major sorted. Output: whether a target occurs.',
    concepts: ['dsa-saddle-descent', 'dsa-boundary-shrink', 'dsa-complexity-counting'],
    shortAnswer: 'Walk from the top-right corner: a cell too big eliminates its column, a cell too small eliminates its row.',
    idealAnswer:
      'The top-right cell is the largest in its row and the smallest in its column, so it decides something: if it ' +
      'exceeds the target then everything below it in that column does too and the column goes, and if it falls short ' +
      'then everything left of it in that row does too and the row goes. Each step deletes a whole line and the walk ' +
      'only ever moves down or left, so it terminates in at most the rows plus the columns steps with no recursion and ' +
      'no extra memory.',
    walkthrough:
      'A corner where the two directions disagree is the only starting point that works, and that is why the top-right ' +
      'or its mirror at the bottom-left is chosen: from the top-left a cell larger than the target says nothing, ' +
      'because its neighbours are larger still and the smaller ones are behind it. The row-major search above cannot be ' +
      'used here because a row boundary is not an ordering boundary in this input — the flattening form is the one that ' +
      'silently returns a false negative.',
    commonMistake: 'Flattening and halving as though the rows joined into one sequence, or starting from the top-left corner.',
    whyWrong:
      'A staircase matrix can have a later row starting below an earlier row ending, so the single window skips over ' +
      'the target and reports absence with total confidence. From the top-left every comparison is between two larger ' +
      'neighbours and neither direction can be eliminated, which turns the walk into a branching search over the whole ' +
      'matrix.',
    followUps: ['Why must the start be a corner rather than an edge midpoint?', 'Which two cells are symmetric choices and why?', 'Give the input where the walk takes its full rows-plus-columns steps.'],
    solution:
      'function searchSaddle(matrix, target) {\n' +
      '  if (matrix.length === 0 || matrix[0].length === 0) return false;\n' +
      '  let row = 0;\n' +
      '  let col = matrix[0].length - 1;\n' +
      '  while (row < matrix.length && col >= 0) {\n' +
      '    const value = matrix[row][col];\n' +
      '    if (value === target) return true;\n' +
      '    if (value > target) col -= 1;\n' +
      '    else row += 1;\n' +
      '  }\n' +
      '  return false;\n' +
      '}',
    modify: 'Count the occurrences of the target instead of reporting presence — which move becomes ambiguous, and how do you resolve it?',
  },
  {
    step: 4,
    name: 'Find Peak Element (2D Matrix)',
    difficulty: 'Medium',
    topicSlug: SEARCH,
    stem: 'Return coordinates of any 2D peak by halving columns, and say why the greedy ascent is the fallback.',
    brief: 'Input: a matrix with distinct adjacent values, whose outside is conceptually negative infinity. Output: the row and column of a cell greater than its four neighbours.',
    concepts: ['dsa-column-extreme-climb', 'dsa-peak-gradient', 'dsa-search-exit-index'],
    shortAnswer: 'Halve the columns, take the tallest cell in the middle one, and step toward whichever horizontal neighbour is larger.',
    idealAnswer:
      'Fixing the tallest cell of a column removes the vertical direction from the argument: whatever the row of that ' +
      'cell is, it already beats both of its vertical neighbours. So the only comparison that can be declined is ' +
      'horizontal, and the half holding the larger neighbour must contain a peak — a walk uphill from inside that half ' +
      'can neither leave it nor run off the edge. Halving columns therefore keeps the invariant that an answer is in ' +
      'the window, at the height of the matrix per step.',
    walkthrough:
      'The reason a peak exists at all is that an ascent from any cell strictly increases the value and cannot continue ' +
      'forever, which is also why the greedy climb up and down works and costs the product instead. What makes the ' +
      'column version correct is that the maximum of the final column beats every cell in it, so it only has to be ' +
      'checked sideways — and the step that ended the loop already settled the remaining open side, which is why no ' +
      'third comparison is needed. The distinctness of adjacent values is what keeps the answer unique enough to not ' +
      'matter.',
    commonMistake: 'Climbing to the first local maximum found by scanning, or comparing the middle cell of a column rather than its maximum.',
    whyWrong:
      'A scan finds a correct answer and forfeits the search entirely, which is the row. Choosing the middle cell of a ' +
      'column leaves the vertical direction undecided, so the half you keep may have an edge cell taller than anything ' +
      'inside it and the descent can leave the window — the case where the code returns a cell that is not a peak.',
    followUps: ['Why does the column maximum make the vertical comparisons free?', 'Which side of the final column still needs checking, and why only one?', 'Give a matrix where the greedy climb stops far from the tallest peak.'],
    solution:
      'function peakInMatrix(matrix) {\n' +
      '  const tallestIn = (col) => {\n' +
      '    let bestRow = 0;\n' +
      '    for (let row = 1; row < matrix.length; row += 1) {\n' +
      '      if (matrix[row][col] > matrix[bestRow][col]) bestRow = row;\n' +
      '    }\n' +
      '    return bestRow;\n' +
      '  };\n' +
      '  let lo = 0;\n' +
      '  let hi = matrix[0].length - 1;\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    const row = tallestIn(mid);\n' +
      '    if (matrix[row][mid] < matrix[row][mid + 1]) lo = mid + 1;\n' +
      '    else hi = mid;\n' +
      '  }\n' +
      '  return [tallestIn(lo), lo];\n' +
      '}',
    modify: 'Drop the distinctness assumption: what does the comparison do when the neighbour ties the column maximum?',
  },
  {
    step: 4,
    name: 'Matrix Median',
    difficulty: 'Hard',
    topicSlug: SEARCH,
    stem: 'Find the median of a matrix of sorted rows by counting, and explain why no merge appears.',
    brief: 'Input: a matrix with rows sorted ascending. Output: the element whose rank is the floor of half the cell count plus one.',
    concepts: ['dsa-count-at-most', 'dsa-answer-range-search', 'dsa-upper-bound'],
    shortAnswer: 'Halve the value range and count how many cells are at most the midpoint with one upper bound per row.',
    idealAnswer:
      'The median is the smallest value with at least the middle rank of cells at or below it, and that predicate is ' +
      'monotone in the value, so the window is the range between the matrix minima and maxima rather than any index. A ' +
      'sorted row contributes its upper bound count in a logarithm, making the check cost the rows times that ' +
      'logarithm and the whole search the width of the value range in halvings on top — no merge, and nothing built in ' +
      'proportion to the cell count beyond the input itself.',
    walkthrough:
      'Counting replaces ordering: the question is how many cells a candidate beats, not where they sit, and a rank ' +
      'question over sorted runs always answers that way. The bounds of the window are read from the rows rather than ' +
      'invented, which is the same discipline as the rate problems — and the rank is stated as at-least rather than ' +
      'exactly-equal, because a value repeated across the matrix makes an equality target unsatisfiable and the search ' +
      'would run off the range.',
    commonMistake: 'Merging all rows to take the middle, or searching for the value whose count equals the rank.',
    whyWrong:
      'The merge costs the cell count in time and again in space, and the row order is exactly the structure that makes ' +
      'counting cheap. An equality predicate is skipped entirely by any repeated value, so the window closes past the ' +
      'answer and the search returns a boundary that is not even a cell of the matrix.',
    followUps: ['Why is the predicate at-least rather than equal?', 'What are the two legal bounds of the value window, and where do they come from?', 'Cost this against the heap form that returns the k smallest.'],
    solution:
      'function matrixMedian(matrix) {\n' +
      '  let lo = Infinity;\n' +
      '  let hi = -Infinity;\n' +
      '  for (const cells of matrix) {\n' +
      '    if (cells[0] < lo) lo = cells[0];\n' +
      '    if (cells[cells.length - 1] > hi) hi = cells[cells.length - 1];\n' +
      '  }\n' +
      '  const total = matrix.length * matrix[0].length;\n' +
      '  const target = Math.floor(total / 2) + 1;\n' +
      '  const atMost = (value, cells) => {\n' +
      '    let left = 0;\n' +
      '    let right = cells.length;\n' +
      '    while (left < right) {\n' +
      '      const mid = left + Math.floor((right - left) / 2);\n' +
      '      if (cells[mid] <= value) left = mid + 1;\n' +
      '      else right = mid;\n' +
      '    }\n' +
      '    return left;\n' +
      '  };\n' +
      '  while (lo < hi) {\n' +
      '    const mid = lo + Math.floor((hi - lo) / 2);\n' +
      '    let count = 0;\n' +
      '    for (const cells of matrix) count += atMost(mid, cells);\n' +
      '    if (count >= target) hi = mid;\n' +
      '    else lo = mid + 1;\n' +
      '  }\n' +
      '  return lo;\n' +
      '}',
    modify: 'Return the kth smallest for any k rather than the median — which single number becomes an argument?',
  },
  {
    step: 5,
    name: 'Remove Outermost Parentheses',
    difficulty: 'Easy',
    topicSlug: STRINGS,
    stem: 'Strip the enclosing pair from each primitive group and say what the counter has to be before you emit.',
    brief: 'Input: a balanced string of parentheses. Output: the same string with the outermost pair of every primitive group removed.',
    concepts: ['dsa-parenthesis-depth', 'dsa-single-pass-tracking', 'dsa-boundary-conditions'],
    shortAnswer: 'Keep one depth counter and emit a bracket only while the counter says it is not the group boundary.',
    idealAnswer:
      'A primitive group opens at depth zero and closes back to it, so the outermost brackets are exactly the ones seen ' +
      'while the counter is about to leave or return from zero. Comparing the depth before an open and after a close ' +
      'against one marks every other bracket for emission, which is a single pass with one integer and one output ' +
      'builder. A stack would answer the same question at the same cost in time and forgo the point of the row: nothing ' +
      'here needs to be remembered beyond the count.',
    walkthrough:
      'The asymmetry is in the order of the increment and the test. An opening bracket raises the depth first, so a ' +
      'depth above one after that means it is enclosed by something; a closing bracket lowers it last, so a depth above ' +
      'one before that means the same. Writing both tests on the same side of the update is the mistake the row is ' +
      'built to expose, because it is correct on a single group and drops or duplicates the boundary of every later ' +
      'one.',
    commonMistake: 'Splitting on adjacent pairs, or testing the depth the same way for both brackets.',
    whyWrong:
      'A textual split cannot see nesting: it removes the wrong pair from a group that is itself inside another and ' +
      'leaves the outermost bracket of the last group in place. One symmetric test reads the open and the close from ' +
      'opposite sides of their update, so the output gains a bracket at every group boundary it should have deleted.',
    followUps: ['Which side of the counter update does each bracket test, and why do they differ?', 'What does the same counter report about the input being balanced?', 'Give the version that removes only the outermost pair of the whole string.'],
    solution:
      'function removeOutermostParens(text) {\n' +
      '  let out = "";\n' +
      '  let depth = 0;\n' +
      '  for (const char of text) {\n' +
      '    if (char === "(") {\n' +
      '      depth += 1;\n' +
      '      if (depth > 1) out += char;\n' +
      '    } else if (char === ")") {\n' +
      '      if (depth > 1) out += char;\n' +
      '      depth -= 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify: 'Report the number of primitive groups in the input — which line of the counter do you keep?',
  },
  {
    step: 5,
    name: 'Reverse Words in a String',
    difficulty: 'Medium',
    topicSlug: STRINGS,
    stem: 'Reverse the word order while collapsing runs of spaces, and do it without a regular expression.',
    brief: 'Input: a string with words separated by arbitrary runs of spaces, possibly padded. Output: the words in reverse order joined by exactly one space.',
    concepts: ['dsa-reversal-trick', 'dsa-two-pointer', 'dsa-write-index'],
    shortAnswer: 'Skip spaces, take a word, then reverse the collected words in place and join with a single separator.',
    idealAnswer:
      'Two cursors over the text do the tokenising: one skips runs of spaces, the other walks to the next space, and the ' +
      'slice between them is a word — which is also how padding and repeated separators disappear without a filter ' +
      'step. Reversing the word list is the ordinary mirror walk, and the join then writes exactly one space because ' +
      'the words were never stored with their separators. The whole thing is linear in the text and costs the words it ' +
      'produces, which is the minimum for a string answer.',
    walkthrough:
      'Splitting on a space and filtering empty strings is the shape most people reach for, and it is correct here; the ' +
      'row is worth doing anyway because the cursor version is what a stream or a character buffer forces on you, and ' +
      'because it makes the two jobs explicit — tokenise, then reorder — instead of hiding both in a pipeline. The ' +
      'boundary worth naming is a string of only spaces, which yields no words and therefore an empty answer rather ' +
      'than a single space.',
    commonMistake: 'Reversing the characters of the whole string and then fixing the words, or trimming before splitting.',
    whyWrong:
      'The two-pass reversal is the right move for an in-place array of characters and a complication for a JavaScript ' +
      'string, where every rewrite copies: it costs more than the mirror walk it was meant to replace. Trimming handles ' +
      'the padding but not the interior runs, so the answer comes back with double spaces in the middle of an otherwise ' +
      'correct line.',
    followUps: ['What do the two cursors each guarantee about the slice between them?', 'Which input makes a split-and-filter version need an extra pass?', 'Give the version that reverses one word at a time and keeps the order.'],
    solution:
      'function reverseWords(text) {\n' +
      '  const words = [];\n' +
      '  let index = 0;\n' +
      '  while (index < text.length) {\n' +
      '    while (index < text.length && text[index] === " ") index += 1;\n' +
      '    if (index >= text.length) break;\n' +
      '    let end = index;\n' +
      '    while (end < text.length && text[end] !== " ") end += 1;\n' +
      '    words.push(text.slice(index, end));\n' +
      '    index = end;\n' +
      '  }\n' +
      '  let lo = 0;\n' +
      '  let hi = words.length - 1;\n' +
      '  while (lo < hi) {\n' +
      '    const swap = words[lo];\n' +
      '    words[lo] = words[hi];\n' +
      '    words[hi] = swap;\n' +
      '    lo += 1;\n' +
      '    hi -= 1;\n' +
      '  }\n' +
      '  return words.join(" ");\n' +
      '}',
    modify: 'Keep the word order and reverse the characters inside each word instead — which loop moves where?',
  },
  {
    step: 5,
    name: 'Largest Odd Number in String',
    difficulty: 'Easy',
    topicSlug: NUMERIC,
    stem: 'Find the largest odd prefix of a decimal string without turning it into a number.',
    brief: 'Input: a string of decimal digits with no leading zeros, up to one hundred thousand characters long. Output: the longest prefix that is an odd number, or the empty string.',
    concepts: ['dsa-last-digit-divisibility', 'dsa-single-pass-tracking', 'dsa-character-codes'],
    shortAnswer: 'Scan from the right for the first odd digit and cut there: a decimal number is odd exactly when its last digit is.',
    idealAnswer:
      'Every place value above the units is a multiple of ten and therefore even, so the parity of the whole number is ' +
      'the parity of its last digit — which means a prefix is odd exactly when it ends on an odd digit. The longest such ' +
      'prefix is the one ending at the rightmost odd digit, so one backward scan and a slice answer it in linear time ' +
      'and constant extra space. Converting the string to a number is not available at all here: the input is far ' +
      'longer than the exact integer window.',
    walkthrough:
      'The reason to write this against the string rather than the number is the same as for the digit-extraction rows, ' +
      'only sharper: at one hundred thousand digits there is no numeric representation to fall back on, and a double ' +
      'would have stopped being exact around the sixteenth digit anyway. The comparison by character code is the other ' +
      'half of staying in the string, and it is also what makes the answer a slice rather than a rebuilt number.',
    commonMistake: 'Parsing with Number or BigInt before testing parity, or scanning forward for the first odd digit.',
    whyWrong:
      'The parse is the cost the row is asking you to avoid, and on the stated length it does not even succeed: Number ' +
      'silently loses low digits and BigInt is a different question. A forward scan finds the shortest odd prefix, not ' +
      'the largest, and since every longer prefix through the same digit is larger, it returns the wrong answer on ' +
      'almost every input.',
    followUps: ['Why does the same argument settle divisibility by five and by ten?', 'What changes if the input may carry leading zeros?', 'Give the answer for the largest even prefix in one line of the same loop.'],
    solution:
      'function largestOddNumber(numeric) {\n' +
      '  for (let i = numeric.length - 1; i >= 0; i -= 1) {\n' +
      '    const digit = numeric.charCodeAt(i) - 48;\n' +
      '    if (digit % 2 === 1) return numeric.slice(0, i + 1);\n' +
      '  }\n' +
      '  return "";\n' +
      '}',
    modify: 'Return the longest prefix divisible by three — the place-value argument changes, so what does the scan carry?',
  },
  {
    step: 5,
    name: 'Longest Common Prefix',
    difficulty: 'Easy',
    topicSlug: STRINGS,
    stem: 'Compare columns rather than pairs of strings, and stop at the first column that disagrees.',
    brief: 'Input: an array of strings. Output: the longest prefix shared by all of them, or the empty string.',
    concepts: ['dsa-coordinate-loops', 'dsa-boundary-conditions', 'dsa-complexity-counting'],
    shortAnswer: 'Walk the columns of the first string and check that character against every other word; the first mismatch ends it.',
    idealAnswer:
      'A shared prefix is one that every string agrees to, so a column at a time is the natural order: take the first ' +
      'string as the reference and, for each position, ask the rest whether they hold the same character at the same ' +
      'index. The loop stops when a string runs out or a column disagrees, which bounds the work by the shortest string ' +
      'times the count of them — better than sorting, which pays a full comparison order to learn the same thing, and ' +
      'better than pairwise reduction, which re-reads prefixes it has already agreed on.',
    walkthrough:
      'The two exits are different failures and both belong inside the inner test: a word shorter than the column cannot ' +
      'agree, and a word of equal length can still disagree. Reading the row-count bound from the first string rather ' +
      'than the shortest is the other decision, and it is free because the mismatch test catches the overhang — sorting ' +
      'by length first only saves comparisons on inputs that are already mostly equal.',
    commonMistake: 'Sorting the array and comparing the first and last entries, or building a running prefix by intersecting.',
    whyWrong:
      'Sorting happens to be correct because the extremes of a lexicographic order bound the whole range, but it costs ' +
      'the ordering and hides the reason it works, so it is unmodifyable when the ask becomes a prefix of a subset. The ' +
      'running-intersection form copies the prefix on every step, which turns a linear answer into a quadratic one in ' +
      'the length of the shared text.',
    followUps: ['Why is comparing only the sorted extremes still correct?', 'Which two conditions belong in the inner test?', 'Give the version that reports the common suffix instead.'],
    solution:
      'function longestCommonPrefix(words) {\n' +
      '  if (words.length === 0) return "";\n' +
      '  const reference = words[0];\n' +
      '  let end = 0;\n' +
      '  while (end < reference.length) {\n' +
      '    const char = reference[end];\n' +
      '    let agreed = true;\n' +
      '    for (let i = 1; i < words.length; i += 1) {\n' +
      '      if (end >= words[i].length || words[i][end] !== char) {\n' +
      '        agreed = false;\n' +
      '        break;\n' +
      '      }\n' +
      '    }\n' +
      '    if (!agreed) break;\n' +
      '    end += 1;\n' +
      '  }\n' +
      '  return reference.slice(0, end);\n' +
      '}',
    modify: 'Return the longest common prefix of any two words in the array instead — which structure does that need?',
  },
  {
    step: 5,
    name: 'Isomorphic String',
    difficulty: 'Easy',
    topicSlug: STRINGS,
    stem: 'Decide whether two strings share a shape, and show why one dictionary is not enough.',
    brief: 'Input: two strings of equal length. Output: whether a one-to-one relabelling of characters turns the first into the second.',
    concepts: ['dsa-two-way-mapping', 'dsa-hash-frequency', 'dsa-boundary-conditions'],
    shortAnswer: 'Map each direction separately: a pair is legal only when neither map already holds a different partner.',
    idealAnswer:
      'The relation has to be a function from source characters to target characters and also a function the other way, ' +
      'which is what one-to-one means, so two maps are the honest representation. At each position the pair is ' +
      'accepted when both maps are silent about it — and then both are written — or when both already name each other; ' +
      'the rejection is a half-set pair. A single dictionary enforces only one direction and reports bad pairs as ' +
      'good.',
    walkthrough:
      'The case a single map misses is a many-to-one pairing: two distinct source characters landing on the same target ' +
      'character never contradicts the forward map, so it has to be caught from the reverse side. Writing the check as ' +
      'a contradiction rather than as a confirmation is the other half — asking whether either map disagrees with the ' +
      'current pair keeps the two directions symmetric and makes the empty-string case fall out instead of needing a ' +
      'guard.',
    commonMistake: 'Keeping only a source-to-target dictionary, or comparing first-occurrence positions of each character.',
    whyWrong:
      'The one-map form accepts a target character shared by two sources, which is exactly the pattern the row asks to ' +
      'reject, and it fails on inputs built to be small. The positional encoding is genuinely equivalent and worth ' +
      'knowing, but it answers a weaker question unless both strings are encoded at once, and people who write it from ' +
      'memory usually encode only one.',
    followUps: ['Which input defeats the single-dictionary version?', 'Why does a contradiction test need no case for the first pair?', 'Give the positional encoding and say what it has to compare.'],
    solution:
      'function isIsomorphic(source, target) {\n' +
      '  if (source.length !== target.length) return false;\n' +
      '  const forward = new Map();\n' +
      '  const backward = new Map();\n' +
      '  for (let i = 0; i < source.length; i += 1) {\n' +
      '    const a = source[i];\n' +
      '    const b = target[i];\n' +
      '    const knownA = forward.get(a);\n' +
      '    const knownB = backward.get(b);\n' +
      '    if (knownA === undefined && knownB === undefined) {\n' +
      '      forward.set(a, b);\n' +
      '      backward.set(b, a);\n' +
      '    } else if (knownA !== b || knownB !== a) {\n' +
      '      return false;\n' +
      '    }\n' +
      '  }\n' +
      '  return true;\n' +
      '}',
    modify: 'Return the relabelling itself as a list of pairs, or report that none exists.',
  },
  {
    step: 5,
    name: 'Check whether one string is a rotation of another',
    difficulty: 'Easy',
    topicSlug: STRINGS,
    stem: 'Turn a cyclic shift into one containment test, and pay for the copy only once.',
    brief: 'Input: two strings. Output: whether one is a rotation of the other, i.e. some split point moves its head to its tail.',
    concepts: ['dsa-doubled-text-window', 'dsa-boundary-conditions', 'dsa-complexity-counting'],
    shortAnswer: 'Equal lengths and the doubled first string containing the second is exactly the rotation relation.',
    idealAnswer:
      'Every rotation of a string is a contiguous window of the string written twice, and every window of that length in ' +
      'the doubled text is a rotation, so the two questions coincide once the lengths match — which is the condition ' +
      'that keeps the containment from finding a shorter string inside a longer one. Writing it as one containment call ' +
      'is the whole trick; the cost is the doubled copy plus a search, and the alternative of testing every split point ' +
      'costs the length again on top.',
    walkthrough:
      'The length guard is not defensive bookkeeping, it is part of the equivalence: without it a substring of the ' +
      'doubled text that is merely contained would pass. The empty pair is the case that makes people distrust the ' +
      'guard, and under the usual definition it is a rotation of itself, which the same code answers correctly without ' +
      'a special case.',
    commonMistake: 'Rotating one step at a time and comparing, or dropping the length check.',
    whyWrong:
      'The step-by-step loop is correct and quadratic in the length, and it is the answer the row exists to replace with ' +
      'a single test. Without the length guard the containment is a substring question, so a prefix of the doubled text ' +
      'reports a rotation that cannot exist between strings of different sizes.',
    followUps: ['Which two directions of the equivalence does the length guard protect?', 'What does the same trick answer about conjugate strings?', 'Cost the doubled copy against the per-split comparison on a long input.'],
    solution:
      'function isRotation(source, candidate) {\n' +
      '  if (source.length !== candidate.length) return false;\n' +
      '  return (source + source).includes(candidate);\n' +
      '}',
    modify: 'Report the number of positions that rotate one string into the other — how many windows does the doubled text hold?',
  },
  {
    step: 5,
    name: 'Check if two Strings are anagrams of each other',
    difficulty: 'Easy',
    topicSlug: STRINGS,
    stem: 'Prove equal multisets with one fixed array, and say why the two halves can share a loop.',
    brief: 'Input: two lowercase strings. Output: whether one is a rearrangement of the other.',
    concepts: ['dsa-hash-frequency', 'dsa-character-codes', 'dsa-single-pass-tracking'],
    shortAnswer: 'Increment on one string and decrement on the other in the same pass, then require every counter back at zero.',
    idealAnswer:
      'The alphabet is fixed, so the frequency table is an array of twenty-six counters indexed by character code ' +
      'rather than a dictionary, and the two passes can be one loop because the strings have the same length once the ' +
      'guard passes. Adding from the first and subtracting from the second leaves every counter at zero exactly when the ' +
      'multisets agree, which is the whole test — the length check comes first because unequal lengths cannot sum to ' +
      'zero in both directions.',
    walkthrough:
      'Pairing the increment and the decrement in one loop is not just shorter: it means the table holds the difference ' +
      'at every step rather than two separate histograms, which is the same trick that turns a duplicate search into a ' +
      'single scan. Indexing by code minus the offset of the first letter is what makes the array legal, and it is worth ' +
      'stating as an assumption — outside lowercase Latin the table needs a real map or a wider range.',
    commonMistake: 'Sorting both strings and comparing them, or using two maps and comparing their sizes.',
    whyWrong:
      'Sorting costs a comparison order on each string to answer a question that a fixed table answers in linear time, ' +
      'and it is the answer the row is checking whether you can beat. Comparing map sizes is simply wrong: two different ' +
      'distributions can have the same number of distinct keys, so the test accepts inputs the multiset check rejects.',
    followUps: ['Why does the length check let both strings share one loop?', 'What breaks the fixed-array version, and what replaces it?', 'Give the single-loop version that returns as soon as a counter goes negative.'],
    solution:
      'function isAnagram(source, target) {\n' +
      '  if (source.length !== target.length) return false;\n' +
      '  const counts = new Array(26).fill(0);\n' +
      '  for (let i = 0; i < source.length; i += 1) {\n' +
      '    counts[source.charCodeAt(i) - 97] += 1;\n' +
      '    counts[target.charCodeAt(i) - 97] -= 1;\n' +
      '  }\n' +
      '  for (const count of counts) {\n' +
      '    if (count !== 0) return false;\n' +
      '  }\n' +
      '  return true;\n' +
      '}',
    modify: 'Report which characters differ in count instead of a boolean — what does the table have to keep?',
  },
  {
    step: 5,
    name: 'Reverse Every Word in a String',
    difficulty: 'Easy',
    topicSlug: STRINGS,
    stem: 'Reverse inside each word and leave the spacing untouched, including the runs.',
    brief: 'Input: a string of words separated by single spaces. Output: the same layout with the characters of every word reversed.',
    concepts: ['dsa-reversal-trick', 'dsa-write-index', 'dsa-boundary-conditions'],
    shortAnswer: 'Find each word boundary and copy its characters out backwards, leaving the separators in place.',
    idealAnswer:
      'The layout is fixed and only the runs between spaces change, so the pass reads a word, writes it reversed, and ' +
      'writes the separator it stopped on — which keeps the original spacing without a second tokenising step. A mirror ' +
      'walk over each word would do the same work but needs the word stored separately first, and the backward copy from ' +
      'the source costs nothing extra since a new string is being built anyway.',
    walkthrough:
      'This row is the pair of the word-order reversal, and the point of doing both is that the same cursor machinery ' +
      'answers either question with the loops in different places: here the outer walk finds the boundaries and the ' +
      'inner walk runs backward, there the outer walk collects and the inner walk mirrors. Keeping the separators in the ' +
      'output rather than reconstructing them with a join is what makes the version tolerate runs of spaces.',
    commonMistake: 'Splitting on spaces and joining reversed words with one space, or reversing the whole string and then the words.',
    whyWrong:
      'The split-and-join erases the difference between a single space and a run of them, so an input padded inside ' +
      'comes back reformatted rather than reversed in place. The double reversal is the character-array trick again and ' +
      'pays for a rewrite of the entire string before paying for the word rewrites.',
    followUps: ['Which loop owns the boundaries and which owns the reversal?', 'Give the version that also reverses the word order in one pass.', 'What does the same code do with tabs, and what should it do?'],
    solution:
      'function reverseEachWord(text) {\n' +
      '  let out = "";\n' +
      '  let start = 0;\n' +
      '  for (let i = 0; i <= text.length; i += 1) {\n' +
      '    if (i === text.length || text[i] === " ") {\n' +
      '      for (let j = i - 1; j >= start; j -= 1) out += text[j];\n' +
      '      if (i < text.length) out += " ";\n' +
      '      start = i + 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify: 'Reverse only the words longer than one character — which test moves where?',
  },
  {
    step: 5,
    name: 'Sort Characters by frequency',
    difficulty: 'Medium',
    topicSlug: STRINGS,
    stem: 'Order a string by how often each character appears, and decide the tie before you write the comparator.',
    brief: 'Input: a string of mixed characters. Output: the same multiset of characters with more frequent ones first; characters of equal frequency come out in ascending character code.',
    concepts: ['dsa-frequency-ordering', 'dsa-hash-frequency', 'dsa-complexity-counting'],
    shortAnswer: 'Count into a map, sort the entries by count descending, and declare a second key so equal counts have one order.',
    idealAnswer:
      'Two passes build the frequency table and one sort orders its distinct keys rather than the characters, so the ' +
      'work is the length plus the alphabet times the log of the alphabet, which is the shape to state when the asked ' +
      'about cost. The output is rebuilt by repeating each character its own count. Equal counts are the graded part: ' +
      'the requirement is only that frequencies descend, so the comparator has to name a second key — ascending code — ' +
      'or the same input produces different strings across runs and across engines.',
    walkthrough:
      'Sorting the entries of the map instead of the characters is what keeps the sort small, and it is the general ' +
      'trick behind top-K over a stream: count first, then order the keys. The tie-break deserves the attention because ' +
      'a comparator that returns zero for two different characters is not wrong, it is unspecified, and unspecified ' +
      'output is what makes a test flaky rather than failed. The alphabet bound is also the honest reason this version ' +
      'beats a general sort: with a huge input and a small character set the sort is effectively constant.',
    commonMistake: 'Sorting every character occurrence, or leaving equal counts unordered.',
    whyWrong:
      'A per-character sort costs the length times its logarithm to order many identical items, and it hides the fact ' +
      'that the real input to the sort is the table. An unordered tie is the worse of the two: the answer satisfies the ' +
      'ask but cannot be asserted, so the next change to the sort implementation silently breaks the suite.',
    followUps: ['What is the second key, and why does the comparator need it?', 'Which part of the cost disappears when the alphabet is fixed?', 'Give the version that puts the least frequent characters first instead.'],
    solution:
      'function sortByFrequency(text) {\n' +
      '  const counts = new Map();\n' +
      '  for (const char of text) counts.set(char, (counts.get(char) || 0) + 1);\n' +
      '  const entries = [...counts.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));\n' +
      '  let out = "";\n' +
      '  for (const entry of entries) out += entry[0].repeat(entry[1]);\n' +
      '  return out;\n' +
      '}',
    modify: 'Order by first appearance instead of character code — which argument of the comparator has to remember position?',
  },
  {
    step: 5,
    name: 'Maximum Nesting Depth of Parentheses',
    difficulty: 'Easy',
    topicSlug: STRINGS,
    stem: 'Report the deepest nesting with the same counter that removes the outermost pairs.',
    brief: 'Input: a valid parentheses expression possibly containing operands. Output: the greatest number of open parentheses at any point.',
    concepts: ['dsa-parenthesis-depth', 'dsa-selection-min-scan', 'dsa-single-pass-tracking'],
    shortAnswer: 'One counter up on open and down on close, and a running maximum over the values it takes.',
    idealAnswer:
      'Depth at any position is the counter, and the question is only its largest value, so the row is a nesting scan ' +
      'with a running best attached — which is the pair of habits the two rows share. The order matters: an open ' +
      'bracket raises the counter and is then compared, because the depth the bracket creates is the depth being ' +
      'measured, and comparing before the increment reports one less on every input. Non-bracket characters are ' +
      'ignored rather than handled, which is what makes the loop safe on operands.',
    walkthrough:
      'The answer is the peak of a walk, not its length, and the distinction is the same as between total steps and ' +
      'highest water mark — a place where people reach for a stack that stores each level and then discover they only ' +
      'ever needed its size. It is worth writing both rows next to each other for exactly that reason: one reads the ' +
      'counter to decide emission, this one reads it to decide a maximum, and neither needs the structure the counter ' +
      'is standing in for.',
    commonMistake: 'Pushing and popping a stack of levels, or taking the maximum before incrementing.',
    whyWrong:
      'The stack is correct and costs an allocation per level to carry information no question asked for, and it is the ' +
      'thing this row is meant to teach away from. Reading the maximum first is an off-by-one that survives a hand ' +
      'check on the deepest group and reports one less than the true depth on everything.',
    followUps: ['Why is the increment inside the comparison rather than after it?', 'What would the same counter say about an unbalanced input?', 'Give the version that returns the depth at every operand, not just the peak.'],
    solution:
      'function maxNestingDepth(text) {\n' +
      '  let depth = 0;\n' +
      '  let best = 0;\n' +
      '  for (const char of text) {\n' +
      '    if (char === "(") {\n' +
      '      depth += 1;\n' +
      '      if (depth > best) best = depth;\n' +
      '    } else if (char === ")") {\n' +
      '      depth -= 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify: 'Return the operands found at the deepest level — which second structure does that need?',
  },
  {
    step: 5,
    name: 'Roman to Integer',
    difficulty: 'Easy',
    topicSlug: NUMERIC,
    stem: 'Read a Roman numeral with one lookahead instead of a table of exceptions.',
    brief: 'Input: a Roman numeral string in canonical form. Output: its integer value.',
    concepts: ['dsa-subtractive-notation', 'dsa-single-pass-tracking', 'dsa-boundary-conditions'],
    shortAnswer: 'Add each symbol unless the next one is worth more, in which case subtract it.',
    idealAnswer:
      'The subtractive pairs are all instances of one local rule — a smaller symbol immediately before a larger one ' +
      'negates itself — so a single comparison with the next character replaces the six exception cases, and the rest ' +
      'of the string is ordinary addition. That is why the pass is linear and the table only needs the seven symbols. ' +
      'The lookahead is bounded by the last character having nothing after it, which is where the second half of the ' +
      'condition lives.',
    walkthrough:
      'Canonical input is doing quiet work here: the rule reads symbols left to right and never has to check that the ' +
      'result is legal, so a numeral like IIX would be decoded confidently as 8 while being nothing at all. That is ' +
      'the same trade the parser row makes — accept a stated grammar rather than validate it — and it is worth naming ' +
      'because the honest failure mode of this function is a wrong number rather than an error. Comparing values rather ' +
      'than characters is the other half, and it is what lets the rule survive an added symbol.',
    commonMistake: 'Enumerating the subtractive pairs as special cases, or comparing character codes instead of values.',
    whyWrong:
      'The exception table is six branches that must stay in step with the general rule, and a numeral the table does ' +
      'not list is added instead of subtracted — the classic wrong answer on the last case. Character codes happen to ' +
      'order the same way as values for a few symbols and not for all of them, so that version is right on samples and ' +
      'wrong on real dates.',
    followUps: ['Which two conditions share the lookahead test?', 'What does the function do with a numeral outside the canonical grammar?', 'Give the version that validates the input while decoding it.'],
    solution:
      'function romanToInt(text) {\n' +
      '  const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };\n' +
      '  let total = 0;\n' +
      '  for (let i = 0; i < text.length; i += 1) {\n' +
      '    const value = values[text[i]];\n' +
      '    if (i + 1 < text.length && values[text[i + 1]] > value) total -= value;\n' +
      '    else total += value;\n' +
      '  }\n' +
      '  return total;\n' +
      '}',
    modify: 'Handle a numeral written in non-canonical form by rejecting it — what state does the loop have to carry?',
  },
  {
    step: 5,
    name: 'Integer to Roman',
    difficulty: 'Medium',
    topicSlug: NUMERIC,
    stem: 'Emit a Roman numeral from one greedy pass over a table, with no branch for the subtractive forms.',
    brief: 'Input: an integer between one and a few thousand. Output: its Roman numeral in canonical form.',
    concepts: ['dsa-greedy-numeral-table', 'dsa-subtractive-notation', 'dsa-branch-exhaustiveness'],
    shortAnswer: 'Walk a descending value table that already contains the subtractive values and repeat each symbol while it still fits.',
    idealAnswer:
      'Putting the six subtractive values into the table alongside the seven ordinary ones turns the writer into one ' +
      'loop: take a symbol while the remainder still fits, subtract, move to the next value. Greediness is correct ' +
      'because each table entry is a multiple of everything after it in its decade, so the largest fit is what the ' +
      'canonical form asks for, and the table is data rather than control flow — the same reason the app keeps business ' +
      'constants in lookup tables instead of branching on them.',
    walkthrough:
      'The alternative is an if cascade over digits and positions, and it is longer, easier to get wrong and impossible ' +
      'to extend: adding a symbol means editing the logic rather than the table. Ordering the pairs strictly descending ' +
      'is the whole correctness of the loop, since a later entry must never be preferred over an earlier fit. Keeping ' +
      'value and symbol together in one row is what makes that order checkable at a glance.',
    commonMistake: 'Branching on each digit position, or ordering the table by symbol length instead of by value.',
    whyWrong:
      'A digit-cascade duplicates the subtractive rule nine times, so one missed decade becomes a wrong numeral that no ' +
      'test happens to cover. Table order is the greedy assumption: if CD were read after C the loop would take C four ' +
      'times before it saw the pair, producing a non-canonical string that reads back as a different number.',
    followUps: ['Why does the largest fit give the canonical form?', 'Which entries have to sit between which, and what breaks if they move?', 'Add a thousands digit beyond M using the same table shape.'],
    solution:
      'function intToRoman(value) {\n' +
      '  const table = [\n' +
      '    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"],\n' +
      '    [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],\n' +
      '  ];\n' +
      '  let out = "";\n' +
      '  for (const entry of table) {\n' +
      '    while (value >= entry[0]) {\n' +
      '      out += entry[1];\n' +
      '      value -= entry[0];\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify: 'Write it without the subtractive entries and add them back as post-processing — which is easier to read?',
  },
  {
    step: 5,
    name: 'String to Integer (atoi)',
    difficulty: 'Medium',
    topicSlug: NUMERIC,
    stem: 'Parse the prefix a caller asked for, clamp at the range, and never let the accumulator leave the exact window.',
    brief: 'Input: an arbitrary string. Output: the integer read from leading spaces, one optional sign and then digits, stopping at the first non-digit, clamped to the signed 32-bit range.',
    concepts: ['dsa-saturating-parse', 'dsa-double-precision', 'dsa-character-codes'],
    shortAnswer: 'Cursor over spaces, then a sign, then digits accumulated one at a time, returning the boundary the moment the value passes it.',
    idealAnswer:
      'The stages are ordered and each one consumes its own part of the input: leading spaces, one sign character, then ' +
      'as many digits as there are, stopping at the first character that is not a digit rather than failing. Clamping ' +
      'has to happen inside the accumulation, per digit, because the number being parsed is unbounded while the ' +
      'representable integer window is not — a ten thousand digit input must answer with the boundary and not with ' +
      'whatever the double lands on. Testing the bound before writing it keeps the accumulator exact throughout.',
    walkthrough:
      'In JavaScript the accumulator is a double, so overflow does not wrap, it quietly loses low digits: past two to ' +
      'the power of fifty-three the value stops being the number being typed. That is why the clamp is checked as ' +
      'soon as a digit is appended and why the answer for an absurd input is a boundary rather than an approximation. ' +
      'Digit extraction by character code minus the offset of zero is what makes the stop condition one comparison ' +
      'against a range instead of a set of legal characters.',
    commonMistake: 'Parsing the whole string and clamping afterwards, or treating a non-digit as an error.',
    whyWrong:
      'Clamping after the parse reads a number that has already left the exact window, so the two billion digit case ' +
      'returns a rounded value that is neither the true integer nor the boundary. Stopping with an error is a different ' +
      'contract than the one asked for: this parser returns what it read, which is why the words-and-a-number input ' +
      'answers zero and the number-then-words input answers the number.',
    followUps: ['Which check has to happen before the accumulator is stored, and why?', 'What does the sign do to the two clamp boundaries?', 'Give the version that reports the position where parsing stopped.'],
    solution:
      'function myAtoi(text) {\n' +
      '  const maxSigned = 2 ** 31 - 1;\n' +
      '  const minSigned = -(2 ** 31);\n' +
      '  let index = 0;\n' +
      '  while (index < text.length && text[index] === " ") index += 1;\n' +
      '  let sign = 1;\n' +
      '  if (text[index] === "+") index += 1;\n' +
      '  else if (text[index] === "-") {\n' +
      '    sign = -1;\n' +
      '    index += 1;\n' +
      '  }\n' +
      '  let value = 0;\n' +
      '  while (index < text.length) {\n' +
      '    const digit = text.charCodeAt(index) - 48;\n' +
      '    if (digit < 0 || digit > 9) break;\n' +
      '    value = value * 10 + digit;\n' +
      '    if (sign === 1 && value > maxSigned) return maxSigned;\n' +
      '    if (sign === -1 && -value < minSigned) return minSigned;\n' +
      '    index += 1;\n' +
      '  }\n' +
      '  return sign * value;\n' +
      '}',
    modify: 'Clamp to an arbitrary signed range passed in by the caller — which two constants stop being constants?',
  },
  {
    step: 5,
    name: 'Count number of Substrings with K distinct characters',
    difficulty: 'Medium',
    topicSlug: STRINGS,
    stem: 'Count substrings with exactly K distinct characters by asking a different question twice.',
    brief: 'Input: a string and a k. Output: the number of contiguous substrings holding exactly k distinct characters.',
    concepts: ['dsa-at-most-difference', 'dsa-two-pointer', 'dsa-hash-frequency'],
    shortAnswer: 'Count windows with at most k distinct and subtract the count with at most k minus one.',
    idealAnswer:
      'At most a bound is the easy question: keep a window whose distinct count never exceeds it, and every right ' +
      'endpoint contributes its own window length, because all of its suffixes are legal too. Exactly k is then the ' +
      'difference of two at-most counts, so the hard constraint disappears by being restated as the difference of two ' +
      'easier ones. Two linear passes cost the length twice, and the map only ever holds the bound plus one keys.',
    walkthrough:
      'The subtraction is an inclusion argument rather than a trick: the at-most-k count contains every window the ' +
      'at-most-(k minus one) count contains, and the leftovers are exactly the windows with k distinct characters, so '
      + 'no window is counted twice or missed. Getting the per-step contribution right is the other half — adding the ' +
      'window length once per right endpoint, not once per shrink — and that is where this shape is usually written ' +
      'wrong. The bound of minus one has to be answered separately, since a negative limit is not a window anyone can ' +
      'shrink to.',
    commonMistake: 'Trying to maintain an exactly-k window directly, or adding the window length before shrinking.',
    whyWrong:
      'An exact window has no monotone shrink rule: widening can satisfy k and widening further can break it, so the ' +
      'left endpoint stops being a function of the right one and the argument collapses. Adding the length before the ' +
      'shrink counts illegal windows, which is the off-by-stage error that shows up only when the text exceeds the ' +
      'limit.',
    followUps: ['Why does the difference leave exactly the k-distinct windows?', 'What must the at-most function return for a negative limit, and why is that not an accident?', 'Give the same argument for arrays of integers instead of characters.'],
    solution:
      'function substringsWithKDistinct(text, k) {\n' +
      '  const atMost = (limit) => {\n' +
      '    if (limit < 0) return 0;\n' +
      '    const counts = new Map();\n' +
      '    let left = 0;\n' +
      '    let total = 0;\n' +
      '    for (let right = 0; right < text.length; right += 1) {\n' +
      '      const char = text[right];\n' +
      '      counts.set(char, (counts.get(char) || 0) + 1);\n' +
      '      while (counts.size > limit) {\n' +
      '        const leaving = text[left];\n' +
      '        const next = counts.get(leaving) - 1;\n' +
      '        if (next === 0) counts.delete(leaving);\n' +
      '        else counts.set(leaving, next);\n' +
      '        left += 1;\n' +
      '      }\n' +
      '      total += right - left + 1;\n' +
      '    }\n' +
      '    return total;\n' +
      '  };\n' +
      '  return atMost(k) - atMost(k - 1);\n' +
      '}',
    modify: 'Count substrings with at most K distinct instead — which call disappears?',
  },
  {
    step: 5,
    name: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    topicSlug: STRINGS,
    stem: 'Grow every centre outward and explain why there are twice the length minus one of them.',
    brief: 'Input: a string. Output: the earliest longest substring that reads the same backwards.',
    concepts: ['dsa-centre-expansion', 'dsa-two-pointer', 'dsa-selection-min-scan'],
    shortAnswer: 'Expand from each of the odd and even centres, keep the longest span, and slice it out at the end.',
    idealAnswer:
      'A palindrome is fixed by its middle, so instead of asking which substrings are palindromes the loop asks, for ' +
      'each centre, how far it can grow — which is two pointers moving apart while the characters match. There are as ' +
      'many odd centres as positions and one fewer even ones, which is the count worth stating, and both kinds have to ' +
      'be tried or a word like abba is missed entirely. Keeping the start and length rather than the best string is ' +
      'what keeps the growth O(1) extra space, and the total cost is the length squared in the worst case.',
    walkthrough:
      'The outward growth reuses work the naive test throws away: a substring that fails at some width cannot become ' +
      'legal by growing further, so one comparison decides the whole rest of that centre. Recording the best as a ' +
      'start and a length makes the tie rule a strict comparison, which is what makes the earliest longest answer ' +
      'deterministic instead of whichever centre happened to win. The Manacher form that avoids the quadratic cost is ' +
      'the same loop with a mirrored centre remembered, and it is worth naming as the answer to a follow-up rather ' +
      'than as the first version written.',
    commonMistake: 'Testing every substring for being a palindrome, or giving even-length centres the same start as odd ones.',
    whyWrong:
      'The cubic version pays a length-sized check for each of a length-squared number of substrings, and every ' +
      'comparison it makes was already made by a shorter substring. An even centre written as a single position can ' +
      'never produce abba, so the answer comes back too short on exactly the inputs whose longest run is even.',
    followUps: ['Why does a failed comparison end that centre rather than continue?', 'Which tie rule gives the earliest answer, and where does it live?', 'What does Manacher remember that this loop recomputes?'],
    solution:
      'function longestPalindrome(text) {\n' +
      '  let bestStart = 0;\n' +
      '  let bestLength = 0;\n' +
      '  const grow = (left, right) => {\n' +
      '    let l = left;\n' +
      '    let r = right;\n' +
      '    while (l >= 0 && r < text.length && text[l] === text[r]) {\n' +
      '      l -= 1;\n' +
      '      r += 1;\n' +
      '    }\n' +
      '    const length = r - l - 1;\n' +
      '    if (length > bestLength) {\n' +
      '      bestLength = length;\n' +
      '      bestStart = l + 1;\n' +
      '    }\n' +
      '  };\n' +
      '  for (let centre = 0; centre < text.length; centre += 1) {\n' +
      '    grow(centre, centre);\n' +
      '    grow(centre, centre + 1);\n' +
      '  }\n' +
      '  return text.slice(bestStart, bestStart + bestLength);\n' +
      '}',
    modify: 'Count all palindromic substrings instead of finding the longest — which counter replaces the best?',
  },
  {
    step: 5,
    name: 'Sum of Beauty of all Substrings',
    difficulty: 'Medium',
    topicSlug: STRINGS,
    stem: 'Sum the frequency spread of every substring without rebuilding the frequency table.',
    brief: 'Input: a lowercase string. Output: for every contiguous substring, the largest character frequency minus the smallest, added together.',
    concepts: ['dsa-hash-frequency', 'dsa-character-codes', 'dsa-complexity-counting'],
    shortAnswer: 'Fix the left end, extend the right one character at a time, and update the table instead of rebuilding it.',
    idealAnswer:
      'Every substring is a start and an end, so the outer loop fixes the start and the inner one extends it, carrying ' +
      'one counter array that gains exactly one character per step. That turns a rebuild of the table into a single ' +
      'increment, so the maximum is a running value and only the minimum still costs a pass over the twenty-six slots ' +
      '— a constant that is worth paying because the alternative is recomputing counts the previous substring already ' +
      'knew. Cost is the length squared times the alphabet, with the alphabet small enough to disappear from the ' +
      'statement.',
    walkthrough:
      'The reason to keep the table between inner steps is the same as for the prefix-sum rows: consecutive substrings ' +
      'share almost all of their content, and a loop that forgets that is doing the same work twice. Reading the ' +
      'minimum by scanning the fixed slots rather than maintaining it is the deliberate trade — the scan is bounded by ' +
      'the alphabet and a maintained minimum would have to handle a count rising again after a fall. Character-to-slot ' +
      'arithmetic is what makes the increment O(1) in the first place.',
    commonMistake: 'Rebuilding the frequency table for each substring, or treating the minimum as always one.',
    whyWrong:
      'The rebuild costs the substring length inside a loop already quadratic in it, turning a cubic answer where a ' +
      'quadratic one was available. The minimum is one only when some character appears once: a substring like aabb has ' +
      'spread zero and aabcb has spread two, so assuming one silently reports beauty that the substring does not have.',
    followUps: ['Which of the two bounds costs a scan, and why is that acceptable?', 'What would the loop look like if the alphabet were not fixed?', 'Give the version that reports the single most beautiful substring.'],
    solution:
      'function beautySum(text) {\n' +
      '  let total = 0;\n' +
      '  for (let start = 0; start < text.length; start += 1) {\n' +
      '    const counts = new Array(26).fill(0);\n' +
      '    let maxCount = 0;\n' +
      '    for (let end = start; end < text.length; end += 1) {\n' +
      '      const slot = text.charCodeAt(end) - 97;\n' +
      '      counts[slot] += 1;\n' +
      '      if (counts[slot] > maxCount) maxCount = counts[slot];\n' +
      '      let minCount = Infinity;\n' +
      '      for (const count of counts) {\n' +
      '        if (count > 0 && count < minCount) minCount = count;\n' +
      '      }\n' +
      '      total += maxCount - minCount;\n' +
      '    }\n' +
      '  }\n' +
      '  return total;\n' +
      '}',
    modify: 'Define beauty over distinct character counts instead of frequencies — which line changes and which loop survives?',
  },
  {
    step: 6,
    name: 'Introduction to LinkedList, Learn about struct/class',
    difficulty: 'Easy',
    topicSlug: LINKED,
    stem: 'Build a chain by hand and say what the list variable actually holds.',
    brief: 'Input: numbers. Output: a chain of nodes you allocated yourself. Say what a node carries besides its value, what the last node carries in that field, and what the head is when there are no numbers at all.',
    concepts: ['dsa-node-holds-reference', 'dsa-null-termination', 'dsa-cursor-reassignment', 'dsa-value-versus-reference'],
    shortAnswer:
      'A node is a value plus one reference to another node. The head is only a handle to the first node, an empty list is that handle being null, and the last node carries null.',
    idealAnswer:
      'The list is not a block of memory the values sit in; it is one reference the program holds and a chain of allocations ' +
      'that point at each other. That has three consequences worth stating out loud: a node has to carry the link as a field, ' +
      'so the shape of the data is part of the data; the final link is null, which is information rather than an unfilled ' +
      'field, so every walk has a defined place to stop; and because the nodes were placed by the allocator rather than by ' +
      'arithmetic, there is no way to compute where the kth one is, only a way to walk there. An empty list is head equal to ' +
      'null, not a node with nothing in it.',
    walkthrough:
      'The builder keeps a tail reference on purpose. Prepending each value instead would still be one write per node, but ' +
      'appending without a tail means walking the whole chain for every value, which turns a linear build into a quadratic ' +
      'one — the cheapest example of the cost the structure imposes. The reader walks a copy of the head rather than the ' +
      'head itself, because reassigning the parameter to move forward is how a learner loses a list mid-function: the ' +
      'pointer that survives the loop has to be the one the caller still holds.',
    commonMistake:
      'Writing the walk as while (cursor.next !== null) so the last node is never visited, or treating an empty list as a node whose value is undefined.',
    whyWrong:
      'A condition on the next link stops one node short, so a three-node chain reports two values and every later function that reuses the walk inherits the missing tail. An empty list modelled as a live node gives the code a phantom element to print, to count, and to compare against, and the null checks then have to be written by hand at every call site.',
    followUps: [
      'What does the head variable hold after the last node, and why is that not an error?',
      'If the nodes are scattered in memory, what exactly makes the order of the list?',
      'Which single field would you add to make the chain walkable backwards?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function nodeAt(head, index) {\n' +
      '  let cursor = head;\n' +
      '  let step = 0;\n' +
      '  while (cursor !== null && step < index) {\n' +
      '    cursor = cursor.next;\n' +
      '    step += 1;\n' +
      '  }\n' +
      '  return cursor;\n' +
      '}',
    modify: 'Build the same chain by inserting every value at the head instead of keeping a tail. What order does the read-back show, and does the build still cost one step per value?',
  },
  {
    step: 6,
    name: 'Inserting a node in LinkedList',
    difficulty: 'Easy',
    topicSlug: LINKED,
    stem: 'Insert at a position without writing a separate branch for the first node.',
    brief: 'Input: a chain of numbers, a zero-based position, a value. Output: the head of the chain with the value spliced in, the value going at the end when the position runs past it. State what each write is for and what the cost is at position zero versus position n.',
    concepts: ['dsa-sentinel-head', 'dsa-link-splice-order', 'dsa-linear-position-walk', 'dsa-node-holds-reference'],
    shortAnswer:
      'Stand on the predecessor, point the new node at what the predecessor pointed at, then point the predecessor at the new node. A sentinel in front of the head makes position zero use that same code.',
    idealAnswer:
      'Insertion is two reads and two writes, and the order between them is the whole answer: the new node has to take over ' +
      'the existing link before the predecessor is made to point at it, otherwise the rest of the chain is unreachable the ' +
      'moment it is dropped. The position is zero-based, so the loop stops on the node before the insertion point rather ' +
      'than on the node at it, which is the off-by-one that people get wrong at both ends. A throwaway node in front of ' +
      'the real head removes the special case: with it, prepending is the same three statements as splicing in the middle, ' +
      'and the function returns what the sentinel points at instead of branching on whether the head moved.',
    walkthrough:
      'The walk is bounded by the shorter of the position and the length, which is what makes clamping free: running out of ' +
      'chain leaves the cursor on the tail, and the same splice appends. Cost is the distance to the predecessor, so a head ' +
      'insert is constant and a tail insert is linear — a list built one append at a time is quadratic, which is why real ' +
      'implementations keep a tail pointer as a second handle rather than changing the structure. Note that nothing in this ' +
      'function reads a value: it works purely on links, which is why the same code inserts nodes holding anything.',
    commonMistake:
      'Setting predecessor.next to the new node before the new node has taken the old link, or walking to the node at the position instead of the node before it.',
    whyWrong:
      'The first order overwrites the only reference to everything after the insertion point, so the chain silently loses its tail and no error is raised. The second inserts one place late and, at position zero, dereferences the predecessor that does not exist — which is exactly the case the sentinel was added to handle.',
    followUps: [
      'Which of the two writes can be swapped and which cannot? Prove it with a three-node chain.',
      'What does the function cost at position zero, and what changes if a tail handle is kept?',
      'How would the code read if positions were one-based, and which bound changes?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function insertAt(head, position, value) {\n' +
      '  const sentinel = new Node(0);\n' +
      '  sentinel.next = head;\n' +
      '  let cursor = sentinel;\n' +
      '  let step = 0;\n' +
      '  while (step < position && cursor.next !== null) {\n' +
      '    cursor = cursor.next;\n' +
      '    step += 1;\n' +
      '  }\n' +
      '  const node = new Node(value);\n' +
      '  node.next = cursor.next;\n' +
      '  cursor.next = node;\n' +
      '  return sentinel.next;\n' +
      '}',
    modify: 'Insert into a chain that is already sorted so the order survives. Which walk do you now stop early, and what does that change about the worst case?',
  },
  {
    step: 6,
    name: 'Deleting a node in LinkedList',
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Remove by position, then remove when all you hold is the node itself.',
    brief: 'Input: a chain of numbers and a zero-based position; and, separately, one node with no reference to the head. Output: the head of the chain without that element; out-of-range positions delete nothing. Name the one node the second version cannot delete.',
    concepts: ['dsa-sentinel-head', 'dsa-link-splice-order', 'dsa-linear-position-walk', 'dsa-value-versus-reference'],
    shortAnswer:
      'By position: stand on the predecessor and jump its link over the node. Given only the node: copy the successor into it and unlink the successor, which is impossible for the tail.',
    idealAnswer:
      'Deletion is one write — the predecessor points at the node after the victim — but it needs the predecessor, and a ' +
      'singly linked node has no link backwards. Two answers follow. With a head reference, a sentinel supplies a ' +
      'predecessor for position zero so the same walk works everywhere, and the return value is what the sentinel ends up ' +
      'holding. Without one, the trick is to make the victim into its successor: copy that value across, then unlink the ' +
      'successor, which costs the same single write and never touches the head. The limit is the last node, whose ' +
      'successor does not exist, so the honest return value is a boolean rather than a silent no-op.',
    walkthrough:
      'The position version checks whether the walk ran out of chain before it writes anything, which is what makes an ' +
      'out-of-range position leave the list untouched instead of deleting the tail. The node version is worth naming for ' +
      'what it really does: it does not remove the node the caller pointed at, it removes the following node and overwrites ' +
      'the value in place. Anything holding a reference to either node sees the difference — the victim survives with new ' +
      'contents, and the identity of the chain after it moves up by one.',
    commonMistake:
      'Special-casing the head with a branch instead of a sentinel, or claiming the copy-forward version can delete the final node.',
    whyWrong:
      'The branch on the head is where deletion bugs live: it duplicates the unlinking logic and has to be kept in step with it forever. Copying forward from a tail has nothing to copy, so code that pretends otherwise either leaves the node in place or reads properties off null and throws on the one input a reviewer tests first.',
    followUps: [
      'Why does the sentinel need no cleanup at the end of the function?',
      'The node you were handed is still allocated after copy-forward deletion. What changed, exactly?',
      'Write the version that deletes every node holding a value. How many links does it now track?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function nodeAt(head, index) {\n' +
      '  let cursor = head;\n' +
      '  let step = 0;\n' +
      '  while (cursor !== null && step < index) {\n' +
      '    cursor = cursor.next;\n' +
      '    step += 1;\n' +
      '  }\n' +
      '  return cursor;\n' +
      '}\n' +
      '\n' +
      'function deleteAt(head, position) {\n' +
      '  const sentinel = new Node(0);\n' +
      '  sentinel.next = head;\n' +
      '  let cursor = sentinel;\n' +
      '  let step = 0;\n' +
      '  while (step < position && cursor.next !== null) {\n' +
      '    cursor = cursor.next;\n' +
      '    step += 1;\n' +
      '  }\n' +
      '  if (cursor.next === null) {\n' +
      '    return sentinel.next;\n' +
      '  }\n' +
      '  cursor.next = cursor.next.next;\n' +
      '  return sentinel.next;\n' +
      '}\n' +
      '\n' +
      'function deleteGiven(node) {\n' +
      '  if (node === null || node.next === null) {\n' +
      '    return false;\n' +
      '  }\n' +
      '  node.value = node.next.value;\n' +
      '  node.next = node.next.next;\n' +
      '  return true;\n' +
      '}',
    modify: 'Delete a range of positions in one pass. Which two references do you have to keep, and why does the head still need no special case?',
  },
  {
    step: 6,
    name: 'Find the length of the linkedlist',
    difficulty: 'Easy',
    topicSlug: LINKED,
    stem: 'Count the nodes twice, once by walking and once by recursion, and say what each one costs.',
    brief: 'Input: a chain of numbers, possibly empty. Output: how many nodes it holds. Say where the recursion stops, what the call stack holds while it counts, and what you would change if the count were asked for a thousand times.',
    concepts: ['dsa-null-termination', 'dsa-recursive-decomposition', 'dsa-call-stack-cost', 'dsa-cursor-reassignment'],
    shortAnswer:
      'Walk a cursor to null and count the steps, or define the length as one plus the length of the rest with null having length zero. Both cost one visit per node.',
    idealAnswer:
      'The iterative version is the structure read directly: nothing about a chain lets you know how long it is without ' +
      'visiting every node, so the counter and the cursor advance together and the loop ends because the last link is ' +
      'null. The recursive version says the same thing as a definition — an empty chain is zero, a node adds one to the ' +
      'chain after it — and it is correct only because the argument strictly shrinks toward that base case. The cost ' +
      'difference is real: the loop keeps two locals, the recursion keeps a stack frame per node, and in JavaScript nothing ' +
      'guarantees those frames are cheap or removed.',
    walkthrough:
      'Naming the loop variable is part of the answer: the length of the list is asked by a caller that still needs the ' +
      'head, so a function that moves the head itself has destroyed the argument. The recursion is worth writing out ' +
      'because it is the template for every later chain property — depth, palindrome-ness, whether the tail satisfies ' +
      'something — and the shape is always the same: handle null, otherwise combine this node with the answer for the rest.',
    commonMistake:
      'Counting cursor.next instead of cursor so the empty list returns one, or keeping the length as a field that nothing updates.',
    whyWrong:
      'An empty chain has no next field to read, so the version that counts links either throws or reports a length the list does not have. A cached count is a second source of truth: every insert, delete and reversal has to remember to adjust it, and the first one that forgets makes the answer wrong in a way no reader of the length function can see.',
    followUps: [
      'Which one of your two versions can be made tail-recursive, and does JavaScript run it in constant space?',
      'A cached count is O(1) to read. List every operation that now has to maintain it.',
      'How does the same recursion give you the last node instead of the number of nodes?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function lengthOf(head) {\n' +
      '  let count = 0;\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    count += 1;\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return count;\n' +
      '}\n' +
      '\n' +
      'function lengthRec(head) {\n' +
      '  if (head === null) {\n' +
      '    return 0;\n' +
      '  }\n' +
      '  return 1 + lengthRec(head.next);\n' +
      '}',
    modify: 'Return the length and the last node from one walk. Why is that cheaper than calling the two functions separately?',
  },
  {
    step: 6,
    name: 'Search an element in the LL',
    difficulty: 'Easy',
    topicSlug: LINKED,
    stem: 'Find where a value first appears in a chain, and say which comparison you used and why.',
    brief: 'Input: a chain of numbers and a target. Output: the zero-based position of the first node holding that value, or -1. Cover the empty chain and a value that never appears. Say what your comparison does about NaN.',
    concepts: ['dsa-null-termination', 'dsa-linear-position-walk', 'dsa-value-versus-reference', 'dsa-boundary-conditions'],
    shortAnswer:
      'Advance a cursor and a counter together, compare each payload with the target, and return the counter at the match or -1 after null. There is no shortcut: search in a chain is the walk.',
    idealAnswer:
      'A chain has no indices to probe, so searching is visiting, and the only design choices are what counts as a match ' +
      'and where the counter stands when it happens. The index has to be carried alongside the cursor because the node ' +
      'itself does not know its own position — that asymmetry between array and list is the point of the exercise. ' +
      'Returning -1 rather than null keeps the answer in the numeric domain the caller can compare against, and the empty ' +
      'chain is not a special case at all: the loop body never runs and the same -1 falls out.',
    walkthrough:
      'Using Object.is instead of === is a deliberate choice worth being able to defend: it reports NaN as found when NaN ' +
      'is stored, where strict equality would answer that the list does not contain the value it does contain. The trade is ' +
      'that Object.is separates 0 from negative zero, which strict equality joins. Say which of the two matters for the ' +
      'data at hand rather than picking by habit.',
    commonMistake:
      'Returning the node instead of the position, or comparing with === and reporting that a stored NaN cannot be found.',
    whyWrong:
      'A caller that asked where the value is cannot use a node to index anything, and returning it leaks the structure into an answer that was supposed to be a number. The equality choice makes contains and indexOf disagree with each other on exactly one input, which is the kind of inconsistency that turns into a bug report later.',
    followUps: [
      'Write the variant that returns every position holding the value. Does the walk change at all?',
      'What would a chain sorted by value let you skip, and what would it still cost to get there?',
      'Which comparison do you want if the payloads are objects rather than numbers?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function indexOfValue(head, target) {\n' +
      '  let cursor = head;\n' +
      '  let index = 0;\n' +
      '  while (cursor !== null) {\n' +
      '    if (Object.is(cursor.value, target)) {\n' +
      '      return index;\n' +
      '    }\n' +
      '    cursor = cursor.next;\n' +
      '    index += 1;\n' +
      '  }\n' +
      '  return -1;\n' +
      '}\n' +
      '\n' +
      'function contains(head, target) {\n' +
      '  return indexOfValue(head, target) !== -1;\n' +
      '}',
    modify: 'Move a found node to the front on the way out. Which extra reference do you now need to keep during the walk?',
  },
  {
    step: 6,
    name: 'Introduction to Doubly LinkedList',
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Add the backward link and prove the chain is consistent in both directions.',
    brief: 'Input: numbers. Output: a chain whose nodes each hold a value, the node after and the node before. Read it forwards from the head and backwards from the tail, and state which pairs of links have to agree.',
    concepts: ['dsa-doubly-mirror-links', 'dsa-node-holds-reference', 'dsa-null-termination', 'dsa-linear-position-walk'],
    shortAnswer:
      'Every node gains a prev reference that mirrors the next of its predecessor: a.next is b exactly when b.prev is a. The head has prev null and the tail has next null.',
    idealAnswer:
      'A backward link buys the thing a singly chain cannot do cheaply: leave from where you already are. Deleting or ' +
      'inserting around a node you are holding stops needing a walk from the head, which is why the structure exists at ' +
      'all — an LRU cache is not fast because of prev, it is fast because a node can be unlinked the moment it is touched. ' +
      'The price is that every edit is now two links that must agree, and a half-applied edit leaves the chain in a state ' +
      'where walking forwards and walking backwards give different answers. That inconsistency is the failure mode, and it ' +
      'is invisible until someone reads the list from the wrong end.',
    walkthrough:
      'The builder writes each seam twice: the forward link from the node it is leaving and the backward link on the node ' +
      'it arrives at. Keeping a tail handle makes the build linear for the same reason as before, and the tail is also what '
      +
      'the backward read starts from. The checks worth running after any edit are the two boundary links and the mirror ' +
      'identity in the middle — prev pointing at the same object, not merely a node holding an equal value.',
    commonMistake:
      'Setting one direction of a seam and not the other, or assuming the head node has a prev to read.',
    whyWrong:
      'A one-way seam produces a chain that reads correctly forwards and stops early or loops backwards, which survives code review and fails in production at the least convenient function. Reading prev on the head gives null, and a walk that then dereferences it throws at position zero — the boundary that is supposed to be the easiest case.',
    followUps: [
      'Which operations became cheaper the moment prev existed, and which got more expensive?',
      'State the invariant between two neighbouring nodes in one sentence a reviewer could check.',
      'What does the structure cost per node that an array does not pay?',
    ],
    solution:
      'class DNode {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '    this.prev = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArrayD(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new DNode(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '      node.prev = tail;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArrayD(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function tailOf(head) {\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null && cursor.next !== null) {\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return cursor;\n' +
      '}\n' +
      '\n' +
      'function toArrayBack(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = tailOf(head);\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.prev;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function nodeAtD(head, index) {\n' +
      '  let cursor = head;\n' +
      '  let step = 0;\n' +
      '  while (cursor !== null && step < index) {\n' +
      '    cursor = cursor.next;\n' +
      '    step += 1;\n' +
      '  }\n' +
      '  return cursor;\n' +
      '}',
    modify: 'Make the backward read start from a tail handle the list keeps. Which of the walks in this file becomes O(1), and what new invariant does the handle create?',
  },
  {
    step: 6,
    name: 'Insert a node in DLL',
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Splice into a two-way chain and keep all four links honest.',
    brief: 'Input: a chain of numbers and either a node or a position, plus a value. Output: the chain with the new node between two existing ones, the head returned because it may have moved. Say in which order the writes have to happen.',
    concepts: ['dsa-doubly-mirror-links', 'dsa-link-splice-order', 'dsa-linear-position-walk', 'dsa-sentinel-head'],
    shortAnswer:
      'Attach the new node to both neighbours first, then let each neighbour point back at it: two writes out, two writes in, and the neighbour that does not exist is skipped.',
    idealAnswer:
      'A doubly linked insert is four writes with one rule: never drop a reference before something else holds it. Read in ' +
      'that order the code is mechanical — the new node takes the predecessor and the successor, then the successor gains ' +
      'a prev and the predecessor gains a next — and each of those four has a mirror partner, which is what makes the ' +
      'structure self-consistent. The two ends are the only real cases: at the front there is no predecessor, so the ' +
      'returned head has to be the new node, and at the back there is no successor, so the write that would set its prev ' +
      'must be guarded rather than attempted.',
    walkthrough:
      'Positional insert is the walk-to-predecessor from the singly version plus the second half of the seam, which is why ' +
      'a position beyond the end still appends correctly: the walk stops on the tail and the missing successor is simply ' +
      'skipped. Inserting from a node the caller is already holding is the case the structure exists for — no walk at ' +
      'all, and the reason an LRU cache can reattach a recency entry in constant time.',
    commonMistake:
      'Writing cursor.next before the new node has taken the old successor, or setting the new node into the middle without updating the successor on its backward link.',
    whyWrong:
      'The first order loses the rest of the chain before it is copied, so the node after the insertion point becomes unreachable. The second leaves a seam that reads correctly forwards and steps over the new node going backwards — a broken prev is invisible to every test that only ever calls toArray.',
    followUps: [
      'Which of the four writes can be reordered freely and which two are rigidly ordered?',
      'Insert a block of k nodes in one operation. What is the smallest number of writes?',
      'Why does this function return the head while insertAfter returns the new node?',
    ],
    solution:
      'class DNode {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '    this.prev = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArrayD(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new DNode(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '      node.prev = tail;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArrayD(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function tailOf(head) {\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null && cursor.next !== null) {\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return cursor;\n' +
      '}\n' +
      '\n' +
      'function toArrayBack(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = tailOf(head);\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.prev;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function nodeAtD(head, index) {\n' +
      '  let cursor = head;\n' +
      '  let step = 0;\n' +
      '  while (cursor !== null && step < index) {\n' +
      '    cursor = cursor.next;\n' +
      '    step += 1;\n' +
      '  }\n' +
      '  return cursor;\n' +
      '}\n' +
      '\n' +
      'function insertAfter(node, value) {\n' +
      '  const fresh = new DNode(value);\n' +
      '  fresh.prev = node;\n' +
      '  fresh.next = node.next;\n' +
      '  if (node.next !== null) {\n' +
      '    node.next.prev = fresh;\n' +
      '  }\n' +
      '  node.next = fresh;\n' +
      '  return fresh;\n' +
      '}\n' +
      '\n' +
      'function insertAtD(head, position, value) {\n' +
      '  if (head === null) {\n' +
      '    return new DNode(value);\n' +
      '  }\n' +
      '  if (position <= 0) {\n' +
      '    const fresh = new DNode(value);\n' +
      '    fresh.next = head;\n' +
      '    head.prev = fresh;\n' +
      '    return fresh;\n' +
      '  }\n' +
      '  const predecessor = nodeAtD(head, position - 1) || tailOf(head);\n' +
      '  insertAfter(predecessor, value);\n' +
      '  return head;\n' +
      '}',
    modify: 'Give the chain a sentinel pair, one node at each end. Which of the guards in this code disappears, and what does that buy when the chain is empty?',
  },
  {
    step: 6,
    name: 'Delete a node in DLL',
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Unlink from a node you are holding, and return a head that may have just moved.',
    brief: 'Input: a chain of numbers and either a node or a position. Output: the head of the chain without that node, and the node left with no links of its own. Say what happens to the head when the first node goes, and what you have to read before you unlink.',
    concepts: ['dsa-doubly-mirror-links', 'dsa-link-splice-order', 'dsa-boundary-conditions', 'dsa-linear-position-walk'],
    shortAnswer:
      'Let each survivor point past the victim — successor takes the predecessor, predecessor takes the successor — then clear the victim. Capture the new head before writing anything.',
    idealAnswer:
      'The prev link is what makes this the easy half of the doubly structure: a node knows its own predecessor, so ' +
      'deletion needs no walk and no sentinel, only the two mirrored writes and a guard for each end. The order around the ' +
      'writes is the substance of the answer. The head of the result is the successor of a removed first node, which means ' +
      'it has to be read while that link still exists; unlinking first clears the very reference the return value depends ' +
      'on. Clearing the victim afterwards is not decoration — a node still held elsewhere in the program must not stay ' +
      'wired into a chain it has left.',
    walkthrough:
      'The out-of-range position is handled by the walk running out rather than by a second check, so the function returns ' +
      'the chain unchanged instead of deleting the last node it saw. Note the two guards are independent: a one-node chain ' +
      'satisfies neither neighbour, and the same code that removes a middle node removes it, which is the sign the writes ' +
      'were factored in the right place.',
    commonMistake:
      'Reading cursor.next to find the new head after the victim has been cleared, or unlinking one side of the seam only.',
    whyWrong:
      'A cleared victim returns null from every field, so the head lookup has to happen before the unlink or the caller loses the chain. One-sided unlinking leaves the survivor pointing at a node that is no longer in the list: the forward walk still visits it, the backward walk does not, and the two disagree about what the data is.',
    followUps: [
      'Which of the two guards fires for a two-node chain, and for which end?',
      'Delete a whole span given its two endpoint nodes. How many writes is that?',
      'What breaks if unlink forgets to clear the victim itself?',
    ],
    solution:
      'class DNode {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '    this.prev = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArrayD(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new DNode(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '      node.prev = tail;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArrayD(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function tailOf(head) {\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null && cursor.next !== null) {\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return cursor;\n' +
      '}\n' +
      '\n' +
      'function toArrayBack(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = tailOf(head);\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.prev;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function unlink(node) {\n' +
      '  if (node === null) {\n' +
      '    return;\n' +
      '  }\n' +
      '  if (node.prev !== null) {\n' +
      '    node.prev.next = node.next;\n' +
      '  }\n' +
      '  if (node.next !== null) {\n' +
      '    node.next.prev = node.prev;\n' +
      '  }\n' +
      '  node.prev = null;\n' +
      '  node.next = null;\n' +
      '}\n' +
      '\n' +
      'function deleteAtD(head, position) {\n' +
      '  let cursor = head;\n' +
      '  let step = 0;\n' +
      '  while (cursor !== null && step < position) {\n' +
      '    cursor = cursor.next;\n' +
      '    step += 1;\n' +
      '  }\n' +
      '  if (cursor === null) {\n' +
      '    return head;\n' +
      '  }\n' +
      '  const replacement = cursor.prev === null ? cursor.next : head;\n' +
      '  unlink(cursor);\n' +
      '  return replacement;\n' +
      '}',
    modify: 'Keep the chain at a fixed capacity by evicting the tail node whenever it overflows. Why is that nearly free here and linear in a singly chain?',
  },
  {
    step: 6,
    name: 'Reverse a Doubly Linked List',
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Turn the chain around by editing nodes in place, and name the node that becomes the head.',
    brief: 'Input: a chain of numbers with forward and backward links. Output: the head of the same nodes in the opposite order, with no node allocated. State which reference the return value comes from, and what the invariant is halfway through the loop.',
    concepts: ['dsa-pointer-swap-mirror', 'dsa-doubly-mirror-links', 'dsa-reversal-trick', 'dsa-recursive-decomposition'],
    shortAnswer:
      'Swap prev and next on every node; the walk continues along the field that used to be next, and the last node visited is the new head.',
    idealAnswer:
      'A doubly linked node stores its two neighbours symmetrically, so reversing the list is not a restructuring but a ' +
      'per-node swap: after the swap on a node, the direction the chain runs in has changed for that one seam only. That ' +
      'makes the loop invariant precise and a little unsettling — halfway through, the visited nodes point backwards along ' +
      'the original order and the unvisited ones still point forwards, so the chain is two lists that meet at the cursor. ' +
      'The return value is the last node visited, which is the original tail, and there is no extra work at the ends ' +
      'because the nulls swap with everything else. No node is allocated, so the cost is the length of the chain in ' +
      'writes, four per node at most.',
    walkthrough:
      'The one detail that decides correctness is which field the walk follows after the swap: prev now holds what next ' +
      'held, so advancing by prev is what keeps the loop moving forwards through the original order, and a cursor update ' +
      'written the other way turns the loop around on the first node. The recursive form is the same swap on the way back ' +
      'up the stack, which is easier to read and harder to justify in space; the tail it returns is computed once and ' +
      'passed up unchanged.',
    commonMistake:
      'Advancing the cursor with the field that was overwritten rather than its mirror, or returning the original head.',
    whyWrong:
      'Following the wrong link sends the cursor back into the section it has already reversed, so the loop either stops immediately or revisits nodes it has swapped. Returning the original head gives a chain that reads backwards from a node whose prev is now populated — the caller sees the first element, then nothing, and the rest of the list is unreachable.',
    followUps: [
      'State the invariant at an arbitrary iteration as a sentence about two chains meeting.',
      'Reverse in place recursively. What does the call stack hold that the loop does not?',
      'Why does reversing twice give the original structure rather than a copy of it?',
    ],
    solution:
      'class DNode {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '    this.prev = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArrayD(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new DNode(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '      node.prev = tail;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArrayD(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function tailOf(head) {\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null && cursor.next !== null) {\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return cursor;\n' +
      '}\n' +
      '\n' +
      'function toArrayBack(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = tailOf(head);\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.prev;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function reverseD(head) {\n' +
      '  let cursor = head;\n' +
      '  let last = null;\n' +
      '  while (cursor !== null) {\n' +
      '    const before = cursor.prev;\n' +
      '    cursor.prev = cursor.next;\n' +
      '    cursor.next = before;\n' +
      '    last = cursor;\n' +
      '    cursor = cursor.prev;\n' +
      '  }\n' +
      '  return last;\n' +
      '}\n' +
      '\n' +
      'function reverseDRec(head) {\n' +
      '  if (head === null) {\n' +
      '    return null;\n' +
      '  }\n' +
      '  const tail = head.next === null ? head : reverseDRec(head.next);\n' +
      '  const before = head.prev;\n' +
      '  head.prev = head.next;\n' +
      '  head.next = before;\n' +
      '  return tail;\n' +
      '}',
    modify: 'Reverse only the first k nodes and leave the rest attached. Which two seams do you have to rejoin afterwards?',
  },
  {
    step: 6,
    name: 'Middle of a LinkedList (Tortoise-Hare)',
    difficulty: 'Easy',
    topicSlug: LINKED,
    stem: 'Return the middle node of a singly linked list. If there are two middles, return the second one.',
    brief: 'Input: head of a chain. Output: the node at position ⌊n/2⌋ using zero-based indexing. Use two pointers moving at different speeds; name both and say how many steps each takes.',
    concepts: ['dsa-linear-position-walk', 'dsa-fast-slow-pointers', 'dsa-null-termination'],
    shortAnswer:
      'Use fast and slow pointers: fast moves two steps per iteration, slow moves one. When fast reaches the end, slow is at the middle.',
    idealAnswer:
      'The fast–slow technique turns a length-unknown traversal into a race: if fast advances by two nodes while slow ' +
      'advances by one, then when fast hits null (or its next is null), slow has covered exactly half the distance. For ' +
      'an even-length list like [1,2,3,4], fast stops at null after visiting 4, and slow lands on 3 — the second middle, ' +
      'which matches the spec. The loop condition `fast !== null && fast.next !== null` guarantees we never dereference ' +
      'null, and the invariant is that slow is always at position floor(i/2) after i iterations.',
    walkthrough:
      'The key insight is that doubling the speed of one pointer halves the number of iterations needed to reach the end, ' +
      'and the slower pointer naturally ends up at the midpoint. Initialising both at head means the first iteration moves ' +
      'fast to head.next.next and slow to head.next, so after k iterations slow is at index k and fast is at index 2k. ' +
      'When fast exits at index n (null) or n−1 (last node), slow is at n/2.',
    commonMistake:
      'Initialising fast at head.next instead of head, which shifts the midpoint by one, or using the wrong loop condition and dereferencing null.',
    whyWrong:
      'Starting fast one step ahead makes it reach the end one iteration early, so slow stops one node before the true middle. And checking only `fast !== null` without `fast.next !== null` causes a crash on even-length lists when fast tries to read null.next.',
    followUps: [
      'How does this change if you want the first middle instead of the second?',
      'Can you find the middle in one pass without extra space? What about two passes?',
      'Extend this to find the k-th node from the end.',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const result = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    result.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return result;\n' +
      '}\n' +
      '\n' +
      'function findMiddle(head) {\n' +
      '  let slow = head;\n' +
      '  let fast = head;\n' +
      '  while (fast !== null && fast.next !== null) {\n' +
      '    slow = slow.next;\n' +
      '    fast = fast.next.next;\n' +
      '  }\n' +
      '  return slow;\n' +
      '}',
    modify: 'Find the middle node but return the first middle for even-length lists. How does the initialisation change?',
  },
  {
    step: 6,
    name: 'Reverse a LinkedList (Iterative & Recursive)',
    difficulty: 'Easy',
    topicSlug: LINKED,
    stem: 'Reverse a singly linked list in place and return the new head. Do not allocate new nodes.',
    brief: 'Input: head of a chain. Output: the same nodes in reverse order. Name the three pointers used and state the invariant after each iteration.',
    concepts: ['dsa-linear-position-walk', 'dsa-pointer-swap-mirror', 'dsa-null-termination'],
    shortAnswer:
      'Iterate with prev=null, curr=head, next=curr.next. At each step set curr.next=prev, then advance all three. Return prev when curr is null.',
    idealAnswer:
      'Reversing a singly linked list is a three-pointer dance: prev trails behind, curr is the node being rewired, and next ' +
      'holds the remainder of the original chain so it is not lost. Before each iteration, prev points to the already-reversed ' +
      'prefix, curr points to the first unreversed node, and next is curr.next. After setting curr.next = prev, the link is ' +
      'flipped, and advancing all three maintains the invariant. When curr becomes null, prev is the last node visited — the ' +
      'original tail — which is now the new head. No nodes are allocated; the cost is exactly n writes to .next fields.',
    walkthrough:
      'The mental model is peeling off the front node and prepending it to a growing reversed prefix. Initially the prefix ' +
      'is empty (prev = null). Each iteration detaches curr from the forward chain and attaches it to the prefix by pointing ' +
      'its .next backwards. The next pointer is critical: without saving it before the flip, the rest of the list is lost. ' +
      'The recursive version does the same work on the way back up the call stack, returning the original tail as the new head.',
    commonMistake:
      'Forgetting to save next before flipping curr.next, or returning curr instead of prev at the end.',
    whyWrong:
      'Losing the next pointer severs the chain after the first node, so only the first two elements are reversed and the rest vanish. Returning curr (which is null) gives an empty list instead of the reversed one.',
    followUps: [
      'Reverse the list recursively. What does the base case look like?',
      'Reverse only a sublist from position m to n. Which four boundaries must you reconnect?',
      'Why is reversing twice equivalent to the identity operation?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const result = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    result.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return result;\n' +
      '}\n' +
      '\n' +
      'function reverseList(head) {\n' +
      '  let prev = null;\n' +
      '  let curr = head;\n' +
      '  while (curr !== null) {\n' +
      '    const next = curr.next;\n' +
      '    curr.next = prev;\n' +
      '    prev = curr;\n' +
      '    curr = next;\n' +
      '  }\n' +
      '  return prev;\n' +
      '}',
    modify: 'Reverse every pair of adjacent nodes (swap in pairs). How does the pointer bookkeeping change?',
  },
  {
    step: 6,
    name: 'Detect a loop in LL',
    difficulty: 'Easy',
    topicSlug: LINKED,
    stem: 'Determine whether a singly linked list contains a cycle. Return true if any node is reachable by following next repeatedly, false otherwise.',
    brief: 'Input: head of a chain that may or may not loop back. Output: boolean. Use two pointers at different speeds; explain why they meet if and only if there is a cycle.',
    concepts: ['dsa-fast-slow-pointers', 'dsa-null-termination', 'dsa-cycle-detection'],
    shortAnswer:
      'Use Floyd\'s tortoise-and-hare: slow moves one step, fast moves two. If they ever point to the same node, there is a cycle. If fast reaches null, there is not.',
    idealAnswer:
      'If the list has no cycle, fast eventually reaches null because it advances faster than slow. If there is a cycle of ' +
      'length L, then once both pointers enter the cycle, the distance between them decreases by one each iteration (fast ' +
      'gains one step on slow per iteration), so they must meet within L steps. The meeting proves a cycle exists because ' +
      'in an acyclic list the only way two pointers can be equal is if they started at the same node — and they start at ' +
      'head but diverge immediately since fast moves twice as fast. The algorithm uses O(1) space and O(n) time.',
    walkthrough:
      'The intuition is a racetrack: if two runners start at the same point and one runs twice as fast, the faster runner ' +
      'laps the slower one. In a linear track (no cycle), the faster runner simply finishes first. The proof relies on the ' +
      'fact that the relative speed is 1 step per iteration, so the gap closes deterministically. Initialising both at head ' +
      'means the first check compares head with itself, so the loop body must advance before comparing, or the initial ' +
      'condition must exclude the trivial equality.',
    commonMistake:
      'Checking for equality before advancing, which returns true immediately for any non-empty list, or not handling the null check for fast.next.',
    whyWrong:
      'Comparing before advancing catches the initial state where both pointers are at head, producing a false positive for every list with at least one node. And skipping the fast.next null check crashes on even-length acyclic lists.',
    followUps: [
      'Once you detect a cycle, how do you find the node where the cycle begins?',
      'What is the length of the cycle?',
      'Can you detect a cycle using only one pointer and O(n) extra space?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArrayWithCycle(values, cycleAt) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  const nodes = [];\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    nodes.push(node);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  if (cycleAt >= 0 && cycleAt < nodes.length) {\n' +
      '    tail.next = nodes[cycleAt];\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function hasCycle(head) {\n' +
      '  if (head === null || head.next === null) return false;\n' +
      '  let slow = head;\n' +
      '  let fast = head;\n' +
      '  while (fast !== null && fast.next !== null) {\n' +
      '    slow = slow.next;\n' +
      '    fast = fast.next.next;\n' +
      '    if (slow === fast) return true;\n' +
      '  }\n' +
      '  return false;\n' +
      '}',
    modify: 'Find the starting node of the cycle. Once slow and fast meet, reset one pointer to head and advance both one step at a time — prove why they meet at the entry point.',
  },
  {
    step: 6,
    name: 'Find the starting point of the loop of LinkedList',
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Report the first node the loop begins at, not just that a loop exists.',
    brief: 'Input: the head of a list whose tail may point back at some earlier node. Output: that node, or null when the list never loops. Do it in constant extra space.',
    concepts: ['dsa-cycle-entry-proof', 'dsa-fast-slow-pointers', 'dsa-cycle-detection'],
    shortAnswer:
      'Let fast and slow collide inside the loop, then reset one pointer to the head and advance both one step at a time. Where they meet again is the entry node.',
    idealAnswer:
      'Detection is half the problem and says nothing about where the loop starts, so the answer is a second walk justified by a distance argument. Write the pre-loop length as mu and the ring length as lambda. At the collision the slow pointer has travelled mu plus some whole number of turns, while the fast pointer has travelled exactly twice as far; subtracting shows the distance from the collision node back around to the entry is a multiple of lambda, and it is also exactly mu. That is why resetting one pointer to the head works: the two walkers start mu apart in the only sense that matters, both move one node per step, and so they arrive at the entry on the same step. Cost is one pass to collide and at most one more to walk out, so linear time with two pointers and no visited set.',
    walkthrough:
      'The bookkeeping that makes this readable is splitting the walk into two named functions: the collision, which returns any node inside the ring rather than the entry, and the second phase, which walks from the head and from that node together. Returning a ring node from phase one is honest about what Floyd gives you — the meeting point depends on the ring length and on where you entered it, and is almost never the entry. The second loop compares the two pointers before advancing them is the safe order, since if the head itself is the entry — a self-loop on the first node, or a ring that starts at index zero — they already agree and must not be moved past each other.',
    commonMistake:
      'Reporting the collision node as the entry, or keeping the two-step speed in the second phase so the pointers pass each other inside the ring.',
    whyWrong:
      'The meeting node is a function of the ring length and the entry offset, so on a list like 1,2,3,4 with the tail pointing at 2 it typically reports 3 or 4 rather than 2 and the answer is wrong on the first test. Continuing to move fast by two in phase two leaves the pointers chasing each other around the ring; they may still meet, but the node they meet at has no relationship to the entry, so the result is unstable across shapes.',
    followUps: [
      'Why does the second phase need both pointers to move exactly one step, and what breaks if one moves two?',
      'What are mu and lambda in your own list, and how would you measure them from the code?',
      'Give the version that uses a visited set. What does it cost, and what does it buy you?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArrayWithCycle(values, cycleAt) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  const nodes = [];\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    nodes.push(node);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  if (cycleAt >= 0 && cycleAt < nodes.length) {\n' +
      '    tail.next = nodes[cycleAt];\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function meetNode(head) {\n' +
      '  let slow = head;\n' +
      '  let fast = head;\n' +
      '  while (fast !== null && fast.next !== null) {\n' +
      '    slow = slow.next;\n' +
      '    fast = fast.next.next;\n' +
      '    if (slow === fast) return slow;\n' +
      '  }\n' +
      '  return null;\n' +
      '}\n' +
      '\n' +
      'function cycleEntry(head) {\n' +
      '  let meet = meetNode(head);\n' +
      '  if (meet === null) return null;\n' +
      '  let fromHead = head;\n' +
      '  while (fromHead !== meet) {\n' +
      '    fromHead = fromHead.next;\n' +
      '    meet = meet.next;\n' +
      '  }\n' +
      '  return fromHead;\n' +
      '}',
    modify: 'Return the entry node and the ring length together in one pass. Which walk gives you the length without a second traversal of the list?',
  },
  {
    step: 6,
    name: 'Length of Loop in LinkedList',
    difficulty: 'Easy',
    topicSlug: LINKED,
    stem: 'Count the nodes that are inside the loop, and report zero when there is no loop.',
    brief: 'Input: the head of a list that may loop. Output: how many nodes are on the ring, so 1 for a self-loop and 0 for an acyclic list. Constant space.',
    concepts: ['dsa-ring-measurement', 'dsa-cycle-detection', 'dsa-fast-slow-pointers'],
    shortAnswer:
      'Find any node on the ring with fast and slow pointers, then walk next from it, counting, until you are back at that same node.',
    idealAnswer:
      'The count belongs to the ring itself, not to the list, so the whole problem reduces to two facts: get one node that is certainly on the ring, then make exactly one turn of it. Floyd gives the first for free, and the second is a cursor that starts at the meeting node, steps once per iteration, and stops when it returns — the stop condition is node identity, never a value comparison, because a ring of nodes holding the same number is still one node per link. Starting the count at one and moving before comparing, or comparing after moving, are the same off-by-one decision written twice; the version here counts the meeting node, then walks the links leaving it. A list with no ring has no meeting node, so the honest answer is zero rather than an exception.',
    walkthrough:
      'Measuring from a node you already hold is why this does not need to know where the ring begins: any node on the ring gives the same count once you walk back to it. The identity stop condition is what makes a self-loop cost one and a two-node ring cost two, where a value comparison would stop immediately on a ring of equal values and report one. Detecting and measuring are kept as separate functions because the detection walk is the expensive one, and a reader asking for the entry node or the ring length should be able to reuse it unchanged.',
    commonMistake:
      'Counting by comparing node values, or starting the walk from the head and hoping to notice the ring.',
    whyWrong:
      'A ring built from nodes all holding the same value reports a length of one under a value comparison, which is the input a reviewer writes first. From the head there is no signal that the ring started: the walk never terminates, so the count is not wrong so much as never finished, and an acyclic list silently returns nothing instead of zero.',
    followUps: [
      'Why is the stop condition a node identity rather than a value?',
      'Give the answer for a self-loop on the head node without running the code.',
      'What would change if the list were doubly linked and you could walk either way around the ring?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArrayWithCycle(values, cycleAt) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  const nodes = [];\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    nodes.push(node);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  if (cycleAt >= 0 && cycleAt < nodes.length) {\n' +
      '    tail.next = nodes[cycleAt];\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function meetNode(head) {\n' +
      '  let slow = head;\n' +
      '  let fast = head;\n' +
      '  while (fast !== null && fast.next !== null) {\n' +
      '    slow = slow.next;\n' +
      '    fast = fast.next.next;\n' +
      '    if (slow === fast) return slow;\n' +
      '  }\n' +
      '  return null;\n' +
      '}\n' +
      '\n' +
      'function loopLength(head) {\n' +
      '  const meet = meetNode(head);\n' +
      '  if (meet === null) return 0;\n' +
      '  let length = 1;\n' +
      '  let cursor = meet.next;\n' +
      '  while (cursor !== meet) {\n' +
      '    length += 1;\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return length;\n' +
      '}',
    modify: 'Report the longest acyclic prefix — how many nodes are reachable before the ring is entered. Which walk gives that once you already hold the entry node?',
  },
  {
    step: 6,
    name: 'Check if LL is palindrome or not',
    difficulty: 'Easy',
    topicSlug: LINKED,
    stem: 'Decide whether the values read the same forwards and backwards, in linear time and constant space.',
    brief: 'Input: a singly linked list. Output: true or false. You may not copy the values into an array, and the list should still be intact when you return.',
    concepts: ['dsa-reverse-half-comparison', 'dsa-fast-slow-pointers', 'dsa-null-termination'],
    shortAnswer:
      'Find the middle, reverse the second half in place, walk the two halves together comparing values, then reverse the second half back.',
    idealAnswer:
      'A palindrome test needs both ends at once, and a singly list only hands you the front, so the trick is to make the back reachable by reversing it rather than by storing it. The middle from the fast-and-slow walk is the second middle on an even list and the exact centre on an odd one, which is precisely the split that makes the two comparison walks equal length: reverse from the node after the middle and the shorter half decides when the walk ends, so an odd centre never has to be special-cased. Comparison runs to the end of the reversed tail, not of the head half, because the head half is at least as long. Reversing back before returning is what makes the function observable-safe: the same list passed twice must give the same answer, and a caller who reads the list after the call must not see it reordered.',
    walkthrough:
      'Two details carry the whole solution. The first is that the comparison loop must not stop early on a mismatch: setting a flag and continuing is what allows the restore to run, where an early return would leave the tail permanently reversed. The second is that the restore recomputes the middle rather than remembering it, which costs one walk and avoids holding a pointer whose meaning changed when the tail was flipped. Empty and single-node lists are true by the definition the caller expects, and the guard for them is placed before any pointer is dereferenced rather than relying on the walk to fall through.',
    commonMistake:
      'Returning from inside the comparison loop, or reversing the whole list and comparing it against itself.',
    whyWrong:
      'The early return leaves the second half reversed, so a caller that prints the list afterwards sees the values in the wrong order and the function is not idempotent. Reversing the entire list destroys the only handle to the first half before it has been compared, so the walk either reports true for every input or ends at null having compared nothing.',
    followUps: [
      'Which node does the fast-and-slow walk land on for an even length, and why does that remove the odd-versus-even branch?',
      'Write the version that copies into an array. What does it cost in space, and is the restore problem gone?',
      'How would you report the longest palindromic run instead of a yes-no answer?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function middleOf(head) {\n' +
      '  let slow = head;\n' +
      '  let fast = head;\n' +
      '  while (fast !== null && fast.next !== null) {\n' +
      '    slow = slow.next;\n' +
      '    fast = fast.next.next;\n' +
      '  }\n' +
      '  return slow;\n' +
      '}\n' +
      '\n' +
      'function reverseFrom(node) {\n' +
      '  let previous = null;\n' +
      '  let cursor = node;\n' +
      '  while (cursor !== null) {\n' +
      '    const ahead = cursor.next;\n' +
      '    cursor.next = previous;\n' +
      '    previous = cursor;\n' +
      '    cursor = ahead;\n' +
      '  }\n' +
      '  return previous;\n' +
      '}\n' +
      '\n' +
      'function isListPalindrome(head) {\n' +
      '  if (head === null || head.next === null) return true;\n' +
      '  const middle = middleOf(head);\n' +
      '  const reversedTail = reverseFrom(middle.next);\n' +
      '  let left = head;\n' +
      '  let right = reversedTail;\n' +
      '  let same = true;\n' +
      '  while (right !== null) {\n' +
      '    if (left.value !== right.value) same = false;\n' +
      '    left = left.next;\n' +
      '    right = right.next;\n' +
      '  }\n' +
      '  middle.next = reverseFrom(reversedTail);\n' +
      '  return same;\n' +
      '}',
    modify: 'Now report the length of the longest palindromic run in the list. Which part of this mechanism survives that change?',
  },
  {
    step: 6,
    name: 'Remove Nth node from the back of the LL',
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Delete the node n places from the end in a single pass, including when it is the head.',
    brief: 'Input: a list and n counted from the tail. Output: the list with that one node gone. One traversal of the links, and n larger than the length must not corrupt it.',
    concepts: ['dsa-gap-keeping-runner', 'dsa-sentinel-head', 'dsa-link-splice-order'],
    shortAnswer:
      'Advance a leader n nodes from a sentinel, then move leader and trailer together until the leader holds the last node. The trailer is the predecessor of the node to unlink.',
    idealAnswer:
      'A singly list cannot be walked backwards, so counting from the end has to be paid for either by two passes — length, then length minus n — or by one pass that carries the offset in the gap between two pointers. The one-pass form is the interesting answer: giving the leader a head start of exactly n links means the pair is always n apart, so when the leader is on the final node the trailer is on the node before the victim, which is the only node whose next field has to change. The sentinel is not decoration. Deleting the first node means deleting the head, and the handle the caller holds is what must be rewritten; a trailer standing on a real node could not do that, so the dummy in front makes position zero the same code as every other position and the function returns sentinel.next rather than a special-cased head. An n beyond the length is refused before the second walk begins, leaving the list untouched.',
    walkthrough:
      'The order of the three writes in the splice is the part a reviewer checks. trailer.next = trailer.next.next reads the survivor link and then installs it, so the victim is the only node dropped and everything after it is still reachable; writing the victim to null first would detach the tail. The gap loop decrements a counter rather than measuring a length, which is what keeps the pass single: after it the two pointers are held n apart by construction, not by arithmetic on a number that was never computed. Returning sentinel.next unconditionally is the reason the front deletion needs no branch, and it is worth saying out loud that the sentinel is the only node the caller never sees.',
    commonMistake:
      'Walking the trailer onto the victim instead of its predecessor, or walking the leader to null rather than to the last node.',
    whyWrong:
      'A trailer on the victim has no predecessor, so the only way to remove it is to copy its value forward and splice its successor — wrong for a list where identity matters and visibly wrong when the victim is the last node. Advancing the leader until it is null leaves the trailer one link too far forward, so the returned list is missing the node before the one that was asked for.',
    followUps: [
      'Which node is the trailer standing on when the leader is on the last one, and why is that the node you need?',
      'Write the two-pass version. What does it cost, and what does it make easier to read?',
      'How does the code change if n can be zero or negative?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function removeNthFromEnd(head, n) {\n' +
      '  const sentinel = new Node(0);\n' +
      '  sentinel.next = head;\n' +
      '  let leader = sentinel;\n' +
      '  for (let step = 0; step < n; step += 1) {\n' +
      '    if (leader.next === null) return sentinel.next;\n' +
      '    leader = leader.next;\n' +
      '  }\n' +
      '  let trailer = sentinel;\n' +
      '  while (leader.next !== null) {\n' +
      '    leader = leader.next;\n' +
      '    trailer = trailer.next;\n' +
      '  }\n' +
      '  trailer.next = trailer.next.next;\n' +
      '  return sentinel.next;\n' +
      '}',
    modify: 'Remove every node whose value equals a given key, still in one pass. Which pointer now needs the sentinel, and does the leader still get a head start?',
  },
  {
    step: 6,
    name: 'Delete the middle node of LL',
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Unlink the middle of a list without counting its length first.',
    brief: 'Input: a list. Output: the same list with its middle node gone; on an even length, the second of the two middles. A one-node list becomes empty.',
    concepts: ['dsa-fast-slow-pointers', 'dsa-link-splice-order', 'dsa-linear-position-walk'],
    shortAnswer:
      'Walk slow one step and fast two, keeping a pointer to where slow came from. When fast runs out, slow is the middle and the trailer is its predecessor.',
    idealAnswer:
      'The middle is a position, and finding a position normally costs a count; the fast-and-slow walk replaces that count with a ratio, so slow is on the middle at exactly the step fast runs off the end. Deleting needs the predecessor rather than the node itself, since only a predecessor owns the link being changed, and that is why the third pointer is carried: assigning before = slow at the top of each iteration leaves before on the node before slow when the loop ends. The even-length rule falls out of where the walk stops. With fast starting at the head, a four-node walk ends with slow on the third node, which is the second of the two middles — the convention the problem states, and the one that makes a two-node list reduce to its first node. The one-node list cannot be walked at all, so the guard returns null as the new head rather than letting the splice dereference a missing node.',
    walkthrough:
      'Ordering is the whole risk: before has to be written before slow moves, and the splice has to read slow.next before overwriting it. A list where the middle is the last node before null cannot occur, because slow only advances while fast has two links available. Counting length first and then walking length divided by two is a correct two-pass answer and worth naming as the alternative; the single-walk form is preferred here because it is the same three lines that detect a cycle or split a list, and a reviewer reading for pointer control will look for that pattern.',
    commonMistake:
      'Starting slow one node ahead of fast, or splicing with slow.next = slow.next.next after slow has already moved past its predecessor.',
    whyWrong:
      'An offset start shifts the landing node by one, so the wrong element is deleted and the error is invisible on odd lengths and obvious on even ones. Without the trailer pointer there is no way to unlink slow at all: writing through slow only rewrites the middle node, which detaches the tail and loses every node after it.',
    followUps: [
      'Change the code so the first of the two middles is deleted instead. Which line moves?',
      'Split the list into two halves at the middle and return both heads. What does the splice become?',
      'What is the two-pass version, and when is it the better read?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function deleteMiddle(head) {\n' +
      '  if (head === null || head.next === null) return null;\n' +
      '  let slow = head;\n' +
      '  let fast = head;\n' +
      '  let before = null;\n' +
      '  while (fast !== null && fast.next !== null) {\n' +
      '    before = slow;\n' +
      '    slow = slow.next;\n' +
      '    fast = fast.next.next;\n' +
      '  }\n' +
      '  before.next = slow.next;\n' +
      '  return head;\n' +
      '}',
    modify: 'Return both halves after splitting at the middle instead of deleting anything. Which pointer now has to be cut, and in what order?',
  },
  {
    step: 6,
    name: 'Find the intersection point of Y LL',
    difficulty: 'Easy',
    topicSlug: LINKED,
    stem: 'Report the node where two lists that share a tail first meet, in one walk and constant space.',
    brief: 'Input: two list heads that may join at some node and share every node after it. Output: that node, or null. Compare nodes, not values.',
    concepts: ['dsa-equalised-distance-walk', 'dsa-null-termination', 'dsa-linear-position-walk'],
    shortAnswer:
      'Walk both lists; when a pointer runs off the end, send it to the other head. The two then travel the same total distance and meet on the shared node, or both reach null together.',
    idealAnswer:
      'The obstacle is that the two prefixes differ in length, so a paired walk starting at both heads drifts and never compares the same position twice. Switching heads fixes it arithmetically: pointer A walks its own prefix, then the other prefix, and pointer B the reverse, so each covers prefixA plus prefixB plus the shared tail before either can run past the junction — equal distance, therefore the same node at the same step. The comparison has to be node identity because a shared value says nothing about a shared node, and it is exactly what makes a Y shape different from two lists that merely look alike. The termination case is the same argument: with no junction, both walks end at null on the same step, so the loop exits having proven nothing was shared rather than spinning forever.',
    walkthrough:
      'The version that counts both lengths, advances the longer list by the difference, and then walks in lockstep is the same idea with arithmetic made explicit, and it is worth being able to give — it trades the switch for two passes, and a reader who distrusts the trick prefers it. The null-handling guard exists because the loop condition dereferences nothing but the body would on a bare call: if either head is null the lists cannot share a node, so returning null immediately is both correct and the only case where the switch argument fails to hold. Both builders in the solution exist to make the test honest: the shared nodes are allocated once and hung from both prefixes, so the intersection is a real join rather than equal values.',
    commonMistake:
      'Comparing node values instead of node references, or restarting the walk from the original head every time a pointer reaches null.',
    whyWrong:
      'Two lists carrying the same numbers in the same order are not the same list, and a value comparison returns a junction that does not exist. Restarting from a saved head without switching to the other list keeps the length difference in play, which is the exact bug the switch removes, and a list pair with no junction then never terminates.',
    followUps: [
      'Give the two-pass version that measures both lengths. Why does it need only one switch?',
      'What does the walk return when both lists are already the same list?',
      'If the shared tail were a cycle instead of a null end, would this loop stop?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function chain(values, tail) {\n' +
      '  let cursor = tail === undefined ? null : tail;\n' +
      '  for (let index = values.length - 1; index >= 0; index -= 1) {\n' +
      '    const node = new Node(values[index]);\n' +
      '    node.next = cursor;\n' +
      '    cursor = node;\n' +
      '  }\n' +
      '  return cursor;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function intersection(headA, headB) {\n' +
      '  if (headA === null || headB === null) return null;\n' +
      '  let a = headA;\n' +
      '  let b = headB;\n' +
      '  while (a !== b) {\n' +
      '    a = a === null ? headB : a.next;\n' +
      '    b = b === null ? headA : b.next;\n' +
      '  }\n' +
      '  return a;\n' +
      '}',
    modify: 'Report the length of each prefix before the junction as well as the node. Which of the two versions — switch or count — makes that cheaper to state?',
  },
  {
    step: 6,
    name: 'Segrregate odd and even nodes in LL',
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Gather the nodes at odd positions in front of the nodes at even positions, keeping the order inside each group.',
    brief: 'Input: a list. Output: the same nodes, all 1st, 3rd, 5th positions first, then 2nd, 4th, 6th, each group in its original order. No new nodes and no value reordering.',
    concepts: ['dsa-parity-chains', 'dsa-link-splice-order', 'dsa-null-termination'],
    shortAnswer:
      'Walk the list with one pointer per parity, relinking each node to the next of the same parity, then join the tail of the odd chain to the head of the even chain.',
    idealAnswer:
      'Positions, not values, decide the group, so the answer is a partition by index parity that never disturbs the order inside a group — which rules out sorting and rules out moving values around. The mechanism is two chains built in lockstep: each step gives the odd pointer the node after it and the even pointer the node after that, so both advance by two links while the nodes between them are handed to the other chain. Keeping the even head is mandatory, since it is the only handle to the second group once the first chain starts pointing past it. One stitch at the end — the last odd node to the saved even head — finishes the list, and the loop stops when the even pointer runs out of links, which is why the guard is written on even and even.next rather than on both chains.',
    walkthrough:
      'Two nodes and one node are the cases that show the code is honest: a two-node list is already segregated, and a one-node list must be returned unchanged rather than dereferenced, so both are answered by the early guard instead of by the loop. The order of the four writes inside the step matters: odd.next is assigned before odd moves, and even.next is then read from the node odd now stands on, which is the node the even chain is about to adopt. Writing the two assignments in the opposite order makes a chain point at a node that has already been handed to the other chain, and the list loses a node in the middle.',
    commonMistake:
      'Reordering by value parity, or forgetting the saved even head and stitching to whatever the even pointer ends on.',
    whyWrong:
      'Grouping odd-valued nodes in front of even-valued ones is a different problem and fails the first input whose values do not track their positions. Without the saved head the even chain has no front: the even pointer sits on the last node or on null, so the stitched list either loops or drops every node after position two.',
    followUps: [
      'Which pointer decides when the walk stops, and why not the other one?',
      'Give the version that groups by value parity instead. What does it need that this one does not?',
      'Would a doubly linked list make this cheaper, and if so where exactly?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function oddThenEven(head) {\n' +
      '  if (head === null || head.next === null) return head;\n' +
      '  const evenHead = head.next;\n' +
      '  let odd = head;\n' +
      '  let even = evenHead;\n' +
      '  while (even !== null && even.next !== null) {\n' +
      '    odd.next = even.next;\n' +
      '    odd = odd.next;\n' +
      '    even.next = odd.next;\n' +
      '    even = even.next;\n' +
      '  }\n' +
      '  odd.next = evenHead;\n' +
      '  return head;\n' +
      '}',
    modify: 'Segregate by value instead: every even-valued node before every odd-valued one, order kept inside each group. Which chain do you now keep a head for?',
  },
  {
    step: 6,
    name: "Sort a LL of 0's 1's and 2's",
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Order a list whose nodes carry only 0, 1 and 2 in two passes and without allocating nodes.',
    brief: 'Input: a list of 0s, 1s and 2s. Output: the same nodes in non-decreasing order. Only three distinct values are present, and that is the whole hint.',
    concepts: ['dsa-count-then-overwrite', 'dsa-linear-position-walk', 'dsa-null-termination'],
    shortAnswer:
      'Count how many of each value there are in one walk, then walk again writing the zeros, then the ones, then the twos into the nodes you already have.',
    idealAnswer:
      'A general sort would cost the length times its logarithm and would relink every node, and neither is needed when the key domain is three values wide. Counting gives three numbers in one pass, and the second pass converts those counts into a run length per value, so the work is two walks and a fixed three-slot array. Rewriting values rather than re-threading links is the deliberate trade: the nodes stay exactly where they were, so nothing can be lost mid-splice, and the only invariant to hold is that the number of writes equals the number of nodes. The zero-count case has to be skipped without advancing the cursor, which is what the value counter does when a bucket runs dry.',
    walkthrough:
      'The second walk is a fill, not a search: it consumes the counts in order, so a reviewer can read the intended output length directly from the three counters. Advancing the value index on an empty bucket without writing is the one place a naive loop mis-times itself, because the cursor would then run past the end of the list on an input like all-twos. Sorting by relinking into three chains and stitching them is the alternative worth naming: it keeps node identity intact when identity carries meaning, and costs the same two passes plus two saved heads per chain.',
    commonMistake:
      'Counting the values and then rebuilding the list with new nodes, or assuming the buckets are all non-empty.',
    whyWrong:
      'New allocation is the cost the problem is trying to avoid, and it leaves the old chain to be garbage collected node by node while doubling the peak memory. An empty bucket that is treated as a live one writes a value that was never in the input, and the fill then runs one node long, dereferencing past the tail.',
    followUps: [
      'Rewrite it as three chains and one stitch. What does that version buy when node identity matters?',
      'Why is this linear when merge sort on the same list is linear times logarithmic?',
      'How many writes does the second pass make for a list of length n, exactly?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function sortZeroOneTwo(head) {\n' +
      '  const counts = [0, 0, 0];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    counts[cursor.value] += 1;\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  cursor = head;\n' +
      '  let value = 0;\n' +
      '  while (cursor !== null) {\n' +
      '    if (counts[value] === 0) {\n' +
      '      value += 1;\n' +
      '      continue;\n' +
      '    }\n' +
      '    cursor.value = value;\n' +
      '    counts[value] -= 1;\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return head;\n' +
      '}',
    modify: 'Now the keys are 0 through 255. Which part of this answer stops being constant, and at what point would you relink instead?',
  },
  {
    step: 6,
    name: 'Reverse LL in group of given size K',
    difficulty: 'Hard',
    topicSlug: LINKED,
    stem: 'Reverse the list in fixed-size groups and reconnect every group to the next without losing the front of the list.',
    brief: 'Input: a list and a group size k. Output: each block of k nodes reversed, in place, with the blocks still in order. A final block shorter than k stays reversed-to-the-end as the recursion decides.',
    concepts: ['dsa-group-boundary-rewind', 'dsa-sentinel-head', 'dsa-link-splice-order', 'dsa-pointer-swap-mirror'],
    shortAnswer:
      'For each group, find the kth node, reverse the k links inside it against the node after the group, then attach the node before the group to the old last node and step the walk forward to the old first node.',
    idealAnswer:
      'Reversing one group is the ordinary three-pointer flip with a twist: the flip is seeded with the node after the group instead of with null, which is what keeps the reversed block joined to the rest of the list rather than cut off from it. That alone is not enough, because two references survive the flip and both are needed afterwards — the kth node, which becomes the front of the block, and the original first node, which becomes its back — so the group is defined by its boundaries before its interior is touched. A sentinel in front of the head makes the first block use the same reconnect code as every later one, and it is what lets the function return one value for the new head. Deciding what to do with a short final block is a specification choice, not a detail: either it is left in place, which is the cheaper rule and the one taken here, or the walk reverses whatever fewer than k nodes remain, which costs a second boundary test.',
    walkthrough:
      'The four writes per group have a strict order. The kth node is located first, because after the flip the links inside the block no longer lead forward to it. Then after, previous and cursor are set so the flip never has to null-terminate a block by hand. groupBefore.next is only reassigned once the old front is captured, and capturing it afterwards is the classic corruption: the old front is now the tail of the reversed block and the walk would restart one node too late, reversing the same nodes twice. Cost is one pass with a k-step probe per group — every node is visited a constant number of times, so linear, with only pointers held.',
    commonMistake:
      'Seeding the reversal with null, or reading the old front of the group after the flip instead of before it.',
    whyWrong:
      'Reversing against null detaches the block from everything after it, so the returned list ends at the first group boundary and the rest is unreachable. Reading the front after the flip gives the tail of the reversed block, which sends the next iteration back into nodes it has already reversed and either loops or leaves the list in a half-ordered state.',
    followUps: [
      'Give the recursive version. What does it return, and what does the call stack cost?',
      'Change the rule so only full groups are reversed. Which line is the decision?',
      'Reverse every group from the end instead of the front. Why does that need a second pass?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function reverseKGroups(head, k) {\n' +
      '  if (k < 2) return head;\n' +
      '  const sentinel = new Node(0);\n' +
      '  sentinel.next = head;\n' +
      '  let groupBefore = sentinel;\n' +
      '  for (;;) {\n' +
      '    let kth = groupBefore;\n' +
      '    for (let step = 0; step < k; step += 1) {\n' +
      '      if (kth.next === null) return sentinel.next;\n' +
      '      kth = kth.next;\n' +
      '    }\n' +
      '    const after = kth.next;\n' +
      '    const oldFront = groupBefore.next;\n' +
      '    let previous = after;\n' +
      '    let cursor = oldFront;\n' +
      '    for (let step = 0; step < k; step += 1) {\n' +
      '      const ahead = cursor.next;\n' +
      '      cursor.next = previous;\n' +
      '      previous = cursor;\n' +
      '      cursor = ahead;\n' +
      '    }\n' +
      '    groupBefore.next = kth;\n' +
      '    groupBefore = oldFront;\n' +
      '  }\n' +
      '}',
    modify: 'Reverse only complete groups and leave a short tail alone, then reverse only when the remaining nodes are at least k. Which check moves, and which one disappears?',
  },
  {
    step: 6,
    name: 'Rotate a LL',
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Move the last k nodes to the front of the list in one pass over the links.',
    brief: 'Input: a list and a non-negative k. Output: the list rotated right by k, where k larger than the length wraps and a multiple of the length changes nothing.',
    concepts: ['dsa-ring-closure-rotate', 'dsa-linear-position-walk', 'dsa-link-splice-order'],
    shortAnswer:
      'Find the tail and the length, join tail to head, then walk to node length minus k minus one from the front and cut there. The node after the cut is the new head.',
    idealAnswer:
      'Rotation preserves every link except one, so the cheapest honest description is: make the list circular, choose the new break point, break it there. Turning a right rotation of k into a left walk of length minus k is the arithmetic that decides where the cut lands, and taking k modulo the length first is what makes a shift larger than the list cost the same walk as a small one. The length is unavoidable in a singly list — the break point is defined from the end — so the pass that finds the tail is doing two jobs at once, and that is the reason this is two walks rather than one. Returning the original head when the reduced shift is zero is the case where a cut would be made at the tail itself, which is a legal operation but leaves the list identical and costs a dereference of a node that may not exist.',
    walkthrough:
      'Writing the cut as walk-to-predecessor then three assignments — new head saved, cut set to null, old tail set to the old head — is the order that survives a single-node list and a two-node list, the shapes where an off-by-one either loops the list back onto itself or returns nothing. Closing the ring before cutting means the walk can never run off the end, which is why no bounds guard is needed between the length pass and the cut. The alternative of moving the last node to the front k times is correct but costs the length per rotation, and it is the version a reviewer will ask you to explain away.',
    commonMistake:
      'Rotating left when the problem counts from the right, or cutting before joining the tail to the head.',
    whyWrong:
      'The two directions land on different nodes for every k that is not half the length, so the answer is wrong on the first example a reviewer tries. Cutting before the join leaves the walk holding a list that ends at null where the tail used to be, and the nodes after the cut become unreachable before they are ever attached.',
    followUps: [
      'Why is one pass enough once the tail is known, and what does it mean for the cut position?',
      'Give the k-times version and state its cost against this one.',
      'Rotate left by k instead. Which expression changes?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function rotateRight(head, k) {\n' +
      '  if (head === null || head.next === null || k === 0) return head;\n' +
      '  let tail = head;\n' +
      '  let length = 1;\n' +
      '  while (tail.next !== null) {\n' +
      '    tail = tail.next;\n' +
      '    length += 1;\n' +
      '  }\n' +
      '  const shift = k % length;\n' +
      '  if (shift === 0) return head;\n' +
      '  let cut = head;\n' +
      '  for (let step = 1; step < length - shift; step += 1) {\n' +
      '    cut = cut.next;\n' +
      '  }\n' +
      '  const newHead = cut.next;\n' +
      '  cut.next = null;\n' +
      '  tail.next = head;\n' +
      '  return newHead;\n' +
      '}',
    modify: 'Rotate left by k with the same two moves. What is the cut position now, and does the ring still need closing first?',
  },
  {
    step: 6,
    name: 'Add 2 numbers in LL',
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Add two numbers stored one digit per node, least significant digit first, without converting to a number.',
    brief: 'Input: two lists of digits, units node first. Output: a new list holding their sum, same order. The lists differ in length and the sum may gain a digit.',
    concepts: ['dsa-carry-forward-pass', 'dsa-sentinel-head', 'dsa-null-termination', 'dsa-digit-extraction'],
    shortAnswer:
      'Walk both lists together from the heads, add the two digits and the carry, write the remainder as a new node, keep the tens as the carry, and keep going while either list or the carry is still alive.',
    idealAnswer:
      'Least-significant-first is the storage order that makes this a single forward pass: the digits that combine are the ones the walkers are already on, and the carry moves in the only direction a singly list can be read. Reading a number as an integer and writing it back is not an option for a list long enough to exceed the exact-integer window, so the arithmetic has to stay digit-wise — and even for short inputs the digit version has no special case at the length limit. The loop condition carries three terms rather than two, because a final carry past both lists is a digit of the answer, not an overflow of it: ninety-nine plus one is a three-node result from two short inputs. A sentinel gives the builder a place to start writing without deciding, mid-loop, whether the first node is special.',
    walkthrough:
      'The two walkers advance independently and each is guarded before it is read, which is how an uneven pair of lengths is handled without padding or pre-counting. Keeping the carry out of the node constructor — total first, then the two derived values — is what makes the base of the number visible in the code, so a reviewer can change the radix in one place. The answer is allocated as it is written, one node per digit, and the input lists are never touched; a variant that reuses the longer list in place exists and is worth naming when allocation is the cost being discussed.',
    commonMistake:
      'Stopping when both lists run out, or reversing the lists to add from the most significant digit.',
    whyWrong:
      'A dropped final carry returns the right digits in the wrong length: the sum of nine-nine-nine and one comes back as three nodes rather than four. Reversing first solves a problem the storage order already solved, and the carry then has to travel backwards, which a singly list cannot do without a second reversal or a stack.',
    followUps: [
      'What is the maximum length of the answer for inputs of length m and n?',
      'Give the version where the digits are stored most significant first. What does it cost?',
      'Why does this loop need three conditions where the palindrome walk needed two?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function addTwoNumbers(a, b) {\n' +
      '  const sentinel = new Node(0);\n' +
      '  let write = sentinel;\n' +
      '  let carry = 0;\n' +
      '  let x = a;\n' +
      '  let y = b;\n' +
      '  while (x !== null || y !== null || carry !== 0) {\n' +
      '    const total = (x === null ? 0 : x.value) + (y === null ? 0 : y.value) + carry;\n' +
      '    carry = Math.floor(total / 10);\n' +
      '    write.next = new Node(total % 10);\n' +
      '    write = write.next;\n' +
      '    if (x !== null) x = x.next;\n' +
      '    if (y !== null) y = y.next;\n' +
      '  }\n' +
      '  return sentinel.next;\n' +
      '}',
    modify: 'The digits are stored most significant first and the answer may not reverse either input. Which extra structure does the carry need?',
  },
  {
    step: 6,
    name: 'Add 1 to a number represented by LL',
    difficulty: 'Medium',
    topicSlug: LINKED,
    stem: 'Increment a big-endian digit list by one without reversing it and without a second pass over the unchanged prefix.',
    brief: 'Input: a list holding the digits of a number, most significant first. Output: the same list holding the number plus one, with a new leading node when the length grows.',
    concepts: ['dsa-carry-stops-at-nine', 'dsa-carry-forward-pass', 'dsa-linear-position-walk'],
    shortAnswer:
      'Remember the last node whose digit is not nine while walking to the tail. Raise it, zero everything after it, and if there was no such node the whole list was nines, so return a one followed by that many zeros.',
    idealAnswer:
      'Adding one is not adding a number: the carry is a rule about nines rather than an arithmetic loop, because a digit either absorbs the increment or becomes zero and passes it on. That means only the rightmost non-nine and the run of nines behind it can change, and every node before that point is already correct — so the pass that finds the rightmost non-nine is the only pass needed, and it runs forward on a singly list that cannot be walked backwards. Reversing, adding, and reversing back is the obvious three-walk answer and it is worth saying why it loses: it rewrites the whole list to change a suffix, and it mutates the input shape for a caller that may still be holding it. The all-nines case is not an afterthought but the reason the walk records a count as well as a node: nine-nine-nine plus one is a longer list, and the length of the new list is decided by how many nines were seen.',
    walkthrough:
      'Recording the candidate node and resetting a run counter on every non-nine is the same information kept two ways, and it is what lets the growth case be built without a second walk. The zeroing loop after the raised node is conditional by construction: on an input ending in a non-nine, the candidate is the tail and nothing is rewritten. A leading one is attached rather than inserted into position zero, which avoids the special case entirely — the old list becomes the suffix, so the new head is one node and one link.',
    commonMistake:
      'Carrying from the head because the digits read most significant first, or forgetting that the whole list may be nines.',
    whyWrong:
      'A carry cannot be applied before the digits to its right are known: nine followed by nothing looks like a digit that absorbs the increment until the tail is reached, so a front-to-back arithmetic pass either writes a wrong digit or has to be redone. Missing the all-nines branch reports zero as the answer to nine-nine-nine, which is off by exactly the digit that was carried out of the list.',
    followUps: [
      'Which nodes does this version write, and how many for an input of length n ending in a three?',
      'Give the reverse-add-reverse version and compare its writes to this one.',
      'Add an arbitrary single digit instead of one. Which assumption about the carry breaks?',
    ],
    solution:
      'class Node {\n' +
      '  constructor(value) {\n' +
      '    this.value = value;\n' +
      '    this.next = null;\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function fromArray(values) {\n' +
      '  let head = null;\n' +
      '  let tail = null;\n' +
      '  for (const value of values) {\n' +
      '    const node = new Node(value);\n' +
      '    if (head === null) {\n' +
      '      head = node;\n' +
      '    } else {\n' +
      '      tail.next = node;\n' +
      '    }\n' +
      '    tail = node;\n' +
      '  }\n' +
      '  return head;\n' +
      '}\n' +
      '\n' +
      'function toArray(head) {\n' +
      '  const values = [];\n' +
      '  let cursor = head;\n' +
      '  while (cursor !== null) {\n' +
      '    values.push(cursor.value);\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  return values;\n' +
      '}\n' +
      '\n' +
      'function addOne(head) {\n' +
      '  let cursor = head;\n' +
      '  let candidate = null;\n' +
      '  let trailingNines = 0;\n' +
      '  while (cursor !== null) {\n' +
      '    if (cursor.value === 9) {\n' +
      '      trailingNines += 1;\n' +
      '    } else {\n' +
      '      candidate = cursor;\n' +
      '      trailingNines = 0;\n' +
      '    }\n' +
      '    cursor = cursor.next;\n' +
      '  }\n' +
      '  if (candidate === null) {\n' +
      '    const grown = new Node(1);\n' +
      '    let write = grown;\n' +
      '    for (let index = 0; index < trailingNines; index += 1) {\n' +
      '      write.next = new Node(0);\n' +
      '      write = write.next;\n' +
      '    }\n' +
      '    return grown;\n' +
      '  }\n' +
      '  candidate.value += 1;\n' +
      '  let suffix = candidate.next;\n' +
      '  while (suffix !== null) {\n' +
      '    suffix.value = 0;\n' +
      '    suffix = suffix.next;\n' +
      '  }\n' +
      '  return head;\n' +
      '}',
    modify: 'Add an arbitrary digit d at the tail instead of one. Which part of the nine argument survives, and what does the carry stop at now?',
  },
];

/** The sheet matches a row by step and problem name; the app never invents either. */
export function sheetKey(step: number, name: string): string {
  return `${step}::${name.toLowerCase().replace(/\s+/g, ' ').trim()}`;
}
