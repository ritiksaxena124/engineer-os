import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';
import { buildAdj, minHeap, unionFind, dirs4, copyGrid, showGrid } from './graph-helpers';

/**
 * Step 15c — the weighted and structured half of the graph ladder: the algorithms that stop asking
 * "can I reach it" and start asking "how cheaply, how tightly, through which single edge". Shortest
 * paths under negative weights, all-pairs closure, the two spanning-tree recipes, the disjoint set
 * that powers half of them, and Tarjan and Kosaraju reading a graph through tin and low.
 */

/**
 * Two-pass shortest paths on an adjacency matrix: every pair routed only through nodes below k, so
 * after the k-th sweep dist[i][j] is the cheapest i-to-j walk whose intermediate nodes all sit in
 * {0..k}. Shared by the Floyd row and the threshold-closure row, which both need the whole matrix.
 */
const FLOYD =
  'function floydWarshall(n, edges) {\n' +
  '  const dist = [];\n' +
  '  for (let i = 0; i < n; i += 1) {\n' +
  '    const row = [];\n' +
  '    for (let j = 0; j < n; j += 1) row.push(i === j ? 0 : Infinity);\n' +
  '    dist.push(row);\n' +
  '  }\n' +
  '  for (const edge of edges) {\n' +
  '    const u = edge[0], v = edge[1], w = edge[2];\n' +
  '    if (w < dist[u][v]) dist[u][v] = w;\n' +
  '  }\n' +
  '  for (let k = 0; k < n; k += 1) {\n' +
  '    for (let i = 0; i < n; i += 1) {\n' +
  '      for (let j = 0; j < n; j += 1) {\n' +
  '        if (dist[i][k] !== Infinity && dist[k][j] !== Infinity && dist[i][k] + dist[k][j] < dist[i][j]) {\n' +
  '          dist[i][j] = dist[i][k] + dist[k][j];\n' +
  '        }\n' +
  '      }\n' +
  '    }\n' +
  '  }\n' +
  '  return dist;\n' +
  '}\n' +
  '\n' +
  'function floydNegativeCycle(n, edges) {\n' +
  '  const dist = floydWarshall(n, edges);\n' +
  '  for (let i = 0; i < n; i += 1) if (dist[i][i] < 0) return true;\n' +
  '  return false;\n' +
  '}';

/**
 * The two questions the disjoint set is asked constantly in the interview: how many groups are
 * left, and which edge closed the first cycle. Both are one pass of union over an edge list.
 */
const DSU_UTIL =
  'function countComponents(n, edges) {\n' +
  '  const uf = new UnionFind(n);\n' +
  '  for (const edge of edges) uf.union(edge[0], edge[1]);\n' +
  '  return uf.components;\n' +
  '}\n' +
  '\n' +
  'function firstRedundantEdge(edges) {\n' +
  '  let max = 0;\n' +
  '  for (const edge of edges) {\n' +
  '    if (edge[0] > max) max = edge[0];\n' +
  '    if (edge[1] > max) max = edge[1];\n' +
  '  }\n' +
  '  const uf = new UnionFind(max + 1);\n' +
  '  for (const edge of edges) {\n' +
  '    if (!uf.union(edge[0], edge[1])) return [edge[0], edge[1]];\n' +
  '  }\n' +
  '  return null;\n' +
  '}';

/**
 * An adjacency list that carries the edge id alongside the neighbour, which buildAdj cannot do
 * because it stores the reverse of each edge as a fresh array. Tarjan has to skip the exact tree
 * edge it arrived on, not merely "the edge to the parent node", or parallel edges hide a bridge.
 */
const EDGE_ADJ =
  'function buildEdgeAdj(n, edges) {\n' +
  '  const adj = [];\n' +
  '  for (let node = 0; node < n; node += 1) adj.push([]);\n' +
  '  for (let id = 0; id < edges.length; id += 1) {\n' +
  '    const u = edges[id][0], v = edges[id][1];\n' +
  '    adj[u].push([v, id]);\n' +
  '    if (u !== v) adj[v].push([u, id]);\n' +
  '  }\n' +
  '  return adj;\n' +
  '}';

export const concepts: Record<string, ConceptSpec> = {
  'dsa-g15c-bellman-ford-relaxation-passes': {
    slug: 'dsa-g15c-bellman-ford-relaxation-passes',
    name: 'Bellman-Ford needs V minus one full-edge sweeps, not a priority queue',
    detail:
      'Each pass relaxes every edge once, so after k passes every shortest walk with at most k edges is correct; a shortest simple path has at most V minus 1 edges, so that many passes finish the job.',
    terms: ['relax every edge', 'V minus one passes', 'one edge per pass', 'no heap needed', 'negative weight ok'],
    weight: 4,
  },
  'dsa-g15c-negative-cycle-detection': {
    slug: 'dsa-g15c-negative-cycle-detection',
    name: 'The extra V-th pass that still improves is a negative cycle',
    detail:
      'If a full sweep after the V minus one settles changes any distance, a walk cheaper than any simple path exists, which is only possible by circling a negative-weight cycle.',
    terms: ['V-th pass', 'still relaxing', 'negative cycle', 'distances undefined', 'seed all zero'],
    weight: 4,
  },
  'dsa-g15c-floyd-warshall-k-outer': {
    slug: 'dsa-g15c-floyd-warshall-k-outer',
    name: 'Floyd-Warshall works only because k is the outermost loop',
    detail:
      'Sweeping the intermediate set one node at a time means dist[i][j] at the end of round k is the best path using only nodes 0..k inside it, so the invariant holds across the whole inner pair of loops.',
    terms: ['k outermost', 'intermediate set', 'all pairs closure', 'in place matrix', 'n cubed'],
    weight: 4,
  },
  'dsa-g15c-threshold-closure-count': {
    slug: 'dsa-g15c-threshold-closure-count',
    name: 'Counting reachable-within-budget cities is a closure plus a row scan',
    detail:
      'Once every pair distance is known, a city is characterised by how many other cities sit at distance at most the threshold, and the answer is the row with the smallest such count.',
    terms: ['distance threshold', 'count reachable', 'tie to largest index', 'row scan', 'closure first'],
    weight: 3,
  },
  'dsa-g15c-mst-cut-property': {
    slug: 'dsa-g15c-mst-cut-property',
    name: 'Both spanning-tree recipes lean on the cut property',
    detail:
      'The lightest edge crossing any split of the vertices is safe to include, and Prim crosses the frontier of its grown tree while Kruskal crosses the cut between two components a cheap edge joins.',
    terms: ['cut property', 'lightest crossing edge', 'safe edge', 'frontier cut', 'component cut'],
    weight: 4,
  },
  'dsa-g15c-prim-frontier-vs-kruskal-sort': {
    slug: 'dsa-g15c-prim-frontier-vs-kruskal-sort',
    name: 'Prim grows a frontier; Kruskal sorts once and unions',
    detail:
      'Prim needs a priority queue over the edges leaving the current tree and pulls the cheapest crossing edge each step; Kruskal needs a single sort of all edges then a disjoint set to reject the ones that would close a cycle.',
    terms: ['priority frontier', 'grow one tree', 'global sort', 'union rejects cycle', 'two MST shapes'],
    weight: 4,
  },
  'dsa-g15c-dsu-compression-by-size': {
    slug: 'dsa-g15c-dsu-compression-by-size',
    name: 'Path compression plus union by size makes find near constant',
    detail:
      'Attaching the smaller tree under the larger keeps depth logarithmic, and flattening every node to the root on the way out of a find makes a long chain cost that once, for an amortised inverse-Ackermann bound.',
    terms: ['union by size', 'path compression', 'find flattens', 'inverse Ackermann', 'component count'],
    weight: 4,
  },
  'dsa-g15c-online-union-islands': {
    slug: 'dsa-g15c-online-union-islands',
    name: 'A live count of islands only needs a per-add union against its neighbours',
    detail:
      'Turning water to land raises the count by one, and every already-land neighbour that is a genuinely different component lowers it again, so the running total is the answer without a fresh flood fill.',
    terms: ['incremental add', 'count minus one per merge', 'neighbour union', 'no full re-scan', 'duplicate is no-op'],
    weight: 3,
  },
  'dsa-g15c-component-size-merge': {
    slug: 'dsa-g15c-component-size-merge',
    name: 'One flip merges a bounded set of whole components, never individual cells',
    detail:
      'With each region already collapsed to a root carrying its size, the best single flip is one plus the sizes of the distinct neighbour roots around a zero cell, deduplicated by root.',
    terms: ['region size at root', 'merge neighbour roots', 'dedup by root', 'flip one cell', 'candidate score'],
    weight: 3,
  },
  'dsa-g15c-minimax-bottleneck-path': {
    slug: 'dsa-g15c-minimax-bottleneck-path',
    name: 'Minimising the worst cell on a path is Dijkstra on a max, not a sum',
    detail:
      'Swap the relaxation add for a max and the priority queue grows cheapest-bottleneck-first exactly like ordinary Dijkstra, and the same value falls out of binary searching the smallest water level that leaves a dry path.',
    terms: ['bottleneck objective', 'relax with max', 'binary search on answer', 'monotone feasibility', 'min the maximum'],
    weight: 4,
  },
  'dsa-g15c-tin-low-bridge-test': {
    slug: 'dsa-g15c-tin-low-bridge-test',
    name: 'A bridge is a tree edge with low child strictly deeper than the parent',
    detail:
      'tin stamps the discovery time and low is the earliest ancestor a subtree can reach through a back edge; the tree edge u to v is a bridge exactly when low[v] is strictly greater than tin[u], because v cannot climb above u.',
    terms: ['tin discovery', 'low reachable', 'strict greater', 'bridge test', 'back edge'],
    weight: 5,
  },
  'dsa-g15c-articulation-nonstrict-test': {
    slug: 'dsa-g15c-articulation-nonstrict-test',
    name: 'The articulation test keeps the equals, so a back edge reaching u counts',
    detail:
      'u is an articulation point when some child v has low[v] at or above tin[u]: v still cannot get above u, but a back edge landing exactly on u removes no connectivity because u itself is being removed.',
    terms: ['at or above', 'low v ge tin u', 'root two children', 'removing the node', 'non-strict test'],
    weight: 4,
  },
  'dsa-g15c-kosaraju-two-pass-reversal': {
    slug: 'dsa-g15c-kosaraju-two-pass-reversal',
    name: 'Kosaraju finishes on the graph then explores the transpose in reverse finish order',
    detail:
      'The first pass records exit order; the second runs on the reversed edges starting from the latest-finished node, which sits in a source component of the condensation and cannot leak into any other.',
    terms: ['finish order', 'transposed graph', 'reverse order start', 'source component', 'two passes'],
    weight: 5,
  },
  'dsa-g15c-adjacency-edge-id': {
    slug: 'dsa-g15c-adjacency-edge-id',
    name: 'Skip the parent edge by its id, not by the parent node',
    detail:
      'When two vertices share more than one edge, refusing every edge that merely touches the parent node hides a real cycle edge and invents a bridge, so the DFS must carry the id of the edge it came in on.',
    terms: ['edge identity', 'parallel edges', 'multi-edge', 'carry edge id', 'avoid false bridge'],
    weight: 4,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 15,
    name: 'Bellman Ford Algorithm',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: "Relax a weighted directed graph from a source until the distances stop moving, then read off whether a negative cycle exists.",
    brief:
      "Input: a directed weighted adjacency list (edges as [from, to, weight], weights possibly negative) and a source node. Output: the shortest distance to every node, Infinity for anything unreachable, plus a decision on whether the graph carries a negative cycle. The constraint that decides the method is that weights can be negative, which disqualifies Dijkstra.",
    concepts: [
      'dsa-g15c-bellman-ford-relaxation-passes',
      'dsa-g15c-negative-cycle-detection',
      'dsa-g15c-adjacency-edge-id',
      'dsa-complexity-counting',
    ],
    shortAnswer:
      'Seed the source at zero and relax every edge V minus 1 times; a shortest simple path has at most V minus 1 edges, so that many full sweeps settle all distances. A sweep that still improves after those passes means a negative cycle.',
    idealAnswer:
      'Dijkstra is wrong the moment a weight goes negative, because it commits a node permanently once it leaves the frontier, and a cheaper route through an unprocessed node can then appear behind it. Bellman-Ford buys correctness by giving up that commitment: it does not pick an order at all, it just repeatedly asks every edge "does the far endpoint get cheaper through here" and writes the answer if it does. Each full pass is guaranteed to settle at least one more edge of the true path, so after k passes every shortest walk with up to k edges is final; the shortest path to any node, once cycles are removed, uses at most V minus 1 edges, so V minus 1 passes suffice. Cost is O(V * E) time and O(V) space, worse than Dijkstra on non-negative weights but the only cheap option under negatives. The V-th pass is not decoration: it is the negative-cycle detector. If a distance still drops when no more edges should remain, the walk exploiting it must loop through a cycle whose total weight is negative, and the distances are meaningless because you can circle it forever.',
    walkthrough:
      'On the directed graph 0->1 weight 1, 1->2 weight 2, 2->3 weight 1 and 0->2 weight 5, seed dist = [0, inf, inf, inf]. Pass 1 relaxes in edge order: 0->1 writes 1, 1->2 writes 1+2 = 3, 2->3 writes 3+1 = 4, and 0->2 would write 5 but 3 is already smaller so it is rejected. Nothing changes in pass 2, so the early-exit stops it and dist = [0, 1, 3, 4] — note the direct 0->2 edge of cost 5 was beaten by the two-edge route 0->1->2 costing 3, which is exactly the relaxation chaining the passes are for. Now a negative weight with no cycle: 0->1 weight 4, 0->2 weight 5, 1->2 weight -3, 2->3 weight 2. Pass 1: dist1 = 4, dist2 first goes to 5 then 1->2 pulls it to 4 + (-3) = 1, dist3 = 1 + 2 = 3, giving [0, 4, 1, 3]; the negative edge is used once and no pass improves further. Finally the cycle 0->1 weight 1, 1->2 weight 1, 2->0 weight -3 sums to -1: seeding all three at zero, every pass keeps driving the values down (0 goes to -1, then -2, ...), so the V-th sweep still changes and the answer is a negative cycle rather than a set of distances.',
    commonMistake:
      'Stopping after the first pass whose order you happened to enumerate, or relaxing only edges whose source is currently reachable and then trusting the V-th pass to find every negative cycle.',
    whyWrong:
      'One pass is enough only when the input happens to be in topological order; on the example graph 0->1->2->3 the true distance to node 3 is found only after the chain has been relaxed edge by edge, so a single sweep over edges listed as 2->3 first would leave it at Infinity. The reachable-source trick is subtler and wrong for the detection contract: if the negative cycle lives in a component the source cannot reach, an algorithm that only relaxes from reachable nodes never touches it and reports "no negative cycle" while one exists. Seeding all vertices at zero for the detection pass is what makes a cycle anywhere in the graph light up, which is why hasNegativeCycle in the reference does exactly that instead of starting from the source.',
    followUps:
      [
        'Why is V minus 1 the right number of passes and not V or the diameter? Give the input where one fewer pass leaves a distance wrong.',
        'Rewrite detection so it only reports negative cycles reachable from the source. What has to change in the seeding, and which cycle does that hide?',
        'Bellman-Ford is O(V * E); SPQA and queue-optimised variants claim better in practice. What is the adversarial input where the naive version is quadratic?',
        'You are handed edges as a stream and cannot store the full list. Can a single pass still relax correctly, and what invariant breaks?',
      ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function collectDirectedEdges(adj) {\n' +
      '  const edges = [];\n' +
      '  for (let u = 0; u < adj.length; u += 1) {\n' +
      '    for (const edge of adj[u]) edges.push([edge[0], edge[1], edge[2]]);\n' +
      '  }\n' +
      '  return edges;\n' +
      '}\n' +
      '\n' +
      'function relaxPass(edges, dist) {\n' +
      '  let changed = false;\n' +
      '  for (const edge of edges) {\n' +
      '    const u = edge[0], v = edge[1], w = edge[2];\n' +
      '    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {\n' +
      '      dist[v] = dist[u] + w;\n' +
      '      changed = true;\n' +
      '    }\n' +
      '  }\n' +
      '  return changed;\n' +
      '}\n' +
      '\n' +
      'function bellmanFord(adj, src) {\n' +
      '  const dist = [];\n' +
      '  for (let i = 0; i < adj.length; i += 1) dist.push(i === src ? 0 : Infinity);\n' +
      '  const edges = collectDirectedEdges(adj);\n' +
      '  for (let pass = 0; pass < adj.length - 1; pass += 1) if (!relaxPass(edges, dist)) break;\n' +
      '  return dist;\n' +
      '}\n' +
      '\n' +
      'function hasNegativeCycle(adj) {\n' +
      '  const n = adj.length;\n' +
      '  const dist = [];\n' +
      '  for (let i = 0; i < n; i += 1) dist.push(0);\n' +
      '  const edges = collectDirectedEdges(adj);\n' +
      '  for (let pass = 0; pass < n; pass += 1) {\n' +
      '    if (!relaxPass(edges, dist)) return false;\n' +
      '  }\n' +
      '  return true;\n' +
      '}',
    modify:
      'Return the actual predecessor chain to each node so the caller can also print the path, and report which node sits on a detected negative cycle. What extra array does the relaxation carry, and where is the cycle found?',
  },
  {
    step: 15,
    name: 'Floyd Warshall Algorithm',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: "Fill an all-pairs distance matrix by deciding, one intermediate vertex at a time, whether routing through it helps.",
    brief:
      "Input: n vertices and a list of weighted edges, possibly negative but with no negative cycle. Output: an n by n matrix of shortest distances, Infinity for pairs with no route, zero on the diagonal. The method is fixed by the demand for every pair at once rather than from one source.",
    concepts: [
      'dsa-g15c-floyd-warshall-k-outer',
      'dsa-g15c-negative-cycle-detection',
      'dsa-g15c-adjacency-edge-id',
      'dsa-loop-invariant',
    ],
    shortAnswer:
      'Hold the matrix of best distances and sweep the intermediate vertex k as the outermost loop, relaxing dist[i][j] against dist[i][k] + dist[k][j]. k outermost is what makes the invariant that only nodes 0..k are used inside a path stay true.',
    idealAnswer:
      'The recurrence is tiny — can I go i to j more cheaply by detouring through k — but the whole correctness sits in the loop nesting. Putting k on the outside means that when we finish round k, every entry dist[i][j] is the shortest i-to-j walk whose interior vertices are all drawn from the set {0, 1, ..., k}; the two inner loops only ever read values that were themselves computed under that same restriction, so the invariant composes. Put k in the middle and you break the induction: a path through a not-yet-approved intermediate gets used as if it were legal. Cost is O(n^3) time and O(n^2) space, run in place, which is exactly n Dijkstra passes done on a dense graph without the heap overhead and far simpler to write. It handles negative edges because it never commits an order, but a single negative cycle makes the answer collapse: the diagonal dist[i][i] is the shortest non-trivial walk from i back to itself, so after the sweep any i with dist[i][i] below zero lies on (or reaches) a negative cycle, and the finite distances around it are lies. The base case is diagonal zero, edge weight elsewhere on direct edges, and Infinity for absent edges.',
    walkthrough:
      'Take 3 vertices with directed edges 0->1 weight 3, 1->2 weight 2, 0->2 weight 10. The matrix starts as [[0,3,10],[inf,0,2],[inf,inf,0]]. Round k = 0 offers no detour through node 0 (nothing reaches 0), so nothing changes. Round k = 1 tests i to 1 plus 1 to j: dist[0][2] compares 10 against dist[0][1] + dist[1][2] = 3 + 2 = 5, and takes 5. Round k = 2 finds no improvement. The finished matrix is [[0,3,5],[inf,0,2],[inf,inf,0]] — the 0->2 entry fell from the direct 10 to the routed 5 precisely because node 1 was admitted as an intermediate. Reading it, node 2 reaches nothing (bottom row all Infinity), and the diagonal never dropped below zero. Now feed it a negative cycle 0->1 weight -1, 1->0 weight -1: after the sweeps dist[0][0] becomes -2, because the round over node 1 lets node 0 loop through 1 and back, and the negative diagonal is the cycle report.',
    commonMistake:
      "Moving k inside the loop nest, or initialising the diagonal to Infinity instead of zero so that the 'path through k' can never start or end at k.",
    whyWrong:
      'The k-in-the-middle ordering silently answers a different recurrence — it lets dist[i][j] consume a through-k value for a k that is not yet globally settled — and on a graph like 0->1->2->3 with a long edge 0->3 weight 5 it returns a matrix where some shortest routes are never discovered. Initialising dist[i][i] to Infinity instead of 0 looks harmless but breaks the invariant: the whole algorithm is built on "the empty i-to-i path costs zero", and without it, detouring i to i to j (which should just be i to j) reads as unreachable, so multi-hop paths collapse. The diagonal-zero choice is also what makes negative-cycle detection work, because a negative self-distance is only meaningful against a baseline of zero.',
    followUps:
      [
        'Prove the k-outer invariant by induction. What exactly may a legal interior vertex be after round k, and why does swapping the loops violate it?',
        'Floyd-Warshall is n cubed. When is that actually cheaper than running Dijkstra from every node, and what is the crossover in edge density?',
        'Reconstruct the actual next-hop from the finished matrix. What extra n by n array do you need, and where is it updated?',
        'You only care whether pairs are reachable, not the cost. What single substitution to the relaxation gives the transitive closure?',
      ],
    solution:
      buildAdj + '\n' +
      '\n' +
      showGrid + '\n' +
      '\n' +
      FLOYD,
    modify:
      'Also emit, for each pair, the intermediate vertex that first improved it, so the caller can print a shortest path. Which update site records it, and what happens on a tie?',
  },
  {
    step: 15,
    name: 'Find the City With the Smallest Number of Neighbors at a Threshold Distance',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: "Across all cities, pick the one reachable to the fewest others within a distance budget, breaking ties toward the highest index.",
    brief:
      "Input: n cities, undirected weighted routes as [a, b, distance], and a distance threshold. Output: the index of the city from which the fewest other cities lie at distance at most the threshold; when several tie, the numerically largest index. The constraint that decides the approach is that the count depends on shortest distances between every pair, not just from one source.",
    concepts: [
      'dsa-g15c-floyd-warshall-k-outer',
      'dsa-g15c-threshold-closure-count',
      'dsa-g15c-adjacency-edge-id',
    ],
    shortAnswer:
      "Close the graph with Floyd-Warshall so every city pair knows its true shortest distance, then for each city count how many others fall within the threshold and return the city with the smallest count, preferring the larger index on a tie.",
    idealAnswer:
      'The question is about a per-city aggregate over all-pairs distances, so it is really Floyd-Warshall with a counting tail: run the closure once in O(n^3), then one O(n^2) scan turns each row into a neighbor count. Re-running Dijkstra per city also works and is O(n * E log n), but on a dense network — where this problem lives, with n in the low hundreds — the matrix closure is both faster to write and faster to run. The two contract details that decide correctness are the tie-break and the strict budget test. "Smallest number of neighbors, largest index on a tie" means the comparison must be `count <= best`, not `< best`, so that a later city with an equal count overwrites the earlier answer; using `<` returns the smallest index and quietly fails the tie cases. The budget test is `dist[i][j] <= threshold` with i not equal to j — the diagonal is zero and every city is trivially within budget of itself, so forgetting the i != j guard inflates every count by one and, worse, never lets a truly isolated city win. A city that cannot reach anyone within budget has count zero and is the answer, which is exactly what makes the disconnected input behave.',
    walkthrough:
      'Four cities with routes 0-1 weight 3, 1-2 weight 1, 1-3 weight 4, 2-3 weight 1. The closure gives 0-1 = 3, 0-2 = 4 (through 1), 0-3 = 5 (0-1-2-3), 1-2 = 1, 1-3 = 2 (through 2, beating the direct 4), 2-3 = 1. At threshold 4 the neighbor counts are city 0 reaching {1, 2} (0->3 is 5, too far) = 2; city 1 reaching all three = 3; city 2 reaching all three = 3; city 3 reaching {1, 2} = 2. Cities 0 and 3 tie at 2, so the largest-index rule returns 3. Tighten the threshold to 2 and city 0 can reach no one (all its distances are 3 or more), giving it a count of 0 — the smallest — so the answer flips to 0: this is why the i != j guard matters, since the zero diagonal would otherwise hand city 0 a phantom self-neighbor. Feed a single city with no routes and the count is trivially 0, returning 0.',
    commonMistake:
      'Using a strict `<` when scanning for the minimum so ties resolve to the smallest index, or counting the self-distance on the diagonal as a neighbor.',
    whyWrong:
      'Both are correctness failures on real inputs of this exact problem. The tie-break is the whole point of the phrase "in case of a tie return the city with the greatest index": on the four-city graph above two cities share the minimum count, and a `<` scan answers 0 where 3 is required. The diagonal error is subtler: `dist[i][i]` is 0 and always within any non-negative threshold, so an unguarded count of `dist[i][j] <= threshold` over all j adds one to every city — harmless for ranking unless a city is genuinely isolated, and precisely then it destroys the answer, because the isolated city (true count 0) is reported with count 1 and loses to a city that reaches a single neighbor.',
    followUps:
      [
        'Swap the per-city count for Dijkstra with early stopping at the threshold. When does that beat the full closure, and what does it cost per source?',
        'You are asked for all cities tied at the minimum count, not just the largest index. Which one line changes?',
        'The threshold differs per query but the routes are fixed. What do you precompute once, and what stays per-query?',
        'Routes are directed. Does the neighbor count of a city become its in-degree, its out-degree, or neither within the threshold?',
      ],
    solution:
      FLOYD + '\n' +
      '\n' +
      'function findTheCity(n, edges, distanceThreshold) {\n' +
      '  const bothWays = [];\n' +
      '  for (const edge of edges) {\n' +
      '    bothWays.push([edge[0], edge[1], edge[2]]);\n' +
      '    bothWays.push([edge[1], edge[0], edge[2]]);\n' +
      '  }\n' +
      '  const dist = floydWarshall(n, bothWays);\n' +
      '  let best = -1;\n' +
      '  let bestCount = Infinity;\n' +
      '  for (let i = 0; i < n; i += 1) {\n' +
      '    let count = 0;\n' +
      '    for (let j = 0; j < n; j += 1) if (i !== j && dist[i][j] <= distanceThreshold) count += 1;\n' +
      '    if (count <= bestCount) {\n' +
      '      bestCount = count;\n' +
      '      best = i;\n' +
      '    }\n' +
      '  }\n' +
      '  return best;\n' +
      '}',
    modify:
      'Report the reachability radius as well: for the chosen city, the farthest distance among its within-threshold neighbors. Where in the row scan does that second accumulator live?',
  },
  {
    step: 15,
    name: "Minimum Spanning Tree - Prim's Algorithm",
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Grow a single spanning tree one cheapest frontier edge at a time and return its total weight.',
    brief:
      "Input: n vertices and undirected weighted edges as [a, b, weight]. Output: the total weight of a minimum spanning tree and how many edges it took, with the graph declared connected only if that is n minus 1 edges. The constraint that forces a frontier is that the cheapest edge leaving the current tree must be chosen globally, not per node.",
    concepts: [
      'dsa-g15c-mst-cut-property',
      'dsa-g15c-prim-frontier-vs-kruskal-sort',
      'dsa-heap-guarantees-only-the-root',
      'dsa-g15c-adjacency-edge-id',
    ],
    shortAnswer:
      'Start from any vertex, keep the edges leaving the grown tree in a min-heap, and each step pop the cheapest edge whose far end is still outside the tree, add it, and push that new vertex edges. The heap is the frontier the cut property needs.',
    idealAnswer:
      "Prim maintains one connected blob of tree and always attaches the next vertex by the lightest edge crossing the cut between that blob and everything else — the cut property says such an edge is safe to take, so the greedy never has to reconsider. The frontier is what separates Prim from a breadth-first crawl: a plain queue would take edges in arrival order, not by weight, and produce a spanning tree that is not minimal. The min-heap is the honest implementation of 'cheapest edge leaving the tree' because at every moment all currently-crossing edges are in it and the pop hands back the lightest. Lazy insertion is the neat detail: you push edges to already-in-tree vertices too and simply discard them when popped, which avoids a decrease-key structure and keeps the code short, at the cost of a heap that can hold duplicates. Total cost is O(E log E) with a binary heap (the heap holds up to E entries) and O(V) for the in-tree flags, and on a dense graph a matrix scan instead of a heap gives O(V^2). The contract trap is connectivity: Prim grown from one seed only ever reaches that seed's component, so a forest input returns a smaller edge count than V minus 1, which the reference reports via a connected flag rather than pretending to have spanned everything.",
    walkthrough:
      'Four vertices with edges 0-1 weight 2, 0-2 weight 3, 1-2 weight 1, 1-3 weight 4, 2-3 weight 5. Begin at 0: the frontier holds its two edges (0-1 weight 2) and (0-2 weight 3). Pop the cheapest, 0-1 weight 2, tree is {0, 1}, weight so far 2, and push 1 outgoing edges 1-2 weight 1 and 1-3 weight 4, so the frontier is now {1-2: 1, 1-3: 4, 0-2: 3}. Pop 1-2 weight 1, add vertex 2, weight 3, push 2-3 weight 5 (and 2-0, 2-1 which both point back into the tree). Pop 0-2 weight 3, but vertex 2 is already in the tree, so it is discarded — this is the lazy duplicate handling. Pop 1-3 weight 4, add vertex 3, weight 7. Three edges taken equals V minus 1, so the tree is complete with weight 7. Run the same graph on a disconnected input, say only edges 0-1 and 2-3 each weight 1: starting from 0 the frontier drains after adding vertex 1, taken is 2, the loop exits with taken far below V minus 1, and connected comes back false.',
    commonMistake:
      'Using a plain queue or scanning neighbours without a global priority, or restarting Prim from each unvisited vertex and calling the union of trees a minimum spanning tree.',
    whyWrong:
      'A FIFO frontier picks the earliest edge, not the lightest one crossing the cut, so on the trace above it could take 0-2 weight 3 before ever seeing 1-2 weight 1 and settle for weight 9. That is a spanning tree, just not a minimum one. The restart trick produces a minimum spanning forest, which coincides with an MST only when the graph is connected; on 0-1 and 2-3 it silently returns a "tree" of two edges that spans nothing and hides the disconnection the interview is testing for — the honest answer is to report the graph is not connected, not to glue components together that no edge joins.',
    followUps:
      [
        'Replace the lazy heap with an eager one that decreases keys. What structure must you add, and what does the bound become?',
        'A dense graph makes a V squared array scan beat the heap. What threshold on edge count flips that choice?',
        'Prove every edge Prim picks is on some MST. Say it as the cut between the grown tree and the rest.',
        'The weights arrive as a stream and you cannot hold the frontier. Can Prim still finish, and what does it have to remember?',
      ],
    solution:
      buildAdj + '\n' +
      '\n' +
      minHeap + '\n' +
      '\n' +
      'function primMst(n, edges) {\n' +
      '  const adj = buildAdj(n, edges, false);\n' +
      '  const inTree = [];\n' +
      '  for (let i = 0; i < n; i += 1) inTree.push(false);\n' +
      '  const heap = new MinHeap();\n' +
      '  let weight = 0;\n' +
      '  let taken = 0;\n' +
      '  inTree[0] = true;\n' +
      '  taken = 1;\n' +
      '  for (const edge of adj[0]) heap.push([edge[2], edge]);\n' +
      '  while (heap.size() > 0 && taken < n) {\n' +
      '    const edge = heap.pop()[1];\n' +
      '    const u = edge[0], v = edge[1];\n' +
      '    if (inTree[u] && inTree[v]) continue;\n' +
      '    const add = inTree[u] ? v : u;\n' +
      '    weight += edge[2];\n' +
      '    inTree[add] = true;\n' +
      '    taken += 1;\n' +
      '    for (const next of adj[add]) if (!inTree[next[1]]) heap.push([next[2], next]);\n' +
      '  }\n' +
      '  return { weight: weight, connected: taken === n, edgesTaken: taken - 1 };\n' +
      '}',
    modify:
      'Instead of the total weight, return the list of chosen tree edges in the order they were added. Which value do you accumulate instead, and why can you drop nothing else?',
  },
  {
    step: 15,
    name: 'Disjoint Set Union (Rank & Size)',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Maintain a partition of vertices under repeated merges and answer whether two are together in near constant time.',
    brief:
      "Input: a universe of n elements and a sequence of union and find operations. Output: which component a element belongs to, whether two elements are connected, the live component count, and the size of a leader's set. The constraint that decides the structure is that merges interleave with queries, so you cannot rebuild a component map each time.",
    concepts: [
      'dsa-g15c-dsu-compression-by-size',
      'dsa-g15c-component-size-merge',
      'dsa-cycle-detection',
      'dsa-value-versus-reference',
    ],
    shortAnswer:
      'Store a parent forest where each set is a tree rooted at its representative; union by size hangs the smaller tree under the larger so depth stays logarithmic, and path compression rewires every node on a find straight to the root, giving an amortised near-constant per operation.',
    idealAnswer:
      'The disjoint set is a forest pretending to be a partition: each element names a parent, the element whose parent is itself is the set leader, and "are these two connected" is just "do their walks up the forest end at the same root". Naively that is a linked-list depth and worst case linear per find, which is where the two tricks come in. Union by size (or rank) decides attachment direction — the smaller tree becomes a child of the larger root — which bounds any node depth by log n because a node depth only grows when its whole tree is at least doubled. Path compression then flattens on read: when find walks u to root it relays every visited node directly to root, so a tall chain costs once and is cheap forever after. Together the two give an amortised inverse-Ackermann time per operation, effectively constant, with O(n) space. The size array and the components counter are what make the structure useful for the whole step: size lives only at the roots and is what a merge problem reads to combine regions, and components lets you answer how many groups remain without any scan. The trap is treating size or root as if valid for every element: after compression, only roots carry the true size, so reading the size of a non-root is a stale single, and any code must find the root first.',
    walkthrough:
      'Start with five singletons, components = 5, every parent[i] = i and size[i] = 1. Union 0 and 1: find(0) = 0, find(1) = 1, sizes tie at 1 so 1 hangs under 0 (or vice versa depending on the tie rule); size[0] = 2, components = 4. Union 2 and 3: root 2 absorbs 3, size[2] = 2, components = 3. Union 1 and 2: find(1) walks 1 to 0 (size 2), find(2) walks 2 to root 2 (size 2); tie sends one under the other, say root 0, giving size[0] = 4 and components = 2. Now connected(0, 3) is true — both climb to 0 — while connected(0, 4) is false because element 4 was never touched and is still its own set. Feed the cycle edges 1-2, 1-3, 2-3 into firstRedundantEdge: union(1, 2) succeeds, union(1, 3) succeeds, union(2, 3) finds 2 and 3 already sharing a root and returns false, so the returned edge [2, 3] is the one that closed the cycle. On a tree-less edge list that same loop returns null.',
    commonMistake:
      'Reading the size of an arbitrary element instead of the root, or unioning by always attaching the first argument under the second without checking sizes.',
    whyWrong:
      'The size array is only meaningful at a root; after path compression a child element keeps a stale size of 1 while its component may hold thousands, so `size[x]` for a non-root silently under-counts and any "merge two regions" answer built on it is wrong — you must write `size[find(x)]`. Unconditional attachment by argument order is the other failure: always making the second root a child of the first reproduces a linked list on a pathological union sequence, so the last union produces a chain of depth n and each find on it costs O(n), destroying the logarithmic bound that union by size is there to guarantee. Rank and size are two ways of the same discipline — attach the shallower/smaller under the other.',
    followUps:
      [
        'Path compression alone is not provably inverse-Ackermann without union by rank. Give the union order that makes a deep chain and trace one find flattening it.',
        'Store an extra sum per root instead of a size. Which graph problems become one pass over the edges?',
        'You must support splitting a set back out (undo). Why does plain path compression make a rollback hard, and what structure fixes it?',
        'Components start at n and drop on every successful union. Why does a failed union leave the counter alone, and what does that say about cycles?',
      ],
    solution:
      unionFind + '\n' +
      '\n' +
      DSU_UTIL,
    modify:
      'Add a union-by-rank variant alongside the union-by-size one and expose the current tree height per root. Which array plays the role of size, and what changes in the attach rule?',
  },
  {
    step: 15,
    name: "Kruskal's Algorithm",
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Sort every edge by weight and keep the ones that join two different components until the tree is complete.',
    brief:
      "Input: n vertices and undirected weighted edges as [a, b, weight]. Output: the minimum spanning tree edge list in the order accepted, its total weight, and a flag for whether a spanning tree was even possible. The constraint that decides the method is that global cheapness is tested against connectivity, so the edges are considered in sorted order.",
    concepts: [
      'dsa-g15c-mst-cut-property',
      'dsa-g15c-prim-frontier-vs-kruskal-sort',
      'dsa-g15c-dsu-compression-by-size',
      'dsa-value-versus-reference',
    ],
    shortAnswer:
      'Sort all edges by weight, then scan them in that order, accepting an edge only when its two endpoints are in different components — a disjoint set answers that — and stop at n minus 1 accepted edges; the accepted set is a minimum spanning tree.',
    idealAnswer:
      "Kruskal reads the same cut property as Prim but from the other end: rather than growing one tree and asking what its cheapest outgoing edge is, it keeps a forest of single vertices and repeatedly merges two trees with the globally lightest edge that connects them. That edge is the lightest crossing the cut between the two components it joins, so it is safe. The disjoint set is doing the whole job of rejecting edges that would close a cycle — an edge whose endpoints already share a root is exactly one that would create a cycle, so skipping it is what keeps the result a forest. Cost is dominated by the sort at O(E log E), after which the union passes are O(E * inverse-Ackermann), effectively linear; the space is O(E) for the sorted copy plus O(V) for the set. This beats Prim on sparse graphs (few edges to sort) and loses on dense ones where Prim with a matrix scan is O(V^2) against Kruskal sorting nearly every pair. The two traps are the same ones Prim has: the accepted count reaching V minus 1 is the only proof of connectivity, so a forest input exits short and must be reported as not connected, and sorting must be by the numeric weight, not by the default lexicographic array comparison that turns 10 into a key smaller than 2.",
    walkthrough:
      'The same four-vertex graph Prim used: edges 0-1 weight 2, 0-2 weight 3, 1-2 weight 1, 1-3 weight 4, 2-3 weight 5. Sort by weight to the order 1-2 (1), 0-1 (2), 0-2 (3), 1-3 (4), 2-3 (5). Start with four separate components. Accept 1-2 weight 1 (merges {1,2}); the disjoint set now has root for 1 and 2 together, weight 1. Accept 0-1 weight 2 (merges {0} into {1,2}); weight 3. Consider 0-2 weight 3: find(0) and find(2) are now the same component, so it would close a cycle and is rejected. Accept 1-3 weight 4 (merges {3}); weight 7, three edges equal to V minus 1, done. The accepted list is [1-2, 0-1, 1-3] totalling 7 — the same weight Prim reached by a different route, which is the cut property agreeing with itself. On the disconnected pair 0-1 weight 1 and 2-3 weight 1, the scan accepts both but only reaches two edges for four vertices, so connected is reported false and the result is a spanning forest.',
    commonMistake:
      'Accepting an edge that joins two nodes already connected because you only tracked "is either endpoint new", or comparing edges by their default array stringification.',
    whyWrong:
      'Cycle rejection is about components, not novelty: 0-2 in the trace has both endpoints already seen, but both were seen and are now connected, so taking it would add an edge without adding a vertex and yield a four-edge graph with a cycle for four vertices. The only correct test is whether the endpoints share a disjoint-set root. The sort bug is invisible on single-digit weights and catastrophic at ten: a default `[a, b, w].sort()` compares stringified elements, so it orders weight 10 before weight 2, and the "minimum" tree ends up preferring an expensive edge over a cheap one — the MST total comes out too large while every assertion of shape still passes.',
    followUps:
      [
        'Kruskal is O(E log E) from the sort. When weights are small integers, what sorting trick removes the log and what does the bound become?',
        'Give the version that stops early at n minus 1 edges. Why is that correct on a connected graph but a silent truncation on a forest?',
        'You need a maximum spanning tree. What one character of the comparator changes the answer?',
        'Edges arrive already sorted in a stream you cannot re-sort. Can Kruskal still run, and what has to buffer?',
      ],
    solution:
      unionFind + '\n' +
      '\n' +
      'function kruskalMst(n, edges) {\n' +
      '  const uf = new UnionFind(n);\n' +
      '  const sorted = edges.slice().sort((a, b) => a[2] - b[2]);\n' +
      '  const mst = [];\n' +
      '  let weight = 0;\n' +
      '  for (const edge of sorted) {\n' +
      '    if (uf.union(edge[0], edge[1])) {\n' +
      '      mst.push([edge[0], edge[1], edge[2]]);\n' +
      '      weight += edge[2];\n' +
      '      if (mst.length === n - 1) break;\n' +
      '    }\n' +
      '  }\n' +
      '  return { weight: weight, mst: mst, connected: mst.length === n - 1 };\n' +
      '}',
    modify:
      'Report the cheapest edge that was rejected as a cycle-former for each component, so the caller can see the near-misses. Where in the loop would you stash it without changing the accepted set?',
  },
  {
    step: 15,
    name: 'Number of Operations to Make Network Connected',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Given existing cables, count the fewest you can unplug from one place and replug to make the whole network one component.',
    brief:
      "Input: n nodes and a list of redundant or direct connections as [a, b]. Output: the minimum number of cables to re-route so every node is connected, or -1 when there are too few cables to span the network. The constraint that decides it is that a spanning tree always needs n minus 1 edges, so cable count versus n is the first test.",
    concepts: [
      'dsa-g15c-dsu-compression-by-size',
      'dsa-g15c-component-size-merge',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      'Count the cable-shortage guard first: fewer than n minus 1 connections means -1. Otherwise union all connections with a disjoint set; the answer is the number of remaining components minus one, because every extra internal cable can bridge two components.',
    idealAnswer:
      "The insight is a counting argument, not a graph search. A connected network on n nodes needs at least n minus 1 edges, so if the input carries fewer than that, no rearrangement helps and the answer is -1 — that guard must come before any union, because a shortage is decided by sheer edge count. If there are enough cables, contract the graph into its connected components with a disjoint set: suppose it ends with k components. Between any two components there is at least one spare cable to move, because the total number of edges is at least n minus 1 while spanning the k components internally would only need n minus k, leaving at least k minus 1 redundant edges to relocate. Every relocation that connects two components drops k by one, so exactly k minus 1 operations reach a single component. The number of union operations that actually merge (as opposed to the redundant ones) is n minus k, and the redundant count is edges minus that, which is exactly the pool of movable cables. The trap is the -1 case and the empty/repeat edges: repeated connections are harmless (the union just fails) but a shortage must return -1 and not a negative operations count.",
    walkthrough:
      'Four nodes with connections 0-1, 0-2, 1-2. That is three cables and n minus 1 is three, so we pass the shortage guard. Union them: the set ends with components {0, 1, 2} and {3}, so k = 2, and the answer is k minus 1 = 1 — unplug the redundant 0-2 and plug it to node 3. Now five nodes with 0-1, 1-2, 3-4: that is three cables but n minus 1 is four, so the shortage guard fires and the answer is -1, correct because three cables can never link five nodes. Six nodes with six cables forming two triangles 0-1-2 and 3-4-5: enough cables, the set ends with k = 2 components, answer 1, and indeed each triangle has a redundant edge to spend. Feed the fully connected path 0-1-2-3-4-5: the unions leave one component, k = 1, answer 0, nothing to move. A single node with no cables is the degenerate clean case: n minus 1 is 0, zero cables satisfy the guard, k = 1, answer 0.',
    commonMistake:
      'Running the union first and reporting components minus one without the cable-count guard, or assuming you may only use cables that are already redundant within a component.',
    whyWrong:
      "Drop the shortage guard and the counting logic misreports impossible inputs: five nodes with three cables would show k = 3 components and answer 2, but you only have three cables and need four edges to span five nodes, so the two 'operations' you promised do not physically exist. The guard converts an optimistic structure answer into an honest -1. The second error is over-restricting the source of spare cables — you can unplug any edge that is not a bridge of its own component, which includes edges that look like they are holding something together as long as the component still has a surplus, and the whole method rests on the fact that a component on v nodes with more than v minus 1 edges has a slack edge to spare.",
    followUps:
      [
        'Why exactly does an edge surplus of at least k minus 1 always exist when total edges are at least n minus 1? Prove it from n minus k being the internal minimum.',
        'Some connections are already duplicated in the list. Do they change the component count or the surplus, and why is union still correct?',
        'You must also output which cable to move and where. What extra bookkeeping distinguishes a movable edge from a bridge?',
        'Generalise to k separate clusters that must be linked into c components. What replaces the minus one?',
      ],
    solution:
      unionFind + '\n' +
      '\n' +
      'function makeConnected(n, connections) {\n' +
      '  if (connections.length < n - 1) return -1;\n' +
      '  const uf = new UnionFind(n);\n' +
      '  for (const edge of connections) uf.union(edge[0], edge[1]);\n' +
      '  return uf.components - 1;\n' +
      '}',
    modify:
      'Return -1 for a graph that has enough cables but still cannot be connected because it has an isolated node with degree zero. Which extra measurement tells you that, and does the current formula already handle it?',
  },
  {
    step: 15,
    name: 'Most Stones Removed with Same Row or Column',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Remove as many stones as possible where a stone can only be taken if another still shares its exact row or column.',
    brief:
      "Input: a list of stone coordinates [x, y] on a plane where several stones may share a row or a column. Output: the maximum number of stones removable. The constraint that decides it is that removal is legal only while a same-row-or-same-column partner remains, which turns the problem into one per connected group.",
    concepts: [
      'dsa-g15c-dsu-compression-by-size',
      'dsa-g15c-component-size-merge',
      'dsa-hash-frequency',
    ],
    shortAnswer:
      "Treat stones as connected when they share a row or a column, union them into components, and in each component you can remove every stone but one, so the answer is the total stone count minus the number of connected components.",
    idealAnswer:
      'Model the stones as vertices with an edge whenever two sit on the same row or the same column; a removal is legal exactly when it peels a vertex off a still-connected group, and within any group of size s you can always remove s minus 1 stones, leaving the last one stranded with no partner. So the maximum removed is the sum over components of (size - 1), which telescopes to total stones minus the component count. The disjoint set computes that count without ever materialising the O(n^2) edges: for each stone, union it with the first stone seen on its row and the first seen on its column, using two hash maps keyed by coordinate; every stone in a shared row or column collapses to one root through those anchor stones. Cost is O(n * alpha) with two maps, versus the flood-fill-on-a-bipartite-graph alternative that costs the same but is harder to state. The subtlety is that row and column are the same kind of node here — a stone is connected to a row-group and a column-group simultaneously — so a single "L" chain of stones (sharing alternately rows and columns) forms one component even though no two consecutive stones share both, which is exactly why the answer is per-component and not per-pair.',
    walkthrough:
      'Six stones at (0,0), (0,1), (1,0), (1,2), (2,1), (2,2). Stone 0 anchors row 0 and column 0. Stone 1 shares row 0 so unions to stone 0; its column 1 is new. Stone 2 shares column 0 with stone 0, so it joins {0,1}. Stone 3 (1,2) is fresh on row 1 and column 2. Stone 4 (2,1) shares column 1 with stone 1, merging {0,1,2} and pulling stone 4 in. Stone 5 (2,2) shares row 2 with stone 4 and column 2 with stone 3, stitching {3} into the big group. The dust settles to a single component of six, so removed = 6 - 1 = 5. Now two stones (0,0) and (1,1) share neither row nor column: two components, answer 2 - 2 = 0, you cannot move either. A single stone is one component, answer 0. Two stones (0,0) and (0,1) share a row: one component, answer 2 - 1 = 1. Four stones forming two separate dominoes in different rows and columns give two components and answer 4 - 2 = 2.',
    commonMistake:
      'Counting removable pairs, or unioning stones that merely share a coordinate value across an unrelated axis, e.g. treating (x,*) and (*,x) as connected.',
    whyWrong:
      'Removal is not a matching problem where one partner yields one move: a five-stone component yields four removals, not two, so any pair-counting under-answers as soon as a group exceeds two stones. The axis confusion is a real graph error — sharing a row means the x coordinates match and the y is irrelevant; connecting (0,0) to (1,0) is legal (same row) but "connecting" (0,1) to (1,0) is not, since neither coordinate coincides. Reading the two maps as one shared coordinate space silently merges components and returns too many removals on a grid where a row number happens to equal a column number.',
    followUps:
      [
        'Give the version that builds a bipartite graph of row-nodes and column-nodes and counts its components. Why is the answer then stones minus components-on-the-bipartite-side?',
        'What if a removal is also allowed for stones that share a diagonal? Which edge rule changes and does the component formula survive?',
        'Coordinates are huge and sparse. Why are the two anchor maps what lets you never allocate a grid?',
        'You must also return one valid removal order. Within a component, which stone do you leave as the last one standing?',
      ],
    solution:
      unionFind + '\n' +
      '\n' +
      'function mostStonesRemoved(stones) {\n' +
      '  const uf = new UnionFind(stones.length);\n' +
      '  const byRow = new Map();\n' +
      '  const byCol = new Map();\n' +
      '  for (let i = 0; i < stones.length; i += 1) {\n' +
      '    const x = stones[i][0], y = stones[i][1];\n' +
      '    if (byRow.has(x)) uf.union(i, byRow.get(x));\n' +
      '    else byRow.set(x, i);\n' +
      '    if (byCol.has(y)) uf.union(i, byCol.get(y));\n' +
      '    else byCol.set(y, i);\n' +
      '  }\n' +
      '  return stones.length - uf.components;\n' +
      '}',
    modify:
      'A stone may only be removed if it shares a row OR a column with a currently present stone, one at a time. Return the last-remaining stone count per connected component. What does the disjoint set already store that gives you the group sizes?',
  },
  {
    step: 15,
    name: 'Accounts Merge',
    difficulty: 'Medium',
    topicSlug: 'graph-traversal',
    stem: 'Merge identity records that share an email so each person ends up with one sorted bundle of every address they own.',
    brief:
      "Input: records where each is [name, email1, email2, ...]; two records belong to the same person if they share an email. Output: one merged record per identity, the owner name first and the emails sorted, with the records ordered deterministically. The constraint is that shared emails imply transitive ownership, so it is a connected-components problem.",
    concepts: [
      'dsa-g15c-dsu-compression-by-size',
      'dsa-g15c-component-size-merge',
      'dsa-hash-frequency',
      'dsa-default-sort-is-lexicographic',
    ],
    shortAnswer:
      "Give every distinct email a node, union the emails within each record, then group emails by their disjoint-set root and emit the record's name with the emails sorted; two records merge exactly when they share an email.",
    idealAnswer:
      'The merge relation is transitive closure over "these two emails belong together", and the disjoint set is the natural machine for it: every email is a node, and within a single record all its emails are declared connected by unioning them to the record first email. Because a shared email appears in two records, the union propagates ownership across records automatically, so two records for the same person collapse into one component even if they never share a name string. After the unions, a map from root to the bucket of email indices collects each identity email set; you sort the emails and pair them with a representative name. Cost is O(N log N) driven by the per-component email sort and by lexicographic output ordering, with the union passes near-linear. Two contract traps make or break it: the name must be taken consistently from the owner — LeetCode guarantees an email belongs to exactly one name, so any record that first registered that email gives the right name, but reading the name from an arbitrary group member assumes that guarantee — and the output must be sorted both inside each record and across records, otherwise the result is a set in disguise and comparison against an expected array fails. Emails, not names, are the identity key, which is why records sharing a name but no email stay separate.',
    walkthrough:
      'Records: [A, a1], [A, a1, a2], [B, b1]. Assign indices a1 = 0, a2 = 1, b1 = 2, names [A, A, B]. Union within record 2 connects a1 and a2 (roots 0 and 1), so {0,1} is one component and {2} another. Collecting by root gives component one = {a1, a2} and component two = {b1}; sorted, the first record name taken from the first email a1 is A, producing [A, a1, a2], and the second is [B, b1]. Output sorted lexicographically: [A, a1, a2 | B, b1]. Now the cross-record bridge: [P, p1, p2] and [Q, p2, p3]. p1 = 0, p2 = 1, p3 = 2. Record 1 unions p1-p2; record 2 unions p2-p3; all three land in one component, emails sorted p1, p2, p3, and the name read from p1 is P, giving [P, p1, p2, p3] — Q has vanished because it shares only an email, and the merged identity keeps the name that first registered the lowest email. Two records with the same name but disjoint emails, [J, j1] and [J, j2], stay two separate output records because nothing joins them.',
    commonMistake:
      "Grouping by the display name, or forgetting to sort the emails within a merged record so the output order depends on arrival.",
    whyWrong:
      'Names are labels, not keys: two records with different names but one shared email are the same person (the P and Q bridge above), and two records with the same name but no shared email are different accounts that must stay apart (the j1/j2 case). Grouping by name gets both wrong at once. The missing sort is a correctness failure against a fixed expected output: a component built by unioning in record order yields emails in insertion order, and comparing that to a sorted reference fails even though the set of emails is right — the spec explicitly asks each merged list to be sorted.',
    followUps:
      [
        'What does the union-find operate over if accounts share a phone number instead of an email, and one email can have two owners? Which invariant breaks?',
        'Records stream in and you must answer "are these two emails the same person" at any time. Does the disjoint set still work, and what do you never rebuild?',
        'Two names are registered for the same email in bad data. Which merge rule do you pick, and why must you state it?',
        'Replace the final per-component sort with inserting into a sorted structure. What does that change about the complexity?',
      ],
    solution:
      unionFind + '\n' +
      '\n' +
      'function mergeAccounts(accounts) {\n' +
      '  const emailIndex = new Map();\n' +
      '  const allEmails = [];\n' +
      '  const nameOf = [];\n' +
      '  for (const account of accounts) {\n' +
      '    const name = account[0];\n' +
      '    for (let i = 1; i < account.length; i += 1) {\n' +
      '      const email = account[i];\n' +
      '      if (!emailIndex.has(email)) {\n' +
      '        emailIndex.set(email, allEmails.length);\n' +
      '        allEmails.push(email);\n' +
      '        nameOf.push(name);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  const uf = new UnionFind(allEmails.length);\n' +
      '  for (const account of accounts) {\n' +
      '    for (let i = 2; i < account.length; i += 1) {\n' +
      '      uf.union(emailIndex.get(account[1]), emailIndex.get(account[i]));\n' +
      '    }\n' +
      '  }\n' +
      '  const groups = new Map();\n' +
      '  for (let i = 0; i < allEmails.length; i += 1) {\n' +
      '    const root = uf.find(i);\n' +
      '    if (!groups.has(root)) groups.set(root, []);\n' +
      '    groups.get(root).push(i);\n' +
      '  }\n' +
      '  const result = [];\n' +
      '  for (const ids of groups.values()) {\n' +
      '    const emails = ids.map((id) => allEmails[id]).sort();\n' +
      '    result.push([nameOf[ids[0]]].concat(emails));\n' +
      '  }\n' +
      '  result.sort((a, b) => {\n' +
      '    if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;\n' +
      '    if (a[1] !== b[1]) return a[1] < b[1] ? -1 : 1;\n' +
      '    return 0;\n' +
      '  });\n' +
      '  return result;\n' +
      '}',
    modify:
      'Records may share an email but legitimately carry different names, and you must keep both names on the merged record. Which value does nameOf become, and where does the merge of name sets happen?',
  },
  {
    step: 15,
    name: 'Number of Island II',
    difficulty: 'Hard',
    topicSlug: 'graph-traversal',
    stem: 'Land appears one cell at a time on a water grid; report the island count after each placement without rescanning.',
    brief:
      "Input: a grid of rows by columns, initially all water, and an ordered list of positions to turn to land. Output: the number of islands after each placement. The constraint is that the grid grows cell by cell and a full connected-components sweep after every add would be quadratic, so the count must be maintained online.",
    concepts: [
      'dsa-g15c-online-union-islands',
      'dsa-g15c-dsu-compression-by-size',
      'dsa-g15c-component-size-merge',
      'dsa-single-pass-tracking',
    ],
    shortAnswer:
      'Keep a disjoint set over cells. Each new land cell adds one island, then unions it with any already-land orthogonal neighbours; every union that actually merges two components subtracts one, so the running count after a placement is the island total.',
    idealAnswer:
      'The number of islands is a single integer that moves predictably under a local edit: placing land where there was water creates a new island (+1), and joining it to each neighbour island that is genuinely a different component merges them (-1 per real merge). The disjoint set is what turns "is that neighbour a different island" into one find comparison, and the union returning a boolean tells you precisely whether to decrement — a neighbour already in the same component means the two cells just met through another path, so no decrement. This runs each add in roughly constant time for k placements, versus a full BFS or DFS flood after each placement that costs O(rows * cols * k). Flatten cells to a 1-D index row * cols + column and let the set live over that. The traps are the duplicate placement and the neighbour identity: adding a cell that is already land must leave the count untouched (no double increment), and you only union against the four orthogonal neighbours, not the diagonals, because connectivity by edges — not corners — is the definition. The set can count components over all cells, but only land cells are ever marked, so the manual running total, not the set internal counter, is the reported island number.',
    walkthrough:
      'A 3 by 3 grid, placements (0,0), (0,1), (1,2), (2,1). Place (0,0): land count goes 0 to 1, no land neighbours, report 1. Place (0,1): it is fresh water so +1 making 2, its left neighbour (0,0) is land in a different component, union merges so -1, net back to 1; report 1. Place (1,2): +1 to 2, neighbours up (0,2) water, left (1,1) water, down (2,2) water, right off-grid — no merge, report 2. Place (2,1): +1 to 3, neighbours (1,1) water, (2,0) water, (2,2) water — no merge, report 3. So the sequence is 1, 1, 2, 3. Now a 2 by 2 filled in spiral order (0,0), (0,1), (1,0), (1,1): after each add the count is 1, 1 (merged right), 1 (merged down), 1 (the last cell touches two already-connected neighbours, its second union fails so no double decrement) — sequence 1, 1, 1, 1. Re-adding an existing land cell, say (0,0) twice, reports 1 then 1 because the duplicate is a no-op.',
    commonMistake:
      "Running a fresh flood fill to recount islands after every placement, or decrementing the count for every land neighbour regardless of whether it was already in the same component.",
    whyWrong:
      'The flood-fill recount is O(k * rows * cols) and is exactly the blowup the online method exists to avoid; on a 1000 by 1000 board with a million placements it is intractable where the disjoint set is linear. The blind decrement double-subtracts on a merge already accomplished by another neighbour: when a new cell touches two cells of the same island, only the first union is a real merge, and subtracting for both reports one island fewer than exist — the second union returns false precisely because those neighbours were already connected, and that boolean is the whole reason you must not decrement there.',
    followUps:
      [
        'Track the largest island after each add. Which extra array does the disjoint set already give you at the roots, and where do you refresh the maximum?',
        'Placements can also remove land. Why does deletion break the union-find approach and what structure would you reach for?',
        'Connectivity now includes diagonal neighbours. Which single change to the neighbour loop captures that, and what happens to island counts on a checkerboard?',
        'Do you need the final grid or only the counts? What can you refuse to materialise?',
      ],
    solution:
      unionFind + '\n' +
      '\n' +
      'function numIslandsAfterAdds(rows, cols, positions) {\n' +
      '  const uf = new UnionFind(rows * cols);\n' +
      '  const land = [];\n' +
      '  for (let i = 0; i < rows * cols; i += 1) land.push(false);\n' +
      '  const moves = [[-1, 0], [0, 1], [1, 0], [0, -1]];\n' +
      '  let count = 0;\n' +
      '  const result = [];\n' +
      '  for (const pos of positions) {\n' +
      '    const r = pos[0], c = pos[1];\n' +
      '    const id = r * cols + c;\n' +
      '    if (!land[id]) {\n' +
      '      land[id] = true;\n' +
      '      count += 1;\n' +
      '      for (const move of moves) {\n' +
      '        const nr = r + move[0], nc = c + move[1];\n' +
      '        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {\n' +
      '          const nid = nr * cols + nc;\n' +
      '          if (land[nid] && uf.union(id, nid)) count -= 1;\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '    result.push(count);\n' +
      '  }\n' +
      '  return result;\n' +
      '}',
    modify:
      'Instead of counts, return the size of the largest island after each placement. Which root does the new cell end up under, and what single accumulator do you update?',
  },
  {
    step: 15,
    name: 'Making a Large Island',
    difficulty: 'Hard',
    topicSlug: 'graph-traversal',
    stem: "Flip a single water cell to land and report the largest island that results, with that flip applied to the grid.",
    brief:
      "Input: an n by n grid of 0 water and 1 land. Output: the size of the biggest island achievable by turning exactly one 0 into a 1, together with a grid showing the chosen flip. The constraint is that regions should be pre-collapsed so a candidate flip is evaluated from component sizes, not by a fresh flood fill.",
    concepts: [
      'dsa-g15c-component-size-merge',
      'dsa-g15c-dsu-compression-by-size',
      'dsa-g15c-online-union-islands',
      'dsa-coordinate-loops',
    ],
    shortAnswer:
      'Union all orthogonally connected land cells so each region becomes one root carrying its size, take the largest existing region, then for every water cell sum the distinct neighbour region sizes plus one and keep the best; that best is the answer.',
    idealAnswer:
      "The problem asks for the maximum island after a single flip, and the naive answer — flip every zero and flood-fill from scratch — is O(n^4). The trick is that a region only ever participates as a whole. First pass collapses each connected land component with a disjoint set over the flattened grid, and the size stored at each root is the region population, so the largest untouched island is available in O(n^2 * alpha). Second pass scores each water cell as a candidate flip: its value is one (the cell itself) plus the sizes of the distinct land components around it, and deduplicating by root is essential because two neighbours of the flipped cell often belong to the same region and must be counted once. The maximum of the untouched best and all candidate scores is the answer; recording the winning flip lets you also return the transformed grid. Traps the contract sets: if the grid has no zero, the answer is simply the whole grid and no flip is applied; if it is all zero, flipping one cell gives a single island of size one, which is why the initial maximum must start at zero (no land regions) and the candidate pass still contributes the lone +1. The initial-region maximum must be read at roots, not per-cell sizes, since only roots hold the true count.",
    walkthrough:
      'Grid 0 1 / 1 0. Land cells (0,1) and (1,0) are separate regions of size one each, so the untouched maximum is one. Score the zeros: at (0,0) the neighbours are (0,1) and (1,0), two distinct roots, merged = 1 + 1 + 1 = 3; at (1,1) likewise 3. Row-major order takes the first, (0,0), as the winning flip, giving a new grid 1 1 / 1 0 and size three. A 2 by 2 that is three ones and a single zero, 1 1 / 1 0: the three ones form one region of size three, so the untouched max is three; the lone zero (1,1) touches two neighbours both in that one region — deduplicated to a single root — giving merged = 1 + 3 = 4, and flipping it makes the whole grid one island of four. An already-full grid 1 1 / 1 1 has no water to score, so the untouched max of four stands and no cell flips. The all-water single cell 0 has no land region, so the initial max is zero and the candidate flip of that one cell scores one.',
    commonMistake:
      'Counting the same neighbouring region once per adjacent cell, or starting the maximum at one so an all-water grid never reports that flipping yields exactly one.',
    whyWrong:
      "Double-counting neighbours is the classic bug: in grid 1 1 / 1 0 the zero at (1,1) touches two cells of a single three-cell region, and summing per neighbour yields 1 + 3 + 3 = 7, an island bigger than the grid — deduplicating by disjoint-set root is the only thing that fixes it, which is why the reference collects roots into a set. Seeding the maximum at one instead of zero makes the all-water case silently wrong: there are no islands to begin with, so the correct answer is that flipping one cell creates a one-cell island, and a base of one hides the fact that the candidate pass is what produces that value; conversely a base of one also pollutes the untouched maximum on grids that do have land.",
    followUps:
      [
        'You must flip up to two cells instead of one. Why does evaluating independent single-cell scores stop being enough?',
        'Return the coordinates of every flip that achieves the maximum, not just the first. Which accumulator becomes a list?',
        'Prove the deduplicated-root sum equals the merged island size. What breaks if two regions actually touch at a corner?',
        'The grid is huge and mostly water. Where does a sparse representation of land regions pay for itself?',
      ],
    solution:
      unionFind + '\n' +
      '\n' +
      copyGrid + '\n' +
      '\n' +
      showGrid + '\n' +
      '\n' +
      'function largestIsland(grid) {\n' +
      '  const n = grid.length;\n' +
      '  const uf = new UnionFind(n * n);\n' +
      '  const moves = [[-1, 0], [0, 1], [1, 0], [0, -1]];\n' +
      '  for (let r = 0; r < n; r += 1) {\n' +
      '    for (let c = 0; c < n; c += 1) {\n' +
      '      if (!grid[r][c]) continue;\n' +
      '      const id = r * n + c;\n' +
      '      for (const move of moves) {\n' +
      '        const nr = r + move[0], nc = c + move[1];\n' +
      '        if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc]) uf.union(id, nr * n + nc);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  let best = 0;\n' +
      '  for (let r = 0; r < n; r += 1) {\n' +
      '    for (let c = 0; c < n; c += 1) {\n' +
      '      if (!grid[r][c]) continue;\n' +
      '      const root = uf.find(r * n + c);\n' +
      '      if (uf.size[root] > best) best = uf.size[root];\n' +
      '    }\n' +
      '  }\n' +
      '  const out = copyGrid(grid);\n' +
      '  let bestAfter = best;\n' +
      '  for (let r = 0; r < n; r += 1) {\n' +
      '    for (let c = 0; c < n; c += 1) {\n' +
      '      if (grid[r][c]) continue;\n' +
      '      const roots = new Set();\n' +
      '      for (const move of moves) {\n' +
      '        const nr = r + move[0], nc = c + move[1];\n' +
      '        if (nr >= 0 && nr < n && nc >= 0 && nc < n && grid[nr][nc]) roots.add(uf.find(nr * n + nc));\n' +
      '      }\n' +
      '      let merged = 1;\n' +
      '      for (const root of roots) merged += uf.size[root];\n' +
      '      if (merged > bestAfter) {\n' +
      '        bestAfter = merged;\n' +
      '        out[r][c] = 1;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return { size: bestAfter, grid: out };\n' +
      '}',
    modify:
      'Report the best size when you may flip up to k water cells, treating k as small. Which pass becomes a search over combinations of zeros, and what does the disjoint set still give you for free?',
  },
  {
    step: 15,
    name: 'Swim in Rising Water',
    difficulty: 'Hard',
    topicSlug: 'graph-traversal',
    stem: 'Cross a grid of rising-water timestamps so that the highest cell you ever step on is as low as possible.',
    brief:
      "Input: an n by n grid of distinct elevation times where a cell is passable once the water level reaches its value. Output: the earliest time at which a path exists from the top-left to the bottom-right, and optionally the reachable cells at that time. The constraint is that you minimise the maximum cell value on a path, not the sum, which is a bottleneck objective.",
    concepts: [
      'dsa-g15c-minimax-bottleneck-path',
      'dsa-heap-guarantees-only-the-root',
      'dsa-answer-range-search',
      'dsa-boundary-conditions',
    ],
    shortAnswer:
      'Run Dijkstra where reaching a neighbour costs the maximum of the current bottleneck and the neighbour elevation; the value that pops the destination is the answer. Equivalently binary-search the smallest water level for which a plain flood fill still connects the corners.',
    idealAnswer:
      "This is a shortest-path problem in disguise, but the edge weight lives on the vertices and the combine operator is a maximum, not a sum. The cost of a path is its worst cell; the claim Dijkstra generalises to it is that if you always expand the currently lowest-bottleneck frontier cell, the first time a cell leaves the heap its bottleneck is final, because any other route to it would have to pass through a cell whose bottleneck is at least as large. Swap `dist[u] + w` for `Math.max(dist[u], cell)` in the relaxation and the same priority-queue machinery proves correct: O(n^2 log n) on the n by n grid. The alternative that many candidates find first is to binary-search the answer: the predicate 'can I cross at water level t' is monotone — if a dry path exists at t it exists for every larger t — so binary-searching t over the value range and running an ordinary DFS/BFS feasibility check each step costs O(n^2 log n) as well and needs no heap. The two must agree, and the reference ships both to prove the invariant. The boundary traps: the start cell is submerged until its own time, so the bottleneck of the trivial path is grid[0][0] and a threshold below that is infeasible; and because cells are the times themselves, the answer is always some actual cell value, which is why the binary upper bound is the maximum cell, not n squared minus one on arbitrary data.",
    walkthrough:
      'Grid 0 1 / 2 3. The only routes from (0,0) to (1,1) are down-right (cells 0,2,3, worst 3) or right-down (0,1,3, worst 3), so the answer is 3. Dijkstra: start dist at 0, pop (0,0) with bottleneck 0; relax down to (1,0) at max(0,2)=2 and right to (0,1) at max(0,1)=1; pop (0,1) bottleneck 1, relax down to (1,1) at max(1,3)=3; pop (1,0) bottleneck 2, relax to (1,1) at max(2,3)=3 which does not improve the 3; pop (1,1) bottleneck 3 and it is the destination, answer 3. Binary search on grid 0 2 / 1 3: at level 2 the DFS from (0,0) can step on (0,1)=2 and (1,0)=1 but the target (1,1)=3 is above the level, infeasible; at level 3 it is feasible, so the smallest feasible level is 3, matching. On the grid 0 2 / 3 1 the two routes are 0,2,1 (worst 2) and 0,3,1 (worst 3), so the minimum is 2 and both methods return 2. At the computed threshold 3 on the first grid every cell value is at most 3, so the reachable sub-grid is all ones.',
    commonMistake:
      "Adding cell values like ordinary edge costs and running a sum-based Dijkstra, or binary-searching the answer range up to n squared when the cell values themselves can exceed that.",
    whyWrong:
      'Summing is the wrong objective: it minimises the total elevation crossed, not the peak cell, and on 0 2 / 3 1 the sum path 0,2,1 costs 3 while 0,3,1 costs 4, yet the correct bottleneck answer (2) is not even what a sum minimiser reports — the peak matters, so the relaxation must use max. The binary upper bound bug bites whenever elevations are not a permutation of 0..n^2-1: the answer is a specific cell value, so if a cell holds 44 on a 5 by 5 grid the search window must reach 44, and capping it at 24 makes the predicate never feasible at the true answer and the search returns the wrong high end.',
    followUps:
      [
        'Why is the feasibility predicate monotone in the water level, and how does that justify binary search instead of a shortest-path run?',
        'Prove the max-relaxation Dijkstra settles a cell bottleneck on first pop. Which standard exchange argument changes and which does not?',
        'You also want the path, not just its peak. What extra back-pointer do you push on relaxation, and when is it safe to overwrite?',
        'Cells have equal elevations, breaking the permutation assumption. Does either method still hold, and which one is more robust?',
      ],
    solution:
      minHeap + '\n' +
      '\n' +
      dirs4 + '\n' +
      '\n' +
      copyGrid + '\n' +
      '\n' +
      showGrid + '\n' +
      '\n' +
      'function swimDijkstra(grid) {\n' +
      '  const n = grid.length;\n' +
      '  const dist = [];\n' +
      '  for (let i = 0; i < n * n; i += 1) dist.push(Infinity);\n' +
      '  dist[0] = grid[0][0];\n' +
      '  const heap = new MinHeap();\n' +
      '  heap.push([grid[0][0], 0]);\n' +
      '  while (heap.size() > 0) {\n' +
      '    const top = heap.pop();\n' +
      '    const d = top[0], id = top[1];\n' +
      '    if (d > dist[id]) continue;\n' +
      '    const r = Math.floor(id / n), c = id % n;\n' +
      '    if (id === n * n - 1) return d;\n' +
      '    for (const move of DIRS4) {\n' +
      '      const nr = r + move[0], nc = c + move[1];\n' +
      '      if (!inGrid(grid, nr, nc)) continue;\n' +
      '      const nid = nr * n + nc;\n' +
      '      const nd = Math.max(d, grid[nr][nc]);\n' +
      '      if (nd < dist[nid]) {\n' +
      '        dist[nid] = nd;\n' +
      '        heap.push([nd, nid]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return dist[n * n - 1];\n' +
      '}\n' +
      '\n' +
      'function swimCanReach(grid, t) {\n' +
      '  const n = grid.length;\n' +
      '  if (grid[0][0] > t) return false;\n' +
      '  const seen = [];\n' +
      '  for (let i = 0; i < n * n; i += 1) seen.push(false);\n' +
      '  const stack = [0];\n' +
      '  seen[0] = true;\n' +
      '  while (stack.length > 0) {\n' +
      '    const id = stack.pop();\n' +
      '    if (id === n * n - 1) return true;\n' +
      '    const r = Math.floor(id / n), c = id % n;\n' +
      '    for (const move of DIRS4) {\n' +
      '      const nr = r + move[0], nc = c + move[1];\n' +
      '      if (!inGrid(grid, nr, nc)) continue;\n' +
      '      const nid = nr * n + nc;\n' +
      '      if (seen[nid] || grid[nr][nc] > t) continue;\n' +
      '      seen[nid] = true;\n' +
      '      stack.push(nid);\n' +
      '    }\n' +
      '  }\n' +
      '  return false;\n' +
      '}\n' +
      '\n' +
      'function swimBinarySearch(grid) {\n' +
      '  const n = grid.length;\n' +
      '  let high = 0;\n' +
      '  for (const row of grid) for (const val of row) if (val > high) high = val;\n' +
      '  let low = 0;\n' +
      '  let answer = high;\n' +
      '  while (low <= high) {\n' +
      '    const mid = (low + high) >> 1;\n' +
      '    if (swimCanReach(grid, mid)) {\n' +
      '      answer = mid;\n' +
      '      high = mid - 1;\n' +
      '    } else low = mid + 1;\n' +
      '  }\n' +
      '  return answer;\n' +
      '}\n' +
      '\n' +
      'function swimPathGrid(grid) {\n' +
      '  const n = grid.length;\n' +
      '  const t = swimDijkstra(grid);\n' +
      '  const out = [];\n' +
      '  for (let r = 0; r < n; r += 1) {\n' +
      '    const row = [];\n' +
      '    for (let c = 0; c < n; c += 1) row.push(grid[r][c] <= t ? 1 : 0);\n' +
      '    out.push(row);\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify:
      'Report the actual crossing sequence, each step moving to an unvisited neighbour. Which of the two methods lets you reconstruct the path directly, and what must the DFS version store to do the same?',
  },
  {
    step: 15,
    name: "Bridges in Graph - Tarjan's Algorithm",
    difficulty: 'Hard',
    topicSlug: 'graph-traversal',
    stem: 'Find every bridge of an undirected graph in one DFS by tracking, at each node, how far back its subtree can climb.',
    brief:
      "Input: an undirected graph given as a plain edge list where parallel edges are possible. Output: the list of bridges (edges whose removal raises the component count), plus the per-node discovery time and low value. The constraint that decides it is that a bridge is a tree edge no back edge crosses, so you must record reachability upward through tin and low.",
    concepts: [
      'dsa-g15c-tin-low-bridge-test',
      'dsa-g15c-adjacency-edge-id',
      'dsa-g15c-articulation-nonstrict-test',
      'dsa-recursive-decomposition',
    ],
    shortAnswer:
      'Depth-first the graph stamping tin (discovery time) and low (lowest tin reachable from the subtree via one back edge). A tree edge from u to child v is a bridge exactly when low[v] is strictly greater than tin[u], and you must skip the parent edge by its id.',
    idealAnswer:
      'One DFS computes two numbers per node: tin is the increasing time it was first seen, and low is the smallest tin its whole subtree can reach using at most one back edge into an ancestor. Any edge not in the DFS tree (a back edge to an already-active or finished ancestor) hands its endpoint tin to low, so a subtree low value tells you how high the subtree can climb. The bridge test is then immediate: the tree edge u to v is a bridge if and only if v and everything under v cannot reach above u, which is low[v] > tin[u] — strictly greater, because if the subtree can reach u itself (low[v] == tin[u]) then a cycle through u protects that edge, and if it climbs above u the edge is clearly inside a cycle. The multigraph trap is the reason the parent edge is skipped by identity, not by node: when two vertices share several edges, only the exact edge you arrived on should be ignored, and skipping every edge to the parent discards the true back edge that makes the pair cycle-protected, inventing a false bridge. Cost is O(V + E) time and O(V) stack plus arrays, one pass over the whole graph including each component root.',
    walkthrough:
      'Square with a tail: edges 0-1, 1-2, 2-3, 3-0 form the cycle and 3-4 is the tail. DFS from 0 gives tin 0=0, 1=1, 2=2, 3=3, 4=4 in a single descent 0-1-2-3-4. On the way up, node 3 sees 0 through the closing edge 3-0, a back edge, so low[3] = min(3, tin[0]) = 0, and node 4, a leaf with no back edge, keeps low[4] = 4, so 3-4 passes the test low[4] (4) > tin[3] (3) and is a bridge. Edges 2-3, 1-2, 0-1 all sit on the cycle: their child low values inherit 0 from the wrap-around, so low[child] > tin[parent] fails everywhere and none of them is a bridge — removing any one still leaves the rest of the square plus 0 reachable, only node 4 detaches. A star 0 with leaves 1, 2, 3 has no back edge at all: every leaf keeps low = tin, each leaf edge passes the strict test, giving all three edges as bridges, and the low values equal their discovery times, stats reading 1:1/1, 2:2/2, 3:3/3, 0:0/0. A pure cycle graph 0-1-2-3-0 yields the low table 3:3/0, 2:2/0, 1:1/0, 0:0/0 and zero bridges. Two vertices joined by parallel edges give zero bridges only because the skip is by edge id, letting the unused parallel edge act as the back edge.',
    commonMistake:
      'Using low[v] >= tin[u] for the bridge test, or skipping every edge that touches the parent vertex instead of just the incoming edge.',
    whyWrong:
      'The non-strict form is the articulation test, not the bridge test, and it over-reports bridges: for edge u-v, low[v] == tin[u] means the subtree can reach u itself via a back edge, so there is a cycle u-...-v-u containing edge u-v and removing it does not disconnect anything — yet `>=` flags it as a bridge. The parent-skip-by-node bug bites on parallel edges: two nodes joined by two edges are one cycle, so neither is a bridge, but if at the child you skip every edge back to the parent you also throw away the genuine second (back) edge, low never drops to tin[parent], and the algorithm reports a bridge that is not one. Skipping by edge id is what distinguishes the tree edge from its parallel twin.',
    followUps:
      [
        'Show exactly which single comparison flips the bridge code into the articulation-point code and why the root needs a separate rule there but not here.',
        'Do the parent skip by vertex and hand back a two-node graph with parallel edges. What false bridge does it produce and why?',
        'Count 2-edge-connected components instead of bridges. How does the bridge set give you them for free?',
        'Recursion depth can blow up on a long chain. Rewrite the DFS iteratively and say what your own stack must store.',
      ],
    solution:
      EDGE_ADJ + '\n' +
      '\n' +
      'function findBridges(adj) {\n' +
      '  const n = adj.length;\n' +
      '  const tin = new Array(n).fill(-1);\n' +
      '  const low = new Array(n).fill(-1);\n' +
      '  const bridges = [];\n' +
      '  const stats = [];\n' +
      '  let timer = 0;\n' +
      '  const dfs = (u, parentEdgeId) => {\n' +
      '    tin[u] = low[u] = timer;\n' +
      '    timer += 1;\n' +
      '    for (const entry of adj[u]) {\n' +
      '      const v = entry[0], id = entry[1];\n' +
      '      if (id === parentEdgeId) continue;\n' +
      '      if (tin[v] !== -1) {\n' +
      '        low[u] = Math.min(low[u], tin[v]);\n' +
      '      } else {\n' +
      '        dfs(v, id);\n' +
      '        low[u] = Math.min(low[u], low[v]);\n' +
      '        if (low[v] > tin[u]) bridges.push([Math.min(u, v), Math.max(u, v)]);\n' +
      '      }\n' +
      '    }\n' +
      '    stats.push(u + ":" + tin[u] + "/" + low[u]);\n' +
      '  };\n' +
      '  for (let start = 0; start < n; start += 1) if (tin[start] === -1) dfs(start, -1);\n' +
      '  bridges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);\n' +
      '  return { bridges: bridges, tin: tin, low: low, stats: stats };\n' +
      '}',
    modify:
      'Report the number of connected components after removing all bridges (the 2-edge-connected components). Where does the bridge set hand you that count without a second DFS?',
  },
  {
    step: 15,
    name: 'Articulation Point in Graph',
    difficulty: 'Hard',
    topicSlug: 'graph-traversal',
    stem: 'Find every vertex whose removal splits the graph, using the same tin and low DFS that finds bridges.',
    brief:
      "Input: an undirected graph as a plain edge list. Output: the sorted list of articulation points, plus the same discovery and low table a bridge run builds. The constraint is that a vertex is critical when some child subtree cannot reach strictly above it, which is the bridge DFS with a different test.",
    concepts: [
      'dsa-g15c-articulation-nonstrict-test',
      'dsa-g15c-tin-low-bridge-test',
      'dsa-g15c-adjacency-edge-id',
      'dsa-recursive-decomposition',
    ],
    shortAnswer:
      'Run the identical tin/low DFS but keep the equals: a non-root u is an articulation point when some child v has low[v] at or above tin[u], and a root is one only when it has two or more DFS tree children.',
    idealAnswer:
      "Articulation points and bridges are read off the same traversal: both ask how high a subtree can climb, and only the comparison differs. For an edge u-v the strict low[v] > tin[u] says v cannot even reach u, so the edge is load-bearing. For the vertex u you are testing removal, the condition relaxes to low[v] >= tin[u]: v cannot climb strictly above u. The equals case is the whole reason the tests diverge — low[v] == tin[u] means v reaches u through a back edge, which protects the edge u-v from being a bridge, but does not protect anything once u itself is deleted, because that back edge lands on u and u is gone. So the very same low value that saves a bridge condemns the vertex. The root is a special case no comparison captures: it has no parent, so low cannot be compared against its tin usefully, and it is an articulation point exactly when it has two or more children in the DFS tree — two children means removing it severs those subtrees from each other, one child means the rest of the graph stays whole. Cost is O(V + E) time, one DFS, and the answer is just the set of vertices ever flagged.",
    walkthrough:
      'Use the star: center 0 with leaves 1, 2, 3, the same graph that gave three bridges. DFS from 0, each leaf a direct child with low equal to its own tin (no back edges): 1:1/1, 2:2/2, 3:3/3, and the root 0:0/0. Every leaf v has low[v] >= tin[0], so the low test would flag 0, and indeed the root rule confirms it — 0 has three DFS children, more than one, so 0 is the sole articulation point, and the answer is [0]. This is exactly the graph where the bridge test fired on all three edges but the vertex test fires once: removing one edge split the star, but removing a leaf still leaves the other leaves connected through 0. Now a path 0-1-2: DFS 0:0/0, 1:1/1, 2:2/2. At node 1 (a non-root) its child 2 has low[2] = 2 >= tin[1] = 1, so 1 is flagged; the root 0 has exactly one DFS child, so it is not an articulation point. Answer [1]. A pure cycle 0-1-2-3-0 wraps low values down to 0 everywhere, so no non-root passes low[v] >= tin[u] and the root has one child, giving zero articulation points — you can delete any single node and the remaining chain is still connected.',
    commonMistake:
      "Applying the strict bridge comparison low[v] > tin[u] to the vertex test, or deciding the root with the same comparison instead of counting its DFS children.",
    whyWrong:
      'Using `>` on the vertex test misses the case low[v] == tin[u]: the back edge from v reaching exactly u is destroyed when u is removed, so u really is critical, yet the strict test calls it safe — on a graph like 0-1-2 with an extra edge 1-0 the equals case appears constantly and the strict test under-reports articulation points. The root misfires the other way: it has no parent tin to compare against, and low[v] >= tin[root] is trivially true for every child (tin[root] is the smallest), so the comparison alone flags every root; the correct rule is purely structural — a root is an articulation point exactly when it spawns two or more DFS children, which is why the reference handles root and non-root through different tests.',
    followUps:
      [
        'On the identical graph, list the articulation points and the bridges side by side and explain each place the two disagree.',
        'A graph has no bridges but does have articulation points. Construct one and say what the low table looks like at the cut vertex.',
        'Biconnected components partition the edges, not the vertices. Which stack over the DFS edges builds them, and how is the articulation test reused?',
        'Iterative versus recursive: on a 100000-vertex path which blows the stack first, bridges or articulation, and does the answer change?',
      ],
    solution:
      EDGE_ADJ + '\n' +
      '\n' +
      'function articulationPoints(adj) {\n' +
      '  const n = adj.length;\n' +
      '  const tin = new Array(n).fill(-1);\n' +
      '  const low = new Array(n).fill(-1);\n' +
      '  const isArt = new Array(n).fill(false);\n' +
      '  const stats = [];\n' +
      '  let timer = 0;\n' +
      '  const dfs = (u, parentEdgeId) => {\n' +
      '    tin[u] = low[u] = timer;\n' +
      '    timer += 1;\n' +
      '    let children = 0;\n' +
      '    for (const entry of adj[u]) {\n' +
      '      const v = entry[0], id = entry[1];\n' +
      '      if (id === parentEdgeId) continue;\n' +
      '      if (tin[v] !== -1) {\n' +
      '        low[u] = Math.min(low[u], tin[v]);\n' +
      '      } else {\n' +
      '        dfs(v, id);\n' +
      '        low[u] = Math.min(low[u], low[v]);\n' +
      '        children += 1;\n' +
      '        if (parentEdgeId !== -1 && low[v] >= tin[u]) isArt[u] = true;\n' +
      '      }\n' +
      '    }\n' +
      '    if (parentEdgeId === -1 && children > 1) isArt[u] = true;\n' +
      '    stats.push(u + ":" + tin[u] + "/" + low[u]);\n' +
      '  };\n' +
      '  for (let start = 0; start < n; start += 1) if (tin[start] === -1) dfs(start, -1);\n' +
      '  const points = [];\n' +
      '  for (let i = 0; i < n; i += 1) if (isArt[i]) points.push(i);\n' +
      '  return { points: points, tin: tin, low: low, stats: stats };\n' +
      '}',
    modify:
      'Also report, for each articulation point, how many components the graph breaks into if it is removed. Which per-node tally of qualifying children gives that count?',
  },
  {
    step: 15,
    name: "Strongly Connected Components - Kosaraju's Algorithm",
    difficulty: 'Hard',
    topicSlug: 'graph-traversal',
    stem: 'Split a directed graph into its strongly connected components with a finish-order pass and a DFS on the transpose.',
    brief:
      "Input: a directed graph as an edge list. Output: the strongly connected components, each a maximal set of mutually reachable vertices, in a deterministic order, plus the finish order that drove them. The constraint is mutual reachability, which a single undirected traversal cannot see, so two passes are needed.",
    concepts: [
      'dsa-g15c-kosaraju-two-pass-reversal',
      'dsa-g15c-tin-low-bridge-test',
      'dsa-g15c-adjacency-edge-id',
      'dsa-visited-set-distance',
    ],
    shortAnswer:
      "First DFS over the graph recording vertices by finish time; then DFS over the reversed edges starting from the last-finished vertex and each run is exactly one strongly connected component. The order and the transpose together trap a component and stop it leaking.",
    idealAnswer:
      'Two facts make Kosaraju work. First, condensing every strongly connected component to a node gives a DAG, and a component with no outgoing edge to another component — a sink of the DAG — is finished last in some DFS ordering; running DFS on the original graph and recording exit order therefore puts a sink component at the tail of the list. Second, reversing all edges swaps sinks and sources, so starting a fresh DFS from the latest-finished vertex in the transposed graph reaches exactly that component and no other, because in the transpose the old sink is a source and cannot leak into anything downstream. Iterating the second pass in decreasing finish order therefore peels off components one at a time. Cost is O(V + E) time and O(V + E) space for the transpose, two linear DFS passes. The contrast with Tarjan, which finds components in a single pass using low values, is the trade Kosaraju accepts: it is easier to prove and code, but it pays for building and traversing the reversed graph. The traps are finishing order direction (must iterate the last-finished first) and the exit-time recording — a vertex is pushed to the order when its subtree is fully done, not when first discovered, which is why the reference does an explicit post-order rather than a pre-order push.',
    walkthrough:
      'A directed path 0->1->2->3: every vertex reaches only those ahead of it, so each is its own component, four in total. The first DFS from 0 walks 0,1,2,3 and, since DFS finishes a node after its descendants, records finish order 3,2,1,0. The transpose reverses to 1->0, 2->1, 3->2; starting from the last-finished vertex 0 and exploring the transpose reaches nothing (0 has no outgoing reversed edge), giving component {0}, then 1, then 2, then 3 — four singleton components, matching a graph with no cycles. Now the cycle 0->1->2->3->0: finish order is still 3,2,1,0, but in the transpose starting from 0 you walk 0->3->2->1->0 and sweep up the entire ring in one run, so it is a single component {0,1,2,3}. A graph with a triangle 0->1->2->0 plus an edge 2->3 that leads nowhere: the first DFS finishes 3 before the triangle, and the reverse pass starts at 0, collects the triangle via the reversed cycle, cannot reach 3 (the original 2->3 becomes 3->2 in the transpose, and 3 is only entered from 2 which is already assigned), so it yields components {0,1,2} and {3} — two components, where 3, though reachable from the triangle, is not mutually reachable with it. Contrast with row 13: on these same digraphs a bridge/low analysis is about undirected edges, whereas here direction decides that 0,1,2 are one component and 3 is alone.',
    commonMistake:
      "Iterating the second pass in increasing instead of decreasing finish order, or pushing vertices to the order when first discovered rather than when the DFS exits them.",
    whyWrong:
      'Both invert the one property that isolates a component. If you process the second pass from the earliest-finished vertex, you start in a DAG source of the transpose and its DFS floods across into several original components at once, merging things that are not mutually reachable and under-counting components. Recording discovery order instead of exit order changes the guarantee entirely: the sink-component-last result relies on a vertex finishing after everything it can reach, so the exit (post-order) push is what places a sink at the tail; a pre-order push can put a vertex that reaches the sink ahead of the sink itself, and the reverse pass then leaks exactly as the wrong iteration direction does.',
    followUps:
      [
        'Compare with Tarjan single-pass SCC. What does Kosaraju do twice that Tarjan collapses, and what does it not need to store?',
        'The condensation DAG of the components is itself useful. Which pass gives you its topological order for free?',
        'Why does starting the reverse DFS at a sink of the original graph, not a source, keep the search contained? Argue from the transpose.',
        'Add a self-loop 0->0 and a duplicate edge. Does either pass change the component set, and where is it harmless?',
      ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function transposeAdj(adj) {\n' +
      '  const n = adj.length;\n' +
      '  const rev = [];\n' +
      '  for (let i = 0; i < n; i += 1) rev.push([]);\n' +
      '  for (let u = 0; u < n; u += 1) {\n' +
      '    for (const edge of adj[u]) rev[edge[1]].push([edge[1], edge[0], edge[2]]);\n' +
      '  }\n' +
      '  return rev;\n' +
      '}\n' +
      '\n' +
      'function kosarajuScc(adj) {\n' +
      '  const n = adj.length;\n' +
      '  const visited = new Array(n).fill(false);\n' +
      '  const order = [];\n' +
      '  const firstPass = (start) => {\n' +
      '    const stack = [[start, 0]];\n' +
      '    visited[start] = true;\n' +
      '    while (stack.length > 0) {\n' +
      '      const frame = stack[stack.length - 1];\n' +
      '      const u = frame[0];\n' +
      '      let advanced = false;\n' +
      '      while (frame[1] < adj[u].length) {\n' +
      '        const v = adj[u][frame[1]][1];\n' +
      '        frame[1] += 1;\n' +
      '        if (!visited[v]) {\n' +
      '          visited[v] = true;\n' +
      '          stack.push([v, 0]);\n' +
      '          advanced = true;\n' +
      '          break;\n' +
      '        }\n' +
      '      }\n' +
      '      if (!advanced) {\n' +
      '        stack.pop();\n' +
      '        order.push(u);\n' +
      '      }\n' +
      '    }\n' +
      '  };\n' +
      '  for (let i = 0; i < n; i += 1) if (!visited[i]) firstPass(i);\n' +
      '  const rev = transposeAdj(adj);\n' +
      '  const assigned = new Array(n).fill(false);\n' +
      '  const components = [];\n' +
      '  for (let idx = order.length - 1; idx >= 0; idx -= 1) {\n' +
      '    const start = order[idx];\n' +
      '    if (assigned[start]) continue;\n' +
      '    const comp = [];\n' +
      '    const stack = [start];\n' +
      '    assigned[start] = true;\n' +
      '    while (stack.length > 0) {\n' +
      '      const u = stack.pop();\n' +
      '      comp.push(u);\n' +
      '      for (const edge of rev[u]) {\n' +
      '        const v = edge[1];\n' +
      '        if (!assigned[v]) {\n' +
      '          assigned[v] = true;\n' +
      '          stack.push(v);\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '    comp.sort((a, b) => a - b);\n' +
      '    components.push(comp);\n' +
      '  }\n' +
      '  components.sort((a, b) => a[0] - b[0]);\n' +
      '  return { components: components, order: order };\n' +
      '}',
    modify:
      'Return the number of components plus the size of the largest one, and refuse to materialise the transpose. Which single-pass low-link algorithm would you swap in, and what data does it need that Kosaraju does not?',
  },
];

export const expects: Record<string, string> = {
  'Bellman Ford Algorithm':
    '(() => { const adj = buildAdj(4, [[0,1,1],[1,2,2],[2,3,1],[0,2,5]], true); const d = bellmanFord(adj, 0); const cyc = buildAdj(3, [[0,1,1],[1,2,1],[2,0,-3]], true); const neg = buildAdj(4, [[0,1,4],[0,2,5],[1,2,-3],[2,3,2]], true); const unreach = buildAdj(3, [[0,1,1]], true); return d[0] === 0 && d[1] === 1 && d[2] === 3 && d[3] === 4 && bellmanFord(adj, 2)[0] === Infinity && hasNegativeCycle(cyc) === true && hasNegativeCycle(neg) === false && bellmanFord(neg, 0)[2] === 1 && bellmanFord(neg, 0)[3] === 3 && bellmanFord(buildAdj(1, [], true), 0)[0] === 0 && bellmanFord(unreach, 0)[2] === Infinity; })()',
  'Floyd Warshall Algorithm':
    '(() => { const m = floydWarshall(3, [[0,1,3],[1,2,2],[0,2,10]]); return showGrid(m) === "0,3,5|Infinity,0,2|Infinity,Infinity,0" && floydWarshall(4, [[0,1,1],[1,2,1],[2,3,1],[0,3,5]])[0][3] === 3 && floydNegativeCycle(3, [[0,1,1],[1,2,-1],[0,2,3]]) === false && floydNegativeCycle(2, [[0,1,-1],[1,0,-1]]) === true && showGrid(floydWarshall(1, [])) === "0"; })()',
  'Find the City With the Smallest Number of Neighbors at a Threshold Distance':
    '(() => { return findTheCity(4, [[0,1,3],[1,2,1],[1,3,4],[2,3,1]], 4) === 3 && findTheCity(4, [[0,1,3],[1,2,1],[1,3,4],[2,3,1]], 2) === 0 && findTheCity(1, [], 0) === 0 && findTheCity(3, [[0,1,1]], 1) === 2 && findTheCity(3, [[0,1,5],[1,2,5],[0,2,5]], 1) === 2; })()',
  "Minimum Spanning Tree - Prim's Algorithm":
    '(() => { const m = primMst(4, [[0,1,2],[0,2,3],[1,2,1],[1,3,4],[2,3,5]]); return m.weight === 7 && m.connected === true && m.edgesTaken === 3 && primMst(1, []).weight === 0 && primMst(1, []).connected === true && primMst(2, [[0,1,5]]).weight === 5 && primMst(4, [[0,1,1],[2,3,1]]).connected === false && primMst(4, [[0,1,1],[2,3,1]]).edgesTaken === 1; })()',
  'Disjoint Set Union (Rank & Size)':
    '(() => { const uf = new UnionFind(5); uf.union(0,1); uf.union(2,3); uf.union(1,2); return uf.components === 2 && uf.connected(0,3) === true && uf.connected(0,4) === false && uf.size[uf.find(0)] === 4 && countComponents(6, [[0,1],[2,3],[4,5]]) === 3 && firstRedundantEdge([[1,2],[1,3],[2,3]]).join(",") === "2,3" && firstRedundantEdge([[0,1],[1,2]]) === null && uf.find(4) === 4; })()',
  "Kruskal's Algorithm":
    '(() => { const r = kruskalMst(4, [[0,1,2],[0,2,3],[1,2,1],[1,3,4],[2,3,5]]); return r.weight === 7 && r.mst.length === 3 && r.connected === true && r.mst[0].join(",") === "1,2,1" && kruskalMst(1, []).weight === 0 && kruskalMst(1, []).mst.length === 0 && kruskalMst(4, [[0,1,1],[2,3,1]]).connected === false && kruskalMst(3, [[0,1,1],[1,2,2],[0,2,10]]).weight === 3; })()',
  'Number of Operations to Make Network Connected':
    '(() => { return makeConnected(4, [[0,1],[0,2],[1,2]]) === 1 && makeConnected(5, [[0,1],[1,2],[3,4]]) === -1 && makeConnected(1, []) === 0 && makeConnected(6, [[0,1],[2,3],[4,5],[0,1],[2,3]]) === 2 && makeConnected(3, [[0,1]]) === -1 && makeConnected(6, [[0,1],[1,2],[2,3],[3,4],[4,5]]) === 0; })()',
  'Most Stones Removed with Same Row or Column':
    '(() => { const a = [[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]]; return mostStonesRemoved(a) === 5 && mostStonesRemoved([[5,5]]) === 0 && mostStonesRemoved([[0,0],[0,1]]) === 1 && mostStonesRemoved([[0,0],[1,1]]) === 0 && mostStonesRemoved([[0,0],[1,1],[2,2]]) === 0 && mostStonesRemoved([[0,0],[0,1],[2,2],[2,3]]) === 2; })()',
  'Accounts Merge':
    '(() => { const r = mergeAccounts([["A","a1"],["A","a1","a2"],["B","b1"]]); const flat = (x) => x.map((row) => row.join(",")).join("|"); return flat(r) === "A,a1,a2|B,b1" && mergeAccounts([["X","x"],["Y","y"]]).length === 2 && flat(mergeAccounts([["J","j1"],["J","j2"]])) === "J,j1|J,j2" && flat(mergeAccounts([["P","p1","p2"],["Q","p2","p3"]])) === "P,p1,p2,p3" && mergeAccounts([["S","s"]]).length === 1; })()',
  'Number of Island II':
    '(() => { const a = numIslandsAfterAdds(3, 3, [[0,0],[0,1],[1,2],[2,1]]); const b = numIslandsAfterAdds(2, 2, [[0,0],[0,1],[1,0],[1,1]]); const dup = numIslandsAfterAdds(2, 2, [[0,0],[0,0]]); return a.join(",") === "1,1,2,3" && b.join(",") === "1,1,1,1" && dup.join(",") === "1,1" && numIslandsAfterAdds(1, 1, [[0,0]]).join(",") === "1" && numIslandsAfterAdds(3, 3, []).length === 0; })()',
  'Making a Large Island':
    '(() => { const all = largestIsland([[1,1],[1,1]]); const one = largestIsland([[0]]); const mix = largestIsland([[1,0],[0,1]]); const big = largestIsland([[1,1],[1,0]]); const sample = largestIsland([[0,1],[1,0]]); return all.size === 4 && showGrid(all.grid) === "1,1|1,1" && one.size === 1 && showGrid(one.grid) === "1" && mix.size === 3 && big.size === 4 && showGrid(big.grid) === "1,1|1,1" && showGrid(sample.grid) === "1,1|1,0" && showGrid(mix.grid) === "1,1|0,1"; })()',
  'Swim in Rising Water':
    '(() => { const g1 = [[0,1],[2,3]]; const g2 = [[0,2],[1,3]]; const g3 = [[0,1,2,3,4],[10,11,12,13,14],[20,21,22,23,24],[30,31,32,33,34],[40,41,42,43,44]]; const g4 = [[0,2],[3,1]]; return swimDijkstra(g1) === 3 && swimBinarySearch(g1) === 3 && swimDijkstra(g2) === 3 && swimBinarySearch(g2) === 3 && swimDijkstra(g3) === 44 && swimBinarySearch(g3) === 44 && swimDijkstra(g4) === swimBinarySearch(g4) && showGrid(swimPathGrid(g1)) === "1,1|1,1" && swimCanReach(g1, 2) === false && swimCanReach(g1, 3) === true; })()',
  "Bridges in Graph - Tarjan's Algorithm":
    '(() => { const cycle = buildEdgeAdj(4, [[0,1],[1,2],[2,3],[3,0]]); const star = buildEdgeAdj(4, [[0,1],[0,2],[0,3]]); const path = buildEdgeAdj(5, [[0,1],[1,2],[2,3],[3,4]]); const parallel = buildEdgeAdj(2, [[0,1],[0,1]]); const single = buildEdgeAdj(1, []); const bridgeless = findBridges(cycle); const spoked = findBridges(star); return bridgeless.bridges.length === 0 && bridgeless.stats.join(" ") === "3:3/0 2:2/0 1:1/0 0:0/0" && spoked.bridges.length === 3 && spoked.stats.join(" ") === "1:1/1 2:2/2 3:3/3 0:0/0" && findBridges(path).bridges.length === 4 && findBridges(parallel).bridges.length === 0 && findBridges(single).bridges.length === 0 && findBridges(single).stats.join(" ") === "0:0/0"; })()',
  'Articulation Point in Graph':
    '(() => { const cycle = buildEdgeAdj(4, [[0,1],[1,2],[2,3],[3,0]]); const star = buildEdgeAdj(4, [[0,1],[0,2],[0,3]]); const path = buildEdgeAdj(3, [[0,1],[1,2]]); const single = buildEdgeAdj(1, []); const bridgeless = articulationPoints(cycle); const spoked = articulationPoints(star); return bridgeless.points.length === 0 && bridgeless.stats.join(" ") === "3:3/0 2:2/0 1:1/0 0:0/0" && spoked.points.join(",") === "0" && spoked.stats.join(" ") === "1:1/1 2:2/2 3:3/3 0:0/0" && articulationPoints(path).points.join(",") === "1" && articulationPoints(single).points.length === 0; })()',
  "Strongly Connected Components - Kosaraju's Algorithm":
    '(() => { const dag = kosarajuScc(buildAdj(4, [[0,1],[1,2],[2,3]], true)); const cycle = kosarajuScc(buildAdj(4, [[0,1],[1,2],[2,3],[3,0]], true)); const two = kosarajuScc(buildAdj(4, [[0,1],[1,2],[2,0],[2,3]], true)); const single = kosarajuScc(buildAdj(1, [], true)); return dag.components.length === 4 && dag.order.join(",") === "3,2,1,0" && cycle.components.length === 1 && cycle.components[0].join(",") === "0,1,2,3" && two.components.length === 2 && two.components[0].join(",") === "0,1,2" && two.components[1].join(",") === "3" && single.components.length === 1 && single.components[0].join(",") === "0"; })()',
};
