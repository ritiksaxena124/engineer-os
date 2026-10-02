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
  'Largest Subarray with 0 Sum':
    'longestZeroSum([1, -1, 1, -1]) === 4 && longestZeroSum([1, 2, -3, 4]) === 3 && longestZeroSum([1, 2, 3]) === 0 && longestZeroSum([0]) === 1 && longestZeroSum([]) === 0',
  'Count number of subarrays with given xor K':
    'countXorSubarrays([4, 2, 2, 6, 4], 4) === 4 && countXorSubarrays([1, 1, 1], 1) === 4 && countXorSubarrays([5], 5) === 1 && countXorSubarrays([5], 2) === 0 && countXorSubarrays([], 0) === 0',
  'Merge Overlapping Subintervals':
    'mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]]).map((p) => p.join()).join("|") === "1,6|8,10|15,18" && mergeIntervals([[1, 4], [4, 5]]).map((p) => p.join()).join("|") === "1,5" && mergeIntervals([[1, 10], [2, 3], [4, 6]]).map((p) => p.join()).join("|") === "1,10" && mergeIntervals([]).length === 0',
  'Merge two sorted arrays without extra space':
    '(() => { const a = [1, 4, 8, 9, 10]; const b = [2, 3, 4, 7, 9, 11, 12, 13]; mergeInPlace(a, b); return a.join() === "1,2,3,4,4" && b.join() === "7,8,9,9,10,11,12,13"; })()',
  'Find the repeating and missing number':
    'repeatingMissing([3, 1, 2, 5, 3]).join() === "3,4" && repeatingMissing([4, 4, 2, 3]).join() === "4,1" && repeatingMissing([1, 2, 2]).join() === "2,3" && repeatingMissing([1, 1]).join() === "1,2"',
  'Count Inversions':
    'countInversions([2, 1, 3]) === 1 && countInversions([5, 4, 3, 2, 1]) === 10 && countInversions([1, 2, 3]) === 0 && countInversions([]) === 0 && countInversions([1, 2, 3, 4, 5, 0]) === 5',
  'Reverse Pairs':
    'reversePairs([2, 4, 3, 1]) === 2 && reversePairs([1, 3, 2, 3, 1]) === 2 && reversePairs([2, 4, 3, 5]) === 0 && reversePairs([5, 1]) === 1 && reversePairs([]) === 0',
  'Maximum Product Subarray':
    'maxProduct([2, 3, -2, 4]) === 6 && maxProduct([-2, 3, -4]) === 24 && maxProduct([-2]) === -2 && maxProduct([-2, 0, -1]) === 0 && maxProduct([-1, -2, -3]) === 6 && maxProduct([0, -2]) === 0',
  'Max Subarray Product':
    'maxProductTwoSweep([2, 3, -2, 4]) === 6 && maxProductTwoSweep([-2, 3, -4]) === 24 && maxProductTwoSweep([-2]) === -2 && maxProductTwoSweep([-2, 0, -1]) === 0 && maxProductTwoSweep([-1, -2, -3]) === 6 && maxProductTwoSweep([0, -2]) === 0 && maxProductTwoSweep([-1, 2]) === 2',
  'Check if Array is Sorted':
    'isRotatedSorted([3, 4, 5, 1, 2]) && isRotatedSorted([1, 2, 3]) && isRotatedSorted([3, 1, 2]) && isRotatedSorted([1]) && !isRotatedSorted([2, 1, 3]) && !isRotatedSorted([1, 3, 2])',
  'Find the element that appears once in sorted array':
    'singleInSorted([1, 1, 2, 3, 3]) === 2 && singleInSorted([3, 3, 7, 7, 10, 11, 11]) === 10 && singleInSorted([1, 2, 2, 3, 3]) === 1 && singleInSorted([1, 1, 2, 2, 3, 3, 4]) === 4 && singleInSorted([7]) === 7',
  'Rotate Matrix by 90 Degrees Clockwise':
    'rotateRings([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).map((r) => r.join()).join("|") === "7,4,1|8,5,2|9,6,3" && rotateRings([[1, 2], [3, 4]]).map((r) => r.join()).join("|") === "3,1|4,2" && rotateRings([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]).map((r) => r.join()).join("|") === "13,9,5,1|14,10,6,2|15,11,7,3|16,12,8,4" && rotateRings([[7]]).join() === "7"',
  'Find missing and repeating numbers':
    'repeatingMissingOnce([3, 1, 2, 5, 3]).join() === "3,4" && repeatingMissingOnce([1, 2, 2]).join() === "2,3" && repeatingMissingOnce([4, 4, 2, 3]).join() === "4,1" && repeatingMissingOnce([1, 1]).join() === "1,2"',
  'Binary Search to find X in sorted array':
    'binarySearch([-1, 0, 3, 5, 9, 12], 9) === 4 && binarySearch([-1, 0, 3, 5, 9, 12], 2) === -1 && binarySearch([1], 1) === 0 && binarySearch([], 1) === -1 && binarySearch([5, 7], 7) === 1 && binarySearch([1, 3], 2) === -1',
  'Implement Lower Bound':
    'lowerBound([1, 2, 2, 3], 2) === 1 && lowerBound([1, 2, 3], 4) === 3 && lowerBound([1, 2, 3], 0) === 0 && lowerBound([], 5) === 0 && lowerBound([2, 2, 2], 2) === 0',
  'Implement Upper Bound':
    'upperBound([1, 2, 2, 3], 2) === 3 && upperBound([1, 2, 3], 3) === 3 && upperBound([2, 2, 2], 2) === 3 && upperBound([1], 0) === 0 && upperBound([], 1) === 0',
  'Search Insert Position':
    'searchInsert([1, 3, 5, 6], 5) === 2 && searchInsert([1, 3, 5, 6], 2) === 1 && searchInsert([1, 3, 5, 6], 7) === 4 && searchInsert([1, 3, 5, 6], 0) === 0 && searchInsert([], 1) === 0',
  'Check if Input array is sorted':
    'isNonDecreasing([1, 2, 2, 3]) && !isNonDecreasing([3, 1, 2]) && isNonDecreasing([]) && boundaryIndex([1, 2, 3], 2) === 1 && boundaryIndex([3, 1, 2], 2) === 2',
  'Find First and Last Position of Element in Sorted Array':
    'searchRange([5, 7, 7, 8, 8, 10], 8).join() === "3,4" && searchRange([5, 7, 7, 8, 8, 10], 6).join() === "-1,-1" && searchRange([], 1).join() === "-1,-1" && searchRange([1], 1).join() === "0,0" && searchRange([2, 2, 2], 2).join() === "0,2"',
  'Count Occurrences in Sorted Array':
    'countOccurrences([1, 1, 2, 2, 2, 3], 2) === 3 && countOccurrences([1, 2, 3], 4) === 0 && countOccurrences([1, 2, 3], 0) === 0 && countOccurrences([], 5) === 0 && countOccurrences([7, 7, 7], 7) === 3',
  'Search in Rotated Sorted Array I':
    'searchRotated([4, 5, 6, 7, 0, 1, 2], 0) === 4 && searchRotated([4, 5, 6, 7, 0, 1, 2], 3) === -1 && searchRotated([1], 0) === -1 && searchRotated([1], 1) === 0 && searchRotated([3, 1], 1) === 1 && searchRotated([5, 1, 3], 5) === 0',
  'Search in Rotated Sorted Array II':
    'searchRotatedWithDuplicates([5, 1, 3, 1], 3) && searchRotatedWithDuplicates([1, 0, 1, 1, 1], 0) && !searchRotatedWithDuplicates([2, 2, 2, 2], 3) && searchRotatedWithDuplicates([1, 1, 1, 3, 1], 3) && !searchRotatedWithDuplicates([], 1) && searchRotatedWithDuplicates([1], 1)',
  'Search in Rotated Sorted Array with Duplicates':
    'searchRotatedByPivot([4, 5, 6, 7, 0, 1, 2], 0) === 4 && searchRotatedByPivot([4, 5, 6, 7, 0, 1, 2], 3) === -1 && searchRotatedByPivot([3, 1], 1) === 1 && searchRotatedByPivot([3, 1], 3) === 0 && searchRotatedByPivot([], 1) === -1 && searchRotatedByPivot([1], 1) === 0 && searchRotatedByPivot([2, 2, 2, 2], 2) === 1',
  'Find Minimum in Rotated Sorted Array':
    'findMinimum([3, 4, 5, 1, 2]) === 1 && findMinimum([4, 5, 6, 7, 0, 1, 2]) === 0 && findMinimum([1, 2, 3]) === 1 && findMinimum([1]) === 1 && findMinimum([2, 1]) === 1',
  'Find how many times array has been rotated':
    'rotationCount([3, 4, 5, 1, 2]) === 3 && rotationCount([1, 2, 3, 4, 5]) === 0 && rotationCount([2, 1]) === 1 && rotationCount([7]) === 0 && rotationCount([5, 6, 7, 1, 2, 3, 4]) === 3',
  'Single Element in a Sorted Array':
    'singleNonPair([1, 1, 2, 3, 3]) === 2 && singleNonPair([3, 3, 7, 7, 10, 11, 11]) === 10 && singleNonPair([1, 2, 2, 3, 3]) === 1 && singleNonPair([1, 1, 2, 2, 3, 3, 4]) === 4 && singleNonPair([7]) === 7 && singleNonPair([1, 1, 2, 2, 3]) === 3',
  'Find Peak Element':
    'findPeak([1, 2, 3, 1]) === 2 && findPeak([1, 2, 1, 3, 5, 6, 4]) === 5 && findPeak([1]) === 0 && findPeak([3, 1]) === 0 && findPeak([1, 2]) === 1 && findPeak([5, 4, 3, 2, 1]) === 0',
  'Find square root of a number in O(log N)':
    'integerSqrt(4) === 2 && integerSqrt(8) === 2 && integerSqrt(0) === 0 && integerSqrt(1) === 1 && integerSqrt(16) === 4 && integerSqrt(1000000) === 1000 && integerSqrt(999999) === 999',
  'Find the Nth root of a number':
    'nthRoot(2, 9) === 3 && nthRoot(2, 8) === -1 && nthRoot(3, 27) === 3 && nthRoot(4, 81) === 3 && nthRoot(1, 5) === 5 && nthRoot(2, 0) === 0 && nthRoot(2, 1) === 1 && nthRoot(10, 1024) === 2',
  'Koko Eating Bananas':
    'minEatingSpeed([3, 6, 7, 11], 8) === 4 && minEatingSpeed([30, 11, 23, 4, 20], 5) === 30 && minEatingSpeed([30, 11, 23, 4, 20], 6) === 23 && minEatingSpeed([1, 4], 2) === 4 && minEatingSpeed([1000000000], 1000000000) === 1',
  'Minimum days to make M bouquets':
    'minDays([1, 10, 3, 10, 2], 3, 3) === -1 && minDays([7, 7, 7, 7, 12, 7, 7], 2, 3) === 12 && minDays([1000000000, 1000000000], 1, 2) === 1000000000 && minDays([1, 1, 1, 1, 1, 1], 2, 2) === 1 && minDays([2, 3, 5, 1, 3], 3, 1) === 3',
  'Find the smallest divisor given a threshold':
    'smallestDivisor([1, 2, 5, 9], 6) === 5 && smallestDivisor([2, 3, 5, 7, 11], 11) === 3 && smallestDivisor([19], 5) === 4 && smallestDivisor([1000000], 1) === 1000000 && smallestDivisor([1, 2], 1) === -1',
  'Capacity to Ship Packages within D Days':
    'shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5) === 15 && shipWithinDays([5, 1, 2, 4, 2, 7], 3) === 8 && shipWithinDays([7, 7, 7, 7, 7, 7], 4) === 14 && shipWithinDays([1], 1) === 1 && shipWithinDays([10], 2) === 10',
  'Kth Missing Positive Number':
    'kthMissing([2, 3, 4, 7, 11], 5) === 9 && kthMissing([1, 2, 3, 4], 2) === 6 && kthMissing([2], 1) === 1 && kthMissing([], 5) === 5 && kthMissing([5], 1) === 1 && kthMissing([1, 2], 3) === 5',
  'Find Kth missing positive number':
    'kthMissingLinear([2, 3, 4, 7, 11], 5) === 9 && kthMissingLinear([1, 2, 3, 4], 2) === 6 && kthMissingLinear([2], 1) === 1 && kthMissingLinear([], 5) === 5 && kthMissingLinear([1, 2], 3) === 5',
  'Aggressive Cows':
    'aggressiveCows([1, 2, 4, 8, 9], 3) === 3 && aggressiveCows([1, 2, 3, 4, 5], 2) === 4 && aggressiveCows([4, 2, 1, 9, 6], 3) === 3 && aggressiveCows([6, 10, 2, 4, 8, 12], 3) === 4 && aggressiveCows([1, 5], 2) === 4 && aggressiveCows([3], 1) === 0 && aggressiveCows([1, 2], 3) === 0',
  'Book Allocation Problem':
    'allocateBooks([12, 34, 67, 90], 2) === 113 && allocateBooks([25, 10, 35, 16, 72], 3) === 72 && allocateBooks([10, 20], 3) === -1 && allocateBooks([100], 1) === 100 && allocateBooks([10, 20, 30], 3) === 30',
  'Split Array - Largest Sum':
    'splitArray([7, 2, 5, 10, 8], 2) === 18 && splitArray([1, 2, 3, 4, 5], 3) === 6 && splitArray([1, 2, 3, 4, 5], 2) === 9 && splitArray([2, 1, 5, 6, 2, 3], 2) === 11 && splitArray([5], 1) === 5',
  "Painter's Partition Problem":
    'painterMinutes([10, 20, 30, 40], 2) === 60 && painterMinutes([5, 5, 5, 5], 3) === 10 && painterMinutes([1, 2, 3, 4, 5], 3) === 6 && painterMinutes([7, 2, 5, 10, 8], 2) === 18 && painterMinutes([4, -1, 4], 2) === 4',
  'Minimize Max Distance to Gas Station':
    'Math.abs(minMaxDistance([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1) - 1) < 1e-6 && Math.abs(minMaxDistance([3, 6, 14, 1, 18, 5, 12, 10], 9) - 4 / 3) < 1e-6 && Math.abs(minMaxDistance([1, 10], 8) - 1) < 1e-6 && Math.abs(minMaxDistance([1, 10], 9) - 0.9) < 1e-6 && Math.abs(minMaxDistance([1, 2, 3, 4, 5, 6], 0) - 1) < 1e-6',
  'Median of 2 Sorted Arrays of Different Sizes':
    'medianOfTwo([1, 3], [2]) === 2 && medianOfTwo([1, 2], [3, 4]) === 2.5 && medianOfTwo([], [1]) === 1 && medianOfTwo([2], []) === 2 && medianOfTwo([-5, 3, 6, 12, 15], [-12, -10, -6, -3, 4, 10]) === 3 && medianOfTwo([1, 2, 3], [4, 5, 6, 7]) === 4 && medianOfTwo([1, 1, 1], [1, 1]) === 1',
  'Median of two sorted arrays of different sizes':
    'medianByMergeWalk([1, 3], [2]) === 2 && medianByMergeWalk([1, 2], [3, 4]) === 2.5 && medianByMergeWalk([], [1]) === 1 && medianByMergeWalk([2], []) === 2 && medianByMergeWalk([-5, 3, 6, 12, 15], [-12, -10, -6, -3, 4, 10]) === 3 && medianByMergeWalk([1, 2, 3], [4, 5, 6, 7]) === 4',
  'Kth Element of two sorted arrays':
    'kthInTwo([2, 3, 6, 7, 9], [1, 4, 8, 10], 5) === 6 && kthInTwo([1, 2, 3], [4, 5, 6], 1) === 1 && kthInTwo([1, 2, 3], [4, 5, 6], 6) === 6 && kthInTwo([1, 3, 5], [2, 4, 6], 4) === 4 && kthInTwo([], [1], 1) === 1 && kthInTwo([7], [1, 2, 3], 2) === 2 && kthInTwo([1, 1, 1], [1, 1], 4) === 1',
  "Find the row with maximum number of 1's":
    'rowWithMostOnes([[0, 1, 1, 1], [0, 0, 1, 1], [1, 1, 1, 1]]) === 2 && rowWithMostOnes([[1, 1], [1, 1]]) === 0 && rowWithMostOnes([[0, 0], [0, 1]]) === 1 && rowWithMostOnes([[0, 0, 0]]) === -1 && rowWithMostOnes([]) === -1 && rowWithMostOnes([[0, 1], [1, 1], [1, 1]]) === 1',
  'Search in a 2D Matrix':
    'searchMatrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3) && !searchMatrix([[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13) && searchMatrix([[1]], 1) && !searchMatrix([[1]], 0) && !searchMatrix([], 1) && searchMatrix([[1], [3], [5]], 5) && searchMatrix([[1, 1]], 1)',
  'Search in a Row and Column-wise Sorted Matrix':
    'searchSaddle([[-1, 2, 3, 6], [10, 20, 30, 40], [30, 40, 60, 70], [70, 80, 90, 110]], 60) && !searchSaddle([[-1, 2, 3, 6], [10, 20, 30, 40], [30, 40, 60, 70], [70, 80, 90, 110]], 55) && searchSaddle([[1, 4], [2, 5]], 5) && !searchSaddle([], 1) && !searchSaddle([[1, 2], [3, 4]], 0) && searchSaddle([[5]], 5)',
  'Find Peak Element (2D Matrix)':
    'peakInMatrix([[1, 4], [3, 2]]).join() === "1,0" && peakInMatrix([[10, 20, 15], [21, 30, 14], [7, 16, 32]]).join() === "1,1" && peakInMatrix([[1]]).join() === "0,0" && peakInMatrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).join() === "2,2" && peakInMatrix([[5, 3, 1]]).join() === "0,0" && peakInMatrix([[5], [3], [1]]).join() === "0,0"',
  'Matrix Median':
    'matrixMedian([[1, 3, 5], [2, 6, 9], [10, 14, 23]]) === 6 && matrixMedian([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) === 5 && matrixMedian([[1]]) === 1 && matrixMedian([[1, 2, 3, 4], [5, 6, 7, 8]]) === 5 && matrixMedian([[2, 2, 2], [2, 2, 2]]) === 2',
  'Remove Outermost Parentheses':
    'removeOutermostParens("(()())()") === "()()" && removeOutermostParens("()") === "" && removeOutermostParens("()(())") === "()" && removeOutermostParens("") === "" && removeOutermostParens("((()))") === "(())" && removeOutermostParens("()()()") === ""',
  'Reverse Words in a String':
    'reverseWords("the sky is blue") === "blue is sky the" && reverseWords("  hello world  ") === "world hello" && reverseWords("a good   example") === "example good a" && reverseWords("   ") === "" && reverseWords("single") === "single"',
  'Largest Odd Number in String':
    'largestOddNumber("4206") === "" && largestOddNumber("52918") === "5291" && largestOddNumber("35427") === "35427" && largestOddNumber("") === "" && largestOddNumber("1") === "1" && largestOddNumber("22222222") === ""',
  'Longest Common Prefix':
    'longestCommonPrefix(["flower", "flow", "flight"]) === "fl" && longestCommonPrefix(["dog", "racecar", "car"]) === "" && longestCommonPrefix(["a"]) === "a" && longestCommonPrefix([]) === "" && longestCommonPrefix(["abc", "abc", "abcd"]) === "abc" && longestCommonPrefix(["", "abc"]) === ""',
  'Isomorphic String':
    'isIsomorphic("egg", "add") && !isIsomorphic("foo", "bar") && isIsomorphic("paper", "title") && !isIsomorphic("a", "ab") && isIsomorphic("", "") && !isIsomorphic("badc", "baba")',
  'Check whether one string is a rotation of another':
    'isRotation("abcde", "cdeab") && !isRotation("abcde", "abced") && isRotation("", "") && !isRotation("a", "") && isRotation("aba", "baa") && !isRotation("aa", "a")',
  'Check if two Strings are anagrams of each other':
    'isAnagram("anagram", "nagaram") && isAnagram("", "") && !isAnagram("rat", "car") && !isAnagram("a", "ab") && isAnagram("listen", "silent") && !isAnagram("aab", "abb")',
  'Reverse Every Word in a String':
    'reverseEachWord("Hello World") === "olleH dlroW" && reverseEachWord("I am a student") === "I ma a tneduts" && reverseEachWord(" ") === " " && reverseEachWord("") === "" && reverseEachWord("ab") === "ba"',
  'Sort Characters by frequency':
    'sortByFrequency("tree") === "eert" && sortByFrequency("ccaa") === "aacc" && sortByFrequency("Aabb") === "bbAa" && sortByFrequency("cccatcc") === "cccccat" && sortByFrequency("") === "" && sortByFrequency("aaaa") === "aaaa"',
  'Maximum Nesting Depth of Parentheses':
    'maxNestingDepth("(1+(2*3)+((8)/4))+1") === 3 && maxNestingDepth("(1)+((2))+(((3)))") === 3 && maxNestingDepth("()(())((()()))") === 3 && maxNestingDepth("1+(2*3)+((8)/4)") === 2 && maxNestingDepth("") === 0',
  'Roman to Integer':
    'romanToInt("III") === 3 && romanToInt("LVIII") === 58 && romanToInt("MCMXCIV") === 1994 && romanToInt("IV") === 4 && romanToInt("XC") === 90 && romanToInt("MMXXVI") === 2026 && romanToInt("") === 0',
  'Integer to Roman':
    'intToRoman(3) === "III" && intToRoman(4) === "IV" && intToRoman(9) === "IX" && intToRoman(58) === "LVIII" && intToRoman(1994) === "MCMXCIV" && intToRoman(2026) === "MMXXVI" && intToRoman(3999) === "MMMCMXCIX" && intToRoman(0) === ""',
  'String to Integer (atoi)':
    'myAtoi("42") === 42 && myAtoi("   -42") === -42 && myAtoi("4193 with words") === 4193 && myAtoi("words and 987") === 0 && myAtoi("-9128347233") === -2147483648 && myAtoi("9128347233") === 2147483647 && myAtoi("") === 0 && myAtoi("     +0 123") === 0 && myAtoi("2147483648") === 2147483647 && myAtoi("-0045001") === -45001 && myAtoi("+-13") === 0',
  'Count number of Substrings with K distinct characters':
    'substringsWithKDistinct("abcaba", 3) === 9 && substringsWithKDistinct("aba", 2) === 3 && substringsWithKDistinct("aaaa", 1) === 10 && substringsWithKDistinct("abc", 1) === 3 && substringsWithKDistinct("abaca", 2) === 6 && substringsWithKDistinct("abcaba", 0) === 0 && substringsWithKDistinct("", 2) === 0',
  'Longest Palindromic Substring':
    'longestPalindrome("babad") === "bab" && longestPalindrome("cbbd") === "bb" && longestPalindrome("a") === "a" && longestPalindrome("") === "" && longestPalindrome("racecar") === "racecar" && longestPalindrome("abba") === "abba" && longestPalindrome("aacabdkacaa") === "aca"',
  'Sum of Beauty of all Substrings':
    'beautySum("aabcb") === 5 && beautySum("aabb") === 2 && beautySum("abcd") === 0 && beautySum("aaa") === 0 && beautySum("aa") === 0 && beautySum("") === 0',
  'Introduction to LinkedList, Learn about struct/class':
    '(() => { const a = new Node(1); const b = new Node(2); a.next = b; return a.value === 1 && b.next === null && toArray(a).join() === "1,2" && fromArray([]) === null && nodeAt(fromArray([4, 5, 6]), 1).value === 5 && nodeAt(fromArray([4, 5, 6]), 3) === null; })()',
  'Inserting a node in LinkedList':
    'toArray(insertAt(null, 0, 7)).join() === "7" && toArray(insertAt(fromArray([1, 2, 3]), 0, 0)).join() === "0,1,2,3" && toArray(insertAt(fromArray([1, 2, 3]), 1, 9)).join() === "1,9,2,3" && toArray(insertAt(fromArray([1, 2, 3]), 3, 4)).join() === "1,2,3,4" && toArray(insertAt(fromArray([1, 2, 3]), 99, 4)).join() === "1,2,3,4" && toArray(insertAt(fromArray([1, 2, 3]), 0, 0)).length === 4',
  'Deleting a node in LinkedList':
    '(() => { const kept = toArray(deleteAt(fromArray([1, 2, 3]), 0)).join() === "2,3" && toArray(deleteAt(fromArray([1, 2, 3]), 1)).join() === "1,3" && toArray(deleteAt(fromArray([1, 2, 3]), 2)).join() === "1,2" && toArray(deleteAt(fromArray([1, 2, 3]), 7)).join() === "1,2,3" && toArray(deleteAt(null, 0)).join() === ""; const l = fromArray([1, 2, 3]); const copied = deleteGiven(nodeAt(l, 1)); const after = toArray(l).join(); const tail = deleteGiven(nodeAt(l, 1)); return kept && copied && after === "1,3" && !tail && toArray(l).join() === "1,3"; })()',
  'Find the length of the linkedlist':
    'lengthOf(fromArray([1, 2, 3, 4])) === 4 && lengthOf(null) === 0 && lengthRec(fromArray([7])) === 1 && lengthRec(null) === 0 && lengthOf(fromArray([1, 2, 3])) === lengthRec(fromArray([1, 2, 3]))',
  'Search an element in the LL':
    'indexOfValue(fromArray([4, 5, 1]), 5) === 1 && indexOfValue(fromArray([4, 5, 1]), 9) === -1 && indexOfValue(null, 1) === -1 && indexOfValue(fromArray([1, 2, 1]), 1) === 0 && contains(fromArray([NaN]), NaN) && !contains(fromArray([1, 2]), 3)',
  'Introduction to Doubly LinkedList':
    '(() => { const l = fromArrayD([1, 2, 3]); const t = tailOf(l); return toArrayD(l).join() === "1,2,3" && toArrayBack(l).join() === "3,2,1" && t.value === 3 && t.next === null && nodeAtD(l, 0).prev === null && nodeAtD(l, 2).prev === nodeAtD(l, 1) && nodeAtD(l, 1).next.value === 3 && fromArrayD([]) === null && tailOf(null) === null; })()',
  'Insert a node in DLL':
    '(() => { const l = fromArrayD([1, 2, 3]); insertAfter(nodeAtD(l, 1), 99); const grafted = toArrayD(l).join() === "1,2,99,3" && toArrayBack(l).join() === "3,99,2,1" && nodeAtD(l, 2).prev.value === 2; return grafted && toArrayD(insertAtD(fromArrayD([1, 2, 3]), 0, 0)).join() === "0,1,2,3" && toArrayD(insertAtD(fromArrayD([1, 2, 3]), 2, 9)).join() === "1,2,9,3" && toArrayD(insertAtD(fromArrayD([1, 2, 3]), 9, 4)).join() === "1,2,3,4" && toArrayD(insertAtD(null, 3, 7)).join() === "7" && insertAtD(fromArrayD([1, 2]), 1, 9).prev === null; })()',
  'Delete a node in DLL':
    '(() => { const l = fromArrayD([1, 2, 3, 4]); const afterHead = deleteAtD(l, 0); const headRead = toArrayD(afterHead).join(); const boundary = afterHead.prev === null; const afterTail = deleteAtD(afterHead, 2); return headRead === "2,3,4" && boundary && toArrayD(afterTail).join() === "2,3" && toArrayBack(afterTail).join() === "3,2" && toArrayD(deleteAtD(fromArrayD([1, 2, 3]), 9)).join() === "1,2,3" && deleteAtD(null, 0) === null && l.next === null && l.prev === null; })()',
  'Reverse a Doubly Linked List':
    '(() => { const l = fromArrayD([1, 2, 3, 4]); const r = reverseD(l); const once = toArrayD(r).join() === "4,3,2,1" && toArrayBack(r).join() === "1,2,3,4"; const twice = toArrayD(reverseD(r)).join() === "1,2,3,4"; return once && twice && toArrayD(reverseDRec(fromArrayD([1, 2, 3]))).join() === "3,2,1" && reverseD(null) === null && toArrayD(reverseD(fromArrayD([9]))).join() === "9"; })()',
  'Middle of a LinkedList (Tortoise-Hare)':
    'findMiddle(fromArray([1, 2, 3, 4, 5])).value === 3 && findMiddle(fromArray([1, 2, 3, 4])).value === 3 && findMiddle(fromArray([1])).value === 1 && findMiddle(null) === null',
  'Reverse a LinkedList (Iterative & Recursive)':
    '(() => { const r = reverseList(fromArray([1, 2, 3, 4])); return toArray(r).join() === "4,3,2,1" && toArray(reverseList(r)).join() === "1,2,3,4" && toArray(reverseList(fromArray([1]))).join() === "1" && toArray(reverseList(null)).join() === ""; })()',
  'Detect a loop in LL':
    '(() => { const h = fromArrayWithCycle([1, 2, 3, 4], 1); return hasCycle(h) && hasCycle(fromArrayWithCycle([1, 2], 0)) && !hasCycle(fromArrayWithCycle([1, 2, 3], -1)) && !hasCycle(null) && !hasCycle(fromArrayWithCycle([], -1)); })()',
  'Find the starting point of the loop of LinkedList':
    '(() => { const a = fromArrayWithCycle([1, 2, 3, 4], 1); const b = fromArrayWithCycle([1, 2, 3, 4, 5], 3); return cycleEntry(a).value === 2 && cycleEntry(b).value === 4 && cycleEntry(fromArrayWithCycle([1, 2], 0)).value === 1 && cycleEntry(fromArrayWithCycle([1], 0)).value === 1 && cycleEntry(fromArrayWithCycle([1, 2, 3], -1)) === null && cycleEntry(null) === null; })()',
  'Length of Loop in LinkedList':
    'loopLength(fromArrayWithCycle([1, 2, 3, 4], 3)) === 1 && loopLength(fromArrayWithCycle([1, 2, 3, 4], 1)) === 3 && loopLength(fromArrayWithCycle([1, 2, 3, 4, 5, 6], 2)) === 4 && loopLength(fromArrayWithCycle([5, 5, 5], 0)) === 3 && loopLength(fromArrayWithCycle([1, 2, 3], -1)) === 0 && loopLength(null) === 0',
  'Check if LL is palindrome or not':
    '(() => { const odd = fromArray([1, 2, 3, 2, 1]); const even = fromArray([1, 2, 2, 1]); const flat = fromArray([7, 7, 7]); const no = fromArray([1, 2, 3]); return isListPalindrome(odd) && isListPalindrome(even) && isListPalindrome(flat) && !isListPalindrome(no) && isListPalindrome(fromArray([7])) && isListPalindrome(null) && toArray(odd).join() === "1,2,3,2,1" && toArray(even).join() === "1,2,2,1" && isListPalindrome(odd); })()',
  'Remove Nth node from the back of the LL':
    'toArray(removeNthFromEnd(fromArray([1, 2, 3, 4, 5]), 2)).join() === "1,2,3,5" && toArray(removeNthFromEnd(fromArray([1]), 1)).join() === "" && toArray(removeNthFromEnd(fromArray([1, 2]), 2)).join() === "2" && toArray(removeNthFromEnd(fromArray([1, 2, 3]), 1)).join() === "1,2" && toArray(removeNthFromEnd(fromArray([1, 2, 3]), 9)).join() === "1,2,3" && removeNthFromEnd(null, 1) === null',
  'Delete the middle node of LL':
    'toArray(deleteMiddle(fromArray([1, 2, 3, 4, 5]))).join() === "1,2,4,5" && toArray(deleteMiddle(fromArray([1, 2, 3, 4]))).join() === "1,2,4" && toArray(deleteMiddle(fromArray([1, 2]))).join() === "1" && toArray(deleteMiddle(fromArray([7]))).join() === "" && deleteMiddle(null) === null',
  'Find the intersection point of Y LL':
    '(() => { const shared = chain([8, 9]); const a = chain([1, 2, 3], shared); const b = chain([4, 5], shared); const same = chain([1, 2]); const disjoint = chain([1, 2]); return intersection(a, b) === shared && intersection(b, a) === shared && toArray(intersection(a, b)).join() === "8,9" && intersection(same, same) === same && intersection(same, disjoint) === null && intersection(chain([1]), disjoint) === null && intersection(null, chain([1])) === null; })()',
  'Segrregate odd and even nodes in LL':
    'toArray(oddThenEven(fromArray([1, 2, 3, 4, 5]))).join() === "1,3,5,2,4" && toArray(oddThenEven(fromArray([2, 1, 3, 5, 6, 4, 7]))).join() === "2,3,6,7,1,5,4" && toArray(oddThenEven(fromArray([1, 2]))).join() === "1,2" && toArray(oddThenEven(fromArray([1]))).join() === "1" && toArray(oddThenEven(null)).join() === ""',
  "Sort a LL of 0's 1's and 2's":
    '(() => { const l = fromArray([1, 2, 2, 1, 0]); const r = sortZeroOneTwo(l); return toArray(r).join() === "0,1,1,2,2" && r === l && toArray(sortZeroOneTwo(fromArray([2, 2, 2]))).join() === "2,2,2" && toArray(sortZeroOneTwo(fromArray([0, 0, 0]))).join() === "0,0,0" && toArray(sortZeroOneTwo(fromArray([1]))).join() === "1" && toArray(sortZeroOneTwo(fromArray([]))).join() === "" && sortZeroOneTwo(null) === null; })()',
  'Reverse LL in group of given size K':
    'toArray(reverseKGroups(fromArray([1, 2, 3, 4, 5]), 2)).join() === "2,1,4,3,5" && toArray(reverseKGroups(fromArray([1, 2, 3, 4, 5]), 3)).join() === "3,2,1,4,5" && toArray(reverseKGroups(fromArray([1, 2]), 2)).join() === "2,1" && toArray(reverseKGroups(fromArray([1, 2, 3]), 1)).join() === "1,2,3" && toArray(reverseKGroups(fromArray([1, 2, 3]), 5)).join() === "1,2,3" && toArray(reverseKGroups(fromArray([5, 6]), 2)).join() === "6,5" && reverseKGroups(null, 3) === null',
  'Rotate a LL':
    'toArray(rotateRight(fromArray([1, 2, 3, 4, 5]), 2)).join() === "4,5,1,2,3" && toArray(rotateRight(fromArray([1, 2, 3]), 4)).join() === "3,1,2" && toArray(rotateRight(fromArray([1, 2]), 4)).join() === "1,2" && toArray(rotateRight(fromArray([1, 2, 3]), 3)).join() === "1,2,3" && toArray(rotateRight(fromArray([1, 2, 3]), 0)).join() === "1,2,3" && toArray(rotateRight(fromArray([7]), 9)).join() === "7" && rotateRight(null, 3) === null',
  'Add 2 numbers in LL':
    'toArray(addTwoNumbers(fromArray([2, 4, 3]), fromArray([5, 6, 4]))).join() === "7,0,8" && toArray(addTwoNumbers(fromArray([9, 9, 9]), fromArray([1]))).join() === "0,0,0,1" && toArray(addTwoNumbers(fromArray([9, 9]), fromArray([1, 2, 3]))).join() === "0,2,4" && toArray(addTwoNumbers(fromArray([0]), fromArray([0]))).join() === "0" && toArray(addTwoNumbers(null, fromArray([5]))).join() === "5" && toArray(addTwoNumbers(null, null)).join() === ""',
  'Add 1 to a number represented by LL':
    'toArray(addOne(fromArray([1, 2, 3]))).join() === "1,2,4" && toArray(addOne(fromArray([9, 9]))).join() === "1,0,0" && toArray(addOne(fromArray([9]))).join() === "1,0" && toArray(addOne(fromArray([1, 9, 9]))).join() === "2,0,0" && toArray(addOne(fromArray([1, 2, 9, 3]))).join() === "1,2,9,4" && toArray(addOne(fromArray([0]))).join() === "1" && toArray(addOne(fromArray([]))).join() === "1"',
  'Sort LL':
    '(() => { const l = fromArray([4, 2, 1, 3]); const originals = new Set(); for (let c = l; c !== null; c = c.next) originals.add(c); const sorted = sortList(l); let reused = true; for (let c = sorted; c !== null; c = c.next) { if (!originals.has(c)) reused = false; } return toArray(sorted).join() === "1,2,3,4" && reused && toArray(sortList(fromArray([2, 2, 1, 1]))).join() === "1,1,2,2" && toArray(sortList(fromArray([-5, 0, 5, -2]))).join() === "-5,-2,0,5" && toArray(sortList(fromArray([]))).join() === "" && sortList(null) === null && toArray(sortList(fromArray([1, 2, 3]))).join() === "1,2,3"; })()',
  'Flattening of a LinkedList':
    '(() => { const l = rows([column([5, 7, 8]), column([10, 14]), column([3, 16, 19]), column([2, 4, 9, 11])]); return flatValues(flatten(l)).join() === "2,3,4,5,7,8,9,10,11,14,16,19" && flatValues(flatten(rows([column([1, 3])]))).join() === "1,3" && flatValues(flatten(rows([column([2]), column([1])]))).join() === "1,2" && flatten(null) === null; })()',
  'Clone a Linked List with random and next pointer':
    '(() => { const src = buildWithRandom([1, 2, 3, 4], [1, 0, 3, -1]); const copy = cloneList(src); const originals = new Set(); for (let c = src; c !== null; c = c.next) originals.add(c); let disjoint = true; for (let c = copy; c !== null; c = c.next) { if (originals.has(c)) disjoint = false; } const srcKept = toArray(src).join() === "1,2,3,4" && src.random === nodeAt(src, 1) && nodeAt(src, 3).random === null; const copyOk = toArray(copy).join() === "1,2,3,4" && copy.random === nodeAt(copy, 1) && nodeAt(copy, 1).random === copy && nodeAt(copy, 2).random === nodeAt(copy, 3) && nodeAt(copy, 3).random === null; return disjoint && srcKept && copyOk && cloneList(null) === null && toArray(cloneList(buildWithRandom([9], [-1]))).join() === "9"; })()',
  'Find Middle of Singly Linked List':
    'firstMiddle(fromArray([1, 2, 3, 4])).value === 2 && firstMiddle(fromArray([1, 2, 3, 4, 5])).value === 3 && firstMiddle(fromArray([1, 2])).value === 1 && firstMiddle(fromArray([1])).value === 1 && firstMiddle(null) === null && middleByLength(fromArray([1, 2, 3, 4])).value === firstMiddle(fromArray([1, 2, 3, 4])).value && middleByLength(fromArray([1, 2, 3, 4, 5, 6, 7])).value === 4 && middleByLength(null) === null',
  'Find the Length of Loop in Linked List':
    'loopLengthByRecord(fromArrayWithCycle([1, 2, 3, 4], 1)) === 3 && loopLengthByRecord(fromArrayWithCycle([1, 2, 3, 4], 3)) === 1 && loopLengthByRecord(fromArrayWithCycle([5, 5, 5], 0)) === 3 && loopLengthByRecord(fromArrayWithCycle([1, 2, 3, 4, 5, 6], 2)) === 4 && loopLengthByRecord(fromArrayWithCycle([1, 2, 3], -1)) === 0 && loopLengthByRecord(null) === 0 && loopEntryByRecord(fromArrayWithCycle([1, 2, 3, 4], 1)).value === 2 && loopEntryByRecord(fromArrayWithCycle([1, 2, 3], -1)) === null',
  'Palindrome Linked List':
    'isPalindromeByRecursion(fromArray([1, 2, 1])) && isPalindromeByRecursion(fromArray([1, 2, 2, 1])) && isPalindromeByRecursion(fromArray([7, 7, 7])) && !isPalindromeByRecursion(fromArray([1, 2, 3])) && !isPalindromeByRecursion(fromArray([1, 2])) && isPalindromeByRecursion(fromArray([7])) && isPalindromeByRecursion(null) && isPalindromeByRecursion(fromArray([]))',
  'Print all Subsequences / Power Set':
    '(() => { const byIndex = subsequences([1, 2, 3]); const byBits = subsequencesByBits([1, 2, 3]); const a = byIndex.map((s) => s.join()).sort(); const b = byBits.map((s) => s.join()).sort(); return byIndex.length === 8 && a.join("|") === b.join("|") && byIndex[0].join() === "1,2,3" && subsequences([]).length === 1 && subsequences([7]).map((s) => s.join()).join("|") === "7|"; })()',
  'Learn All Patterns of Subsequences (Sum = K)':
    '(() => { printSumK([1, 2, 3], 3); const first = logged.join("|") === "1 2|3"; logged.length = 0; printSumK([1, 2, 1, 3], 3); const second = logged.join("|") === "1 2|2 1|3"; logged.length = 0; printSumK([0, 0], 0); return first && second && logged.length === 4; })()',
  'Count all subsequences with sum K':
    'countWays([1, 2, 1, 3], 3) === 3 && countWaysMemo([1, 2, 1, 3], 3) === 3 && countWays([1, 1, 1], 2) === 3 && countWays([1, 2, 3], 0) === 1 && countWays([0], 0) === 2 && countWays([], 0) === 1 && countWays([0, 0], 0) === 4 && countWays([2, -1, 1], 1) === 2 && countWaysMemo([2, -1, 1], 1) === 2',
  'Subset Sum I':
    '(() => { const want = "0,1,2,3,3,4,4,5,5,6,6,7,7,8,9,10"; return subsetSums([1, 2, 3, 4]).join() === want && subsetSumsByDoubling([1, 2, 3, 4]).join() === want && subsetSums([]).join() === "0" && subsetSums([5]).join() === "0,5" && subsetSums([2, 2]).join() === "0,2,2,4"; })()',
  'Subset Sum II':
    '(() => { const want = "0,1,2,3,4,5,6,7,8,9,10"; return uniqueSumsBySet([1, 2, 3, 4]).join() === want && uniqueSumsBySkipping([1, 2, 3, 4]).join() === want && uniqueSumsBySet([1, 2, 1]).join() === "0,1,2,3,4" && uniqueSumsBySkipping([1, 2, 1]).join() === "0,1,2,3,4" && uniqueSumsBySet([]).join() === "0" && uniqueSumsBySet([0, 0, 0]).join() === "0" && uniqueSumsBySet([5, 5]).join() === "0,5,10"; })()',
  'Subset Sum with Target':
    'hasSumMemo([3, 4, 5], 7) && hasSumTable([3, 4, 5], 7) && !hasSumMemo([1, 2, 3], 7) && !hasSumTable([1, 2, 3], 7) && hasSumMemo([3, 4], 0) && hasSumTable([3, 4], 0) && hasSumMemo([5, 5], 10) && hasSumTable([5, 5], 10) && !hasSumTable([5, 5], 7) && hasSumTable([], 0) && hasSumMemo([], 0) && hasSumTable([0], 0) && hasSumMemo([2, 7, 1], 9)',
  'Combination Sum':
    '(() => { const a = combinations([2, 3, 5], 5).map((c) => c.join("+")).join("|"); const b = combinations([2, 3, 6, 7], 7).map((c) => c.join("+")).join("|"); const input = [3, 1, 2]; combinations(input, 4); return a === "2+3|5" && b === "2+2+3|7" && combinations([2], 1).length === 0 && combinations([2, 3, 5], 0).length === 1 && combinations([2, 3, 5], 0)[0].length === 0 && input.join() === "3,1,2"; })()',
  'Combination Sum II':
    '(() => { const a = combinationsOnce([10, 1, 2, 7, 6, 1, 5], 8).map((c) => c.join("+")).join("|"); const b = combinationsOnce([2, 5, 2, 1, 2], 5).map((c) => c.join("+")).join("|"); return a === "1+1+6|1+2+5|1+7|2+6" && b === "1+2+2|5" && combinationsOnce([1, 1], 3).length === 0 && combinationsOnce([], 0).length === 1; })()',
  'Combination Sum III':
    '(() => { const a = digitCombinations(3, 7).map((c) => c.join("")).join("|"); const b = digitCombinations(3, 9).map((c) => c.join("")).join("|"); return a === "124" && b === "126|135|234" && digitCombinations(2, 7).length === 3 && digitCombinations(9, 45).length === 1 && digitCombinations(1, 5).length === 1 && digitCombinations(2, 20).length === 0 && digitCombinations(3, 6).map((c) => c.join("")).join("|") === "123"; })()',
  'Generate Parentheses':
    '(() => { const three = generateBalanced(3); return three.join("|") === "((()))|(()())|(())()|()(())|()()()" && generateBalanced(1).join() === "()" && generateBalanced(0).length === 1 && generateBalanced(0).join() === "" && generateBalanced(2).length === 2 && generateBalanced(4).length === 14; })()',
  'Generate all binary strings without consecutive 1s':
    '(() => { const agrees = [0, 1, 2, 3, 4, 5, 6].every((n) => binaryStrings(n).length === countBinaryStrings(n)); return binaryStrings(3).join("|") === "000|001|010|100|101" && binaryStrings(2).join("|") === "00|01|10" && binaryStrings(3).every((s) => !s.includes("11")) && countBinaryStrings(0) === 1 && countBinaryStrings(1) === 2 && countBinaryStrings(5) === 13 && agrees; })()',
  'Letter Combinations of a Phone Number':
    '(() => { const a = letterCombinations("23"); const b = letterCombinations("79"); return a.join("|") === "ad|ae|af|bd|be|bf|cd|ce|cf" && b.length === 16 && b[0] === "pw" && letterCombinations("2").join("") === "abc" && letterCombinations("").length === 0 && new Set(a).size === 9; })()',
  'Palindrome Partitioning':
    '(() => { const a = palindromePartitions("aab").map((p) => p.join("/")).join("|"); const b = palindromePartitions("abb").map((p) => p.join("/")).join("|"); return a === "a/a/b|aa/b" && b === "a/b/b|a/bb" && palindromePartitions("a").map((p) => p.join("/")).join("|") === "a" && palindromePartitions("").length === 1 && palindromePartitions("aaa").length === 4; })()',
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
      if (problem.step <= 6) expect(dsa.has(problem.topicSlug), `${problem.name} sits outside p03`).toBe(true);
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
