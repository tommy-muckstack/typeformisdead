# Website analytics

PostHog project **666931**, US region: [project](https://us.posthog.com/project/666931). This integration uses the [official JavaScript SDK](https://posthog.com/docs/libraries/js) with [explicit configuration](https://posthog.com/docs/libraries/js/config). It measures the YourAppIsDead website and its sub-apps. It does not collect application logs or respondent content.

## Shared taxonomy

Use the same names in every sub-app. Do not put the app name in event names. Filter by `app_id` to view one app, or by `site_id` to see the website portfolio.

| Property | This app | Meaning |
| --- | --- | --- |
| `source` | `website` | Distinguishes web events from future native apps, API or backend events |
| `site_id` | `yourappisdead` | Stable website portfolio identifier |
| `app_id` | `typeformisdead` | Stable sub-app slug |
| `schema_version` | `1` | Increment only for a breaking taxonomy change |
| `environment` | `production` | `verification` is reserved for explicit smoke tests |
| `surface` | `marketing`, `auth`, `workspace`, `builder`, `respondent`, `other` | Product area |
| `page_name` | `home`, `login`, `workspace`, `form_builder`, `form_respondent`, `unknown` | Stable page category |
| `route_template` | `/typeformisdead/app/forms/:form_id` | Normalized route; no form IDs, queries or fragments |

PostHog's standard `$pageview` is retained so built-in page reporting works. It receives the same website properties as custom events. Custom events use `website_<object>_<past-tense action>` in snake_case.

| Event | Trigger | Additional properties |
| --- | --- | --- |
| `$pageview` | Initial page and pathname changes; deduplicated for React effect replay | None |
| `website_cta_clicked` | An explicitly marked home CTA link/button | `cta_location`: announcement/navigation/hero/example/content/footer |
| `website_auth_started` | Actual auth request, not the email-step navigation | `method`: email/google; `flow`: login/signup/password_reset |
| `website_auth_completed` | Auth/reset action resolves successfully | Same as started; password reset does not confirm account existence |
| `website_auth_failed` | Auth request rejects | Same as started; no exception text or credentials |
| `website_form_created` | Successful create API response | `creation_method`: blank/template/prompt; `question_count`: 0–100 |
| `website_form_deleted` | Successful delete API response | None |
| `website_form_publish_changed` | Successful save persists a changed publish state | `published`: boolean |
| `website_response_submitted` | Respondent submission API returns success | None |
| `website_analytics_verified` | Explicit integration smoke test only | Use `environment=verification`; exclude from production reporting |

## Privacy and reliability

- Explicit events only: no DOM autocapture, session recordings, console/error collection, surveys, feature-flag requests or performance capture.
- No email, password, Firebase user ID, form/response ID, form title, question text, prompt, answer, upload or error-message properties. No `identify()` calls or person profiles.
- A runtime allowlist filters custom properties. `before_send` also discards unexpected events and all unapproved SDK properties. URLs are rewritten to route templates; query strings, fragments, page titles and referrers are omitted. IP-based enrichment is disabled.
- PostHog generates an anonymous browser identity. `yourappisdead_website_v1` is the shared localStorage persistence name; use the same name/project for other sub-apps on the same origin. Separate deployment domains have separate browser identities; no cross-domain stitching is attempted.
- The SDK loads after hydration. Tracking is best-effort and must not block sign-in, editing or form submission. SDK failures are contained. Browser Do Not Track and SDK opt-out are respected.
- Tracking is off unless explicitly enabled. Local/preview work does not send events by default. Only production is configured to send to this project. PostHog is a hosted service: ingestion follows the existing project's usage/billing settings; no paid add-ons are enabled by this change.

## Configuration

Store these in Vercel project environment variables, not committed `.env` files:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | The project's public ingestion token; never a personal/admin API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` |
| `NEXT_PUBLIC_ANALYTICS_ENABLED` | `true` for production; unset/false for local and preview |
| `NEXT_PUBLIC_ANALYTICS_ENVIRONMENT` | `production` (or `verification` for an intentional test) |

These are build-time browser settings: redeploy after changing them. Project ID 666931 is for dashboard/API administration, not the SDK initialization token. No private PostHog API key is required.

## Adding another sub-app

1. Reuse `lib/analytics/schema.ts`, `lib/analytics/client.ts` and `components/WebsiteAnalytics.tsx` (extract them into a shared package when a second app adopts them).
2. Keep `source`, `site_id`, event names, schema version, allowlists and persistence name unchanged. Set that repo's `WEBSITE_CONTEXT.app_id` and `BP`; adapt `websitePage()` to its route templates, never raw dynamic IDs.
3. Mount `WebsiteAnalytics` once in its root layout. Mark fixed CTAs with a known `data-website-cta` value. Emit success events only after the corresponding operation succeeds. Use existing events where the semantics match; add domain-specific `website_<object>_<action>` events deliberately and document them here.
4. Configure the same US project token/host for production. Keep previews/local disabled. Extend the privacy tests for new routes/properties before enabling tracking.
5. In PostHog, filter `source=website`, `site_id=yourappisdead`, `environment=production`; group by `app_id`. A basic funnel is `$pageview` (home) → `website_cta_clicked` → `website_auth_completed` → `website_form_created` → `website_form_publish_changed` (`published=true`). These are anonymous browser funnels, not identified-user/account counts.

## Verification

Unit coverage checks route redaction, unknown-event/property rejection, profile/referrer removal, one-time initialization, disabled mode, route preservation during SDK loading and failure containment. Full browser verification remains blocked by the local browser launch failure documented in PARITY_REPORT.md. An ingestion test establishes endpoint acceptance only; it is not evidence that an actual browser event fired or a dashboard query processed it.

Production environment configuration was added to the existing `muckstack-projects/typeformisdead` Vercel project on 2026-10-15. One synthetic `website_analytics_verified` event with `environment=verification` was accepted by `https://us.i.posthog.com/i/v0/e/` with `status: Ok`. No person profile, actual form data or real respondent submission was sent for this check.
