import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BlogList from './BlogList';
import BlogDetail from './BlogDetail';
import PostEditor from './PostEditor';
import { setSession, savePosts } from '../utils/storage';

const ownedPost = { id: 'p1', title: 'A gentle beginning', content: 'First line\nSecond line', createdAt: '2026-03-04T12:00:00.000Z', authorId: 'u1', authorName: 'Jamie Writer' };
const otherPost = { id: 'p2', title: 'Another perspective', content: 'A note from someone else.', createdAt: '2026-03-05T12:00:00.000Z', authorId: 'u2', authorName: 'Morgan' };

beforeEach(() => {
  window.localStorage.clear();
  setSession({ userId: 'u1', username: 'jamie', displayName: 'Jamie Writer', role: 'user' });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function renderRoute(path) {
  return render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/blogs" element={<BlogList />} />
    <Route path="/blog/:id" element={<BlogDetail />} />
    <Route path="/write" element={<PostEditor />} />
    <Route path="/edit/:id" element={<PostEditor editMode />} />
  </Routes></MemoryRouter>);
}

describe('blog and editor pages', () => {
  it('shows an empty message and a write call to action', () => {
    renderRoute('/blogs');
    expect(screen.getByText('No blogs yet. Be the first to write one!')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Write a post/i })).toHaveAttribute('href', '/write');
  });

  it('renders posts newest first and only offers editing to the author', () => {
    savePosts([ownedPost, otherPost]);
    renderRoute('/blogs');
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[0]).toHaveTextContent('Another perspective');
    expect(screen.getByRole('link', { name: 'Edit A gentle beginning' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Edit Another perspective' })).not.toBeInTheDocument();
    expect(screen.getByText(/First line\s+Second line/)).toBeInTheDocument();
  });

  it('shows detail content and only owner controls', () => {
    savePosts([ownedPost, otherPost]);
    renderRoute('/blog/p1');
    expect(screen.getByRole('heading', { name: 'A gentle beginning' })).toBeInTheDocument();
    expect(screen.getByText(/First line\s+Second line/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit post' })).toHaveAttribute('href', '/edit/p1');
    expect(screen.getByRole('button', { name: 'Delete post' })).toBeInTheDocument();
  });

  it('shows a helpful missing-post state', () => {
    renderRoute('/blog/missing');
    expect(screen.getByRole('heading', { name: 'Post not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to all posts' })).toHaveAttribute('href', '/blogs');
  });

  it('shows inline required field validation and character count', async () => {
    const user = userEvent.setup();
    renderRoute('/write');
    expect(screen.getByText('0 characters')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Publish post' }));
    expect(await screen.findByText('Title and content are required.')).toBeInTheDocument();
  });

  it('creates and saves a post then routes to the saved detail page', async () => {
    const user = userEvent.setup();
    renderRoute('/write');
    await user.type(screen.getByLabelText('Title'), 'Small morning note');
    await user.type(screen.getByLabelText('Content'), 'The light changed.');
    await user.click(screen.getByRole('button', { name: 'Publish post' }));
    expect(await screen.findByRole('heading', { name: 'Small morning note' })).toBeInTheDocument();
    expect(window.localStorage.getItem('writespace_posts')).toContain('The light changed.');
  });

  it('pre-fills owned post edits and sends unauthorized user to list', async () => {
    savePosts([ownedPost, otherPost]);
    const { unmount } = renderRoute('/edit/p1');
    expect(await screen.findByDisplayValue('A gentle beginning')).toBeInTheDocument();
    unmount();
    renderRoute('/edit/p2');
    expect(await screen.findByRole('heading', { name: 'The community blog' })).toBeInTheDocument();
  });

  it('confirms deletion and leaves a post unchanged when cancelled', async () => {
    const user = userEvent.setup();
    savePosts([ownedPost]);
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderRoute('/blog/p1');
    await user.click(screen.getByRole('button', { name: 'Delete post' }));
    expect(JSON.parse(window.localStorage.getItem('writespace_posts'))).toHaveLength(1);
  });
});
