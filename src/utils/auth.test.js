import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticate, DEFAULT_ADMIN, DEFAULT_ADMIN_ID, deleteManagedUser, homeForRole, registerAccount } from './auth';
import { getSession, getUsers } from './storage';

beforeEach(() => window.localStorage.clear());

const registration = (overrides = {}) => ({ displayName: 'Jamie Writer', username: 'jamie', password: 'secret1', confirmPassword: 'secret1', ...overrides });
const fixedId = () => 'user-123';
const fixedTime = () => '2026-03-04T12:00:00.000Z';

describe('local identity behavior', () => {
  it('authenticates the immutable demo administrator and maps role homes', () => {
    const result = authenticate('admin', 'admin');
    expect(result.ok).toBe(true);
    expect(result.session).toMatchObject({ userId: DEFAULT_ADMIN_ID, role: 'admin', displayName: 'Admin' });
    expect(getSession()).toEqual(result.session);
    expect(DEFAULT_ADMIN.username).toBe('admin');
    expect(homeForRole('admin')).toBe('/admin');
    expect(homeForRole('user')).toBe('/blogs');
  });

  it('rejects invalid credentials without creating a session', () => {
    expect(authenticate('admin', 'wrong')).toEqual({ ok: false, error: 'Invalid username or password.' });
    expect(authenticate('nobody', 'secret').ok).toBe(false);
    expect(getSession()).toBeNull();
  });

  it('authenticates a registered account case-insensitively by username', () => {
    window.localStorage.setItem('writespace_users', JSON.stringify([{ id: 'u1', username: 'Jamie', password: 'secret', displayName: 'Jamie Writer', role: 'user' }]));
    const result = authenticate('jamie', 'secret');
    expect(result.ok).toBe(true);
    expect(result.session.userId).toBe('u1');
    expect(getSession().role).toBe('user');
  });

  it('rejects missing fields, mismatched passwords, admin username, and duplicate usernames', () => {
    expect(registerAccount(registration({ displayName: '' }), fixedId, fixedTime).ok).toBe(false);
    expect(registerAccount(registration({ confirmPassword: 'different' }), fixedId, fixedTime)).toMatchObject({ field: 'confirmPassword' });
    expect(registerAccount(registration({ username: 'admin' }), fixedId, fixedTime)).toMatchObject({ field: 'username' });
    window.localStorage.setItem('writespace_users', JSON.stringify([{ id: 'old', username: 'JAMIE' }]));
    expect(registerAccount(registration(), fixedId, fixedTime)).toMatchObject({ field: 'username' });
  });

  it('persists a user-only account and creates its session', () => {
    const result = registerAccount(registration(), fixedId, fixedTime);
    expect(result.ok).toBe(true);
    expect(result.user).toMatchObject({ id: 'user-123', role: 'user', createdAt: fixedTime() });
    expect(getUsers()).toHaveLength(1);
    expect(getSession()).toMatchObject({ userId: 'user-123', role: 'user' });
  });

  it('rejects non-text fields and oversized registration values', () => {
    expect(registerAccount(registration({ displayName: { unsafe: true } }), fixedId, fixedTime)).toMatchObject({ ok: false, field: 'form' });
    const longNameResult = registerAccount(registration({ displayName: 'x'.repeat(10001) }), fixedId, fixedTime);
    expect(longNameResult.ok).toBe(true);
    expect(longNameResult.user.displayName).toHaveLength(10001);
  });

  it('rolls back a saved user when writing the new session fails', () => {
    let writes = 0;
    const originalSetItem = Storage.prototype.setItem.bind(window.localStorage);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      writes += 1;
      if (key === 'writespace_session') throw new Error('session storage blocked');
      return originalSetItem(key, value);
    });
    const result = registerAccount(registration(), fixedId, fixedTime);
    expect(result).toMatchObject({ ok: false, field: 'form' });
    expect(getUsers()).toEqual([]);
    expect(getSession()).toBeNull();
    expect(writes).toBe(3);
  });

  it('rejects missing user deletions without altering stored accounts', () => {
    window.localStorage.setItem('writespace_users', JSON.stringify([{ id: 'other', username: 'other' }]));
    expect(deleteManagedUser('missing', 'current')).toMatchObject({ ok: false, error: 'User not found.' });
    expect(getUsers()).toHaveLength(1);
  });

  it('reports deletion write failures without claiming success', () => {
    window.localStorage.setItem('writespace_users', JSON.stringify([{ id: 'other', username: 'other' }]));
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(deleteManagedUser('other', 'current')).toMatchObject({ ok: false, error: expect.stringContaining('could not be deleted') });
  });

  it('returns a useful failure when local storage rejects account writes', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(registerAccount(registration(), fixedId, fixedTime)).toMatchObject({ ok: false, field: 'form' });
  });

  it('protects default admin and the current account from deletion', () => {
    expect(deleteManagedUser(DEFAULT_ADMIN_ID, 'other')).toMatchObject({ ok: false });
    expect(deleteManagedUser('self', 'self')).toMatchObject({ ok: false });
    window.localStorage.setItem('writespace_users', JSON.stringify([{ id: 'other', username: 'other' }]));
    expect(deleteManagedUser('other', 'current')).toEqual({ ok: true });
    expect(getUsers()).toEqual([]);
  });
});
