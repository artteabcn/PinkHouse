# Pink House — Project Resume

Last updated: 2026-05-07

A boutique B&B website for Pink House Koh Samui (Lamai). Marketing site

- native Smoobu booking flow on Cloudflare Workers.

---

## Stack snapshot

| Layer     | Choice                                               |
| --------- | ---------------------------------------------------- |
| Framework | Next.js 15 (App Router) via `@opennextjs/cloudflare` |
| Hosting   | Cloudflare Workers (D1 binding `DB`)                 |
| i18n      | `next-intl` — locales: en (default), fr, de, th      |
| Styling   | Tailwind v4 + brand tokens (see `CLAUDE.md`)         |
| Forms     | React Hook Form + Zod                                |
| ORM       | Drizzle + D1                                         |
| Booking   | Smoobu REST API (channel 5722806)                    |
| Email     | Cloudflare Email Routing (owner) + Resend (guests)   |
| Notif.    | WhatsApp via Twilio                                  |

---

## What's built

**Marketing site (homepage `/[locale]`):**
Hero, About, Rooms, Amenities, Testimonials, Gallery, Contact (form +
map + WhatsApp + colorized FB/IG CTAs), minimalist Footer (logo + 2
social icons). Section padding tightened to `py-20`.

**Booking flow (`/[locale]/book`):**
3-step BookingForm → `/api/availability` (Smoobu `/rates`) → `/api/booking`
(Zod → D1 insert → Smoobu `createReservation` → email + WhatsApp). On
Smoobu failure: D1 row marked `status: "failed"`, API returns 502.

**SEO (added 2026-05-06):**

- `src/config/site.ts` — central URL/geo/address/social config.
- Per-locale `generateMetadata` on `/` and `/book`: localized title,
  description, canonical, hreflang alternates (4 locales + `x-default`),
  OpenGraph, Twitter card.
- `LodgingBusiness` JSON-LD on homepage (address, geo, sameAs, amenities,
  available languages).
- `src/app/robots.ts` + `src/app/sitemap.ts` (4 locales × all routes).
- Root layout: `metadataBase`, `themeColor: #dc4080`, icons, robots
  defaults.
- `seo.*` keys in all four `messages/*.json`.

---

## Open / pending

- **Custom OG image** — currently reusing `/images/main.jpeg`. A
  purpose-built 1200×630 hero with logo + tagline overlay performs
  better on social shares.
- **Search Console** — submit sitemap at `https://pinkhousesamui.com/sitemap.xml`
  and add the verification meta tag.
- **Reviews** — once Booking/Google reviews exist, add `AggregateRating`
  to the `LodgingBusiness` schema.
- **Footer keys** — `footer.*` i18n keys were removed when the footer
  was stripped down. If a richer footer ever returns, re-add them.

---

## Recent commits

```
2451284 feat(seo): localized metadata, hreflang, JSON-LD, robots, sitemap
a4ce852 feat: minimal footer, tighter sections, social CTAs in contact
b56f770 fix: inline Facebook/Instagram SVGs (lucide v1.9 lacks brand icons)
8e5e301 feat: add Facebook + Instagram links to footer
8453c26 feat: richer room cards on /book + surface email/whatsapp failures
```

---

## Gotchas (see CLAUDE.md self-improvement notes)

- `lucide-react@1.9.0` has no brand icons — use `SocialIcons.tsx`.
- Use `@opennextjs/cloudflare`, not `@cloudflare/next-on-pages`.
- Middleware must be `src/middleware.ts` (edge runtime), not `proxy.ts`.
- `open-next.config.ts` must use `defineCloudflareConfig()`.
- Keep `sitemap.ts` and `seo.*` i18n keys in sync with new routes.
