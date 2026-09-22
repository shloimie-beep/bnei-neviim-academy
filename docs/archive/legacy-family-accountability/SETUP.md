# Setup Guide — Family Accountability App

Follow these sections in order. Sections marked **[Ahuva]** can be forwarded to her directly.

---

## 1. Supabase project

1. Go to https://supabase.com → sign in (or create account)
2. New project → name: `family-accountability`, region: closest to Israel (eu-central-1 or eu-west-1)
3. Set a strong DB password, save it
4. Once provisioned (~2 min), go to SQL Editor
5. Paste contents of `supabase-schema.sql` from this folder, run it
6. Go to Project Settings → API → copy:
   - `Project URL` → save as `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → save as `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose to client)
7. Storage → New Bucket → name: `proofs`, private (not public)

## 2. Resend account (email)

1. Go to https://resend.com → sign up
2. Add domain → use `family.webcraftmedia.digital` (or similar subdomain Shloimie controls)
3. Add the DNS records Resend gives you in your domain registrar
4. Wait for verification (~5 min)
5. API Keys → Create → save as `RESEND_API_KEY`
6. Set sender email in env: `EMAIL_FROM="Family Accountability <noreply@family.webcraftmedia.digital>"`

If domain verification is slow, ship V1 using the Resend onboarding sandbox sender — but only Shloimie's verified test address will receive. Switch to the real domain before going live with Ahuva.

## 3. Telegram bot (the parent control surface)

### 3a. Create the bot

1. On Telegram, search `@BotFather` → start chat
2. Send `/newbot`
3. Choose a name: `Dratler Family Accountability`
4. Choose a username ending in `_bot`, e.g. `dratler_family_bot`
5. BotFather replies with an HTTP API token like `1234567890:ABC...` → save as `TELEGRAM_BOT_TOKEN`

### 3b. Get your own chat_id

1. Find your new bot in Telegram (search by username)
2. Send it any message (e.g. "hi")
3. Visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` in a browser
4. Find your `chat.id` in the JSON response (a number like `123456789`)
5. Save as `TELEGRAM_CHAT_ID_SHLOIMIE`

### 3c. **[Ahuva]** Get Ahuva's chat_id

Forward this section to her:

> Hi Ahuva — quick 2-minute setup for the family accountability bot.
>
> 1. Open Telegram on your phone.
> 2. In the search bar, search for `@dratler_family_bot` (Shloimie will confirm the exact name).
> 3. Tap **Start** to begin the chat.
> 4. Send any message, like "hi".
> 5. Then tap on the bot's name at the top of the chat → it should show a "Bot info" screen. **Do not need this part actually** — Shloimie will pull your ID from the bot's logs once you've messaged it.
>
> That's it. Once you send the first message, Shloimie can finish the setup. Reply here when you've done step 4 so he knows to look for you.

After Ahuva messages the bot, Shloimie revisits `https://api.telegram.org/bot<TOKEN>/getUpdates` → finds her chat.id → saves as `TELEGRAM_CHAT_ID_AHUVA`.

### 3d. Set the webhook (after deploy)

Once Railway gives you the deployed URL (step 5):

```
curl -F "url=https://YOUR-RAILWAY-URL/api/telegram/webhook" \
     -F "secret_token=YOUR_WEBHOOK_SECRET" \
     https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook
```

Replace `YOUR_WEBHOOK_SECRET` with a long random string, save it as `TELEGRAM_WEBHOOK_SECRET` in env.

## 4. Environment variables

Copy `.env.example` to `.env.local` and fill in all values from the steps above. Required:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend
RESEND_API_KEY=
EMAIL_FROM=
EMAIL_TO_AHUVA=ahuvadratler@gmail.com
EMAIL_CC_SHLOIMIE=

# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID_SHLOIMIE=
TELEGRAM_CHAT_ID_AHUVA=
TELEGRAM_WEBHOOK_SECRET=

# Cron auth
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://your-railway-url.up.railway.app
KID_NAMES=Menachem,Esther
KID_PINS_HASH_MENACHEM=  # bcrypt hash of 4-digit PIN
KID_PINS_HASH_ESTHER=    # bcrypt hash of 4-digit PIN
PARENT_EMAILS=shloimie@example.com,ahuvadratler@gmail.com
```

To generate a PIN hash, run in the project root after setup:

```bash
node -e "console.log(require('bcryptjs').hashSync('1234', 10))"
```

(Replace `1234` with the actual PIN you'll give each kid.)

## 5. Railway deploy

1. Go to https://railway.app → New Project → Deploy from GitHub repo
2. Connect the new repo Claude Code creates
3. Add all env vars from step 4 in Railway → Variables
4. Deploy
5. Once live, copy the URL → update `NEXT_PUBLIC_APP_URL` in env and redeploy
6. Run the Telegram webhook command from step 3d

### 5a. Cron for daily email

In Railway → your service → Settings → Cron Jobs:

- Name: `daily-summary`
- Schedule: `0 19 * * *` (19:00 UTC = 22:00 Israel during DST, 21:00 standard time — adjust seasonally if it matters)
- Command: `curl -H "Authorization: Bearer $CRON_SECRET" $NEXT_PUBLIC_APP_URL/api/cron/daily-summary`

## 6. Install on the kids' tablets

After deploy, each tablet:

### Esther (iPad)

1. Open Safari on her iPad
2. Visit `https://your-railway-url.up.railway.app`
3. Tap the Share button → Add to Home Screen → name: "Yedi'os" or "Accountability"
4. The icon now lives on her home screen and opens like a real app
5. First open: tap her name, enter her PIN

### Menachem (Android)

1. Open Chrome on his tablet
2. Visit `https://your-railway-url.up.railway.app`
3. Tap the three-dot menu → Add to Home screen → confirm
4. The icon now lives on his home screen
5. First open: tap his name, enter his PIN

## 7. **[Ahuva]** Install on Ahuva's tablet

Forward this to her:

> 1. On your tablet, open the browser.
> 2. Go to: `https://your-railway-url.up.railway.app/parent` (Shloimie will send you the exact link).
> 3. Enter your email — you'll get a magic link to sign in.
> 4. Once signed in, tap the browser menu → Add to Home Screen (same as installing an app).
> 5. You'll get a daily summary email at 10pm anyway, but the app lets you tap in anytime.

## 8. Daily flow once everything is live

- **Family meeting** (whenever you have one): Shloimie opens the parent dashboard, taps "Start new meeting" for each kid, enters the goals they agreed on.
- **During the day**: kids check off goals on their tablets. Each check-off pings the Telegram bot. Either parent can Approve / Reject from Telegram.
- **22:00 Israel time**: daily summary email lands in Ahuva's inbox.

## 9. Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Kid PIN not working | Bcrypt hash mismatch | Re-generate hash, redeploy |
| Telegram bot silent | Webhook not set or secret mismatch | Re-run step 3d, check Railway logs |
| Email not arriving | Resend domain not verified, or rate limit | Resend dashboard → Logs |
| Photos not uploading | Supabase Storage bucket name wrong, or RLS policy missing | Check bucket exists, check policies in schema.sql |
| Hebrew text reversed | Missing `dir="rtl"` on the locale root | Verify in `app/layout.tsx` |
