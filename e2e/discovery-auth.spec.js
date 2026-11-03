import { test, expect } from '@playwright/test';

test.describe('WriteSpace discovery and identity', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('guest discovers WriteSpace, sees empty blog state and can reach auth', async ({ page }) => {
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Your thoughts.');
    await expect(page.getByRole('heading', { name: 'Latest from the Blog' })).toBeVisible();
    await expect(page.getByText('No posts yet — check back soon!')).toBeVisible();
    await page.getByRole('link', { name: 'Get started', exact: true }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: 'Make a little room' })).toBeVisible();
    await page.getByRole('link', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect(errors).toEqual([]);
  });

  test('reader registers, persists a session, logs out and default admin can sign in', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel('Display Name').fill('Taylor Reader');
    await page.getByLabel('Username').fill('taylor');
    await page.getByLabel('Password', { exact: true }).fill('pass123');
    await page.getByLabel('Confirm Password').fill('pass123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/blogs$/);
    await expect(page.getByText('Blog workspace is being prepared.')).toBeVisible();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('writespace_session'))?.username)).toBe('taylor');
    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL('/');
    await page.getByRole('link', { name: 'Log in' }).click();
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('admin');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText('Admin workspace is being prepared.')).toBeVisible();
  });
});
