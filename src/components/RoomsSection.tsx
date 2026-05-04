import React from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { BedDouble, Wind, Trees, Coffee } from "lucide-react";

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
  const room = rooms[0];

  const features = [
    { icon: BedDouble, label: t("feature1") },
    { icon: Wind, label: t("feature2") },
    { icon: Trees, label: t("feature3") },
    { icon: Coffee, label: t("feature4") },
  ];

  return (
    <section id="rooms" className="bg-white py-32">
      <div className="mx-auto max-w-7xl px-8">
        <div className="text-center">
          <p className="section-label">{t("label")}</p>
          <h2 className="section-title mt-3">{t("title")}</h2>
          <p className="section-subtitle mx-auto">{t("subtitle")}</p>
        </div>

        <div className="bg-brand-cream mt-20 grid items-center gap-0 overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[480px]">
            <Image
              src="/images/room.jpeg"
              alt={room.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div className="p-8 md:p-12 lg:p-14">
            <h3 className="text-brand-ink font-serif text-3xl font-semibold md:text-4xl">
              {room.name}
            </h3>
            <p className="text-brand-ink-soft mt-5 text-base leading-7">{room.description}</p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {features.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-3">
                  <Icon className="text-brand-teal mt-0.5 size-5 shrink-0" />
                  <span className="text-brand-ink text-sm leading-6">{label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-start gap-5 border-t border-gray-200/70 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-brand-ink-soft text-[11px] tracking-wider uppercase">
                  {t("from")}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-brand-ink font-serif text-3xl font-semibold">
                    {room.price.toLocaleString()}
                  </span>
                  <span className="text-brand-ink-soft text-sm">
                    {room.currency} {t("perNight")}
                  </span>
                </div>
              </div>
              <a href={`/${locale}/book`} className="btn-pill-primary">
                {t("cta")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
