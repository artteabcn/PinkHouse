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
    <section id="amenities" className="bg-brand-sage py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-brand-pink-light text-sm font-semibold tracking-widest uppercase">
            {t("label")}
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-white md:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/75">{t("subtitle")}</p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const Icon = ICON_MAP[item.icon] ?? Sparkles;
            return (
              <div
                key={item.icon}
                className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <div className="bg-brand-pink/20 flex h-12 w-12 items-center justify-center rounded-xl">
                  <Icon className="text-brand-pink-light size-6" />
                </div>
                <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
