# Contact WAPI History Live Smoke

Date: 2026-06-15
Target: https://bneineviimacademy.org/operations?workspace=bna&view=contacts&section=parents

## Result

PASS. Authenticated Operations rendered Contacts parent and interested-parent cards with local WAPI/communication history matched by normalized phone/email/source context.

## Contract Checks

- PASS signup matcher exists
- PASS lead matcher exists
- PASS phone variants exist
- PASS email matcher exists
- PASS read-only guardrail exists
- PASS signup history marker exists
- PASS lead history marker exists
- PASS no-send guardrail text exists

## Browser Checks

- PASS parent card metrics: {"hasHistory":true,"hasGuardrail":true,"hasParentMessage":true,"hasParentBody":true,"hasWhatsappRead":true,"noHorizontalOverflow":true}
- PASS lead card metrics: {"hasHistory":true,"hasGuardrail":true,"hasLeadWhatsapp":true,"hasLeadEmail":true,"hasWhatsappDelivered":true,"noHorizontalOverflow":true}
- PASS mobile metrics: {"viewport":{"width":390,"height":900},"hasHistory":true,"hasGuardrail":true,"noHorizontalOverflow":true}
- PASS unexpected write requests after login: 0

## Screenshots

- desktop-parent.png
- desktop-lead.png
- mobile-lead.png

## Guardrails

The smoke used synthetic signups, leads, and communication records. No Whapi sync, WhatsApp send, broadcast, contact/tag update, external CRM write, Google/Drive action, Buffer/social action, portal message, or email send was triggered.
