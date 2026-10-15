# TypeformIsDead

Free, open-source Typeform alternative. Part of the [IsDead series](https://yourappisdead.com). Served at `https://yourappisdead.com/typeformisdead`.

**Status: local only** (not pushed, not deployed). Surfaces follow `templates/marketing-site.md` in `@isdead/design`: one marketing page (`/`, price comparison at `#pricing`), `/login`, and the app at `/app`.

## What works
- Dashboard of your forms (responses, views) and four templates: blank, customer feedback (NPS with a branch for unhappy customers), lead capture, event RSVP.
- Builder: 10 question types (short/long text, email, number, multiple choice with multi-select and Other, yes/no, rating 3–10, 0–10 opinion scale, date, statement), reorder/duplicate/delete, welcome and ending screens, live preview of exactly what respondents see, logic jumps (is, is not, contains, greater/less than, answered, always; forward-only), autosave.
- Respondent player at `/f/<id>`: one question at a time, keyboard shortcuts (Enter, A/B/C, Y/N), progress bar, required/format validation, back/next.
- Server: submissions are validated against the form and the path the respondent actually walked, unknown keys rejected, results are owner-only, forms are sanitised on save.
- Results: responses, views, completion rate, average time, per-question charts, NPS, text answers, responses table, CSV export (spreadsheet-formula safe).
- Share tab: public link, embed iframe, publish toggle.

## Known gaps
- Forms and responses are stored with `lib/store.ts` (JSON files in `.data/`). That works locally but **not on Vercel** (ephemeral disk): swap it for Firestore before deploying.
- No file upload, payment, matrix or video question types; no webhooks/integrations, themes/custom branding, partial-response capture, or AI form generation yet.
- Anyone with the link can submit (no rate limiting beyond size limits).

## Auth
Shared Firebase project `yourappisdead` (email/password + Google), helpers in `lib/isdead-auth` (vendored from `isdead-design/auth`). The session cookie `isdead_session` has path `/`, so one sign-in covers every IsDead app. Env: `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_JSON`. Without them, `/login` shows "Sign-in not configured". The single demo account ("Use the demo account") is available outside production or with `DEMO_MODE=1`.

## Website analytics
Production uses PostHog project 666931 in the US region. See [the shared website taxonomy and setup guide](docs/ANALYTICS.md) for events, privacy filtering and adding other IsDead sub-apps. Local and preview tracking are disabled by default.

## Develop
```
npm install
npm run dev        # http://localhost:3000/typeformisdead
npm test           # unit tests
npm run typecheck
npm run build && npm run shots   # product screenshots + end-to-end smoke test (Playwright)
```
Theme and font: `vendor/isdead-design` (OFL fonts, see `fonts/*/OFL-*.txt`). Not affiliated with Typeform; all trademarks belong to their owners. Apache-2.0.
