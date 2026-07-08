# FakeIntellect — Vercel Deployment Guide

## What this does

- **Angular SPA** → Vercel CDN (static, globally cached)
- **Fastify API** → Vercel Serverless Function at `/api/*`
- **PostgreSQL** → Neon (serverless Postgres, Vercel integration)
- **Firebase RTDB** → unchanged, already cloud

---

## Step 1 — Neon Database (replaces local PostgreSQL)

Neon is serverless Postgres — it's the right choice for Vercel because it:
- Supports connection pooling via PgBouncer (fixes the serverless pool problem)
- Has a free tier generous enough for launch
- Installs into Vercel with one click

1. Go to [neon.tech](https://neon.tech) → **Sign up / Log in**
2. Create a new project → name it `fakeintellect`
3. Choose region closest to your users (e.g. `US East`)
4. Once created, go to **Connection Details**
5. Copy the **Pooled connection string** (not the direct one) — it looks like:
   ```
   postgresql://fakeintellect_user:xxxx@ep-xxx-xxx.pooler.neon.tech:5432/fakeintellect?sslmode=require
   ```
   This is your `DATABASE_URL`. Keep it.

6. Run migrations on Neon (from your local machine):
   ```bash
   # Temporarily set the Neon URL in your .env
   echo "DATABASE_URL=postgresql://..." > apps/api/.env

   cd ~/develop/miloseng/fakeintellect.ca
   npm run migrate --workspace=apps/api
   npm run seed --workspace=apps/api
   npm run seed:posts --workspace=apps/api  # if you added seed-posts.ts
   ```

---

## Step 2 — Push to GitHub

Vercel deploys from git. If you haven't already:

```bash
cd ~/develop/miloseng/fakeintellect.ca
git init                          # if not already a git repo
git add .
git commit -m "feat: initial fakeintellect.ca build"

# Create a repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/fakeintellect.ca.git
git push -u origin main
```

---

## Step 3 — Create Vercel Project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Click **Import Git Repository** → connect your GitHub account
3. Find and select `fakeintellect.ca`
4. On the **Configure Project** screen:

   | Setting | Value |
   |---------|-------|
   | Framework Preset | **Other** |
   | Root Directory | `.` (leave as root) |
   | Build Command | `npm run build --workspace=packages/shared-types && npm run build --workspace=apps/web` |
   | Output Directory | `apps/web/dist/web/browser` |
   | Install Command | `npm install` |

5. **Do NOT click Deploy yet** — add environment variables first.

---

## Step 4 — Environment Variables

In the Vercel project → **Settings → Environment Variables**, add all of these.
Set **Environment** to `Production, Preview, Development` for each.

### API (Server-side)

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon pooled connection string from Step 1 |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `https://fakeintellect.ca,https://www.fakeintellect.ca` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | The full JSON from your Firebase service account key (one line, minified) |
| `FIREBASE_DATABASE_URL` | `https://fakeintellect-default-rtdb.firebaseio.com` |
| `JWT_SECRET` | A 64-character random string (`openssl rand -base64 48`) |
| `LOG_LEVEL` | `info` |

### Firebase Service Account JSON
Go to Firebase Console → Project Settings → Service Accounts → **Generate new private key**.
Download the JSON file, then minify it (remove all whitespace):
```bash
cat firebase-service-account.json | tr -d '\n ' | pbcopy  # macOS
cat firebase-service-account.json | tr -d '\n ' | xclip   # Linux
```
Paste the single-line result as the value for `FIREBASE_SERVICE_ACCOUNT_JSON`.

---

## Step 5 — Deploy

Back on the Vercel project page, click **Deploy**.

Watch the build logs. Expected sequence:
```
Installing dependencies... ✓
Building shared-types...   ✓
Building Angular app...    ✓
Deploying functions...     ✓
```

If successful, Vercel gives you a URL like `fakeintellect-ca.vercel.app`.

Test the API is working:
```bash
curl https://fakeintellect-ca.vercel.app/health
# {"status":"ok","timestamp":"...","service":"fakeintellect-api"}

curl https://fakeintellect-ca.vercel.app/api/v1/posts?pageSize=2
# {"data":[...],"pagination":{...}}
```

---

## Step 6 — Connect fakeintellect.ca Domain

### In Vercel
1. Project → **Settings → Domains**
2. Add `fakeintellect.ca`
3. Add `www.fakeintellect.ca`
4. Vercel shows you DNS records to add

### In GoDaddy (your registrar)
Go to GoDaddy → DNS Management for `fakeintellect.ca`:

**Option A — Use Vercel's nameservers (recommended, easiest):**
Change the nameservers to:
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```
Vercel manages everything including SSL. Propagation takes 1–48 hours.

**Option B — Keep GoDaddy DNS, add CNAME/A records:**

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

SSL is auto-provisioned by Vercel once DNS propagates.

---

## Step 7 — Verify Everything

Once DNS propagates:

```bash
# Health
curl https://fakeintellect.ca/health

# Posts API
curl https://fakeintellect.ca/api/v1/posts

# Tags
curl https://fakeintellect.ca/api/v1/tags

# SPA routing (should return Angular's index.html, not 404)
curl -I https://fakeintellect.ca/posts/some-slug
```

---

## Ongoing Deploys

Every `git push` to `main` triggers a Vercel deploy automatically.
For preview branches: any branch push creates a `branch-name.fakeintellect-ca.vercel.app` URL.

```bash
# Deploy from local without pushing (useful for testing)
npx vercel --prod
```

---

## Troubleshooting

### Build fails: "Cannot find module @fakeintellect/shared-types"
The build command must build shared-types first. Check the build command is exactly:
```
npm run build --workspace=packages/shared-types && npm run build --workspace=apps/web
```

### API returns 500: "DATABASE_URL is required"
The `DATABASE_URL` env var isn't set. Check Vercel → Settings → Environment Variables.

### API returns 500 on database queries
Verify the Neon connection string uses the **pooled** URL (contains `.pooler.neon.tech`), not the direct URL.

### Angular routes return 404
The SPA rewrite in `vercel.json` should handle this. Verify the file is committed to your repo root.

### Firebase not working (realtime stats)
Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is valid minified JSON (no newlines). Test locally:
```bash
echo $FIREBASE_SERVICE_ACCOUNT_JSON | python3 -m json.tool > /dev/null && echo "valid"
```

---

## Cost at Launch

| Service | Free Tier | Paid Threshold |
|---------|-----------|----------------|
| Vercel | 100GB bandwidth, unlimited deploys | ~$20/mo Pro |
| Neon | 0.5GB storage, 190h compute/mo | ~$19/mo Scale |
| Firebase RTDB | 1GB storage, 10GB/mo transfer | Pay-as-you-go |

A new blog comfortably runs within free tiers for months.
