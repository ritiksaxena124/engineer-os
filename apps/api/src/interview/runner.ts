import { spawn } from 'node:child_process';

export interface SandboxFile {
  path: string;
  contents: string;
  isCheck: boolean;
}

export interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface RunOutcome {
  results: CheckResult[];
  logs: string[];
  /** Null when every module loaded and every check reached a verdict. */
  crashed: string | null;
}

const DEFAULT_TIMEOUT_MS = 4_000;

export function toSandboxFiles(
  rows: { path: string; contents: string; isCheck?: boolean }[],
): SandboxFile[] {
  return rows.map((row) => ({ path: row.path, contents: row.contents, isCheck: row.isCheck === true }));
}

/**
 * Candidate code runs in a child process, never in the API: an infinite loop or a memory blow-up has
 * to be survivable for a page an anonymous interviewee opens from a share link. The sandbox is also
 * compiled with codeGeneration disabled, so eval and the Function constructor are not a route out.
 * That is containment, not a hardened multi-tenant jail; a public deployment should move the child
 * into its own isolate or container before the link goes to strangers.
 */
export async function runFiles(
  files: SandboxFile[],
  options: { timeoutMs?: number } = {},
): Promise<RunOutcome> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const payload = JSON.stringify({ files, timeoutMs });

  return await new Promise<RunOutcome>((resolve) => {
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn(
        'node',
        ['--input-type=commonjs', '--max-old-space-size=128', '-e', CHILD_SCRIPT],
        {
          stdio: ['pipe', 'pipe', 'pipe'],
          windowsHide: true,
          env: { SystemRoot: process.env.SystemRoot, PATH: process.env.PATH },
        },
      );
    } catch (cause) {
      resolve({ results: [], logs: [], crashed: `sandbox unavailable: ${(cause as Error).message}` });
      return;
    }

    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (outcome: RunOutcome) => {
      if (settled) return;
      settled = true;
      clearTimeout(killer);
      resolve(outcome);
    };
    const killer = setTimeout(() => {
      child.kill('SIGKILL');
      finish({ results: [], logs: [], crashed: `sandbox killed after ${timeoutMs}ms` });
    }, timeoutMs + 3_000);

    child.stdout?.on('data', (chunk) => (stdout += String(chunk)));
    child.stderr?.on('data', (chunk) => (stderr += String(chunk)));
    child.on('error', (cause) => finish({ results: [], logs: [], crashed: cause.message }));
    child.on('close', () => {
      try {
        const parsed = JSON.parse(stdout) as RunOutcome;
        finish({ results: parsed.results, logs: parsed.logs, crashed: parsed.crashed ?? null });
      } catch {
        finish({
          results: [],
          logs: [],
          crashed: `sandbox returned nothing${stderr ? `: ${stderr.slice(0, 300)}` : ''}`,
        });
      }
    });

    child.stdin?.on('error', () => undefined);
    child.stdin?.end(payload);
  });
}

export function summarize(outcome: RunOutcome): {
  passed: number;
  failed: number;
  allGreen: boolean;
} {
  const passed = outcome.results.filter((result) => result.passed).length;
  const failed = outcome.results.length - passed;
  return { passed, failed, allGreen: outcome.crashed === null && failed === 0 && passed > 0 };
}

// Plain JS, since this is what the child evaluates.
const CHILD_SCRIPT = `
const vm = require('node:vm');

let payload = '';
process.stdin.on('data', (chunk) => (payload += String(chunk)));
process.stdin.on('end', () => {
  let outcome;
  try {
    outcome = run(JSON.parse(payload));
  } catch (cause) {
    outcome = { results: [], logs: [], crashed: String((cause && cause.message) || cause) };
  }
  try { process.stdout.write(JSON.stringify(outcome)); } catch (cause) { void cause; }
});

function run(input) {
  const files = input.files;
  const perCall = Math.max(300, Math.floor(input.timeoutMs / 2));
  const names = [];
  for (const probe of files.filter((file) => file.isCheck)) {
    const built = build(files, perCall);
    if (built.crashed) {
      return { results: [], logs: built.logs, crashed: built.crashed };
    }
    for (const check of built.checks) {
      if (!names.some((existing) => existing === check.name)) names.push(check.name);
    }
    break;
  }

  const results = [];
  const logs = [];
  for (const target of names) {
    const built = build(files, perCall);
    // Module-level output repeats across rebuilds, so it is deduped; what a check prints is not.
    for (const line of built.logs) if (!logs.includes(line)) logs.push(line);
    if (built.crashed) {
      results.push({ name: target, passed: false, message: built.crashed });
      continue;
    }
    const check = built.checks.find((entry) => entry.name === target);
    if (!check) {
      results.push({ name: target, passed: false, message: 'check never registered' });
      continue;
    }
    const printed = built.logs.length;
    try {
      check.fn();
      results.push({ name: target, passed: true, message: 'ok' });
    } catch (cause) {
      results.push({
        name: target,
        passed: false,
        message: String((cause && cause.message) || cause),
      });
    }
    for (const line of built.logs.slice(printed)) logs.push(line);
  }
  return { results, logs, crashed: null };
}

function build(files, perCall) {
  const logs = [];
  const checks = [];
  const registry = new Map();
  for (const file of files) registry.set(file.path, { module: { exports: {} }, loaded: false });

  const clock = {
    t: 0,
    now() { return clock.t; },
    advance(ms) { clock.t += ms; return clock.t; },
    at(ms) { clock.t = ms; return clock.t; },
  };
  const record = (...parts) => logs.push(parts.map(render).join(' '));
  const assert = (condition, message) => {
    if (!condition) throw new Error(message || 'assertion failed');
  };
  assert.equal = (actual, expected, message) => {
    if (actual !== expected) {
      throw new Error((message || 'not equal') + ': got ' + render(actual) + ', wanted ' + render(expected));
    }
  };
  assert.close = (actual, expected, tolerance, message) => {
    if (!(Math.abs(actual - expected) <= tolerance)) {
      throw new Error((message || 'not close') + ': got ' + actual + ', wanted ' + expected);
    }
  };

  const context = vm.createContext(
    {},
    { codeGeneration: { strings: false, wasm: false } },
  );

  function request(spec, fromPath) {
    const found = resolve(spec, fromPath);
    if (!found) throw new Error('sandbox: cannot require ' + spec);
    const entry = registry.get(found);
    if (!entry.loaded) {
      entry.loaded = true;
      execute(found, entry);
    }
    return entry.module.exports;
  }

  function dirname(path) {
    const cut = path.lastIndexOf('/');
    return cut === -1 ? '' : path.slice(0, cut);
  }

  function join(base, spec) {
    const parts = (base ? base.split('/') : []).concat(spec.split('/'));
    const out = [];
    for (const part of parts) {
      if (!part || part === '.') continue;
      if (part === '..') {
        out.pop();
        continue;
      }
      out.push(part);
    }
    return out.join('/');
  }

  function resolve(spec, fromPath) {
    const raw = String(spec);
    // An absolute-looking spec is rooted inside the room, never on the host filesystem.
    const full =
      raw.startsWith('./') || raw.startsWith('../') || raw.startsWith('/')
        ? join(dirname(fromPath), raw)
        : raw;
    const paths = [full, full + '.js'];
    for (const candidate of paths) if (registry.has(candidate)) return candidate;
    return null;
  }

  function execute(path, entry) {
    const file = files.find((candidate) => candidate.path === path);
    const source =
      '(function (module, exports, require, console, clock, assert, defineCheck) {\\n' +
      file.contents +
      '\\n})';
    let target;
    try {
      target = vm.runInContext(source, context, { filename: path, timeout: perCall });
    } catch (cause) {
      throw new Error(path + ': ' + String((cause && cause.message) || cause));
    }
    context.__target = target;
    context.__args = [
      entry.module,
      entry.module.exports,
      (spec) => request(spec, path),
      { log: record, error: record, warn: record, info: record },
      clock,
      assert,
      (name, fn) => { if (typeof fn === 'function') checks.push({ name: String(name), fn }); },
    ];
    try {
      vm.runInContext('__target.apply(null, __args)', context, { filename: path, timeout: perCall });
    } catch (cause) {
      throw new Error(path + ': ' + String((cause && cause.message) || cause));
    }
  }

  for (const path of files.filter((file) => !file.isCheck).map((file) => file.path)) {
    const entry = registry.get(path);
    if (entry.loaded) continue;
    entry.loaded = true;
    try {
      execute(path, entry);
    } catch (cause) {
      return { checks, logs, crashed: String((cause && cause.message) || cause) };
    }
  }
  for (const path of files.filter((file) => file.isCheck).map((file) => file.path)) {
    const entry = registry.get(path);
    if (entry.loaded) continue;
    entry.loaded = true;
    try {
      execute(path, entry);
    } catch (cause) {
      return { checks, logs, crashed: String((cause && cause.message) || cause) };
    }
  }
  return { checks, logs, crashed: null };
}

function render(value) {
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch (cause) { void cause; return String(value); }
}
`;
