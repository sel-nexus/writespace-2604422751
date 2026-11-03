import { test, expect } from '@playwright/test';

function collectErrors(page, errors) {
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
}

test.describe('blog authoring and ownership', () => {
  test('registered writer can create, read, edit and delete their own post', async ({ page }) => {
    const consoleErrors = [];
    collectErrors(page, consoleErrors);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('link', { name: 'Get started', exact: true }).click();
    await page.getByLabel('Display Name').fill('Jordan Writer');
    await page.getByLabel('Username').fill('jordan');
    await page.getByLabel('Password', { exact: true }).fill('write123');
    await page.getByLabel('Confirm Password').fill('write123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/blogs$/);
    await expect(page.getByRole('heading', { name: 'The community blog' })).toBeVisible();
    await page.getByRole('link', { name: 'Write a post' }).click();
    const postsBeforeEmptySubmit = await page.evaluate(() => localStorage.getItem('writespace_posts'));
    await page.getByRole('button', { name: 'Publish post' }).click();
    await expect(page).toHaveURL(/\/write$/);
    await expect.poll(() => page.evaluate(() => localStorage.getItem('writespace_posts'))).toBe(postsBeforeEmptySubmit);
    await expect(page.getByLabel('Title')).toBeVisible();
    expect(await page.getByLabel('Title').evaluate((field) => field.validity.valueMissing)).toBe(true);
    await page.getByLabel('Title').fill('Notes from the morning');
    await page.getByLabel('Content').fill('The first quiet hour\nmade the day feel wide.');
    await page.getByRole('button', { name: 'Publish post' }).click();
    await expect(page).toHaveURL(/\/blog\//);
    await expect(page.getByRole('heading', { name: 'Notes from the morning' })).toBeVisible();
    await expect(page.getByText('The first quiet hour\nmade the day feel wide.')).toBeVisible();
    await page.getByRole('link', { name: 'Edit post' }).click();
    await page.getByLabel('Title').fill('Notes from a wider morning');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('heading', { name: 'Notes from a wider morning' })).toBeVisible();
    await page.getByRole('link', { name: 'Back to all posts' }).click();
    await expect(page).toHaveURL(/\/blogs$/);
    await expect(page.getByRole('heading', { name: 'Notes from a wider morning' })).toBeVisible();
    await page.getByRole('link', { name: 'Edit Notes from a wider morning' }).click();
    await page.getByLabel('Title').fill('Notes from the widest morning');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('heading', { name: 'Notes from the widest morning' })).toBeVisible();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete post' }).click();
    await expect(page).toHaveURL(/\/blogs$/);
    await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test('authenticated Navbar Write link opens the editor independently of the blog call to action', async ({ page }) => {
    const errors = [];
    collectErrors(page, errors);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('link', { name: 'Get started', exact: true }).click();
    await page.getByLabel('Display Name').fill('Morgan Writer');
    await page.getByLabel('Username').fill('morgan');
    await page.getByLabel('Password', { exact: true }).fill('write123');
    await page.getByLabel('Confirm Password').fill('write123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/blogs$/);
    await page.getByRole('navigation').getByRole('link', { name: 'Write', exact: true }).click();
    await expect(page).toHaveURL(/\/write$/);
    await expect(page.getByRole('heading', { name: 'Write a new post' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('admin can edit and delete another writer post with confirmation', async ({ page }) => {
    const consoleErrors = [];
    collectErrors(page, consoleErrors);
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('writespace_session', JSON.stringify({ userId: 'writespace-default-admin', username: 'admin', displayName: 'Admin', role: 'admin' }));
      localStorage.setItem('writespace_posts', JSON.stringify([{ id: 'writer-post', title: 'A public thought', content: 'A little idea from the community.', createdAt: '2026-03-04T12:00:00Z', authorId: 'writer', authorName: 'Sam' }]));
    });
    await page.reload();
    await page.getByRole('link', { name: 'A public thought' }).click();
    await expect(page.getByRole('heading', { name: 'A public thought' })).toBeVisible();
    await page.getByRole('link', { name: 'Edit post' }).click();
    await page.getByLabel('Title').fill('An edited public thought');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('heading', { name: 'An edited public thought' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts'))[0])).toMatchObject({
      id: 'writer-post', title: 'An edited public thought', authorId: 'writer', authorName: 'Sam',
    });
    let deleteConfirmed = false;
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      deleteConfirmed = true;
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Delete post' }).click();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('writespace_posts') || '[]').some((post) => post.id === 'writer-post'))).toBe(false);
    expect(deleteConfirmed).toBe(true);
    expect(consoleErrors).toEqual([]);
  });
});
