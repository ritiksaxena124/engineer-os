import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';

/**
 * Step 14a — the first eight Binary Search Tree rows on the sheet.
 *
 * A BST is a binary tree with one promise attached to every node, so every question here is the
 * same descent written down in a different place: search, insert, delete, min/max, ceil, floor and
 * the k-th element all ask you to decide, at each node, which single child is still worth visiting.
 * The solutions are deliberately iterative where the interview answer is iterative, because "I
 * walked one root-to-leaf path" is the claim being graded.
 */

const buildTree =
  'function buildTree(cells) {\n' +
  '  if (cells.length === 0 || cells[0] === null) return null;\n' +
  '  const root = { val: cells[0], left: null, right: null };\n' +
  '  const queue = [root];\n' +
  '  let cursor = 0;\n' +
  '  let index = 1;\n' +
  '  while (cursor < queue.length && index < cells.length) {\n' +
  '    const parent = queue[cursor];\n' +
  '    cursor += 1;\n' +
  '    if (index < cells.length) {\n' +
  '      const value = cells[index];\n' +
  '      index += 1;\n' +
  '      if (value !== null) {\n' +
  '        parent.left = { val: value, left: null, right: null };\n' +
  '        queue.push(parent.left);\n' +
  '      }\n' +
  '    }\n' +
  '    if (index < cells.length) {\n' +
  '      const value = cells[index];\n' +
  '      index += 1;\n' +
  '      if (value !== null) {\n' +
  '        parent.right = { val: value, left: null, right: null };\n' +
  '        queue.push(parent.right);\n' +
  '      }\n' +
  '    }\n' +
  '  }\n' +
  '  return root;\n' +
  '}';

const serializeLevel =
  'function serializeLevel(root) {\n' +
  '  if (root === null) return "";\n' +
  '  const rows = [];\n' +
  '  const queue = [root];\n' +
  '  let cursor = 0;\n' +
  '  while (cursor < queue.length) {\n' +
  '    const node = queue[cursor];\n' +
  '    cursor += 1;\n' +
  '    if (node === null) {\n' +
  '      rows.push("null");\n' +
  '      continue;\n' +
  '    }\n' +
  '    rows.push(String(node.val));\n' +
  '    queue.push(node.left);\n' +
  '    queue.push(node.right);\n' +
  '  }\n' +
  '  while (rows.length > 0 && rows[rows.length - 1] === "null") rows.pop();\n' +
  '  return rows.join(" ");\n' +
  '}';

const inorderOf =
  'function inorderOf(root) {\n' +
  '  const out = [];\n' +
  '  const walk = (node) => {\n' +
  '    if (node === null) return;\n' +
  '    walk(node.left);\n' +
  '    out.push(node.val);\n' +
  '    walk(node.right);\n' +
  '  };\n' +
  '  walk(root);\n' +
  '  return out;\n' +
  '}';

export const concepts: Record<string, ConceptSpec> = {
  'dsa-bst-ordering-promise': {
    slug: 'dsa-bst-ordering-promise',
    name: 'A BST promises an ordering to every subtree, not just to each parent-child pair',
    detail:
      'Left subtree < node < right subtree, and the same promise holds again at every node below it — which is why validating needs carried bounds rather than a local comparison.',
    terms: ['every subtree', 'left is smaller', 'right is larger', 'ordering invariant', 'bounds'],
    weight: 4,
  },
  'dsa-bst-one-branch-descent': {
    slug: 'dsa-bst-one-branch-descent',
    name: 'A comparison at each node throws away half the tree',
    detail:
      'Search, insert, ceil, floor and successor all walk one root-to-leaf path, so the cost is the height: O(h), which is O(log n) only while the tree stays balanced.',
    terms: ['one branch', 'discards the other subtree', 'height not size', 'O(h)', 'comparison decides the turn'],
    weight: 4,
  },
  'dsa-bst-minmax-is-a-spine': {
    slug: 'dsa-bst-minmax-is-a-spine',
    name: 'The smallest and largest values live at the ends of the spines',
    detail: 'The minimum is the leftmost node and the maximum is the rightmost one; finding either is a single walk down one side with no branching at all.',
    terms: ['leftmost', 'rightmost', 'spine', 'keep going left', 'no comparison needed'],
    weight: 2,
  },
  'dsa-bst-ceil-floor-candidate-tracking': {
    slug: 'dsa-bst-ceil-floor-candidate-tracking',
    name: 'Ceil and floor remember the best node that was still too big',
    detail:
      'While descending, every node that overshoots the target is recorded as a candidate before turning towards the smaller side; the last recorded candidate is the answer.',
    terms: ['candidate', 'remember the overshoot', 'still valid', 'last left turn', 'single pass'],
    weight: 3,
  },
  'dsa-bst-insert-lands-on-a-leaf': {
    slug: 'dsa-bst-insert-lands-on-a-leaf',
    name: 'A BST insertion can only attach at a null child',
    detail: 'The descent is a search that ends at nothing; the new node goes exactly there, so the ordering promise survives without any rotation.',
    terms: ['attach at a leaf', 'null child', 'no rebalancing', 'descent ends', 'shape preserved'],
    weight: 3,
  },
  'dsa-bst-delete-three-cases': {
    slug: 'dsa-bst-delete-three-cases',
    name: 'Deleting a node is three cases, and only the two-child one is interesting',
    detail:
      'A leaf detaches; a node with one child is replaced by that child; a node with two children borrows its in-order successor (or predecessor) and deletes that one instead, which recurses at most one level.',
    terms: ['leaf', 'one child', 'two children', 'inorder successor', 'copy then delete'],
    weight: 4,
  },
  'dsa-bst-inorder-is-the-sorted-order': {
    slug: 'dsa-bst-inorder-is-the-sorted-order',
    name: 'The in-order walk of a BST is its values in sorted order',
    detail:
      'Left, node, right visits exactly increasing values, so ranking questions (k-th smallest, two sum, successor) become walks over a sorted sequence.',
    terms: ['left node right', 'sorted sequence', 'inorder traversal', 'increasing', 'ranking'],
    weight: 4,
  },
  'dsa-bst-k-th-by-stopped-walk': {
    slug: 'dsa-bst-k-th-by-stopped-walk',
    name: 'The k-th element is an in-order walk that stops at k',
    detail:
      'Iterating in-order with an explicit stack lets you count emitters and return early, costing O(h + k) instead of materialising the whole sorted list.',
    terms: ['iterative inorder', 'stop early', 'count visits', 'explicit stack', 'O(h + k)'],
    weight: 3,
  },
  'dsa-bst-lca-is-the-first-split': {
    slug: 'dsa-bst-lca-is-the-first-split',
    name: 'In a BST the common ancestor is where the two values first go different ways',
    detail:
      'Descend while both targets lie on the same side; the first node that does not send them the same way is the lowest common ancestor, and no subtree search is needed.',
    terms: ['first split', 'same side', 'descend', 'no recursion into both', 'range test'],
    weight: 3,
  },
  'dsa-bst-two-sum-needs-two-walks': {
    slug: 'dsa-bst-two-sum-needs-two-walks',
    name: 'Two sum on a BST is a sorted two-pointer over two opposite walks',
    detail:
      'A forward in-order iterator gives the smallest unseen value and a backward one the largest, so the pair search closes in from both ends without an array.',
    terms: ['two pointer', 'forward iterator', 'backward iterator', 'sorted array two sum', 'meet in the middle'],
    weight: 3,
  },
  'dsa-bst-local-check-passes-a-broken-tree': {
    slug: 'dsa-bst-local-check-passes-a-broken-tree',
    name: 'Comparing only parent and child calls a broken tree valid',
    detail:
      'A node can sit on the correct side of its own parent and still break an ancestor: 5 with right child 7 and that child holding a left 4 passes the local test.',
    terms: ['parent child compare', 'ancestor bound', 'false valid', 'carried range', 'counterexample'],
    weight: 4,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 14,
    name: 'Introduction to Binary Search Tree',
    difficulty: 'Easy',
    topicSlug: 'binary-trees',
    stem: 'State what a BST promises at every node, then write insertion and lookup that keep that promise.',
    brief:
      'Input: values to insert (distinct integers), then a value to look up. Output: the tree and a yes/no answer. The promise must hold for every subtree, not only at the root, and equal values are not stored twice.',
    concepts: ['dsa-bst-ordering-promise', 'dsa-bst-one-branch-descent', 'dsa-bst-inorder-is-the-sorted-order'],
    shortAnswer:
      'A BST keeps its values sorted by shape: everything left of a node is smaller, everything right is larger, and the same rule repeats in every subtree — so lookup compares once per node and follows one child.',
    idealAnswer:
      'The ordering promise is the whole data structure: it converts a search into a sequence of single comparisons, each of which discards an entire subtree. Insert follows the identical descent and attaches at the first null child, which is why a plain BST never rotates — it cannot fix its own shape, only extend it. Lookup and insertion both cost O(h) comparisons; on values inserted in sorted order h is n and the BST has become a linked list, which is exactly the reason AVL, red-black and B-tree variants exist. The walk that proves the promise is in-order: left, node, right emits the stored values strictly increasing.',
    walkthrough:
      'Trace inserting 5, 3, 8, 1, 4 into an empty tree. 5 becomes the root. 3 compares smaller than 5, so it goes left. 8 compares larger, so it goes right. 1 goes left of 5, then left of 3. 4 goes left of 5, then right of 3 — it never revisits 5, because one comparison at each node is enough to know which side can still hold it. Now look up 4: 5 (go left), 3 (go right), 4 (found) — three comparisons out of five nodes. Searching an unordered tree of five nodes for a missing value would have to visit all five; the promise is what turns "visit everything" into "visit one path". And an in-order read of the finished tree gives 1, 3, 4, 5, 8, which is the sorted order the shape was carrying all along.',
    commonMistake:
      'Saying a BST is "a sorted binary tree" and then validating it by comparing each node with its two children, or assuming a BST is automatically O(log n) per operation.',
    whyWrong:
      'The sorted-by-children reading accepts a tree like 5 with right child 7 holding a left child 4: 4 is smaller than its own parent, so the local test passes, but 4 sits inside the right subtree of 5 and breaks the promise made higher up. And the O(log n) claim is about the shape, not the rules: insert 1..n in ascending order and the promise holds perfectly while the height becomes n, so every lookup degrades to a full linear walk.',
    followUps: [
      'Insert 1, 2, 3, 4, 5 in that order into a plain BST. What is the height, and what does lookup cost?',
      'Why does the ordering promise make in-order the only walk that comes out sorted — what does pre-order emit instead?',
      'Duplicate values arrive. Where do you send them, and how does that change the in-order output?',
      'What has to be true about the shape for a BST to reach O(log n), and which structure enforces it?',
    ],
    solution:
      'function bstInsert(node, value) {\n' +
      '  if (node === null) return { val: value, left: null, right: null };\n' +
      '  if (value < node.val) node.left = bstInsert(node.left, value);\n' +
      '  else if (value > node.val) node.right = bstInsert(node.right, value);\n' +
      '  return node;\n' +
      '}\n' +
      '\n' +
      'function buildBst(values) {\n' +
      '  let root = null;\n' +
      '  for (const value of values) root = bstInsert(root, value);\n' +
      '  return root;\n' +
      '}\n' +
      '\n' +
      'function bstHas(node, value) {\n' +
      '  let current = node;\n' +
      '  let comparisons = 0;\n' +
      '  while (current !== null) {\n' +
      '    comparisons += 1;\n' +
      '    if (value === current.val) return true;\n' +
      '    current = value < current.val ? current.left : current.right;\n' +
      '  }\n' +
      '  bstHas.comparisons = comparisons;\n' +
      '  return false;\n' +
      '}\n' +
      '\n' +
      'function isStrictlyIncreasing(values) {\n' +
      '  for (let i = 1; i < values.length; i += 1) {\n' +
      '    if (values[i] <= values[i - 1]) return false;\n' +
      '  }\n' +
      '  return true;\n' +
      '}\n' +
      '\n' +
      inorderOf + '\n' +
      '\n' +
      serializeLevel,
    modify:
      'Stop discarding duplicates and keep a count per node instead. What changes in the in-order output, in the insertion descent, and in the deletion cases?',
  },
  {
    step: 14,
    name: 'Search in a Binary Search Tree',
    difficulty: 'Easy',
    topicSlug: 'binary-trees',
    stem: 'Return the subtree whose root holds a value, in as few node visits as the promise allows.',
    brief:
      'Input: a BST given as level-order cells with null markers, and a target value. Output: the node whose value is the target, or null. Count the nodes you visit and defend that number.',
    concepts: ['dsa-bst-one-branch-descent', 'dsa-bst-ordering-promise'],
    shortAnswer:
      'Compare once per node and move to the single child that can still hold the target: left if smaller, right if larger. Null ends it. That is at most one visit per level.',
    idealAnswer:
      'The descent is the general binary-tree search with the recursion removed: a full search must try both children because it knows nothing, while a BST search proves the other child irrelevant at every step. Cost is O(h) visits, worst case O(n) on a skewed tree, and the visit count is the thing worth reporting — searching 9 in the balanced 4/2/7/1/3 tree touches 4, 7 and nothing under 7, three visits for five nodes. Returning the node rather than a boolean is what makes this the primitive for ceil, floor, successor and insert: they are the same walk with something remembered along the way.',
    walkthrough:
      'On the tree 4 at the root with 2 and 7 as children and 1 and 3 under the 2, look up 3. Visit 4: 3 is smaller, so the entire right subtree — 7 and everything under it — is eliminated by one comparison. Visit 2: 3 is larger, so 2\'s left subtree (the 1) is eliminated. Visit 3: match, return the node. Three visits, and three of the five nodes were never touched. Now look up 5: 4 sends right to 7, 7 sends left to a null child, the walk ends with the counter at 2 and a null answer — and that null is a proof of absence, not a failed search, because every node that could have held 5 was eliminated on the way. The same walk, changed only to remember the last node where it turned left, is the ceil.',
    commonMistake:
      'Writing it as a full binary-tree search that recurses into both children and stops when either reports a hit.',
    whyWrong:
      'That answer is correct and throws away the only property the structure has. It visits every node on a miss instead of one root-to-leaf path, so the reported cost becomes O(n) even on a balanced tree, and it cannot be reused for insert, ceil, floor or successor — those need the walk that knows which side to abandon.',
    followUps: [
      'How many nodes does your walk visit when the target is missing from a balanced 7-node BST? What is the maximum possible?',
      'Rewrite the recursion as a loop. Which version is O(h) stack space and which is O(1)?',
      'The tree is a skewed chain of 1000 nodes and the target is absent. What is the cost, and what structure would fix it?',
      'Return the parent and the direction of the last step. What operation does that set you up to write immediately?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      'function searchBst(root, value, counter) {\n' +
      '  const seen = counter ?? { visits: 0 };\n' +
      '  let current = root;\n' +
      '  while (current !== null) {\n' +
      '    seen.visits += 1;\n' +
      '    if (value === current.val) return current;\n' +
      '    current = value < current.val ? current.left : current.right;\n' +
      '  }\n' +
      '  return null;\n' +
      '}\n' +
      '\n' +
      serializeLevel,
    modify:
      'Return the deepest node the walk reached even when the target is absent. What does that single change let you implement without another descent?',
  },
  {
    step: 14,
    name: 'Find Min/Max in BST',
    difficulty: 'Easy',
    topicSlug: 'binary-trees',
    stem: 'Find the smallest and largest values in a BST without comparing anything to a running best.',
    brief:
      'Input: a BST as level-order cells. Output: the minimum and maximum node values, and how many nodes each walk visited. The tree may be skewed to one side.',
    concepts: ['dsa-bst-minmax-is-a-spine', 'dsa-bst-one-branch-descent', 'dsa-bst-ordering-promise'],
    shortAnswer:
      'Keep going left for the minimum and keep going right for the maximum. The spine ends at a null child and the node above it is the answer.',
    idealAnswer:
      'The ordering promise means no node can hold a value smaller than the leftmost one: any node reached by turning right at some ancestor is already larger than that ancestor, and the leftmost node is below every such turn. So the search for a minimum is not a search at all — it is a walk that stops asking questions, costing h visits and O(1) space iteratively. This is also the inner loop of two other operations: deleting a two-child node needs the smallest node of the right subtree, and an in-order iterator needs the next node down a left spine. The skewed case is where the cost is honest to state: a chain leaning right has its minimum at the root in one visit and its maximum at the end of n visits.',
    walkthrough:
      'For 8 with 3 and 10 as children, 1 and 6 under the 3, and 14 under the 10: the minimum walk takes 8 left to 3, 3 left to 1, 1 left to null — three visits, answer 1. The maximum walk takes 8 right to 10, 10 right to 14, 14 right to null — also three visits, answer 14. Neither walk ever compares values, which is the point: the shape already decided. Now build the chain 1 with right child 2 with right child 3 and ask for the maximum. Three visits, because the right spine is the whole tree. Ask for the minimum on the same chain: one visit, the root. Height is the price of both operations, and it is paid asymmetrically depending on which direction the tree happens to lean.',
    commonMistake:
      'Running a full traversal with a running minimum, or recursing down both children and taking Math.min of the two results.',
    whyWrong:
      'Both answers are correct and both are O(n) when O(h) is available. The traversal version also hides the real invariant: if you have to inspect the right subtree to find the minimum, you have not used the ordering promise at all, and the same mistake in the delete operation turns a spine walk into a whole-tree scan for the successor.',
    followUps: [
      'Delete the root of a BST whose root has two children. Which spine does the replacement come from, and how deep does that walk go?',
      'Give a tree where the minimum walk visits one node and the maximum walk visits n. What shape is it?',
      'A node stores its subtree size. Does that change how you find the k-th smallest, or only the constant?',
      'Why is the empty tree a case you must answer before the loop rather than inside it?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      'function bstMin(root) {\n' +
      '  let current = root;\n' +
      '  let steps = 0;\n' +
      '  if (current === null) return { val: null, steps: 0 };\n' +
      '  while (current.left !== null) {\n' +
      '    steps += 1;\n' +
      '    current = current.left;\n' +
      '  }\n' +
      '  return { val: current.val, steps: steps + 1 };\n' +
      '}\n' +
      '\n' +
      'function bstMax(root) {\n' +
      '  let current = root;\n' +
      '  let steps = 0;\n' +
      '  if (current === null) return { val: null, steps: 0 };\n' +
      '  while (current.right !== null) {\n' +
      '    steps += 1;\n' +
      '    current = current.right;\n' +
      '  }\n' +
      '  return { val: current.val, steps: steps + 1 };\n' +
      '}',
    modify:
      'Give every node a parent pointer and find the successor without ever looking at a subtree. Which way do you climb, and when do you stop?',
  },
  {
    step: 14,
    name: 'Ceil in a Binary Search Tree',
    difficulty: 'Medium',
    topicSlug: 'binary-trees',
    stem: 'Return the smallest node value that is still greater than or equal to a target, in one descent.',
    brief:
      'Input: a BST as level-order cells, and a target that is not necessarily present. Output: ceil(target) = the least stored value >= target, or null when every stored value is smaller. A single pass, no traversal.',
    concepts: ['dsa-bst-ceil-floor-candidate-tracking', 'dsa-bst-one-branch-descent', 'dsa-bst-ordering-promise'],
    shortAnswer:
      'Descend as if searching. Every node that is bigger than the target is a candidate, so remember it and go left to try to find a smaller overshoot; a node that is too small sends you right. The last remembered candidate is the ceil.',
    idealAnswer:
      'The ceil is the first stored value at or above the target, so an absent target still has an answer — which is exactly the case a plain BST search cannot handle, because search ends at a null and reports absence. The trick is to carry the boundary while descending: turning left means "this node is big enough, and there might be a smaller one that is also big enough", so the node must be remembered before it is abandoned; turning right means "this node is too small and so is everything to its left", so it is discarded. The invariant is that the candidate is always the smallest value seen that is >= target, and the walk terminates at null with the answer already in hand. Cost O(h), O(1) space iterative.',
    walkthrough:
      'On the perfect BST 8 / 4,12 / 2,6,10,14, ask for ceil(7). At 8: 8 >= 7, remember 8, go left. At 4: 4 < 7, so 4 and its whole left subtree are too small, go right. At 6: still < 7, go right. Null — return the remembered 8. Four visits. Now ask for ceil(6): 8 remembered, left to 4, right to 6, exact match returns 6 immediately. Ask for ceil(15): 8 is too small, right to 12 too small, right to 14 too small, right to null with nothing ever remembered — null. And ceil(13): 8 too small, 12 too small, 14 is an overshoot so it is remembered, then left to null, returning 14. Note that ceil(1) is 2, not 1: the answer need not be near the target, it must merely be the least value that is not below it.',
    commonMistake:
      'Returning the last node the walk visited, or claiming null whenever the target is not stored in the tree.',
    whyWrong:
      'The walk stops wherever the search would stop, and that node is not on the correct side of the target: searching for 7 ends at a null under 6, and 6 is below the target — the answer is an ancestor. Meanwhile "absent means null" confuses ceil with search: ceil(7) in a tree with no 7 is 8, and returning null for absent targets fails on most of the inputs that make the question worth asking.',
    followUps: [
      'Write the mirror case, floor. Which turn now records the candidate, and what does the invariant become?',
      'Track the node instead of the value. Why does that version answer "closest value in the BST" almost for free?',
      'The target is smaller than everything in the tree. What does your loop do, and how many comparisons does it make?',
      'Insert the ceil/floor descent into a rate limiter that needs "the next configured limit at or above this request size". What does it cost per request?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      'function ceilInBst(root, target) {\n' +
      '  let candidate = null;\n' +
      '  let current = root;\n' +
      '  while (current !== null) {\n' +
      '    if (current.val === target) return current.val;\n' +
      '    if (current.val > target) {\n' +
      '      candidate = current.val;\n' +
      '      current = current.left;\n' +
      '    } else {\n' +
      '      current = current.right;\n' +
      '    }\n' +
      '  }\n' +
      '  return candidate;\n' +
      '}\n' +
      '\n' +
      'function ceilNode(root, target) {\n' +
      '  let candidate = null;\n' +
      '  let current = root;\n' +
      '  while (current !== null) {\n' +
      '    if (current.val === target) return current;\n' +
      '    if (current.val > target) {\n' +
      '      candidate = current;\n' +
      '      current = current.left;\n' +
      '    } else {\n' +
      '      current = current.right;\n' +
      '    }\n' +
      '  }\n' +
      '  return candidate;\n' +
      '}',
    modify:
      'Return the closest stored value to the target instead of the least value at or above it. Which two descents does that become, and can you do it in one?',
  },
  {
    step: 14,
    name: 'Floor in a Binary Search Tree',
    difficulty: 'Medium',
    topicSlug: 'binary-trees',
    stem: 'Return the largest node value that is still less than or equal to a target, in one descent.',
    brief:
      'Input: a BST as level-order cells, and a target that may be absent. Output: floor(target) = the greatest stored value <= target, or null when every stored value is larger. One pass, O(1) extra space.',
    concepts: ['dsa-bst-ceil-floor-candidate-tracking', 'dsa-bst-one-branch-descent', 'dsa-bst-ordering-promise'],
    shortAnswer:
      'The mirror of ceil: descend, remember every node that is too small as a candidate, turn right for a larger one; turn left only to discard the node and everything under it.',
    idealAnswer:
      'Floor and ceil are the same algorithm with the comparison inverted, and the reason both fit in one descent is the same reason search does: at every node, the ordering promise proves one entire subtree useless. For floor, a node at or below the target is a candidate and its right subtree might hold a better one, while any node above the target is disqualified along with its whole left subtree. Getting the two turn rules mixed up is the classic failure — recording the candidate on the wrong side gives an answer that silently equals the plain search result. Worth stating out loud in an interview: floor(x) and ceil(x) bracket x, and if they disagree then x is absent.',
    walkthrough:
      'Same tree 8 / 4,12 / 2,6,10,14. floor(7): 8 is above 7, discard it and its left subtree? No — 8 is above the target so it cannot be the answer, but its left subtree can, so turn left without recording. At 4: 4 <= 7, record 4, turn right. At 6: 6 <= 7, record 6, turn right. Null: return 6. floor(8) returns 8 on the first comparison. floor(1): 8 too big, left to 4 too big, left to 2 too big, left to null with nothing recorded — null. floor(100): 8 recorded, right to 12 recorded, right to 14 recorded, right to null — 14. Compare the two trajectories with ceil and you can see the asymmetry: ceil records on left turns, floor records on right turns, and each records precisely the nodes that are on the correct side of the target.',
    commonMistake:
      'Recording the candidate when going left, or using a strict < comparison so that a target present in the tree returns its successor.',
    whyWrong:
      'Recording on the left turn is the ceil rule and it returns a value above the target, which is the one answer floor must never give. A strict comparison makes floor(6) in that tree descend right from 6 and return 4 — the node exists and is exactly equal, so the answer must be 6; the equal case has to terminate the walk, not continue searching past it.',
    followUps: [
      'Give the pair floor and ceil as one function returning both. When does that answer tell you the target is absent?',
      'Your store keys price buckets at 0, 50, 200, 1000. Which of floor or ceil finds the bucket a $150 order belongs to?',
      'What breaks if the tree holds duplicates and equal values go to the right subtree on insert?',
      'Prove floor(x) <= x < ceil(x) always holds when both are non-null. Which invariant in the loop makes it true?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      'function floorInBst(root, target) {\n' +
      '  let candidate = null;\n' +
      '  let current = root;\n' +
      '  while (current !== null) {\n' +
      '    if (current.val === target) return current.val;\n' +
      '    if (current.val < target) {\n' +
      '      candidate = current.val;\n' +
      '      current = current.right;\n' +
      '    } else {\n' +
      '      current = current.left;\n' +
      '    }\n' +
      '  }\n' +
      '  return candidate;\n' +
      '}',
    modify:
      'Now return the floor together with how many nodes were visited. Where does that count become the answer to "is this tree balanced enough to be used as an index"?',
  },
  {
    step: 14,
    name: 'Insert a given Node in BST',
    difficulty: 'Medium',
    topicSlug: 'binary-trees',
    stem: 'Add a value to a BST so that the ordering promise still holds everywhere, without rotating anything.',
    brief:
      'Input: a BST as level-order cells and a value not already present. Output: the new root and the level-order listing. The inserted node must be a leaf, and the relative shape of the existing tree must not change.',
    concepts: ['dsa-bst-insert-lands-on-a-leaf', 'dsa-bst-one-branch-descent', 'dsa-bst-ordering-promise'],
    shortAnswer:
      'Run the search descent to a null child, remember the parent and which side you left it from, and attach the new node there. Cost O(h); the existing tree is untouched.',
    idealAnswer:
      'Insert is the only BST mutation that never changes an existing pointer, and that is what makes the proof trivial: the new node is placed where the search for its value would have ended, so the promise holds for every ancestor by construction — smaller than all the ancestors it turned right past, larger than all the ones it turned left past, and inside a subtree whose bounds it satisfies because it lies at their intersection. The recursive form expresses the same fact as "return the node with the child replaced", which is clean but costs O(h) frames; the iterative form costs O(1) space and needs the parent-and-side bookkeeping. What insert cannot do is keep the tree shallow: repeated insertion decides the shape, and the sorted input case is the one to name unprompted.',
    walkthrough:
      'Insert 7 into the tree 5 / 3,8 / 1,4,null,9. Start at 5: 7 is larger, so the left subtree is already excluded; go right to 8. At 8: 7 is smaller, so the right subtree is excluded; go left — and the left child is null. Attach there. The new node is a leaf, and the only pointer changed is the left link of node 8. Check the promise at the ancestors: 7 > 5, and 7 sits in the right subtree of 5 where every value must exceed 5; 7 < 8, and it sits in the left subtree of 8 where every value must be below 8. Both hold, and nothing else moved, so no other node needs re-checking. Level order now reads 5 3 8 1 4 null 9 null 7. Do the same descent again for the same value and you have proved insert is idempotent in shape only in the sense that it terminates at the same null — which is why the usual contract says "value not present".',
    commonMistake:
      'Inserting at the position a balanced tree would give (rotating or rebalancing), or rebinding the root inside the loop and losing the parent reference.',
    whyWrong:
      'A plain BST has no balance rule to apply; rotating during insert is what makes it an AVL or red-black tree, and doing it half-way produces a structure that is neither of those and no longer provably ordered. Rebinding the root without a parent pointer is the mechanical bug: you now hold the node you want to attach to but not the link that reaches it, so the standard fix is the null-root guard plus a parent-and-side pair — or the recursive version, which pays stack frames to avoid that bookkeeping.',
    followUps: [
      'Insert 1 through 7 in ascending order into an empty BST. Draw it and give the lookup cost for 1.',
      'Rewrite insert iteratively with O(1) space. What two pieces of state replace the recursive return value?',
      'The value is already present. Give three different defensible contracts and say which one you would ship.',
      'What minimal extra information per node would let you detect that the tree has become a chain?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      serializeLevel + '\n' +
      '\n' +
      'function insertIntoBst(root, value) {\n' +
      '  const fresh = { val: value, left: null, right: null };\n' +
      '  if (root === null) return fresh;\n' +
      '  let current = root;\n' +
      '  while (true) {\n' +
      '    if (value < current.val) {\n' +
      '      if (current.left === null) {\n' +
      '        current.left = fresh;\n' +
      '        return root;\n' +
      '      }\n' +
      '      current = current.left;\n' +
      '    } else if (value > current.val) {\n' +
      '      if (current.right === null) {\n' +
      '        current.right = fresh;\n' +
      '        return root;\n' +
      '      }\n' +
      '      current = current.right;\n' +
      '    } else {\n' +
      '      return root;\n' +
      '    }\n' +
      '  }\n' +
      '}\n' +
      '\n' +
      'function insertRecursive(node, value) {\n' +
      '  if (node === null) return { val: value, left: null, right: null };\n' +
      '  if (value < node.val) node.left = insertRecursive(node.left, value);\n' +
      '  else if (value > node.val) node.right = insertRecursive(node.right, value);\n' +
      '  return node;\n' +
      '}\n' +
      '\n' +
      inorderOf,
    modify:
      'Insert a whole sorted array. What is the shape you get, and how would you insert the same values so the resulting tree has minimum height?',
  },
  {
    step: 14,
    name: 'Delete a Node in BST',
    difficulty: 'Medium',
    topicSlug: 'binary-trees',
    stem: 'Remove a value from a BST keeping the ordering promise, in at most two descents.',
    brief:
      'Input: a BST as level-order cells and a value that may be absent. Output: the new root. Leaf and one-child cases splice directly; the two-child case must not orphan either subtree.',
    concepts: ['dsa-bst-delete-three-cases', 'dsa-bst-minmax-is-a-spine', 'dsa-bst-ordering-promise', 'dsa-bst-inorder-is-the-sorted-order'],
    shortAnswer:
      'Find the node, then: no children — detach; one child — replace it with that child; two children — copy the in-order successor (leftmost node of the right subtree) into the node and delete that successor from the right subtree.',
    idealAnswer:
      'The two cases that splice are easy because the missing node has only one subtree to re-attach and any parent link still respects the bounds. The two-child case is the whole question: the node has to be replaced by a value that is greater than everything in the left subtree and less than everything else in the right subtree, and exactly two candidates qualify — the in-order predecessor (rightmost of the left subtree) or the in-order successor (leftmost of the right subtree). Copying the value and then deleting the successor is the standard reduction, and it terminates because the successor has no left child by definition, so the recursive delete lands in the leaf-or-one-child case after at most one level. Cost is O(h): one descent to find the node plus one spine walk into the right subtree plus one short descent back out.',
    walkthrough:
      'Delete 5 from the tree 5 / 3,7 / 2,4,6,8. 5 has two children, so go right once to 7 and then as far left as possible: the left child of 7 is 6 and 6 has no left child, so 6 is the successor. Copy 6 into the root and delete 6 from the right subtree; that second delete finds a node with no children and detaches it. The root is now 6 / 3,7 / 2,4,null,8 and the in-order reading is 2,3,4,6,7,8 — 5 is gone, and the promise still holds at every ancestor because the value that replaced 5 was the smallest value that already exceeded everything under 5. Now delete 3 from that same tree instead: 3 has two children (2 and 4), its successor is 4, 4 is a leaf, so the node that held 3 now holds 4 and the leaf vanishes — in-order reads 2,4,5,6,7,8. The case that trips people out is a successor that is not an immediate leaf: the borrow leaves the successor slot empty and the recursive delete lands in the one-child branch, which is why the code returns node.right when node.left is null rather than trying to splice by hand.',
    commonMistake:
      'Deleting the whole subtree, or replacing a two-child node with an arbitrary node such as the root of the right subtree without deleting that node afterwards.',
    whyWrong:
      'Splicing out a subtree loses values that were correctly stored there, and the question asks for one removal. Copying the right child up without removing the original is the subtler bug: on the tree above, writing 7 into the root while the old 7 still hangs below with 6 as its left child puts 6 inside the right subtree of a node holding 7, and 6 < 7 breaks exactly the promise the operation was supposed to preserve. The successor is not a convenience — it is the one nearby value with no left subtree of its own, so borrowing it and then deleting it leaves nothing that can invert.',
    followUps: [
      'Replace with the in-order predecessor instead. Which spine do you walk, and what does its right-child property become?',
      'Why does the recursive delete of the successor never recurse more than twice? Give the invariant.',
      'The value is absent. What does your function return, and how do you prove you did not restructure anything?',
      'A node stores subtree counts for rank queries. Which cases of delete have to update it, and on the way back from where?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      serializeLevel + '\n' +
      '\n' +
      inorderOf + '\n' +
      '\n' +
      'function bstMinNode(node) {\n' +
      '  let current = node;\n' +
      '  while (current.left !== null) current = current.left;\n' +
      '  return current;\n' +
      '}\n' +
      '\n' +
      'function deleteFromBst(root, value) {\n' +
      '  if (root === null) return null;\n' +
      '  if (value < root.val) {\n' +
      '    root.left = deleteFromBst(root.left, value);\n' +
      '    return root;\n' +
      '  }\n' +
      '  if (value > root.val) {\n' +
      '    root.right = deleteFromBst(root.right, value);\n' +
      '    return root;\n' +
      '  }\n' +
      '  if (root.left === null) return root.right;\n' +
      '  if (root.right === null) return root.left;\n' +
      '  const successor = bstMinNode(root.right);\n' +
      '  root.val = successor.val;\n' +
      '  root.right = deleteFromBst(root.right, successor.val);\n' +
      '  return root;\n' +
      '}',
    modify:
      'Delete a range of values instead of one. Which case disappears, and why does the answer stop being a splice?',
  },
  {
    step: 14,
    name: 'Find K-th smallest/largest element in BST',
    difficulty: 'Medium',
    topicSlug: 'binary-trees',
    stem: 'Return the k-th smallest and k-th largest value of a BST in O(h + k) without materialising the sorted list.',
    brief:
      'Input: a BST as level-order cells and a 1-based k that may exceed the node count. Output: the value, or null. The in-order walk must be iterative and must stop the moment k values have been emitted.',
    concepts: ['dsa-bst-k-th-by-stopped-walk', 'dsa-bst-inorder-is-the-sorted-order', 'dsa-bst-one-branch-descent', 'dsa-three-orders-one-walk'],
    shortAnswer:
      'Iterate in-order with an explicit stack, counting emitters, and return when the counter reaches k. For the k-th largest, run the same walk mirrored — right, node, left.',
    idealAnswer:
      'The in-order walk of a BST is the sorted sequence, so rank is position in that walk and the only work is to walk lazily. A recursive in-order cannot stop cheaply — it has to unwind the whole call stack — and a full Morris or array version costs O(n) whether k is 1 or n. The explicit stack version visits exactly h nodes to get the first emitter and then one node per further emitter, with a stack that never exceeds h + 1 entries, which is the honest O(h + k). The mirrored walk is not a separate algorithm: swap left for right in the descend-and-push step and the same code emits decreasing values.',
    walkthrough:
      'Tree 5 / 3,6 / 2,4 / 1. Push the left spine from 5: 5, 3, 2, 1, then pop 1 — that is the 1st smallest. Pop 2 — 2nd. Pop 3, push nothing on its left, emit 3 as 3rd, then descend its right child 4 and emit 4 as 4th. Pop 5 (5th), pop 6 (6th). Ask for k = 3 and the walk stops at the third pop having touched six nodes, while a sort-based answer touches all seven and builds an array first. Now run the mirrored version for k = 2 largest: descend right spines, emit 6 then 5 — the 2nd largest is 5. For k = 10 on a seven-node tree the stack empties after seven emissions and the function returns null rather than throwing, which is the boundary every interviewer asks about.',
    commonMistake:
      'Collecting the whole in-order array and indexing it, or recursing and using a shared counter that keeps walking the entire tree after the answer is found.',
    whyWrong:
      'The array version is O(n) time and O(n) space regardless of k, so asking for the 1st smallest costs the same as asking for the last — on a tree of ten million nodes that is the difference between an answer and an outage. The recursive counter version is subtler: it returns the right value but still visits everything, so the complexity claim you make out loud is false. Early termination needs either a thrown sentinel to unwind the stack or an explicit stack you can stop popping, and the explicit stack is the version that also gives you the mirrored walk for free.',
    followUps: [
      'Make the iterator reusable so k-th smallest queries of the same tree arrive in any order. What state has to persist?',
      'Every node stores its subtree size. Give the descent that answers rank in O(h) and say what it costs an update.',
      'k-th largest with the mirrored walk — write the one line that changes and prove it emits decreasing values.',
      'What is the maximum stack depth during your walk on a tree of height h, and why is it h plus 1 rather than n?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      'function kthSmallest(root, k) {\n' +
      '  const stack = [];\n' +
      '  let current = root;\n' +
      '  let seen = 0;\n' +
      '  while (current !== null || stack.length > 0) {\n' +
      '    while (current !== null) {\n' +
      '      stack.push(current);\n' +
      '      current = current.left;\n' +
      '    }\n' +
      '    current = stack.pop();\n' +
      '    seen += 1;\n' +
      '    if (seen === k) return current.val;\n' +
      '    current = current.right;\n' +
      '  }\n' +
      '  return null;\n' +
      '}\n' +
      '\n' +
      'function kthLargest(root, k) {\n' +
      '  const stack = [];\n' +
      '  let current = root;\n' +
      '  let seen = 0;\n' +
      '  while (current !== null || stack.length > 0) {\n' +
      '    while (current !== null) {\n' +
      '      stack.push(current);\n' +
      '      current = current.right;\n' +
      '    }\n' +
      '    current = stack.pop();\n' +
      '    seen += 1;\n' +
      '    if (seen === k) return current.val;\n' +
      '    current = current.left;\n' +
      '  }\n' +
      '  return null;\n' +
      '}\n' +
      '\n' +
      inorderOf,
    modify:
      'Answer the k-th smallest after each of a stream of insertions. What do you keep per node so that a query never walks the tree at all?',
  },
];

export const expects: Record<string, string> = {
  'Introduction to Binary Search Tree':
    '(() => { const r = buildBst([5,3,8,1,4,7,9]); const walk = inorderOf(r); return walk.join(",") === "1,3,4,5,7,8,9" && isStrictlyIncreasing(walk) === true && bstHas(r, 7) === true && bstHas(r, 6) === false && inorderOf(buildBst([5,5,5])).join(",") === "5" && serializeLevel(buildBst([3,1,2])) === "3 1 null null 2"; })()',
  'Search in a Binary Search Tree':
    '(() => { const r = buildTree([4,2,7,1,3]); const hitCounter = { visits: 0 }; const hit = searchBst(r, 3, hitCounter); const missCounter = { visits: 0 }; const miss = searchBst(r, 5, missCounter); const subtree = searchBst(r, 2); return hit !== null && hit.val === 3 && hitCounter.visits === 3 && miss === null && missCounter.visits === 2 && subtree !== null && subtree.left.val === 1 && serializeLevel(subtree) === "2 1 3" && searchBst(r, 9) === null && searchBst(buildTree([null]), 1) === null; })()',
  'Find Min/Max in BST':
    '(() => { const r = buildTree([8,3,10,1,6,null,14,null,4,7,13]); const chain = buildTree([1,null,2,null,3]); const empty = buildTree([null]); return bstMin(r).val === 1 && bstMax(r).val === 14 && bstMin(chain).val === 1 && bstMin(chain).steps === 1 && bstMax(chain).val === 3 && bstMax(chain).steps === 3 && bstMin(empty).val === null && bstMax(empty).steps === 0; })()',
  'Ceil in a Binary Search Tree':
    '(() => { const r = buildTree([8,4,12,2,6,10,14]); return ceilInBst(r, 7) === 8 && ceilInBst(r, 6) === 6 && ceilInBst(r, 13) === 14 && ceilInBst(r, 15) === null && ceilInBst(r, 1) === 2 && ceilNode(r, 7).val === 8 && ceilNode(r, 15) === null && ceilInBst(buildTree([1,null,2,null,3]), 0) === 1; })()',
  'Floor in a Binary Search Tree':
    '(() => { const r = buildTree([8,4,12,2,6,10,14]); return floorInBst(r, 7) === 6 && floorInBst(r, 8) === 8 && floorInBst(r, 100) === 14 && floorInBst(r, 1) === null && floorInBst(r, 2) === 2 && floorInBst(buildTree([1,null,2,null,3]), 4) === 3; })()',
  'Insert a given Node in BST':
    '(() => { const r = buildTree([5,3,8,1,4,null,9]); const before = serializeLevel(r); const a = insertIntoBst(r, 7); const b = insertIntoBst(buildTree([null]), 42); const c = insertIntoBst(buildTree([5,3,8]), 5); return serializeLevel(a) === "5 3 8 1 4 7 9" && inorderOf(a).join(",") === "1,3,4,5,7,8,9" && before === "5 3 8 1 4 null 9" && serializeLevel(b) === "42" && serializeLevel(c) === "5 3 8" && serializeLevel(insertRecursive(buildTree([5,3,8]), 4)) === "5 3 8 null 4"; })()',
  'Delete a Node in BST':
    '(() => { const a = deleteFromBst(buildTree([5,3,7,2,4,6,8]), 5); const b = deleteFromBst(buildTree([2,1,3]), 2); const c = deleteFromBst(buildTree([5,3,6]), 9); const d = deleteFromBst(buildTree([1]), 1); const e = deleteFromBst(buildTree([5,3,7,2,4,6,8]), 3); return inorderOf(a).join(",") === "2,3,4,6,7,8" && serializeLevel(a) === "6 3 7 2 4 null 8" && serializeLevel(b) === "3 1" && serializeLevel(c) === "5 3 6" && d === null && inorderOf(e).join(",") === "2,4,5,6,7,8"; })()',
  'Find K-th smallest/largest element in BST':
    '(() => { const r = buildTree([5,3,6,2,4,null,null,1]); const sorted = inorderOf(r).join(","); return sorted === "1,2,3,4,5,6" && kthSmallest(r, 1) === 1 && kthSmallest(r, 3) === 3 && kthSmallest(r, 7) === null && kthLargest(r, 1) === 6 && kthLargest(r, 2) === 5 && kthLargest(r, 6) === 1 && kthLargest(r, 7) === null && kthSmallest(buildTree([null]), 1) === null; })()',
};
