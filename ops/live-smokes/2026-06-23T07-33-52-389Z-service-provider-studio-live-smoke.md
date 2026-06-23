# Service Provider Studio Live Smoke - 2026-06-23T07:33:52.389Z

App: https://bneineviimacademy.org
Result: passed
Commit: `2d49578e26e15499615de8df5c003da0232b2423`

This read-only smoke used the existing Operations smoke credentials. It did
not create projects, save source text, render media, publish content, send
messages, grant access, charge, upload to Vimeo, change DNS, mutate Railway
configuration, or call external AI vendors.

## Deploy Catch-Up

- `2026-06-23T07:33:29.530Z`: `/api/bna/studio/dashboard` returned 404.
- `2026-06-23T07:33:40.317Z`: `/api/bna/studio/dashboard` returned 500 while
  the server bundle/database bootstrap caught up.
- `2026-06-23T07:33:52.389Z`: `/api/bna/studio/dashboard` returned 200 with
  `success: true`.

## Steps

- PASS `/operations?view=studio` returned 200 and contained the Studio UI
  marker.
- PASS `/api/bna/studio/dashboard` returned 200 with `success: true` and
  `projects.length: 0`.
- PASS `/api/bna/studio/usage` returned 200 with `success: true` and
  `rollup.event_count: 0`.

## Timings

- Operations Studio page: 1650ms
- Studio dashboard API: 739ms
- Studio usage API: 230ms

## Known Blocker

`npm run railway:doctor` could not run in this isolated worktree because no
`RAILWAY_TOKEN` was available at `.secrets\railway-token.txt`. Live endpoint
smoke passed after the default push, so deployment was verified through the
read-only live app path rather than Railway deployment metadata.
