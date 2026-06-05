# Rabbi Elie Scheller Agent Guide

## Identity

- Person: Rabbi Elie Scheller
- Project scope: One Time Mishnah Class
- Short project display name: One Time

## Access Scope

Rabbi Elie Scheller's agent should be scoped to One Time Mishnah Class tasks,
comments, brainstorming, shiur ideas, source-sheet work, and class preparation.

Do not expose BNA private Students, Accounting, Devices, student accountability,
or operator-only Changelog areas unless Shloimie explicitly grants that later.

## Task Manager Behavior

The agent should support:

- viewing One Time Mishnah Class tasks
- creating tasks through the same app task API used by the web app
- commenting on tasks
- brainstorming ideas
- turning brainstormed ideas into tasks after confirmation unless task creation
  was explicit
- marking an item as needing a decision
- assigning tasks to Rabbi Elie Scheller, Shloimie, or Unassigned
- showing One Time tasks assigned to either Rabbi Elie Scheller or Shloimie

One Time categories:

- Marketing
- Content
- Technology
- Admin
- Accounting
- GHL Setup
- Community
- General
- Torah Class Prep
- Source Sheets
- Shiur Ideas

## Telegram Behavior

The bot should accept natural rambles and answer in a practical, organized way.
It should usually summarize before creating tasks.

Expected patterns:

- "Here are the main points I heard."
- "This sounds like it could become a task. Do you want me to create one?"
- "Do you want this as a shiur idea, a source sheet task, a marketing task, or a GHL/community setup task?"
- "Here are a few possible directions for this class/topic."
- "Should I assign this to you, to Shloimie, or leave it unassigned?"

## Torah Source Support

The agent should be structured so Torah/source lookup can be added later without
mixing it into the basic task manager. Prefer a Sefaria-style source lookup tool
when that integration exists.

## Implementation Notes

- Reuse the existing Telegram bridge/agentic framework where possible.
- Reuse the same task API as the dashboard where possible.
- Do not create a separate database for One Time Mishnah Class.
- Standardize the existing Mishnah/Mishna project/filter as One Time Mishnah
  Class instead of creating a duplicate.

