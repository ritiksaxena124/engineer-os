import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';
import { buildAdj, copyGrid, dirs4, minHeap, showGrid } from './graph-helpers';

/**
 * Step 15b — the half of the graph step that stops asking who is reachable and starts asking what
 * has to happen first, and then how little it costs to get there: topological order over a DAG, and
 * shortest paths over unit, weighted, directed, layered and bottleneck graphs.
 */

export const concepts: Record<string, ConceptSpec> = {
  'dsa-g15b-dfs-colour-is-the-open-path': {
    slug: 'dsa-g15b-dfs-colour-is-the-open-path',
    name: 'A directed cycle is an edge back onto a node the walk has not finished',
    detail:
      'Unseen, on-path and finished are three states, not one. An edge into a node that is still on the descent closes a cycle; an edge into a node that already finished is a diamond, and a single visited flag cannot tell the two apart.',
    terms: ['three colours', 'the on-path chain is the current descent', 'back edge', 'finished means its whole reachable set is done', 'one flag conflates rejoin and cycle'],
    weight: 5,
  },
  'dsa-g15b-postorder-reversal-is-a-topo-order': {
    slug: 'dsa-g15b-postorder-reversal-is-a-topo-order',
    name: 'Reversing the finish order of a depth-first walk puts every edge forward',
    detail:
      'A node finishes only after everything it can reach has finished, so recording nodes at finish time and reversing the list leaves every edge pointing ahead. It is a valid order for an acyclic graph and it is not the order a queue-based peel produces.',
    terms: ['finish time', 'reversed postorder', 'the sink is recorded first', 'the order is not unique', 'no order exists for a cyclic graph'],
    weight: 5,
  },
  'dsa-g15b-kahn-peels-zero-in-degree': {
    slug: 'dsa-g15b-kahn-peels-zero-in-degree',
    name: "Kahn emits what nothing still waits on and spends its edges",
    detail:
      'In-degree is a debt of unmet prerequisites; a node at zero can go now, and emitting it decrements its targets. Anything still holding debt when the queue empties is in or behind a cycle, so the same pass is a sort and a cycle test.',
    terms: ['in-degree array', 'zero in-degree is free', 'decrement on emit', 'fewer than n released means a cycle', 'peel by release time'],
    weight: 5,
  },
  'dsa-g15b-terminal-peel-is-the-safe-set': {
    slug: 'dsa-g15b-terminal-peel-is-the-safe-set',
    name: 'A node is safe when everything it can reach is safe',
    detail:
      'Nodes with no outgoing edge are safe by definition, and peeling backwards from them by counting out-degrees collects exactly the nodes that cannot reach a cycle. A node still pointing at unfinished targets never reaches zero.',
    terms: ['terminal node', 'out-degree peel', 'the reverse graph', 'unsafe means it reaches a cycle', 'safe set'],
    weight: 4,
  },
  'dsa-g15b-first-difference-is-an-edge': {
    slug: 'dsa-g15b-first-difference-is-an-edge',
    name: 'One pair of adjacent words gives at most one ordering fact',
    detail:
      'Comparing neighbours in an already sorted list yields a directed edge at the first position where the two differ and nothing otherwise. A longer word listed before its own prefix is a contradiction no edge set can repair.',
    terms: ['adjacent pair', 'first differing position', 'the prefix rule', 'a silent pair carries no information', 'contradictory alphabet'],
    weight: 4,
  },
  'dsa-g15b-bfs-band-is-the-distance': {
    slug: 'dsa-g15b-bfs-band-is-the-distance',
    name: 'On equal-cost edges the breadth-first band number is the shortest distance',
    detail:
      'A node is first reached from the band one closer, so its distance is the band index and every alternative route has at least as many edges. The claim dies as soon as edges stop costing the same.',
    terms: ['first arrival wins', 'band index is the distance', 'unit weights', 'a queue is a bucket sort', 'one weighted edge breaks it'],
    weight: 4,
  },
  'dsa-g15b-dag-relaxes-in-topo-order': {
    slug: 'dsa-g15b-dag-relaxes-in-topo-order',
    name: 'One relaxation pass in topological order settles a DAG',
    detail:
      'Processing vertices so that every edge points forward means each vertex is final the moment it is read, so every edge is relaxed once and no queue is needed. Nothing is claimed permanent, so negative weights are legal; a cycle would make the order impossible.',
    terms: ['topological sweep', 'relax each edge once', 'negative weights allowed', 'linear in vertices plus edges', 'no order, no answer'],
    weight: 4,
  },
  'dsa-g15b-dijkstra-needs-nonnegative-weights': {
    slug: 'dsa-g15b-dijkstra-needs-nonnegative-weights',
    name: 'A popped node is final only because no detour can be cheaper',
    detail:
      'The structure hands back the smallest tentative distance, and with non-negative weights any route through another unsettled node is at least as long, so freezing it is provable. One negative edge makes the detour cheaper than the route just frozen.',
    terms: ['settled set', 'the permanence claim', 'non-negative weights', 'the triangle argument', 'negative edge breaks it'],
    weight: 5,
  },
  'dsa-g15b-stale-heap-entry-is-skipped': {
    slug: 'dsa-g15b-stale-heap-entry-is-skipped',
    name: 'Decrease-key without the key is a duplicate entry the pop throws away',
    detail:
      'Pushing a better distance without removing the old one leaves both in the heap; the smaller pops and settles the node, the larger is discarded when it surfaces. The heap grows by one entry per successful relaxation rather than staying at n.',
    terms: ['lazy deletion', 'duplicate entries', 'skip on pop', 'one push per improvement', 'decrease-key as the alternative'],
    weight: 4,
  },
  'dsa-g15b-predecessor-array-extracts-the-path': {
    slug: 'dsa-g15b-predecessor-array-extracts-the-path',
    name: 'A shortest path is the chain of who last improved whom',
    detail:
      'Recording the vertex that last shortened a distance turns the answer array into a tree of predecessors; walking up from the destination and reversing gives the route. The chain is only shortest for the metric the relaxation used, and a re-relaxed node rewires everything below it.',
    terms: ['parent array', 'last improvement', 'walk upward then reverse', 'the shortest-path tree', 'a stale parent cost'],
    weight: 4,
  },
  'dsa-g15b-bottleneck-minimises-the-max-edge': {
    slug: 'dsa-g15b-bottleneck-minimises-the-max-edge',
    name: 'Minimising the worst edge on a route keeps a maximum, not a sum',
    detail:
      'Replacing the addition in the relaxation with a maximum makes the label the largest step along the route, and the greedy settle survives because extending a path can never lower its worst step. The answer is the label of the destination, not a total.',
    terms: ['bottleneck objective', 'max instead of plus', 'minimax route', 'cost along the path', 'monotone label'],
    weight: 4,
  },
  'dsa-g15b-k-stops-layers-the-relaxation': {
    slug: 'dsa-g15b-k-stops-layers-the-relaxation',
    name: 'A stop budget is a layer of relaxation, not a shorter distance',
    detail:
      'Reading the previous layer while writing the current one relaxes routes by hop count, so after the rounds the recorded cost is the cheapest with at most that many stops. Reading and writing one array lets two fresh edges share a round and spends the budget twice.',
    terms: ['two arrays per round', 'edges are stops plus two', 'in-place relaxation lies', 'layered Bellman-Ford', 'a negative cycle inside the budget'],
    weight: 5,
  },
  'dsa-g15b-counts-of-shortest-paths-add-on-ties': {
    slug: 'dsa-g15b-counts-of-shortest-paths-add-on-ties',
    name: 'Counting shortest routes means adding on an equal distance, not a better one',
    detail:
      'A relaxation that finds a shorter route replaces both the distance and the count; one that finds an equal route adds the source count in. Contributions have to come from a settled node or a half-built count is folded twice, and the modulus applies per addition.',
    terms: ['ways array', 'add on equal', 'replace on better', 'settle before counting', 'modulo at every addition'],
    weight: 5,
  },
  'dsa-g15b-residue-bfs-over-multipliers': {
    slug: 'dsa-g15b-residue-bfs-over-multipliers',
    name: 'Multiplication under a modulus turns values into vertices',
    detail:
      'Each residue is a node and each multiplier an outgoing edge, so the fewest steps is a breadth-first band count over a bounded state set. Without the modulus a multiplying walk is a tree of unbounded depth; with it, the record of visited states is what stops the loop.',
    terms: ['state as vertex', 'residues under the modulus', 'visited over states', 'band count is the step count', 'an unreachable residue'],
    weight: 4,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 15,
    name: 'Cycle Detection in Directed Graph (DFS)',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Decide whether a directed graph has a cycle, and name the input where a visited set says yes to a graph that has none.',
    brief:
      'Input: an adjacency list for nodes 0..n-1 built with directed = true, so edges have one direction, a node may point at itself, and part of the graph may be unreachable from node 0. Output: one boolean. The fact that decides the approach is that seeing a node twice proves nothing while the first sighting is still open.',
    concepts: [
      'dsa-g15b-dfs-colour-is-the-open-path',
      'dsa-visited-set-distance',
      'dsa-recursive-decomposition',
      'dsa-loop-invariant',
    ],
    shortAnswer:
      'Colour the walk: a node is on-path while the descent is inside it and finished once the descent backs out. An edge into an on-path node is a back edge and therefore a cycle; an edge into a finished node is a diamond and is legal.',
    idealAnswer:
      'The direction is what makes this decidable by state rather than by a flag. A depth-first descent keeps a chain of frames, and the nodes marked on-path are exactly that chain from the root of the current descent to the node being examined. An edge landing on an on-path node means the walk can travel from that node down to where it stands and then straight back, which is a directed cycle; an edge landing on a finished node means the target closed inside a branch that has already unwound, so the two routes merely share a sink and the graph is still acyclic. Cost is O(V + E) because every edge is read once from its own source, plus O(V) for the state array and one frame per node on the deepest chain. Two contract traps: the outer loop must restart from every unseen node, because a cycle in a component with no edge out of node 0 is invisible to a single descent; and the finished marks must survive between restarts, which is what keeps the multi-root pass linear instead of quadratic. The in-degree peel is the sibling answer, deciding the same question with a debt counter and no call stack at all, and it reports the stuck vertices rather than the cycle.',
    walkthrough:
      'Take the DAG 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3. The descent marks 0 on-path, follows the first edge to 1, then to 3. Node 3 has no outgoing edges, so it is marked finished and popped; 1 then finishes; the walk returns to 0 and takes its second edge to 2, and 2 reads its edge to 3 and finds 3 finished rather than on-path, so nothing closes. Run the single visited-flag version on the same list and it sees 3 already marked when 2 reads it and reports a cycle in a graph that has none. Feed the real cycle 0 -> 1, 1 -> 2, 2 -> 0, 2 -> 3: the chain 0, 1, 2 is on-path, and 2 reads its first edge to 0, which is on-path, so the answer is true and the chain itself names the cycle. A self-loop is the degenerate case caught by the identical test: on two nodes with edges 0 -> 0 and 0 -> 1, node 0 is on-path while its own edge is read. Finally the disconnected 0 -> 1 plus 2 -> 3, 3 -> 2 needs the outer loop: the descent from 0 marks 0 and 1 finished and says nothing, and only the fresh restart at 2 makes 2 and 3 on-path before 3 reads its edge back into 2.',
    commonMistake:
      'Reusing one visited flag, or clearing the marks when a descent ends instead of recording nodes as finished.',
    whyWrong:
      'A single boolean cannot separate a back edge from a cross edge, so the diamond 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3 is called cyclic while it is an ordinary acyclic graph with a shared sink — and every topological-sort answer layered on that check refuses to schedule a build that has no cycle at all. Clearing the marks at the end of a descent is the mirror bug: the walk is still correct but re-descends finished subgraphs, so the pass is no longer linear. Skipping the outer loop is the third failure and the quietest: with edges 2 -> 3, 3 -> 2 and no edge out of 0, a descent rooted at 0 alone answers false, and the caller ships a scheduler for a graph with a deadlock in it.',
    followUps: [
      'Rewrite the walk without recursion using an explicit frame that carries the position in the adjacency list. What does that frame stack correspond to in the coloured version?',
      'The walk stops at the first cycle. Change it to report every node that lies on or reaches a cycle — which idea from the safe-states row does that borrow?',
      'The graph arrives as an edge stream and edges are inserted between queries. Which of the two structures can be maintained incrementally, and what does an insertion cost?',
      'Give an input where the answer is true but no edge ever lands on a node the walk is currently inside. Is such an input possible at all? Argue it either way.',
    ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function cycleInDirectedDfs(adj) {\n' +
      '  const colour = new Array(adj.length).fill(0);\n' +
      '  for (let start = 0; start < adj.length; start += 1) {\n' +
      '    if (colour[start] !== 0) continue;\n' +
      '    colour[start] = 1;\n' +
      '    const stack = [{ node: start, cursor: 0 }];\n' +
      '    while (stack.length > 0) {\n' +
      '      const frame = stack[stack.length - 1];\n' +
      '      const list = adj[frame.node];\n' +
      '      if (frame.cursor >= list.length) {\n' +
      '        colour[frame.node] = 2;\n' +
      '        stack.pop();\n' +
      '        continue;\n' +
      '      }\n' +
      '      const next = list[frame.cursor][1];\n' +
      '      frame.cursor += 1;\n' +
      '      if (colour[next] === 1) return true;\n' +
      '      if (colour[next] === 0) {\n' +
      '        colour[next] = 1;\n' +
      '        stack.push({ node: next, cursor: 0 });\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return false;\n' +
      '}\n' +
      '\n' +
      'function cycleWithSeenOnly(adj) {\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  for (let start = 0; start < adj.length; start += 1) {\n' +
      '    if (seen[start]) continue;\n' +
      '    seen[start] = true;\n' +
      '    const stack = [start];\n' +
      '    while (stack.length > 0) {\n' +
      '      const node = stack.pop();\n' +
      '      for (const edge of adj[node]) {\n' +
      '        const next = edge[1];\n' +
      '        if (seen[next]) return true;\n' +
      '        seen[next] = true;\n' +
      '        stack.push(next);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return false;\n' +
      '}',
    modify:
      'Return the cycle itself as the chain of nodes that were on-path rather than a boolean. Which structure has to keep the chain in order, what does that cost when the cycle is n nodes long, and why can the seen-only version never answer at all?',
  },
  {
    step: 15,
    name: 'Topological Sort Algorithm (DFS)',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Order the vertices of an acyclic directed graph so every dependency comes first, using the moment a depth-first walk finishes each node.',
    brief:
      'Input: an adjacency list built with directed = true, which may be disconnected and may have no order at all. Output: an ordering array in which every edge points forward, or nothing when the graph is cyclic. The deciding fact is that a vertex is finished only after everything it can reach is finished.',
    concepts: [
      'dsa-g15b-postorder-reversal-is-a-topo-order',
      'dsa-g15b-dfs-colour-is-the-open-path',
      'dsa-g15b-kahn-peels-zero-in-degree',
      'dsa-postorder-is-the-bottom-up-recording-time',
      'dsa-stack-order-decides-visit-order',
    ],
    shortAnswer:
      'Append each node when the walk leaves it for the last time, then reverse the list. A node is appended after all of its targets, so the reversal puts every source ahead of everything it forced to finish first.',
    idealAnswer:
      'Post-order is the meeting at which both sides are already answered, so the list it builds is an order of sinks first: a node is appended only once its entire reachable set has been appended, which means that in the reversed list every edge points forward. Cost is O(V + E) time with O(V) for the states and the deepest chain, and the reversal is avoidable by head-inserting instead of appending, which is the same argument written differently. Two contract traps are worth more than the code. First, the order is not unique: on the diamond 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3 this walk returns 0,2,1,3 while the queue-based peel returns 0,1,2,3, and both respect every edge, so a check that compares against one fixed string is simply wrong and a validator must test the edges instead. Second, an order exists only when the graph is acyclic, so a back edge has to be reported as no answer rather than as a list that looks well-formed; keeping the on-path test inside the same walk is what makes the two halves agree on one traversal order, and running a separate cycle pass costs a second O(V + E) that can disagree with the walk if the two choose different restart nodes.',
    walkthrough:
      'On 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3 the descent from 0 reads its adjacency in list order: 0 goes on-path, then 1, then 3. Node 3 has no outgoing edges, so it finishes first and the append list is [3]; backing out, 1 finishes: [3,1]; back at 0 the second edge goes to 2, and 2 reads its edge to 3 and finds it finished, so 2 finishes: [3,1,2]; then 0: [3,1,2,0]. Reversing gives 0,2,1,3. The in-degree peel on the same adjacency list seeds a queue with the single node at zero debt, 0, and releases 1 before 2 because it enqueues in numeric order, so it returns 0,1,2,3. Test both against the four edges: 0 comes first in both, 1 precedes 3 in both, 2 precedes 3 in both — the two answers differ only in where the two unconstrained middle nodes sit. Now the graph with no order: 0 -> 1, 1 -> 0. The descent marks 0 on-path, steps to 1, and 1 reads its edge back into 0 while 0 is still on-path, so the walk returns nothing. Drop the on-path test, keep only the finished marks, and the same walk terminates happily: it appends 1, then 0, reverses to 0,1 and reports an order in which the edge 1 -> 0 points backwards — a list of the right length that is not an order, which is exactly what a downstream consumer cannot detect.',
    commonMistake:
      'Recording nodes on arrival instead of on finish, or returning the reversed append list even when the walk found an edge back into an open node.',
    whyWrong:
      'Arrival order is pre-order, and it only guarantees a source before the node it visited next: on the diamond the arrival sequence is 0,1,3,2, which places 3 before 2 while the edge 2 -> 3 demands the opposite, so the answer violates an edge inside a graph that does have orders. Silently returning a list for a cyclic graph is the worse failure because it is undetectable by length — on 0 -> 1, 1 -> 0 the walk that treats an open node as already visited hands back 0,1, and a course registrar consuming that schedule enrols a student in a course before its own prerequisite. The third variant is running the walk from node 0 only, which on the disconnected 0 -> 1 plus 2 -> 3, 3 -> 2 emits a list that never mentions the cycle behind 2 at all.',
    followUps: [
      'Prove the reversal claim: why must every edge point forward in the reversed finish list? Which step of the proof fails when a back edge exists?',
      'Give the version that prepends instead of reversing at the end. Does the emitted order change, and what does the recording moment become?',
      'A validator is handed a claimed order and the graph. Write it, state its cost, and name the two ways a wrong order can still have the right length.',
      'Vertices are added while the walk runs and the order must be extended rather than rebuilt. Which of the two sibling algorithms can be resumed, and what has to be remembered?',
    ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function topoOrderDfs(adj) {\n' +
      '  const colour = new Array(adj.length).fill(0);\n' +
      '  const finished = [];\n' +
      '  for (let start = 0; start < adj.length; start += 1) {\n' +
      '    if (colour[start] !== 0) continue;\n' +
      '    colour[start] = 1;\n' +
      '    const stack = [{ node: start, cursor: 0 }];\n' +
      '    while (stack.length > 0) {\n' +
      '      const frame = stack[stack.length - 1];\n' +
      '      const list = adj[frame.node];\n' +
      '      if (frame.cursor >= list.length) {\n' +
      '        colour[frame.node] = 2;\n' +
      '        finished.push(frame.node);\n' +
      '        stack.pop();\n' +
      '        continue;\n' +
      '      }\n' +
      '      const next = list[frame.cursor][1];\n' +
      '      frame.cursor += 1;\n' +
      '      if (colour[next] === 1) return null;\n' +
      '      if (colour[next] === 0) {\n' +
      '        colour[next] = 1;\n' +
      '        stack.push({ node: next, cursor: 0 });\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return finished.reverse();\n' +
      '}\n' +
      '\n' +
      'function isTopoOrder(adj, order) {\n' +
      '  if (order === null) return false;\n' +
      '  if (order.length !== adj.length) return false;\n' +
      '  const rank = new Map();\n' +
      '  for (let i = 0; i < order.length; i += 1) {\n' +
      '    if (rank.has(order[i])) return false;\n' +
      '    rank.set(order[i], i);\n' +
      '  }\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    if (!rank.has(node)) return false;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      if (rank.get(node) >= rank.get(edge[1])) return false;\n' +
      '    }\n' +
      '  }\n' +
      '  return true;\n' +
      '}',
    modify:
      'The graph is a set of build targets given as an edge list, and the caller also wants the round in which each target could start. Which of the two orders carries that information, and why does the finish list have to be rebuilt to get it?',
  },
  {
    step: 15,
    name: "Kahn's Algorithm | Topological Sort (BFS)",
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Produce a topological order by releasing whatever nothing is waiting on, and show the in-degree array as it drains.',
    brief:
      'Input: an adjacency list built with directed = true. Output: an ordering array, or nothing when fewer than all vertices can be released. The deciding fact is that the only vertex safe to emit at this moment is one whose unmet-prerequisite count has reached zero, and emitting it is the only thing that changes anyone else’s count.',
    concepts: [
      'dsa-g15b-kahn-peels-zero-in-degree',
      'dsa-g15b-postorder-reversal-is-a-topo-order',
      'dsa-bfs-needs-the-band-boundary',
      'dsa-amortised-pop-accounting',
      'dsa-loop-invariant',
    ],
    shortAnswer:
      'Count in-degrees, queue every vertex at zero, emit the front and decrement its targets, and re-queue any target that reaches zero. Fewer than n emitted means the graph is cyclic and no order exists.',
    idealAnswer:
      'In-degree is a debt counter: it says how many edges still have to be spent before a vertex is free, so the queue is exactly the set of vertices whose prerequisites are all already in the answer. Emitting a vertex spends each of its outgoing edges once, so the whole pass is O(V + E) with O(V) for the debt array and the queue, and a vertex is enqueued exactly once because a second enqueue would require a second arrival at zero, which the decrement pattern forbids. The shape is breadth-first, which buys something the recursive reversal does not: process the frontier in batches and you get levels, and levels are the number of rounds a parallel build or a dependency wave needs. Two traps are contract-level rather than code-level. The order is not unique and this version is decided by queue order, so changing the seed order or the adjacency order gives a different correct answer and only an edge check can tell a bug from a variant. And the length comparison is not a formality: on a cyclic graph the queue drains early and returns a genuine topological order of the acyclic part, which is a plausible wrong answer unless the caller compares the count against the vertex count.',
    walkthrough:
      'The diamond 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3 starts with the debt array [0,1,1,2] and a seed queue holding only 0. Emit 0 and spend its two edges: the array becomes [0,0,0,2] and the queue is now 1,2, while 3 still owes two and does not move. Emit 1 and spend 1 -> 3: the array reads [0,0,0,1]. Emit 2 and spend 2 -> 3: the debt of 3 reaches zero and it enters the queue. Emit 3. Four vertices released for four vertices, so the answer is 0,1,2,3 and the graph is acyclic. Read the same run as batches rather than as a stream and it says 0 | 1,2 | 3, which is the one-round-for-1-and-2 parallel schedule the queue knows and the reversed finish list throws away when it returns 0,2,1,3 for this very adjacency list. Now the disconnected case that shows a genuine tie: edges 0 -> 1, 2 -> 1, 3 -> 2 give debts [0,2,1,0], so the seed queue holds two free vertices, 0 and 3, the first batch is 0,3, and emitting them leaves 1 still owing one while 2 becomes free; the second batch is 2, which frees 1 for the third batch, so the order is 0,3,2,1 and the level string is 0+3|2|1. Seeding 3 first would return 3,2,0,1 instead — also correct, and only the edges decide.',
    commonMistake:
      'Forgetting to compare the emitted count against the vertex count, or re-scanning the whole edge list to rebuild in-degrees every time the queue empties.',
    whyWrong:
      'The missing length check is the classic wrong answer on a cyclic input: on 0 -> 1, 1 -> 2, 2 -> 0, 2 -> 3 no vertex ever starts at zero, so the peel emits nothing and returns an empty array that a caller happily reads as an empty schedule rather than as no schedule. Rebuilding degrees per pop is the quadratic mistake — on the diamond it re-reads four edges four times instead of once, and on a chain of n vertices it degrades to O(V * E). The third failure is enqueueing on a debt at or below zero rather than exactly zero: with a prerequisite pair repeated in the input, a course at debt 2 decrements to 1 and then to 0 and then, if a stale edge is processed again, to -1, and an at-or-below test emits that vertex twice and returns an order with a repeated entry that no schedule can execute.',
    followUps: [
      'Return the levels as an array of arrays and give the formula a build scheduler would use. Why is the number of levels not the length of the order?',
      'Seed the queue in reverse numeric order and produce a second valid order for the same graph. Check both with an edge validator rather than against a string.',
      'You must emit the order as a stream, one vertex per arriving edge update, with the full edge list never held. What has to be tracked to know a vertex is free?',
      'Edges now carry a cost and a vertex may be released only once all its prerequisites are both released and paid for. Which part of the peel stays a counter and which part becomes a sum?',
    ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function inDegrees(adj) {\n' +
      '  const degree = new Array(adj.length).fill(0);\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    for (const edge of adj[node]) degree[edge[1]] += 1;\n' +
      '  }\n' +
      '  return degree;\n' +
      '}\n' +
      '\n' +
      'function kahnLevels(adj) {\n' +
      '  const degree = inDegrees(adj);\n' +
      '  let level = [];\n' +
      '  for (let node = 0; node < degree.length; node += 1) {\n' +
      '    if (degree[node] === 0) level.push(node);\n' +
      '  }\n' +
      '  const levels = [];\n' +
      '  while (level.length > 0) {\n' +
      '    const next = [];\n' +
      '    for (const node of level) {\n' +
      '      for (const edge of adj[node]) {\n' +
      '        degree[edge[1]] -= 1;\n' +
      '        if (degree[edge[1]] === 0) next.push(edge[1]);\n' +
      '      }\n' +
      '    }\n' +
      '    levels.push(level);\n' +
      '    level = next;\n' +
      '  }\n' +
      '  return levels;\n' +
      '}\n' +
      '\n' +
      'function kahnTopo(adj) {\n' +
      '  const levels = kahnLevels(adj);\n' +
      '  const order = [];\n' +
      '  for (const level of levels) {\n' +
      '    for (const node of level) order.push(node);\n' +
      '  }\n' +
      '  return order.length === adj.length ? order : null;\n' +
      '}\n' +
      '\n' +
      'function isTopoOrder(adj, order) {\n' +
      '  if (order === null) return false;\n' +
      '  if (order.length !== adj.length) return false;\n' +
      '  const rank = new Map();\n' +
      '  for (let i = 0; i < order.length; i += 1) {\n' +
      '    if (rank.has(order[i])) return false;\n' +
      '    rank.set(order[i], i);\n' +
      '  }\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    if (!rank.has(node)) return false;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      if (rank.get(node) >= rank.get(edge[1])) return false;\n' +
      '    }\n' +
      '  }\n' +
      '  return true;\n' +
      '}',
    modify:
      'Vertices carry a duration and the question becomes the minimum wall-clock time to finish everything with unlimited parallelism. Which array do you add next to the level batches, and why does the level count stop being the answer once durations differ?',
  },
  {
    step: 15,
    name: "Cycle Detection in Directed Graph (Kahn's Algorithm)",
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Decide whether a directed graph is acyclic by counting what the release process could not free, and name the vertices a cycle hides behind.',
    brief:
      'Input: an adjacency list built with directed = true, where the cyclic part may be unreachable from node 0. Output: a boolean plus the vertices that never became free. The deciding fact is that a vertex is released only once everything pointing at it is released, so an unreleased vertex is proof that some chain of waiting never ended.',
    concepts: [
      'dsa-g15b-kahn-peels-zero-in-degree',
      'dsa-g15b-dfs-colour-is-the-open-path',
      'dsa-visited-set-distance',
      'dsa-loop-invariant',
      'dsa-complexity-counting',
    ],
    shortAnswer:
      'Run the release pass and compare its count against the vertex count. Anything still holding in-degree when the queue drains is in a cycle or downstream of one, and that leftover list is the evidence rather than a bare boolean.',
    idealAnswer:
      'Here the sort is the instrument rather than the answer: a graph is acyclic exactly when the peel releases everything, so one O(V + E) pass with one counter is the test, and it needs no call stack, which is the practical argument for it in a service with a depth limit. The comparison with the coloured walk is sharper than correct-versus-incorrect. The walk answers whether a cycle exists and can hand back the chain of open frames as the cycle itself; the peel answers by pointing at the vertices that stayed blocked, and that leftover set is strictly larger than the cycle because it contains every vertex behind one. On 0 -> 1, 1 -> 2, 2 -> 1, 2 -> 3 the peel leaves 1, 2 and 3 stuck and only 1 and 2 are on the cycle, so a caller that reports the leftover as cyclic vertices blames a victim. Recovering the exact cycle members from a peel needs a second instrument — strongly connected components, or a walk that records the open chain. The last detail worth saying out loud is that the released prefix is not garbage: it is a valid topological order of the acyclic part, which is useful to a scheduler that wants to do what it can and dangerous to one that must be told the job is impossible.',
    walkthrough:
      'Start with 0 -> 1, 1 -> 2, 2 -> 1, 2 -> 3. The debt array is [0,2,1,1]: node 1 owes 0 and 2, node 2 owes 1, node 3 owes 2, and only node 0 is free. Emit 0 and spend 0 -> 1, which leaves [0,1,1,1] and an empty queue. The peel has emitted one vertex out of four, so the test answers cyclic, and the stuck set taken as the vertices still above zero debt is 1,2,3. Read that leftover carefully: 1 and 2 form the mutual pair, while 3 is stuck only because its single prerequisite never arrived, so 3 is collateral and not a member of any cycle. Contrast the coloured walk on the same list: the descent 0,1,2 with 2 reading an edge into the still-open 1 names the cycle exactly. Now 0 -> 1, 1 -> 2, 2 -> 0, 2 -> 3 with debts [1,1,1,1]: the seed queue is empty from the start, so nothing is emitted and the leftover is all four vertices including 3. On the clean diamond 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3 every vertex drains, the leftover is empty and the emitted count matches the vertex count, which is the only input shape on which a bare boolean taken from this pass is safe to print.',
    commonMistake:
      'Reporting the vertices the peel could not release as the vertices that form the cycle, or answering with the emitted count without the leftover so the caller cannot tell a cycle from a truncation.',
    whyWrong:
      'The first is a wrong answer with a real cost: on 0 -> 1, 1 -> 2, 2 -> 1, 2 -> 3 the leftover includes 3, so a build system that cancels leftover targets cancels a target that was perfectly schedulable the moment 2 was fixed, and an error report naming it sends a developer to the wrong file. Returning only a count is the second failure because it throws away the one piece of information a reviewer needs — the count says the graph is bad, the stuck list says which part, and the released prefix says what work can still be done. The third mistake is running the peel once from node 0 as a search rather than as a pass over all zero-debt vertices: on the disconnected 0 -> 1 plus 2 -> 3, 3 -> 2 the seeded debt scan finds nothing wrong below 0, and a version that seeds only from node 0 emits 0 and 1 and calls the graph acyclic with two vertices left uncounted.',
    followUps: [
      'Return the released prefix as well as the leftover. What guarantee does that prefix carry about the subgraph it spans, and what does it not carry?',
      'Shrink the leftover down to the vertices genuinely on a cycle. Which second pass — strongly connected components, or the coloured walk — is cheaper here and why?',
      'The graph is a package snapshot with several independent components. Does running one peel over all of them confuse the leftover sets, and what keeps them separate?',
      'Say in one sentence what this test cannot answer that the depth-first version can, in the words an interviewer would accept.',
    ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function inDegrees(adj) {\n' +
      '  const degree = new Array(adj.length).fill(0);\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    for (const edge of adj[node]) degree[edge[1]] += 1;\n' +
      '  }\n' +
      '  return degree;\n' +
      '}\n' +
      '\n' +
      'function kahnPeel(adj) {\n' +
      '  const degree = inDegrees(adj);\n' +
      '  const order = [];\n' +
      '  const queue = [];\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    if (degree[node] === 0) queue.push(node);\n' +
      '  }\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const node = queue[head];\n' +
      '    head += 1;\n' +
      '    order.push(node);\n' +
      '    for (const edge of adj[node]) {\n' +
      '      degree[edge[1]] -= 1;\n' +
      '      if (degree[edge[1]] === 0) queue.push(edge[1]);\n' +
      '    }\n' +
      '  }\n' +
      '  const stuck = [];\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    if (degree[node] > 0) stuck.push(node);\n' +
      '  }\n' +
      '  return { order: order, stuck: stuck, acyclic: order.length === adj.length };\n' +
      '}\n' +
      '\n' +
      'function hasCycleKahn(adj) {\n' +
      '  return !kahnPeel(adj).acyclic;\n' +
      '}',
    modify:
      'Split the leftover into the vertices that are on a cycle and the vertices that merely sit behind one. What does each vertex need to remember from the peel to tell those two cases apart on 0 -> 1, 1 -> 2, 2 -> 1, 2 -> 3?',
  },
  {
    step: 15,
    name: 'Course Schedule I and II',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Answer both halves in one codebase: can every course be taken, and if so in what order.',
    brief:
      'Input: a course count and prerequisite pairs written as [course, prerequisite], which is the order the interview statement uses. Output: a boolean for the first half and the full schedule for the second, nothing when no schedule exists. The deciding fact is that each pair is a directed edge and a schedule is a topological order covering every course.',
    concepts: [
      'dsa-g15b-kahn-peels-zero-in-degree',
      'dsa-g15b-postorder-reversal-is-a-topo-order',
      'dsa-g15b-dfs-colour-is-the-open-path',
      'dsa-boundary-conditions',
      'dsa-complexity-counting',
    ],
    shortAnswer:
      'Build the graph in the prerequisite-to-course direction, run the release pass, and read both answers off it: an order covering every course is the schedule, and a shorter one is proof of a cycle. Part one is part two with the list thrown away.',
    idealAnswer:
      'The two halves are one computation at different verbosity, and the sentence that decides the grade is the direction of an edge: the pair [course, prerequisite] means an edge from the prerequisite to the course, and building it the other way round produces an order that is exactly backwards and still has the right length, so nothing downstream catches it. Once the shape is fixed the mechanism is the in-degree peel at O(C + P) time and space, and it hands the boolean for free from the length comparison, which is why a separate cycle-detection pass is wasted work. Three contract details matter more than the loop. Courses with no edges at all are their own component and must still appear in the schedule, so the seed scan covers all C courses rather than only the ones mentioned in a pair. Duplicate pairs are legal input and must not enqueue a course twice, which the arrival-at-exactly-zero test guarantees. And a pair naming a course outside 0..C-1 is malformed input that an array-indexed debt silently absorbs into an undefined slot, so a production version validates the range before building. The reversed-finish-list version is a legitimate second implementation, but it emits a different schedule on a tie, so if a caller caches schedules one implementation has to be named canonical.',
    walkthrough:
      'Four courses with pairs [1,0], [2,0], [3,1], [3,2] build the adjacency 0 to 1 and 2, 1 to 3, 2 to 3, and the debt array [0,1,1,2]. The seed scan over all four courses finds only 0 free. Emit 0, spend 0 -> 1 and 0 -> 2, and both drop to zero so the queue becomes 1,2. Emit 1, spend 1 -> 3 and leave 3 owing one. Emit 2, spend 2 -> 3, the debt reaches zero and 3 enters. Emit 3. Four courses emitted for four courses, so the schedule is 0,1,2,3 and canFinish answers true. Now build the edge backwards and the same input yields debts [2,1,1,0], the seed is course 3, and the emitted list is 3,2,1,0 — a complete, four-long, confident anti-schedule. For the cyclic half, two courses with pairs [1,0] and [0,1] give debts [1,1]: the seed scan finds nothing, the queue is empty, the emitted length is 0 against 2, and part one answers false while part two answers nothing rather than an empty list a registrar would read as no courses to take. Two boundaries to have ready: zero courses with no pairs returns an empty schedule and true, and the repeated pair [1,0], [1,0] leaves debts [0,2] where emitting 0 decrements twice so course 1 arrives at zero exactly once and the schedule is 0,1.',
    commonMistake:
      'Building the edge as course to prerequisite, or answering part one with a standalone cycle detector so the two halves can disagree.',
    whyWrong:
      'The reversed edge is the failure that survives every hand-written test, because the answer is a permutation of the right length: on pairs [1,0], [2,0], [3,1], [3,2] the reversed graph emits 3,2,1,0, so the student sits course 3 before either of its prerequisites while the length check passes. Two implementations is not wrong but it invites disagreement: the cycle detector and the schedule builder may choose different restart nodes, and on the four-course input with an extra pair [1,2], [2,1] a cycle test written as a single descent from course 0 says clean while the scheduler emits two courses and stops. The third mistake is seeding the queue from the pairs instead of from the course count, which on four courses where only courses 1 and 2 appear in any pair drops the two unconstrained courses out of the schedule entirely and then fails the length check for the wrong reason.',
    followUps: [
      'Return each course with the round in which it could be taken in parallel. Which structure of the peel hands that over without a second pass?',
      'Two valid schedules exist for the same input. State the tie-breaking rule your implementation uses and point at the line that provides it.',
      'Pairs arrive sorted by prerequisite and the registrar wants the schedule streamed. What can be emitted before the whole list has been read, and what cannot?',
      'A course may list itself as its own prerequisite. Which single line of the peel keeps that input from looping, and what does the answer become?',
    ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function courseAdjacency(count, pairs) {\n' +
      '  const adj = [];\n' +
      '  for (let c = 0; c < count; c += 1) adj.push([]);\n' +
      '  for (const pair of pairs) {\n' +
      '    const course = pair[0];\n' +
      '    const prereq = pair[1];\n' +
      '    adj[prereq].push([prereq, course]);\n' +
      '  }\n' +
      '  return adj;\n' +
      '}\n' +
      '\n' +
      'function courseOrder(count, pairs) {\n' +
      '  const adj = courseAdjacency(count, pairs);\n' +
      '  const degree = new Array(count).fill(0);\n' +
      '  for (const list of adj) {\n' +
      '    for (const edge of list) degree[edge[1]] += 1;\n' +
      '  }\n' +
      '  const order = [];\n' +
      '  const queue = [];\n' +
      '  for (let c = 0; c < count; c += 1) {\n' +
      '    if (degree[c] === 0) queue.push(c);\n' +
      '  }\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const course = queue[head];\n' +
      '    head += 1;\n' +
      '    order.push(course);\n' +
      '    for (const edge of adj[course]) {\n' +
      '      degree[edge[1]] -= 1;\n' +
      '      if (degree[edge[1]] === 0) queue.push(edge[1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return order.length === count ? order : null;\n' +
      '}\n' +
      '\n' +
      'function canFinish(count, pairs) {\n' +
      '  return courseOrder(count, pairs) !== null;\n' +
      '}\n' +
      '\n' +
      'function isTopoOrder(adj, order) {\n' +
      '  if (order === null) return false;\n' +
      '  if (order.length !== adj.length) return false;\n' +
      '  const rank = new Map();\n' +
      '  for (let i = 0; i < order.length; i += 1) {\n' +
      '    if (rank.has(order[i])) return false;\n' +
      '    rank.set(order[i], i);\n' +
      '  }\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    if (!rank.has(node)) return false;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      if (rank.get(node) >= rank.get(edge[1])) return false;\n' +
      '    }\n' +
      '  }\n' +
      '  return true;\n' +
      '}',
    modify:
      'Courses carry credit hours and the registrar wants the fewest terms with any number of courses per term under a credit cap. Which part of the peel becomes a bin-packing problem, and what stops the level batches from being the answer?',
  },
  {
    step: 15,
    name: 'Find Eventual Safe States',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Mark the nodes from which every possible walk eventually stops, and explain why a node that merely can reach a cycle belongs with the cycles.',
    brief:
      'Input: an adjacency list built with directed = true, where a node may have no outgoing edge and may point at itself. Output: the node indices from which no walk can enter a cycle, in ascending order. The deciding fact is that safety is inherited backwards from the nodes that have nowhere left to go.',
    concepts: [
      'dsa-g15b-terminal-peel-is-the-safe-set',
      'dsa-g15b-dfs-colour-is-the-open-path',
      'dsa-g15b-kahn-peels-zero-in-degree',
      'dsa-reachability-set',
      'dsa-postorder-is-the-bottom-up-recording-time',
    ],
    shortAnswer:
      'A node with no outgoing edge is safe, and a node is safe once every target it points at is safe. Peel from the terminals along reversed edges while counting out-degrees; the nodes that reach zero are exactly the safe set.',
    idealAnswer:
      'Safety is a greatest fixed point, and the peel computes it without recursion: terminals are safe by definition, the reverse graph carries that fact upward, and an out-degree counter is simply the number of targets whose safety is still unproven. Building the reverse adjacency and the counters is O(V + E) time and space, and the queue never grows past the edge list because a node enters it once. The depth-first sibling reads the same claim bottom-up: a node is unsafe when one of its targets is on the current path or already marked unsafe, which is the coloured walk with a memo, and it saves the reverse graph while paying a call stack. Two traps look like edge cases and are not. A self-loop makes its own node unsafe, and the terminal peel gets this right for a reason worth stating: the node’s out-degree counts the loop edge, and since the node is never released its own edge is never spent, so the counter never reaches zero. And the unsafe set is closed under predecessors — a single edge into it condemns a node — which is why node 2 in the worked example below is unsafe even though it holds a one-edge route to a terminal. The invariant to say out loud: safe means every path stops, so one path that never stops decides the answer, and a candidate who reasons with or rather than and has answered a different question.',
    walkthrough:
      'Use the seven-node graph 0 -> 1,2, 1 -> 3,4, 2 -> 3,6, 3 -> 1,2,3,5, 4 -> 5, 5 -> 6, and 6 with no edges. The out-degree array is [2,2,2,4,1,1,0], so the only terminal is 6 and the safe queue starts as 6 alone. Release 6: its predecessors are 2 and 5, so the counters read 2 -> 1 and 5 -> 0, and 5 becomes safe. Release 5: predecessors 3 and 4, so 3 drops from 4 to 3 and 4 from 1 to 0, making 4 safe. Release 4: predecessors 1 and 3, so 1 drops to 1 and 3 to 2. The queue is now empty and the safe set is 4,5,6 in ascending order. Read the unsafe four individually, because the interesting ones are the near-misses: 3 has a self-loop and sits inside the loop 3 -> 1 -> 2 -> 3; 1 is unsafe only because it reaches 3; 2 is unsafe although it also holds a direct edge to the terminal 6, since unsafe means some route never stops rather than every route; and 0 is unsafe purely because both of its targets are. Now the graph with no cycle at all, 0 -> 1, 1 -> 2: the terminal 2 releases 1 which releases 0, so all three nodes are safe, which is the sanity check that the peel is not silently marking everything unsafe when nothing is stuck. The two-node cycle 0 -> 1, 1 -> 0 has no terminal, the queue starts empty, and the answer is the empty list. The coloured walk returns the same three safe nodes on the seven-node graph, node by node, which is the cross-check worth writing as a test.',
    commonMistake:
      'Answering with the nodes that are not themselves on a cycle, or peeling on in-degrees of the forward graph instead of out-degrees of the reversed one.',
    whyWrong:
      'Not-on-a-cycle is the wrong predicate: in the seven-node graph node 0 lies on no cycle, yet a walk 0 -> 1 -> 3 -> 1 -> 3 -> ... never stops, so 0 must be unsafe and a not-on-a-cycle answer calls it safe. Peeling on forward in-degrees is a different failure and the direction is what breaks it: the node with zero in-degree in that graph is 0, which is exactly the one that is unsafe, so the pass marks the busiest victim as the winner. The third mistake is stopping after the terminals, which reports only node 6 safe: 4 and 5 are genuinely safe and are reachable from nothing stuck, so the error shows up as a short answer rather than a wrong ordering and is easy to wave through in review.',
    followUps: [
      'Do it with the coloured walk alone and no reverse graph. What does a memo separating safe from unsafe buy that a plain cycle test does not?',
      'Report the unsafe nodes as well and describe the subgraph they induce. Why can every unsafe node reach a cycle rather than merely reach an unsafe node?',
      'The graph is a state machine and each safe node needs the longest walk still available from it. Which pass order gives that, and what does it cost?',
      'Edges are appended one at a time and the safe set must be re-reported after each. Which of the two implementations can be repaired locally, and what is the worst-case repair?',
    ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function terminalPeelSafe(adj) {\n' +
      '  const out = new Array(adj.length).fill(0);\n' +
      '  const back = [];\n' +
      '  for (let node = 0; node < adj.length; node += 1) back.push([]);\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    out[node] = adj[node].length;\n' +
      '    for (const edge of adj[node]) back[edge[1]].push(node);\n' +
      '  }\n' +
      '  const safe = new Array(adj.length).fill(false);\n' +
      '  const queue = [];\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    if (out[node] === 0) {\n' +
      '      safe[node] = true;\n' +
      '      queue.push(node);\n' +
      '    }\n' +
      '  }\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const node = queue[head];\n' +
      '    head += 1;\n' +
      '    for (const pred of back[node]) {\n' +
      '      out[pred] -= 1;\n' +
      '      if (out[pred] === 0) {\n' +
      '        safe[pred] = true;\n' +
      '        queue.push(pred);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  const list = [];\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    if (safe[node]) list.push(node);\n' +
      '  }\n' +
      '  return list;\n' +
      '}\n' +
      '\n' +
      'function safeStatesDfs(adj) {\n' +
      '  const state = new Array(adj.length).fill(0);\n' +
      '  const walk = (node) => {\n' +
      '    if (state[node] !== 0) return state[node] === 2;\n' +
      '    state[node] = 1;\n' +
      '    let safe = true;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      if (!walk(edge[1])) safe = false;\n' +
      '    }\n' +
      '    state[node] = safe ? 2 : 3;\n' +
      '    return safe;\n' +
      '  };\n' +
      '  for (let node = 0; node < adj.length; node += 1) walk(node);\n' +
      '  const list = [];\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    if (state[node] === 2) list.push(node);\n' +
      '  }\n' +
      '  return list;\n' +
      '}',
    modify:
      'Report, for each safe node, the fewest steps after which every walk from it has certainly stopped. Which of the two implementations already computes that as a by-product, and in which array does the number live?',
  },
  {
    step: 15,
    name: 'Alien Dictionary',
    difficulty: 'Hard',
    topicSlug: 'graph-traversal',
    stem: 'Recover an alphabet order from a sorted word list, and name the two ways a word list is either evidence too weak or evidence of a lie.',
    brief:
      'Input: a non-empty list of words over an unknown alphabet, already ordered by that alphabet. Output: one valid order of every letter that appears, or nothing when the list contradicts itself. The deciding fact is that a pair of adjacent words carries at most one ordering fact — the first position at which the two differ.',
    concepts: [
      'dsa-g15b-first-difference-is-an-edge',
      'dsa-g15b-kahn-peels-zero-in-degree',
      'dsa-g15b-postorder-reversal-is-a-topo-order',
      'dsa-set-iterates-in-insertion-order',
      'dsa-complexity-counting',
    ],
    shortAnswer:
      'Compare adjacent words, take the first differing position as a directed edge between those two letters, and topologically sort every letter that appears anywhere in the list. A longer word listed before its own prefix has no repair.',
    idealAnswer:
      'The list is sorted, so all of the ordering information is in adjacent pairs — comparing a word against anything further away is redundant because the chain already carries it. Collecting letters and edges is O(total characters) and the sort over the letters is O(L + E) with E bounded by the number of pairs, so the whole answer is linear in the input; edges go into a per-letter set so a repeated pair costs nothing and does not double-count a debt. Three traps. First, every letter appearing anywhere must be in the output, including letters from a single-word list and letters that only ever sit in a position no pair compared, so the sort has to be seeded from the letter set rather than from the edge list. Second, the prefix rule is a contradiction rather than a missing edge: a longer word listed before its own prefix means the sorted list cannot exist, while the reverse case — a prefix before the longer word — is the input class that carries no information at all and must not invent an edge. Third, unconstrained letters have no determined relative order, so a stated single correct answer is a lie: this implementation breaks ties alphabetically by sorting the free set, which is a policy, and the reversed finish order is a different valid answer. A cyclic edge set is the fourth case and it is a genuine lie rather than a gap, caught by the same length comparison as any topological sort.',
    walkthrough:
      'Take the four words tea, tin, abc, ant. The pair tea-tin matches at position 0, differs at position 1 and gives e -> i; tin-abc differs immediately at position 0 and gives t -> a; abc-ant matches on a, differs at position 1 and gives b -> n. The letters collected from all four words are t,e,a,i,n,b,c — seven, including c, which never appears in any comparison and would vanish from an implementation seeded from edges alone. Debts are i:1, a:1, n:1 and zero for the rest, so the alphabetically sorted free set is b,c,e,t. Emit b and release n; emit c, which has no edges; emit e and release i; emit t and release a. The order is b,c,e,t,n,i,a, and it satisfies e before i, t before a and b before n while leaving c and n wherever the tie-break put them. The input that is too weak rather than wrong is the single word solo: letters s,o,l with no edges at all, and the alphabetical policy returns l,o,s — valid as an order, but only one of six. The two failures: abc followed by ab compares equal up to the shorter length and the earlier word is longer, so no alphabet can put ab after abc and the answer is nothing, not a partial order; and z, x, z gives edges z -> x and x -> z, so the peel releases neither letter, the emitted length is zero against two letters, and the answer is nothing again. That second case needs the length check — without it the same code returns the empty string for the wrong reason and passes a suite that only tests the prefix rule.',
    commonMistake:
      'Comparing every pair of words rather than adjacent ones, emitting only the letters that took part in a comparison, or reading a prefix pair as an edge.',
    whyWrong:
      'Comparing all pairs is quadratic in word count for edges adjacency already implies, and it invents constraints: on the list ab, ac, bb the non-adjacent pair ab-bb compares a with b and reports a -> b, while the adjacent pair ac-bb reports the opposite, so a consistent list produces a contradiction and the answer comes out as nothing. Dropping unconstrained letters fails outright on the four-word example above, where the seven-letter answer is returned six long, and on a single-word input where nothing would be emitted at all. Reading the prefix pair as an edge is the third failure: treating abc before ab as a -> b manufactures an order for a list that cannot exist, and the entire point of that row in the statement is to notice the list itself is inconsistent.',
    followUps: [
      'Which letters in the four-word example genuinely have no determined position, and how many total valid orders does that allow?',
      'Swap the alphabetical tie-break for the reversed finish-time order. Give both answers for one input and write the checker that accepts either.',
      'The list streams in and consistency must be decided before the whole list is read. Which of the two failures can be caught immediately and which cannot?',
      'Words may contain characters outside the alphabet and adjacent words may be identical. Where does each of those rules live in the pass, and what changes in the debt array?',
    ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function alienGraph(words) {\n' +
      '  const letters = new Set();\n' +
      '  for (const word of words) {\n' +
      '    for (const ch of word) letters.add(ch);\n' +
      '  }\n' +
      '  const edges = new Map();\n' +
      '  for (const ch of letters) edges.set(ch, new Set());\n' +
      '  let prefixBroken = false;\n' +
      '  for (let i = 0; i + 1 < words.length; i += 1) {\n' +
      '    const first = words[i];\n' +
      '    const second = words[i + 1];\n' +
      '    let at = 0;\n' +
      '    while (at < first.length && at < second.length && first[at] === second[at]) at += 1;\n' +
      '    if (at === first.length || at === second.length) {\n' +
      '      if (first.length > second.length) prefixBroken = true;\n' +
      '      continue;\n' +
      '    }\n' +
      '    edges.get(first[at]).add(second[at]);\n' +
      '  }\n' +
      '  return { letters: Array.from(letters), edges: edges, prefixBroken: prefixBroken };\n' +
      '}\n' +
      '\n' +
      'function alienOrder(words) {\n' +
      '  const graph = alienGraph(words);\n' +
      '  if (graph.prefixBroken) return "";\n' +
      '  const degree = new Map();\n' +
      '  for (const ch of graph.letters) degree.set(ch, 0);\n' +
      '  for (const ch of graph.letters) {\n' +
      '    for (const to of graph.edges.get(ch)) degree.set(to, degree.get(to) + 1);\n' +
      '  }\n' +
      '  const queue = [];\n' +
      '  for (const ch of graph.letters) {\n' +
      '    if (degree.get(ch) === 0) queue.push(ch);\n' +
      '  }\n' +
      '  queue.sort();\n' +
      '  const order = [];\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const ch = queue[head];\n' +
      '    head += 1;\n' +
      '    order.push(ch);\n' +
      '    const opened = [];\n' +
      '    for (const to of graph.edges.get(ch)) {\n' +
      '      degree.set(to, degree.get(to) - 1);\n' +
      '      if (degree.get(to) === 0) opened.push(to);\n' +
      '    }\n' +
      '    opened.sort();\n' +
      '    for (const to of opened) queue.push(to);\n' +
      '  }\n' +
      '  if (order.length !== graph.letters.length) return "";\n' +
      '  return order.join("");\n' +
      '}',
    modify:
      'The words are sorted by a rule that compares length before content, so a longer word may legitimately follow its own prefix. Which line has to go, and what does the edge pass need in order to keep every ordering fact the length rule already supplies?',
  },
  {
    step: 15,
    name: 'Shortest Path in Undirected Graph with Unit Weights',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Give the fewest edges from one node to every other node of an unweighted undirected graph, and the route to a named target.',
    brief:
      'Input: an adjacency list built without the directed flag, which may carry parallel edges and an isolated vertex. Output: a distance array using Infinity where nothing reaches, plus a node list for a named destination. The deciding fact is that all edges cost the same, so the first arrival at a node is already the cheapest arrival.',
    concepts: [
      'dsa-g15b-bfs-band-is-the-distance',
      'dsa-g15b-predecessor-array-extracts-the-path',
      'dsa-visited-set-distance',
      'dsa-bfs-needs-the-band-boundary',
      'dsa-jumps-are-breadth-first-layers',
    ],
    shortAnswer:
      'Run breadth-first search from the source, write the distance when a node is first reached and never update it again, and keep the node you arrived from so the route can be walked back afterwards.',
    idealAnswer:
      'The queue keeps the frontier in non-decreasing band order, so a node is discovered from the band exactly one closer than the next: its recorded distance is the band index, and any other route to it is a sequence of edges at least as long. That is the whole correctness argument, and it is why a single write with no comparison suffices. Cost is O(V + E) with O(V) for the arrays, and parallel edges cost nothing beyond the extra scan because the first-arrival test discards them. The contract details are all carried by the word shortest: Infinity rather than a sentinel zero for unreachable nodes, because zero is a legal distance and a caller cannot otherwise tell an isolated vertex from the source; the parent of the source stays null so a walk upward terminates instead of reading a node as its own parent; and one route is not the only route — the parent array is a breadth-first tree, so it reports exactly one shortest path, and a caller asking how many there are needs a different pass. The trap that generalises beyond this row is touching the write: adding a shorter-then-write test alongside a plain queue keeps correctness but forfeits linearity, and giving any edge a weight that is not one makes the first-arrival rule simply wrong, because a two-edge route of cost 1 plus 1 beats a single edge of cost 3 and the direct edge is the one the queue saw first.',
    walkthrough:
      'Take the undirected graph with edges 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 4, 4 -> 5, 5 -> 6 over seven nodes, plus an eighth node 7 that exists in the count and in no edge. Distances start [0,Inf,Inf,Inf,Inf,Inf,Inf,Inf] and the queue holds 0. Pop 0, reach 1 and 2, write 1 for both with parent 0: the queue is 1,2, which is band one. Pop 1: node 0 already has a distance so it is skipped, and 3 is written at 2 with parent 1, joining band two behind 2. Pop 2 and write 4 at 2 with parent 2. Pop 3, nothing new. Pop 4 and write 5 at 3 with parent 4. Pop 5 and write 6 at 4 with parent 5. Pop 6, nothing. The finished array is [0,1,1,2,2,3,4,Infinity], and node 7 sitting at Infinity is the answer the unreachable contract needs rather than a zero that would read as free. Walk 6 back through its parents: 6 from 5, 5 from 4, 4 from 2, 2 from 0, and 0 has a null parent, so the collected list is 6,5,4,2,0 and the reversed route is 0,2,4,5,6 with four edges — equal to the recorded distance, which is the invariant to check. Now add a parallel edge 0 -> 2 and an edge 1 -> 4: the pass still reports the same distances because 2 and 4 were already written, and the only cost is two more skipped reads. Feed the same shape with one edge weighted 3 and the pass returns 4 for node 6 while the true cheapest route is the direct one, which is the moment to say out loud that equal costs were the precondition.',
    commonMistake:
      'Marking a node visited when it is popped rather than when it is pushed, or returning 0 as the distance for unreachable nodes.',
    whyWrong:
      'Marking at pop is survivable but not linear: on a graph where node 3 has four neighbours already queued, an unmarked push queues 3 once per incoming edge and re-scans its adjacency each time, so a dense unweighted graph degenerates towards O(V * E) with duplicates filling the queue. The zero sentinel is a correctness bug: on a five-node graph with node 4 isolated, the array [0,1,1,2,0] reads as node 4 being free to reach, and a caller that filters unreachable nodes by comparing against zero reports the source twice. The third failure is treating the single parent chain as the set of routes: the chain above gives 0,2,4,5,6, and node 6 also has 0,1,3 as a prefix at distance 2, so a caller counting shortest routes from one parent array reports one where the graph has two.',
    followUps: [
      'Give the version that also returns every node at the maximum distance. Which two arrays does it need, and does the pass stay single-run?',
      'Change the input so edges cost 1 or 2 and keep the plain queue. Produce the specific three-node input where it answers too high.',
      'All pairs of nodes are asked for. Is running this pass from every source the right answer, and what is the honest complexity on a sparse graph?',
      'The graph is a road network with parallel roads between the same pair. Which line absorbs them, and what does the parent array look like when the first road and the cheapest road differ?',
    ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function bfsDistances(adj, source) {\n' +
      '  const dist = new Array(adj.length).fill(Infinity);\n' +
      '  const parent = new Array(adj.length).fill(null);\n' +
      '  dist[source] = 0;\n' +
      '  const queue = [source];\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const node = queue[head];\n' +
      '    head += 1;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const next = edge[1];\n' +
      '      if (dist[next] !== Infinity) continue;\n' +
      '      dist[next] = dist[node] + 1;\n' +
      '      parent[next] = node;\n' +
      '      queue.push(next);\n' +
      '    }\n' +
      '  }\n' +
      '  return { dist: dist, parent: parent };\n' +
      '}\n' +
      '\n' +
      'function bfsPath(adj, source, target) {\n' +
      '  const run = bfsDistances(adj, source);\n' +
      '  if (run.dist[target] === Infinity) return null;\n' +
      '  const path = [];\n' +
      '  for (let at = target; at !== null; at = run.parent[at]) path.push(at);\n' +
      '  return path.reverse();\n' +
      '}',
    modify:
      'Edges now carry a travel time of 1 or 2 and the question becomes the fewest edges that fit inside a time budget. Which part of the pass turns from a write into a comparison, and what does the queue no longer guarantee?',
  },
  {
    step: 15,
    name: 'Shortest Path in Directed Acyclic Graph (DAG)',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Compute single-source shortest paths in a DAG in one sweep, and show the input where the priority queue you would otherwise reach for is wrong.',
    brief:
      'Input: an adjacency list built with directed = true whose edges carry weights, negative weights included, plus a source node. Output: a distance array with Infinity for unreachable nodes, and no answer at all when the graph is not acyclic. The deciding fact is that a topological sweep makes each vertex final the moment it is read, so relaxation needs exactly one pass.',
    concepts: [
      'dsa-g15b-dag-relaxes-in-topo-order',
      'dsa-g15b-postorder-reversal-is-a-topo-order',
      'dsa-g15b-kahn-peels-zero-in-degree',
      'dsa-g15b-dijkstra-needs-nonnegative-weights',
      'dsa-single-pass-tracking',
    ],
    shortAnswer:
      'Order the vertices topologically, then walk that order relaxing every outgoing edge once. Each vertex is final when read because everything that could improve it sits earlier in the sweep.',
    idealAnswer:
      'In topological order every edge points forward, so when the sweep stands on a vertex all of its in-edges have already been relaxed and no later vertex can reach back to improve it — the vertex is final without anyone having to claim it, which is the permanence argument the weighted greedy version has to work for and this sweep gets from the order for free. The pass is O(V + E): the order is linear and every edge is relaxed exactly once, against a heap-based run that pays a log factor, and unlike the heap version it is correct with negative weights precisely because nothing was frozen before its in-edges were read. It still cannot handle a negative cycle, and the reason changes, which is the answer to the follow-up: a cyclic graph has no topological order at all, so the failure surfaces as no order rather than as an unbounded number, and if the cycle is negative then no shortest path exists and both a finite number and Infinity are lies. Two traps: relaxing from an Infinity label is arithmetic on a sentinel, so the guard belongs in the loop and not in the caller, and an unreachable vertex keeps Infinity, which is a report rather than a result — a caller that prints these arrays needs to know whether Infinity or nothing is the contract. The relaxation-order trap is the subtlest: a vertex with several in-edges must be read after all of them, which is what the order buys, so the sweep cannot be replaced by one pass over the edge list in input order.',
    walkthrough:
      'Six directed nodes with edges 0 -> 1 weight 2, 0 -> 4 weight 1, 1 -> 2 weight 3, 4 -> 2 weight 2, 4 -> 5 weight 4, 2 -> 3 weight 6, 5 -> 3 weight 1; the release pass puts them in the order 0,1,4,2,5,3. Start with [0,Inf,Inf,Inf,Inf,Inf]. Read 0: relax 1 to 2 and 4 to 1. Read 1 at 2: relax 2 to 5 — provisional, because 2 has a second in-edge from 4 that has not been read, which is exactly why 2 must wait. Read 4 at 1: 1 + 2 = 3 beats 5, so 2 is corrected to 3, and 5 is relaxed to 5: array [0,2,3,Inf,1,5]. Read 2 at 3: relax 3 to 9. Read 5 at 5: 5 + 1 = 6 replaces 9. Read 3 at 6, which has no outgoing edges. The answer is [0,2,3,6,1,5] and the route to 3 runs 0,4,5,3 rather than through 2. Now the input that voids the heap version: four nodes with 0 -> 1 weight 5, 0 -> 2 weight 2, 2 -> 1 weight -4, 1 -> 3 weight 1, order 0,2,1,3. The sweep writes 1 at 5 from 0, corrects it to -2 from 2, then relaxes 3 to -1, giving [0,-2,2,-1]. An unchecked greedy with a heap on the same graph pops 1 at 5 before 2 is read, settles it, and reports 3 at 6 — a route cost the graph does not offer, because the cheaper detour arrived through a node already frozen, which is why the priority-queue row refuses the negative edge instead of returning that number. The same argument on an implicit DAG: over the cells 1 2 1 / 2 1 2 / 1 1 1, sweeping rows then columns and relaxing only down and right turns the cost grid into 0,2,3 / 2,3,5 / 3,4,5, where cell 2,2 at 5 is the cheapest monotone trip 0,0 -> 1,0 -> 2,0 -> 2,1 -> 2,2, whose four entered cells cost 2 + 1 + 1 + 1 while the two routes through 1,2 pay 6.',
    commonMistake:
      'Relaxing edges in edge-list order in a single pass, or answering a cyclic input with the distances the partial sweep happened to produce.',
    whyWrong:
      'One pass in arbitrary order is not wrong by luck, it is wrong on small inputs: on 0 -> 1 weight 5, 0 -> 2 weight 2, 2 -> 1 weight -4, 1 -> 3 weight 1, relaxing the four edges in list order writes 1 at 5 and 2 at 2 and then, if 1 is read before 2 is used, propagates 5 into 3 and never revisits it — reporting 6 instead of -1. Bellman-Ford fixes that by iterating V - 1 times, which is the price of not having an order. Silently using a partial order is the second failure: on 0 -> 1, 1 -> 0 the release pass emits one vertex out of two, so a sweep that trusts its own prefix answers about that one vertex and leaves the rest at Infinity, which a caller reads as unreachable rather than as un-sortable — the honest output is no array at all, which is what the null return is for. The third case is a negative cycle, where no finite number is correct and the honest answer is that the question has no answer.',
    followUps: [
      'Prove that a vertex is final when the sweep reads it. Which single property of the order does the argument use, and where does it fail with a cycle?',
      'Give the count of shortest routes in the same sweep. Which extra array do you carry, and on which of the three relaxation cases does it change?',
      'The graph is huge and only one destination is asked for. Would you still order every vertex, and what does stopping early cost you?',
      'Weights may be negative and the graph is almost acyclic — exactly one back edge exists. What does the release pass hand you, and is the resulting array meaningful?',
    ],
    solution:
      buildAdj + '\n' +
      copyGrid + '\n' +
      showGrid + '\n' +
      '\n' +
      'function topoSortLocal(adj) {\n' +
      '  const degree = new Array(adj.length).fill(0);\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    for (const edge of adj[node]) degree[edge[1]] += 1;\n' +
      '  }\n' +
      '  const order = [];\n' +
      '  const queue = [];\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    if (degree[node] === 0) queue.push(node);\n' +
      '  }\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const node = queue[head];\n' +
      '    head += 1;\n' +
      '    order.push(node);\n' +
      '    for (const edge of adj[node]) {\n' +
      '      degree[edge[1]] -= 1;\n' +
      '      if (degree[edge[1]] === 0) queue.push(edge[1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return order.length === adj.length ? order : null;\n' +
      '}\n' +
      '\n' +
      'function dagShortestPaths(adj, source) {\n' +
      '  const order = topoSortLocal(adj);\n' +
      '  if (order === null) return null;\n' +
      '  const dist = new Array(adj.length).fill(Infinity);\n' +
      '  dist[source] = 0;\n' +
      '  for (const node of order) {\n' +
      '    if (dist[node] === Infinity) continue;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const weight = edge[2] === undefined ? 0 : edge[2];\n' +
      '      if (dist[node] + weight < dist[edge[1]]) dist[edge[1]] = dist[node] + weight;\n' +
      '    }\n' +
      '  }\n' +
      '  return dist;\n' +
      '}\n' +
      '\n' +
      'function gridMonotoneCosts(source, cells) {\n' +
      '  const cost = copyGrid(cells);\n' +
      '  for (const row of cost) row.fill(Infinity);\n' +
      '  cost[source[0]][source[1]] = 0;\n' +
      '  for (let row = 0; row < cost.length; row += 1) {\n' +
      '    for (let col = 0; col < cost[0].length; col += 1) {\n' +
      '      const here = cost[row][col];\n' +
      '      if (here === Infinity) continue;\n' +
      '      if (row + 1 < cost.length && here + cells[row + 1][col] < cost[row + 1][col]) {\n' +
      '        cost[row + 1][col] = here + cells[row + 1][col];\n' +
      '      }\n' +
      '      if (col + 1 < cost[0].length && here + cells[row][col + 1] < cost[row][col + 1]) {\n' +
      '        cost[row][col + 1] = here + cells[row][col + 1];\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return cost;\n' +
      '}',
    modify:
      'The same sweep should also report the number of distinct shortest routes modulo one billion and seven. Which of the three relaxation cases touches the count, and why must a vertex with two in-edges be read after both?',
  },
  {
    step: 15,
    name: "Dijkstra's Algorithm - Using Priority Queue",
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Run the weighted greedy pass with a binary heap and defend the exact moment a popped node becomes final.',
    brief:
      'Input: an adjacency list whose edges carry non-negative weights, plus a source. Output: a distance array, optionally with the pop-by-pop record of the settled set. The deciding fact is that the heap returns the smallest tentative distance, so the only way a settled node could still improve is a route through a node with a bigger label.',
    concepts: [
      'dsa-g15b-dijkstra-needs-nonnegative-weights',
      'dsa-g15b-stale-heap-entry-is-skipped',
      'dsa-heap-guarantees-only-the-root',
      'dsa-sift-up-sift-down',
      'dsa-amortised-pop-accounting',
    ],
    shortAnswer:
      'Relax the source at zero, pop the smallest tentative distance, declare that node final, relax its outgoing edges and push every improvement. A node already settled is never reopened.',
    idealAnswer:
      'The claim that carries the algorithm is that when the heap returns a node, that node already holds its final distance. Every route from the source to it that is not already settled must pass through some unsettled node whose label is at least the label just popped, and appending non-negative edges cannot make the total smaller, so the greedy freeze is provable and the settled set is the invariant. A push-per-improvement heap is the lazy form of decrease-key: the structure cannot remove an entry from the middle, so the old distance stays in the array and is discarded when it surfaces, the heap grows to one entry per successful relaxation, and the cost becomes O(E log E) rather than O(E log V). That trade is worth stating precisely, because the alternative needs a position map per node and pays a sift on every improvement. The second precision point is that the heap orders only its root: two nodes at the same tentative distance come out in whatever order the array layout happens to leave at the top, so a settled sequence is not reproducible unless the comparator falls back to the node id. The two traps are the negative edge, which voids the proof and produces a confident wrong number instead of an error, and Infinity in the output: an unreachable node never enters the settled set, so the caller must be told whether the contract is Infinity or nothing.',
    walkthrough:
      'Six nodes with undirected weighted edges 0 -> 1 weight 2, 0 -> 4 weight 1, 1 -> 2 weight 3, 2 -> 3 weight 6, 4 -> 2 weight 2, 4 -> 5 weight 4, 5 -> 3 weight 1, source 0. Distances start [0,Inf,Inf,Inf,Inf,Inf] and the heap holds one entry. Pop 0 at 0: settled is 0, relax 1 to 2 and 4 to 1, state [0,2,Inf,Inf,1,Inf]. Pop 4 at 1: settled 0+4, relax 2 to 3 and 5 to 5, state [0,2,3,Inf,1,5]. Pop 1 at 2: settled 0+4+1, and 2 + 3 = 5 does not beat 3 so nothing is pushed — the heap not growing here is the difference between a relaxation and an improvement. Pop 2 at 3: settled 0+4+1+2, relax 3 to 9, state [0,2,3,9,1,5]. Pop 5 at 5: settled 0+4+1+2+5, relax 3, and 5 + 1 = 6 replaces 9, pushing a second entry for 3 while the entry carrying 9 is still sitting in the array. Pop 3 at 6 and the settled set is complete. Pop the entry carrying 3 at 9, find 3 already settled and discard it: that discarded pop is the lazy decrease-key being paid for with one extra log. The answer is [0,2,3,6,1,5] with the route to 3 running 0,4,5,3 rather than the 0,1,2,3 route the first relaxation recorded. Now the input that voids the proof: three nodes with 0 -> 1 weight 1, 0 -> 2 weight 5, 1 -> 2 weight -3. A pass that does not check the weight pops 1 at 1, settles it, then pops 2 at 5 and settles 2 at 5 — while the route 0,1,2 costs -2, an improvement that arrives through a node the algorithm had already frozen. This implementation throws on that edge instead of returning a number.',
    commonMistake:
      'Marking a node settled when it is pushed, or skipping the stale-entry test so a settled node can be relaxed a second time.',
    whyWrong:
      'Settling at push replaces a distance with the first one seen rather than the smallest, which is the breadth-first rule and is wrong under weights: on the six-node graph, 2 is reached at 3 through 4 and at 5 through 1, so a push-time mark freezes 2 at 5 if the adjacency of 0 is read after 1’s, and node 3 then comes out at 8 rather than 6. Trusting the first arrival with a settled test only at pop is the same bug moved one line: on the graph 0 -> 1 weight 2, 0 -> 2 weight 4, 1 -> 2 weight 1, the entry for 2 at 4 was pushed before the improvement to 3, so a version without the discard test settles 2 twice, relaxes its edges twice, and on a graph with a zero-weight cycle never terminates. Reopening settled nodes is the third failure: it turns the pass into a queue-driven walk that only terminates because weights are non-negative, and quietly becomes a different algorithm with no complexity argument attached.',
    followUps: [
      'Name the exact step of the proof that a negative edge invalidates, rather than the line of code that misbehaves.',
      'Write the comparator that makes the settled sequence reproducible. Which heap operation does it touch, and what does it cost per pop?',
      'The graph has a hundred million edges and only one destination matters. What can the pass stop doing, and what does it still have to push?',
      'Count the pushes on the six-node graph and compare them with the number of vertices. What is the worst-case ratio, and on which shape of graph does it happen?',
    ],
    solution:
      buildAdj + '\n' +
      minHeap + '\n' +
      '\n' +
      'function dijkstraHeap(adj, source, report) {\n' +
      '  const dist = new Array(adj.length).fill(Infinity);\n' +
      '  const settled = new Set();\n' +
      '  const trace = [];\n' +
      '  dist[source] = 0;\n' +
      '  const heap = new MinHeap(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });\n' +
      '  heap.push([0, source]);\n' +
      '  while (heap.size() > 0) {\n' +
      '    const top = heap.pop();\n' +
      '    const node = top[1];\n' +
      '    if (settled.has(node)) continue;\n' +
      '    settled.add(node);\n' +
      '    if (report) {\n' +
      '      trace.push(\n' +
      '        top[0] + ":" + node + " settled=" + Array.from(settled).join("+") +\n' +
      '        " dist=" + dist.map((d) => (d === Infinity ? "-" : String(d))).join(",")\n' +
      '      );\n' +
      '    }\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const next = edge[1];\n' +
      '      const weight = edge[2] === undefined ? 0 : edge[2];\n' +
      '      if (weight < 0) throw new Error("dijkstra needs non-negative weights");\n' +
      '      if (settled.has(next)) continue;\n' +
      '      if (dist[node] + weight < dist[next]) {\n' +
      '        dist[next] = dist[node] + weight;\n' +
      '        heap.push([dist[next], next]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return report ? { dist: dist, trace: trace } : dist;\n' +
      '}\n' +
      '\n' +
      'function relaxByQueue(adj, source) {\n' +
      '  const dist = new Array(adj.length).fill(Infinity);\n' +
      '  dist[source] = 0;\n' +
      '  const queue = [source];\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const node = queue[head];\n' +
      '    head += 1;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const weight = edge[2] === undefined ? 0 : edge[2];\n' +
      '      if (dist[node] + weight < dist[edge[1]]) {\n' +
      '        dist[edge[1]] = dist[node] + weight;\n' +
      '        queue.push(edge[1]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return dist;\n' +
      '}',
    modify:
      'Edges may be negative but the graph stays acyclic. Which single line of the pass would you delete, what replaces the heap, and why does the settled set stop being meaningful?',
  },
  {
    step: 15,
    name: "Dijkstra's Algorithm - Using Set",
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Run the same algorithm with a settled set and a linear scan for the minimum, and name the input where the two versions disagree about order but not about distance.',
    brief:
      'Input: an adjacency list with non-negative weights. Output: the same distance array the heap version returns, plus the settled sequence. The deciding fact is that a settled set with a scan gives a total order over unsettled distances and costs O(V) per vertex, while a heap costs O(log V) and orders only its root.',
    concepts: [
      'dsa-g15b-dijkstra-needs-nonnegative-weights',
      'dsa-g15b-stale-heap-entry-is-skipped',
      'dsa-heap-guarantees-only-the-root',
      'dsa-selection-min-scan',
      'dsa-complexity-counting',
    ],
    shortAnswer:
      'Keep a set of settled nodes, scan every unsettled distance for the smallest, settle it, relax its edges. No duplicate entry is ever created, so nothing has to be discarded at pop.',
    idealAnswer:
      'The settled set carries the same invariant as the heap version — once a node is in it, its distance is final — and the scan is only the way of choosing the next member without a heap: read every unsettled label and take the minimum, which is O(V) per vertex and O(V squared + E) overall. That is worse in general and better in exactly one case worth naming: on a dense graph where E is on the order of V squared, the scan drops the log factor and the heap bookkeeping, so a candidate who says only that the heap is faster has answered the sparse case and ignored the other. The second reason the variant is asked about is determinism. The scan breaks distance ties by node index, because the comparison is strict and the scan runs left to right; a heap compares only the priority and hands back whichever equal entry the array layout leaves at the root, so its settled sequence depends on the order the entries were pushed. The third is shape: this version never holds two entries for one node, so the stale-pop branch disappears and the relaxation count is a clean O(V) per vertex. The failure mode is unchanged from the heap version — a negative edge voids the permanence argument wherever the minimum came from, and a scan simply makes the wrongness arrive one vertex earlier because it settles strictly in label order.',
    walkthrough:
      'Use a graph built around a tie: undirected weighted edges 0 -> 1 weight 2, 0 -> 2 weight 2, 1 -> 3 weight 1, 2 -> 3 weight 1, 0 -> 4 weight 9 and 3 -> 4 weight 6, source 0. Labels start [0,Inf,Inf,Inf,Inf] and the first scan settles 0, relaxing 1 to 2, 2 to 2 and 4 to 9. The unsettled labels are now 1 at 2, 2 at 2, 3 at Infinity and 4 at 9: two nodes tie, and the left-to-right scan with a strict comparison keeps the first one it saw, so 1 settles and writes 3 at 3. Next scan: 2 at 2 beats 3 at 3, so 2 settles and tries to write 3 at 2 + 1 = 3, which is equal and therefore not an improvement — the input where an implementation that treats ties as improvements relaxes 3 twice and pushes a duplicate. Then 3 settles at 3, relaxes 4 to 3 + 6 = 9, again equal to the label already recorded, and 4 settles. The sequence is 0,1,2,3,4 and the distances are [0,2,2,3,9]. The lazy heap on the same graph gives identical distances, and the tie between 1 and 2 resolves in favour of whichever entry was pushed first — here 1, because the adjacency of 0 lists it first. Rebuild the same edges with the adjacency of 0 reading 2 before 1 and the un-tied heap settles 2 first while the scan still settles 1, because the scan never looks at arrival order; only a comparator that falls back to the node id makes the two agree. On the six-node graph from the previous row the scan version pushes nothing and discards nothing, while the heap version pushed seven entries for six vertices and discarded one.',
    commonMistake:
      'Re-scanning without a settled flag so the same vertex is picked again, or claiming the scan version is always slower than the heap version.',
    whyWrong:
      'Without a settled flag the scan re-picks the vertex it just settled, relaxes its edges a second time and never terminates on a graph with an edge back to the source: on 0 -> 1 weight 2, 0 -> 2 weight 2, 1 -> 0 weight 1, a second pass over 0 would rewrite 0 at 3, settle 0 again, and the loop ends only by accident. The complexity claim is the interview trap rather than a code bug: on a complete graph over 2000 nodes, E is about two million and a heap run is two million times roughly eleven comparisons, while the scan is four million comparisons with no log factor, so the version that is asymptotically worse on a chain is competitive or better on a clique and the honest answer names both shapes and the density that separates them. The third mistake is presenting the scan’s tie behaviour as a specification: it follows from a strict comparison in a left-to-right loop, and an answer that promises a deterministic settled sequence should point at the line that provides it.',
    followUps: [
      'Derive the density at which the scan beats the heap for your own graph model instead of quoting one.',
      'Replace the scan with buckets indexed by integer distance. What does that cost in memory, and which input makes it unbounded?',
      'The two versions must return the same settled sequence. Which comparator or which scan rule achieves that, and on which tied input above does it matter?',
      'Vertices are deleted between runs. Which version can drop a node without leaving a duplicate entry behind, and what does the other version have to do?',
    ],
    solution:
      buildAdj + '\n' +
      minHeap + '\n' +
      '\n' +
      'function dijkstraSet(adj, source, report) {\n' +
      '  const dist = new Array(adj.length).fill(Infinity);\n' +
      '  const settled = [];\n' +
      '  const done = new Array(adj.length).fill(false);\n' +
      '  dist[source] = 0;\n' +
      '  for (let round = 0; round < adj.length; round += 1) {\n' +
      '    let pick = -1;\n' +
      '    for (let node = 0; node < adj.length; node += 1) {\n' +
      '      if (done[node]) continue;\n' +
      '      if (dist[node] === Infinity) continue;\n' +
      '      if (pick === -1 || dist[node] < dist[pick]) pick = node;\n' +
      '    }\n' +
      '    if (pick === -1) break;\n' +
      '    done[pick] = true;\n' +
      '    settled.push(pick);\n' +
      '    for (const edge of adj[pick]) {\n' +
      '      const weight = edge[2] === undefined ? 0 : edge[2];\n' +
      '      if (weight < 0) throw new Error("dijkstra needs non-negative weights");\n' +
      '      if (done[edge[1]]) continue;\n' +
      '      if (dist[pick] + weight < dist[edge[1]]) dist[edge[1]] = dist[pick] + weight;\n' +
      '    }\n' +
      '  }\n' +
      '  return report ? { dist: dist, settled: settled } : dist;\n' +
      '}\n' +
      '\n' +
      'function dijkstraLazy(adj, source, tieOnNode) {\n' +
      '  const dist = new Array(adj.length).fill(Infinity);\n' +
      '  const settled = [];\n' +
      '  const done = new Set();\n' +
      '  let pushes = 0;\n' +
      '  let skipped = 0;\n' +
      '  dist[source] = 0;\n' +
      '  const compare = tieOnNode\n' +
      '    ? function (a, b) { return a[0] - b[0] || a[1] - b[1]; }\n' +
      '    : function (a, b) { return a[0] - b[0]; };\n' +
      '  const heap = new MinHeap(compare);\n' +
      '  heap.push([0, source]);\n' +
      '  pushes += 1;\n' +
      '  while (heap.size() > 0) {\n' +
      '    const top = heap.pop();\n' +
      '    if (done.has(top[1])) {\n' +
      '      skipped += 1;\n' +
      '      continue;\n' +
      '    }\n' +
      '    done.add(top[1]);\n' +
      '    settled.push(top[1]);\n' +
      '    for (const edge of adj[top[1]]) {\n' +
      '      const weight = edge[2] === undefined ? 0 : edge[2];\n' +
      '      if (dist[top[1]] + weight < dist[edge[1]]) {\n' +
      '        dist[edge[1]] = dist[top[1]] + weight;\n' +
      '        heap.push([dist[edge[1]], edge[1]]);\n' +
      '        pushes += 1;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return { dist: dist, settled: settled, pushes: pushes, skipped: skipped };\n' +
      '}',
    modify:
      'Distances are always integers below a thousand. Replace the scan with buckets indexed by distance and say what the settled order becomes, what the memory is, and which line of the scan this version no longer needs.',
  },
  {
    step: 15,
    name: 'Print Shortest Path in Weighted Undirected Graph',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Report the route and not just its length, and keep the route valid when a node is re-relaxed.',
    brief:
      'Input: an adjacency list built without the directed flag whose edges carry positive weights, plus a source and a destination. Output: the distance and the node list from source to destination, or nothing when the destination never gets a distance. The deciding fact is that a parent entry is only as current as the relaxation that wrote it.',
    concepts: [
      'dsa-g15b-predecessor-array-extracts-the-path',
      'dsa-g15b-dijkstra-needs-nonnegative-weights',
      'dsa-g15b-stale-heap-entry-is-skipped',
      'dsa-reversal-trick',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      'Relax as usual and record the vertex that last improved each distance, then walk upward from the destination and reverse. The parent of a node is written in the same step as its distance, and nowhere else.',
    idealAnswer:
      'The distance array answers how far and the parent array answers how, and the parent of a node changes exactly when its distance does, so the two writes belong in one step. What they build is a tree rooted at the source in which each node points at the predecessor that gave it its final label, and a walk from any node up to the root is a shortest route to it. Extraction is O(V) with one array, and reversing at the end is the standard fix for reading a chain that was built backwards; prepending per step is the same cost with a worse constant. Three traps separate a working answer from a correct one. A node whose distance is improved twice must have its parent rewritten with it, because a parent left at the first discovery describes the old route: on the graph below node 4 moves from parent 2 at cost 6 to parent 3 at cost 5, and printing the old chain reports a route costing 6 while the distance array says 5 — the route and the number disagree, which is the signature of the bug. Equal-cost alternatives either overwrite or do not depending on the comparison, so the printed route is one of several and must not be read as canonical. And an unreachable destination has a null parent and an Infinity distance, so the pass must report nothing before walking, rather than returning a one-element list built from a node that was never settled.',
    walkthrough:
      'Five nodes with undirected weighted edges 0 -> 1 weight 2, 1 -> 2 weight 1, 0 -> 3 weight 4, 3 -> 4 weight 1, 2 -> 4 weight 3, source 0. In settled order: settle 0 and write 1 at 2 with parent 0 and 3 at 4 with parent 0. Settle 1 at 2 and write 2 at 3 with parent 1. Settle 2 at 3 and write 4 at 6 with parent 2, so the chain from 4 then reads 4,2,1,0. Settle 3 at 4, relax 4 and find 4 + 1 = 5 below 6, so 4 is rewritten to 5 and its parent is rewritten to 3 — the second write, and the one that decides whether the printed route is honest. Settle 4 at 5. The distance array is [0,2,3,4,5] and the parent array is [null,0,1,0,3]. Walk 4 upward: 4 from 3, 3 from 0, 0 has a null parent, so the collected chain is 4,3,0 and the reversed route is 0,3,4 at distance 5 — and summing the edges of that route, 4 + 1, gives the same 5, which is the assertion to make rather than to assume. Now the failure in numbers: keep the parent written at first discovery and 4 still points at 2, so the printed trip is 0,1,2,4 whose edges add to 2 + 1 + 3 = 6 while the function reports the distance 5 — one answer contradicts the other inside the same object. Add a sixth node with no edges, ask for it from 0, and its distance is Infinity with a null parent, so the pass must return nothing rather than a route that starts at a node nothing ever reached.',
    commonMistake:
      'Writing the parent when a node is first discovered instead of when its distance improves, or reconstructing the route by summing edges and comparing against the distance rather than following the parents.',
    whyWrong:
      'First-discovery parents are the breadth-first habit and they are wrong under weights: on this graph 4 is discovered from 2 at cost 6 and would keep parent 2 forever, so the printed route costs 6 while the distance array says 5, and a caller that draws the route from the parent array ships a trip that is not the one it was charged for. Reconstructing by summation without a parent array is the other failure: it needs the distance of every node on a route it does not yet have, and walking backwards from 4 by choosing any neighbour with a smaller label picks 2 at 3 as plausibly as 3 at 4, then discovers the arithmetic does not close and has to search again — which is a quadratic re-derivation of the one array that the relaxation already had.',
    followUps: [
      'Two routes tie at the same total. Which comparison decides which one the parent array keeps, and how would you return both?',
      'Return the route as edges with their weights and verify that the sum equals the distance. Which line of your own implementation could that assertion catch?',
      'The graph is mutated between two queries and one distance drops. Which entries of the parent array become unsafe, and how do you find them?',
      'Extract the chain without reversing by walking it twice. What is the trade, and which version wins when the chain is long?',
    ],
    solution:
      buildAdj + '\n' +
      minHeap + '\n' +
      '\n' +
      'function shortestPathWithParents(adj, source, destination) {\n' +
      '  const dist = new Array(adj.length).fill(Infinity);\n' +
      '  const parent = new Array(adj.length).fill(null);\n' +
      '  const settled = new Set();\n' +
      '  dist[source] = 0;\n' +
      '  const heap = new MinHeap(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });\n' +
      '  heap.push([0, source]);\n' +
      '  while (heap.size() > 0) {\n' +
      '    const top = heap.pop();\n' +
      '    const node = top[1];\n' +
      '    if (settled.has(node)) continue;\n' +
      '    settled.add(node);\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const weight = edge[2] === undefined ? 0 : edge[2];\n' +
      '      if (weight < 0) throw new Error("dijkstra needs non-negative weights");\n' +
      '      const next = edge[1];\n' +
      '      const via = dist[node] + weight;\n' +
      '      if (via < dist[next]) {\n' +
      '        dist[next] = via;\n' +
      '        parent[next] = node;\n' +
      '        heap.push([via, next]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  if (dist[destination] === Infinity) return null;\n' +
      '  const path = [];\n' +
      '  for (let at = destination; at !== null; at = parent[at]) path.push(at);\n' +
      '  return { distance: dist[destination], path: path.reverse() };\n' +
      '}\n' +
      '\n' +
      'function pathCost(adj, path) {\n' +
      '  let total = 0;\n' +
      '  for (let i = 0; i + 1 < path.length; i += 1) {\n' +
      '    const link = adj[path[i]].filter((edge) => edge[1] === path[i + 1]);\n' +
      '    if (link.length === 0) return null;\n' +
      '    total += Math.min.apply(null, link.map((edge) => (edge[2] === undefined ? 0 : edge[2])));\n' +
      '  }\n' +
      '  return total;\n' +
      '}',
    modify:
      'Every edge now carries a fare and a duration and the route must minimise the fare with duration as the tie-break. Which comparison changes, and does one parent array still describe the answer?',
  },
  {
    step: 15,
    name: 'Shortest Distance in a Binary Maze',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Cross a grid where free cells cost one and blocked cells cost two, and hand the input back unchanged.',
    brief:
      'Input: a matrix of 0 and 1 cells with a start and a destination that are both free; moves are the four orthogonal steps. Output: the minimum cost of reaching the destination cell including its own entry cost, or -1. The deciding fact is that entry costs differ by cell, so this is a weighted graph on cells and not a breadth-first band.',
    concepts: [
      'dsa-g15b-bfs-band-is-the-distance',
      'dsa-g15b-dijkstra-needs-nonnegative-weights',
      'dsa-g15b-predecessor-array-extracts-the-path',
      'dsa-coordinate-loops',
      'dsa-flattened-index-mapping',
    ],
    shortAnswer:
      'Treat each cell as a vertex whose edge into a neighbour costs one for a free cell and two for a blocked one, run the weighted pass from the start at zero, and answer with the label of the destination.',
    idealAnswer:
      'A maze of 0 and 1 cells is a graph with one vertex per cell and edges weighted 1 and 2 by the cell entered, so the honest tool is a weighted shortest-path pass and not a queue of bands: the cheapest route may deliberately cross a blocked cell to avoid a longer free detour, and breadth-first search reports the route with the fewest steps, which is a different quantity. Cost is O(V log V) over cells with a heap and O(V) memory. The double-ended queue is worth naming, but only for its own weights: it is exact when the two values are 0 and 1, because a zero-cost neighbour belongs at the front of the current band and a cost-one neighbour at the back of the next, and that is the sibling convention charging nothing for a free cell and one for a wall — a different question from this one, since cost here is steps plus wall crossings and the two objectives can disagree on a grid whose wall-fewest route wanders. Contract details: the destination charge includes entering it, so 0 is reserved for a start that equals the destination and is the test that catches an implementation charging the start; unreachable cells return -1 while the internal labels hold Infinity, and mixing the two sentinels inside one function is a bug waiting for a caller; and marking visited cells by overwriting the maze is worse than destructive — a cell written with a step count reads as 1 and is then charged as blocked on the next pass over the same matrix.',
    walkthrough:
      'The grid 0 1 1 1 / 0 0 1 0 / 1 1 1 0 / 0 0 1 0 from 0,0 to 3,3, where a move costs 1 into a free cell and 2 into a wall and the start costs nothing. Labels begin at 0,0 with everything else Infinity. Pop 0,0 at 0: 1,0 is free and gets 1, 0,1 is a wall and gets 2. Pop 1,0 at 1: 1,1 is free and gets 2, the wall 2,0 gets 3. Pop whichever of the entries sitting at 2 comes first — the default comparator orders by cost only, so the tie is heap layout and neither write depends on it. From 1,1 the only unvisited neighbour is the wall 1,2 at 2 + 2 = 4, then the free 1,3 at 5, 2,3 at 6 and 3,3 at 7. The pass returns 7 along 0,0 - 1,0 - 1,1 - 1,2 - 1,3 - 2,3 - 3,3: six steps with exactly one wall entered. That optimum is visible before any queue runs: the free cells touching the start are 0,0, 1,0, 1,1, the free cells touching the destination are 1,3, 2,3, 3,3, 3,1, 3,0, and the two sets are disconnected through free cells only, so at least one wall must be entered while the Manhattan floor of six steps is reachable at the same time — 6 + 1 = 7 and nothing can beat it. The grid that separates the two conventions is 0 1 0 / 0 1 0 / 0 0 0 from 0,0 to 0,2: crossing the wall at 0,1 costs 1 + 2 = 3 and is the cheapest trip, while the wall-free route around the bottom is six free steps costing 6. This pass returns 3; a double-ended queue charged 0 for a free cell and 1 for a wall returns 0. Both are right about different questions.',
    commonMistake:
      'Running plain breadth-first search and reporting the number of cells crossed, or overwriting maze cells with a visited mark to save the label array.',
    whyWrong:
      'The band count answers fewest steps, not least cost: on the grid 0 1 0 / 0 1 0 / 0 0 0 from 0,0 to 0,2 a plain queue reports 2 because two moves exist, while the cheapest trip costs 3 because the middle of those two moves is a wall charged at 2 — and the bug is invisible on every maze whose cheapest route happens to also be its shortest, which is most of the small examples a candidate writes on a whiteboard. Overwriting the maze is the second failure and it survives the first call: the pass returns the right cost, marks the cells it visited with step counts, and a second query on the same matrix now reads those cells as walls and charges 2 to enter a cell that was free, so the answer inflates by the number of cells the earlier search touched — and if the caller asks whether the maze can be crossed at all, a 7 written over a wall also reads back as an open cell in any later pass that tests for a nonzero label instead of a zero value. That is why the version here copies the grid and keeps its labels in a separate array.',
    followUps: [
      'Replace the heap with the two-ended queue. Which single line decides whether a neighbour goes to the front or the back, and why is that the whole algorithm?',
      'Report the route as cells rather than the cost. Which extra array does that need, and where does the destination charge appear in it?',
      'The maze is re-queried with many destinations from one start. What do you keep between queries, and what do you refuse to keep?',
      'Moves now include diagonals at cost two. Which part of the pass notices, and does the two-ended queue still work?',
    ],
    solution:
      buildAdj + '\n' +
      minHeap + '\n' +
      dirs4 + '\n' +
      copyGrid + '\n' +
      '\n' +
      'function binaryMazeCost(maze, start, target) {\n' +
      '  const grid = copyGrid(maze);\n' +
      '  if (!inGrid(grid, start[0], start[1]) || !inGrid(grid, target[0], target[1])) return -1;\n' +
      '  if (grid[start[0]][start[1]] !== 0 || grid[target[0]][target[1]] !== 0) return -1;\n' +
      '  const label = grid.map((row) => row.map(() => Infinity));\n' +
      '  label[start[0]][start[1]] = 0;\n' +
      '  const heap = new MinHeap();\n' +
      '  heap.push([0, start]);\n' +
      '  while (heap.size() > 0) {\n' +
      '    const top = heap.pop();\n' +
      '    const row = top[1][0];\n' +
      '    const col = top[1][1];\n' +
      '    if (top[0] > label[row][col]) continue;\n' +
      '    if (row === target[0] && col === target[1]) return top[0];\n' +
      '    for (const move of DIRS4) {\n' +
      '      const r = row + move[0];\n' +
      '      const c = col + move[1];\n' +
      '      if (!inGrid(grid, r, c)) continue;\n' +
      '      const via = top[0] + 1 + grid[r][c];\n' +
      '      if (via < label[r][c]) {\n' +
      '        label[r][c] = via;\n' +
      '        heap.push([via, [r, c]]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return -1;\n' +
      '}\n' +
      '\n' +
      'function zeroOneMazeCost(maze, start, target) {\n' +
      '  const grid = copyGrid(maze);\n' +
      '  if (!inGrid(grid, start[0], start[1]) || !inGrid(grid, target[0], target[1])) return -1;\n' +
      '  if (grid[start[0]][start[1]] !== 0 || grid[target[0]][target[1]] !== 0) return -1;\n' +
      '  const label = grid.map((row) => row.map(() => Infinity));\n' +
      '  label[start[0]][start[1]] = 0;\n' +
      '  const deque = [[start[0], start[1]]];\n' +
      '  while (deque.length > 0) {\n' +
      '    const cell = deque.shift();\n' +
      '    const row = cell[0];\n' +
      '    const col = cell[1];\n' +
      '    if (row === target[0] && col === target[1]) return label[row][col];\n' +
      '    for (const move of DIRS4) {\n' +
      '      const r = row + move[0];\n' +
      '      const c = col + move[1];\n' +
      '      if (!inGrid(grid, r, c)) continue;\n' +
      '      const weight = grid[r][c] === 0 ? 0 : 1;\n' +
      '      if (label[row][col] + weight < label[r][c]) {\n' +
      '        label[r][c] = label[row][col] + weight;\n' +
      '        if (weight === 0) deque.unshift([r, c]);\n' +
      '        else deque.push([r, c]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return label[target[0]][target[1]] === Infinity ? -1 : label[target[0]][target[1]];\n' +
      '}',
    modify:
      'Blocked cells may now be entered at a cost of five and the question becomes whether to pay or to detour. Which of the two structures above still answers it, what does the other one have to become, and what does the front-of-queue rule stop meaning?',
  },
  {
    step: 15,
    name: 'Path With Minimum Effort',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Minimise the largest height jump along a route through a grid instead of its length, and say which part of the shortest-path algorithm changes.',
    brief:
      'Input: a matrix of integer heights; moves are the four orthogonal steps and the route runs from the top-left cell to the bottom-right one. Output: the smallest achievable value of the worst absolute difference between neighbouring cells on the route. The deciding fact is that the objective is a bottleneck, so the label carried along a route is a maximum rather than a sum.',
    concepts: [
      'dsa-g15b-bottleneck-minimises-the-max-edge',
      'dsa-g15b-dijkstra-needs-nonnegative-weights',
      'dsa-g15b-stale-heap-entry-is-skipped',
      'dsa-minimize-maximum',
      'dsa-answer-range-search',
    ],
    shortAnswer:
      'Carry the worst jump so far instead of the total, relax with the larger of the two instead of the sum, and settle cells by that label. The answer is the label of the destination cell.',
    idealAnswer:
      'The greedy settle still works because the label is monotone along a route: extending a path can never lower the worst jump already on it, so a cell popped with the smallest current worst-jump is final for the same reason a distance is final in the summing version — and the non-negative requirement is satisfied automatically, since an absolute difference is never below zero. Only the combine operator changes, and that is the answer to the interviewer who asks what the algorithm is really doing: it settles vertices by a label that cannot decrease under extension, and summing happens to be one such combine while maxing is another. Cost is O(V log V) over cells with a heap and O(V) memory. Two traps are specific to the bottleneck. Minimising the maximum is not minimising the sum: a route of two jumps of 4 has effort 4 and total 8, while a route with one jump of 7 has effort 7 and total 7, so the cheapest-sum route is the effort loser and the pass must never compare sums. And the second question is always asked — the answer can also be found by bisecting the effort budget and running a reachability pass that may only cross jumps within the cap, which is legal because feasibility is monotone in the cap: if a route exists with worst jump x then one exists for every larger cap. That version costs O(V log W) with W the height range, and its trap is state reuse: the visited grid belongs to one cap attempt and must be rebuilt for the next.',
    walkthrough:
      'The grid 1 2 2 / 3 8 2 / 5 3 5 asks for a route from 0,0 to 2,2. Labels start at Infinity with 0,0 at 0. Pop 0,0 at 0 and relax its two neighbours: into 1,0 the jump is |3 - 1| = 2 so the label becomes max(0, 2) = 2, and into 0,1 the jump is 1 so the label becomes 1. Pop 0,1 at 1: into 0,2 the jump is |2 - 2| = 0 so the label stays 1, and into 1,1 the jump is |8 - 2| = 6 so the label becomes 6. Pop 0,2 at 1: into 1,2 the jump is |2 - 2| = 0, so 1,2 gets label 1 — the top-right corner of this grid is a corridor of equal heights, and the pass carries a label of 1 through three cells that a summing pass would have priced at 3 steps. Pop 1,2 at 1: into 2,2 the jump is |5 - 2| = 3 so the destination label becomes 3, and into 1,1 the jump is 6 giving max(1, 6) = 7, which is worse than the 6 already recorded and is discarded. Pop 1,0 at 2: into 2,0 the jump is |5 - 3| = 2 so 2,0 gets 2. Pop 2,0 at 2: into 2,1 the jump is |3 - 5| = 2 so 2,1 gets 2. Pop 2,1 at 2: into 2,2 the jump is |5 - 3| = 2, giving max(2, 2) = 2, which beats the 3 recorded earlier, so 2,2 is rewritten to 2 and the entry carrying 3 becomes the stale one that is skipped when it surfaces. The answer is 2, along the route 0,0 -> 1,0 -> 2,0 -> 2,1 -> 2,2 whose jumps are 2, 2, 2, 2. The single row 1 3 5 is the control: the only route has jumps 2 and 2, so the effort is 2 while the summed difference is 4, and the two objectives disagree on the first input you can write down.',
    commonMistake:
      'Relaxing with a sum of jumps, or bisecting the answer with a reachability pass that keeps one visited grid across all cap attempts.',
    whyWrong:
      'Summing answers a different question: on the three-by-three grid the route along the right edge has jumps 1, 0, 3 for a total of 4 and a worst jump of 3, while the bottom route has jumps 2, 2, 2, 2 for a total of 6 and a worst of 2 — a summing pass returns the right-edge route as better and reports 3, which is not the effort answer. Sharing the visited grid across bisection steps is the quieter failure: a cell entered under a cap of 2 through a jump of 2 stays marked when the cap drops to 1, so the next attempt believes the cell is handled and reports unreachable for a cap that would have been reached another way, and the monotonicity the bisection relies on is broken by the implementation rather than by the problem.',
    followUps: [
      'Prove the settle-by-maximum argument in one sentence. Which property of the combine operator does it use instead of additivity?',
      'Return the route as well as the effort. Does the parent array from the weighted rows still describe a valid tree when the label is a maximum?',
      'Give the bisection version and state its complexity in the height range. Which version wins when heights are huge and the grid is small?',
      'Add a free move between cells of equal height. Which part of the pass notices, and can the effort answer go down?',
    ],
    solution:
      buildAdj + '\n' +
      minHeap + '\n' +
      dirs4 + '\n' +
      '\n' +
      'function minimumEffortPath(heights) {\n' +
      '  const rows = heights.length;\n' +
      '  const cols = heights[0].length;\n' +
      '  const label = heights.map((row) => row.map(() => Infinity));\n' +
      '  label[0][0] = 0;\n' +
      '  const heap = new MinHeap();\n' +
      '  heap.push([0, [0, 0]]);\n' +
      '  while (heap.size() > 0) {\n' +
      '    const top = heap.pop();\n' +
      '    const row = top[1][0];\n' +
      '    const col = top[1][1];\n' +
      '    if (top[0] > label[row][col]) continue;\n' +
      '    if (row === rows - 1 && col === cols - 1) return top[0];\n' +
      '    for (const move of DIRS4) {\n' +
      '      const r = row + move[0];\n' +
      '      const c = col + move[1];\n' +
      '      if (!inGrid(heights, r, c)) continue;\n' +
      '      const jump = Math.abs(heights[row][col] - heights[r][c]);\n' +
      '      const via = Math.max(top[0], jump);\n' +
      '      if (via < label[r][c]) {\n' +
      '        label[r][c] = via;\n' +
      '        heap.push([via, [r, c]]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return label[rows - 1][cols - 1];\n' +
      '}\n' +
      '\n' +
      'function effortByBisection(heights) {\n' +
      '  const rows = heights.length;\n' +
      '  const cols = heights[0].length;\n' +
      '  let low = 0;\n' +
      '  let high = 0;\n' +
      '  for (const row of heights) for (const value of row) if (value > high) high = value;\n' +
      '  const reachable = (cap) => {\n' +
      '    const seen = heights.map((row) => row.map(() => false));\n' +
      '    const queue = [[0, 0]];\n' +
      '    seen[0][0] = true;\n' +
      '    let head = 0;\n' +
      '    while (head < queue.length) {\n' +
      '      const cell = queue[head];\n' +
      '      head += 1;\n' +
      '      if (cell[0] === rows - 1 && cell[1] === cols - 1) return true;\n' +
      '      for (const move of DIRS4) {\n' +
      '        const r = cell[0] + move[0];\n' +
      '        const c = cell[1] + move[1];\n' +
      '        if (!inGrid(heights, r, c) || seen[r][c]) continue;\n' +
      '        if (Math.abs(heights[cell[0]][cell[1]] - heights[r][c]) > cap) continue;\n' +
      '        seen[r][c] = true;\n' +
      '        queue.push([r, c]);\n' +
      '      }\n' +
      '    }\n' +
      '    return false;\n' +
      '  };\n' +
      '  while (low < high) {\n' +
      '    const mid = (low + high) >> 1;\n' +
      '    if (reachable(mid)) high = mid;\n' +
      '    else low = mid + 1;\n' +
      '  }\n' +
      '  return low;\n' +
      '}',
    modify:
      'The route must now minimise the worst jump but, among routes with that worst jump, take the fewest steps. Which label becomes a pair, and does the greedy settle still hold on the pair?',
  },
  {
    step: 15,
    name: 'Cheapest Flights Within K Stops',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Find the cheapest route that spends at most K intermediate stops, and say why the priority queue version is the wrong tool here.',
    brief:
      'Input: a city count, flights as [from, to, price] triples, a source, a destination and a stop budget K. Output: the cheapest price using at most K stops, or -1. The deciding fact is that the budget counts stops rather than cost, so the search is layered by hop count and a cheap-but-long route prunes nothing.',
    concepts: [
      'dsa-g15b-k-stops-layers-the-relaxation',
      'dsa-g15b-dag-relaxes-in-topo-order',
      'dsa-g15b-dijkstra-needs-nonnegative-weights',
      'dsa-accumulator-parameter',
      'dsa-complexity-counting',
    ],
    shortAnswer:
      'Relax by layer: read a frozen copy of the prices from the previous number of edges and write improvements into the current one. After stops plus one such round the destination holds the cheapest price within budget, because round r has spent at most r plus one edges.',
    idealAnswer:
      'The budget is a hop constraint, so the right invariant is a distance measured in edges rather than in price, and the way to hold both is to run K + 1 rounds of relaxation where each round reads the previous round array and writes the current one: after round r, the recorded price is the cheapest reachable with at most r - 1 stops, which is one edge more generous than the depth-first version that counts edges already spent. Cost is O(K * E) time and O(V) space, and the rounds are bounded by design, which is what makes a positive-price cycle harmless — it can be flown at most K + 1 times whether or not it is profitable. The in-place trap is the heart of this row: relaxing into the array being read lets two fresh edges be taken inside one round, so the budget silently becomes unlimited, and the cheapest price of any length leaks into the answer. The comparison to the heap version is a permanent-claim argument rather than a tie-break: the greedy settles a city by price, and a cheaper expensive route that arrives later is discarded, but the cheapest route may be the long one and the constraint is on length. This implementation refuses negative prices outright, because a negative cycle inside the hop budget makes the cheapest price a function of how many laps you are allowed to fly, and the honest output at that point is that the budget is what bounds the search.',
    walkthrough:
      'Four cities with flights 0 -> 1 at 100, 1 -> 2 at 100, 2 -> 0 at 100, 1 -> 3 at 600, 2 -> 3 at 200, source 0, destination 3, budget 1 stop. Round 1 copies the price array [0, Inf, Inf, Inf] into a frozen previous layer and reads only that copy: from 0 at 0 it relaxes 1 to 100, so the array becomes [0, 100, Inf, Inf] with one edge spent and no stop used. Round 2 reads round one: city 2 becomes 200 through 0 -> 1 -> 2 and city 3 becomes 100 + 600 = 700, while the 2 -> 3 road is judged from the copy, where city 2 was still Infinity, so it writes nothing. Budget spent, answer 700 — exactly one stop at city 1. One more round turns 200 + 200 = 400 into the price of city 3, the route 0, 1, 2, 3 with two stops, so 400 answers the budget-2 question and 700 the budget-1 question. Drop the copy and the budget-1 input returns 400: round 1 writes 1 at 100, the 1 -> 2 entry sees that fresh 100 and writes 2 at 200, then 2 -> 3 reads the fresh 200 — three edges charged to a one-stop budget. The price-greedy fails differently: with flights 0 -> 1 at 1, 1 -> 2 at 1, 0 -> 2 at 5, 2 -> 3 at 1 and a budget of 1 stop it settles city 2 at the two-edge price 2, stamps it with the one-edge count taken from the 0 -> 2 flight and answers 3, where the layered pass answers 6. One price array cannot carry both quantities, which is why this row is layered and not weighted.',
    commonMistake:
      'Relaxing into the same array being read, or trusting a heap-based prune that settles a city by price and keeps a single label per city.',
    whyWrong:
      'In-place relaxation makes the round count meaningless: on the four-city example above a budget of 1 stop returns 400 instead of 700, which is a wrong answer that is cheaper than the truth — the one direction a caller never notices, because a too-expensive result looks like a tight budget while a too-cheap one gets booked. The heap prune fails for a reason that has nothing to do with ties: on cities 0..3 with flights 0 -> 1 at 1, 1 -> 2 at 1, 0 -> 2 at 5, 2 -> 3 at 1 and a budget of 1 stop it answers 3 where the layered pass answers 6, because it attached a two-stop price to a one-stop edge count and the constraint was on edges all along. The third failure is the off-by-one in the rounds, and it cuts both ways: one round too many turns the budget-1 example into 400, the two-stop price, while one round too few leaves city 3 at Infinity and the function returns -1 for a route that exists at 700. And a version that charges the destination itself, returning the price of the last flight instead of the sum, is caught by the same budget-0 single-flight input: one flight 0 -> 1 at 5 with no stops allowed must answer 5.',
    followUps: [
      'Give the depth-first version that carries the stops used as a parameter and prunes on a best-so-far array. Why is its complexity exponential in the worst case?',
      'Flights may now include a negative price. Which line of the layered version still answers, what does the greedy version do, and where does the honest answer stop being a number?',
      'The budget is per city rather than per route: a city may be visited at most twice. Which array changes shape, and what does a round now mean?',
      'Return the route as city names as well as the price. Which parent array works when the relaxation is layered, and why is the one from the weighted rows unsafe?',
    ],
    solution:
      buildAdj + '\n' +
      minHeap + '\n' +
      '\n' +
      'function cheapestWithinStops(cities, flights, source, destination, stops) {\n' +
      '  const best = new Array(cities).fill(Infinity);\n' +
      '  best[source] = 0;\n' +
      '  for (let round = 0; round < stops + 1; round += 1) {\n' +
      '    const previous = best.slice();\n' +
      '    for (const flight of flights) {\n' +
      '      const from = flight[0];\n' +
      '      const to = flight[1];\n' +
      '      const price = flight[2];\n' +
      '      if (previous[from] === Infinity) continue;\n' +
      '      const via = previous[from] + price;\n' +
      '      if (via < best[to]) best[to] = via;\n' +
      '    }\n' +
      '  }\n' +
      '  return best[destination] === Infinity ? -1 : best[destination];\n' +
      '}\n' +
      '\n' +
      'function cheapestByDijkstra(cities, flights, source, destination, stops) {\n' +
      '  const adj = buildAdj(cities, flights, true);\n' +
      '  const best = new Array(cities).fill(Infinity);\n' +
      '  const used = new Array(cities).fill(Infinity);\n' +
      '  const settled = new Set();\n' +
      '  best[source] = 0;\n' +
      '  used[source] = 0;\n' +
      '  const heap = new MinHeap();\n' +
      '  heap.push([0, [source, 0]]);\n' +
      '  while (heap.size() > 0) {\n' +
      '    const top = heap.pop();\n' +
      '    const node = top[1][0];\n' +
      '    const edges = top[1][1];\n' +
      '    if (node === destination) return best[destination];\n' +
      '    if (settled.has(node) && used[node] <= edges) continue;\n' +
      '    settled.add(node);\n' +
      '    used[node] = edges;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const price = edge[2] === undefined ? 0 : edge[2];\n' +
      '      if (price < 0) throw new Error("a negative cycle makes the budget the answer");\n' +
      '      if (edges + 1 > stops + 1) continue;\n' +
      '      if (best[node] + price < best[edge[1]]) {\n' +
      '        best[edge[1]] = best[node] + price;\n' +
      '        heap.push([best[edge[1]], [edge[1], edges + 1]]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return best[destination] === Infinity ? -1 : best[destination];\n' +
      '}',
    modify:
      'A route may now revisit a city but a city may be flown at most twice in total. Which array changes shape, and does the frozen-previous-layer trick still bound the search?',
  },
  {
    step: 15,
    name: 'Network Delay Time',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Return the moment the last node in a broadcast has heard the message, and say what happens when the broadcast cannot reach all of them.',
    brief:
      'Input: directed travel times as [from, to, time] triples, a node count with nodes numbered from 1, and a source node. Output: the maximum arrival time over all nodes, or -1 if any node never receives. The deciding fact is that one weighted pass gives every arrival and the answer is its maximum, not its sum.',
    concepts: [
      'dsa-g15b-dijkstra-needs-nonnegative-weights',
      'dsa-g15b-stale-heap-entry-is-skipped',
      'dsa-heap-guarantees-only-the-root',
      'dsa-loop-invariant',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      'Relax the broadcast over the directed weighted graph, then take the largest finite arrival. If any node is still holding Infinity, the signal never reaches it and the answer is -1.',
    idealAnswer:
      'A broadcast along a tree of routes finishes when its slowest branch delivers, and the slowest delivery is exactly the eccentricity of the source in the directed weighted graph, so the answer is a maximum over the distance array rather than anything accumulated during the pass. Cost is O(E log V) with a heap, or O(V squared + E) with the scan, and the whole row is that pass plus one fold. Two boundary decisions are the substance of the question. Nodes numbered from 1 against arrays indexed from 0 is the classic off-by-one, and the honest options are an off-by-one offset in every access or one extra slot at index 0 that is never seeded — the second is safer because a forgotten offset produces an answer about a node that does not exist rather than an exception. And the -1 must come from an unreachable node, not from an empty result, because a partially connected network still has a maximum over the nodes it reaches, and reporting that number tells the caller the broadcast succeeded when a node never heard anything. A third point worth volunteering: the arrival labels define a shortest-path tree, so if the follow-up asks when a specific node hears, the answer is already in the array, and the maximum costs nothing extra.',
    walkthrough:
      'Three nodes with travel times 1 -> 2 at 2, 1 -> 3 at 5, 2 -> 3 at 2, source 1. The labels begin [1: 0, 2: Inf, 3: Inf] and the heap holds the source alone. Pop 1 at 0: relax 2 to 2 and 3 to 5. Pop 2 at 2: relax 3, and 2 + 2 = 4 replaces 5, pushing a second entry for 3 while the entry carrying 5 is still in the array. Pop 3 at 4: it is the destination of the broadcast and the maximum so far. Pop 3 at 5 and discard it as stale. The array reads [_, 0, 2, 4], the maximum over nodes 1..3 is 4, and the route that delivers last is 1 -> 2 -> 3 — the entry that was replaced in the array is the direct edge the pass stopped trusting. Now the input that decides the sentinel: nodes 1..4 with times 1 -> 2 at 1 and 3 -> 4 at 1 from source 1. Node 1 reaches node 2 only, nodes 3 and 4 keep Infinity, and the maximum over the array would be 1 if the unreachable entries were skipped — the correct answer is -1, because node 3 and node 4 never hear the message. The third check is the index contract: with nodes numbered from 1 and an array of length n rather than n + 1, the access for node n reads index n on an array whose last index is n - 1, so the arrival for the highest node is silently undefined and Math.max over the slice returns NaN, which compares false against everything and is reported as unreachable.',
    commonMistake:
      'Summing the travel times instead of maximising the arrivals, or answering with the maximum over whatever the pass reached instead of checking that everything was reached.',
    whyWrong:
      'Summing is the mistake a candidate makes when they have just read the distances: for 1 -> 2 at 2 and 1 -> 3 at 5 the sum is 7 while the network is quiet after 5, because the two sends travel in parallel and the answer is the later one, not the total work. Answering with the maximum over reached nodes is the second failure and it is dangerous precisely because it returns a plausible number: on the four-node input above it answers 1 for a broadcast that leaves two servers silent, and the caller reads a delay rather than a partition. A third variant is seeding the pass from the edge list rather than from the source label, which on a graph where the source has no outgoing edge returns the source at 0 and everything else Infinity and then reports 0 — a delay of zero for a network that never heard anything.',
    followUps: [
      'Report the node that hears last and the route that delivered to it. Which extra array does that need, and is it the same parent array as the path-printing row?',
      'The source can send to only one node at a time. Which assumption in the model breaks, and what replaces the distance array?',
      'The times arrive as [u, v] pairs with unit delay. Which of the two structures becomes the right one, and what happens to the maximum?',
      'The network is re-queried from a different source after every edge insertion. What would you cache, and what would you refuse to cache?',
    ],
    solution:
      buildAdj + '\n' +
      minHeap + '\n' +
      '\n' +
      'function networkDelay(times, nodes, source) {\n' +
      '  const adj = buildAdj(nodes + 1, times, true);\n' +
      '  const dist = new Array(nodes + 1).fill(Infinity);\n' +
      '  const settled = new Set();\n' +
      '  let arrivals = 0;\n' +
      '  dist[source] = 0;\n' +
      '  const heap = new MinHeap(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });\n' +
      '  heap.push([0, source]);\n' +
      '  while (heap.size() > 0) {\n' +
      '    const top = heap.pop();\n' +
      '    const node = top[1];\n' +
      '    if (node === 0 || settled.has(node)) continue;\n' +
      '    settled.add(node);\n' +
      '    arrivals += 1;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const weight = edge[2] === undefined ? 0 : edge[2];\n' +
      '      if (weight < 0) throw new Error("a broadcast cannot travel back in time");\n' +
      '      if (settled.has(edge[1])) continue;\n' +
      '      if (dist[node] + weight < dist[edge[1]]) {\n' +
      '        dist[edge[1]] = dist[node] + weight;\n' +
      '        heap.push([dist[edge[1]], edge[1]]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  if (arrivals < nodes) return -1;\n' +
      '  let slowest = 0;\n' +
      '  for (let node = 1; node <= nodes; node += 1) {\n' +
      '    if (dist[node] === Infinity) return -1;\n' +
      '    if (dist[node] > slowest) slowest = dist[node];\n' +
      '  }\n' +
      '  return slowest;\n' +
      '}\n' +
      '\n' +
      'function broadcastTree(times, nodes, source) {\n' +
      '  const adj = buildAdj(nodes + 1, times, true);\n' +
      '  const dist = new Array(nodes + 1).fill(Infinity);\n' +
      '  const parent = new Array(nodes + 1).fill(null);\n' +
      '  const settled = new Set();\n' +
      '  dist[source] = 0;\n' +
      '  const heap = new MinHeap();\n' +
      '  heap.push([0, source]);\n' +
      '  while (heap.size() > 0) {\n' +
      '    const top = heap.pop();\n' +
      '    if (settled.has(top[1])) continue;\n' +
      '    settled.add(top[1]);\n' +
      '    for (const edge of adj[top[1]]) {\n' +
      '      const weight = edge[2] === undefined ? 0 : edge[2];\n' +
      '      if (dist[top[1]] + weight < dist[edge[1]]) {\n' +
      '        dist[edge[1]] = dist[top[1]] + weight;\n' +
      '        parent[edge[1]] = top[1];\n' +
      '        heap.push([dist[edge[1]], edge[1]]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return { dist: dist, parent: parent };\n' +
      '}',
    modify:
      'The sender can push to only one neighbour at a time and must plan the send order. Which quantity replaces the distance array, and why does the maximum over arrivals stop being the answer?',
  },
  {
    step: 15,
    name: 'Number of Ways to Arrive at Destination',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Count the routes that arrive fastest, and say what happens to a count when a cheaper route turns up after it.',
    brief:
      'Input: a node count, roads as [a, b, time] triples usable in both directions, a source and a destination. Output: how many routes achieve the minimum travel time, modulo 1000000007. The deciding fact is that the count is folded into the distance relaxation, so it is only trustworthy if every contribution comes from a node that is already final.',
    concepts: [
      'dsa-g15b-counts-of-shortest-paths-add-on-ties',
      'dsa-g15b-dijkstra-needs-nonnegative-weights',
      'dsa-g15b-stale-heap-entry-is-skipped',
      'dsa-heap-guarantees-only-the-root',
      'dsa-loop-invariant',
    ],
    shortAnswer:
      'Run the weighted pass with a second array beside the distances. A strictly better arrival replaces the distance and the count together; an exactly equal arrival adds the predecessor’s count in modulo 1000000007. Read the destination’s count when the destination settles, because every node that can feed it at the minimum time is then already final.',
    idealAnswer:
      'Every fastest route into a node arrives from a node at a strictly smaller time, because a road costs something, so the fastest routes form an acyclic graph ordered by distance and a count folded along that order is complete the instant the node is settled. Relaxation then has exactly two branches that do opposite things: a strictly better arrival discards everything counted so far, since those counts belonged to slower routes, so distance and count are replaced as a pair; an equal arrival adds the predecessor’s count in, since the two routes are genuinely different and both fastest. That is why the source holds one rather than zero, and why a plain visited flag is not enough — the node has to be final before its count is carried out. Cost is the cost of the pass, O(E log V) with a heap or O(V squared + E) with the scan, plus two arrays of length V, and the modulus is not cosmetic: one layer of two parallel roads doubles the count, so k stacked layers give two to the k routes, and the fold happens at every addition because the running sum is what is carried into the next layer. The trap this row tests is which branch adds: adding on the better branch counts fast and slow routes together, reading the count the first time the destination is touched reports one route, and counting all routes instead of fastest ones answers a question nobody asked. Zero-time roads are the deeper cut, because they let a node settle before a same-distance peer contributes, and the repair is to process equal-distance bands together rather than to trust the pop order.',
    walkthrough:
      'Four nodes with roads 0 - 1 at 1, 0 - 2 at 1, 1 - 3 at 1, 2 - 3 at 1 and a direct 0 - 3 at 4. The arrays begin dist [0, Inf, Inf, Inf] and ways [1, 0, 0, 0]. Settle 0 at 0: it writes 1 with time 1 count 1, 2 with time 1 count 1, and 3 with time 4 count 1. Settle 1 at 1: the road 1 - 3 arrives at 2, which beats the stored 4, so the pair is replaced — dist 3 is 2 and ways 3 is 1, and the count the direct road wrote is thrown away because a four-minute route is not a fastest route. Settle 2 at 1: the road 2 - 3 also arrives at 2, exactly equal, so the count adds and ways 3 becomes 2. Settle 3 at 2: the destination is final, the answer is 2, and the stale entry still carrying 4 is skipped when it surfaces. The same pass on seven nodes with roads 0 - 6 at 7, 0 - 1 at 2, 1 - 2 at 3, 1 - 3 at 3, 6 - 3 at 3, 3 - 5 at 1, 4 - 5 at 2, 6 - 5 at 1, source 0 and destination 6, settles 6 at 7 with count 2: the direct road and the route 0, 1, 3, 5, 6 that ties it, while 0, 1, 3, 6 at 8 loses and never enters the sum. Stack two diamonds instead — 0 to 1 and 2, both to 3, 3 to 4 and 5, both to 6, every road one minute — and the counts read ways 3 = 2, ways 4 = 2, ways 5 = 2, ways 6 = 4, which is the doubling per layer that forces the modulus.',
    commonMistake:
      'Adding the predecessor’s count on the better branch as well as on the equal one, or returning as soon as the destination is first touched instead of when it settles.',
    whyWrong:
      'On the four-node trace graph, adding on the better branch leaves the direct road’s count of one underneath a replaced distance, so the pass answers 3 for a graph that has two fastest routes — and the extra one is the four-minute drive the caller explicitly did not ask about. Reading at first touch is the mirror failure on that same input: node 3 is first touched at time 4 with a count of one, so the answer comes back 1 and neither two-minute route is ever seen. Counting all routes rather than fastest routes is the quietest error, because on this graph the plain path count is also 3 — three routes exist and two of them arrive at the minimum time, which is exactly the pair of numbers the explanation has to keep apart. A fourth variant is summing at the end over the whole ways array instead of reading the destination, which answers 6 on the two-diamond graph where the count is 4, because intermediate nodes carry counts of their own. And with a zero-time road the settle-before-counting argument stops working at all: a node can settle before a peer at the same distance contributes, so the count of one layer is folded out of reach.',
    followUps: [
      'Return a fastest route as well as its count. Which array already holds the first one, and what extra state does the second need?',
      'Roads can cost zero. What breaks in the counting order, and how does popping equal-distance bands together repair it?',
      'Every road costs one. Which array disappears, and what does the recurrence for the count look like when the graph is read band by band?',
      'The caller wants routes arriving within D minutes, not only the fastest ones. Why does a single count per node stop being enough, and what state replaces it?',
    ],
    solution:
      buildAdj + '\n' +
      minHeap + '\n' +
      '\n' +
      'function countFastestRoutes(nodes, roads, source, destination) {\n' +
      '  const MOD = 1000000007;\n' +
      '  const adj = buildAdj(nodes, roads, false);\n' +
      '  const dist = new Array(nodes).fill(Infinity);\n' +
      '  const ways = new Array(nodes).fill(0);\n' +
      '  const settled = new Array(nodes).fill(false);\n' +
      '  dist[source] = 0;\n' +
      '  ways[source] = 1;\n' +
      '  const heap = new MinHeap(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });\n' +
      '  heap.push([0, source]);\n' +
      '  while (heap.size() > 0) {\n' +
      '    const top = heap.pop();\n' +
      '    const node = top[1];\n' +
      '    if (settled[node]) continue;\n' +
      '    settled[node] = true;\n' +
      '    if (node === destination) return ways[destination] % MOD;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const next = edge[1];\n' +
      '      const time = edge[2] === undefined ? 0 : edge[2];\n' +
      '      if (time < 0) throw new Error("a road cannot be travelled for negative time");\n' +
      '      if (settled[next]) continue;\n' +
      '      const via = dist[node] + time;\n' +
      '      if (via < dist[next]) {\n' +
      '        dist[next] = via;\n' +
      '        ways[next] = ways[node];\n' +
      '        heap.push([via, next]);\n' +
      '      } else if (via === dist[next]) {\n' +
      '        ways[next] = (ways[next] + ways[node]) % MOD;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return ways[destination] % MOD;\n' +
      '}\n' +
      '\n' +
      'function countFastestRoutesFull(nodes, roads, source, destination) {\n' +
      '  const MOD = 1000000007;\n' +
      '  const adj = buildAdj(nodes, roads, false);\n' +
      '  const dist = new Array(nodes).fill(Infinity);\n' +
      '  const ways = new Array(nodes).fill(0);\n' +
      '  const settled = new Array(nodes).fill(false);\n' +
      '  dist[source] = 0;\n' +
      '  ways[source] = 1;\n' +
      '  const heap = new MinHeap(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });\n' +
      '  heap.push([0, source]);\n' +
      '  while (heap.size() > 0) {\n' +
      '    const top = heap.pop();\n' +
      '    const node = top[1];\n' +
      '    if (settled[node]) continue;\n' +
      '    settled[node] = true;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const next = edge[1];\n' +
      '      const time = edge[2] === undefined ? 0 : edge[2];\n' +
      '      if (settled[next]) continue;\n' +
      '      const via = dist[node] + time;\n' +
      '      if (via < dist[next]) {\n' +
      '        dist[next] = via;\n' +
      '        ways[next] = ways[node] % MOD;\n' +
      '        heap.push([via, next]);\n' +
      '      } else if (via === dist[next]) {\n' +
      '        ways[next] = (ways[next] + ways[node]) % MOD;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return ways[destination] % MOD;\n' +
      '}\n' +
      '\n' +
      'function countAllRoutes(nodes, roads, source, destination) {\n' +
      '  const adj = buildAdj(nodes, roads, false);\n' +
      '  const seen = new Array(nodes).fill(false);\n' +
      '  seen[source] = true;\n' +
      '  const stack = [{ node: source, cursor: 0 }];\n' +
      '  let total = 0;\n' +
      '  while (stack.length > 0) {\n' +
      '    const frame = stack[stack.length - 1];\n' +
      '    const list = adj[frame.node];\n' +
      '    if (frame.node === destination || frame.cursor >= list.length) {\n' +
      '      if (frame.node === destination) total += 1;\n' +
      '      stack.pop();\n' +
      '      seen[frame.node] = false;\n' +
      '      continue;\n' +
      '    }\n' +
      '    const next = list[frame.cursor][1];\n' +
      '    frame.cursor += 1;\n' +
      '    if (seen[next]) continue;\n' +
      '    seen[next] = true;\n' +
      '    stack.push({ node: next, cursor: 0 });\n' +
      '  }\n' +
      '  return total;\n' +
      '}',
    modify:
      'A road is closed between queries, so its time becomes unavailable and the counts downstream of it may change. Which route disappears first, and what would you have to keep to repair the count without running the whole pass again?',
  },
  {
    step: 15,
    name: 'Minimum Steps to Reach End by Multiplying',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Given a start value, a target and a set of multipliers, find the fewest multiplications that land on the target residue, and say what makes the search finite at all.',
    brief:
      'Input: a start value, a target value, a bound M, and a list of multipliers. Each step replaces the current value by the current value times one multiplier, reduced modulo M + 1, so the value always lives in residues 0..M. Output: the fewest steps that land on the target residue, or -1 when no sequence of multipliers does. The deciding fact is that the value is the vertex, so this is a band count rather than an arithmetic trick.',
    concepts: [
      'dsa-g15b-residue-bfs-over-multipliers',
      'dsa-g15b-bfs-band-is-the-distance',
      'dsa-g15b-predecessor-array-extracts-the-path',
      'dsa-visited-set-distance',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      'Read the residues as vertices: M + 1 of them, each with one outgoing edge per multiplier. Then the answer is the band number of the target in a breadth-first walk from start mod M + 1 to target mod M + 1, and an emptied frontier means the target is unreachable.',
    idealAnswer:
      'The modulus is what turns an unbounded multiplication tree into a graph. With M + 1 residues and k multipliers the state set has M + 1 vertices and at most (M + 1) times k edges, most of them duplicates onto the same residue, so a breadth-first walk over it costs O(M k) time and O(M) for the visited record — the same shape as an open-the-lock search, with the value in place of the combination and the multiplication in place of a dial turn. Unit edges make the band number the answer: a residue first appears in the band one after the residue that produced it, so the first band holding the target is the fewest steps, and any later arrival at an already seen residue is by construction no cheaper, which is why one boolean per residue is enough. Unreachability is a real outcome rather than a search that gave up: the transition graph breaks into components with sinks, residue 0 is absorbing because zero times anything is zero, and a residue whose prime factors are not generated by the multiplier list is simply not connected to the start. Three contract decisions carry the row: reduce both the start and the target, not just one; answer 0 steps when the two residues already match, including when the raw values differ by a whole modulus; and refuse the value cap, because a route is allowed to pass above the target and come back down through the reduction. A greedy rule — always take the largest multiplier — has no argument behind it, since the shortest route is a property of the band structure and not of any single choice.',
    walkthrough:
      'Bound 9 means residues 0..9, multipliers 2 and 3, start 1, target 9. Band 0 holds 1. Expanding it writes 1 x 2 = 2 and 1 x 3 = 3, so band 1 is 2, 3. Expanding band 1 writes 2 x 2 = 4, 2 x 3 = 6, 3 x 2 = 6 again which is already recorded, and 3 x 3 = 9, so band 2 contains 9 and the answer is 2 steps. The route the parents give is 1, 3, 9, because 3 reached the residue 9 slot first; 1, 2, 4, 8 is three steps and 1, 3, 9, 8 would be three as well, so nothing beats band 2. Now the target that never appears: 5 from the same start. The closure of 1 under 2 and 3 modulo 10 is 1, 2, 3, 4, 6, 7, 8, 9 — eight residues, and the frontier empties because every edge from them lands back inside the set. The missing two are 0 and 5, and neither can be entered without a factor of 5, so the answer is -1 after a full sweep. The absorbing case is the same component argument in one line: start 0 gives 0 x 2 = 0 and 0 x 3 = 0, the first expansion produces nothing new, the frontier is empty at step 1, and the answer is -1 rather than an endless loop. The case that punishes a value cap is start 1, target 3, bound 4, multiplier 2 alone: the residues run 1, then 2, then 4, then 16 mod 5 = 3, so the answer is 3 steps, and the route 1, 2, 4, 3 has to walk above the target to reach it.',
    commonMistake:
      'Searching over the growing value with a cap instead of over residues, or comparing against the raw target without reducing it modulo M + 1 first.',
    whyWrong:
      'Start 1, target 3, bound 4, multiplier 2: the residues run 1, 2, 4, 3, so the honest answer is 3 steps, while a search that refuses a product above the target dies at 4 and returns -1 for a route that exists — 4 is a residue here, not a quantity to be bounded. Skipping the reduction on the target is the mirror bug: start 2, bound 20 and multipliers 3, 2 reach residue 12 in two steps through 6, so the answer for target 12 is 2, and the same question written as target 33 asks the same residue 33 mod 21 = 12 and needs the same 2 steps — a comparison against the raw value never matches it. Always taking the largest multiplier is the third failure: from 1 with multipliers 2 and 3 under bound 9, that rule walks 1, 3, 9, 27 mod 10 = 7, 21 mod 10 = 1 and circles inside 1, 3, 9, 7 forever without touching 8, which the bands reach in exactly 3 steps. And a start of 0 with no visited record over residues spins on 0 x 2 = 0 forever, because the only thing that terminates this search is the boolean that says the residue has already been expanded.',
    followUps: [
      'A step may add a multiplier instead of multiplying by it. Which vertex set does the state need now, and does the search stay finite?',
      'Report the sequence of multipliers, not its length. Which array holds it, and how many distinct shortest sequences can one residue have?',
      'The bound is huge and the multiplier list has two entries. What would you enumerate instead of M + 1 residues, and what does the trade cost?',
      'Two targets must be hit by the same sequence of multipliers. What changes about the visited record, and does a band count still work?',
    ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function multiplyGraph(bound, moves) {\n' +
      '  const modulus = bound + 1;\n' +
      '  const edges = [];\n' +
      '  for (let value = 0; value < modulus; value += 1) {\n' +
      '    for (const move of moves) {\n' +
      '      edges.push([value, (value * move) % modulus, 1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return buildAdj(modulus, edges, true);\n' +
      '}\n' +
      '\n' +
      'function residueOf(value, modulus) {\n' +
      '  return ((value % modulus) + modulus) % modulus;\n' +
      '}\n' +
      '\n' +
      'function minMultiplySteps(start, target, bound, moves) {\n' +
      '  const modulus = bound + 1;\n' +
      '  const adj = multiplyGraph(bound, moves);\n' +
      '  const from = residueOf(start, modulus);\n' +
      '  const to = residueOf(target, modulus);\n' +
      '  const seen = new Array(modulus).fill(false);\n' +
      '  seen[from] = true;\n' +
      '  let frontier = [from];\n' +
      '  let steps = 0;\n' +
      '  while (frontier.length > 0) {\n' +
      '    if (frontier.indexOf(to) !== -1) return steps;\n' +
      '    const next = [];\n' +
      '    for (const value of frontier) {\n' +
      '      for (const edge of adj[value]) {\n' +
      '        if (seen[edge[1]]) continue;\n' +
      '        seen[edge[1]] = true;\n' +
      '        next.push(edge[1]);\n' +
      '      }\n' +
      '    }\n' +
      '    frontier = next;\n' +
      '    steps += 1;\n' +
      '  }\n' +
      '  return -1;\n' +
      '}\n' +
      '\n' +
      'function reachableResidues(start, bound, moves) {\n' +
      '  const modulus = bound + 1;\n' +
      '  const adj = multiplyGraph(bound, moves);\n' +
      '  const from = residueOf(start, modulus);\n' +
      '  const seen = new Array(modulus).fill(false);\n' +
      '  seen[from] = true;\n' +
      '  let frontier = [from];\n' +
      '  while (frontier.length > 0) {\n' +
      '    const next = [];\n' +
      '    for (const value of frontier) {\n' +
      '      for (const edge of adj[value]) {\n' +
      '        if (seen[edge[1]]) continue;\n' +
      '        seen[edge[1]] = true;\n' +
      '        next.push(edge[1]);\n' +
      '      }\n' +
      '    }\n' +
      '    frontier = next;\n' +
      '  }\n' +
      '  const listed = [];\n' +
      '  for (let value = 0; value < modulus; value += 1) {\n' +
      '    if (seen[value]) listed.push(value);\n' +
      '  }\n' +
      '  return listed.join(",");\n' +
      '}\n' +
      '\n' +
      'function multiplyTrace(start, target, bound, moves) {\n' +
      '  const modulus = bound + 1;\n' +
      '  const adj = multiplyGraph(bound, moves);\n' +
      '  const from = residueOf(start, modulus);\n' +
      '  const to = residueOf(target, modulus);\n' +
      '  if (from === to) return String(from);\n' +
      '  const parent = new Array(modulus).fill(-1);\n' +
      '  parent[from] = from;\n' +
      '  let frontier = [from];\n' +
      '  while (frontier.length > 0) {\n' +
      '    const next = [];\n' +
      '    for (const value of frontier) {\n' +
      '      for (const edge of adj[value]) {\n' +
      '        if (parent[edge[1]] !== -1) continue;\n' +
      '        parent[edge[1]] = value;\n' +
      '        if (edge[1] !== to) {\n' +
      '          next.push(edge[1]);\n' +
      '          continue;\n' +
      '        }\n' +
      '        const route = [to];\n' +
      '        let cursor = to;\n' +
      '        while (cursor !== from) {\n' +
      '          cursor = parent[cursor];\n' +
      '          route.push(cursor);\n' +
      '        }\n' +
      '        return route.reverse().join(",");\n' +
      '      }\n' +
      '    }\n' +
      '    frontier = next;\n' +
      '  }\n' +
      '  return "";\n' +
      '}',
    modify:
      'A step may now divide by any multiplier that divides the current value exactly, as well as multiply. What does the branching factor become, and which part of the visited record has to grow with it?',
  },
];

export const expects: Record<string, string> = {
  'Cycle Detection in Directed Graph (DFS)':
    '(() => { const diamond = buildAdj(4, [[0,1],[0,2],[1,3],[2,3]], true); const ring = buildAdj(3, [[0,1],[1,2],[2,0]], true); const selfLoop = buildAdj(2, [[0,0],[0,1]], true); const hidden = buildAdj(4, [[0,1],[2,3],[3,2]], true); return cycleInDirectedDfs(diamond) === false && cycleWithSeenOnly(diamond) === true && cycleInDirectedDfs(ring) === true && cycleInDirectedDfs(selfLoop) === true && cycleInDirectedDfs(hidden) === true && cycleWithSeenOnly(hidden) === true; })()',
  'Topological Sort Algorithm (DFS)':
    '(() => { const diamond = buildAdj(4, [[0,1],[0,2],[1,3],[2,3]], true); const order = topoOrderDfs(diamond); const mutual = buildAdj(2, [[0,1],[1,0]], true); return order.join(",") === "0,2,1,3" && isTopoOrder(diamond, order) === true && isTopoOrder(diamond, [0,1,3,2]) === false && topoOrderDfs(mutual) === null && isTopoOrder(mutual, [0,1]) === false; })()',
  "Kahn's Algorithm | Topological Sort (BFS)":
    '(() => { const diamond = buildAdj(4, [[0,1],[0,2],[1,3],[2,3]], true); const split = buildAdj(4, [[0,1],[2,1],[3,2]], true); const stuck = buildAdj(4, [[0,1],[1,2],[2,1],[2,3]], true); const levels = (graph) => kahnLevels(graph).map((level) => level.join("+")).join("|"); return inDegrees(diamond).join(",") === "0,1,1,2" && levels(diamond) === "0|1+2|3" && levels(split) === "0+3|2|1" && kahnTopo(diamond).join(",") === "0,1,2,3" && kahnTopo(split).join(",") === "0,3,2,1" && isTopoOrder(diamond, kahnTopo(diamond)) === true && kahnTopo(stuck) === null; })()',
  "Cycle Detection in Directed Graph (Kahn's Algorithm)":
    '(() => { const victim = buildAdj(4, [[0,1],[1,2],[2,1],[2,3]], true); const ring = buildAdj(4, [[0,1],[1,2],[2,0],[2,3]], true); const diamond = buildAdj(4, [[0,1],[0,2],[1,3],[2,3]], true); const hidden = buildAdj(4, [[0,1],[2,3],[3,2]], true); return kahnPeel(victim).order.join(",") === "0" && kahnPeel(victim).stuck.join(",") === "1,2,3" && kahnPeel(victim).acyclic === false && kahnPeel(ring).order.length === 0 && kahnPeel(ring).stuck.join(",") === "0,1,2,3" && hasCycleKahn(diamond) === false && hasCycleKahn(hidden) === true; })()',
  'Course Schedule I and II':
    '(() => { const ok = [[1,0],[2,0],[3,1],[3,2]]; const loop = [[1,0],[0,1]]; const twice = [[1,0],[1,0]]; return courseOrder(4, ok).join(",") === "0,1,2,3" && canFinish(4, ok) === true && courseOrder(2, loop) === null && canFinish(2, loop) === false && courseOrder(2, [[0,1]]).join(",") === "1,0" && courseOrder(3, twice).join(",") === "0,2,1" && isTopoOrder(courseAdjacency(4, ok), courseOrder(4, ok)) === true; })()',
  'Find Eventual Safe States':
    '(() => { const g = buildAdj(7, [[0,1],[0,2],[1,3],[1,4],[2,3],[2,6],[3,1],[3,2],[3,3],[3,5],[4,5],[5,6]], true); const mutual = buildAdj(2, [[0,1],[1,0]], true); const chain = buildAdj(3, [[0,1],[1,2]], true); const terminal = buildAdj(2, [], true); return terminalPeelSafe(g).join(",") === "4,5,6" && safeStatesDfs(g).join(",") === "4,5,6" && terminalPeelSafe(mutual).join(",") === "" && safeStatesDfs(mutual).join(",") === "" && terminalPeelSafe(terminal).join(",") === "0,1" && safeStatesDfs(chain).join(",") === "0,1,2"; })()',
  'Alien Dictionary':
    '(() => { return alienOrder(["tea","tin","abc","ant"]) === "bcetnia" && alienOrder(["solo"]) === "los" && alienOrder(["ab","ab"]) === "ab" && alienOrder(["ab","abc","ac"]) === "abc" && alienOrder(["abc","ab"]) === "" && alienGraph(["abc","ab"]).prefixBroken === true && alienOrder(["z","x","z"]) === ""; })()',
  'Shortest Path in Undirected Graph with Unit Weights':
    '(() => { const g = buildAdj(8, [[0,1],[0,2],[1,3],[2,4],[4,5],[5,6]], false); const run = bfsDistances(g, 0); const triangle = buildAdj(3, [[0,1],[1,2],[0,2]], false); return run.dist.join(",") === "0,1,1,2,2,3,4,Infinity" && bfsPath(g, 0, 6).join(",") === "0,2,4,5,6" && bfsPath(g, 0, 7) === null && run.parent[6] === 5 && run.parent[0] === null && bfsDistances(triangle, 0).dist.join(",") === "0,1,1"; })()',
  'Shortest Path in Directed Acyclic Graph (DAG)':
    '(() => { const dag = buildAdj(6, [[0,1,2],[0,4,1],[1,2,3],[2,3,6],[4,2,2],[4,5,4],[5,3,1]], true); const negative = buildAdj(4, [[0,1,5],[0,2,2],[2,1,-4],[1,3,1]], true); const cyclic = buildAdj(2, [[0,1],[1,0]], true); return topoSortLocal(dag).join(",") === "0,1,4,2,5,3" && dagShortestPaths(dag, 0).join(",") === "0,2,3,6,1,5" && dagShortestPaths(negative, 0).join(",") === "0,-2,2,-1" && dagShortestPaths(cyclic, 0) === null && showGrid(gridMonotoneCosts([0,0],[[1,2,1],[2,1,2],[1,1,1]])) === "0,2,3|2,3,5|3,4,5"; })()',
  "Dijkstra's Algorithm - Using Priority Queue":
    '(() => { const g = buildAdj(6, [[0,1,2],[0,4,1],[1,2,3],[2,3,6],[4,2,2],[4,5,4],[5,3,1]], false); const run = dijkstraHeap(g, 0, true); const negative = buildAdj(3, [[0,1,1],[0,2,5],[1,2,-3]], true); let message = "no throw"; try { dijkstraHeap(negative, 0, false); } catch (error) { message = error.message; } return run.dist.join(",") === "0,2,3,6,1,5" && run.trace.length === 6 && run.trace[5] === "6:3 settled=0+4+1+2+5+3 dist=0,2,3,6,1,5" && relaxByQueue(g, 0).join(",") === "0,2,3,6,1,5" && message === "dijkstra needs non-negative weights"; })()',
  "Dijkstra's Algorithm - Using Set":
    '(() => { const tie = buildAdj(5, [[0,1,2],[0,2,2],[1,3,1],[2,3,1],[0,4,9],[3,4,6]], false); const swapped = buildAdj(5, [[0,2,2],[0,1,2],[1,3,1],[2,3,1],[0,4,9],[3,4,6]], false); const scan = dijkstraSet(tie, 0, true); const tied = dijkstraLazy(tie, 0, true); const loose = dijkstraLazy(swapped, 0, false); const six = dijkstraLazy(buildAdj(6, [[0,1,2],[0,4,1],[1,2,3],[2,3,6],[4,2,2],[4,5,4],[5,3,1]], false), 0, true); return scan.dist.join(",") === "0,2,2,3,9" && scan.settled.join(",") === "0,1,2,3,4" && tied.settled.join(",") === "0,1,2,3,4" && loose.settled.join(",") === "0,2,1,3,4" && dijkstraSet(buildAdj(4, [[0,1,1]], false), 0, true).settled.join(",") === "0,1" && six.pushes === 7 && six.skipped === 1; })()',
  'Print Shortest Path in Weighted Undirected Graph':
    '(() => { const g = buildAdj(5, [[0,1,2],[1,2,1],[0,3,4],[3,4,1],[2,4,3]], false); const run = shortestPathWithParents(g, 0, 4); return run.distance === 5 && run.path.join(",") === "0,3,4" && pathCost(g, run.path) === 5 && pathCost(g, [0,1,2,4]) === 6 && shortestPathWithParents(buildAdj(6, [[0,1,2],[1,2,1],[0,3,4],[3,4,1],[2,4,3]], false), 0, 5) === null && shortestPathWithParents(g, 0, 0).path.join(",") === "0"; })()',
  'Shortest Distance in a Binary Maze':
    '(() => { const maze = [[0,1,1,1],[0,0,1,0],[1,1,1,0],[0,0,1,0]]; const wall = [[0,1,0],[0,1,0],[0,0,0]]; return binaryMazeCost(maze, [0,0], [3,3]) === 7 && binaryMazeCost(wall, [0,0], [0,2]) === 3 && zeroOneMazeCost(wall, [0,0], [0,2]) === 0 && binaryMazeCost([[0]], [0,0], [0,0]) === 0 && binaryMazeCost(maze, [0,0], [1,2]) === -1 && zeroOneMazeCost([[0,1],[1,0]], [0,0], [0,1]) === -1; })()',
  'Path With Minimum Effort':
    '(() => { const g = [[1,2,2],[3,8,2],[5,3,5]]; const wide = [[1,2,1,1,1],[1,2,1,2,1],[2,2,1,2,1],[2,2,1,2,1],[1,1,1,2,5]]; return minimumEffortPath(g) === 2 && effortByBisection(g) === 2 && minimumEffortPath(wide) === 3 && effortByBisection(wide) === 3 && minimumEffortPath([[1,3,5]]) === 2 && effortByBisection([[1,3,5]]) === 2 && minimumEffortPath([[4]]) === 0; })()',
  'Cheapest Flights Within K Stops':
    '(() => { const hub = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]]; const leak = [[0,1,1],[1,2,1],[0,2,5],[2,3,1]]; return cheapestWithinStops(4, hub, 0, 3, 1) === 700 && cheapestWithinStops(4, hub, 0, 3, 2) === 400 && cheapestWithinStops(4, hub, 0, 3, 0) === -1 && cheapestWithinStops(2, [[0,1,5]], 0, 1, 0) === 5 && cheapestWithinStops(4, leak, 0, 3, 1) === 6 && cheapestByDijkstra(4, leak, 0, 3, 1) === 3; })()',
  'Network Delay Time':
    '(() => { const a = [[1,2,2],[1,3,5],[2,3,2]]; const split = [[2,1,1],[2,3,1],[3,4,1]]; return networkDelay(a, 3, 1) === 4 && networkDelay(split, 4, 2) === 2 && networkDelay([[1,2,1]], 3, 1) === -1 && networkDelay(split, 4, 1) === -1 && broadcastTree(a, 3, 1).dist.join(",") === "Infinity,0,2,4" && broadcastTree(a, 3, 1).parent.join(",") === ",,1,2"; })()',
  'Number of Ways to Arrive at Destination':
    '(() => { const tied = [[0,1,1],[0,2,1],[1,3,1],[2,3,1],[0,3,4]]; const layers = [[0,1,1],[0,2,1],[1,3,1],[2,3,1],[3,4,1],[3,5,1],[4,6,1],[5,6,1]]; const seven = [[0,6,7],[0,1,2],[1,2,3],[1,3,3],[6,3,3],[3,5,1],[4,5,2],[6,5,1]]; return countFastestRoutes(4, tied, 0, 3) === 2 && countFastestRoutesFull(4, tied, 0, 3) === 2 && countAllRoutes(4, tied, 0, 3) === 3 && countFastestRoutes(7, seven, 0, 6) === 2 && countFastestRoutes(7, layers, 0, 6) === 4 && countFastestRoutesFull(7, layers, 0, 6) === 4 && countFastestRoutes(3, [[0,1,1]], 0, 2) === 0 && countFastestRoutes(2, [[0,1,5]], 1, 1) === 1; })()',
  'Minimum Steps to Reach End by Multiplying':
    '(() => { return minMultiplySteps(1, 9, 9, [2, 3]) === 2 && minMultiplySteps(1, 5, 9, [2, 3]) === -1 && minMultiplySteps(1, 1, 9, [2, 3]) === 0 && minMultiplySteps(1, 8, 9, [2, 3]) === 3 && minMultiplySteps(2, 12, 20, [3, 2]) === 2 && minMultiplySteps(0, 5, 9, [2, 3]) === -1 && reachableResidues(1, 9, [2, 3]) === "1,2,3,4,6,7,8,9" && multiplyTrace(1, 3, 4, [2]) === "1,2,4,3"; })()',
};
