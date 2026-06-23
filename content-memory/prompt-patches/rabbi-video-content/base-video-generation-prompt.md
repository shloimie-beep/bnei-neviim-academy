# Base Rabbi Video Generation Prompt

Use this base prompt after selecting a patch stack from `library.json`.

## Variables

- `topic`: the shiur, Mishnah, source, parent-facing point, or clip idea
- `audience`: parents, boys, old customers, YouTube viewers, or ad prospects
- `platform`: Shorts/Reels/status, YouTube, feed ad, website, or internal draft
- `duration`: target runtime
- `source_context`: transcript excerpt, Rabbi notes, source-sheet notes, or
  existing storyboard

## Prompt

Create a video-generation or video-planning prompt for One Time Mishnah Class
content with Rabbi Elie Scheller.

Topic: `{{topic}}`
Audience: `{{audience}}`
Platform: `{{platform}}`
Duration: `{{duration}}`
Source context: `{{source_context}}`

Apply the selected prompt patches exactly. Keep the result practical for either
AI video generation, Remotion planning, or a CapCut handoff.

Return:

1. One final generation prompt.
2. A shot list with timestamps or shot durations.
3. Aspect ratio and safe crop notes.
4. Camera angle notes.
5. Jewish visual/thematic notes.
6. Negative prompt / avoid list.
7. Review flags for any Torah source, claim, or public promise that needs Rabbi
   or Shloimie approval before publishing.

Do not invent sources, students, testimonials, or business promises.
