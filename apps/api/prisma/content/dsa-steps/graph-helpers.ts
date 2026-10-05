/**
 * The graph scaffolding that step 15 solutions need before the interesting part starts.
 *
 * Like the tree helpers, each of these ships inside the solution string rather than being imported:
 * a learner who copies a reference answer has to get something that runs on its own. These are the
 * five pieces the graph step keeps re-asking for — an adjacency list, a priority queue, a disjoint
 * set, the four grid directions and a deep copy of a matrix.
 */

/**
 * Adjacency list for nodes 0..n-1. `edges` is a list of [from, to] pairs, or [from, to, weight]
 * triples; the weight is kept as a third entry so one builder serves both unweighted and weighted
 * rows. Directed graphs pass directed = true; otherwise the reverse edge is added too.
 */
export const buildAdj =
  'function buildAdj(n, edges, directed) {\n' +
  '  const adj = [];\n' +
  '  for (let node = 0; node < n; node += 1) adj.push([]);\n' +
  '  for (const edge of edges) {\n' +
  '    const [from, to] = edge;\n' +
  '    adj[from].push(edge);\n' +
  '    if (!directed && from !== to) adj[to].push([to, from, edge[2]]);\n' +
  '  }\n' +
  '  return adj;\n' +
  '}';

/** A binary min-heap over [priority, payload] pairs, which is what Dijkstra, Prim and BFS-with-cost all need. */
export const minHeap =
  'class MinHeap {\n' +
  '  constructor(compare) {\n' +
  '    this.items = [];\n' +
  '    this.compare = compare || function (a, b) { return a[0] - b[0]; };\n' +
  '  }\n' +
  '  size() { return this.items.length; }\n' +
  '  peek() { return this.items[0]; }\n' +
  '  push(item) {\n' +
  '    this.items.push(item);\n' +
  '    let i = this.items.length - 1;\n' +
  '    while (i > 0) {\n' +
  '      const parent = (i - 1) >> 1;\n' +
  '      if (this.compare(this.items[i], this.items[parent]) >= 0) break;\n' +
  '      const held = this.items[parent];\n' +
  '      this.items[parent] = this.items[i];\n' +
  '      this.items[i] = held;\n' +
  '      i = parent;\n' +
  '    }\n' +
  '    return this.items.length;\n' +
  '  }\n' +
  '  pop() {\n' +
  '    const items = this.items;\n' +
  '    if (items.length === 0) return undefined;\n' +
  '    const top = items[0];\n' +
  '    const last = items.pop();\n' +
  '    if (items.length > 0) {\n' +
  '      items[0] = last;\n' +
  '      let i = 0;\n' +
  '      for (;;) {\n' +
  '        const left = 2 * i + 1;\n' +
  '        const right = left + 1;\n' +
  '        let small = i;\n' +
  '        if (left < items.length && this.compare(items[left], items[small]) < 0) small = left;\n' +
  '        if (right < items.length && this.compare(items[right], items[small]) < 0) small = right;\n' +
  '        if (small === i) break;\n' +
  '        const held = items[small];\n' +
  '        items[small] = items[i];\n' +
  '        items[i] = held;\n' +
  '        i = small;\n' +
  '      }\n' +
  '    }\n' +
  '    return top;\n' +
  '  }\n' +
  '}';

/** Disjoint set with path compression and union by size, reporting the component count as it merges. */
export const unionFind =
  'function UnionFind(n) {\n' +
  '  this.parent = [];\n' +
  '  this.size = [];\n' +
  '  this.components = n;\n' +
  '  for (let i = 0; i < n; i += 1) {\n' +
  '    this.parent.push(i);\n' +
  '    this.size.push(1);\n' +
  '  }\n' +
  '}\n' +
  'UnionFind.prototype.find = function (node) {\n' +
  '  let root = node;\n' +
  '  while (this.parent[root] !== root) root = this.parent[root];\n' +
  '  while (this.parent[node] !== root) {\n' +
  '    const next = this.parent[node];\n' +
  '    this.parent[node] = root;\n' +
  '    node = next;\n' +
  '  }\n' +
  '  return root;\n' +
  '};\n' +
  'UnionFind.prototype.union = function (a, b) {\n' +
  '  const ra = this.find(a);\n' +
  '  const rb = this.find(b);\n' +
  '  if (ra === rb) return false;\n' +
  '  if (this.size[ra] < this.size[rb]) {\n' +
  '    this.parent[ra] = rb;\n' +
  '    this.size[rb] += this.size[ra];\n' +
  '  } else {\n' +
  '    this.parent[rb] = ra;\n' +
  '    this.size[ra] += this.size[rb];\n' +
  '  }\n' +
  '  this.components -= 1;\n' +
  '  return true;\n' +
  '};\n' +
  'UnionFind.prototype.connected = function (a, b) { return this.find(a) === this.find(b); };';

/** The four grid moves, in a fixed order so a traversal that records its steps is reproducible. */
export const dirs4 =
  'const DIRS4 = [[-1, 0], [0, 1], [1, 0], [0, -1]];\n' +
  '\n' +
  'function inGrid(grid, row, col) {\n' +
  '  return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;\n' +
  '}';

/** A fresh copy of a matrix, because several graph rows are asked not to destroy their input. */
export const copyGrid =
  'function copyGrid(grid) {\n' +
  '  return grid.map((row) => row.slice());\n' +
  '}';

/** Row-major print of a matrix, so a check can compare a whole grid in one assertion. */
export const showGrid =
  'function showGrid(grid) {\n' +
  '  return grid.map((row) => row.join(",")).join("|");\n' +
  '}';

/**
 * An adjacency list as one comparable string: `0:1,2 1:0,2` reads as "node 0 reaches 1 and 2".
 * A weighted edge renders `0:1/4`, so a structure row can assert what its builder produced.
 */
export const showAdj =
  'function showAdj(adj) {\n' +
  '  return adj\n' +
  '    .map((list, node) => node + ":" + list\n' +
  '      .slice()\n' +
  '      .sort((a, b) => a[1] - b[1] || (a[2] === undefined ? 0 : a[2]) - (b[2] === undefined ? 0 : b[2]))\n' +
  '      .map((edge) => String(edge[1]) + (edge[2] === undefined ? "" : "/" + edge[2]))\n' +
  '      .join(","))\n' +
  '    .join(" ");\n' +
  '}';
