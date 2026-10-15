# Home hero and navigation correction

Reference: the owner's original home capture (`original-user.png`, 2865×1484) and clone capture (`before-user.png`, 2876×1471), supplied 2026-10-15. Browser chrome/thumbnail overlays in the supplied clone image are not app UI. Approximate CSS dimensions assume a 2× device scale.

The original uses a light `#faf9fb` background, a dark `#3c313f` announcement, a large serif heading with purple underline, a dark CTA, and overlapping example forms. The clone instead used a dark hero, sans-serif headline, static product tabs and a 2,900px sticky region. This change replaces that hero and uses one responsive DOM layout instead of a separate absolutely positioned mobile replica.

The serif is locally hosted Instrument Serif under OFL 1.1. The preview forms are recreated in HTML/CSS and use licensed replacement photography. Product identity, truthful free-product copy and licensed assets are intentional differences. The new hero does not attribute Typeform's customer/response statistics to the clone; pre-existing claims in lower sections remain tracked as H01.

Owner clarification: home navigation and CTAs should lead to login. Platform, Solutions, Resources, Pricing, Contact sales, Sign up, hero actions, sample-form cards and footer navigation use `/login`. This intentionally replaces mega-menu behavior. The independent-project disclaimer remains.

Validation: lint, typecheck and production build pass. A local production HTTP check confirms both pages return 200, all 44 home links resolve to `/typeformisdead/login`, and both photographs and the font return 200. Paired original/before evidence is provided above. **No after screenshot or visual-match verdict is available:** all three Playwright browser engines abort before opening a page in this environment. The lower page sections still require a separate reference comparison; this change does not certify the entire home page.
