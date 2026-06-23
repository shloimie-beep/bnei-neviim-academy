# GOAL MODE — One Time Brand, Landing Page, Portal Branding, and Shared Review Deployment

**Canonical branch:** `codex/agent-control-center-20260619`
**Required starting remote HEAD:** `ef7e430ea08208a10750bd3c2d96531e39ceebdf` or newer
**PR:** `#5`, open/draft
**Preferred clean worktree:** `C:\Users\User\Documents\Codex\2026-06-22\one-time-shared-review-a8190b04`
**Primary workspace/project:** `rabbi_sheller_provider` / `one_time_mishnah_class`
**Customer-facing language:** English
**Goal:** Turn the existing shared One Time review routes into a polished branded experience using the supplied legacy assets, then deploy the shared review build so Shloimie can inspect it and give the final UI/workflow correction ramble.

---

# 0. Resume the actual current state

Do not restart completed work.

The prior batch already created and pushed:

- `/provider.html?review=one-time`
- `/parent.html?review=one-time`
- `/student.html?review=one-time`
- `/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS`
- `/one-time-email-review.html`
- `/api/one-time-review`
- TEST provider/parent/student/classroom/email fixtures
- operator review packet under `ops/one-time-mishnah/operator-ui-review/`

Preserve and extend those routes and fixtures. Do not replace them with a second review system.

Before editing:

```powershell
git status --short
git branch --show-current
git fetch origin
git rev-parse HEAD
git rev-parse origin/codex/agent-control-center-20260619
git log -15 --oneline
git worktree list
```

If the preferred worktree is dirty or behind, create a clean worktree from the latest remote branch. Do not deploy from the older dirty `one-time-master-pr-ff` worktree.

Read:

- `BNA-START-HERE.md`
- `AGENTS.md`
- `MEMORY.md`
- `SYSTEM-STATE.md`
- `TASKS.md`
- `memory/2026-06-21.md`
- `memory/2026-06-22.md`
- current execution-run files
- the full operator review packet
- current brand config
- current One Time landing/public route
- current provider/parent/student/classroom/email pages
- current Vimeo/manual-library code
- current asset audits.

Preserve this prompt as one new raw source in the existing protocol. Add only the minimum coherent requirements.

---

# 1. Scope and guardrails

This is an implementation prompt.

Implement, test, commit, push, and deploy the shared review experience.

Do not:

- provision Railway projects/services/databases;
- touch `skillful-motivation` topology;
- change DNS;
- merge PR #5;
- create a new repo or app;
- create a second portal framework;
- commit raw giant source videos;
- expose secrets;
- invent testimonials, press claims, attendance, student quotes, or Torah sources;
- expose private or unapproved child images;
- redo the synthetic review-data batch unless needed for branding integration.

Safe deployment to the existing shared BNA app is allowed only from a clean commit/worktree and only after BNA regression checks pass.

The separate One Time instance remains paused until after Shloimie reviews this shared implementation.

---

# 2. Source assets

Inspect these known assets:

```text
C:\Users\User\Downloads\OneTimeOneTime - Rabbi Eli Scheller_files\onetime hero vertical.webp
C:\Users\User\Downloads\OneTimeOneTime - Rabbi Eli Scheller_files\onetimelogo.webp
C:\Users\User\Downloads\OneTimeOneTime\
C:\Users\User\Downloads\OneTimeOneTime*
```

Find:

- `Promo Website` video, regardless of extension;
- old downloaded HTML/CSS/JS;
- old Vimeo iframe/player URL or video ID;
- teaching videos;
- child/classroom marketing images;
- TorahAnytime logo;
- 24Six logo;
- The Loop logo;
- Mishpacha logo;
- Naki logo if actually present;
- other legacy site assets.

Create:

```text
ops/one-time-mishnah/brand-site-review/ASSET-INVENTORY.md
ops/one-time-mishnah/brand-site-review/asset-manifest.json
ops/one-time-mishnah/brand-site-review/HERO-VIDEO-TRACE.md
```

Record source-relative path, type, size, dimensions/duration, SHA-256, intended use, approval/privacy status, destination, and optimization.

Do not reference absolute Downloads paths in public code.

---

# 3. Brand direction

Use the old site as the identity source, not as the layout template.

Target visual identity:

- near-black and charcoal public surfaces;
- deep navy video/library surfaces;
- cyan/teal supporting accents;
- bright lemon-yellow primary accent and CTA;
- cream/white typography;
- supplied white scripted One Time logo;
- blue/teal photography;
- energetic, premium, joyful, concise, Torah-focused, video-first.

Sample the real old CSS/assets and finalize exact values.

Starting approximation:

```css
--ot-black: #080910;
--ot-charcoal: #101010;
--ot-navy-950: #081323;
--ot-navy-900: #0b182a;
--ot-navy-800: #102634;
--ot-teal-600: #08779c;
--ot-cyan-500: #0b9fc9;
--ot-yellow-400: #ede518;
--ot-cream: #faf9f4;
--ot-white: #ffffff;
--ot-muted: #aeb9c6;
--ot-line: rgba(255,255,255,.12);
```

Update/create:

```text
config/brands/one-time.json
brand-kit/one-time/README.md
brand-kit/one-time/colors.json
brand-kit/one-time/copy.md
brand-kit/one-time/assets.json
brand-kit/one-time/usage.md
```

The brand config must drive:

- public page;
- provider portal;
- parent portal;
- student portal;
- classroom;
- invitations/login;
- email previews;
- social metadata.

Do not scatter hardcoded colors across unrelated pages.

---

# 4. Logo, portrait, and media processing

Use the supplied `onetimelogo.webp` as the actual logo.

Create optimized variants only as needed:

- header;
- inverse/dark;
- square icon;
- favicon;
- social preview;
- email header;
- portal lockup.

Preserve transparency and aspect ratio.

Use `onetime hero vertical.webp` as a portrait/story/teacher asset.

Create responsive optimized variants.

Inspect the One Time videos and extract 4–8 strong teaching stills:

- Rabbi teaching;
- clean background;
- engaged classroom;
- useful wide and portrait crops;
- no blurry frames;
- no awkward expressions;
- no duplicate near-identical frames.

Use existing FFmpeg/Remotion tooling.

Put approved optimized assets under:

```text
public/images/one-time/brand/
public/images/one-time/teaching/
public/images/one-time/students/
public/images/one-time/press/
```

Do not expose student names.

Mark uncertain child images `internal_review_only`; do not publish them until approved.

---

# 5. Hero video

Recover the original Vimeo link/ID from the downloaded old site when possible.

Search old HTML/JS for:

```text
vimeo.com
player.vimeo.com
iframe
videoId
heroVideo
promo_website
```

If a valid Vimeo source exists, use provider-neutral configuration and verify playback/privacy.

Otherwise use the local `Promo Website` file as the review source with:

- muted autoplay;
- loop;
- `playsinline`;
- accessible pause/play;
- poster fallback;
- mobile fallback;
- optimized loading;
- no sound autoplay;
- no giant Git commit.

Do not block the page on automated Vimeo upload permission.

---

# 6. Reusable service-provider landing-page system

One Time is the first config-driven service-provider website.

Create or extend:

```text
config/service-provider-sites/one-time.json
src/platform/service-provider-sites/
docs/product/service-provider-landing-pages.md
docs/product/service-provider-site-onboarding.md
```

The config must support:

- provider identity;
- brand;
- public slug;
- logo;
- palette;
- hero video/image;
- copy;
- navigation;
- offer;
- press logos;
- story;
- gallery;
- course/library preview;
- portal links;
- FAQ;
- SEO/social preview;
- feature flags.

Do not build a drag-and-drop page builder now.

Build a clean template so a future onboarding bot can populate a provider website from approved assets and answers.

---

# 7. Landing page

Create a modern page that is substantially cleaner than the legacy site.

## Header

- One Time logo
- Home
- Live Mishnah Shiur
- Video Library
- How It Works
- About Rabbi Scheller
- FAQ
- Member Login

Mobile: accessible drawer.

No BNA label.

Member Login should lead to a clean One Time role chooser or unified entry for:

- Parent
- Student
- Rabbi/Admin

Do not expose “Operations” language to normal users.

## Hero

Eyebrow:

```text
Worldwide Live Mishnah Learning
```

Headline:

```text
Finish Masechtas.
Love Learning Torah.
```

Supporting draft:

```text
Join a worldwide live Mishnah shiur with Rabbi Eli Scheller—live classes, a growing video library, and practical worksheets that help kids keep learning.
```

Primary CTA:

```text
Join the Live Shiur
```

Secondary CTA:

```text
Explore the Video Library
```

Member action:

```text
Member Login
```

Claims such as “biggest in the world” or “world-renowned” must remain configurable/operator-approved unless evidence is documented.

## Media proof strip

Use only approved real logos from the old site/assets.

Suggested heading:

```text
As seen across the Jewish world
```

Do not imply sponsorship.

## Value pillars

```text
Finish Masechtas
Live structure that helps kids keep moving.

Love Learning Torah
Engaging teaching that makes the learning memorable.

Learn From Anywhere
Join live, rewatch the shiur, and complete the worksheet.
```

## Live shiur

Show:

- one recurring live Mishnah class;
- global/live positioning;
- schedule when configured;
- trial/$67 offer only through approved product config;
- no fake participant counts.

## How it works

```text
1. Join the live Zoom shiur.
2. Rewatch the lesson in the video library.
3. Complete the worksheet.
4. Track progress and achievements.
```

## Video library preview

Use deep navy/cyan/yellow styling.

Use real/manual approved video references.

Cards should show:

- thumbnail;
- duration;
- Masechta/perek;
- “New” only when true;
- bookmark only if implemented;
- direct library action.

Do not duplicate identical “Recently Added” and “Trending” data.

## Teaching gallery

Use extracted approved stills in an editorial layout.

## Portal preview

Show three concise cards:

Provider/Admin:
```text
Manage parents, students, classes, communications, videos, worksheets, and access.
```

Parent:
```text
See class times, attendance minutes, lessons, worksheets, and progress.
```

Student:
```text
Open the Zoom link, watch the shiur, complete the worksheet, and see achievements.
```

## Story

Use the supplied portrait and concise approved bio.

Suggested opening:

```text
Rabbi Eli Scheller is an educator and storyteller known for helping children connect to Torah through energy, clarity, humor, and real engagement.
```

Use only factual approved details from the old site.

## FAQ

Config-driven answers only:

- Who is the class for?
- When is the live shiur?
- Are recordings included?
- Are worksheets included?
- How do parent and student accounts work?
- What does membership cost?
- How does the trial work?
- Can I cancel before renewal?
- What if my child misses the class?
- What technology is required?

## Final CTA

```text
Help your child finish Masechtas—and enjoy the learning.
```

## Footer

- logo;
- contact;
- privacy;
- terms;
- support;
- parent login;
- student login;
- Rabbi/admin login;
- no BNA leakage.

---

# 8. Brand all existing review routes

Preserve the existing synthetic review APIs and data.

Update these routes under One Time review/context:

```text
/one-time
/provider.html?review=one-time
/parent.html?review=one-time
/student.html?review=one-time
/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
/one-time-email-review.html
One Time Operations workspace
```

Requirements:

- One Time logo;
- One Time colors;
- English;
- One Time titles;
- no BNA favicon/title/header;
- no BNA public-site link;
- no accountability/goals/student bot;
- no stale BNA workspace state.

Do this through brand/context resolution where practical, not duplicated portal copies.

Provider portal should show reviewable sections for:

- Overview
- Parents
- Students
- Communications
- Live Class
- Attendance
- Course/Library
- Worksheets
- Announcements
- Payments/Trial/Access
- Milestones/Achievements/Rewards
- Questions/Support
- Integrations
- Branding/Settings

Parent and student must remain relationship-scoped.

---

# 9. Email previews

Brand the current One Time email preview page.

All templates must use:

- One Time logo;
- One Time palette;
- English copy;
- clear preview-only/no-send status;
- subject;
- preview text;
- body;
- CTA;
- audience;
- readiness;
- sender/domain blocker.

Templates:

- parent invitation;
- student invitation;
- verification;
- recovery;
- class reminder;
- Zoom reminder;
- new recording;
- worksheet;
- attendance/progress;
- milestone;
- achievement;
- reward;
- trial;
- pre-renewal;
- payment;
- cancellation;
- support ticket;
- support reply.

No BNA email branding in One Time templates.

---

# 10. SEO and sharing

Implement:

- title;
- meta description;
- canonical config;
- Open Graph;
- Twitter card;
- favicon;
- social preview;
- structured data where accurate;
- sitemap/robots integration;
- no private-route indexing;
- no TEST data indexing.

Suggested title:

```text
One Time | Live Mishnah Learning with Rabbi Eli Scheller
```

Suggested description:

```text
Join Rabbi Eli Scheller for live worldwide Mishnah learning, a growing video library, practical worksheets, and parent and student access.
```

---

# 11. Review data and packet

Preserve the current TEST fixtures and review APIs.

Ensure the review environment visibly contains:

- provider/admin;
- parent linked to one student;
- student self-only;
- live class readiness;
- attendance/minutes;
- course/module/lesson;
- manual/real Vimeo reference;
- worksheet;
- announcement;
- payment/trial;
- milestone;
- achievement;
- reward;
- question/support;
- email previews.

Update:

```text
ops/one-time-mishnah/operator-ui-review/START-HERE.md
ops/one-time-mishnah/operator-ui-review/ROUTE-MAP.md
ops/one-time-mishnah/operator-ui-review/KNOWN-BLOCKERS.md
ops/one-time-mishnah/operator-ui-review/ASSET-REVIEW.md
ops/one-time-mishnah/operator-ui-review/NEXT-RAMBLE-TEMPLATE.md
```

The secure login-handoff path remains local/ignored. Never commit passwords.

---

# 12. Testing

Run:

```powershell
node --check server.js
npm test
npm run bna:run:validate
npm run watchdog:actions
npm run watchdog:security
node scripts/audit-secrets.mjs
git diff --check
```

If `bna:run:validate` still fails only because a detached clean worktree lacks branch-name metadata or old evidence paths:

- fix the validator/worktree compatibility if safe;
- otherwise document the exact pre-existing issue;
- never fake evidence.

Focused tests:

- brand config;
- site config;
- asset manifest;
- no missing assets;
- no absolute Downloads paths;
- no huge raw media committed;
- landing sections;
- login links;
- One Time portal branding;
- no BNA title leakage;
- parent/student isolation;
- no bot/accountability;
- video/worksheet;
- announcement;
- email branding;
- SEO;
- no private indexing;
- mobile nav.

---

# 13. Focused Playwright

Test:

```text
390 × 844
768 × 1024
1440 × 900
```

Routes:

```text
/one-time
/provider.html?review=one-time
/parent.html?review=one-time
/student.html?review=one-time
/one-time-classroom.html?review=one-time&code=TEST-ONETIME-REVIEW-ACCESS
/one-time-email-review.html
One Time Operations review route
```

Verify:

- logo;
- hero media/poster;
- CTAs;
- press strip;
- library cards;
- story portrait;
- teaching stills;
- role links;
- brand continuity;
- no BNA title leakage;
- no overflow;
- no broken assets;
- no console errors;
- no private data in public HTML.

Save a compact screenshot index.

---

# 14. Commit, push, and deploy

Commit coherent work.

Push PR #5.

Update PR #5 with:

- brand system;
- asset inventory;
- landing page;
- reusable provider-site template;
- portal/email branding;
- hero/Vimeo state;
- tests;
- screenshots;
- no-secret statement.

Then deploy the shared app from a clean commit/worktree if all gates pass.

Do not modify Railway service topology.

Do not provision the separate One Time project.

Do not change DNS.

After deployment, run focused live smokes for:

- BNA health/regression;
- `/one-time`;
- provider review;
- parent review;
- student review;
- classroom review;
- email review.

---

# 15. Completion criteria

Return complete only when:

- supplied logo is in use;
- supplied portrait is in use;
- promo hero video or documented fallback is active;
- old Vimeo link is recovered or proven unavailable;
- approved press assets render;
- approved teaching stills render;
- brand palette is documented/applied;
- landing page is polished and responsive;
- page is config-driven for future providers;
- role login links work;
- One Time branding follows into portals and emails;
- synthetic review data still works;
- no BNA title/brand leaks in One Time review context;
- tests/Playwright pass;
- PR #5 is pushed;
- shared review build is deployed;
- review packet is current.

Do not claim final UI perfection. The next step is Shloimie’s detailed UI/workflow correction ramble and full Agent Mode visual QA.

---

# 16. Final response

Report:

1. starting/final HEAD;
2. commits pushed;
3. PR #5 state;
4. asset inventory;
5. logo/portrait destinations;
6. hero/Vimeo result;
7. teaching stills;
8. press assets;
9. final palette;
10. brand-kit files;
11. reusable provider-site config;
12. landing-page sections/copy;
13. public review URL;
14. provider URL;
15. parent URL;
16. student URL;
17. classroom URL;
18. email preview URL;
19. secure login-handoff path;
20. real vs mock/manual;
21. test results;
22. Playwright/screenshots;
23. shared deployment ID;
24. known blockers;
25. exact next ramble purpose:
   `One Time UI/workflow corrections and full Agent Mode visual QA`;
26. verdict:

```text
ONE TIME BRAND AND REVIEW EXPERIENCE READY
```

or:

```text
PARTIAL — UNBLOCKED BRAND/REVIEW WORK REMAINS
```

or:

```text
BLOCKED — SOURCE ASSETS OR CANONICAL WORKTREE INVALID
```
