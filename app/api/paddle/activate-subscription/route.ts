import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";

// Notes:
// (1) The env from req.json() controls whether this backend is in sandbox or production

const paddle_sandbox = new Paddle(process.env.PADDLE_SECRET_TOKEN_SANDBOX!, {
  environment: Environment.sandbox, // switch to .production in live mode
});

// const paddle_live = new Paddle(process.env.PADDLE_SECRET_TOKEN_LIVE!, {
const paddle_live = new Paddle('pdl_live_apikey_01k6aybmav7e5q4h1cevreqfar_b5bdbhE4yA1A4cvyfpJB7T_A0u', {
  environment: Environment.production, // switch to .production in live mode
});

export async function POST(req: Request) {
  console.log("api/paddle/activate-subscription");
  console.log("SANDBOX TOKEN:", process.env.PADDLE_SECRET_TOKEN_SANDBOX);
  console.log("LIVE TOKEN:", process.env.PADDLE_SECRET_TOKEN_LIVE);

  try {
    const { email, uid, env } = await req.json();
    console.log("email:", email);
    console.log("uid:", uid);
    console.log("env:", env);

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // ✅ Create a Paddle transaction (server-side)
    if (env === 'sandbox') {
      console.log("commencing sandbox protocol");
      const txn = await paddle_sandbox.transactions.create({
        items: [
          {

            // priceId: "pri_01k56yns22wkpzrztxpc0ztr64",  // This is sandbox- $3
            priceId: "pri_01k52257k9nrrcvm74m88cct2t",  // This is sandbox - $30
            // priceId: "pri_01k83r3pxx8g69603hpc7bm27s",  // This is for production
            // priceId: "pri_01kaxe46svpfvd2wr3sngap8se",  // This is for production - $1

            quantity: 1
          },
        ],

        // customData: {
        //   userEmail: email, // optional, useful for tracking
        //   uid: uid
        // },
        // successUrl: "https://jigzexplorer.quest/checkout-success",
        // cancelUrl: "https://jigzexplorer.quest/checkout-cancel",
      });

      console.log("Created Paddle transaction:", txn);

      // ✅ Return checkout URL to frontend
      return NextResponse.json({ transactionId: txn.id, checkoutUrl: txn.checkout });
    }
    if (env === 'production') {
      console.log("commencing live protocol");

      const txn = await paddle_live.transactions.create({
        items: [
          {

            // priceId: "pri_01k56yns22wkpzrztxpc0ztr64",  // This is sandbox- $3
            // priceId: "pri_01k52257k9nrrcvm74m88cct2t",  // This is sandbox - $30
            // priceId: "pri_01k83r3pxx8g69603hpc7bm27s",  // This is for production
            priceId: "pri_01kaxe46svpfvd2wr3sngap8se",  // This is for production - $1

            quantity: 1
          },
        ],

        // customData: {
        //   userEmail: email, // optional, useful for tracking
        //   uid: uid
        // },
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
