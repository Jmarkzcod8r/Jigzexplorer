import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { subscriptionId } = await req.json();

  if (!subscriptionId) {
    return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://sandbox-api.paddle.com/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PADDLE_SECRET_TOKEN}`,
        "Content-Type": "application/json",
      },
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
