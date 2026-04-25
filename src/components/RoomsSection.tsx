import React from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Users, BedDouble, Eye } from "lucide-react";

const ROOM_IMAGES: Record<string, string> = {
  standard: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
  deluxe: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
  family: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80",
};

interface RoomItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  maxGuests: number;
  beds: string;
  view: string;
}

export default function RoomsSection(): React.JSX.Element {
  const t = useTranslations("rooms");
  const locale = useLocale();
  const rooms = t.raw("items") as RoomItem[];

  return (
    <section id="rooms" className="bg-white py-32">
      <div className="mx-auto max-w-7xl px-8">
        <div className="text-center">
          <p className="section-label">{t("label")}</p>
          <h2 className="section-title mt-3">{t("title")}</h2>
          <p className="section-subtitle mx-auto">{t("subtitle")}</p>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div key={room.id} className="group bg-brand-cream overflow-hidden">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={ROOM_IMAGES[room.id] ?? ROOM_IMAGES.standard}
                  alt={room.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Content */}
              <div className="p-7">
                <h3 className="text-brand-charcoal font-serif text-xl font-semibold">
                  {room.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-500">{room.description}</p>

                <div className="mt-5 flex flex-wrap gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    {room.maxGuests} {t("guests")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="size-3.5" />
                    {room.beds}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="size-3.5" />
                    {room.view}
                  </span>
                </div>

                <div className="mt-7 flex items-center justify-between border-t border-gray-200 pt-6">
                  <div>
                    <span className="text-xs text-gray-400">{t("from")} </span>
                    <span className="text-brand-pink font-serif text-2xl font-semibold">
                      {room.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {" "}
                      {room.currency} {t("perNight")}
                    </span>
                  </div>
                  <a
                    href={`/${locale}/book`}
                    className="border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal border px-4 py-2 text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors hover:text-white"
                  >
                    {t("book")}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
