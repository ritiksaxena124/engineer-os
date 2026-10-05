import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';

/**
 * Step 17a — the trie step: seven rows that build a tree whose edges are characters or bits, then
 * ask it questions a hash set cannot answer. The first four rows are the character trie (insert,
 * search, startsWith, then counts, then two problems that only work because prefixes are stored as
 * paths rather than as strings). The last three turn the same structure sideways: edges become bits,
 * and greedily taking the opposite bit at every level is the whole trick behind the two XOR rows.
 */

export const concepts: Record<string, ConceptSpec> = {
  'dsa-trie17-edge-per-character-node': {
    slug: 'dsa-trie17-edge-per-character-node',
    name: 'A trie spends one node per distinct prefix, not per word',
    detail:
      'Children are keyed by the next character, so words sharing a prefix share the nodes above it; insertion cost is the length of the part that is not already there, and the structure size tracks the distinct prefixes of the corpus.',
    terms: ['prefix tree', 'node per prefix', 'shared prefix path', 'child keyed by character', 'edge per symbol'],
    weight: 5,
  },
  'dsa-trie17-terminal-flag-versus-path': {
    slug: 'dsa-trie17-terminal-flag-versus-path',
    name: 'search asks for a word, startsWith asks for a path, and only a flag tells them apart',
    detail:
      'Walking a prefix and walking a word are the same walk; the difference is that search additionally requires isEnd on the final node, so a corpus holding "app" answers startsWith("a") true and search("a") false.',
    terms: ['isEnd flag', 'terminal node', 'prefix versus word', 'startsWith', 'partial match'],
    weight: 4,
  },
  'dsa-trie17-count-on-the-path': {
    slug: 'dsa-trie17-count-on-the-path',
    name: 'A counter per node turns the trie into a frequency structure you never re-walk',
    detail:
      'Incrementing passCount on every node an insertion touches makes the count of a prefix one read at the end of its walk, and endCount separately records how many words terminate there — deletion is the same walk in reverse.',
    terms: ['pass count', 'end count', 'prefix frequency', 'increment on the way down', 'aggregate stored at a node'],
    weight: 4,
  },
  'dsa-trie17-suffix-trie-counts-substrings': {
    slug: 'dsa-trie17-suffix-trie-counts-substrings',
    name: 'Insert every suffix and the number of nodes created is the number of distinct substrings',
    detail:
      'A substring is a prefix of some suffix, so a trie fed all suffixes holds exactly the distinct substrings; counting newly created nodes avoids storing the strings, and stopping early on an existing edge would lose longer extensions.',
    terms: ['distinct substrings', 'suffix insertion', 'node creation counts', 'substring as prefix of suffix', 'trie over a string'],
    weight: 5,
  },
  'dsa-trie17-bit-position-arithmetic': {
    slug: 'dsa-trie17-bit-position-arithmetic',
    name: 'Read a bit with (v >>> i) & 1, set one with | (1 << i), flip one with ^ (1 << i)',
    detail:
      'Every bit-trie row is these three expressions plus a fixed width walked from the top down; JS integers are 32-bit so bit 31 is the sign bit and the safe width for non-negative values ends at 30.',
    terms: ['bit extraction', 'shift left mask', 'xor to flip', 'unsigned right shift', 'sign bit'],
    weight: 4,
  },
  'dsa-trie17-greedy-opposite-bit': {
    slug: 'dsa-trie17-greedy-opposite-bit',
    name: 'A binary trie maximises XOR by taking the opposite bit at the highest level first',
    detail:
      'Each bit of the answer is worth more than every bit below it combined, so the query descends toward the child holding the opposite bit whenever it exists and only falls back to the matching bit when it does not — that greedy is provably optimal by bit weight.',
    terms: ['maximise xor', 'opposite bit descent', 'most significant bit first', 'binary trie', 'greedy by bit weight'],
    weight: 5,
  },
  'dsa-trie17-offline-sweep-fills-trie': {
    slug: 'dsa-trie17-offline-sweep-fills-trie',
    name: 'Sort the queries by their threshold and let one sweep grow the trie to exactly the allowed set',
    detail:
      'A constraint of the form "candidates at most m" is monotone in m, so answering queries in ascending m inserts each candidate once and never removes anything; the answers are written back through an index map because the sort destroyed the original order.',
    terms: ['offline queries', 'monotone threshold', 'sweep with a cursor', 'index map restores order', 'no deletions needed'],
    weight: 5,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 17,
    name: "Implement TRIE | INSERT, SEARCH, STARTSWITH",
    difficulty: "Medium",
    topicSlug: "tries-autocomplete",
    stem: "Build a trie over lowercase words and support insert, search and startsWith. Then explain why the second and third operations are not the same question.",
    brief:
      "Input: an empty trie you create, then a stream of words to insert, then query strings for search and startsWith. Output: booleans. search(word) is true only if the exact word was inserted; startsWith(prefix) is true if any inserted word begins with it.",
    concepts: [
      "dsa-trie17-edge-per-character-node",
      "dsa-trie17-terminal-flag-versus-path",
      "dsa-complexity-counting",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "Insert walks one node per character, creating the missing tail of the path, and marks the last node isEnd. search is that walk plus the isEnd test; startsWith is the same walk without it. The flag is the only thing separating \"this is a word\" from \"this is a road\".",
    idealAnswer:
      "A trie stores the corpus as paths, one node per distinct prefix, with children keyed by the next character. That single decision is what makes search cost O(L) in the length of the query rather than O(N L) in the size of the corpus, and it is what makes autocomplete cheap: everything you need about a prefix is already on one root-to-node path. The operation pair the row asks for is the interesting part because the two walks are literally the same loop — descend character by character, return null when an edge is missing — and they differ by exactly one line at the end. If you collapse them into one function that returns true whenever the walk succeeds, a corpus holding only \"app\" starts answering search(\"a\") and search(\"ap\") as true, which is not a small bug: it turns a dictionary into a prefix set and breaks every completion UI built on it. So the isEnd flag is a fact about the corpus, not an optimisation, and it has to survive deletion. The boundary cases that catch implementations are the empty trie (both queries false, and startsWith(\"\") is a genuine design decision rather than a freebie), the word that is a strict prefix of another word, and a query longer than any stored word, where the walk must fail on the first missing edge instead of running off the path.",
    walkthrough:
      "Insert \"apple\" into an empty root: nodes a, p, p, l, e are created — five nodes for five characters — and the e node gets isEnd. Insert \"app\": the walk follows the existing a, p, p, finds nothing missing, creates nothing, and marks the third p as isEnd. The trie now holds one path of length five with a terminal two steps up it. Ask search(\"apple\"): walk succeeds, final node isEnd true, so true. Ask search(\"a\"): walk succeeds to the a node, but isEnd is false, so the answer is false — which is the entire difference between the two queries. Ask startsWith(\"a\") and startsWith(\"appl\"): both walks succeed and neither is asked about isEnd, so both are true. Now ask search(\"ban\"): the root has no b child, so the walk returns null on the very first character and search reports false without ever reaching the isEnd test. Cost per operation is the length of the query, and the shape of the structure is the set of distinct prefixes: \"apple\" plus \"app\" is four distinct prefixes (a, ap, app, appl, apple is five including the whole word) and exactly five nodes, because a, ap, app are shared.",
    commonMistake:
      "Implementing startsWith as search on a partial word, or marking every node reached as terminal.",
    whyWrong:
      "Both make a prefix indistinguishable from a word. On the corpus {\"app\"} the collapsed version returns search(\"a\") === true, so a spell-checker built on it accepts \"a\", \"ap\" and any other road into the tree; the row explicitly asks for two operations because the interview is checking whether you know which one owns the flag. The mirror mistake — marking only leaf nodes as terminal and testing \"is this a leaf\" instead — fails the other way: with \"apple\" also inserted, \"app\" is no longer a leaf, so search(\"app\") goes false on a corpus that literally contains the word.",
    followUps: [
      "You now delete words. What has to happen to isEnd, and when is a node safe to free?",
      "startsWith(\"\") on an empty trie: what does your implementation say, and which answer is defensible?",
      "Replace the children object with a 26-slot array. What does that cost per node on twenty thousand words, and what does it buy?",
      "Two corpora hold the same ten words. One is inserted in sorted order and one in reverse. Is the resulting trie the same shape?",
    ],
    solution:
      'function TrieNode() {\n' +
      '  this.children = {};\n' +
      '  this.isEnd = false;\n' +
      '}\n' +
      '\n' +
      'function trieInsert(root, word) {\n' +
      '  let node = root;\n' +
      '  for (let i = 0; i < word.length; i += 1) {\n' +
      '    const ch = word[i];\n' +
      '    if (node.children[ch] === undefined) node.children[ch] = new TrieNode();\n' +
      '    node = node.children[ch];\n' +
      '  }\n' +
      '  node.isEnd = true;\n' +
      '}\n' +
      '\n' +
      'function trieWalk(root, prefix) {\n' +
      '  let node = root;\n' +
      '  for (let i = 0; i < prefix.length; i += 1) {\n' +
      '    const ch = prefix[i];\n' +
      '    if (node.children[ch] === undefined) return null;\n' +
      '    node = node.children[ch];\n' +
      '  }\n' +
      '  return node;\n' +
      '}\n' +
      '\n' +
      'function trieSearch(root, word) {\n' +
      '  const node = trieWalk(root, word);\n' +
      '  return node !== null && node.isEnd === true;\n' +
      '}\n' +
      '\n' +
      'function trieStartsWith(root, prefix) {\n' +
      '  return trieWalk(root, prefix) !== null;\n' +
      '}',
    modify:
      "The corpus may hold the same word twice and search has to report the number of occurrences without a separate counter map. What does each node now need to carry, and what does insert do differently?",
  },
  {
    step: 17,
    name: "Implement Trie - II (Prefix tree with counts)",
    difficulty: "Medium",
    topicSlug: "tries-autocomplete",
    stem: "Extend the trie so every node carries the count of words passing through it and the count of words ending there, then answer prefix counts, word counts and deletion from those two numbers alone.",
    brief:
      "Input: repeated insertions of words that may repeat, prefix queries and word queries, plus removals. Output: countPrefix(p) = how many stored words begin with p, countWord(w) = how many stored copies of w exist, remove(w) = drop one copy. No query may re-walk the whole corpus.",
    concepts: [
      "dsa-trie17-count-on-the-path",
      "dsa-trie17-terminal-flag-versus-path",
      "dsa-trie17-edge-per-character-node",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "Bump passCount on every node an insert touches and endCount only on the last one. A prefix count is then a single read at the end of its walk, a word count is endCount at its node, and delete is the same walk with the signs flipped.",
    idealAnswer:
      "The plain trie answers \"is this present\"; the counted trie answers \"how much of the corpus is under this subtree\", which is the question autocomplete actually asks. Both numbers are maintained on the way down, so no query ever pays for a subtree walk: passCount at a node is the number of stored words whose path includes that node, which is exactly the count of words having the node's path as a prefix, and endCount distinguishes the words that finish there from the words that merely continue. Keeping them separate is the substance of the row — collapse them into one counter and a corpus of {\"ab\",\"abc\"} reports countWord(\"ab\") as 1 and countPrefix(\"ab\") as 1 indistinguishably, so \"how many words start with ab\" and \"is ab a word\" start returning the same wrong thing. Deletion is the honest test of the design: it must be all-or-nothing, so check membership before mutating, otherwise removing an absent word silently decrements the shared prefix and every count above it drifts by one — a corruption no single query reports but a total count does. Also decide what the root holds: passCount on the root is the number of stored insertions, which is a useful invariant to assert against, but it means insert and remove must both touch it.",
    walkthrough:
      "Insert \"abc\", \"ab\", \"bcd\". The a node carries passCount 2 (abc and ab walk through it) and the b under it carries 2; the c node below that carries 1, because only \"abc\" continues past the two-letter prefix; the b-at-root branch carries 1. endCount is 1 at the node for \"ab\" and 1 at the node for \"abc\" and 1 at \"bcd\". So countPrefix(\"a\") is 2, countPrefix(\"ab\") is 2, countPrefix(\"abc\") is 1, countWord(\"ab\") is 1, countWord(\"a\") is 0 — the path exists but nothing ends there — and countPrefix(\"z\") is 0 because the walk fails and returns no node to read. Now remove \"ab\": passCount drops by one at a, at b, at the root, and endCount at the \"ab\" node goes to 0. countPrefix(\"ab\") is now 1 (only \"abc\" remains) and countWord(\"ab\") is 0, which is the split the two counters exist to preserve: the prefix still has a word under it, the word itself is gone. Remove an absent word — say \"zz\" — and the membership guard returns false before touching a counter, so nothing drifts; without the guard the walk decrements nothing at the root but does decrement the first existing edge, and the corpus count is now quietly wrong.",
    commonMistake:
      "Storing one counter and using it for both questions, or decrementing during removal before proving the word is present.",
    whyWrong:
      "One counter cannot separate \"ends here\" from \"passes through\", so on {\"abc\",\"ab\"} it answers countWord(\"ab\") and countPrefix(\"ab\") with the same number while the corpus says 1 and 2 — and the moment a word is deleted the surviving count no longer means anything, because you cannot tell whether it counted terminals or transit traffic. Unguarded removal is the subtler failure: removing \"abd\" from a trie holding \"abc\" walks and decrements a, ab before discovering the d edge is missing, leaving countPrefix(\"a\") one lower than reality. The repair is a single line — look up first, mutate second — and the reason it is cheap is exactly that the structure supports a lookup.",
    followUps: [
      "Your remove leaves nodes with passCount 0. Does the trie still work, what breaks, and when is it worth pruning?",
      "countPrefix is O(L) but a request for \"the k completions under this prefix\" is not — what does it cost and how do you bound it?",
      "Insert the same word three times then remove it twice. Read the two counters at its node and say what each one is now.",
      "The root carries passCount. What invariant over the whole structure does that give you, and how would you use it as a self-test?",
    ],
    solution:
      'function CountedNode() {\n' +
      '  this.children = {};\n' +
      '  this.passCount = 0;\n' +
      '  this.endCount = 0;\n' +
      '}\n' +
      '\n' +
      'function countedWalk(root, prefix) {\n' +
      '  let node = root;\n' +
      '  for (let i = 0; i < prefix.length; i += 1) {\n' +
      '    const next = node.children[prefix[i]];\n' +
      '    if (next === undefined) return null;\n' +
      '    node = next;\n' +
      '  }\n' +
      '  return node;\n' +
      '}\n' +
      '\n' +
      'function countedInsert(root, word) {\n' +
      '  let node = root;\n' +
      '  node.passCount += 1;\n' +
      '  for (let i = 0; i < word.length; i += 1) {\n' +
      '    if (node.children[word[i]] === undefined) node.children[word[i]] = new CountedNode();\n' +
      '    node = node.children[word[i]];\n' +
      '    node.passCount += 1;\n' +
      '  }\n' +
      '  node.endCount += 1;\n' +
      '}\n' +
      '\n' +
      'function countedRemove(root, word) {\n' +
      '  if (countedWordCount(root, word) === 0) return false;\n' +
      '  let node = root;\n' +
      '  node.passCount -= 1;\n' +
      '  for (let i = 0; i < word.length; i += 1) {\n' +
      '    node = node.children[word[i]];\n' +
      '    node.passCount -= 1;\n' +
      '  }\n' +
      '  node.endCount -= 1;\n' +
      '  return true;\n' +
      '}\n' +
      '\n' +
      'function countedPrefixCount(root, prefix) {\n' +
      '  const node = countedWalk(root, prefix);\n' +
      '  return node === null ? 0 : node.passCount;\n' +
      '}\n' +
      '\n' +
      'function countedWordCount(root, word) {\n' +
      '  const node = countedWalk(root, word);\n' +
      '  return node === null ? 0 : node.endCount;\n' +
      '}',
    modify:
      "The product now wants the k most frequent completions of a prefix, ranked by stored frequency. Which counter do you read, what has to be added to a node to break ties, and what is the cost per query?",
  },
  {
    step: 17,
    name: "Longest Word With All Prefixes",
    difficulty: "Medium",
    topicSlug: "tries-autocomplete",
    stem: "Given an array of words, return the longest one whose every prefix is also in the array — including itself. When two tie on length, return the lexicographically larger.",
    brief:
      "Input: an array of distinct lowercase words. Output: one word, or the empty string if none qualifies. A word qualifies when the one-character prefix, the two-character prefix, and so on up to the whole word are all members of the array.",
    concepts: [
      "dsa-trie17-terminal-flag-versus-path",
      "dsa-trie17-edge-per-character-node",
      "dsa-trie17-count-on-the-path",
      "dsa-selection-min-scan",
    ],
    shortAnswer:
      "Insert every word into a trie that records isEnd at each node, then test a candidate by walking it and requiring isEnd at every level — a single pass that fails at the first prefix which is not itself a word. Keep the longest survivor, larger on a tie.",
    idealAnswer:
      "The naive test asks, for each word, whether each of its L prefixes is a member of the array — L set lookups per word on an array that has to be hashed first, or L substring comparisons if you skip the hashing. The trie version does the same work in one descent and says something more useful when it fails: it stops at the first character whose node is not terminal, which is the exact prefix that disqualified the word. Both forms need the terminal flag at every level rather than only at leaves, and that is why this row belongs to the trie step — a structure built for word-ends answers it directly, while a prefix-only structure (or a plain startsWith trie) would answer true for words whose intermediate prefixes were never inserted as words. The tie-break is a specification decision, not an accident: \"longest\" alone leaves several winners, so the contract has to say lexicographic, and the comparison must be made against the current best rather than by sorting, because sorting the corpus by length then lexicographically and taking the first qualifier is correct but pays for an order it only uses once. Cost is O(total characters) to build and O(total characters) to test, which is the same bound as the hash version with the difference that no substring is ever materialised as a key.",
    walkthrough:
      "Take [\"a\", \"ab\", \"abc\", \"acd\", \"ac\"]. Every word is inserted, so terminals sit at a, ab, abc, acd and ac. Test \"a\": the walk ends at the a node, which is terminal, so it qualifies and best is \"a\". Test \"ab\": a is terminal, ab is terminal — qualifies, longer, best becomes \"ab\". Test \"abc\": a, ab, abc all terminal — best \"abc\". Test \"acd\": a terminal, ac terminal, acd terminal — same length as the current best, and \"acd\" is lexicographically larger than \"abc\" because the second character c beats b, so best becomes \"acd\". Test \"ac\": qualifies but shorter. Answer \"acd\". Now change the corpus by dropping \"ac\": \"acd\" fails at the second level, because the node reached by a-then-c is no longer terminal — it is only a road to \"abc\" — so the walk reports the disqualifying prefix immediately, and the answer is \"abc\". On an empty array the loop never runs and the empty string is returned, which is the honest answer rather than a crash, and on [\"b\",\"ab\"] neither word qualifies since \"ab\" needs \"a\" and \"b\" has the one-character prefix \"b\" present, so \"b\" does qualify — the answer is \"b\".",
    commonMistake:
      "Checking only that the word's path exists, or deciding ties by first-encountered order instead of lexicographic rank.",
    whyWrong:
      "Path existence is startsWith, and the row asks for membership at every prefix: on the corpus {\"ab\",\"abc\"} the walk for \"abc\" succeeds completely while the prefix \"a\" is not a word, so path-existence returns \"abc\" when the correct answer is \"ab\". The tie mistake shows up later and quieter — on [\"abc\",\"acd\"] an implementation that keeps the first word of the winning length answers \"abc\" on the stated contract's \"acd\"; and iterating in sorted-by-length order does not fix it, because the tie must still be broken lexicographically.",
    followUps: [
      "You have isEnd only at leaves. What extra information per node turns this test back into a single descent?",
      "Rewrite the check with a set of strings instead of a trie. What does each rejected word cost that the trie version does not pay?",
      "The corpus is a hundred thousand words and you must answer this for every prefix of the dictionary. What does that cost, and where does it stop being a trie problem?",
      "Change the tie rule to \"shortest, then lexicographically smallest\". Which lines of your loop move?",
    ],
    solution:
      'function PrefixNode() {\n' +
      '  this.children = {};\n' +
      '  this.isEnd = false;\n' +
      '}\n' +
      '\n' +
      'function prefixInsert(root, word) {\n' +
      '  let node = root;\n' +
      '  for (let i = 0; i < word.length; i += 1) {\n' +
      '    if (node.children[word[i]] === undefined) node.children[word[i]] = new PrefixNode();\n' +
      '    node = node.children[word[i]];\n' +
      '  }\n' +
      '  node.isEnd = true;\n' +
      '}\n' +
      '\n' +
      'function everyPrefixIsAWord(root, word) {\n' +
      '  let node = root;\n' +
      '  for (let i = 0; i < word.length; i += 1) {\n' +
      '    const next = node.children[word[i]];\n' +
      '    if (next === undefined || next.isEnd !== true) return false;\n' +
      '    node = next;\n' +
      '  }\n' +
      '  return true;\n' +
      '}\n' +
      '\n' +
      'function longestWordWithAllPrefixes(words) {\n' +
      '  const root = new PrefixNode();\n' +
      '  for (const word of words) prefixInsert(root, word);\n' +
      '  let best = "";\n' +
      '  for (const word of words) {\n' +
      '    if (everyPrefixIsAWord(root, word) !== true) continue;\n' +
      '    if (word.length > best.length || (word.length === best.length && word > best)) best = word;\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify:
      "The array can now hold duplicates and the tie rule becomes \"the word that appears most often, longest, then lexicographically smallest\". Which counter at each node carries the frequency, and how does the comparison chain change?",
  },
  {
    step: 17,
    name: "Number of Distinct Substrings in a String",
    difficulty: "Medium",
    topicSlug: "tries-autocomplete",
    stem: "Count the distinct non-empty substrings of a string using a trie over its suffixes, without ever storing a substring.",
    brief:
      "Input: one lowercase string, up to a few thousand characters. Output: the number of distinct non-empty substrings. The counting must be done by creating nodes, not by building a set of strings.",
    concepts: [
      "dsa-trie17-suffix-trie-counts-substrings",
      "dsa-trie17-edge-per-character-node",
      "dsa-complexity-counting",
      "dsa-hash-frequency",
    ],
    shortAnswer:
      "Every substring is a prefix of some suffix, so insert all n suffixes into one trie and count how many nodes you had to create. Existing edges are reused for free, so duplicates cost nothing and the node count is the answer.",
    idealAnswer:
      "The set-of-substrings solution is the obvious one and it is the one to criticise: there are n(n+1)/2 substrings, each slice allocates, so the memory is quadratic in characters and the hashing cost is quadratic in total string length on top of it. The trie is the same asymptotic node count in the worst case — a string with no repetition really does have that many distinct substrings — but it shares the prefixes instead of re-storing them, so \"abab\" and \"ababa\" pay for the paths they have in common, and it never materialises a substring to use as a key. The insertion loop has one trap that is the actual content of the row: when the walk hits an edge that already exists you must keep descending, not break out of the suffix. The existing edge means that one substring is already recorded, but its extensions may be new — on \"abab\" the suffix \"ab\" reuses both edges and creates nothing, while on \"aab\" the suffix \"ab\" reuses the leading a and then creates a b under the second a node. Breaking early is a wrong answer that looks right on the first example you try. Complexity is O(n^2) time and O(n^2) nodes worst case, O(n) nodes for a string with nothing new at the end, and a suffix array with the LCP array computes the same number as n(n+1)/2 minus the sum of the LCP values, which is the answer to \"can you do better than the trie\".",
    walkthrough:
      "Take \"abab\", four characters, and insert suffixes from each start index. Start 0 (\"abab\") creates a, b, a, b — four nodes. Start 1 (\"bab\") creates b, a, b — three more, seven total, because the root has no b child yet. Start 2 (\"ab\") walks the existing a then the existing b under it and creates nothing; note that stopping at the first existing edge would also have been fine here. Start 3 (\"b\") walks the existing root b and creates nothing. Total 10? No — recount: start 1's suffix is \"bab\", so its three characters create three nodes, giving 4+3 = 7, and starts 2 and 3 add nothing, so the answer is 7, which is exactly the distinct set {a, b, ab, ba, aba, bab, abab}. The early-break trap is visible on \"aab\": start 0 creates a, a, b (three nodes for \"aab\"), start 1 walks the existing first a, then descends to the second a node — which is existing — then needs a b under it, which does not exist, so it creates one, and start 2 creates b under the first a, so the total is 3+1+1 = 5, matching {a, aa, aab, ab, b}. A trie that broke on the first existing edge at start 1 would report 4 and be wrong.",
    commonMistake:
      "Breaking out of the inner loop the moment an edge already exists, or counting the root and the empty string.",
    whyWrong:
      "An existing edge only proves that one substring was seen before; the suffix's longer prefixes live below that edge and may never have been inserted. On \"aab\" the break-on-existing version loses the \"ab\" node created under the second a and reports 4 instead of 5, and the failure is invisible on a fully non-repeating string — the worst kind of bug, because the first test you write passes. Counting the root or the empty string shifts every answer by one, which the brute-force comparison catches immediately and which is why the check compares against an explicit set rather than a hand-computed number only once.",
    followUps: [
      "Give a string of length n on which your trie really does create n(n+1)/2 nodes, and one on which it creates O(n).",
      "Your inner loop breaks on a missing edge today if you write it that way. Which suffix of \"aab\" exposes it, and why does \"abab\" not?",
      "Count distinct substrings of length at least k using the same insertion. Where do you stop counting nodes?",
      "A suffix array plus the LCP array gives the answer in a different way. Write the formula and say what each term is.",
    ],
    solution:
      'function SubNode() {\n' +
      '  this.children = {};\n' +
      '}\n' +
      '\n' +
      'function distinctSubstrings(s) {\n' +
      '  const root = new SubNode();\n' +
      '  let created = 0;\n' +
      '  for (let start = 0; start < s.length; start += 1) {\n' +
      '    let node = root;\n' +
      '    for (let i = start; i < s.length; i += 1) {\n' +
      '      const ch = s[i];\n' +
      '      if (node.children[ch] === undefined) {\n' +
      '        node.children[ch] = new SubNode();\n' +
      '        created += 1;\n' +
      '      }\n' +
      '      node = node.children[ch];\n' +
      '    }\n' +
      '  }\n' +
      '  return created;\n' +
      '}\n' +
      '\n' +
      'function distinctSubstringsBySet(s) {\n' +
      '  const seen = {};\n' +
      '  for (let start = 0; start < s.length; start += 1) {\n' +
      '    let piece = "";\n' +
      '    for (let end = start; end < s.length; end += 1) {\n' +
      '      piece += s[end];\n' +
      '      seen[piece] = true;\n' +
      '    }\n' +
      '  }\n' +
      '  let total = 0;\n' +
      '  for (const key in seen) total += 1;\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function distinctSubstringsBrokenOnExistingEdge(s) {\n' +
      '  const root = new SubNode();\n' +
      '  let created = 0;\n' +
      '  for (let start = 0; start < s.length; start += 1) {\n' +
      '    let node = root;\n' +
      '    for (let i = start; i < s.length; i += 1) {\n' +
      '      const ch = s[i];\n' +
      '      if (node.children[ch] === undefined) {\n' +
      '        node.children[ch] = new SubNode();\n' +
      '        created += 1;\n' +
      '        node = node.children[ch];\n' +
      '      } else {\n' +
      '        break;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return created;\n' +
      '}',
    modify:
      "You are asked for the number of distinct substrings of length at most k instead. Where does the inner loop stop, and does the answer for \"abab\" with k=2 differ from the trie you just built?",
  },
  {
    step: 17,
    name: "Bit Prerequisites for TRIE Problems",
    difficulty: "Easy",
    topicSlug: "tries-autocomplete",
    stem: "State the handful of bit operations the XOR-trie problems are built from, and show they compose: read a bit, set a bit, flip a bit, convert a number to a fixed-width bit list and back.",
    brief:
      "Input: non-negative integers that fit in 31 bits. Output: the value of one bit of a number, a number with one bit set or cleared, the XOR of two numbers, the index of the highest set bit, and a round trip between a number and its most-significant-first bit array.",
    concepts: [
      "dsa-trie17-bit-position-arithmetic",
      "dsa-xor-cancellation",
      "dsa-complexity-counting",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "(v >>> i) & 1 reads bit i, v | (1 << i) sets it, v & ~(1 << i) clears it, v ^ (1 << i) flips it, and XOR of two numbers is 1 exactly where the operands differ. Every bit-trie row is those facts, walked from the highest bit down.",
    idealAnswer:
      "The trie rows in this step replace characters with bits, and the only background needed is that a number in a fixed width is a string over the alphabet {0,1} — most-significant bit first is the sort order a greedy descent wants, exactly as a dictionary trie reads left to right. XOR is the interesting operator: it is 1 where the inputs differ, so maximising XOR means disagreeing with the query at every high bit you can, which is why the greedy is to take the opposite child when it exists. Bit 31 is a trap rather than a fact: JS bitwise operators work on 32-bit signed integers, so 1 << 31 is the negative value -2147483648, and an answer that sets it comes out signed; using >>> normalises a shift to unsigned, and picking width 30 for values below 2^31 keeps the whole computation in the non-negative range. A fixed width also matters for the trie itself: insertions padded to the same depth give every value the same path length, so the descent order is well-defined and the greedy comparison at the top level really is the most significant difference available.",
    walkthrough:
      "Take 13, which is 1101 in binary. bitAt(13,0) is 1 (13 & 1), bitAt(13,1) is 0, bitAt(13,2) is 1 and bitAt(13,3) is 1; bitAt(13,7) is 0, because reading past the top of the number is a zero rather than an error. setBit(8,0) is 9 because 8 is 1000 and the OR adds the ones place; setBit(8,3) is 8 again, because the bit was already set and OR is idempotent — that idempotence is why a bit-trie insert never needs to ask whether a value is already there. clearBit(13,2) is 9: 13 minus the 4 place. flipBit(13,2) is 9 and flipBit(9,2) is 13, so flip is its own inverse. xorOf(13,7) is 10, since 1101 ^ 0111 is 1010 — the two numbers agree only at bit 1, so only bit 3 and bit 2 come out set. highestBitIndex(13) is 3 and highestBitIndex(0) is -1, the sentinel an empty set needs. toBits(13,4) is [1,1,0,1] written most-significant-first, and fromBits of that list is 13 again, which is the round trip a bit trie relies on: the list is the path, the number is what the path spells.",
    commonMistake:
      "Using >> where >>> is needed, or shifting 1 << 31 and treating the result as a positive value.",
    whyWrong:
      ">> is arithmetic: on a value already carrying the sign bit it keeps shifting in copies of the sign, so a loop that reads bit i of a 32-bit word with (v >> i) & 1 is fine for the bits but the surrounding comparisons go wrong as soon as anything negative is in play — and one XOR result placed in a signed slot is negative. 1 << 31 is exactly -2147483648, so an accumulator that ORs it in produces a negative answer for what should be the largest XOR in the range; width 31 with >>> on reads, or width 30 when the inputs are known to be below 2^31, are both defensible, and picking neither silently changes the answer at the top of the range rather than failing loudly.",
    followUps: [
      "Why does a bit trie read from the most significant bit down rather than up? Build the wrong order and show a pair that breaks.",
      "x ^ (x >>> 1) is Gray code. Which of these five helpers would you add to compute it, and what does decode need?",
      "Your width is 30 and an input of 2^31 arrives. What does your code do, and what should it do?",
      "Count set bits with only these operators. What is the loop, and why does v &= v - 1 terminate?",
    ],
    solution:
      'function bitAt(value, index) {\n' +
      '  return (value >>> index) & 1;\n' +
      '}\n' +
      '\n' +
      'function setBit(value, index) {\n' +
      '  return value | (1 << index);\n' +
      '}\n' +
      '\n' +
      'function clearBit(value, index) {\n' +
      '  return value & ~(1 << index);\n' +
      '}\n' +
      '\n' +
      'function flipBit(value, index) {\n' +
      '  return value ^ (1 << index);\n' +
      '}\n' +
      '\n' +
      'function xorOf(a, b) {\n' +
      '  return a ^ b;\n' +
      '}\n' +
      '\n' +
      'function highestBitIndex(value) {\n' +
      '  let index = -1;\n' +
      '  for (let i = 0; i < 31; i += 1) {\n' +
      '    if (bitAt(value, i) === 1) index = i;\n' +
      '  }\n' +
      '  return index;\n' +
      '}\n' +
      '\n' +
      'function toBits(value, width) {\n' +
      '  const out = [];\n' +
      '  for (let i = width - 1; i >= 0; i -= 1) out.push(bitAt(value, i));\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function fromBits(bits) {\n' +
      '  let value = 0;\n' +
      '  for (const bit of bits) value = (value << 1) | bit;\n' +
      '  return value;\n' +
      '}',
    modify:
      "Now suppose the inputs are signed 32-bit values and the answer must also be reported signed. Which two helpers change, and what does bit 31 mean for the ordering the trie assumes?",
  },
  {
    step: 17,
    name: "Maximum XOR of Two Numbers in an Array",
    difficulty: "Medium",
    topicSlug: "tries-autocomplete",
    stem: "Find the largest XOR of any two elements of an array in O(n * width) using a binary trie, and say why the greedy descent is optimal.",
    brief:
      "Input: an array of non-negative integers below 2^31. Output: the maximum value of a ^ b over pairs of distinct indices. A linear-scan-per-pair brute force is the baseline to beat.",
    concepts: [
      "dsa-trie17-greedy-opposite-bit",
      "dsa-trie17-bit-position-arithmetic",
      "dsa-complexity-counting",
      "dsa-selection-min-scan",
    ],
    shortAnswer:
      "Insert the numbers as fixed-width bit strings, most-significant first. For each number, descend toward the child holding the opposite bit whenever it exists: that sets the answer bit. The best over all numbers is the answer.",
    idealAnswer:
      "The reason the greedy is correct is the weight of a bit: bit i is worth more than every bit below it summed, so at the highest level where a choice exists, taking the opposite bit can never be repaid by anything the fallback path does below it. That makes each level independent, which is what turns a quadratic pair scan into n descents of width levels. The trie is the natural structure because the constraint is not \"is this number present\" but \"among the numbers present, is there one disagreeing with me at this bit\" — a set cannot answer that without enumerating. Two implementation decisions carry the rest of the answer. Query before insert, not after: inserting first lets a number pair with itself, which returns 0 for a single-element array where the correct answer requires two distinct indices, and for a repeated value it silently allows the same index twice. And fix the width for every insertion: an unpadded trie makes 1 and 2^30 look like different-length keys and the descent order stops being most-significant-first. The fallback branch — descending to the matching bit when no opposite exists — is not an error path; it is the honest answer that no candidate disagrees at this bit, and it must keep the walk alive rather than return.",
    walkthrough:
      "Use [3, 10, 5, 25, 2, 8] with width 5, so the numbers are five-bit strings. Insert 3 (00011). Query 10 (01010): at bit 4 the stored trie offers only 0 and the query bit is 0, so no opposite exists and the answer bit stays 0; at bit 3 the query is 1 and the trie has only 0, so the opposite exists, answer bit 3 is set, and we descend to that 0; below that the disagreements continue and the result is 3 ^ 10 = 9. Query 5 (00101) against {3, 10}: the walk finds 10's branch and gives 15. Query 25 (11001): against {3,10,5} the top bit of 25 is 1 and every stored value has a 0 at bit 4, so bit 4 of the answer is set immediately — that single decision already beats anything the lower bits could do, which is the greedy in one line — and the descent ends at 5, giving 25 ^ 5 = 28. Continue: 2 against {3,10,5,25} gives 28 again (2 ^ 25 is 27), and 8 gives 25 ^ 8 = 17, so the maximum over all queries is 28, which is 5 ^ 25 and matches the brute-force pair scan over all fifteen pairs.",
    commonMistake:
      "Inserting the value before querying it, or walking bits from least significant to most significant.",
    whyWrong:
      "Insert-then-query pairs every element with itself, so an array of one element reports 0 where the honest answer is undefined, and on [5] or a corpus of identical values it hides the fact that no distinct pair was ever examined; query-then-insert makes the trie hold exactly the elements at earlier indices, which is a proof that the pair is two different positions. Least-significant-first is worse than slow, it is wrong: the greedy at bit 0 throws away the possibility of disagreeing at bit 4, so on [1, 2, 4] an LSB-first walk happily picks 1^2=3 while the maximum is 2^4=6. The fix is one loop bound — descend from width-1 down to 0.",
    followUps: [
      "You query before insert. Why is that a proof the pair is two distinct indices, and when would it not be?",
      "Return the pair, not the value. What does each trie node need to remember, and what does it cost?",
      "Same structure, minimum XOR of two numbers. Which branch of the descent moves, and why does the array want sorting for the other solution?",
      "The array has a million values below 2^20. What is your width, what is the node count, and what does the brute force cost by comparison?",
    ],
    solution:
      'function BitNode() {\n' +
      '  this.zero = null;\n' +
      '  this.one = null;\n' +
      '}\n' +
      '\n' +
      'function bitAt(value, index) {\n' +
      '  return (value >>> index) & 1;\n' +
      '}\n' +
      '\n' +
      'function bitInsert(root, value, width) {\n' +
      '  let node = root;\n' +
      '  for (let i = width - 1; i >= 0; i -= 1) {\n' +
      '    if (bitAt(value, i) === 0) {\n' +
      '      if (node.zero === null) node.zero = new BitNode();\n' +
      '      node = node.zero;\n' +
      '    } else {\n' +
      '      if (node.one === null) node.one = new BitNode();\n' +
      '      node = node.one;\n' +
      '    }\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function bestXorWith(root, value, width) {\n' +
      '  let node = root;\n' +
      '  let best = 0;\n' +
      '  for (let i = width - 1; i >= 0; i -= 1) {\n' +
      '    const bit = bitAt(value, i);\n' +
      '    const opposite = bit === 0 ? node.one : node.zero;\n' +
      '    if (opposite !== null) {\n' +
      '      best |= 1 << i;\n' +
      '      node = opposite;\n' +
      '    } else {\n' +
      '      node = bit === 0 ? node.zero : node.one;\n' +
      '    }\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function maximumXorPair(arr, width) {\n' +
      '  const root = new BitNode();\n' +
      '  let best = 0;\n' +
      '  let size = 0;\n' +
      '  for (const value of arr) {\n' +
      '    if (size > 0) best = Math.max(best, bestXorWith(root, value, width));\n' +
      '    bitInsert(root, value, width);\n' +
      '    size += 1;\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function bruteMaxXor(arr) {\n' +
      '  let best = 0;\n' +
      '  for (let i = 0; i < arr.length; i += 1) {\n' +
      '    for (let j = i + 1; j < arr.length; j += 1) best = Math.max(best, arr[i] ^ arr[j]);\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify:
      "The array is fixed but the queries stream in: each asks for the maximum XOR of x against the whole stored set, including x itself as a candidate. What changes in the loop order, and what does the first query now return?",
  },
  {
    step: 17,
    name: "Maximum XOR With an Element From Array",
    difficulty: "Hard",
    topicSlug: "tries-autocomplete",
    stem: "For each query [x, m], return the maximum of x ^ a over the array elements a with a <= m, or -1 when no element qualifies. Answer all queries without rebuilding the trie per query.",
    brief:
      "Input: an array of non-negative integers and a list of [x, m] pairs. Output: one number per query, in the original query order. The constraint is on the candidate, not on the query value, and the empty candidate set has to report -1.",
    concepts: [
      "dsa-trie17-offline-sweep-fills-trie",
      "dsa-trie17-greedy-opposite-bit",
      "dsa-index-order-loss",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "Sort the array, sort the query indices by m, and sweep: insert every element that is at most the current m and never remove one, so the trie always holds exactly the qualifying candidates. Answer each query with the usual opposite-bit descent and write it back through the index map.",
    idealAnswer:
      "The naive answer is one trie per query filtered by m, which is Q rebuilds of O(n * width) and reads as correct while being slow. The observation that makes it linear-ish is monotonicity: the eligible set for m is a superset of the eligible set for any smaller m, so processing queries in ascending m means each array element is inserted exactly once and nothing is ever deleted — the hard part of a filtered structure disappears because the filter is an inequality in one direction. Sorting the array turns the insert rule into a single moving cursor over a sorted list rather than a scan for each query. Two details are where wrong answers come from. The sort destroys the query order, so answers are written into a result array at the original index, and an implementation that returns the sorted answers looks right whenever the queries happen to be increasing. And the empty-candidate case has to be explicit: when the cursor is still at zero no element is eligible and the answer is -1, which cannot come out of the greedy descent — a descent on an empty trie either throws or returns 0, and 0 is a positive claim that some x ^ a equalled zero, which is a different statement from \"no candidate existed\". Cost is O((n log n) + n*W + (Q log Q) + Q*W).",
    walkthrough:
      "Take arr = [0,1,2,3,4] and queries [[3,1],[1,3],[5,6]]. Sort arr (already sorted) and order the queries by m as 0,1,2. Query 0 has m=1: the cursor admits 0 and 1, so the trie holds {0,1}; the descent for x=3 (binary 11) tries the opposite of bit 1, which is 0 — the stored 0 or 1 both have bit 1 = 0, so bit 1 of the answer is set and we take that branch; below it, among {0,1} the value disagreeing at bit 0 is 0, and 3^0 = 3. Query 1 has m=3: the cursor admits 2 and 3, trie is {0,1,2,3}; x=1 (01) wants a 1 at bit 1, and 2 or 3 offer it, so bit 1 is set, and at bit 0 it wants a 0 disagreeing with its own 1 — the subtree below the bit-1-1 branch holds 2 (10) and 3 (11), whose bit 0 values are 0 and 1, so take 2 and 1^2 = 3. Query 2 has m=6: the cursor admits 4; x=5 against {0,1,2,3,4} gives 5^2 = 7 as the maximum. Written back through the index map the answers are [3,3,7]. Now the -1 case: arr = [5], queries [[1,2]] — the cursor never advances because 5 > 2, the trie is empty, and the answer must be -1 rather than the 0 an empty descent would report.",
    commonMistake:
      "Returning the answers in sorted-query order, or letting an empty candidate set fall through the greedy and report 0.",
    whyWrong:
      "The order bug is the one that survives review: on the example above the sorted answers happen to equal the original answers because the m values were already ascending, so the test passes and the code is wrong for every shuffled input; answers must be written at the query's original index and only then returned. The empty-set bug is a semantic error rather than a crash — the descent on a trie with no children has nothing to disagree with, and a version that returns 0 asserts that some candidate achieved XOR 0, i.e. that x itself was present and eligible, when the truth is that no candidate existed. -1 is the only answer that cannot be confused with a real pair, which is why the row asks for it.",
    followUps: [
      "Rewrite the sweep to insert in sorted order and answer in sorted order, then prove the trie at query i holds exactly the elements at most m_i.",
      "Now the constraint is a range a in [lo, hi] instead of a <= hi. What does the trie need to support, and what does that cost per insert?",
      "Why is deleting never needed here, and what would change if the queries came as a stream with no ability to reorder them?",
      "Report which array element produced each answer, not just the value. What does a trie leaf have to remember?",
    ],
    solution:
      'function QueryNode() {\n' +
      '  this.zero = null;\n' +
      '  this.one = null;\n' +
      '}\n' +
      '\n' +
      'function qBitAt(value, index) {\n' +
      '  return (value >>> index) & 1;\n' +
      '}\n' +
      '\n' +
      'function qInsert(root, value, width) {\n' +
      '  let node = root;\n' +
      '  for (let i = width - 1; i >= 0; i -= 1) {\n' +
      '    if (qBitAt(value, i) === 0) {\n' +
      '      if (node.zero === null) node.zero = new QueryNode();\n' +
      '      node = node.zero;\n' +
      '    } else {\n' +
      '      if (node.one === null) node.one = new QueryNode();\n' +
      '      node = node.one;\n' +
      '    }\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function qBest(root, value, width) {\n' +
      '  let node = root;\n' +
      '  let best = 0;\n' +
      '  for (let i = width - 1; i >= 0; i -= 1) {\n' +
      '    const bit = qBitAt(value, i);\n' +
      '    const opposite = bit === 0 ? node.one : node.zero;\n' +
      '    if (opposite !== null) {\n' +
      '      best |= 1 << i;\n' +
      '      node = opposite;\n' +
      '    } else {\n' +
      '      node = bit === 0 ? node.zero : node.one;\n' +
      '    }\n' +
      '  }\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function maxXorQueries(arr, queries, width) {\n' +
      '  const sorted = arr.slice().sort((a, b) => a - b);\n' +
      '  const order = queries.map((query, index) => index).sort((a, b) => queries[a][1] - queries[b][1]);\n' +
      '  const answers = new Array(queries.length).fill(-1);\n' +
      '  const root = new QueryNode();\n' +
      '  let cursor = 0;\n' +
      '  for (const index of order) {\n' +
      '    const x = queries[index][0];\n' +
      '    const limit = queries[index][1];\n' +
      '    while (cursor < sorted.length && sorted[cursor] <= limit) {\n' +
      '      qInsert(root, sorted[cursor], width);\n' +
      '      cursor += 1;\n' +
      '    }\n' +
      '    answers[index] = cursor === 0 ? -1 : qBest(root, x, width);\n' +
      '  }\n' +
      '  return answers;\n' +
      '}\n' +
      '\n' +
      'function bruteMaxXorQueries(arr, queries) {\n' +
      '  return queries.map((query) => {\n' +
      '    let best = -1;\n' +
      '    for (const value of arr) {\n' +
      '      if (value <= query[1]) best = Math.max(best, query[0] ^ value);\n' +
      '    }\n' +
      '    return best;\n' +
      '  });\n' +
      '}',
    modify:
      "The queries arrive as a stream that cannot be reordered, and each still constrains candidates to a <= m. What structure replaces the sweep, and what does one query now cost?",
  },
];

export const expects: Record<string, string> = {
  "Implement TRIE | INSERT, SEARCH, STARTSWITH":
    '(() => { const root = new TrieNode(); trieInsert(root, "apple"); trieInsert(root, "app"); return trieSearch(root, "apple") === true && trieSearch(root, "app") === true && trieSearch(root, "a") === false && trieSearch(root, "appl") === false && trieSearch(root, "ban") === false && trieStartsWith(root, "a") === true && trieStartsWith(root, "appl") === true && trieStartsWith(root, "ban") === false && trieStartsWith(root, "") === true; })()',
  "Implement Trie - II (Prefix tree with counts)":
    '(() => { const root = new CountedNode(); countedInsert(root, "abc"); countedInsert(root, "ab"); countedInsert(root, "bcd"); const before = countedPrefixCount(root, "a") === 2 && countedPrefixCount(root, "ab") === 2 && countedPrefixCount(root, "abc") === 1 && countedWordCount(root, "ab") === 1 && countedWordCount(root, "a") === 0 && countedPrefixCount(root, "z") === 0; countedRemove(root, "ab"); const after = countedPrefixCount(root, "ab") === 1 && countedWordCount(root, "ab") === 0 && countedPrefixCount(root, "abc") === 1 && root.passCount === 2; const guarded = countedRemove(root, "abd") === false && countedPrefixCount(root, "a") === 1 && countedRemove(root, "abc") === true && root.passCount === 1; return before && after && guarded; })()',
  "Longest Word With All Prefixes":
    '(() => { const a = longestWordWithAllPrefixes(["a", "ab", "abc", "acd", "ac"]); const b = longestWordWithAllPrefixes(["ab", "abc", "abcd"]); const c = longestWordWithAllPrefixes(["b", "ab"]); const d = longestWordWithAllPrefixes([]); return a === "acd" && b === "" && c === "b" && d === ""; })()',
  "Number of Distinct Substrings in a String":
    '(() => { const abab = distinctSubstrings("abab"); const aab = distinctSubstrings("aab"); const aaa = distinctSubstrings("aaa"); const single = distinctSubstrings("z"); const agrees = distinctSubstrings("abcab") === distinctSubstringsBySet("abcab") && distinctSubstrings("aab") === distinctSubstringsBySet("aab"); const trap = distinctSubstringsBrokenOnExistingEdge("aab") === 4 && distinctSubstrings("aab") === 5; return abab === 7 && aab === 5 && aaa === 3 && single === 1 && agrees && trap; })()',
  "Bit Prerequisites for TRIE Problems":
    '(() => { const read = bitAt(13, 0) === 1 && bitAt(13, 1) === 0 && bitAt(13, 2) === 1 && bitAt(13, 3) === 1 && bitAt(13, 7) === 0; const write = setBit(8, 0) === 9 && setBit(8, 3) === 8 && clearBit(13, 2) === 9 && flipBit(13, 2) === 9 && flipBit(9, 2) === 13; const mix = xorOf(13, 7) === 10 && highestBitIndex(13) === 3 && highestBitIndex(0) === -1; const path = toBits(13, 4).join(",") === "1,1,0,1" && fromBits(toBits(13, 4)) === 13 && fromBits(toBits(0, 5)) === 0; return read && write && mix && path; })()',
  "Maximum XOR of Two Numbers in an Array":
    '(() => { const main = maximumXorPair([3, 10, 5, 25, 2, 8], 5) === 28; const agrees = maximumXorPair([8, 1, 2, 12], 5) === bruteMaxXor([8, 1, 2, 12]) && maximumXorPair([3, 10, 5, 25, 2, 8], 5) === bruteMaxXor([3, 10, 5, 25, 2, 8]); const wide = maximumXorPair([0, 1, 2, 3, 4], 30) === 7 && maximumXorPair([1, 2, 4], 30) === 6; return main && agrees && wide; })()',
  "Maximum XOR With an Element From Array":
    '(() => { const spec = maxXorQueries([0, 1, 2, 3, 4], [[3, 1], [1, 3], [5, 6]], 30).join(",") === "3,3,7"; const shuffled = maxXorQueries([0, 1, 2, 3, 4], [[5, 6], [3, 1], [1, 3]], 30).join(",") === "7,3,3"; const empty = maxXorQueries([5], [[1, 2]], 30).join(",") === "-1"; const agrees = maxXorQueries([3, 10, 5, 25, 2, 8], [[5, 15], [16, 2], [26, 24]], 30).join(",") === bruteMaxXorQueries([3, 10, 5, 25, 2, 8], [[5, 15], [16, 2], [26, 24]]).join(","); return spec && shuffled && empty && agrees; })()',
};
