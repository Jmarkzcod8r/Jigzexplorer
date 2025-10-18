import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";

const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
  environment: Environment.sandbox, // switch to .production in live mode
});

export async function POST(req: Request) {
  console.log("api/paddle/activate-subscription");

  try {
    const { email } = await req.json();
    console.log("email:", email);

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // ✅ Create a Paddle transaction (server-side)
    const txn = await paddle.transactions.create({
      items: [
        {
          quantity: 1,
          price: {
            name: "Premium Plan",
            description: "Access to premium features",
            billingCycle: {
              interval: "month",
              frequency: 1,
            },
            unitPrice: {
              currencyCode: "USD",
              amount: "500", // $5.00 subscription
            },
            product: {
              name: "Premium Access",
              description: "1-Month Premium Subscription",
              taxCategory: "saas",
            },
          },
        },
      ],

      customData: {
        userEmail: email, // optional, useful for tracking
      },
      // successUrl: "https://jigzexplorer.quest/checkout-success",
      // cancelUrl: "https://jigzexplorer.quest/checkout-cancel",
    });

    console.log("Created Paddle transaction:", txn);

    // ✅ Return checkout URL to frontend
    return NextResponse.json({ transactionId: txn.id, checkoutUrl: txn.checkout });
  } catch (error: any) {
    console.error("Paddle Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
