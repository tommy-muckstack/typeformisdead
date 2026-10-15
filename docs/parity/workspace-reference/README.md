# Workspace reference — 2026-10-15

The owner supplied [this side-by-side screenshot](paired-before.png): Typeform on the left, the clone on the right. It is 3440×1150 pixels; the panes have different widths. No computed-style measurements or browser zoom metadata were supplied.

The screenshot shows larger original workspace type, a pale #f7f7f8 workspace canvas, more vertical separation, and outlined icons where the clone used text glyphs. The correction uses 24px workspace headings, 14px navigation/body text, a 256px desktop sidebar, 96px suggestion cards, and locally bundled Google Material Symbols Outlined under Apache-2.0. These dimensions are estimates from screenshot geometry, not verified computed styles.

The ten-response banner, quota bar, upgrade actions and premium diamond badges are intentionally removed under the owner's free-product requirement. The sidebar displays the actual total of loaded form responses without a plan denominator. Account name/initial come from the signed-in session. The prompt shortcut opens the existing free form creator.

After screenshots at 1440px and 390px remain unavailable: Chromium, Firefox and WebKit fail to start in this environment. Production HTTP checks validate markup and accessible icon labels but cannot establish visual parity. The reference shows one original form and an empty clone workspace; no fake form was added to imitate its data.
