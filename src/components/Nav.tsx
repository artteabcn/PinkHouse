"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageSelector from "./LanguageSelector";

export default function Nav(): React.JSX.Element {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll(): void {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return (): void => window.removeEventListener("scroll", onScroll);
  }, []);

  const bookHref = `/${locale}/book`;

  const links = [
    { href: "#rooms", label: t("rooms") },
    { href: "#amenities", label: t("amenities") },
    { href: "#gallery", label: t("gallery") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "border-b border-gray-100 bg-white" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        {/* Logo */}
        <Link href="#">
          <span
            className={cn(
              "font-serif text-2xl tracking-wide italic transition-colors",
              scrolled ? "text-brand-charcoal" : "text-white"
            )}
          >
            Pink House
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={cn(
                "hover:text-brand-pink text-[11px] font-medium tracking-[0.15em] uppercase transition-colors",
                scrolled ? "text-brand-charcoal" : "text-white/80"
              )}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <LanguageSelector />
          <Link
            href={bookHref}
            className={cn(
              "border px-5 py-2.5 text-[11px] font-semibold tracking-[0.15em] uppercase transition-colors",
              scrolled
                ? "border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white"
                : "hover:text-brand-charcoal border-white/70 text-white hover:bg-white"
            )}
          >
            {t("bookNow")}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="p-1 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? (
            <X className="text-brand-charcoal size-6" />
          ) : (
            <Menu className={cn("size-6", scrolled ? "text-brand-charcoal" : "text-white")} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-gray-100 bg-white px-8 py-6 md:hidden">
          <nav className="flex flex-col gap-5">
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-brand-charcoal hover:text-brand-pink text-[11px] font-medium tracking-[0.15em] uppercase"
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="pt-1">
              <LanguageSelector />
            </div>
            <Link
              href={bookHref}
              className="border-brand-charcoal text-brand-charcoal mt-1 border px-5 py-3 text-center text-[11px] font-semibold tracking-[0.15em] uppercase"
              onClick={() => setOpen(false)}
            >
              {t("bookNow")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
