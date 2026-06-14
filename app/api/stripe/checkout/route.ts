import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const priceLookup = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
  },
} as const;

type PlanKey = keyof typeof priceLookup;
type BillingCycle = keyof (typeof priceLookup)[PlanKey];
type StripeRecurringInterval = "month" | "year";

function isStripePriceId(value: string | undefined): value is string {
  return Boolean(value && value.startsWith("price_"));
}

function isStripeProductId(value: string | undefined): value is string {
  return Boolean(value && value.startsWith("prod_"));
}

async function resolveStripePriceId(
  configuredId: string,
  billingCycle: BillingCycle,
) {
  if (isStripePriceId(configuredId)) {
    return configuredId;
  }

  if (!isStripeProductId(configuredId)) {
    throw new Error(
      `Invalid Stripe identifier "${configuredId}". Use a price ID starting with "price_" or a product ID starting with "prod_".`,
    );
  }

  const prices = await stripe!.prices.list({
    product: configuredId,
    active: true,
    limit: 100,
  });

  const expectedInterval: StripeRecurringInterval =
    billingCycle === "monthly" ? "month" : "year";

  const matchedPrice = prices.data.find((price) => {
    if (!price.recurring) {
      return false;
    }

    return price.recurring.interval === expectedInterval;
  });

  if (matchedPrice?.id) {
    return matchedPrice.id;
  }

  const fallbackPrice = prices.data.find((price) => price.recurring)?.id;

  if (fallbackPrice) {
    return fallbackPrice;
  }

  throw new Error(
    `No active recurring Stripe price found for product "${configuredId}" and billing cycle "${billingCycle}". Create a monthly or yearly recurring price in Stripe.`,
  );
}

export async function POST(request: Request) {
  try {
    if (!stripe || !stripeSecretKey) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured. Set STRIPE_SECRET_KEY and the price IDs in your environment.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json().catch(() => null)) as
      | { plan?: PlanKey; billingCycle?: BillingCycle }
      | null;

    const plan = body?.plan;
    const billingCycle = body?.billingCycle ?? "monthly";

    if (!plan || !(plan in priceLookup)) {
      return NextResponse.json({ error: "A valid plan is required." }, { status: 400 });
    }

    const priceId = priceLookup[plan][billingCycle];

    if (!priceId) {
      return NextResponse.json(
        {
          error: `Missing Stripe price ID for ${plan} (${billingCycle}).`,
        },
        { status: 500 },
      );
    }

    const resolvedPriceId = await resolveStripePriceId(priceId, billingCycle);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: resolvedPriceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/plans?success=1&plan=${plan}`,
      cancel_url: `${baseUrl}/plans?canceled=1`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          plan,
          billingCycle,
        },
      },
      metadata: {
        plan,
        billingCycle,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout session.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}