# Speaker Diarization For Class Recording Parser

## Why This Exists

The operator asked whether recordings can identify speaker names by voice when
multiple people talk together. A raw version of that question became live task
#99, which left the dashboard with natural-language wording and no owner.

## Current Answer

Speaker labeling is possible as a pipeline, but it should not be treated as
perfect automation yet. Overlapping classroom speech, short interjections, and
many boys talking at once will produce uncertain labels unless there is a
review step and/or labeled voice samples.

## Recommended Product Behavior

- Transcribe every uploaded audio/video file as usual.
- Add an optional diarization pass that splits the recording into speaker
  turns and labels speakers as `Speaker 1`, `Speaker 2`, etc.
- Let the operator manually map `Speaker 1` to a student when the label is
  clear.
- Store uncertain or overlapping speech as `unknown_speaker` instead of
  inventing a student name.
- Use confirmed speaker labels to improve accountability parsing, student
  question capture, and class discussion notes.
- Keep private student accountability out of public Content cards.

## Implementation Path

1. Add a `speaker_segments` JSON field or related table for content jobs.
2. Add a diarization adapter interface, even if the first implementation is
   disabled or mock-only.
3. Update mixed-recording parsing prompts to include confirmed speaker labels
   when available.
4. Add Operations UI review controls for mapping `Speaker N` to a student.
5. Add tests proving unknown speakers stay unknown and overlapping speech does
   not create false accountability records.

## Safety Rule

Never auto-assign a student name from voice alone unless the system has a
confirmed mapping or the operator explicitly labels that speaker. For messy
classroom audio, uncertainty is safer than a wrong private student record.
