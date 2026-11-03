import { test, expect } from '@playwright/test';

function collectErrors(page, errors) {
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
}

test.describe('administrator management', () => {
  test('admin manages local users and protected accounts', async ({ page }) => {
    const consoleErrors = [];
    collectErrors(page, consoleErrors);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('link', { name: 'Log in' }).click();
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
    const caseyRow = page.getByRole('row').filter({ hasText: 'Casey Contributor' });
    await expect(caseyRow).toBeVisible();
    page.once('dialog', (dialog) => dialog.accept());
    await caseyRow.getByRole('button', { name: 'Delete Casey Contributor' }).click();
    await expect(page.getByRole('row').filter({ hasText: 'Casey Contributor' })).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test('non-admin cannot open dashboard or user management', async ({ context }) => {
    const consoleErrors = [];
    const session = { userId: 'u1', username: 'reader', displayName: 'Reader', role: 'user' };
    for (const route of ['/admin', '/users']) {
      const guardPage = await context.newPage();
      collectErrors(guardPage, consoleErrors);
      await guardPage.addInitScript((activeSession) => {
        localStorage.clear();
        localStorage.setItem('writespace_session', JSON.stringify(activeSession));
      }, session);
      await guardPage.goto(route);
      await expect(guardPage).toHaveURL(/\/blogs$/);
    }
    expect(consoleErrors).toEqual([]);
  });

  test('guest is redirected to login from representative protected routes', async ({ context }) => {
    const consoleErrors = [];
    for (const route of ['/write', '/users']) {
      const guardPage = await context.newPage();
      collectErrors(guardPage, consoleErrors);
      await guardPage.addInitScript(() => localStorage.clear());
      await guardPage.goto(route);
      await expect(guardPage).toHaveURL(/\/login$/);
    }
    expect(consoleErrors).toEqual([]);
  });
});
