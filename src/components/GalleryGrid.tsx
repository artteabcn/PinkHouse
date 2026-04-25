import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

const GALLERY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80",
    alt: "Pool area",
    tall: true,
  },
  {
    src: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80",
    alt: "Breakfast spread",
  },
  {
    src: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
    alt: "Koh Samui beach",
  },
  {
    src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    alt: "Garden view",
  },
  {
    src: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80",
    alt: "Room interior",
    tall: true,
  },
  {
    src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    alt: "Tropical surroundings",
  },
];

export default function GalleryGrid(): React.JSX.Element {
  const t = useTranslations("gallery");

  return (
    <section id="gallery" className="bg-white py-32">
      <div className="mx-auto max-w-7xl px-8">
        <div className="text-center">
          <p className="section-label">{t("label")}</p>
          <h2 className="section-title mt-3">{t("title")}</h2>
        </div>

        <div className="mt-14 columns-2 gap-3 md:columns-3">
          {GALLERY_IMAGES.map(({ src, alt, tall }) => (
            <div key={src} className="mb-3 break-inside-avoid overflow-hidden">
              <div className={`relative w-full ${tall ? "aspect-[3/4]" : "aspect-square"}`}>
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
