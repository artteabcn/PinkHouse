import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function HeroSection(): React.JSX.Element {
  const t = useTranslations("hero");

  return (
    <section className="relative flex h-screen min-h-[640px] items-center justify-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1920&q=80"
        alt="Pink House Koh Samui"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/55" />

      <div className="relative z-10 px-6 text-center text-white">
        <p className="mb-6 text-[10px] font-medium tracking-[0.4em] text-white/60 uppercase">
          Bophut · Koh Samui · Thailand
        </p>
        <h1 className="font-serif text-7xl font-bold tracking-tight drop-shadow-sm md:text-[9rem] lg:text-[10rem]">
          {t("headline")}
        </h1>
        <p className="mx-auto mt-8 max-w-md text-base text-white/70 md:text-lg">
          {t("subheadline")}
        </p>
        <div className="mt-12">
          <a
            href="#contact"
            className="hover:text-brand-charcoal inline-block border border-white/60 px-10 py-4 text-[11px] font-semibold tracking-[0.2em] text-white uppercase backdrop-blur-sm transition-colors hover:bg-white"
          >
            {t("cta")}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="text-[9px] tracking-[0.3em] text-white/40 uppercase">Scroll</span>
        <div className="h-14 w-px animate-pulse bg-white/25" />
      </div>
    </section>
  );
}
