import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearSession, getPosts, getSession, getUsers, savePosts, saveUsers, setSession, storageKeys } from './storage';

beforeEach(() => {
  window.localStorage.clear();
});

describe('local storage helpers', () => {
  it('reads and writes posts and users under the documented keys', () => {
    const posts = [{ id: 'p1', title: 'A note' }];
    const users = [{ id: 'u1', username: 'reader' }];
    savePosts(posts);
    saveUsers(users);
    expect(getPosts()).toEqual(posts);
    expect(getUsers()).toEqual(users);
    expect(storageKeys.posts).toBe('writespace_posts');
    expect(storageKeys.users).toBe('writespace_users');
  });

  it('falls back to empty arrays for malformed JSON or non-array values', () => {
    window.localStorage.setItem(storageKeys.posts, '{bad json');
    window.localStorage.setItem(storageKeys.users, JSON.stringify({ username: 'not-an-array' }));
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
  });

  it('returns safe empty values when browser storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
    expect(getSession()).toBeNull();
  });

  it('validates session shape and clears it on logout', () => {
    window.localStorage.setItem(storageKeys.session, JSON.stringify({ userId: 'u1', role: 'root' }));
    expect(getSession()).toBeNull();
    const session = { userId: 'u1', role: 'user', username: 'reader', displayName: 'Reader' };
    setSession(session);
    expect(getSession()).toEqual(session);
    clearSession();
    expect(getSession()).toBeNull();
  });

  it('rejects invalid values instead of writing malformed data', () => {
    expect(() => savePosts({ id: 'wrong-shape' })).toThrow(TypeError);
    expect(() => setSession({ userId: 'u1', role: 'visitor' })).toThrow(TypeError);
  });
});
