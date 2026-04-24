import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

export default function HeroSection(): React.JSX.Element {
  const t = useTranslations("hero");

  return (
    <section className="relative flex h-screen min-h-[600px] items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1920&q=80"
        alt="Pink House Koh Samui"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      {/* Content */}
      <div className="relative z-10 px-6 text-center text-white">
        <p className="text-brand-pink-light mb-4 text-sm font-semibold tracking-[0.3em] uppercase">
          {t("tagline")}
        </p>
        <h1 className="font-serif text-6xl font-bold drop-shadow-lg md:text-8xl">
          {t("headline")}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-white/85 md:text-xl">{t("subheadline")}</p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#contact"
            className="bg-brand-pink hover:bg-brand-pink-dark rounded-full px-8 py-3 text-base font-semibold text-white shadow-lg transition-colors"
          >
            {t("cta")}
          </a>
          <a
            href="#about"
            className="rounded-full border border-white/60 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
          >
            {t("discover")}
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 transition-colors hover:text-white"
        aria-label="Scroll down"
      >
        <ChevronDown className="size-8 animate-bounce" />
      </a>
    </section>
  );
}
