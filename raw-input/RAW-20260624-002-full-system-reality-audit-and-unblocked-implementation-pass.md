# FULL SYSTEM REALITY AUDIT AND UNBLOCKED IMPLEMENTATION PASS
## PR #14, visual UI, navigation/auth, bot runtime, class intake, Stripe, Vimeo, and ramble routing

Repository:
shloimie-beep/bnei-neviim-academy

Current integration PR:
https://github.com/shloimie-beep/bnei-neviim-academy/pull/14

Expected release-candidate SHA from the last report:
7da18227804498d8868201f8f94a266da048ba50

An earlier checkpoint:
428ee78682a201b233b2f3da71bf0205b48812ad

Do not assume those states are still current. Verify them.

The owner reports that substantial structural/navigation work was completed, but important visible and operational outcomes still have not happened:

- the live public homepage has a gap between the top toolbar/header and the hero;
- the selected horizontal category/tab has text/background contrast so weak that it cannot be read;
- reported new public-navigation entries may not be live;
- super-admin navigation into Rabbi Scheller’s provider workspace is not clearly usable;
- portal pages and role paths have not been completely verified with real authenticated behavior;
- the bot is expected to work, but runtime behavior is not proved;
- uploaded classes were not fully transcribed, parsed, linked, and applied to student scores, questions, profiles, classes, and accountability;
- Stripe sandbox testing has not been completed;
- Vimeo readiness and safe test behavior have not been completed;
- the latest ramble must become durable requirements, Codex work, and operator Decisions without duplication.

This task is not merely another documentation pass.

Audit first, then implement every unblocked repair. Do not call something complete because a route registry or synthetic fixture passes.

---

## 1. Preserve and route this ramble

Capture this entire request through the canonical ramble/intake system.

Assign or reuse stable source and requirement IDs.

Reconcile it against existing requirements and do not create duplicates.

The resulting requirement set must cover:

1. public hero/header gap;
2. horizontal active-tab contrast;
3. complete public and authenticated navigation;
4. super-admin to provider-workspace navigation;
5. Rabbi Scheller provider experience;
6. unified login and role-aware routing;
7. website/portal bot runtime;
8. class Drive ingestion and parsing;
9. score/progress persistence;
10. student-question persistence;
11. class and student-profile linkage;
12. accountability updates;
13. Stripe sandbox;
14. Vimeo readiness;
15. visual regression testing;
16. production readback and backfill Decisions;
17. automatic ramble → Task/Decision/queue behavior.

Map each statement to one of:

- already satisfied and verified;
- implemented but not merged;
- merged but not deployed;
- deployed but not live-verified;
- partially implemented;
- documented only;
- missing;
- blocked by operator;
- blocked by credentials;
- blocked by external service.

Codex-executable work belongs in the executable queue.

Only work requiring Shloimie, an account owner, credentials, access, policy choice, external write approval, merge approval, or deployment approval belongs in Decisions.

---

## 2. Establish one authoritative Git truth snapshot

Before editing, report:

- current worktree;
- current branch;
- local HEAD;
- remote tracking branch;
- remote HEAD;
- PR #14 head;
- master head;
- deployed production SHA, if discoverable without credentials;
- worktree status;
- staged files;
- dirty tracked files;
- untracked files;
- local-only commits;
- pushed commits;
- PR merge status;
- deployment status;
- live-verification status.

Explain the relationship among:

- `428ee78682a201b233b2f3da71bf0205b48812ad`;
- `7da18227804498d8868201f8f94a266da048ba50`;
- PR #12;
- PR #13;
- PR #14;
- current master;
- current production.

The earlier report said unrelated dirty/untracked generated outputs remained on the machine.

Do not dismiss those automatically.

Inventory every dirty or untracked item and determine whether it contains:

- missing UI changes;
- screenshots;
- route changes;
- class-intake evidence;
- uploaded content;
- generated evidence;
- secrets;
- disposable build output;
- work that should be incorporated.

Do not commit unrelated material without explaining it.

Also reconcile the reported test counts:

- 1118/1118;
- 1202/1202;
- 1213/1213.

For each count identify the exact SHA, branch, test command, and timestamp.

Update stale PR descriptions and evidence documents so there is one authoritative current result.

---

## 3. Compare three distinct states

For every audited feature, distinguish:

1. current production;
2. PR #14;
3. local machine/worktrees.

Do not report a branch-only feature as live.

Create an applied-state matrix containing:

- feature;
- local implementation;
- committed;
- pushed;
- present in PR #14;
- merged to master;
- deployed;
- live-verified;
- acceptance evidence;
- remaining action.

Specifically compare the production public homepage with PR #14 for:

- Service Provider Directory navigation;
- One Time navigation;
- top toolbar/header;
- hero placement;
- horizontal category tabs;
- active tab styles;
- typography;
- placeholder content;
- mobile menu;
- footer year/content;
- bot/helper entry point.

---

## 4. Perform an actual visual UI audit

Run the public site and branch candidate at:

- 390 × 844;
- 768 × 1024;
- 1440 × 900.

Audit every production-facing and major portal page, not only the homepage.

Capture before-and-after screenshots.

### Required homepage repairs

#### Header-to-hero gap

Determine the exact cause:

- header margin;
- hero margin;
- collapsed margin;
- body padding;
- navigation wrapper height;
- hidden element;
- announcement bar;
- image line-height;
- breakpoint rule;
- stale deployed CSS.

Acceptance criteria:

- the intended hero surface begins directly after the toolbar/header;
- no unintended blank strip exists;
- the gap is no more than one rendered pixel unless a documented design token requires spacing;
- the behavior passes at all three required viewports;
- sticky-header behavior does not cover hero content;
- screenshot evidence is stored.

Add a browser assertion using bounding rectangles, not only a screenshot:

`abs(header.bottom - hero.top) <= 1`

Adjust selectors to the actual canonical components.

#### Selected horizontal tab

Find all horizontal category/subcategory/tab components.

Acceptance criteria:

- active tab text has WCAG AA contrast;
- normal-size text contrast is at least 4.5:1;
- the active state remains understandable without relying only on color;
- use `aria-current="page"` or the correct tab semantics;
- hover, focus, active, and disabled states are distinct;
- keyboard focus is visible;
- active text remains readable in desktop, tablet, mobile, dark mode, and high-contrast rendering where applicable;
- no active state uses light text on a light background;
- computed-color tests and screenshot evidence are included.

Do not merely change a color by eye. Test the computed foreground/background pair.

### Additional visual inspection

Check:

- placeholders accidentally visible to the public;
- missing or stale images;
- broken image ratios;
- footer year;
- inconsistent buttons;
- inaccessible chips;
- unreadable active navigation;
- toolbar overflow;
- excessive whitespace;
- content hidden under sticky headers;
- mobile horizontal overflow;
- modal clipping;
- loading and error states;
- generic or unfinished copy.

Create a defect list with route, viewport, selector, observed behavior, expected behavior, severity, fix, and acceptance test.

---

## 5. Full navigation and unified-login audit

The prior route inventory and synthetic role flows do not replace authenticated behavior testing.

Audit:

- public visitor;
- parent with one child;
- parent with multiple children;
- student;
- Rabbi/provider owner;
- provider participant;
- One Time member;
- BNA operations user;
- BNA super-admin;
- wrong-role account;
- expired session;
- disabled account;
- API failure state.

Build or repair a safe local authentication harness using fixtures or seeded test identities. It must not use production passwords.

Then test:

- every supported login entry point;
- same identity authenticating through different legitimate portal entry points;
- role-aware redirect;
- valid `returnTo`;
- unsafe/external `returnTo` rejection;
- unauthorized internal `returnTo` rejection;
- refresh persistence;
- logout;
- direct deep links;
- browser back navigation;
- workspace switching;
- role switching where permitted;
- active nav state;
- 403/404 behavior;
- no workspace leakage.

Rerun the historical click map once the safe harness exists.

Explain why the route inventory reports 689 routes while the deferred historical click map reports 2,205 routes. Define what each count represents.

Do not claim “all pages tested” unless the parameterized and authenticated paths are included.

---

## 6. Super-admin to Rabbi Scheller workspace

Implement and verify a clear super-admin path to Rabbi Scheller’s provider workspace.

Required behavior:

- provider directory/list contains Rabbi Scheller;
- selecting him opens the correct workspace;
- workspace identity is obvious in the shell;
- breadcrumbs and back navigation return to the provider directory;
- permitted super-admin controls remain available;
- provider-only controls render in the provider context;
- no other provider’s students/classes/content appear;
- no BNA private student data leaks into the provider workspace;
- no provider credential is needed for an authorized super-admin;
- all access is audit logged.

If “view as” or impersonation exists, it must:

- be explicit;
- display a persistent impersonation banner;
- be server-authorized;
- be audit logged;
- have a clear exit;
- never silently turn a normal user into a super-admin.

Shloimie may also be an ordinary member of Rabbi Scheller’s workspace. Keep that membership distinct from super-admin access.

Provide the exact internal deep link for:

- provider directory;
- Rabbi Scheller workspace;
- Rabbi Scheller students;
- classes;
- questions;
- API usage;
- settings;
- support;
- integration readiness.

---

## 7. Bot runtime audit

“The bot is present” is not sufficient.

For every bot/helper surface, report separately:

- UI widget rendered;
- API endpoint reachable;
- authenticated identity resolved;
- workspace resolved;
- role resolved;
- conversation persisted;
- model provider configured;
- model call succeeds;
- typed action plan generated;
- permission checked;
- preview generated;
- approval enforced;
- action executed when allowed;
- audit event persisted;
- response rendered;
- error and retry behavior;
- API usage recorded.

Test the bot in:

- public context;
- super-admin;
- provider admin;
- provider participant;
- parent;
- student;
- One Time member.

Do not allow cross-workspace information.

Do not expose secrets or full private prompts in usage logs.

If provider credentials or Kimi/OpenAI configuration are missing, prove that the UI shows an exact readiness reason and create one Decision with a walkthrough.

Do not describe a shared control-plane contract as a functioning production bot unless a real request succeeds through the full runtime.

---

## 8. Class Drive intake and accountability reconciliation

This is a primary product defect.

The owner reports that uploaded classes did not reliably update:

- class sessions;
- student scores;
- progress;
- student questions;
- student profiles;
- accountability;
- parent/student-visible results.

Trace every relevant uploaded class through these stages:

1. Drive/source discovered;
2. source fingerprint created;
3. intake job created;
4. queued;
5. file downloaded;
6. transcription started;
7. transcription succeeded or failed;
8. class parser started;
9. structured output created;
10. students matched;
11. ambiguous names flagged;
12. class session linked;
13. scores/progress written;
14. questions written;
15. accountability written;
16. profile/read model updated;
17. Operations UI can read it;
18. parent/student UI can read it;
19. duplicate protection verified;
20. audit evidence recorded.

Produce one reconciliation row per class/job with:

- job ID;
- filename;
- Drive identifier;
- class date;
- upload date;
- transcription status;
- parser status;
- student-match status;
- output status;
- database-write status;
- UI-visibility status;
- exact failure;
- safe recovery action.

Verify or disprove:

- invalid or missing OpenAI transcription key;
- missing Drive read access;
- jobs 64–74 requiring backfill;
- parser output existing but not applied;
- class records written without student links;
- alias/name mismatches;
- questions written to the wrong table/read model;
- scores written but omitted from accountability;
- duplicate/retry suppression;
- production UI reading different tables than the parser writes;
- local fixes that were never deployed;
- backfill code that exists but has never been applied.

Create:

- read-only diagnostic command;
- per-job status report;
- idempotent dry-run backfill;
- before/after expected mutation report;
- tests for multi-student class parsing;
- ambiguous-name tests;
- duplicate tests;
- question-linking tests;
- score/accountability tests;
- UI read-model tests;
- failure/retry tests.

Do not apply production changes until the exact target jobs and mutation plan are approved.

A dry-run report must show every proposed row-level change without secret values or unrelated student data.

---

## 9. Stripe sandbox implementation

Complete all work that can safely be performed without live mode.

Required implementation:

- explicit `not_configured`, `sandbox`, and `live` states;
- server-side secret loading;
- no keys in browser code;
- sandbox product/price configuration;
- checkout flow;
- customer portal or equivalent billing-management path;
- webhook signature verification;
- idempotency;
- membership entitlement;
- trial start/end;
- renewal;
- successful payment;
- failed payment;
- retry/recovery;
- cancellation immediately versus period end;
- refund representation;
- receipt/invoice visibility;
- provider revenue view;
- parent/member billing view;
- exact test/live mode labeling;
- audit events;
- safe error states.

Run credential-free unit and integration tests regardless of whether keys exist.

If valid Stripe sandbox credentials already exist in the approved secret store:

- confirm they are sandbox/test credentials;
- never print them;
- run the approved sandbox-only test suite;
- use clearly synthetic records;
- ensure no real money can move;
- record created sandbox object IDs in redacted evidence;
- do not switch to live mode.

If credentials are absent, create one Decision explaining:

- where Shloimie opens the Stripe sandbox;
- which non-secret identifiers are required;
- where the secret keys and webhook secret must be stored;
- how Codex validates them;
- which tests resume afterward.

Do not require DNS for ordinary Stripe sandbox testing.

Product/policy Decisions must be separate from credential configuration:

- monthly price;
- trial duration;
- renewal;
- cancellation timing;
- refund policy;
- taxes;
- invoice/receipt policy;
- entitlement grace period;
- provider revenue split, if applicable.

---

## 10. Vimeo readiness

Complete all credential-free Vimeo work:

- promo-video embed component;
- member-library video component;
- privacy/error states;
- unavailable/deleted video state;
- metadata normalization;
- upload-request contract;
- retry handling;
- progress state;
- thumbnail state;
- transcript linkage;
- class-session linkage;
- provider/workspace scoping;
- mocked automated-upload tests;
- integration-readiness display.

Distinguish:

- preview-only;
- mock-tested;
- credentials missing;
- credentials invalid;
- account permission missing;
- test asset approved;
- manual upload available;
- automated upload ready;
- live.

Do not use a vague “blocked” state.

A real Vimeo upload is allowed only after the system records:

- exact Vimeo account;
- exact test destination/folder;
- approved synthetic/non-sensitive test file;
- token stored in the approved secret store;
- explicit test-upload approval.

Until then, run mocks, contract tests, API-readiness tests, and UI tests.

Do not upload real class recordings as an integration test.

---

## 11. Other external blockers

Create or update canonical Decisions for only the remaining operator work:

- GitHub workflow permission;
- safe authenticated preview/demo sessions;
- production database read-only target;
- Railway project/environment/service target;
- Google Drive folder/file target;
- selected Google authentication path;
- read-only production readback;
- exact guarded-backfill job range;
- production mutation approval;
- merge approval;
- deploy approval;
- live verification approval;
- Stripe sandbox credentials;
- Vimeo test token/account/asset;
- email sender/domain/DNS when applicable;
- bot model credentials if absent.

Each Decision must include:

- plain-English title;
- exact reason;
- exact affected requirement;
- exact internal Operations deep link;
- external account link when safe;
- step-by-step walkthrough;
- what information or secret is required;
- where it must be stored;
- validation command;
- dependent tasks automatically resumed afterward.

Never paste secret values into documentation, GitHub, logs, screenshots, or chat.

---

## 12. PR strategy

PR #14 is already a large integration candidate.

Do not continue burying unrelated feature work in it without classification.

Separate work into:

### PR #14 release-acceptance defects

Include fixes necessary to make its stated functionality reviewable:

- stale evidence;
- public-nav correctness;
- hero gap;
- active-tab readability;
- route/auth defects introduced or claimed by the PR;
- owner-review screenshots and acceptance tests.

### Follow-up PRs

Use focused follow-up branches for:

- class-intake/backfill runtime;
- bot production runtime;
- Stripe sandbox;
- Vimeo integration;
- major provider-product expansion.

If a change must remain in PR #14 because its current claims depend on it, explain why.

Do not merge or deploy automatically.

---

## 13. Required validation

Run, at minimum:

- focused UI tests;
- visual/computed-style assertions;
- owner-review role flows;
- route inventory;
- historical click map using safe auth harness;
- watchdog links;
- watchdog actions;
- watchdog security;
- unified-login tests;
- tenant-isolation tests;
- bot runtime/contract tests;
- intake parser tests;
- class persistence/read-model tests;
- dry-run backfill tests;
- Stripe sandbox or mock tests;
- Vimeo mock/readiness tests;
- secrets audit;
- JSON/JSONL parsing;
- source coverage;
- run validation;
- stale-evidence validation;
- `git diff --check`;
- full `npm test`.

For every test result record:

- exact command;
- exact SHA;
- timestamp;
- pass/fail count;
- whether credentials were used;
- whether any external write occurred.

Do not reuse evidence generated for a different SHA.

---

## 14. Required final report

Return these exact sections:

1. Executive verdict
2. Current Git truth
3. Why previous work was not visible
4. Production versus PR #14 versus local
5. Visual defects found
6. Visual defects fixed
7. Public navigation
8. Authenticated navigation
9. Super-admin to Rabbi Scheller workspace
10. Unified login
11. Bot runtime
12. Uploaded class reconciliation
13. Scores, questions, profiles, and accountability
14. Dry-run backfill result
15. Stripe sandbox readiness
16. Vimeo readiness
17. Credential-free work completed
18. Operator Decisions remaining
19. Tests and evidence
20. Files changed
21. Commits and push state
22. Merge/deploy/live state
23. Exact links Shloimie should open
24. Recommended next action

For every reported feature use one of:

- NOT STARTED
- DOCUMENTED ONLY
- IMPLEMENTED LOCALLY
- COMMITTED LOCALLY
- PUSHED
- MERGED
- DEPLOYED
- LIVE VERIFIED
- BLOCKED — exact reason
- PARTIAL — exact completed and incomplete portions

Never use “done” without stating whether it is pushed, merged, deployed, and live-verified.

End with one overall state:

- LOCAL ONLY
- PUSHED
- MERGED
- DEPLOYED
- LIVE VERIFIED
- PARTIAL