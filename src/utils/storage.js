const KEYS = {
  posts: 'writespace_posts',
  users: 'writespace_users',
  session: 'writespace_session',
};

/** Read a JSON array from browser storage, returning an empty array on failure. */
function readArray(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

/** Write a JSON array to browser storage. */
function writeArray(key, value) {
  if (!Array.isArray(value)) throw new TypeError('Stored collection must be an array.');
  window.localStorage.setItem(key, JSON.stringify(value));
}

/** Return saved posts in newest-first order. */
export function getPosts() {
  return readArray(KEYS.posts);
}

/** Persist a complete posts collection. */
export function savePosts(posts) {
  writeArray(KEYS.posts, posts);
}

/** Return saved user accounts. */
export function getUsers() {
  return readArray(KEYS.users);
}

/** Persist a complete user collection. */
export function saveUsers(users) {
  writeArray(KEYS.users, users);
}

/** Return the active browser session, or null when it cannot be read. */
export function getSession() {
  try {
    const raw = window.localStorage.getItem(KEYS.session);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || typeof session !== 'object' || !['admin', 'user'].includes(session.role) || !session.userId) return null;
    return session;
  } catch {
    return null;
  }
}

/** Persist a session and notify mounted navigation components. */
export function setSession(session) {
  if (!session || !['admin', 'user'].includes(session.role) || !session.userId) {
    throw new TypeError('A valid user session is required.');
  }
  window.localStorage.setItem(KEYS.session, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent('writespace:session'));
}

/** Remove the active session and notify mounted navigation components. */
export function clearSession() {
  window.localStorage.removeItem(KEYS.session);
  window.dispatchEvent(new CustomEvent('writespace:session'));
}

export const storageKeys = Object.freeze(KEYS);
