import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

// A verifier that is CPU-bound and pure-JS is the worst possible thing to put on the
// login path of a single-threaded runtime, so this uses Node's native scrypt with a
// work factor the operator can raise. N = 2^factor; memory = 128·N·r bytes.
const R = 8;
const P = 1;
const KEY_LENGTH = 32;
const MAX_MEMORY = 256 * 1024 * 1024;

interface Params {
  n: number;
  r: number;
  p: number;
  salt: Buffer;
  hash: Buffer;
}

function derive(password: string, params: Params): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      params.salt,
      params.hash.length,
      { N: params.n, r: params.r, p: params.p, maxmem: MAX_MEMORY },
      (err, derived) => (err ? reject(err) : resolve(derived)),
    );
  });
}

export class PasswordHasher {
  constructor(private readonly factor: number = 15) {
    if (!Number.isInteger(factor) || factor < 12 || factor > 20) {
      throw new Error('password work factor must be an integer between 12 and 20');
    }
  }

  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const derived = await derive(password, { n: 2 ** this.factor, r: R, p: P, salt, hash: Buffer.alloc(KEY_LENGTH) });
    return `scrypt$${2 ** this.factor}$${R}$${P}$${salt.toString('hex')}$${derived.toString('hex')}`;
  }

  async verify(password: string, stored: string | null): Promise<boolean> {
    const parsed = this.parse(stored);
    if (!parsed) {
      // burn the same work as a real check before answering false
      await derive(password, { n: 2 ** this.factor, r: R, p: P, salt: Buffer.alloc(16), hash: Buffer.alloc(KEY_LENGTH) });
      return false;
    }
    const candidate = await derive(password, parsed).catch(() => null);
    return candidate !== null && timingSafeEqual(parsed.hash, candidate);
  }

  private parse(stored: string | null): Params | null {
    if (!stored) return null;
    const parts = stored.split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return null;
    const [n, r, p] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
    if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) return null;
    const salt = Buffer.from(parts[4], 'hex');
    const hash = Buffer.from(parts[5], 'hex');
    if (salt.length === 0 || hash.length === 0) return null;
    return { n, r, p, salt, hash };
  }
}
