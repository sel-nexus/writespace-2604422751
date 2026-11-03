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
    expect(createPost({ title: { text: 'x' }, content: 'y' }, user)).toMatchObject({ ok: false, error: 'Title and content must be text.' });
    expect(createPost({ title: 'x'.repeat(10001), content: 'y'.repeat(20001) }, user)).toMatchObject({ ok: true });
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
    expect(getPosts()).toEqual([{ ...post, title: 'Updated', content: 'Changed' }]);
    expect(updatePost('p1', { title: '', content: 'x' }, user)).toMatchObject({ field: 'title' });
    expect(updatePost('missing', { title: 'x', content: 'y' }, user)).toMatchObject({ error: 'Post not found.' });
    expect(updatePost('p1', { title: 'x', content: 'y' }, other)).toMatchObject({ error: 'You cannot edit this post.' });
    expect(updatePost('p1', { title: 'Admin edit', content: 'y' }, admin).ok).toBe(true);
  });

  it('rejects non-text update fields without changing saved data and accepts large text as unspecified', () => {
    savePosts([post]);
    expect(updatePost('p1', { title: { text: 'bad' }, content: 'content' }, user)).toMatchObject({ ok: false, error: 'Title and content must be text.' });
    expect(getPosts()).toEqual([post]);
    const longContent = 'z'.repeat(20001);
    expect(updatePost('p1', { title: 'Long note', content: longContent }, user).ok).toBe(true);
    expect(getPosts()[0].content).toHaveLength(20001);
  });

  it('reports update storage failures and leaves the prior saved post unchanged', () => {
    savePosts([post]);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(updatePost('p1', { title: 'Updated', content: 'Changed' }, user)).toMatchObject({ ok: false, error: expect.stringContaining('could not be saved') });
    expect(getPosts()).toEqual([post]);
  });

  it('deletes owned or admin-selected posts and rejects unauthorized or absent post', () => {
    savePosts([post]);
    expect(deletePost('p1', other)).toMatchObject({ ok: false });
    expect(getPosts()).toHaveLength(1);
    expect(deletePost('missing', admin)).toMatchObject({ error: 'Post not found.' });
    expect(deletePost('p1', admin)).toEqual({ ok: true });
    expect(getPosts()).toEqual([]);
  });

  it('reports delete storage failures and keeps the saved post', () => {
    savePosts([post]);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(deletePost('p1', user)).toMatchObject({ ok: false, error: expect.stringContaining('could not be deleted') });
    expect(getPosts()).toEqual([post]);
  });

  it('exposes ownership-aware card actions', () => {
    expect(canManagePost(post, user)).toBe(true);
    expect(canManagePost(post, other)).toBe(false);
    expect(canManagePost(post, admin)).toBe(true);
    expect(canManagePost(post, null)).toBe(false);
  });
});
