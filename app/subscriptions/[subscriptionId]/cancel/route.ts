import { NextResponse } from "next/server";
import { Paddle, Environment } from '@paddle/paddle-node-sdk';


export async function POST(req: Request) {

    try {
  const { subscriptionId, email, uid, env, cancelNow } = await req.json();

  console.log(`Processing canceling-subscription for ID: ${subscriptionId}, email: ${email}, env: ${env}`);

  if (!subscriptionId) {
    return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
  }

  const paddle = env === 'sandbox'
  ? new Paddle(process.env.PADDLE_SECRET_TOKEN_SANDBOX!, {
      environment: Environment.sandbox
    })
  : new Paddle(process.env.PADDLE_SECRET_TOKEN_LIVE!, {
      environment: Environment.production
    });

    console.log (`paddle to be used: ${paddle}`)
    try {
        const response = await paddle.subscriptions.cancel(subscriptionId, {
            effectiveFrom: "immediately"
          });
      console.log('Cancel response:', response);
      return NextResponse.json({ response: response });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }


    // const response = await fetch(`https://api.paddle.com/subscriptions/${subscriptionId}/cancel`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization":`Bearer ${process.env.PADDLE_SECRET_TOKEN_SANDBOX}`
    //   },
    //   // body: JSON.stringify({
    //   //   effective_from: "next_billing_period",
    //   //   // vendor_id: PADDLE_VENDOR_ID,
    //   //   // vendor_auth_code: PADDLE_API_KEY,
    //   //   // effective_from: cancelNow ? "immediately" : "next_payment", // cancel immediately or next billing
    //   // })
    //   body: JSON.stringify({
    //     'effective_from': "immediately"
    //   })

    // });

    // const data = await response.json();

    // if (!response.ok) {
    //   console.error("❌ Paddle cancel error:", data);
    //   return NextResponse.json({ error: "Failed to cancel subscription", details: data }, { status: response.status });
    // }

    // console.log("✅ Subscription cancel scheduled:", data);
    // return NextResponse.json({ success: true, data });

  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
