# RAW-20260706-002 - One Time Studio Sidekick And OpenArt MCP Scope

## Metadata

| Field | Value |
|---|---|
| Raw ID | RAW-20260706-002 |
| Source channel | codex_chat |
| Created at | 2026-07-06T06:42:21+03:00 |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-06-onetime-studio-sidekick-openart-mcp.md |

## Raw Intake

So right now what I'd like to do is to get the bot on the side the assistant basically hooked up to my computer but only scope for Corrections regarding this prompt you know the studio that we're going to set up for this guy which will be connected to the mCP which is basically just going to be focus and generating The Prompt storing The Prompt but also analyzing the images so if you uploads an image and says this guy needs a better hat or this isn't so realistic it should be able to you know actually change those prompts using like GPT 5.5 as opposed to codec so the same way that I have the ability with my own telegram bot to choose whether or not I'm using like codecs to open up a ticket or it's at actually just use him as a sidekick that's really what I'd like to have for him at least but it has to be scoped in terms of connecting to like the CLI and giving him the ability to make these Corrections and adjusting the prompt patching mechanism so it would just need to be scoped specifically to what he's able to do right he can't just say change the website it would just be changed how the prompt thing is working and then he'll have you know GPT 5.5 that'll actually make these really official prompts but he'll be able to upload the images and say like look at this like how would you describe this or this didn't come out so good let's let's change the prompt like this and it would be able to do that so he'll deal with like upload images and it would just hook up with the mCP so he'd be pretty much able to do everything via natural language and are bought so this is a big project because it hasn't worked so far the helper what would be how do we get this spot right the natural language but at least to work just for the studio part and fixing the studio part as well as actually utilizing the studio part so he'll be able to you know if there's some sort of bug he'll be able to say oh this isn't working and it will just fix it by itself and then he'll actually be able to utilize it

## Parsed Summary

- Build a narrow One Time Studio sidekick for the future AI Studio operator.
- Scope the sidekick to `rabbi_sheller_provider / one_time_mishnah_class`.
- Allow natural-language prompt generation, prompt storage, prompt patching, and image analysis for render correction.
- Use a hosted multimodal GPT-style model for image critique and prompt drafting, not Codex as the creative prompt writer.
- Connect the workflow to OpenArt MCP where feasible for generation/project/asset actions.
- Keep the operator out of broad website/admin changes.
- Treat app/code bugs as scoped evidence and Codex task handoffs unless a future approved self-fix lane is explicitly limited to Studio prompt/config surfaces.

## Safety Status

No assistant permission, OpenArt MCP connection, CLI access, Studio code change, account access, or external generation was performed by this capture.
