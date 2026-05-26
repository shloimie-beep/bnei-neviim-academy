# BNA Tasks

## Completed Today ✅

- [x] Switch to Kimi 2.6 model
- [x] Create desktop shortcut/button for Kimi CLI
- [x] Check Downloads folder for reference materials
- [x] Found and parsed CORRECT document: Whole Child Torah Learning Community Master Document
- [x] Received website prompt for Bnei Nevi'im Academy
- [x] Received and securely stored Telegram bot token
- [x] Received domain: bneineviimacademy.org
- [x] Received updated Vision & Mission from operator
- [x] **BUILT WEBSITE** - Complete bilingual landing page at `public/index.html`
- [x] **Operations UI** - Professional task manager with auth
- [x] **Signup form** - Payment method selection (Cash/Green Invoice)
- [x] **GHL client library** - Contact CRUD, custom fields, tags
- [x] **Server.js** - Express with Railway Postgres, Telegram, GHL sync
- [x] **Retroactive sync script** - `scripts/sync-signups-to-ghl.js`
- [x] **Railway env vars** - All 9 variables pasted
- [x] **Task Pipeline System** - Holy Flow-inspired (`src/lib/bna/task-pipeline.ts`)
- [x] **Database Migration** - BNA tables with pipeline stages
- [x] **Telegram Bot** - Buttons-based, no slash commands

## Now (Next Up)

- [ ] **Fix GHL API** - Token needs location access enabled in GHL dashboard
- [ ] **Apply DB Migration** - Run `supabase-migration-003-bna-tasks.sql`
- [ ] **Update Operations Dashboard** - Pipeline UI with stage columns
- [ ] **Deploy Telegram Webhook** - Connect to Railway
- [ ] **CLI Bridge** - Route Telegram messages to terminal
- [ ] **Sync 4 Existing Signups** - Once GHL API works
- [ ] **Green Invoice Webhook** - Configure in Green Invoice dashboard

## Blocked ⏳

### GHL API 403 Error
**Problem:** Token works but "does not have access to this location"
**Solution:** Operator needs to enable PIT token for location `IIofSrquLHvNxc8zrpka` in GHL
**Steps:**
1. Log into GHL
2. Settings → API Credentials → Private Integration Token
3. Make sure toggle is ON for the location

## Holy Flow Task Pipeline

### Pipeline Stages
1. **Inbox** - Raw captures from rambles/Telegram
2. **Triage** - Classified, needs prioritization
3. **Planned** - Steps defined
4. **In Progress** - Active work
5. **Waiting** - Blocked/external dependency
6. **Review** - Done, needs verification
7. **Done** - Complete

### Task Categories
- accounting, marketing, communications, operations
- parent_onboarding, student_coaching
- ghl_crm, billing, legal_compliance, facilities, staffing

### Ramble Protocol
- Capture raw text/voice
- Auto-parse for: urgency, category, steps, entities
- Create task in Inbox
- Present for operator confirmation

## Railway Environment Variables (Pasted ✅)

```
DATABASE_URL=postgresql://...
PAYMENT_LINK=https://mrng.to/r9DSZhhWE9
APP_URL=https://bneineviimacademy.org
GHL_PIT_TOKEN=pit-08830ae3-faed-432a-a02a-44c63b170a67
GHL_LOCATION_ID=IIofSrquLHvNxc8zrpka
TELEGRAM_BOT_TOKEN=8734047681:AAFzeQEYnPjKtnt6v5v3FDZld6IhVWWGkk4
TELEGRAM_CHAT_ID_SHLOIMIE=8202155026
OPS_USERNAME=SHLOIMIE
OPS_PASSWORD=BNA613!
```

## Telegram Bot Features

### Buttons (No Slash Commands)
- 📥 Inbox - View inbox tasks
- 🔴 Urgent - View urgent/today tasks
- 📊 Pipeline - Stage-based view
- ➕ Quick Add - Ramble input mode
- 💰 Billing - Billing dashboard
- 👨‍👩‍👧‍👦 Signups - Recent signups
- 🌐 Open Dashboard - Link to Operations

### Natural Language
Just type or voice message:
- "Need to call Cohen about payment"
- "Urgent: Fix website contact form"
- "Today: Send parent handbook to new family"

## Next Actions

**Operator needs to:**
1. ✅ Create Railway account - DONE
2. ✅ Paste env vars - DONE
3. 🔄 Fix GHL token location access - IN PROGRESS
4. ⏳ Configure Green Invoice webhook - PENDING

**I'll handle:**
1. Apply database migration
2. Update Operations dashboard with pipeline UI
3. Deploy Telegram webhook
4. Set up CLI bridge
5. Sync existing signups once GHL works

## Brand Memory Kit (Pending)

Create `BRAND.md` from Master Document with:
- Quick-reference talking points
- Key phrases for marketing
- Non-negotiables checklist
- Visual brand guidelines
