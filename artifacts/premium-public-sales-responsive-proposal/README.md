# Premium responsive CSS proposal (historical)

This file records the original isolated override proposal for the Método Código
Lucrativo Premium public sales page. The selected responsive behaviors have
since been integrated directly into `client/src/pages/PreviewPublicSales.css`.
Do not load this proposal alongside the active stylesheet; that would duplicate
rules and could make later changes diverge. The original proposal is retained
for reference only.

## Selectors and breakpoints

- **`max-width: 1024px` — hero order:** within
  `.real-public-sales-preview .sales-hero-copy`, the existing CSS grid areas
  now place `.top-promo-banner` immediately after the title and before the
  description and actions. This applies to tablet and mobile while preserving
  the desktop composition above 1024px.
- **`max-width: 1024px`, `max-height: 540px`, landscape — compact navigation:**
  `.nav-links.is-open` becomes a vertically stacked, vertically scrollable
  panel with horizontal overflow and touch dragging disabled. The mobile menu
  button is exposed for short landscape viewports wider than the usual mobile
  breakpoint. Public and utility navigation groups remain intact.
- **`max-width: 760px` — floating controls:** the unavailable
  `.member-chat-fab-wrap` is surfaced as a visibly disabled control at the
  lower left; `.public-conversion-cta` stays at the lower right, constrained
  and allowed to wrap on very narrow screens. Safe-area insets are respected,
  and bottom padding on `.sales-page` provides a clear scroll end below the
  fixed controls.