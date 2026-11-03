# WriteSpace

WriteSpace is a local-first blog demo: visitors can browse a public introduction, register or sign in, and then write and read posts. Regular users can edit and delete their own posts; the demo administrator can manage all posts and browser-local accounts.

## Run locally

Requirements: Node.js 20 or later and npm.

```sh
npm install
npm run dev
```

Vite prints the local development URL. To create a static production bundle:

```sh
npm run build
```

The compiled site is in `dist/`. The project uses root-level Vite files and the exact SPA rewrite in `vercel.json`. When deploying to Vercel, set the Vercel project root to the repository root; the build command is `npm run build` and the output directory is `dist` (project settings, not extra `vercel.json` keys).

## Demo access and local data

The built-in demo administrator login is `admin` / `admin`. Visitors can register regular `user` accounts. Posts, users, and the active session are stored in browser localStorage under `writespace_posts`, `writespace_users`, and `writespace_session`. Data belongs only to the current browser profile; it is not shared between people or devices. Clearing browser storage removes the local demo data.

## Security boundary

This is an MVP/demo, **not a secure multi-user publishing service**. Credentials are stored as plain text in localStorage, role checks run entirely in the browser, and anyone with browser access can inspect or change the data. Do not enter real passwords, sensitive information, or private content. Use a server-backed authentication and storage design before any production use.

## Tests

```sh
node node_modules/vitest/vitest.mjs run
node node_modules/@playwright/test/cli.js test --config playwright.config.js
```

The component/unit tests cover browser storage behavior, identity, post ownership, content workflows, admin metrics, and account deletion boundaries. The Playwright suite covers registration and login, authoring, administration, local persistence, and direct SPA routes. E2E tests run the Vite development server on `127.0.0.1:4173`.

## Product boundaries

WriteSpace has no backend, remote API, server database, external authentication provider, rich-text editor, uploads, or synchronization service. The dashboard retains the two user-total labels specified by the product brief; their metric meanings were not defined by that brief.
