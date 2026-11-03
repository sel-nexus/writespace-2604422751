import { getPosts, getUsers } from './storage';
import { DEFAULT_ADMIN, DEFAULT_ADMIN_ID, addManagedUser, deleteManagedUser } from './auth';
import { listPosts } from './posts';

/** Return the local accounts including the immutable default administrator. */
export function listManagedUsers() {
  return [DEFAULT_ADMIN, ...getUsers()];
}

/** Compute dashboard counts while preserving the supplied duplicate user labels. */
export function getDashboardStats() {
  const users = listManagedUsers();
  const posts = getPosts();
  const admins = users.filter((user) => user.role === 'admin').length;
  return [
    { label: 'Total Posts', value: posts.length, accent: 'indigo' },
    { label: 'Total Users', value: users.length, accent: 'pink' },
    { label: 'Total Admins', value: admins, accent: 'violet' },
    { label: 'Total users', value: users.filter((user) => user.role === 'user').length, accent: 'teal' },
  ];
}

/** Return the five most recently created posts. */
export function recentPosts() {
  return listPosts(getPosts()).slice(0, 5);
}

export { addManagedUser, deleteManagedUser, DEFAULT_ADMIN_ID };
