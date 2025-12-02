import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { subscriptionId, email, uid, env, cancelNow } = await req.json();

  console.log(`Processing cancel-subscription for ID: ${subscriptionId}, email: ${email}, env: ${env}`);

  if (!subscriptionId) {
    return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
  }

  try {
    // Determine the correct Paddle API key based on environment
    const PADDLE_API_KEY =
      env === "sandbox"
        ? process.env.PADDLE_SECRET_TOKEN_SANDBOX
        : process.env.PADDLE_SECRET_TOKEN_LIVE;

    const PADDLE_VENDOR_ID =
      env === "sandbox"
        ? process.env.PADDLE_VENDOR_ID_SANDBOX
        : process.env.PADDLE_VENDOR_ID_LIVE;

    if (!PADDLE_API_KEY || !PADDLE_VENDOR_ID) {
      return NextResponse.json({ error: "Paddle credentials missing" }, { status: 500 });
    }
    console.log (`api key: ${PADDLE_API_KEY} and vendor id: ${PADDLE_VENDOR_ID}`)

    const response = await fetch(`https://api.paddle.com/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({
      //   vendor_id: PADDLE_VENDOR_ID,
      //   vendor_auth_code: PADDLE_API_KEY,
      //   effective_from: cancelNow ? "immediately" : "next_payment", // cancel immediately or next billing
      // }),..
      body: JSON.stringify({
        "effective_from": "next_billing_period"
      })

    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Paddle cancel error:", data);
      return NextResponse.json({ error: "Failed to cancel subscription", details: data }, { status: response.status });
    }

    console.log("✅ Subscription cancel scheduled:", data);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
