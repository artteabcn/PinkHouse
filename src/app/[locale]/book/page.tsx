import React from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Check, Gift, MapPin } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import WhatsAppButton from "@/components/WhatsAppButton";
import { SITE, alternateLanguages, localePath } from "@/config/site";
import { getImageUrl } from "@/lib/content";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  const title = t("book.title");
  const description = t("book.description");
  const url = localePath(locale, "book");

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: alternateLanguages("book"),
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      title,
      description,
      locale,
      images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: t("ogAlt") }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SITE.ogImage],
    },
  };
}

function BookingHeader(): React.JSX.Element {
  const t = useTranslations("bookPage");
  return (
    <div className="bg-brand-cream px-8 pt-40 pb-16 text-center">
      <p className="section-label">{t("label")}</p>
      <h1 className="section-title mt-3">{t("title")}</h1>
      <p className="section-subtitle mx-auto">{t("subtitle")}</p>
    </div>
  );
}

function BookingPerks(): React.JSX.Element {
  const t = useTranslations("bookPage");
  // Localized list of three perks (early check-in / welcome drink / local tips).
  // Items are typed as string[] from next-intl's raw() — render with icon per row.
  const items = t.raw("perksItems") as string[];
  const PerkIcon = ({ idx }: { idx: number }): React.JSX.Element => {
    const Icon = idx === 0 ? Check : idx === 1 ? Gift : MapPin;
    return <Icon className="text-brand-pink size-5 shrink-0" aria-hidden />;
  };
  if (items.length === 0) return <></>;
  return (
    <aside className="bg-brand-blush ring-brand-pink-light mx-auto max-w-3xl rounded-2xl px-6 py-6 ring-1 md:px-10 md:py-8">
      <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3">
        <p className="text-brand-pink-dark font-serif text-2xl md:text-3xl">{t("perksTitle")}</p>
        <p className="text-brand-ink-soft text-sm leading-6 md:text-base md:leading-7">
          {t("perksBody")}
        </p>
      </div>
      <ul className="mt-5 grid gap-2.5 sm:grid-cols-3">
        {items.map((item, idx) => (
          <li key={idx} className="text-brand-ink flex items-start gap-2 text-sm leading-5">
            <PerkIcon idx={idx} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default async function BookPage(): Promise<React.JSX.Element> {
  const logoUrl = await getImageUrl("logo", "/logo.png");
  return (
    <main>
      <Nav logoUrl={logoUrl} />
      <BookingHeader />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-8">
          <BookingPerks />
          <div className="mt-12">
            <BookingForm />
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
