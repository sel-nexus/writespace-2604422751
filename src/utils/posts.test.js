import { beforeEach, describe, expect, it, vi } from 'vitest';
import { canManagePost, createPost, deletePost, excerpt, listPosts, updatePost } from './posts';
import { getPosts, savePosts } from './storage';

beforeEach(() => window.localStorage.clear());
const user = { userId: 'u1', role: 'user', displayName: 'Jamie' };
const admin = { userId: 'a1', role: 'admin', displayName: 'Admin' };
const other = { userId: 'u2', role: 'user', displayName: 'Other' };
const post = { id: 'p1', title: 'First', content: 'line one\nline two', createdAt: '2026-03-04T12:00:00.000Z', authorId: 'u1', authorName: 'Jamie' };

describe('post workflows', () => {
  it('creates a post with author data and stable generated identity/time', () => {
    const result = createPost({ title: '  A note ', content: ' A thought ' }, user, () => 'p-created', () => '2026-03-04T12:00:00.000Z');
    expect(result).toMatchObject({ ok: true, post: { id: 'p-created', title: 'A note', content: 'A thought', authorId: 'u1', authorName: 'Jamie' } });
    expect(getPosts()).toEqual([result.post]);
  });

  it('rejects missing session and missing title/content', () => {
    expect(createPost({ title: 't', content: 'c' }, null).ok).toBe(false);
    expect(createPost({ title: ' ', content: 'c' }, user)).toMatchObject({ field: 'title' });
    expect(createPost({ title: 't', content: '' }, user)).toMatchObject({ field: 'content' });
  });

  it('reports local storage failure rather than claiming to save', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(createPost({ title: 'T', content: 'C' }, user)).toMatchObject({ ok: false, error: expect.stringContaining('could not be saved') });
  });

  it('sorts newest first and creates the exact-length excerpt', () => {
    savePosts([{ ...post, id: 'older', createdAt: '2026-03-01T00:00:00Z' }, { ...post, id: 'newer', createdAt: '2026-03-05T00:00:00Z' }]);
    expect(listPosts().map((entry) => entry.id)).toEqual(['newer', 'older']);
    expect(excerpt('x'.repeat(140))).toHaveLength(120);
  });

  it('updates owned posts, rejects invalid fields, missing ids and another owner', () => {
    savePosts([post]);
    expect(updatePost('p1', { title: 'Updated', content: 'Changed' }, user).post.title).toBe('Updated');
    expect(updatePost('p1', { title: '', content: 'x' }, user)).toMatchObject({ field: 'title' });
    expect(updatePost('missing', { title: 'x', content: 'y' }, user)).toMatchObject({ error: 'Post not found.' });
    expect(updatePost('p1', { title: 'x', content: 'y' }, other)).toMatchObject({ error: 'You cannot edit this post.' });
    expect(updatePost('p1', { title: 'Admin edit', content: 'y' }, admin).ok).toBe(true);
  });

  it('deletes owned or admin-selected posts and rejects unauthorized or absent post', () => {
    savePosts([post]);
    expect(deletePost('p1', other)).toMatchObject({ ok: false });
    expect(getPosts()).toHaveLength(1);
    expect(deletePost('missing', admin)).toMatchObject({ error: 'Post not found.' });
    expect(deletePost('p1', admin)).toEqual({ ok: true });
    expect(getPosts()).toEqual([]);
  });

  it('exposes ownership-aware card actions', () => {
    expect(canManagePost(post, user)).toBe(true);
    expect(canManagePost(post, other)).toBe(false);
    expect(canManagePost(post, admin)).toBe(true);
    expect(canManagePost(post, null)).toBe(false);
  });
});
