import type { ConceptSpec } from '../types';
import type { DsaProblem } from '../dsa-problems';
import { buildAdj, copyGrid, dirs4, showAdj, showGrid, unionFind } from './graph-helpers';

/**
 * Step 15a — the first half of the graph step: the eight rows that learn what a graph is and the
 * ten that learn how a walk over it answers something. Everything here is one of two moves — a
 * queue that expands a frontier, or a stack that commits to a path — plus the bookkeeping that
 * turns the walk into an answer: components, parents, colours, distances, shapes.
 */

export const concepts: Record<string, ConceptSpec> = {
  "dsa-g15a-adjacency-list-versus-matrix": {
    slug: "dsa-g15a-adjacency-list-versus-matrix",
    name: "A graph is a set of edges, and the representation decides what is cheap to ask",
    detail:
      "An adjacency list stores each edge twice in an undirected graph and answers who-neighbours-whom in O(degree); an adjacency matrix stores V squared cells and answers is-there-an-edge in O(1) while making every neighbour scan cost O(V).",
    terms: ["adjacency list", "adjacency matrix", "degree", "edge list", "sparse versus dense"],
    weight: 4,
  },
  "dsa-g15a-component-loop": {
    slug: "dsa-g15a-component-loop",
    name: "A whole-graph answer needs a loop over every unvisited start",
    detail:
      "One traversal from one node only ever sees one component, so counting components, provinces, cycles or colourings means restarting the walk at each node still marked unvisited.",
    terms: ["disconnected graph", "component loop", "restart the walk", "unvisited start", "forest"],
    weight: 5,
  },
  "dsa-g15a-mark-on-enqueue": {
    slug: "dsa-g15a-mark-on-enqueue",
    name: "Mark a node seen when it enters the frontier, not when it leaves",
    detail:
      "A node reached by two edges would otherwise be queued twice; marking on push or enqueue keeps the frontier at one copy per node, which is what bounds memory at O(V) and makes the recorded parent and depth the first ones seen.",
    terms: ["mark on push", "duplicate in queue", "visited at enqueue", "frontier size", "first touch"],
    weight: 5,
  },
  "dsa-g15a-bfs-first-touch-is-shortest": {
    slug: "dsa-g15a-bfs-first-touch-is-shortest",
    name: "The level a node is first touched at is its shortest edge distance",
    detail:
      "Breadth-first order releases the frontier one edge at a time, so no longer route can reach a node before the short one does; the distance is a property of the visit, not a number that gets refined later.",
    terms: ["shortest in edges", "level order", "unweighted", "first discovery", "frontier band"],
    weight: 5,
  },
  "dsa-g15a-multi-source-bfs": {
    slug: "dsa-g15a-multi-source-bfs",
    name: "Seeding the whole frontier at once turns nearest-one into one pass",
    detail:
      "Push every source cell at distance zero before popping anything, and the wavefront that follows measures each cell against its nearest source without running one search per cell.",
    terms: ["multi-source", "all seeds at once", "wavefront", "distance transform", "simultaneous BFS"],
    weight: 5,
  },
  "dsa-g15a-grid-cell-as-node": {
    slug: "dsa-g15a-grid-cell-as-node",
    name: "A grid is a graph whose nodes are cells and whose edges are the direction list",
    detail:
      "Swap the adjacency list for the four (or eight) offset vectors and every graph algorithm transfers verbatim, except that the walk can be as deep as there are cells, so recursion is the wrong tool.",
    terms: ["cell is a node", "direction vectors", "four neighbour", "boundary test", "iterative walk"],
    weight: 5,
  },
  "dsa-g15a-parent-edge-cycle-check": {
    slug: "dsa-g15a-parent-edge-cycle-check",
    name: "In an undirected graph an edge to visited ground is only a cycle if it is not the edge you arrived on",
    detail:
      "Every tree edge is seen twice, so the walk has to discount the way it came; the discount belongs to the entry being processed, and skipping the neighbour instead of the edge is what silently assumes the graph is simple.",
    terms: ["back edge", "parent edge", "visited neighbour", "multigraph", "tree edge"],
    weight: 5,
  },
  "dsa-g15a-colour-parity-bipartite": {
    slug: "dsa-g15a-colour-parity-bipartite",
    name: "Two colours along the walk are the same thing as no odd cycle",
    detail:
      "Writing depth modulo two onto each node gives a valid two-colouring exactly when no edge joins two nodes of the same colour; an odd cycle makes the two parities meet at one node and the check fails there.",
    terms: ["two colouring", "parity of depth", "odd cycle", "colour conflict", "bipartite"],
    weight: 5,
  },
  "dsa-g15a-border-seeded-reachability": {
    slug: "dsa-g15a-border-seeded-reachability",
    name: "Surrounded is decided from the boundary inward, never from the inside out",
    detail:
      "Everything a border-seeded walk can reach survives; whatever is left is by definition unreachable from outside, which is the whole answer and one pass instead of one test per cell.",
    terms: ["seed the border", "safe set", "complement", "escape to edge", "flood from outside"],
    weight: 4,
  },
  "dsa-g15a-relative-coordinate-canonical-shape": {
    slug: "dsa-g15a-relative-coordinate-canonical-shape",
    name: "A shape is its cells minus the minimum row and column",
    detail:
      "Subtracting the bounding-box origin from every cell of a component makes two translated copies produce the same key, so a Set of keys counts distinct shapes without comparing grids cell by cell.",
    terms: ["normalise offsets", "bounding-box origin", "shape signature", "translation invariant", "canonical key"],
    weight: 4,
  },
  "dsa-g15a-wildcard-bucket-neighbours": {
    slug: "dsa-g15a-wildcard-bucket-neighbours",
    name: "Mask one character at a time and the neighbours of a word fall out of a hash map",
    detail:
      "Two words are one edit apart exactly when they share a pattern with one position blanked, so bucketing the dictionary by its L patterns costs O(L) keys per word instead of the O(N squared L) of comparing every pair.",
    terms: ["masked pattern", "bucket by wildcard", "implicit graph", "one edit apart", "avoid pairwise edges"],
    weight: 4,
  },
  "dsa-g15a-level-graph-parent-set": {
    slug: "dsa-g15a-level-graph-parent-set",
    name: "Recording every parent at the next level gives all shortest paths for free",
    detail:
      "A normal BFS keeps one parent and answers a length; keeping all predecessors whose depth is exactly one less turns the same walk into a directed acyclic graph that back-tracking enumerates without ever testing a long route.",
    terms: ["parent set", "level graph", "all predecessors", "back-track the DAG", "shortest only"],
    weight: 4,
  },
  "dsa-g15a-dsu-component-count": {
    slug: "dsa-g15a-dsu-component-count",
    name: "A component count is just a number that only decrements on a merge that mattered",
    detail:
      "Start with one set per node, union each edge, and a union whose two ends were already connected changes nothing; the surviving counter is the answer without a single traversal.",
    terms: ["disjoint set", "union by size", "path compression", "components counter", "no traversal"],
    weight: 4,
  },
  "dsa-g15a-stack-entry-carries-state": {
    slug: "dsa-g15a-stack-entry-carries-state",
    name: "An explicit stack replaces the frame, so whatever the frame held has to travel with the entry",
    detail:
      "Recursion keeps a parent, a colour or a phase per call; a hand-built stack holds only what you push into it, so a shared variable standing in for a frame silently mixes states from different branches.",
    terms: ["pair on the stack", "no shared parent", "state per entry", "call frame replacement", "post-order marker"],
    weight: 5,
  },
};

export const problems: DsaProblem[] = [
  {
    step: 15,
    name: "Introduction to Graph, Graph Representation",
    difficulty: "Easy",
    topicSlug: "graph-traversal",
    stem: "Given a list of edges, build the graph in both standard representations and say what each one makes cheap and what each one makes expensive.",
    brief:
      "Input: a node count and a list of [from, to] pairs, optionally with a third weight entry, plus a flag for directed or undirected. Output: the adjacency list and the adjacency matrix, with the degree of any node and the edge count readable from them. State the trade the two representations make.",
    concepts: [
      "dsa-g15a-adjacency-list-versus-matrix",
      "dsa-g15a-dsu-component-count",
      "dsa-complexity-counting",
      "dsa-coordinate-loops",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "Store edges as a per-node list when the graph is sparse and you will be walking neighbours; store them as a V by V matrix when the question is does-this-edge-exist. Degree is a list length either way.",
    idealAnswer:
      "A graph is a set of edges over a set of nodes and nothing else, so a representation is only a question of which lookup you pay for. The adjacency list holds each undirected edge in both endpoint lists, which is why the degree of a node is one array length and why summing degrees gives twice the edge count; scanning the neighbours of a node costs its degree, and a whole traversal therefore costs O(V + E), which is the bound every later row in this step quotes. The adjacency matrix holds V squared cells and answers is-there-an-edge between two named nodes in one index, at the cost of scanning a whole row to discover the neighbours and of memory that does not shrink when the graph is sparse. The trap a strong candidate names rather than skips is the contract: an unweighted matrix writes 1 for an edge and 0 for none, so a real edge of weight 0 is unreadable and the representation is silently lossy, and a directed graph must not mirror its cells. Self-loops break the twice-counted-edge arithmetic, because a loop belongs to one list and not two.",
    walkthrough:
      "Take the four-node edge list 0-1, 1-2, 2-0, 2-3 read as undirected. The adjacency list lands as 0:1,2 then 1:0,2 then 2:0,1,3 then 3:2, because 2 appears in three lists-worth of edges and 3 in only one; degreeOf(2) is 3, degreeOf(3) is 1, and the degrees sum to 8 which is exactly twice the four edges, so countEdges divides by two and reports 4. The same list as a matrix reads 0,1,1,0 then 1,0,1,0 then 1,1,0,1 then 0,0,1,0, symmetric about the diagonal, and m[2][3] === 1 answers the edge question in one index. Now build 3 nodes with edges 0-1 and 1-2 marked directed: the list becomes 0:1 1:2 2: and the degree of node 2 is 0, because nothing points into it and the list stores only outgoing edges - the in-degree question needs a second structure or the matrix column. Feed the builder a weighted pair 0-1 with weight 4 and the list renders 0:1/4 1:0/4, while the matrix simply writes 4 in both cells. Finally add the self-loop 2-2 to the first graph: the sum of degrees becomes 7 for five edges, so the divide-by-two rule breaks on that single row.",
    commonMistake:
      "Defaulting to the adjacency matrix because it looks like the textbook, or calling the sum of list lengths the edge count.",
    whyWrong:
      "The matrix costs V squared memory and V time per neighbour scan, so a traversal of a million-node sparse graph walks a trillion cells that are all zero; the adjacency list makes the same walk cost V + E, and every later row here is stated in those terms. Calling the degree sum the edge count is the other half-point: on the four-node example above it reports 8 instead of 4 because each undirected edge sits in two lists, and on a graph holding the self-loop 2-2 the divide-by-two fix gives 3.5, which is the honest signal that a loop is counted once and the formula assumed otherwise.",
    followUps:
      [
        "Your list stores each undirected edge twice. What does that buy you at traversal time and what does it cost in memory on a graph of 10 million edges?",
        "Which representation answers does-edge-(u,v)-exist in constant time, and which answers what-touches-node-u in time proportional to the answer?",
        "The input is a star: one hub, a million leaves. Write the degree sequence and say which representation wastes the most on it.",
        "A self-loop and a parallel edge both break the sum-of-degrees-over-two rule. Show how each one breaks it and what bookkeeping fixes the count.",
      ],
    solution:
      buildAdj + '\n' +
      '\n' +
      showAdj + '\n' +
      '\n' +
      showGrid + '\n' +
      '\n' +
      'function toAdjacencyMatrix(n, edges, directed) {\n' +
      '  const matrix = [];\n' +
      '  for (let row = 0; row < n; row += 1) matrix.push(new Array(n).fill(0));\n' +
      '  for (const edge of edges) {\n' +
      '    const from = edge[0];\n' +
      '    const to = edge[1];\n' +
      '    const value = edge[2] === undefined ? 1 : edge[2];\n' +
      '    matrix[from][to] = value;\n' +
      '    if (!directed && from !== to) matrix[to][from] = value;\n' +
      '  }\n' +
      '  return matrix;\n' +
      '}\n' +
      '\n' +
      'function degreeOf(adj, node) {\n' +
      '  return adj[node].length;\n' +
      '}\n' +
      '\n' +
      'function sumDegrees(adj) {\n' +
      '  let total = 0;\n' +
      '  for (let node = 0; node < adj.length; node += 1) total += adj[node].length;\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function countEdges(adj) {\n' +
      '  return sumDegrees(adj) / 2;\n' +
      '}',
    modify:
      "The graph is given as an edge list of 1-indexed nodes with a weight that can legitimately be 0. What has to change in both representations before the edge count and the matrix are still readable?",
  },
  {
    step: 15,
    name: "Connected Components in Graph",
    difficulty: "Medium",
    topicSlug: "graph-traversal",
    stem: "Return the groups of nodes a graph splits into, and count them, on a graph you have not been told is connected.",
    brief:
      "Input: an adjacency list over nodes 0..n-1, with no promise that any node reaches any other. Output: the components as lists of their members plus the count and the largest size. Solve it by traversal and again by merging edges, and say which one answers online.",
    concepts: [
      "dsa-g15a-component-loop",
      "dsa-g15a-dsu-component-count",
      "dsa-g15a-mark-on-enqueue",
      "dsa-reachability-set",
      "dsa-complexity-counting",
    ],
    shortAnswer:
      "Loop over the nodes; every node still unvisited opens a new component, and the walk from it drains exactly that component. The count is how many times the outer loop restarted.",
    idealAnswer:
      "A component is an equivalence class under reachability, so the answer is not one traversal but the number of traversals the graph forces: start a walk, take everything it touches, then start again at the first node nobody claimed. That outer loop is the whole contract and skipping it silently answers a different question, because both BFS and DFS are single-origin algorithms that stop when their own frontier empties. Cost is O(V + E) time for the list form and O(V) for the seen array, with the queue never holding two copies of a node because a node is marked when it is enqueued. The second answer, a disjoint set built by unioning every edge, costs the same asymptotically but earns its keep in two situations the traversal cannot serve: the edges arrive over time and you are asked for the component count after each arrival, and the graph is given as a raw edge list where the adjacency structure would have to be paid for first. Both are worth writing once, because the traversal lists its members and the disjoint set only counts them.",
    walkthrough:
      "Six nodes with edges 0-1, 1-2, 3-4 and nothing touching 5. The outer loop opens at 0, the queue drains 0 then 1 then 2 and stops with 3 untouched, so the first component is 0,1,2; it restarts at 3, takes 4, and restarts again at 5, which joins nothing and returns as the component of one. The count is 3 and the largest is 3. Run the disjoint set on the same edges and it starts at 6 components, decrements once per edge that merges - 0-1 to 5, 1-2 to 4, 3-4 to 3 - and never decrements on a repeat, so it reports 3 without ever building a list. Now the triangle 0-1, 1-2, 2-0: the traversal emits one component 0,1,2, and the disjoint set goes 3 to 2 to 1 to 0-decrements because the third edge finds both ends already merged, which is the same fact cycle detection reads off. Add the self-loop 2-2 and both answers stay at one component, because union(2,2) returns false and the walk never enqueues a node already seen.",
    commonMistake:
      "Traversing from node 0 and reporting one component, or unioning edges and then recounting the components by walking the parent array.",
    whyWrong:
      "The single-origin walk is correct on the connected graphs in the tutorial and wrong on the six-node example above, where it answers 1 instead of 3 and loses nodes 3, 4 and 5 entirely; a graph is not promised connected and the loop over starts is what makes the answer about the graph rather than about node 0. The second one is not wrong but wasteful: a union that decrements a shared counter is exact after every merge, so sweeping the parent array afterwards re-derives O(V) work the structure already did, and it breaks the moment the edges keep arriving and you need the number between merges.",
    followUps:
      [
        "Which of your two versions can answer are-u-and-v-in-the-same-component after O(1) extra work, and which has to keep the seen array alive?",
        "The edges arrive one at a time and the count is asked after each one. What does the traversal cost per arrival and what does the disjoint set cost?",
        "You want the members of every component sorted inside each list as well as the lists ordered by their smallest node. Where in your walk does each sort happen?",
        "Give the version that reports the component sizes without storing any member list. Why is the disjoint set the cheaper of the two at that question?",
      ],
    solution:
      buildAdj + '\n' +
      '\n' +
      unionFind + '\n' +
      '\n' +
      'function componentsOf(adj) {\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  const out = [];\n' +
      '  for (let start = 0; start < adj.length; start += 1) {\n' +
      '    if (seen[start]) continue;\n' +
      '    seen[start] = true;\n' +
      '    const queue = [start];\n' +
      '    let head = 0;\n' +
      '    while (head < queue.length) {\n' +
      '      const node = queue[head];\n' +
      '      head += 1;\n' +
      '      for (const edge of adj[node]) {\n' +
      '        const next = edge[1];\n' +
      '        if (seen[next]) continue;\n' +
      '        seen[next] = true;\n' +
      '        queue.push(next);\n' +
      '      }\n' +
      '    }\n' +
      '    out.push(queue.slice());\n' +
      '  }\n' +
      '  for (const list of out) list.sort((a, b) => a - b);\n' +
      '  out.sort((a, b) => a[0] - b[0]);\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function countComponents(adj) {\n' +
      '  return componentsOf(adj).length;\n' +
      '}\n' +
      '\n' +
      'function largestComponent(adj) {\n' +
      '  let best = 0;\n' +
      '  for (const list of componentsOf(adj)) if (list.length > best) best = list.length;\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function componentsWithUnionFind(adj) {\n' +
      '  const uf = new UnionFind(adj.length);\n' +
      '  for (let node = 0; node < adj.length; node += 1) {\n' +
      '    for (const edge of adj[node]) uf.union(edge[0], edge[1]);\n' +
      '  }\n' +
      '  return uf.components;\n' +
      '}',
    modify:
      "The graph gains edges while the program runs and every query asks whether two nodes are now connected. Which representation survives that contract, and what does the traversal-based answer cost per insertion?",
  },
  {
    step: 15,
    name: "Breadth First Search (BFS)",
    difficulty: "Easy",
    topicSlug: "graph-traversal",
    stem: "Walk a graph level by level from one node, and explain what breaks if the seen mark happens when a node leaves the queue.",
    brief:
      "Input: an adjacency list and a start node, with no promise the graph is connected. Output: the visit order, the level bands, and the distance to every node with the unreachable ones marked. Say what BFS guarantees that DFS does not.",
    concepts: [
      "dsa-g15a-mark-on-enqueue",
      "dsa-g15a-bfs-first-touch-is-shortest",
      "dsa-g15a-component-loop",
      "dsa-bfs-needs-the-band-boundary",
      "dsa-queue-rotation-order",
    ],
    shortAnswer:
      "A FIFO queue plus a seen array written when a node is enqueued: pop, emit, push every unmarked neighbour and mark it. Everything emitted at pop k is one edge deeper than everything emitted before it.",
    idealAnswer:
      "BFS is the frontier algorithm: hold the nodes known but not yet expanded, and expand them in the order they became known. That order is what makes the depth of a node equal to its shortest distance in edges, because a node can only be entered from the frontier, and the frontier only ever holds the shallowest nodes not yet expanded - so the first time a node is touched is the shortest way to touch it. The guarantee costs one array: mark on enqueue. Marking on dequeue is the classic bug, and it is not an order bug - the emission order is the same - it is a size and bookkeeping bug, because a node reached by d edges is pushed d times and each duplicate is popped and discarded, so the queue holds O(E) entries instead of O(V) and any per-entry parent or depth you recorded disagrees with the one that got emitted. Level structure is a separate discipline: a plain queue mixes two depths the moment children are appended, so a band has to be closed by counting what is already queued. Reachability beyond the start component needs the outer loop over unvisited nodes, and unreachable nodes must be reported as unreachable rather than as distance zero.",
    walkthrough:
      "Six nodes with edges 0-1, 0-2, 1-3, 2-3, 3-4, and node 5 alone. Start at 0 and mark it. Pop 0 and push 1 then 2, both marked now, so the queue is 1,2 and the order reads 0. Pop 1, emit it, and its neighbours are 0 - already marked - and 3, which is pushed and marked at depth 2. Pop 2: its neighbours are 0 and 3, and 3 is already marked because the pop of 1 marked it, so nothing is pushed; that is the whole difference between marking on push and marking on pop, since the pop-then-mark version pushes 3 a second time. Pop 3, push 4. Pop 4. Pop nothing else and the walk ends with order 0,1,2,3,4, bands 0 | 1,2 | 3 | 4 and depths 0,1,1,2,3,-1 - the -1 belongs to 5, which no band ever reaches. Now run the mark-on-pop version on the same six nodes: it emits the identical five-node order but spends eleven pushes to do it - six of them repeats of nodes that were already queued or already popped - and on a dense component those repeats are bounded by the edge count, not the node count.",
    commonMistake:
      "Marking the node when it is popped instead of when it is pushed, or starting the queue with the whole graph instead of one node and never returning to the unvisited ones.",
    whyWrong:
      "The pop-time mark is the version that answers the question in the wrong currency: on the graph above it still prints 0,1,2,3,4 but it queues eleven entries for five nodes, so memory tracks edges rather than vertices, and any depth or parent written per entry gives node 3 two parents and two depths, which is how a shortest-distance answer silently becomes the distance of the last copy popped. Starting once from node 0 is the other silent failure: it reports depths of -1 as though the graph were connected, and the disconnected six-node example above loses node 5 rather than naming it unreachable.",
    followUps:
      [
        "Prove the first-touch-is-shortest claim: what does the queue look like at the moment a node at depth d is popped, and why can no shorter route arrive later?",
        "Your graph is 10 million nodes and streamed from disk. Which of the seen array, the queue and the depth array could you not afford, and what replaces it?",
        "Rewrite the walk so it emits bands without counting the queue size each time. What marker goes into the queue, and what does it cost?",
        "Give an input where the mark-on-pop version emits a different order rather than merely a longer queue - or argue that no such input exists for a plain visit order.",
      ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function bfs(adj, start) {\n' +
      '  if (adj.length === 0 || start < 0 || start >= adj.length) return [];\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  const order = [];\n' +
      '  const queue = [start];\n' +
      '  seen[start] = true;\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const node = queue[head];\n' +
      '    head += 1;\n' +
      '    order.push(node);\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const next = edge[1];\n' +
      '      if (seen[next]) continue;\n' +
      '      seen[next] = true;\n' +
      '      queue.push(next);\n' +
      '    }\n' +
      '  }\n' +
      '  return order;\n' +
      '}\n' +
      '\n' +
      'function bfsLevels(adj, start) {\n' +
      '  if (adj.length === 0 || start < 0 || start >= adj.length) return [];\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  seen[start] = true;\n' +
      '  let frontier = [start];\n' +
      '  const levels = [];\n' +
      '  while (frontier.length > 0) {\n' +
      '    levels.push(frontier.slice());\n' +
      '    const nextFrontier = [];\n' +
      '    for (const node of frontier) {\n' +
      '      for (const edge of adj[node]) {\n' +
      '        const next = edge[1];\n' +
      '        if (seen[next]) continue;\n' +
      '        seen[next] = true;\n' +
      '        nextFrontier.push(next);\n' +
      '      }\n' +
      '    }\n' +
      '    frontier = nextFrontier;\n' +
      '  }\n' +
      '  return levels;\n' +
      '}\n' +
      '\n' +
      'function bfsDepths(adj, start) {\n' +
      '  const depth = new Array(adj.length).fill(-1);\n' +
      '  if (adj.length === 0 || start < 0 || start >= adj.length) return depth;\n' +
      '  depth[start] = 0;\n' +
      '  const queue = [start];\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const node = queue[head];\n' +
      '    head += 1;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const next = edge[1];\n' +
      '      if (depth[next] !== -1) continue;\n' +
      '      depth[next] = depth[node] + 1;\n' +
      '      queue.push(next);\n' +
      '    }\n' +
      '  }\n' +
      '  return depth;\n' +
      '}\n' +
      '\n' +
      'function bfsMarkOnPop(adj, start) {\n' +
      '  if (adj.length === 0 || start < 0 || start >= adj.length) return { order: [], pushes: 0 };\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  const order = [];\n' +
      '  const queue = [start];\n' +
      '  let head = 0;\n' +
      '  let pushes = 1;\n' +
      '  while (head < queue.length) {\n' +
      '    const node = queue[head];\n' +
      '    head += 1;\n' +
      '    if (seen[node]) continue;\n' +
      '    seen[node] = true;\n' +
      '    order.push(node);\n' +
      '    for (const edge of adj[node]) {\n' +
      '      pushes += 1;\n' +
      '      queue.push(edge[1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return { order: order, pushes: pushes };\n' +
      '}',
    modify:
      "The graph is directed and the question becomes which nodes can reach the start instead of which the start reaches. What single change to the walk answers it, and why does the answer not fall out of the same run?",
  },
  {
    step: 15,
    name: "Depth First Search (DFS)",
    difficulty: "Easy",
    topicSlug: "graph-traversal",
    stem: "Walk a graph by committing to one path to the end, and say exactly where the walk order stops matching breadth-first order.",
    brief:
      "Input: an adjacency list and a start node. Output: the pre-order visit list, plus the same walk in post-order without recursion. State where DFS and BFS first disagree on a graph with branching, and what each one keeps in memory.",
    concepts: [
      "dsa-g15a-stack-entry-carries-state",
      "dsa-stack-order-decides-visit-order",
      "dsa-call-stack-cost",
      "dsa-g15a-component-loop",
      "dsa-recursive-decomposition",
    ],
    shortAnswer:
      "A LIFO stack, marked on push, with children pushed in reverse so the leftmost neighbour is popped first: descend to the end of one path, and the stack unwinds you back to the branch you deferred.",
    idealAnswer:
      "Depth-first search is the walk that postpones every sibling until the current path dies, which is exactly what a stack of unfinished alternatives does. Pre-order means the node is emitted when it is first popped, so the emission order is the order of the path taken, and the whole trick of writing it iteratively is that a stack returns the last thing pushed: to visit the first neighbour first, the neighbours go on in reverse. The memory claim is the one to make carefully - the stack holds the path back to the root plus one deferred sibling per level, so its size is bounded by the depth, not by the width, which is the opposite of the queue that holds the widest band. That is also why DFS is the right tool when the answer lives at the end of a path (a cycle, a colouring, a back-edge, an exhaustive enumeration) and the wrong tool when the answer is a distance, because a depth-first walk reaches a node by whichever route it committed to first and never revisits it. Recursion is the same walk with the frames supplied by the host, so it is correct and it is the thing that blows the stack on a 100 by 100 grid where the path is ten thousand cells deep - which is why every row in this step ships the explicit-stack version. Post-order on an undirected graph needs one more piece of state per entry, because the deferred node has to be distinguishable from the node being revisited.",
    walkthrough:
      "Six nodes, edges 0-1, 0-2, 1-3, 1-4, 2-5, start at 0. Pop 0 and push its neighbours in reverse order, so 2 goes on first and 1 lands on top. The stack is [2,1]; pop 1, emit it, push 4 then 3, and the stack becomes [2,4,3] with a peak of 3 entries - three, because the path 0-1-3 is what is open plus the sibling 2 waiting underneath. Pop 3, which reaches nothing new; pop 4, likewise; now pop 2, push 5, pop 5. The emitted order is 0,1,3,4,2,5 and the recursive pre-order gives the identical list, which is the point of the reverse push. Run BFS on the same graph and it emits 0,1,2,3,4,5 - the two walks agree on the first two nodes and disagree from the third onward, because DFS finishes the subtree under 1 before it acknowledges that 2 exists, while BFS acknowledges 2 immediately. The post-order version needs a second copy of each node on the stack, flagged as a return visit, and emits 3,4,1,5,2,0: a node appears exactly once, after all its children. Mark on pop instead of on push costs eleven pushes for the same six nodes: a pop queues the whole adjacency list of its node without asking first, so the stack grows once per list entry - ten entries for a five-edge undirected graph - plus the seed, against the six nodes that are actually visited.",
    commonMistake:
      "Pushing neighbours in list order and calling the result pre-order, or writing DFS as recursion and stating the cost as O(V) memory.",
    whyWrong:
      "A stack serves the last entry, so pushing 1 then 2 makes the walk descend the 2 side first: on the graph above that returns 0,2,5,1,3,4, which is a mirrored pre-order that agrees with the real one only on a chain, and any row that later depends on visit order - top and bottom views, reconstruction from a walk - inherits the mirror. The recursion claim is wrong in the direction that matters: the frames are one per level, but the level count is the length of the longest path, and on the 1000 by 1000 open grid that is a million frames, which is exactly the input where the host throws before the algorithm finishes.",
    followUps:
      [
        "Give the graph where DFS finds a target node in three pops and BFS needs three hundred. What does that say about which walk you should ship for a search?",
        "Your explicit stack has to emit post-order. What does each entry carry besides the node, and why is one flag enough instead of a child index?",
        "DFS visits a node by a long route first and never corrects it. Show the six-node graph where its recorded parent is not the shortest-path parent.",
        "Compare the peak stack size on a path graph of n nodes with the peak queue size on a star of n nodes. Which walk is in trouble on which shape?",
      ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function dfs(adj, start) {\n' +
      '  if (adj.length === 0 || start < 0 || start >= adj.length) {\n' +
      '    return { order: [], pushes: 0, peak: 0 };\n' +
      '  }\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  const order = [];\n' +
      '  const stack = [start];\n' +
      '  seen[start] = true;\n' +
      '  let pushes = 1;\n' +
      '  let peak = 1;\n' +
      '  while (stack.length > 0) {\n' +
      '    const node = stack.pop();\n' +
      '    order.push(node);\n' +
      '    for (let i = adj[node].length - 1; i >= 0; i -= 1) {\n' +
      '      const next = adj[node][i][1];\n' +
      '      if (seen[next]) continue;\n' +
      '      seen[next] = true;\n' +
      '      pushes += 1;\n' +
      '      stack.push(next);\n' +
      '      if (stack.length > peak) peak = stack.length;\n' +
      '    }\n' +
      '  }\n' +
      '  return { order: order, pushes: pushes, peak: peak };\n' +
      '}\n' +
      '\n' +
      'function walkAdjacency(adj, node, seen, order) {\n' +
      '  seen[node] = true;\n' +
      '  order.push(node);\n' +
      '  for (const edge of adj[node]) {\n' +
      '    const next = edge[1];\n' +
      '    if (!seen[next]) walkAdjacency(adj, next, seen, order);\n' +
      '  }\n' +
      '  return order;\n' +
      '}\n' +
      '\n' +
      'function dfsRecursive(adj, start) {\n' +
      '  if (adj.length === 0 || start < 0 || start >= adj.length) return [];\n' +
      '  return walkAdjacency(adj, start, new Array(adj.length).fill(false), []);\n' +
      '}\n' +
      '\n' +
      'function dfsMarkOnPop(adj, start) {\n' +
      '  if (adj.length === 0 || start < 0 || start >= adj.length) return { order: [], pushes: 0 };\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  const order = [];\n' +
      '  const stack = [start];\n' +
      '  let pushes = 1;\n' +
      '  while (stack.length > 0) {\n' +
      '    const node = stack.pop();\n' +
      '    if (seen[node]) continue;\n' +
      '    seen[node] = true;\n' +
      '    order.push(node);\n' +
      '    for (let i = adj[node].length - 1; i >= 0; i -= 1) {\n' +
      '      pushes += 1;\n' +
      '      stack.push(adj[node][i][1]);\n' +
      '    }\n' +
      '  }\n' +
      '  return { order: order, pushes: pushes };\n' +
      '}\n' +
      '\n' +
      'function dfsPostOrder(adj, start) {\n' +
      '  if (adj.length === 0 || start < 0 || start >= adj.length) return [];\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  const order = [];\n' +
      '  const stack = [[start, false]];\n' +
      '  while (stack.length > 0) {\n' +
      '    const entry = stack.pop();\n' +
      '    const node = entry[0];\n' +
      '    if (entry[1]) {\n' +
      '      order.push(node);\n' +
      '      continue;\n' +
      '    }\n' +
      '    if (seen[node]) continue;\n' +
      '    seen[node] = true;\n' +
      '    stack.push([node, true]);\n' +
      '    for (let i = adj[node].length - 1; i >= 0; i -= 1) {\n' +
      '      const next = adj[node][i][1];\n' +
      '      if (!seen[next]) stack.push([next, false]);\n' +
      '    }\n' +
      '  }\n' +
      '  return order;\n' +
      '}',
    modify:
      "Rewrite the walk to enumerate every simple path from the start to a target instead of visiting each node once. Which two pieces of state have to come off the seen array and back onto the stack entry?",
  },
  {
    step: 15,
    name: "Number of Provinces",
    difficulty: "Medium",
    topicSlug: "graph-traversal",
    stem: "Count the groups of directly or indirectly connected cities when the graph is handed to you as a square matrix.",
    brief:
      "Input: an n by n matrix where isConnected[i][j] is 1 when cities i and j are directly connected and the diagonal is always 1. Output: the number of provinces - maximal sets of cities where every pair is connected by some route. A city connected through a third city is in the same province.",
    concepts: [
      "dsa-g15a-component-loop",
      "dsa-g15a-dsu-component-count",
      "dsa-g15a-adjacency-list-versus-matrix",
      "dsa-g15a-mark-on-enqueue",
      "dsa-coordinate-loops",
    ],
    shortAnswer:
      "One pass over the cities: each unvisited city opens a province and the walk from it claims every city reachable through the matrix rows. Transitivity is free - the walk follows second-hand edges the same way as direct ones.",
    idealAnswer:
      "This is connected components wearing a different noun, and the interesting part is the representation: the matrix is dense by contract, so the neighbour scan costs O(n) per city instead of O(degree), and the whole walk is O(n squared) time with O(n) for the seen array even on a graph with only n minus one edges. The claim that needs stating is the transitive one - two cities with no direct edge are in the same province if a route joins them, which is exactly what a walk does for free and exactly what a candidate loses when they count rows containing a 1. The disjoint-set answer is the same O(n squared) scan, because every upper-triangle pair must still be inspected, but its memory drops to two arrays of n and the same structure answers a merge-then-query sequence; the province sizes come out of the set sizes, which is a genuinely free bonus and is why this row is the natural place to introduce union-find. The diagonal is the trap that turns a count into n: a row always contains its own 1, so a walk that does not test whether the neighbour is already seen re-enqueues the city it came from, and a naive union that includes i equals j never decrements the counter, so the answer is silently right for the wrong reason until someone reorders the loop.",
    walkthrough:
      "Five cities: rows [1,0,0,0,1], [0,1,0,0,0], [0,0,1,1,0], [0,0,1,1,0], [1,0,0,0,1]. The scan opens at city 0, whose row marks 0 and 4, so 4 is claimed; the row of 4 marks 0 and 4 and both are already claimed, so the province closes at size 2. City 1 is untouched, so a second province of one opens and closes at once. City 2 is untouched, claims 3, and 3 points back at 2, giving the third province of size 2. The answer is 3 and the sizes read 2,2,1. The union-find version starts at 5 and decrements twice, 0 with 4 and 2 with 3, because the scan only looks above the diagonal, reaching the same 3. Now the case that catches a direct-edge counter: rows [1,1,0],[1,0,1],[0,1,1] have no edge between 0 and 2, so a row-scan answer says 2 provinces, while the walk goes 0 to 1 to 2 and returns 1, which is also what the disjoint set reports after merging 0-1 then 1-2. The single city [[1]] is one province and the empty matrix is zero, not one.",
    commonMistake:
      "Counting a province per row that contains a 1, or treating the relation as direct-only so that a chain 0-1, 1-2 makes three provinces.",
    whyWrong:
      "Every row contains its own diagonal 1, so the per-row test returns n for any matrix and is really a bug that hides behind the diagonal; the direct-only reading is subtler because it is a legitimate relation that is not the one asked. On the three-city matrix above it answers 2 where the definition answers 1, because a province is a connected component and connectivity is defined by routes, not by edges. The third failure is the unmarked revisit: without a seen test, city 0 re-enqueues itself from its own diagonal on every pop and the walk spins over the same row forever.",
    followUps:
      [
        "Your matrix is symmetric by promise. Which half of it can the union-find scan skip, and what does the traversal do with the other half?",
        "Report the largest province rather than the count. Which of your two versions gets that number without a second pass, and why?",
        "The input is 50 thousand cities and 50 thousand friend requests rather than a matrix. Which representation do you build first, and what does the answer now cost?",
        "A city can be removed and its edges with it. Which of the two structures can survive a deletion and which one has to be rebuilt?",
      ],
    solution:
      unionFind + '\n' +
      '\n' +
      'function countProvinces(isConnected) {\n' +
      '  const n = isConnected.length;\n' +
      '  const seen = new Array(n).fill(false);\n' +
      '  let provinces = 0;\n' +
      '  for (let start = 0; start < n; start += 1) {\n' +
      '    if (seen[start]) continue;\n' +
      '    provinces += 1;\n' +
      '    seen[start] = true;\n' +
      '    const stack = [start];\n' +
      '    while (stack.length > 0) {\n' +
      '      const node = stack.pop();\n' +
      '      const row = isConnected[node];\n' +
      '      for (let other = 0; other < row.length; other += 1) {\n' +
      '        if (row[other] === 1 && !seen[other]) {\n' +
      '          seen[other] = true;\n' +
      '          stack.push(other);\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return provinces;\n' +
      '}\n' +
      '\n' +
      'function provincesWithUnionFind(isConnected) {\n' +
      '  const uf = new UnionFind(isConnected.length);\n' +
      '  for (let a = 0; a < isConnected.length; a += 1) {\n' +
      '    for (let b = a + 1; b < isConnected.length; b += 1) {\n' +
      '      if (isConnected[a][b] === 1) uf.union(a, b);\n' +
      '    }\n' +
      '  }\n' +
      '  return uf.components;\n' +
      '}\n' +
      '\n' +
      'function provinceSizes(isConnected) {\n' +
      '  const sizes = [];\n' +
      '  const n = isConnected.length;\n' +
      '  const seen = new Array(n).fill(false);\n' +
      '  for (let start = 0; start < n; start += 1) {\n' +
      '    if (seen[start]) continue;\n' +
      '    let size = 0;\n' +
      '    seen[start] = true;\n' +
      '    const stack = [start];\n' +
      '    while (stack.length > 0) {\n' +
      '      const node = stack.pop();\n' +
      '      size += 1;\n' +
      '      const row = isConnected[node];\n' +
      '      for (let other = 0; other < row.length; other += 1) {\n' +
      '        if (row[other] === 1 && !seen[other]) {\n' +
      '          seen[other] = true;\n' +
      '          stack.push(other);\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '    sizes.push(size);\n' +
      '  }\n' +
      '  sizes.sort((a, b) => b - a);\n' +
      '  return sizes;\n' +
      '}',
    modify:
      "The matrix is replaced by a stream of friendship requests and the app asks for the province count after every request. Which of the two versions keeps that answer O(alpha(n)) per request, and what does the other one have to recompute?",
  },
  {
    step: 15,
    name: "Connected Components Problem in Matrix",
    difficulty: "Medium",
    topicSlug: "graph-traversal",
    stem: "Count the separate landmasses in a grid, and state what would change if a diagonal touch counted as connected.",
    brief:
      "Input: a grid of 0 and 1 cells where 1 is land. Output: the number of 4-connected land components and the size of the largest. Cells touching only at a corner are separate components under the 4-neighbour rule; say what the 8-neighbour rule does to that answer.",
    concepts: [
      "dsa-g15a-grid-cell-as-node",
      "dsa-g15a-component-loop",
      "dsa-g15a-mark-on-enqueue",
      "dsa-coordinate-loops",
      "dsa-flattened-index-mapping",
    ],
    shortAnswer:
      "Scan the grid row-major; every unvisited land cell opens a component and a flood from it claims everything reachable through the four offsets. The count is how many floods you started.",
    idealAnswer:
      "The grid is an implicit graph: n by m cells are the nodes, and the only adjacency is the offset list, which is why the whole row reduces to swapping the adjacency list for DIRS4 and keeping every other line of the graph answer. Three things change when the graph is implicit rather than given. First, the neighbour test is a bounds test rather than a list walk, so there is no O(degree) step and every pop pays four index checks. Second, the component count is per cell, so the outer scan is over rows and columns rather than node ids, and it must skip water - a flood started on a 0 cell reports a component that does not exist. Third, memory: the seen array is one cell per grid cell, and a component flood never holds more than the cell count in its queue, so this is O(nm) and the recursive form of the same walk is what turns a 1000 by 1000 grid into a million-deep call stack. The connectivity rule belongs in the contract, not in the code: 4-connectivity and 8-connectivity disagree on the grid [[1,0],[0,1]], which is two components under one rule and one under the other, and an interviewer asking about islands usually means 4.",
    walkthrough:
      "Take the four by four grid with rows 1,1,0,0 then 0,1,0,1 then 0,0,0,1 then 1,0,0,0. The row-major scan finds (0,0) as land and floods it: its offsets reach (0,1) and (1,0) is water, so from (0,1) it reaches (1,1), and from (1,1) nothing - the component is the three cells (0,0),(0,1),(1,1). The scan continues and finds (1,3) unvisited, whose flood takes (2,3) and stops, giving two cells; then (3,0) alone, giving one. The answer is 3 components, largest 3, and the sizes read 3,2,1. Now the diagonal question: the two by two grid 1,0 then 0,1 has its land cells meeting at a corner only, so with DIRS4 the scan starts two floods and answers 2, while a list of eight offsets would let (0,0) reach (1,1) in one step and answer 1. The all-water grid answers 0 because the scan never starts a flood, and an empty grid answers 0 rather than throwing, which is what the guard for rows and columns of length zero is for.",
    commonMistake:
      "Starting a flood from every cell instead of every unvisited land cell, or marking the cells when they are popped rather than when they are queued.",
    whyWrong:
      "Starting on water reports components that are not there - on the four by four example above it would answer 10 instead of 3, because every 0 cell that has already been stepped over still opens a flood - and starting on an already-visited land cell double-counts a component the scan has already drained. The pop-time mark is the same bug as in the graph rows with a worse price: a cell has up to four neighbours each able to queue it, so the queue holds up to four copies per cell and the work goes from cells to edges, which on a solid grid of a million land cells is four million pops instead of a million.",
    followUps:
      [
        "Your grid is given as characters, with land marked A, B and C and cells of the same letter connected. Which single line changes, and what does the answer now mean?",
        "Switch to 8-connectivity. Which diagonal pair changes the component count on the grid you just traced, and what is the new number?",
        "The grid is 40 thousand by 40 thousand and does not fit in memory as a boolean array. How do you mark visited without the seen array, and what does that do to the input?",
        "Give the version that returns the bounding box of each component. Which two values does the flood have to track per pop, and why is the cost still O(nm)?",
      ],
    solution:
      dirs4 + '\n' +
      '\n' +
      'function scanGridComponents(grid) {\n' +
      '  const sizes = [];\n' +
      '  if (grid.length === 0 || grid[0].length === 0) return sizes;\n' +
      '  const rows = grid.length;\n' +
      '  const cols = grid[0].length;\n' +
      '  const seen = [];\n' +
      '  for (let r = 0; r < rows; r += 1) seen.push(new Array(cols).fill(false));\n' +
      '  for (let r = 0; r < rows; r += 1) {\n' +
      '    for (let c = 0; c < cols; c += 1) {\n' +
      '      if (seen[r][c] || grid[r][c] !== 1) continue;\n' +
      '      seen[r][c] = true;\n' +
      '      const queue = [[r, c]];\n' +
      '      let head = 0;\n' +
      '      let size = 0;\n' +
      '      while (head < queue.length) {\n' +
      '        const cell = queue[head];\n' +
      '        head += 1;\n' +
      '        size += 1;\n' +
      '        for (const dir of DIRS4) {\n' +
      '          const nr = cell[0] + dir[0];\n' +
      '          const nc = cell[1] + dir[1];\n' +
      '          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n' +
      '          if (seen[nr][nc] || grid[nr][nc] !== 1) continue;\n' +
      '          seen[nr][nc] = true;\n' +
      '          queue.push([nr, nc]);\n' +
      '        }\n' +
      '      }\n' +
      '      sizes.push(size);\n' +
      '    }\n' +
      '  }\n' +
      '  return sizes;\n' +
      '}\n' +
      '\n' +
      'function countGridComponents(grid) {\n' +
      '  return scanGridComponents(grid).length;\n' +
      '}\n' +
      '\n' +
      'function largestGridComponent(grid) {\n' +
      '  let best = 0;\n' +
      '  for (const size of scanGridComponents(grid)) if (size > best) best = size;\n' +
      '  return best;\n' +
      '}\n' +
      '\n' +
      'function gridComponentCells(grid, row, col) {\n' +
      '  if (!inGrid(grid, row, col) || grid[row][col] !== 1) return [];\n' +
      '  const rows = grid.length;\n' +
      '  const cols = grid[0].length;\n' +
      '  const seen = [];\n' +
      '  for (let r = 0; r < rows; r += 1) seen.push(new Array(cols).fill(false));\n' +
      '  seen[row][col] = true;\n' +
      '  const queue = [[row, col]];\n' +
      '  const out = [];\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const cell = queue[head];\n' +
      '    head += 1;\n' +
      '    out.push(cell[0] + "," + cell[1]);\n' +
      '    for (const dir of DIRS4) {\n' +
      '      const nr = cell[0] + dir[0];\n' +
      '      const nc = cell[1] + dir[1];\n' +
      '      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n' +
      '      if (seen[nr][nc] || grid[nr][nc] !== 1) continue;\n' +
      '      seen[nr][nc] = true;\n' +
      '      queue.push([nr, nc]);\n' +
      '    }\n' +
      '  }\n' +
      '  out.sort();\n' +
      '  return out;\n' +
      '}',
    modify:
      "Cells of the same letter are connected instead of cells holding 1, and the grid may be all letters. Which two conditions change, and what happens to a component that touches the grid border?",
  },
  {
    step: 15,
    name: "Rotten Oranges",
    difficulty: "Medium",
    topicSlug: "graph-traversal",
    stem: "Report the minutes until no fresh orange is left on a grid where every rotten orange rots its neighbours at the same time, or -1 if some orange never rots.",
    brief:
      "Input: a grid with 0 for an empty cell, 1 for fresh and 2 for rotten. Output: the elapsed minutes for the last fresh cell to rot, 0 when nothing was fresh, and -1 when a fresh cell is unreachable from every rotten one. All oranges rot simultaneously.",
    concepts: [
      "dsa-g15a-multi-source-bfs",
      "dsa-g15a-bfs-first-touch-is-shortest",
      "dsa-g15a-grid-cell-as-node",
      "dsa-bfs-needs-the-band-boundary",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "Seed the queue with every rotten cell at once, then expand band by band: one band is one minute, and the answer is the number of bands needed to consume the fresh count.",
    idealAnswer:
      "Simultaneous rotting is exactly a multi-source breadth-first search: all the sources sit in the first band, so the wavefront advances one edge per minute and the number of bands is the time. The three ingredients have to be stated together, because dropping any one of them produces a plausible wrong answer. First, all sources go in before any pop; a queue that starts with one rotten orange measures distance from that orange and ignores the others. Second, the level boundary is a count of the band already queued, not a timestamp written into each entry - both work, but the counted version is the one that never mixes depths, which is what the minute counter is reading. Third, the fresh count is the termination condition, so the walk can stop early on a fully-rotted grid and can report the remainder as unreachable rather than reporting the last band it happened to expand. The cost is O(rows times cols) time and the same for the queue in the worst case, with the input copied because a rotting simulation that destroys the caller grid is a side effect the signature did not promise. The zero-band case matters: no fresh cells at all means 0 minutes, not -1, and a grid with fresh cells but no rotten ones means -1 immediately.",
    walkthrough:
      "The grid rows 2,1,1 then 1,1,0 then 0,1,1 has one rotten cell, (0,0), and six fresh ones. Seed the queue with every rotten cell before the first pop, so here it holds one entry. Minute one expands that band and rots (0,1) and (1,0), so fresh falls to 4; minute two expands those two and rots (0,2) and (1,1), leaving 2; minute three rots only (2,1), because (1,2) and (2,0) are empty cells; minute four rots (2,2) and the fresh count reaches 0. The bands read {(0,0)}, {(0,1),(1,0)}, {(0,2),(1,1)}, {(2,1)}, {(2,2)} and the answer is 4 minutes. Two sources show that the answer is a maximum rather than a sum: rows 2,1,1 then 1,1,1 then 1,1,2 rot from (0,0) and (2,2) at once, so band one is {(0,1),(1,0),(1,2),(2,1)} and band two is {(0,2),(1,1),(2,0)}, and seven fresh cells are gone in 2 minutes. Now the unreachable case, rows 2,1,1 then 0,1,1 then 1,0,1: it has one source again, its bands run out to minute 4 while (2,0) is never touched, because the empty cells at (1,0) and (2,1) wall it in, so the queue drains with fresh still counting 1 and the answer is -1, not the 4 the last band would report. A grid of nothing but rotten cells returns 0 before the walk starts, and [[1]] returns -1 because the seed queue is empty.",
    commonMistake:
      "Seeding the queue with one rotten orange at a time on rows like 2,1,1 then 1,1,1 then 1,1,2 and summing the passes, or reading queue.length as the band size after children of the current band have already been pushed.",
    whyWrong:
      "One-source-at-a-time measures the depth of a search instead of the elapsed time of a simulation: rot from (0,0) across the whole grid, then restart the clock at (2,2), and the two waves no longer share a minute counter - on the grid above the joint wavefront clears seven fresh cells in 2 minutes while two sequential walks report 4 plus 4, because (1,1) rots at band 2 from either source and the sequential version pays for both. The band-counting bug is subtler and lands as an off-by-one: a queue length sampled after some children are already inside counts those children in the current minute, so the returned time is one too large on any grid whose final band is empty, and a fully-rotted grid is exactly the case where the fresh count has already reached 0 and the walk should stop before opening another band.",
    followUps:
      [
        "Store the minute inside each queue entry instead of counting the band. Which of the two versions lets you stop the instant the last fresh orange rots?",
        "The grid is 2000 by 2000 and only the count matters. What is the smallest state that still distinguishes 0 from -1?",
        "Rotting takes three minutes per edge instead of one. Does the multi-source shape still hold, and what breaks if it does not?",
        "Give the version that mutates the caller grid instead of copying it. What does the function signature have to say, and which test now fails?",
      ],
    solution:
      showGrid + '\n' +
      '\n' +
      dirs4 + '\n' +
      '\n' +
      'function countFresh(grid) {\n' +
      '  let fresh = 0;\n' +
      '  for (const row of grid) for (const cell of row) if (cell === 1) fresh += 1;\n' +
      '  return fresh;\n' +
      '}\n' +
      '\n' +
      'function rottingMinutes(grid) {\n' +
      '  if (grid.length === 0 || grid[0].length === 0) return 0;\n' +
      '  const rows = grid.length;\n' +
      '  const cols = grid[0].length;\n' +
      '  const state = [];\n' +
      '  for (let r = 0; r < rows; r += 1) state.push(grid[r].slice());\n' +
      '  let fresh = 0;\n' +
      '  const queue = [];\n' +
      '  for (let r = 0; r < rows; r += 1) {\n' +
      '    for (let c = 0; c < cols; c += 1) {\n' +
      '      if (state[r][c] === 2) queue.push([r, c]);\n' +
      '      else if (state[r][c] === 1) fresh += 1;\n' +
      '    }\n' +
      '  }\n' +
      '  if (fresh === 0) return 0;\n' +
      '  if (queue.length === 0) return -1;\n' +
      '  let minutes = 0;\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length && fresh > 0) {\n' +
      '    const levelEnd = queue.length;\n' +
      '    let rotted = 0;\n' +
      '    while (head < levelEnd) {\n' +
      '      const cell = queue[head];\n' +
      '      head += 1;\n' +
      '      for (const dir of DIRS4) {\n' +
      '        const nr = cell[0] + dir[0];\n' +
      '        const nc = cell[1] + dir[1];\n' +
      '        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n' +
      '        if (state[nr][nc] !== 1) continue;\n' +
      '        state[nr][nc] = 2;\n' +
      '        fresh -= 1;\n' +
      '        rotted += 1;\n' +
      '        queue.push([nr, nc]);\n' +
      '      }\n' +
      '    }\n' +
      '    if (rotted === 0) return -1;\n' +
      '    minutes += 1;\n' +
      '  }\n' +
      '  return fresh === 0 ? minutes : -1;\n' +
      '}\n' +
      '\n' +
      'function finalState(grid) {\n' +
      '  if (grid.length === 0 || grid[0].length === 0) return [];\n' +
      '  const rows = grid.length;\n' +
      '  const cols = grid[0].length;\n' +
      '  const state = [];\n' +
      '  for (let r = 0; r < rows; r += 1) state.push(grid[r].slice());\n' +
      '  const queue = [];\n' +
      '  for (let r = 0; r < rows; r += 1) {\n' +
      '    for (let c = 0; c < cols; c += 1) if (state[r][c] === 2) queue.push([r, c]);\n' +
      '  }\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const cell = queue[head];\n' +
      '    head += 1;\n' +
      '    for (const dir of DIRS4) {\n' +
      '      const nr = cell[0] + dir[0];\n' +
      '      const nc = cell[1] + dir[1];\n' +
      '      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n' +
      '      if (state[nr][nc] !== 1) continue;\n' +
      '      state[nr][nc] = 2;\n' +
      '      queue.push([nr, nc]);\n' +
      '    }\n' +
      '  }\n' +
      '  return state;\n' +
      '}',
    modify:
      "A fresh cell rots only once at least two of its neighbours are rotten. Which part of the band rule stops being enough, and what does the walk have to re-check per cell?",
  },
  {
    step: 15,
    name: "Flood Fill Algorithm",
    difficulty: "Easy",
    topicSlug: "graph-traversal",
    stem: "Repaint the connected region of one pixel and hand back a new image without touching the caller's grid.",
    brief:
      "Input: an image as a grid of integer values, a starting cell, and a new colour. Output: the image with the 4-connected region of cells equal to the start value repainted, and the input left unchanged. The new colour may equal the old one.",
    concepts: [
      "dsa-g15a-grid-cell-as-node",
      "dsa-g15a-mark-on-enqueue",
      "dsa-two-way-mapping",
      "dsa-boundary-conditions",
      "dsa-hash-frequency",
    ],
    shortAnswer:
      "Capture the start value once, then breadth-first the region comparing against that captured value with a separate seen array, writing the new colour into a copy of the image.",
    idealAnswer:
      "Flood fill is the smallest graph algorithm in this step - one BFS over a component defined by equality with a captured value - and every interesting failure it has comes from using the wrong thing as the visited marker. The region is defined on the original image, so the test must read the original; the paint goes on the copy. A version that decides whether a cell is still to do by comparing the live board against the new colour gets two wrong answers for one bug: it paints through any cell whose value merely differs from the target, because a foreign value also passes that test, and when the new colour equals the old it has no terminating condition at all, since every neighbour of the start still looks unfinished. The seen array is what makes the walk terminate in exactly one visit per cell, and it is also what lets the same code serve the repaint-with-the-same-colour case, which must return the region unchanged rather than loop. Memory is one boolean grid plus a queue bounded by the region size; the recursive form is the natural way to write it and the wrong way to ship it, because the region of a 1000 by 1000 solid image is a million frames deep. Copying the image is a contract decision worth naming: the repaint is the output, and mutating the input turns a pure function into an event that cannot be replayed.",
    walkthrough:
      "The image rows 1,1,1 then 1,1,0 then 1,0,1 flooded at (1,1) with colour 2. The captured origin is 1, so the region is every 1 cell reachable through 1 cells: (1,1) opens, its offsets add (0,1) and (1,0); (0,1) adds (0,0) and (0,2); (1,0) adds (2,0), the last 1 in the region. That is six cells and the flood reads 0,0 | 0,1 | 0,2 | 1,0 | 1,1 | 2,0 in row-major order. The output is 2,2,2 | 2,2,0 | 2,0,1 - the 0 at (1,2) and the 0 at (2,1) are not in the region and the 1 at (2,2) is not 4-adjacent to any region cell, so it keeps its value while the input grid still reads 1,1,1 | 1,1,0 | 1,0,1. Now paint that region with its own colour, 1: the seen array still bounds the walk, six cells are visited, and the returned image is identical to the input. The live-board test tells a different story - flood the same cell with colour 2 without a seen array and it paints (1,2) and (2,1), the cells that hold 0, because their value is simply not 2 - returning 2,2,2 | 2,2,2 | 2,2,2 after thirteen pops where the seen-array walk needs six.",
    commonMistake:
      "Testing whether a cell already holds the new colour instead of whether it holds the captured original value, or painting the input grid because copying feels wasteful.",
    whyWrong:
      "The new-colour test is a different region: on the image above it sweeps through the 0 cells at (1,2) and (2,1) because a 0 is not a 2, so the flood produces 2,2,2 | 2,2,2 | 2,2,2 - nine cells painted out of a region of six, thirteen pops where the seen-array walk needs six - and when the caller asks for the start colour back it never terminates because every neighbour still looks unpainted. Painting in place is the other failure with a longer shadow: the flood becomes unreproducible, the caller's own reference to the image changes under it, and any undo feature now has no original to restore - a copy costs the same O(rows times cols) memory the seen array already spends.",
    followUps:
      [
        "Drop the seen array and compare the live board against the original value while painting the copy. Why does that version terminate and the previous one not?",
        "Give the 8-connected version. Which cell of the image above changes its membership, and which does not?",
        "The image is 4K RGBA and the caller wants the region painted in place but must be able to undo it. What is the minimum you have to return?",
        "A flood that must report the region perimeter as well as the paint. Which extra test inside the same walk gives it, and what does the answer cost?",
      ],
    solution:
      showGrid + '\n' +
      '\n' +
      copyGrid + '\n' +
      '\n' +
      dirs4 + '\n' +
      '\n' +
      'function floodFill(image, row, col, color) {\n' +
      '  const out = copyGrid(image);\n' +
      '  if (!inGrid(image, row, col)) return out;\n' +
      '  const rows = image.length;\n' +
      '  const cols = image[0].length;\n' +
      '  const origin = image[row][col];\n' +
      '  const seen = [];\n' +
      '  for (let r = 0; r < rows; r += 1) seen.push(new Array(cols).fill(false));\n' +
      '  seen[row][col] = true;\n' +
      '  out[row][col] = color;\n' +
      '  const queue = [[row, col]];\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const cell = queue[head];\n' +
      '    head += 1;\n' +
      '    for (const dir of DIRS4) {\n' +
      '      const nr = cell[0] + dir[0];\n' +
      '      const nc = cell[1] + dir[1];\n' +
      '      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n' +
      '      if (seen[nr][nc] || image[nr][nc] !== origin) continue;\n' +
      '      seen[nr][nc] = true;\n' +
      '      out[nr][nc] = color;\n' +
      '      queue.push([nr, nc]);\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function floodRegionCells(image, row, col) {\n' +
      '  if (!inGrid(image, row, col)) return [];\n' +
      '  const rows = image.length;\n' +
      '  const cols = image[0].length;\n' +
      '  const origin = image[row][col];\n' +
      '  const seen = [];\n' +
      '  for (let r = 0; r < rows; r += 1) seen.push(new Array(cols).fill(false));\n' +
      '  seen[row][col] = true;\n' +
      '  const queue = [[row, col]];\n' +
      '  const out = [];\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const cell = queue[head];\n' +
      '    head += 1;\n' +
      '    out.push(cell[0] + "," + cell[1]);\n' +
      '    for (const dir of DIRS4) {\n' +
      '      const nr = cell[0] + dir[0];\n' +
      '      const nc = cell[1] + dir[1];\n' +
      '      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n' +
      '      if (seen[nr][nc] || image[nr][nc] !== origin) continue;\n' +
      '      seen[nr][nc] = true;\n' +
      '      queue.push([nr, nc]);\n' +
      '    }\n' +
      '  }\n' +
      '  out.sort();\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function floodFillLiveBoardTest(image, row, col, color, limit) {\n' +
      '  const out = copyGrid(image);\n' +
      '  if (!inGrid(image, row, col)) return { grid: out, spins: false, pops: 0 };\n' +
      '  const rows = image.length;\n' +
      '  const cols = image[0].length;\n' +
      '  const queue = [[row, col]];\n' +
      '  let head = 0;\n' +
      '  let pops = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    pops += 1;\n' +
      '    if (pops > limit) return { grid: out, spins: true, pops: pops };\n' +
      '    const cell = queue[head];\n' +
      '    head += 1;\n' +
      '    const r = cell[0];\n' +
      '    const c = cell[1];\n' +
      '    if (out[r][c] === color) continue;\n' +
      '    out[r][c] = color;\n' +
      '    for (const dir of DIRS4) {\n' +
      '      const nr = r + dir[0];\n' +
      '      const nc = c + dir[1];\n' +
      '      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n' +
      '      if (out[nr][nc] !== color) queue.push([nr, nc]);\n' +
      '    }\n' +
      '  }\n' +
      '  return { grid: out, spins: false, pops: pops };\n' +
      '}',
    modify:
      "The caller wants the original image returned as well as the painted one, and the paint applied in place. Which two lines move, and what does the seen array now have to be for the walk to still terminate?",
  },
  {
    step: 15,
    name: "Cycle Detection in Undirected Graph (BFS)",
    difficulty: "Medium",
    topicSlug: "graph-traversal",
    stem: "Decide whether an undirected graph contains a cycle, and name the edge that closes it, using a queue.",
    brief:
      "Input: an adjacency list over nodes 0..n-1, undirected, possibly disconnected, possibly holding a self-loop or a repeated edge. Output: whether a cycle exists and the first closing edge found. A tree must answer no.",
    concepts: [
      "dsa-g15a-parent-edge-cycle-check",
      "dsa-g15a-component-loop",
      "dsa-g15a-mark-on-enqueue",
      "dsa-g15a-bfs-first-touch-is-shortest",
      "dsa-cycle-detection",
    ],
    shortAnswer:
      "Breadth-first with a parent array: an already-seen neighbour that is not the node you came from closes a cycle, because both endpoints were already reachable and this edge joins two routes.",
    idealAnswer:
      "An undirected graph has a cycle exactly when a walk meets an edge that is not part of its own tree. That is the sentence to expand, because the naive version - a visited neighbour means a cycle - is wrong on every tree: the edge back to the parent is always there, since buildAdj stores each undirected edge in both endpoint lists, so a walk at node 1 will always see 0, its parent, as visited. The parent array is the discount, and it is only sound while each node has exactly one parent, which is exactly what marking on enqueue guarantees. The contract questions are the ones that separate a working answer from a memorised one. A disconnected graph needs the loop over all starts, because the cycle may sit in the component the walk never entered. A self-loop is a cycle and must be reported, and a node that is its own parent never happens here, so the ordinary test catches it. Parallel edges are a cycle of length two in a multigraph and the parent-per-node test reports them correctly, but the recursive form that skips a neighbour because it equals the parent says no, because it skips both copies - the discount belongs on the edge, not on the node. Cost is O(V + E) time and O(V) for the two arrays.",
    walkthrough:
      "Six nodes with edges 0-1 in the first component and 2-3, 3-4, 4-2 plus a tail 4-5 in the second. Start the walk at 0: node 1 is enqueued with parent 1 set to 0, nothing else is reachable and the queue empties with no conflict. The outer loop restarts at 2, which is unvisited: its row is 3 then 4, both unseen, so both are enqueued with parent 2. Pop 3 next and its row reads 2 then 4 - 2 is its parent, so it is discounted, and 4 is already seen while its own parent is 2 rather than 3, so the edge 3 to 4 closes the cycle and the walk returns 3,4. Restricting that same walk to a start at node 0 returns nothing at all, because the cycle lives in a component node 0 cannot see, which is the whole reason the loop exists. Now the two small inputs worth having ready: the triangle 0-1, 1-2, 2-0 reports the closing edge 1,2, and adding the self-loop 2-2 to a chain 0-1, 1-2 reports 2,2, because node 2 is its own neighbour, it is already seen, and its parent is 1. Feed the builder two copies of edge 0-1 and the walk reports 0,1 on the second copy - the two parallel edges are a genuine cycle of length two.",
    commonMistake:
      "Reporting a cycle whenever a visited neighbour is found, or running the check from node 0 only.",
    whyWrong:
      "The first one says yes to every graph with at least one edge, because the edge back to the parent is always present in an undirected adjacency list: the four-node tree 0-1, 1-2, 2-3 has node 2 seeing its parent 1 as visited, so the check answers true on a graph with three edges and no cycle. The second says no to the six-node example above, because node 0 reaches only node 1 and never discovers that 2, 3 and 4 form a triangle - the failure is silent and only shows on disconnected input, which is the input a graph question almost always has.",
    followUps:
      [
        "Your parent array gives one parent per node. Prove that marking on dequeue would break the parent-equality discount, and give the node it breaks on.",
        "Two parallel edges between 0 and 1: is that a cycle, and what has to change if the answer should be yes but a self-loop should be reported differently?",
        "Return the actual cycle as a list of nodes rather than the closing edge. Which structure do you add to the walk, and what does the reconstruction cost?",
        "Make the graph directed. Why does the same check report a cycle on the acyclic pair of edges 0-1 and 1-0?",
      ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function cycleEdgeBfs(adj) {\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  const parent = new Array(adj.length).fill(-1);\n' +
      '  for (let start = 0; start < adj.length; start += 1) {\n' +
      '    if (seen[start]) continue;\n' +
      '    seen[start] = true;\n' +
      '    const queue = [start];\n' +
      '    let head = 0;\n' +
      '    while (head < queue.length) {\n' +
      '      const node = queue[head];\n' +
      '      head += 1;\n' +
      '      for (const edge of adj[node]) {\n' +
      '        const next = edge[1];\n' +
      '        if (!seen[next]) {\n' +
      '          seen[next] = true;\n' +
      '          parent[next] = node;\n' +
      '          queue.push(next);\n' +
      '          continue;\n' +
      '        }\n' +
      '        if (next !== parent[node]) return node + "," + next;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return null;\n' +
      '}\n' +
      '\n' +
      'function hasCycleBfs(adj) {\n' +
      '  return cycleEdgeBfs(adj) !== null;\n' +
      '}\n' +
      '\n' +
      'function cycleEdgeBfsFromZero(adj) {\n' +
      '  if (adj.length === 0) return null;\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  const parent = new Array(adj.length).fill(-1);\n' +
      '  seen[0] = true;\n' +
      '  const queue = [0];\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const node = queue[head];\n' +
      '    head += 1;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const next = edge[1];\n' +
      '      if (!seen[next]) {\n' +
      '        seen[next] = true;\n' +
      '        parent[next] = node;\n' +
      '        queue.push(next);\n' +
      '        continue;\n' +
      '      }\n' +
      '      if (next !== parent[node]) return node + "," + next;\n' +
      '    }\n' +
      '  }\n' +
      '  return null;\n' +
      '}',
    modify:
      "The graph is a multigraph where repeated edges are legal and a pair of parallel edges must not count as a cycle. What does the walk have to store per node instead of a parent id?",
  },
  {
    step: 15,
    name: "Cycle Detection in Undirected Graph (DFS)",
    difficulty: "Medium",
    topicSlug: "graph-traversal",
    stem: "Detect an undirected cycle with a stack instead of a queue, and show the two ways the parent discount goes wrong.",
    brief:
      "Input: the same adjacency list contract as the breadth-first row - undirected, possibly disconnected, possibly self-looping. Output: a boolean, and the tree edges a depth-first walk chose. Say what changes relative to the queue version.",
    concepts: [
      "dsa-g15a-parent-edge-cycle-check",
      "dsa-g15a-stack-entry-carries-state",
      "dsa-g15a-component-loop",
      "dsa-stack-order-decides-visit-order",
      "dsa-call-stack-cost",
    ],
    shortAnswer:
      "Push pairs of [node, parent] onto the stack and mark on push; a visited neighbour that is not this entry's parent is a back edge. The parent belongs to the entry, never to a variable outside it.",
    idealAnswer:
      "Depth-first cycle detection asks the same question as the queue version - is there an edge that is not part of the walk's own tree - and answers it in a different order, which is worth being explicit about rather than presenting as a style choice. Both walks build a spanning forest, and in an undirected simple graph a cycle exists if and only if some edge joins two nodes already in that forest, so both return the same verdict on the same graph. What differs is the witness: a queue reports the closing edge between two nodes on the same or adjacent levels, while a stack reports it while standing deep inside one branch, so the tree edges they choose differ and the pair they name differs - on the triangle with a tail the queue names 1,2 and the stack names 2,0. Two DFS-specific failures are worth carrying by name. The first is the missing discount: without the parent in the test, the edge back to the node you came from is reported as a cycle and the function answers yes on every tree, which is the same failure the queue version has but is written more often here because the recursive signature is where people drop the parameter. The second is the state that recursion supplied for free: on a hand-built stack the parent has to travel with the entry, because a single parent variable is one slot for the whole walk and mixes branches. Marking on push is not optional either - it is what stops a node from entering the stack twice with two different parents, which would make the discount meaningless.",
    walkthrough:
      "Five nodes as the tree 0-1, 1-2, 2-3 plus the branch 1-4, and then a second graph that is the same tree with the edge 2-0 added. Run the honest check on the tree: node 0 opens, 1 is pushed with parent 0, 4 and 2 are pushed with parent 1, and when 2 is popped its only new neighbour is 3 while 1 is discounted as the parent - the walk finishes with no conflict and answers false. Run the version that omits the parent test on the same tree and it pops 2, sees 1 already visited, and answers true on a graph that is a tree by construction. Now the second graph: 0-1, 1-2, 2-0, 2-3, 3-4. The stack walk marks both children of 0 in one expansion, so 1 and 2 are pushed with parent 0 and the tree it records is 0->1, 0->2, 2->3, 3->4 - the edge between 1 and 2 is not in that tree at all. Because the last node pushed is the first popped, node 2 is expanded before node 1, and 2 finds 1 already visited while its own parent is 0, so the back edge 2 to 1 is what surfaces and the answer is true; the queue version reaches the same closing edge from the other endpoint, because it expands 1 first and reports that edge as 1,2. Take the disconnected case, 0-1 alone and 2-3, 3-4, 4-2: the walk from 0 drains two nodes and reports false, and only the outer restart at node 2 finds the triangle - the same restart the queue version needs, in the same place.",
    commonMistake:
      "Dropping the parent from the visited test, or keeping a single parent variable outside the stack entry to save a second array slot.",
    whyWrong:
      "Without the discount the five-node tree above answers true, because the tree edge 1-2 is present in both adjacency lists and node 2 always sees 1 as visited - the function has become a test for has-more-than-one-node. The shared parent variable is the version that looks careful and is not: the stack holds several branches at once, so the variable names whichever node was pushed last rather than the parent of the node now being popped. On the four-node path 1-0-2-3 the pop of 0 queues 1 and 2, the pop of 2 queues 3 and leaves the variable reading 2, and the pop of 1 then meets its visited neighbour 0 while the parent says 2, so it calls the tree edge 0-1 a back edge and reports a cycle in a path - which is why the shipped stack entry is a pair. The recursive form cannot make that mistake, which is exactly why the explicit stack has to carry the pair.",
    followUps:
      [
        "Both walks return the same verdict on a simple undirected graph. Give the input where they name a different closing edge and say why the order differs.",
        "Convert the check to report every cycle-closing edge rather than the first. Why is the number of such edges E minus V plus components, and where does the forest you built prove it?",
        "Your stack entries now carry a parent. Add a colour and a depth so the same walk answers bipartiteness - which of the three can be a shared array and which cannot?",
        "The graph is 10 million nodes and a path. Write the recursive version and say what dies first, the algorithm or the process.",
      ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function hasCycleDfs(adj) {\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  for (let start = 0; start < adj.length; start += 1) {\n' +
      '    if (seen[start]) continue;\n' +
      '    seen[start] = true;\n' +
      '    const stack = [[start, -1]];\n' +
      '    while (stack.length > 0) {\n' +
      '      const entry = stack.pop();\n' +
      '      const node = entry[0];\n' +
      '      const parent = entry[1];\n' +
      '      for (const edge of adj[node]) {\n' +
      '        const next = edge[1];\n' +
      '        if (!seen[next]) {\n' +
      '          seen[next] = true;\n' +
      '          stack.push([next, node]);\n' +
      '        } else if (next !== parent) {\n' +
      '          return true;\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return false;\n' +
      '}\n' +
      '\n' +
      'function hasCycleDfsNoParent(adj) {\n' +
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
      '}\n' +
      '\n' +
      'function hasCycleDfsFromZero(adj) {\n' +
      '  if (adj.length === 0) return false;\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  seen[0] = true;\n' +
      '  const stack = [[0, -1]];\n' +
      '  while (stack.length > 0) {\n' +
      '    const entry = stack.pop();\n' +
      '    const node = entry[0];\n' +
      '    const parent = entry[1];\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const next = edge[1];\n' +
      '      if (!seen[next]) {\n' +
      '        seen[next] = true;\n' +
      '        stack.push([next, node]);\n' +
      '      } else if (next !== parent) {\n' +
      '        return true;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return false;\n' +
      '}\n' +
      '\n' +
      'function dfsTreeEdges(adj, start) {\n' +
      '  if (adj.length === 0 || start < 0 || start >= adj.length) return [];\n' +
      '  const seen = new Array(adj.length).fill(false);\n' +
      '  const tree = [];\n' +
      '  seen[start] = true;\n' +
      '  const stack = [[start, -1]];\n' +
      '  while (stack.length > 0) {\n' +
      '    const entry = stack.pop();\n' +
      '    const node = entry[0];\n' +
      '    const parent = entry[1];\n' +
      '    if (parent !== -1) tree.push(parent + "->" + node);\n' +
      '    for (let i = adj[node].length - 1; i >= 0; i -= 1) {\n' +
      '      const next = adj[node][i][1];\n' +
      '      if (seen[next]) continue;\n' +
      '      seen[next] = true;\n' +
      '      stack.push([next, node]);\n' +
      '    }\n' +
      '  }\n' +
      '  tree.sort();\n' +
      '  return tree;\n' +
      '}',
    modify:
      "The walk must return the cycle itself as an ordered list of nodes. Which map has to be kept per component, and why is the depth-first parent chain the easier one to walk back?",
  },
  {
    step: 15,
    name: "0/1 Matrix (Distance of nearest cell having 1)",
    difficulty: "Medium",
    topicSlug: "graph-traversal",
    stem: "Write into every cell of a binary grid the number of steps to the closest cell holding 1, in one pass rather than one search per cell.",
    brief:
      "Input: a grid of 0 and 1 cells, with no promise that a 1 exists. Output: a grid of the same shape where a 1 cell reads 0, every 0 cell reads its 4-neighbour distance to the nearest 1, and -1 is used when the grid holds no 1 at all. One traversal.",
    concepts: [
      "dsa-g15a-multi-source-bfs",
      "dsa-g15a-bfs-first-touch-is-shortest",
      "dsa-g15a-grid-cell-as-node",
      "dsa-visited-set-distance",
      "dsa-coordinate-loops",
    ],
    shortAnswer:
      "Queue every 1 cell at distance zero, then breadth-first outward: the distance written on first touch is the distance to the nearest 1, because all sources started in the same band.",
    idealAnswer:
      "The naive reading is one breadth-first search per zero cell, which is correct and costs O((rows times cols) squared) - a megapixel of cells doing a megapixel of walks. Seeding the queue with every source at once is the same walk done one time, and the argument for why it is exact is the argument for breadth-first search with a twist: the frontier is the union of all the waves, each one edge wide, so a cell is first touched by whichever source reaches it soonest and the value written is already final. The distance array doubles as the visited array, which is why -1 is the right initialiser and 0 is not - a fresh 0 would look like an already-measured source. The second accepted answer is the two-sweep dynamic program: forward pass relaxing from the top and left, backward pass from the bottom and right, which is the same distance transform without a queue and the one to cite when the interviewer asks for O(1) extra memory beyond the output. Both are exact here and both disagree on a grid with obstacles, where the shortest legal route is longer than the number of steps in a straight line - the case where only the walk survives. Cost is one pass per cell with four neighbour tests each.",
    walkthrough:
      "The grid rows 0,0,0 then 0,1,0 then 0,0,0 seeds one source at (1,1), so the distance array starts -1 with a 0 punched in the middle. Band one touches (0,1),(1,0),(1,2),(2,1) and writes 1; band two touches the four corners from those cells and writes 2, giving 2,1,2 | 1,0,1 | 2,1,2. Now the grid rows 0,1,0,0,0 then 1,1,1,0,0 then 0,0,1,0,0 then 0,0,0,0,1 with six sources seeded at once: the finished array reads 1,0,1,2,3 | 0,0,0,1,2 | 1,1,0,1,1 | 2,2,1,1,0. Cell (0,0) shows the race the argument has to win - it is one edge from the source at (0,1) and one edge from the source at (1,0), so two wavefronts reach it in the same band, the first one to pop writes 1 and the other finds the cell already numbered and skips it. Cell (0,4) shows the same tie spread over three bands: it is three edges from (0,1), from (1,2) and from (3,4), so its 3 is written once, by whichever of those three waves arrives first, and no later band ever revises it. That is the whole claim that first touch is shortest - a source queued at zero cannot be beaten to a cell by a wave that has more edges to cross. Run the two-sweep version on the same grid and it prints the identical array, because a Manhattan distance on an unobstructed grid is the same number the wavefront measures. The all-zero grid is the contract case: no source is ever seeded, nothing is written, and every cell keeps -1.",
    commonMistake:
      "Running a fresh search from every zero cell, or initialising the distance array with 0 and using it as the visited test.",
    whyWrong:
      "Per-cell search is O(n squared m squared) on a grid the size of a screen and repeats work the same wave already did; on the 3 by 3 example it runs one search per zero cell and returns the right nine numbers for nine times the price. The zero initialiser is the silent one: with distances starting at 0 the test distance[next] !== 0 fails on the cells that have not been measured and passes on the sources, so the wave stops after the first band, and it is worse when a source is involved because a legitimate distance of 0 is indistinguishable from an unmeasured cell - the grid comes back with 0s where 2s belonged.",
    followUps:
      [
        "The two-sweep version never touches a queue. What does it assume about the grid that the wavefront does not, and give the input where they disagree?",
        "Some cells are walls. Which of the two answers still works, and what does the wall grid do to the word nearest?",
        "The sources arrive one at a time and the array must stay current. Which structure makes an insertion cheap, and which one has to be rebuilt?",
        "Report the farthest cell from any source as well. Which single value from the walk gives it, and why is it the last distance written?",
      ],
    solution:
      showGrid + '\n' +
      '\n' +
      dirs4 + '\n' +
      '\n' +
      'function seedCount(matrix) {\n' +
      '  let seeds = 0;\n' +
      '  for (const row of matrix) for (const cell of row) if (cell === 1) seeds += 1;\n' +
      '  return seeds;\n' +
      '}\n' +
      '\n' +
      'function nearestOneDistance(matrix) {\n' +
      '  if (matrix.length === 0 || matrix[0].length === 0) return [];\n' +
      '  const rows = matrix.length;\n' +
      '  const cols = matrix[0].length;\n' +
      '  const dist = [];\n' +
      '  for (let r = 0; r < rows; r += 1) dist.push(new Array(cols).fill(-1));\n' +
      '  const queue = [];\n' +
      '  for (let r = 0; r < rows; r += 1) {\n' +
      '    for (let c = 0; c < cols; c += 1) {\n' +
      '      if (matrix[r][c] === 1) {\n' +
      '        dist[r][c] = 0;\n' +
      '        queue.push([r, c]);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const cell = queue[head];\n' +
      '    head += 1;\n' +
      '    for (const dir of DIRS4) {\n' +
      '      const nr = cell[0] + dir[0];\n' +
      '      const nc = cell[1] + dir[1];\n' +
      '      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n' +
      '      if (dist[nr][nc] !== -1) continue;\n' +
      '      dist[nr][nc] = dist[cell[0]][cell[1]] + 1;\n' +
      '      queue.push([nr, nc]);\n' +
      '    }\n' +
      '  }\n' +
      '  return dist;\n' +
      '}\n' +
      '\n' +
      'function twoSweepDistance(matrix) {\n' +
      '  if (matrix.length === 0 || matrix[0].length === 0) return [];\n' +
      '  const rows = matrix.length;\n' +
      '  const cols = matrix[0].length;\n' +
      '  const big = rows + cols;\n' +
      '  const dist = [];\n' +
      '  for (let r = 0; r < rows; r += 1) {\n' +
      '    const line = [];\n' +
      '    for (let c = 0; c < cols; c += 1) line.push(matrix[r][c] === 1 ? 0 : big);\n' +
      '    dist.push(line);\n' +
      '  }\n' +
      '  for (let r = 0; r < rows; r += 1) {\n' +
      '    for (let c = 0; c < cols; c += 1) {\n' +
      '      if (r > 0) dist[r][c] = Math.min(dist[r][c], dist[r - 1][c] + 1);\n' +
      '      if (c > 0) dist[r][c] = Math.min(dist[r][c], dist[r][c - 1] + 1);\n' +
      '    }\n' +
      '  }\n' +
      '  for (let r = rows - 1; r >= 0; r -= 1) {\n' +
      '    for (let c = cols - 1; c >= 0; c -= 1) {\n' +
      '      if (r + 1 < rows) dist[r][c] = Math.min(dist[r][c], dist[r + 1][c] + 1);\n' +
      '      if (c + 1 < cols) dist[r][c] = Math.min(dist[r][c], dist[r][c + 1] + 1);\n' +
      '    }\n' +
      '  }\n' +
      '  let unreachable = false;\n' +
      '  for (const row of dist) for (const value of row) if (value >= big) unreachable = true;\n' +
      '  if (unreachable) {\n' +
      '    for (let r = 0; r < rows; r += 1) {\n' +
      '      for (let c = 0; c < cols; c += 1) if (matrix[r][c] !== 1) dist[r][c] = -1;\n' +
      '    }\n' +
      '  }\n' +
      '  return dist;\n' +
      '}',
    modify:
      "Cells holding 2 are walls that no route may cross. Which of the two answers survives that change, and what does the other one start reporting?",
  },
  {
    step: 15,
    name: "Surrounded Regions (Replace O's with X's)",
    difficulty: "Medium",
    topicSlug: "graph-traversal",
    stem: "Capture every O that the border cannot reach by turning it into X, while leaving the O's that touch the edge alone.",
    brief:
      "Input: a board of characters, only X and O. Output: the same board with every O that has no 4-neighbour route to any border cell replaced by X, and the input board left intact unless the contract says otherwise. Solving it per cell is the version to be able to improve on.",
    concepts: [
      "dsa-g15a-border-seeded-reachability",
      "dsa-g15a-multi-source-bfs",
      "dsa-g15a-grid-cell-as-node",
      "dsa-g15a-component-loop",
      "dsa-reachability-set",
    ],
    shortAnswer:
      "Seed the walk with every O sitting on the border, mark everything it reaches as safe, then flip the O cells that were never reached. The complement of the reachable set is the answer.",
    idealAnswer:
      "The definition of surrounded is a negative - no route to the outside - and negatives are expensive to test per cell but cheap to enumerate from the other side. Seeding the walk with every border O and taking the complement turns the question into a single reachability pass: whatever the wave cannot reach is by construction cut off, and whatever it reaches survives even if it sits in the middle of the board. That is the whole trick and the reason the row is asked. Cost is O(rows times cols) time with a byte per cell for the safe array, against the O((rows times cols) squared) of a flood per cell that still returns the right answer. Two details decide whether the implementation is correct rather than close. The first is that the seed loop must cover all four edges and not just the outer ring of one corner, and it must not deduplicate a corner twice - the admit test handles that by checking the safe flag before pushing. The second is that the flip reads the original board, not the mutated one, because once an O has become an X the walk that was going to reach it through that cell has lost the edge it needed - that is the failure mode of the in-place version, and it also means a single pass over the cells at the end is what writes the answer. Degenerate boards are the contract check: a board with one row has no interior, so nothing is ever captured, and an all-O board comes back unchanged.",
    walkthrough:
      "Take the four by four board with rows X,X,X,X then X,O,O,X then X,X,O,X then X,O,X,X. Seed the border: the only O on any edge is (3,1), so the wave starts there, finds no O neighbour - (2,1) is X and (3,0) and (3,2) are X - and closes with one safe cell. The flip pass then walks the interior and turns (1,1), (1,2) and (2,2) into X, because none of the three was reached, giving X,X,X,X | X,X,X,X | X,X,X,X | X,O,X,X with exactly three cells captured. The point of the seed is the cell that fools a local test: (2,2) is surrounded by X on three sides and an O above, so an inside-out reading calls it captured and is right here, but on the board X,X,X then X,O,X then X,O,X the same reading captures both interior O cells while the wave from (2,1) on the bottom edge climbs through (1,1) and saves both. Now the three by three board of all O cells: every cell is on a border, so the seed takes all of them, nothing is flipped, and the board returns unchanged - which the per-cell version also gets, but only after nine floods. The 1 by 3 board O,O,O has rows minus one equal to zero, so the admit loop marks all three and captures nothing.",
    commonMistake:
      "Testing each O for X's on all four sides and capturing it, or starting the walk from the interior O cells instead of the border ones.",
    whyWrong:
      "The four-neighbour test answers is-this-cell-enclosed rather than is-this-cell-cut-off-from-the-outside, and the two differ on a region of any size: on the board X,X,X then X,O,X then X,O,X the centre O at (1,1) has O below it, so it is not enclosed at all and the region escapes through (2,1) on the border - but a version that looks only at the immediate ring flips it anyway. The interior-seeded version is the same mistake wearing BFS clothing: a flood from (1,1) in the four by four example reaches (1,2) and (2,2) and reports the whole region as reachable, because it never asked whether the region touches the edge, only whether it hangs together.",
    followUps:
      [
        "You are told the board must be mutated in place. What does the walk write into a safe cell so that the final pass can still tell safe O from original X?",
        "The 8-neighbour rule applies instead of the 4-neighbour rule. Which board above changes its answer, and what does the new answer become?",
        "Explain why the per-cell flood is O((rows times cols) squared) and which single array turns it into one pass.",
        "The board is 10 thousand by 10 thousand and recursion is the natural way to write this. What dies first, and how deep was the walk on the all-O board?",
      ],
    solution:
      showGrid + '\n' +
      '\n' +
      copyGrid + '\n' +
      '\n' +
      dirs4 + '\n' +
      '\n' +
      'function captureBoard(board) {\n' +
      '  const out = copyGrid(board);\n' +
      '  if (board.length === 0 || board[0].length === 0) return out;\n' +
      '  const rows = board.length;\n' +
      '  const cols = board[0].length;\n' +
      '  const safe = [];\n' +
      '  for (let r = 0; r < rows; r += 1) safe.push(new Array(cols).fill(false));\n' +
      '  const queue = [];\n' +
      '  const admit = (r, c) => {\n' +
      '    if (r < 0 || r >= rows || c < 0 || c >= cols) return;\n' +
      '    if (safe[r][c] || board[r][c] !== "O") return;\n' +
      '    safe[r][c] = true;\n' +
      '    queue.push([r, c]);\n' +
      '  };\n' +
      '  for (let c = 0; c < cols; c += 1) {\n' +
      '    admit(0, c);\n' +
      '    admit(rows - 1, c);\n' +
      '  }\n' +
      '  for (let r = 0; r < rows; r += 1) {\n' +
      '    admit(r, 0);\n' +
      '    admit(r, cols - 1);\n' +
      '  }\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const cell = queue[head];\n' +
      '    head += 1;\n' +
      '    for (const dir of DIRS4) admit(cell[0] + dir[0], cell[1] + dir[1]);\n' +
      '  }\n' +
      '  for (let r = 0; r < rows; r += 1) {\n' +
      '    for (let c = 0; c < cols; c += 1) {\n' +
      '      if (board[r][c] === "O" && !safe[r][c]) out[r][c] = "X";\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function countCaptured(board) {\n' +
      '  const out = captureBoard(board);\n' +
      '  let flipped = 0;\n' +
      '  for (let r = 0; r < board.length; r += 1) {\n' +
      '    for (let c = 0; c < board[r].length; c += 1) {\n' +
      '      if (board[r][c] === "O" && out[r][c] === "X") flipped += 1;\n' +
      '    }\n' +
      '  }\n' +
      '  return flipped;\n' +
      '}\n' +
      '\n' +
      'function capturePerCellFlood(board) {\n' +
      '  const out = copyGrid(board);\n' +
      '  if (board.length === 0 || board[0].length === 0) return out;\n' +
      '  const rows = board.length;\n' +
      '  const cols = board[0].length;\n' +
      '  for (let r = 0; r < rows; r += 1) {\n' +
      '    for (let c = 0; c < cols; c += 1) {\n' +
      '      if (board[r][c] !== "O") continue;\n' +
      '      const seen = [];\n' +
      '      for (let i = 0; i < rows; i += 1) seen.push(new Array(cols).fill(false));\n' +
      '      seen[r][c] = true;\n' +
      '      const queue = [[r, c]];\n' +
      '      let head = 0;\n' +
      '      let escapes = false;\n' +
      '      while (head < queue.length && !escapes) {\n' +
      '        const cell = queue[head];\n' +
      '        head += 1;\n' +
      '        if (cell[0] === 0 || cell[0] === rows - 1 || cell[1] === 0 || cell[1] === cols - 1) {\n' +
      '          escapes = true;\n' +
      '          break;\n' +
      '        }\n' +
      '        for (const dir of DIRS4) {\n' +
      '          const nr = cell[0] + dir[0];\n' +
      '          const nc = cell[1] + dir[1];\n' +
      '          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n' +
      '          if (seen[nr][nc] || board[nr][nc] !== "O") continue;\n' +
      '          seen[nr][nc] = true;\n' +
      '          queue.push([nr, nc]);\n' +
      '        }\n' +
      '      }\n' +
      '      if (escapes) continue;\n' +
      '      for (let i = 0; i < rows; i += 1) for (let j = 0; j < cols; j += 1) if (seen[i][j]) out[i][j] = "X";\n' +
      '    }\n' +
      '  }\n' +
      '  return out;\n' +
      '}',
    modify:
      "The board has to be mutated in place and a second call must be a no-op. Which marker replaces the safe array, and what does the final pass convert it back to?",
  },
  {
    step: 15,
    name: "Number of Enclaves",
    difficulty: "Medium",
    topicSlug: "graph-traversal",
    stem: "Count the land cells that can never walk off the grid, and say why the count is a subtraction rather than a search.",
    brief:
      "Input: a grid of 0 sea and 1 land. Output: the number of land cells from which no sequence of 4-neighbour moves reaches the border. Movement is only onto land; sea cells are not counted and are not routes.",
    concepts: [
      "dsa-g15a-border-seeded-reachability",
      "dsa-g15a-grid-cell-as-node",
      "dsa-g15a-mark-on-enqueue",
      "dsa-count-then-overwrite",
      "dsa-complexity-counting",
    ],
    shortAnswer:
      "Flood the land that touches the border, count what that flood claimed, and subtract it from the total land. The remainder is the enclaves.",
    idealAnswer:
      "This is the surrounded-regions question with the answer expressed as a number instead of a board, and the reduction is the interesting part: an enclave is a land cell that is not border-reachable, so counting land cells and subtracting the border-connected ones gives it in one pass with one queue, while testing each land cell for a route off the grid costs a search per cell and gives the same total. The subtraction needs both halves to be honest - the land count must count only 1 cells, and the reached count must count only cells the flood popped, so the two numbers are over the same universe. Reading the definition literally is where the row fails most often: an enclave is a cell with no path to the edge, not a cell that is not on the edge, so a land cell one step inside that has a land corridor to the border is not an enclave even though it never touches the outside itself. The walk is again multi-source with all border land cells seeded at once, and the memory is the seen array; the whole thing is O(rows times cols) with a queue bounded by the cell count. A grid with no land answers 0 and a single row answers 0 for the sharp reason that every cell in it is on the border.",
    walkthrough:
      "The four by four grid with rows 0,0,0,0 then 0,1,1,0 then 0,1,1,0 then 0,0,0,0 holds four land cells and none of them sits on row 0, row 3, column 0 or column 3, so the seed loop admits nothing, the flood pops nothing, and the answer is 4 minus 0. Widen it to the five by four grid 0,0,0,0,0 then 0,1,1,0,0 then 0,1,1,1,0 then 0,0,0,0,0: land is five cells, the extra one at (2,3) is still one column short of the border, so the seed still admits nothing and the answer is still 5. Now open a corridor - the same grid with a sixth 1 added at (2,4), the last column - and the seed admits that cell, the wave climbs through (2,3) to (2,2) and from there to (1,2), (1,1) and (2,1), so reached equals land equals six and the answer collapses to 0. Move that 1 from (2,3) to (2,4) instead of adding it and the corridor breaks: land is still five, only the corner cell at (2,4) is reachable, and the answer is 4. The centre cell of the three by three grid 0,0,0 then 0,1,0 then 0,0,0 is the minimum example: one land cell, no border land, answer 1. The ring grid 1,0,1 then 1,1,1 then 1,0,1 has seven land cells, and the middle cell (1,1) is land connected to (1,0) and (1,2), both border, so reached is 7 and the answer is 0 - not 1, which is what a not-on-the-edge reading returns for the same cell.",
    commonMistake:
      "Counting land cells that are not on the border, or subtracting the count of visited cells from the total cell count instead of from the land count.",
    whyWrong:
      "The not-on-the-border reading answers a different question, and the ring grid above is the counterexample: (1,1) is interior and border-connected through (1,0), so the answer is 0 enclaves out of seven land cells while the test returns 1. The wrong subtrahend is the arithmetic version of the same confusion - on the 2 by 2 all-land grid the total is 4 cells and the flood reaches all 4, so 4 minus 4 is 0 and looks right, but on a grid with sea cells in the middle you would be subtracting reachable land from a population that includes sea, and every sea cell inside an enclave region inflates the answer by one.",
    followUps:
      [
        "Give the version that counts enclaves without a seen array by marking reached land as 0 in the caller grid. What does the second pass then count?",
        "Move to 8-connectivity for the escape rule. Which grid above changes its answer and what does it become?",
        "Report the number of enclave regions as well as cells. Which part of the walk already knows that and which part has to be added?",
        "The grid is a map and the query is asked repeatedly with one cell flipped at a time. What would you keep between queries, and what does an update cost?",
      ],
    solution:
      dirs4 + '\n' +
      '\n' +
      'function countLand(grid) {\n' +
      '  let land = 0;\n' +
      '  for (const row of grid) for (const cell of row) if (cell === 1) land += 1;\n' +
      '  return land;\n' +
      '}\n' +
      '\n' +
      'function borderConnectedLand(grid) {\n' +
      '  if (grid.length === 0 || grid[0].length === 0) return 0;\n' +
      '  const rows = grid.length;\n' +
      '  const cols = grid[0].length;\n' +
      '  const seen = [];\n' +
      '  for (let r = 0; r < rows; r += 1) seen.push(new Array(cols).fill(false));\n' +
      '  const queue = [];\n' +
      '  const admit = (r, c) => {\n' +
      '    if (r < 0 || r >= rows || c < 0 || c >= cols) return;\n' +
      '    if (seen[r][c] || grid[r][c] !== 1) return;\n' +
      '    seen[r][c] = true;\n' +
      '    queue.push([r, c]);\n' +
      '  };\n' +
      '  for (let c = 0; c < cols; c += 1) {\n' +
      '    admit(0, c);\n' +
      '    admit(rows - 1, c);\n' +
      '  }\n' +
      '  for (let r = 0; r < rows; r += 1) {\n' +
      '    admit(r, 0);\n' +
      '    admit(r, cols - 1);\n' +
      '  }\n' +
      '  let reached = 0;\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const cell = queue[head];\n' +
      '    head += 1;\n' +
      '    reached += 1;\n' +
      '    for (const dir of DIRS4) admit(cell[0] + dir[0], cell[1] + dir[1]);\n' +
      '  }\n' +
      '  return reached;\n' +
      '}\n' +
      '\n' +
      'function countEnclaves(grid) {\n' +
      '  return countLand(grid) - borderConnectedLand(grid);\n' +
      '}',
    modify:
      "Sea cells may be crossed to escape but only land cells are counted. Which line changes, and what does the answer become on the ring grid 1,0,1 then 1,1,1 then 1,0,1?",
  },
  {
    step: 15,
    name: "Word Ladder I",
    difficulty: "Hard",
    topicSlug: "graph-traversal",
    stem: "Return the number of words in the shortest transformation chain between two words, where each step changes exactly one letter.",
    brief:
      "Input: a begin word, an end word and a dictionary. Output: the length in words of the shortest chain from begin to end where consecutive words are dictionary members one edit apart, or 0 when no chain exists. The begin word is not promised to be in the dictionary.",
    concepts: [
      "dsa-g15a-wildcard-bucket-neighbours",
      "dsa-g15a-bfs-first-touch-is-shortest",
      "dsa-g15a-mark-on-enqueue",
      "dsa-hash-frequency",
      "dsa-complexity-counting",
    ],
    shortAnswer:
      "Breadth-first over the implicit word graph, with the neighbours of a word read from a hash map of patterns that blank one position; the depth the end word is first touched at is the answer.",
    idealAnswer:
      "The graph here is not given: its nodes are the dictionary words and its edges are the one-letter relation, and the whole difficulty is refusing to build it. Comparing every pair costs O(n squared times L) and a dictionary of a hundred thousand five-letter words is twenty-five billion character tests before the walk even starts. Generating the neighbours of a word instead costs O(26 times L) lookups per word - blank one position, look the pattern up in a map built once at O(n times L) - so the walk visits each word at most once and the whole answer is O(n times L) time with O(n times L) for the buckets. The depth is the number of words in the chain, so the begin word sits at depth 1 and a direct single-edit jump returns 2; that off-by-one is the contract, and a row that counts edges returns one less than the judge expects. Two more contract facts are worth stating before coding: the end word must be in the dictionary or the answer is 0 whatever the rest of the graph says, and the begin word may appear in the dictionary, which the map of depths handles for free by having already recorded it. Marking by depth on first touch is what makes the walk linear - a word reached twice is reached later, so its distance is already the shorter one.",
    walkthrough:
      "Begin hit, end cog, dictionary hot, dot, dog, lot, log, cog. The bucket pass writes three patterns per word, so the six words land in buckets as follows: *og holds dog, log and cog, *ot holds hot, dot and lot, do* holds dot and dog, and d*g holds dog alone, because changing the middle letter of dog gives dig, not dot. Start the walk at hit with depth 1: its patterns *it, h*t and hi* gather hot under h*t, so hot enters at depth 2. Depth 3 comes from hot's patterns and yields dot and lot. Depth 4 from dot and lot yields dog and log, and depth 5 from dog yields cog - the chain hit, hot, dot, dog, cog is five words and the function returns 5, having enqueued each of the six dictionary words at most once. Now the two answers that are 0 for different reasons: with dictionary hot, dog only, the two words differ in two positions so the buckets of hot share no pattern with dog and the queue empties at 0; with end word cog removed from the dictionary entirely the guard returns 0 before the walk starts, which is the contract most candidates skip and most judges test. A dictionary holding beginWord itself still returns 5, because hit is already recorded at depth 1 and never re-enqueued, and the one-letter case: begin a, end c, dictionary a, b, c - both single-letter words share the pattern * so the answer is 2, one edge.",
    commonMistake:
      "Building the word graph by comparing every pair of dictionary entries, or returning the number of edges instead of the number of words.",
    whyWrong:
      "The pairwise build is correct and dies at scale: on a dictionary of 100 thousand four-letter words it runs 5 billion pair comparisons and materialises up to 20 billion edges before the first pop, where the pattern buckets cost 400 thousand keys. The edge count off-by-one is a wrong answer on every test, not a slower one: hit to cog is reported as 4 where the contract says 5, and a direct single-edit pair is reported as 1 where it should be 2 - which also breaks the no-path case, because a returned 1 is indistinguishable from a chain that begins at the target.",
    followUps:
      [
        "Two buckets can be visited in either direction. What does a search from both ends save, and where exactly does it stop being a constant factor?",
        "The dictionary has 10 thousand words of length 3 and 10 thousand of length 4. Which pattern keys are shared, and what must the guard on length reject?",
        "Give the version that also returns the chain itself. Which array makes the reconstruction free, and why is it the same array that proves the distance?",
        "Duplicate dictionary entries and a begin word equal to the end word: what should each return, and what does your code actually return?",
      ],
    solution:
      'function patternBuckets(words) {\n' +
      '  const buckets = new Map();\n' +
      '  for (const word of words) {\n' +
      '    for (let i = 0; i < word.length; i += 1) {\n' +
      '      const key = word.slice(0, i) + "*" + word.slice(i + 1);\n' +
      '      if (!buckets.has(key)) buckets.set(key, []);\n' +
      '      buckets.get(key).push(word);\n' +
      '    }\n' +
      '  }\n' +
      '  return buckets;\n' +
      '}\n' +
      '\n' +
      'function bucketTotal(buckets) {\n' +
      '  let total = 0;\n' +
      '  for (const entry of buckets) total += entry[1].length;\n' +
      '  return total;\n' +
      '}\n' +
      '\n' +
      'function ladderLength(beginWord, endWord, wordList) {\n' +
      '  if (beginWord.length === 0 || beginWord.length !== endWord.length) return 0;\n' +
      '  const dict = new Set(wordList);\n' +
      '  if (!dict.has(endWord)) return 0;\n' +
      '  const buckets = patternBuckets(Array.from(dict));\n' +
      '  const depth = new Map();\n' +
      '  depth.set(beginWord, 1);\n' +
      '  const queue = [beginWord];\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const word = queue[head];\n' +
      '    head += 1;\n' +
      '    const at = depth.get(word);\n' +
      '    if (word === endWord) return at;\n' +
      '    for (let i = 0; i < word.length; i += 1) {\n' +
      '      const key = word.slice(0, i) + "*" + word.slice(i + 1);\n' +
      '      const peers = buckets.get(key) || [];\n' +
      '      for (const peer of peers) {\n' +
      '        if (depth.has(peer)) continue;\n' +
      '        depth.set(peer, at + 1);\n' +
      '        queue.push(peer);\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
    modify:
      "Words may now differ by one insertion or deletion as well as one substitution. Which part of the pattern key changes, and what does the neighbour generation cost per word now?",
  },
  {
    step: 15,
    name: "Word Ladder II",
    difficulty: "Hard",
    topicSlug: "graph-traversal",
    stem: "Return every shortest transformation chain between two words, and explain why a depth-first search over the word graph cannot answer it.",
    brief:
      "Input: the same begin word, end word and dictionary as the length row. Output: all chains of minimum length as lists of words ordered from begin to end, and an empty list when the end word is unreachable. Chains must be shortest, not merely valid.",
    concepts: [
      "dsa-g15a-level-graph-parent-set",
      "dsa-g15a-wildcard-bucket-neighbours",
      "dsa-g15a-bfs-first-touch-is-shortest",
      "dsa-g15a-stack-entry-carries-state",
      "dsa-hash-plus-list-for-order",
    ],
    shortAnswer:
      "One breadth-first pass that records every predecessor whose depth is exactly one less, which stops at the level of the target; then back-track that directed acyclic graph from the end word with an explicit stack.",
    idealAnswer:
      "Enumerating chains is a different problem from measuring them, and the trap is to keep the breadth-first walk but drop the predecessor bookkeeping. A normal BFS keeps one parent per word, which is exactly enough to reconstruct one shortest chain and exactly too little to prove that no other chain of the same length exists. Recording every word that reached a peer at depth plus one turns the same walk into a layer graph - a directed acyclic graph whose edges only go from band d to band d plus one - and the answer is then every path in that graph from the end word back to the begin word, which is what makes the enumeration cost proportional to the number of chains rather than to the size of the dictionary. Two details keep the graph honest. The walk must stop expanding at the level where the end word was found, otherwise deeper predecessors get recorded and the chains come back longer than shortest; and the level check is depth of peer equals depth of word plus one, not merely already seen, otherwise a cross edge inside the same band becomes a parent and the back-track loops. Depth-first search alone cannot do this because it has no notion of band: it walks a route to the target, returns, and walks another, and the second may be longer than the first with no way to know when to stop. The back-track itself is written on a stack, so no row in this step depends on the host recursion depth - the depth here is the ladder length, which is small, but the enumeration is exponential in it, and that is the honest complexity claim.",
    walkthrough:
      "Begin hit, end cog, dictionary hot, dot, dog, lot, log, cog. The breadth-first pass puts hit at band 1, hot at 2, dot and lot at 3, dog and log at 4, cog at 5, and records cog reached from dog - then refuses to expand past band 5. The parent map reads hot under hit, dot and lot each under hot, dog under dot, log under lot, and cog under both dog and log. Back-tracking from cog therefore branches on the first step: cog to dog to dot to hot to hit, and cog to log to lot to hot to hit, which read forwards are hit>hot>dot>dog>cog and hit>hot>lot>log>cog, both five words long, and the walk returns 2 chains. Now the six-ladder case that shows the parent set is not a single parent: begin aaa, end ddd, dictionary aad, ada, daa, add, dad, dda, ddd. Bands are {aaa}, {aad, ada, daa}, {add, dad, dda}, {ddd}, and ddd has three parents - add, dad and dda - while add has two (aad and ada) and dad has two (aad and daa) and dda has two (ada and daa), so the layer graph holds six root-to-leaf routes and the answer lists all six: aaa>aad>add>ddd, aaa>aad>dad>ddd, aaa>ada>add>ddd, aaa>ada>dda>ddd, aaa>daa>dad>ddd and aaa>daa>dda>ddd. Cut the dictionary to hot, dog and the target unreachable, and the depth map never holds the end word, so the function returns the empty list rather than a list of one empty chain.",
    commonMistake:
      "Recording one parent per word and then trying to enumerate all chains by re-walking the graph, or accepting a cross edge inside the same band as a parent edge.",
    whyWrong:
      "The single-parent version returns exactly one shortest chain and calls it all of them; on hit to cog it prints hit>hot>dot>dog>cog and never mentions the second route, because the second parent was discarded when dog was already recorded, and the number of chains is the product of the parent sets along the way, which the six-word aaa to ddd example makes visible as six rather than three. The same-band acceptance is worse because it is a cycle in the structure meant to be acyclic: dot and lot are both in band 3, dog and log in band 4, so an edge recorded between two band-3 words lets the back-track visit dot, then lot, then dot again, and the enumeration either repeats a chain or never terminates.",
    followUps:
      [
        "The answer is exponential in the ladder length. Give the dictionary shape that makes the number of shortest chains grow as a power of two.",
        "Replace the mutation-and-lookup neighbour step with the pattern buckets. Which pass gets cheaper, and does the parent set change?",
        "You only need the count of shortest chains, not the chains. What does the back-track collapse into, and what does that cost?",
        "Sort the chains and say what your order means. Which comparator makes the list stable, and why is sorting them as arrays not enough?",
      ],
    solution:
      'function patternBuckets(words) {\n' +
      '  const buckets = new Map();\n' +
      '  for (const word of words) {\n' +
      '    for (let i = 0; i < word.length; i += 1) {\n' +
      '      const key = word.slice(0, i) + "*" + word.slice(i + 1);\n' +
      '      if (!buckets.has(key)) buckets.set(key, []);\n' +
      '      buckets.get(key).push(word);\n' +
      '    }\n' +
      '  }\n' +
      '  return buckets;\n' +
      '}\n' +
      '\n' +
      'function findLadders(beginWord, endWord, wordList) {\n' +
      '  const dict = new Set(wordList);\n' +
      '  if (beginWord.length === 0 || beginWord.length !== endWord.length) return [];\n' +
      '  if (!dict.has(endWord)) return [];\n' +
      '  const buckets = patternBuckets(Array.from(dict));\n' +
      '  const depth = new Map();\n' +
      '  const parents = new Map();\n' +
      '  depth.set(beginWord, 1);\n' +
      '  const queue = [beginWord];\n' +
      '  let head = 0;\n' +
      '  let foundDepth = Infinity;\n' +
      '  while (head < queue.length) {\n' +
      '    const word = queue[head];\n' +
      '    head += 1;\n' +
      '    const at = depth.get(word);\n' +
      '    if (at >= foundDepth) continue;\n' +
      '    for (let i = 0; i < word.length; i += 1) {\n' +
      '      const key = word.slice(0, i) + "*" + word.slice(i + 1);\n' +
      '      const peers = buckets.get(key) || [];\n' +
      '      for (const peer of peers) {\n' +
      '        if (depth.has(peer)) {\n' +
      '          if (depth.get(peer) === at + 1) {\n' +
      '            if (!parents.has(peer)) parents.set(peer, []);\n' +
      '            if (parents.get(peer).indexOf(word) === -1) parents.get(peer).push(word);\n' +
      '          }\n' +
      '          continue;\n' +
      '        }\n' +
      '        depth.set(peer, at + 1);\n' +
      '        parents.set(peer, [word]);\n' +
      '        queue.push(peer);\n' +
      '        if (peer === endWord) foundDepth = at + 1;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  if (!depth.has(endWord)) return [];\n' +
      '  const out = [];\n' +
      '  const pending = [[endWord, [endWord]]];\n' +
      '  while (pending.length > 0) {\n' +
      '    const entry = pending.pop();\n' +
      '    const word = entry[0];\n' +
      '    const tail = entry[1];\n' +
      '    if (word === beginWord) {\n' +
      '      out.push(tail.slice().reverse());\n' +
      '      continue;\n' +
      '    }\n' +
      '    const ups = parents.get(word) || [];\n' +
      '    for (const up of ups) pending.push([up, tail.concat([up])]);\n' +
      '  }\n' +
      '  out.sort((a, b) => {\n' +
      '    const left = a.join(">");\n' +
      '    const right = b.join(">");\n' +
      '    if (left === right) return 0;\n' +
      '    return left < right ? -1 : 1;\n' +
      '  });\n' +
      '  return out;\n' +
      '}\n' +
      '\n' +
      'function ladderCount(beginWord, endWord, wordList) {\n' +
      '  return findLadders(beginWord, endWord, wordList).length;\n' +
      '}',
    modify:
      "The caller wants the chains in the order the back-track produced them rather than sorted, and wants each chain as a single string. Which two lines go, and what does the caller lose?",
  },
  {
    step: 15,
    name: "Number of Distinct Islands",
    difficulty: "Medium",
    topicSlug: "graph-traversal",
    stem: "Count the island shapes a grid contains, so that two islands of the same shape in different places count once.",
    brief:
      "Input: a grid of 0 sea and 1 land, 4-connected. Output: the number of distinct island shapes, where a shape is the set of cells up to translation - position does not matter, orientation does. Two identical islands stacked anywhere count as one.",
    concepts: [
      "dsa-g15a-relative-coordinate-canonical-shape",
      "dsa-g15a-grid-cell-as-node",
      "dsa-g15a-component-loop",
      "dsa-hash-plus-list-for-order",
      "dsa-two-way-mapping",
    ],
    shortAnswer:
      "Flood each island, collect its cells, subtract the minimum row and the minimum column from every cell, sort the offsets and join them into a key; the answer is the size of the set of keys.",
    idealAnswer:
      "An island is a set of grid cells, and two islands are the same shape when one is a translation of the other, so the question is really how to name a set of cells without naming where it sits. Normalising by the bounding-box origin does that and is provably translation-invariant: subtracting the minimum row and the minimum column of the component maps every copy of the shape to the same cell set, so a key is just that set sorted and joined, and a Set of keys does the counting. The choice of anchor is where an answer becomes fragile - using the first cell the flood reached is deterministic only because the scan is row-major, so the first cell is always the topmost and then leftmost member, which makes it a valid anchor too; using a random start or a hash of the raw cells would not be. Cost is O(rows times cols) for the floods plus a sort per island bounded by the island's own size, which is at most the cell count. Two contract questions the answer has to state rather than assume: a mirrored or rotated copy is a different shape under pure translation, which is what this row counts, and an island of one cell is a shape that every such island shares, so four single cells anywhere in the grid give a count of 1.",
    walkthrough:
      "The grid rows 1,1,0,1,1 then 1,0,0,1,1 then 0,0,1,0,0. The row-major scan floods three islands. The first is (0,0),(0,1),(1,0); its minimum row and column are both 0, so its key reads 0,0;0,1;1,0. The second is (0,3),(0,4),(1,3),(1,4), a square: subtracting row 0 and column 3 gives 0,0;0,1;1,0;1,1. The third is the lone cell (2,2), which normalises to 0,0. Three keys, three distinct shapes, and the set holds three entries. Now the translation claim, tested directly: the grid rows 1,1,0,0,0 then 1,0,0,1,1 then 0,0,0,1,0 contains the same L tromino twice, once at the top-left and once shifted two columns and one row down. The first key is 0,0;0,1;1,0 and the second comes from cells (1,3),(1,4),(2,3) whose minimum column is 3, giving 0,0;0,1;1,0 as well - one distinct shape, two islands. The mirror is the interesting disagreement: the grid rows 1,1,0,1,0 then 1,0,0,1,1 holds the L and its mirror, whose keys are 0,0;0,1;1,0 and 0,0;1,0;1,1, so the answer is 2 here and would be 1 if the shape were also normalised under rotation.",
    commonMistake:
      "Hashing the raw cell list of each island, or comparing islands by their bounding-box dimensions alone.",
    whyWrong:
      "The raw key makes position part of identity, so the two copies of the L tromino above hash to different strings and the grid that contains one shape twice answers 2 instead of 1 - the number of islands, not the number of shapes. Bounding boxes are the other near-miss: a 2 by 2 box describes both the four-cell square and the three-cell L, so on the first grid above the square and the L would collide into one shape and answer 2 where the truth is 3. The cell set survives both because it carries the hole.",
    followUps:
      [
        "Rotated and mirrored copies must now count as the same shape. How many keys per island, and which transformations generate them?",
        "Your anchor is the first cell the flood reached rather than the bounding-box minimum. Give the island where the two anchors differ and say whether the key still matches its translated copy.",
        "The grid is too large for a Set of strings. What does a rolling hash over the sorted offsets cost you, and what does it risk?",
        "Report the largest island by area and then its shape key. Which pass already has both numbers, and what does combining them cost?",
      ],
    solution:
      dirs4 + '\n' +
      '\n' +
      'function collectIslands(grid) {\n' +
      '  const islands = [];\n' +
      '  if (grid.length === 0 || grid[0].length === 0) return islands;\n' +
      '  const rows = grid.length;\n' +
      '  const cols = grid[0].length;\n' +
      '  const seen = [];\n' +
      '  for (let r = 0; r < rows; r += 1) seen.push(new Array(cols).fill(false));\n' +
      '  for (let r = 0; r < rows; r += 1) {\n' +
      '    for (let c = 0; c < cols; c += 1) {\n' +
      '      if (seen[r][c] || grid[r][c] !== 1) continue;\n' +
      '      seen[r][c] = true;\n' +
      '      const queue = [[r, c]];\n' +
      '      const cells = [];\n' +
      '      let head = 0;\n' +
      '      while (head < queue.length) {\n' +
      '        const cell = queue[head];\n' +
      '        head += 1;\n' +
      '        cells.push([cell[0], cell[1]]);\n' +
      '        for (const dir of DIRS4) {\n' +
      '          const nr = cell[0] + dir[0];\n' +
      '          const nc = cell[1] + dir[1];\n' +
      '          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;\n' +
      '          if (seen[nr][nc] || grid[nr][nc] !== 1) continue;\n' +
      '          seen[nr][nc] = true;\n' +
      '          queue.push([nr, nc]);\n' +
      '        }\n' +
      '      }\n' +
      '      islands.push(cells);\n' +
      '    }\n' +
      '  }\n' +
      '  return islands;\n' +
      '}\n' +
      '\n' +
      'function normalizeShape(cells) {\n' +
      '  let minRow = Infinity;\n' +
      '  let minCol = Infinity;\n' +
      '  for (const cell of cells) {\n' +
      '    if (cell[0] < minRow) minRow = cell[0];\n' +
      '    if (cell[1] < minCol) minCol = cell[1];\n' +
      '  }\n' +
      '  const moved = [];\n' +
      '  for (const cell of cells) moved.push([cell[0] - minRow, cell[1] - minCol]);\n' +
      '  return moved.map((cell) => cell.join(",")).sort().join(";");\n' +
      '}\n' +
      '\n' +
      'function islandShapeKeys(grid) {\n' +
      '  const keys = [];\n' +
      '  for (const island of collectIslands(grid)) keys.push(normalizeShape(island));\n' +
      '  keys.sort();\n' +
      '  return keys;\n' +
      '}\n' +
      '\n' +
      'function countDistinctIslands(grid) {\n' +
      '  return new Set(islandShapeKeys(grid)).size;\n' +
      '}',
    modify:
      "Islands that are translations of each other AND islands that are rotations of each other must now count as the same shape. Where does the second normalisation belong, and how many keys does one island produce?",
  },
  {
    step: 15,
    name: "Bipartite Graph (BFS)",
    difficulty: "Medium",
    topicSlug: "graph-traversal",
    stem: "Decide whether a graph's nodes can be split into two groups with every edge crossing them, and hand back the split itself.",
    brief:
      "Input: an adjacency list over nodes 0..n-1, undirected, possibly disconnected, possibly holding a self-loop. Output: whether the graph is two-colourable and the colour of every node, plus the conflicting edge when it is not. State what the answer means for a graph with an isolated node.",
    concepts: [
      "dsa-g15a-colour-parity-bipartite",
      "dsa-g15a-component-loop",
      "dsa-g15a-bfs-first-touch-is-shortest",
      "dsa-g15a-mark-on-enqueue",
      "dsa-boundary-conditions",
    ],
    shortAnswer:
      "Colour the start node 0 and every neighbour discovered 1 minus the colour of the node being expanded; an edge whose two ends already hold the same colour is the proof the graph is not bipartite.",
    idealAnswer:
      "A graph is bipartite exactly when its nodes split into two sets with every edge crossing them, and exactly when it contains no odd cycle - the two statements are one fact, and the walk is what makes it computational. Writing the depth modulo two onto each node gives a colouring for free, because breadth-first depth counts edges from the start, so consecutive bands alternate; if an edge ever joins two nodes in the same band parity, the two routes from the start plus that edge close a cycle of odd length, and that cycle is the obstruction. Three contract points separate this from a memorised answer. The loop over uncoloured nodes is mandatory, since each component gets its own root colour and a non-bipartite component anywhere poisons the whole graph; an isolated node is trivially colourable, and a graph with no nodes is bipartite because there is no edge to violate the rule. A self-loop fails immediately, because the node is its own neighbour and therefore its own colour. And the colouring is only unique up to a flip per component, which is worth saying out loud when the caller asked for the split rather than the boolean. The cost is O(V + E) with one integer array, and the array is the visited marker, so the walk never re-expands a node.",
    walkthrough:
      "Seven nodes with edges 0-1, 1-2, 2-3, 3-0, 0-4, 4-5: a square with a two-node tail off corner 0. Colour 0 as 0 and expand it: 1, 3 and 4 all become 1 because they are one edge away. Expand 1: its uncoloured neighbour 2 takes colour 0. Expand 3: neighbour 2 is already 0 and 3 is 1, so the closing edge of the square is consistent and no conflict is raised. Expand 4: neighbour 5 takes colour 1 minus 1, which is 0. The colour array reads 0,1,0,1,1,0,-1 - node 5 is the tail end and node 6 was never reached by anything, so it stays uncoloured until the outer loop opens it as its own component with colour 0, which is the honest answer for an isolated node: it belongs to either group. Now the graph that breaks: eight nodes whose second component is the triangle 2-3, 3-4, 4-2 alongside bipartite components 0-1 and 5-6, 6-7. Colouring 0 then 1 is fine, then 2 is coloured 0, then 3 and 4 both become 1 from it, and the pop of 3 meets neighbour 4 already holding 1 while 3 holds 1 too - the conflict is the edge 3,4, and it is the odd cycle showing up as two same-coloured nodes. Restrict that walk to a start at node 0 and the array reads 0,1,-1,-1,-1,-1,-1,-1, because node 0 cannot see the triangle at all, and the version that forgets the outer loop calls the graph bipartite on the strength of a component that is.",
    commonMistake:
      "Colouring only from node 0, or treating the input pairs as 0-indexed when the problem states them as 1-indexed neighbour lists.",
    whyWrong:
      "The single-origin walk is the same blind spot as in every other row here: on the eight-node graph above it never reaches the triangle and returns a colouring full of -1 alongside a verdict of true, which is a confidently wrong answer rather than a missing one. The index shift is a data bug with a real shape: a node list of n entries labelled 1 to n fed straight into a zero-indexed array reads one slot past the end and silently drops node n from the walk, so an odd cycle sitting entirely on the highest-numbered nodes is never examined and the graph is certified bipartite.",
    followUps:
      [
        "The colouring is only defined up to a flip per component. How many distinct valid two-colourings does a graph of k bipartite components have?",
        "Give the version that reports every conflicting edge rather than the first. Why is the number of conflicts not the number of odd cycles?",
        "Your caller wants the smaller of the two groups explicitly. Which array does that need, and what does it cost after the walk?",
        "The graph arrives as a list of friendship pairs for people numbered 1 to n. Where exactly does the shift belong, and what breaks if it belongs in two places?",
      ],
    solution:
      buildAdj + '\n' +
      '\n' +
      showAdj + '\n' +
      '\n' +
      'function bipartition(adj) {\n' +
      '  const color = new Array(adj.length).fill(-1);\n' +
      '  for (let start = 0; start < adj.length; start += 1) {\n' +
      '    if (color[start] !== -1) continue;\n' +
      '    color[start] = 0;\n' +
      '    const queue = [start];\n' +
      '    let head = 0;\n' +
      '    while (head < queue.length) {\n' +
      '      const node = queue[head];\n' +
      '      head += 1;\n' +
      '      for (const edge of adj[node]) {\n' +
      '        const next = edge[1];\n' +
      '        if (color[next] === -1) {\n' +
      '          color[next] = 1 - color[node];\n' +
      '          queue.push(next);\n' +
      '          continue;\n' +
      '        }\n' +
      '        if (color[next] === color[node]) return null;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return color.join("");\n' +
      '}\n' +
      '\n' +
      'function isBipartite(adj) {\n' +
      '  return bipartition(adj) !== null;\n' +
      '}\n' +
      '\n' +
      'function bipartitionFromZero(adj) {\n' +
      '  if (adj.length === 0) return "";\n' +
      '  const color = new Array(adj.length).fill(-1);\n' +
      '  color[0] = 0;\n' +
      '  const queue = [0];\n' +
      '  let head = 0;\n' +
      '  while (head < queue.length) {\n' +
      '    const node = queue[head];\n' +
      '    head += 1;\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const next = edge[1];\n' +
      '      if (color[next] === -1) {\n' +
      '        color[next] = 1 - color[node];\n' +
      '        queue.push(next);\n' +
      '        continue;\n' +
      '      }\n' +
      '      if (color[next] === color[node]) return null;\n' +
      '    }\n' +
      '  }\n' +
      '  return color.join("");\n' +
      '}\n' +
      '\n' +
      'function shiftedAdjacency(n, edges) {\n' +
      '  const zero = [];\n' +
      '  for (const edge of edges) zero.push([edge[0] - 1, edge[1] - 1]);\n' +
      '  return buildAdj(n, zero);\n' +
      '}',
    modify:
      "The graph is promised connected but the caller wants the colouring that puts the start node in group 1 rather than group 0. Which lines change, and what happens to the conflict test?",
  },
  {
    step: 15,
    name: "Bipartite Graph (DFS)",
    difficulty: "Medium",
    topicSlug: "graph-traversal",
    stem: "Two-colour a graph with a stack instead of a queue, and say what the colouring depends on once the walk order changes.",
    brief:
      "Input: the same adjacency-list contract as the queue version - undirected, possibly disconnected, possibly self-looping. Output: whether a two-colouring exists, the colour array it produced, and the order in which colours were written. Name the one thing that must not be shared across stack entries.",
    concepts: [
      "dsa-g15a-colour-parity-bipartite",
      "dsa-g15a-stack-entry-carries-state",
      "dsa-g15a-component-loop",
      "dsa-g15a-mark-on-enqueue",
      "dsa-call-stack-cost",
    ],
    shortAnswer:
      "Same colour array, same rule - a neighbour takes the opposite colour of the node being expanded - but the frontier is a stack, so the bands are explored depth-first and the conflict is found on whichever edge the walk reached first.",
    idealAnswer:
      "The colour of a node in a bipartite graph is not a property of the walk, it is a property of the component: any walk that writes depth modulo two produces the same colouring up to a flip, which is why the breadth-first and depth-first versions of this row print identical arrays on bipartite input and disagree only on which edge they name as the witness. That is the claim to be able to defend, because it means the algorithm is about the invariant - every edge joins opposite colours - and not about the frontier. The depth-first form carries three traps. Colour is state, and the recursion held it in the frame; on a hand-built stack it lives in the shared colour array, which is fine because the array is per node, but a version that also carries a level variable outside the loop mixes bands exactly like the shared parent variable did in cycle detection. The loop over uncoloured starts is still mandatory, since a triangle in the last component is invisible to a walk from node 0. And the walk is iterative on purpose: on a grid-shaped graph the longest path is the cell count, and a recursive colouring of a 1000 by 1000 board is a million frames asking for trouble. Cost stays O(V + E) with one array for colours.",
    walkthrough:
      "Five nodes in the closed chain 0-1, 1-2, 2-3, 3-4, 4-0, an odd cycle of length five, so the adjacency rows read 0:1,4 then 1:0,2 then 2:1,3 then 3:2,4 then 4:0,3. Push node 0 coloured 0; expanding it writes colour 1 onto both 1 and 4 and pushes both, so the stack is [1,4]. Pop 4: its row is 0 then 3 - 0 already holds the opposite colour so nothing fires, and 3 is uncoloured so it is written 0 and pushed. Pop 3: its row is 2 then 4, so 2 is written 1 and 4 is left alone. Pop 2: its row is 1 then 3; 3 holds 0 against the 1 of node 2, which is legal, and 1 already holds 1, the same colour as node 2, so no write happens and the conflict test fires on the edge 2 to 1 - the closing edge of the pentagon, found on the fourth pop with the partial colouring 01101. Run the same graph through the queue version and the witness is a different edge: it colours 1 and 4 in band one and 2 and 3 in band two, so the pair 1 to 2 is legal there, the first same-colour pair it meets is 2 to 3, and its partial colouring reads 01001. Same verdict, different witness and different intermediate colouring - the witness is a property of the pop order, not of the graph, which is exactly what a bipartiteness verdict has to survive: only the yes-or-no is invariant, never the edge that proves it. Now the bipartite check: the six-node cycle 0-1, 1-2, 2-3, 3-4, 4-5, 5-0 writes colours 0,1,0,1,0,1 in some order and returns no conflict from either walk, and the colour array reads 010101 - identical to the queue version, which is the invariance claim stated as arithmetic. The disconnected failure case is eight nodes with 0-1, then the triangle 2-3, 4-2 and 3-4, then 5-6, 6-7: a walk that opens only node 0 colours two nodes, reports no conflict and certifies a graph whose second component is an odd cycle; the stack version reaches the triangle at start 2 and writes 0 to 2, 1 to 3 and 1 to 4, then pops 4 and finds 3 already holding 1.",
    commonMistake:
      "Keeping the current colour or depth in a single variable outside the stack, or concluding that a different visit order can make a bipartite graph look non-bipartite.",
    whyWrong:
      "The shared variable is the same bug as the shared parent in the cycle row: a stack holds several branches at once, so the colour read at pop time belongs to whichever node was coloured last rather than to the node being popped. Take the square 0-1, 1-2, 2-3, 3-0, which is bipartite: the walk colours 1 and 3 with 1 from node 0, pops 3, colours 2 with 0, and the variable now reads 0 - so the next test, neighbour 0 of node 3, an edge between colours 1 and 0, compares against that stale 0 and reports a conflict. The array is correct and the verdict is wrong, which is exactly the failure a per-node colour array cannot have. The second mistake is a false worry worth dismissing out loud: on a connected bipartite component the colour of a node is fixed by the parity of any route to it, so no walk order can flip it, and the two rows here must print the same array on the same bipartite input or one of them is wrong.",
    followUps:
      [
        "Prove the colouring is order-independent on a connected bipartite graph. Where does the argument need the graph to have no odd cycle?",
        "Give the version that writes colour on the way onto the stack and one that writes it on the way off. Which of them can paint a node twice, and what does that do to the conflict test?",
        "Your stack entries now hold a node id only, with colour in the shared array. What extra piece has to come back onto the entry to make post-order work as well?",
        "A grid graph 1000 by 1000, checkerboard. Compare the peak stack depth here with the peak queue width of the breadth-first version on the same graph.",
      ],
    solution:
      buildAdj + '\n' +
      '\n' +
      'function colouringDfs(adj) {\n' +
      '  const color = new Array(adj.length).fill(-1);\n' +
      '  for (let start = 0; start < adj.length; start += 1) {\n' +
      '    if (color[start] !== -1) continue;\n' +
      '    color[start] = 0;\n' +
      '    const stack = [start];\n' +
      '    while (stack.length > 0) {\n' +
      '      const node = stack.pop();\n' +
      '      for (const edge of adj[node]) {\n' +
      '        const next = edge[1];\n' +
      '        if (color[next] === -1) {\n' +
      '          color[next] = 1 - color[node];\n' +
      '          stack.push(next);\n' +
      '        } else if (color[next] === color[node]) {\n' +
      '          return null;\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return color.join("");\n' +
      '}\n' +
      '\n' +
      'function isBipartiteDfs(adj) {\n' +
      '  return colouringDfs(adj) !== null;\n' +
      '}\n' +
      '\n' +
      'function conflictEdgeDfs(adj) {\n' +
      '  const color = new Array(adj.length).fill(-1);\n' +
      '  for (let start = 0; start < adj.length; start += 1) {\n' +
      '    if (color[start] !== -1) continue;\n' +
      '    color[start] = 0;\n' +
      '    const stack = [start];\n' +
      '    while (stack.length > 0) {\n' +
      '      const node = stack.pop();\n' +
      '      for (const edge of adj[node]) {\n' +
      '        const next = edge[1];\n' +
      '        if (color[next] === -1) {\n' +
      '          color[next] = 1 - color[node];\n' +
      '          stack.push(next);\n' +
      '        } else if (color[next] === color[node]) {\n' +
      '          return node + "," + next;\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return null;\n' +
      '}\n' +
      '\n' +
      'function colourPairsDfs(adj) {\n' +
      '  const color = new Array(adj.length).fill(-1);\n' +
      '  const pairs = [];\n' +
      '  for (let start = 0; start < adj.length; start += 1) {\n' +
      '    if (color[start] !== -1) continue;\n' +
      '    color[start] = 0;\n' +
      '    const stack = [start];\n' +
      '    while (stack.length > 0) {\n' +
      '      const node = stack.pop();\n' +
      '      for (const edge of adj[node]) {\n' +
      '        const next = edge[1];\n' +
      '        if (color[next] === -1) {\n' +
      '          color[next] = 1 - color[node];\n' +
      '          pairs.push(node + ":" + color[node] + "->" + next + ":" + color[next]);\n' +
      '          stack.push(next);\n' +
      '        }\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return pairs.join("|");\n' +
      '}\n' +
      '\n' +
      'function colouringDfsFromZero(adj) {\n' +
      '  if (adj.length === 0) return "";\n' +
      '  const color = new Array(adj.length).fill(-1);\n' +
      '  color[0] = 0;\n' +
      '  const stack = [0];\n' +
      '  while (stack.length > 0) {\n' +
      '    const node = stack.pop();\n' +
      '    for (const edge of adj[node]) {\n' +
      '      const next = edge[1];\n' +
      '      if (color[next] === -1) {\n' +
      '        color[next] = 1 - color[node];\n' +
      '        stack.push(next);\n' +
      '      } else if (color[next] === color[node]) {\n' +
      '        return null;\n' +
      '      }\n' +
      '    }\n' +
      '  }\n' +
      '  return color.join("");\n' +
      '}',
    modify:
      "The graph is directed and the question becomes whether the underlying undirected graph is bipartite. Which one line changes, and what does an edge recorded in both directions do to the conflict test?",
  },
];

export const expects: Record<string, string> = {
  'Introduction to Graph, Graph Representation':
    '(() => { const g = buildAdj(4, [[0,1],[1,2],[2,0],[2,3]]); const d = buildAdj(3, [[0,1],[1,2]], true); const looped = buildAdj(3, [[0,1],[1,2],[2,0],[2,2]]); return showAdj(g) === "0:1,2 1:0,2 2:0,1,3 3:2" && showAdj(d) === "0:1 1:2 2:" && degreeOf(g, 2) === 3 && degreeOf(g, 3) === 1 && degreeOf(d, 2) === 0 && countEdges(g) === 4 && sumDegrees(g) === 8 && countEdges(looped) === 3.5 && showGrid(toAdjacencyMatrix(4, [[0,1],[1,2],[2,0],[2,3]])) === "0,1,1,0|1,0,1,0|1,1,0,1|0,0,1,0" && showGrid(toAdjacencyMatrix(3, [[0,1],[1,2]], true)) === "0,1,0|0,0,1|0,0,0" && showAdj(buildAdj(2, [[0,1,4]], false)) === "0:1/4 1:0/4" && showAdj(buildAdj(1, [])) === "0:" && showAdj(buildAdj(0, [])) === ""; })()',
  'Connected Components in Graph':
    '(() => { const g = buildAdj(6, [[0,1],[1,2],[3,4]]); const tri = buildAdj(3, [[0,1],[1,2],[2,0]]); const looped = buildAdj(3, [[0,1],[1,2],[2,0],[2,2]]); return componentsOf(g).map((l) => l.join(",")).join("|") === "0,1,2|3,4|5" && countComponents(g) === 3 && largestComponent(g) === 3 && componentsWithUnionFind(g) === 3 && componentsOf(tri).map((l) => l.join(",")).join("|") === "0,1,2" && countComponents(tri) === 1 && componentsWithUnionFind(tri) === 1 && componentsWithUnionFind(looped) === 1 && countComponents(buildAdj(1, [])) === 1 && countComponents(buildAdj(0, [])) === 0 && largestComponent(buildAdj(0, [])) === 0 && componentsWithUnionFind(buildAdj(0, [])) === 0; })()',
  'Breadth First Search (BFS)':
    '(() => { const g = buildAdj(6, [[0,1],[0,2],[1,3],[2,3],[3,4]]); const quad = buildAdj(4, [[0,1],[1,2],[2,0],[2,3]]); return bfs(g, 0).join(",") === "0,1,2,3,4" && bfsLevels(g, 0).map((l) => l.join(",")).join("|") === "0|1,2|3|4" && bfsDepths(g, 0).join(",") === "0,1,1,2,3,-1" && bfs(g, 0).length === 5 && bfsMarkOnPop(g, 0).pushes > bfs(g, 0).length && bfsMarkOnPop(g, 0).pushes === 11 && bfsMarkOnPop(g, 0).order.join(",") === "0,1,2,3,4" && bfs(quad, 0).join(",") === "0,1,2,3" && bfsDepths(quad, 0).join(",") === "0,1,1,2" && bfs(buildAdj(2, [[0,1]]), 1).join(",") === "1,0" && bfsDepths(buildAdj(2, [[0,1]]), 1).join(",") === "1,0" && bfs(buildAdj(1, []), 0).join(",") === "0" && bfs(buildAdj(0, []), 0).join(",") === "" && bfsDepths(buildAdj(0, []), 0).join(",") === ""; })()',
  'Depth First Search (DFS)':
    '(() => { const g = buildAdj(6, [[0,1],[0,2],[1,3],[1,4],[2,5]]); const walked = dfs(g, 0); const popped = dfsMarkOnPop(g, 0); return walked.order.join(",") === "0,1,3,4,2,5" && dfsRecursive(g, 0).join(",") === "0,1,3,4,2,5" && walked.pushes === 6 && walked.peak === 3 && walked.peak < walked.pushes && popped.pushes > walked.pushes && popped.pushes === 11 && popped.order.join(",") === walked.order.join(",") && dfsPostOrder(g, 0).join(",") === "3,4,1,5,2,0" && dfsPostOrder(g, 0).length === 6 && dfs(buildAdj(2, [[0,1]]), 0).peak === 1 && dfs(buildAdj(1, []), 0).order.join(",") === "0" && dfs(buildAdj(0, []), 0).order.join(",") === "" && dfsRecursive(buildAdj(0, []), 0).join(",") === ""; })()',
  'Number of Provinces':
    '(() => { const three = [[1,0,0],[0,1,0],[0,0,1]]; const linked = [[1,1,0],[1,0,0],[0,0,1]]; const pairs = [[1,0,0,1],[0,1,1,0],[0,1,1,0],[1,0,0,1]]; const chained = [[1,1,0],[1,0,1],[0,1,1]]; const mixed = [[1,0,0,0,1],[0,1,0,0,0],[0,0,1,1,0],[0,0,1,1,0],[1,0,0,0,1]]; return countProvinces(three) === 3 && provincesWithUnionFind(three) === 3 && countProvinces(linked) === 2 && countProvinces(chained) === 1 && provincesWithUnionFind(chained) === 1 && countProvinces(pairs) === 2 && provincesWithUnionFind(pairs) === 2 && countProvinces(mixed) === 3 && provinceSizes(mixed).join(",") === "2,2,1" && provinceSizes(pairs).join(",") === "2,2" && countProvinces([[1]]) === 1 && provincesWithUnionFind([[1]]) === 1 && countProvinces([]) === 0 && provincesWithUnionFind([]) === 0; })()',
  'Connected Components Problem in Matrix':
    '(() => { const g = [[1,1,0,0],[0,1,0,1],[0,0,0,1],[1,0,0,0]]; return countGridComponents(g) === 3 && scanGridComponents(g).join(",") === "3,2,1" && largestGridComponent(g) === 3 && gridComponentCells(g, 1, 1).join("|") === "0,0|0,1|1,1" && gridComponentCells(g, 3, 0).join("|") === "3,0" && gridComponentCells([[1,0,0],[1,1,0],[0,0,1]], 0, 0).join("|") === "0,0|1,0|1,1" && countGridComponents([[1,0],[0,1]]) === 2 && countGridComponents([[1,1],[1,1]]) === 1 && countGridComponents([[0,0],[0,0]]) === 0 && largestGridComponent([[0,0],[0,0]]) === 0 && countGridComponents([[1]]) === 1 && countGridComponents([]) === 0 && largestGridComponent([]) === 0 && gridComponentCells(g, 0, 3).join("|") === ""; })()',
  'Rotten Oranges':
    '(() => { const ok = [[2,1,1],[1,1,0],[0,1,1]]; const stuck = [[2,1,1],[0,1,1],[1,0,1]]; const none = [[0,2]]; return rottingMinutes(ok) === 4 && countFresh(ok) === 6 && rottingMinutes(stuck) === -1 && countFresh(stuck) === 6 && showGrid(finalState(stuck)) === "2,2,2|0,2,2|1,0,2" && showGrid(finalState(ok)) === "2,2,2|2,2,0|0,2,2" && rottingMinutes(none) === 0 && countFresh(none) === 0 && rottingMinutes([[2,2,2]]) === 0 && rottingMinutes([[1]]) === -1 && rottingMinutes([[2,1]]) === 1 && rottingMinutes([[1,1,1],[1,1,1],[1,1,2]]) === 4 && rottingMinutes([]) === 0 && countFresh([]) === 0 && showGrid(finalState([[2,2],[2,2]])) === "2,2|2,2"; })()',
  'Flood Fill Algorithm':
    '(() => { const image = [[1,1,1],[1,1,0],[1,0,1]]; const painted = floodFill(image, 1, 1, 2); return showGrid(painted) === "2,2,2|2,2,0|2,0,1" && showGrid(image) === "1,1,1|1,1,0|1,0,1" && floodRegionCells(image, 1, 1).join("|") === "0,0|0,1|0,2|1,0|1,1|2,0" && floodRegionCells(image, 1, 1).length === 6 && showGrid(floodFill(image, 1, 1, 1)) === "1,1,1|1,1,0|1,0,1" && showGrid(floodFill([[0,0,0],[0,1,0],[0,0,0]], 1, 1, 3)) === "0,0,0|0,3,0|0,0,0" && showGrid(floodFill([[1]], 0, 0, 7)) === "7" && floodRegionCells([[1,2,1]], 0, 1).join("|") === "0,1" && showGrid(floodFill([[1,2,1]], 0, 0, 2)) === "2,2,1" && floodFillLiveBoardTest(image, 1, 1, 2, 100).spins === false && showGrid(floodFillLiveBoardTest(image, 1, 1, 2, 100).grid) === "2,2,2|2,2,2|2,2,2" && floodFillLiveBoardTest(image, 1, 1, 2, 100).pops === 13; })()',
  'Cycle Detection in Undirected Graph (BFS)':
    '(() => { const tree = buildAdj(5, [[0,1],[1,2],[2,3],[1,4]]); const tri = buildAdj(3, [[0,1],[1,2],[2,0]]); const split = buildAdj(6, [[0,1],[2,3],[3,4],[4,2],[4,5]]); const looped = buildAdj(3, [[0,1],[1,2],[2,2]]); const parallel = buildAdj(2, [[0,1],[0,1]]); return hasCycleBfs(tree) === false && cycleEdgeBfs(tree) === null && hasCycleBfs(tri) === true && cycleEdgeBfs(tri) === "1,2" && cycleEdgeBfs(split) === "3,4" && cycleEdgeBfsFromZero(split) === null && cycleEdgeBfs(looped) === "2,2" && cycleEdgeBfs(parallel) === "0,1" && hasCycleBfs(buildAdj(1, [[0,0]])) === true && cycleEdgeBfs(buildAdj(1, [[0,0]])) === "0,0" && hasCycleBfs(buildAdj(4, [[0,1],[1,2],[2,0],[2,3]])) === true && hasCycleBfs(buildAdj(0, [])) === false && hasCycleBfs(buildAdj(1, [])) === false; })()',
  'Cycle Detection in Undirected Graph (DFS)':
    '(() => { const tree = buildAdj(5, [[0,1],[1,2],[2,3],[1,4]]); const tri = buildAdj(5, [[0,1],[1,2],[2,0],[2,3],[3,4]]); const split = buildAdj(6, [[0,1],[2,3],[3,4],[4,5],[5,2]]); const parallel = buildAdj(2, [[0,1],[0,1]]); return hasCycleDfs(tree) === false && hasCycleDfsNoParent(tree) === true && hasCycleDfsNoParent(buildAdj(4, [[0,1],[1,2],[2,3]])) === true && hasCycleDfs(tri) === true && hasCycleDfs(split) === true && hasCycleDfsFromZero(split) === false && dfsTreeEdges(tri, 0).join("|") === "0->1|0->2|2->3|3->4" && hasCycleDfs(buildAdj(1, [[0,0]])) === true && hasCycleDfs(parallel) === true && hasCycleDfs(buildAdj(0, [])) === false && hasCycleDfs(buildAdj(1, [])) === false && dfsTreeEdges(tree, 0).length === 4; })()',
  '0/1 Matrix (Distance of nearest cell having 1)':
    '(() => { const one = [[0,0,0],[0,1,0],[0,0,0]]; const wide = [[0,1,0,0,0],[1,1,1,0,0],[0,0,1,0,0],[0,0,0,0,1]]; const corners = [[1,0,1],[0,1,0],[1,0,1]]; return showGrid(nearestOneDistance(one)) === "2,1,2|1,0,1|2,1,2" && showGrid(twoSweepDistance(one)) === "2,1,2|1,0,1|2,1,2" && showGrid(nearestOneDistance(wide)) === "1,0,1,2,3|0,0,0,1,2|1,1,0,1,1|2,2,1,1,0" && showGrid(twoSweepDistance(wide)) === showGrid(nearestOneDistance(wide)) && seedCount(wide) === 6 && showGrid(nearestOneDistance(corners)) === "0,1,0|1,0,1|0,1,0" && showGrid(nearestOneDistance([[0,0],[0,0]])) === "-1,-1|-1,-1" && showGrid(twoSweepDistance([[0,0],[0,0]])) === "-1,-1|-1,-1" && seedCount([[0,0],[0,0]]) === 0 && showGrid(nearestOneDistance([[1]])) === "0" && showGrid(nearestOneDistance([])) === ""; })()',
  "Surrounded Regions (Replace O's with X's)":
    '(() => { const board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]; const saved = [["X","X","X"],["X","O","X"],["X","O","X"]]; const allOpen = [["O","O","O"],["O","O","O"],["O","O","O"]]; const ring = [["X","X","X"],["X","O","X"],["X","X","X"]]; return showGrid(captureBoard(board)) === "X,X,X,X|X,X,X,X|X,X,X,X|X,O,X,X" && countCaptured(board) === 3 && showGrid(capturePerCellFlood(board)) === showGrid(captureBoard(board)) && showGrid(captureBoard(saved)) === "X,X,X|X,O,X|X,O,X" && countCaptured(saved) === 0 && showGrid(captureBoard(allOpen)) === "O,O,O|O,O,O|O,O,O" && countCaptured(allOpen) === 0 && showGrid(captureBoard(ring)) === "X,X,X|X,X,X|X,X,X" && countCaptured(ring) === 1 && countCaptured([["O","O","O"]]) === 0 && countCaptured([["O"]]) === 0 && showGrid(captureBoard([["X","X"],["X","X"]])) === "X,X|X,X" && showGrid(captureBoard([])) === ""; })()',
  'Number of Enclaves':
    '(() => { const block = [[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]]; const wide = [[0,0,0,0,0],[0,1,1,0,0],[0,1,1,1,0],[0,0,0,0,0]]; const ring = [[1,0,1],[1,1,1],[1,0,1]]; const centre = [[0,0,0],[0,1,0],[0,0,0]]; const open = [[0,1,0],[1,0,1],[0,1,0]]; return countLand(block) === 4 && borderConnectedLand(block) === 0 && countEnclaves(block) === 4 && countEnclaves(wide) === 5 && countLand(wide) === 5 && countEnclaves(centre) === 1 && countEnclaves(ring) === 0 && countLand(ring) === 7 && borderConnectedLand(ring) === 7 && countEnclaves(open) === 0 && countEnclaves([[1,1,1]]) === 0 && countEnclaves([[0,0],[0,0]]) === 0 && countEnclaves([]) === 0 && countLand([]) === 0; })()',
  'Word Ladder I':
    '(() => { const dict = ["hot","dot","dog","lot","log","cog"]; return ladderLength("hit", "cog", dict) === 5 && ladderLength("hit", "cog", ["hit"].concat(dict)) === 5 && ladderLength("hot", "dog", ["hot","dog"]) === 0 && ladderLength("hot", "dog", ["hot","dog","dot"]) === 3 && ladderLength("hit", "cog", ["hot","dot","dog"]) === 0 && ladderLength("a", "c", ["a","b","c"]) === 2 && ladderLength("a", "a", ["a"]) === 1 && ladderLength("aa", "aaa", ["aaa"]) === 0 && ladderLength("hot", "hot", []) === 0 && bucketTotal(patternBuckets(dict)) === 18 && bucketTotal(patternBuckets(["hot","dot","dog"])) === 9; })()',
  'Word Ladder II':
    '(() => { const dict = ["hot","dot","dog","lot","log","cog"]; const two = findLadders("hit", "cog", dict).map((s) => s.join(">")).join("|"); const aaa = findLadders("aaa", "ddd", ["aad","ada","daa","add","dad","dda","ddd"]); return two === "hit>hot>dot>dog>cog|hit>hot>lot>log>cog" && findLadders("hit", "cog", dict).length === 2 && findLadders("hit", "cog", dict).every((s) => s.length === 5) && findLadders("hot", "dog", ["hot","dog","dot"]).map((s) => s.join(">")).join("|") === "hot>dot>dog" && aaa.length === 6 && aaa.every((s) => s.length === 4) && aaa.map((s) => s.join(">")).join("|") === "aaa>aad>add>ddd|aaa>aad>dad>ddd|aaa>ada>add>ddd|aaa>ada>dda>ddd|aaa>daa>dad>ddd|aaa>daa>dda>ddd" && findLadders("aa", "cc", ["ac","ca","bc","cc"]).map((s) => s.join(">")).join("|") === "aa>ac>cc|aa>ca>cc" && findLadders("hit", "cog", ["hot","dot","dog"]).map((s) => s.join(">")).join("|") === "" && findLadders("hot", "dog", ["hot","dog"]).length === 0 && ladderCount("hit", "cog", dict) === 2 && findLadders("a", "b", ["a","b","c"]).map((s) => s.join(">")).join("|") === "a>b"; })()',
  'Number of Distinct Islands':
    '(() => { const three = [[1,1,0,1,1],[1,0,0,1,1],[0,0,1,0,0]]; const same = [[1,1,0,0,0],[1,0,0,1,1],[0,0,0,1,0]]; const mirror = [[1,1,0,1,0],[1,0,0,1,1]]; return islandShapeKeys(three).join("|") === "0,0|0,0;0,1;1,0|0,0;0,1;1,0;1,1" && countDistinctIslands(three) === 3 && collectIslands(three).length === 3 && countDistinctIslands(same) === 1 && collectIslands(same).length === 2 && normalizeShape([[0,0],[0,1],[1,0]]) === normalizeShape([[1,0],[1,1],[2,0]]) && normalizeShape([[0,0],[0,1],[1,0]]) === "0,0;0,1;1,0" && countDistinctIslands(mirror) === 2 && collectIslands(mirror).length === 2 && countDistinctIslands([[1,0,1],[0,0,0],[1,0,1]]) === 1 && countDistinctIslands([[1,1],[1,1]]) === 1 && countDistinctIslands([[0,0],[0,0]]) === 0 && countDistinctIslands([]) === 0 && collectIslands([]).length === 0; })()',
  'Bipartite Graph (BFS)':
    '(() => { const square = buildAdj(4, [[0,1],[1,2],[2,3],[3,0]]); const odd = buildAdj(3, [[0,1],[1,2],[2,0]]); const tail = buildAdj(7, [[0,1],[1,2],[2,3],[3,0],[0,4],[4,5]]); const split = buildAdj(8, [[0,1],[2,3],[3,4],[4,2],[5,6],[6,7]]); return bipartition(square) === "0101" && isBipartite(square) === true && bipartition(odd) === null && isBipartite(odd) === false && bipartition(tail) === "0101100" && isBipartite(tail) === true && isBipartite(split) === false && bipartition(split) === null && bipartitionFromZero(split) !== null && bipartitionFromZero(split) === "01-1-1-1-1-1-1" && isBipartite(buildAdj(1, [[0,0]])) === false && bipartition(buildAdj(1, [])) === "0" && bipartition(buildAdj(0, [])) === "" && isBipartite(buildAdj(0, [])) === true && showAdj(shiftedAdjacency(3, [[1,2],[2,3]])) === "0:1 1:0,2 2:1" && bipartition(shiftedAdjacency(3, [[1,2],[2,3]])) === "010"; })()',
  'Bipartite Graph (DFS)':
    '(() => { const penta = buildAdj(5, [[0,1],[1,2],[2,3],[3,4],[4,0]]); const hex = buildAdj(6, [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]]); const square = buildAdj(4, [[0,1],[1,2],[2,3],[3,0]]); const split = buildAdj(8, [[0,1],[2,3],[3,4],[4,2],[5,6],[6,7]]); const tail = buildAdj(7, [[0,1],[1,2],[2,3],[3,0],[0,4],[4,5]]); return colouringDfs(penta) === null && isBipartiteDfs(penta) === false && conflictEdgeDfs(penta) === "2,1" && colouringDfs(hex) === "010101" && isBipartiteDfs(hex) === true && colouringDfs(square) === "0101" && colouringDfs(tail) === "0101100" && colouringDfsFromZero(split) !== null && isBipartiteDfs(split) === false && conflictEdgeDfs(split) !== null && colourPairsDfs(square) === "0:0->1:1|0:0->3:1|3:1->2:0" && isBipartiteDfs(buildAdj(1, [[0,0]])) === false && isBipartiteDfs(buildAdj(0, [])) === true && colouringDfs(buildAdj(0, [])) === "" && colouringDfs(buildAdj(2, [[0,1]])) === "01"; })()',
};
