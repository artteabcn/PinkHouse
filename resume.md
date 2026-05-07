# Pink House — Project Resume

Last updated: 2026-05-07

A boutique B&B website for Pink House Koh Samui (Lamai). Marketing site

- native Smoobu booking flow on Cloudflare Pages.

---

## Stack snapshot

| Layer     | Choice                                                                |
| --------- | --------------------------------------------------------------------- |
| Framework | Next.js 15 (App Router) via `@opennextjs/cloudflare`                  |
| Hosting   | Cloudflare **Pages** (D1 binding `DB`) — see Gotchas                  |
| i18n      | `next-intl` — locales: en (default), fr, de, th                       |
| Styling   | Tailwind v4 + brand tokens (see `CLAUDE.md`)                          |
| Forms     | React Hook Form + Zod                                                 |
| ORM       | Drizzle + D1                                                          |
| Booking   | Smoobu REST API (channel 5722806, 6× `standard` units)                |
| Email     | Resend (guest confirmations + owner alerts, single provider)          |
| Phone     | `+66 81 106 5304` — sourced from `SITE.phone` in `src/config/site.ts` |

---

## What's built

**Marketing site (homepage `/[locale]`):**
Hero, About, Rooms, Amenities, Testimonials, Gallery, Contact (form +
map + WhatsApp + colorized FB/IG CTAs), minimalist Footer (logo + 2
social icons). Section padding tightened to `py-20`.

**Booking flow (`/[locale]/book`):**
3-step BookingForm → `/api/availability` (Smoobu `/rates`) → `/api/booking`
(Zod → D1 insert → Smoobu `createReservation` → owner alert + guest
confirmation, both via Resend). On Smoobu failure: D1 row marked
`status: "failed"`, API returns 502. **No payment step yet — see
Stripe item below.**

**SEO (added 2026-05-06):**

- `src/config/site.ts` — central URL/geo/address/social/phone config.
- Per-locale `generateMetadata` on `/` and `/book`: localized title,
  description, canonical, hreflang alternates (4 locales + `x-default`),
  OpenGraph, Twitter card.
- `LodgingBusiness` JSON-LD on homepage (address, geo, telephone,
  sameAs, amenities, available languages).
- `src/app/robots.ts` + `src/app/sitemap.ts` (4 locales × all routes).
- Root layout: `metadataBase`, `themeColor: #dc4080`, icons, robots
  defaults.
- `seo.*` keys in all four `messages/*.json`.

---

## Open / pending

- **Stripe payment integration** — the headline next-session task.
  Booking flow currently creates a Smoobu reservation with no money
  collected. Needs to slot a payment step in `BookingForm` between the
  guest-details form (step `"guest"`) and the success screen.
  Design decisions to confirm with the owner before coding:
  - **Charge model**: deposit (e.g. 30%) vs full prepayment vs
    authorization-hold-only. Affects refund policy and cancellation
    window in Smoobu's `cancellation` field.
  - **Currency**: THB (Stripe Thailand supports it; verify the
    Stripe account is in TH and not US).
  - **Failure mode**: if Stripe succeeds but Smoobu `createReservation`
    fails afterwards, we owe the guest a refund — current code path
    doesn't handle this. Likely sequence should be: Stripe
    `PaymentIntent` (manual capture) → Smoobu reservation → capture
    on success / cancel intent on failure.
  - **Webhook**: `/api/stripe/webhook` for `payment_intent.succeeded`
    and `.payment_failed` to update D1 `bookings.paymentStatus`.
    Smoobu also has a `price-paid` field on the reservation that
    should be kept in sync.
    New env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
    `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. Add a `paymentStatus` +
    `stripePaymentIntentId` column to the `bookings` table (Drizzle
    migration via `pnpm drizzle-kit generate`). Use `@stripe/stripe-js` +
    `@stripe/react-stripe-js` on the client (Stripe Elements / Payment
    Element), `stripe` SDK on the server.
- **Custom OG image** — currently reusing `/images/main.jpeg`. A
  purpose-built 1200×630 hero with logo + tagline overlay performs
  better on social shares.
- **Search Console** — submit sitemap at `https://pinkhousesamui.com/sitemap.xml`
  and add the verification meta tag.
- **Reviews** — once Booking/Google reviews exist, add `AggregateRating`
  to the `LodgingBusiness` schema.
- **Footer keys** — `footer.*` i18n keys were removed when the footer
  was stripped down. If a richer footer ever returns, re-add them.
- **Resend domain verification** — confirm `pinkhousesamui.com` is
  verified in the Resend dashboard, otherwise owner emails will 403
  at runtime even though the build succeeds.

---

## Recent commits

```
033bb06 fix(deploy): send owner emails via Resend (Pages doesn't support send_email)
6c8a45b feat: cf email notifications, live phone, single standard room type
d42f256 docs: SEO section in CLAUDE.md + add resume.md project status
2451284 feat(seo): localized metadata, hreflang, JSON-LD, robots, sitemap
a4ce852 feat: minimal footer, tighter sections, social CTAs in contact
```

---

## Gotchas (see CLAUDE.md self-improvement notes)

- **Cloudflare Pages ≠ Workers.** Despite `CLAUDE.md` calling the
  hosting "Workers", the project deploys as Pages. Pages rejects the
  `[[send_email]]` binding (Workers-only) — use HTTP-based providers
  (Resend, MailChannels) instead. Same caveat applies to other
  Workers-exclusive bindings before reaching for them.
- `lucide-react@1.9.0` has no brand icons — use `SocialIcons.tsx`.
- Use `@opennextjs/cloudflare`, not `@cloudflare/next-on-pages`.
- Middleware must be `src/middleware.ts` (edge runtime), not `proxy.ts`.
- `open-next.config.ts` must use `defineCloudflareConfig()`.
- Keep `sitemap.ts` and `seo.*` i18n keys in sync with new routes.
