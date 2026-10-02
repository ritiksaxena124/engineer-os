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
  'Word Search':
    '(() => { const board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]; const before = board.map((r) => r.join("")).join("|"); const hit = wordExists(board, "ABCCED"); const edge = wordExists(board, "SEE"); const repeat = wordExists(board, "ABCB"); return hit && edge && !repeat && board.map((r) => r.join("")).join("|") === before && wordExists([["A"]], "A") && !wordExists([["A"]], "AA") && !wordExists([], "A"); })()',
  'N Queens':
    '(() => { const four = placeQueens(4).map((c) => c.join("")).join("|"); return four === "1302|2031" && placeQueens(1).map((c) => c.join("")).join("|") === "0" && placeQueens(2).length === 0 && placeQueens(3).length === 0 && placeQueens(6).length === 4 && placeQueens(8).length === 92; })()',
  'Rat in a Maze':
    '(() => { const m = [[1,0,0,0],[1,1,0,1],[1,1,0,0],[0,1,1,1]]; const before = m.map((r) => r.join("")).join("|"); const p = mazePaths(m); return p.join("|") === "DDRDRR|DRDDRR" && m.map((r) => r.join("")).join("|") === before && mazePaths([[1]]).length === 1 && mazePaths([[0]]).length === 0 && mazePaths([]).length === 0 && mazePaths([[1,1],[1,1]]).join("|") === "DR|RD"; })()',
  'M Coloring Problem':
    '(() => { const triangle = [[1,1,1],[1,0,1],[1,1,0]]; const three = colorGraph(triangle, 3); const two = colorGraph(triangle, 2); const line = colorGraph([[0,1,0],[1,0,1],[0,1,0]], 2); const proper = three !== null && three.length === 3 && three[0] !== three[1] && three[1] !== three[2] && three[0] !== three[2]; return proper && two === null && line !== null && line.join("") === "010" && colorGraph([[0]], 1).join("") === "0" && colorGraph([[0]], 0) === null; })()',
  'Word Break':
    '(() => { return wordBreakable("leetcode", ["leet","code"]) && wordBreakableByTable("leetcode", ["leet","code"]) && wordBreakable("applepenapple", ["apple","pen"]) && wordBreakableByTable("applepenapple", ["apple","pen"]) && !wordBreakable("catsandog", ["cats","dog","sand","and","cat"]) && !wordBreakableByTable("catsandog", ["cats","dog","sand","and","cat"]) && wordBreakable("aaaa", ["aa"]) && wordBreakable("cars", ["car","ca","rs"]) && !wordBreakable("a", []) && wordBreakable("", ["a"]) && wordBreakableByTable("", ["a"]); })()',
  'Sudoku Solver':
    '(() => { const grid = [[5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],[8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],[0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]]; const done = solveSudoku(grid); const lines = []; for (let i = 0; i < 9; i += 1) { const row = []; const col = []; for (let j = 0; j < 9; j += 1) { row.push(grid[i][j]); col.push(grid[j][i]); } lines.push(row); lines.push(col); } for (let br = 0; br < 3; br += 1) { for (let bc = 0; bc < 3; bc += 1) { const box = []; for (let r = br * 3; r < br * 3 + 3; r += 1) { for (let c = bc * 3; c < bc * 3 + 3; c += 1) box.push(grid[r][c]); } lines.push(box); } } const valid = lines.every((l) => l.length === 9 && !l.includes(0) && new Set(l).size === 9); return done && valid && grid[0][2] === 4 && grid[8][8] === 9; })()',
  'Solve the Sudoku':
    '(() => { const classic = [[5,3,0,0,7,0,0,0,0],[6,0,0,1,9,5,0,0,0],[0,9,8,0,0,0,0,6,0],[8,0,0,0,6,0,0,0,3],[4,0,0,8,0,3,0,0,1],[7,0,0,0,2,0,0,0,6],[0,6,0,0,0,0,2,8,0],[0,0,0,4,1,9,0,0,5],[0,0,0,0,8,0,0,7,9]]; const before = classic.map((r) => r.join("")).join("|"); const unique = countSolutions(classic, 2); const restored = classic.map((r) => r.join("")).join("|") === before; const dead = [[1,2,3,4,5,6,7,8,0],[0,0,0,0,0,0,0,0,9],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0]]; const open = []; for (let i = 0; i < 9; i += 1) open.push([0,0,0,0,0,0,0,0,0]); return unique === 1 && restored && countSolutions(dead, 2) === 0 && candidatesFor(dead, 0, 8).length === 0 && countSolutions(open, 2) === 2; })()',
  'Expression Add Operators':
    '(() => { const a = addOperators("232", 8).slice().sort().join("|"); const b = addOperators("123", 6).slice().sort().join("|"); return a === "2*3+2|2+3*2" && b === "1*2*3|1+2+3" && addOperators("05", 5).join("|") === "0+5" && addOperators("2147483647", 2147483647).join("|") === "2147483647" && addOperators("0", 0).join("|") === "0" && addOperators("1", 2).length === 0; })()',
  'Introduction to Bit Manipulation':
    '(() => { const six = bitReport(6); const neg = bitReport(-4); return six.isEven && six.lowestBit === 0 && six.clearedLowest === 6 && six.doubled === 12 && six.halved === 3 && six.complement === -7 && six.flippedLowBits === 3 && !bitReport(5).isEven && bitReport(5).clearedLowest === 4 && neg.halved === -2 && bitReport(-1).unsignedHalf === 2147483647; })()',
  'Check if the i-th bit is set or not':
    'bitAt(5, 0) === 1 && bitAt(5, 1) === 0 && bitAt(5, 2) === 1 && bitAt(8, 3) === 1 && bitAt(8, 4) === 0 && isBitSet(5, 1) === false && isBitSet(5, 2) && isBitSet(0, 0) === false && isBitSet(255, 7) && !isBitSet(255, 8)',
  'Check if a number is odd or not':
    'isOdd(7) && !isOdd(8) && isOdd(-3) && !isOdd(-4) && isEven(0) && !isEven(1) && isEven(-2) && !isEven(-3)',
  'Check if a number is power of 2 or not':
    'isPowerOfTwo(1) && isPowerOfTwo(2) && isPowerOfTwo(1024) && isPowerOfTwo(2 ** 30) && !isPowerOfTwo(0) && !isPowerOfTwo(-8) && !isPowerOfTwo(6) && !isPowerOfTwo(12) && !isPowerOfTwo(2 ** 30 + 2 ** 29)',
  'Count the number of set bits':
    'setBits(0) === 0 && setBits(7) === 3 && setBits(12345) === 6 && setBits(2 ** 40 + 1) === 2 && setBitsKernighan(0) === 0 && setBitsKernighan(255) === 8 && setBitsKernighan(12) === 2 && bitCountsUpTo(5).join() === "0,1,1,2,1,2" && bitCountsUpTo(0).join() === "0" && bitCountsUpTo(8).join() === "0,1,1,2,1,2,2,3,1"',
  'Set/Unset the rightmost unset bit':
    'setRightmostUnset(0) === 1 && setRightmostUnset(3) === 7 && setRightmostUnset(11) === 15 && clearRightmostSet(0) === 0 && clearRightmostSet(1) === 0 && clearRightmostSet(12) === 8 && clearRightmostSet(11) === 10',
  'Swap two numbers without third variable':
    '(() => { const a = swapXor([3, 8]); const b = swapXor([5, 5]); const c = swapDestructured([3, 8]); return a.join() === "8,3" && b.join() === "5,5" && c.join() === "8,3" && swapXor([0, 0]).join() === "0,0" && swapDestructured([3000000000, 1]).join() === "1,3000000000"; })()',
  'Divide two integers without multiplication or division':
    'divide(10, 3) === 3 && divide(43, 5) === 8 && divide(-7, 2) === -3 && divide(7, -2) === -3 && divide(1, 2) === 0 && divide(0, 5) === 0 && divide(2147483647, 1) === 2147483647 && divide(-2147483648, -1) === 2147483647 && divide(-2147483648, 2) === -1073741824 && divideBySubtraction(43, 5) === 8 && divideBySubtraction(-7, 2) === -3 && divideBySubtraction(0, 3) === 0',
  'Count number of bits to be flipped to convert A to B':
    'bitsToFlip(1, 4) === 2 && bitsToFlip(0, 0) === 0 && bitsToFlip(3, 10) === 2 && bitsToFlip(15, 8) === 3 && bitsToFlip(-1, 0) === 32 && differingPositions(1, 4).join() === "0,2" && differingPositions(0, 0).length === 0 && differingPositions(-1, 0).length === 32',
  'Find the number that appears odd number of times':
    'oddOccurrence([4, 1, 2, 1, 2]) === 4 && oddOccurrence([7]) === 7 && oddOccurrence([2, 2, 2, 2, 2]) === 2 && oddOccurrence([1, 1]) === 0 && oddOccurrenceByCount([1, 1, 1, 1, 2, 3, 3]) === 2 && oddOccurrenceByCount([1, 1, 2, 2]) === null && oddOccurrenceByCount([]) === null && oddOccurrenceByCount([0, 1, 0]) === 1',
  'Power Set using Bit Manipulation':
    'powerSet([1, 2, 3]).join("|") === "|1|2|1,2|3|1,3|2,3|1,2,3" && powerSet([1, 2]).length === 4 && powerSet([]).length === 1 && powerSet([]).join("|") === "" && bitmaskSubset([1, 2, 3], 0) === "" && bitmaskSubset([1, 2, 3], 5) === "1,3" && bitmaskSubset([1, 2, 3], 7) === "1,2,3"',
  'Find XOR of numbers from L to R':
    'xorUpTo(0) === 0 && xorUpTo(1) === 1 && xorUpTo(2) === 3 && xorUpTo(3) === 0 && xorUpTo(4) === 4 && xorUpTo(7) === 0 && xorUpTo(10) === 11 && xorRange(1, 10) === 11 && xorRange(3, 5) === 2 && xorRange(5, 5) === 5 && xorRange(0, 5) === 1 && xorRange(0, 0) === 0 && xorRange(17, 41) === xorRangeByLoop(17, 41) && xorRange(0, 100) === xorRangeByLoop(0, 100)',
  'Find the two numbers appearing odd number of times':
    'twoOddValues([1, 1, 2, 3, 2, 3, 4, 5]).join() === "4,5" && twoOddValues([4, 2, 4, 5, 2, 3, 3, 6]).join() === "5,6" && twoOddValues([0, 1, 0, 1, 2, 3]).join() === "2,3" && twoOddValuesByCount([4, 2, 4, 5, 2, 3, 3, 6]).join() === "5,6" && twoOddValuesByCount([1, 2, 3]).join() === "1,2,3" && twoOddValuesByCount([]).join() === ""',
  'Print Prime Factors of a Number':
    'primeFactors(360).join() === "2,2,2,3,3,5" && primeFactors(60).join() === "2,2,3,5" && primeFactors(13).join() === "13" && primeFactors(2).join() === "2" && primeFactors(1).join() === "" && distinctPrimeFactorsOfProduct([10, 21]).join() === "2,3,5,7" && distinctPrimeFactorsOfProduct([2, 3, 5, 15]).join() === "2,3,5" && distinctPrimeFactorsOfProduct([1, 1]).join() === ""',
  'All Divisors of a Natural Number':
    'divisors(28).join() === "1,2,4,7,14,28" && divisors(16).join() === "1,2,4,8,16" && divisors(7).join() === "1,7" && divisors(1).join() === "1" && hasExactlyThreeDivisors(4) && hasExactlyThreeDivisors(9) && !hasExactlyThreeDivisors(2) && !hasExactlyThreeDivisors(6) && !hasExactlyThreeDivisors(16) && !hasExactlyThreeDivisors(1)',
  'Sieve of Eratosthenes':
    'sievePrimes(30).join() === "2,3,5,7,11,13,17,19,23,29" && sievePrimes(10).join() === "2,3,5,7" && sievePrimes(2).join() === "2" && sievePrimes(1).join() === "" && sievePrimes(0).join() === "" && countPrimesBelow(10) === 4 && countPrimesBelow(30) === 10 && countPrimesBelow(3) === 1 && countPrimesBelow(2) === 0',
  'Find Prime Factorisation using Sieve':
    '(() => { const spf = smallestPrimeFactors(1000); return factoriseWithSpf(60, spf).join() === "2,2,3,5" && factoriseWithSpf(360, spf).join() === "2,2,2,3,3,5" && factoriseWithSpf(97, spf).join() === "97" && factoriseWithSpf(1, spf).join() === "" && spf[4] === 2 && spf[9] === 3 && spf[49] === 7 && spf[97] === 97 && spf[1] === 0 && smallestPrimeFactors(1)[1] === 0 && factoriseWithSpf(1001, spf).join() === ""; })()',
  'Power(n, x)':
    'power(2, 10) === 1024 && power(2, -2) === 0.25 && power(2, -10) === 0.0009765625 && power(-2, 3) === -8 && power(-2, 4) === 16 && power(3, 0) === 1 && power(0, 0) === 1 && power(0, 5) === 0 && power(0, -1) === Infinity && Math.abs(power(1.1, 3) - 1.331) < 1e-12 && powerRecursive(2, 10) === 1024 && powerRecursive(2, -3) === 0.125 && Math.abs(powerRecursive(1.1, 3) - 1.331) < 1e-12',
  'Implement Stack using Array':
    '(() => { const s = new ArrayStack(); s.push(1); s.push(2); s.push(3); return s.size() === 3 && s.pop() === 3 && s.peek() === 2 && s.pop() === 2 && s.pop() === 1 && s.isEmpty() && s.pop() === null && s.peek() === null && s.push(9) === 1 && !s.isEmpty() && s.pop() === 9; })()',
  'Implement Queue using Array':
    '(() => { const q = new ArrayQueue(); for (let v = 1; v <= 5; v += 1) q.enqueue(v); const first = q.dequeue(); const size = q.size(); q.enqueue(6); const rest = []; while (!q.isEmpty()) rest.push(q.dequeue()); return first === 1 && size === 4 && rest.join() === "2,3,4,5,6" && q.dequeue() === null && q.front() === null && q.isEmpty() && q.enqueue(7) === 1 && q.front() === 7; })()',
  'Implement Stack using Queue':
    '(() => { const s = new QueueStack(); const a = s.push(1) === 1 && s.push(2) === 2 && s.push(3) === 3 && s.pop() === 3 && s.peek() === 2 && s.size() === 2 && s.pop() === 2 && s.pop() === 1 && s.pop() === null && s.peek() === null && s.isEmpty(); const t = new QueueStack(); const b = t.push(1) === 1 && t.push(2) === 2 && t.pop() === 2 && t.push(3) === 2 && t.pop() === 3 && t.pop() === 1; return a && b; })()',
  'Implement Queue using Stack':
    '(() => { const q = new StackQueue(); q.enqueue(1); q.enqueue(2); q.enqueue(3); const a = q.dequeue(); const size = q.size(); q.enqueue(4); const rest = [q.dequeue(), q.dequeue(), q.dequeue(), q.dequeue()]; return a === 1 && size === 2 && rest.length === 4 && rest[0] === 2 && rest[1] === 3 && rest[2] === 4 && rest[3] === null && q.front() === null && q.isEmpty() && q.moves === 14; })()',
  'Implement Queue using Stack (amortized O(1))':
    '(() => { const q = new AmortizedQueue(); q.enqueue(1); q.enqueue(2); q.enqueue(3); const a = [q.dequeue(), q.dequeue(), q.dequeue()]; q.enqueue(4); q.enqueue(5); const b = [q.dequeue(), q.dequeue(), q.dequeue()]; return a.join() === "1,2,3" && b.length === 3 && b[0] === 4 && b[1] === 5 && b[2] === null && q.moves === 5 && q.size() === 0 && q.front() === null && q.enqueue(6) === 1 && q.front() === 6; })()',
  'Implement Stack using Linked List':
    '(() => { const s = new ListStack(); s.push(1); s.push(2); s.push(3); return s.size() === 3 && s.toArray().join() === "3,2,1" && s.pop() === 3 && s.peek() === 2 && s.pop() === 2 && s.pop() === 1 && s.isEmpty() && s.pop() === null && s.peek() === null && s.toArray().join() === "" && s.push(4) === 1 && s.toArray().join() === "4"; })()',
  'Implement Queue using Linked List':
    '(() => { const q = new ListQueue(); q.enqueue(1); q.enqueue(2); return q.dequeue() === 1 && q.enqueue(3) === 2 && q.dequeue() === 2 && q.dequeue() === 3 && q.dequeue() === null && q.front() === null && q.isEmpty() && q.enqueue(4) === 1 && q.dequeue() === 4 && q.enqueue(5) === 1 && q.enqueue(6) === 2 && q.front() === 5; })()',
  'Check for Balanced Parentheses':
    'isBalanced("([{}])") && isBalanced("{[()]}") && isBalanced("(a+b)*[c-d]") && isBalanced("") && !isBalanced("(]") && !isBalanced("(()") && !isBalanced(")(") && !isBalanced("[{(}]") && isBalancedDepth("(()())") && isBalancedDepth("") && !isBalancedDepth(")(") && !isBalancedDepth("(()") && !isBalancedDepth("())")',
  'Implement Min Stack':
    '(() => { const s = new MinStack(); s.push(-2); s.push(0); s.push(-3); const a = s.getMin() === -3 && s.top() === -3 && s.pop() === -3 && s.getMin() === -2 && s.top() === 0; const r = new MinStack(); r.push(3); r.push(3); r.push(1); r.push(1); const b = r.getMin() === 1; r.pop(); const c = r.getMin() === 1; r.pop(); const d = r.getMin() === 3; r.pop(); const e = r.getMin() === 3; r.pop(); const f = r.getMin() === null && r.pop() === null && r.size() === 0; return a && b && c && d && e && f; })()',
  'Infix to Postfix Conversion':
    'infixToPostfix("a+b*c") === "abc*+" && infixToPostfix("(a+b)*c") === "ab+c*" && infixToPostfix("a*(b+c)/d") === "abc+*d/" && infixToPostfix("a+b+c") === "ab+c+" && infixToPostfix("2-3-4") === "23-4-" && infixToPostfix(" a + b * c ") === "abc*+" && infixToPostfix("(a+b") === null && infixToPostfix("a+b)") === null && evaluatePostfix(infixToPostfix("2+3*4")) === 14 && evaluatePostfix(infixToPostfix("(2+3)*4")) === 20 && evaluatePostfix(infixToPostfix("2-3-4")) === -5 && evaluatePostfix(infixToPostfix("8/4/2")) === 1 && evaluatePostfix("2+") === null',
  'Prefix to Infix Conversion':
    'prefixToInfix("-+ab*cd") === "((a+b)-(c*d))" && prefixToInfix("*+ab-c*de") === "((a+b)*(c-(d*e)))" && prefixToInfix("a") === "a" && prefixToInfix("ab+") === null && prefixToInfix("*+ab-cde") === null',
  'Prefix to Postfix Conversion':
    'prefixToPostfix("*+ab-c*de") === "ab+cde*-*" && prefixToPostfix("-+ab*cd") === "ab+cd*-" && prefixToPostfix("-a*bc") === "abc*-" && prefixToPostfix("a") === "a" && prefixToPostfix("ab+") === null && prefixToPostfix("*+ab-cde") === null',
  'Postfix to Prefix Conversion':
    'postfixToPrefix("ab+cde*-*") === "*+ab-c*de" && postfixToPrefix("abc-*") === "*a-bc" && postfixToPrefix("ab+") === "+ab" && postfixToPrefix("a") === "a" && postfixToPrefix("+ab") === null && postfixToPrefix("abc*") === null && postfixToPrefix("ab-cd-*") === "*-ab-cd"',
  'Postfix to Infix Conversion':
    'postfixToInfix("abc-*") === "(a*(b-c))" && postfixToInfix("ab+") === "(a+b)" && postfixToInfix("ab+c+") === "((a+b)+c)" && postfixToInfix("a") === "a" && postfixToInfix("abc*") === null && postfixToInfixMinimal("abc-*") === "a*(b-c)" && postfixToInfixMinimal("ab+c+") === "a+b+c" && postfixToInfixMinimal("abc*+") === "a+b*c" && postfixToInfixMinimal("ab+cd*+") === "a+b+c*d" && postfixToInfixMinimal("ab-c-") === "a-b-c" && postfixToInfixMinimal("abc--") === "a-(b-c)"',
  'Next Greater Element':
    'nextGreaterElement([2,1,3]).join() === "3,3,-1" && nextGreaterElement([1,2,3,4]).join() === "2,3,4,-1" && nextGreaterElement([4,3,2,1]).join() === "-1,-1,-1,-1" && nextGreaterElement([5,5]).join() === "-1,-1" && nextGreaterElement([1,1,1]).join() === "-1,-1,-1" && nextGreaterElement([]).join() === ""',
  'Next Greater Element II':
    'nextGreaterElementCircular([1,2,1]).join() === "2,-1,2" && nextGreaterElementCircular([5,4,3,2,1]).join() === "-1,5,5,5,5" && nextGreaterElementCircular([1,2,3,4]).join() === "2,3,4,-1" && nextGreaterElementCircular([1,2,3,2,1]).join() === "2,3,-1,3,2" && nextGreaterElementCircular([3,3]).join() === "-1,-1" && nextGreaterElementCircular([]).join() === ""',
  'Next Smaller Element':
    'nextSmallerElement([4,3,2,1]).join() === "3,2,1,-1" && nextSmallerElement([2,1,3]).join() === "1,-1,-1" && nextSmallerElement([1,3,2,4]).join() === "-1,2,-1,-1" && nextSmallerElement([5,5]).join() === "-1,-1" && nextSmallerElement([1,1,1]).join() === "-1,-1,-1" && nextSmallerElement([]).join() === ""',
  'Number of NGEs to the right':
    'numberOfGreaterToRight([12,13,11,9,1]).join() === "1,0,0,0,0" && numberOfGreaterToRight([1,2,3]).join() === "2,1,0" && numberOfGreaterToRight([3,1,2]).join() === "0,1,0" && numberOfGreaterToRight([2,1,3,4]).join() === "2,2,1,0" && numberOfGreaterToRight([5,4,3,2,1]).join() === "0,0,0,0,0" && numberOfGreaterToRight([3,3,3]).join() === "0,0,0" && numberOfGreaterToRight([]).join() === ""',
  'Asteroid Collision':
    'asteroidCollision([5,10,-5]).join() === "5,10" && asteroidCollision([10,2,-5]).join() === "10" && asteroidCollision([-2,-1,1,-8]).join() === "-2,-1,-8" && asteroidCollision([5,-4,-5]).join() === "" && asteroidCollision([8,1,-8]).join() === "" && asteroidCollision([1,-1,-2]).join() === "-2" && asteroidCollision([-1,-2]).join() === "-1,-2" && asteroidCollision([1,2]).join() === "1,2" && asteroidCollision([]).join() === ""',
  'Next Greater Element to the Left':
    'nextGreaterToLeft([4,3,2,1]).join() === "-1,4,3,2" && nextGreaterToLeft([1,2,3]).join() === "-1,-1,-1" && nextGreaterToLeft([3,1,2]).join() === "-1,3,3" && nextGreaterToLeft([6,7,1,5]).join() === "-1,-1,7,7" && nextGreaterToLeft([5,5]).join() === "-1,-1" && nextGreaterToLeft([]).join() === ""',
  'Previous Smaller Element':
    'previousSmallerElement([4,3,2,1]).join() === "-1,-1,-1,-1" && previousSmallerElement([1,3,2]).join() === "-1,1,1" && previousSmallerElement([2,1,3]).join() === "-1,-1,1" && previousSmallerElement([1,2,0,3]).join() === "-1,1,-1,0" && previousSmallerElement([5,5]).join() === "-1,-1" && previousSmallerElement([]).join() === ""',
  'Online Stock Span':
    '(() => { const a = new StockSpanner(); const w = [100,80,60,70,60,75,85].map((p) => a.next(p)).join(); const b = new StockSpanner(); const x = [100,80,60,70,70].map((p) => b.next(p)).join(); const c = new StockSpanner(); const y = [8,7,6,5,4,3,2,1,10].map((p) => c.next(p)).join(); const d = new StockSpanner(); const z = [1,2,3,4].map((p) => d.next(p)).join(); return w === "1,1,1,2,1,4,6" && x === "1,1,1,2,3" && y === "1,1,1,1,1,1,1,1,9" && z === "1,2,3,4"; })()',
  'Trapping Rainwater':
    'trappedWater([0,1,0,2,1,0,1,3,2,1,2,1]) === 6 && trappedWaterWithWalls([0,1,0,2,1,0,1,3,2,1,2,1]) === 6 && trappedWater([4,2,0,3,2,5]) === 9 && trappedWaterWithWalls([4,2,0,3,2,5]) === 9 && trappedWater([3,0,3]) === 3 && trappedWaterWithWalls([3,0,3]) === 3 && trappedWater([4,1,3]) === 2 && trappedWater([5,0,1]) === 1 && trappedWaterWithWalls([5,0,1]) === 1 && trappedWater([2,0,2]) === 2 && trappedWater([5]) === 0 && trappedWater([]) === 0 && trappedWaterWithWalls([]) === 0 && trappedWaterWithWalls([5]) === 0',
  'Largest Rectangle in Histogram':
    'largestRectangle([2,1,5,6,2,3]) === 10 && largestRectangle([2,4]) === 4 && largestRectangle([6,2,5,4,5,1,6]) === 12 && largestRectangle([1,1,1]) === 3 && largestRectangle([1,2,3,4,5]) === 9 && largestRectangle([5,4,3,2,1]) === 9 && largestRectangle([2,2,2]) === 6 && largestRectangle([2,1,2]) === 3 && largestRectangle([5]) === 5 && largestRectangle([0,0]) === 0 && largestRectangle([]) === 0',
  'Sum of Subarray Minimums':
    'sumSubarrayMins([3,1,2,4]) === 17 && sumSubarrayMins([2,2]) === 6 && sumSubarrayMins([1,2,3]) === 10 && sumSubarrayMins([3,3,3]) === 18 && sumSubarrayMins([5]) === 5 && sumSubarrayMins([]) === 0 && sumSubarrayMins([71,18,22,29,55,12,64,23,17,26]) === 992 && sumSubarrayMinsNaive([3,1,2,4]) === 17 && sumSubarrayMinsNaive([2,2]) === 6 && sumSubarrayMinsNaive([3,3,3]) === 18 && sumSubarrayMinsNaive([]) === 0 && sumSubarrayMinsNaive([71,18,22,29,55,12,64,23,17,26]) === 992',
  'Sum of Subarray Ranges':
    'sumSubarrayRanges([4,1,3]) === 8 && sumSubarrayRanges([1,2,3]) === 4 && sumSubarrayRanges([1,2,4]) === 6 && sumSubarrayRanges([2,2,2]) === 0 && sumSubarrayRanges([1,2,1]) === 3 && sumSubarrayRanges([2,2,1]) === 2 && sumSubarrayRanges([9]) === 0 && sumSubarrayRanges([]) === 0 && sumSubarrayRanges([71,18,22,29,55,12,64,23,17,26]) === 1996 && sumSubarrayRangesNaive([4,1,3]) === 8 && sumSubarrayRangesNaive([1,2,3]) === 4 && sumSubarrayRangesNaive([2,2,1]) === 2 && sumSubarrayRangesNaive([1,2,4]) === 6 && sumSubarrayRangesNaive([71,18,22,29,55,12,64,23,17,26]) === 1996',
  'Remove K Digits':
    'removeKDigits("1432219", 3) === "1219" && removeKDigits("10200", 1) === "200" && removeKDigits("10", 2) === "0" && removeKDigits("10", 1) === "0" && removeKDigits("4321", 2) === "21" && removeKDigits("12345", 2) === "123" && removeKDigits("9", 1) === "0" && removeKDigits("10001", 1) === "1" && removeKDigits("112", 1) === "11" && removeKDigits("0000", 2) === "0" && removeKDigits("5337", 2) === "33" && removeKDigits("123456", 0) === "123456"',
  'Maximal Rectangle (Matrix)':
    'maximalRectangle([[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]]) === 6 && maximalRectangle([[0]]) === 0 && maximalRectangle([[1]]) === 1 && maximalRectangle([]) === 0 && maximalRectangle([[1,1,1],[1,1,1]]) === 6 && maximalRectangle([[0,0],[0,0]]) === 0 && maximalRectangle([[1,0,1,1],[1,0,1,1]]) === 4 && maximalRectangle([[1,1,0],[1,1,0],[0,0,0]]) === 4 && maximalRectangle([[1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1],[1,1,1,1,1,0,0,1],[1,1,1,1,0,1,1,1],[0,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1]]) === 18',
  'Sliding Window Maximum':
    'slidingWindowMaximum([1,3,-1,-3,5,3,6,7], 3).join() === "3,3,5,5,6,7" && slidingWindowMaximumNaive([1,3,-1,-3,5,3,6,7], 3).join() === "3,3,5,5,6,7" && slidingWindowMaximum([9,8,7,6], 2).join() === "9,8,7" && slidingWindowMaximumNaive([9,8,7,6], 2).join() === "9,8,7" && slidingWindowMaximum([7,2,4], 2).join() === "7,4" && slidingWindowMaximum([2,2,2], 2).join() === "2,2" && slidingWindowMaximum([1,3,1,2,0,5], 3).join() === "3,3,2,5" && slidingWindowMaximumNaive([1,3,1,2,0,5], 3).join() === "3,3,2,5" && slidingWindowMaximum([1,2,3,4,5], 3).join() === "3,4,5" && slidingWindowMaximum([1], 1).join() === "1" && slidingWindowMaximum([], 1).join() === "" && slidingWindowMaximum([4,3], 3).join() === ""',
  'The Celebrity Problem':
    'celebrity([[0,1,0],[0,0,0],[1,1,0]]) === 1 && celebrityByDegrees([[0,1,0],[0,0,0],[1,1,0]]) === 1 && celebrity([[0,1,0],[1,0,0],[0,0,0]]) === -1 && celebrityByDegrees([[0,1,0],[1,0,0],[0,0,0]]) === -1 && celebrity([[0,0,0],[1,0,1],[1,0,0]]) === 0 && celebrity([[0,1],[1,0]]) === -1 && celebrity([[0]]) === 0 && celebrity([]) === -1 && celebrityByDegrees([]) === -1 && celebrity([[0,1,1],[0,0,1],[0,0,0]]) === 2 && celebrity([[0,0],[0,0]]) === -1 && celebrity([[0,0,0],[0,0,0],[0,0,0]]) === -1 && celebrity([[0,1,0,0],[0,0,0,0],[1,1,0,1],[0,1,0,0]]) === 1 && celebrityByDegrees([[0,1,0,0],[0,0,0,0],[1,1,0,1],[0,1,0,0]]) === 1',
  'LRU Cache':
    '(() => { const c = new ListLRUCache(2); const log = [c.get(1)]; c.put(1,1); c.put(2,2); log.push(c.recency()); log.push(c.get(1)); log.push(c.recency()); c.put(3,3); log.push(c.recency()); log.push(c.get(2)); log.push(c.get(3)); log.push(c.get(1)); c.put(1,10); log.push(c.get(1)); log.push(c.recency()); return log.join("|") === "-1|2,1|1|1,2|3,1|-1|3|1|10|1,3"; })() && (() => { const m = new MapLRUCache(2); m.put(1,1); m.put(2,2); m.get(1); m.put(3,3); return m.get(2) === -1 && m.get(3) === 3 && m.get(1) === 1 && Array.from(m.entries.keys()).join() === "3,1"; })() && (() => { const z = new ListLRUCache(0); z.put(1,1); return z.get(1) === -1 && z.recency() === ""; })() && (() => { const o = new ListLRUCache(1); o.put(1,1); const a = o.get(1); o.put(2,2); return a === 1 && o.get(1) === -1 && o.get(2) === 2 && o.recency() === "2"; })()',
  'LFU Cache':
    '(() => { const c = new LFUCache(2); c.put(1,1); c.put(2,2); const a = c.get(1); c.put(3,3); return [a, c.get(2), c.get(3), c.get(1)].join() === "1,-1,3,1" && c.frequency(3) === 2; })() && (() => { const d = new LFUCache(3); d.put(1,1); d.put(2,2); d.put(3,3); d.get(1); d.get(1); d.get(2); d.put(4,4); return [d.get(2), d.get(3), d.get(1), d.get(4)].join() === "2,-1,1,4"; })() && (() => { const e = new LFUCache(2); e.put(1,1); e.put(2,2); e.put(3,3); return [e.get(1), e.get(2), e.get(3)].join() === "-1,2,3"; })() && (() => { const z = new LFUCache(0); z.put(1,1); return z.get(1) === -1 && z.frequency(1) === -1; })() && (() => { const u = new LFUCache(2); u.put(1,10); u.put(1,20); return u.get(1) === 20 && u.frequency(1) === 3 && u.get(2) === -1; })()',
  'Longest Substring Without Repeating Characters':
    'longestSubstringWithoutRepeats("abcabcbb") === 3 && longestSubstringWithoutRepeats("bbbbb") === 1 && longestSubstringWithoutRepeats("") === 0 && longestSubstringWithoutRepeats("pwwkew") === 3 && longestSubstringWithoutRepeats("dvdf") === 3 && longestSubstringWithoutRepeats("abba") === 2 && longestSubstringWithoutRepeats("abc") === 3 && longestSubstringWithoutRepeats("tmmzuxt") === 5 && longestSubstringWithoutRepeatsShrink("abcabcbb") === 3 && longestSubstringWithoutRepeatsShrink("abba") === 2 && longestSubstringWithoutRepeatsShrink("dvdf") === 3 && longestSubstringWithoutRepeatsShrink("tmmzuxt") === 5 && longestSubstringWithoutRepeatsShrink("pwwkew") === 3',
  'Max Consecutive Ones III':
    'maxConsecutiveOnes([1,1,1,0,0,0,1,1,1,1,0], 2) === 6 && maxConsecutiveOnes([0,0,1,1,0,0,1,1,1,0,1,1,0,0,1,1,1,1], 3) === 12 && maxConsecutiveOnes([1,1,1], 0) === 3 && maxConsecutiveOnes([0,0,0], 1) === 1 && maxConsecutiveOnes([], 2) === 0 && maxConsecutiveOnes([0], 1) === 1 && maxConsecutiveOnes([1,0,1,0,1], 0) === 1 && maxConsecutiveOnesShift([1,1,1,0,0,0,1,1,1,1,0], 2) === 6 && maxConsecutiveOnesShift([0,0,1,1,0,0,1,1,1,0,1,1,0,0,1,1,1,1], 3) === 12 && maxConsecutiveOnesShift([1,1,1], 0) === 3 && maxConsecutiveOnesShift([0,0,0], 1) === 1 && maxConsecutiveOnesShift([], 2) === 0 && maxConsecutiveOnesShift([0], 1) === 1 && maxConsecutiveOnesShift([1,0,1,0,1], 0) === 1',
  'Fruit Into Baskets':
    'totalFruit([1,2,1]) === 3 && totalFruit([0,1,2,2]) === 3 && totalFruit([1,2,3,2,2]) === 4 && totalFruit([3,3,3,1,2,1,1,2,3]) === 5 && totalFruit([]) === 0 && totalFruit([1]) === 1 && totalFruitNaive([1,2,1]) === 3 && totalFruitNaive([0,1,2,2]) === 3 && totalFruitNaive([1,2,3,2,2]) === 4 && totalFruitNaive([3,3,3,1,2,1,1,2,3]) === 5 && totalFruitNaive([]) === 0 && totalFruitNaive([1]) === 1',
  'Longest Repeating Character Replacement':
    'characterReplacement("ABAB", 2) === 4 && characterReplacement("AABABBA", 1) === 4 && characterReplacement("ABAA", 0) === 2 && characterReplacement("", 0) === 0 && characterReplacement("ABC", 2) === 3 && characterReplacement("A", 0) === 1 && characterReplacement("AAB", 2) === 3 && characterReplacementNaive("ABAB", 2) === 4 && characterReplacementNaive("AABABBA", 1) === 4 && characterReplacementNaive("ABAA", 0) === 2 && characterReplacementNaive("", 0) === 0 && characterReplacementNaive("ABC", 2) === 3 && characterReplacementNaive("A", 0) === 1 && characterReplacementNaive("AAB", 2) === 3',
  'Binary Subarrays With Sum':
    'numSubarraysWithSum([1,0,1,0,1], 2) === 4 && numSubarraysWithSum([0,0,0,0,0], 0) === 15 && numSubarraysWithSum([0,0,1,1], 1) === 4 && numSubarraysWithSum([], 0) === 0 && numSubarraysWithSum([1], 0) === 0 && numSubarraysWithSum([1,1,1], 2) === 2 && numSubarraysWithSum([0,0,0,0,0], 1) === 0 && numSubarraysWithSumAtMost([1,0,1,0,1], 2) === 4 && numSubarraysWithSumAtMost([0,0,0,0,0], 0) === 15 && numSubarraysWithSumAtMost([0,0,1,1], 1) === 4 && numSubarraysWithSumAtMost([], 0) === 0 && numSubarraysWithSumAtMost([1], 0) === 0 && numSubarraysWithSumAtMost([1,1,1], 2) === 2 && numSubarraysWithSumAtMost([0,0,0,0,0], 1) === 0',
  'Count Number of Nice Subarrays':
    'niceSubarrays([1,1,2,1,1], 3) === 2 && niceSubarrays([2,4,6], 1) === 0 && niceSubarrays([1,1,1,1], 2) === 3 && niceSubarrays([1], 1) === 1 && niceSubarrays([], 1) === 0 && niceSubarrays([-3,2,4], 1) === 3 && niceSubarraysByPrefix([1,1,2,1,1], 3) === 2 && niceSubarraysByPrefix([2,4,6], 1) === 0 && niceSubarraysByPrefix([1,1,1,1], 2) === 3 && niceSubarraysByPrefix([1], 1) === 1 && niceSubarraysByPrefix([], 1) === 0 && niceSubarraysByPrefix([-3,2,4], 1) === 3',
  'Number of Substrings Containing All Three Characters':
    'substringsWithAllThree("abcabc") === 10 && substringsWithAllThree("aaacb") === 3 && substringsWithAllThree("abc") === 1 && substringsWithAllThree("ab") === 0 && substringsWithAllThree("") === 0 && substringsWithAllThree("aabbcc") === 4 && substringsWithAllThreeShrink("abcabc") === 10 && substringsWithAllThreeShrink("aaacb") === 3 && substringsWithAllThreeShrink("abc") === 1 && substringsWithAllThreeShrink("ab") === 0 && substringsWithAllThreeShrink("") === 0 && substringsWithAllThreeShrink("aabbcc") === 4',
  'Maximum Points You Can Obtain from Cards':
    'maxScore([1,2,3,4,5,6,1], 3) === 12 && maxScore([1,79,80,1,1,1,200,1], 3) === 202 && maxScore([1,100,1,1,100,1], 4) === 202 && maxScore([7], 1) === 7 && maxScore([5,1,100,1,1,6], 3) === 106 && maxScore([1,2,3,4,5,6,1], 7) === 22 && maxScore([1,2,3,4,5,6,1], 0) === 0 && maxScoreByEnds([1,2,3,4,5,6,1], 3) === 12 && maxScoreByEnds([1,79,80,1,1,1,200,1], 3) === 202 && maxScoreByEnds([1,100,1,1,100,1], 4) === 202 && maxScoreByEnds([7], 1) === 7 && maxScoreByEnds([5,1,100,1,1,6], 3) === 106 && maxScoreByEnds([1,2,3,4,5,6,1], 7) === 22 && maxScoreByEnds([1,2,3,4,5,6,1], 0) === 0',
  'Longest Substring with At Most K Distinct Characters':
    'longestSubstringWithAtMostK("eceba", 2) === 3 && longestSubstringWithAtMostK("a", 1) === 1 && longestSubstringWithAtMostK("aaabbb", 2) === 6 && longestSubstringWithAtMostK("abcd", 1) === 1 && longestSubstringWithAtMostK("", 3) === 0 && longestSubstringWithAtMostK("AAAHBFCB", 3) === 5 && longestSubstringWithAtMostK("eceba", 0) === 0 && longestSubstringWithAtMostKBrute("eceba", 2) === 3 && longestSubstringWithAtMostKBrute("a", 1) === 1 && longestSubstringWithAtMostKBrute("aaabbb", 2) === 6 && longestSubstringWithAtMostKBrute("abcd", 1) === 1 && longestSubstringWithAtMostKBrute("", 3) === 0 && longestSubstringWithAtMostKBrute("AAAHBFCB", 3) === 5 && longestSubstringWithAtMostKBrute("eceba", 0) === 0',
  'Subarrays with K Different Integers':
    'subarraysWithKDistinct([1,2,1,2,3], 2) === 7 && subarraysWithKDistinct([1,2,1,3,4], 3) === 3 && subarraysWithKDistinct([1,2,1,2,3], 1) === 5 && subarraysWithKDistinct([1,2,1,2,3], 3) === 3 && subarraysWithKDistinct([], 1) === 0 && subarraysWithKDistinct([1], 1) === 1 && subarraysWithKDistinctBrute([1,2,1,2,3], 2) === 7 && subarraysWithKDistinctBrute([1,2,1,3,4], 3) === 3 && subarraysWithKDistinctBrute([1,2,1,2,3], 1) === 5 && subarraysWithKDistinctBrute([1,2,1,2,3], 3) === 3 && subarraysWithKDistinctBrute([], 1) === 0 && subarraysWithKDistinctBrute([1], 1) === 1',
  'Count of substrings having at least one char of all types':
    'substringsWithAllTypes("abcabc", ["a","b","c"]) === 10 && substringsWithAllTypes("aaacb", ["a","b","c"]) === 3 && substringsWithAllTypes("abc", ["a","b","c"]) === 1 && substringsWithAllTypes("ab", ["a","b","c"]) === 0 && substringsWithAllTypes("", ["a","b","c"]) === 0 && substringsWithAllTypes("abcab", ["a","b","c"]) === 6 && substringsWithAllTypes("xayzb", ["a","b"]) === 2 && substringsWithAllTypes("abcabc", []) === 0 && substringsWithAllTypesComplement("abcabc", ["a","b","c"]) === 10 && substringsWithAllTypesComplement("aaacb", ["a","b","c"]) === 3 && substringsWithAllTypesComplement("abc", ["a","b","c"]) === 1 && substringsWithAllTypesComplement("ab", ["a","b","c"]) === 0 && substringsWithAllTypesComplement("", ["a","b","c"]) === 0 && substringsWithAllTypesComplement("abcab", ["a","b","c"]) === 6 && substringsWithAllTypesComplement("xayzb", ["a","b"]) === 2 && substringsWithAllTypesComplement("abcabc", []) === 0',
  'Minimum Window Substring':
    'minWindow("ADOBECODEBANC", "ABC") === "BANC" && minWindow("a", "a") === "a" && minWindow("a", "aa") === "" && minWindow("cabwefgewcwaefgcf", "cae") === "cwae" && minWindow("bba", "AB") === "" && minWindow("abc", "") === "" && minWindow("", "abc") === "" && minWindow("AABBBC", "ABC") === "ABBBC" && minWindowBrute("ADOBECODEBANC", "ABC") === "BANC" && minWindowBrute("a", "a") === "a" && minWindowBrute("a", "aa") === "" && minWindowBrute("cabwefgewcwaefgcf", "cae") === "cwae" && minWindowBrute("bba", "AB") === "" && minWindowBrute("AABBBC", "ABC") === "ABBBC"',
  'Minimum Window Subsequence':
    'minWindowSubsequence("abcdebdde", "bde") === "bcde" && minWindowSubsequence("nms", "ms") === "ms" && minWindowSubsequence("jmeo", "o") === "o" && minWindowSubsequence("abc", "d") === "" && minWindowSubsequence("", "a") === "" && minWindowSubsequence("a", "") === "" && minWindowSubsequence("aaa", "aa") === "aa" && minWindowSubsequence("abcab", "ab") === "ab" && minWindowSubsequence("bde", "bdde") === "" && minWindowSubsequence("abcbdab", "bca") === "bcbda" && minWindowSubsequenceBrute("abcdebdde", "bde") === "bcde" && minWindowSubsequenceBrute("nms", "ms") === "ms" && minWindowSubsequenceBrute("jmeo", "o") === "o" && minWindowSubsequenceBrute("abc", "d") === "" && minWindowSubsequenceBrute("aaa", "aa") === "aa" && minWindowSubsequenceBrute("abcab", "ab") === "ab" && minWindowSubsequenceBrute("bde", "bdde") === "" && minWindowSubsequenceBrute("abcbdab", "bca") === "bcbda"',
  'Minimum Window Substring Problem':
    'minWindowCoveringAllCharacters("this is a test string", "tstr") === "str" && minWindowCoveringAllCharacters("ADOBECODEBANC", "ABC") === "BANC" && minWindowCoveringAllCharacters("a", "aa") === "a" && minWindowCoveringAllCharacters("bba", "AB") === "" && minWindowCoveringAllCharacters("", "abc") === "" && minWindowCoveringAllCharacters("abc", "") === "" && minWindowCoveringAllCharacters("AABBBC", "ABC") === "ABBBC" && minWindowCoveringAllCharacters("cabwefgewcwaefgcf", "cae") === "cwae" && minWindowCoveringAllCharacters("aabcbcbbacab", "abc") === "abc" && minWindowCoveringAllCharactersBrute("this is a test string", "tstr") === "str" && minWindowCoveringAllCharactersBrute("ADOBECODEBANC", "ABC") === "BANC" && minWindowCoveringAllCharactersBrute("a", "aa") === "a" && minWindowCoveringAllCharactersBrute("bba", "AB") === "" && minWindowCoveringAllCharactersBrute("AABBBC", "ABC") === "ABBBC" && minWindowCoveringAllCharactersBrute("cabwefgewcwaefgcf", "cae") === "cwae" && minWindowCoveringAllCharactersBrute("aabcbcbbacab", "abc") === "abc"',
  'Introduction to Priority Queues and Binary Heaps':
    '(() => { const h = new MinHeap(); [5,3,8,1,2].forEach((v) => h.push(v)); const built = h.layout(); const top = h.peek(); const popped = h.pop(); const after = h.layout(); const grown = (h.push(0), h.layout()); const drained = h.drain(); return built === "1,2,8,5,3" && top === 1 && popped === 1 && after === "2,3,8,5" && grown === "0,2,8,5,3" && drained === "0,2,3,5,8" && h.size() === 0; })() && (() => { const b = new MinHeap([4,1,7]); return b.layout() === "1,4,7" && b.peek() === 1 && (b.push(0), b.layout()) === "0,1,7,4" && b.pop() === 0 && b.drain() === "1,4,7"; })() && (() => { const src = [4,1,7]; const c = new MinHeap(src); c.pop(); return src.join(",") === "4,1,7" && c.layout() === "4,7"; })() && (() => { const e = new MinHeap(); return e.peek() === undefined && e.pop() === undefined && e.size() === 0 && e.drain() === ""; })() && (() => { const s = new MinHeap([9]); return s.layout() === "9" && s.pop() === 9 && s.layout() === "" && s.size() === 0 && s.peek() === undefined; })() && (() => { const rebuilt = new MinHeap([1,2,8,5,3]); return rebuilt.layout() === "1,2,8,5,3" && rebuilt.drain() === "1,2,3,5,8"; })() && heapSort([5,3,8,1,2,0]) === "0,1,2,3,5,8" && heapSort([]) === "" && heapSort([1]) === "1" && heapSort([2,2,1]) === "1,2,2" && heapSort([-5,0,3,-1]) === "-5,-1,0,3" && new MinHeap([1,3,2,5,8]).layout() === "1,3,2,5,8" && [10,2,1].sort().join(",") === "1,10,2" && (() => { function isHeapArray(items) { return items.join(",") === items.slice().sort((a, b) => a - b).join(","); } return isHeapArray([1,2,8,5,3]) === false; })()',
  'Min Heap and Max Heap Implementation':
    '(() => { const m = minHeap([4,1,7]); const built = m.items.join(","); const top = m.peek(); m.push(0); const grown = m.items.join(","); const popped = m.pop(); return built === "1,4,7" && top === 1 && grown === "0,1,7,4" && popped === 0 && m.drain() === "1,4,7" && m.size() === 0; })() && (() => { const x = maxHeap([4,1,7]); return x.items.join(",") === "7,1,4" && x.peek() === 7 && x.drain() === "7,4,1"; })() && (() => { const s = new Heap(threeWay, ["pear","apple","fig"]); s.push("banana"); return s.items.join(",") === "apple,banana,fig,pear" && s.pop() === "apple" && s.drain() === "banana,fig,pear"; })() && (() => { const bad = new Heap((left, right) => left - right, ["pear","apple","fig"]); return bad.items.join(",") === "pear,apple,fig" && bad.peek() === "pear" && bad.drain() === "pear,fig,apple"; })() && (() => { const t = new Heap(threeWay, []); return t.peek() === undefined && t.pop() === undefined && t.size() === 0 && t.drain() === ""; })() && (() => { const o = new Heap((a, b) => a.priority - b.priority, [{ n: "x", priority: 3 }, { n: "y", priority: 1 }, { n: "z", priority: 2 }]); const out = []; while (o.size() > 0) out.push(o.pop().n); return out.join("") === "yzx" && o.peek() === undefined; })()',
  'Check if an array represents a min-heap or not':
    'isMinHeap([2,3,5,7,10,8,9,15,18]) === true && minHeapViolations([2,3,5,7,10,8,9,15,18]) === "" && isMinHeap([2,3,1,7,10,8,9,15,18]) === false && minHeapViolations([2,3,1,7,10,8,9,15,18]) === "0 to 2" && isMinHeap([2,2,3]) === true && isMinHeap([]) === true && isMinHeap([4]) === true && isMinHeap([5,4]) === false && minHeapViolations([5,4]) === "0 to 1" && isMinHeap([1,3,2,5,8]) === true && isMinHeap([1,2,8,5,3]) === true && isMinHeap([1,2,3,4,5,6,7]) === true && minHeapViolations([9,4,5,1,3]) === "0 to 1,0 to 2,1 to 3,1 to 4" && (() => { const src = [3,1,2]; const answer = isMinHeap(src); return answer === false && src.join(",") === "3,1,2"; })()',
  'Convert Min Heap to Max Heap':
    'minHeapToMaxHeap([1,3,2,7,4,5,6]).join(",") === "7,4,6,3,1,5,2" && isMaxHeap(minHeapToMaxHeap([1,3,2,7,4,5,6])) === true && (() => { const src = [1,3,2,7,4,5,6]; const out = minHeapToMaxHeap(src); return src.join(",") === "1,3,2,7,4,5,6" && out.slice().sort((a, b) => a - b).join(",") === "1,2,3,4,5,6,7"; })() && (() => { const rev = [1,3,2,7,4,5,6].slice().reverse(); return rev.join(",") === "6,5,4,7,2,3,1" && isMaxHeap(rev) === false; })() && minHeapToMaxHeapDescending([1,3,2,7,4,5,6]).join(",") === "7,6,5,4,3,2,1" && isMaxHeap([7,6,5,4,3,2,1]) === true && minHeapToMaxHeap([1,2,3,4,5,6,7]).join(",") === "7,5,6,4,2,1,3" && isMaxHeap(minHeapToMaxHeap([1,2,3,4,5,6,7])) === true && minHeapToMaxHeap([]).join("|") === "" && minHeapToMaxHeap([7]).join("|") === "7" && isMaxHeap([]) === true && isMaxHeap([7]) === true',
  'Kth Largest Element in an Array':
    '(() => { const keep = []; const evicted = []; for (const value of [3,2,1,5,6,4]) { heapPush(keep, value); if (keep.length > 2) evicted.push(heapPop(keep)); } return keep.join(",") === "5,6" && evicted.join(",") === "1,2,3,4" && kthLargestByHeap([3,2,1,5,6,4], 2) === 5 && kthLargestByQuickselect([3,2,1,5,6,4], 2) === 5 && kthLargestByHeap([3,2,1,5,6,4], 1) === 6 && kthLargestByQuickselect([3,2,1,5,6,4], 1) === 6 && kthLargestByHeap([3,2,1,5,6,4], 6) === 1 && kthLargestByQuickselect([3,2,1,5,6,4], 6) === 1; })() && kthLargestByHeap([5,5,4],2) === 5 && kthLargestByQuickselect([5,5,4],2) === 5 && kthLargestByHeap([5,5,4],1) === 5 && kthLargestByQuickselect([5,5,4],1) === 5 && kthLargestByHeap([3,2,1,5,6,4],7) === undefined && kthLargestByQuickselect([3,2,1,5,6,4],7) === undefined && kthLargestBySort([3,2,1,5,6,4],7) === undefined && kthLargestByHeap([],1) === undefined && kthLargestByQuickselect([],1) === undefined && kthLargestByHeap([1],1) === 1 && kthLargestByQuickselect([1],1) === 1 && kthLargestByHeap([-3,-9,-1],2) === -3 && kthLargestByQuickselect([-3,-9,-1],2) === -3 && kthLargestByQuickselect([1,2,3,4,5,6],3) === 4 && kthLargestByQuickselect([6,5,4,3,2,1],3) === 4 && kthLargestByQuickselect([7,7,7,7,7,7],4) === 7 && (() => { const src = [3,2,1,5,6,4]; const answer = kthLargestByQuickselect(src, 2); return src.join(",") === "3,2,1,5,6,4" && answer === 5; })()',
  'Kth Smallest Element in an Array':
    '(() => { const keep = []; const evicted = []; for (const value of [7,3,9,1,5,2]) { maxHeapPush(keep, value); if (keep.length > 3) evicted.push(maxHeapPop(keep)); } return keep.join(",") === "3,2,1" && evicted.join(",") === "9,7,5" && kthSmallestByMaxHeap([7,3,9,1,5,2], 3) === 3; })() && kthSmallestByBoundedWindow([7,3,9,1,5,2],3) === 3 && kthSmallestBySort([7,3,9,1,5,2],3) === 3 && kSmallestAscending([7,3,9,1,5,2],3).join(",") === "1,2,3" && kSmallestAscending([7,3,9,1,5,2],1).join(",") === "1" && kSmallestAscending([7,3,9,1,5,2],6).join(",") === "1,2,3,5,7,9" && kSmallestAscending([],3).join(",") === "" && kthLargestByBoundedWindow([7,3,9,1,5,2],3) === 5 && kthLargestByBoundedWindow([3,2,1,5,6,4],2) === 5 && kthSmallestByMaxHeap([5,5,4],2) === 5 && kthSmallestByBoundedWindow([5,5,4],2) === 5 && kthSmallestByMaxHeap([4,5,5],1) === 4 && kthSmallestByMaxHeap([1],1) === 1 && kthSmallestByMaxHeap([1,2],3) === undefined && kthSmallestByBoundedWindow([1,2],3) === undefined && kthSmallestWithoutComparator([100,20,3],1) === 100 && kthSmallestByMaxHeap([100,20,3],1) === 3 && kthSmallestBySort([100,20,3],1) === 3',
  'Sort K Sorted Array (Nearly Sorted Array)':
    'isKSorted([3,2,1,5,4,6],2) === true && isKSorted([3,2,1,5,4,6],1) === false && isKSorted([3,2,1],2) === true && isKSorted([3,2,1],1) === false && isKSorted([1,2,3],0) === true && sortKSorted([3,2,1,5,4,6],2).join(",") === "1,2,3,4,5,6" && (() => { const emitted = []; const window = []; for (const value of [3,2,1,5,4,6]) { heapPush(window, value); if (window.length > 2) emitted.push(heapPop(window)); } while (window.length > 0) emitted.push(heapPop(window)); return emitted.join(",") === "1,2,3,4,5,6" && window.length === 0; })() && sortKSorted([3,2,1],1).join(",") === "2,1,3" && sortKSorted([3,2,1,5,4,6],1).join(",") === "2,1,3,4,5,6" && sortKSortedWithNarrowWindow([3,2,1,5,4,6],2).join(",") === "2,1,3,4,5,6" && sortKSorted([1,2,3],0).join(",") === "1,2,3" && sortKSorted([],3).join(",") === "" && sortKSorted([5],2).join(",") === "5" && sortKSorted([5,4,3,2,1],4).join(",") === "1,2,3,4,5" && sortByInsertion([3,2,1,5,4,6]).join(",") === "1,2,3,4,5,6" && isKSorted([2,1,2,1],1) === false && sortKSorted([2,1,2,1],1).join(",") === "1,2,1,2"',
  'Replace each element by its rank in the array':
    'arrayRankTransform([40,10,20,30]).join(",") === "4,1,2,3" && arrayRankTransform([100,100,100]).join(",") === "1,1,1" && arrayRankTransform([10,8,12,6,12,10]).join(",") === "3,2,4,1,4,3" && arrayRankTransform([]).join(",") === "" && arrayRankTransform([-5,0,5]).join(",") === "1,2,3" && arrayRankTransformByHeap([40,10,20,30]).join(",") === "4,1,2,3" && arrayRankTransformByHeap([10,8,12,6,12,10]).join(",") === "3,2,4,1,4,3" && arrayRankTransformByHeap([10,10,20]).join(",") === "1,1,2" && arrayRankTransformByHeap([]).join(",") === "" && arrayRankTransformByIndexOf([10,10,20]).join(",") === "1,1,3" && arrayRankTransformByIndexOf([40,10,20,30]).join(",") === "4,1,2,3" && arrayRankTransformWithoutComparator([3,100,20]).join(",") === "3,1,2" && arrayRankTransform([3,100,20]).join(",") === "1,3,2"',
  'Merge M Sorted Lists':
    '(() => { const list = buildList([1,4,5]); const merged = toArray(mergeKLists([list, buildList([1,3,4]), null])); return merged.join(",") === "1,1,3,4,4,5"; })() && toArray(mergeKListsByPairs([buildList([1,4,5]), buildList([1,3,4]), null])).join(",") === "1,1,3,4,4,5" && toArray(mergeKListsByFlatten([buildList([1,4,5]), buildList([1,3,4]), null])).join(",") === "1,1,3,4,4,5" && (() => { const list = buildList([1,4,5]); mergeKLists([list, buildList([1,3,4]), null]); return toArray(list).join(",") === "1,1,3,4,4,5"; })() && (() => { const list = buildList([1,4,5]); mergeKListsByFlatten([list, null]); return toArray(list).join(",") === "1,4,5"; })() && mergeKLists([]) === null && mergeKLists([null, null]) === null && toArray(mergeKLists([buildList([7])])).join(",") === "7" && mergeKListsByPairs([]) === null && toArray(mergeKListsByPairs([buildList([1,9]), buildList([2,8]), buildList([3,7])])).join(",") === "1,2,3,7,8,9" && toArray(mergeKLists([buildList([1,9]), buildList([2,8]), buildList([3,7]), buildList([4,5,6])])).join(",") === "1,2,3,4,5,6,7,8,9" && toArray(mergeKListsByFlatten([null, null])).join(",") === ""',
  'Task Scheduler':
    'minimumIntervals(["A","A","A","B","B","B"], 2) === 8 && minimumIntervalsSchedule(["A","A","A","B","B","B"], 2) === "AB.AB.AB" && minimumIntervalsBySimulation(["A","A","A","B","B","B"], 2) === 8 && minimumIntervals(["A","A","B","C","D","E"], 2) === 6 && minimumIntervalsSchedule(["A","A","B","C","D","E"], 2) === "ABCADE" && (() => { const schedule = minimumIntervalsSchedule(["A","A","B","C","D","E"], 2); return schedule.includes(".") === false && schedule.length === 6; })() && minimumIntervals([], 3) === 0 && minimumIntervalsSchedule([], 3) === "" && minimumIntervals(["A","A","A"], 0) === 3 && minimumIntervalsSchedule(["A","A","A"], 0) === "AAA" && minimumIntervals(["A"], 5) === 1 && minimumIntervalsSchedule(["A"], 5) === "A" && minimumIntervals(["A","A","A","A","B","C"], 2) === 10 && minimumIntervalsSchedule(["A","A","A","A","B","C"], 2) === "ABCA..A..A" && (() => { const schedule = minimumIntervalsSchedule(["A","A","A"], 2); return schedule === "A..A..A" && schedule.indexOf("A", 1) === 3; })() && minimumIntervals(["A","A","A","B","B","C"], 1) === 6 && minimumIntervalsSchedule(["A","A","A","B","B","C"], 1) === "ABABAC"',
  'Hands of Straights':
    'isPossibleStraight([1,2,3,6,2,3,4,7,8], 3) === true && isPossibleStraightByDeficits([1,2,3,6,2,3,4,7,8], 3) === true && isPossibleStraightByGroups([1,2,3,6,2,3,4,7,8], 3) === true && (() => { const pairs = []; for (const pair of countedHand([1,2,3,6,2,3,4,7,8])) pairs.push(pair[0] + ":" + pair[1]); return pairs.join(" ") === "1:1 2:2 3:2 6:1 4:1 7:1 8:1"; })() && isPossibleStraight([1,2,1,2,3,3], 3) === true && isPossibleStraightByDeficits([1,2,1,2,3,3], 3) === true && isPossibleStraightByGroups([1,2,1,2,3,3], 3) === true && isPossibleStraight([4,4,4,4,5,5,5,5,6,6,6,6], 3) === true && isPossibleStraight([1,1,1,2,2,2], 3) === false && isPossibleStraightByDeficits([1,1,1,2,2,2], 3) === false && isPossibleStraight([1,2,3,4,5], 4) === false && isPossibleStraightByGroups([1,2,3,4,5], 4) === false && isPossibleStraight([1,2,3,5,6,7], 3) === true && isPossibleStraightByDeficits([1,2,3,5,6,7], 3) === true && isPossibleStraight([], 3) === true && isPossibleStraight([5], 1) === true && isPossibleStraight([1,2], 3) === false && isPossibleStraightByDeficits([1,2], 3) === false && isPossibleStraight([1,1,1], 1) === true && isPossibleStraight([10,9,8], 3) === true && isPossibleStraightByDeficits([10,9,8], 3) === true && isPossibleStraight([-1,0,1], 3) === true && isPossibleStraight([1,2,1,2,3,4], 3) === false',
  'Design Twitter':
    '(() => { const t = new Twitter(); t.postTweet(1, 5); t.follow(1, 2); const a = t.getNewsFeed(1).join(","); t.postTweet(2, 6); const b = t.getNewsFeed(1).join(","); const c = t.getNewsFeed(2).join(","); t.unfollow(1, 2); const d = t.getNewsFeed(1).join(","); return a === "5" && b === "6,5" && c === "6" && d === "5"; })() && (() => { const t = new Twitter(); for (let id = 1; id <= 15; id += 1) t.postTweet(1, id); const feed = t.getNewsFeed(1); return feed.join(",") === "15,14,13,12,11,10,9,8,7,6" && feed.length === 10 && t.getNewsFeedByTopTen(1).join(",") === feed.join(",") && t.getNewsFeedBySort(1).join(",") === feed.join(","); })() && (() => { const t = new Twitter(); t.postTweet(7, 1); t.postTweet(7, 2); const before = t.getNewsFeed(7).join(","); const dropped = t.unfollow(7, 7); const after = t.getNewsFeed(7).join(","); return before === "2,1" && after === "2,1" && dropped === false; })() && (() => { const t = new Twitter(); const fresh = t.getNewsFeed(42); t.follow(1, 99); const quiet = t.getNewsFeed(1); t.postTweet(1, 5); return fresh.length === 0 && quiet.length === 0 && t.getNewsFeed(1).join(",") === "5"; })() && (() => { const t = new Twitter(); t.follow(1, 2); t.follow(1, 3); for (let i = 1; i <= 4; i += 1) t.postTweet(1, i); for (let i = 11; i <= 14; i += 1) t.postTweet(2, i); for (let i = 21; i <= 24; i += 1) t.postTweet(3, i); const feed = t.getNewsFeed(1).join(","); return feed === "24,23,22,21,14,13,12,11,4,3" && t.getNewsFeedByTopTen(1).join(",") === feed && t.getNewsFeedBySort(1).join(",") === feed; })() && (() => { const t = new Twitter(); t.postTweet(1, 100); t.postTweet(2, 200); return t.clock === 2 && t.postsOf(1)[0].time === 1 && t.postsOf(2)[0].time === 2 && Array.from(t.followsOf(1)).join(".") === "1"; })()',
  'Connect `n` ropes with minimum cost':
    'connectRopes([2,3,5,6,7]) === 51 && connectRopesByTwoQueues([2,3,5,6,7]) === 51 && connectRopesInArrivalOrder([2,3,5,6,7]) === 54 && connectRopesLongestFirst([2,3,5,6,7]) === 75 && (() => { const joined = connectRopesRecorded([2,3,5,6,7]); return joined.total === 51 && joined.joins.map((j) => j[2]).join(",") === "5,10,13,23" && joined.joins[0].join("+") === "2+3+5"; })() && (() => { const src = [7,3,2,6,5]; return connectRopes(src) === 51 && connectRopesRecorded(src).total === 51 && connectRopesByTwoQueues(src) === 51 && src.join(",") === "7,3,2,6,5"; })() && connectRopes([]) === 0 && connectRopes([9]) === 0 && connectRopesByTwoQueues([]) === 0 && connectRopesByTwoQueues([9]) === 0 && connectRopesInArrivalOrder([9]) === 0 && connectRopes([5,5]) === 10 && connectRopesByTwoQueues([5,5]) === 10 && connectRopes([1,1,1,1]) === 8 && connectRopes([11,3,7,1,9,2,13,4]) === 135 && connectRopesByTwoQueues([11,3,7,1,9,2,13,4]) === 135 && connectRopesInArrivalOrder([11,3,7,1,9,2,13,4]) === 217 && connectRopesLongestFirst([11,3,7,1,9,2,13,4]) === 287 && (() => { const sums = connectRopesRecorded([11,3,7,1,9,2,13,4]).joins.map((j) => j[2]); for (let i = 1; i < sums.length; i += 1) if (sums[i] < sums[i - 1]) return false; return sums.join(",") === "3,6,10,16,21,29,50"; })()',
  'K Most Frequent Elements':
    'topKFrequentByBuckets([1,1,1,2,2,3], 2).join(",") === "1,2" && topKFrequentByHeap([1,1,1,2,2,3], 2).slice().sort((first, second) => first - second).join(",") === "1,2" && topKFrequentBySort([1,1,1,2,2,3], 2).join(",") === "1,2" && (() => { const buckets = []; for (let index = 0; index <= 6; index += 1) buckets.push([]); for (const entry of counted([1,1,1,2,2,3])) buckets[entry[1]].push(entry[0]); return buckets.length === 7 && buckets[3].join(".") === "1" && buckets[2].join(".") === "2" && buckets[1].join(".") === "3" && buckets[6].length === 0 && buckets[0].length === 0; })() && (() => { const all = topKFrequentByBuckets([1,1,1,2,2,3], 3).sort((first, second) => first - second); const heapAll = topKFrequentByHeap([1,1,1,2,2,3], 3).sort((first, second) => first - second); return all.join(",") === "1,2,3" && heapAll.join(",") === "1,2,3" && topKFrequentBySort([1,1,1,2,2,3], 3).join(",") === "1,2,3"; })() && topKFrequentByBuckets([1,1,1,2,2,3], 1)[0] === 1 && topKFrequentByHeap([1,1,1,2,2,3], 1)[0] === 1 && topKFrequentBySort([1,1,1,2,2,3], 1)[0] === 1 && topKFrequentBySort([3,3,1], 1)[0] === 3 && topKFrequentWithoutComparator([3,3,1], 1)[0] === 1 && topKFrequentWithoutComparator([1,1,1,2,2,3], 2).join(",") === "1,2" && (() => { const tie = topKFrequentByBuckets([1,2,3,4], 2); return tie.length === 2 && counted([1,2,3,4]).get(tie[0]) === 1 && counted([1,2,3,4]).get(tie[1]) === 1; })() && topKFrequentByBuckets([-1,-1,-2,-2,-3], 2).slice().sort((first, second) => first - second).join(",") === "-2,-1"',
  'Kth Largest Element in a Stream of Numbers':
    '(() => { const t = new KthLargest(3, [4,5,8,2]); const seed = t.heap.join(","); const answers = [t.peek(), t.add(3), t.add(5), t.add(10), t.add(9), t.add(4)]; return seed === "4,5,8" && answers.join(",") === "4,4,5,5,8,8" && t.size() === 3 && t.heap.length <= 3; })() && (() => { const adds = [3,5,10,9,4]; const replay = (Class) => { const tracker = new Class(3, [4,5,8,2]); const out = []; for (const value of adds) out.push(tracker.add(value)); return out.join(","); }; const heap = replay(KthLargest); const full = replay(KthLargestFromFullHeap); const sorted = replay(KthLargestSorting); return heap === "4,5,5,8,8" && full === heap && sorted === heap; })() && (() => { const flipped = []; for (const value of [4,5,8,2]) { heapPushLargest(flipped, value); if (flipped.length > 3) heapPopLargest(flipped); } return flipped.join(",") === "5,4,2" && flipped[0] === 5 && new KthLargest(3, [4,5,8,2]).peek() === 4; })() && (() => { const t = new KthLargest(5, [1,2]); return t.peek() === undefined && t.add(3) === undefined && t.add(9) === undefined && t.size() === 4; })() && new KthLargest(2, [5,5,5]).peek() === 5 && new KthLargest(2, [5,5,5]).add(4) === 5 && new KthLargest(1, [7,3]).peek() === 7 && (() => { const full = new KthLargestFromFullHeap(3, [4,5,8,2]); full.add(3); return full.size() === 5; })()',
  'Kth largest element in a stream':
    '(() => { const w = new KthLargestWindow(3, [4,5,8,2]); const seed = w.window.join(","); const answers = []; for (const value of [3,5,10,9,4]) answers.push(w.add(value)); return seed === "8,5,4" && answers.join(",") === "4,5,5,8,8" && w.window.join(",") === "10,9,8" && w.window.length === 3; })() && (() => { const adds = [3,5,10,9,4]; const replay = (Class) => { const tracker = new Class(3, [4,5,8,2]); const out = []; for (const value of adds) out.push(tracker.add(value)); return out.join(","); }; return replay(KthLargestWindow) === replay(KthLargestWindowByScan) && replay(KthLargestWindow) === "4,5,5,8,8"; })() && (() => { const w = new KthLargestWindow(3, []); const log = []; for (const value of [4,5,8,2]) { const before = w.window.join(","); w.add(value); log.push(value + " " + before + " -> " + w.window.join(",")); } return log.join(" | ") === "4  -> 4 | 5 4 -> 5,4 | 8 5,4 -> 8,5,4 | 2 8,5,4 -> 8,5,4"; })() && insertionPointDescending([8,5,4], 5) === 1 && insertionPointDescending([8,5,4], 9) === 0 && insertionPointDescending([8,5,4], 4) === 2 && insertionPointDescending([8,5,4], 1) === 3 && insertionPointDescending([8,5,4], 6) === 1 && (() => { const window = [8,5,4]; insertDescending(window, 5); return window.join(",") === "8,5,5,4"; })() && (() => { const t = new KthLargestWindow(5, [1,2]); return t.peek() === undefined && t.window.join(",") === "2,1" && t.add(9) === undefined; })() && new KthLargestWindow(2, [5,5,5]).peek() === 5 && new KthLargestWindow(2, [5,5,5]).add(4) === 5 && new KthLargestWindowByScan(1, [7,3]).peek() === 7',
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
