---
doc_type: codex_implementation_prompt
title: Universal Service Provider Preparation Studio, Prompt Guardrails, Storyboard Editor, and AI Usage Metering
date: 2026-06-23
repository: shloimie-beep/bnei-neviim-academy
scope: all service-provider workspaces
first_pilot: Rabbi Eli Scheller / One Time Mishnah Class
implementation_mode: goal_mode
---

# GOAL MODE — Universal Service Provider Studio

## 0. Executive mandate

Implement a reusable **Studio** module for every `service_provider` workspace.

This is a pre-production workspace for preparing classes, lessons, slideshows, videos, worksheets, and other provider content before it enters the existing Content/Library workflow.

The product distinction is mandatory:

```text
Studio
= source intake, goals, prompt work, characters, guardrails, storyboard,
  generation, revision, preview, rendering, approval

Content / Library
= approved outputs, uploaded recordings, published resources,
  member visibility, classes, worksheets, distribution
```

Do not hide this inside the existing Content section. Add a separate top-level **Studio** module immediately before Content in service-provider navigation.

Rabbi Eli Scheller / One Time is the first configured pilot, but the implementation must be provider-configurable and reusable. Do not hard-code One Time behavior into shared prompt, data, API, or UI layers.

Implement the full credential-free product slice. Do not stop after writing a plan, schema, static mockup, or backlog.

Required end state:

1. A provider can paste source text into Studio.
2. The original text remains immutable and traceable.
3. The provider can define the goal, audience, format, tone, and output.
4. The system creates a structured lesson/production outline.
5. The provider can save reusable characters and visual guardrails.
6. The system creates a slide-by-slide or scene-by-scene storyboard.
7. Prompt layers are visible, versioned, editable, and compiled deterministically.
8. Natural-language corrections become previewable structured patches.
9. The provider can apply a correction to one scene, one character, the project, or future workspace defaults.
10. A lightweight in-app slideshow/video editor allows ordering, timing, text styling, assets, transitions, narration, and preview.
11. Background generation and render jobs are reliable, observable, retryable, and idempotent.
12. Approved Studio outputs can be handed off into the existing Content/Library system without automatic publication.
13. Every AI/vendor call is metered by workspace, provider, user, model, operation, tokens/media units, latency, status, and estimated cost.
14. Super Admin can inspect all usage, budgets, limits, errors, and costs.
15. A provider owner/admin can inspect only that provider workspace's usage.
16. The feature is tested at 390 × 844, 768 × 1024, and 1440 × 900, including WebKit/Safari paste behavior.
17. Work is implemented in an isolated clean Git worktree, independently verified, integrated cleanly, and merged into the repository's actual default branch only after all gates pass.

---

# 1. Read and reconcile the actual repository first

Before editing, read the current canonical source of truth. At minimum inspect:

```text
BNA-START-HERE.md
AGENTS.md
MEMORY.md
SYSTEM-STATE.md
TASKS.md
ops/execution-runs/latest.json
the complete active execution run
recent memory/*.md
recent tasks-pending/*.md
recent ops/agent-task-ledger.jsonl
recent ops/agent-changelog.md
package.json
server.js
public/operations.html
public/provider.html
current shared portal shell and workspace switcher
current Content/Research UI
current provider routes
current prompt UI and prompt storage
current AI/OpenAI/Kimi adapters
current Remotion/video tooling
current content jobs, class sessions, outputs, bundles, and library APIs
current API-usage or billing-related implementation
all migrations affecting workspaces, content, prompts, AI, integrations, jobs, and usage
tests covering workspace authorization, content, prompts, providers, and Operations
current PR #5 and its canonical branch
```

Verify, rather than assume, these previously observed facts:

- active runtime is Node/Express with static HTML/JS/CSS and PostgreSQL;
- Railway runs the web process and may support worker profiles;
- existing content primitives include content jobs, class sessions, outputs, prompt versions/examples, bundles, and bundle items;
- existing routes include protected content-job, class-session, content-prompt, and content-bundle APIs;
- Remotion-related tooling exists;
- workspace types are `school`, `service_provider`, and `family`;
- `super_admin` is a role/global context rather than a fourth workspace type;
- One Time is currently represented through `rabbi_sheller_provider` and `one_time_mishnah_class`;
- One Time review routes and PR #5 work already exist and must be preserved;
- an API-usage requirement already exists for workspace/role-scoped limits and Super Admin visibility.

Create a concise baseline artifact before implementation:

```text
docs/product/service-provider-studio-baseline-2026-06-23.md
```

For each requested capability classify it as:

```text
already_verified
partial
missing
conflicting
blocked_external
```

Do not rebuild verified primitives. Extend the canonical implementation.

---

# 2. Mandatory isolated-worktree protocol

## 2.1 Inspect current Git truth

Run and record:

```bash
git status --short
git status -sb
git branch --show-current
git remote -v
git fetch --all --prune
git rev-parse HEAD
git log -20 --oneline
git branch -vv
git worktree list
git diff --stat
git diff --check
```

Determine the actual default branch rather than assuming `main` or `master`:

```bash
git symbolic-ref --short refs/remotes/origin/HEAD
```

If that is unavailable, inspect:

```bash
git remote show origin
```

Also inspect:

- active Codex/Node/test processes;
- runtime or agent locks;
- current PR #5 branch and base;
- whether another worker is editing the same source paths.

Do not edit a dirty shared checkout. Do not reset, discard, overwrite, or stash another agent's work.

## 2.2 Create the feature worktree

From the newest safe canonical base, create a clean worktree and feature branch similar to:

```text
worktree: C:\Users\User\Documents\Codex\2026-06-23\service-provider-studio
branch:   codex/service-provider-studio-20260623
```

If PR #5's branch contains newer required platform work than the default branch, use that branch as the feature base and record why. Do not silently fork from an older commit.

Confirm:

```bash
git status --short
```

is clean before implementation.

## 2.3 Commit discipline

- Make small coherent commits.
- Do not combine unrelated cleanup.
- Never commit secrets, credentials, browser profiles, runtime locks, local media caches, giant generated files, or private source documents.
- Use additive/idempotent migrations.
- Preserve backward compatibility until the data migration and UI transition are proven.
- Record exact feature-branch commits and tests.

---

# 3. Product placement and navigation

Add **Studio** as a top-level provider module before Content.

Target service-provider navigation order, adjusted to the real canonical shell:

```text
Overview
Tasks / Decisions
Calendar
Studio
Content / Library
Members / Contacts
Communications
Billing / Payments
Integrations
Settings
```

Do not create a second provider portal or second Operations application.

The module must use the existing:

- workspace resolver;
- provider branding;
- permission system;
- responsive shell;
- assistant/helper shell where applicable;
- error/loading/empty-state patterns;
- audit trail;
- task/Decision system;
- upload or asset system;
- current Content/Library handoff.

Module visibility must be configurable, but `Studio` should be available by default for `service_provider` workspaces after migration.

Suggested workspace setting:

```json
{
  "modules": {
    "studio": {
      "enabled": true,
      "position": "before_content"
    }
  }
}
```

Do not enable Studio automatically for family workspaces. School support may be added through the same module later, but this implementation is for all service-provider workspaces.

---

# 4. Roles, permissions, and tenancy

Reuse and extend the canonical membership/RBAC model.

Required effective permissions:

## Super Admin

- view Studio projects across authorized workspaces;
- inspect aggregate and per-workspace API usage;
- set or override workspace budgets and model policies;
- view failed jobs and provider support issues;
- audit prompt versions and revisions when authorized;
- never see raw secrets.

## Provider owner/admin

- create and manage Studio projects in own workspace;
- manage workspace characters, guardrails, prompt defaults, and brand settings;
- view own workspace's usage, spend, limits, and failures;
- approve exports and handoff to Content;
- manage Studio users/roles when existing permissions allow.

## Studio editor

- create/edit projects;
- paste source text;
- edit goals, characters, prompts, storyboard, annotations, and timing;
- request generation/render within quota;
- cannot change workspace-wide budgets or publish directly.

## Studio reviewer

- review versions;
- comment, approve, reject, or request changes;
- approve handoff if granted;
- cannot alter provider billing or integration credentials.

## Viewer

- read approved/project-visible material only;
- no generation or mutation.

Every Studio query and write must validate:

```text
authenticated actor
workspace membership
role/capability
Studio project ownership/scope
requested action
```

Add negative tests proving:

- provider A cannot enumerate provider B projects, prompts, characters, assets, jobs, or usage;
- a project ID or scene ID cannot bypass workspace scope;
- workspace switching clears stale project, character, helper, and usage state;
- Super Admin aggregation is explicit and visibly labeled;
- ordinary provider users never see global totals;
- public/member routes cannot access Studio drafts.

---

# 5. Canonical production workflow

Implement this stateful workflow:

```text
Paste/import source
→ preserve immutable source
→ define goal/audience/output
→ source analysis
→ beat sheet / lesson outline
→ character and setting plan
→ storyboard / slide plan
→ layered prompt compilation
→ image/audio/video generation
→ natural-language review patches
→ browser preview
→ approval
→ render/export
→ handoff to Content
→ separate publish workflow
```

Recommended project stages:

```text
draft
source_ready
outline_ready
characters_ready
storyboard_ready
prompts_ready
generating
review
approved
rendering
exported
handed_off
blocked
archived
```

Keep stage separate from:

- owner;
- reviewer;
- due date;
- approval state;
- render state;
- publish state;
- usage/quota state.

Do not collapse everything into a single ambiguous `status`.

---

# 6. Studio information architecture

The Studio landing screen should contain:

## 6.1 Project dashboard

- New Project;
- Continue Draft;
- Needs Review;
- Rendering;
- Ready for Content;
- Blocked;
- Recent activity;
- API usage this month;
- budget/limit status;
- recent vendor errors.

Project cards should show concise operational facts, not large generic marketing cards:

```text
title
provider/workspace
project type
current stage
last edited
owner
reviewer
scene count
render state
estimated/actual AI cost
next action
```

## 6.2 Project workspace tabs

Use compact tabs or sub-navigation:

```text
Brief
Source
Outline
Characters
Guardrails
Storyboard
Prompt Lab
Assets
Preview
Render
Activity
```

Usage can be a project-side summary with a link to workspace Usage.

## 6.3 Main editor layout

Desktop:

```text
Left rail:
- scenes/slides
- reorder
- status
- warnings

Center:
- live slide/video preview
- safe-area guides
- selected text/image/video element
- play/pause/scrub

Right inspector:
- scene goal
- source excerpt
- narration
- text styling
- characters
- prompt layers
- guardrails
- generation settings
- version comparison
- correction input

Bottom timeline:
- duration
- transitions
- audio/narration
- caption timing
- lightweight motion/keyframes
```

Tablet:

- collapsible left rail;
- preview remains primary;
- inspector becomes drawer or lower panel.

Mobile:

- one pane at a time;
- tabs for Scenes / Preview / Edit / Prompt / Review;
- sticky save/generate/review controls;
- no horizontal page overflow;
- touch targets at least 44 × 44 px;
- timeline may become a scene-duration list rather than a dense horizontal editor.

This is a **lightweight structured slideshow/video editor**, not a clone of Premiere, Final Cut, Canva, or Figma.

Required v1 editing capabilities:

- add, duplicate, delete, and reorder scenes;
- edit scene title, body text, source excerpt, and narration;
- add/replace image, video, background, logo, and audio references;
- change duration;
- choose approved transitions;
- align and resize supported text/media layers;
- set emphasis/bold/highlight annotations;
- set focal point/crop;
- assign characters;
- regenerate one scene without regenerating the full project;
- compare previous and current versions;
- undo or restore a prior saved version;
- preview the entire sequence;
- render/export through a background job.

Do not implement arbitrary freehand drawing or a full unrestricted layer engine in this wave.

---

# 7. Source intake and Safari/WebKit paste behavior

## 7.1 Manual paste is first-class

The primary v1 intake must work through ordinary copy/paste from Safari, Chrome, Edge, and Firefox.

Support:

- plain text;
- rich text;
- Hebrew;
- English;
- mixed RTL/LTR;
- paragraph breaks;
- headings;
- numbered/bulleted source structures;
- pasted URLs;
- copied content with non-breaking spaces and smart punctuation.

Provide:

```text
Paste text
Paste as plain text
Preview cleaned text
View original
Confirm source
```

## 7.2 Source immutability

Store:

- raw pasted source;
- normalized working source;
- normalization report;
- source URL when supplied;
- actor;
- timestamp;
- fingerprint/hash;
- source version;
- language/direction metadata.

Never silently overwrite the raw source.

Do not let the AI directly modify quoted Torah/source text or other protected source material. Corrections belong in derived explanation, annotations, narration, or visual treatment unless the provider explicitly replaces the source version.

## 7.3 Formatting and emphasis

Do not insert presentation markup into the canonical raw source.

Store emphasis separately as structured annotations:

```json
{
  "source_version_id": "...",
  "range": {
    "start": 118,
    "end": 124
  },
  "text_snapshot": "השור",
  "style": ["bold", "highlight"],
  "semantic_role": "key_term",
  "scope": "scene",
  "scene_id": "..."
}
```

The UI should allow:

- bold;
- italic where appropriate;
- underline only when intentionally supported;
- provider-brand highlight color;
- text color;
- font size/weight;
- Hebrew-safe line breaking;
- exact source quotation lock.

## 7.4 Paste sanitization

Sanitize clipboard HTML. Do not retain:

- scripts;
- event handlers;
- hidden tracking elements;
- unsafe iframes;
- external style injection;
- arbitrary classes;
- embedded credentials/tokens.

Add WebKit/Playwright tests for:

- Hebrew copy/paste;
- rich text paste;
- plain-text paste;
- undo;
- source preservation;
- autosave;
- browser refresh recovery.

---

# 8. Brief, goal, audience, and output definition

Every Studio project must have a structured brief.

Required fields:

```text
project title
project type
source language
output language
target audience
age/grade/readability
lesson or communication goal
key takeaway
provider tone
desired emotional effect
output format
target duration
slide/scene target
brand profile
cultural/religious context pack
required characters
required sources
forbidden claims/elements
distribution destination
reviewer
due date
```

Suggested project types:

```text
class_slideshow
explainer_video
worksheet
source_sheet
course_lesson
social_clip
email_visual
presentation
custom
```

The provider can write the goal naturally:

> Explain this Mishnah clearly to boys ages 9–14, show the conflict visually, keep the humor respectful, and make the key distinction memorable.

The system should convert it into a structured brief and show the provider what it inferred.

Never hide inferred values. Let the provider confirm or edit them.

When the goal changes, calculate and display the affected downstream layers:

```text
outline
characters
scenes
narration
visual prompts
motion prompts
annotations
render estimate
```

Do not automatically destroy approved work. Create a new proposal/version and require confirmation for broad changes.

---

# 9. Prompt architecture

Do not use one giant opaque prompt.

Implement a prompt compiler that stores and compiles layers in a deterministic order.

Required layers:

1. **Platform safety/compliance**
2. **Provider workspace brand/style**
3. **Provider domain/context guardrails**
4. **Project brief and audience**
5. **Source-fidelity rules**
6. **Character Bible capsules**
7. **Setting/prop continuity**
8. **Scene/slide objective**
9. **Visual prompt**
10. **Motion/camera prompt**
11. **Narration/audio prompt**
12. **Typography/annotation instructions**
13. **Negative constraints**
14. **Output schema**
15. **Revision patches**
16. **Vendor/model adapter instructions**

The UI must provide:

- Layered View;
- Compiled View;
- Diff View;
- Version History;
- Restore Version;
- Apply to Current Scene;
- Apply to Character;
- Apply to Project;
- Save as Workspace Default.

Prompt layers must have:

```text
workspace_id
studio_project_id when project-specific
scene_id when scene-specific
character_id when character-specific
layer_type
priority/order
content
structured_config
version
status
source
created_by
approved_by
created_at
supersedes_version_id
```

Do not mutate a prompt silently. Every material change creates a new version.

## 9.1 Structured output

Use schema-validated AI outputs for:

- source analysis;
- outline;
- character proposals;
- storyboard;
- prompt compilation;
- natural-language revision patches;
- scene generation plans;
- handoff package.

Reject or repair invalid model output through a controlled parser. Never trust freeform JSON without validation.

## 9.2 Prompt-injection defense

Treat pasted source text and uploaded documents as untrusted content, not system instructions.

The compiler must clearly delimit:

```text
trusted platform instructions
trusted workspace configuration
trusted user brief
untrusted source/document content
```

Source content must never be able to:

- change authorization;
- expose secrets;
- override budget checks;
- trigger external actions;
- alter platform safety rules;
- request cross-workspace data.

Add tests with adversarial pasted instructions.

---

# 10. Natural-language correction engine

This is a central product feature.

A provider may type:

> I like that character, but make him visibly Jewish and keep him consistent in every future scene.

Do not pass this sentence directly into a full regeneration call.

Convert it into a proposed structured patch:

```json
{
  "intent": "update_character_guardrail",
  "target_type": "character",
  "target_ids": ["character_guard_01"],
  "scope": "workspace_character_default",
  "changes": {
    "cultural_identity": "Jewish",
    "appearance_rules": [
      "Use provider-approved modest Jewish clothing and visual context",
      "Avoid generic fantasy, Christian, or unrelated religious iconography"
    ],
    "continuity": "Apply to future scenes using this character"
  },
  "affected_layers": [
    "character_capsule",
    "visual_prompt",
    "negative_constraints",
    "continuity_seed"
  ],
  "confidence": 0.94,
  "requires_confirmation": true,
  "reason": "User requested a persistent character identity correction"
}
```

The UI must show:

```text
What you said
What the system understood
Before
After
Affected scenes/prompts
Estimated regeneration cost
Scope selector
Apply / Edit / Cancel
```

Supported scopes:

```text
this element
this scene
selected scenes
this character
this project
workspace default
future projects
```

Workspace-default and future-project changes require stronger confirmation and appropriate permission.

Required correction intents include:

```text
update_goal
update_audience
update_tone
update_character
update_character_guardrail
update_setting
update_visual_style
update_motion
update_narration
update_text_emphasis
correct_source_mapping
add_negative_constraint
remove_unwanted_element
change_scene_order
change_duration
replace_asset
regenerate_scene
recompile_downstream
```

Every applied correction creates:

- revision event;
- before/after snapshot;
- actor;
- scope;
- affected records;
- regenerated job IDs;
- usage/cost;
- rollback reference.

---

# 11. Character Bible and continuity

Create reusable, workspace-scoped Character Bible records.

Required character fields:

```text
name
display label
role
project/workspace scope
identity/context
age range if relevant
appearance description
clothing rules
colors
body/face continuity notes
personality
speech/narration behavior
allowed actions
forbidden actions
movement rules
emotional range
props
relationships
reference assets
prompt capsule
negative-prompt capsule
continuity seed/reference
approval status
rights/reference status
version
```

Provide a polished card/grid display with:

- thumbnail/reference;
- name/role;
- approval badge;
- continuity warning;
- projects/scenes used;
- quick natural-language refinement;
- compare versions;
- duplicate into project;
- archive rather than destructive delete when in use.

Character rules must be separate from scene actions.

Example:

```text
Character identity:
Jewish marketplace guard in the provider-approved historical setting.

Stable visual guardrails:
modest period clothing;
calm and trustworthy;
no fantasy armor;
no modern police uniform;
no unrelated religious iconography.

Allowed movement:
points, steps aside, blocks an entrance calmly, reacts with concern.

Forbidden:
violence, threatening a child, villain caricature, modern weapons.
```

Do not assume every provider wants Jewish/Torah visual rules. Store those rules in a provider context pack. Seed One Time with the One Time/Torah pack; other providers get their own configuration.

---

# 12. Guardrail system

Implement guardrails as first-class versioned records, not text hidden inside one prompt.

Required guardrail scopes:

```text
platform
workspace/provider
project
character
scene
asset
output/export
```

Required categories:

```text
source fidelity
factual/claim safety
brand
cultural/religious context
character identity
modesty/age appropriateness
movement/action
visual continuity
typography/text integrity
privacy/PII
rights/consent
publishing
vendor-specific constraints
```

Guardrail evaluation should produce:

```text
pass
warning
block
needs_review
```

Before generation/render/handoff, show relevant blocking issues.

Examples:

- exact source text changed;
- character conflicts with approved identity;
- scene contains a forbidden visual element;
- unapproved child photo is referenced;
- public-use asset lacks rights status;
- prompt contains a claim requiring review;
- output would exceed workspace usage limit;
- scene references another workspace's asset.

Provider owners/admins may add stricter guardrails but may not weaken platform security, privacy, or authorization rules.

---

# 13. Storyboard and scene model

Each scene/slide should contain:

```text
order
title
source excerpt/reference
teaching/communication goal
viewer takeaway
narration
on-screen text
text annotations
characters
setting
props
visual composition
visual prompt
negative prompt
motion/camera instructions
audio/music policy
duration
transition in/out
asset references
generation state
review state
approval state
version
warnings
```

The Storyboard screen must support:

- generate first draft from approved outline;
- manual scene creation;
- reorder;
- multi-select;
- bulk duration/transition changes;
- scene-level regeneration;
- scene locking;
- approval;
- comments;
- compare versions;
- duplicate;
- split/merge scenes;
- jump to source location;
- identify which prompt layer caused an output.

A locked scene must not be changed by a global regeneration unless the provider explicitly unlocks or approves a proposed patch.

---

# 14. Preview and lightweight rendering editor

Reuse existing Remotion or canonical rendering tooling where appropriate.

The browser preview should render from the same structured project state used by final rendering.

Required supported layers in v1:

```text
background color/image/video
brand logo
primary text
secondary text
source quotation
character image/video
supporting image/video
captions
narration/audio
simple shapes/overlays
```

Required animation primitives:

```text
fade
slide
scale
highlight reveal
word/line reveal
simple pan/zoom
camera push/pull
crossfade
cut
```

Do not expose arbitrary code or unsafe expressions in provider-entered animation settings.

Render formats should be configurable, starting with:

```text
16:9 presentation/video
9:16 vertical
1:1 square
static PDF/slides if existing tooling supports it safely
```

A render request must show:

```text
format
resolution
estimated duration
estimated AI/vendor cost still pending
render compute estimate when available
selected version
warnings
```

Rendering must run as a background job, not a long synchronous HTTP request.

---

# 15. Data model

Audit existing tables first and extend them where cleanly possible. Do not duplicate the existing content/prompt/job system unnecessarily.

Suggested additive tables or equivalent canonical entities:

```text
bna_studio_projects
bna_studio_sources
bna_studio_source_versions
bna_studio_source_annotations
bna_studio_briefs
bna_studio_outlines
bna_studio_guardrail_sets
bna_studio_guardrail_rules
bna_studio_characters
bna_studio_character_versions
bna_studio_scenes
bna_studio_scene_versions
bna_studio_prompt_layers
bna_studio_prompt_versions
bna_studio_revision_events
bna_studio_assets
bna_studio_asset_links
bna_studio_render_jobs
bna_studio_exports
bna_studio_handoffs

bna_ai_usage_events
bna_ai_usage_rollups
bna_ai_usage_limits
bna_ai_model_price_catalog
bna_ai_budget_alerts
```

Names may change to match repository conventions, but the concepts must remain explicit.

Every workspace-owned table must include or reliably join to:

```text
workspace_id
provider/project scope
created_by
created_at
updated_at
archived_at where applicable
```

Use stable UUIDs or the repository's canonical identifier type.

## 15.1 Project record

Minimum fields:

```text
id
workspace_id
provider_id if canonical
title
slug/key
project_type
stage
brief_json
brand_key
owner_user_id
reviewer_user_id
due_at
current_source_version_id
current_outline_version_id
current_storyboard_version
handoff_content_job_id
created_at
updated_at
archived_at
```

## 15.2 Versioning

Do not overwrite approved or previously rendered versions.

Version relationships should support:

```text
supersedes
derived_from
restored_from
generated_by_job
approved_by
approved_at
```

## 15.3 Migrations

- additive and idempotent;
- no destructive drop/rename without compatibility layer;
- explicit indexes for workspace/project/status/date;
- foreign keys where safe;
- rollback notes;
- repeat migration test;
- safe backfill for any existing provider prompt/content records;
- no missing `workspace_id` treated as global.

---

# 16. API contract

Adapt route names to the canonical server style after audit.

Required capabilities:

```text
GET    /api/bna/studio/projects
POST   /api/bna/studio/projects
GET    /api/bna/studio/projects/:projectId
PATCH  /api/bna/studio/projects/:projectId
POST   /api/bna/studio/projects/:projectId/archive

POST   /api/bna/studio/projects/:projectId/sources
GET    /api/bna/studio/projects/:projectId/sources
POST   /api/bna/studio/projects/:projectId/sources/:sourceId/normalize
POST   /api/bna/studio/projects/:projectId/sources/:sourceId/confirm

GET    /api/bna/studio/projects/:projectId/brief
PUT    /api/bna/studio/projects/:projectId/brief
POST   /api/bna/studio/projects/:projectId/analyze
POST   /api/bna/studio/projects/:projectId/generate-outline

GET    /api/bna/studio/characters
POST   /api/bna/studio/characters
GET    /api/bna/studio/characters/:characterId
PATCH  /api/bna/studio/characters/:characterId
POST   /api/bna/studio/characters/:characterId/archive
GET    /api/bna/studio/characters/:characterId/versions

GET    /api/bna/studio/guardrails
POST   /api/bna/studio/guardrails
PATCH  /api/bna/studio/guardrails/:ruleId
POST   /api/bna/studio/guardrails/evaluate

GET    /api/bna/studio/projects/:projectId/scenes
POST   /api/bna/studio/projects/:projectId/scenes
PATCH  /api/bna/studio/projects/:projectId/scenes/:sceneId
POST   /api/bna/studio/projects/:projectId/scenes/reorder
POST   /api/bna/studio/projects/:projectId/generate-storyboard

GET    /api/bna/studio/projects/:projectId/prompts
POST   /api/bna/studio/projects/:projectId/prompts/compile
GET    /api/bna/studio/projects/:projectId/prompts/versions

POST   /api/bna/studio/projects/:projectId/revisions/preview
POST   /api/bna/studio/projects/:projectId/revisions/apply
POST   /api/bna/studio/projects/:projectId/revisions/:revisionId/revert

POST   /api/bna/studio/projects/:projectId/assets
GET    /api/bna/studio/projects/:projectId/assets
POST   /api/bna/studio/projects/:projectId/generate
POST   /api/bna/studio/projects/:projectId/scenes/:sceneId/generate

POST   /api/bna/studio/projects/:projectId/renders
GET    /api/bna/studio/projects/:projectId/renders
GET    /api/bna/studio/renders/:renderId
POST   /api/bna/studio/renders/:renderId/retry
POST   /api/bna/studio/renders/:renderId/cancel

POST   /api/bna/studio/projects/:projectId/approve
POST   /api/bna/studio/projects/:projectId/export
POST   /api/bna/studio/projects/:projectId/handoff-to-content
```

AI usage:

```text
GET    /api/bna/ai-usage/summary
GET    /api/bna/ai-usage/events
GET    /api/bna/ai-usage/budgets
PUT    /api/bna/ai-usage/budgets
GET    /api/bna/ai-usage/models
GET    /api/bna/ai-usage/alerts
POST   /api/bna/ai-usage/alerts/:alertId/acknowledge

GET    /api/bna/super-admin/ai-usage/summary
GET    /api/bna/super-admin/ai-usage/workspaces
GET    /api/bna/super-admin/ai-usage/events
PUT    /api/bna/super-admin/ai-usage/workspaces/:workspaceId/limits
```

All mutating routes need:

- authorization;
- validation;
- idempotency key where retries are plausible;
- audit event;
- safe error responses;
- no secret leakage;
- consistent request IDs.

Use pagination for event/project/asset/job lists.

---

# 17. AI and API usage metering

Usage tracking is not optional.

Create one canonical usage ledger used by all supported AI providers and Studio operations.

For every call, record where available:

```text
event_id
workspace_id
provider/project/user/role
studio_project_id
scene_id
job_id
vendor
model
operation
request_id
idempotency_key
input_tokens
output_tokens
cached_input_tokens
reasoning_tokens
image_count
image_size/quality
audio_input_seconds
audio_output_seconds
video_seconds
transcription_seconds
render_seconds or compute units
latency_ms
attempt_number
HTTP/status result
error class
estimated_cost_minor_units
currency
pricing_catalog_version
is_estimated
environment/test flag
created_at
```

Do not put API keys, Authorization headers, secret URLs, cookies, or private credentials into usage events.

## 17.1 Cost calculation

Do not hard-code a single permanent cost formula.

Create an effective-dated model price catalog:

```text
vendor
model
operation
unit type
input rate
output rate
cached rate
image/audio/video rate
currency
effective_from
effective_to
source/reference
updated_by
```

A usage event should retain the price snapshot/catalog version used for its estimate.

When a vendor does not return exact usage:

- store returned units when available;
- estimate only through a clearly labeled estimator;
- set `is_estimated = true`;
- never present an estimate as an exact invoice.

Keep these separate:

```text
AI/vendor usage cost
render compute estimate
Railway infrastructure usage
storage/egress
provider subscription/billing
```

Do not conflate Railway spend with model spend.

## 17.2 Budgets and limits

Support:

```text
monthly workspace soft budget
monthly workspace hard limit
daily request limit
per-user or role limit where needed
allowed models
allowed operation types
max image/video duration
concurrency limit
Super Admin override
```

Alerts:

```text
50%
80%
100%
unexpected spike
repeated vendor errors
model price unknown
usage event missing cost units
```

Hard-limit behavior:

- perform quota check before call;
- use a transaction/lock or equivalent to prevent obvious race overrun;
- return a useful UI error;
- allow audited Super Admin override;
- still log rejected/failed attempts where appropriate.

## 17.3 Usage UI

Provider workspace **Usage** display:

- month-to-date estimated AI cost;
- token/media usage;
- budget progress;
- usage by project;
- usage by user;
- usage by operation;
- usage by vendor/model;
- failed/retried calls;
- recent alerts;
- date range and export.

Super Admin display:

- all workspace totals;
- rank/filter by spend;
- budget vs actual;
- model/vendor distribution;
- failure rate;
- unpriced usage;
- cost trend;
- provider drill-down;
- global price-catalog health;
- limits and override history.

The display must not expose one provider's prompts, assets, or usage details to another provider.

---

# 18. Background jobs and Railway architecture

Use the existing Railway/runtime architecture. Do not create a new Railway project, service, database, or Redis instance unless the current approved architecture already requires it and the action is authorized.

Prefer:

```text
web/API process
PostgreSQL-backed durable job records/queue
existing or configured worker process
external/object storage for large assets
Remotion render worker
```

Do not store large media binaries in PostgreSQL.

Required job types:

```text
source_analysis
outline_generation
storyboard_generation
prompt_compilation
scene_generation
asset_generation
transcription
narration_generation
render
export
content_handoff
usage_rollup
```

Required job states:

```text
queued
leased
running
waiting_external
retry_scheduled
succeeded
failed
cancelled
blocked
```

Job requirements:

- workspace/project scope;
- idempotency;
- lease/heartbeat;
- bounded retries;
- exponential backoff;
- dead-letter/blocked visibility;
- progress percentage and human-readable phase;
- last error;
- safe cancellation;
- stale-job detector;
- provider-visible status;
- Super Admin visibility;
- usage events per vendor attempt;
- no silent permanent pending state.

Use polling, server-sent events, or the canonical realtime approach. Do not add a new realtime stack without need.

For local/tests, provide deterministic mock generators and mock renders so the feature is testable without live vendor credentials.

---

# 19. Assets, storage, rights, and privacy

Studio assets must include metadata:

```text
workspace
project
source
creator/uploader
type
MIME
dimensions/duration
hash
storage key or provider URL
rights/consent status
public/internal rule
intended use
alt-text guidance
crop/focal point
created_at
```

Do not place:

- identifiable child photography;
- raw crowd video;
- private class recordings;
- unapproved provider/customer assets

into a public path without verified approval.

Generated assets must retain:

- prompt version;
- model/vendor;
- seed/reference IDs when supplied;
- generation job;
- usage/cost event;
- approval state.

Use signed/private access where appropriate.

---

# 20. Content/Library handoff

The existing Content section remains the approved/published side of the workflow.

Studio's **Hand off to Content** action should create or update the canonical existing entity, such as:

- content job;
- content output;
- class session;
- content bundle;
- course lesson;
- worksheet/resource;
- library draft.

The exact mapping must follow the current production architecture.

Handoff package should include:

```text
Studio project/version
title/summary
source provenance
approved scene/slide manifest
render/export URLs
worksheet/source-sheet files
transcript/narration
thumbnail/poster
alt text
rights status
audience/access recommendation
provider/workspace
usage/cost summary
review/approval record
```

Handoff must be idempotent.

Do not automatically publish or grant member access. Existing Content/Library approval and publishing rules remain separate.

Show a clear state:

```text
Ready for Content
Handed off
Content draft created
Published
Publication blocked
```

---

# 21. Provider configuration and One Time pilot

## 21.1 Shared provider configuration

Create or extend provider Studio configuration:

```json
{
  "studio_enabled": true,
  "default_language": "en",
  "supported_languages": ["en"],
  "brand_key": "...",
  "context_pack": "...",
  "allowed_project_types": ["class_slideshow", "explainer_video"],
  "default_output": {
    "aspect_ratio": "16:9",
    "duration_minutes": 8
  },
  "allowed_models": [],
  "monthly_ai_budget": null,
  "hard_limit_enabled": false,
  "approval_required_for_content_handoff": true
}
```

Super Admin can configure platform defaults. Provider owners/admins can configure permitted workspace-level values.

## 21.2 One Time seed

Use Rabbi Eli Scheller / One Time as the first realistic test/provider configuration:

```text
workspace/provider: rabbi_sheller_provider
project context: one_time_mishnah_class
brand: One Time
default language: English, with Hebrew source support
provider role: Rabbi Eli Scheller
manager/admin role: Shloimie
```

Seed or provide a safe test fixture containing:

- pasted Mishnah/source text;
- project goal;
- at least three scenes;
- at least two saved characters;
- a Torah/Jewish visual context pack;
- one character correction;
- one scene-only correction;
- bold/highlight source annotation;
- mock image generation;
- mock render;
- handoff to a test Content draft;
- usage events and rollups.

Do not use real child/private data in fixtures.

One Time-specific rules belong in its provider configuration, not shared global defaults.

Preserve existing One Time review routes and PR #5 work. Extend the canonical provider/Operations shell rather than making another One Time-only editor.

---

# 22. Design and accessibility contract

Use the existing design system and provider brand overrides.

The Studio should feel like a professional production application:

- compact information density;
- obvious hierarchy;
- restrained cards;
- clear selected/active states;
- no generic gray box wall;
- no excessive pills;
- no giant empty dashboards;
- consistent typography;
- intentional whitespace;
- responsive drawers/rails;
- polished loading/skeleton states;
- specific empty states;
- actionable error states;
- visible save/version status.

One Time should inherit its configured black/yellow/white/teal direction. Other providers should inherit their own brand tokens.

Accessibility:

- keyboard navigable;
- visible focus;
- semantic tabs/buttons/forms;
- labels and descriptions;
- no color-only status;
- live regions for generation/render progress;
- reduced-motion mode;
- caption/transcript support;
- adequate contrast;
- drag/reorder also available through keyboard controls;
- alt-text workflow for meaningful images;
- RTL-safe Hebrew source and annotations.

---

# 23. Implementation phases

## Phase A — Baseline and architecture reconciliation

- inspect canonical code and current PR/branches;
- map existing content, prompt, job, usage, rendering, provider, and RBAC systems;
- write baseline;
- write route/data/component map;
- add failing tests for missing Studio navigation, RBAC, and usage scoping.

## Phase B — Additive schema and domain services

- Studio project/source/brief/character/guardrail/scene/version models;
- usage event, price catalog, limits, and rollups;
- indexes and constraints;
- domain services;
- idempotent migrations;
- migration repeat test.

## Phase C — Prompt compiler and revision engine

- layered compiler;
- schema validation;
- source delimiter/injection defense;
- versioning;
- natural-language correction preview/apply/revert;
- affected-layer calculation;
- cost estimate before broad regeneration;
- unit tests.

## Phase D — Studio navigation and project UI

- top-level Studio module before Content;
- project dashboard;
- project tabs;
- source paste/normalization;
- brief;
- outline;
- characters/guardrails;
- version/activity.

## Phase E — Storyboard and preview editor

- scene list;
- center preview;
- right inspector;
- timeline/duration;
- text annotations;
- asset assignment;
- version compare;
- responsive mobile/tablet variants;
- Remotion Player or canonical preview.

## Phase F — Jobs, generation, and rendering

- durable jobs;
- mock adapters;
- vendor adapter contract;
- progress/retry/cancel/stale handling;
- render worker;
- export records;
- no long synchronous requests.

## Phase G — AI usage dashboard and controls

- event instrumentation around every Studio AI/vendor call;
- workspace/provider dashboard;
- Super Admin dashboard;
- budgets/limits/alerts;
- pricing catalog;
- exports and reconciliation;
- cross-workspace tests.

## Phase H — Content handoff

- approved Studio project to canonical Content/Library draft;
- idempotent mapping;
- provenance and rights metadata;
- no automatic publishing;
- visible handoff status.

## Phase I — Security, responsive, accessibility, and cleanup

- negative RBAC tests;
- prompt injection tests;
- rights/privacy checks;
- WebKit/Safari paste tests;
- 390/768/1440 Playwright;
- keyboard/accessibility checks;
- remove dead code and placeholder controls;
- confirm no duplicate Studio/Content implementation.

## Phase J — Integration and default-branch merge

Follow Section 26 exactly.

---

# 24. Automated test plan

Add focused tests for:

## Domain/unit

- source raw/normalized versioning;
- source hash/fingerprint;
- annotations preserve source;
- prompt layer ordering;
- prompt compilation determinism;
- prompt schema validation;
- revision classification;
- patch scope;
- patch preview/apply/revert;
- locked-scene protection;
- character continuity;
- guardrail evaluation;
- project stage transitions;
- content handoff idempotency;
- usage cost calculation;
- effective-dated price catalog;
- quota checks;
- usage rollups;
- retry/idempotency.

## API/integration

- create/read/update/archive Studio project;
- provider scope;
- Super Admin aggregate scope;
- cross-workspace rejection;
- scene/character ID tampering rejection;
- source paste/normalization;
- outline/storyboard generation with mocks;
- correction preview/apply;
- render queue lifecycle;
- failed vendor call and retry;
- hard budget rejection;
- audited override;
- Content handoff exactly once;
- no public access to drafts.

## Browser/Playwright

Viewports:

```text
390 × 844
768 × 1024
1440 × 900
```

Browsers:

```text
Chromium
WebKit
```

Verify:

- Studio appears before Content for service-provider workspaces;
- Studio does not appear for unauthorized workspaces;
- project dashboard;
- paste from clipboard;
- Hebrew/RTL source;
- rich-text sanitization;
- autosave and refresh recovery;
- goal editor;
- Character Bible;
- natural-language correction preview;
- scope selector;
- storyboard reorder;
- scene edit;
- bold/highlight annotation;
- preview;
- mock render progress;
- usage totals;
- budget warning;
- Super Admin usage drill-down;
- provider cannot see another workspace;
- handoff to test Content draft;
- mobile drawers/tabs;
- keyboard navigation;
- no horizontal overflow;
- no console errors;
- no unexpected failed requests.

## Required repository gates

Run the canonical current commands, including at minimum where present:

```bash
node --check server.js
npm test
npm run bna:run:validate
npm run watchdog:actions
npm run watchdog:security
node scripts/audit-secrets.mjs
git diff --check
```

Also run:

- JSON/JSONL parse checks;
- migration repeat test;
- focused Studio tests;
- focused usage tests;
- focused RBAC tests;
- Playwright Chromium and WebKit;
- production build/start smoke if the repo has one;
- no-secret and large-file audit.

Do not fake unavailable live-vendor evidence. Mocks must be clearly labeled.

---

# 25. Exact acceptance criteria

The implementation is not complete until all applicable criteria pass:

1. Studio is a separate provider module before Content.
2. It uses the canonical provider/Operations shell.
3. All service-provider workspaces can enable/use it.
4. One Time is a configuration/pilot, not a fork.
5. Raw pasted source is immutable and versioned.
6. Safari/WebKit paste is tested.
7. Hebrew and mixed RTL/LTR render correctly.
8. Bold/highlight is stored as annotation, not source mutation.
9. Brief/goal/audience are structured and editable.
10. Goal changes show affected downstream layers.
11. Outline generation is schema validated.
12. Character Bible is workspace/project scoped and versioned.
13. Character guardrails are explicit.
14. Prompt layers are visible.
15. Compiled prompt and diff are visible.
16. Natural-language corrections produce a previewable structured patch.
17. Scope can be scene, character, project, or workspace default.
18. Broad changes require confirmation.
19. Every change has history and rollback.
20. Storyboard supports reorder/edit/duplicate/split/merge.
21. Locked scenes survive global regeneration.
22. Preview uses structured project state.
23. Render is backgrounded and observable.
24. Failed/stale jobs are visible and retryable.
25. Usage is logged for all Studio vendor calls.
26. Cost uses an effective-dated pricing catalog.
27. Estimated vs exact usage is labeled.
28. Provider owners see own workspace only.
29. Super Admin sees aggregate and drill-down usage.
30. Budgets, soft alerts, hard limits, and audited override work.
31. AI cost is separated from Railway/storage/render infrastructure cost.
32. Cross-workspace tests pass.
33. Content handoff is idempotent.
34. Handoff does not auto-publish.
35. Rights/privacy metadata travels with outputs.
36. No unapproved child/private assets become public.
37. 390/768/1440 layouts pass.
38. Chromium and WebKit tests pass.
39. No dead or misleading controls remain.
40. No duplicate app, task system, prompt system, or Content system is introduced.
41. Additive migrations rerun safely.
42. Full repository tests pass.
43. Secret and large-file scans pass.
44. Feature branch is integrated without losing PR #5/canonical work.
45. The actual default branch contains the final merge commit.
46. The final default-branch worktree is clean.
47. Final report includes exact commits, tests, screenshots, routes, migrations, usage evidence, and remaining external blockers.

---

# 26. Debug, cleanup, integration, and merge protocol

The operator explicitly wants this implemented in a separate worktree and then merged cleanly into the repository's default branch.

## 26.1 Feature completion gate

Before integration:

- feature worktree is clean;
- all feature commits are present;
- focused tests pass;
- full tests pass;
- Playwright passes;
- secret scan passes;
- `git diff --check` passes;
- migration repeat passes;
- no untracked required source files;
- no generated/private media is accidentally tracked;
- review the full diff against the chosen base;
- remove debug logging, dead flags, placeholder buttons, unused CSS, duplicate routes, and stale mocks not intended for tests.

Create:

```text
docs/product/service-provider-studio-verification.md
```

with requirement-by-requirement evidence.

## 26.2 Independent verification

Perform a second verification pass from a clean checkout/worktree or equivalent clean state.

Do not trust the implementation summary.

Verify:

- route/source truth;
- schema;
- permission boundaries;
- usage totals;
- prompt/version behavior;
- source preservation;
- Content handoff;
- responsive UI;
- current PR #5 compatibility.

If a P0/P1 criterion fails, fix it in the feature branch and rerun the required gates.

## 26.3 Create a clean integration worktree

Fetch remote again.

Determine:

- current default branch;
- latest default branch HEAD;
- current PR #5/canonical branch state;
- whether new commits landed while the feature was in progress.

Create a separate clean integration worktree from the newest safe integration base.

Do not integrate in the original dirty checkout.

If PR #5 contains required unmerged canonical work:

1. preserve it;
2. update/rebase the feature branch safely;
3. integrate the feature with PR #5's current branch;
4. run conflict and regression checks;
5. then merge the complete canonical result to the actual default branch.

Do not bypass or overwrite newer work.

## 26.4 Merge

Use an ordinary auditable merge or the repository's canonical PR method.

Do not force-push.

After merging the feature branch into the integration branch/default candidate:

- inspect conflict resolutions line by line;
- search for duplicate routes, migrations, components, tables, and CSS;
- rerun focused tests;
- rerun full `npm test`;
- rerun execution-run validation;
- rerun Playwright Chromium and WebKit;
- rerun secret/large-file audits;
- rerun `git diff --check`;
- start the app locally/test environment and smoke the Studio, Content handoff, and usage views.

## 26.5 Merge into the actual default branch

You are authorized to merge this feature into the repository's actual default branch after every required gate is green.

Do not assume the branch is named `main`; it may be `master` or another protected default branch.

If branch protection requires a PR:

- create/update the canonical PR;
- include the complete implementation and evidence;
- wait for required automated checks;
- merge through the protected flow when permitted.

If human approval is technically mandatory and cannot be completed from the available authenticated environment, do not claim merge completion. Return:

```text
MERGE BLOCKED BY BRANCH PROTECTION
```

with:

- exact PR;
- exact commit;
- exact checks;
- exact remaining approval/click;
- confirmation that no code work remains.

Otherwise:

- merge to default;
- push the default branch;
- record the merge commit SHA;
- verify remote default includes it;
- verify the worktree is clean.

Do not deploy, change DNS, provision Railway resources, send messages, upload to Vimeo, or trigger paid/live external actions merely to satisfy this task. If the repository's default branch auto-deploys, record and verify the resulting deployment through the established safe smoke process without changing Railway topology.

## 26.6 Worktree cleanup

Only after the remote default branch contains the verified merge:

- confirm no unique unmerged commits remain;
- remove the temporary integration worktree;
- remove the feature worktree if clean and no longer needed;
- delete local feature branch only if fully merged and repository policy allows;
- do not delete remote branches needed by PR/history policy.

Record final `git worktree list` and `git status`.

---

# 27. Required documentation and tracking

Create/update only canonical records:

```text
docs/product/service-provider-studio.md
docs/product/service-provider-studio-baseline-2026-06-23.md
docs/product/service-provider-studio-verification.md
docs/architecture/service-provider-studio-prompt-engine.md
docs/architecture/service-provider-studio-render-jobs.md
docs/architecture/ai-usage-metering.md
docs/security/service-provider-studio-privacy.md
docs/integrations/studio-model-adapters.md
```

Update:

- active execution run;
- requirement register;
- `TASKS.md` only when actual queue state changes;
- `SYSTEM-STATE.md` only for verified architecture/state changes;
- current daily memory;
- agent ledger;
- changelog;
- route/component documentation;
- migrations list.

Do not create a second execution protocol.

---

# 28. Final response contract

Return:

## Executive result

## Current Git truth

- starting base branch/HEAD;
- feature worktree/branch;
- feature commits;
- integration worktree/branch;
- default branch;
- merge commit;
- pushed yes/no;
- PR #5 state;
- clean worktree yes/no;
- deploy state if auto-deploy occurred.

## What already existed and was reused

- content tables/APIs;
- prompt/version primitives;
- provider shell;
- workspace/RBAC;
- rendering tools;
- usage primitives;
- One Time review work.

## What was implemented

- navigation;
- Studio workflow;
- source intake;
- prompt compiler;
- natural-language patches;
- Character Bible;
- guardrails;
- storyboard/editor;
- jobs/rendering;
- usage metering;
- Content handoff.

## Data model and migrations

## Routes and APIs

## Provider/Super Admin usage controls

## One Time pilot evidence

## Tests and validation

Include exact commands and counts.

## Browser evidence

List screenshots by route, role, and viewport.

## Security/privacy result

## External blockers

Only genuine credentials, vendor accounts, or human approvals.

## Final state

Choose exactly one:

```text
COMPLETE — STUDIO IMPLEMENTED, VERIFIED, AND MERGED TO DEFAULT
```

```text
COMPLETE — CODE VERIFIED; MERGE BLOCKED ONLY BY BRANCH PROTECTION
```

```text
PARTIAL — RESUME AT <exact requirement, branch, commit, and command>
```

Do not return complete while any unblocked implementation, test, cleanup, integration, or merge requirement remains.
