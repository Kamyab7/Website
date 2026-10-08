# Kamyab Valipour — Portfolio & Blog

A Nuxt 4 website with a Markdown blog, light and dark themes, consent-based Google Analytics, and email subscriptions through Resend. Cloudflare Turnstile protects subscription requests. The frontend and API routes deploy together on Vercel; no separate backend is required.

## Features

| Feature | Included behavior |
| --- | --- |
| Portfolio | Responsive navigation, profile and social links, email copying, and a recommendation carousel |
| Themes | System, light, and dark modes; saved browser preference; early theme initialization to reduce flashing |
| Markdown blog | Validated front matter, drafts, future publication dates, tags, reading-time estimates, and six posts per page |
| Search and sharing metadata | Canonical URLs, Open Graph metadata, structured data, sitemap, robots file, and RSS feed |
| Newsletter | Consent-based signup, themed HTML and plain-text confirmation emails, one-hour encrypted links, and resubscription handling |
| Bot protection | Turnstile verification with action and hostname checks, a hidden honeypot, and an Origin check |
| Publication emails | GitHub Actions detects newly published posts and sends Resend Broadcasts with unsubscribe links |
| Dependency health | Cached, sanitized readiness reports for GA4, Resend, the newsletter secret, and Turnstile |
| Analytics and privacy | Optional GA4 loaded after consent, changeable cookie settings, and a privacy notice |
| Automated verification | Tests for blog generation, feeds, email publication, subscriptions, tokens, health probes, themes, analytics, and Turnstile |

## Contents

- [Local development](#local-development)
- [Environment variables](#environment-variables)
- [Vercel deployment](#vercel-deployment)
- [Resend setup and email updates](#resend-setup-and-email-updates)
- [Cloudflare Turnstile setup](#cloudflare-turnstile-setup)
- [Rate limiting](#rate-limiting)
- [Dependency health check](#dependency-health-check)
- [Automations](#automations)
- [Routes and APIs](#routes-and-apis)
- [Troubleshooting](#troubleshooting)
- [Writing blog posts](#writing-blog-posts)
- [Customizing a fork](#customizing-a-fork)
- [Project structure](#project-structure)
- [Privacy and analytics](#privacy-and-analytics)
- [License](#license)

## Local development

Use Node.js 22.19 or later within the Node 22 release line, or another version supported by the installed Nuxt release. The publication workflow uses Node 22.

```bash
npm ci
cp .env.example .env
npm run dev
```

Fill in `.env` to enable integrations. This file is gitignored. The site can run without integration credentials, but subscriptions remain unavailable until their required settings are configured.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the frontend and server routes |
| `npm run generate` | Generate a static version of the site |
| `npm run preview` | Preview the production build locally |
| `npm run start` | Run the built Node server |
| `npm run typecheck` | Check TypeScript and Vue types |
| `node --test tests/*.test.mjs` | Run the test suite |

Use `npm run build` for deployments that need subscriptions and health checks. `npm run generate` produces static output without the required server endpoints.

## Environment variables

Add these in **Vercel → Project Settings → Environment Variables**, scoped to Production, and redeploy after changing them. Preview deployments need their own settings.

Enter only the value in Vercel’s value field, without a `KEY=` prefix or outer quotes. Mark private credentials as sensitive. The two `NUXT_PUBLIC_*` values are intentionally exposed to the browser.

| Variable | Value | Visibility |
| --- | --- | --- |
| `NUXT_PUBLIC_GA_MEASUREMENT_ID` | Your GA4 ID, such as `G-XXXXXXXXXX`; leave blank to disable analytics | Public |
| `NUXT_RESEND_API_KEY` | Resend API key with the permissions described below | Private |
| `NUXT_RESEND_FROM` | `Kamyab <updates@your-verified-domain.com>` or a plain sender email | Private |
| `NUXT_RESEND_SEGMENT_ID` | Resend segment ID; use the same segment in Vercel and GitHub Actions for blog updates | Server only |
| `NUXT_NEWSLETTER_SECRET` | Random secret of at least 32 characters | Private |
| `NUXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile widget site key | Public |
| `NUXT_TURNSTILE_SECRET_KEY` | Turnstile widget secret key, **not a Cloudflare API token** | Private |
| `NUXT_TURNSTILE_HOSTNAMES` | Comma-separated exact hostnames, such as `kamyabvalipour.com` | Server only |

Generate the newsletter secret locally:

```bash
openssl rand -hex 32
```

Copy the generated value into `NUXT_NEWSLETTER_SECRET`. It encrypts and authenticates confirmation links. Keep it stable: changing it invalidates links already sent.

## Vercel deployment

1. Import the repository into Vercel and use the Nuxt framework preset with `npm run build`.
2. Configure the environment variables above for Production.
3. Confirm that `shared/site.ts` contains the production URL. Confirmation emails, canonical URLs, and feeds use it.
4. Deploy and check `/api/health` on the production domain.
5. Complete a real subscription test with an email address you own.

Do not expose production credentials to untrusted preview deployments.

## Resend setup and email updates

Verify a sending domain in Resend and choose a sender address on that domain. Use a dedicated API key with access to send emails and read/create/update Contacts, plus segment membership writes when a segment is configured. The health check also needs Domains read access. A sending-only key cannot manage the subscriber list.

The subscription flow is:

1. The visitor opens the subscription modal, enters an email, agrees to receive updates, and completes Turnstile verification.
2. `POST /api/subscribe` validates the input and the Turnstile token, then looks up the address in Resend Contacts.
3. Active Contacts receive no new confirmation email. Unsubscribed Contacts receive a fresh confirmation link; submitting the form alone does not reactivate them.
4. An address not found in Contacts receives a confirmation email with a link valid for one hour.
5. The visitor opens `/subscribe` and clicks **Confirm subscription**. `POST /api/newsletter/confirm` verifies the encrypted token and creates the Contact, or reactivates the existing Contact for a resubscription link. The configured newsletter segment is restored before reactivation.

Confirmation emails use the website’s colors and the theme active when the visitor submits. System theme resolves to the current browser preference. A plain-text fallback is included; email clients may adjust colors.

Confirmation tokens are placed in the URL fragment and removed from the address bar on page load. Opening the link alone does not activate the subscription; a button click is required.

### Automatic blog emails with GitHub Actions

The workflow in `.github/workflows/blog-updates.yml` runs when `content/blog/` changes on the repository's default branch. It compares published posts before and after the push and sends one Resend Broadcast per newly published post, with its title, summary, article link, and unsubscribe link. Publishing a draft by setting `draft: false` also triggers an update. Editing an already published post does not send another email.

To enable it:

1. Create a **blog subscribers** segment in Resend. Add your existing confirmed newsletter Contacts to this segment.
2. Set `NUXT_RESEND_SEGMENT_ID` to this segment's ID in Vercel and redeploy. New confirmed subscribers will be added to it automatically.
3. In **GitHub → Settings → Secrets and variables → Actions**, add `NUXT_RESEND_API_KEY`, `NUXT_RESEND_FROM`, and `NUXT_RESEND_SEGMENT_ID`. Use the same sender and segment as Vercel. The GitHub API key needs Broadcasts read/create/send access; a sending-only key is insufficient.
4. Publish a Markdown post by pushing or merging it into the default branch. Watch **Actions → Email new blog posts** for the result.

Use **Run workflow** with the full 40-character commit SHA from before publication and leave **dry_run** enabled to preview the detected posts without contacting Resend. Disable it to recover a missed notification. The script stores a stable campaign name in Resend and skips existing non-draft campaigns on retries; keep these campaigns in Resend to retain duplicate protection. An existing draft is sent on retry. Inspect ambiguous provider failures in Resend before retrying.

The workflow runs independently of Vercel deployment, so an email can arrive before the new page is deployed. Future-dated posts are excluded and becoming due alone does not trigger the workflow: rebuild/deploy the website and run the workflow with a commit from before the post was added or published. Renaming a post creates a new slug and is treated as a new publication. Initial pushes without a previous commit fail without sending. No live emails are sent by the automated tests.

Subscriber storage and unsubscribe handling remain in Resend. See the [Broadcast API documentation](https://resend.com/docs/api-reference/broadcasts/create-broadcast).

An address awaiting confirmation is not yet a Contact, so another signup can send another confirmation. Only HTTP 404 from the contact lookup means the address is absent; other provider failures stop signup. Previously unsubscribed addresses can subscribe again through the form and confirm the new email. Resubscription requires Contacts update and segment membership write permissions on the server's Resend key.

Original signup links cannot reactivate an unsubscribed Contact. Resubscription links are bound to the existing Contact ID and expire after one hour. Tokens are stateless, so a resubscription link can be reused during that hour, including after another unsubscribe; strict single-use enforcement requires durable token storage.

## Cloudflare Turnstile setup

Create a **Managed** widget in Cloudflare Dashboard → Turnstile. Register each hostname that will serve the subscription form, then copy its site key and secret key into the corresponding environment variables.

For Production, use:

```text
NUXT_TURNSTILE_HOSTNAMES=kamyabvalipour.com
```

If the form is also served on `www.kamyabvalipour.com`, register that hostname in the widget and include it in the comma-separated allowlist. Values must contain hostnames only, without schemes, paths, or quotes.

For local development, use a widget registered for `localhost` and `127.0.0.1`, and set the local allowlist to `localhost,127.0.0.1`. Production explicitly rejects those local hostnames. Preview deployments need registered preview hostnames and matching environment settings.

The widget loads when the subscription modal opens. The server calls Cloudflare Siteverify and requires strict success, action `newsletter`, and an allowed hostname before contacting Resend. Missing configuration fails closed. Tokens are single-use; the widget resets after unsuccessful submission attempts and is removed when the modal closes or signup succeeds.

After configuring keys, test a successful signup, a direct request without a token, and a replayed token. Missing or replayed tokens must be rejected. Automated tests use mocked provider responses and do not replace this live browser test.

## Rate limiting

No distributed rate limiter is implemented in the application. Configure Vercel Firewall rules for:

- `POST /api/subscribe`: for example, 5 requests per IP per 10 minutes.
- `POST /api/newsletter/confirm`: limit repeated confirmation attempts.
- `GET /api/health`: limit repeated provider probes; monitor no more frequently than once per minute.

Turnstile verifies visitors; it is not a request rate limiter. The hidden honeypot and Origin check provide additional basic protection. Contact lookup prevents repeat confirmation emails to existing Contacts.

## Dependency health check

```bash
curl -i https://kamyabvalipour.com/api/health
```

`GET /api/health` returns `status`, `checkedAt`, and individual `checks`. HTTP **200** means all probes passed. HTTP **503** with `status: "degraded"` means a dependency is missing, invalid, or unavailable.

| Check | What it verifies | What it does not verify |
| --- | --- | --- |
| `ga4` | Measurement ID format and Google tag availability | Property ownership, browser consent behavior, or event collection |
| `resend` | Authentication, Contacts read access, and verified sender domain | Contacts write permission, sending quota, or actual email delivery |
| `newsletter` | Confirmation secret contains at least 32 characters | Secret randomness |
| `turnstile` | Required settings, hostname allowlist, and a Siteverify secret probe | Site-key/secret pairing, widget domain registration, or real browser verification |

The Turnstile probe sends an intentionally invalid dummy token and expects only `invalid-input-response`. It consumes no visitor token. The health check sends no emails and modifies no Contacts. Responses omit credentials, contact details, and raw provider errors.

Reports are cached server-side for 60 seconds; configuration changes invalidate the cache. Each provider request has a five-second timeout and no retries. On Vercel, default cache storage may be local to an instance, so this cache is not a global rate limiter.

This endpoint checks dependency readiness rather than basic server liveness. Missing GA4 produces 503 even though analytics is optional for browsing. Resend domain lookup covers the first 100 registered domains and reports an inconclusive failure if the sender is beyond that page.

The report has this shape; the values below illustrate an installation without configured integrations:

```json
{
  "status": "degraded",
  "checkedAt": "2026-10-08T12:00:00.000Z",
  "checks": {
    "ga4": { "status": "not_configured", "message": "GA4 measurement ID is not set." },
    "resend": { "status": "not_configured", "message": "Resend API key or sender is not set." },
    "newsletter": { "status": "not_configured", "message": "Confirmation encryption secret must contain at least 32 characters." },
    "turnstile": { "status": "not_configured", "message": "Turnstile site key, secret key, or hostname allowlist is not set." }
  }
}
```

The endpoint is public and includes `Cache-Control: no-store` and `X-Robots-Tag: noindex` response headers. It does not check the GitHub publication workflow, Broadcast permissions, or newsletter segment membership. Set up an external monitor if you want scheduled checks or alerts; the repository does not include a monitoring scheduler.

## Automations

| Automation | Trigger | Result |
| --- | --- | --- |
| Nuxt preparation | `npm ci` runs the `postinstall` script | Prepares Nuxt imports and types |
| Blog generation | Nuxt setup and watched changes under `content/blog/` during development | Validates published posts and rebuilds `.generated/blog.json` |
| RSS generation | RSS route request; `/rss.xml` is also prerendered during the build | Produces a feed from published post summaries |
| Sitemap and robots | Requests to `/sitemap.xml` and `/robots.txt` | Returns discovery metadata using the configured site URL |
| Blog publication emails | A push changing `content/blog/**` on the default branch, or manual workflow dispatch on that branch | Compares Git revisions and queues new-post broadcasts |
| Health probes | A request to `/api/health`, subject to its 60-second server cache | Checks configured dependencies without sending email |

Publication jobs run sequentially through the workflow's concurrency group and have a ten-minute timeout. They use read-only repository permissions and install dependencies with lifecycle scripts disabled. The workflow does not run on pull requests.

For a local publication preview, replace the example SHA with a real commit from before publication:

```bash
BLOG_BEFORE='REPLACE_WITH_FULL_40_CHARACTER_COMMIT_SHA' BLOG_DRY_RUN=true node scripts/blog-updates.mjs
```

A dry run needs the Git history and installed dependencies, but no Resend credentials. For actual sending, the script reads the three Resend environment variables from the process environment; it does not automatically load `.env`.

There is no scheduled future-post publisher or automated test/build CI workflow in this repository. Run the checks below before submitting changes. Automatic website deployment depends on your hosting integration.

```bash
node --test tests/*.test.mjs
npm run typecheck
npm run build
```

## Routes and APIs

| Route | Purpose |
| --- | --- |
| `/` | Portfolio |
| `/blog` | First page of published posts |
| `/blog/page/:page` | Subsequent blog pages |
| `/blog/:slug` | Article page |
| `/privacy` | Privacy notice and cookie settings |
| `/subscribe` | Explicit email confirmation; marked `noindex, nofollow` |
| `GET /api/blog?page=1` | Paginated summaries, total count, and page count; excludes article HTML |
| `GET /api/blog/:slug` | Published article data, including rendered HTML |
| `POST /api/subscribe` | Validate consent and bot verification, then request a confirmation email |
| `POST /api/newsletter/confirm` | Verify a token and create or reactivate a subscriber |
| `GET /api/health` | Dependency readiness report |
| `/rss.xml` | RSS 2.0 feed with summaries, publication dates, and tags |
| `/sitemap.xml` | Home, privacy, blog listings, and published article URLs |
| `/robots.txt` | Crawler instructions and sitemap location |

Invalid blog pages and unknown article slugs return HTTP 404. Blog APIs read generated content; they do not provide editing or publishing endpoints.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Subscription form says unavailable | Set both Turnstile keys; check `/api/health` for server configuration errors |
| Turnstile hostname error | Use exact hostnames; remove `https://`, paths, quotes, and local hostnames from Production |
| Turnstile secret rejected | Use the widget secret key, not an account API token |
| Resend sender format error | Use a complete email or `Name <email@domain.com>` without outer quotes |
| Newsletter secret too short | Generate a new value using `openssl rand -hex 32` |
| Contact lookup returns 404 | The address is absent from Contacts; it is only added after confirmation |
| Confirmation email arrives again | An unconfirmed address can request another link; configure rate limits |
| Old email template arrives | Deploy the latest code, request a fresh email, and inspect the new Resend `/emails` request’s `html` field |
| Environment changes have no effect | Redeploy and ensure you are testing the environment where the variables were set |
| GA4 health passes but reports are empty | Check real collection with Tag Assistant or GA4 Realtime after accepting analytics |

## Writing blog posts

Add a Markdown file under `content/blog/` with a lowercase, hyphenated filename. The filename becomes the post slug. For example, `my-new-post.md`:

```markdown
---
title: My new post
description: A short summary of the article.
date: "2026-10-05"
tags:
  - Engineering
draft: false
---

## Introduction

Write your article here.
```

`title`, `description`, `date`, and a nonempty body are required. Optional fields include `updated`, `tags`, `image`, `imageAlt`, and `draft`. Dates use `YYYY-MM-DD`; `updated` cannot precede publication. Image paths must be site-relative or HTTPS URLs.

Drafts and future-dated posts are excluded from generated blog data, public blog APIs, feeds, and publication emails. Dates are evaluated using the current UTC date. Future posts require a rebuild when their date arrives. Raw HTML in Markdown is escaped. Blog data is regenerated during Nuxt setup and development content changes; `.generated/` is generated output. The slug `page` is reserved for pagination.

Draft and future-post source files are still visible to anyone who can read the repository, including its Git history. These settings control website publication, not repository confidentiality.

Posts are listed newest first with six posts per page. The site exposes `/rss.xml`, `/sitemap.xml`, and `/robots.txt`.

## Customizing a fork

1. Change the canonical URL in `shared/site.ts` and the publication email URL in `scripts/blog-updates.mjs`.
2. Replace the profile, contact address, social links, and recommendations in `app/pages/index.vue`.
3. Replace `public/portrait.jpg`, `public/social-card.png`, and `public/favicon.svg`; `scripts/social-card.html` is a source template for the social image.
4. Update names and branding in page metadata, RSS, confirmation emails, broadcast emails, and the privacy notice.
5. Replace the sample blog content and configure your own sender, Resend segment, Turnstile hostnames, and optional GA4 property.
6. Configure hosting environment variables separately from GitHub Actions secrets, then verify a real subscription and a dry-run publication job.

Keep `.env`, `.generated/`, `.nuxt/`, `.output/`, and `dist` out of version control. Generated output is recreated from the source; `dist` may be a local link to `.output/public`.

## Project structure

| Path | Purpose |
| --- | --- |
| `app/pages/` | Portfolio, blog, privacy, and confirmation pages |
| `app/components/` | Header, theme picker, subscription modal, and Turnstile widget |
| `app/assets/css/main.css` | Theme colors and site styles |
| `content/blog/` | Markdown articles |
| `.github/workflows/blog-updates.yml` | Automatic publication email workflow |
| `scripts/blog.mjs` | Front matter validation and generated blog data |
| `scripts/blog-updates.mjs` | Git revision comparison, dry runs, and Resend Broadcast sending |
| `public/` | Favicon, portrait, and social image |
| `server/api/` | Blog APIs, subscription handlers, and health endpoint |
| `server/utils/` | Email rendering, token encryption, and dependency verification |
| `shared/site.ts` | Canonical production URL |
| `shared/theme.ts` | Browser theme preference handling |
| `.env.example` | Integration configuration template |
| `.generated/` | Generated blog data; ignored by Git |
| `tests/` | Automated tests |

## Privacy and analytics

GA4 loads only after analytics consent when a valid measurement ID is configured. Visitors can change their choice through cookie settings. The choice is stored for 180 days and synchronized across tabs. Revoking consent disables further collection through the integration and removes accessible GA cookies. Manual page views omit query strings, URL fragments, and referrers; advertising consent stays denied.

System/light/dark preference is stored separately in the browser. Fonts from Google Fonts and recommendation images from LinkedIn can load independently of analytics consent. The privacy page describes newsletter processing, Turnstile verification, and external services; review it when changing providers or behavior.

## License

This project is licensed under the [MIT License](LICENSE).
