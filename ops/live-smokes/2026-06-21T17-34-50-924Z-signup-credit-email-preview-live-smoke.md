# Signup Credit Email Preview Live Smoke

- started_at: 2026-06-21T17:34:50.924Z
- app_url: https://bneineviimacademy.org
- signup_id: 12
- dry_run: true
- no_send: true
- recipient_count: 2
- payment_link_status: included
- body_contains_payment_link: true
- recipients_redacted: s***@gmail.com, a***@gmail.com

Guardrail: this smoke calls the admin resend endpoint with `dry_run:true`; it does not send email, create checkout/payment activity, write local rows, or touch external CRM/WhatsApp/Google/Buffer.
