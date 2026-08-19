# Content management & build — setup guide

Your site is a small **Eleventy** static site with a **custom inline CMS** at `/admin/`.
You edit content directly on a live render of each page — never HTML — and every save
commits to `main`, which rebuilds and deploys automatically.

---

## How it's organized

```
src/
  _data/            Editable copy for the singleton pages
    home.json         Home hero text
    about.json        About hero, body sections, "Partner with Me", data points
    contact.json      Contact hero + dropdown options
  _includes/
    layouts/          base.njk (page shell), project.njk (case-study template)
    partials/         header.njk, footer.njk
  projects/         One file per case study (shipium.md, hbcuv.md, …)
  index.njk         Home page (work grid is built from src/projects automatically)
  about.njk
  contact.njk
assets/             Images & videos (CMS uploads land here)
admin/              The custom CMS — a no-build Preact app served at /admin/
functions/oauth/    Cloudflare Pages Functions — GitHub login proxy (auth.js, callback.js)
main.css, *.css, *.js   Static files, copied as-is to the build
```

The published files (`index.html`, `shipium.html`, …) are **generated** into `_site/`
during the build. Don't hand-edit them.

### Inside `admin/`

```
index.html            Entry (import map + CSP); loads the real site CSS so the
                      editing surface looks exactly like the published page
app.js                Orchestrator: routing, content store, save/commit
vendor/               Pinned preact / htm / js-yaml (committed, no CDN at runtime)
github/               GitHub read (Contents API) + write (Git Data API)
content/              Frontmatter + JSON (de)serialization
surface/              The editable render (mirrors project.njk + the page templates)
crop/                 In-place crop/zoom control
media/                Uploads (base64 blobs, video size guardrails)
```

---

## Working locally

```bash
npm install          # one time
npm start            # live preview at http://localhost:8080
npm run build        # one-off build into _site/
```

Open **http://localhost:8080/admin/**. Browsing/read is **unauthenticated** (the repo
is public). To *save* locally, sign in with a token (see below) — GitHub OAuth only
works on hosts Cloudflare actually serves (production and its `*.pages.dev` preview
URLs), not on localhost.

---

## Signing in

The CMS commits to GitHub on your behalf, so saving needs a GitHub login. Two ways
(the **Sign in** button offers both):

1. **Sign in with GitHub** — a popup through the OAuth proxy at `/oauth/auth` +
   `/oauth/callback` (Cloudflare Pages Functions, `functions/oauth/`). Works on the live
   site once the OAuth app is configured (below). This is the normal path.
2. **Use a token** — paste a fine-grained personal access token. Handy for local dev.
   Create one at GitHub → Settings → Developer settings → **Fine-grained tokens**, scoped
   to **this repo only**, with **Repository permissions → Contents: Read and write**.

The token is held in memory / sessionStorage only (per-tab, cleared when you close it) —
never committed, never in localStorage.

### One-time GitHub OAuth app (for the live "Sign in with GitHub")

GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**

- **Homepage URL:** `https://hellodanalee.com`
- **Authorization callback URL:** `https://hellodanalee.com/oauth/callback`

Register, generate a client secret, and add both in the **Cloudflare Pages project's
Settings → Environment variables** (marked Secret) as `GH_OAUTH_CLIENT_ID` and
`GH_OAUTH_CLIENT_SECRET` — read directly by `functions/oauth/auth.js` and
`callback.js` at request time. Nothing is written to a file, and there's no CI
step involved.

---

## Using the CMS

Open `/admin/`, pick a page or case study, and toggle **Editing**:

- **Text** — click any headline, paragraph, tagline, caption, capability, or list item to
  edit it in place.
- **Images** — click a photo to **crop/zoom** it (drag to reposition, scroll/slider to
  zoom) or **Replace** it. Cropping is non-destructive — the original file is kept.
- **Video / natural-height images** — click to replace via upload.
- **Structure** — hover a block for its toolbar (move ↑/↓, change type, delete); use
  **+ Add block** / **+ Add section**; edit Home cards, About tiles/facts, and Contact
  dropdown options inline. Create a new case study with **+ New case study**.

Press **Save** to commit. Uploads (images/videos) ride along in the same commit via the
Git Data API — **no 1 MB limit** (large videos are warned/blocked to keep the repo lean).
Every save is one commit to `main`, which triggers the rebuild + deploy (a couple minutes).

---

## Deploy notes

- Hosting is **Cloudflare Pages**, connected directly to this GitHub repo via its
  native Git integration — every push to `main` triggers a build (`npm run build`)
  and deploy automatically. There's no FTP, no deploy workflow, and no server-only
  files to keep in sync: `functions/oauth/` ships as part of the repo and Cloudflare
  runs it directly.
- `.github/workflows/ci.yml` is just a build-sanity check on pull requests — it
  doesn't deploy anything.
- Secrets (`GH_OAUTH_CLIENT_ID`, `GH_OAUTH_CLIENT_SECRET`) live in the Cloudflare
  Pages project's environment variables, not in GitHub Actions secrets or any
  file in the repo.
- The contact form sends through [Web3Forms](https://web3forms.com) rather than a
  self-hosted mailer — its access key lives in `src/_data/contact.json`
  (`web3formsKey`), which Web3Forms documents as safe to commit publicly.
