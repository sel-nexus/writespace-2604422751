import { test, expect } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';

const captures = [];

function collectErrors(page, errors) {
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
}

async function captureView(context, label, route, session, data, errors) {
  const page = await context.newPage();
  collectErrors(page, errors);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(({ activeSession, records }) => {
    localStorage.clear();
    if (activeSession) localStorage.setItem('writespace_session', JSON.stringify(activeSession));
    if (records.posts) localStorage.setItem('writespace_posts', JSON.stringify(records.posts));
    if (records.users) localStorage.setItem('writespace_users', JSON.stringify(records.users));
  }, { activeSession: session, records: data });
  // Each representative route is the initial navigation in its own fresh page.
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  const desktop = await page.evaluate(() => ({
    title: document.title,
    fontFamily: getComputedStyle(document.body).fontFamily,
    backgroundColor: getComputedStyle(document.body).backgroundColor,
    html: document.documentElement.outerHTML,
  }));
  const accessibility = await page.locator('body').ariaSnapshot();
  expect(accessibility).not.toBe('');
  captures.push({ label, viewport: 'desktop', route, accessibility, computed: desktop, html: await page.content() });
  await page.screenshot({ path: `artifacts/preflight-${label}-desktop.png`, fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileAccessibility = await page.locator('body').ariaSnapshot();
  expect(mobileAccessibility).not.toBe('');
  const mobile = await page.evaluate(() => ({
    fontFamily: getComputedStyle(document.body).fontFamily,
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
    html: document.documentElement.outerHTML,
  }));
  captures.push({ label, viewport: 'mobile', route, accessibility: mobileAccessibility, computed: mobile, html: await page.content() });
  await page.screenshot({ path: `artifacts/preflight-${label}-mobile.png`, fullPage: true });
  if (label === 'admin') {
    await page.getByRole('button', { name: 'Toggle navigation' }).click();
    const openNavigation = await page.locator('body').ariaSnapshot();
    expect(openNavigation).toContain('Users');
    captures.push({ label: 'admin-navigation-open', viewport: 'mobile', route, accessibility: openNavigation, html: await page.content() });
    await page.screenshot({ path: 'artifacts/preflight-admin-navigation-open-mobile.png', fullPage: true });
  }
}

test('capture representative desktop/mobile pages and directly preflight representative routes', async ({ context }) => {
  const errors = [];
  await mkdir('artifacts', { recursive: true });
  await captureView(context, 'landing', '/', null, { posts: [] }, errors);
  await captureView(context, 'login', '/login', null, { posts: [] }, errors);
  await captureView(context, 'blogs', '/blogs', { userId: 'u1', username: 'reader', displayName: 'Reader', role: 'user' }, {
    posts: [{ id: 'preflight-post', title: 'A field note from a quiet morning', content: 'A thought worth returning to.\nA second line to check whitespace.', createdAt: '2026-03-04T12:00:00Z', authorId: 'u1', authorName: 'Reader' }],
  }, errors);
  await captureView(context, 'admin', '/admin', { userId: 'writespace-default-admin', username: 'admin', displayName: 'Admin', role: 'admin' }, { posts: [] }, errors);
  await writeFile('artifacts/preflight-capture.txt', JSON.stringify(captures, null, 2), 'utf8');
  expect(errors).toEqual([]);
});
