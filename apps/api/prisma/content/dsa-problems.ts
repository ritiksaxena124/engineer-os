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
} satisfies Record<string, ConceptSpec>;

const MATHS = 'dsa-maths-foundations';
const ARRAYS = 'array-techniques';
const MECHANICS = 'language-mechanics';
const PATTERNS = 'pattern-printing';
const COMPLEXITY = 'complexity-analysis';
const SORTING = 'sorting-algorithms';

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
];

/** The sheet matches a row by step and problem name; the app never invents either. */
export function sheetKey(step: number, name: string): string {
  return `${step}::${name.toLowerCase().replace(/\s+/g, ' ').trim()}`;
}
