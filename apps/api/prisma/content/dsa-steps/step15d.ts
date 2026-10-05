import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';
import { buildAdj, minHeap, showAdj, unionFind } from './graph-helpers';

/**
 * Step 15d — the four rows the sheet repeats at the end of the graph step. They are not a second
 * copy of rows 9, 21, 37 and 49: each is read for the thing those rows had to leave out — the outer
 * loop over a forest, the tie-break inside Kahn's queue, the pass that ends Bellman-Ford, and the
 * graph the bridges leave behind once they are cut.
 */

export const concepts: Record<string, ConceptSpec> = {
  'dsa-g15d-forest-sweep-needs-an-outer-loop': {
    slug: 'dsa-g15d-forest-sweep-needs-an-outer-loop',
    name: 'A detector that starts at node 0 only sees the component holding node 0',
    detail:
      'Every single-source sweep has to be wrapped in a loop over unvisited starts, and an early return abandons the rest of the graph, so the component count has to be taken separately.',
    terms: ["forest sweep", "outer loop over starts", "early return", "per-component visit", "unseen component"],
    weight: 4,
  },
  'dsa-g15d-heap-order-gives-the-smallest-topo-order': {
    slug: 'dsa-g15d-heap-order-gives-the-smallest-topo-order',
    name: 'Swapping Kahn\'s queue for a min-heap picks the smallest legal next node',
    detail:
      'Any order that peels zero-in-degree nodes is valid, so the tie-break is a policy: a FIFO queue replays insertion order, a heap replays node numbering, and both are correct topological sorts.',
    terms: ["tie-break", "min-heap peel", "lexicographically smallest", "valid order", "policy not correctness"],
    weight: 4,
  },
  'dsa-g15d-fixpoint-pass-ends-bellman-ford': {
    slug: 'dsa-g15d-fixpoint-pass-ends-bellman-ford',
    name: 'Bellman-Ford stops the sweep that changes nothing, not at pass V minus one',
    detail:
      'A pass that relaxes no edge means distances are already minimal, so the loop ends early; the pass that still relaxes after V minus one settles the negative-cycle question.',
    terms: ["early exit", "fixpoint", "relaxation sweep", "no change", "V minus one passes"],
    weight: 4,
  },
  'dsa-g15d-bridges-partition-into-two-edge-components': {
    slug: 'dsa-g15d-bridges-partition-into-two-edge-components',
    name: 'Cut every bridge and what is left are the two-edge-connected pieces',
    detail:
      'Non-bridge edges fuse nodes into blocks; the blocks joined by the bridges form a tree, so for one connected graph the block count is the bridge count plus one.',
    terms: ["bridge tree", "two-edge-connected component", "cut every bridge", "block count", "bridges plus one"],
    weight: 5,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 15,
    name: "Detect cycle in undirected graph using BFS/DFS",
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: "Write both undirected cycle detectors and run them over a graph that is not connected, and name the input where the shared parent trick reports no cycle.",
    brief:
      "Input: an adjacency list over nodes 0..n-1, any number of components, self-loops and parallel edges allowed. Output: one yes or no per detector plus the component count. Both detectors must agree on every input that is a simple graph.",
    concepts: [
      "dsa-g15d-forest-sweep-needs-an-outer-loop",
      "dsa-g15a-parent-edge-cycle-check",
      "dsa-g15a-mark-on-enqueue",
      "dsa-g15a-stack-entry-carries-state",
      "dsa-g15a-component-loop",
    ],
    shortAnswer:
      "Sweep every unvisited start, not just node 0: BFS asks whether a visited neighbour is someone other than the parent, DFS asks the same question with a cursor stack. Both report the same answer because they test the same property.",
    idealAnswer:
      "The detection rule is one sentence and both searches implement it identically: an undirected edge that is not the tree edge you arrived on, pointing at a node you have already reached, closes a cycle. That equivalence is the reason the sheet asks for both — the two rows are one idea wearing two data structures, and a learner who can show they agree has understood more than one who can produce either. The part that separates a correct answer from a shippable one is the outer loop: a single sweep from node 0 answers a question about one component, so a graph holding a cycle in its second component reports none unless every unvisited start seeds its own sweep. Two details then decide whether the answer is honest. A self-loop is caught only because the start is marked before its own edges are read; a detector that marks on pop instead of on push reports the loop as a normal first visit. And the parent comparison is a node comparison, which survives parallel edges only by accident of the representation — a symmetric adjacency list hands the parent a second copy to inspect, so the cycle is found from above, while the bridge row has no such rescue because there the low value is set purely by the child's scan, and skipping by node invents a bridge. Cost is O(V + E) time and O(V) for the visited array and the frontier, and the detector that returns early leaves the remainder of the graph unvisited — so the component count in the report is taken by its own flood rather than from the aborted sweep.",
    walkthrough:
      "Take the path 0-1-2-3 as an adjacency list. The BFS sweep marks 0, dequeues it, pushes 1 with parent 0, then from 1 sees 0 again — visited, but it is the recorded parent, so it is skipped — and pushes 2, and so on to 3, whose only neighbour is its parent. Both detectors return false and the component flood returns 1. Now add the edge 2-0. BFS reaches 2 with parent 0 and inspects its neighbours: 1 is visited and is not 2's parent, so the answer is true, and the DFS with a cursor frame per open node reports true on the very same edge. On the forest 0-1-2-0 plus 3-4 the outer loop is the whole story: a sweep from 0 never looks at 3, and the report counts 2 components there. On 0-1 plus 2-3 with node 4 isolated both detectors say false and the flood says 3, which is the honest number for a graph holding an isolated node. The two inputs that test the mechanics rather than the idea are the double edge and the loop. On n=2 with the edge 0-1 listed twice, node 0 inspects its first copy, marks 1 and pushes it, then inspects the second copy to find 1 already visited and not its own parent, so both detectors answer true — and that is correct, because two parallel edges are a cycle of length two. On n=2 with the self-loop 0-0 the start is marked before its edges are read, so the loop is a visited neighbour that is not the parent, and the answer is true again. Both depend on the list being symmetric and on marking at push time, which is the assumption the bridge row cannot inherit.",
    commonMistake:
      "Calling the detector once from node 0 on a graph that may be disconnected, and carrying the parent-node skip from this row into the bridge row unchanged.",
    whyWrong:
      "The single call answers for one component only: on the forest made of the tree 0-1 and the cycle 2-3-4-2, a sweep from 0 finishes having visited two nodes and reports no cycle, which is right about the component and wrong about the graph — the interview question asks about the graph. The parent-node skip is the more expensive mistake, and it does not show up here: the double edge 0-1 is caught because the parent re-reads its own second copy. In the bridge test nothing re-reads anything, because low[child] is decided by the child's scan alone, and a child that skips every edge to its parent node skips the parallel copy that is a genuine second route — so it reports a bridge between two nodes that stay connected after either single edge is removed. Skipping one edge id rather than one node is what both rows actually want.",
    followUps: [
      "Both detectors return the same yes or no. Does either tell you which nodes are ON a cycle, and what would you add to get that?",
      "Move the mark from push time to pop time. Which of the two witness inputs changes its answer, and why does the queue version break first?",
      "The detector returns true on the first component that contains a cycle. Your caller also wants the count of acyclic components — why can it not read that off the visited array?",
      "The graph is given as an edge list of a million rows and only 200 distinct nodes. Which part of your cost is O(V + E) and which part is the input?",
    ],
    solution:
      buildAdj + '\n' +
      '\n' +
      showAdj + '\n' +
      '\n' +
      'function bfsSweep(adj, start, visited) {\n' +
      '  const queue = [[start, -1]];\n' +
      '  let head = 0;\n' +
      '  visited[start] = true;\n' +
      '  while (head < queue.length) {\n' +
      '    const frame = queue[head];\n' +
      '    head += 1;\n' +
      '    const node = frame[0];\n' +
      '    const parent = frame[1];\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const next = edge[1];\n' +
      '      if (!visited[next]) {\n' +
      '        visited[next] = true;\n' +
      '        queue.push([next, node]);\n' +
      '      } else if (next !== parent) {\n' +
      '        return true;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return false;\n' +
      '}\n' +
      '\n' +
      'function dfsSweep(adj, start, visited) {\n' +
      '  visited[start] = true;\n' +
      '  const stack = [[start, -1, 0]];\n' +
      '  while (stack.length > 0) {\n' +
      '    const frame = stack[stack.length - 1];\n' +
      '    const node = frame[0];\n' +
      '    const parent = frame[1];\n' +
      '    if (frame[2] >= adj[node].length) {\n' +
      '      stack.pop();\n' +
      '      continue;\n' +
      '    }\n' +
      '    const next = adj[node][frame[2]][1];\n' +
      '    frame[2] += 1;\n' +
      '    if (!visited[next]) {\n' +
      '      visited[next] = true;\n' +
      '      stack.push([next, node, 0]);\n' +
      '    } else if (next !== parent) {\n' +
      '      return true;\n' +
      '    }\n' +
      '  }\n' +
      '  return false;\n' +
      '}\n' +
      '\n' +
      'function hasUndirectedCycle(adj, sweep) {\n' +
      '  const visited = new Array(adj.length).fill(false);\n' +
      '  for (let start = 0; start < adj.length; start += 1) {\n' +
      '    if (!visited[start] && sweep(adj, start, visited)) return true;\n' +
      '  }\n' +
      '  return false;\n' +
      '}\n' +
      '\n' +
      'function countComponents(adj) {\n' +
      '  const visited = new Array(adj.length).fill(false);\n' +
      '  let components = 0;\n' +
      '  for (let start = 0; start < adj.length; start += 1) {\n' +
      '    if (visited[start]) continue;\n' +
      '    components += 1;\n' +
      '    visited[start] = true;\n' +
      '    const stack = [start];\n' +
      '    while (stack.length > 0) {\n' +
      '      const node = stack.pop();\n' +
      '      for (const edge of adj[node]) {\n' +
      '        if (!visited[edge[1]]) {\n' +
      '          visited[edge[1]] = true;\n' +
      '          stack.push(edge[1]);\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return components;\n' +
      '}',
    modify:
      "Mark at pop time instead of push time, keeping the parent comparison as it is. Which of the two witness inputs — the double edge and the self-loop — survives that change, and what does the queue hold in the meantime?",
  },
  {
    step: 15,
    name: "Kahn's Algorithm for Topological Sort",
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: "Peel zero in-degree nodes twice — once with a queue, once with a min-heap — and show that two different answers are both correct.",
    brief:
      "Input: a directed graph over nodes 0..n-1 as an adjacency list, possibly cyclic. Output: a topological order plus the count of nodes it holds, and a checker that decides whether a candidate order is legal. A cyclic input returns a short order, not an exception.",
    concepts: [
      "dsa-g15d-heap-order-gives-the-smallest-topo-order",
      "dsa-g15b-kahn-peels-zero-in-degree",
      "dsa-g15b-postorder-reversal-is-a-topo-order",
      "dsa-g15b-dfs-colour-is-the-open-path",
      "dsa-g15b-bfs-band-is-the-distance",
    ],
    shortAnswer:
      "Keep an in-degree array, emit every node whose in-degree has reached zero, and decrement its successors. A queue replays the order nodes became ready; a heap replays node numbering. Both are valid orders, and the number emitted against n is the cycle test.",
    idealAnswer:
      "Kahn's algorithm is a peeling process: an edge u to v is a promise that u comes first, so the only node that can safely go next is one with no outstanding promise, and emitting it retires its outgoing edges. That reading makes the invariant obvious — every emitted node was zero-in-degree at emit time, so the output is ordered by construction — and it makes the failure mode obvious too: when nothing is left with in-degree zero while nodes remain, the surviving subgraph has an in-degree from inside itself, which is a cycle. The row the sheet repeats is worth taking again for the tie-break, because Kahn's is not a single algorithm but a family: any choice among the ready nodes yields a correct topological order. A FIFO queue returns the order in which nodes became ready, which depends on the adjacency-list order and is therefore sensitive to how the input was written; a min-heap returns the lexicographically smallest valid order, which is what a build system, a course schedule or a test runner wants when the ask is deterministic output rather than merely legal output. Cost with a queue is O(V + E); the heap version pays an extra O(log V) per node, giving O(V log V + E), and the count of nodes emitted is the cycle detector — an order of length below n is a partial peel, not a sort of a cyclic graph.",
    walkthrough:
      "Build the six-node graph with edges 5-0, 4-0, 4-1, 2-3, 3-1, so in-degrees read 2, 2, 0, 1, 0, 0. Both peels start from the same three ready nodes, 2, 4 and 5, and then they part ways. The queue was seeded in node order, so it emits 2, which finishes node 3; the ready list is now 4, 5, 3 and it emits 4, which drops node 1 to one remaining in-degree and node 0 to one; then 5, which frees 0; then 3, which frees 1; then 0 and then 1 — the order is 2, 4, 5, 3, 0, 1. The heap sees the same seeds 2, 4, 5, pops the smallest, emits 2, and pushes 3, so it emits 3 next while the queue is still emitting 4; after 3 the ready set is 4 and 5, it emits 4, and that is the sweep that frees node 1, so 1 wins the next pop over 5 — the order is 2, 3, 4, 1, 5, 0. Run the checker on both: every edge points from an earlier position to a later one, so both are correct answers to the same question, and they differ only in tie-breaks. Now add the edge 1-2, closing 2 - 3 - 1 - 2. The in-degrees become 2, 2, 1, 1, 0, 0, the ready set is just 4 and 5, and after emitting both, node 0 falls to zero and is emitted, leaving the cycle untouched: processed is 3 against n of 6, and the checker calls the three-node order illegal because it is not an order of the graph. On a one-node graph with no edges both peels return [0] and the checker accepts it.",
    commonMistake:
      "Claiming Kahn's produces the topological order, or reporting the queue output as wrong because it differs from the DFS post-order output.",
    whyWrong:
      "There is no such thing as the order: on the example above the queue says 2, 4, 5, 3, 0, 1, the heap says 2, 3, 4, 1, 5, 0, and a DFS post-order reversal says something else again — all three satisfy every edge, so calling one of them wrong is a category error. What is real is that the choice is unbounded, so a system that diffs schedules across runs must fix a policy, which is the actual reason the heap variant exists. The second failure is silent and worse: on the graph with the cycle 2 - 3 - 1 - 2 the peel returns [4, 5, 0], which looks like a short answer rather than an error, and a caller that sorts courses by it and never compares the length against the node count schedules three courses and forgets the rest.",
    followUps: [
      "Prove that a peel which stops with nodes left over has found a cycle, and show how to extract the surviving subgraph.",
      "The min-heap gives the lexicographically smallest order. What does a max-heap give, and is that the reverse of the smallest?",
      "Two nodes become ready at the same instant. Give an input where the queue order changes when the adjacency list is rewritten, and make it not change.",
      "The graph is a million-node dependency DAG streamed from disk and you must emit the schedule as it is validated. Which structure survives and which one does not?",
    ],
    solution:
      buildAdj + '\n' +
      '\n' +
      minHeap + '\n' +
      '\n' +
      'function inDegrees(adj) {\n' +
      '  const indeg = new Array(adj.length).fill(0);\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    for (const edge of adj[node]) indeg[edge[1]] += 1;\n' +
      '  }\n' +
      '  return indeg;\n' +
      '}\n' +
      '\n' +
      'function kahnQueue(adj) {\n' +
      '  const indeg = inDegrees(adj);\n' +
      '  const queue = [];\n' +
      '  for (let node = 0; node < indeg.length; node += 1) {\n' +
      '    if (indeg[node] === 0) queue.push(node);\n' +
      '  }\n' +
      '  const order = [];\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const node = queue[head];\n' +
      '    head += 1;\n' +
      '    order.push(node);\n' +
      '    for (const edge of adj[node]) {\n' +
      '      indeg[edge[1]] -= 1;\n' +
      '      if (indeg[edge[1]] === 0) queue.push(edge[1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return { order: order, processed: order.length };\n' +
      '}\n' +
      '\n' +
      'function kahnLexicographic(adj) {\n' +
      '  const indeg = inDegrees(adj);\n' +
      '  const heap = new MinHeap();\n' +
      '  for (let node = 0; node < indeg.length; node += 1) {\n' +
      '    if (indeg[node] === 0) heap.push([node, node]);\n' +
      '  }\n' +
      '  const order = [];\n' +
      '  while (heap.size() > 0) {\n' +
      '    const node = heap.pop()[1];\n' +
      '    order.push(node);\n' +
      '    for (const edge of adj[node]) {\n' +
      '      indeg[edge[1]] -= 1;\n' +
      '      if (indeg[edge[1]] === 0) heap.push([edge[1], edge[1]]);\n' +
      '    }\n' +
      '  }\n' +
      '  return { order: order, processed: order.length };\n' +
      '}\n' +
      '\n' +
      'function isTopologicalOrder(adj, order) {\n' +
      '  if (order.length !== adj.length) return false;\n' +
      '  const position = new Array(adj.length).fill(-1);\n' +
      '  for (let index = 0; index < order.length; index += 1) {\n' +
      '    if (position[order[index]] !== -1) return false;\n' +
      '    position[order[index]] = index;\n' +
      '  }\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    for (const edge of adj[node]) {\n' +
      '      if (position[node] >= position[edge[1]]) return false;\n' +
      '    }\n' +
      '  }\n' +
      '  return true;\n' +
      '}',
    modify:
      "Swap the min-heap for one keyed by a supplied priority array, so a course with priority 0 is scheduled before a ready course with priority 5 even when the second has the smaller id. Where does the tie-break land when two ready nodes share a priority?",
  },
  {
    step: 15,
    name: "Bellman Ford shortest path algorithm",
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: "Relax every edge repeatedly until a sweep changes nothing, and show the input where Dijkstra answers confidently and wrongly.",
    brief:
      "Input: a node count, a directed edge list of [from, to, weight] triples with weights possibly negative, and a source. Output: the distance array plus the number of sweeps actually performed, and the node that a further sweep still relaxes. No adjacency list is required.",
    concepts: [
      "dsa-g15d-fixpoint-pass-ends-bellman-ford",
      "dsa-g15b-dijkstra-needs-nonnegative-weights",
      "dsa-g15b-dag-relaxes-in-topo-order",
      "dsa-g15b-stale-heap-entry-is-skipped",
      "dsa-g15c-negative-cycle-detection",
    ],
    shortAnswer:
      "Sweep the whole edge list V minus one times, stopping the moment a sweep relaxes nothing; a sweep that still improves a distance past that point means a reachable negative cycle. The order of settling is what Dijkstra assumes and Bellman-Ford refuses to assume.",
    idealAnswer:
      "Bellman-Ford is a fixed-point iteration over the relaxation operator: each sweep propagates every improvement one edge further, so after k sweeps every distance is correct for paths of at most k edges, and the shortest path in a graph with V nodes uses at most V minus one edges, which is the whole proof. Because a chain can be written in any edge-list order, one sweep may already carry a path several edges forward — the guarantee is an upper bound, not a schedule — and that is what makes the early exit legitimate rather than a lucky optimisation: a sweep that changes nothing means the array is a fixed point, so no further sweep can change anything either, and the loop can stop after two sweeps on a graph of ten thousand nodes. The contrast the row exists for is Dijkstra. Dijkstra commits a node's distance when it is popped and never revisits it, which is sound only when no future path can be cheaper than the one just committed, and non-negative weights are exactly what guarantees that. Feed it a negative edge that leaves a node which is still un-popped behind a settled one and it returns a distance it will never correct. The costs are different currencies: Bellman-Ford is O(V E) with O(V) state and no heap, which is the right shape for a sparse graph or an edge list that arrives already relaxed by a job that runs every edge once per round, and Dijkstra with a heap is O((V + E) log V), which is the right shape for a dense non-negative graph. The final sweep is also the only part that answers the interesting question — it names an edge still being improved, which is a witness that a negative cycle is reachable from the source rather than merely present.",
    walkthrough:
      "Take four nodes and the edges 0-1 weight 1, 0-2 weight 5, 2-1 weight -6, 1-3 weight 6. Dijkstra pops 0, offers 1 at distance 1 and 2 at distance 5, settles 1 immediately, and from it settles 3 at distance 7; only then does it pop 2 and discover that 1 is really at -1, but 1 is already committed, and 3 is already committed behind it, so the shipped answer for 3 stays 7. Bellman-Ford sweeps the edge list once: 0-1 sets 1, 0-2 sets 2, 2-1 then rewrites 1 to -1 within the same sweep because the edge list happens to be ordered, and 1-3 writes 5 — the distance array reads 0, -1, 5, 5 after one pass. The second sweep relaxes nothing, so the loop stops having performed two passes. Now the single-edge graph: five nodes, one edge 0-1 weight 1, source 0. Sweep one sets node 1, sweep two changes nothing, so passes is 2 and node 4 is still Infinity, which is the honest answer for an unreachable node rather than a large number. For the cycle, use 0-1 weight 1, 1-2 weight 2, 2-3 weight -8, 3-1 weight -1: the loop cannot reach a fixed point, so it runs its V minus one sweeps and the extra sweep still improves an edge — 1-2 is the first edge it relaxes again, and the witness it names is node 2. Re-run the detector on the four-edge graph above and it returns nothing, because that graph has a negative edge and no negative cycle, which is precisely the pair of facts the two rows are often confused for.",
    commonMistake:
      "Running exactly V minus one sweeps unconditionally, or reporting any negative edge as a negative cycle.",
    whyWrong:
      "The unconditional loop is not wrong on the answer, it is wrong on the cost: on the five-node graph with one edge it still sweeps four times, and on a ten-thousand-node road graph whose distances settle in three sweeps it turns O(V E) into a full V times the edge count for nothing — the early exit is the difference between a relaxation round that finishes and one that merely terminates. Confusing the negative edge with the negative cycle is the reporting bug: on 0-1, 0-2, 2-1 with weights 1, 5 and -6 there is an edge that makes Dijkstra lie and no cycle at all, so a detector that answers yes whenever it sees a negative weight refuses a perfectly well-behaved graph, while the correct witness sweep returns nothing. The mirror error is accepting a witness for a cycle that is unreachable from the source: the distances there are Infinity and the guard on Infinity in the relaxation test is what keeps the answer honest.",
    followUps: [
      "Show an edge-list order that forces four sweeps instead of two on the same graph. What property of the order decides the number of passes?",
      "The witness sweep names one node. Prove that a reachable negative cycle exists somewhere upstream of it, and say what extra state recovers the cycle itself.",
      "Every weight is non-negative. Give the argument that the same loop with a queue instead of a full sweep — SPFA — settles faster, and where it degenerates.",
      "You must answer distance queries from many sources on one static graph. Which algorithm do you pay for, and in what order?",
    ],
    solution:
      'function bellmanFord(nodeCount, edges, source) {\n' +
      '  const dist = new Array(nodeCount).fill(Infinity);\n' +
      '  dist[source] = 0;\n' +
      '  let passes = 0;\n' +
      '  for (let sweep = 0; sweep < nodeCount - 1; sweep += 1) {\n' +
      '    passes += 1;\n' +
      '    let changed = false;\n' +
      '    for (const edge of edges) {\n' +
      '      const from = edge[0];\n' +
      '      const to = edge[1];\n' +
      '      const weight = edge[2];\n' +
      '      if (dist[from] !== Infinity && dist[from] + weight < dist[to]) {\n' +
      '        dist[to] = dist[from] + weight;\n' +
      '        changed = true;\n' +
      '      }\n' +
      '    }\n' +
      '    if (!changed) break;\n' +
      '  }\n' +
      '  return { dist: dist, passes: passes };\n' +
      '}\n' +
      '\n' +
      'function negativeCycleWitness(nodeCount, edges, source) {\n' +
      '  const dist = new Array(nodeCount).fill(Infinity);\n' +
      '  dist[source] = 0;\n' +
      '  for (let sweep = 0; sweep < nodeCount - 1; sweep += 1) {\n' +
      '    for (const edge of edges) {\n' +
      '      if (dist[edge[0]] !== Infinity && dist[edge[0]] + edge[2] < dist[edge[1]]) {\n' +
      '        dist[edge[1]] = dist[edge[0]] + edge[2];\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  for (const edge of edges) {\n' +
      '    if (dist[edge[0]] !== Infinity && dist[edge[0]] + edge[2] < dist[edge[1]]) return edge[1];\n' +
      '  }\n' +
      '  return null;\n' +
      '}\n' +
      '\n' +
      'function dijkstraSettled(nodeCount, edges, source) {\n' +
      '  const dist = new Array(nodeCount).fill(Infinity);\n' +
      '  dist[source] = 0;\n' +
      '  const settled = new Array(nodeCount).fill(false);\n' +
      '  for (;;) {\n' +
      '    let best = -1;\n' +
      '    for (let node = 0; node < nodeCount; node += 1) {\n' +
      '      if (!settled[node] && dist[node] !== Infinity && (best === -1 || dist[node] < dist[best])) best = node;\n' +
      '    }\n' +
      '    if (best === -1) break;\n' +
      '    settled[best] = true;\n' +
      '    for (const edge of edges) {\n' +
      '      if (edge[0] !== best || settled[edge[1]]) continue;\n' +
      '      if (dist[best] + edge[2] < dist[edge[1]]) dist[edge[1]] = dist[best] + edge[2];\n' +
      '    }\n' +
      '  }\n' +
      '  return { dist: dist };\n' +
      '}',
    modify:
      "The edge list arrives sorted by destination instead of by source. How does the pass count change on the four-node example, and what does the witness sweep return when the negative cycle sits in a component the source cannot reach?",
  },
  {
    step: 15,
    name: "Find Bridges in Graph (Tarjan's)",
    difficulty: 'Hard',
    topicSlug: 'graph-traversal',
    stem: "Find every bridge, then cut them all and report the blocks that remain and how they fit back into a tree.",
    brief:
      "Input: an undirected graph as an edge list over nodes 0..n-1, with parallel edges and self-loops allowed. Output: the bridge ids, and after removing them the block count, block sizes and the largest block. One connected graph must satisfy blocks = bridges + 1.",
    concepts: [
      "dsa-g15d-bridges-partition-into-two-edge-components",
      "dsa-g15c-tin-low-bridge-test",
      "dsa-g15c-adjacency-edge-id",
      "dsa-g15c-dsu-compression-by-size",
      "dsa-g15a-dsu-component-count",
    ],
    shortAnswer:
      "One DFS computes tin and low; an edge u to v is a bridge when low[v] is strictly greater than tin[u], because v cannot climb back above u. Mark those edges and union every other edge: the surviving sets are the two-edge-connected blocks and the bridges form a tree over them.",
    idealAnswer:
      "The bridge test is a statement about alternative routes: low[v] is the earliest discovery time reachable from v's subtree using at most one back edge, and if that value is still strictly below tin[u] then nothing in the subtree can arrive at u or above it, so u to v is the only connection and removing it splits the graph. The strictness is the whole difficulty — the non-strict form is the articulation-point test, and the two differ on exactly the case where v's subtree reaches u itself. Identifying edges rather than nodes is what makes the rest correct: a parallel edge is a real alternative route, so a DFS that skips by parent node treats the second copy as the tree edge and reports a bridge where removing either single edge leaves the pair connected. Skip by id and the low value of the child drops to the parent's tin through the sibling copy, and the test correctly refuses. Once the bridge set is known the second half of the question costs almost nothing: union every non-bridge edge with a disjoint set and the remaining sets are the two-edge-connected components. The bridges then form a forest over those blocks — a bridge cannot join two nodes of the same block by definition, and a cycle of blocks joined by bridges would make each of those bridges non-essential — so for one connected graph the count lands on bridges plus one, and for a general one it lands on bridges plus the number of connected components. That identity is the check worth writing, because it fails loudly if either the edge-id handling or the low-value propagation is off by one.",
    walkthrough:
      "Take two triangles joined by one edge: 0-1, 1-2, 2-0, then 2-3, then 3-4, 4-5, 5-3. Start the DFS at 0 and number as you go. Suppose tin reads 0 at node 0, 1 at node 1, 2 at node 2, and from 2 the tree edge to 3 gives 3, then 4 and 5 to its triangle partners; node 5's edge back to 3 is a back edge to an ancestor, so low[5] becomes 3 and it hands 3 up to node 4 and then to node 3, whose low is 3. Now the second half of the triangle: the edges 3-4 and 4-5 and 5-3 all sit inside a subtree that can reach 3, so none of them satisfies low[child] > tin[parent]. The edge 2-3 is different: low[3] is 3 and tin[2] is 2, and 3 is not strictly greater than 2 only in the direction that matters — 3 > 2 holds, so 2-3 is a bridge. Meanwhile node 2's subtree reached through 1 and 0 climbs back to tin 0, so 0-1, 1-2 and 2-0 are all refused. One bridge, and cutting it leaves the blocks 0,1,2 and 3,4,5 — two blocks, which is bridges plus one. On the path 0-1-2 every edge is a bridge, three blocks of size one, and again 2 plus 1 is 3. On the four-cycle 0-1-2-3-0 there are no bridges and one block of four. The input that separates this implementation from the parent-node version is the two-node multigraph with the edge 0-1 twice: the second copy is not the tree edge by id, so node 1's low falls to tin[0], no bridge is reported, and the block containing both nodes has size 2 — the parent-node skip reports a bridge and then claims two blocks of size 1 for a pair that stays connected after either edge is removed. A self-loop is never a bridge, since it connects a node to itself and its low value is its own tin.",
    commonMistake:
      "Reporting a parallel edge as a bridge by skipping the parent node, or using the articulation test low[v] >= tin[u] and calling the result a bridge list.",
    whyWrong:
      "Both are one-character-in-the-head bugs with different blast radii. The parent-node skip breaks only where the input has parallel edges — and an edge list from a network provider or a call graph usually does — where it invents a bridge: on the two-node double edge it says the pair splits when either edge is removed, which is false, and every downstream block count inherits the error. The non-strict test is worse because it over-reports everywhere: on the cycle 0-1-2-3-0 rooted at 0, node 3's subtree reaches tin 0, so low[3] equals 0 for the child of 0 on that side and the equality case turns a tree edge inside a cycle into a bridge, giving a block decomposition of a graph that is one block. The >= form is not a stricter version of the same rule; it is the articulation-point rule, which is about removing a node rather than an edge, and mixing the two silently produces a bridge tree whose edges are not bridges.",
    followUps: [
      "Answer for every edge: how many connected components does the graph have once that edge is removed? Which edges need the bridge tree and which need something else?",
      "Turn the same traversal into the edge-biconnected component ids, so any two nodes report whether a single edge removal separates them. What do you compress the blocks into?",
      "The graph gains an edge at runtime. Which part of your tin and low values survives, and why is that question much harder for bridges than for connectivity?",
      "Give the version of this traversal whose stack holds the frames instead of the call stack. What does the frame need beyond node and edge id to finish a node correctly?",
    ],
    solution:
      unionFind + '\n' +
      '\n' +
      'function buildEdgeAdj(nodeCount, edges) {\n' +
      '  const adj = [];\n' +
      '  for (let node = 0; node < nodeCount; node += 1) adj.push([]);\n' +
      '  for (let id = 0; id < edges.length; id += 1) {\n' +
      '    const from = edges[id][0];\n' +
      '    const to = edges[id][1];\n' +
      '    adj[from].push([to, id]);\n' +
      '    if (from !== to) adj[to].push([from, id]);\n' +
      '  }\n' +
      '  return adj;\n' +
      '}\n' +
      '\n' +
      'function bridgeIds(nodeCount, edges) {\n' +
      '  const adj = buildEdgeAdj(nodeCount, edges);\n' +
      '  const tin = new Array(nodeCount).fill(-1);\n' +
      '  const low = new Array(nodeCount).fill(0);\n' +
      '  const isBridge = new Array(edges.length).fill(false);\n' +
      '  let timer = 0;\n' +
      '  const visit = (node, incoming) => {\n' +
      '    tin[node] = timer;\n' +
      '    low[node] = timer;\n' +
      '    timer += 1;\n' +
      '    for (const frame of adj[node]) {\n' +
      '      const next = frame[0];\n' +
      '      const id = frame[1];\n' +
      '      if (id === incoming) continue;\n' +
      '      if (tin[next] !== -1) {\n' +
      '        low[node] = Math.min(low[node], tin[next]);\n' +
      '      } else {\n' +
      '        visit(next, id);\n' +
      '        low[node] = Math.min(low[node], low[next]);\n' +
      '        if (low[next] > tin[node]) isBridge[id] = true;\n' +
      '      }\n' +
      '    }\n' +
      '  };\n' +
      '  for (let node = 0; node < nodeCount; node += 1) {\n' +
      '    if (tin[node] === -1) visit(node, -1);\n' +
      '  }\n' +
      '  return isBridge;\n' +
      '}\n' +
      '\n' +
      'function bridgeForest(nodeCount, edges) {\n' +
      '  const isBridge = bridgeIds(nodeCount, edges);\n' +
      '  const dsu = new UnionFind(nodeCount);\n' +
      '  let bridges = 0;\n' +
      '  for (let id = 0; id < edges.length; id += 1) {\n' +
      '    if (isBridge[id]) {\n' +
      '      bridges += 1;\n' +
      '      continue;\n' +
      '    }\n' +
      '    dsu.union(edges[id][0], edges[id][1]);\n' +
      '  }\n' +
      '  const totals = new Array(nodeCount).fill(0);\n' +
      '  for (let node = 0; node < nodeCount; node += 1) totals[dsu.find(node)] += 1;\n' +
      '  const sizes = totals.filter((value) => value > 0).sort((a, b) => b - a);\n' +
      '  return {\n' +
      '    bridges: bridges,\n' +
      '    blocks: sizes.length,\n' +
      '    sizes: sizes.join(","),\n' +
      '    largest: sizes.length > 0 ? sizes[0] : 0,\n' +
      '  };\n' +
      '}',
    modify:
      "Report, for each block, the set of nodes inside it and the bridge ids on the path to its parent block — the bridge tree itself rather than its size summary. What does that structure answer that the block list cannot?",
  },
];

export const expects: Record<string, string> = {
  'Detect cycle in undirected graph using BFS/DFS':
    '(() => { const tree = buildAdj(4, [[0,1],[1,2],[2,3]]); const cycle = buildAdj(3, [[0,1],[1,2],[2,0]]); const forest = buildAdj(5, [[0,1],[1,2],[2,0],[3,4]]); const quiet = buildAdj(5, [[0,1],[2,3]]); const empty = buildAdj(3, []); const parallel = buildAdj(2, [[0,1],[0,1]]); const looped = buildAdj(2, [[0,0],[0,1]]); const split = buildAdj(6, [[0,1],[2,3],[3,4],[4,2]]); return hasUndirectedCycle(tree, bfsSweep) === false && hasUndirectedCycle(tree, dfsSweep) === false && countComponents(tree) === 1 && hasUndirectedCycle(cycle, bfsSweep) === true && hasUndirectedCycle(cycle, dfsSweep) === true && countComponents(cycle) === 1 && hasUndirectedCycle(forest, bfsSweep) === true && countComponents(forest) === 2 && hasUndirectedCycle(quiet, dfsSweep) === false && countComponents(quiet) === 3 && countComponents(empty) === 3 && hasUndirectedCycle(empty, bfsSweep) === false && hasUndirectedCycle(parallel, bfsSweep) === true && hasUndirectedCycle(parallel, dfsSweep) === true && hasUndirectedCycle(looped, dfsSweep) === true && hasUndirectedCycle(split, bfsSweep) === true && countComponents(split) === 3; })()',
  "Kahn's Algorithm for Topological Sort":
    '(() => { const edges = [[5,0],[4,0],[4,1],[2,3],[3,1]]; const adj = buildAdj(6, edges, true); const q = kahnQueue(adj); const lex = kahnLexicographic(adj); const cyclic = buildAdj(6, edges.concat([[1,2]]), true); const stuck = kahnQueue(cyclic); const single = buildAdj(1, [], true); const only = kahnQueue(single); return q.order.join(",") === "2,4,5,3,0,1" && isTopologicalOrder(adj, q.order) === true && lex.order.join(",") === "2,3,4,1,5,0" && isTopologicalOrder(adj, lex.order) === true && q.order.join(",") !== lex.order.join(",") && stuck.processed === 3 && stuck.order.join(",") === "4,5,0" && isTopologicalOrder(cyclic, stuck.order) === false && only.order.join(",") === "0" && isTopologicalOrder(single, only.order) === true; })()',
  'Bellman Ford shortest path algorithm':
    '(() => { const neg = [[0,1,1],[0,2,5],[2,1,-6],[1,3,6]]; const dial = bellmanFord(4, neg, 0); const dijk = dijkstraSettled(4, neg, 0); const chain = bellmanFord(5, [[0,1,1]], 0); const cycle = [[0,1,1],[1,2,2],[2,3,-8],[3,1,-1]]; const witness = negativeCycleWitness(4, cycle, 0); const isolated = negativeCycleWitness(4, neg, 0); return dial.dist[1] === -1 && dial.dist[3] === 5 && dial.passes === 2 && dijk.dist[3] === 7 && dijk.dist[1] === 1 && chain.passes === 2 && chain.dist[4] === Infinity && chain.dist[1] === 1 && witness === 2 && isolated === null; })()',
  "Find Bridges in Graph (Tarjan's)":
    '(() => { const twin = bridgeForest(6, [[0,1],[1,2],[2,0],[2,3],[3,4],[4,5],[5,3]]); const path = bridgeForest(3, [[0,1],[1,2]]); const ring = bridgeForest(4, [[0,1],[1,2],[2,3],[3,0]]); const parallel = bridgeForest(2, [[0,1],[0,1]]); const loops = bridgeForest(3, [[0,0],[0,1],[1,2]]); const alone = bridgeForest(1, []); return twin.bridges === 1 && twin.blocks === 2 && twin.sizes === "3,3" && twin.largest === 3 && path.bridges === 2 && path.blocks === 3 && path.sizes === "1,1,1" && ring.bridges === 0 && ring.blocks === 1 && ring.sizes === "4" && parallel.bridges === 0 && parallel.blocks === 1 && parallel.sizes === "2" && loops.bridges === 2 && loops.blocks === 3 && alone.bridges === 0 && alone.blocks === 1 && alone.largest === 1; })()',
};
