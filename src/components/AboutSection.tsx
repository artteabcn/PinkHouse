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
    <section id="about" className="bg-brand-cream py-32">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid gap-20 lg:grid-cols-2 lg:items-center">
          {/* Image — no decorative frame, full editorial */}
          <div className="aspect-[4/5] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80"
              alt="Pink House garden and pool"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Text */}
          <div>
            <p className="section-label">{t("label")}</p>
            <h2 className="section-title mt-3">{t("title")}</h2>
            <p className="mt-8 text-base leading-8 text-gray-600">{t("p1")}</p>
            <p className="mt-4 text-base leading-8 text-gray-600">{t("p2")}</p>

            <div className="divide-brand-sage-light mt-14 grid grid-cols-3 divide-x">
              {stats.map(({ value, label }) => (
                <div key={label} className="px-6 first:pl-0">
                  <p className="text-brand-pink font-serif text-4xl font-bold">{value}</p>
                  <p className="mt-2 text-[10px] font-medium tracking-wider text-gray-400 uppercase">
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
