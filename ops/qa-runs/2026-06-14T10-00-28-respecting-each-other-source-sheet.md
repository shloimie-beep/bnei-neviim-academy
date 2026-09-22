# Respecting Each Other Source-Sheet QA

Date: 2026-06-14T10:00:28+03:00

## Scope

Artifact:

- `content-memory/source-sheets/2026-06-14-respecting-each-other-rules-and-responsibility.md`

Purpose:

- Create a class-ready, topic-by-topic Sefaria-linked packet for the BNA
  respecting-each-other/rules/responsibility lesson.

## Source Coverage

Verified source themes:

- Hillel's reverse rule
- `ואהבת לרעך כמוך`
- kavod chaveircha
- tzelem Elokim
- loving the vulnerable/newer person
- ona'at devarim
- public embarrassment
- tochacha without shaming
- machlokes l'shem shamayim
- Beis Hillel's humility in disagreement
- Torah as pleasantness/peace

## Verification Commands

Completed:

- Extracted all `https://www.sefaria.org/...` links from the markdown packet
  using a Node `fetch` checker.
- Fetched each URL with redirects enabled and required HTTP 200/3xx.
- Scanned the new source-sheet/handoff files for replacement characters and
  mojibake markers.
- Checked local markdown links to related source sheets.
- Ran `git diff --check` on the touched files.

## Result

- PASS: 24/24 extracted Sefaria URLs returned HTTP 200.
- PASS: no replacement characters or mojibake markers were found in the new
  source-sheet/handoff files.
- PASS: 4/4 related local markdown links resolve.
- PASS: `git diff --check` reported no whitespace errors for the touched files.
- Note: PowerShell `Invoke-WebRequest` produced false-negative object-reference
  errors for direct page checks in this shell, so the final link verification
  used Node `fetch`.
