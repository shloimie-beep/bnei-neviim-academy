# RAW-20260708-001 - Parent Trial Email, Vimeo, And Watch Tracking Continuation

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260708-001 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-08-parent-trial-email-vimeo-watch-continuation.md |
| Created at | 2026-07-08T00:00:00+03:00 |
| Privacy classification | private_internal_product_request |

## Raw Intake

The operator's Gmail address is redacted in this repo copy. The exact approved
recipient remains available only from the Codex chat context for the live send.

Hey man, I got a different question for you. I was rambling, I believe it was this chat, about a lot of things yesterday. I think it was this chat, and I noticed that some of the stuff you didn't do. Like, I just noticed one, that I wanted to get an email as a parent, as somebody who's like literally joining up to my S-D-R-A-T-L-E-R. Can you send me that email as if I just filled out the form, right? And I put in my [operator test Gmail redacted], and I wanna get like an access, I wanna get a login, I wanna be able to do it for my kid, set him up with a password. We also need like the amount of time that the kid watched. We're also tracking that, like what videos in the library he saw, what did he watch. Also, I give you permission to use Vimeo and import some of the stuff that's already in Vimeo, and organize it in a nice way. So I can go and actually see the classroom, like, pretend I'm an actual parent that just signed up. So, can you do that? And can you just check from my previous rambles in this chat whether everything was done?

## Initial Parse Summary

- Check the prior July 7 parent trial/login ramble and identify what was done, blocked, or missed.
- Send the operator an actual parent-style access email to the approved test parent email, redacted in repo, only through an auditable app flow.
- The email should feel like a new One Time parent signup/trial welcome, with a 30-day-starts-now framing and classroom/library access.
- The parent should be able to set a parent password, log into the parent view, and set/reset the child/student login password.
- The system should track library/classroom click/watch activity, including watched videos and watch time.
- Vimeo import/use is approved in principle, but credential/token/account and safe import behavior must still be checked before external Vimeo mutation.
- The parent should be able to see schedule/library/classroom as if newly signed up.

## Prior Register Cross-Reference

- Continues `RAW-20260707-011` / `REQ-20260707-111`, which was left as `Needs operator decision` for live parent email/access.
- Related to `REQ-20260707-113` and `REQ-20260707-114` for parent schedule/library/student login audit.
- Related to `REQ-20260702-108`, which still blocks real Vimeo/Zoom/Stripe/provider setup values.
