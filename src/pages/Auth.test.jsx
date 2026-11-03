import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import { getSession } from '../utils/storage';

afterEach(() => cleanup());
beforeEach(() => window.localStorage.clear());

function renderAuth(path = '/login') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blogs" element={<p>Blog workspace</p>} />
        <Route path="/admin" element={<p>Admin workspace</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('authentication screens', () => {
  it('shows invalid credentials inline and does not set a session', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.type(screen.getByLabelText('Username'), 'reader');
    await user.type(screen.getByLabelText('Password'), 'bad');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid username or password.');
    expect(getSession()).toBeNull();
  });

  it('routes admin login to admin workspace', async () => {
    const user = userEvent.setup();
    renderAuth();
    await user.type(screen.getByLabelText('Username'), 'admin');
    await user.type(screen.getByLabelText('Password'), 'admin');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Admin workspace')).toBeInTheDocument();
  });

  it('displays password mismatch feedback for registration', async () => {
    const user = userEvent.setup();
    renderAuth('/register');
    await user.type(screen.getByLabelText('Display Name'), 'Jamie Writer');
    await user.type(screen.getByLabelText('Username'), 'jamie');
    await user.type(screen.getByLabelText('Password'), 'first');
    await user.type(screen.getByLabelText('Confirm Password'), 'second');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(getSession()).toBeNull();
  });

  it('registers a reader, establishes session, and routes to blogs', async () => {
    const user = userEvent.setup();
    renderAuth('/register');
    await user.type(screen.getByLabelText('Display Name'), 'Jamie Writer');
    await user.type(screen.getByLabelText('Username'), 'jamie');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.type(screen.getByLabelText('Confirm Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Blog workspace')).toBeInTheDocument();
    expect(getSession()).toMatchObject({ username: 'jamie', role: 'user' });
  });

  it('provides a home link and handles empty invalid submit via required controls', async () => {
    renderAuth('/login');
    expect(screen.getByRole('link', { name: 'WriteSpace' })).toHaveAttribute('href', '/');
    fireEvent.submit(screen.getByRole('button', { name: 'Log in' }).closest('form'));
    await waitFor(() => expect(screen.getByLabelText('Username')).toBeRequired());
  });
});
