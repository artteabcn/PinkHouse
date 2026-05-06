import React from "react";
import { useTranslations } from "next-intl";
import { Waves, Wifi, Wind, Coffee, MessageCircle, Car, Sparkles, Languages } from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  pool: Waves,
  wifi: Wifi,
  ac: Wind,
  breakfast: Coffee,
  whatsapp: MessageCircle,
  transfer: Car,
  cleaning: Sparkles,
  languages: Languages,
};

interface AmenityItem {
  icon: string;
  title: string;
  desc: string;
}

export default function AmenitiesSection(): React.JSX.Element {
  const t = useTranslations("amenities");
  const items = t.raw("items") as AmenityItem[];

  return (
    <section id="amenities" className="bg-brand-blush py-20">
      <div className="mx-auto max-w-7xl px-8">
        <div className="text-center">
          <p className="section-label">{t("label")}</p>
          <h2 className="section-title mt-3">{t("title")}</h2>
          <p className="section-subtitle mx-auto">{t("subtitle")}</p>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? Sparkles;
            return (
              <div
                key={item.icon}
                className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-md"
              >
                <div className="bg-brand-teal-light text-brand-teal-dark group-hover:bg-brand-teal flex size-12 items-center justify-center rounded-full transition-colors group-hover:text-white">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-brand-charcoal mt-6 font-serif text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
