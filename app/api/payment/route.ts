import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";

const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
  environment: Environment.sandbox,

});

export async function GET(req: Request) {
  console.log('intializing')
  const txn = await paddle.transactions.create({
    items: [
      {
        quantity: 1, // ✅ just a number when using priceId
        priceId: "pri_01k56yns22wkpzrztxpc0ztr64" // -> this is like a paddle key
      }
    ]
  });

  console.log(txn);
  return NextResponse.json({ txn: txn.id});
}
