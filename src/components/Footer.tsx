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
    <footer className="bg-brand-charcoal py-16 text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="text-brand-pink font-serif text-2xl font-bold">Pink House</p>
            <p className="mt-2 text-sm text-white/60">{t("tagline")}</p>
          </div>

          {/* Links */}
          <div>
            <p className="mb-4 text-xs font-semibold tracking-widest text-white/40 uppercase">
              {t("links")}
            </p>
            <nav className="flex flex-col gap-2">
              {links.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="hover:text-brand-pink text-sm text-white/70 transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact snippet */}
          <div>
            <p className="mb-4 text-xs font-semibold tracking-widest text-white/40 uppercase">
              Contact
            </p>
            <p className="text-sm text-white/70">hello@pinkhousesamui.com</p>
            <p className="mt-1 text-sm text-white/70">+66 77 XXX XXX</p>
            <p className="mt-1 text-sm text-white/70">Bophut, Koh Samui, Thailand</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row">
          <p>{t("legal", { year })}</p>
          <a href="#" className="hover:text-white/70">
            {t("privacy")}
          </a>
        </div>
      </div>
    </footer>
  );
}
