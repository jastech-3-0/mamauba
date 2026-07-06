import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * In production this endpoint would create a Stripe PaymentIntent (or Checkout
 * Session) and return the client_secret / URL so the frontend can complete the
 * payment. For the demo we just register the donation in the database with
 * status "pending" and return a fake client_secret so the UI can proceed.
 *
 * To enable real Stripe:
 *   1. npm install stripe @stripe/stripe-js
 *   2. Add STRIPE_SECRET_KEY to .env
 *   3. Replace the simulated block below with stripe.paymentIntents.create(...)
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      currency = "USD",
      frequency = "once",
      campaignId = null,
      donorName,
      donorEmail,
      donorCountry,
      taxCert = false,
    } = body ?? {};

    if (!donorName || !donorEmail || !amount || amount < 1) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (donorName, donorEmail, amount)" },
        { status: 400 },
      );
    }

    // Persist the donation
    const donation = await db.donation.create({
      data: {
        amount: Math.round(amount),
        currency,
        frequency,
        campaignId: campaignId ?? null,
        donorName,
        donorEmail,
        donorCountry,
        taxCert,
        status: "pending",
        stripeRef: `demo_pi_${Date.now()}`,
      },
    });

    // Update campaign stats (if a campaign was specified)
    if (campaignId) {
      await db.campaign.update({
        where: { id: campaignId },
        data: {
          raised: { increment: Math.round(amount) },
          backers: { increment: 1 },
        },
      });
    }

    // Record movement for transparency
    await db.movement.create({
      data: {
        type: "in",
        amount: Math.round(amount),
        currency,
        concept: `Donación ${frequency === "monthly" ? "mensual" : "única"} - ${donorName}`,
      },
    });

    // Demo "client_secret" (replace with real Stripe response in production)
    const clientSecret = `demo_secret_${donation.id}_${Date.now()}`;

    return NextResponse.json({
      donationId: donation.id,
      clientSecret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null,
      liveMode: !!process.env.STRIPE_SECRET_KEY,
    });
  } catch (e) {
    console.error("[donations/create-intent]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
