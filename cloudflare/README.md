# Deploying to Cloudflare

Everything runs on Cloudflare's **free plan**: the public website, the content dashboard and the Content API. One command (or one button in GitHub) deploys all of it. The first time takes about 20 minutes, most of it setting up sign-in.

## What gets deployed

| Piece | Cloudflare product | What it does |
|---|---|---|
| **hai-site** | Worker with static assets | The public website. Reads published content straight from R2 |
| **hai-admin** | Worker with static assets, behind Cloudflare Access | The dashboard and the Content API (TypeScript). Only people you allow can sign in |
| **ContentStore** | Durable Object (SQLite) | Drafts, the media library and the release history |
| **hai-content** | R2 bucket | Published releases (`content/`), photos (`media/`) and upload originals (`uploads/`) |
| Photo sizes | Cloudflare Images | Makes the web sizes of uploaded photos |

```
visitor ──▶ hai-site ──▶ R2 (content/, media/)
               │ contact form
               ▼
editor ──▶ Access ──▶ hai-admin ──▶ ContentStore (drafts)  +  R2  +  Images
```

**Running cost: $0.** The free allowances are far above what a lab site uses: 100,000 requests a day, 10 GB in R2, and 5,000 photo sizes a month in Images (about 1,600 photo uploads). Past a limit, the affected part pauses until the next day or month. Cloudflare never charges without a paid plan.

## Before you start (once)

1. **A Cloudflare account** for the lab. Use a shared lab mailbox, not a personal one, so the account outlives any one member.
2. **R2**: Dashboard → **R2 object storage** → enable it. It's free at this size; Cloudflare may ask for a payment method anyway.

On your computer you need **Node 22**. Or skip that and [deploy from GitHub](#deploy-from-github).

## First deploy from your computer

**1. Install and sign in**

```bash
npm install
npx wrangler login          # opens the browser; approve access to the lab's account
```

**2. Deploy**

```bash
npm run cf:deploy
```

It takes about a minute and ends with your two addresses:

```
  Website    https://hai-site.<your-subdomain>.workers.dev
  Dashboard  https://hai-admin.<your-subdomain>.workers.dev
```

The website works right away. On the first visit, the API imports the site's existing news, publications, research themes and people, and publishes them.

The dashboard shows *"Sign-in isn't working yet"* until you do step 3. Until then, nobody can use it.

**3. Protect the dashboard**

a. Turn on Cloudflare Access for the dashboard: Dashboard → **Workers & Pages** → **hai-admin** → **Settings** → **Domains & Routes**. Next to the `workers.dev` address, enable **Cloudflare Access**. If this is the account's first time using Zero Trust, it asks you to choose a **team name** (e.g. `hai-lab`) and the **Free** plan (up to 50 people).

b. Choose who may sign in: Dashboard → **Zero Trust** → **Access** → **Applications** → the hai-admin application → **Policies**. Allow the editors' and admins' **emails**. Access emails them a one-time code to sign in; no passwords to manage.

c. On the same application, copy the **Application Audience (AUD) Tag**.

d. Put the team name and AUD tag in [`admin/wrangler.jsonc`](admin/wrangler.jsonc). Neither is secret:

```jsonc
"ACCESS_TEAM_DOMAIN": "hai-lab",                  // your team name
"ACCESS_AUD": "paste-the-application-aud-tag",
```

e. List who can publish and roll back in the `.env` file at the repository root. It's git-ignored: the repository is public, so people's addresses stay out of it. The deploy stores them as a Worker secret.

```bash
ADMIN_EMAILS=first.admin@example.org, second.admin@example.org
```

Everyone Access lets in can edit drafts. Only the people in `ADMIN_EMAILS` can publish and roll back. An admin must also be allowed in by the Access policy (step b).

f. Commit, then run `npm run cf:deploy` again. Sign in to the dashboard. The sidebar should show your email and role.

> Cloudflare renames dashboard menus from time to time. If a name above doesn't match, look for "Cloudflare Access" on the Worker's workers.dev setting, and "Application Audience (AUD) Tag" on the Access application.

**4. Contact form email (optional, recommended)**

Until this is done, contact-form messages are accepted but only written to the Worker's log. Mail goes through **Brevo's** email API, which has a free plan (300 emails a day).

a. Create a free account at [brevo.com](https://www.brevo.com).
b. **Senders, domains & dedicated IPs** → **Senders** → add the address the messages come from (e.g. the lab inbox `humanai@cse.mrt.ac.lk`) and click the link in the verification email.
c. **SMTP & API** → **API keys** → generate a key and add it to the `.env` file at the repository root:

```bash
BREVO_API_KEY=paste-brevo-key
```

d. If the sender isn't the lab inbox, set `MAIL_FROM_ADDRESS` in [`admin/wrangler.jsonc`](admin/wrangler.jsonc). Then run `npm run cf:deploy` and send yourself a message from the website's contact form.

## Deploy from GitHub

This needs nothing installed.

1. Do steps 3a–c (Access) and 4a–b (Brevo) above in the Cloudflare and Brevo dashboards. Commit the settings from 3d.
2. Create a Cloudflare **API token**: Dashboard → **My Profile** → **API Tokens** → **Create Token** → **Edit Cloudflare Workers** template, then add the account permission **Workers R2 Storage: Edit**.
3. In GitHub: **Settings** → **Environments** → **New environment** `cloudflare` → add these secrets:

   | Secret | Value |
   |---|---|
   | `CLOUDFLARE_API_TOKEN` | the token from step 2 |
   | `CLOUDFLARE_ACCOUNT_ID` | Dashboard → Workers & Pages → Account details (right-hand side) |
   | `ADMIN_EMAILS` | who can publish, comma-separated (step 3e) |
   | `BREVO_API_KEY` | optional, the Brevo key |

4. **Actions** → **Deploy to Cloudflare** → **Run workflow**. The log ends with the two addresses.

## Everyday use

- **Content** (news, publications, people, photos) is edited and published in the dashboard. No deploy needed.
- **Code or settings changes**: run `npm run cf:deploy` again, or the GitHub workflow. It's safe to repeat.
- **Try it locally** without any Cloudflare account: `npm run dev:local` (see the main README). Local photo processing only resizes: phone photos stored sideways stay sideways there. On Cloudflare they're turned upright.

## Custom domain

The `workers.dev` addresses work as they are. To use your own domain for the website, the domain must be on Cloudflare (added as a site, with Cloudflare's name servers). Then uncomment `routes` in [`site/wrangler.jsonc`](site/wrangler.jsonc), set the domain, and deploy. A subdomain of a university domain whose DNS Cloudflare doesn't manage (like `*.mrt.ac.lk`) can't be attached this way; ask the department's IT team about delegating it to Cloudflare.

## When something goes wrong

| Symptom | Where to look |
|---|---|
| Website shows no news or people after the first deploy | Open the website again after a minute. If the dashboard already had drafts before the first publish, the automatic import is skipped: publish from the dashboard |
| Dashboard: "Sign-in required" or "Sign-in isn't working yet" | Step 3 isn't finished: `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` must both be set, then deploy again |
| Sign-in page says a code was sent, but none arrives | The address isn't in the Access policy's **Include → Emails** (Access sends codes only to allowed addresses) |
| Signed in, but "Editor: drafts only" | The address isn't in `ADMIN_EMAILS` in `.env`. Add it and deploy again |
| Deploy fails on `ratelimits` | The plan doesn't offer the contact form's rate limit. Delete the `ratelimits` block from [`site/wrangler.jsonc`](site/wrangler.jsonc) and deploy again |
| A photo shows "failed" | Its reason is shown in the media library. If the free Images allowance is used up, retry it next month (admins: Retry) |
| Contact messages don't arrive | `npx wrangler tail -c cloudflare/admin/wrangler.jsonc` while sending one. "Brevo did not accept" means a wrong key or unverified sender |
| Anything else | Dashboard → Workers & Pages → **hai-admin** → **Observability** (logs) |

## How it fits together (for maintainers)

- **Code**: [`src/site.ts`](src/site.ts) and [`src/admin.ts`](src/admin.ts) (the Workers), [`src/content-store.ts`](src/content-store.ts) (the Durable Object), [`src/api/`](src/api/) (the Content API: content, publishing, media, contact, sign-in), [`scripts/deploy.mjs`](scripts/deploy.mjs) (the deploy).
- **Contract**: the API implements [`contracts/openapi.yaml`](../contracts/openapi.yaml), with the same responses and error codes as the Java service it replaced. That service is still in [`services/content-api`](../services/content-api) but is not deployed.
- **State**: one Durable Object instance holds every record in SQLite. Saves are version-checked and publishes take a lock inside that single instance, so two editors can't overwrite each other or publish at the same time.
- **Publishing** writes every release file to R2 first and switches `content/current.json` last, so visitors never see a half-published site. Rollback only moves that pointer.
- **Sign-in**: Access puts a signed token in the `Cf-Access-Jwt-Assertion` header. The Worker checks it itself (signature, issuer, audience, expiry), so it never relies on Access alone.
- **Tests**: `npm test -w @hai/cloudflare`. They include the Java service's tests, ported, and a round trip proving the published files match the website's original data exactly.
