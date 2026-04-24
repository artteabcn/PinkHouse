import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function AboutSection(): React.JSX.Element {
  const t = useTranslations("about");

  const stats = [
    { value: t("stat1Value"), label: t("stat1Label") },
    { value: t("stat2Value"), label: t("stat2Label") },
    { value: t("stat3Value"), label: t("stat3Label") },
  ];

  return (
    <section id="about" className="bg-brand-cream py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80"
                alt="Pink House exterior"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Decorative accent */}
            <div className="border-brand-pink-light absolute -right-4 -bottom-4 -z-10 h-full w-full rounded-2xl border-2" />
          </div>

          {/* Text */}
          <div>
            <p className="section-label">{t("label")}</p>
            <h2 className="section-title mt-3">{t("title")}</h2>
            <p className="mt-6 text-base leading-relaxed text-gray-600">{t("p1")}</p>
            <p className="mt-4 text-base leading-relaxed text-gray-600">{t("p2")}</p>

            {/* Stats */}
            <div className="border-brand-sage-light mt-12 grid grid-cols-3 gap-6 border-t pt-10">
              {stats.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-brand-pink font-serif text-3xl font-bold">{value}</p>
                  <p className="mt-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
