import { test, expect } from '@playwright/test';

test.describe('blog authoring and ownership', () => {
  test('registered writer can create, read, edit and delete their own post', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/register');
    await page.getByLabel('Display Name').fill('Jordan Writer');
    await page.getByLabel('Username').fill('jordan');
    await page.getByLabel('Password', { exact: true }).fill('write123');
    await page.getByLabel('Confirm Password').fill('write123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/blogs$/);
    await page.getByRole('link', { name: 'Write a post' }).click();
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
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Delete post' }).click();
    await expect(page).toHaveURL(/\/blogs$/);
    await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});
