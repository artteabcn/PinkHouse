import { NextRequest, NextResponse } from "next/server";
import { AvailabilitySchema } from "@/lib/validations/availability";
import { getRates, SmoobuError } from "@/lib/smoobu";
import { checkStay, fitsParty, nightDates } from "@/lib/availability";
import { SMOOBU_APARTMENT_IDS, APARTMENT_TO_ROOM_ID } from "@/config/smoobu";
import { applyDiscount, DISCOUNT_PERCENT } from "@/config/payments";

interface AvailableApartment {
  apartmentId: number;
  roomId: string | null;
  totalPrice: number | null;
  undiscountedPrice: number | null;
  discountPercent: number;
  discountAmount: number | null;
  currency: string;
  nights: number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const parsed = AvailabilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { arrival, departure, adults, children } = parsed.data;
    const nights = nightDates(arrival, departure);
    // Only offer what can actually host the party.
    const apartmentIds = SMOOBU_APARTMENT_IDS.filter((id) => fitsParty(id, adults + children));

    // Smoobu's /booking/checkApartmentAvailability requires a real customerId
    // we don't have for anonymous visitors, so we derive availability from
    // /rates instead — the rates payload gives us `available` (0|1) and
    // `price` per night per apartment in a single call.
    const rates =
      apartmentIds.length > 0
        ? await getRates({ apartmentIds, startDate: arrival, endDate: departure })
        : {};

    const available: AvailableApartment[] = [];
    // Smallest min-length-of-stay among apartments that are free but were
    // rejected as too short, so the form can say "minimum N nights". Read live
    // from Smoobu so seasonal rule changes surface automatically.
    let minStayRequired = Infinity;
    for (const id of apartmentIds) {
      const stay = checkStay(rates[String(id)] ?? {}, nights);
      if (!stay.ok) {
        if (stay.reason === "minStay") {
          minStayRequired = Math.min(minStayRequired, stay.minStay);
        }
        continue;
      }
      const undiscounted = stay.total;
      const discounted = applyDiscount(undiscounted);
      available.push({
        apartmentId: id,
        roomId: APARTMENT_TO_ROOM_ID[id] ?? null,
        totalPrice: discounted > 0 ? discounted : null,
        undiscountedPrice: undiscounted > 0 ? undiscounted : null,
        discountPercent: DISCOUNT_PERCENT,
        discountAmount: undiscounted > 0 && discounted > 0 ? undiscounted - discounted : null,
        currency: "THB",
        nights: nights.length,
      });
    }

    return NextResponse.json({
      available,
      nights: nights.length,
      minStayRequired: Number.isFinite(minStayRequired) ? minStayRequired : 1,
    });
  } catch (err) {
    if (err instanceof SmoobuError) {
      console.error("Smoobu availability error", err.status, err.body);
      // Upstream body stays in the server log only — never echo it to browsers.
      return NextResponse.json(
        { error: "Smoobu API error", smoobuStatus: err.status },
        { status: 502 }
      );
    }
    console.error("Availability route error", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Internal error", detail }, { status: 500 });
  }
}
