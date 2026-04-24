# Pink House — Project CLAUDE.md

Extends the global `~/.claude/CLAUDE.md`. Rules here override or extend global defaults.

---

## Client

- **Property**: Pink House Bed & Breakfast
- **Location**: Bophut, Koh Samui, Surat Thani, Thailand
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

| Token              | Value     | Usage                                   |
| ------------------ | --------- | --------------------------------------- |
| `brand-pink`       | `#f472b6` | Primary accent, CTAs, headings          |
| `brand-pink-light` | `#fce7f3` | Backgrounds, badges                     |
| `brand-pink-dark`  | `#be185d` | Hover states                            |
| `brand-cream`      | `#fffbf5` | Page background                         |
| `brand-sage`       | `#6b7f6e` | Amenities section BG, secondary accents |
| `brand-sage-light` | `#d4dfd6` | Borders, dividers                       |
| `brand-charcoal`   | `#1f2937` | Footer BG, body text                    |

Fonts: **Playfair Display** (headings/serif) + **Inter** (body/sans) — loaded from Google Fonts in `[locale]/layout.tsx`.

Design reference: Orchid Lodge Samui (orchidlodgesamui.com) — luxury boutique tropical aesthetic.

---

## Deployment

- **Hosting**: Cloudflare Pages via OpenNext (`@opennextjs/cloudflare`)
- **Adapter**: `open-next.config.ts` — NOT `@cloudflare/next-on-pages` (deprecated, incompatible with Next 16)
- **Database**: Cloudflare D1 — binding name `DB` (see `wrangler.toml`)
- **Build**: `pnpm run build` → `pnpm run deploy` (via wrangler pages deploy)

---

## Environment Variables

Set in Cloudflare Pages dashboard for production. Copy `.env.example` → `.env.local` for dev.

| Variable                    | Purpose                             |
| --------------------------- | ----------------------------------- |
| `TWILIO_ACCOUNT_SID`        | WhatsApp via Twilio                 |
| `TWILIO_AUTH_TOKEN`         | WhatsApp via Twilio                 |
| `WHATSAPP_FROM`             | Twilio sandbox or registered number |
| `WHATSAPP_TO`               | Owner's WhatsApp number             |
| `RESEND_API_KEY`            | Transactional email                 |
| `RESEND_FROM`               | From address                        |
| `CLOUDFLARE_ACCOUNT_ID`     | For drizzle-kit remote migrations   |
| `CLOUDFLARE_D1_DATABASE_ID` | D1 database ID                      |
| `CLOUDFLARE_API_TOKEN`      | For drizzle-kit remote migrations   |

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
| `src/lib/whatsapp.ts`            | Twilio WhatsApp notifications               |
| `src/lib/resend.ts`              | Resend email confirmations                  |
| `src/lib/validations/booking.ts` | Zod schema for bookings                     |
| `src/lib/validations/contact.ts` | Zod schema for contact form                 |
| `src/app/api/contact/route.ts`   | Contact form API                            |
| `src/app/api/booking/route.ts`   | Booking API                                 |
| `messages/*.json`                | i18n strings — en/fr/de/th                  |
| `wrangler.toml`                  | Cloudflare D1 + Pages config                |
| `open-next.config.ts`            | OpenNext Cloudflare adapter config          |

---

## Self-Improvement

When Claude is corrected:

1. Fix the issue
2. Add a rule here (or to `~/.claude/CLAUDE.md`)
3. Note with `# Added: [date] — [reason]`

# Added: 2026-04-24 — Use @opennextjs/cloudflare (not @cloudflare/next-on-pages — deprecated and incompatible with Next 16)
