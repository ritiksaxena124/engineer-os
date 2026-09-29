import { describe, expect, test } from 'bun:test';
import { DSA_CONCEPTS, DSA_PROBLEMS, sheetKey } from '../prisma/content/dsa-problems';
import { QUESTIONS_DSA } from '../prisma/content/questions-dsa';
import { ALL_TOPICS } from '../prisma/content/curriculum';
import { validateQuestions } from '../prisma/content/questions';

/**
 * The DSA bank is imported content, so the tests hold the import to the same line as the authored
 * bank: every row must be unique, every concept reference must resolve, and every JavaScript
 * solution must actually produce the answer it claims. A reference solution that is merely
 * well-formed is worse than no solution, because a learner reads it as truth.
 */
const EXPECTS: Record<string, string> = {
  'Count Digits': 'countDigits(9876) === 4 && countDigits(0) === 1 && countDigits(-42) === 2',
  'Reverse a Number': 'reverseInteger(-123) === -321 && reverseInteger(120) === 21 && reverseInteger(1534236469) === 0',
  'Check Palindrome': 'isPalindromeNumber(121) && isPalindromeNumber(12321) && !isPalindromeNumber(10) && !isPalindromeNumber(-121) && isPalindromeNumber(0)',
  'GCD Or HCF': 'gcd(12, 18) === 6 && gcd(7, 0) === 7 && gcdAll([2, 4, 6, 8]) === 2',
  'Armstrong Numbers': 'isArmstrong(153) && isArmstrong(1634) && !isArmstrong(100)',
  'Print all Divisors': 'divisors(28).join() === "1,2,4,7,14,28" && divisors(4).join() === "1,2,4"',
  'Check for Prime': 'isPrime(2) && isPrime(97) && !isPrime(1) && !isPrime(0) && !isPrime(-7) && !isPrime(9)',
  'Understand Recursion by Print 1 to N':
    '(() => { printUpTo(3); const first = logged.join(); printUpTo(0); return first === "1,2,3" && logged.join() === "1,2,3"; })()',
  'Print N to 1 using Recursion':
    '(() => { printDown(3); const first = logged.join(); printDownLoop(2); return first === "3,2,1" && logged.join() === "3,2,1,2,1"; })()',
  'Sum of first N numbers': 'sumRecursive(5) === 15 && sumClosed(100) === 5050 && sumClosed(101) === 5151 && sumClosed(0) === 0',
  'Factorial of N numbers': 'factorial(0) === 1 && factorial(5) === 120 && factorialBig(25).toString() === "15511210043330985984000000"',
  'Reverse an Array': 'reverseRecursive([1, 2, 3, 4, 5]).join() === "5,4,3,2,1" && reverseLoop([1, 2]).join() === "2,1" && reverseLoop([]).join() === ""',
  'Check if a String is Palindrome': 'isPalindrome("aba") && isPalindrome("") && !isPalindrome("ab") && !isPalindrome("abcda")',
  'Fibonacci Number': 'fib(10) === 55 && fibLoop(0) === 0 && fibLoop(20) === 6765 && fib(30) === fibLoop(30)',
  'Counting Frequencies of Array Elements': 'frequencies([1, 2, 2, 3, 3, 3]).get(3) === 3 && frequencies([]).size === 0',
  'Find the Highest/Lowest Frequency Element': 'frequencyExtremes([1, 1, 2]).high.value === 1 && frequencyExtremes([1, 1, 2]).low.value === 2',
  'Largest Element in an Array': 'largest([-5, -2]).value === -2 && largest([]) === null && largest([3, 9, 1]).index === 1',
  'Second Largest Element in an Array': 'secondLargest([5, 5, 3]) === 3 && secondLargest([7]) === null && secondLargest([1, 2, 2, 3]) === 2',
  'Check if the array is sorted': 'isSorted([1, 1, 2]) && isSorted([]) && !isSorted([2, 1]) && firstInversion([1, 3, 2]) === 1',
  'Remove duplicates from Sorted array': '(() => { const a = [1, 1, 2, 3, 3]; return dedupSorted(a) === 3 && a.slice(0, 3).join() === "1,2,3" && dedupSorted([]) === 0 })()',
  'Left Rotate an array by one place': 'rotateLeftOne([1, 2, 3]).join() === "2,3,1" && rotateLeftOne([7]).join() === "7"',
  'Left rotate an array by D places': 'rotateLeft([1, 2, 3, 4, 5], 2).join() === "3,4,5,1,2" && rotateLeft([1, 2], 5).join() === "2,1" && rotateLeft([1, 2, 3], 3).join() === "1,2,3"',
  'Move Zeros to end': 'moveZeros([0, 1, 0, 3, 12]).join() === "1,3,12,0,0" && moveZeros([1, 2]).join() === "1,2"',
  'Linear Search': 'linearSearch([4, 5, 1], 5) === 1 && linearSearch([4], 9) === -1 && allMatches([1, 2, 1], 1).join() === "0,2"',
  'Find the Union and Intersection of two sorted arrays':
    '(() => { const r = unionIntersectionSorted([1, 2, 2, 3], [2, 3, 4]); return r.union.join() === "1,2,3,4" && r.intersection.join() === "2,3" })()',
  'Find missing number in an array': 'missingNumber([3, 0, 1]) === 2 && missingNumber([0]) === 1 && missingNumber([0, 1, 2, 3, 5]) === 4',
  'Max Consecutive Ones': 'maxConsecutiveOnes([1, 1, 0, 1, 1, 1]) === 3 && maxConsecutiveOnes([0]) === 0 && maxConsecutiveOnes([1, 1]) === 2',
  'Find the number that appears once, and other numbers twice': 'singleton([4, 1, 2, 1, 2]) === 4 && singleton([7]) === 7',
  'Longest Subarray with given Sum K (Positives)': 'longestPositiveWindow([1, 2, 3], 3) === 2 && longestPositiveWindow([2, 4, 1, 1, 1], 3) === 3 && longestPositiveWindow([5], 2) === 0',
  'Longest Subarray with sum K (Positives + Negatives)':
    'longestSubarrayAnySign([3, 4, 7, 2, -3, 1, 4, 2], 7) === 4 && longestSubarrayAnySign([5, -1, 5], 5) === 1',
  '2Sum Problem': 'twoSum([2, 7, 11, 15], 9).join() === "0,1" && twoSum([3, 2, 4], 6).join() === "1,2" && twoSum([3, 3], 6).join() === "0,1"',
  'Sort an array of 0s, 1s and 2s (Dutch National Flag)':
    'sortFlags([2, 0, 2, 1, 1, 0]).join() === "0,0,1,1,2,2" && sortFlags([0]).join() === "0" && sortFlags([1, 2, 0]).join() === "0,1,2"',
  'Find Character Case':
    'charCase("A") === "uppercase" && charCase("z") === "lowercase" && charCase("7") === "digit" && charCase("$") === "other"',
  'Data Type Size':
    'addExact(1, 2).exact === true && addExact(2 ** 53, 1).exact === false && addExact(Number.MAX_SAFE_INTEGER, 0).exact === true && 2 ** 53 + 1 === 2 ** 53',
  'If-Else Decision Making':
    'grade(100) === "A" && grade(89.9) === "B" && grade(75) === "B" && grade(50) === "C" && grade(0) === "F" && grade(-1) === "invalid" && grade(NaN) === "invalid" && grade("95") === "invalid"',
  'Switch Statement':
    'daysInMonth(1, 2026) === 31 && daysInMonth(4, 2026) === 30 && daysInMonth(2, 2024) === 29 && daysInMonth(2, 1900) === 28 && daysInMonth(2, 2000) === 29 && daysInMonth(13, 2026) === null',
  'For Loops & While Loops':
    'sumFor(5) === 15 && sumFor(0) === 0 && sumWhile(100) === 5050 && sumWhile(-3) === 0 && sumHalving(1) === 1 && sumHalving(8) === 4 && sumHalving(0) === 0',
  'Functions (Pass by Reference and Value)':
    '(() => { const p = [1, 2]; swapValues(p[0], p[1]); const untouched = p.join() === "1,2"; const swapped = swapInPlace(p).join() === "2,1"; return untouched && swapped && p[0] === 2; })()',
  'Time Complexity Analysis Practice':
    'linear(10) === 10 && quadratic(10) === 100 && logarithmic(10) === 4 && logarithmic(1024) === 11 && triangle(10) === 55 && triangle(100) === 5050',
  'Selection Sort':
    'selectionSort([5, 1, 4, 2, 8]).join() === "1,2,4,5,8" && selectionSort([]).join() === "" && selectionSort([7]).join() === "7" && selectionSort([3, 3, 1]).join() === "1,3,3"',
  'Bubble Sort':
    'bubbleSort([5, 1, 4, 2, 8]).join() === "1,2,4,5,8" && bubbleSort([1, 2, 3]).join() === "1,2,3" && bubbleSort([2, 1]).join() === "1,2" && bubbleSort([]).join() === ""',
  'Insertion Sort':
    'insertionSort([5, 1, 4, 2, 8]).join() === "1,2,4,5,8" && insertionSort([1, 2, 2, 1]).join() === "1,1,2,2" && insertionSort([]).join() === "" && insertionSort([9]).join() === "9"',
  'Merge Sort':
    'mergeSort([5, 1, 4, 2, 8]).join() === "1,2,4,5,8" && mergeSort([]).join() === "" && mergeSort([2, 2]).join() === "2,2" && mergeSort([9, -3, 0, 9, 1]).join() === "-3,0,1,9,9"',
  'Recursive Bubble Sort':
    '(() => { const a = [5, 1, 4, 2, 8]; return bubbleRecursive(a).join() === "1,2,4,5,8" && a.join() === "1,2,4,5,8" && bubbleRecursive([]).join() === "" && bubbleRecursive([1]).join() === "1"; })()',
  'Recursive Insertion Sort':
    '(() => { const a = [5, 1, 4, 2, 8]; return insertionRecursive(a).join() === "1,2,4,5,8" && insertionRecursive([]).join() === "" && insertionRecursive([3, 3, 1]).join() === "1,3,3"; })()',
  'Quick Sort':
    '(() => { const a = [5, 1, 4, 2, 8]; return quickSort(a).join() === "1,2,4,5,8" && quickSort([]).join() === "" && quickSort([3, 3, 3]).join() === "3,3,3" && quickSort([1, 2, 3, 4, 5]).join() === "1,2,3,4,5" && quickSort([9, -3, 0, 9, 1]).join() === "-3,0,1,9,9"; })()',
  'Pattern-1: Star & Number Patterns': 'squareStars(3) === "***\\n***\\n***" && squareStars(1) === "*" && squareStars(0) === ""',
  'Pattern-2: Star & Number Patterns': 'rectangle(2, 3) === "***\\n***" && rectangle(3, 1) === "*\\n*\\n*" && rectangle(0, 4) === ""',
  'Pattern-3: Star & Number Patterns': 'growingTriangle(3) === "*\\n**\\n***" && growingTriangle(1) === "*" && growingTriangle(0) === ""',
  'Pattern-4: Star & Number Patterns': 'shrinkingTriangle(3) === "***\\n**\\n*" && shrinkingTriangle(1) === "*"',
  'Pattern-5: Star & Number Patterns': 'rightAligned(3) === "  *\\n **\\n***" && rightAligned(1) === "*"',
  'Pattern-6: Star & Number Patterns': 'inverseRightAligned(3) === "***\\n **\\n  *" && inverseRightAligned(2) === "**\\n *"',
  'Pattern-7: Star & Number Patterns': 'pyramid(3) === "  *\\n ***\\n*****" && pyramid(1) === "*"',
  'Pattern-8: Star & Number Patterns': 'inversePyramid(3) === "*****\\n ***\\n  *" && inversePyramid(2) === "***\\n *"',
  'Pattern-9: Star & Number Patterns': 'diamond(2) === " *\\n***\\n *" && diamond(1) === "*" && diamond(3) === "  *\\n ***\\n*****\\n ***\\n  *"',
  'Pattern-10: Star & Number Patterns': 'numberSquare(3) === "123\\n123\\n123" && numberSquare(1) === "1" && numberSquare(0) === ""',
  'Pattern-11: Star & Number Patterns': 'rowNumberSquare(3) === "111\\n222\\n333" && rowNumberSquare(1) === "1"',
  'Pattern-12: Star & Number Patterns': 'increasingTriangle(3) === "1\\n12\\n123" && increasingTriangle(1) === "1" && increasingTriangle(0) === ""',
  'Pattern-13: Star & Number Patterns': 'constantTriangle(4) === "1\\n22\\n333\\n4444"',
  'Pattern-14: Star & Number Patterns': 'decreasingTriangle(3) === "1\\n21\\n321"',
  'Pattern-15: Star & Number Patterns': 'palindromeTriangle(3) === "1\\n121\\n12321" && palindromeTriangle(1) === "1"',
  'Pattern-16: Star & Number Patterns': 'rhombus(2) === " **\\n**" && rhombus(1) === "*"',
  'Pattern-17: Star & Number Patterns': 'hollowSquare(3) === "***\\n* *\\n***" && hollowSquare(2) === "**\\n**" && hollowSquare(1) === "*"',
  'Pattern-18: Star & Number Patterns': 'diagonalCross(3) === "* *\\n * \\n* *" && diagonalCross(4) === "*  *\\n ** \\n ** \\n*  *"',
  'Pattern-19: Star & Number Patterns': 'zeroOneTriangle(3) === "1\\n01\\n101" && zeroOneTriangle(4).endsWith("0101")',
  'Pattern-20: Star & Number Patterns': 'letterTriangle(3) === "A\\nBC\\nDEF"',
  'Pattern-21: Star & Number Patterns': 'butterfly(2) === "****\\n*  *\\n****" && butterfly(1) === "**"',
  'Pattern-22: Star & Number Patterns': 'centredNumbers(3) === "  1\\n 121\\n12321" && centredNumbers(1) === "1"',
  'Majority Element (> n/2 times)':
    'majorityElement([2, 2, 1, 1, 2]) === 2 && majorityElement([1]) === 1 && majorityElement([1, 2, 3]) === null && majorityElement([6, 5, 5]) === 5',
  "Maximum Subarray Sum (Kadane's Algorithm)":
    'maxSubarraySum([-2, 1, -3, 4, -1, 2, 1, -5, 4]) === 6 && maxSubarraySum([-3, -1, -2]) === -1 && maxSubarraySum([1]) === 1',
  'Print subarray with maximum subarray sum':
    'maxSubarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]).join() === "4,-1,2,1" && maxSubarray([-3, -1, -2]).join() === "-1" && maxSubarray([1, 2]).join() === "1,2"',
  'Stock Buy and Sell':
    'bestProfit([7, 1, 5, 3, 6, 4]) === 5 && bestProfit([7, 6, 4, 3, 1]) === 0 && bestProfit([]) === 0 && bestProfit([2, 4, 1, 8]) === 7',
  'Rearrange Array Elements by Sign':
    'rearrangeBySign([3, 1, -2, -5, 2, -4]).join() === "3,-2,1,-5,2,-4" && rearrangeBySign([1, -1]).join() === "1,-1"',
  'Next Permutation':
    'nextPermutation([1, 2, 3]).join() === "1,3,2" && nextPermutation([3, 2, 1]).join() === "1,2,3" && nextPermutation([1, 1, 5]).join() === "1,5,1" && nextPermutation([5]).join() === "5"',
  'Leaders in an Array': 'leaders([17, 4, 3, 5, 2]).join() === "17,5,2" && leaders([3, 2, 3, 1, 2]).join() === "3,3,2" && leaders([]).join() === ""',
  'Longest Consecutive Sequence in an Array':
    'longestConsecutive([100, 4, 200, 1, 3, 2]) === 4 && longestConsecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]) === 9 && longestConsecutive([]) === 0',
  'Set Matrix Zeroes':
    '(() => { const a = setZeroes([[1, 1, 1], [1, 0, 1], [1, 1, 1]]).map((r) => r.join()).join("|"); const b = setZeroes([[0, 1], [1, 1]]).map((r) => r.join()).join("|"); const c = setZeroes([[1, 1], [0, 1]]).map((r) => r.join()).join("|"); return a === "1,0,1|0,0,0|1,0,1" && b === "0,0|0,1" && c === "0,1|0,0"; })()',
  'Rotate Matrix by 90 degrees':
    'rotateMatrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).map((r) => r.join()).join("|") === "7,4,1|8,5,2|9,6,3" && rotateMatrix([[1, 2], [3, 4]]).map((r) => r.join()).join("|") === "3,1|4,2" && rotateMatrix([[5]]).join() === "5"',
  'Print the matrix in spiral manner':
    'spiralOrder([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).join() === "1,2,3,6,9,8,7,4,5" && spiralOrder([[1, 2, 3], [4, 5, 6]]).join() === "1,2,3,6,5,4" && spiralOrder([[1, 2, 3]]).join() === "1,2,3"',
  'Count Subarray sum Equals K':
    'countSubarraysWithSum([1, 2, 3], 3) === 2 && countSubarraysWithSum([1, 1, 1], 2) === 2 && countSubarraysWithSum([1, -1, 1, -1], 0) === 4 && countSubarraysWithSum([1, -1, 0], 0) === 3 && countSubarraysWithSum([], 0) === 0 && countSubarraysWithSum([0], 0) === 1',
  "Pascal's Triangle":
    'pascalTriangle(5).map((r) => r.join()).join("|") === "1|1,1|1,2,1|1,3,3,1|1,4,6,4,1" && pascalTriangle(1).map((r) => r.join()).join("|") === "1" && pascalTriangle(0).length === 0',
  'Majority Elements (> n/3 times)':
    'majorityThird([3, 2, 3]).join() === "3" && majorityThird([1, 1, 1, 2, 2, 3, 3]).join() === "1" && majorityThird([1, 2]).join() === "1,2" && majorityThird([1, 2, 3]).join() === "" && majorityThird([]).join() === ""',
  '3-Sum Problem':
    'threeSum([-1, 0, 1, 2, -1, -4]).map((t) => t.join()).join("|") === "-1,-1,2|-1,0,1" && threeSum([0, 0, 0]).map((t) => t.join()).join("|") === "0,0,0" && threeSum([0, 0, 0, 0]).length === 1 && threeSum([1, 2]).length === 0',
  '4-Sum Problem':
    'fourSum([1, 0, -1, 0, -2, 2], 0).map((q) => q.join()).join("|") === "-2,-1,1,2|-2,0,0,2|-1,0,0,1" && fourSum([2, 2, 2, 2, 2], 8).map((q) => q.join()).join("|") === "2,2,2,2" && fourSum([0, 0, 0], 0).length === 0',
};

/** The solution runs in its own function scope with console captured, so a printing solution is testable too. */
function run(solution: string, expression: string): boolean {
  return new Function(
    `${solution}\nconst logged = [];\nconst console = { log: (value) => logged.push(String(value)) };\nreturn (${expression});`,
  )() as boolean;
}

describe('dsa content', () => {
  test('every authored problem became a question, in order', () => {
    expect(QUESTIONS_DSA).toHaveLength(DSA_PROBLEMS.length);
    expect(QUESTIONS_DSA.map((question) => question.topicSlug)).toEqual(DSA_PROBLEMS.map((problem) => problem.topicSlug));
  });

  test('a problem cannot cite a concept that does not exist', () => {
    for (const problem of DSA_PROBLEMS) {
      expect(problem.concepts.length).toBeGreaterThan(0);
      for (const key of problem.concepts) {
        expect(DSA_CONCEPTS[key as keyof typeof DSA_CONCEPTS]).toBeDefined();
      }
    }
  });

  test('the sheet names the app claims are unique per step', () => {
    const keys = DSA_PROBLEMS.map((problem) => sheetKey(problem.step, problem.name));
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('question slugs collide with nothing in the bank', () => {
    const slugs = QUESTIONS_DSA.map((question) => question.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(validateQuestions()).toEqual([]);
  });

  test('every DSA topic is in the phase the sheet belongs to', () => {
    const dsa = new Set(ALL_TOPICS.filter((topic) => topic.phaseKey === 'p03').map((topic) => topic.slug));
    for (const problem of DSA_PROBLEMS) {
      if (problem.step <= 3) expect(dsa.has(problem.topicSlug), `${problem.name} sits outside p03`).toBe(true);
    }
  });

  test('every reference solution runs and gives the answer the explanation claims', () => {
    for (const problem of DSA_PROBLEMS) {
      const expression = EXPECTS[problem.name];
      expect(expression, `${problem.name} has no executable check`).toBeTruthy();
      expect(run(problem.solution, expression), `${problem.name}: the shipped solution is wrong`).toBe(true);
    }
  });

  test('a solution is never paired with an empty explanation or a missing edge case', () => {
    for (const problem of DSA_PROBLEMS) {
      expect(problem.walkthrough.length).toBeGreaterThan(150);
      expect(problem.followUps.length).toBeGreaterThanOrEqual(3);
      expect(problem.modify.length).toBeGreaterThan(20);
    }
  });

  test('the rung a DSA answer demonstrates is set by the sheet difficulty, not by the writer', () => {
    const rungs = DSA_PROBLEMS.map((problem, index) => `${problem.difficulty}:${QUESTIONS_DSA[index].levelKey}`);
    expect(rungs.filter((entry) => entry === 'Easy:implementation').length).toBeGreaterThan(0);
    expect(rungs.filter((entry) => entry === 'Medium:implementation').length).toBeGreaterThan(0);
    expect(rungs.every((entry) => /:(implementation|design)$/.test(entry))).toBe(true);
  });
});
