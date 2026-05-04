import { NextRequest, NextResponse } from "next/server";
import { AvailabilitySchema } from "@/lib/validations/availability";
import { checkAvailability, getRates, SmoobuError } from "@/lib/smoobu";
import { SMOOBU_APARTMENT_IDS, APARTMENT_TO_ROOM_ID } from "@/config/smoobu";

interface AvailableApartment {
  apartmentId: number;
  roomId: string | null;
  totalPrice: number | null;
  currency: string;
  nights: number;
}

function diffNights(arrival: string, departure: string): number {
  const a = new Date(arrival).getTime();
  const d = new Date(departure).getTime();
  return Math.max(1, Math.round((d - a) / 86_400_000));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const parsed = AvailabilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { arrival, departure, adults, children } = parsed.data;
    const apartmentIds = [...SMOOBU_APARTMENT_IDS];
    const nights = diffNights(arrival, departure);

    const [availability, rates] = await Promise.all([
      checkAvailability({
        arrivalDate: arrival,
        departureDate: departure,
        apartments: apartmentIds,
        adults,
        children,
      }),
      getRates({
        apartmentIds,
        startDate: arrival,
        endDate: departure,
      }).catch(() => ({}) as Record<string, Record<string, { price?: number }>>),
    ]);

    const available: AvailableApartment[] = availability.availableApartments.map((id) => {
      const dailyRates = rates[String(id)] ?? {};
      const total = Object.values(dailyRates).reduce((sum, day) => sum + (day.price ?? 0), 0);
      return {
        apartmentId: id,
        roomId: APARTMENT_TO_ROOM_ID[id] ?? null,
        totalPrice: total > 0 ? total : null,
        currency: "THB",
        nights,
      };
    });

    return NextResponse.json({ available, nights });
  } catch (err) {
    if (err instanceof SmoobuError) {
      return NextResponse.json({ error: "Smoobu API error", status: err.status }, { status: 502 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
