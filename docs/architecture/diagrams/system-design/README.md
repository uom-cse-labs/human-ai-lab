# System design diagrams: redraw brief

The figures in this folder were drawn for the earlier **AWS** design. The platform now runs on **Cloudflare's free plan** (see [`cloudflare/README.md`](../../../../cloudflare/README.md)), so most of them are out of date. This brief describes every figure that needs redrawing: every box, arrow, label and note. It is written so the figures can be redrawn precisely without reading the code.

| # | File | Action |
|---|---|---|
| 1 | `01-use-cases.png` | Edit |
| 2 | `02-architecture.png` | **Redraw** |
| 3 | `03-domain-model.png` | Small edit |
| 4 | `04-sd1-visitor-views-page.png` | Edit |
| 5 | `05-sd2-editor-signs-in.png` | **Redraw** |
| 6 | `06-sd3-editor-uploads-media.png` | **Redraw** |
| 7 | `07-sd4-admin-publishes.png` | Edit |
| 8 | `08-sd5-admin-rolls-back.png` | Edit |
| 9 | `09-sd6-visitor-contact.png` | Edit |
| 10 | `10-aws-deployment.png` → **`10-cloudflare-deployment.png`** | **Replace** (new file name; update the link in `system-design.md`) |
| 11 | `11-security-model.png` | **Redraw** |
| 12 | `12-roadmap.png` | **Redraw** (needs dates from the project owner) |

Even for "Edit" figures, the full description is given below, so each figure can be redrawn from scratch.

---

## General rules for every figure

**Keep the current visual style** so the new figures sit well beside the unchanged ones:

- Clean, flat, light background; rounded boxes; the same sans-serif font; title at the top in bold navy, subtitle below in grey.
- **Arrow colours** (use the same meaning in every figure):
  - **Teal, solid**: visitor path.
  - **Navy, solid**: editing / API path.
  - **Grey, dashed**: background or internal call.
  - **Grey, dotted**: deployment.
  - **Red, dashed**: refused or error path.
- Sequence diagrams: lifelines are dashed vertical lines under a box; activation bars are thin light-blue rectangles; `alt` / `else` frames have a small tab label; a pale yellow **Result** note sits at the bottom.
- PNG, about **1540 px wide**, same aspect ratios as the current files. Keep the existing file names (except figure 10) so the links in `system-design.md` keep working.

**Words to use** (be consistent):

| Say | Not |
|---|---|
| Cloudflare Worker | Lambda, ECS, Fargate, server |
| `hai-site` (public website Worker), `hai-admin` (dashboard Worker) | CloudFront distributions |
| Cloudflare Access | Cognito |
| Content Store (Durable Object, SQLite) | DynamoDB, Content Database |
| R2 bucket `hai-content` | S3 buckets |
| Cloudflare Images | MediaConvert, media processor Lambda |
| Brevo (email API) | SES |
| emailed one-time code | password, MFA app, TOTP |

**Things that do not exist and must not appear:** WAF, CloudFront, VPC, load balancer, API Gateway, IAM, AWS accounts, CloudTrail, SNS/SQS/EventBridge, ECR, Route 53, ACM, staging environment, CDK. Also no "refresh CDN cache" step anywhere: nothing is cached at the edge.

**Planned but not built yet** (slots and placements, video, user management inside the dashboard, audit log): where a figure shows them, draw them **greyed out with a small "planned" tag**. Do not delete them, and do not draw them as working.

---

## Facts the figures rely on

Use these exact values; they are what the deployed system does.

**Addresses**
- Website: `hai-site.<account>.workers.dev` (later the lab domain).
- Dashboard: `hai-admin.<account>.workers.dev`, a separate address.

**Website Worker (`hai-site`)** handles, in order:
1. `/content/*` and `/media/*`: reads the file from R2 and returns it.
2. `POST /api/contact`: rate limit of **5 messages per minute per IP address**, then passes the message to the dashboard Worker over an **internal service binding** (not over the internet).
3. Any other `/api/*`: refused (404).
4. Everything else: the website's static files (React app, logos, photos bundled with the site), served by Cloudflare **without running Worker code**.

**Dashboard Worker (`hai-admin`)**, behind **Cloudflare Access**:
1. `/api/*`:
   - checks the Access token itself (signature, issuer, audience, expiry);
   - works out the role (**admin** if the email is in the `ADMIN_EMAILS` secret, otherwise **editor**);
   - passes the request to the **Content Store**.
2. `/content/*`, `/media/*`: reads from R2, for previews.
3. `POST /api/contact`: the contact form (validation, then Brevo).
4. Everything else: the dashboard's static files.

**Content Store**
- One **Durable Object with SQLite**. It holds drafts (content items), media records and the release history.
- One instance only, so saves are version-checked exactly and publishing uses a lock.

**R2 bucket `hai-content`**, private (no public address; only the two Workers can reach it):
- `content/current.json`: the pointer to the live release.
- `content/releases/<release-id>/news.json`, `publications.json`, `themes.json`, `members.json`.
- `media/<media-id>/<width>.<jpg|png|webp>`: photo sizes.
- `uploads/<media-id>/original`: uploaded originals, private, never served.

**Caching**
- `current.json` is re-checked on **every** page load.
- Release files are cached by the **browser** for a year (they never change).
- Photo sizes are cached for a day.

**Cloudflare Images**
- Makes sizes **480, 960 and 1600 px wide**, never larger than the original.
- Keeps the original format (JPEG, PNG or WebP), quality 85.
- Turns phone photos upright.
- Location and camera data are removed.
- **5,000 sizes a month free.**

**Uploads**
- Allowed: JPEG, PNG, WebP; up to 25 MB and 50 megapixels. Videos are refused with a message.
- The file goes **through the API**. Its real type is checked from its contents.

**Sign-in**
- Cloudflare Access with **one-time PIN**: enter email, receive a 6-digit code, enter it. No passwords.
- Only emails listed in the Access policy get a code. Session lasts 24 hours.

**Contact form**
- Validated: name 1–200 characters; email valid; subject up to 200; message 1–5000.
- A hidden **honeypot** field: if filled, the message is silently accepted and dropped.
- Line breaks are removed from name and subject.
- Sent through **Brevo** to the lab inbox, with **reply-to** set to the visitor. Nothing is stored.
- Without a Brevo key, messages are only written to the log.

**Deploying**
- `npm run cf:deploy` from a computer, or the **Deploy to Cloudflare** GitHub Actions workflow (Cloudflare API token).
- **One environment** (production).

**Cost:** **$0 a month**, on free allowances.

---

## Figure 1: Use cases (`01-use-cases.png`) · Edit

Title **"Human-AI Lab Platform — Use Cases"**, subtitle "Public website, content dashboard and background services". Same layout as today.

**Actors (left side):**
- **Visitor**, with a note: "No sign-in required. Read-only, plus the contact form."
- **Editor**
- **Admin**, with a hollow-triangle "inherits" arrow up to Editor.

**System boundary "HAI Platform"** with three coloured bands and a grey "Included Use Cases (Internal Services)" column on the right.

**Band "Public website (Visitor)" (light blue):**
- Browse pages
- Read news & projects
- View members & publications
- Watch videos, view galleries: mark **planned**
- Send a contact message

**Band "Content dashboard (Editor)" (light green):**
- **Sign in with email code** (was "Sign in with MFA")
- Create & edit drafts
- Upload photos & videos: "videos" part marked **planned**
- Add alt text & captions
- Place media in page slots: **planned**
- Preview changes

Replace the note "Files upload directly to storage…" with: **"Files are uploaded through the API and checked before use. Alt text is required before a photo can be published."**

**Band "Administration (Admin)" (light orange):**
- Publish a release
- Roll back a release
- Unpublish or delete content
- Delete unused media
- Retry failed media processing
- Invite & manage users: change the label to **"Manage who can sign in (in Cloudflare Access)"**
- View audit log: **planned**

Keep the note: "Only Admins can publish. Visitors only ever see published releases."

**Included use cases (grey column):**
- Process media (resize images; transcode video **planned**)
- Validate content
- Build release snapshot
- Record audit event: **planned**
- **Remove "Refresh CDN cache"**

Arrows as today:
- «include» from Upload to Process media;
- «extend» (when processing failed) from Retry to Process media;
- «include» from Publish and from Roll back to Validate content / Build release snapshot.

**External systems (right side):**

| Box | Connected to |
|---|---|
| «system» **Email Service (Brevo)** (was SES) | Send a contact message |
| «system» **Cloudflare Images** (was Media Processor) | Process media |
| «system» **Identity Provider (Cloudflare Access)** (was Cognito) | Sign in, and Manage who can sign in |

Legend unchanged.

---

## Figure 2: High-level architecture (`02-architecture.png`) · Redraw

Title **"Human-AI Lab Platform — High-Level Architecture"**, subtitle "How the public website, the content dashboard and the backend fit together".

Five horizontal bands, top to bottom, labelled on the left, plus an **External** column on the right.

**Band 1, Users (grey):**
- **Visitors**: "Public audience"
- **Editors & Admins**: "Invited lab members, email sign-in"

**Band 2, Edge & Security (light blue):** two boxes side by side.

| Box | Label | Note beside it |
|---|---|---|
| Left | **Cloudflare network** / "HTTPS · global · DDoS protection" | none |
| Right | **Cloudflare Access** / "Sign-in gate for the dashboard: allowed emails only, emailed one-time code" | "Only people in the Access policy reach the dashboard. The storage has no public address." |

**Band 3, Applications (white):**
- **Public Website**: "React · static pages", served by Worker **hai-site**
- **Admin Dashboard**: "React · manage content & media", served by Worker **hai-admin**

**Band 4, Services (light teal):**
- **Content API**: "TypeScript · runs in the hai-admin Worker · drafts, publishing, media, contact form, sign-in check".
- **Cloudflare Images**: "Resizes photos · strips location data".
- There is **no** separate Identity service box: Access is in Band 2.

**Band 5, Data (light yellow):**

| Box | Label |
|---|---|
| **Content Store** | "Durable Object · SQLite · drafts, media records, release history" |
| **Published Content** | "R2 · immutable releases + current pointer (what visitors see)" |
| **Media Library** | "R2 · processed photos" |
| **Upload Inbox** | "R2 · original uploads, private" |

Draw Published Content, Media Library and Upload Inbox as three compartments of one outline labelled **"R2 bucket hai-content (private)"**.

**External column (dashed outline):**
- **Lab Email Inbox**, reached through a small box **Brevo (email API)**.
- **GitHub · deploy**: "npm run cf:deploy or GitHub Actions".

**Arrows**

Teal (visitor path):
- Visitors → Cloudflare network: "browse".
- Cloudflare network → Public Website: "pages".
- Public Website → Published Content: "content (read)".
- Public Website → Media Library: "photos (read)".
- Public Website → Content API: "contact message (rate-limited, internal link)".

Navy (editing path):
- Editors & Admins → Cloudflare Access: "sign in".
- Cloudflare Access → Admin Dashboard: "dashboard".
- Admin Dashboard → Content API: "API calls + Access token".
- Content API → Content Store: "save drafts".
- Content API → Upload Inbox: "store upload".
- Content API → Cloudflare Images: "make sizes".
- Cloudflare Images → Content API: "sizes" (dashed back).
- Content API → Media Library: "save sizes".
- Content API → Published Content: "publish / roll back". Attach the note "Publishing writes a new release, then switches the pointer; rollback = switch back."
- Content API → Brevo → Lab Email Inbox: "contact messages".

Grey dotted (deployment):
- GitHub · deploy → Public Website and → Admin Dashboard: "deploy".

**Bottom-left note (teal):** "Visitors never touch the database: pages come from static files, content from published files in R2. The public site keeps working even if the dashboard is down."

**Legend:** teal = visitor path · navy = editing & API · grey dashed = internal call · grey dotted = deployment.

**Footer bar:** "Hosted on Cloudflare (free plan) · One production environment · Deployed with Wrangler (npm run cf:deploy / GitHub Actions)".

---

## Figure 3: Domain model (`03-domain-model.png`) · Small edit

Keep everything, except:

1. **User** class:
   - change `sub : String {Cognito id}` to `email : String {from Cloudflare Access}`;
   - remove `status : UserStatus` and `lastSignInAt`;
   - add the note: "Who may sign in is managed in Cloudflare Access; the role comes from the admin list. Not stored by the API yet (planned)."
2. Mark **Slot**, **Placement** and **AuditEvent** as **planned** (greyed out with a small tag). Grey out the **UserStatus** and **AuditAction** enumerations to match.
3. **MediaAsset**: `originalKey` becomes `uploads/<id>/original`; `durationSec` and `embedUrl` are marked **planned (video)**.
4. **Release**: remove `snapshotPrefix`. Change the note to: "Immutable. Files under content/releases/<id>/. Rollback = point current.json at an earlier release."

---

## Figure 4: SD-1 Visitor views a page (`04-sd1-visitor-views-page.png`) · Edit

Title **"SD-1 Visitor views a page"**.

**Lifelines, left to right:**
1. **Visitor** (stick figure)
2. **Public Website** (the React app in the browser)
3. **Cloudflare network** ("static files")
4. **hai-site Worker**
5. **R2: Published Content**
6. **R2: Media Library**

**Messages** (teal; dashed = reply):
1. Visitor → Cloudflare network: "open page (e.g. /news/…)".
2. Cloudflare network → Visitor: "website app (static files, no Worker code)".
3. Visitor → Public Website: "start app".
4. Public Website → hai-site Worker: "which release is current? (GET /content/current.json)".
5. hai-site Worker → R2 Published Content: "read current.json".
6. R2 → hai-site Worker: "release id".
7. hai-site Worker → Public Website: "current release id (never cached)".
8. `alt` frame:
   - **[not in browser cache]**: 8a. Public Website → hai-site Worker: "get news for that release"; 8b. hai-site Worker → R2 Published Content: "read releases/<id>/news.json"; 8c. reply: "news (cached by the browser for a year)".
   - **[already in browser cache]**: 8d. note on Public Website: "use the cached copy; no request".
9. Public Website → hai-site Worker: "get photos (/media/…)".
10. hai-site Worker → R2 Media Library: "read photo".
11. reply: "photo (cached for a day)".
12. Public Website → Visitor: "page displayed".

**Small note beside step 4:** "First visit of a brand-new deployment: the Worker asks the dashboard Worker to import the site's content and publish it, then answers."

**Result note:** "No database on this path. A small Worker reads published files from R2; everything else is static. The site stays up even if the dashboard is down."

---

## Figure 5: SD-2 Editor signs in (`05-sd2-editor-signs-in.png`) · Redraw

Title **"SD-2 Editor signs in"**.

**Lifelines:**
1. **Editor** (stick figure)
2. **Cloudflare Access**
3. **Editor's inbox**
4. **Admin Dashboard** (hai-admin Worker, static files)
5. **Content API** (hai-admin Worker)

**Messages:**
1. Editor → Cloudflare Access: "open dashboard address".
2. Cloudflare Access → Editor: "sign-in page: enter your email".
3. Editor → Cloudflare Access: "email address".
4. `alt` frame:
   - **[email not in the Access policy]**:
     - 4a. Cloudflare Access → Editor, **red dashed**: "'A code has been emailed' (but none is sent)";
     - note: "Access never reveals which addresses are allowed."
   - **[email allowed]**:
     - 4b. Cloudflare Access → Editor's inbox: "6-digit code (valid 10 minutes)";
     - 5b. Editor → Cloudflare Access: "code";
     - 6b. Cloudflare Access → Editor: "signed in for 24 hours (session cookie)".
5. Editor → Admin Dashboard: "dashboard loads".
6. Admin Dashboard → Content API: "GET /api/session", with a small label "Access adds a signed token (Cf-Access-Jwt-Assertion)".
7. Content API self-call: "check token: signature, issuer, audience, expiry".
8. `alt` frame:
   - **[token invalid or missing]**: 8a. Content API → Admin Dashboard, **red dashed**: "401 sign-in required".
   - **[valid]**: 8b. Content API self-call: "role = admin if email in ADMIN_EMAILS, else editor"; 9b. Content API → Admin Dashboard: "name + role"; 10b. Admin Dashboard → Editor: "sidebar shows your email and role".

**Result note:** "Only people listed in the Access policy can sign in, with a code sent to their email; no passwords. The API checks the token and the role again on every request."

---

## Figure 6: SD-3 Editor uploads media (`06-sd3-editor-uploads-media.png`) · Redraw

Title **"SD-3 Editor uploads a photo"** (videos are planned).

**Lifelines:**
1. **Editor** (stick figure)
2. **Admin Dashboard**
3. **Content API**
4. **Content Store**
5. **R2: Upload Inbox**
6. **Cloudflare Images**
7. **R2: Media Library**

**Messages:**
1. Editor → Admin Dashboard: "choose photo".
2. Admin Dashboard → Content API: "start upload (name, type, size)".
3. `alt` frame:
   - **[type or size not allowed]**: 3a. Content API → Admin Dashboard, **red dashed**: "refused with reason (JPEG, PNG or WebP only; 25 MB max; videos not yet)".
   - **[allowed]**:
     - 3b. Content API → Content Store: "create media record 'uploading'";
     - 4b. Content API → Admin Dashboard: "upload address (valid 15 minutes)".
4. Admin Dashboard → Content API: "send the file".
5. Content API self-call: "refuse if larger than announced".
6. Content API → R2 Upload Inbox: "store original (private)".
7. Admin Dashboard → Content API: "upload complete".
8. Content API → Content Store: "mark 'processing'".
9. Content API self-call: "check real file type from its contents; at most 50 megapixels".
10. `alt` frame:
    - **[not a real image, or damaged]**: 10a. Content API → Content Store, **red**: "mark 'failed' + reason".
    - **[image OK]**:
      - 10b. Content API → Cloudflare Images: "make 480 / 960 / 1600 px sizes";
      - 11b. Cloudflare Images → Content API: "sizes (turned upright)";
      - 12b. Content API self-call: "remove location & camera data";
      - 13b. Content API → R2 Media Library: "save sizes";
      - 14b. Content API → Content Store: "mark 'ready'".
11. Content API → Admin Dashboard: "result: ready or failed + reason" (arrives straight away, no waiting loop).
12. Editor → Admin Dashboard: "add alt text".
13. Admin Dashboard → Content API → Content Store: "save alt text".

**Small note near step 10:** "Admins can retry a failed photo from the kept original."

**Result note:** "Every upload is checked and re-encoded before use, and location data is removed. Nothing is visible to visitors until an Admin publishes."

---

## Figure 7: SD-4 Admin publishes a release (`07-sd4-admin-publishes.png`) · Edit

Title **"SD-4 Admin publishes a release"**.

**Lifelines:**
1. **Admin** (stick figure)
2. **Admin Dashboard**
3. **Content API**
4. **Content Store**
5. **R2: Published Content**

Remove the "Edge (CDN + Firewall)" lifeline.

**Messages:**
1. Admin → Admin Dashboard: "click 'Publish'". Note: "Finalise content and click Publish."
2. Admin Dashboard → Content API: "publish request (+ Access token)".
3. Content API self-call: "check token; require Admin role".
4. `alt` frame:
   - **[not an Admin]**: 4a. **red dashed** to Admin Dashboard: "forbidden".
   - **[another publish in progress]**: 4b. **red dashed**: "publish in progress, try again".
   - **[OK]**:
     - 4c. Content API self-call: "take publish lock";
     - 5. Content API → Content Store: "read all items (except unpublished) and photos";
     - 6. reply: "data";
     - 7. Content API self-call: "validate (required fields, photos ready, alt text present)";
     - 8. nested `alt` frame:
       - **[validation fails]**: 8a. self-call "release lock"; 9a. **red dashed** to Admin Dashboard: "list of problems; nothing published".
       - **[valid]**:
         - 8b. Content API → R2: "write new release files (new folder)";
         - 9b. Content API → R2: "switch current.json to the new release";
         - 10b. Content API → Content Store: "record release; mark items published; release lock";
         - 11b. Content API → Admin Dashboard: "published".

Remove the old step "refresh cached pointer". Show "audit event" only as a greyed "(audit log: planned)" label on 10b.

**Result note:** "Release files are written first; the pointer switch is a single step, so visitors never see a half-published site. Live on the next page load."

---

## Figure 8: SD-5 Admin rolls back a release (`08-sd5-admin-rolls-back.png`) · Edit

Title **"SD-5 Admin rolls back a release"**.

**Lifelines:**
1. **Admin**
2. **Admin Dashboard**
3. **Content API**
4. **Content Store**
5. **R2: Published Content**

Remove the "Edge" lifeline.

**Messages:**
1. Admin → Admin Dashboard: "open release history".
2. Admin Dashboard → Content API: "list releases".
3. Content API → Content Store: "read releases".
4. Content API → Admin Dashboard: "releases (newest first, current one marked)".
5. Admin → Admin Dashboard: "choose earlier release, confirm".
6. Admin Dashboard → Content API: "restore release".
7. `alt` frame:
   - **[Admin role valid]**:
     - 7. Content API self-call: "verify Admin role; take publish lock";
     - 8. Content API → R2: "switch current.json to the chosen release";
     - 9. Content API self-call: "release lock" (greyed label: "audit log: planned");
     - 10. Content API → Admin Dashboard: "restored".
   - **else [not an Admin]**: 11. **red dashed**: "error: not authorised".

Remove the old step "refresh cached pointer".

**Result note:** "No rebuild and no data copy. Takes seconds. Drafts are untouched, so a fix can be published again."

---

## Figure 9: SD-6 Visitor sends a contact message (`09-sd6-visitor-contact.png`) · Edit

Title **"SD-6 Visitor sends a contact message"**.

**Lifelines:**
1. **Visitor**
2. **Public Website**
3. **hai-site Worker**
4. **Content API** (hai-admin Worker)
5. **Brevo** (email API)
6. **Lab inbox**

**Messages:**
1. Visitor → Public Website: "fill form, click Send".
2. Public Website → hai-site Worker: "POST /api/contact".
3. `alt` frame:
   - **[more than 5 messages a minute from this address]**:
     - 3a. hai-site Worker → Public Website, **red dashed**: "blocked by rate limit";
     - 4a. Public Website → Visitor: "Please try again in a minute".
   - **[allowed]**:
     - 3b. hai-site Worker → Content API: "forward (internal service binding)";
     - 4b. Content API self-call: "validate fields; check spam trap (honeypot)";
     - nested `alt` frame:
       - **[invalid]**: 5a. **red dashed** to Public Website: "error with the fields to fix"; 6a. to Visitor: "show what to fix".
       - **[spam trap filled]**: 5c. Content API → Public Website: "success" (dashed; note "message silently dropped, so bots learn nothing").
       - **[valid]**:
         - 5b. Content API → Brevo: "email to lab inbox, reply-to = visitor";
         - 6b. Brevo → Lab inbox: "deliver";
         - 7b. Brevo → Content API: "accepted";
         - 8b. Content API → Public Website: "success";
         - 9b. Public Website → Visitor: "Message sent".
       - **[Brevo refuses or is unreachable]**: 8d. **red dashed**: "delivery failed, try again later".

**Result note:** "Messages are emailed, not stored. The form only reports success when Brevo accepted the message. Until a Brevo key is set, messages are written to the log instead."

---

## Figure 10: Cloudflare deployment (`10-cloudflare-deployment.png`) · Replace

New file. Title **"Human-AI Lab Platform — Cloudflare Deployment (Production)"**, subtitle "Cloudflare free plan · global network · one environment".

**Left column "Users & External Systems":**
- Visitors
- Editors & Admins ("email sign-in")
- Lab inbox
- GitHub (repository + Actions)

**Main area:** a large rounded outline **"Cloudflare account"** containing four groups.

**1. Edge (purple):**
- **Cloudflare network**: "TLS · DDoS protection · static files". Two address labels: `hai-site.<account>.workers.dev` and `hai-admin.<account>.workers.dev`.
- **Cloudflare Access (Zero Trust, Free)**:
  - "Application: hai-admin";
  - "Login: one-time PIN by email";
  - "Policy: allowed emails";
  - "Session 24 h".

**2. Compute (orange):**
- **Worker hai-site**, with sub-items:
  - Static assets (website);
  - `/content`, `/media` → R2;
  - `POST /api/contact` → rate limit (5 / min / IP) → hai-admin.
- **Worker hai-admin**, with sub-items:
  - Static assets (dashboard);
  - `/api/*` → verify Access token → Content API;
  - `/content`, `/media` previews;
  - contact form.
- A **grey dashed arrow** labelled "service binding (internal): contact form, first-deploy import" from hai-site to hai-admin.

**3. Data (green):**
- **Durable Object "ContentStore" (SQLite)**: "drafts · media records · release history · 1 instance".
- **R2 bucket hai-content (private)**, with four compartments:
  - `content/current.json`
  - `content/releases/<id>/…`
  - `media/<id>/…`
  - `uploads/<id>/original`

**4. Services (teal):**
- **Cloudflare Images**: "photo sizes · 5,000 / month free".
- **Workers Logs (Observability)**: "logs from both Workers".
- **Worker secrets**: "ADMIN_EMAILS · BREVO_API_KEY".

**Outside the Cloudflare outline, right:** **Brevo** ("email API · free 300/day").

**Arrows**

Teal (visitor path):
- Visitors → Cloudflare network → Worker hai-site;
- Worker hai-site → R2 (`content/`, `media/`) "read".

Navy (admin path):
- Editors & Admins → Cloudflare Access → Worker hai-admin;
- Worker hai-admin → Durable Object "read / write drafts";
- Worker hai-admin → R2 "publish, uploads, photo sizes";
- Worker hai-admin → Cloudflare Images "resize";
- Worker hai-admin → Brevo "contact email";
- Brevo → Lab inbox "deliver".

Grey dotted (deployment):
- GitHub → both Workers: "deploy (npm run cf:deploy / Actions, Cloudflare API token)".
- Worker hai-admin → Workers Logs: "logs".

**Footnote box, bottom right:**

> "No servers, no containers, no database server. The storage has no public address; only the two Workers reach it through bindings. Free-plan limits: 100,000 Worker requests / day, 10 GB R2, 5,000 image sizes / month. Past a limit the service pauses; it is never billed. Running cost: $0 / month."

**Legend:** teal = visitor path · navy = admin / API path · grey dashed = internal call · grey dotted = deployment / logs.

---

## Figure 11: Security model (`11-security-model.png`) · Redraw

Title **"Human-AI Lab Platform — Security Model"**, subtitle "Trust zones, identities and controls (production)".

**Top band "IDENTITY" (light blue)**, three boxes:
- **End-user identity: Cloudflare Access**:
  - only emails in the policy;
  - emailed one-time code, no passwords;
  - 24-hour session;
  - roles: editor / admin (admin list kept as a secret).
- **Operator identity: Cloudflare account**:
  - account owner signs in to the Cloudflare dashboard;
  - use a shared lab mailbox;
  - turn on two-factor authentication.
- **Deploy identity: Wrangler**:
  - maintainer login, or a scoped API token stored as a GitHub environment secret;
  - no keys in the repository.

**Four vertical trust zones, left to right, separated by red dashed boundaries B1, B2, B3:**

**Zone 0, Untrusted: Internet (light red):**
- Visitors (anonymous)
- Editors & Admins (signed in)
- Attackers / bots

**Boundary B1** (between zone 0 and zone 1).

**Zone 1, Edge (light yellow):**
- Cloudflare network (TLS, DDoS protection)
- **Cloudflare Access** in front of hai-admin
- hai-site's contact-form **rate limit**

**Boundary B2** (between zone 1 and zone 2).

**Zone 2, Application (light blue):**
- **Worker hai-site**
- **Worker hai-admin** with the Content API: token check, role check

**Boundary B3** (between zone 2 and zone 3).

**Zone 3, Data (light green):**
- **Durable Object** (drafts)
- **R2 hai-content** (private), with a lock icon on both
- **Upload originals** (`uploads/`), marked "never served"

**Flows**
- Visitors → C1 → hai-site → C5 → R2 "read published files only".
- Editors → C1 → C2 (Access) → hai-admin → C3, C4 → Durable Object and R2 "read / write".
- Uploads: Editors → hai-admin → C6 → Cloudflare Images (drawn inside a pink dashed **"Media checks"** box) → R2 `media/`.

**Attacker paths** (red dashed, ending in a red ✕):
- to R2 directly: "no route: bucket has no public address";
- to the dashboard API without a valid token: "401: token checked";
- flooding the contact form: "blocked: rate limit".

**Controls key (right panel):** shield icons C1–C10.

| ID | Control |
|---|---|
| C1 | HTTPS everywhere; Cloudflare's network absorbs DDoS attacks |
| C2 | Cloudflare Access: allowed emails only, emailed one-time code, 24 h session |
| C3 | The API verifies every Access token itself: signature, issuer, audience, expiry |
| C4 | Role checked on every action in the API (admin list kept as a secret), not only hidden in the dashboard |
| C5 | R2 is private: reachable only through Worker bindings; the website serves only `content/` and `media/` |
| C6 | Upload checks: allowed types, 25 MB, size as announced, real type from the file's contents, 50 MP limit, re-encoded by Cloudflare Images, location and camera data removed |
| C7 | Contact form: 5 per minute per IP, field validation, honeypot, no line breaks in headers |
| C8 | Publishing integrity: one publish at a time, version-checked saves, files written before the pointer switch, instant rollback |
| C9 | Secrets (admin list, email key) stored as Worker secrets; the public repository contains none |
| C10 | Free-plan limits cap cost: past a limit a service pauses, never bills |

**Role matrix (bottom right):** keep as today.

| Action | Editor | Admin |
|---|---|---|
| Edit drafts, upload, place media | ✓ | ✓ |
| Publish / roll back | | ✓ |
| Delete content & media | | ✓ |
| Manage who can sign in | | ✓ (in Cloudflare Access) |
| View audit log | | planned |

Caption under the matrix: "Enforced in the API, not only hidden in the dashboard."

**Bottom band "DETECTION":** three boxes.
- **Workers Logs**: "requests and errors, both Workers".
- **Cloudflare usage notifications**: "email when usage is high".
- **Application audit log**: greyed, **planned**.

**Legend:** red dashed line = trust boundary · shield = security control · teal = visitor path · navy = editor path · red dashed arrow = untrusted path · red ✕ = blocked · lock = private.

---

## Figure 12: Roadmap (`12-roadmap.png`) · Redraw (needs input)

The current roadmap plans **Netlify → AWS**. The target is now **Cloudflare**, and much of the plan is done. **The project owner must supply the remaining dates.** Keep the current layout: a week grid on top, rows for Milestones, Live site, Phases and Parallel tracks, the same legend colours, and red diamonds for milestones.

Title **"Human-AI Lab Website — Roadmap: Netlify → Cloudflare"**, subtitle "From a static Netlify site to a CMS-driven platform on Cloudflare's free plan".

**Row "Done"**: a green band on the left, labelled **"Done (Sep 2026)"**, listing:
- Content API rebuilt for Cloudflare (TypeScript, Durable Object, R2);
- drafts → publish → rollback;
- photo uploads with web sizes;
- existing site content imported;
- dashboard live behind Cloudflare Access;
- one-command deploy and newcomer guide.

**Milestones:**

| ID | Milestone | Status |
|---|---|---|
| M1 | Platform live on Cloudflare (workers.dev) | **done** |
| M2 | Editors publish without developers | after Access and Brevo setup, and onboarding |
| M3 | Lab domain on Cloudflare; switch from Netlify | date TBD |
| M4 | Pages visible to search engines | date TBD |

**Row "Live site":**
- a grey bar "Production on Netlify (current)" up to the cut-over;
- a red dashed "cut-over" line at M3;
- a hatched "Netlify kept as fallback (2 weeks)" block;
- a teal arrow "Production on Cloudflare".

**Phases** (remaining; weeks TBD):
1. **Finish setup**: contact email through Brevo; add editors to Access; confirm phone photos come out upright.
2. **Media migration**: move the 26 hotlinked images (snipboard.io, Cloudinary) into the media library. Keep the existing red warning note: "Hotlinked images can disappear at any time — migrate early."
3. **Dashboard features**: projects, slots and placements, user list and audit log, then video.
4. **Go-live**:
   - lab domain added to Cloudflare, or `humanai.cse.mrt.ac.lk` delegated;
   - custom domain on hai-site;
   - firewall rate-limit rule and Bot Fight Mode on the domain;
   - switch DNS; retire Netlify after the fallback window.
5. **Search engine visibility**: static HTML per page at publish time, sitemap.
6. **Later**: server-rendered pages, university SSO in Access, scheduled publishing, search.

**Parallel tracks:**
- "Ask University IT to delegate humanai.cse.mrt.ac.lk to Cloudflare": marked **Start now**.
- "Register lab domain; choose canonical".
- "Move the Cloudflare account to a shared lab mailbox; add a second account admin".
- "Editor onboarding & training".
- **Remove** "Request SES production access" and "Decide AWS root mailbox".

---

## After redrawing

Update `docs/architecture/system-design.md` to match the figures:
- the header table (Backend, Cloud, Running cost);
- §3 "Part / What it is" table;
- §6 (now "Deployment on Cloudflare": cost table becomes $0 with the free-plan limits);
- §7 security bullets;
- §8 decisions;
- §9 roadmap text.
