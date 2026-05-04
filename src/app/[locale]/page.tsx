import React from "react";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import RoomsSection from "@/components/RoomsSection";
import AmenitiesSection from "@/components/AmenitiesSection";
import GalleryGrid from "@/components/GalleryGrid";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Pink House — Bed & Breakfast Koh Samui",
  description:
    "A warm, welcoming bed & breakfast in the heart of Koh Samui, Thailand. English, French, German & Thai spoken.",
  openGraph: {
    title: "Pink House — Koh Samui B&B",
    description: "Your home in Koh Samui.",
    images: ["/images/main.jpeg"],
  },
};

export default function HomePage(): React.JSX.Element {
  return (
    <main>
      <Nav />
      <HeroSection />
      <AboutSection />
      <RoomsSection />
      <AmenitiesSection />
      <TestimonialsSection />
      <GalleryGrid />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
