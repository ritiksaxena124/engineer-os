/**
 * The tree and graph scaffolding that DSA solutions need before the interesting part starts.
 *
 * A reference solution is graded by running it, so every helper has to ship inside the solution
 * string rather than be imported: the learner who copies the answer must get something executable.
 * These are the snippets worth pasting into several rows of the bank.
 */

/** Level-order cells with null markers, exactly as the sheet's trees are written. */
export const buildTree =
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

/** The same shape back out as cells, with trailing nulls trimmed so a round trip is comparable. */
export const serializeLevel =
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

export const inorderOf =
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

export const preorderOf =
  'function preorderOf(root) {\n' +
  '  const out = [];\n' +
  '  const walk = (node) => {\n' +
  '    if (node === null) return;\n' +
  '    out.push(node.val);\n' +
  '    walk(node.left);\n' +
  '    walk(node.right);\n' +
  '  };\n' +
  '  walk(root);\n' +
  '  return out;\n' +
  '}';

export const nodeCount =
  'function nodeCount(root) {\n' +
  '  if (root === null) return 0;\n' +
  '  return 1 + nodeCount(root.left) + nodeCount(root.right);\n' +
  '}';

export const heightOf =
  'function heightOf(root) {\n' +
  '  if (root === null) return -1;\n' +
  '  return 1 + Math.max(heightOf(root.left), heightOf(root.right));\n' +
  '}';
