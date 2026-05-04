import React from "react";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Book Your Stay — Pink House Koh Samui",
  description:
    "Reserve your room at Pink House, a boutique bed & breakfast in Lamai, Koh Samui, Thailand.",
};

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
        <div className="mx-auto max-w-4xl px-8">
          <BookingForm />
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
