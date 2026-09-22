# RAW-20260708-011 - OneTime Vimeo folder v1 studio workflow

## Metadata

| Field | Value |
|---|---|
| Raw ID | RAW-20260708-011 |
| Source | codex_chat |
| Captured at | 2026-07-08 |
| Workspace/project | `rabbi_sheller_provider` / `one_time_mishnah_class` |
| Parse status | registered |
| Requirement register | `tasks-pending/2026-07-08-onetime-vimeo-folder-v1-studio-workflow.md` |

## Raw intake

Okay, so I want you to work on the Vimeo folder. Right now I'm connected to Drive. I have a shared folder. What I want to happen, okay? I want, I have Drive hooked up on my computer. So what I want to do is to be able to, on my own laptop, really, not this, this is my desktop that I'm talking to now, Codex. The Codex on my laptop, I want to have the, like, desktop version of Drive. So I have my S. Dratler, it's shared. Basically, we should have access to this Drive folder. The one that you have access to is theacademy.org. That's the auth that you have, but I have it saved to my personal folder. And I think you should have access to that also, because, you know, the SDRatler at Gmail. So, basically, what I want to happen is to drop that, to drop a folder into my Drive, and that will, that folder will get sent to the studio, right? And I don't know if we need to use ReMotion, I don't know exactly what it is, but we're gonna have to have some static opener. And it's also, the main thing is that it's gonna have to cut. It's gonna have to cut all the weird stuff at the beginning, like when we're fixing the cameras, and at the end, right after the class, when the rabbi finishes the class, it should just cut it off. Let's just do that for version one. And then it has to go into Vimeo, and then it has to go into the, it needs to get transcribed, right? And it needs to be put into the system, like what they're up to. That's the latest upload. And then it needs to go to the student portal, and they're able to see the last class that just happened. And, you know, I think that's it for now. You know, there are other automations along the line, but the first thing is just to have it edited. Edit out the whole beginning, you know, the weird stuff at the beginning before we actually start the class, and at the end. And I'm also gonna be dropping in, no, I think that's good. We'll just drop in that for now. That's the last class. So I need you to set up that workflow with, yeah, set it up and let me know when it's ready to test. And you know what? You should test it yourself, man. You can even test that yourself. You can just drop in the video and see if the whole thing works, right? Pick a video from my computer, drop it in, and see if it goes there, and it gets transcribed properly. And whatever gets transcribed is the knowledge base of that bot, right? That's also a step in the process, that the bot needs to know what the deal is, right? And know what content and what class they're up to.

## Parsed source statements

| Statement ID | Source quote | Parsed meaning |
|---|---|---|
| SRC-20260708-011-001 | "work on the Vimeo folder" | Build the next One Time Vimeo/media folder workflow. |
| SRC-20260708-011-002 | "Drive hooked up on my computer" | Workflow should support a synced desktop Google Drive folder path, not only Drive API file IDs. |
| SRC-20260708-011-003 | "drop a folder into my Drive" | Operator wants folder-level drop intake. |
| SRC-20260708-011-004 | "folder will get sent to the studio" | Dropped folders should be processed into a studio/editing package. |
| SRC-20260708-011-005 | "static opener" | Edited output should be able to prepend a short One Time opener. |
| SRC-20260708-011-006 | "cut all the weird stuff at the beginning ... and at the end" | V1 must support trimming head and tail before upload/transcription handoff. |
| SRC-20260708-011-007 | "then it has to go into Vimeo" | Vimeo upload/import is desired, but remains external-write gated. |
| SRC-20260708-011-008 | "needs to get transcribed" | The processed class needs transcript metadata or a transcription handoff. |
| SRC-20260708-011-009 | "put into the system ... latest upload" | One Time class/session/library records should be prepared as latest class state. |
| SRC-20260708-011-010 | "go to the student portal" | Student/member visibility is expected after review/publish gates. |
| SRC-20260708-011-011 | "knowledge base of that bot" | Approved transcript/class context should feed the scoped One Time bot knowledge layer. |
| SRC-20260708-011-012 | "test it yourself" | Codex should run a synthetic local test without real external writes. |

