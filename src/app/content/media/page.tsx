import React from "react";
import { IMAGE_SLOTS, getImage } from "@/lib/content";
import MediaSlot from "./MediaSlot";

export default async function MediaPage(): Promise<React.JSX.Element> {
  const mediaPublicUrl = process.env.MEDIA_PUBLIC_URL;
  const slots = await Promise.all(
    IMAGE_SLOTS.map(async (def) => {
      const current = await getImage(def.slot);
      return {
        slot: def.slot,
        label: def.label,
        fallback: def.fallback,
        current,
      };
    })
  );

  return (
    <div>
      <h1 className="text-brand-ink font-serif text-3xl font-semibold">Media</h1>
      <p className="text-brand-ink-soft mt-2 text-sm">
        Upload JPEG, PNG or WebP. Replacing an image is live within seconds. Removing falls back to
        the shipped default.
      </p>

      {!mediaPublicUrl && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Setup required:</strong> Uploads are stored in R2 but won&apos;t display on the
          site until{" "}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">MEDIA_PUBLIC_URL</code> is
          configured. Go to{" "}
          <strong>Cloudflare Pages → pinkhouse → Settings → Environment variables</strong> and add{" "}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">MEDIA_PUBLIC_URL</code> set
          to the public URL of the{" "}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">pinkhouse-media</code> R2
          bucket (e.g.{" "}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">
            https://pub-xxxx.r2.dev
          </code>
          ). Enable public access first via{" "}
          <strong>R2 → pinkhouse-media → Settings → Public access</strong>.
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {slots.map((s) => (
          <MediaSlot
            key={s.slot}
            slot={s.slot}
            label={s.label}
            fallback={s.fallback}
            currentUrl={s.current?.url ?? null}
            currentAlt={s.current?.alt ?? null}
          />
        ))}
      </div>
    </div>
  );
}
