import { Environment, Paddle } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";

const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
    environment: Environment.sandbox
});

export async function GET (req:Request) {
    // 30 usd txn
    const txn = await paddle.transactions.create({
        items: [
            {
                quantity: 1,
                price: {
                    name: "Dynamically generated price",
                    description: "Dynamically generated description",
                    // This is for subscription-based payments.. start
                    billingCycle: {
                        interval: "month",
                        frequency: 1,
                    },
                    //... end
                    unitPrice: {
                        currencyCode: "USD",
                        amount: "2500", //-> This determines your price. 2500 = $25
                    },
                    product: {
                        name: "Dynamicaly generated product",
                        description: "Dynamically generated desription",
                        taxCategory: "standard",
                    }

                }
            }
        ]
    })

    console.log(txn);
    return NextResponse.json({txn:txn.id}) ;
}


