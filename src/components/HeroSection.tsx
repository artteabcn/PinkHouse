import React from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

export default function HeroSection(): React.JSX.Element {
  const t = useTranslations("hero");
  const locale = useLocale();

  return (
    <section className="relative flex h-screen min-h-[640px] items-center justify-center overflow-hidden">
      <Image
        src="/images/main.jpeg"
        alt="Pink House Koh Samui — pool with tropical view"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/75" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,0,0,0.35)_0%,_rgba(0,0,0,0)_70%)]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]">
        <p className="mb-6 text-[10px] font-semibold tracking-[0.4em] text-white uppercase">
          Lamai · Koh Samui · Thailand
        </p>
        <h1 className="hero-title">{t("tagline")}</h1>
        <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-white md:text-lg">
          {t("subheadline")}
        </p>
        <div className="mt-10">
          <a href={`/${locale}/book`} className="btn-pill-light">
            {t("cta")}
          </a>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="text-[9px] tracking-[0.3em] text-white/80 uppercase">Scroll</span>
        <div className="h-12 w-px animate-pulse bg-white/60" />
      </div>
    </section>
  );
}
