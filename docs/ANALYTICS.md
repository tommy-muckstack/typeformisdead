# Analytics (PostHog)

One PostHog project (US cloud, project **666931**) collects the hub and every IsDead sub-app. The contract is the hub's
`yourappisdead/ANALYTICS.md`; this file is how TypeformIsDead follows it. Analytics gates nothing and adds no paid features.

## Setup
- `NEXT_PUBLIC_POSTHOG_KEY` = the project's publishable token (safe in the browser); `NEXT_PUBLIC_POSTHOG_HOST=https://us.posthog.com`. Both are set on the Vercel project. No key → analytics is a no-op. (`NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`, `NEXT_PUBLIC_ANALYTICS_ENABLED` and `NEXT_PUBLIC_ANALYTICS_ENVIRONMENT` are no longer read.)
- Reverse proxy through the app's own origin: `/typeformisdead/ingest/*` → `us.i.posthog.com` (rewrites in `next.config.mjs`, with `skipTrailingSlashRedirect: true`).
- `<Analytics />` (`lib/analytics/posthog.tsx`) is mounted once in `app/layout.tsx` and sends PostHog's built-in `$pageview` per route change. `<WebsiteAnalytics />` handles marketing CTA clicks. Autocapture, heatmaps, performance capture and session replay are off. Do Not Track is respected (`respect_dnt`).
- posthog-js drops events from automated browsers. In dev, `localStorage.isdead_ph_debug = "1"` turns on verbose logs and lets automated browsers capture. Production keeps the bot filter.

## Super properties (registered on every event)
| property | value | meaning |
| --- | --- | --- |
| `product` | `typeformisdead` | the one property to filter by (the hub sends `yourappisdead`) |
| `surface` | `landing` \| `app` | `landing` = home, pricing, login; `app` = the workspace and builder (`/app/*`) and published forms (`/f/*`) |
| `platform` | `web` | |
| `env` | `production` \| `development` | |
| `account_type` | `firebase` \| `guest` \| `demo` | registered after identification |

At boot the client unregisters older taxonomies' super properties (`source`, `site_id`, `app_id`, `schema_version`, `environment`, `app`, …) from the shared yourappisdead.com cookie.

## Identity
Signed-in users are identified by their Firebase uid (`components/typeform/Dashboard.tsx`), which is what the hub contract requires; the old schema never identified anyone. Guests and the demo account are never identified (`account_type` is registered instead). Sign-out calls `reset()` and re-registers the super properties.

## Privacy rules
- `track()` rebuilds every event's properties from the allowlist in `lib/analytics/taxonomy.ts` (`safeProps`). Only fixed enums, booleans and a 0–100 question count are sent; anything else drops the event. Never sent: form or response ids, titles, questions, prompts, answers, emails or error text.
- `before_send` (`scrub`) reduces every URL property posthog-js attaches (any key ending in `url` / `referrer` / `pathname`, including inside `$set` / `$set_once`) to origin + path. Form ids in `/f/<id>` and `/app/forms/<id>` become `:id`, since a form link works like a share token. The page `title` is dropped.

## Events
| event | properties | trigger |
| --- | --- | --- |
| `$pageview` | | every route change |
| `landing_cta_clicked` | `target`: announcement \| navigation \| hero \| example \| content \| footer | a link/button inside an element marked `data-website-cta` |
| `app_auth_started` / `app_auth_failed` | `method`: password \| google, `flow`: signin \| signup \| password_reset | the auth request begins / rejects (no error text) |
| `app_signed_up` | `method`: password | email sign-up succeeded (sent with `trackNow` before the redirect) |
| `app_signed_in` | `method`: password \| google | sign-in succeeded (`trackNow`) |
| `app_password_reset_requested` | | reset email request accepted |
| `app_signed_out` | | sign-out form submitted |
| `app_form_created` | `creation_method`: blank \| template \| prompt, `question_count` | create API succeeded |
| `app_form_deleted` | | delete API succeeded |
| `app_form_publish_changed` | `published` | a save persisted a changed publish state |
| `app_form_response_submitted` | | a respondent's submission succeeded on `/f/:id` |

Renamed from the old `website_*` schema (2026-10): `website_cta_clicked` (`cta_location`) → `landing_cta_clicked` (`target`); `website_auth_completed` → `app_signed_up` / `app_signed_in` / `app_password_reset_requested`; `website_auth_*` → `app_auth_*` (`method: "email"` → `"password"`, `flow: "login"` → `"signin"`); `website_form_*` → `app_form_*`; `website_response_submitted` → `app_form_response_submitted`. `website_analytics_verified` and the `source`/`site_id`/`app_id`/`schema_version`/`environment`/`page_name`/`route_template` properties are gone.

Adding an event = add it to `EVENTS` and `ALLOWED` in `lib/analytics/taxonomy.ts` and to this table. `tests/unit/analytics.test.ts` covers naming, super properties, the allowlist and URL scrubbing.

## Where the calls live
`lib/analytics/` (client + taxonomy), `components/WebsiteAnalytics.tsx` (CTA clicks), `components/TfLogin.tsx` (auth), `components/typeform/Dashboard.tsx` (identify, sign-out, create/delete), `components/typeform/Builder.tsx` (publish), `components/typeform/FillForm.tsx` (responses).
