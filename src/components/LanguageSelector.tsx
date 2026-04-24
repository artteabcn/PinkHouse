"use client";

import React from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "de", label: "DE" },
  { code: "th", label: "ไทย" },
] as const;

export default function LanguageSelector(): React.JSX.Element {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string): void {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/"));
  }

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          className={cn(
            "rounded px-2 py-1 text-xs font-semibold transition-colors",
            locale === code ? "bg-brand-pink text-white" : "hover:text-brand-pink text-gray-600"
          )}
          aria-label={`Switch to ${code}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
