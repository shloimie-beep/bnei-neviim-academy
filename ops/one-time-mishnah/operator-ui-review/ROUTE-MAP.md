# One Time Review Route Map

## Public And Entry Routes

| Area | Route | Expected Scope |
| --- | --- | --- |
| Landing | `/one-time` | One Time public/customer language |
| Operations login | `/operations-login.html` | Owner/admin login |
| Parent portal | `/parent.html` | Linked parent and child only |
| Student portal | `/student.html` | Own class/course/progress only |
| Provider portal | `/provider.html` | Rabbi/provider workspace |
| Classroom/library | `/one-time-classroom.html` | Member access code |

## Key API Smokes

| Area | Route |
| --- | --- |
| Health | `/health` or `/api/health` |
| Instance config | `/api/one-time/instance-config` |
| Integrations | `/api/bna/one-time/integrations/readiness` |
| Product/trial | `/api/bna/one-time/trial-referral-config` |
| Payment/access | `/api/bna/one-time/payment-access-class-links` |
| Vimeo/library | `/api/bna/rabbi/library-items` |
| Class/media | `/api/bna/one-time/classes` |
| Community | `/api/bna/one-time/community-moderation-readiness` |
| Study assistant | `/api/bna/one-time/study-assistant-readiness` |

## Expected Disabled/Held Actions

- Live email send.
- WhatsApp send.
- Stripe live charge.
- Real Zoom meeting creation.
- Vimeo automated upload.
- Sefaria/study assistant production answering.
- Hosted transcription until `REQ-20260621-902` credential is fixed.
