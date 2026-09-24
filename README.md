# LendLedger — Loan Tracker

A full-stack loan tracking app built with **Next.js 16 (App Router)**, **PostgreSQL**, and **Drizzle ORM**.

- 📊 Dashboard with totals (loaned, invested, balance)
- 📋 Records table with search, filters, and inline partial payments
- 🎨 Color-coded status: 🟢 Paid · 🟠 Pending · 🔴 Past Due
- 💰 UGX currency, auto-generated loan IDs (`LN-00001`)
- 🔐 Ready for Netlify deployment with persistent cloud PostgreSQL

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Running on your PC (local development)](#running-on-your-pc-local-development)
3. [Deploying to Netlify (production)](#deploying-to-netlify-production)
4. [Project structure](#project-structure)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Install these on your PC first:

| Tool | Version | Download |
|---|---|---|
| **Node.js** | 20 or newer | <https://nodejs.org/> (pick the LTS button) |
| **npm** | comes with Node.js | — |
| **Git** | any recent | <https://git-scm.com/downloads> |
| **PostgreSQL** | 14 or newer | see options below |

### PostgreSQL options (pick one)

- **Easiest (recommended for beginners):** [Postgres.app](https://postgresapp.com/) on macOS, or the official installer from <https://www.postgresql.org/download/>
- **Docker users:** run `docker run --name pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=app_db -e POSTGRES_USER=postgres -p 5432:5432 -d postgres:16`
- **No-install alternative:** skip local Postgres entirely and use a free Neon cloud database from the start (see [Deployment](#deploying-to-netlify-production))

Verify your installs work:

```bash
node --version    # v20.x or higher
npm --version     # 10.x or higher
git --version     # 2.x
psql --version    # 14.x or higher
```

---

## Running on your PC (local development)

### Step 1 — Get the project files onto your computer

If the project is in a zip, extract it. If it's in a Git repo, clone it:

```bash
git clone https://github.com/YOUR-USERNAME/lendedger.git
cd lendedger
```

Or just open a terminal and `cd` into the folder where you extracted the project.

### Step 2 — Install dependencies

```bash
npm install
```

This downloads Next.js, Drizzle, React, and everything else. Takes ~30–60 seconds.

### Step 3 — Start your local PostgreSQL

**macOS (Postgres.app):** just open the Postgres.app and click Start.

**Windows/Linux (installer):** PostgreSQL is usually running as a background service. Check with:

```bash
psql -U postgres -h 127.0.0.1 -c "SELECT 1"
```

If it asks for a password, the default is often `postgres` or the one you set during install.

**Docker:** run the one-liner from the prerequisites section.

### Step 4 — Create the database

Open a second terminal and run:

```bash
psql -U postgres -h 127.0.0.1 -c "CREATE DATABASE app_db;"
```

If it says `database "app_db" already exists`, that's fine — move on.

> **Different username or password?** Edit the connection string in the next step to match.

### Step 5 — Configure environment variables

Create a file named `.env` in the project root (same folder as `package.json`) with this content:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

Replace `postgres:postgres` with `YOUR_USER:YOUR_PASSWORD` if yours is different.

> ⚠️ **Never commit this file.** The `.gitignore` included with the project already excludes `.env`.

### Step 6 — Push the database schema

```bash
npx drizzle-kit push
```

This creates the `loans` table in your local Postgres. You should see `✓ Changes applied`.

### Step 7 — Start the app

```bash
npm run dev
```

You'll see output like:

```
▲ Next.js 16.x.x
- Local:   http://localhost:3000
✓ Ready in 2.3s
```

### Step 8 — Open the app

Open your browser and go to **<http://localhost:3000>**

That's it — you're running locally! 🎉

### Useful local commands

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Check code style |
| `npm run typecheck` | Type-check without building |
| `npx drizzle-kit push` | Push schema changes to the DB |
| `Ctrl+C` in the dev terminal | Stop the server |

---

## Deploying to Netlify (production)

This gives you a public URL like `https://your-app.netlify.app` that works from **any device** — phone, tablet, laptop — and keeps your records safe forever.

### Overview

```
   Your PC ──git push──▶ GitHub ──auto-deploy──▶ Netlify
                                                      │
                                                      ▼
                                                 Next.js app
                                                      │
                                                      ▼
                                              Neon PostgreSQL
                                             (permanent data)
```

### Step 1 — Create a free Neon PostgreSQL database

1. Go to <https://neon.tech> and sign up (GitHub login is fastest).
2. Click **New Project**.
3. Name it `lendedger`, pick the region closest to you, click **Create project**.
4. Copy the **connection string** from the dashboard. It looks like:
   ```
   postgresql://username:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require
   ```
5. **Save this string somewhere safe** (a password manager, not a text file on your desktop).

### Step 2 — Push your database schema to Neon

From your project folder, run this one command (replace with your actual Neon connection string):

```bash
DATABASE_URL="postgresql://username:password@ep-xyz.region.aws.neon.tech/neondb?sslmode=require" npx drizzle-kit push
```

You should see `✓ Changes applied`. Your `loans` table now lives in the cloud.

### Step 3 — Create a GitHub repository

1. Go to <https://github.com/new>
2. Name it `lendedger` (don't add README, `.gitignore`, or license — you already have them).
3. Click **Create repository**.

Then from your project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/lendedger.git
git push -u origin main
```

### Step 4 — Deploy on Netlify

1. Go to <https://app.netlify.com> and sign in with GitHub.
2. Click **Add new site** → **Import an existing project**.
3. Choose **GitHub**, authorize Netlify if asked, select the `lendedger` repo.
4. Netlify auto-detects `netlify.toml`. Confirm these settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. **Add the environment variable:**
   - Expand **Advanced build settings** → **Environment variables**
   - Click **Add variable**
   - Key: `DATABASE_URL`
   - Value: *(paste your Neon connection string from Step 1)*
6. Click **Deploy site**.

Wait 2–3 minutes. When it finishes, you'll see:

```
✅ Your site is live!
https://random-name-123abc.netlify.app
```

### Step 5 — Open from any device

That URL works from your phone, your laptop, your friend's tablet — anywhere with internet. **All devices share the same database**, so records stay in sync.

### Step 6 — (Optional) Custom domain

1. In Netlify → your site → **Domain management** → **Add custom domain**
2. Enter your domain (e.g., `lendedger.yourdomain.com`)
3. Update DNS records as Netlify instructs
4. Free HTTPS certificate is auto-provisioned

### Step 7 — Making changes later

Every time you push to GitHub, Netlify redeploys automatically:

```bash
# Make a change
git add .
git commit -m "Add new feature"
git push
```

**Your data is untouched** — only the code is replaced.

---

## Project structure

```
lendedger/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with sidebar
│   │   ├── page.tsx              # Dashboard (server component)
│   │   ├── records/
│   │   │   ├── page.tsx          # Records page (server component)
│   │   │   └── RecordsClient.tsx # Interactive table (client component)
│   │   ├── api/
│   │   │   ├── loans/route.ts    # GET list, POST create
│   │   │   ├── loans/[id]/route.ts # PATCH update, DELETE
│   │   │   ├── stats/route.ts    # Dashboard aggregations
│   │   │   └── health/route.ts   # Health check
│   │   └── globals.css           # Tailwind imports
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   ├── StatsCard.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── LoansTable.tsx
│   │   └── AddLoanModal.tsx
│   ├── db/
│   │   ├── index.ts              # Drizzle client
│   │   └── schema.ts             # Database schema
│   └── lib/
│       └── loans.ts              # Status, currency, date helpers
├── .env                          # Local env vars (git-ignored)
├── .gitignore
├── netlify.toml                  # Netlify config
├── drizzle.config.json           # Drizzle Kit config
├── package.json
├── tsconfig.json
├── next.config.ts
└── DEPLOYMENT.md                 # Expanded deploy guide
```

---

## Troubleshooting

### Local

| Problem | Fix |
|---|---|
| `psql: command not found` | Postgres isn't installed, or `psql` isn't in your PATH. Use Postgres.app (macOS) or reinstall. |
| `connection refused on 127.0.0.1:5432` | Postgres isn't running. Start Postgres.app / the Windows service / your Docker container. |
| `password authentication failed` | Edit `.env` and put the right user/password in `DATABASE_URL`. |
| `database "app_db" does not exist` | Run `psql -U postgres -c "CREATE DATABASE app_db;"` |
| `relation "loans" does not exist` | Run `npx drizzle-kit push` again. |
| `npm run dev` hangs | `Ctrl+C`, then try `rm -rf .next node_modules && npm install && npm run dev`. |
| Port 3000 in use | Kill the other process, or run `npm run dev -- -p 3001`. |

### Deployment

| Problem | Fix |
|---|---|
| Netlify: "Application error" | Check **Site settings → Deploys → Functions log**. Usually `DATABASE_URL` isn't set. |
| "Cannot connect to database" on Netlify | In Neon → **Settings → Networking**, allow `0.0.0.0/0` (Netlify IPs rotate). Ensure your connection string ends with `?sslmode=require`. |
| Schema not on cloud | Re-run `DATABASE_URL=<neon-url> npx drizzle-kit push`. |
| Deploy fails with build errors | Run `npm run build` locally first and fix any TypeScript errors before pushing. |
| Changes not showing live | Hard-refresh (`Cmd+Shift+R` / `Ctrl+Shift+R`) and check the latest deploy status in Netlify. |

### Data safety

- **Records live in PostgreSQL**, not in files — they survive deploys, restarts, and device changes.
- **Neon free tier includes automatic daily backups** with point-in-time restore.
- **Never run `DROP TABLE` or delete the Neon project** unless you want to lose data.

---

## Quick reference

| Environment | URL |
|---|---|
| Local dev | <http://localhost:3000> |
| Netlify production | `https://<your-site>.netlify.app` |
| API (either) | `<base>/api/loans` |
| Database | Local Postgres or Neon cloud |

Happy tracking! 💰
