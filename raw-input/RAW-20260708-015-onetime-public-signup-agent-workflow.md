# RAW-20260708-015 - OneTime public signup capture and Agent Mode workflow testing

- Source channel: codex_chat
- Captured at: 2026-07-08T19:18:00+03:00
- Workspace: rabbi_sheller_provider
- Project: one_time_mishnah_class
- Privacy classification: internal_product_requirement
- Parse status: registered

## Raw Operator Text

Along with the WhatsApp we also need to just map out the form it should just be like a basically capture on the bottom with the just email so so that will go straight to the landing page the sign up now you're right in the landing page sign up now and that yellow bar should just be on the bottom before the next section the top toolbar is black with like a yellow outline and the logo is black black on white I want you to like test that whole workflow also I think actually we need agent mode prompts to check to test those workflows so what we're going to do for now is all of these things that we need to test an external workflow you need to create the exact template and sequence really simultaneous sequences for agent mode with our template that will go and drop it in the right place so like anytime we're updating like a bot we need to have those agent mode prompts and that's what's supposed to be displaying really in the decisions section right and the decision section or not decisions I don't know wherever you think makes the most sense for me to take that prompt and give it the age of both to finish up the front and the audit I mean really play right should be enough but agent mode I think for clicking on things is sometimes a lot better and checking flows so will you use agent mode but those prompts need to be like the perfect template so he'll know to come back and when I click copy copy the prom so then it tracks when I click copy and it automatically moves it over to like the next section whatever we have set up already it should just automatically move it to the next section so I don't click on that one twice and then the agent should come back and drop it in the right place

## Parsed Statements

- SRC-20260708-015-001: OneTime landing page needs a bottom signup capture with just email, labeled/signaled as Sign Up Now.
- SRC-20260708-015-002: The yellow bar should live at the bottom of the hero/before the next section, not as the top announcement.
- SRC-20260708-015-003: The top toolbar should be black with a yellow outline and the logo should render black on white.
- SRC-20260708-015-004: The public signup/WhatsApp workflow should be tested.
- SRC-20260708-015-005: Agent Mode prompts should be exact workflow templates for external/user-flow testing and should force proper dropoff reporting.
- SRC-20260708-015-006: Copying an Agent Mode prompt should be tracked and should move the prompt into a next/running section so the operator does not run the same prompt twice by mistake.

## Requirements Created

- REQ-20260708-071

## Decisions / Blockers

- Existing WhatsApp/WAPI external-send blockers remain active: no live WhatsApp send, credential write, or external provider mutation is allowed from this requirement.
