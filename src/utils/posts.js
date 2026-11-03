import { getPosts, savePosts } from './storage';
import { DEFAULT_ADMIN_ID } from './auth';

/** Return all posts newest first, preserving stable order for equal dates. */
export function listPosts(posts = getPosts()) {
  return [...posts].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

/** Create and persist a post using the active author's identity. */
export function createPost({ title, content }, session, idFactory = () => crypto.randomUUID(), now = () => new Date().toISOString()) {
  if (typeof title !== 'string' || typeof content !== 'string') return { ok: false, error: 'Title and content must be text.' };
  const cleanTitle = title.trim();
  const cleanContent = content.trim();
  if (!session?.userId || !['admin', 'user'].includes(session.role)) return { ok: false, error: 'Sign in before writing a post.' };
  if (!cleanTitle || !cleanContent) return { ok: false, field: !cleanTitle ? 'title' : 'content', error: 'Title and content are required.' };
  const post = { id: idFactory(), title: cleanTitle, content: cleanContent, createdAt: now(), authorId: session.userId, authorName: session.displayName };
  try {
    savePosts([...getPosts(), post]);
    return { ok: true, post };
  } catch {
    return { ok: false, error: 'Your post could not be saved. Check browser storage and try again.' };
  }
}

/** Update a post when its author or an administrator owns the operation. */
export function updatePost(postId, { title, content }, session) {
  if (typeof title !== 'string' || typeof content !== 'string') return { ok: false, error: 'Title and content must be text.' };
  const cleanTitle = title.trim();
  const cleanContent = content.trim();
  if (!cleanTitle || !cleanContent) return { ok: false, field: !cleanTitle ? 'title' : 'content', error: 'Title and content are required.' };
  const posts = getPosts();
  const post = posts.find((entry) => entry.id === postId);
  if (!post) return { ok: false, error: 'Post not found.' };
  if (!session?.userId || (session.role !== 'admin' && post.authorId !== session.userId)) return { ok: false, error: 'You cannot edit this post.' };
  const updated = { ...post, title: cleanTitle, content: cleanContent };
  try {
    savePosts(posts.map((entry) => (entry.id === postId ? updated : entry)));
    return { ok: true, post: updated };
  } catch {
    return { ok: false, error: 'Your changes could not be saved. Check browser storage and try again.' };
  }
}

/** Delete a post when its author or an administrator confirms the operation. */
export function deletePost(postId, session) {
  const posts = getPosts();
  const post = posts.find((entry) => entry.id === postId);
  if (!post) return { ok: false, error: 'Post not found.' };
  if (!session?.userId || (session.role !== 'admin' && post.authorId !== session.userId)) return { ok: false, error: 'You cannot delete this post.' };
  try {
    savePosts(posts.filter((entry) => entry.id !== postId));
    return { ok: true };
  } catch {
    return { ok: false, error: 'The post could not be deleted. Check browser storage and try again.' };
  }
}

/** Check whether the session may manage the specified post. */
export function canManagePost(post, session) {
  return Boolean(session?.userId && post && (session.role === 'admin' || post.authorId === session.userId || (session.role === 'admin' && post.authorId === DEFAULT_ADMIN_ID)));
}

/** Return the compact preview required by the blog cards. */
export function excerpt(content, length = 120) {
  return String(content ?? '').slice(0, length);
}
