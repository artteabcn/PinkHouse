import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.43-4.94 8.43-9.94Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Footer(): React.JSX.Element {
  const t = useTranslations("footer");
  const tnav = useTranslations("nav");
  const year = new Date().getFullYear();

  const socials = [
    {
      href: "https://www.facebook.com/profile.php?id=61576017436215",
      label: "Facebook",
      Icon: FacebookIcon,
    },
    {
      href: "https://www.instagram.com/lapinkhousesamui/",
      label: "Instagram",
      Icon: InstagramIcon,
    },
  ];

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
          <div>
            <Image
              src="/logo.png"
              alt="Pink House Koh Samui"
              width={1024}
              height={1069}
              className="h-20 w-auto rounded-xl shadow-md"
            />
            <p className="mt-5 max-w-xs text-sm leading-7 text-white/55">{t("tagline")}</p>
            <div className="mt-6">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-white/30 uppercase">
                {t("follow")}
              </p>
              <div className="flex items-center gap-3">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/55 transition-colors hover:border-white/40 hover:text-white"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
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
              <p>Lamai, Koh Samui, Thailand</p>
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
