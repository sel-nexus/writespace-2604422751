import { getUsers, saveUsers, setSession } from './storage';

export const DEFAULT_ADMIN_ID = 'writespace-default-admin';
export const DEFAULT_ADMIN = Object.freeze({
  id: DEFAULT_ADMIN_ID,
  username: 'admin',
  displayName: 'Admin',
  password: 'admin',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
});

/** Return the correct workspace route for a role. */
export function homeForRole(role) {
  return role === 'admin' ? '/admin' : '/blogs';
}

/** Authenticate the demo administrator or a registered browser-local user. */
export function authenticate(username, password) {
  const cleanUsername = String(username ?? '').trim();
  const cleanPassword = String(password ?? '');
  if (cleanUsername === DEFAULT_ADMIN.username && cleanPassword === DEFAULT_ADMIN.password) {
    const session = { userId: DEFAULT_ADMIN.id, username: 'admin', displayName: 'Admin', role: 'admin' };
    setSession(session);
    return { ok: true, session };
  }
  const user = getUsers().find((entry) => entry.username.toLowerCase() === cleanUsername.toLowerCase() && entry.password === cleanPassword);
  if (!user) return { ok: false, error: 'Invalid username or password.' };
  const session = { userId: user.id, username: user.username, displayName: user.displayName, role: user.role };
  setSession(session);
  return { ok: true, session };
}

/** Register a validated local user account and start its session. */
export function registerAccount({ displayName, username, password, confirmPassword }, idFactory = () => crypto.randomUUID(), now = () => new Date().toISOString()) {
  if ([displayName, username, password, confirmPassword].some((value) => typeof value !== 'string')) return { ok: false, field: 'form', error: 'Account details must be text.' };
  const name = displayName.trim();
  const handle = username.trim();
  const secret = password;
  if (!name || !handle || !secret || !confirmPassword) return { ok: false, field: 'displayName', error: 'All fields are required.' };
  if (secret !== confirmPassword) return { ok: false, field: 'confirmPassword', error: 'Passwords do not match.' };
  const users = getUsers();
  if (handle.toLowerCase() === 'admin' || users.some((user) => user.username.toLowerCase() === handle.toLowerCase())) {
    return { ok: false, field: 'username', error: 'That username is already taken.' };
  }
  const user = { id: idFactory(), displayName: name, username: handle, password: secret, role: 'user', createdAt: now() };
  try {
    saveUsers([...users, user]);
    const session = { userId: user.id, username: user.username, displayName: user.displayName, role: user.role };
    try {
      setSession(session);
    } catch {
      saveUsers(users);
      return { ok: false, field: 'form', error: 'Your account could not be saved. Check browser storage and try again.' };
    }
    return { ok: true, user, session };
  } catch {
    return { ok: false, field: 'form', error: 'Your account could not be saved. Check browser storage and try again.' };
  }
}

/** Add an administrator-created account to local storage. */
export function addManagedUser({ displayName, username, password, role }, idFactory = () => crypto.randomUUID(), now = () => new Date().toISOString()) {
  if (typeof displayName !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
    return { ok: false, error: 'Account details must be text.' };
  }
  const name = displayName.trim();
  const handle = username.trim();
  const secret = password;
  if (!name || !handle || !secret || !['admin', 'user'].includes(role)) return { ok: false, error: 'All fields are required.' };
  const users = getUsers();
  if (handle.toLowerCase() === 'admin' || users.some((user) => user.username.toLowerCase() === handle.toLowerCase())) {
    return { ok: false, error: 'That username is already taken.' };
  }
  const user = { id: idFactory(), displayName: name, username: handle, password: secret, role, createdAt: now() };
  try {
    saveUsers([...users, user]);
    return { ok: true, user };
  } catch {
    return { ok: false, error: 'The account could not be saved. Check browser storage and try again.' };
  }
}

/** Delete an account unless it is the protected administrator or active user. */
export function deleteManagedUser(userId, currentUserId) {
  if (userId === DEFAULT_ADMIN_ID) return { ok: false, error: 'Default admin cannot be deleted.' };
  if (userId === currentUserId) return { ok: false, error: 'You cannot delete your own account.' };
  const users = getUsers();
  const remaining = users.filter((user) => user.id !== userId);
  if (remaining.length === users.length) return { ok: false, error: 'User not found.' };
  try {
    saveUsers(remaining);
    return { ok: true };
  } catch {
    return { ok: false, error: 'The account could not be deleted. Check browser storage and try again.' };
  }
}
