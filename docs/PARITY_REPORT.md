# Typeform parity report

Baseline: `98ef956` · Audit started: 2026-10-15 · Branch: `qa/parity-baseline`

**Incomplete. No screen is certified as a match, and no fix PR is open.** This is a source-backed inventory. Dependencies and code checks now work; browser evidence remains pending. Source inspection cannot certify visual or behavioral parity.

## Scope and acceptance

- Logged-out visual targets: **home and login only**. Pricing and other marketing pages are excluded by the owner's clarification. Signup/reset are needed for test-account setup and working authentication, but are not additional marketing parity targets.
- Replicate **all logged-in functionality**, including functionality sold in paid Typeform plans. Make it free. Paid features are not exceptions merely because Typeform charges for them.
- Include the complete authoring → publish → anonymous respondent → stored response → results/export flow.
- Remove paid-tier restrictions, upgrade prompts, billing requirements and artificial plan quotas. This is an intentional product difference, not permission to omit features. Do not change payment-processing behavior or secrets.
- Recreate assets; retain the existing independent-project disclaimer and identity. Use licensed OFL alternatives for proprietary fonts. Do not copy proprietary source or add Typeform marks.
- One logical area per PR, paired original/clone evidence at 1440×900 and 390×844, before/after captures, report updates, lint, typecheck and build. Do not merge.

Statuses: `match` requires evidence; `differs` means a concrete implementation discrepancy; `missing` means the feature is absent/stubbed. `unverified` is a temporary audit state for features that cannot yet be compared. Unverified rows **do not satisfy** the completion criterion and are not justified exceptions.

Severity: P0 = potential lost/corrupt responses; P1 = core workflow blocked or misleading; P2 = feature/interaction gap; P3 = cosmetic. A source-inferred risk is explicitly labeled and still needs reproduction.

## Evidence and blockers

| ID | Evidence / limitation | Consequence |
| --- | --- | --- |
| E1 | Repository cloned at `98ef956`; README read. No AGENTS.md, CONTRIBUTING.md or .env.example in the clone. | README is stale: Firestore support exists in `lib/store.ts`; deployment and storage claims need correction. No env files or secrets changed. |
| E2 | `/workspace/isdead-shots/parity/typeformisdead/` is absent. | No prior paired reference captures available here. Existing `public/home/*.png` files are not proof of current parity. |
| E3 | Chromium via Playwright fails before navigation: `bootstrap_check_in … unknown error code (141)`, including elevated retry. LaunchServices fallback reports the installed Chrome bundle has no executable. In-app browser Node execution tool is unavailable. | No screenshot, computed style, keyboard/a11y, signup or authenticated browser result has been obtained. |
| E4 | `npm ci` failed with `ENOTFOUND registry.npmjs.org`, including elevated retry. The lockfile also includes Firebase packages declaring Node ≥24.12; npm reported Node 22.17. | Dependencies not installed. Use a compatible Node version and working registry access before validation. Do not change the lockfile just to hide this failure. |
| E5 | `npm run lint` reports `Missing script: lint`. | Establish a real lint configuration before the required PR gate can pass. |
| E6 | [Original home](https://www.typeform.com/) and [pricing](https://www.typeform.com/pricing) were readable through a text fetch. Original login/signup are client-rendered shells. Pricing was inspected before scope was narrowed. | Text is reference context only, not browser/style evidence. Pricing is excluded from implementation scope. |
| E7 | GitHub system DNS failed; clone succeeded with the DNS-resolved GitHub address and normal HTTPS certificate verification. `gh repo view` could not reach `api.github.com`. | PR publishing access also needs restoration. No PR was attempted without passing validation. |
| E8 | No disposable account has been created on either service. | Account setup and all original authenticated comparisons remain pending. Never use original Google/Microsoft SSO, payment details or third-party real submissions. |
| E9 | `npm run typecheck` failed on missing Next/React declarations; `npm run build` and the requested dev command failed with `next: command not found`. | Failed setup gates, not confirmed product type errors. Rerun after successful dependency installation. |
| E10 | `node --check scripts/parity-capture.mjs` passed. | Syntax only; the capture utility has not run end to end. |
| E11 | Resumed setup: process-local DNS resolution restored npm downloads; installed a local temporary Node 24.22 runtime. Added Next-compatible ESLint config and fixed pre-existing JSX escaping/helper naming errors. | `npm run lint` passes with one existing image advisory; `npm run typecheck`, all 19 unit tests and `npm run build` pass. E4/E5/E9 are historical, resolved blockers. No cloud credentials configured; tests use local files. |

For every row below, screenshot value `pending E3` means **no screenshot captured**, at either viewport. Code links identify the inspected implementation, not observed original behavior. Rows are a baseline inventory, not an assertion that every difference has been discovered.

## Home and authentication

| ID | Screen / feature | Status | Severity | Source evidence / next comparison | Screenshots |
| --- | --- | --- | --- | --- | --- |
| H01 | Stable home sections, copy and claims | differs | P1 | [TfHome](../components/TfHome.tsx) attributes customer counts, stories and unavailable AI/automation to the clone. Replace misleading claims with truthful content while preserving section structure. | pending E3 |
| H02 | Fonts, colors, spacing, radii, shadows | unverified | P3 | [Styles](../components/tfhome.css); capture computed properties and paired renders for every section. | pending E3 |
| H03 | Desktop navigation and mega-menus | missing | P2 | [Nav](../components/Pk.tsx) renders every menu link as `href="#"`; no flyouts. Even Pricing points to `#`, though pricing parity is excluded. | pending E3 |
| H04 | Mobile menu and navigation | missing | P1 | [TfHomeM](../components/TfHomeM.tsx) hamburger is an aria-hidden span; CTA mapping sends unrelated actions to login. | pending E3 |
| H05 | Illustrations and product demos | differs | P2 | [TfHome](../components/TfHome.tsx) and [mobile](../components/TfHomeM.tsx) use empty shapes/blocks. Need original recreated artwork, not copied assets. | pending E3 |
| H06 | Tabs, carousels and animation | missing | P2 | Hero tabs, customer dots, integrations and announcement close control are static markup. | pending E3 |
| H07 | Hover, focus, keyboard and reduced motion | unverified | P2 | Compare real focus order, menu Escape behavior, visible focus and animation preferences. | pending E3 |
| H08 | Footer links and disclaimer | differs | P2 | [Foot](../components/Pk.tsx) uses `#` for all links. Preserve disclaimer. Check that mobile exposes it too. | pending E3 |
| H09 | Cookie banner and consent state | missing | P2 | No cookie-banner component/consent interaction found. Determine necessary free-product equivalent based on actual cookies. | pending E3 |
| A01 | Login desktop/mobile layout | unverified | P3 | [TfLogin](../components/TfLogin.tsx), [styles](../app/globals.css). Compare loaded fonts, artwork and both email/password steps. | pending E3 |
| A02 | Email login and session persistence | unverified | P1 | Firebase path exists; no local Firebase configuration or account evidence. Test live deployment as requested. | pending E3 |
| A03 | Signup and email verification | unverified | P1 | Signup mode exists; disposable account creation has not run. Required for product audit. | pending E3 |
| A04 | Forgot password and recovery messages | unverified | P1 | Reset path exists. Test only a disposable address; do not complete a user password change. | pending E3 |
| A05 | Google button and logo | unverified | P2 | Inline SVG and custom button in TfLogin; compare official button artwork/specification and clone-only behavior. Never use original Google sign-in. | pending E3 |
| A06 | Microsoft and SSO capability | missing | P2 | Buttons disabled unconditionally. These remain feature work, not paid-plan exceptions. Do not change secrets as part of this audit. | pending E3 |
| A07 | Email/password validation and error states | unverified | P2 | Browser-native required/email checks and Firebase errors exist; compare copy, placement, field focus and retry. | pending E3 |
| A08 | Login carousel, language, contact links | differs | P2 | Play/pause state has no timer, language disabled, contact href `#`. | pending E3 |

## Workspace and form creation

| ID | Screen / feature | Status | Severity | Source evidence / next comparison | Screenshots |
| --- | --- | --- | --- | --- | --- |
| D01 | Header account identity/avatar | differs | P1 | [Dashboard](../components/typeform/Dashboard.tsx) hard-codes an account name and T avatar rather than session user. | pending E3 |
| D02 | Free-response banner and quotas | differs | P1 | Banner advertises ten free responses and upgrade actions; sidebar count always zero. Must reflect actual usage and entirely free access. | pending E3 |
| D03 | Forms/Contacts/Automations/Insights/Pages/Research tabs | missing | P1 | All except displayed Forms are anchors without destinations. Paid functionality remains in scope. | pending E3 |
| D04 | Workspaces, folders and invitations | missing | P2 | Workspace creation, private collapse and invite are decorative; no collaboration model. | pending E3 |
| D05 | Search, sort, list/grid views | missing | P2 | Controls are static divs/spans. | pending E3 |
| D06 | Suggestion cards and dismiss controls | differs | P2 | Both suggestions open generic creation; dismiss is non-keyboard `<i>`. | pending E3 |
| D07 | Forms list data and completion | differs | P1 | Any form with a response shows 100% completion regardless of views. | pending E3 |
| D08 | Empty, loading and error states | differs | P1 | Non-OK load looks like an empty workspace; rejected fetch has no recovery UI. | pending E3 |
| D09 | Create form screen and modal flow | unverified | P2 | [NewFormPage](../components/typeform/Chrome.tsx) exists; compare navigation, focus and cancellation. | pending E3 |
| D10 | AI create and chat | missing | P1 | Goal text only names a blank template in Dashboard.create. Implement an actual free generation equivalent; do not imply AI where none runs. | pending E3 |
| D11 | Template library and previews | differs | P2 | Four [templates](../lib/forms/templates.ts), including blank; no search/gallery preview. Recreate artwork. | pending E3 |
| D12 | Delete form and feedback | differs | P1 | Native confirm then DELETE; failed deletion is ignored. Test only audit-owned forms. | pending E3 |
| D13 | Duplicate form | missing | P2 | No dashboard/API duplication operation. Question duplication is separate. | pending E3 |

## Builder, design, workflow and sharing

| ID | Screen / feature | Status | Severity | Source evidence / next comparison | Screenshots |
| --- | --- | --- | --- | --- | --- |
| B01 | Breadcrumb and Content/Workflow/Connect/Share/Results | differs | P1 | [Builder](../components/typeform/Builder.tsx) Workflow does nothing; Connect slot is renamed Results; missing functional Connect panel. | pending E3 |
| B02 | Pages list, reorder, duplicate and delete | unverified | P2 | Controls exist; test order persistence, selection and logic references after mutations. | pending E3 |
| B03 | Welcome screen enable/disable and preview | differs | P2 | Add enables welcome; inline preview selection does not explicitly target an ending. Verify welcome removal and selection behavior. | pending E3 |
| B04 | Multiple endings and end-screen preview | missing | P1 | Schema has one ending; Add ending only selects it. `focusId` becomes undefined for ending, so preview starts at welcome/first question. | pending E3 |
| B05 | Add-content flyout/search | differs | P2 | [AddContentModal](../components/typeform/Chrome.tsx) lists many unsupported types; focus trapping/restoration absent. | pending E3 |
| B06 | Short text, long text, email and number | unverified | P2 | Types/settings/player/server implementations exist. Compare per-type settings and validation independently. | pending E3 |
| B07 | Multiple choice, multi-select and Other | differs | P2 | Other input is uncontrolled and can lose displayed text on revisit while answer persists; reproduce. | pending E3 |
| B08 | Yes/no | unverified | P2 | Implemented; verify Y/N, radio grouping, selection and required state. | pending E3 |
| B09 | Rating | unverified | P2 | Only stars with 3–10 maximum; compare icons, ranges, labels and keyboard. | pending E3 |
| B10 | Opinion scale and NPS | differs | P2 | Both menu items create the same scale type; range fixed 0–10 with recommendation labels; all scale results calculate NPS. | pending E3 |
| B11 | Date | differs | P2 | [validateAnswer](../lib/forms/logic.ts) accepts Date.parse-normalized impossible dates such as February 30. Native widget and date-format settings unverified. | pending E3 |
| B12 | Statement | unverified | P2 | Implemented with button text; compare layout, navigation and semantics. | pending E3 |
| B13 | Contact info | missing | P2 | Add-content item has no type; no schema/player support. | pending E3 |
| B14 | Phone number | missing | P2 | No type, country selector or validation. | pending E3 |
| B15 | Address | missing | P2 | No composite address model/player. | pending E3 |
| B16 | Website | missing | P2 | No URL question or URL validation. | pending E3 |
| B17 | Dropdown | missing | P2 | Menu stub only. | pending E3 |
| B18 | Picture choice | missing | P2 | Menu stub only; original media recreation required. | pending E3 |
| B19 | Legal and checkbox | missing | P2 | Menu stubs; no consent question model. | pending E3 |
| B20 | Ranking | missing | P2 | No ordering answer model or drag/keyboard reorder. | pending E3 |
| B21 | Matrix | missing | P2 | No row/column model, player or results. | pending E3 |
| B22 | Video/audio questions and responses | missing | P2 | Disabled/stubbed. Need free implementation and storage design. | pending E3 |
| B23 | Clarify with AI / FAQ with AI | missing | P2 | Menu stubs. Implement a real free equivalent and disclose limits. | pending E3 |
| B24 | Signature | missing | P2 | No capture/serialization/player. | pending E3 |
| B25 | File upload | missing | P2 | No upload path or answer type. | pending E3 |
| B26 | Scheduler | missing | P2 | Menu stub only. | pending E3 |
| B27 | Payment question | missing | P2 | Stub only. Owner prohibited payment-behavior changes; resolve separately before implementation. Charging for the app is excluded regardless. | pending E3 |
| B28 | Partial submission point | missing | P1 | Only full response submission exists. | pending E3 |
| B29 | Question groups | missing | P2 | Flat question array only. | pending E3 |
| B30 | Redirect ending | missing | P2 | No redirect field/behavior. | pending E3 |
| B31 | Required field setting | unverified | P1 | Toggle and server validation exist; compare interaction/error behavior. | pending E3 |
| B32 | Max characters, placeholder, answer validation | missing | P2 | Settings rows are static/off, not editable; schema lacks these values. | pending E3 |
| B33 | Mapping to contacts | missing | P2 | Static/off setting and no contacts data model. | pending E3 |
| B34 | Logic jumps and branching UI | differs | P1 | Seven operators, current-question-only rules and forward-only targets; no full Workflow builder. | pending E3 |
| B35 | Calculator, scores and variables | missing | P1 | No schema or evaluation support. | pending E3 |
| B36 | Hidden fields, prefill and answer recall | missing | P2 | No field schema, URL ingestion or title interpolation. | pending E3 |
| B37 | Undo and redo | missing | P2 | No history controls or state. | pending E3 |
| B38 | Autosave, errors and navigation safety | differs | P1 | Debounce exists; older requests can clear dirty status after newer edits; no retry/leave protection. Race risk requires reproduction. | pending E3 |
| B39 | Preview, mobile preview and restart | unverified | P2 | Overlay exists; compare focus, Escape, dimensions and no-storage preview behavior. | pending E3 |
| B40 | Chat to create | missing | P2 | Static div; no input/action. | pending E3 |
| T01 | Themes gallery, create/apply/manage | missing | P1 | [DesignPopover](../components/typeform/Chrome.tsx) has no persistent design state; controls do nothing. | pending E3 |
| T02 | Fonts, colors and custom branding | missing | P1 | No Form design fields, builder controls or player theme props. | pending E3 |
| T03 | Background images and media layouts | missing | P2 | No background/layout settings or rendering. | pending E3 |
| T04 | Brand kits and reusable themes | missing | P2 | Manage button is inert; implement free. | pending E3 |
| S01 | Share link and copy | unverified | P1 | Link exists; test both live domains/base path, clipboard errors and reload persistence. | pending E3 |
| S02 | Link slug/settings and preview metadata | differs | P2 | Edit is a span; title/description/SEO state is component-local and never persisted. Thumbnail upload inert. | pending E3 |
| S03 | Web/email embed code | differs | P1 | Embed text exists, but Copy link always copies URL, including embed subviews; incomplete HTML escaping needs verification. | pending E3 |
| S04 | Popup/slider/full-page embeds | missing | P2 | Only plain iframe output implemented. | pending E3 |
| S05 | Social sharing and QR code | missing | P2 | Social controls are spans; no QR support. | pending E3 |
| S06 | Publish/unpublish and draft isolation | differs | P1 | [sanitizeForm](../lib/forms/server.ts) defaults new forms to published; edits write same live form. No draft/published separation. | pending E3 |
| S07 | Notifications and integrations | missing | P1 | No email/webhook/integration execution routes. Build free capabilities; don't send notifications to real people during QA. | pending E3 |

## Respondent and data flow

| ID | Screen / feature | Status | Severity | Source evidence / next comparison | Screenshots |
| --- | --- | --- | --- | --- | --- |
| R01 | First question, typography and mobile layout | unverified | P2 | [Player](../components/typeform/Player.tsx) exists; compare both sizes and every implemented/new type. | pending E3 |
| R02 | Enter, letters, Y/N and arrow navigation | differs | P1 | Enter/letters/Y/N handlers exist; no ArrowUp/ArrowDown navigation handler or radio arrow behavior. | pending E3 |
| R03 | Focus order, groups and error announcements | differs | P2 | Yes/no lacks a radiogroup; choice group lacks question label; fields not linked to error text. Test screen reader basics. | pending E3 |
| R04 | Progress, transitions and reduced motion | unverified | P2 | Progress depends on current answer path; compare branched/backtracked paths and transitions. | pending E3 |
| R05 | Required/format validation and messages | unverified | P1 | Client/server validation exists; inspect every supported type and original error placement/copy. | pending E3 |
| R06 | Rapid selection/back/submit behavior | differs | P1 | Auto-advance timeout not canceled on navigation/unmount; no synchronous submission lock. Duplicate/skip risk needs browser reproduction. | pending E3 |
| R07 | Thank-you screens and redirect | differs | P2 | One static ending; missing conditional endings and redirects. | pending E3 |
| R08 | Unpublished form message | differs | P1 | [Public route](../app/f/[id]/page.tsx) calls generic notFound for both missing and unpublished forms. | pending E3 |
| R09 | Server branching and response validation | unverified | P1 | [validateSubmission](../lib/forms/logic.ts) evaluates visited path and rejects unknown question IDs; verify stored answers after backtracking. | pending E3 |
| R10 | Durable and concurrent response storage | differs | P0 | [addResponse](../lib/forms/server.ts) reads and rewrites an entire response array without transaction. Lost-update risk under concurrency; not yet reproduced. | pending E3 |
| R11 | Response limits | differs | P1 | Storage rejects at 5,000 responses while UI advertises 10. Replace artificial monetization limits; document real technical capacity truthfully. | pending E3 |
| R12 | Views, starts and step timing | differs | P1 | Only aggregate view count persisted, using another read-modify-write. No starts, device or per-step timing events. | pending E3 |
| R13 | Retry/offline behavior | unverified | P1 | [FillForm](../components/typeform/FillForm.tsx) catches submission errors; test retained answers and duplicate prevention after uncertain network outcome. | pending E3 |

## Results and product states

| ID | Screen / feature | Status | Severity | Source evidence / next comparison | Screenshots |
| --- | --- | --- | --- | --- | --- |
| O01 | Summary and per-question charts | unverified | P2 | [Results](../components/typeform/Results.tsx) supports current ten types. Compare all answer types and branched denominators. | pending E3 |
| O02 | Responses list/detail/search/filter/delete | differs | P2 | Simple full table only; text summary truncates to latest 50. No detail/filter/delete workflow. | pending E3 |
| O03 | Smart Insights | missing | P2 | Tab shows a message to use an external AI; no free analysis equivalent. | pending E3 |
| O04 | Performance metrics | differs | P1 | Starts equals submissions; completion uses views. Missing instrumentation prevents a true funnel. | pending E3 |
| O05 | Performance date/device filters | missing | P2 | Date button only changes label; device button inert. | pending E3 |
| O06 | Drop-off and step performance | missing | P1 | Hard-coded example counts, including negative drop-off; no step analytics. | pending E3 |
| O07 | Export | unverified | P1 | CSV exists with formula protection; test Unicode, multiline/quotes, empty set, authorization and all new types. Excel export absent. | pending E3 |
| O08 | Results empty/loading/error states | differs | P1 | Non-OK/rejected results fetch can remain at Loading results indefinitely. | pending E3 |
| O09 | Reports, sharing and comparison | missing | P2 | No report sharing or period comparison workflows. | pending E3 |
| X01 | Product 404, loading and error boundaries | missing | P2 | No app-specific `not-found`, `loading` or `error` boundary files. Compare valid empty states separately from failure. | pending E3 |
| X02 | Responsive dashboard/builder/results | unverified | P1 | Need actual 390px browser coverage, not only marketing CSS. | pending E3 |
| X03 | Authentication/ownership checks | unverified | P1 | Owner checks exist; verify disposable second-user denial, logout and expired-session recovery. | pending E3 |
| X04 | Modal focus and keyboard accessibility | differs | P2 | Add-content has Escape but lacks modal semantics/focus trap/restore; several controls use spans/i elements. | pending E3 |

## Intentional exceptions and decisions

| ID | Exception / decision | State |
| --- | --- | --- |
| EX1 | Product subscription prices, upsells, payment gates and paid-tier quotas are replaced by free access. Paid features themselves stay in scope. | Explicitly authorized by owner. Existing banners still need correction. |
| EX2 | Independent TypeformIsDead identity, original recreated artwork, OFL substitute fonts and existing disclaimer. | Required by owner. Visual approximation still needs review. |
| EX3 | Pricing and other marketing pages beyond home/login. | Explicitly out of scope. No pricing PR planned. |
| DEC1 | Payment question functionality vs. original instruction not to change payment behavior. | Human scope decision needed before implementation. No payment integration changes made. |
| DEC2 | Hosted AI/video/storage/integrations with real operating costs. | Implement free/local alternatives where feasible. Missing implementations are not accepted exceptions; record capability-specific constraints and demonstrate the alternative. |
| DEC3 | Restore browser execution, npm registry access and GitHub API connectivity. | Environment blocker; needed for evidence, builds, account setup and PR creation. |

## REA reference

The owner supplied [morluto/rea](https://github.com/morluto/rea), inspected at `fe7bcc3`. It is an MIT-licensed investigation tool, not a ready-made form builder. Its [browser scenarios](https://github.com/morluto/rea/blob/fe7bcc3/docs/browser-scenario-contract.md) and [evidence ledgers](https://github.com/morluto/rea/blob/fe7bcc3/docs/reconstruction-obligation-ledgers.md) are useful models for recording actions, observed outcomes and unknowns separately. Its browser features still require working Chrome/Playwright; they do not resolve E3. No REA code, proprietary source, agent configuration or dependencies were copied or installed. Any later reuse must retain applicable license notices.

## Capture and verification procedure

1. Use a compatible Node version; install locked dependencies. Restore browser execution. Configure local development only from authorized configuration; do not commit env files. Without Firebase, use the live clone for auth checks and local demo for isolated product checks.
2. Start `NODE_OPTIONS=--unhandled-rejections=warn npm run dev`. Create disposable accounts via email only. Keep credentials and auth state outside the repository. Record only non-sensitive fixture identifiers in evidence.
3. Run `node scripts/parity-capture.mjs` to capture public home/login pairs. It writes viewport/full-page PNGs, computed styles and a side-by-side HTML index under ignored `test-results/parity/`. It does not claim a match or exercise authenticated functionality.
4. Compare every product scenario using equivalent audit-owned forms on original and clone. Capture at 1440×900 and 390×844; record browser/version, page state, font readiness, locale, cookie state and animation state. Use real buttons/keyboard, not API-only tests, to prove end-to-end behavior.
5. For each fix, add original/before/after evidence under `docs/parity/<area>/`, link the exact report rows, and include focused behavioral regression evidence. Do not add account/session artifacts or third-party proprietary assets to application code.
6. Run lint, typecheck, unit tests as relevant, and build. Open one small PR per logical area only after recording actual gate outcomes. Never treat an unavailable check as passed. Do not merge.

Recommended order: restore verification → home/login → dashboard/free-access copy → builder state/publishing → response integrity → question types/settings → logic/variables → design → share/integrations → results/analytics → remaining product modules. Split areas further whenever a PR would otherwise be too large.

## PR ledger

| Area | PR | Validation | Evidence |
| --- | --- | --- | --- |
| Baseline report, public capture utility and lint gate | Local branch `qa/parity-baseline`; not opened | Lint, typecheck, 19 unit tests, build and capture-script syntax pass (E11). One existing image lint advisory. | Source audit only; no paired screenshots. Tooling/JSX escaping changes preserve rendered text. |
| Product fixes | Not opened | Not implemented/verified yet | All unresolved rows above remain open |
