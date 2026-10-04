import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';
import { buildTree, heightOf, inorderOf, nodeCount, preorderOf, serializeLevel } from './tree-helpers';

/**
 * Step 14b — the practice half of the BST step: the questions that stop asking for one descent and
 * start asking for a walk with state, because ranking, validating, recovering and finding the
 * biggest ordered subtree all need something remembered across the in-order sequence.
 */

export const concepts: Record<string, ConceptSpec> = {
  'dsa-bst-validation-needs-carried-bounds': {
    slug: 'dsa-bst-validation-needs-carried-bounds',
    name: 'Validating a BST means carrying the ancestor window down, not comparing pairs',
    detail:
      'A node must lie strictly inside the range its path implies: going left raises the upper bound to the ancestor value, going right lowers the lower bound.',
    terms: ['carried bounds', 'window', 'strictly inside', 'ancestor range', 'min max range'],
    weight: 4,
  },
  'dsa-bst-subtree-report-fold': {
    slug: 'dsa-bst-subtree-report-fold',
    name: 'A post-order fold can hand the parent a report instead of a yes or no',
    detail:
      'Returning size, min, max and validity from each child lets one walk answer the biggest-ordered-subtree question; a broken subtree poisons every ancestor above it.',
    terms: ['post-order fold', 'return a tuple', 'size min max valid', 'one pass', 'bottom-up'],
    weight: 4,
  },
  'dsa-bst-preorder-rebuild-monotonic-stack': {
    slug: 'dsa-bst-preorder-rebuild-monotonic-stack',
    name: 'A BST preorder rebuilds by popping the stack until the bound is larger',
    detail:
      'Preorder fixes the root, and every value is attached either as the left child of the nearest open ancestor above it or as the right child of the last ancestor it outranked.',
    terms: ['monotonic stack', 'upper bound', 'left spine open', 'pop until bigger', 'preorder rebuild'],
    weight: 3,
  },
  'dsa-bst-iterator-left-spine-stack': {
    slug: 'dsa-bst-iterator-left-spine-stack',
    name: 'A BST iterator stores the left spine, not the whole tree',
    detail:
      'Pushing left children onto a stack gives the smallest unseen node at the top; after emitting a node, its right subtree is descended the same way.',
    terms: ['left spine', 'explicit stack', 'lazy walk', 'hasNext next', 'amortised O(1)'],
    weight: 3,
  },
  'dsa-bst-successor-last-left-turn': {
    slug: 'dsa-bst-successor-last-left-turn',
    name: 'The successor of a value is the last node you turned left at',
    detail:
      'Strict successor and predecessor are ceil and floor with the equality case removed, so the candidate is recorded on the same turns that discard a subtree.',
    terms: ['last left turn', 'strictly greater', 'candidate', 'brackets the target', 'mirror case'],
    weight: 3,
  },
  'dsa-bst-recover-two-inversions': {
    slug: 'dsa-bst-recover-two-inversions',
    name: 'Two swapped nodes show up as one or two drops in the sorted walk',
    detail:
      'A drop during the in-order walk marks a violation: two drops mean the nodes are far apart, one drop means they were adjacent and both ends are the pair.',
    terms: ['inorder inversion', 'first drop', 'previous greater than current', 'adjacent swap', 'two anomalies'],
    weight: 4,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 14,
    name: 'Check if a tree is a BST or BT',
    difficulty: 'Medium',
    topicSlug: 'binary-trees',
    stem: 'Decide whether a binary tree is a BST, and show the input where comparing each node with its children says yes.',
    brief:
      'Input: a binary tree as level-order cells, not assumed ordered, with duplicates possible. Output: true only when every subtree satisfies left < node < right strictly. State the input your cheap version gets wrong.',
    concepts: [
      'dsa-bst-validation-needs-carried-bounds',
      'dsa-bst-ordering-promise',
      'dsa-bst-local-check-passes-a-broken-tree',
      'dsa-recursive-decomposition',
    ],
    shortAnswer:
      'Walk down carrying the open interval the path implies: going left tightens the upper bound to the ancestor value, going right tightens the lower bound. A node outside its interval settles it.',
    idealAnswer:
      'The promise is about subtrees, so the check has to talk about subtrees: a node deep inside the right subtree of 5 must exceed 5, and nothing at that node tells it so. Carrying bounds fixes that with two extra parameters and no second pass, costing O(n) time and O(h) stack. The naive parent-child comparison is the failure mode worth demonstrating rather than describing — it returns true for a tree where every local edge is legal and the shape is not. Duplicates decide the contract: strict inequality on both sides is the definition most interviewers mean, and a tree holding the same value twice is not a BST unless the structure stores a count instead.',
    walkthrough:
      'Take 5 with no left child and right child 7, and 7 holding a left child 4. Locally: 7 is greater than 5, so the right edge is legal; 4 is less than 7, so the left edge under 7 is legal. The local check says a BST. Now carry bounds from the root: the interval is open at 5; descending right to 7 rewrites the lower bound to 5, so 4 must lie inside (5, 7) and it does not — 4 <= 5. One parameter does the whole job. The second counterexample is subtler: 10 with 5 on the left and 15 on the right whose left child is 6. Every local edge holds, and 6 sits in the right subtree of 10 where it must exceed 10. The empty tree returns true because there is nothing to violate; a single node returns true; and two equal values fail the strict test on both sides.',
    commonMistake:
      'Checking only that the left child is smaller and the right child is larger, or using non-strict comparisons so that duplicates sneak through.',
    whyWrong:
      'The pairwise check is the local reading of a global promise, and the two differ on real inputs — the tree 5 / null,7 / 4 passes it while holding 4 inside the right subtree of 5, and 10 / 5,15 / null,null,6,20 passes it while holding 6 under the same wrong bound. Non-strict comparisons are the other half-point: a tree of two nodes both holding 2 is called valid, and then the in-order walk is not strictly increasing, which breaks every rank question built on it. A third variant, validating by comparing the in-order array with its sorted copy, is correct but costs O(n) space and hides the invariant instead of stating it.',
    followUps: [
      'Give the exact node where your bound tightens, and the value the bound takes. Why is it the ancestor rather than the parent?',
      'Rewrite the check bottom-up without passing bounds, returning min, max and validity per subtree. What does that version buy you that the bounds version does not?',
      'Duplicates are allowed on the right side only. Which comparisons change, and what does the in-order walk now produce?',
      'A concurrent writer is mutating the tree while you validate it. Which of your two versions is easier to argue about, and why?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      'function isBstLocalCheck(root) {\n' +
      '  if (root === null) return true;\n' +
      '  if (root.left !== null && root.left.val >= root.val) return false;\n' +
      '  if (root.right !== null && root.right.val <= root.val) return false;\n' +
      '  return isBstLocalCheck(root.left) && isBstLocalCheck(root.right);\n' +
      '}\n' +
      '\n' +
      'function isBst(root) {\n' +
      '  return insideBounds(root, -Infinity, Infinity);\n' +
      '}\n' +
      '\n' +
      'function insideBounds(node, low, high) {\n' +
      '  if (node === null) return true;\n' +
      '  if (node.val <= low || node.val >= high) return false;\n' +
      '  return insideBounds(node.left, low, node.val) && insideBounds(node.right, node.val, high);\n' +
      '}',
    modify:
      'The tree may hold equal values on purpose and still count as ordered. Which bound becomes inclusive, and what has to be true about where the duplicates sit?',
  },
  {
    step: 14,
    name: 'LCA in Binary Search Tree',
    difficulty: 'Medium',
    topicSlug: 'binary-trees',
    stem: 'Find the lowest common ancestor of two values in a BST in one descent, and say what happens when one is absent.',
    brief:
      'Input: a BST as level-order cells and two node values that are promised present. Output: the ancestor node, plus how many nodes the walk visited. No recursion into both subtrees.',
    concepts: [
      'dsa-bst-lca-is-the-first-split',
      'dsa-bst-one-branch-descent',
      'dsa-lca-is-where-two-routes-diverge',
      'dsa-guard-the-lca-against-a-half-present-pair',
    ],
    shortAnswer:
      'Descend while both values lie on the same side of the node; the first node that does not send them the same way is the answer, because below it the two values are in different subtrees.',
    idealAnswer:
      'On a general binary tree the LCA needs a post-order that asks both children, because nothing rules a subtree out. On a BST the ordered range rules one child out at every node, so the same answer arrives from a single root-to-node path: while both targets are below the node value, go left; while both are above, go right; otherwise stop. The stopping node is where the two root-to-node routes diverge, and it is exactly the general definition satisfied without ever searching for the routes. Cost is O(h) time and O(1) space, against O(n) for the general walk. The contract is the part people skip: the descent never proves either value exists, so a missing partner makes it return the ancestor that the present value alone implies.',
    walkthrough:
      'On 6 / 2,8 / 0,4,7,9 / 3,5, ask for 2 and 8. At 6, 2 is left and 8 is right, so the walk stops having visited one node, and 6 is the answer. Ask for 2 and 4: both below 6, go left (2 visits), and now 2 is not below 2 while 4 is above it, so the walk stops standing on 2 itself — a node is its own ancestor when it holds one of the pair. Ask for 3 and 5: 6 left to 2, 2 right to 4, and 4 splits them, three visits on a tree of height three. Now ask for 2 and 99 where 99 is absent: at 6 the pair already points in different directions, so the function returns 6 and never learns that 99 is not in the tree. That is why the BST version is unsafe as a general API and the guarded version from the tree step is worth citing by name.',
    commonMistake:
      'Reusing the general binary-tree LCA that recurses into both children, or claiming the descent also verifies that both values are present.',
    whyWrong:
      'The general walk is correct but abandons the ordering promise: it visits every node under the ancestor and costs O(n) where O(h) was available, and it cannot report how deep the answer sat. The absence claim is worse because it is silently false — searching for 2 and 99 returns the root-side node where the paths would have split, and callers who then compare ids against their own records get a confident wrong answer. Either promise presence in the signature or pay two searches to verify it.',
    followUps: [
      'Both values are promised present. Prove the first node where they split is the lowest common ancestor, not merely a common one.',
      'One value is absent. What does your descent return, and what two extra walks would make it return nothing instead?',
      'Compare your visit count with the general tree walk on the same input. Where does the difference come from, exactly?',
      'The queries arrive as pairs from a stream and the tree is wide. What per-node field would let you answer without descending at all?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      heightOf + '\n' +
      '\n' +
      'function bstLca(root, a, b, counter) {\n' +
      '  const seen = counter ?? { visits: 0 };\n' +
      '  let current = root;\n' +
      '  while (current !== null) {\n' +
      '    seen.visits += 1;\n' +
      '    if (a < current.val && b < current.val) {\n' +
      '      current = current.left;\n' +
      '      continue;\n' +
      '    }\n' +
      '    if (a > current.val && b > current.val) {\n' +
      '      current = current.right;\n' +
      '      continue;\n' +
      '    }\n' +
      '    return current;\n' +
      '  }\n' +
      '  return null;\n' +
      '}',
    modify:
      'Answer the LCA of k values instead of two. Which side-tests stop being enough, and what does the walk return when the list spans three subtrees?',
  },
  {
    step: 14,
    name: 'Construct a BST from a preorder traversal',
    difficulty: 'Medium',
    topicSlug: 'binary-trees',
    stem: 'Rebuild the exact BST that produced a preorder list, in one pass without re-sorting or searching.',
    brief:
      'Input: an array of distinct integers that is the pre-order walk of some BST. Output: the tree, whose pre-order walk must return the array unchanged. A sorted input must produce the chain, not a balanced tree.',
    concepts: [
      'dsa-bst-preorder-rebuild-monotonic-stack',
      'dsa-preorder-fixes-the-root-inorder-fixes-the-cut',
      'dsa-bst-insert-lands-on-a-leaf',
      'dsa-stack-order-decides-visit-order',
    ],
    shortAnswer:
      'Keep a stack of nodes whose left spine is still open. For each value, pop while the stack top is smaller; the popped node takes it as a right child, otherwise the open top takes it as a left child.',
    idealAnswer:
      'Pre-order of a BST has a rigid meaning: the first value is the root, and the walk then finishes a whole left subtree before touching the right. So a value smaller than the node we last stood on must belong deeper in that left spine, while a value larger than an ancestor means the ancestor finished its left subtree and this value is its right child. The monotonic stack is that argument written down — it holds the chain of nodes still waiting for their left subtree, and popping past a value is the moment a left subtree closes. Cost O(n) with an amortised O(1) per element because every node is pushed once and popped once. The alternative of inserting each value with the ordinary leaf descent is also correct and easier to argue, but it is O(n * h) and becomes quadratic on the sorted input.',
    walkthrough:
      'Walk 8, 5, 1, 7, 10, 12. Stack: [8]. Value 5: the top 8 is not smaller, so nothing pops and 5 becomes the left child of 8; stack [8,5]. Value 1: same, left child of 5; stack [8,5,1]. Value 7: pop 1 (1 < 7), pop 5 (5 < 7), stop at 8 because 8 > 7; the last popped node was 5, so 7 becomes the right child of 5; stack [8,7]. Value 10: pop 7, pop 8 — the last popped was the root, so 10 is the right child of 8; stack [10]. Value 12: pop 10, so 12 hangs right of 10; stack [12]. The rebuilt tree reads 8 / 5,10 / 1,7,null,12 and its pre-order walk is the input exactly. Feed the same list to the naive leaf-descent version and you get the identical tree — which is the point: the list determines the shape uniquely, because no rotations are involved and every attachment is forced by the comparisons.',
    commonMistake:
      'Sorting the list and building a balanced tree from it, or inserting with the leaf descent and then claiming the answer is O(n).',
    whyWrong:
      'Sorting destroys the input: the pre-order list of a BST is not a set of values, it is the shape written as a sequence, and 8,5,1,7,10,12 balanced into a tree whose pre-order walk is a different list. The leaf-descent version is genuinely correct, and the mistake is the complexity claim — it descends from the root for every value, so on the already-sorted input 1,2,3,...,n the cost is 1+2+...+n which is quadratic, while the stack version still does one push and one pop per element.',
    followUps: [
      'Why does the stack hold a decreasing chain of values while the input is descending, and what does it become on a sorted list?',
      'Give the version that recurses with an upper bound and a shared index. Where is the bound checked, and why is Infinity the correct start?',
      'Could the same list be the pre-order walk of two different BSTs? Argue it from the attachment rule.',
      'Now the list is a post-order walk. Which end of the array plays the role the root plays here?',
    ],
    solution:
      serializeLevel + '\n' +
      '\n' +
      preorderOf + '\n' +
      '\n' +
      'function bstFromPreorder(preorder) {\n' +
      '  if (preorder.length === 0) return null;\n' +
      '  const root = { val: preorder[0], left: null, right: null };\n' +
      '  const stack = [root];\n' +
      '  for (let i = 1; i < preorder.length; i += 1) {\n' +
      '    const node = { val: preorder[i], left: null, right: null };\n' +
      '    let parent = null;\n' +
      '    while (stack.length > 0 && stack[stack.length - 1].val < node.val) {\n' +
      '      parent = stack.pop();\n' +
      '    }\n' +
      '    if (parent === null) stack[stack.length - 1].left = node;\n' +
      '    else parent.right = node;\n' +
      '    stack.push(node);\n' +
      '  }\n' +
      '  return root;\n' +
      '}\n' +
      '\n' +
      'function bstFromPreorderBound(preorder) {\n' +
      '  let index = 0;\n' +
      '  const build = (bound) => {\n' +
      '    if (index === preorder.length || preorder[index] > bound) return null;\n' +
      '    const node = { val: preorder[index], left: null, right: null };\n' +
      '    index += 1;\n' +
      '    node.left = build(node.val);\n' +
      '    node.right = build(bound);\n' +
      '    return node;\n' +
      '  };\n' +
      '  return build(Infinity);\n' +
      '}',
    modify:
      'The list may be the pre-order walk of a BST or of a tree where equal values went right. Where does the rebuild become ambiguous, and what extra token would fix it?',
  },
  {
    step: 14,
    name: 'Inorder Successor/Predecessor in BST',
    difficulty: 'Medium',
    topicSlug: 'binary-trees',
    stem: 'Return the value immediately above and immediately below a target in a BST, whether or not the target is stored.',
    brief:
      'Input: a BST as level-order cells and a target value. Output: successor = the least stored value strictly greater than the target, predecessor = the greatest stored value strictly less, null when either end is open. One descent each, no traversal.',
    concepts: [
      'dsa-bst-successor-last-left-turn',
      'dsa-bst-ceil-floor-candidate-tracking',
      'dsa-bst-one-branch-descent',
      'dsa-bst-inorder-is-the-sorted-order',
    ],
    shortAnswer:
      'Same descent as ceil and floor with the equality case removed: a node at or below the target is discarded and sends you right, a node above it is recorded as the candidate and you go left to find a smaller one.',
    idealAnswer:
      'Successor and predecessor are the two boundaries of the sorted order at the target, so they are ceil and floor with the equality test dropped: recording happens on nodes strictly past the target rather than at or past it. That single comparison change is the whole difference between the four functions, which is why the pair is worth writing from memory rather than memorising. The geometric reading is the one interviewers listen for: standing on the target node, the successor is the leftmost node of its right subtree, and when there is no right subtree it is the nearest ancestor whose left subtree contains the target — the last place the walk turned left. Cost O(h), O(1) space, and the walk works the same whether the target is present or not.',
    walkthrough:
      'On 5 / 3,8 / 1,4,7,9 the stored order is 1,3,4,5,7,8,9. Ask for the successor of 4: at 5 the walk records 5 and goes left, at 3 the target is larger so 3 is discarded and the walk goes right, at 4 the target equals the node value — and because the successor is strict, 4 is discarded and the walk goes right into a null child. The recorded candidate is 5, which is correct. Ask for the successor of 6: 5 is discarded (go right), 8 is recorded (go left), 7 is recorded (go left), null, answer 7 — a target that is not in the tree still has both boundaries. Ask for the successor of 9: 5 discarded, 8 discarded, 9 discarded, right child null, nothing ever recorded, so null. The predecessor of 1 is null by the same argument on the mirror side, and the pair for 6 brackets it exactly: 5 < 6 < 7.',
    commonMistake:
      'Treating the successor as "the next node in the walk you already did", or returning the target itself when it is stored in the tree.',
    whyWrong:
      'The first answer is a traversal, not a descent: it costs O(n) or needs a parent pointer plus an upward climb, and it hides the fact that the boundary is decided by comparisons on one path. The second is the off-by-one that makes the function a ceil instead of a successor — with a strict contract, successor(4) is 5 even though 4 is stored, and returning 4 breaks every caller that uses the pair to slice a range. Mixing the two contracts inside one codebase is the real damage: a half-open range built from a ceil and a predecessor is one element too wide.',
    followUps: [
      'Say which of the four functions change if the contract becomes at-or-after instead of strictly after. How many?',
      'Give the version that starts from the node and uses parent pointers. Why is the climb bounded by the height, and what is the worst shape?',
      'Both boundaries for the same target in one descent. What state do you carry, and does the visit count change?',
      'Delete a node with two children. Which of these two answers does the operation borrow, and why is either one legal?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      'function bstSuccessor(root, target) {\n' +
      '  let candidate = null;\n' +
      '  let current = root;\n' +
      '  while (current !== null) {\n' +
      '    if (current.val <= target) {\n' +
      '      current = current.right;\n' +
      '    } else {\n' +
      '      candidate = current.val;\n' +
      '      current = current.left;\n' +
      '    }\n' +
      '  }\n' +
      '  return candidate;\n' +
      '}\n' +
      '\n' +
      'function bstPredecessor(root, target) {\n' +
      '  let candidate = null;\n' +
      '  let current = root;\n' +
      '  while (current !== null) {\n' +
      '    if (current.val >= target) {\n' +
      '      current = current.left;\n' +
      '    } else {\n' +
      '      candidate = current.val;\n' +
      '      current = current.right;\n' +
      '    }\n' +
      '  }\n' +
      '  return candidate;\n' +
      '}',
    modify:
      'Return the nodes rather than the values, and let the caller delete one of them. Which of the two walks does the delete operation now depend on?',
  },
  {
    step: 14,
    name: 'Binary Search Tree Iterator',
    difficulty: 'Medium',
    topicSlug: 'binary-trees',
    stem: 'Build a next/hasNext iterator over a BST that emits values in sorted order and never holds more than one spine.',
    brief:
      'Input: a BST as level-order cells. Output: an iterator that yields values in increasing order, with next() amortised O(1) and memory O(h). Report the peak stack depth and the total push and pop counts.',
    concepts: [
      'dsa-bst-iterator-left-spine-stack',
      'dsa-three-orders-one-walk',
      'dsa-amortised-pop-accounting',
      'dsa-bst-inorder-is-the-sorted-order',
    ],
    shortAnswer:
      'Push the left spine onto a stack, pop to emit, then descend the emitted node right and push its left spine. Every node is pushed once and popped once, so a next() costs O(1) amortised and O(h) stack.',
    idealAnswer:
      'The iterator is the in-order walk cut into resumable pieces. The stack is the call stack of the recursive walk, made explicit so the recursion can stop between two emissions instead of unwinding — and it holds exactly the nodes with work pending: a chain of ancestors whose left subtree is finished and whose right subtree is not yet started. That chain is at most h deep, which is the memory claim. Amortisation is the other claim: one node pushed at construction and one emission each is O(h) for the first next() and O(1) afterwards, because the total work over the whole walk is 2n stack operations. Collecting into an array first would make every next() O(1) worst case and cost O(n) memory, which is the trade the question is actually asking about.',
    walkthrough:
      'On 8 / 4,12 / 2,6,10,14, construction pushes 8, 4, 2 and stops — three frames, peak depth 3, and the smallest node is on top. next() pops 2 and descends 2.right, which is null, so nothing is pushed; the stack is now [8,4] with 4 on top. next() pops 4 and descends 4.right = 6, pushing 6. next() pops 6 and descends null. next() pops 8 and descends 8.right = 12, pushing 12 then 10. So the emission order is 2, 4, 6, 8, 10, 12, 14, exactly the sorted order, and the deepest the stack ever got is 3 = height plus one. Count the bookkeeping: seven nodes pushed and seven popped for seven emissions — no node is touched a third time, which is the amortised argument stated as arithmetic rather than as a claim.',
    commonMistake:
      'Eagerly materialising the in-order list and indexing it, or pushing both children of every node onto the stack.',
    whyWrong:
      'The array version answers hasNext in O(1) and next in O(1), so it looks better until the tree has a hundred million nodes and only the first ten are ever consumed — it is O(n) memory where O(h) was promised. Pushing both children is a plain DFS and emits in the wrong order: with a stack the visit order is decided by what you push last, and the in-order property specifically requires descending left first and only touching a node when its left subtree is finished. A stack of both children also grows to O(n) on a bushy tree, breaking the memory claim as well as the order.',
    followUps: [
      'Add a previous() that walks backwards. What does the mirror class store, and can one object do both directions?',
      'Two iterators over the same tree meet in the middle. What pair of walks does that give you, and where does it show up in the two-sum question?',
      'Why exactly is the peak stack height h plus 1 rather than 2h? Point at the nodes sitting on it.',
      'The tree is being inserted into while the iterator is alive. Which emissions are still guaranteed and which are not?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      inorderOf + '\n' +
      '\n' +
      nodeCount + '\n' +
      '\n' +
      'class BstIterator {\n' +
      '  constructor(root) {\n' +
      '    this.stack = [];\n' +
      '    this.pushes = 0;\n' +
      '    this.pops = 0;\n' +
      '    this.peak = 0;\n' +
      '    this.descend(root);\n' +
      '  }\n' +
      '\n' +
      '  descend(node) {\n' +
      '    let current = node;\n' +
      '    while (current !== null) {\n' +
      '      this.stack.push(current);\n' +
      '      this.pushes += 1;\n' +
      '      if (this.stack.length > this.peak) this.peak = this.stack.length;\n' +
      '      current = current.left;\n' +
      '    }\n' +
      '  }\n' +
      '\n' +
      '  hasNext() {\n' +
      '    return this.stack.length > 0;\n' +
      '  }\n' +
      '\n' +
      '  next() {\n' +
      '    if (this.stack.length === 0) return null;\n' +
      '    const node = this.stack.pop();\n' +
      '    this.pops += 1;\n' +
      '    this.descend(node.right);\n' +
      '    return node.val;\n' +
      '  }\n' +
      '}',
    modify:
      'Make the iterator emit values in decreasing order. Which two lines swap, and what does the peak depth become on a tree that leans left?',
  },
  {
    step: 14,
    name: 'Two Sum In BST | Check if there exists a pair with given Sum',
    difficulty: 'Easy',
    topicSlug: 'binary-trees',
    stem: 'Decide whether two distinct nodes of a BST sum to a target, using the sorted order without storing the whole tree.',
    brief:
      'Input: a BST as level-order cells and a target integer. Output: the pair, or null. The two nodes must be different nodes, so a target of twice one stored value is not automatically a hit.',
    concepts: [
      'dsa-bst-two-sum-needs-two-walks',
      'dsa-two-pointer',
      'dsa-complement-lookup',
      'dsa-bst-iterator-left-spine-stack',
    ],
    shortAnswer:
      'Run the sorted array two-pointer over the tree: a forward in-order iterator gives the smallest unseen value, a backward one the largest, and each step moves the end that makes the sum smaller or larger.',
    idealAnswer:
      'A BST stores its values in sorted order, which is precisely the precondition the two-pointer two-sum needs, so the question is really "can you traverse in order from both ends lazily". Two iterators give it: move the low end up when the sum is short and the high end down when it overshoots, and each step eliminates one node from consideration, which bounds the work at O(n) visits with O(h) memory. The hash-set version — descend once and check target minus the value against what has already been seen — is also O(n) but pays O(n) space, and it is the answer to a different question, because it works on an unordered tree too. Distinctness comes out of the walk: the loop stops the moment the two ends meet, so a node can never be paired with itself.',
    walkthrough:
      'On 10 with 5 and 15 as children, 2 and 7 under the 5, and 13 hanging as the left child of the 15, the stored order is 2,5,7,10,13,15. Target 17: low 2 and high 15 sum to 17, and the pair is reported having looked at two nodes. Target 18: 2 plus 15 is short, so low moves to 5; 5 plus 15 overshoots, so high moves to 13; 5 plus 13 is the answer. Target 21: the walk goes 2+15 short, 5+15 short, 7+15 over, 7+13 short, 10+13 over, and then the high end hands back 10 — the ends have met, so the answer is null, and no pair was skipped because every discarded node was on the wrong side of a comparison. Target 10 is the one to be ready for: 5 exists, and 5 plus 5 is 10, but there is only one node holding 5, and the meeting test rejects it. The set version fails on that same input for the opposite reason — checking the complement before inserting the current value is what keeps a single node from being used twice.',
    commonMistake:
      'Collecting the values into an array and running the plain two-pointer on it, or using a set and accepting a value paired with itself.',
    whyWrong:
      'The array version is correct and O(n) time, but it turns an O(h) interview answer into an O(n) one and it emits the entire tree before deciding anything — for a "does any pair exist" question that can be answered after two nodes, that is the whole cost thrown away. The self-pair bug is a correctness failure: with values 2,5,7 and target 10, a set that inserts before checking answers yes using the single node holding 5, and the interviewer reads it as an off-by-one in the loop body rather than as a different data structure.',
    followUps: [
      'Write the set version. Where exactly does the add happen relative to the check, and what does that ordering prove?',
      'Return every pair instead of the first. What changes in the loop, and what does the answer cost?',
      'The target arrives as a stream against one fixed tree. What would you precompute, and what would you refuse to precompute?',
      'Give a tree and target where the two-pointer walk finishes after one comparison. Which one is it?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      'function walkFrom(root, reverse) {\n' +
      '  const stack = [];\n' +
      '  const descend = (node) => {\n' +
      '    let current = node;\n' +
      '    while (current !== null) {\n' +
      '      stack.push(current);\n' +
      '      current = reverse ? current.right : current.left;\n' +
      '    }\n' +
      '  };\n' +
      '  descend(root);\n' +
      '  return {\n' +
      '    next() {\n' +
      '      if (stack.length === 0) return null;\n' +
      '      const node = stack.pop();\n' +
      '      descend(reverse ? node.left : node.right);\n' +
      '      return node.val;\n' +
      '    },\n' +
      '  };\n' +
      '}\n' +
      '\n' +
      'function twoSumBst(root, target) {\n' +
      '  const lowEnd = walkFrom(root, false);\n' +
      '  const highEnd = walkFrom(root, true);\n' +
      '  let low = lowEnd.next();\n' +
      '  let high = highEnd.next();\n' +
      '  while (low !== null && high !== null && low < high) {\n' +
      '    const sum = low + high;\n' +
      '    if (sum === target) return [low, high];\n' +
      '    if (sum < target) low = lowEnd.next();\n' +
      '    else high = highEnd.next();\n' +
      '  }\n' +
      '  return null;\n' +
      '}\n' +
      '\n' +
      'function twoSumWithSet(root, target) {\n' +
      '  const seen = new Set();\n' +
      '  const stack = [root];\n' +
      '  while (stack.length > 0) {\n' +
      '    const node = stack.pop();\n' +
      '    if (node === null) continue;\n' +
      '    if (seen.has(target - node.val)) return true;\n' +
      '    seen.add(node.val);\n' +
      '    stack.push(node.left);\n' +
      '    stack.push(node.right);\n' +
      '  }\n' +
      '  return false;\n' +
      '}',
    modify:
      'The tree stores timestamps and the target is a duration window. Which of the two ends can stop moving, and what invariant replaces the sum comparison?',
  },
  {
    step: 14,
    name: 'Correct BST with two nodes swapped',
    difficulty: 'Medium',
    topicSlug: 'binary-trees',
    stem: 'Two nodes of a valid BST had their values exchanged. Find them and restore the tree in one walk.',
    brief:
      'Input: a BST whose nodes hold the right multiset of values but exactly two of them are exchanged. Output: the two values that were swapped, and the tree restored in place. The pair may be adjacent in the sorted order.',
    concepts: [
      'dsa-bst-recover-two-inversions',
      'dsa-bst-inorder-is-the-sorted-order',
      'dsa-bst-iterator-left-spine-stack',
      'dsa-loop-invariant',
    ],
    shortAnswer:
      'Walk in order and watch for a value that comes out below the one before it. Two drops means the first previous and the last current; one drop means that pair was adjacent, so swap those two.',
    idealAnswer:
      'The in-order walk of a BST is the sorted sequence, and swapping two values in a sorted sequence produces exactly one or one-to-two adjacent inversions depending on distance. If the exchanged values sit far apart in the order, the walk drops once at the larger one and again at the smaller one, so the first anomaly points at the too-big node and the second at the too-small one. If they were neighbours in the sorted order, the two drops merge into one, and the previous-and-current pair at that single drop is exactly the two nodes. Recording first as "the previous node of the first drop" and last as "the current node of the last drop" handles both shapes with no special case, which is the trick the question is grading. Restoring is a value swap, so the shape never moves; the walk is O(n) time, and O(1) extra space if you accept Morris instead of an explicit stack.',
    walkthrough:
      'The tree 1 with left child 3 and that node holding a right child 2 walks in order as 3, 2, 1. Compare each pair: 3 above 2 is a drop, so first is the node holding 3 and last is the node holding 2; then 2 above 1 is another drop, so last moves to the node holding 1. Swapping the two recorded nodes writes 1 into the deep node and 3 into the root, and the tree reads 3 with left child 1 whose right child is 2 — in order that is 1, 2, 3, and the level order is exactly what a valid BST of those values looks like. Now the adjacent case: 3 with children 1 and 4, and 4 holding a left child 2, walks as 1, 3, 2, 4. One drop, 3 above 2, so first and last are that pair, and swapping gives 1, 2, 3, 4 with the root holding 2. The reason a single drop cannot be read as "one node is wrong" is that both ends of the inversion are involved — dropping the last update to the current node instead of the pair is the classic one-node fix that leaves the tree broken.',
    commonMistake:
      'Sorting a copy of the values and writing them back into the tree positions, or recording the two anomalies as the first and second nodes of the first drop only.',
    whyWrong:
      'The sort-and-overwrite version is correct and costs O(n log n) plus O(n) memory, and it forfeits the entire argument that makes the problem a BST problem: the walk already tells you which two nodes are wrong without re-deriving the sorted order. The single-drop-only reading is the correctness bug on far-apart pairs: on the first tree it swaps 3 and 2 and produces the walk 2, 3, 1 — still broken, and worse, it now looks like a one-node error. The rule that survives both shapes is that the second node is the current node of the last drop, not of the first.',
    followUps: [
      'Why does the far-apart case produce two drops and the adjacent case exactly one? Say it about positions in the sorted array.',
      'Do it in O(1) extra space. Which walk do you have to bring back, and what does it borrow from the tree?',
      'Three values were exchanged instead of two. Which part of the anomaly argument stops working?',
      'The tree is huge and you stream the walk. What is the smallest state that can still name both nodes?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      serializeLevel + '\n' +
      '\n' +
      inorderOf + '\n' +
      '\n' +
      'function recoverBst(root) {\n' +
      '  let first = null;\n' +
      '  let second = null;\n' +
      '  let previous = null;\n' +
      '  const stack = [];\n' +
      '  let current = root;\n' +
      '  while (current !== null || stack.length > 0) {\n' +
      '    while (current !== null) {\n' +
      '      stack.push(current);\n' +
      '      current = current.left;\n' +
      '    }\n' +
      '    current = stack.pop();\n' +
      '    if (previous !== null && previous.val > current.val) {\n' +
      '      if (first === null) first = previous;\n' +
      '      second = current;\n' +
      '    }\n' +
      '    previous = current;\n' +
      '    current = current.right;\n' +
      '  }\n' +
      '  if (first === null) return null;\n' +
      '  const swapped = [first.val, second.val];\n' +
      '  const held = first.val;\n' +
      '  first.val = second.val;\n' +
      '  second.val = held;\n' +
      '  return swapped;\n' +
      '}',
    modify:
      'Report the two node depths as well as their values, so the caller can decide whether the swap was local. Which extra state does the walk need?',
  },
  {
    step: 14,
    name: 'Largest BST in Binary Tree',
    difficulty: 'Medium',
    topicSlug: 'binary-trees',
    stem: 'Given any binary tree, return the size of the largest subtree that is a valid BST.',
    brief:
      'Input: a binary tree as level-order cells, with duplicates allowed. Output: the node count of the biggest subtree that is itself a BST, and 0 for an empty tree. One pass, no re-walking per candidate.',
    concepts: [
      'dsa-bst-subtree-report-fold',
      'dsa-one-postorder-fold-returns-height-and-carries-the-diameter',
      'dsa-bst-validation-needs-carried-bounds',
      'dsa-postorder-is-the-bottom-up-recording-time',
    ],
    shortAnswer:
      'Fold the tree in post-order and hand each parent a four-tuple: size, minimum, maximum and whether that subtree is a BST. A parent is a BST when both children are and its value sits strictly between their extremes.',
    idealAnswer:
      'The tempting answer is to call the validator on every subtree, which is O(n * h) at best and re-derives facts the walk below already computed. A BST is a property of a subtree that compresses: the only thing an ancestor needs from a finished subtree is whether it was ordered and what its value range turned out to be, plus its size. That is four numbers, and post-order is the order in which a child has finished before the parent is asked. The failure case carries a trap: when a subtree is not a BST, its min and max must be reported so that no ancestor can be judged valid — widen them to the whole number line, because the parent comparison will then fail, which is exactly the propagation wanted. Cost O(n) time with O(h) stack.',
    walkthrough:
      'Take 10 / 5,15 / 1,6,null,7. The leaves 1, 6, 7 report size 1 with their own value as both bounds. Node 5 has left 1 (max 1 < 5) and right 6 (min 6 > 5), both valid, so it reports size 3, range 1 to 6, valid — and the running best becomes 3. Node 15 has only the left child 7, so it reports size 2, range 7 to 15. The root 10 asks its left subtree (max 6, valid, 6 < 10 holds) and its right subtree (min 7, valid, and 7 < 10 fails the requirement that everything right of 10 exceed 10), so the root reports invalid and the best stays 3. On 5 / 1,4 / null,null,3,6 the subtree under 4 holds 3 and 6, which is ordered, so the answer is 3 and not the whole five-node tree. Two nodes both holding 2 answer 1, because the strict comparison fails at the parent, and an empty tree answers 0 without walking anything.',
    commonMistake:
      'Running the bounds validator from every node and taking the largest, or returning only a boolean from the fold and then claiming min and max can be recovered later.',
    whyWrong:
      'Validation from every node is correct but quadratic on a balanced tree of depth log n — O(n log n) walks where one walk would do — and it is the answer that fails to notice the subtree property compresses. Returning only a boolean is the version that actually breaks: a parent cannot decide whether it is ordered without knowing the child subtree extremes, and re-walking the child to find them is the quadratic answer again. The third subtle one is reporting the true min and max on an invalid subtree: those values can satisfy the parent comparison while the subtree below is broken, and the parent then claims a BST it does not have.',
    followUps: [
      'Return the root node of the largest BST subtree, not its size. Which extra field does the fold need to carry?',
      'Why does an invalid subtree have to poison every ancestor? Say it as a property of the tuple you return.',
      'Compare this fold with the diameter fold from the tree step. What is the same about their return values?',
      'The tree is mutated between queries. What would you store per node, and what would the update cost?',
    ],
    solution:
      buildTree + '\n' +
      '\n' +
      inorderOf + '\n' +
      '\n' +
      nodeCount + '\n' +
      '\n' +
      'function largestBst(root) {\n' +
      '  let best = 0;\n' +
      '  const fold = (node) => {\n' +
      '    if (node === null) return { size: 0, min: Infinity, max: -Infinity, valid: true };\n' +
      '    const left = fold(node.left);\n' +
      '    const right = fold(node.right);\n' +
      '    if (left.valid && right.valid && left.max < node.val && node.val < right.min) {\n' +
      '      const size = left.size + right.size + 1;\n' +
      '      if (size > best) best = size;\n' +
      '      return {\n' +
      '        size: size,\n' +
      '        min: Math.min(left.min, node.val),\n' +
      '        max: Math.max(right.max, node.val),\n' +
      '        valid: true,\n' +
      '      };\n' +
      '    }\n' +
      '    return { size: 0, min: -Infinity, max: Infinity, valid: false };\n' +
      '  };\n' +
      '  fold(root);\n' +
      '  return best;\n' +
      '}',
    modify:
      'Report the largest BST subtree by its root value and depth as well as its size. Where in the fold does that extra state belong?',
  },
];

export const expects: Record<string, string> = {
  'Check if a tree is a BST or BT':
    '(() => { const good = buildTree([5,3,8,1,4,7,9]); const hidden = buildTree([5,null,7,4]); const far = buildTree([10,5,15,null,null,6,20]); return isBst(good) === true && isBstLocalCheck(good) === true && isBstLocalCheck(hidden) === true && isBst(hidden) === false && isBstLocalCheck(far) === true && isBst(far) === false && isBst(buildTree([2,2])) === false && isBst(buildTree([null])) === true && isBst(buildTree([1])) === true; })()',
  'LCA in Binary Search Tree':
    '(() => { const r = buildTree([6,2,8,0,4,7,9,null,null,3,5]); const c1 = { visits: 0 }; const a = bstLca(r, 2, 8, c1); const c2 = { visits: 0 }; const b = bstLca(r, 2, 4, c2); const c3 = { visits: 0 }; const c = bstLca(r, 3, 5, c3); const c4 = { visits: 0 }; const absent = bstLca(r, 2, 99, c4); return a.val === 6 && c1.visits === 1 && b.val === 2 && c2.visits === 2 && c.val === 4 && c3.visits <= heightOf(r) + 1 && absent.val === 6 && c4.visits === 1; })()',
  'Construct a BST from a preorder traversal':
    '(() => { const pre = [8,5,1,7,10,12]; const a = bstFromPreorder(pre); const b = bstFromPreorderBound(pre); const chain = bstFromPreorder([1,2,3]); return serializeLevel(a) === "8 5 10 1 7 null 12" && preorderOf(a).join(",") === pre.join(",") && serializeLevel(b) === serializeLevel(a) && serializeLevel(chain) === "1 null 2 null 3" && bstFromPreorder([]) === null && bstFromPreorderBound([]) === null; })()',
  'Inorder Successor/Predecessor in BST':
    '(() => { const r = buildTree([5,3,8,1,4,7,9]); return bstSuccessor(r, 4) === 5 && bstSuccessor(r, 3) === 4 && bstSuccessor(r, 6) === 7 && bstSuccessor(r, 9) === null && bstSuccessor(r, 0) === 1 && bstPredecessor(r, 6) === 5 && bstPredecessor(r, 1) === null && bstPredecessor(r, 100) === 9 && bstPredecessor(r, 4) === 3 && bstPredecessor(r, 6) < 6 && 6 < bstSuccessor(r, 6); })()',
  'Binary Search Tree Iterator':
    '(() => { const r = buildTree([8,4,12,2,6,10,14]); const it = new BstIterator(r); const out = []; while (it.hasNext()) out.push(it.next()); return out.join(",") === "2,4,6,8,10,12,14" && out.join(",") === inorderOf(r).join(",") && it.next() === null && it.pushes === nodeCount(r) && it.pops === nodeCount(r) && it.peak === 3; })()',
  'Two Sum In BST | Check if there exists a pair with given Sum':
    '(() => { const r = buildTree([10,5,15,2,7,13]); const pair = twoSumBst(r, 18); const low = twoSumBst(r, 17); return low.join(",") === "2,15" && pair.join(",") === "5,13" && twoSumBst(r, 9).join(",") === "2,7" && twoSumBst(r, 21) === null && twoSumBst(r, 10) === null && twoSumWithSet(r, 18) === true && twoSumWithSet(r, 10) === false && twoSumBst(buildTree([null]), 5) === null; })()',
  'Correct BST with two nodes swapped':
    '(() => { const a = buildTree([1,3,null,null,2]); const pairA = recoverBst(a); const b = buildTree([3,1,4,null,null,2]); const pairB = recoverBst(b); const c = buildTree([2,1,3]); const pairC = recoverBst(c); return pairA.join(",") === "3,1" && inorderOf(a).join(",") === "1,2,3" && serializeLevel(a) === "3 1 null null 2" && pairB.join(",") === "3,2" && inorderOf(b).join(",") === "1,2,3,4" && pairC === null && inorderOf(c).join(",") === "1,2,3"; })()',
  'Largest BST in Binary Tree':
    '(() => { const broken = buildTree([10,5,15,1,6,null,7]); const mixed = buildTree([5,1,4,null,null,3,6]); return largestBst(broken) === 3 && nodeCount(broken) === 6 && largestBst(mixed) === 3 && nodeCount(mixed) === 5 && largestBst(buildTree([10,5,15,null,null,12,20])) === 5 && largestBst(buildTree([2,2])) === 1 && largestBst(buildTree([1,2])) === 1 && largestBst(buildTree([null])) === 0 && largestBst(buildTree([1])) === 1; })()',
};
