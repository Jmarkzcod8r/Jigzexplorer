import { NextResponse } from "next/server";

export async function POST(req: Request) {
    console.log('api/paddle/activate-subscription')
  try {
    const { email } = await req.json();
    console.log('email:', email)
    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // ✅ Make a server-to-server call to Paddle’s REST API
    const response = await fetch("https://sandbox-api.paddle.com/checkout-sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PADDLE_SECRET_KEY}`,
      },
      body: JSON.stringify({
        items: [
          {
            price_id: "pri_01k56yns22wkpzrztxpc0ztr64",
            quantity: 1,
          },
        ],
        custom_data: {
          email: email, // ✅ your custom data
        },
        success_url: "https://jigzexplorer.quest/checkout-success",
        cancel_url: "https://jigzexplorer.quest/checkout-cancel",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create checkout session");
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Paddle Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
