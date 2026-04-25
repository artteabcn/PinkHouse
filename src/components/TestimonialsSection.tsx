import React from "react";
import { useTranslations } from "next-intl";

interface TestimonialItem {
  quote: string;
  name: string;
  origin: string;
}

export default function TestimonialsSection(): React.JSX.Element {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as TestimonialItem[];

  return (
    <section className="bg-brand-cream py-32">
      <div className="mx-auto max-w-7xl px-8">
        <div className="text-center">
          <p className="section-label">{t("label")}</p>
          <h2 className="section-title mt-3">{t("title")}</h2>
        </div>

        <div className="mt-20 grid gap-12 md:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-brand-pink font-serif text-5xl leading-none select-none">
                &ldquo;
              </span>
              <p className="mt-4 font-serif text-lg leading-8 text-gray-700 italic">{item.quote}</p>
              <div className="border-brand-sage-light mt-8 border-t pt-6">
                <p className="text-brand-charcoal text-sm font-semibold">{item.name}</p>
                <p className="mt-1 text-xs tracking-wide text-gray-400">{item.origin}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
