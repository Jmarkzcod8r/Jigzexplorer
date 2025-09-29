import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";

const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
  environment: Environment.production,

});

export async function GET(req: Request) {
  console.log('intializing')
  const txn = await paddle.transactions.create({
    items: [
      {
        quantity: 1, // ✅ just a number when using priceId
        // priceId: "pri_01k56yns22wkpzrztxpc0ztr64" // -> this is for sandbox environment
        priceId: "pri_01k69w2t6vc6zg9tyd99hzp80v"
      }
    ]
  });

  console.log(txn);
  return NextResponse.json({ txn: txn.id});
}
