// Charge model: 50% non-refundable deposit collected at booking time,
// balance due on arrival. Bump or drop this constant to change the split.
export const DEPOSIT_PERCENT = 50;

// Direct-website discount: guests who book through pinkhousekohsamui.com get
// this percent off Smoobu's published nightly rates. Smoobu still stores the
// undiscounted rates in /rates; the discount is a website-only incentive
// applied on top. Flip to 0 to disable. 5 = 5% off.
export const DISCOUNT_PERCENT = 5;

/**
 * Apply the direct-website discount to an undiscounted Smoobu total.
 * Rounds to the nearest baht (Smoobu rates are whole THB; partial-baht
 * rounding stays on the safe side for the house).
 */
export function applyDiscount(undiscountedThb: number): number {
  if (DISCOUNT_PERCENT <= 0) return Math.round(undiscountedThb);
  return Math.round((undiscountedThb * (100 - DISCOUNT_PERCENT)) / 100);
}

/** Discount amount that was taken off (positive number, 0 if discount disabled). */
export function discountAmount(undiscountedThb: number): number {
  return Math.max(0, Math.round(undiscountedThb) - applyDiscount(undiscountedThb));
}

export function depositAmount(totalThb: number): number {
  // totalThb is already the discounted total. Round up so the house never
  // collects less than the deposit share due to rounding.
  return Math.ceil((totalThb * DEPOSIT_PERCENT) / 100);
}

export function balanceDue(totalThb: number): number {
  return totalThb - depositAmount(totalThb);
}
