# Login screenshot correction

Reference: the owner's original Typeform capture (`original-user.png`, 2867×1466) and clone capture (`before-user.png`, 2871×1511), supplied 2026-10-15. The images have different heights; the measurements below infer a 2× device scale rather than claiming browser-computed CSS.

The original form is about 400 CSS px wide; the clone used 280 px. Original text is approximately 24/16 px for heading/body, while the clone used 15/11 px. Original controls are about 44 px high, versus 34 px. The original split panels use `#f7f7f8` and `#2a222b`, sampled from the supplied image.

Changed: form width, typography, control height/radius, header and panel margins, subtitle spacing, SSO placement, signup divider, carousel width/height, neighboring-card visibility and recreated sample-form artwork. Password recovery now appears on the password step. Carousel previous/next, dots and pause/play work; automatic rotation pauses during interaction and respects reduced motion.

Identity and licensed replacement photography remain intentional differences. No Typeform photograph, proprietary font or source was copied. The original screenshots are review evidence, not assets rendered by the app.

Validation: lint, typecheck and production build pass. Chromium (both cached builds), Firefox and WebKit all abort before navigation in this execution environment. **No after screenshot or visual-match verdict is available yet.** Mobile layout is implemented but has no supplied mobile reference or successful browser capture.
