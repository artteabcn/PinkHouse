import { z } from "zod";
import { MAX_PARTY_SIZE } from "@/config/smoobu";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const BookingSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(6, "Phone number is required"),
    roomId: z.string().min(1),
    apartmentId: z.coerce.number().int().positive().optional(),
    checkIn: z.string().regex(ISO_DATE, "Check-in must be YYYY-MM-DD"),
    checkOut: z.string().regex(ISO_DATE, "Check-out must be YYYY-MM-DD"),
    adults: z.coerce.number().int().min(1).max(MAX_PARTY_SIZE).default(2),
    children: z.coerce.number().int().min(0).max(MAX_PARTY_SIZE).default(0),
    totalPrice: z.coerce.number().int().nonnegative().optional(),
    locale: z.string().min(2).max(5).default("en"),
    notes: z.string().optional(),
    paymentIntentId: z.string().startsWith("pi_"),
    bookingId: z.coerce.number().int().positive().nullable().optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });

export type BookingInput = z.infer<typeof BookingSchema>;
