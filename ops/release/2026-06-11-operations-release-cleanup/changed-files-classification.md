# Dirty Files Classification - 2026-06-11

Classes:

- A: current release-critical
- B: current release support/docs/tests
- C: generated artifacts
- D: unrelated existing work
- E: unknown/manual review
- F: unsafe deletion/rename

Git status entries classified: 353
Individual tracked/untracked entries classified: 1957
Individual untracked files: 1774
Curated patch files: 62

## Git Status Entries

| # | Status | Class | Path | Reason |
| ---: | --- | --- | --- | --- |
| 1 | ` M` | A | `.env.example` | Curated release-critical file proven by clean-branch validation. |
| 2 | ` M` | E | `.gitignore` | Not confidently attributable to the focused release; needs Shloimie review. |
| 3 | ` M` | E | `.mcp.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 4 | ` M` | E | `AGENTS.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 5 | ` M` | E | `Dockerfile` | Not confidently attributable to the focused release; needs Shloimie review. |
| 6 | ` M` | E | `KIMI-BOOTSTRAP.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 7 | ` M` | D | `MEMORY.md` | Broad memory/task ledger or process file deliberately excluded from the focused release patch. |
| 8 | ` M` | D | `PROJECT-NOTES.md` | Broad memory/task ledger or process file deliberately excluded from the focused release patch. |
| 9 | ` M` | E | `SUPABASE_SETUP.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 10 | ` M` | D | `SYSTEM-STATE.md` | Broad memory/task ledger or process file deliberately excluded from the focused release patch. |
| 11 | ` M` | D | `TASKS.md` | Broad memory/task ledger or process file deliberately excluded from the focused release patch. |
| 12 | ` M` | E | `agents/rabbi-elie-scheller/AGENTS.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 13 | ` M` | E | `agents/rabbi-elie-scheller/MEMORY.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 14 | ` M` | E | `agents/rabbi-elie-scheller/SETUP.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 15 | ` M` | E | `brand-kit/01-core-beliefs.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 16 | ` M` | E | `brand-kit/04-student-growth-principles.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 17 | ` M` | E | `brand-kit/README.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 18 | ` M` | D | `content-memory/README.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 19 | ` M` | D | `content-memory/drive-mapping.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 20 | ` M` | D | `content-memory/transcripts/002-video-from-drive-20260527-140157-mp4.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 21 | ` M` | D | `content-memory/transcripts/004-class-recording-weber-torah-m4a.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 22 | ` M` | D | `content-memory/transcripts/005-outdoor-torah-learning-and-forest-day-schedule-update.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 23 | ` M` | D | `content-memory/transcripts/006-outdoor-torah-learning-and-forest-day-update.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 24 | ` M` | D | `content-memory/transcripts/007-all-day-mishnayas-learning-and-micro-schools.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 25 | ` M` | D | `content-memory/transcripts/008-gaava-focus-and-the-jewish-calendar.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 26 | ` M` | D | `content-memory/transcripts/018-setting-personal-learning-and-fitness-goals-discussion.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 27 | ` M` | D | `content-memory/transcripts/019-setting-personal-learning-and-fitness-goals.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 28 | ` M` | D | `content-memory/transcripts/020-torah-learning-goals-and-camping-trip-incentive.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 29 | ` M` | D | `content-memory/transcripts/021-bnei-neviim-torah-learning-and-accountability-update.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 30 | ` M` | D | `content-memory/transcripts/index.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 31 | `R ` | E | `ARCHITECTURE.md -> docs/archive/legacy-family-accountability/ARCHITECTURE.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 32 | `R ` | E | `CHANGELOG.md -> docs/archive/legacy-family-accountability/CHANGELOG.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 33 | `R ` | E | `CLAUDE_CODE_PROMPT.md -> docs/archive/legacy-family-accountability/CLAUDE_CODE_PROMPT.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 34 | `R ` | E | `DESIGN.md -> docs/archive/legacy-family-accountability/DESIGN.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 35 | `R ` | E | `README-bundle.md -> docs/archive/legacy-family-accountability/README-bundle.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 36 | `R ` | E | `README.md -> docs/archive/legacy-family-accountability/README-family-accountability.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 37 | `R ` | E | `SETUP.md -> docs/archive/legacy-family-accountability/SETUP.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 38 | `R ` | E | `SPEC.md -> docs/archive/legacy-family-accountability/SPEC.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 39 | `R ` | E | `WISHLIST.md -> docs/archive/legacy-family-accountability/WISHLIST.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 40 | `R ` | E | `launch.html -> docs/archive/legacy-family-accountability/launch.html` | Not confidently attributable to the focused release; needs Shloimie review. |
| 41 | `R ` | E | `onboarding/index.html -> docs/archive/legacy-family-accountability/onboarding-index.html` | Not confidently attributable to the focused release; needs Shloimie review. |
| 42 | `R ` | E | `supabase-migration-002.sql -> docs/archive/legacy-family-accountability/supabase-migration-002.sql` | Not confidently attributable to the focused release; needs Shloimie review. |
| 43 | `R ` | E | `supabase-schema.sql -> docs/archive/legacy-family-accountability/supabase-schema.sql` | Not confidently attributable to the focused release; needs Shloimie review. |
| 44 | `R ` | E | `RUN_IN_SUPABASE.sql -> docs/archive/legacy-supabase-setup/RUN_IN_SUPABASE.sql` | Not confidently attributable to the focused release; needs Shloimie review. |
| 45 | `R ` | E | `supabase-migration-003-bna-tasks.sql -> docs/archive/legacy-supabase-setup/supabase-migration-003-bna-tasks.sql` | Not confidently attributable to the focused release; needs Shloimie review. |
| 46 | `R ` | E | `supabase-migration-004-cli-bridge.sql -> docs/archive/legacy-supabase-setup/supabase-migration-004-cli-bridge.sql` | Not confidently attributable to the focused release; needs Shloimie review. |
| 47 | ` M` | C | `lighthouse-report.html` | Generated verification/build/release artifact excluded from the deploy patch. |
| 48 | ` M` | E | `migrate-railway.sql` | Not confidently attributable to the focused release; needs Shloimie review. |
| 49 | ` D` | F | `next.config.mjs` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 50 | ` M` | D | `ops/agent-changelog.md` | Broad memory/task ledger or process file deliberately excluded from the focused release patch. |
| 51 | ` M` | D | `ops/agent-task-ledger.jsonl` | Broad memory/task ledger or process file deliberately excluded from the focused release patch. |
| 52 | ` M` | E | `package.json` | Dependency metadata changed outside the curated patch; manual review required. |
| 53 | ` D` | F | `postcss.config.mjs` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 54 | ` M` | E | `public/data/learning-moments.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 55 | ` M` | E | `public/faq.html` | Not confidently attributable to the focused release; needs Shloimie review. |
| 56 | ` M` | E | `public/index.html` | Not confidently attributable to the focused release; needs Shloimie review. |
| 57 | ` M` | E | `public/js/bna-content.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 58 | ` M` | E | `public/js/signup-documents.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 59 | ` M` | E | `public/manifest.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 60 | ` M` | A | `public/operations-login.html` | Curated release-critical file proven by clean-branch validation. |
| 61 | ` M` | A | `public/operations.html` | Curated release-critical file proven by clean-branch validation. |
| 62 | ` M` | E | `public/signup-thank-you.html` | Not confidently attributable to the focused release; needs Shloimie review. |
| 63 | ` M` | A | `public/student.html` | Curated release-critical file proven by clean-branch validation. |
| 64 | ` M` | E | `railway-migration-2026-06-05-one-time-projects.sql` | Not confidently attributable to the focused release; needs Shloimie review. |
| 65 | ` M` | E | `railway.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 66 | ` M` | E | `screenshots/desktop-1440.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 67 | ` M` | E | `screenshots/mobile-360.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 68 | ` M` | E | `screenshots/mobile-390.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 69 | ` M` | E | `screenshots/mobile-430.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 70 | ` M` | E | `screenshots/tablet-768.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 71 | ` M` | E | `scripts/agent-fleet-supervisor.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 72 | ` D` | F | `scripts/apply-schema.mjs` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 73 | ` M` | E | `scripts/ghl-ops.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 74 | ` D` | F | `scripts/launch.mjs` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 75 | ` M` | E | `scripts/railway-redeploy.ps1` | Not confidently attributable to the focused release; needs Shloimie review. |
| 76 | ` D` | F | `scripts/send-onboarding.mjs` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 77 | ` D` | F | `scripts/set-webhooks.mjs` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 78 | ` M` | A | `scripts/smoke-live-app.mjs` | Curated release-critical file proven by clean-branch validation. |
| 79 | ` M` | E | `scripts/smoke-openai-sidekick.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 80 | ` M` | A | `scripts/telegram-kimi-bridge.mjs` | Curated release-critical file proven by clean-branch validation. |
| 81 | ` M` | A | `server.js` | Curated release-critical file proven by clean-branch validation. |
| 82 | ` D` | F | `src/app/api/ad-hoc-tasks/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 83 | ` D` | F | `src/app/api/auth/kid-login/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 84 | ` D` | F | `src/app/api/auth/kid-logout/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 85 | ` D` | F | `src/app/api/auth/parent-callback/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 86 | ` D` | F | `src/app/api/auth/parent-request/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 87 | ` D` | F | `src/app/api/bna/migrate-db/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 88 | ` D` | F | `src/app/api/bna/migrate/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 89 | ` D` | F | `src/app/api/bna/payments/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 90 | ` D` | F | `src/app/api/bna/signups/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 91 | ` D` | F | `src/app/api/bna/tasks/[id]/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 92 | ` D` | F | `src/app/api/bna/tasks/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 93 | ` D` | F | `src/app/api/bna/telegram/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 94 | ` D` | F | `src/app/api/checkins/approve/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 95 | ` D` | F | `src/app/api/checkins/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 96 | ` D` | F | `src/app/api/consequences/[id]/approve/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 97 | ` D` | F | `src/app/api/consequences/[id]/override/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 98 | ` D` | F | `src/app/api/consequences/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 99 | ` D` | F | `src/app/api/cron/daily-summary/resend/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 100 | ` D` | F | `src/app/api/cron/daily-summary/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 101 | ` D` | F | `src/app/api/cron/reminders/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 102 | ` D` | F | `src/app/api/goals/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 103 | ` D` | F | `src/app/api/meetings/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 104 | ` D` | F | `src/app/api/onboarding/complete/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 105 | ` D` | F | `src/app/api/parent-notes/[id]/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 106 | ` D` | F | `src/app/api/parent-notes/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 107 | ` D` | F | `src/app/api/proof-upload/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 108 | ` D` | F | `src/app/api/qr/[kid]/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 109 | ` D` | F | `src/app/api/telegram/webhook/[parent]/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 110 | ` D` | F | `src/app/api/users/freeze/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 111 | ` D` | F | `src/app/api/users/pin-hash/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 112 | ` D` | F | `src/app/globals.css` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 113 | ` D` | F | `src/app/kid/[name]/KidGoalList.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 114 | ` D` | F | `src/app/kid/[name]/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 115 | ` D` | F | `src/app/kid/[name]/pin/PinForm.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 116 | ` D` | F | `src/app/kid/[name]/pin/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 117 | ` D` | F | `src/app/layout.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 118 | ` D` | F | `src/app/operations/components/SummaryCards.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 119 | ` D` | F | `src/app/operations/components/TaskApp.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 120 | ` D` | F | `src/app/operations/components/TaskCard.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 121 | ` D` | F | `src/app/operations/components/TaskFilters.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 122 | ` D` | F | `src/app/operations/components/TaskFormModal.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 123 | ` D` | F | `src/app/operations/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 124 | ` D` | F | `src/app/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 125 | ` D` | F | `src/app/parent/[kid]/NewMeetingModal.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 126 | ` D` | F | `src/app/parent/[kid]/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 127 | ` D` | F | `src/app/parent/login/LoginForm.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 128 | ` D` | F | `src/app/parent/login/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 129 | ` D` | F | `src/app/parent/onboarding/OnboardingWizard.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 130 | ` D` | F | `src/app/parent/onboarding/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 131 | ` D` | F | `src/app/parent/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 132 | ` D` | F | `src/components/install/InstallPrompt.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 133 | ` D` | F | `src/components/kid/KidNotesDisplay.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 134 | ` D` | F | `src/components/locale/LocaleToggle.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 135 | ` D` | F | `src/components/parent/AdHocTaskButton.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 136 | ` D` | F | `src/components/parent/ApproveAllButton.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 137 | ` D` | F | `src/components/parent/ConsequenceList.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 138 | ` D` | F | `src/components/parent/FreezeToggle.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 139 | ` D` | F | `src/components/parent/Header.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 140 | ` D` | F | `src/components/parent/NotesWall.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 141 | ` D` | F | `src/components/parent/PendingCheckinRow.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 142 | ` D` | F | `src/components/ui/Button.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 143 | ` D` | F | `src/components/ui/Card.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 144 | ` D` | F | `src/components/ui/Confetti.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 145 | ` D` | F | `src/components/ui/Sheet.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 146 | ` D` | F | `src/components/ui/Skeleton.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 147 | ` D` | F | `src/components/ui/StreakBadge.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 148 | ` D` | F | `src/lib/ai/chat.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 149 | ` D` | F | `src/lib/ai/client.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 150 | ` D` | F | `src/lib/ai/family-context.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 151 | ` D` | F | `src/lib/ai/system-prompt.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 152 | ` D` | F | `src/lib/auth/kid-session.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 153 | ` D` | F | `src/lib/auth/parent-session.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 154 | ` D` | F | `src/lib/bna/cli-bridge.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 155 | ` M` | E | `src/lib/bna/goal-board.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 156 | ` D` | F | `src/lib/bna/task-pipeline.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 157 | ` D` | F | `src/lib/bna/telegram-bot.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 158 | ` M` | A | `src/lib/bna/telegram-content-intent.js` | Curated release-critical file proven by clean-branch validation. |
| 159 | ` D` | F | `src/lib/email/client.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 160 | ` D` | F | `src/lib/email/render.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 161 | ` D` | F | `src/lib/email/templates/DailySummary.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 162 | ` D` | F | `src/lib/fonts.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 163 | ` D` | F | `src/lib/i18n.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 164 | ` D` | F | `src/lib/onboarding.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 165 | ` D` | F | `src/lib/supabase/admin.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 166 | ` D` | F | `src/lib/supabase/browser.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 167 | ` D` | F | `src/lib/supabase/server.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 168 | ` D` | F | `src/lib/supabase/types.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 169 | ` D` | F | `src/lib/tasks/store.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 170 | ` D` | F | `src/lib/tasks/types.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 171 | ` D` | F | `src/lib/telegram/auth.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 172 | ` D` | F | `src/lib/telegram/client.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 173 | ` D` | F | `src/lib/telegram/handlers.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 174 | ` D` | F | `src/lib/telegram/messages.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 175 | ` D` | F | `src/lib/telegram/notify.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 176 | ` D` | F | `src/middleware.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 177 | ` M` | E | `src/remotion/README.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 178 | ` M` | E | `src/remotion/Root.tsx` | Not confidently attributable to the focused release; needs Shloimie review. |
| 179 | ` D` | F | `tailwind.config.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 180 | ` M` | E | `tasks-pending/2026-06-05-student-goal-board-classroom-consequences.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 181 | ` M` | E | `tasks-pending/2026-06-05-telegram-ai-mode-and-one-time-rabbi-setup.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 182 | ` M` | E | `tests/goal-board.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 183 | ` M` | E | `tests/telegram-content-intent.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 184 | `??` | E | `README.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 185 | `??` | E | `brand-kit/08-current-learning-model.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 186 | `??` | D | `content-memory/prompt-patches/` | Unrelated existing work or historical/generated audit material outside this release. |
| 187 | `??` | D | `content-memory/public-bibliographies/` | Unrelated existing work or historical/generated audit material outside this release. |
| 188 | `??` | D | `content-memory/source-sheets/` | Unrelated existing work or historical/generated audit material outside this release. |
| 189 | `??` | D | `content-memory/transcripts/022-bnei-neviim-overview-and-insights.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 190 | `??` | D | `content-memory/transcripts/023-handling-ui-updates-after-killing-a-process.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 191 | `??` | D | `content-memory/transcripts/024-complete-google-business-profile-task.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 192 | `??` | D | `content-memory/transcripts/025-joshua-s-conquest-and-moses-and-aaron-s-death.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 193 | `??` | D | `content-memory/transcripts/026-serving-hashem-joy-and-worldly-pleasure-debate.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 194 | `??` | D | `content-memory/transcripts/027-extracting-questions-from-all-transcripts.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 195 | `??` | D | `content-memory/transcripts/028-setting-up-automated-facebook-post-for-autonomy-questions.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 196 | `??` | D | `content-memory/transcripts/029-autonomy-questions-facebook-video-post.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 197 | `??` | D | `content-memory/transcripts/030-dangerous-black-balloons-threatening-israel.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 198 | `??` | D | `content-memory/transcripts/031-adam-naming-animals-and-eve-explained-by-rashi.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 199 | `??` | D | `content-memory/transcripts/032-youtube-4-september-2025.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 200 | `??` | D | `content-memory/transcripts/033-youtube-2-september-2025.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 201 | `??` | D | `content-memory/transcripts/034-youtube-why-your-kids-are-addicted-to-junk-food.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 202 | `??` | D | `content-memory/transcripts/035-youtube-the-mystery-of-going-off-the-derech.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 203 | `??` | D | `content-memory/transcripts/036-youtube-helping-our-kids-own-their-spirituality.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 204 | `??` | D | `content-memory/transcripts/037-youtube-a-i-ko-college.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 205 | `??` | D | `content-memory/transcripts/038-youtube-how-to-turn-spaced-out-moments-into-holy-lessons.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 206 | `??` | D | `content-memory/transcripts/039-youtube-does-your-son-connect-to-his-rebbe.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 207 | `??` | D | `content-memory/transcripts/040-youtube-seeing-the-big-picture-how-mixed-age-learning-helps-kids-visualize-the-e.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 208 | `??` | D | `content-memory/transcripts/041-youtube-i-m-a-baal-teshuva-but-my-kid-is-in-the-regular-charedi-system.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 209 | `??` | D | `content-memory/transcripts/042-youtube-why-kids-bicker-and-fight-what-schools-aren-t-teaching.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 210 | `??` | D | `content-memory/transcripts/043-youtube-partnering-for-a-new-era-in-jewish-education-a-vision-for-our-future.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 211 | `??` | D | `content-memory/transcripts/044-youtube-why-davening-is-a-privilege-not-a-graded-class-understanding-its-true-pu.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 212 | `??` | D | `content-memory/transcripts/045-youtube-the-hidden-struggles-in-israel-s-education-system-why-we-need-micro-scho.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 213 | `??` | D | `content-memory/transcripts/046-youtube-the-looming-crisis-in-our-educational-system.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 214 | `??` | D | `content-memory/transcripts/047-youtube-revolutionizing-jewish-education-the-urgent-need-for-ai-driven-micro-sch.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 215 | `??` | D | `content-memory/transcripts/048-youtube-inspiring-lifelong-love-for-torah-without-bribes-a-better-way-to-engage-.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 216 | `??` | D | `content-memory/transcripts/049-youtube-harnessing-ai-for-real-world-learning-the-future-of-the-secular-curricul.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 217 | `??` | D | `content-memory/transcripts/050-youtube-transforming-jewish-education-help-us-with-your-outsourced-english-conte.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 218 | `??` | D | `content-memory/transcripts/051-youtube-the-importance-of-transparency-in-your-son-s-torah-education.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 219 | `??` | D | `content-memory/transcripts/052-youtube-the-importance-of-rules-and-responsibility-in-a-dynamic-learning-environ.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 220 | `??` | D | `content-memory/transcripts/053-youtube-responsability-is-not-a-skill-you-can-teach.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 221 | `??` | D | `content-memory/transcripts/054-youtube-the-school-just-told-me-my-kid-needs-drugs.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 222 | `??` | D | `content-memory/youtube-playlist-transcripts-2024.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 223 | `??` | D | `docs/archive/dormant-next-supabase-app/` | Unrelated existing work or historical/generated audit material outside this release. |
| 224 | `??` | D | `docs/archive/legacy-family-accountability/README.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 225 | `??` | D | `docs/archive/legacy-family-accountability/scripts/` | Unrelated existing work or historical/generated audit material outside this release. |
| 226 | `??` | D | `docs/archive/legacy-supabase-setup/README.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 227 | `??` | D | `docs/archive/legacy-supabase-setup/SUPABASE_SETUP.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 228 | `??` | D | `memory/2026-06-08.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 229 | `??` | D | `memory/2026-06-09.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 230 | `??` | D | `memory/2026-06-10.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 231 | `??` | D | `memory/2026-06-11.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 232 | `??` | E | `ops/action-registry/` | Not confidently attributable to the focused release; needs Shloimie review. |
| 233 | `??` | D | `ops/drive-audits/2026-06-08T07-22-32-454Z-google-drive-audit.json` | Unrelated existing work or historical/generated audit material outside this release. |
| 234 | `??` | D | `ops/drive-audits/2026-06-08T07-22-32-454Z-google-drive-audit.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 235 | `??` | D | `ops/drive-audits/2026-06-09T19-59-21-999Z-google-drive-audit.json` | Unrelated existing work or historical/generated audit material outside this release. |
| 236 | `??` | D | `ops/drive-audits/2026-06-09T19-59-21-999Z-google-drive-audit.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 237 | `??` | D | `ops/drive-audits/2026-06-09T20-06-24-683Z-google-drive-audit.json` | Unrelated existing work or historical/generated audit material outside this release. |
| 238 | `??` | D | `ops/drive-audits/2026-06-09T20-06-24-683Z-google-drive-audit.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 239 | `??` | D | `ops/drive-audits/2026-06-09T20-11-58-409Z-google-drive-audit.json` | Unrelated existing work or historical/generated audit material outside this release. |
| 240 | `??` | D | `ops/drive-audits/2026-06-09T20-11-58-409Z-google-drive-audit.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 241 | `??` | E | `ops/marketing/` | Not confidently attributable to the focused release; needs Shloimie review. |
| 242 | `??` | E | `ops/one-time-mishnah-class/` | Not confidently attributable to the focused release; needs Shloimie review. |
| 243 | `??` | E | `ops/playwright-smokes/` | Not confidently attributable to the focused release; needs Shloimie review. |
| 244 | `??` | E | `ops/qa-runs/` | Not confidently attributable to the focused release; needs Shloimie review. |
| 245 | `??` | E | `ops/release/` | Not confidently attributable to the focused release; needs Shloimie review. |
| 246 | `??` | E | `ops/system-audits/2026-06-08-full-system-audit.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 247 | `??` | E | `ops/system-audits/2026-06-08-watchdog-system-audit.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 248 | `??` | E | `ops/system-audits/2026-06-10T11-06-28-834Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 249 | `??` | E | `ops/system-audits/2026-06-10T11-07-07-814Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 250 | `??` | E | `ops/system-audits/2026-06-10T11-30-40-645Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 251 | `??` | E | `ops/system-audits/2026-06-10T11-32-04-623Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 252 | `??` | E | `ops/system-audits/2026-06-10T11-33-42-377Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 253 | `??` | E | `ops/system-audits/2026-06-10T11-36-10-823Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 254 | `??` | E | `ops/system-audits/2026-06-10T11-43-53-396Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 255 | `??` | E | `ops/system-audits/2026-06-10T12-08-40-009Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 256 | `??` | E | `ops/system-audits/2026-06-10T12-09-34-611Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 257 | `??` | E | `ops/system-audits/2026-06-11-active-task-audit.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 258 | `??` | E | `ops/system-audits/2026-06-11-task-226-google-workspace-sender-name.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 259 | `??` | E | `ops/system-audits/2026-06-11T06-45-07-100Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 260 | `??` | E | `ops/system-audits/2026-06-11T06-51-36-438Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 261 | `??` | E | `ops/ui-audits/` | Not confidently attributable to the focused release; needs Shloimie review. |
| 262 | `??` | D | `ops/ux-audit-runs/` | Unrelated existing work or historical/generated audit material outside this release. |
| 263 | `??` | A | `public/css/bna-app-shell.css` | Curated release-critical file proven by clean-branch validation. |
| 264 | `??` | D | `public/documents/parent-handbook.html` | Content/documentation surface outside the parent/student/provider/action-registry release patch. |
| 265 | `??` | D | `public/images/hillel.jpg` | Content/documentation surface outside the parent/student/provider/action-registry release patch. |
| 266 | `??` | D | `public/images/huddle.jpg` | Content/documentation surface outside the parent/student/provider/action-registry release patch. |
| 267 | `??` | D | `public/images/meir-bunny.jpg` | Content/documentation surface outside the parent/student/provider/action-registry release patch. |
| 268 | `??` | D | `public/images/reuvane-jump-ball.jpg` | Content/documentation surface outside the parent/student/provider/action-registry release patch. |
| 269 | `??` | A | `public/js/app-select.js` | Curated release-critical file proven by clean-branch validation. |
| 270 | `??` | E | `public/js/parent-handbook-page.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 271 | `??` | A | `public/operations-manifest.json` | Curated release-critical file proven by clean-branch validation. |
| 272 | `??` | A | `public/parent.html` | Curated release-critical file proven by clean-branch validation. |
| 273 | `??` | A | `public/provider-participant.html` | Curated release-critical file proven by clean-branch validation. |
| 274 | `??` | A | `public/provider.html` | Curated release-critical file proven by clean-branch validation. |
| 275 | `??` | A | `public/providers-join.html` | Curated release-critical file proven by clean-branch validation. |
| 276 | `??` | E | `scripts/build-laptop-install-package.ps1` | Not confidently attributable to the focused release; needs Shloimie review. |
| 277 | `??` | E | `scripts/build-ux-click-map-package.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 278 | `??` | E | `scripts/correct-audio-parse-2026-06-08.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 279 | `??` | E | `scripts/full-ui-audit.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 280 | `??` | E | `scripts/ghl-mcp-stdio.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 281 | `??` | E | `scripts/ingest-drive-playlist-transcripts.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 282 | `??` | E | `scripts/rabbi-video-prompt-library.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 283 | `??` | E | `scripts/railway-start.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 284 | `??` | E | `scripts/setup-one-time-partnership-drive.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 285 | `??` | E | `scripts/start-watchdog.ps1` | Not confidently attributable to the focused release; needs Shloimie review. |
| 286 | `??` | E | `scripts/sync-drive-content-library.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 287 | `??` | E | `scripts/task-queue-reconciler.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 288 | `??` | E | `scripts/update-content-prompts-professional-tone.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 289 | `??` | E | `scripts/upload-ux-audit-to-drive.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 290 | `??` | E | `scripts/video-clip-factory.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 291 | `??` | E | `src/lib/actions/` | Not confidently attributable to the focused release; needs Shloimie review. |
| 292 | `??` | A | `src/lib/bna/google-integrations.js` | Curated release-critical file proven by clean-branch validation. |
| 293 | `??` | A | `src/lib/bna/student-match.js` | Curated release-critical file proven by clean-branch validation. |
| 294 | `??` | A | `src/lib/bna/telegram-accountability-parser.js` | Curated release-critical file proven by clean-branch validation. |
| 295 | `??` | A | `src/lib/bna/telegram-action-router.js` | Curated release-critical file proven by clean-branch validation. |
| 296 | `??` | A | `src/lib/bna/telegram-agent-intent.js` | Curated release-critical file proven by clean-branch validation. |
| 297 | `??` | A | `src/lib/bna/telegram-contact-lead-capture.js` | Curated release-critical file proven by clean-branch validation. |
| 298 | `??` | A | `src/lib/bna/telegram-planning-intent.js` | Curated release-critical file proven by clean-branch validation. |
| 299 | `??` | E | `src/lib/ghl/README.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 300 | `??` | E | `src/remotion/OrganicClipFactory.tsx` | Not confidently attributable to the focused release; needs Shloimie review. |
| 301 | `??` | E | `tasks-pending/2026-06-09-google-classroom-worksheet-assignments.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 302 | `??` | E | `tasks-pending/2026-06-09-one-time-ghl-agent-loop.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 303 | `??` | E | `tasks-pending/2026-06-09-one-time-partnership-drive-map.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 304 | `??` | E | `tasks-pending/2026-06-09-organic-clip-factory.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 305 | `??` | E | `tasks-pending/2026-06-09-parent-student-dashboard-registration-followup.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 306 | `??` | E | `tasks-pending/2026-06-09-set-your-son-free-intro-video.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 307 | `??` | E | `tasks-pending/2026-06-09-telegram-ingestion-miss-audit.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 308 | `??` | E | `tasks-pending/2026-06-09-warm-leads-and-task-filters.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 309 | `??` | E | `tasks-pending/2026-06-10-one-time-external-user-portal-and-ticketing.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 310 | `??` | E | `tasks-pending/2026-06-10-one-time-rabbi-meeting-build-brief.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 311 | `??` | E | `tasks-pending/2026-06-10-provider-commercial-model-entitlements.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 312 | `??` | E | `tasks-pending/2026-06-10-service-provider-directory-and-login.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 313 | `??` | E | `tasks-pending/2026-06-10-telegram-goal-board-api-audit.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 314 | `??` | E | `tasks-pending/2026-06-10-transcript-wide-source-sheet-production.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 315 | `??` | B | `tasks-pending/2026-06-11-action-registry-telegram-ui-bot.md` | Curated release support/test/report file proven by clean-branch validation. |
| 316 | `??` | E | `tasks-pending/2026-06-11-content-library-v2-build-brief.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 317 | `??` | B | `tasks-pending/2026-06-11-production-ui-qa-fix-loop.md` | Curated release support/test/report file proven by clean-branch validation. |
| 318 | `??` | B | `tests/action-registry-telegram-ui-bot.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 319 | `??` | B | `tests/app-select-dropdown.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 320 | `??` | B | `tests/app-wide-brand-shell.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 321 | `??` | B | `tests/bna-brand-shell.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 322 | `??` | B | `tests/google-assignment-system.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 323 | `??` | E | `tests/learning-moments-feed.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 324 | `??` | E | `tests/next-year-login-readiness.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 325 | `??` | E | `tests/one-time-external-user-portal.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 326 | `??` | E | `tests/one-time-meeting-drops.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 327 | `??` | E | `tests/operations-content-library-taxonomy.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 328 | `??` | E | `tests/operations-content-prompt-feedback.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 329 | `??` | E | `tests/operations-content-research-section.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 330 | `??` | E | `tests/operations-filter-dropdown.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 331 | `??` | E | `tests/operations-people-filter.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 332 | `??` | E | `tests/operations-pwa-login.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 333 | `??` | B | `tests/operations-saas-crm-redesign.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 334 | `??` | B | `tests/operations-student-navigation.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 335 | `??` | E | `tests/operations-task-comments-and-dictation.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 336 | `??` | B | `tests/parent-student-polish-contract.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 337 | `??` | B | `tests/parent-student-portal-contract.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 338 | `??` | E | `tests/public-content-contamination-guard.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 339 | `??` | E | `tests/rabbi-telegram-worker-runtime.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 340 | `??` | E | `tests/rabbi-video-prompt-library.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 341 | `??` | B | `tests/service-provider-directory.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 342 | `??` | B | `tests/student-bot-settings.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 343 | `??` | E | `tests/student-match.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 344 | `??` | E | `tests/task-queue-reconciler.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 345 | `??` | E | `tests/telegram-contact-lead-capture.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 346 | `??` | E | `tests/telegram-goal-board-api-coverage.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 347 | `??` | E | `tests/telegram-media-routing.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 348 | `??` | E | `tests/telegram-planning-intent.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 349 | `??` | E | `tests/telegram-ramble-routing-regression.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 350 | `??` | E | `tests/telegram-task-quick-actions.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 351 | `??` | E | `tests/torah-research-routing.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 352 | `??` | E | `tests/watchdog-soft-repair.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 353 | `??` | C | `tmp/` | Generated verification/build/release artifact excluded from the deploy patch. |

## Individual Entries

| # | Status | Class | Path | Reason |
| ---: | --- | --- | --- | --- |
| 1 | ` M` | A | `.env.example` | Curated release-critical file proven by clean-branch validation. |
| 2 | ` M` | E | `.gitignore` | Not confidently attributable to the focused release; needs Shloimie review. |
| 3 | ` M` | E | `.mcp.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 4 | ` M` | E | `AGENTS.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 5 | ` M` | E | `Dockerfile` | Not confidently attributable to the focused release; needs Shloimie review. |
| 6 | ` M` | E | `KIMI-BOOTSTRAP.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 7 | ` M` | D | `MEMORY.md` | Broad memory/task ledger or process file deliberately excluded from the focused release patch. |
| 8 | ` M` | D | `PROJECT-NOTES.md` | Broad memory/task ledger or process file deliberately excluded from the focused release patch. |
| 9 | ` M` | E | `SUPABASE_SETUP.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 10 | ` M` | D | `SYSTEM-STATE.md` | Broad memory/task ledger or process file deliberately excluded from the focused release patch. |
| 11 | ` M` | D | `TASKS.md` | Broad memory/task ledger or process file deliberately excluded from the focused release patch. |
| 12 | ` M` | E | `agents/rabbi-elie-scheller/AGENTS.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 13 | ` M` | E | `agents/rabbi-elie-scheller/MEMORY.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 14 | ` M` | E | `agents/rabbi-elie-scheller/SETUP.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 15 | ` M` | E | `brand-kit/01-core-beliefs.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 16 | ` M` | E | `brand-kit/04-student-growth-principles.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 17 | ` M` | E | `brand-kit/README.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 18 | ` M` | D | `content-memory/README.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 19 | ` M` | D | `content-memory/drive-mapping.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 20 | ` M` | D | `content-memory/transcripts/002-video-from-drive-20260527-140157-mp4.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 21 | ` M` | D | `content-memory/transcripts/004-class-recording-weber-torah-m4a.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 22 | ` M` | D | `content-memory/transcripts/005-outdoor-torah-learning-and-forest-day-schedule-update.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 23 | ` M` | D | `content-memory/transcripts/006-outdoor-torah-learning-and-forest-day-update.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 24 | ` M` | D | `content-memory/transcripts/007-all-day-mishnayas-learning-and-micro-schools.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 25 | ` M` | D | `content-memory/transcripts/008-gaava-focus-and-the-jewish-calendar.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 26 | ` M` | D | `content-memory/transcripts/018-setting-personal-learning-and-fitness-goals-discussion.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 27 | ` M` | D | `content-memory/transcripts/019-setting-personal-learning-and-fitness-goals.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 28 | ` M` | D | `content-memory/transcripts/020-torah-learning-goals-and-camping-trip-incentive.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 29 | ` M` | D | `content-memory/transcripts/021-bnei-neviim-torah-learning-and-accountability-update.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 30 | ` M` | D | `content-memory/transcripts/index.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 31 | `R ` | D | `docs/archive/legacy-family-accountability/ARCHITECTURE.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 32 | `R ` | D | `docs/archive/legacy-family-accountability/CHANGELOG.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 33 | `R ` | D | `docs/archive/legacy-family-accountability/CLAUDE_CODE_PROMPT.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 34 | `R ` | D | `docs/archive/legacy-family-accountability/DESIGN.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 35 | `R ` | D | `docs/archive/legacy-family-accountability/README-bundle.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 36 | `R ` | D | `docs/archive/legacy-family-accountability/README-family-accountability.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 37 | `R ` | D | `docs/archive/legacy-family-accountability/SETUP.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 38 | `R ` | D | `docs/archive/legacy-family-accountability/SPEC.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 39 | `R ` | D | `docs/archive/legacy-family-accountability/WISHLIST.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 40 | `R ` | D | `docs/archive/legacy-family-accountability/launch.html` | Unrelated existing work or historical/generated audit material outside this release. |
| 41 | `R ` | D | `docs/archive/legacy-family-accountability/onboarding-index.html` | Unrelated existing work or historical/generated audit material outside this release. |
| 42 | `R ` | D | `docs/archive/legacy-family-accountability/supabase-migration-002.sql` | Unrelated existing work or historical/generated audit material outside this release. |
| 43 | `R ` | D | `docs/archive/legacy-family-accountability/supabase-schema.sql` | Unrelated existing work or historical/generated audit material outside this release. |
| 44 | `R ` | D | `docs/archive/legacy-supabase-setup/RUN_IN_SUPABASE.sql` | Unrelated existing work or historical/generated audit material outside this release. |
| 45 | `R ` | D | `docs/archive/legacy-supabase-setup/supabase-migration-003-bna-tasks.sql` | Unrelated existing work or historical/generated audit material outside this release. |
| 46 | `R ` | D | `docs/archive/legacy-supabase-setup/supabase-migration-004-cli-bridge.sql` | Unrelated existing work or historical/generated audit material outside this release. |
| 47 | ` M` | C | `lighthouse-report.html` | Generated verification/build/release artifact excluded from the deploy patch. |
| 48 | ` M` | E | `migrate-railway.sql` | Not confidently attributable to the focused release; needs Shloimie review. |
| 49 | ` D` | F | `next.config.mjs` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 50 | ` M` | D | `ops/agent-changelog.md` | Broad memory/task ledger or process file deliberately excluded from the focused release patch. |
| 51 | ` M` | D | `ops/agent-task-ledger.jsonl` | Broad memory/task ledger or process file deliberately excluded from the focused release patch. |
| 52 | ` M` | E | `package.json` | Dependency metadata changed outside the curated patch; manual review required. |
| 53 | ` D` | F | `postcss.config.mjs` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 54 | ` M` | E | `public/data/learning-moments.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 55 | ` M` | E | `public/faq.html` | Not confidently attributable to the focused release; needs Shloimie review. |
| 56 | ` M` | E | `public/index.html` | Not confidently attributable to the focused release; needs Shloimie review. |
| 57 | ` M` | E | `public/js/bna-content.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 58 | ` M` | E | `public/js/signup-documents.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 59 | ` M` | E | `public/manifest.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 60 | ` M` | A | `public/operations-login.html` | Curated release-critical file proven by clean-branch validation. |
| 61 | ` M` | A | `public/operations.html` | Curated release-critical file proven by clean-branch validation. |
| 62 | ` M` | E | `public/signup-thank-you.html` | Not confidently attributable to the focused release; needs Shloimie review. |
| 63 | ` M` | A | `public/student.html` | Curated release-critical file proven by clean-branch validation. |
| 64 | ` M` | E | `railway-migration-2026-06-05-one-time-projects.sql` | Not confidently attributable to the focused release; needs Shloimie review. |
| 65 | ` M` | E | `railway.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 66 | ` M` | E | `screenshots/desktop-1440.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 67 | ` M` | E | `screenshots/mobile-360.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 68 | ` M` | E | `screenshots/mobile-390.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 69 | ` M` | E | `screenshots/mobile-430.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 70 | ` M` | E | `screenshots/tablet-768.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 71 | ` M` | E | `scripts/agent-fleet-supervisor.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 72 | ` D` | F | `scripts/apply-schema.mjs` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 73 | ` M` | E | `scripts/ghl-ops.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 74 | ` D` | F | `scripts/launch.mjs` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 75 | ` M` | E | `scripts/railway-redeploy.ps1` | Not confidently attributable to the focused release; needs Shloimie review. |
| 76 | ` D` | F | `scripts/send-onboarding.mjs` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 77 | ` D` | F | `scripts/set-webhooks.mjs` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 78 | ` M` | A | `scripts/smoke-live-app.mjs` | Curated release-critical file proven by clean-branch validation. |
| 79 | ` M` | E | `scripts/smoke-openai-sidekick.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 80 | ` M` | A | `scripts/telegram-kimi-bridge.mjs` | Curated release-critical file proven by clean-branch validation. |
| 81 | ` M` | A | `server.js` | Curated release-critical file proven by clean-branch validation. |
| 82 | ` D` | F | `src/app/api/ad-hoc-tasks/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 83 | ` D` | F | `src/app/api/auth/kid-login/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 84 | ` D` | F | `src/app/api/auth/kid-logout/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 85 | ` D` | F | `src/app/api/auth/parent-callback/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 86 | ` D` | F | `src/app/api/auth/parent-request/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 87 | ` D` | F | `src/app/api/bna/migrate-db/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 88 | ` D` | F | `src/app/api/bna/migrate/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 89 | ` D` | F | `src/app/api/bna/payments/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 90 | ` D` | F | `src/app/api/bna/signups/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 91 | ` D` | F | `src/app/api/bna/tasks/[id]/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 92 | ` D` | F | `src/app/api/bna/tasks/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 93 | ` D` | F | `src/app/api/bna/telegram/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 94 | ` D` | F | `src/app/api/checkins/approve/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 95 | ` D` | F | `src/app/api/checkins/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 96 | ` D` | F | `src/app/api/consequences/[id]/approve/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 97 | ` D` | F | `src/app/api/consequences/[id]/override/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 98 | ` D` | F | `src/app/api/consequences/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 99 | ` D` | F | `src/app/api/cron/daily-summary/resend/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 100 | ` D` | F | `src/app/api/cron/daily-summary/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 101 | ` D` | F | `src/app/api/cron/reminders/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 102 | ` D` | F | `src/app/api/goals/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 103 | ` D` | F | `src/app/api/meetings/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 104 | ` D` | F | `src/app/api/onboarding/complete/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 105 | ` D` | F | `src/app/api/parent-notes/[id]/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 106 | ` D` | F | `src/app/api/parent-notes/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 107 | ` D` | F | `src/app/api/proof-upload/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 108 | ` D` | F | `src/app/api/qr/[kid]/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 109 | ` D` | F | `src/app/api/telegram/webhook/[parent]/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 110 | ` D` | F | `src/app/api/users/freeze/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 111 | ` D` | F | `src/app/api/users/pin-hash/route.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 112 | ` D` | F | `src/app/globals.css` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 113 | ` D` | F | `src/app/kid/[name]/KidGoalList.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 114 | ` D` | F | `src/app/kid/[name]/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 115 | ` D` | F | `src/app/kid/[name]/pin/PinForm.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 116 | ` D` | F | `src/app/kid/[name]/pin/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 117 | ` D` | F | `src/app/layout.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 118 | ` D` | F | `src/app/operations/components/SummaryCards.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 119 | ` D` | F | `src/app/operations/components/TaskApp.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 120 | ` D` | F | `src/app/operations/components/TaskCard.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 121 | ` D` | F | `src/app/operations/components/TaskFilters.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 122 | ` D` | F | `src/app/operations/components/TaskFormModal.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 123 | ` D` | F | `src/app/operations/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 124 | ` D` | F | `src/app/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 125 | ` D` | F | `src/app/parent/[kid]/NewMeetingModal.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 126 | ` D` | F | `src/app/parent/[kid]/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 127 | ` D` | F | `src/app/parent/login/LoginForm.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 128 | ` D` | F | `src/app/parent/login/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 129 | ` D` | F | `src/app/parent/onboarding/OnboardingWizard.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 130 | ` D` | F | `src/app/parent/onboarding/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 131 | ` D` | F | `src/app/parent/page.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 132 | ` D` | F | `src/components/install/InstallPrompt.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 133 | ` D` | F | `src/components/kid/KidNotesDisplay.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 134 | ` D` | F | `src/components/locale/LocaleToggle.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 135 | ` D` | F | `src/components/parent/AdHocTaskButton.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 136 | ` D` | F | `src/components/parent/ApproveAllButton.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 137 | ` D` | F | `src/components/parent/ConsequenceList.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 138 | ` D` | F | `src/components/parent/FreezeToggle.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 139 | ` D` | F | `src/components/parent/Header.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 140 | ` D` | F | `src/components/parent/NotesWall.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 141 | ` D` | F | `src/components/parent/PendingCheckinRow.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 142 | ` D` | F | `src/components/ui/Button.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 143 | ` D` | F | `src/components/ui/Card.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 144 | ` D` | F | `src/components/ui/Confetti.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 145 | ` D` | F | `src/components/ui/Sheet.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 146 | ` D` | F | `src/components/ui/Skeleton.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 147 | ` D` | F | `src/components/ui/StreakBadge.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 148 | ` D` | F | `src/lib/ai/chat.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 149 | ` D` | F | `src/lib/ai/client.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 150 | ` D` | F | `src/lib/ai/family-context.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 151 | ` D` | F | `src/lib/ai/system-prompt.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 152 | ` D` | F | `src/lib/auth/kid-session.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 153 | ` D` | F | `src/lib/auth/parent-session.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 154 | ` D` | F | `src/lib/bna/cli-bridge.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 155 | ` M` | E | `src/lib/bna/goal-board.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 156 | ` D` | F | `src/lib/bna/task-pipeline.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 157 | ` D` | F | `src/lib/bna/telegram-bot.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 158 | ` M` | A | `src/lib/bna/telegram-content-intent.js` | Curated release-critical file proven by clean-branch validation. |
| 159 | ` D` | F | `src/lib/email/client.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 160 | ` D` | F | `src/lib/email/render.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 161 | ` D` | F | `src/lib/email/templates/DailySummary.tsx` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 162 | ` D` | F | `src/lib/fonts.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 163 | ` D` | F | `src/lib/i18n.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 164 | ` D` | F | `src/lib/onboarding.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 165 | ` D` | F | `src/lib/supabase/admin.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 166 | ` D` | F | `src/lib/supabase/browser.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 167 | ` D` | F | `src/lib/supabase/server.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 168 | ` D` | F | `src/lib/supabase/types.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 169 | ` D` | F | `src/lib/tasks/store.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 170 | ` D` | F | `src/lib/tasks/types.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 171 | ` D` | F | `src/lib/telegram/auth.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 172 | ` D` | F | `src/lib/telegram/client.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 173 | ` D` | F | `src/lib/telegram/handlers.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 174 | ` D` | F | `src/lib/telegram/messages.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 175 | ` D` | F | `src/lib/telegram/notify.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 176 | ` D` | F | `src/middleware.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 177 | ` M` | E | `src/remotion/README.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 178 | ` M` | E | `src/remotion/Root.tsx` | Not confidently attributable to the focused release; needs Shloimie review. |
| 179 | ` D` | F | `tailwind.config.ts` | Tracked deletion/rename outside the curated release patch; unsafe for deployment without manual review. |
| 180 | ` M` | E | `tasks-pending/2026-06-05-student-goal-board-classroom-consequences.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 181 | ` M` | E | `tasks-pending/2026-06-05-telegram-ai-mode-and-one-time-rabbi-setup.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 182 | ` M` | E | `tests/goal-board.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 183 | ` M` | E | `tests/telegram-content-intent.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 184 | `??` | E | `README.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 185 | `??` | E | `brand-kit/08-current-learning-model.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 186 | `??` | D | `content-memory/prompt-patches/README.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 187 | `??` | D | `content-memory/prompt-patches/rabbi-video-content/README.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 188 | `??` | D | `content-memory/prompt-patches/rabbi-video-content/base-video-generation-prompt.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 189 | `??` | D | `content-memory/prompt-patches/rabbi-video-content/library.json` | Unrelated existing work or historical/generated audit material outside this release. |
| 190 | `??` | D | `content-memory/public-bibliographies/README.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 191 | `??` | D | `content-memory/source-sheets/2026-06-09-baba-sali-sefer.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 192 | `??` | D | `content-memory/source-sheets/2026-06-09-captured-student-question-sources.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 193 | `??` | D | `content-memory/source-sheets/2026-06-09-onkelos-the-ger.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 194 | `??` | D | `content-memory/source-sheets/2026-06-10-student-visa-bank-account-options.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 195 | `??` | D | `content-memory/source-sheets/2026-06-10-transcript-wide-class-source-sheets.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 196 | `??` | D | `content-memory/source-sheets/2026-06-11-fasting-on-shabbos-yom-tov.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 197 | `??` | D | `content-memory/source-sheets/2026-06-11-youtube-looming-crisis-educational-system.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 198 | `??` | D | `content-memory/transcripts/022-bnei-neviim-overview-and-insights.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 199 | `??` | D | `content-memory/transcripts/023-handling-ui-updates-after-killing-a-process.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 200 | `??` | D | `content-memory/transcripts/024-complete-google-business-profile-task.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 201 | `??` | D | `content-memory/transcripts/025-joshua-s-conquest-and-moses-and-aaron-s-death.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 202 | `??` | D | `content-memory/transcripts/026-serving-hashem-joy-and-worldly-pleasure-debate.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 203 | `??` | D | `content-memory/transcripts/027-extracting-questions-from-all-transcripts.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 204 | `??` | D | `content-memory/transcripts/028-setting-up-automated-facebook-post-for-autonomy-questions.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 205 | `??` | D | `content-memory/transcripts/029-autonomy-questions-facebook-video-post.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 206 | `??` | D | `content-memory/transcripts/030-dangerous-black-balloons-threatening-israel.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 207 | `??` | D | `content-memory/transcripts/031-adam-naming-animals-and-eve-explained-by-rashi.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 208 | `??` | D | `content-memory/transcripts/032-youtube-4-september-2025.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 209 | `??` | D | `content-memory/transcripts/033-youtube-2-september-2025.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 210 | `??` | D | `content-memory/transcripts/034-youtube-why-your-kids-are-addicted-to-junk-food.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 211 | `??` | D | `content-memory/transcripts/035-youtube-the-mystery-of-going-off-the-derech.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 212 | `??` | D | `content-memory/transcripts/036-youtube-helping-our-kids-own-their-spirituality.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 213 | `??` | D | `content-memory/transcripts/037-youtube-a-i-ko-college.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 214 | `??` | D | `content-memory/transcripts/038-youtube-how-to-turn-spaced-out-moments-into-holy-lessons.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 215 | `??` | D | `content-memory/transcripts/039-youtube-does-your-son-connect-to-his-rebbe.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 216 | `??` | D | `content-memory/transcripts/040-youtube-seeing-the-big-picture-how-mixed-age-learning-helps-kids-visualize-the-e.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 217 | `??` | D | `content-memory/transcripts/041-youtube-i-m-a-baal-teshuva-but-my-kid-is-in-the-regular-charedi-system.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 218 | `??` | D | `content-memory/transcripts/042-youtube-why-kids-bicker-and-fight-what-schools-aren-t-teaching.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 219 | `??` | D | `content-memory/transcripts/043-youtube-partnering-for-a-new-era-in-jewish-education-a-vision-for-our-future.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 220 | `??` | D | `content-memory/transcripts/044-youtube-why-davening-is-a-privilege-not-a-graded-class-understanding-its-true-pu.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 221 | `??` | D | `content-memory/transcripts/045-youtube-the-hidden-struggles-in-israel-s-education-system-why-we-need-micro-scho.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 222 | `??` | D | `content-memory/transcripts/046-youtube-the-looming-crisis-in-our-educational-system.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 223 | `??` | D | `content-memory/transcripts/047-youtube-revolutionizing-jewish-education-the-urgent-need-for-ai-driven-micro-sch.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 224 | `??` | D | `content-memory/transcripts/048-youtube-inspiring-lifelong-love-for-torah-without-bribes-a-better-way-to-engage-.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 225 | `??` | D | `content-memory/transcripts/049-youtube-harnessing-ai-for-real-world-learning-the-future-of-the-secular-curricul.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 226 | `??` | D | `content-memory/transcripts/050-youtube-transforming-jewish-education-help-us-with-your-outsourced-english-conte.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 227 | `??` | D | `content-memory/transcripts/051-youtube-the-importance-of-transparency-in-your-son-s-torah-education.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 228 | `??` | D | `content-memory/transcripts/052-youtube-the-importance-of-rules-and-responsibility-in-a-dynamic-learning-environ.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 229 | `??` | D | `content-memory/transcripts/053-youtube-responsability-is-not-a-skill-you-can-teach.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 230 | `??` | D | `content-memory/transcripts/054-youtube-the-school-just-told-me-my-kid-needs-drugs.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 231 | `??` | D | `content-memory/youtube-playlist-transcripts-2024.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 232 | `??` | D | `docs/archive/dormant-next-supabase-app/README.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 233 | `??` | D | `docs/archive/dormant-next-supabase-app/next.config.mjs` | Unrelated existing work or historical/generated audit material outside this release. |
| 234 | `??` | D | `docs/archive/dormant-next-supabase-app/postcss.config.mjs` | Unrelated existing work or historical/generated audit material outside this release. |
| 235 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/ad-hoc-tasks/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 236 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/auth/kid-login/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 237 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/auth/kid-logout/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 238 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/auth/parent-callback/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 239 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/auth/parent-request/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 240 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/bna/migrate-db/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 241 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/bna/migrate/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 242 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/bna/payments/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 243 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/bna/signups/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 244 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/bna/tasks/[id]/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 245 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/bna/tasks/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 246 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/bna/telegram/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 247 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/checkins/approve/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 248 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/checkins/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 249 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/consequences/[id]/approve/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 250 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/consequences/[id]/override/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 251 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/consequences/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 252 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/cron/daily-summary/resend/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 253 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/cron/daily-summary/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 254 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/cron/reminders/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 255 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/goals/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 256 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/meetings/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 257 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/onboarding/complete/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 258 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/parent-notes/[id]/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 259 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/parent-notes/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 260 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/proof-upload/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 261 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/qr/[kid]/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 262 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/telegram/webhook/[parent]/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 263 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/users/freeze/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 264 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/api/users/pin-hash/route.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 265 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/globals.css` | Unrelated existing work or historical/generated audit material outside this release. |
| 266 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/kid/[name]/KidGoalList.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 267 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/kid/[name]/page.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 268 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/kid/[name]/pin/PinForm.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 269 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/kid/[name]/pin/page.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 270 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/layout.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 271 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/operations/components/SummaryCards.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 272 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/operations/components/TaskApp.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 273 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/operations/components/TaskCard.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 274 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/operations/components/TaskFilters.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 275 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/operations/components/TaskFormModal.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 276 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/operations/page.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 277 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/page.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 278 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/parent/[kid]/NewMeetingModal.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 279 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/parent/[kid]/page.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 280 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/parent/login/LoginForm.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 281 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/parent/login/page.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 282 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/parent/onboarding/OnboardingWizard.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 283 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/parent/onboarding/page.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 284 | `??` | D | `docs/archive/dormant-next-supabase-app/src/app/parent/page.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 285 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/install/InstallPrompt.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 286 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/kid/KidNotesDisplay.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 287 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/locale/LocaleToggle.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 288 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/parent/AdHocTaskButton.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 289 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/parent/ApproveAllButton.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 290 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/parent/ConsequenceList.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 291 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/parent/FreezeToggle.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 292 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/parent/Header.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 293 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/parent/NotesWall.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 294 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/parent/PendingCheckinRow.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 295 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/ui/Button.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 296 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/ui/Card.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 297 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/ui/Confetti.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 298 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/ui/Sheet.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 299 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/ui/Skeleton.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 300 | `??` | D | `docs/archive/dormant-next-supabase-app/src/components/ui/StreakBadge.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 301 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/ai/chat.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 302 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/ai/client.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 303 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/ai/family-context.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 304 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/ai/system-prompt.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 305 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/auth/kid-session.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 306 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/auth/parent-session.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 307 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/bna/cli-bridge.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 308 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/bna/task-pipeline.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 309 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/bna/telegram-bot.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 310 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/email/client.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 311 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/email/render.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 312 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/email/templates/DailySummary.tsx` | Unrelated existing work or historical/generated audit material outside this release. |
| 313 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/fonts.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 314 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/i18n.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 315 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/onboarding.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 316 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/supabase/admin.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 317 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/supabase/browser.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 318 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/supabase/server.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 319 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/supabase/types.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 320 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/tasks/store.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 321 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/tasks/types.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 322 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/telegram/auth.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 323 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/telegram/client.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 324 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/telegram/handlers.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 325 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/telegram/messages.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 326 | `??` | D | `docs/archive/dormant-next-supabase-app/src/lib/telegram/notify.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 327 | `??` | D | `docs/archive/dormant-next-supabase-app/src/middleware.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 328 | `??` | D | `docs/archive/dormant-next-supabase-app/tailwind.config.ts` | Unrelated existing work or historical/generated audit material outside this release. |
| 329 | `??` | D | `docs/archive/legacy-family-accountability/README.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 330 | `??` | D | `docs/archive/legacy-family-accountability/scripts/apply-schema.mjs` | Unrelated existing work or historical/generated audit material outside this release. |
| 331 | `??` | D | `docs/archive/legacy-family-accountability/scripts/launch.mjs` | Unrelated existing work or historical/generated audit material outside this release. |
| 332 | `??` | D | `docs/archive/legacy-family-accountability/scripts/send-onboarding.mjs` | Unrelated existing work or historical/generated audit material outside this release. |
| 333 | `??` | D | `docs/archive/legacy-family-accountability/scripts/set-webhooks.mjs` | Unrelated existing work or historical/generated audit material outside this release. |
| 334 | `??` | D | `docs/archive/legacy-supabase-setup/README.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 335 | `??` | D | `docs/archive/legacy-supabase-setup/SUPABASE_SETUP.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 336 | `??` | D | `memory/2026-06-08.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 337 | `??` | D | `memory/2026-06-09.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 338 | `??` | D | `memory/2026-06-10.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 339 | `??` | D | `memory/2026-06-11.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 340 | `??` | A | `ops/action-registry/actions.json` | Curated release-critical file proven by clean-branch validation. |
| 341 | `??` | A | `ops/action-registry/page-action-map.json` | Curated release-critical file proven by clean-branch validation. |
| 342 | `??` | A | `ops/action-registry/ui-button-map.md` | Curated release-critical file proven by clean-branch validation. |
| 343 | `??` | D | `ops/drive-audits/2026-06-08T07-22-32-454Z-google-drive-audit.json` | Unrelated existing work or historical/generated audit material outside this release. |
| 344 | `??` | D | `ops/drive-audits/2026-06-08T07-22-32-454Z-google-drive-audit.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 345 | `??` | D | `ops/drive-audits/2026-06-09T19-59-21-999Z-google-drive-audit.json` | Unrelated existing work or historical/generated audit material outside this release. |
| 346 | `??` | D | `ops/drive-audits/2026-06-09T19-59-21-999Z-google-drive-audit.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 347 | `??` | D | `ops/drive-audits/2026-06-09T20-06-24-683Z-google-drive-audit.json` | Unrelated existing work or historical/generated audit material outside this release. |
| 348 | `??` | D | `ops/drive-audits/2026-06-09T20-06-24-683Z-google-drive-audit.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 349 | `??` | D | `ops/drive-audits/2026-06-09T20-11-58-409Z-google-drive-audit.json` | Unrelated existing work or historical/generated audit material outside this release. |
| 350 | `??` | D | `ops/drive-audits/2026-06-09T20-11-58-409Z-google-drive-audit.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 351 | `??` | E | `ops/marketing/facebook-ads/2026-06-08/README.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 352 | `??` | E | `ops/marketing/facebook-ads/2026-06-08/ad-spend-summary.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 353 | `??` | E | `ops/marketing/facebook-ads/2026-06-08/campaigns-2026-05-09-to-2026-06-07.csv` | Not confidently attributable to the focused release; needs Shloimie review. |
| 354 | `??` | E | `ops/marketing/facebook-ads/ad-spend-tracker.csv` | Not confidently attributable to the focused release; needs Shloimie review. |
| 355 | `??` | E | `ops/marketing/ghl-api-widget-options-2026-06-09.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 356 | `??` | E | `ops/marketing/ghl-bot/landing-page-bot-prompt-2026-06-08.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 357 | `??` | E | `ops/one-time-mishnah-class/partnership-drive-map.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 358 | `??` | E | `ops/one-time-mishnah-class/partnership-drive-map.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 359 | `??` | E | `ops/one-time-mishnah-class/rabbi-telegram-worker.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 360 | `??` | E | `ops/playwright-smokes/2026-06-09-google-assignment-local.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 361 | `??` | E | `ops/playwright-smokes/2026-06-09-google-assignment-operations-smoke.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 362 | `??` | E | `ops/playwright-smokes/2026-06-09-live-google-assignment-operations-smoke.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 363 | `??` | E | `ops/playwright-smokes/2026-06-09-live-operations-pwa-phone.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 364 | `??` | E | `ops/playwright-smokes/2026-06-09-operations-pwa-phone.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 365 | `??` | E | `ops/playwright-smokes/2026-06-09T-operations-inline-comments/operations-inline-comment-dictation.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 366 | `??` | E | `ops/playwright-smokes/2026-06-09T15-09-26-552Z/operations-filter-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 367 | `??` | E | `ops/playwright-smokes/2026-06-09T15-09-26-552Z/operations-filter-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 368 | `??` | E | `ops/playwright-smokes/2026-06-09T15-09-26-552Z/operations-student-picker.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 369 | `??` | E | `ops/playwright-smokes/2026-06-09T15-09-26-552Z/parent-portal.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 370 | `??` | E | `ops/playwright-smokes/2026-06-09T15-09-26-552Z/student-portal-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 371 | `??` | E | `ops/playwright-smokes/2026-06-09T15-09-26-552Z/student-portal-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 372 | `??` | E | `ops/playwright-smokes/2026-06-09T15-09-26-552Z/summary.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 373 | `??` | E | `ops/playwright-smokes/2026-06-09T15-15-13-691Z-live/live-operations-filter-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 374 | `??` | E | `ops/playwright-smokes/2026-06-09T15-15-13-691Z-live/live-operations-filter-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 375 | `??` | E | `ops/playwright-smokes/2026-06-09T15-15-13-691Z-live/live-operations-student-picker.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 376 | `??` | E | `ops/playwright-smokes/2026-06-09T15-15-13-691Z-live/live-parent-portal.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 377 | `??` | E | `ops/playwright-smokes/2026-06-09T15-15-13-691Z-live/live-student-portal-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 378 | `??` | E | `ops/playwright-smokes/2026-06-09T15-15-13-691Z-live/live-student-portal-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 379 | `??` | E | `ops/playwright-smokes/2026-06-09T15-15-13-691Z-live/summary.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 380 | `??` | E | `ops/playwright-smokes/2026-06-09T15-43-14-542Z/operations-goal-board.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 381 | `??` | E | `ops/playwright-smokes/2026-06-09T15-43-14-542Z/operations-questions.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 382 | `??` | E | `ops/playwright-smokes/2026-06-09T15-43-14-542Z/parent-portal.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 383 | `??` | E | `ops/playwright-smokes/2026-06-09T15-43-14-542Z/student-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 384 | `??` | E | `ops/playwright-smokes/2026-06-09T15-43-14-542Z/student-questions.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 385 | `??` | E | `ops/playwright-smokes/2026-06-09T15-44-59-168Z/parent-portal-wide.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 386 | `??` | E | `ops/playwright-smokes/2026-06-09T16-05-38-446Z-live-parent-questions/operations-goal-board-live.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 387 | `??` | E | `ops/playwright-smokes/2026-06-09T16-05-38-446Z-live-parent-questions/operations-questions-live.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 388 | `??` | E | `ops/playwright-smokes/2026-06-09T16-05-38-446Z-live-parent-questions/parent-live.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 389 | `??` | E | `ops/playwright-smokes/2026-06-09T16-05-38-446Z-live-parent-questions/student-live.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 390 | `??` | E | `ops/playwright-smokes/2026-06-09T16-49-24-374Z-live-parent-questions-final/operations-goal-board-live.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 391 | `??` | E | `ops/playwright-smokes/2026-06-09T16-49-24-374Z-live-parent-questions-final/operations-questions-live.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 392 | `??` | E | `ops/playwright-smokes/2026-06-09T16-49-24-374Z-live-parent-questions-final/parent-live.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 393 | `??` | E | `ops/playwright-smokes/2026-06-09T16-49-24-374Z-live-parent-questions-final/student-live.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 394 | `??` | E | `ops/playwright-smokes/2026-06-09T18-26-38-040Z-contacts-signup-intake.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 395 | `??` | E | `ops/playwright-smokes/2026-06-09T18-26-38-040Z-operations-research.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 396 | `??` | E | `ops/playwright-smokes/2026-06-10-content-research-live.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 397 | `??` | E | `ops/playwright-smokes/2026-06-10-task379-classroom-board-calendar-fixture.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 398 | `??` | E | `ops/playwright-smokes/2026-06-10-task379-classroom-board-calendar.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 399 | `??` | E | `ops/playwright-smokes/2026-06-10-task379-live-classroom-board-calendar.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 400 | `??` | E | `ops/playwright-smokes/2026-06-10-task399-next-year-login-live.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 401 | `??` | E | `ops/playwright-smokes/2026-06-10T11-26-32-386Z-operations-login-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 402 | `??` | E | `ops/playwright-smokes/2026-06-10T11-28-12-110Z-brand-provider-smoke.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 403 | `??` | E | `ops/playwright-smokes/2026-06-10T11-28-12-110Z-operations-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 404 | `??` | E | `ops/playwright-smokes/2026-06-10T11-28-12-110Z-operations-login-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 405 | `??` | E | `ops/playwright-smokes/2026-06-10T11-28-12-110Z-parent-portal-public-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 406 | `??` | E | `ops/playwright-smokes/2026-06-10T11-28-12-110Z-student-portal-public-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 407 | `??` | E | `ops/playwright-smokes/2026-06-10T11-29-34-627Z-operations-providers-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 408 | `??` | E | `ops/playwright-smokes/2026-06-10T11-29-34-627Z-operations-providers-smoke.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 409 | `??` | E | `ops/playwright-smokes/2026-06-10T11-30-06-322Z-parent-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 410 | `??` | E | `ops/playwright-smokes/2026-06-10T11-30-06-322Z-portal-brand-mobile-smoke.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 411 | `??` | E | `ops/playwright-smokes/2026-06-10T11-30-06-322Z-student-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 412 | `??` | E | `ops/playwright-smokes/2026-06-10T13-58-10-415Z-one-time-meeting-student-nav-local/content-meeting-drops-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 413 | `??` | E | `ops/playwright-smokes/2026-06-10T13-58-10-415Z-one-time-meeting-student-nav-local/mobile-full-nav.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 414 | `??` | E | `ops/playwright-smokes/2026-06-10T13-58-10-415Z-one-time-meeting-student-nav-local/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 415 | `??` | E | `ops/playwright-smokes/2026-06-10T13-58-10-415Z-one-time-meeting-student-nav-local/student-workspace-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 416 | `??` | E | `ops/playwright-smokes/2026-06-10T13-58-10-415Z-one-time-meeting-student-nav-local/students-list-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 417 | `??` | E | `ops/playwright-smokes/2026-06-10T14-01-30-743Z-one-time-meeting-student-nav-local/content-meeting-drops-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 418 | `??` | E | `ops/playwright-smokes/2026-06-10T14-01-30-743Z-one-time-meeting-student-nav-local/mobile-full-nav.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 419 | `??` | E | `ops/playwright-smokes/2026-06-10T14-01-30-743Z-one-time-meeting-student-nav-local/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 420 | `??` | E | `ops/playwright-smokes/2026-06-10T14-01-30-743Z-one-time-meeting-student-nav-local/student-workspace-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 421 | `??` | E | `ops/playwright-smokes/2026-06-10T14-01-30-743Z-one-time-meeting-student-nav-local/students-list-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 422 | `??` | E | `ops/playwright-smokes/2026-06-10T14-05-21-419Z-one-time-meeting-student-nav-local/content-meeting-drops-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 423 | `??` | E | `ops/playwright-smokes/2026-06-10T14-05-21-419Z-one-time-meeting-student-nav-local/mobile-full-nav.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 424 | `??` | E | `ops/playwright-smokes/2026-06-10T14-05-21-419Z-one-time-meeting-student-nav-local/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 425 | `??` | E | `ops/playwright-smokes/2026-06-10T14-05-21-419Z-one-time-meeting-student-nav-local/student-workspace-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 426 | `??` | E | `ops/playwright-smokes/2026-06-10T14-05-21-419Z-one-time-meeting-student-nav-local/students-list-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 427 | `??` | E | `ops/playwright-smokes/2026-06-10T14-09-17-318Z-mobile-full-nav-final-local/diagnostic-no-menu.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 428 | `??` | E | `ops/playwright-smokes/2026-06-10T14-12-55-452Z-mobile-full-nav-final-local/mobile-full-nav-final.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 429 | `??` | E | `ops/playwright-smokes/2026-06-10T14-12-55-452Z-mobile-full-nav-final-local/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 430 | `??` | E | `ops/playwright-smokes/2026-06-10T14-17-47-854Z-one-time-meeting-student-nav-live/content-meeting-drops-live-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 431 | `??` | E | `ops/playwright-smokes/2026-06-10T14-17-47-854Z-one-time-meeting-student-nav-live/mobile-full-nav-live.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 432 | `??` | E | `ops/playwright-smokes/2026-06-10T14-17-47-854Z-one-time-meeting-student-nav-live/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 433 | `??` | E | `ops/playwright-smokes/2026-06-10T14-17-47-854Z-one-time-meeting-student-nav-live/student-workspace-live-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 434 | `??` | E | `ops/playwright-smokes/2026-06-10T14-17-47-854Z-one-time-meeting-student-nav-live/students-list-live-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 435 | `??` | E | `ops/playwright-smokes/2026-06-10T14-21-37-287Z-one-time-meeting-student-nav-live-structured/content-meeting-drops-live-structured-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 436 | `??` | E | `ops/playwright-smokes/2026-06-10T14-21-37-287Z-one-time-meeting-student-nav-live-structured/mobile-full-nav-live.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 437 | `??` | E | `ops/playwright-smokes/2026-06-10T14-21-37-287Z-one-time-meeting-student-nav-live-structured/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 438 | `??` | E | `ops/playwright-smokes/2026-06-10T14-58-19-459Z-saas-redesign-baseline-local/operations-current-shell-baseline.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 439 | `??` | E | `ops/playwright-smokes/2026-06-10T14-58-19-459Z-saas-redesign-baseline-local/operations-login-baseline.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 440 | `??` | E | `ops/playwright-smokes/2026-06-10T14-58-19-459Z-saas-redesign-baseline-local/parent-public-baseline.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 441 | `??` | E | `ops/playwright-smokes/2026-06-10T14-58-19-459Z-saas-redesign-baseline-local/provider-login-baseline.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 442 | `??` | E | `ops/playwright-smokes/2026-06-10T14-58-19-459Z-saas-redesign-baseline-local/student-public-baseline.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 443 | `??` | E | `ops/playwright-smokes/2026-06-10T14-58-51-455Z-saas-redesign-baseline-local/operations-current-shell-baseline.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 444 | `??` | E | `ops/playwright-smokes/2026-06-10T14-58-51-455Z-saas-redesign-baseline-local/operations-login-baseline.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 445 | `??` | E | `ops/playwright-smokes/2026-06-10T14-58-51-455Z-saas-redesign-baseline-local/parent-public-baseline.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 446 | `??` | E | `ops/playwright-smokes/2026-06-10T14-58-51-455Z-saas-redesign-baseline-local/provider-login-baseline.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 447 | `??` | E | `ops/playwright-smokes/2026-06-10T14-58-51-455Z-saas-redesign-baseline-local/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 448 | `??` | E | `ops/playwright-smokes/2026-06-10T14-58-51-455Z-saas-redesign-baseline-local/student-public-baseline.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 449 | `??` | E | `ops/playwright-smokes/2026-06-10T14-58-51-455Z-saas-redesign-baseline-local/student-public-mobile-baseline.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 450 | `??` | E | `ops/playwright-smokes/2026-06-10T15-34-06-838Z-saas-redesign-local/operations-dashboard-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 451 | `??` | E | `ops/playwright-smokes/2026-06-10T15-40-38-656Z-saas-redesign-local/operations-dashboard-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 452 | `??` | E | `ops/playwright-smokes/2026-06-10T15-40-38-656Z-saas-redesign-local/operations-tasks-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 453 | `??` | E | `ops/playwright-smokes/2026-06-10T15-54-17-420Z-saas-redesign-local/operations-api-usage-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 454 | `??` | E | `ops/playwright-smokes/2026-06-10T15-54-17-420Z-saas-redesign-local/operations-communications-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 455 | `??` | E | `ops/playwright-smokes/2026-06-10T15-54-17-420Z-saas-redesign-local/operations-contacts-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 456 | `??` | E | `ops/playwright-smokes/2026-06-10T15-54-17-420Z-saas-redesign-local/operations-content-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 457 | `??` | E | `ops/playwright-smokes/2026-06-10T15-54-17-420Z-saas-redesign-local/operations-dashboard-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 458 | `??` | E | `ops/playwright-smokes/2026-06-10T15-54-17-420Z-saas-redesign-local/operations-mobile-navigation.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 459 | `??` | E | `ops/playwright-smokes/2026-06-10T15-54-17-420Z-saas-redesign-local/operations-service-providers-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 460 | `??` | E | `ops/playwright-smokes/2026-06-10T15-54-17-420Z-saas-redesign-local/operations-settings-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 461 | `??` | E | `ops/playwright-smokes/2026-06-10T15-54-17-420Z-saas-redesign-local/operations-students-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 462 | `??` | E | `ops/playwright-smokes/2026-06-10T15-54-17-420Z-saas-redesign-local/operations-students-documents-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 463 | `??` | E | `ops/playwright-smokes/2026-06-10T15-54-17-420Z-saas-redesign-local/operations-tasks-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 464 | `??` | E | `ops/playwright-smokes/2026-06-10T15-54-17-420Z-saas-redesign-local/operations-team-admin-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 465 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-api-usage-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 466 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-communications-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 467 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-contacts-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 468 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-content-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 469 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-dashboard-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 470 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-mobile-navigation.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 471 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-service-providers-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 472 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-service-providers-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 473 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-settings-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 474 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-students-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 475 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-students-documents-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 476 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-tasks-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 477 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/operations-team-admin-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 478 | `??` | E | `ops/playwright-smokes/2026-06-10T15-56-09-556Z-saas-redesign-local/parent-portal-rtl-login-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 479 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-api-usage-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 480 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-communications-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 481 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-contacts-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 482 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-content-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 483 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-dashboard-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 484 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-mobile-navigation.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 485 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-service-providers-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 486 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-service-providers-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 487 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-settings-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 488 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-students-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 489 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-students-documents-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 490 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-tasks-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 491 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/operations-team-admin-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 492 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/parent-portal-rtl-login-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 493 | `??` | E | `ops/playwright-smokes/2026-06-10T15-57-48-351Z-saas-redesign-local/student-portal-rtl-login-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 494 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-api-usage-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 495 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-communications-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 496 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-contacts-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 497 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-content-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 498 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-dashboard-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 499 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-mobile-navigation.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 500 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-service-providers-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 501 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-service-providers-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 502 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-settings-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 503 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-students-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 504 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-students-documents-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 505 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-tasks-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 506 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/operations-team-admin-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 507 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/parent-portal-rtl-login-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 508 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/parent-portal-rtl-login-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 509 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/provider-portal-login-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 510 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 511 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/student-portal-rtl-login-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 512 | `??` | E | `ops/playwright-smokes/2026-06-10T15-59-29-059Z-saas-redesign-local/student-portal-rtl-login-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 513 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-api-usage-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 514 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-communications-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 515 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-contacts-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 516 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-content-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 517 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-dashboard-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 518 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-mobile-navigation.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 519 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-service-providers-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 520 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-service-providers-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 521 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-settings-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 522 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-students-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 523 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-students-documents-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 524 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-tasks-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 525 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/operations-team-admin-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 526 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/parent-portal-rtl-login-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 527 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/parent-portal-rtl-login-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 528 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/provider-portal-login-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 529 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 530 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/student-portal-rtl-login-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 531 | `??` | E | `ops/playwright-smokes/2026-06-10T16-02-20-756Z-saas-redesign-production/student-portal-rtl-login-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 532 | `??` | E | `ops/playwright-smokes/2026-06-10T19-23-57-000Z-bna-operations-crm-local/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 533 | `??` | E | `ops/playwright-smokes/2026-06-10T19-31-30-000Z-bna-operations-crm-production/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 534 | `??` | E | `ops/playwright-smokes/debug-mobile-login/diagnostic.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 535 | `??` | E | `ops/playwright-smokes/debug-operations.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 536 | `??` | E | `ops/playwright-smokes/debug-students-loading.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 537 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-32-33-473Z/operations-mobile-drawer.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 538 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-32-33-473Z/operations-schedule-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 539 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-32-33-473Z/operations-schedule-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 540 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-32-33-473Z/operations-schedule-workflow-expanded.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 541 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-32-33-473Z/operations-team-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 542 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-32-33-473Z/provider-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 543 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-32-33-473Z/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 544 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-40-32-794Z/operations-mobile-drawer.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 545 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-40-32-794Z/operations-schedule-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 546 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-40-32-794Z/operations-schedule-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 547 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-40-32-794Z/operations-schedule-workflow-expanded.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 548 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-40-32-794Z/operations-team-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 549 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-40-32-794Z/provider-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 550 | `??` | E | `ops/playwright-smokes/one-time-schedule-team-live-2026-06-10T12-40-32-794Z/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 551 | `??` | E | `ops/playwright-smokes/queue-rescue-final-live-2026-06-10T12-05-40-057Z/operations-providers-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 552 | `??` | E | `ops/playwright-smokes/queue-rescue-final-live-2026-06-10T12-05-40-057Z/parent-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 553 | `??` | E | `ops/playwright-smokes/queue-rescue-final-live-2026-06-10T12-05-40-057Z/provider-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 554 | `??` | E | `ops/playwright-smokes/queue-rescue-final-live-2026-06-10T12-05-40-057Z/provider-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 555 | `??` | E | `ops/playwright-smokes/queue-rescue-final-live-2026-06-10T12-05-40-057Z/report.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 556 | `??` | E | `ops/playwright-smokes/queue-rescue-final-live-2026-06-10T12-05-40-057Z/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 557 | `??` | E | `ops/playwright-smokes/queue-rescue-final-live-2026-06-10T12-05-40-057Z/student-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 558 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-29-49-823Z/operations-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 559 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-29-49-823Z/operations-dropdown.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 560 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-29-49-823Z/operations-mobile-drawer.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 561 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-29-49-823Z/operations-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 562 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-29-49-823Z/parent-mobile-menu.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 563 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-29-49-823Z/parent-provider-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 564 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-29-49-823Z/parent-provider-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 565 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-29-49-823Z/report.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 566 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-29-49-823Z/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 567 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-29-49-823Z/student-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 568 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-29-49-823Z/student-mobile-menu.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 569 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-29-49-823Z/student-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 570 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-35-30-670Z/operations-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 571 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-37-37-574Z/operations-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 572 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-37-37-574Z/operations-dropdown.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 573 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-37-37-574Z/operations-mobile-drawer.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 574 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-37-37-574Z/operations-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 575 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-37-37-574Z/parent-mobile-menu.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 576 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-37-37-574Z/parent-provider-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 577 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-37-37-574Z/parent-provider-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 578 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-37-37-574Z/report.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 579 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-37-37-574Z/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 580 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-37-37-574Z/student-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 581 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-37-37-574Z/student-mobile-menu.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 582 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-37-37-574Z/student-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 583 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-40-56-966Z/operations-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 584 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-40-56-966Z/operations-dropdown.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 585 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-40-56-966Z/operations-mobile-drawer.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 586 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-40-56-966Z/operations-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 587 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-40-56-966Z/parent-mobile-menu.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 588 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-40-56-966Z/parent-provider-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 589 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-40-56-966Z/parent-provider-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 590 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-40-56-966Z/report.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 591 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-40-56-966Z/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 592 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-40-56-966Z/student-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 593 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-40-56-966Z/student-mobile-menu.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 594 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-2026-06-10T11-40-56-966Z/student-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 595 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-live-2026-06-10T11-41-50-488Z/operations-mobile-drawer.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 596 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-live-2026-06-10T11-41-50-488Z/operations-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 597 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-live-2026-06-10T11-41-50-488Z/operations-providers-desktop.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 598 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-live-2026-06-10T11-41-50-488Z/parent-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 599 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-live-2026-06-10T11-41-50-488Z/report.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 600 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-live-2026-06-10T11-41-50-488Z/report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 601 | `??` | E | `ops/playwright-smokes/task-402-brand-shell-live-2026-06-10T11-41-50-488Z/student-mobile.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 602 | `??` | E | `ops/qa-runs/2026-06-10-operations-full-qa.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 603 | `??` | B | `ops/qa-runs/2026-06-11-action-registry-telegram-ui-bot.md` | Curated release support/test/report file proven by clean-branch validation. |
| 604 | `??` | B | `ops/qa-runs/2026-06-11-final-release-readiness.md` | Curated release support/test/report file proven by clean-branch validation. |
| 605 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-git-status.txt` | Not confidently attributable to the focused release; needs Shloimie review. |
| 606 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/issues.csv` | Not confidently attributable to the focused release; needs Shloimie review. |
| 607 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/manifest.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 608 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-account__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 609 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-account__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 610 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-account__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 611 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-account__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 612 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-account__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 613 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-detail__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 614 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-detail__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 615 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-detail__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 616 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-detail__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 617 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-detail__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 618 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-month__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 619 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-month__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 620 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-month__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 621 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-month__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 622 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-month__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 623 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-week__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 624 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-week__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 625 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-week__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 626 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-week__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 627 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar-week__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 628 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 629 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 630 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 631 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 632 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-calendar__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 633 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-children__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 634 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-children__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 635 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-children__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 636 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-children__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 637 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-children__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 638 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-hebrew-calendar__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 639 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-hebrew-calendar__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 640 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-help-open__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 641 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-help-open__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 642 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-help-open__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 643 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-help-open__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 644 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-help-open__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 645 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-home__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 646 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-home__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 647 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-home__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 648 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-home__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 649 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-home__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 650 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-learning__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 651 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-learning__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 652 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-learning__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 653 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-learning__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 654 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-learning__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 655 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-messages__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 656 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-messages__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 657 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-messages__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 658 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-messages__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 659 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-messages__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 660 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-mobile-nav__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 661 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-mobile-nav__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 662 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-mobile-nav__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 663 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-providers__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 664 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-providers__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 665 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-providers__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 666 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-providers__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 667 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/parent-providers__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 668 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-account__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 669 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-account__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 670 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-account__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 671 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-account__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 672 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-account__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 673 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-home__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 674 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-home__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 675 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-home__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 676 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-home__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 677 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-home__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 678 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-messages__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 679 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-messages__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 680 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-messages__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 681 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-messages__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 682 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-messages__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 683 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-mobile-nav__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 684 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-mobile-nav__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 685 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-mobile-nav__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 686 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-payment__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 687 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-payment__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 688 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-payment__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 689 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-payment__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 690 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-payment__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 691 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-questions__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 692 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-questions__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 693 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-questions__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 694 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-questions__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 695 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-questions__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 696 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-schedule__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 697 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-schedule__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 698 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-schedule__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 699 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-schedule__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 700 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-schedule__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 701 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-worksheets__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 702 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-worksheets__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 703 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-worksheets__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 704 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-worksheets__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 705 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/provider-worksheets__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 706 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-assignments__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 707 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-assignments__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 708 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-assignments__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 709 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-assignments__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 710 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-assignments__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 711 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-bot__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 712 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-bot__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 713 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-bot__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 714 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-bot__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 715 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-bot__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 716 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-detail__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 717 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-detail__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 718 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-detail__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 719 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-detail__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 720 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-detail__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 721 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-month__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 722 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-month__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 723 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-month__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 724 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-month__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 725 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-month__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 726 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-week__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 727 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-week__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 728 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-week__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 729 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-week__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 730 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar-week__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 731 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 732 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 733 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 734 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 735 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-calendar__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 736 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-documents__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 737 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-documents__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 738 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-documents__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 739 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-documents__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 740 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-documents__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 741 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-goals__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 742 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-goals__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 743 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-goals__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 744 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-goals__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 745 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-goals__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 746 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-hebrew-calendar__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 747 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-hebrew-calendar__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 748 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-help_account__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 749 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-help_account__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 750 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-help_account__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 751 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-help_account__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 752 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-help_account__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 753 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-helper-open__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 754 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-helper-open__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 755 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-helper-open__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 756 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-helper-open__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 757 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-helper-open__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 758 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-mobile-nav__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 759 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-mobile-nav__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 760 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-mobile-nav__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 761 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-overview__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 762 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-overview__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 763 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-overview__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 764 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-overview__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 765 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-overview__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 766 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-questions__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 767 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-questions__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 768 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-questions__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 769 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-questions__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 770 | `??` | E | `ops/qa-runs/2026-06-11-master-execution-screenshots/student-questions__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 771 | `??` | B | `ops/qa-runs/2026-06-11-master-execution-selected-work.md` | Curated release support/test/report file proven by clean-branch validation. |
| 772 | `??` | B | `ops/qa-runs/2026-06-11-operations-navigation-polish.md` | Curated release support/test/report file proven by clean-branch validation. |
| 773 | `??` | B | `ops/qa-runs/2026-06-11-operations-restructure-implementation.md` | Curated release support/test/report file proven by clean-branch validation. |
| 774 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-calendar-polish-git-status.txt` | Not confidently attributable to the focused release; needs Shloimie review. |
| 775 | `??` | B | `ops/qa-runs/2026-06-11-parent-student-calendar-polish.md` | Curated release support/test/report file proven by clean-branch validation. |
| 776 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-parent-desktop-list-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 777 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-parent-desktop-list__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 778 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-parent-desktop-month-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 779 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-parent-desktop-month__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 780 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-parent-desktop-week-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 781 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-parent-desktop-week__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 782 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-parent-event-detail-drawer__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 783 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-parent-mobile-detail-drawer__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 784 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-parent-mobile-list__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 785 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-student-desktop-list__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 786 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-student-desktop-month__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 787 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-student-desktop-week__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 788 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-student-mobile-detail-drawer__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 789 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/calendar-student-mobile-list__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 790 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/issues.csv` | Not confidently attributable to the focused release; needs Shloimie review. |
| 791 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/manifest.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 792 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-account-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 793 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-account-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 794 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-account-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 795 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-account-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 796 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-account-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 797 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-calendar-list-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 798 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-calendar-list-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 799 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-calendar-list-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 800 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-calendar-list-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 801 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-calendar-list-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 802 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-child-overview-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 803 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-child-overview-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 804 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-child-overview-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 805 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-child-overview-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 806 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-child-overview-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 807 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-account__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 808 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-account__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 809 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-account__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 810 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-account__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 811 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-account__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 812 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-calendar__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 813 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-calendar__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 814 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-calendar__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 815 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-calendar__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 816 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-calendar__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 817 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-children__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 818 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-children__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 819 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-children__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 820 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-children__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 821 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-children__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 822 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-home__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 823 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-home__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 824 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-home__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 825 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-home__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 826 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-home__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 827 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-learning__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 828 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-learning__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 829 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-learning__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 830 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-learning__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 831 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-learning__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 832 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-messages__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 833 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-messages__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 834 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-messages__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 835 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-messages__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 836 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-messages__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 837 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-mobile-nav-open__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 838 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-mobile-nav-open__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 839 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-mobile-nav-open__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 840 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-parent-help-assistant-open__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 841 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-parent-help-assistant-open__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 842 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-parent-help-assistant-open__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 843 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-parent-help-assistant-open__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 844 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-parent-help-assistant-open__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 845 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-providers__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 846 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-providers__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 847 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-providers__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 848 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-providers__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 849 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-en-providers__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 850 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-he-calendar__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 851 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-he-calendar__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 852 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-he-home__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 853 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-he-home__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 854 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-help-assistant-open-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 855 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-help-assistant-open-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 856 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-help-assistant-open-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 857 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-help-assistant-open-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 858 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-help-assistant-open-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 859 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-home-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 860 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-home-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 861 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-home-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 862 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-home-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 863 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-home-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 864 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-home-he-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 865 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-home-he-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 866 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-home-he-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 867 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-home-he-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 868 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-home-he-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 869 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-learning-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 870 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-learning-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 871 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-learning-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 872 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-learning-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 873 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-learning-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 874 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-messages-help-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 875 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-messages-help-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 876 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-messages-help-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 877 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-messages-help-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 878 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-messages-help-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 879 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-mobile-nav-open-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 880 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-mobile-nav-open-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 881 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/parent-mobile-nav-open-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 882 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/post-dock-fix-spotcheck.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 883 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/post-helper-size-spotcheck.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 884 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/post-helper-width-spotcheck.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 885 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/post-language-fix-spotcheck.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 886 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-account__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 887 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-account__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 888 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-account__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 889 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-account__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 890 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-account__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 891 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-home-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 892 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-home-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 893 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-home-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 894 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-home-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 895 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-home-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 896 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-home__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 897 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-home__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 898 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-home__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 899 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-home__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 900 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-home__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 901 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-messages-help-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 902 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-messages-help-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 903 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-messages-help-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 904 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-messages-help-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 905 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-messages-help-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 906 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-messages__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 907 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-messages__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 908 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-messages__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 909 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-messages__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 910 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-messages__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 911 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-mobile-nav-open-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 912 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-mobile-nav-open-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 913 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-mobile-nav-open-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 914 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-mobile-nav-open__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 915 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-mobile-nav-open__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 916 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-mobile-nav-open__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 917 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-payment-access-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 918 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-payment-access-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 919 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-payment-access-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 920 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-payment-access-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 921 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-payment-access-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 922 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-payment__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 923 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-payment__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 924 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-payment__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 925 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-payment__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 926 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-payment__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 927 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-program__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 928 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-program__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 929 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-program__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 930 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-program__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 931 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-program__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 932 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-questions-posts-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 933 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-questions-posts-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 934 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-questions-posts-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 935 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-questions-posts-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 936 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-questions-posts-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 937 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-questions__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 938 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-questions__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 939 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-questions__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 940 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-questions__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 941 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-questions__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 942 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-schedule-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 943 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-schedule-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 944 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-schedule-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 945 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-schedule-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 946 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-schedule-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 947 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-schedule__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 948 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-schedule__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 949 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-schedule__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 950 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-schedule__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 951 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-schedule__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 952 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-worksheets-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 953 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-worksheets-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 954 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-worksheets-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 955 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-worksheets-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 956 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-worksheets-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 957 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-worksheets__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 958 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-worksheets__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 959 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-worksheets__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 960 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-worksheets__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 961 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/provider-worksheets__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 962 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-ask-helper-open-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 963 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-ask-helper-open-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 964 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-ask-helper-open-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 965 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-ask-helper-open-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 966 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-ask-helper-open-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 967 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-assignments-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 968 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-assignments-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 969 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-assignments-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 970 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-assignments-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 971 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-assignments-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 972 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-calendar-list-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 973 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-calendar-list-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 974 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-calendar-list-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 975 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-calendar-list-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 976 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-calendar-list-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 977 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-documents-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 978 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-documents-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 979 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-documents-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 980 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-documents-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 981 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-documents-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 982 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-ask-helper-open__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 983 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-ask-helper-open__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 984 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-ask-helper-open__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 985 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-ask-helper-open__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 986 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-ask-helper-open__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 987 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-assignments__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 988 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-assignments__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 989 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-assignments__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 990 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-assignments__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 991 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-assignments__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 992 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-bot__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 993 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-bot__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 994 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-bot__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 995 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-bot__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 996 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-bot__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 997 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-calendar__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 998 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-calendar__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 999 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-calendar__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1000 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-calendar__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1001 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-calendar__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1002 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-documents__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1003 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-documents__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1004 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-documents__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1005 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-documents__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1006 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-documents__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1007 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-goals__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1008 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-goals__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1009 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-goals__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1010 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-goals__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1011 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-goals__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1012 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-help-account__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1013 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-help-account__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1014 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-help-account__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1015 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-help-account__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1016 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-help-account__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1017 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-mobile-nav-open__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1018 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-mobile-nav-open__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1019 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-mobile-nav-open__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1020 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-overview__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1021 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-overview__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1022 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-overview__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1023 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-overview__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1024 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-overview__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1025 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-questions__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1026 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-questions__360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1027 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-questions__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1028 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-questions__430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1029 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-en-questions__768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1030 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-goals-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1031 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-goals-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1032 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-goals-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1033 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-goals-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1034 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-goals-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1035 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-he-calendar__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1036 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-he-calendar__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1037 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-he-overview__1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1038 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-he-overview__390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1039 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-home-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1040 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-home-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1041 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-home-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1042 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-home-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1043 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-home-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1044 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-home-he-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1045 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-home-he-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1046 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-home-he-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1047 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-home-he-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1048 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-home-he-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1049 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-mobile-nav-open-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1050 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-mobile-nav-open-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1051 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-mobile-nav-open-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1052 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-questions-en-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1053 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-questions-en-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1054 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-questions-en-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1055 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-questions-en-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1056 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/after/student-questions-en-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1057 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/parent-login-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1058 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/parent-login-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1059 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/parent-login-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1060 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/parent-login-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1061 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/parent-login-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1062 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/provider-home-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1063 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/provider-home-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1064 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/provider-home-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1065 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/provider-home-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1066 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/provider-home-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1067 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/student-login-1440x1000.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1068 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/student-login-360x800.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1069 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/student-login-390x844.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1070 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/student-login-430x932.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1071 | `??` | E | `ops/qa-runs/2026-06-11-parent-student-polish-screenshots/before/student-login-768x1024.png` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1072 | `??` | B | `ops/qa-runs/2026-06-11-production-ui-parent-student-provider.md` | Curated release support/test/report file proven by clean-branch validation. |
| 1073 | `??` | E | `ops/qa-runs/2026-06-11-provider-commercial-model.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1074 | `??` | B | `ops/release/2026-06-11-operations-release-cleanup/changed-files-classification.md` | Curated release support/test/report file proven by clean-branch validation. |
| 1075 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/classification-summary.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1076 | `??` | B | `ops/release/2026-06-11-operations-release-cleanup/deployment-blockers.md` | Curated release support/test/report file proven by clean-branch validation. |
| 1077 | `??` | B | `ops/release/2026-06-11-operations-release-cleanup/deployment-readiness.md` | Curated release support/test/report file proven by clean-branch validation. |
| 1078 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/final-git-status-short.txt` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1079 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/final-untracked-files.txt` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1080 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/full-dirty-diff.patch` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1081 | `??` | B | `ops/release/2026-06-11-operations-release-cleanup/generated-artifacts.txt` | Curated release support/test/report file proven by clean-branch validation. |
| 1082 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/git-branch.txt` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1083 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/git-diff-name-only.txt` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1084 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/git-diff-stat.txt` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1085 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/git-log-1.txt` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1086 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/git-status-short.txt` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1087 | `??` | E | `ops/release/2026-06-11-operations-release-cleanup/git-untracked-files.txt` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1088 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/lighthouse-summary.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1089 | `??` | B | `ops/release/2026-06-11-operations-release-cleanup/release-cleanup-report.md` | Curated release support/test/report file proven by clean-branch validation. |
| 1090 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/release-patch-files.txt` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1091 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/release-patch-warnings.txt` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1092 | `??` | B | `ops/release/2026-06-11-operations-release-cleanup/release-readiness-checklist.md` | Curated release support/test/report file proven by clean-branch validation. |
| 1093 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/release-relevant-files.patch` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1094 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/release-supplemental-clean-apply.patch` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1095 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/release-supplemental-runtime-files.patch` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1096 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/release-supplemental-smoke-script.patch` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1097 | `??` | B | `ops/release/2026-06-11-operations-release-cleanup/relevant-files.txt` | Curated release support/test/report file proven by clean-branch validation. |
| 1098 | `??` | B | `ops/release/2026-06-11-operations-release-cleanup/screenshot-index.md` | Curated release support/test/report file proven by clean-branch validation. |
| 1099 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/screenshot-issues.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1100 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/screenshot-manifest.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1101 | `??` | B | `ops/release/2026-06-11-operations-release-cleanup/shloimie-visual-corrections.md` | Curated release support/test/report file proven by clean-branch validation. |
| 1102 | `??` | B | `ops/release/2026-06-11-operations-release-cleanup/unrelated-dirty-files.txt` | Curated release support/test/report file proven by clean-branch validation. |
| 1103 | `??` | C | `ops/release/2026-06-11-operations-release-cleanup/untracked-files-list.txt` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1104 | `??` | E | `ops/system-audits/2026-06-08-full-system-audit.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1105 | `??` | E | `ops/system-audits/2026-06-08-watchdog-system-audit.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1106 | `??` | E | `ops/system-audits/2026-06-10T11-06-28-834Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1107 | `??` | E | `ops/system-audits/2026-06-10T11-07-07-814Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1108 | `??` | E | `ops/system-audits/2026-06-10T11-30-40-645Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1109 | `??` | E | `ops/system-audits/2026-06-10T11-32-04-623Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1110 | `??` | E | `ops/system-audits/2026-06-10T11-33-42-377Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1111 | `??` | E | `ops/system-audits/2026-06-10T11-36-10-823Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1112 | `??` | E | `ops/system-audits/2026-06-10T11-43-53-396Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1113 | `??` | E | `ops/system-audits/2026-06-10T12-08-40-009Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1114 | `??` | E | `ops/system-audits/2026-06-10T12-09-34-611Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1115 | `??` | E | `ops/system-audits/2026-06-11-active-task-audit.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1116 | `??` | E | `ops/system-audits/2026-06-11-task-226-google-workspace-sender-name.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1117 | `??` | E | `ops/system-audits/2026-06-11T06-45-07-100Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1118 | `??` | E | `ops/system-audits/2026-06-11T06-51-36-438Z-task-queue-reconciler.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1119 | `??` | E | `ops/ui-audits/2026-06-11-full-app-ui-audit/README.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1120 | `??` | E | `ops/ui-audits/2026-06-11-full-app-ui-audit/auth-login.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1121 | `??` | E | `ops/ui-audits/2026-06-11-full-app-ui-audit/manifest.json` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1122 | `??` | E | `ops/ui-audits/2026-06-11-full-app-ui-audit/operations-chrome.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1123 | `??` | E | `ops/ui-audits/2026-06-11-full-app-ui-audit/operations.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1124 | `??` | E | `ops/ui-audits/2026-06-11-full-app-ui-audit/parent-portal.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1125 | `??` | E | `ops/ui-audits/2026-06-11-full-app-ui-audit/provider-onboarding.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1126 | `??` | E | `ops/ui-audits/2026-06-11-full-app-ui-audit/provider-portal.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1127 | `??` | E | `ops/ui-audits/2026-06-11-full-app-ui-audit/public-website.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1128 | `??` | E | `ops/ui-audits/2026-06-11-full-app-ui-audit/screenshot-index.csv` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1129 | `??` | E | `ops/ui-audits/2026-06-11-full-app-ui-audit/student-workspace.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1130 | `??` | E | `ops/ui-audits/2026-06-11-full-app-ui-audit/ui-audit-report.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1131 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/README.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 1132 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/actions.csv` | Unrelated existing work or historical/generated audit material outside this release. |
| 1133 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/button-action-audit.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 1134 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/context-clarity-failures.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 1135 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/drive-mirror-guide.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 1136 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/drive-upload.json` | Unrelated existing work or historical/generated audit material outside this release. |
| 1137 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/drive-upload.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 1138 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/flows.csv` | Unrelated existing work or historical/generated audit material outside this release. |
| 1139 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/implementation-backlog.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 1140 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/issues.csv` | Unrelated existing work or historical/generated audit material outside this release. |
| 1141 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/manifest.json` | Unrelated existing work or historical/generated audit material outside this release. |
| 1142 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/mobile-audit.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 1143 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/navigation-map.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 1144 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/role-workspace-matrix.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 1145 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/routes.csv` | Unrelated existing work or historical/generated audit material outside this release. |
| 1146 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/screenshot-index.html` | Unrelated existing work or historical/generated audit material outside this release. |
| 1147 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/screenshots.csv` | Unrelated existing work or historical/generated audit material outside this release. |
| 1148 | `??` | D | `ops/ux-audit-runs/2026-06-11-click-map/top-findings.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 1149 | `??` | D | `ops/ux-audit-runs/2026-06-11-drive-screenshot-analysis/implementation-selected.md` | Unrelated existing work or historical/generated audit material outside this release. |
| 1150 | `??` | A | `public/css/bna-app-shell.css` | Curated release-critical file proven by clean-branch validation. |
| 1151 | `??` | D | `public/documents/parent-handbook.html` | Content/documentation surface outside the parent/student/provider/action-registry release patch. |
| 1152 | `??` | D | `public/images/hillel.jpg` | Content/documentation surface outside the parent/student/provider/action-registry release patch. |
| 1153 | `??` | D | `public/images/huddle.jpg` | Content/documentation surface outside the parent/student/provider/action-registry release patch. |
| 1154 | `??` | D | `public/images/meir-bunny.jpg` | Content/documentation surface outside the parent/student/provider/action-registry release patch. |
| 1155 | `??` | D | `public/images/reuvane-jump-ball.jpg` | Content/documentation surface outside the parent/student/provider/action-registry release patch. |
| 1156 | `??` | A | `public/js/app-select.js` | Curated release-critical file proven by clean-branch validation. |
| 1157 | `??` | E | `public/js/parent-handbook-page.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1158 | `??` | A | `public/operations-manifest.json` | Curated release-critical file proven by clean-branch validation. |
| 1159 | `??` | A | `public/parent.html` | Curated release-critical file proven by clean-branch validation. |
| 1160 | `??` | A | `public/provider-participant.html` | Curated release-critical file proven by clean-branch validation. |
| 1161 | `??` | A | `public/provider.html` | Curated release-critical file proven by clean-branch validation. |
| 1162 | `??` | A | `public/providers-join.html` | Curated release-critical file proven by clean-branch validation. |
| 1163 | `??` | E | `scripts/build-laptop-install-package.ps1` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1164 | `??` | E | `scripts/build-ux-click-map-package.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1165 | `??` | E | `scripts/correct-audio-parse-2026-06-08.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1166 | `??` | E | `scripts/full-ui-audit.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1167 | `??` | E | `scripts/ghl-mcp-stdio.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1168 | `??` | E | `scripts/ingest-drive-playlist-transcripts.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1169 | `??` | E | `scripts/rabbi-video-prompt-library.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1170 | `??` | E | `scripts/railway-start.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1171 | `??` | E | `scripts/setup-one-time-partnership-drive.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1172 | `??` | E | `scripts/start-watchdog.ps1` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1173 | `??` | E | `scripts/sync-drive-content-library.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1174 | `??` | E | `scripts/task-queue-reconciler.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1175 | `??` | E | `scripts/update-content-prompts-professional-tone.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1176 | `??` | E | `scripts/upload-ux-audit-to-drive.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1177 | `??` | E | `scripts/video-clip-factory.mjs` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1178 | `??` | A | `src/lib/actions/actions/operations.js` | Curated release-critical file proven by clean-branch validation. |
| 1179 | `??` | A | `src/lib/actions/audit-log.js` | Curated release-critical file proven by clean-branch validation. |
| 1180 | `??` | A | `src/lib/actions/page-action-map.js` | Curated release-critical file proven by clean-branch validation. |
| 1181 | `??` | A | `src/lib/actions/permissions.js` | Curated release-critical file proven by clean-branch validation. |
| 1182 | `??` | A | `src/lib/actions/registry.js` | Curated release-critical file proven by clean-branch validation. |
| 1183 | `??` | A | `src/lib/actions/runner.js` | Curated release-critical file proven by clean-branch validation. |
| 1184 | `??` | A | `src/lib/actions/types.js` | Curated release-critical file proven by clean-branch validation. |
| 1185 | `??` | A | `src/lib/bna/google-integrations.js` | Curated release-critical file proven by clean-branch validation. |
| 1186 | `??` | A | `src/lib/bna/student-match.js` | Curated release-critical file proven by clean-branch validation. |
| 1187 | `??` | A | `src/lib/bna/telegram-accountability-parser.js` | Curated release-critical file proven by clean-branch validation. |
| 1188 | `??` | A | `src/lib/bna/telegram-action-router.js` | Curated release-critical file proven by clean-branch validation. |
| 1189 | `??` | A | `src/lib/bna/telegram-agent-intent.js` | Curated release-critical file proven by clean-branch validation. |
| 1190 | `??` | A | `src/lib/bna/telegram-contact-lead-capture.js` | Curated release-critical file proven by clean-branch validation. |
| 1191 | `??` | A | `src/lib/bna/telegram-planning-intent.js` | Curated release-critical file proven by clean-branch validation. |
| 1192 | `??` | E | `src/lib/ghl/README.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1193 | `??` | E | `src/remotion/OrganicClipFactory.tsx` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1194 | `??` | E | `tasks-pending/2026-06-09-google-classroom-worksheet-assignments.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1195 | `??` | E | `tasks-pending/2026-06-09-one-time-ghl-agent-loop.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1196 | `??` | E | `tasks-pending/2026-06-09-one-time-partnership-drive-map.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1197 | `??` | E | `tasks-pending/2026-06-09-organic-clip-factory.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1198 | `??` | E | `tasks-pending/2026-06-09-parent-student-dashboard-registration-followup.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1199 | `??` | E | `tasks-pending/2026-06-09-set-your-son-free-intro-video.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1200 | `??` | E | `tasks-pending/2026-06-09-telegram-ingestion-miss-audit.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1201 | `??` | E | `tasks-pending/2026-06-09-warm-leads-and-task-filters.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1202 | `??` | E | `tasks-pending/2026-06-10-one-time-external-user-portal-and-ticketing.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1203 | `??` | E | `tasks-pending/2026-06-10-one-time-rabbi-meeting-build-brief.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1204 | `??` | E | `tasks-pending/2026-06-10-provider-commercial-model-entitlements.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1205 | `??` | E | `tasks-pending/2026-06-10-service-provider-directory-and-login.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1206 | `??` | E | `tasks-pending/2026-06-10-telegram-goal-board-api-audit.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1207 | `??` | E | `tasks-pending/2026-06-10-transcript-wide-source-sheet-production.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1208 | `??` | B | `tasks-pending/2026-06-11-action-registry-telegram-ui-bot.md` | Curated release support/test/report file proven by clean-branch validation. |
| 1209 | `??` | E | `tasks-pending/2026-06-11-content-library-v2-build-brief.md` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1210 | `??` | B | `tasks-pending/2026-06-11-production-ui-qa-fix-loop.md` | Curated release support/test/report file proven by clean-branch validation. |
| 1211 | `??` | B | `tests/action-registry-telegram-ui-bot.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 1212 | `??` | B | `tests/app-select-dropdown.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 1213 | `??` | B | `tests/app-wide-brand-shell.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 1214 | `??` | B | `tests/bna-brand-shell.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 1215 | `??` | B | `tests/google-assignment-system.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 1216 | `??` | E | `tests/learning-moments-feed.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1217 | `??` | E | `tests/next-year-login-readiness.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1218 | `??` | E | `tests/one-time-external-user-portal.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1219 | `??` | E | `tests/one-time-meeting-drops.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1220 | `??` | E | `tests/operations-content-library-taxonomy.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1221 | `??` | E | `tests/operations-content-prompt-feedback.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1222 | `??` | E | `tests/operations-content-research-section.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1223 | `??` | E | `tests/operations-filter-dropdown.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1224 | `??` | E | `tests/operations-people-filter.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1225 | `??` | E | `tests/operations-pwa-login.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1226 | `??` | B | `tests/operations-saas-crm-redesign.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 1227 | `??` | B | `tests/operations-student-navigation.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 1228 | `??` | E | `tests/operations-task-comments-and-dictation.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1229 | `??` | B | `tests/parent-student-polish-contract.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 1230 | `??` | B | `tests/parent-student-portal-contract.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 1231 | `??` | E | `tests/public-content-contamination-guard.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1232 | `??` | E | `tests/rabbi-telegram-worker-runtime.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1233 | `??` | E | `tests/rabbi-video-prompt-library.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1234 | `??` | B | `tests/service-provider-directory.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 1235 | `??` | B | `tests/student-bot-settings.test.js` | Curated release support/test/report file proven by clean-branch validation. |
| 1236 | `??` | E | `tests/student-match.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1237 | `??` | E | `tests/task-queue-reconciler.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1238 | `??` | E | `tests/telegram-contact-lead-capture.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1239 | `??` | E | `tests/telegram-goal-board-api-coverage.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1240 | `??` | E | `tests/telegram-media-routing.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1241 | `??` | E | `tests/telegram-planning-intent.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1242 | `??` | E | `tests/telegram-ramble-routing-regression.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1243 | `??` | E | `tests/telegram-task-quick-actions.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1244 | `??` | E | `tests/torah-research-routing.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1245 | `??` | E | `tests/watchdog-soft-repair.test.js` | Not confidently attributable to the focused release; needs Shloimie review. |
| 1246 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/000a1de6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1247 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/00a3cacd` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1248 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/012e069a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1249 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/01f25b65` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1250 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0274927e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1251 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/03099819` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1252 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/045b1dc4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1253 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/052768c8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1254 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/05330103` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1255 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0539658f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1256 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/056407a9` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1257 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/05b95c81` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1258 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0742f03e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1259 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0778b960` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1260 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/08211eb2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1261 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/08f84914` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1262 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/08fcad41` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1263 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/090dbd98` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1264 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0aaed951` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1265 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0afff468` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1266 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0b4d326d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1267 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0c33d3b3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1268 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0c641507` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1269 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0d17afb7` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1270 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0dc02503` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1271 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0df68674` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1272 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0e41bec3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1273 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/0f44aab6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1274 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/10cb14e2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1275 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/10d12405` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1276 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/11ca6000` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1277 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/11e0bcf8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1278 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/128ffeb6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1279 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/133aee2d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1280 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/13fbcebc` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1281 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1425bd90` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1282 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/14345a1b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1283 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/149c4644` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1284 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1520be33` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1285 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/163becca` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1286 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/164e3e5e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1287 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/170839c6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1288 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/179d2560` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1289 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/18b9b488` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1290 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/19159518` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1291 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1a5e8e8d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1292 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1ac56db9` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1293 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1b93bf09` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1294 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1ba48359` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1295 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1bb65d97` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1296 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1be2b9da` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1297 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1bffe019` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1298 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1c469ae5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1299 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1c475633` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1300 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1d663bac` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1301 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1e01f894` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1302 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1ee1f213` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1303 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1ee5b179` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1304 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1f5d4d6e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1305 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1f652552` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1306 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1fb8f4f3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1307 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1fc63101` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1308 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/1fe241a5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1309 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/200bac84` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1310 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/205c8d02` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1311 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2089eb30` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1312 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2131725a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1313 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/21d5cee9` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1314 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/222d1c3b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1315 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/22a11d19` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1316 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/22d1fe93` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1317 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/22d2135e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1318 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2346b12a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1319 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/23be0144` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1320 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/23fba0a5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1321 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/24011fb1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1322 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2434bc16` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1323 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/245bd1c3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1324 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/24992b98` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1325 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/253ca67b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1326 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/25956228` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1327 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2671108a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1328 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/26f5dc1d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1329 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/279b0457` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1330 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/27e8fc09` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1331 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/27f2aa55` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1332 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/282982b9` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1333 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2888347a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1334 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/288b64fa` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1335 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2898560b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1336 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/28a61c69` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1337 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2a59bb66` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1338 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2ae13c45` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1339 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2b0f4b6b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1340 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2c4092c9` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1341 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2d69bd3f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1342 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2ddf9b3d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1343 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2dfef59f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1344 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2e1122c4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1345 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2edd52db` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1346 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2ee0e535` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1347 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2efdc5f1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1348 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2f6a71e9` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1349 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/2fd39c60` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1350 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3080203a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1351 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/30defcc4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1352 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/310cc71e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1353 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/31916143` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1354 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/31a335e9` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1355 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/327c1c07` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1356 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/328c6279` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1357 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/329581f2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1358 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/33219a1d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1359 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/33c51e20` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1360 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/343e81c6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1361 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/347b6177` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1362 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/36221a66` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1363 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3628c445` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1364 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/369baa21` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1365 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3889e187` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1366 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/38fc941f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1367 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3929c3fd` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1368 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/396e95f5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1369 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/397aa701` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1370 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/39932d86` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1371 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3a0d2d35` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1372 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3a8a01a8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1373 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3a9d8b43` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1374 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3aef3075` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1375 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3b261113` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1376 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3b489018` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1377 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3d0f0362` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1378 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3d34684b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1379 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3df413b6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1380 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3e167233` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1381 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3fb42a37` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1382 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/3ff5494a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1383 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/40280e60` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1384 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/402b9ced` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1385 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/402d22e1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1386 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/416cff63` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1387 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/418c6632` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1388 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/42b4cd6e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1389 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/42ea4611` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1390 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/43741164` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1391 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/43a02dbe` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1392 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/441aa218` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1393 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/45c0b437` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1394 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/46b235d2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1395 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/476a98c7` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1396 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/478b0f9e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1397 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/47a248f8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1398 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/49811c20` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1399 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/4a6b5991` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1400 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/4ab6ee9c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1401 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/4bc94a4f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1402 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/4befd2ea` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1403 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/4c36fd1a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1404 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/4d38a327` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1405 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/4dbb7a18` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1406 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/4dca171b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1407 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/4ea08a3f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1408 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/4f076d8f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1409 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/4ff3b2bd` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1410 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/506bbc76` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1411 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/50aab4ea` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1412 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/50b2f904` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1413 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/512a6da0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1414 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/51569107` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1415 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/51cc2102` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1416 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5210925e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1417 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/53ecf786` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1418 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/541bd36a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1419 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/543b651d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1420 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/54727607` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1421 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5474dcc7` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1422 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/54ce9568` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1423 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/54eff61e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1424 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/55100888` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1425 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/55197fc5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1426 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/553b7af3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1427 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5558b83f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1428 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/55e33543` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1429 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5651a404` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1430 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/56752bb0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1431 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/56a9a2bb` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1432 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/57265523` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1433 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/582906d3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1434 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/59223d85` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1435 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5963f626` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1436 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5984469f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1437 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/59f42f8b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1438 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5a249081` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1439 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5b1bb164` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1440 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5cc2a5f2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1441 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5d4c732f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1442 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5db76f6b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1443 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5dd238c0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1444 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5de311f1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1445 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5e0ed80f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1446 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5e3588d5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1447 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5e44306a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1448 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5e7d0d5d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1449 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5ed2b572` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1450 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5ed7f7db` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1451 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5ef33731` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1452 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5f461e18` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1453 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/5f8deeb1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1454 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/605e6a0a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1455 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6176a9b5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1456 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/61a71c97` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1457 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/61f1d3fb` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1458 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/62d92c26` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1459 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/62dd6080` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1460 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/62eddf8a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1461 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/64506dd0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1462 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/647d847c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1463 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6486c16e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1464 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/65566701` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1465 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/66b763a6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1466 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/67ef7bde` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1467 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/685371b6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1468 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/68f5b890` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1469 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/69ad03b4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1470 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6a31058b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1471 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6a73701d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1472 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6aac6d00` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1473 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6ae637d3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1474 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6c0e40d0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1475 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6c2fd108` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1476 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6c7a6a10` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1477 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6c9900bc` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1478 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6d58e5bb` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1479 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6eb2502a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1480 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/6f74c50b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1481 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/701a046d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1482 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7067e5d8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1483 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/70f983f3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1484 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7116147f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1485 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/716d12a6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1486 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/720685ee` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1487 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7242c21e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1488 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/728b0581` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1489 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/72c8965f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1490 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/72eec452` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1491 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7313f723` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1492 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/73158906` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1493 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/733b4559` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1494 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/73c838ba` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1495 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/73e0f4b3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1496 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/73fb952b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1497 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/740c9396` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1498 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7418e241` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1499 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/745708c8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1500 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7460c93f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1501 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/749cecdb` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1502 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7541c12c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1503 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/75d38e6f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1504 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/75d8ff37` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1505 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/75f522a1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1506 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/76c7489f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1507 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7715fc2c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1508 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/771e5d19` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1509 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7783a8ec` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1510 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/780a6805` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1511 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/789dd9a4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1512 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7a01d94e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1513 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7a4e4f17` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1514 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7aa6ee01` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1515 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7b0590ed` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1516 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7be39abc` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1517 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7de2104f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1518 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7de5f39a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1519 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7e1d748b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1520 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7e8b8aaf` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1521 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/7f33fee5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1522 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/800e8a5f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1523 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8078686f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1524 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/812b8370` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1525 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/81bc70ec` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1526 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/81f899eb` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1527 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8206ae0a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1528 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/82884d2a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1529 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/82daf4d1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1530 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/82dfa333` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1531 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/84d05a23` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1532 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/853ec497` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1533 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/85db2ecb` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1534 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/85ef818a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1535 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/863b37e7` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1536 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/86a117bb` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1537 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/87057915` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1538 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/874b7136` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1539 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/877f8bab` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1540 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/878008da` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1541 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/87a30202` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1542 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8862032d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1543 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/88f1dc55` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1544 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/892fd61e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1545 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/898c22f0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1546 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/89de43e7` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1547 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8a586ea8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1548 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8a5bb9fc` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1549 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8b0810b1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1550 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8b12d9e8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1551 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8b1b2594` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1552 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8bc41a69` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1553 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8c5d72ae` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1554 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8c62a113` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1555 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8ce211a6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1556 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8dd99279` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1557 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8deab10b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1558 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8e3c6c89` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1559 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8e623d0b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1560 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8f19f1de` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1561 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/8f2491c8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1562 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9000aef3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1563 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/902c662a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1564 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/911342f2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1565 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9118f4fa` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1566 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9186e2f2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1567 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/91968dc1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1568 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/91a0a363` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1569 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/91c7bbd0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1570 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/91fe7831` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1571 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/922da448` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1572 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/92514b71` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1573 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/926b4568` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1574 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/92f65872` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1575 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9342cfc6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1576 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/941ef74f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1577 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9496d8e2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1578 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/96c57777` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1579 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/96c95ddb` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1580 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/977ff23b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1581 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/97af179d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1582 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/984a30e9` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1583 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/99c01743` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1584 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/99e350e4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1585 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9a7a57f4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1586 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9a820759` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1587 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9bb7b87b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1588 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9d0fff67` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1589 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9d4f46f1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1590 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9d5899b0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1591 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9de3f3ae` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1592 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9f70617f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1593 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9f92f695` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1594 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9fb5e6d3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1595 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/9fb85165` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1596 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a009880d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1597 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a04c762a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1598 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a0deb7e8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1599 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a0f03400` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1600 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a1194e24` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1601 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a20cefa2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1602 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a26ce9c9` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1603 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a273538d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1604 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a358bf76` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1605 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a4932241` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1606 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a4be7766` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1607 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a4f97284` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1608 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a55bff1b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1609 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a5f77833` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1610 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a6c2c369` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1611 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a8666b05` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1612 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a86d680a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1613 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a873c003` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1614 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a8aab654` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1615 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a8b283e0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1616 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a9054abf` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1617 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/a960a675` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1618 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ab0dca28` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1619 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ab69c9a1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1620 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ac185236` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1621 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ac526d4e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1622 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/acc15438` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1623 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ad02c34a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1624 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ad168735` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1625 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ad92ba0e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1626 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ad987282` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1627 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/adc2dadb` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1628 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/add82f56` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1629 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ae5b14c8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1630 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ae77d203` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1631 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/af43cdd3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1632 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/af467df1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1633 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/af5cf846` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1634 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/afb5d9e8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1635 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/afec9158` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1636 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/aff3a482` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1637 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b09573be` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1638 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b1205eb4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1639 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b17a6dec` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1640 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b18754d8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1641 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b1891195` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1642 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b1b2f9d3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1643 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b1f563ca` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1644 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b2fdad6c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1645 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b30b2046` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1646 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b3d0c11e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1647 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b410d2c5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1648 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b5308ceb` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1649 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b53f3bd0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1650 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b629975a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1651 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b673a402` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1652 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b80e8bbf` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1653 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b8d842bd` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1654 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b9340404` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1655 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b93d3c5f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1656 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b99ddc13` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1657 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b9b8683e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1658 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/b9d3826e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1659 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ba1b984b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1660 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ba93ac88` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1661 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/bafcfb84` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1662 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/bb36800b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1663 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/bb6b8034` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1664 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/bc45333d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1665 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/bc69dc17` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1666 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/bca1b093` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1667 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/bd675328` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1668 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/be587f65` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1669 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/bec55151` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1670 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/befe29aa` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1671 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/bf783b2b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1672 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/bf9d4cf2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1673 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/bfa67430` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1674 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/bfd46e2f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1675 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c0b8f1a6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1676 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c156be25` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1677 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c1f269f7` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1678 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c2c12aee` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1679 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c2cd5490` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1680 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c2e71370` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1681 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c2e89ba5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1682 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c33c2aa8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1683 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c36203b4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1684 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c3bf3a3e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1685 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c3d632bd` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1686 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c3d72b9c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1687 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c494c4b4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1688 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c62a112f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1689 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c6a94a73` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1690 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c6b867d2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1691 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c84bb608` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1692 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c85b1359` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1693 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c8ee3b9c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1694 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c950ca7e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1695 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/c9f25af6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1696 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/caeca192` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1697 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/caff35bc` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1698 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/cb8f2da8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1699 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/cc40ba20` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1700 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/cc4f384a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1701 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/cc89c1ed` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1702 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ccbf9915` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1703 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/cd186049` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1704 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/cd9eed22` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1705 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/cdbc8c67` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1706 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ce1833ab` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1707 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ce41c404` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1708 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ceb8a7aa` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1709 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/cf2c35d3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1710 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/cf929bb4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1711 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/cfb54825` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1712 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d0008a8c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1713 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d0250ad2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1714 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d02e982a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1715 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d0bf313c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1716 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d175d850` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1717 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d1c74c93` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1718 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d22dbbaf` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1719 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d285e52c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1720 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d2c313b5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1721 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d2e7d08a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1722 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d3dfb061` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1723 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d4538125` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1724 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d50e5080` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1725 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d55dde70` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1726 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d5d61f9a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1727 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d5da8dd9` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1728 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d6dd70fa` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1729 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d7050533` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1730 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d7d680db` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1731 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d8dc3671` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1732 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d8e695f3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1733 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d917a25c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1734 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d93f46e0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1735 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d95719e2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1736 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d9892f45` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1737 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/d9b5e822` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1738 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/daa5d614` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1739 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/db4dcff5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1740 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/dbdd5317` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1741 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/dcc23fd2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1742 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/dd2d584e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1743 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/dd3feb06` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1744 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/dd63a73f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1745 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/de1358e1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1746 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/de92b24b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1747 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ded97cb3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1748 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/dedad5f3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1749 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/df63f263` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1750 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/df85a9e4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1751 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/dff8cb13` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1752 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/dfff5d1a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1753 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e1462058` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1754 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e1710fbf` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1755 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e281f8d5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1756 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e2e49554` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1757 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e3c1f166` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1758 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e3c2381c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1759 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e440f416` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1760 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e63ff5b9` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1761 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e65baf3a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1762 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e69219a8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1763 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e6de864e` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1764 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e70df5b2` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1765 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e77e3ab3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1766 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e7a1795f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1767 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e7e67675` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1768 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e84f4f9a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1769 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e8877d49` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1770 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e889e499` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1771 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e8b21fee` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1772 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e97dd9ef` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1773 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/e99de3de` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1774 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/eabcc204` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1775 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/eb64b5cd` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1776 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ebbf15fc` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1777 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ebc98ecc` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1778 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ece6bba0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1779 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ed5e7bde` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1780 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ed99c1d4` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1781 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ee3e1ad1` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1782 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ee90f829` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1783 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ef8ac475` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1784 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/ef9665b0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1785 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/efe017e6` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1786 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f018335d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1787 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f0647882` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1788 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f0e87c98` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1789 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f11cf2e0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1790 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f1a7094b` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1791 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f1ffc102` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1792 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f23c95d5` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1793 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f292161d` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1794 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f3f12097` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1795 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f3ff6912` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1796 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f4cb9649` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1797 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f4d77aeb` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1798 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f515c638` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1799 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f5ba4d32` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1800 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f6f867a3` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1801 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f7182f57` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1802 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f73592ff` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1803 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/f996bb7a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1804 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fa0e7dac` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1805 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fa9d2737` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1806 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/faaaaae8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1807 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fb364266` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1808 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fb3fd791` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1809 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fb6aa9e8` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1810 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fbbad274` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1811 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fc0e58aa` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1812 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fc895fea` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1813 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fc986d28` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1814 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fd024c1a` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1815 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fd0b4031` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1816 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fd163170` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1817 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fdeedb7c` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1818 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fdffffb0` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1819 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fe479403` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1820 | `??` | C | `tmp/node-compile-cache/v24.13.0-x64-cf738c9d/fec5a12f` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1821 | `??` | C | `tmp/qa-runs/content-card-research-links/local-content-card-research-links-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1822 | `??` | C | `tmp/qa-runs/content-card-research-links/local-content-card-research-links.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1823 | `??` | C | `tmp/qa-runs/content-card-research-links/production-content-card-research-links-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1824 | `??` | C | `tmp/qa-runs/content-card-research-links/production-content-card-research-links.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1825 | `??` | C | `tmp/qa-runs/content-card-research-links/server-8080.pid` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1826 | `??` | C | `tmp/qa-runs/content-library-taxonomy/local-content-library-bna-diagnostic.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1827 | `??` | C | `tmp/qa-runs/content-library-taxonomy/local-content-library-bna-diagnostic.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1828 | `??` | C | `tmp/qa-runs/content-library-taxonomy/local-content-library-diagnostic.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1829 | `??` | C | `tmp/qa-runs/content-library-taxonomy/local-content-library-diagnostic.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1830 | `??` | C | `tmp/qa-runs/content-library-taxonomy/local-content-library-taxonomy-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1831 | `??` | C | `tmp/qa-runs/content-library-taxonomy/local-content-library-taxonomy.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1832 | `??` | C | `tmp/qa-runs/content-library-taxonomy/production-content-library-taxonomy-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1833 | `??` | C | `tmp/qa-runs/content-library-taxonomy/production-content-library-taxonomy.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1834 | `??` | C | `tmp/qa-runs/content-library-taxonomy/server-8080.pid` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1835 | `??` | C | `tmp/qa-runs/live-smoke/production-desktop-provider-workspace.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1836 | `??` | C | `tmp/qa-runs/live-smoke/production-desktop-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1837 | `??` | C | `tmp/qa-runs/live-smoke/production-mobile-bna-dashboard.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1838 | `??` | C | `tmp/qa-runs/live-smoke/production-ui-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1839 | `??` | C | `tmp/qa-runs/operations-full-qa-results-clean.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1840 | `??` | C | `tmp/qa-runs/operations-full-qa-results-final.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1841 | `??` | C | `tmp/qa-runs/operations-full-qa-results.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1842 | `??` | C | `tmp/qa-runs/provider-commercial-live/provider-commercial-live-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1843 | `??` | C | `tmp/qa-runs/provider-commercial-live/provider-onboarding-browser-final-live.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1844 | `??` | C | `tmp/qa-runs/provider-commercial-live/provider-onboarding-final-live.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1845 | `??` | C | `tmp/qa-runs/provider-commercial-local/provider-commercial-local-smoke-active-filter.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1846 | `??` | C | `tmp/qa-runs/provider-commercial-local/provider-commercial-local-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1847 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-bna-calendar.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1848 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-bna-dashboard.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1849 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-bna-provider-directory.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1850 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-bna-student-assignments.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1851 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-bna-student-bot.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1852 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-bna-student-documents.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1853 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-bna-student-goals.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1854 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-bna-student-questions.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1855 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-bna-students.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1856 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-api-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1857 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-automations.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1858 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-billing.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1859 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-bot-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1860 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-calendar-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1861 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-classroom.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1862 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-danger.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1863 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-dashboard.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1864 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-email.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1865 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-parent-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1866 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-pipelines.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1867 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-provider-index.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1868 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-provider-portal-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1869 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-provider-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1870 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1871 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-social.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1872 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-student-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1873 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-platform-whatsapp.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1874 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-provider-api.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1875 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-provider-dashboard.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1876 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-provider-dialogue.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1877 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-provider-leads.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1878 | `??` | C | `tmp/qa-runs/screenshots-clean/desktop-provider-workspace.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1879 | `??` | C | `tmp/qa-runs/screenshots-clean/mobile-mobile-bna-dashboard.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1880 | `??` | C | `tmp/qa-runs/screenshots-clean/mobile-workspace-filter-switch.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1881 | `??` | C | `tmp/qa-runs/screenshots-clean/parent-hebrew-rtl.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1882 | `??` | C | `tmp/qa-runs/screenshots-clean/provider-desktop-provider-scoped-nav.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1883 | `??` | C | `tmp/qa-runs/screenshots-clean/provider-portal-public.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1884 | `??` | C | `tmp/qa-runs/screenshots-clean/student-hebrew-rtl.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1885 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-bna-calendar.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1886 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-bna-dashboard.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1887 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-bna-provider-directory.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1888 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-bna-student-assignments.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1889 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-bna-student-bot.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1890 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-bna-student-documents.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1891 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-bna-student-goals.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1892 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-bna-student-questions.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1893 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-bna-students.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1894 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-api-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1895 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-automations.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1896 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-billing.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1897 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-bot-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1898 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-calendar-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1899 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-classroom.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1900 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-danger.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1901 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-dashboard.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1902 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-email.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1903 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-parent-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1904 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-pipelines.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1905 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-provider-index.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1906 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-provider-portal-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1907 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-provider-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1908 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1909 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-social.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1910 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-student-settings.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1911 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-platform-whatsapp.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1912 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-provider-api.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1913 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-provider-dashboard.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1914 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-provider-dialogue.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1915 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-provider-leads.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1916 | `??` | C | `tmp/qa-runs/screenshots-final/desktop-provider-workspace.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1917 | `??` | C | `tmp/qa-runs/screenshots-final/mobile-mobile-bna-dashboard.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1918 | `??` | C | `tmp/qa-runs/screenshots-final/mobile-workspace-filter-switch.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1919 | `??` | C | `tmp/qa-runs/screenshots-final/parent-hebrew-rtl.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1920 | `??` | C | `tmp/qa-runs/screenshots-final/provider-desktop-provider-scoped-nav.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1921 | `??` | C | `tmp/qa-runs/screenshots-final/provider-portal-public.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1922 | `??` | C | `tmp/qa-runs/screenshots-final/student-hebrew-rtl.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1923 | `??` | C | `tmp/qa-runs/server-8080.pid` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1924 | `??` | C | `tmp/qa-runs/task-467/student-mobile-calendar-he.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1925 | `??` | C | `tmp/qa-runs/workflow-b-reactivation/live-roadmap-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1926 | `??` | C | `tmp/qa-runs/workflow-g-cancellation/live-roadmap-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1927 | `??` | C | `tmp/qa-runs/workflow-i-class-reminders/live-roadmap-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1928 | `??` | C | `tmp/qa-runs/workflow-j-recording-posted/live-roadmap-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1929 | `??` | C | `tmp/qa-runs/workflow-k-materials-posted/live-roadmap-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1930 | `??` | C | `tmp/qa-runs/workflow-m-parent-update/live-roadmap-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1931 | `??` | C | `tmp/qa-runs/workflow-o-referral/live-roadmap-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1932 | `??` | C | `tmp/qa-runs/workflow-p-testimonial-reputation/live-roadmap-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1933 | `??` | C | `tmp/qa-runs/workflow-q-organic-content-upload/clip-smoke-props.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1934 | `??` | C | `tmp/qa-runs/workflow-q-organic-content-upload/clip-smoke-props.summary.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1935 | `??` | C | `tmp/qa-runs/workflow-q-organic-content-upload/live-roadmap-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1936 | `??` | C | `tmp/qa-runs/workflow-r-organic-winner-paid-ad/live-roadmap-smoke.json` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1937 | `??` | C | `tmp/smoke/operations-bna-calendar-desktop.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1938 | `??` | C | `tmp/smoke/operations-bna-provider-directory-desktop.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1939 | `??` | C | `tmp/smoke/operations-mobile-bna-dashboard.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1940 | `??` | C | `tmp/smoke/operations-mobile-provider-drawer.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1941 | `??` | C | `tmp/smoke/operations-platform-pipelines-desktop.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1942 | `??` | C | `tmp/smoke/operations-provider-dialogue-desktop.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1943 | `??` | C | `tmp/smoke/operations-provider-scoped-nav.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1944 | `??` | C | `tmp/smoke/operations-settings-email-identities-desktop.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1945 | `??` | C | `tmp/smoke/parent-portal-hebrew-mobile.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1946 | `??` | C | `tmp/smoke/prod-operations-bna-calendar-desktop.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1947 | `??` | C | `tmp/smoke/prod-operations-mobile-bna-dashboard.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1948 | `??` | C | `tmp/smoke/prod-operations-mobile-provider-drawer.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1949 | `??` | C | `tmp/smoke/prod-operations-provider-dialogue-desktop.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1950 | `??` | C | `tmp/smoke/prod-operations-settings-email-identities-desktop.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1951 | `??` | C | `tmp/smoke/prod-parent-portal-hebrew-mobile.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1952 | `??` | C | `tmp/smoke/prod-provider-portal-desktop.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1953 | `??` | C | `tmp/smoke/prod-student-portal-hebrew-mobile.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1954 | `??` | C | `tmp/smoke/provider-portal-desktop.png` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1955 | `??` | C | `tmp/smoke/server-8080.pid` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1956 | `??` | C | `tmp/smoke/server-8099.pid` | Generated verification/build/release artifact excluded from the deploy patch. |
| 1957 | `??` | C | `tmp/smoke/student-portal-hebrew-mobile.png` | Generated verification/build/release artifact excluded from the deploy patch. |
