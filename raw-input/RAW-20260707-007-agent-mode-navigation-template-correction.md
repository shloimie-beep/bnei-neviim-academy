# RAW-20260707-007 - Agent Mode Navigation Template Correction

Source: `codex_chat`

Captured at: `2026-07-07T14:11:30+03:00`

## Raw operator wording

Yeah, your prompt suck. I'll tell you why. Because you didn't tell him how to
navigate to the right pages. That's one issue. But while he's doing that, can
you keep on working on something else? Is that possible? What's the deal with
the emails? Did those emails work? Does the CRM work? Are we like in business
over here? There was something I was doing yesterday. Oh, the Stripe webhook.
Can you just give me the webhook to give Stripe so I can get that webhook key?
In terms of what else do I need to do? Yeah, I need to set up the Stripe stuff.

All right, I see you're doing the student go board. I'm just watching these
agents go and edit, man. You have to tell them exactly how to navigate to the
pages. They have to go and navigate to the pages themselves. So you say, click
over here and go over here, because I want them to view the one-time, you know,
the one-time thing, the Mishnah class, as the actual rabbi, and as the actual
student. And that's why they need to be able to navigate from the super admin,
and you have to tell them exactly how to navigate to it.

Also, it's important that we refine these agent mode prompts and they become
like, they become like a template, right? The exact pages that they have to
navigate, the style of these prompts as to how they navigate the pages, and how
you set up the exact instructions that if something goes wrong, they still have
to go and click into their little section and report that. So the whole thing
is autonomous. That's what we need to do. So it's not like they get frustrated
and just give up and print the results in the screen. No, they have to go and
report in that section so I don't have to copy and paste their answer back, and
then the agent fleet will just start working, and then I can just make a new
prompt based on the information, right? Or to see the corrections that are
done.

## Intake summary

The One Time Agent Mode prompts must become navigation-first templates. Agents
need exact click paths from Super Admin to the One Time workspace, Rabbi
provider portal, student view, classroom/member views, and Operations drop-off.
Failure to reach a page is not a reason to stop in chat; agents must save a
`BLOCKED` or `FAIL` result in the Operations drop-off with exact failure and
suggested correction.
