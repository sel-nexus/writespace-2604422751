import { test, expect } from '@playwright/test';

function collectErrors(page, errors) {
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
}

test.describe('static app operations', () => {
  test('direct SPA routes work and session/post data survives reload', async ({ page, context }) => {
    const errors = [];
    collectErrors(page, errors);
    await page.goto('/register');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByLabel('Display Name').fill('Robin Reader');
    await page.getByLabel('Username').fill('robin');
    await page.getByLabel('Password', { exact: true }).fill('pass123');
    await page.getByLabel('Confirm Password').fill('pass123');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/blogs$/);
    await page.getByRole('link', { name: 'Write a post' }).click();
    await page.getByLabel('Title').fill('A thought that stays');
    await page.getByLabel('Content').fill('This browser remembers my words.');
    await page.getByRole('button', { name: 'Publish post' }).click();
    const detailUrl = page.url();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'A thought that stays' })).toBeVisible();
    await expect(page.getByText('This browser remembers my words.')).toBeVisible();
    await page.locator('a[href="/blogs"]:visible').first().click();
    await expect(page.getByRole('heading', { name: 'The community blog' })).toBeVisible();
    // A fresh page's initial navigation deliberately verifies SPA deep-link fallback for a saved post.
    const deepLinkPage = await context.newPage();
    collectErrors(deepLinkPage, errors);
    await deepLinkPage.goto(detailUrl);
    await expect(deepLinkPage.getByRole('heading', { name: 'A thought that stays' })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('a[href^="/blog/"]').filter({ hasText: 'A thought that stays' }).click();
    await expect(page.getByRole('heading', { name: 'A thought that stays' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('guest preview post routes to login, and login return home remains usable', async ({ page }) => {
    const errors = [];
    collectErrors(page, errors);
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('writespace_posts', JSON.stringify([{ id: 'preview1', title: 'A public thought', content: 'A little idea from the community.', createdAt: '2026-03-04T12:00:00Z', authorId: 'writer', authorName: 'Sam' }]));
    });
    await page.reload();
    await page.getByRole('link', { name: 'A public thought' }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.getByRole('link', { name: 'WriteSpace home' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Your thoughts.');
    expect(errors).toEqual([]);
  });
});
