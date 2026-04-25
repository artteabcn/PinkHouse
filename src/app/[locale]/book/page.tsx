import React from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SmoobuWidget from "@/components/SmoobuWidget";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Book Your Stay — Pink House Koh Samui",
  description:
    "Reserve your room at Pink House, a boutique bed & breakfast in Bophut, Koh Samui, Thailand.",
};

const SMOOBU_BOOKING_URL = process.env.NEXT_PUBLIC_SMOOBU_BOOKING_URL ?? "";

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

export default function BookPage(): React.JSX.Element {
  return (
    <main>
      <Nav />
      <BookingHeader />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-8">
          {SMOOBU_BOOKING_URL ? (
            <SmoobuWidget bookingUrl={SMOOBU_BOOKING_URL} />
          ) : (
            <div className="border border-dashed border-gray-200 py-32 text-center">
              <p className="font-serif text-lg text-gray-400">Booking widget coming soon.</p>
              <p className="mt-3 text-sm text-gray-400">
                Set{" "}
                <code className="text-brand-pink rounded bg-gray-100 px-1.5 py-0.5 font-mono">
                  NEXT_PUBLIC_SMOOBU_BOOKING_URL
                </code>{" "}
                in your environment to activate.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
