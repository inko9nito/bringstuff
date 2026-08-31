# BringStuff

A tiny, no-signup shared bring-list. Paste plain text with `✅ Name` markers, share the URL, and everyone can add or claim items. Mobile-first, iOS-styled, works offline once loaded.

## How it works

- The entire list is encoded in the URL hash (`#/l/...`), so the link IS the list.
- Every change updates your URL. Share it again to sync others.
- Recent lists are cached in `localStorage` on each device.

## Development

Open `index.html` in a browser. No build step, no dependencies.

## Deployment

Published to GitHub Pages via `.github/workflows/pages.yml`.

**One-time setup:** open the repo on GitHub → **Settings** → **Pages** →
under *Build and deployment* set **Source** to **GitHub Actions**, then
re-run the latest workflow (Actions → *Deploy to GitHub Pages* → *Re-run
all jobs*). After that every push to `main` or the current dev branch
publishes automatically.
