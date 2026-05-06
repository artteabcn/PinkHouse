# Pink House — Project CLAUDE.md

Extends the global `~/.claude/CLAUDE.md`. Rules here override or extend global defaults.

---

## Client

- **Property**: Pink House Bed & Breakfast
- **Location**: Lamai, Koh Samui, Surat Thani, Thailand
- **Type**: Boutique B&B / Guesthouse
- **Coordinates**: 9.4740216°N, 100.0541465°E

---

## Locales

Four locales (extends global default of en/fr/th):

- `en` — English (default)
- `fr` — French
- `de` — German
- `th` — Thai

Message files: `messages/{en,fr,de,th}.json` — always update all four simultaneously.

---

## Brand

| Token              | Value     | Usage                                         |
| ------------------ | --------- | --------------------------------------------- |
| `brand-pink`       | `#dc4080` | Primary accent (matches logo bg), CTAs        |
| `brand-pink-light` | `#fce0eb` | Backgrounds, badges                           |
| `brand-pink-dark`  | `#a8285c` | Hover states                                  |
| `brand-blush`      | `#fdf3f7` | Soft section backgrounds                      |
| `brand-cream`      | `#fff7ed` | Page background                               |
| `brand-teal`       | `#0f7b6e` | Secondary accent + body text + section labels |
| `brand-teal-light` | `#d4e8e4` | Dividers, soft accents                        |
| `brand-teal-dark`  | `#0a5247` | Footer bg, dark accents                       |
| `brand-ink`        | `#0f7b6e` | Body text (NEVER pure black)                  |
| `brand-ink-soft`   | `#4a8a82` | Secondary text                                |

Fonts: **Cormorant Garamond** (h3, refined serif) + **Outfit** (body, geometric sans) + **Yellowtail** (.section-title and .hero-title — brushed script matching the logo wordmark). Loaded from Google Fonts in `[locale]/layout.tsx`.

Design reference: Orchid Lodge Samui (orchidlodgesamui.com) — boutique tropical aesthetic. Pink replaces sage as primary; teal replaces sage as secondary.

---

## Deployment

- **Hosting**: Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)
- **Adapter**: `open-next.config.ts` — NOT `@cloudflare/next-on-pages` (deprecated, incompatible with Next 16)
- **Database**: Cloudflare D1 — binding name `DB` (see `wrangler.toml`)
- **Worker entry**: `.open-next/worker.js`; static assets: `.open-next/assets` (via `[assets]` binding)
- **Build**: `pnpm run build:cf` — deploy via `wrangler deploy`

---

## Environment Variables

Set in Cloudflare Pages dashboard for production. Copy `.env.example` → `.env.local` for dev.

| Variable                    | Purpose                                                           |
| --------------------------- | ----------------------------------------------------------------- |
| `TWILIO_ACCOUNT_SID`        | WhatsApp via Twilio                                               |
| `TWILIO_AUTH_TOKEN`         | WhatsApp via Twilio                                               |
| `WHATSAPP_FROM`             | Twilio sandbox or registered number                               |
| `WHATSAPP_TO`               | Owner's WhatsApp number                                           |
| `RESEND_API_KEY`            | Transactional email                                               |
| `RESEND_FROM`               | From address                                                      |
| `SMOOBU_API_KEY`            | Smoobu REST API key — server-side only (Settings → API in Smoobu) |
| `CLOUDFLARE_ACCOUNT_ID`     | For drizzle-kit remote migrations                                 |
| `CLOUDFLARE_D1_DATABASE_ID` | D1 database ID                                                    |
| `CLOUDFLARE_API_TOKEN`      | For drizzle-kit remote migrations                                 |

---

## Smoobu Booking Integration

Native booking flow on `/book` (no iframe widget — uses Smoobu's REST API directly).

- API client: `src/lib/smoobu.ts`
- Config: `src/config/smoobu.ts` — channel IDs and apartment mapping
- Channel ID for direct-website reservations: **5722806**
- Apartment IDs: `3040751, 3040756, 3040766, 3040771, 3040776, 3040781`
- Local roomId → Smoobu apartmentId mapping in `src/config/smoobu.ts` — **TODO: confirm with user which 3 of the 6 apartments map to standard/deluxe/family**

**Booking flow:**

1. `BookingForm.tsx` (client) → `POST /api/availability` with date range + guests
2. Server calls `checkApartmentAvailability` and `getRates` on Smoobu, returns available apartments + total price
3. User selects an apartment, fills guest details
4. `POST /api/booking` validates with Zod, inserts into D1, calls `createReservation` on Smoobu, updates D1 row with reservation ID, fires WhatsApp + email
5. If Smoobu fails: D1 row is marked `status: "failed"`; the API returns 502 so the user can retry

**Local development**: D1 is unavailable under `next dev`; the booking route silently skips D1 inserts and only calls Smoobu + notifications. Use `pnpm preview` (wrangler) for full local D1 testing.

---

## Rooms

Three room types (IDs used as enum values in Zod schema and DB):

- `standard` — 1 Queen, garden view, max 2 guests, 1800 THB/night
- `deluxe` — 1 King, pool view, max 2 guests, 2600 THB/night
- `family` — 2 bedrooms, max 4 guests, 4200 THB/night

---

## Key Files

| File                             | Purpose                                     |
| -------------------------------- | ------------------------------------------- |
| `src/db/schema.ts`               | Drizzle schema — bookings + contacts tables |
| `src/middleware.ts`              | next-intl edge middleware (i18n routing)    |
| `src/lib/whatsapp.ts`            | Twilio WhatsApp notifications               |
| `src/lib/resend.ts`              | Resend email confirmations                  |
| `src/lib/validations/booking.ts` | Zod schema for bookings                     |
| `src/lib/validations/contact.ts` | Zod schema for contact form                 |
| `src/app/api/contact/route.ts`   | Contact form API                            |
| `src/app/api/booking/route.ts`   | Booking API                                 |
| `messages/*.json`                | i18n strings — en/fr/de/th (incl. `seo.*`)  |
| `wrangler.toml`                  | Cloudflare D1 + Pages config                |
| `open-next.config.ts`            | OpenNext Cloudflare adapter config          |
| `src/config/site.ts`             | Single source of truth for SEO/JSON-LD      |
| `src/components/SocialIcons.tsx` | Inline FB/IG SVGs + `SOCIAL_LINKS`          |
| `src/app/robots.ts`              | Robots config (allows all, disallows /api/) |
| `src/app/sitemap.ts`             | Sitemap (4 locales × all routes + hreflang) |

---

## SEO

- **Single source of truth**: `src/config/site.ts` — URL, address, geo, social, OG image, locales. All metadata + JSON-LD pull from here.
- **Per-page metadata**: every locale page exports `generateMetadata` (async, takes `{ params }`) — title/description from `seo.*` i18n keys, canonical URL via `localePath()`, hreflang alternates via `alternateLanguages()`, OpenGraph + Twitter card.
- **JSON-LD**: `LodgingBusiness` schema lives in `src/app/[locale]/page.tsx` as the `LodgingJsonLd` server component. Phone is **deliberately omitted** until the real number replaces the `+66 77 XXX XXX` placeholder in `messages/*.json`.
- **Root layout** (`src/app/layout.tsx`) sets `metadataBase`, `themeColor`, icons, and robots defaults — these inherit into all routes.
- When adding a new route: (a) add `seo.<route>.title`/`description` to all four locale files, (b) add the route to `ROUTES` in `src/app/sitemap.ts`, (c) export `generateMetadata` using the same pattern as `[locale]/page.tsx`.

---

## Self-Improvement

When Claude is corrected:

1. Fix the issue
2. Add a rule here (or to `~/.claude/CLAUDE.md`)
3. Note with `# Added: [date] — [reason]`

# Added: 2026-04-24 — Use @opennextjs/cloudflare (not @cloudflare/next-on-pages — deprecated and incompatible with Next 16)

# Added: 2026-04-24 — Middleware must be src/middleware.ts (edge runtime). Next.js 16 deprecated this in favour of proxy.ts but OpenNext requires edge; proxy.ts is Node.js-only and rejected by OpenNext.

# Added: 2026-04-24 — open-next.config.ts must use defineCloudflareConfig() from @opennextjs/cloudflare, not a manual config object (edgeExternals is not a typed property on OpenNextConfig).

# Added: 2026-05-06 — `lucide-react` is pinned at v1.9.0 in this repo, which predates brand icons. Do NOT import `Facebook`, `Instagram`, or any brand glyph from `lucide-react` — TS will fail Cloudflare's build. Use the inline SVGs in `src/components/SocialIcons.tsx` instead.

# Added: 2026-05-06 — When adding/changing routes, keep `src/app/sitemap.ts` and `seo.*` i18n keys in sync; missing entries silently degrade SEO without failing the build.
