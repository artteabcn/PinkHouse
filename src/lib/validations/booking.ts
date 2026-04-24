import { z } from "zod";

export const BookingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number is required"),
  roomId: z.enum(["standard", "deluxe", "family"]),
  checkIn: z.string().min(1, "Check-in date is required"),
  checkOut: z.string().min(1, "Check-out date is required"),
  guests: z.coerce.number().int().min(1).max(4),
  notes: z.string().optional(),
});

export type BookingInput = z.infer<typeof BookingSchema>;
