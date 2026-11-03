import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addManagedUser, DEFAULT_ADMIN_ID, deleteManagedUser, getDashboardStats, listManagedUsers, recentPosts } from './admin';
import { getUsers, savePosts } from './storage';

beforeEach(() => window.localStorage.clear());
const account = (overrides = {}) => ({ displayName: 'Riley Writer', username: 'riley', password: 'pass', role: 'user', ...overrides });

describe('administrator account and dashboard operations', () => {
  it('creates unique local users or admins with id and timestamp', () => {
    const result = addManagedUser(account({ role: 'admin' }), () => 'admin-created', () => '2026-03-04T12:00:00Z');
    expect(result).toMatchObject({ ok: true, user: { id: 'admin-created', role: 'admin', createdAt: '2026-03-04T12:00:00Z' } });
    expect(getUsers()).toEqual([result.user]);
  });

  it('rejects missing data, invalid role, duplicate and reserved admin names', () => {
    expect(addManagedUser(account({ username: '' })).ok).toBe(false);
    expect(addManagedUser(account({ role: 'root' })).ok).toBe(false);
    expect(addManagedUser(account({ username: 'admin' })).error).toContain('already taken');
    addManagedUser(account());
    expect(addManagedUser(account({ username: 'RILEY' })).error).toContain('already taken');
  });

  it('reports storage write failures for create and delete', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(addManagedUser(account())).toMatchObject({ ok: false, error: expect.stringContaining('could not be saved') });
  });

  it('includes immutable default admin and computes the four requested dashboard values', () => {
    savePosts([{ id: 'p1' }, { id: 'p2' }]);
    addManagedUser(account({ username: 'admin2', role: 'admin' }));
    addManagedUser(account({ username: 'user2', role: 'user' }));
    expect(listManagedUsers().some((user) => user.id === DEFAULT_ADMIN_ID)).toBe(true);
    expect(getDashboardStats().map(({ label, value }) => [label, value])).toEqual([
      ['Total Posts', 2], ['Total Users', 3], ['Total Admins', 2], ['Total users', 1],
    ]);
  });

  it('returns newest five posts only', () => {
    savePosts(Array.from({ length: 7 }, (_, index) => ({ id: String(index), createdAt: `2026-03-0${index + 1}T00:00:00Z` })));
    expect(recentPosts().map((post) => post.id)).toEqual(['6', '5', '4', '3', '2']);
  });

  it('rejects default-admin, self, and missing deletions but removes a valid account', () => {
    addManagedUser(account());
    const user = getUsers()[0];
    expect(deleteManagedUser(DEFAULT_ADMIN_ID, 'other').ok).toBe(false);
    expect(deleteManagedUser(user.id, user.id).ok).toBe(false);
    expect(deleteManagedUser('missing', 'other').ok).toBe(false);
    expect(deleteManagedUser(user.id, 'other')).toEqual({ ok: true });
    expect(getUsers()).toEqual([]);
  });
});
