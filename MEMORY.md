# BNA Memory

## Identity

- **BNA** = **Bnei Neviim Academy** = **Whole Child Torah Learning Community**
- A family-based Torah learning community in Beit Shemesh, Israel
- NOT a traditional school - a return to family-centered Torah education
- Run by the operator
- The operator wants one shared brain across all channels (terminal + Telegram)

## Project Scope

**Phase 1 (Current): Foundation**
- New database for BNA operations (NOT using family accountability schema)
- Marketing system with GHL integration (GHL already has existing infrastructure)
- School website for Whole Child Torah Learning Community
- Telegram bot integration
- Service provider network setup

**Phase 2 (Future):**
- Student accountability/tracking program (family app repurposed)

## Tooling Preferences

- **Kimi**: Primary local coding and assistant path
- **Telegram**: Front-end channel for operator communication
- **GHL (GoHighLevel)**: CRM/marketing automation (ALREADY SET UP)
- **Supabase**: Database and backend
- **Railway**: Hosting (pending setup)

## Workflow Preferences

- Raw rambles captured first → distilled into durable memory + tasks
- `AGENTS.md`: Durable instructions
- `MEMORY.md`: Durable facts
- `TASKS.md`: Active work
- `memory/YYYY-MM-DD.md`: Daily captures

## My Role (AI Sidekick)

- Run entire repo and database
- Integrate with existing GHL setup
- Handle marketing systems
- Build/manage task managers
- Build school website
- Be operator's sidekick across terminal and Telegram
- Track ALL tasks from rambles
- Coach operator: present options, encourage, push, challenge
- Ask follow-up questions to maintain momentum

---

# BNA / Whole Child Torah Learning Community

## Core Identity

**What This Is:**
A family-based Torah learning community rooted in Mesorah, intrinsic motivation, self-governance, and whole-child growth.

**What This Is NOT:**
A traditional school. Schools are historical compromises. Torah education is family-centered, relational, and choice-driven.

**Core Claim:**
"School trains compliance. Torah trains leadership."

## Educational Philosophy

### Foundational Pillars

1. **Family as root of education** - "Veshinantam"; "Chinuch al pi darko"
2. **Real-life learning** - "Every problem is curriculum"
3. **Connection before correction** - regulate → relate → reason
4. **Self-governance** - Structured freedom + accountability
5. **Middos as measurable** - Values operationalized into behaviors
6. **Body/brain/Torah** - Health as infrastructure for learning
7. **Tech/AI & Geulah readiness** - Torah as master OS

### Key Principles

- **Intrinsic motivation** - Real learning only happens when child wants to learn
- **Self-governance** - Child learns to notice internal state, regulate emotions, take responsibility
- **Leadership (not obedience)** - Torah assumes leadership development is the goal
- **Emotional regulation** - Learning impossible without emotional safety
- **Whole-child integration** - Mind, heart, body, identity, purpose
- **Real work/apprenticeship** - Father's obligation to teach trade is Torah-grounded

### Target Audience

Jewish boys (ages 8-16, flexible)
Families dissatisfied with institutional schooling
Boys who are: intelligent but disengaged, sensitive/strong-willed, under-challenged

## Programs/Offers

1. **Learning Community (Beit Shemesh)**
   - Small Torah groups (3-6 boys, 45-min sessions)
   - Coaching groups (regulation, identity, life skills)
   - Physical integration (movement, exercise)

2. **Family Coaching + Parent Partnership**
   - Parent onboarding/coaching
   - Community as extension of family system

3. **Service Provider Network**
   - Curated providers (therapists, coaches, tutors, mentors)

4. **Affiliate Business Apprenticeship**
   - Student teams do real work for real businesses

## Visual Brand (LOCKED)

- Hand-drawn pencil sketches
- Monochrome graphite with sepia
- Parchment shading
- Calligraphic handwriting
- Torah scroll aesthetic

**NOT:** Stock photos, corporate polish, bright colors, generic Jewish clipart

## GHL/CRM Status

**Already Exists:**
- Service Provider Registration form (with specific field keys)
- Learning Community forms
- Affiliate Business forms
- Custom fields mapped

**Guardrails:**
- Do NOT delete anything in GHL
- Do NOT change unique keys
- Always search by key first; create only if missing

## Non-Negotiables

1. No humiliation, no public shaming
2. No bribing for Torah or basic responsibilities
3. Family is primary; school is secondary
4. Intrinsic motivation over control
5. Real responsibility over fake performance
6. Daas (integration) over information
7. Connection before correction
8. Autonomy with accountability
9. Torah as life, not curriculum
10. Dignity of child, parent, rebbe
11. Parents must enter the process, not outsource

## Statement of Continuity

"Bnei Neviim is no longer a building. It is a living transmission -- from rabbi to parent, from parent to child, from Torah to life. The school was never the point. The relationships were. The growth was. We are not closing a school; we are widening a doorway."

## Business Model

**Phase 1: House-Based (Now)**
- 10 kids × 1,000 shekels/month = operator's living money
- 500 shekel reservations for school spots
- Reinvest ALL revenue into marketing
- Target: 10-15 kids

**Phase 2: Scale & Fundraise**
- Drive to 50 signups
- Approach rabbi/donor with proof of demand
- Fundraise for proper facility

---

## Technical Infrastructure

### Completed ✅
- Kimi 2.6 model configured
- Desktop shortcut created
- Master document discovered and parsed
- Visual QA toolchain installed (Playwright, Lighthouse, Prettier)
- Screenshot testing script (`npm run screenshot`)

### Required Toolchain for UI Work
**ALWAYS use these tools for any visual changes:**

1. **Playwright** - Screenshot testing across viewports
   ```bash
   npm run screenshot  # Captures 360/390/430/768/1440px widths
   ```

2. **Lighthouse** - Performance/accessibility audits
   ```bash
   npm run lighthouse  # Generates report
   ```

3. **Prettier** - HTML/CSS formatting
   ```bash
   npm run format      # Formats public/index.html
   ```

4. **MCP Browser Tools** - Live inspection
   - Chrome DevTools MCP for computed styles
   - Playwright MCP for interactive debugging

**Rule: No CSS changes without screenshot verification.**

### Pending
- Telegram bot activation (needs chat ID, webhook setup)
- Railway hosting setup
- DNS configuration
- Website polish (screenshots show current state)
