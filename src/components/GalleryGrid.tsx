import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface GalleryImage {
  src: string;
  alt: string;
  span?: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
  { src: "/images/main.jpeg", alt: "Pool and tropical view", span: "lg:col-span-2" },
  { src: "/images/main2.jpeg", alt: "Outdoor lounge by the pool" },
  { src: "/images/main3.jpeg", alt: "The property in its tropical garden" },
  { src: "/images/main4.jpeg", alt: "Pink poolside with seating" },
  { src: "/images/room.jpeg", alt: "Bright bedroom with garden access", span: "lg:col-span-2" },
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

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {GALLERY_IMAGES.map(({ src, alt, span }) => (
            <div
              key={src}
              className={`relative aspect-[16/10] overflow-hidden rounded-2xl ring-1 ring-black/5 ${span ?? ""}`}
            >
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
