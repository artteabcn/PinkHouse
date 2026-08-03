import React from "react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { getImageUrl } from "@/lib/content";

interface GalleryImage {
  slot: string;
  fallback: string;
  alt: string;
  span?: string;
}

// Eight hand-tuned slots arranged on a 4-col (lg) / 2-col (sm) / 1-col grid:
// Row 1: pool (2-wide, 16/9)   | lounge (16/10)
// Row 2: garden (16/10)        | poolside (16/10)            | bedroom (2-wide, 16/10)
// Row 3: terrace (4/3, 2-row)  | breakfast (16/10)            | room-detail (16/10)
// Tail slot (gallery.7) stretches across 2 rows for an editorial feel.
const GALLERY_IMAGES: GalleryImage[] = [
  {
    slot: "gallery.0",
    fallback: "/images/main.jpeg",
    alt: "Pool and tropical view",
    span: "sm:col-span-2 lg:col-span-2",
  },
  { slot: "gallery.1", fallback: "/images/main2.jpeg", alt: "Outdoor lounge by the pool" },
  { slot: "gallery.2", fallback: "/images/main3.jpeg", alt: "The property in its tropical garden" },
  { slot: "gallery.3", fallback: "/images/main4.jpeg", alt: "Pink poolside with seating" },
  {
    slot: "gallery.4",
    fallback: "/images/room.jpeg",
    alt: "Bright bedroom with garden access",
    span: "sm:col-span-2 lg:col-span-2",
  },
  {
    slot: "gallery.5",
    fallback: "/images/main2.jpeg",
    alt: "Garden terrace with palms",
    span: "lg:row-span-2",
  },
  { slot: "gallery.6", fallback: "/images/main3.jpeg", alt: "Tropical breakfast on the terrace" },
  { slot: "gallery.7", fallback: "/images/main4.jpeg", alt: "Detail of garden and pool" },
];

export default async function GalleryGrid(): Promise<React.JSX.Element> {
  const t = await getTranslations("gallery");
  const resolved = await Promise.all(
    GALLERY_IMAGES.map(async (img) => ({
      ...img,
      src: await getImageUrl(img.slot, img.fallback),
    }))
  );

  return (
    <section id="gallery" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center">
          <p className="section-label">{t("label")}</p>
          <h2 className="section-title mt-3">{t("title")}</h2>
        </div>

        {/* auto-rows enforce tall rows so the row-span-2 cell (gallery.5)
            reads as a tall editorial slot rather than two stacked squares */}
        <div className="mt-14 grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[280px] md:gap-5 lg:grid-cols-4">
          {resolved.map(({ src, alt, span, slot }) => (
            <div
              key={slot}
              className={`group relative overflow-hidden rounded-2xl ring-1 ring-black/5 ${span ?? ""}`}
            >
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                // Wide spans = 2 columns of width; tall spans = 2 rows.
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
