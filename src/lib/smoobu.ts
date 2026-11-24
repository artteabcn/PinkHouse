import { signSmoobuRequest, smoobuTimestamp } from "@/lib/smoobu-hmac";

const SMOOBU_HOST = "https://login.smoobu.com";
const BASE_URL = `${SMOOBU_HOST}/api`;

class SmoobuError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`Smoobu API ${status}: ${body}`);
    this.name = "SmoobuError";
    this.status = status;
    this.body = body;
  }
}

// A value pasted into a dashboard field often carries stray whitespace or
// wrapping quotes, which Smoobu answers with 401.
function cleanSecret(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function getApiKey(): string {
  const key = process.env.SMOOBU_API_KEY;
  if (!key) throw new Error("SMOOBU_API_KEY is not configured");
  return cleanSecret(key);
}

// The API secret from Settings > Advanced > API Keys. When present every
// request is HMAC-signed (the only method Smoobu accepts since 2026-10-31).
// Without it we fall back to the legacy `Api-Key` header, which Smoobu has
// sunset, so a missing secret ends in the 401 logged below.
function getApiSecret(): string | null {
  const secret = process.env.SMOOBU_API_SECRET;
  return secret ? cleanSecret(secret) : null;
}

async function smoobuFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const apiKey = getApiKey();
  const apiSecret = getApiSecret();

  let authHeaders: Record<string, string>;
  if (apiSecret) {
    const signed = await signSmoobuRequest({
      method: init.method ?? "GET",
      url,
      body: typeof init.body === "string" ? init.body : "",
      apiKey,
      apiSecret,
      timestamp: smoobuTimestamp(),
      nonce: crypto.randomUUID(),
    });
    url = signed.url;
    authHeaders = signed.headers;
  } else {
    authHeaders = { "Api-Key": apiKey };
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      ...authHeaders,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 401 || res.status === 403) {
      // The single most common production failure: say it plainly in the log.
      console.error(
        `Smoobu rejected our credentials (${res.status}) on ${path} ` +
          `[auth=${apiSecret ? "hmac" : "legacy Api-Key, sunset 2026-10-31"}]. ` +
          (apiSecret
            ? "Check SMOOBU_API_KEY + SMOOBU_API_SECRET (Settings > Advanced > API Keys) and that the server clock is correct."
            : "Create an API key + secret in Smoobu (Settings > Advanced > API Keys) and set SMOOBU_API_SECRET in Cloudflare Pages.")
      );
    }
    throw new SmoobuError(res.status, text);
  }

  return (await res.json()) as T;
}

export interface Apartment {
  id: number;
  name: string;
  type?: string;
  rooms?: number;
  beds?: number;
  maxOccupancy?: number;
}

export async function listApartments(): Promise<Apartment[]> {
  const data = await smoobuFetch<{ apartments: Apartment[] }>("/apartments");
  return data.apartments;
}

export interface AvailabilityRequest {
  arrivalDate: string;
  departureDate: string;
  apartments?: number[];
  customerId?: number;
  guests?: number;
}

export interface AvailabilityResponse {
  availableApartments: number[];
  prices?: Record<string, { price: number; currency: string }>;
  errorMessages?: Record<string, { errorCode: number; message: string }>;
}

export async function checkAvailability(
  payload: AvailabilityRequest
): Promise<AvailabilityResponse> {
  // The availability endpoint lives at /booking/... (no /api prefix), unlike
  // most other Smoobu endpoints. Pass the absolute URL to bypass BASE_URL.
  return smoobuFetch<AvailabilityResponse>(`${SMOOBU_HOST}/booking/checkApartmentAvailability`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface RatesQuery {
  apartmentIds: number[];
  startDate: string;
  endDate: string;
}

export interface DailyRate {
  price?: number;
  min_length_of_stay?: number;
  available?: number;
}

export type RatesResponse = Record<string, Record<string, DailyRate>>;

export async function getRates({
  apartmentIds,
  startDate,
  endDate,
}: RatesQuery): Promise<RatesResponse> {
  const params = new URLSearchParams();
  apartmentIds.forEach((id) => params.append("apartments[]", String(id)));
  params.set("start_date", startDate);
  params.set("end_date", endDate);
  // Newer Smoobu responses wrap rates in `{ data: { ... } }`; older ones return
  // the apartments map directly. Accept both shapes.
  const raw = (await smoobuFetch<unknown>(`/rates?${params.toString()}`)) as
    | RatesResponse
    | { data: RatesResponse };
  const inner = (raw as { data?: RatesResponse }).data;
  if (inner && typeof inner === "object") {
    return inner;
  }
  return raw as RatesResponse;
}

export interface CreateReservationRequest {
  apartmentId: number;
  channelId: number;
  arrivalDate: string;
  departureDate: string;
  arrivalTime?: string;
  departureTime?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  country?: string;
  language?: string;
  adults: number;
  children?: number;
  price?: number;
  priceStatus?: number;
  notice?: string;
}

export interface ReservationResponse {
  id: number;
  reference_id?: string;
  apartment?: { id: number; name?: string };
  arrival?: string;
  departure?: string;
  guest_name?: string;
  email?: string;
  price?: number;
}

export async function createReservation(
  payload: CreateReservationRequest
): Promise<ReservationResponse> {
  return smoobuFetch<ReservationResponse>("/reservations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export { SmoobuError };
