import { test, expect } from '@playwright/test';

test.describe('administrator management', () => {
  test('admin manages local users and protected accounts', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
    await page.getByLabel('Username').fill('admin');
    await page.getByLabel('Password').fill('admin');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole('heading', { name: 'Admin dashboard' })).toBeVisible();
    await expect(page.getByText('Total Admins')).toBeVisible();
    await page.getByRole('link', { name: 'Manage users' }).click();
    await expect(page.getByRole('heading', { name: 'People in your space' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Default admin cannot be deleted/ })).toBeDisabled();
    await page.getByLabel('Display Name').fill('Casey Contributor');
    await page.getByLabel('Username').fill('casey');
    await page.getByLabel('Password').fill('pass123');
    await page.getByLabel('Role').selectOption('user');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('status')).toContainText('Casey Contributor was added as a user.');
    await expect(page.getByText('@casey')).toBeVisible();
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete Casey Contributor' }).click();
    await expect(page.getByText('@casey')).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test('non-admin cannot open dashboard or user management', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('writespace_session', JSON.stringify({ userId: 'u1', username: 'reader', displayName: 'Reader', role: 'user' }));
    });
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/blogs$/);
    await page.goto('/users');
    await expect(page).toHaveURL(/\/blogs$/);
  });
});
