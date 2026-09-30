import { describe, expect, test } from 'bun:test';
import { PasswordHasher } from '../src/auth/password-hasher';

const hasher = new PasswordHasher(12);

describe('PasswordHasher', () => {
  test('a password verifies against its own hash', async () => {
    const stored = await hasher.hash('CoMplicated-passw0rd!23');
    expect(stored.startsWith('scrypt$4096$8$1$')).toBeTrue();
    expect(await hasher.verify('CoMplicated-passw0rd!23', stored)).toBeTrue();
  });

  test('the same password hashes differently every time', async () => {
    const a = await hasher.hash('same-password-123');
    const b = await hasher.hash('same-password-123');
    expect(a).not.toBe(b);
  });

  test('a wrong password fails', async () => {
    const stored = await hasher.hash('right-password-12345');
    expect(await hasher.verify('wrong-password-12345', stored)).toBeFalse();
  });

  test('a tampered digest fails', async () => {
    const stored = await hasher.hash('right-password-12345');
    const last = stored.slice(-1);
    const flipped = `${stored.slice(0, -1)}${last === '0' ? '1' : '0'}`;
    expect(flipped).not.toBe(stored);
    expect(await hasher.verify('right-password-12345', flipped)).toBeFalse();
  });

  test('a null or malformed stored hash fails without throwing', async () => {
    expect(await hasher.verify('anything-12345', null)).toBeFalse();
    expect(await hasher.verify('anything-12345', 'bcrypt$2a$10$whatever')).toBeFalse();
    expect(await hasher.verify('anything-12345', 'scrypt$0$8$1$deadbeef$cafe')).toBeFalse();
  });

  test('an out-of-range work factor is rejected at construction, not at first login', () => {
    expect(() => new PasswordHasher(4)).toThrow();
    expect(() => new PasswordHasher(21)).toThrow();
    expect(() => new PasswordHasher(15)).not.toThrow();
  });
});
