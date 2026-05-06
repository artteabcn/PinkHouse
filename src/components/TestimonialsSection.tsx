import React from "react";
import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";

interface TestimonialItem {
  quote: string;
  name: string;
  origin: string;
}

function initials(name: string): string {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function TestimonialsSection(): React.JSX.Element {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as TestimonialItem[];

  return (
    <section className="bg-brand-cream py-20">
      <div className="mx-auto max-w-7xl px-8">
        <div className="text-center">
          <p className="section-label">{t("label")}</p>
          <h2 className="section-title mt-3">{t("title")}</h2>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {items.map((item, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-2xl bg-white p-9 shadow-sm ring-1 ring-black/5"
            >
              <Quote className="text-brand-pink size-7" aria-hidden />
              <blockquote className="mt-5 flex-1 font-serif text-lg leading-8 text-gray-700 italic">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4 border-t border-gray-100 pt-6">
                <div className="bg-brand-pink-light text-brand-pink-dark flex size-11 shrink-0 items-center justify-center rounded-full font-serif text-sm font-semibold">
                  {initials(item.name)}
                </div>
                <div>
                  <p className="text-brand-charcoal text-sm font-semibold">{item.name}</p>
                  <p className="mt-0.5 text-xs tracking-wide text-gray-400">{item.origin}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
