import { eq } from "drizzle-orm";
import { googleReviewsCache } from "@/db/schema";
import { getDbOrNull } from "@/lib/db/get-db";
import { routing } from "@/i18n/routing";

export interface GoogleReview {
  displayName: string;
  rating: number;
  text: string;
  relativeTime: string;
}

export interface GoogleReviewsData {
  reviews: GoogleReview[];
  placeRating?: number;
  totalRatings?: number;
}

// Frequency of fresh pulls from Google's Places API. The Google Places
// `reviews` field is reordered regularly and recent reviews appear in the
// response, so a short TTL keeps the newest guest voices on the site.
// Default: 6 hours (was 12h -> halved 2026-08-03 to surface new reviews
// the same day). Combine with the auto-refresh below and CDN SWR for ~6h
// worst-case lag.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// Restrict the requested translation language to the site's locales; anything
// else falls back to the default locale.
function normalizeLanguage(locale: string): string {
  return (routing.locales as readonly string[]).includes(locale) ? locale : routing.defaultLocale;
}

interface PlacesApiResponse {
  reviews?: Array<{
    rating?: number;
    text?: { text?: string };
    relativePublishTimeDescription?: string;
    authorAttribution?: { displayName?: string };
  }>;
  rating?: number;
  userRatingCount?: number;
}

async function fetchFromGoogle(language: string): Promise<GoogleReviewsData> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  if (!apiKey || !placeId) return { reviews: [] };

  try {
    // `languageCode` makes Google return the review text machine-translated
    // into that language (and localizes the relative-time string too).
    const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=${encodeURIComponent(language)}`;
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "reviews,rating,userRatingCount",
      },
    });
    if (!res.ok) return { reviews: [] };

    const json = (await res.json()) as PlacesApiResponse;

    // Google Places (v1) does not document a stable recency ordering for
    // the `reviews` field. Some calls return chronological-newest-first; others
    // surface the most "relevant" reviews which can bury a recent one. We sort
    // by the relative-time string (e.g. "3 weeks ago", "1 month ago") as a
    // best-effort freshness order, so new reviews always surface at the top.
    // Falls back to the original order if the strings are absent.
    const sortByFreshness = (a: GoogleReview, b: GoogleReview): number => {
      const parse = (s: string): number => {
        const m = s.match(/(\d+)\s*(day|week|month|year)/i);
        if (!m) return Number.MAX_SAFE_INTEGER;
        const n = parseInt(m[1], 10);
        const unit = m[2].toLowerCase();
        return n * (unit === "year" ? 365 : unit === "month" ? 30 : unit === "week" ? 7 : 1);
      };
      return parse(a.relativeTime) - parse(b.relativeTime);
    };

    const reviews: GoogleReview[] = (json.reviews ?? [])
      .filter((r) => r.rating === 5)
      .map((r) => ({
        displayName: r.authorAttribution?.displayName ?? "Guest",
        rating: r.rating ?? 5,
        text: r.text?.text ?? "",
        relativeTime: r.relativePublishTimeDescription ?? "",
      }))
      .sort(sortByFreshness);

    return { reviews, placeRating: json.rating, totalRatings: json.userRatingCount };
  } catch {
    return { reviews: [] };
  }
}

export async function getGoogleReviews(
  locale: string = routing.defaultLocale
): Promise<GoogleReviewsData> {
  const language = normalizeLanguage(locale);
  // Cache each language separately so a French visitor never gets the German
  // translation just because it was fetched first.
  const cacheKey = `reviews:${language}`;
  const db = await getDbOrNull();

  if (db) {
    const rows = await db
      .select()
      .from(googleReviewsCache)
      .where(eq(googleReviewsCache.cacheKey, cacheKey))
      .limit(1);

    const cached = rows[0];
    if (cached) {
      const age = Date.now() - new Date(cached.fetchedAt).getTime();
      if (age < CACHE_TTL_MS) {
        return JSON.parse(cached.data) as GoogleReviewsData;
      }
    }

    const data = await fetchFromGoogle(language);
    if (data.reviews.length > 0 || data.placeRating) {
      await db
        .insert(googleReviewsCache)
        .values({
          cacheKey,
          data: JSON.stringify(data),
          fetchedAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: googleReviewsCache.cacheKey,
          set: { data: JSON.stringify(data), fetchedAt: new Date().toISOString() },
        });
    }
    return data;
  }

  return fetchFromGoogle(language);
}
