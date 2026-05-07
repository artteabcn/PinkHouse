"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, BedDouble, Coffee, Eye, Loader2, Trees, Users, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { APARTMENT_TO_ROOM_ID } from "@/config/smoobu";

interface AvailableRoom {
  apartmentId: number;
  roomId: string | null;
  totalPrice: number | null;
  currency: string;
  nights: number;
}

const SearchSchema = z
  .object({
    checkIn: z.string().min(1),
    checkOut: z.string().min(1),
    adults: z.coerce.number().int().min(1).max(10),
    children: z.coerce.number().int().min(0).max(10),
  })
  .refine((d) => d.checkOut > d.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

type SearchValues = z.input<typeof SearchSchema>;
type SearchInput = z.output<typeof SearchSchema>;

const GuestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  notes: z.string().optional(),
});

type GuestInput = z.infer<typeof GuestSchema>;

type Step = "search" | "results" | "guest" | "success" | "error";

const inputClass =
  "focus:border-brand-pink w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors outline-none";

const labelClass = "text-brand-ink mb-1.5 block text-xs font-semibold tracking-wider uppercase";

interface RoomCopy {
  id: string;
  name: string;
  description: string;
  beds: string;
  view: string;
  maxGuests: number;
}

export default function BookingForm(): React.JSX.Element {
  const t = useTranslations("booking");
  const tRooms = useTranslations("rooms");
  const locale = useLocale();
  const roomItems = tRooms.raw("items") as RoomCopy[];
  const roomCopyById = Object.fromEntries(roomItems.map((r) => [r.id, r])) as Record<
    string,
    RoomCopy | undefined
  >;
  const amenities = [
    { icon: BedDouble, label: tRooms("feature1") },
    { icon: Wind, label: tRooms("feature2") },
    { icon: Trees, label: tRooms("feature3") },
    { icon: Coffee, label: tRooms("feature4") },
  ];
  const [step, setStep] = useState<Step>("search");
  const [available, setAvailable] = useState<AvailableRoom[]>([]);
  const [criteria, setCriteria] = useState<SearchInput | null>(null);
  const [selected, setSelected] = useState<AvailableRoom | null>(null);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Render an inert placeholder during SSR + first client paint, then swap to
  // the real form after mount. Eliminates any hydration mismatch source within
  // this tree (React #418).
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<string>("");
  useEffect(() => {
    setMounted(true);
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const search = useForm<SearchValues, unknown, SearchInput>({
    resolver: zodResolver(SearchSchema),
    defaultValues: { adults: 2, children: 0 },
  });

  const guest = useForm<GuestInput>({
    resolver: zodResolver(GuestSchema),
  });

  async function onSearch(data: SearchInput): Promise<void> {
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arrival: data.checkIn,
          departure: data.checkOut,
          adults: data.adults,
          children: data.children,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { available: AvailableRoom[]; nights: number };
      setCriteria(data);
      setAvailable(json.available);
      setStep("results");
    } catch (err) {
      setErrorDetail(err instanceof Error ? err.message : "unknown");
      setStep("error");
    }
  }

  async function onConfirm(data: GuestInput): Promise<void> {
    if (!criteria || !selected) return;
    try {
      const roomId = selected.roomId ?? APARTMENT_TO_ROOM_ID[selected.apartmentId] ?? "standard";
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          roomId,
          apartmentId: selected.apartmentId,
          checkIn: criteria.checkIn,
          checkOut: criteria.checkOut,
          adults: criteria.adults,
          children: criteria.children,
          totalPrice: selected.totalPrice ?? undefined,
          locale,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { reservationId?: number };
      setReservationId(json.reservationId ?? null);
      setStep("success");
    } catch (err) {
      setErrorDetail(err instanceof Error ? err.message : "unknown");
      setStep("error");
    }
  }

  if (!mounted) {
    return (
      <div
        aria-hidden
        className="h-[420px] animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
      />
    );
  }

  if (step === "success") {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
        <div className="bg-brand-teal-light text-brand-teal mx-auto flex size-14 items-center justify-center rounded-full">
          <BedDouble className="size-7" />
        </div>
        <h3 className="text-brand-ink mt-6 font-serif text-3xl font-semibold">
          {t("successTitle")}
        </h3>
        <p className="text-brand-ink-soft mx-auto mt-3 max-w-md text-sm">
          {t("successDetail", { id: reservationId ?? "—" })}
        </p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
        <h3 className="text-brand-pink font-serif text-3xl font-semibold">{t("errorTitle")}</h3>
        <p className="text-brand-ink-soft mx-auto mt-3 max-w-md text-sm">{t("errorDetail")}</p>
        {errorDetail && <p className="mt-2 text-xs text-gray-400">({errorDetail})</p>}
        <button
          type="button"
          onClick={() => {
            setErrorDetail(null);
            setStep("search");
          }}
          className="btn-pill-outline mt-6"
        >
          {t("back")}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-10">
      {step === "search" && (
        <form onSubmit={search.handleSubmit(onSearch)} className="grid gap-5 md:grid-cols-4">
          <div className="md:col-span-1">
            <label className={labelClass} htmlFor="checkIn">
              {t("checkIn")}
            </label>
            <input
              id="checkIn"
              type="date"
              {...search.register("checkIn")}
              min={today || undefined}
              className={cn(inputClass, search.formState.errors.checkIn && "border-red-400")}
            />
          </div>
          <div className="md:col-span-1">
            <label className={labelClass} htmlFor="checkOut">
              {t("checkOut")}
            </label>
            <input
              id="checkOut"
              type="date"
              {...search.register("checkOut")}
              min={today || undefined}
              className={cn(inputClass, search.formState.errors.checkOut && "border-red-400")}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="adults">
              {t("adults")}
            </label>
            <input
              id="adults"
              type="number"
              min={1}
              max={10}
              {...search.register("adults")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="children">
              {t("children")}
            </label>
            <input
              id="children"
              type="number"
              min={0}
              max={10}
              {...search.register("children")}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={search.formState.isSubmitting}
              className="btn-pill-primary w-full disabled:opacity-60 md:w-auto"
            >
              {search.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  {t("searching")}
                </>
              ) : (
                t("findRooms")
              )}
            </button>
          </div>
        </form>
      )}

      {step === "results" && criteria && (
        <div>
          <button
            type="button"
            onClick={() => setStep("search")}
            className="text-brand-ink-soft hover:text-brand-pink mb-6 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="size-4" />
            {t("back")}
          </button>
          <p className="text-brand-ink-soft text-sm">
            {criteria.checkIn} → {criteria.checkOut} · {criteria.adults + criteria.children}{" "}
            {t("adults")}
          </p>
          {available.length === 0 ? (
            <p className="text-brand-ink bg-brand-blush mt-8 rounded-xl p-6 text-center text-sm">
              {t("noRooms")}
            </p>
          ) : (
            <div className="mt-6 grid gap-6">
              {available.map((room, idx) => {
                const copy = (room.roomId && roomCopyById[room.roomId]) || roomCopyById.standard;
                const label = copy?.name ?? `Apartment ${room.apartmentId}`;
                return (
                  <div
                    key={room.apartmentId}
                    className="bg-brand-cream grid overflow-hidden rounded-2xl ring-1 ring-black/5 md:grid-cols-[280px_1fr]"
                  >
                    <div className="relative aspect-[4/3] md:aspect-auto md:h-full">
                      <Image
                        src="/images/room.jpeg"
                        alt={label}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 280px"
                      />
                    </div>

                    <div className="flex flex-col gap-4 p-6 md:p-8">
                      <div>
                        <p className="text-brand-ink-soft text-[11px] font-semibold tracking-[0.15em] uppercase">
                          {tRooms("label")} · #{idx + 1}
                        </p>
                        <h3 className="text-brand-ink mt-1.5 font-serif text-2xl font-semibold">
                          {label}
                        </h3>
                      </div>

                      {copy && (
                        <div className="text-brand-ink-soft flex flex-wrap gap-x-5 gap-y-2 text-xs">
                          <span className="inline-flex items-center gap-1.5">
                            <BedDouble className="text-brand-teal size-4" />
                            {copy.beds}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="text-brand-teal size-4" />
                            {copy.maxGuests} {tRooms("guests")}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Eye className="text-brand-teal size-4" />
                            {copy.view}
                          </span>
                        </div>
                      )}

                      {copy && (
                        <p className="text-brand-ink-soft text-sm leading-6">{copy.description}</p>
                      )}

                      <ul className="grid gap-2 sm:grid-cols-2">
                        {amenities.map(({ icon: Icon, label: amen }) => (
                          <li
                            key={amen}
                            className="text-brand-ink flex items-start gap-2 text-xs leading-5"
                          >
                            <Icon className="text-brand-teal mt-0.5 size-4 shrink-0" />
                            <span>{amen}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-2 flex flex-col items-start justify-between gap-3 border-t border-black/5 pt-5 sm:flex-row sm:items-center">
                        {room.totalPrice !== null && (
                          <div>
                            <p className="text-brand-ink-soft text-[11px] tracking-wider uppercase">
                              {t("totalFor", { nights: room.nights })}
                            </p>
                            <p className="text-brand-ink mt-0.5 font-serif text-2xl font-semibold">
                              {room.totalPrice.toLocaleString()}{" "}
                              <span className="text-brand-ink-soft text-sm font-normal">
                                {room.currency}
                              </span>
                            </p>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(room);
                            setStep("guest");
                          }}
                          className="btn-pill-primary"
                        >
                          {t("select")}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {step === "guest" && criteria && selected && (
        <form onSubmit={guest.handleSubmit(onConfirm)}>
          <button
            type="button"
            onClick={() => setStep("results")}
            className="text-brand-ink-soft hover:text-brand-pink mb-6 inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="size-4" />
            {t("back")}
          </button>

          <div className="bg-brand-blush rounded-xl p-5">
            <p className="section-label">{t("summary")}</p>
            <p className="text-brand-ink mt-2 font-serif text-lg">
              {(selected.roomId && roomCopyById[selected.roomId]?.name) ??
                `Apartment ${selected.apartmentId}`}
            </p>
            <p className="text-brand-ink-soft mt-1 text-sm">
              {criteria.checkIn} → {criteria.checkOut} · {criteria.adults + criteria.children}{" "}
              {t("adults")}
              {selected.totalPrice !== null && (
                <>
                  {" · "}
                  <span className="text-brand-teal font-semibold">
                    {selected.totalPrice.toLocaleString()} {selected.currency}
                  </span>
                </>
              )}
            </p>
          </div>

          <h3 className="text-brand-ink mt-8 font-serif text-2xl font-semibold">
            {t("guestTitle")}
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="name">
                {t("name")}
              </label>
              <input
                id="name"
                {...guest.register("name")}
                className={cn(inputClass, guest.formState.errors.name && "border-red-400")}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="email">
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                {...guest.register("email")}
                className={cn(inputClass, guest.formState.errors.email && "border-red-400")}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="phone">
                {t("phone")}
              </label>
              <input
                id="phone"
                {...guest.register("phone")}
                className={cn(inputClass, guest.formState.errors.phone && "border-red-400")}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="notes">
                {t("notes")}
              </label>
              <textarea id="notes" rows={3} {...guest.register("notes")} className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            disabled={guest.formState.isSubmitting}
            className="btn-pill-primary mt-6 w-full disabled:opacity-60 sm:w-auto"
          >
            {guest.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {t("confirming")}
              </>
            ) : (
              t("confirm")
            )}
          </button>
        </form>
      )}
    </div>
  );
}
