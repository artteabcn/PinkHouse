import React from "react";
import { useTranslations } from "next-intl";

export default function Footer(): React.JSX.Element {
  const t = useTranslations("footer");
  const tnav = useTranslations("nav");
  const year = new Date().getFullYear();

  const links = [
    { href: "#about", label: tnav("about") },
    { href: "#rooms", label: tnav("rooms") },
    { href: "#amenities", label: tnav("amenities") },
    { href: "#gallery", label: tnav("gallery") },
    { href: "#contact", label: tnav("contact") },
  ];

  return (
    <footer className="bg-brand-charcoal py-20 text-white">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="font-serif text-2xl text-white italic">Pink House</p>
            <p className="mt-3 max-w-xs text-sm leading-7 text-white/45">{t("tagline")}</p>
          </div>

          {/* Links */}
          <div>
            <p className="mb-5 text-[10px] font-semibold tracking-[0.2em] text-white/30 uppercase">
              {t("links")}
            </p>
            <nav className="flex flex-col gap-3">
              {links.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-sm text-white/55 transition-colors hover:text-white"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-5 text-[10px] font-semibold tracking-[0.2em] text-white/30 uppercase">
              Contact
            </p>
            <div className="flex flex-col gap-2.5 text-sm text-white/55">
              <p>hello@pinkhousesamui.com</p>
              <p>+66 77 XXX XXX</p>
              <p>Bophut, Koh Samui, Thailand</p>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/30 md:flex-row">
          <p>{t("legal", { year })}</p>
          <a href="#" className="transition-colors hover:text-white/60">
            {t("privacy")}
          </a>
        </div>
      </div>
    </footer>
  );
}
