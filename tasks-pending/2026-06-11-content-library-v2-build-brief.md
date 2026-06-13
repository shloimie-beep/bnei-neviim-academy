# Content Library v2 Build Brief

Date: 2026-06-11
Owner: Codex
Project: BNA School Workspace
Status: Ready for implementation

## Goal

Turn the current BNA content pipeline from a draft-generation system into a
searchable, source-aware, taxonomy-driven knowledge library.

## Current Finding

The repo already has the real BNA Operations / Content system. It is a
Node/Express app with PostgreSQL, Google/Drive tooling, Telegram bridge scripts,
transcript exports, OpenAI/Kimi content generation, and Remotion/video tooling.

The existing content flow is useful, but it is mainly:

```text
Content Job -> transcript_text -> transcript_json -> parse_json -> outputs
```

Class sessions also store flexible JSONB arrays for topics, discussions,
sources, student questions, and highlights. That is not enough for a reliable
knowledge library because verified topics, Torah area, ADHD/science topic,
claims, punchlines, source status, Sefaria refs, research tasks, and
repurposing readiness are not first-class searchable records.

The Operations UI also still has display-side topic inference/fallbacks. Those
are acceptable as temporary display fallbacks only; they must not be the source
of truth for content classification.

## Product Requirement

Move from:

```text
Content Job -> Parsed JSON -> Output Drafts
```

to:

```text
Content Job
-> Segments
-> Ideas / Punchlines
-> Claims
-> Sources
-> Research Tasks
-> Tags / Taxonomy
-> Repurposing Assets
```

Keep existing `bna_content_jobs`, `bna_content_outputs`, Prompt Studio, weekly
bundles, WhatsApp/Facebook/newsletter/blog workflows, and current ingestion
paths working during the migration.

## Schema To Add

Add normalized tables:

- `bna_content_taxonomy_terms`
- `bna_content_job_terms`
- `bna_content_segments`
- `bna_content_claims`
- `bna_content_sources`
- `bna_claim_sources`
- `bna_research_tasks`

### Taxonomy Terms

Purpose: controlled vocabulary.

Fields:

```text
id
slug
label
parent_slug
domain
description
allowed_for
active
created_at
updated_at
```

Seed domains for Torah, ADHD, nutrition, parenting, education, operations, and
repurposing.

Examples:

```text
torah.gemara.berachos
torah.parsha.bereishis
adhd.executive_function
adhd.sleep
nutrition.breakfast
repurpose.youtube_short
```

### Job Terms

Purpose: attach reviewed taxonomy terms to content jobs.

Fields:

```text
id
content_job_id
term_slug
confidence
source
review_status
created_at
updated_at
```

`source`: `ai`, `human`, `backfill`

`review_status`: `suggested`, `approved`, `rejected`, `needs_review`

### Segments

Purpose: break each recording/class/video/meeting into reusable ideas.

Fields:

```text
id
content_job_id
start_time
end_time
title
summary
main_idea
punchline
best_quote
supporting_points
segment_type
topic_slugs
torah_metadata
science_metadata
repurpose_angles
repurpose_status
audience
sort_order
created_at
updated_at
```

Segment types:

```text
torah_idea
adhd_idea
nutrition_idea
parenting_idea
student_story
business_idea
internal_strategy
operations_noise
```

### Claims

Purpose: track factual, Torah, scientific, business, story, and opinion claims.

Fields:

```text
id
segment_id
claim_text
claim_type
source_required
source_status
claim_strength
medical_disclaimer_required
confidence
notes
created_at
updated_at
```

Claim types:

```text
torah
science
business
personal_opinion
story
internal_observation
```

Source statuses:

```text
no_source_needed
source_missing
source_suggested
source_verified
source_rejected
needs_human_review
```

Claim strength:

```text
strong
moderate
weak
mixed
anecdotal
```

### Sources

Purpose: store actual source records, not loose text arrays.

Fields:

```text
id
source_type
title
author
publication
year
url
sefaria_ref
sefaria_sheet_id
evidence_level
quote_or_excerpt
notes
verified_by
verified_at
created_at
updated_at
```

Source types:

```text
sefaria_ref
sefaria_sheet
pubmed
clinical_guideline
government_health_resource
peer_reviewed_article
book
author
website_article
internal_note
```

### Claim Sources

Purpose: many-to-many join between claims and sources.

Fields:

```text
claim_id
source_id
support_type
notes
```

Support types:

```text
supports
partially_supports
background
contradicts
needs_review
```

### Research Tasks

Purpose: source lookup queue.

Fields:

```text
id
content_job_id
segment_id
claim_id
domain
task_text
priority
status
assigned_to
result_url
notes
created_at
updated_at
```

Statuses:

```text
open
in_progress
source_found
blocked
verified
closed
```

## Taxonomy Requirements

Torah must be hierarchical, not a single broad tag. Seed at least:

```text
torah.tanach
torah.chumash
torah.neviim
torah.kesuvim
torah.mishnah
torah.gemara
torah.halacha
torah.parsha
torah.midrash
torah.mussar
torah.hashkafa
torah.chassidus
torah.rishonim
torah.acharonim
torah.practical_avodah
```

For Gemara/Mishnah metadata, support seder, masechta, daf, perek, mishnah, and
sugya keywords.

For Halacha metadata, support halacha area, sefer, siman, seif, and posek.

For Parsha metadata, support sefer, parsha, perek, pasuk, and theme.

ADHD/science seed examples:

```text
adhd.executive_function
adhd.attention_regulation
adhd.impulsivity
adhd.emotional_regulation
adhd.motivation
adhd.working_memory
adhd.time_blindness
adhd.sleep
adhd.exercise
adhd.diet_nutrition
adhd.medication
adhd.behavioral_strategies
adhd.school
adhd.parenting
adhd.adolescent
```

Nutrition seed examples:

```text
nutrition.breakfast
nutrition.protein
nutrition.sugar
nutrition.ultra_processed_foods
nutrition.food_environment
nutrition.energy_crashes
nutrition.sleep
nutrition.adhd
```

## Parser v2

Keep the existing mixed-recording parser. Add a second library parser layer:

```text
mixed-recording-parser-v1
-> separates tasks / students / Torah progress / class notes

content-library-parser-v2
-> extracts segments / claims / topics / sources / research tasks / repurposing angles
```

Do not overwrite current `parse_json`. Save the new shape under:

```text
parse_json.content_library_parse_v2
```

Then write normalized records into the new tables.

Expected parser output shape:

```json
{
  "content_classification": {
    "content_type": "torah_class",
    "domain": "torah",
    "primary_topic_slug": "torah.gemara.berachos",
    "secondary_topic_slugs": ["torah.hashkafa.yissurim"],
    "audience": ["parents", "students"],
    "confidence": 0.82,
    "review_flags": []
  },
  "segments": [
    {
      "start_time": "00:03:10",
      "end_time": "00:07:45",
      "title": "Why difficulty can become direction",
      "summary": "The class discussed hardship as guidance rather than only punishment.",
      "main_idea": "The Torah view of difficulty is not only pain management; it can become a framework for growth.",
      "punchline": "The question is not only why this happened, but what this is asking from me.",
      "supporting_points": [],
      "topic_slugs": ["torah.gemara.berachos", "torah.hashkafa.yissurim"],
      "claims": [
        {
          "claim_text": "The Gemara discusses yissurim as something that can be examined for meaning.",
          "claim_type": "torah",
          "source_required": true,
          "source_status": "source_missing",
          "suggested_source_lookup": "Find exact Sefaria reference for Berachos / yissurim."
        }
      ],
      "torah": {
        "area": "gemara",
        "masechta": "Berachos",
        "daf": null,
        "sefaria_refs": [],
        "source_sheet_needed": true
      },
      "research_next_steps": [
        "Find exact Gemara source in Berachos about yissurim.",
        "Create Sefaria source sheet with Gemara, Rashi/Tosafos if relevant, and one practical takeaway."
      ],
      "repurpose_angles": ["short_post", "newsletter_paragraph", "source_sheet"]
    }
  ]
}
```

For ADHD/science claims, require source type suggestions and cautious claim
strength handling:

```json
{
  "claim_text": "Food routine may affect attention and regulation in students with ADHD.",
  "claim_type": "science",
  "source_required": true,
  "source_status": "source_missing",
  "recommended_source_types": ["government_health_resource", "peer_reviewed_article"],
  "claim_strength": "weak",
  "medical_disclaimer_required": true
}
```

## Backend Filters

Extend `/api/bna/content-jobs` to support:

```text
q
status
content_type
domain
topic_slug
torah_area
masechta
parsha
halacha_area
science_domain
source_status
research_status
repurpose_status
audience
project
date_from
date_to
has_transcript
has_sources
needs_review
```

Use normalized tables for these filters. Existing status-only behavior must
continue to work.

## Operations UI

Replace rough display-only topic chips with taxonomy-driven chips and counts.
Regex topic inference may remain only as a fallback for old/unparsed items.

Add real filter groups:

```text
Content Type
Domain
Torah Area
ADHD / Science Topic
Source Status
Research Status
Repurposing Status
Audience
Project
Date
```

Add saved review queues:

```text
Needs Torah Source
Needs Sefaria Sheet
Needs Scientific Source
Needs Human Review
Ready to Repurpose
Ready to Publish
Published
```

Each content item/segment should expose:

```text
Punchline
Best quote
Main idea
Source status
Research tasks
WhatsApp angle
Facebook angle
YouTube Short angle
Newsletter angle
Internal doc angle
```

## Backfill

Add a repeatable backfill path that reads existing `transcript_text` and
`parse_json`, runs Content Library parser v2, stores
`parse_json.content_library_parse_v2`, writes normalized records, and can be
rerun safely without duplicating terms/segments/claims/tasks.

Start with local verification against existing transcript jobs. Do not run a
destructive production-wide rewrite without explicit approval.

## Acceptance Criteria

- Schema exists and is idempotently created on startup/migration.
- Seed taxonomy exists for Torah, ADHD, nutrition, parenting, education,
  operations, and repurposing.
- Existing content generation and prompt workflows still pass tests.
- A new parser stage extracts normalized segments, main ideas, punchlines,
  claims, source requirements, source statuses, research next steps, and
  repurposing angles.
- `/api/bna/content-jobs` supports the new filters without breaking old status
  filtering.
- Operations Content tab uses taxonomy/source/research/repurposing filters.
- Review queues can find practical examples such as:
  - Torah -> Gemara -> Berachos -> needs Sefaria source
  - ADHD -> diet/nutrition -> needs scientific source
  - Old video -> ADHD -> ready for YouTube Short
  - Class discussion -> punchlines available -> no source missing
  - One Time Mishnah Class -> source sheets needed
- Backfill can normalize existing content jobs safely.
- App-visible changes are deployed and verified through Railway doctor and live
  smoke before the task is marked done.

## Safety Notes

- Do not remove existing `parse_json` fields or class-session JSON fields in the
  first implementation pass.
- Do not treat NIMH/CDC/general pages as automatic proof for specific medical
  claims; science claims need source strength and cautious wording.
- Torah source outputs should use Sefaria refs/source sheets where possible and
  flag open points for Shloimie/rav review rather than presenting automated
  final psak.
- Content/task/student/accountability separation from the mixed-recording parser
  must remain intact.
