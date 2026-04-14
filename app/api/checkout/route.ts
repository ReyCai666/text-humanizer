import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.LEMON_API_KEY;
  const variantId = process.env.NEXT_PUBLIC_LEMON_VARIANT_ID;
  const storeId = process.env.LEMON_STORE_ID;

  if (!apiKey || !variantId || !storeId) {
    return NextResponse.json(
      { error: "Payment not configured" },
      { status: 500 }
    );
  }

  try {
    const { variantId: bodyVariantId } = await req.json();
    // Allow overriding variant for different tiers
    const targetVariant = bodyVariantId || variantId;

    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {},
            product_options: {
              redirect_url: `${req.nextUrl.origin}?success=true`,
            },
          },
          relationships: {
            store: {
              data: { type: "stores", id: String(storeId) },
            },
            variant: {
              data: { type: "variants", id: String(targetVariant) },
            },
          },
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("LemonSqueezy error:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: "Failed to create checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.data.attributes.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
