import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import UserManagement from './UserManagement';
import ProtectedRoute from '../components/ProtectedRoute';
import { addManagedUser } from '../utils/admin';
import { savePosts, setSession } from '../utils/storage';

const post = { id: 'p1', title: 'A local story', content: 'Words stay in the browser.', createdAt: '2026-03-04T12:00:00Z', authorId: 'u1', authorName: 'Jamie' };
const admin = { userId: 'admin-1', username: 'admin2', displayName: 'Avery Admin', role: 'admin' };
const reader = { userId: 'user-1', username: 'reader', displayName: 'Reader', role: 'user' };

beforeEach(() => { window.localStorage.clear(); setSession(admin); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function renderAt(path, child) {
  return render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/admin" element={<ProtectedRoute adminOnly>{child === 'dashboard' ? <AdminDashboard /> : <UserManagement />}</ProtectedRoute>} />
    <Route path="/users" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>} />
    <Route path="/blogs" element={<p>Blog destination</p>} />
    <Route path="/login" element={<p>Login destination</p>} />
    <Route path="/" element={<p>Home destination</p>} />
  </Routes></MemoryRouter>);
}

describe('administrator pages and access boundaries', () => {
  it('shows all four metrics, quick actions and latest post controls', () => {
    savePosts([post]);
    renderAt('/admin', 'dashboard');
    expect(screen.getByRole('heading', { name: 'Admin dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Total Posts')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Total Admins')).toBeInTheDocument();
    expect(screen.getByText('Total users')).toBeInTheDocument();
    expect(screen.getByText('A local story')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Write new post' })).toHaveAttribute('href', '/write');
    expect(screen.getByRole('link', { name: 'Manage users' })).toHaveAttribute('href', '/users');
  });

  it('shows no recent items when there are no posts', () => {
    renderAt('/admin', 'dashboard');
    expect(screen.getByText(/No posts yet/)).toBeInTheDocument();
  });

  it('creates a unique admin-created user and displays inline duplicate feedback', async () => {
    const user = userEvent.setup();
    renderAt('/users', 'users');
    await user.type(screen.getByLabelText('Display Name'), 'Riley Reader');
    await user.type(screen.getByLabelText('Username'), 'riley');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.selectOptions(screen.getByLabelText('Role'), 'user');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Riley Reader was added as a user.');
    expect(screen.getByText('@riley')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Display Name'), 'Riley Again');
    await user.type(screen.getByLabelText('Username'), 'RILEY');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('already taken');
  });

  it('disables default-admin and self delete buttons with explanatory tooltips', () => {
    addManagedUser({ displayName: 'Avery Admin', username: 'admin2', password: 'secret', role: 'admin' }, () => 'admin-1');
    renderAt('/users', 'users');
    expect(screen.getAllByRole('button', { name: /Default admin cannot be deleted/ }).every((button) => button.disabled)).toBe(true);
    expect(screen.getAllByRole('button', { name: /You cannot delete your own account/ }).every((button) => button.disabled)).toBe(true);
  });

  it('requires confirmation before removing an account', async () => {
    const user = userEvent.setup();
    addManagedUser({ displayName: 'Taylor', username: 'taylor', password: 'secret', role: 'user' }, () => 'taylor-id');
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderAt('/users', 'users');
    await user.click(screen.getAllByRole('button', { name: 'Delete Taylor' })[0]);
    expect(screen.getByText('@taylor')).toBeInTheDocument();
  });

  it('redirects non-admins away from restricted routes', async () => {
    window.localStorage.setItem('writespace_session', JSON.stringify(reader));
    renderAt('/admin', 'dashboard');
    expect(await screen.findByText('Blog destination')).toBeInTheDocument();
  });
});
