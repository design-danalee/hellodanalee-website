# Content management & build — setup guide

Your site is now a small **Eleventy** static site with a **Decap CMS** visual editor.
You edit content (copy, images, project pages) — never HTML — and a push to `main`
rebuilds and deploys automatically.

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
admin/              The CMS — config.yml + index.html  ->  https://YOUR-DOMAIN/admin/
oauth/              PHP GitHub login proxy (auth.php, callback.php)
main.css, *.css, *.js, contact.php   Static files, copied as-is to the build
```

The published files (`index.html`, `shipium.html`, …) are **generated** into `_site/`
during the build. Don't hand-edit them.

---

## Working locally

```bash
npm install          # one time
npm start            # live preview at http://localhost:8080
npm run build        # one-off build into _site/
```

Edit files under `src/` and the preview reloads. Commit `package-lock.json`.

---

## Turning the CMS on (one-time)

The CMS commits to GitHub on your behalf, so it needs a GitHub login. That login is
brokered by the small PHP app in `/oauth/`.

### 1. Create a GitHub OAuth App
GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**

- **Application name:** anything (e.g. "Dana Lee site CMS")
- **Homepage URL:** `https://YOUR-LIVE-DOMAIN`
- **Authorization callback URL:** `https://YOUR-LIVE-DOMAIN/oauth/callback.php`

Click **Register**, then **Generate a new client secret**. Keep the
**Client ID** and **Client secret** handy (the secret is shown only once).

### 2. Add the credentials as GitHub Action secrets
In the **repo** → Settings → Secrets and variables → Actions → New repository secret:

- `GH_OAUTH_CLIENT_ID` → the Client ID
- `GH_OAUTH_CLIENT_SECRET` → the Client secret

(`FTP_PASSWORD` is already set.) On every deploy the workflow writes these into
`/oauth/oauth-config.php` on the server — the secret is never committed to the repo.

> Prefer to skip CI for this? Instead copy `oauth/oauth-config.sample.php` to
> `oauth/oauth-config.php`, fill in the values, and upload it to the server's
> `/oauth/` folder by hand. It is git-ignored and preserved across deploys.

### 3. Point the CMS at your domain
In `admin/config.yml`, set:

```yaml
backend:
  base_url: https://YOUR-LIVE-DOMAIN
```

Commit and push. Once the deploy finishes, open **`https://YOUR-LIVE-DOMAIN/admin/`**,
click *Login with GitHub*, and you're in.

---

## Using the CMS

- **Projects (Case Studies):** add, edit, reorder, or delete case studies. Each project
  also has a *work-grid card* (image, title, tagline) that controls how it appears on the
  home page. "Order in work grid" sets the position (1 = first). A new project gets its
  own page automatically at `<filename>.html`.
- **Content sections** on a project are a list of *sections* (optional heading + body),
  each containing *rows*. A row is a full- or half-width image, a video, or a caption —
  pick the type from the dropdown when you add one. Two half-width rows sit side by side.
- **Pages:** edit the Home / About / Contact copy and the Contact form's dropdown options.

Every save is a commit to `main`, which triggers a rebuild + FTP deploy (a few minutes).

---

## Deploy notes

- `.github/workflows/deploy.yml` runs `npm ci` → `npm run build` → writes the OAuth
  config → FTP-uploads **`_site/`**.
- `dangerous-clean-slate` is **off**, so server-only files that aren't part of the build
  — `smtp-config.php`, `phpmailer/`, and `oauth/oauth-config.php` if you uploaded it by
  hand — are preserved across deploys. (Those two contact-form files are not in the repo;
  keep them on the server, or commit `phpmailer/` and provision `smtp-config.php` like the
  OAuth config if you want them managed by CI.)
