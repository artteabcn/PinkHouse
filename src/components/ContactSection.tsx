"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ContactSchema, type ContactInput } from "@/lib/validations/contact";
import { useState } from "react";

export default function ContactSection(): React.JSX.Element {
  const t = useTranslations("contact");
  const tf = useTranslations("contact.form");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(ContactSchema),
  });

  async function onSubmit(data: ContactInput): Promise<void> {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  }

  const contactItems = [
    { icon: MapPin, label: t("address") },
    { icon: Phone, label: t("phone"), href: `tel:${t("phone").replace(/\s/g, "")}` },
    { icon: Mail, label: t("email"), href: `mailto:${t("email")}` },
  ];

  return (
    <section id="contact" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="section-label">{t("label")}</p>
          <h2 className="section-title mt-3">{t("title")}</h2>
          <p className="section-subtitle mx-auto">{t("subtitle")}</p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          {/* Contact info */}
          <div className="flex flex-col gap-8">
            {contactItems.map(({ icon: Icon, label, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="bg-brand-pink-light flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="text-brand-pink-dark size-5" />
                </div>
                {href ? (
                  <a href={href} className="hover:text-brand-pink mt-1 text-gray-700">
                    {label}
                  </a>
                ) : (
                  <p className="mt-1 text-gray-700">{label}</p>
                )}
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/6677000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-3 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <MessageCircle className="size-5" />
              {t("whatsapp")}
            </a>

            {/* Map embed placeholder */}
            <div className="bg-brand-sage-light mt-2 h-56 overflow-hidden rounded-2xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15807.06!2d100.0541465!3d9.4740216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMjgnMjYuNSJOIDEwMMKwMDMnMTUuMCJF!5e0!3m2!1sen!2sth!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Pink House location"
              />
            </div>
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div>
              <input
                {...register("name")}
                placeholder={tf("name")}
                className={cn(
                  "focus:border-brand-pink w-full rounded-xl border px-4 py-3 text-sm transition-colors outline-none",
                  errors.name ? "border-red-400" : "border-gray-200"
                )}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <input
                {...register("email")}
                type="email"
                placeholder={tf("email")}
                className={cn(
                  "focus:border-brand-pink w-full rounded-xl border px-4 py-3 text-sm transition-colors outline-none",
                  errors.email ? "border-red-400" : "border-gray-200"
                )}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <input
                {...register("phone")}
                placeholder={tf("phone")}
                className="focus:border-brand-pink w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors outline-none"
              />
            </div>

            <div>
              <textarea
                {...register("message")}
                rows={5}
                placeholder={tf("message")}
                className={cn(
                  "focus:border-brand-pink w-full resize-none rounded-xl border px-4 py-3 text-sm transition-colors outline-none",
                  errors.message ? "border-red-400" : "border-gray-200"
                )}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
              )}
            </div>

            {status === "success" && (
              <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                {tf("success")}
              </p>
            )}
            {status === "error" && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{tf("error")}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-pink hover:bg-brand-pink-dark rounded-full px-8 py-3 font-semibold text-white shadow-sm transition-colors disabled:opacity-60"
            >
              {isSubmitting ? tf("sending") : tf("submit")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
