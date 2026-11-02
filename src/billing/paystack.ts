import { z } from "zod";
import { check } from "@/platform/errors";
export const paymentReference = z.string().regex(/^[A-Za-z0-9._=-]{1,100}$/);
const minor = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const observation = z.object({
  reference: paymentReference,
  domain: z.literal("test"),
  status: z.enum([
    "success",
    "failed",
    "abandoned",
    "ongoing",
    "pending",
    "processing",
    "queued",
    "reversed",
  ]),
  currency: z.enum(["NGN", "GHS", "ZAR", "KES", "USD"]),
  amount: minor,
  paid_at: z.iso.datetime({ offset: true }).nullable(),
  customer: z.object({ customer_code: z.string().regex(/^CUS_[A-Za-z0-9]+$/) }),
});
export type PaymentObservation = z.infer<typeof observation>;
// No live charges, browser key, card handling, redirect confirmation or automatic grant.
export async function verifyPaystack(
  reference: string,
  key: string,
  transport: typeof fetch = fetch,
): Promise<PaymentObservation> {
  paymentReference.parse(reference);
  check(
    /^sk_test_[A-Za-z0-9]+$/.test(key),
    503,
    "BILLING_TEST_KEY_REQUIRED",
    "Only a securely configured Paystack test secret is accepted until merchant eligibility and release controls are approved.",
  );
  const response = await transport(
    "https://api.paystack.co/transaction/verify/" +
      encodeURIComponent(reference),
    {
      method: "GET",
      headers: { Authorization: "Bearer " + key },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
      redirect: "error",
    },
  );
  check(
    response.ok,
    502,
    "BILLING_PROVIDER_UNAVAILABLE",
    "Provider verification failed; no billing change was recorded.",
  );
  const text = await response.text();
  check(
    text.length <= 100000,
    502,
    "BILLING_RESPONSE_LIMIT",
    "Provider response exceeds the verification envelope.",
  );
  const body = z
    .object({ status: z.literal(true), data: observation })
    .parse(JSON.parse(text));
  check(
    body.data.reference === reference,
    409,
    "PAYMENT_REFERENCE_MISMATCH",
    "Provider reference mismatch.",
  );
  return body.data;
}

const checkoutReview = z
  .object({
    customerEmail: z.email(),
    planCode: z.string().regex(/^PLN_[A-Za-z0-9]+$/),
    reference: paymentReference,
    expectedAmountMinor: z
      .number()
      .int()
      .positive()
      .max(Number.MAX_SAFE_INTEGER),
    currency: z.literal("GHS"),
  })
  .strict();
// Operator-only test checkout. Accepted order/customer binding must be independently reviewed.
export async function createTestCheckout(
  input: unknown,
  key: string,
  transport: typeof fetch = fetch,
) {
  const a = checkoutReview.parse(input);
  check(
    /^sk_test_[A-Za-z0-9]+$/.test(key),
    503,
    "BILLING_TEST_KEY_REQUIRED",
    "Only a Paystack test secret is accepted.",
  );
  const headers = {
    Authorization: "Bearer " + key,
    "Content-Type": "application/json",
  };
  const planResponse = await transport(
    "https://api.paystack.co/plan/" + encodeURIComponent(a.planCode),
    {
      headers,
      signal: AbortSignal.timeout(10000),
      redirect: "error",
      cache: "no-store",
    },
  );
  check(
    planResponse.ok,
    502,
    "BILLING_PLAN_UNAVAILABLE",
    "Plan could not be verified.",
  );
  const plan = z
    .object({
      status: z.literal(true),
      data: z.object({
        domain: z.literal("test"),
        plan_code: z.string(),
        amount: minor,
        currency: z.literal("GHS"),
        interval: z.literal("monthly"),
      }),
    })
    .parse(await planResponse.json());
  check(
    plan.data.plan_code === a.planCode &&
      plan.data.amount === a.expectedAmountMinor,
    409,
    "BILLING_PLAN_MISMATCH",
    "Review plan price before creating checkout.",
  );
  const response = await transport(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: a.customerEmail,
        amount: String(a.expectedAmountMinor),
        currency: a.currency,
        plan: a.planCode,
        reference: a.reference,
      }),
      signal: AbortSignal.timeout(10000),
      redirect: "error",
      cache: "no-store",
    },
  );
  check(
    response.ok,
    502,
    "CHECKOUT_REVIEW_REQUIRED",
    "Checkout outcome is unknown; reconcile the reference before retrying.",
  );
  const body = z
    .object({
      status: z.literal(true),
      data: z.object({
        authorization_url: z.url(),
        reference: paymentReference,
      }),
    })
    .parse(await response.json());
  const url = new URL(body.data.authorization_url);
  check(
    url.protocol === "https:" &&
      url.hostname === "checkout.paystack.com" &&
      !url.username &&
      !url.password &&
      body.data.reference === a.reference,
    502,
    "CHECKOUT_RESPONSE_INVALID",
    "Checkout response requires review.",
  );
  return body.data;
}
