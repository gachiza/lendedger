# 🚀 Deploying LendLedger to Netlify (accessible from any device)

> **First time?** Start with [`README.md`](./README.md) — it has the quick prerequisites + local setup, plus a shorter version of this deploy guide. This file goes deeper on production concerns.

This guide walks you through deploying the Loan Tracker so it's reachable from any device on the internet via a permanent `*.netlify.app` URL (or your own custom domain).

> **Persistence note:** All loan records are stored in **PostgreSQL**, not in local files. As long as you connect the deployed app to a cloud PostgreSQL database (recommended: **Neon** — free tier, serverless, no cold starts), your records are **permanent and won't be lost** between deployments or device sessions.

---

## 1. Create a persistent cloud PostgreSQL database

The sandbox you used to build this app ran a local Postgres. For production you need a **cloud** Postgres. **Neon** is the easiest:

1. Go to <https://neon.tech> and sign up (GitHub login works).
2. Click **New Project** → give it a name like `lendedger` → region closest to your users.
3. Once created, copy the **connection string** (looks like `postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require`).
4. **Keep this string safe** — you'll paste it into Netlify in the next section.

Alternatives: Supabase, Railway, Render PostgreSQL, Aiven.

---

## 2. Push the code to GitHub

Netlify deploys directly from your GitHub repo.

```bash
# Inside your project folder
git init
git add .
git commit -m "Initial LendLedger commit"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/lendedger.git
git push -u origin main
```

**Important:** Make sure `.env` is in your `.gitignore` so your database credentials are never committed. The starter already ignores it.

---

## 3. Deploy on Netlify

1. Go to <https://app.netlify.com> and sign in with GitHub.
2. Click **Add new site** → **Import an existing project** → **GitHub**.
3. Pick the `lendedger` repository.
4. Netlify auto-detects the `netlify.toml` file, so the build settings are pre-filled:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Expand **Advanced build settings** → **Environment variables**, and add:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | *(paste the Neon connection string from step 1)* |

6. Click **Deploy site**.

The first deploy takes ~2–3 minutes. When it finishes you'll see a URL like:

```
https://quirky-name-123abc.netlify.app
```

That link works from **any device** — phone, tablet, laptop.

---

## 4. Push your schema to the cloud database

The deploy only runs `npm run build` — it doesn't migrate the DB. Run this once from your local machine:

```bash
# Install dependencies locally
npm install

# Point Drizzle at the CLOUD database (not the local one)
DATABASE_URL="postgresql://user:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require" \
  npx drizzle-kit push
```

This creates the `loans` table in Neon. From now on, every record you create from your phone or laptop is saved permanently in the cloud.

---

## 5. (Optional) Custom domain

1. In Netlify → your site → **Domain management** → **Add custom domain**.
2. Enter your domain (e.g., `lendedger.yourdomain.com`).
3. Update your domain's DNS to point at Netlify (they give you the exact records).
4. Netlify provisions a free HTTPS certificate automatically.

---

## 6. Making changes after deploy

Every `git push` to `main` triggers an automatic redeploy:

```bash
git add .
git commit -m "Add feature X"
git push
```

Netlify builds the new version and swaps it in ~90 seconds. **Your data in Neon is untouched** — deployments only replace code, never the database.

---

## Why Next.js on Netlify?

- **Yes, Next.js works great on Netlify.** The `@netlify/plugin-nextjs` plugin (already configured in `netlify.toml`) automatically converts Next.js App Router pages and API routes into Netlify Functions — no extra config.
- Server components, API routes (`/api/loans`, `/api/stats`), dynamic rendering — all supported.
- Free tier includes 100 GB bandwidth/month, 125K serverless function invocations/month.

---

## How records stay safe

| Concern | How it's handled |
|---|---|
| **Persistence** | Records live in Neon PostgreSQL, not on the Netlify server. |
| **Deploys** | Code is replaced, DB is unchanged. |
| **Multi-device access** | Every device hits the same API → same DB → same records. |
| **Backups** | Neon takes automatic daily backups (free tier) with point-in-time restore. |
| **Data loss risk** | Only if you manually run `DROP TABLE` or delete the Neon project. |

---

## Troubleshooting

**Site shows "Application error":**
- Check Netlify → **Deploys** → latest deploy → **Functions log**.
- Most common cause: `DATABASE_URL` not set in Netlify env vars.

**Can't connect to database:**
- In Neon → your project → **Settings** → **Networking** → add `0.0.0.0/0` to allowed IPs (Netlify IPs change).
- Ensure the connection string includes `?sslmode=require`.

**Schema not applied:**
- Re-run `npx drizzle-kit push` with the cloud `DATABASE_URL`.

---

## Quick reference

```
Live URL:     https://<your-site>.netlify.app
API base:     https://<your-site>.netlify.app/api
Dashboard:    https://<your-site>.netlify.app/
Records:      https://<your-site>.netlify.app/records
DB:           Neon PostgreSQL (external)
```

You're live. Open that URL from your phone — it works. 🎉
