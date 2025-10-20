import { NextResponse } from "next/server";

export async function POST(req: Request) {

  // For canceling Subscription: <start>
      const { subscriptionId } = await req.json();
      console.log(`processing api/paddle/cancel-subscription/route.ts with id: ${ subscriptionId}`)
      if (!subscriptionId) {
        return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
      }

      try {
        const response = await fetch(`https://sandbox-api.paddle.com/subscriptions/${subscriptionId}/pause`, {

          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.PADDLE_SECRET_TOKEN}`,
            "Content-Type": "application/json",
          },
          // Pause immediately.. <start>
              body: JSON.stringify({
                "effective_from": "immediately"
              }),
          //  <end> ...Pause immediately..
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("❌ Paddle cancel error:", errorData);
          return NextResponse.json({ error: "Failed to cancel subscription" }, { status: response.status });
        }

        const data = await response.json();
        console.log("✅ Subscription canceled:", data);
        return NextResponse.json({ success: true, data });
      } catch (err) {
        console.error("Error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
      }

  }


