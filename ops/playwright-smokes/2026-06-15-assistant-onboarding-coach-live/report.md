# Assistant Onboarding Coach Live Smoke

Date: 2026-06-15
Target: https://bneineviimacademy.org/student/login?code=fixture-assistant-onboarding-coach

## Result

PASS. The student portal assistant opened, showed onboarding-oriented copy, and
submitted a student-scoped assistant request that was intercepted before any
live assistant write.

## Contract Checks

- PASS onboarding intent exists
- PASS onboarding coach metadata exists
- PASS onboarding tool call is logged
- PASS student onboarding topic exists
- PASS no ticket guard exists
- PASS student widget intro mentions daily checkoff

## Browser Checks

- PASS desktop: {"noHorizontalOverflow":true,"panelOpen":true,"replyText":"Hi, I'm the BNA learning helper. I can walk you through Today, goals, daily checkoff, questions, reflection, and how to message your rebbi or Shloimie.Walk me through today's check-inYes. Start with Today, pick one goal, use the daily checkoff, and write one honest reflection. I did not create a ticket or change a record yet."}
- PASS mobile: {"noHorizontalOverflow":true,"panelOpen":true,"replyText":"Hi, I'm the BNA learning helper. I can walk you through Today, goals, daily checkoff, questions, reflection, and how to message your rebbi or Shloimie.Walk me through today's check-inYes. Start with Today, pick one goal, use the daily checkoff, and write one honest reflection. I did not create a ticket or change a record yet."}

## Guardrails

All student portal data came from synthetic fixture responses. Assistant chat
requests were intercepted and fulfilled with a fixture response. No real
student checkoff, message, support ticket, profile write, email, WhatsApp,
Google/Drive action, Buffer/social action, connector write, or external CRM
write was performed.
