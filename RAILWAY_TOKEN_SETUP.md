# How to Create a PERMANENT Railway Token

## The Problem
The tokens you've been giving me expire quickly because they're OAuth session tokens.

## The Solution
Create a permanent API token from Railway dashboard:

### Step 1: Go to Railway Dashboard
1. Open https://railway.app/dashboard
2. Click on your **BNA project** (the one with bneineviimacademy.org)

### Step 2: Create Token
1. Click **Settings** (gear icon)
2. Click **Tokens** in left sidebar
3. Click **New Token**
4. Name: `bna-cli-token`
5. Select your BNA project
6. Click **Create**
7. **COPY THE TOKEN IMMEDIATELY** (it only shows once!)

### Step 3: Give Me the Token
Paste it here and I'll save it properly.

### Step 4: Verify It Works
I'll test it with:
```bash
railway variables --project <bna-project-id>
```

## Alternative: Use DATABASE_URL Directly

Since we only need database access, you could just give me the DATABASE_URL from Railway:

1. Railway Dashboard → BNA Project → Postgres
2. Click **Connect** tab
3. Copy the **Database URL**
4. Give it to me

This never expires and I can run migrations directly.

## What I've Built for Persistence

I've created `.secrets/railway-token.txt` but the real issue is the token TYPE.

Once you give me a proper API token (not OAuth), it will persist.
