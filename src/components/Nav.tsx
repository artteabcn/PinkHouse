"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import LanguageSelector from "./LanguageSelector";

export default function Nav(): React.JSX.Element {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll(): void {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return (): void => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#about", label: t("about") },
    { href: "#rooms", label: t("rooms") },
    { href: "#amenities", label: t("amenities") },
    { href: "#gallery", label: t("gallery") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "bg-brand-cream/95 shadow-sm backdrop-blur-sm" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="#" className="flex items-center gap-2">
          <span className="text-brand-pink font-serif text-2xl font-bold">Pink House</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={cn(
                "hover:text-brand-pink text-sm font-medium transition-colors",
                scrolled ? "text-brand-charcoal" : "text-white/90"
              )}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <LanguageSelector />
          <a
            href="#contact"
            className="bg-brand-pink hover:bg-brand-pink-dark rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
          >
            {t("bookNow")}
          </a>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? (
            <X className="text-brand-charcoal size-6" />
          ) : (
            <Menu className={cn("size-6", scrolled ? "text-brand-charcoal" : "text-white")} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-brand-sage-light bg-brand-cream border-t px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-brand-charcoal hover:text-brand-pink text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="pt-2">
              <LanguageSelector />
            </div>
            <a
              href="#contact"
              className="bg-brand-pink mt-2 rounded-full px-5 py-2 text-center text-sm font-semibold text-white"
              onClick={() => setOpen(false)}
            >
              {t("bookNow")}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
