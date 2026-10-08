---
title: "How I Built a Newsletter That Starts Free"
description: "How I added double opt-in subscriptions, automated blog emails, and dependency health checks to my Nuxt website using Resend and GitHub Actions, with a free tier for up to 1,000 contacts."
date: "2026-10-08"
tags: ["Nuxt", "Open Source", "Newsletter", "Automation"]
draft: false
---

I wanted readers of my blog to have a simple way to hear about new posts. Adding a subscription form was the easy part. The more interesting part was connecting signup, confirmation, publishing, and unsubscribe handling without adding another service for me to maintain.

I built it into my Nuxt website using Resend for email and GitHub Actions for publication updates. The setup can start within the email provider's free tiers and move to a paid plan when the audience or signup volume grows.

The project and setup instructions are available on [GitHub: Kamyab7/Website](https://github.com/Kamyab7/Website), with an MIT license.

## What “free” means here

There are two separate limits to understand. As checked on **8 October 2026**:

| Email type | How this project uses it | Resend free-tier limit |
| --- | --- | --- |
| Transactional | Individual signup confirmation emails through `/emails` | 3,000 emails per month, with a 100-email daily cap |
| Marketing | New-post newsletters through `/broadcasts` | Up to 1,000 contacts |

Resend says Broadcasts do not consume the transactional quota, and marketing sending is limited by contact count rather than the number of broadcast emails. Sources: [transactional pricing](https://resend.com/pricing?product=transactional), [marketing free tier](https://resend.com/products/marketing-emails), and [pricing FAQ](https://resend.com/pricing?product=marketing).

That gives me room to start a small newsletter without a monthly email subscription. But **1,000 contacts does not necessarily mean 1,000 active subscribers**: unsubscribed contacts also count toward the quota, according to [Resend's migration guidance](https://resend.com/migrate/mailchimp).

The confirmation limit can matter earlier. A burst of more than 100 confirmation sends in a day would exceed the transactional free allowance even with a small subscriber list. Repeated requests from unconfirmed addresses consume that allowance too.

These are email-service limits, not a promise that every part of running a website costs nothing. A domain, hosting, and workflow usage have their own costs or allowances. I would check the current plans before copying this setup.

## The pieces I connected

The website uses Nuxt 4 for both the pages and server routes. Blog posts live in Markdown files under `content/blog/`, so publishing starts with a Git commit.

Resend stores the subscriber contacts and delivers the emails. A segment identifies the people who should receive blog updates. This means I do not need a separate subscriber database in the application.

Cloudflare Turnstile checks signup requests for bots. GitHub Actions compares blog content between revisions and sends publication emails. Each piece has a small job, and the website ties them together.

## Confirming an email before adding it to the list

I used a double opt-in flow:

1. A reader enters their email address and agrees to receive updates.
2. The server validates the input and Turnstile result.
3. The server sends a confirmation email without immediately adding a new address to Contacts.
4. The reader opens the link and clicks **Confirm subscription**.
5. The server verifies the token, creates the Contact, and adds it to the configured segment.

The confirmation token is encrypted and authenticated using AES-256-GCM and expires after one hour. It travels in the URL fragment, which the confirmation page removes from the address bar. Opening the link alone does not subscribe someone; confirmation requires a button click.

I also accounted for people who had unsubscribed. Submitting the form does not reactivate them. They receive a fresh confirmation link bound to their existing Contact ID, and the server restores their segment membership before opting them back in. An original signup link cannot reactivate an unsubscribed Contact.

The confirmation email includes HTML and plain text. Its colors follow the light or dark theme active when the reader signs up.

## Turning a published post into an email

The publication workflow runs when a push changes `content/blog/` on the default branch. It compares the published posts before and after that push.

For each new post, it creates a Resend Broadcast containing the title, description, article link, and an unsubscribe link. Editing an existing article does not trigger another newsletter. Changing a draft into a published post does.

To make retries safer, the script gives each article a stable campaign name derived from its URL. It looks for that campaign before creating another one, sends an existing draft, and skips a campaign that has already moved beyond draft status. Keeping those campaigns in Resend preserves this duplicate protection.

There is also a manual dry run. I can supply a commit from before publication and see which articles the workflow would announce without sending an email.

This automation has a couple of practical limits. The email job and website deployment run independently, so an email can arrive before the article is live. Future-dated articles need a rebuild when their date arrives; there is no scheduler that publishes and announces them automatically.

## Checking whether the integrations are ready

I added `/api/health` because a successful website deployment does not tell me whether the email configuration works.

It checks Resend authentication, Contacts read access, sender-domain verification, the confirmation secret, Turnstile configuration, and optional GA4 settings. It returns a sanitized report and caches the result for 60 seconds. The probes do not send emails or modify subscribers.

It is a readiness check with limits: it cannot prove actual delivery, Contacts write access, or that the publication workflow has the right Broadcast permissions. A real signup test is still needed. Missing GA4 also produces a degraded report, even though visitors can browse without analytics.

## What I would watch as it grows

The first things I would monitor are contact count, confirmation-email volume, delivery failures, and unwanted signup traffic. Turnstile helps protect the form, but it does not replace request rate limits; the README describes firewall rules for signup, confirmation, and health requests.

Confirmation links are stateless. They expire, but they are not strictly single-use. Durable token storage would be a useful addition if I needed stronger replay protection.

For now, this gives my blog a subscription flow and automatic publication emails with a clear path to paid email plans as usage grows. If you want to build something similar, the [GitHub repository](https://github.com/Kamyab7/Website) includes the code, tests, environment template, and instructions for configuring your own domain and integrations.
