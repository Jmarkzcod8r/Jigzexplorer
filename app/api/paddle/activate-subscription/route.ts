import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";



const paddle_sandbox = new Paddle(process.env.PADDLE_SECRET_TOKEN_SANDBOX!, {
  environment: Environment.sandbox, // switch to .production in live mode
});

export async function POST(req: Request) {
  console.log("api/paddle/activate-subscription");

  try {
    const { email, uid, env } = await req.json();
    console.log("email:", email);
    console.log("uid:", uid);
    console.log("env:", env);

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // ✅ Create a Paddle transaction (server-side)
    if (env == 'sandbox') {
      const txn = await paddle_sandbox.transactions.create({
        items: [
          {

            priceId: "pri_01k56yns22wkpzrztxpc0ztr64",  // This is sandbox
            // priceId: "pri_01k83r3pxx8g69603hpc7bm27s",  // This is for production

            quantity: 1
          },
        ],

        customData: {
          userEmail: email, // optional, useful for tracking
          uid: uid
        },
        // successUrl: "https://jigzexplorer.quest/checkout-success",
        // cancelUrl: "https://jigzexplorer.quest/checkout-cancel",
      });

      console.log("Created Paddle transaction:", txn);

      // ✅ Return checkout URL to frontend
      return NextResponse.json({ transactionId: txn.id, checkoutUrl: txn.checkout });
    }

  } catch (error: any) {
    console.error("Paddle Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
