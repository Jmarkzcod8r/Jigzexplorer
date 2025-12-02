// import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
// import { NextResponse } from "next/server";
// import dbConnect from "../mongodb/connection/dbConnection";
// import WebhookLog from "../mongodb/schemas/webhooklog";

// const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
//   environment: Environment.production
// });

// async function logWebhookEvent(
//   eventData: any,
//   status: string,
//   error: any = null,
//   signature?: string,
//   req?: Request
// ) {
//   try {
//     const logEntry = new WebhookLog({
//       eventType: eventData?.eventType || 'unknown',
//       dataId: eventData?.data?.id || 'unknown',
//       status: status,
//       eventData: eventData,
//       signature: signature,
//       ipAddress: req?.headers?.get('x-forwarded-for') || 'unknown',
//       userAgent: req?.headers?.get('user-agent') || 'unknown',
//       errorMessage: error?.message,
//       errorStack: error?.stack,
//       processedAt: new Date()
//     });

//     await logEntry.save();
//     console.log(`Webhook logged: ${eventData?.eventType || 'unknown'} - ${status}`);
//   } catch (error) {
//     console.error('Failed to log webhook:', error);
//   }
// }

// export async function POST(req: Request) {
//   await dbConnect();

//   const signature = (req.headers.get('paddle-signature') as string) || '';
//   const rawRequestBody = (await req.text()) || '';
//   const secretKey = process.env.WEBHOOK_SECRET_KEY || '';

//   try {
//     if (signature && rawRequestBody) {
//       const eventData = await paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature);

//       // Log successful verification into Mongodb
//       // await logWebhookEvent(eventData, 'processing', null, signature, req);

//       // Handle different event types
//       switch (eventData.eventType) {
//         case EventName.SubscriptionActivated:
//           console.log(`Subscription ${eventData.data.id} was activated`);
//           console.log("Paddle Webhook Received:", JSON.stringify(eventData, null, 2));
//           // await logWebhookEvent(eventData, 'success', null, signature, req);
//           // Add your subscription activation logic here


//           break;

//         case EventName.SubscriptionCanceled:
//           console.log(`Subscription ${eventData.data.id} was canceled`);
//           await logWebhookEvent(eventData, 'success', null, signature, req);
//           // Add your subscription cancellation logic here
//           break;

//         case EventName.TransactionPaid:
//           console.log(`Transaction ${eventData.data.id} was paid`);
//           console.log(`Data: ${eventData.data} `);
//           await logWebhookEvent(eventData, 'success', null, signature, req);
//           // Add your transaction logic here
//           break;

//         default:
//           console.log(`Unhandled event: ${eventData.eventType}`);
//           await logWebhookEvent(eventData, 'success', null, signature, req);
//       }
//     } else {
//       console.log('Signature missing in header');
//       await logWebhookEvent(
//         { eventType: 'unknown', data: { id: 'unknown' } },
//         'missing_data',
//         null,
//         signature,
//         req
//       );
//     }
//   } catch (e) {
//     console.log('Webhook processing error:', e);
//     await logWebhookEvent(
//       { eventType: 'unknown', data: { id: 'unknown' } },
//       'error',
//       e,
//       signature,
//       req
//     );
//   }

//   return NextResponse.json({ ok: true });
// }

// Notes:
// (1)Change also the secret key in .env file everytime a new webhook connection is made

import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";
import dbConnect from "../mongodb/connection/dbConnection";
import WebhookLog from "../mongodb/schemas/webhooklog";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

// change this to either sandbox or production...
const webhook_environment = "sandbox"; // or "production"

// Choose correct Paddle secret token
const paddleSecret =
  webhook_environment === "sandbox"
    ? process.env.PADDLE_SECRET_TOKEN_SANDBOX!
    : process.env.PADDLE_SECRET_TOKEN_LIVE!;

// Initialize Paddle
const paddle = new Paddle(paddleSecret, {
  environment:
    webhook_environment === "sandbox"
      ? Environment.sandbox
      : Environment.production,
});

const now = new Date();

const formattedDate = now.toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
}).replace(",", "."); // Add the dot after month

// Format hours and minutes in 24-hour format
const hours = now.getHours().toString().padStart(2, "0");
const minutes = now.getMinutes().toString().padStart(2, "0");

const finalDate = `${formattedDate} ${hours}${minutes}H`;

// ✅ Webhook logging function
// async function logWebhookEvent(
//   eventData: any,
//   status: string,
//   error: any = null,
//   signature?: string,
//   req?: Request
// ) {
//   try {
//     const logEntry = new WebhookLog({
//       eventType: eventData?.eventType || "unknown",
//       dataId: eventData?.data?.id || "unknown",
//       status,
//       eventData,
//       signature,
//       ipAddress: req?.headers?.get("x-forwarded-for") || "unknown",
//       userAgent: req?.headers?.get("user-agent") || "unknown",
//       errorMessage: error?.message,
//       errorStack: error?.stack,
//       processedAt: new Date(),
//     });

//     await logEntry.save();
//     console.log(`📘 Webhook logged: ${eventData?.eventType || "unknown"} - ${status}`);
//   } catch (err) {
//     console.error("❌ Failed to log webhook:", err);
//   }
// }

export async function POST(req: Request) {
  console.log('initializing api/webhook/sandbox..')
  // await dbConnect();

  const signature = req.headers.get("paddle-signature") || "";
  const rawRequestBody = await req.text();
  const secretKey = process.env.WEBHOOK_SECRET_KEY_SANDBOX || ""
  // webhook_environment === "sandbox"
  //   ? process.env.WEBHOOK_SECRET_KEY_SANDBOX || ""
  //   : process.env.WEBHOOK_SECRET_KEY_LIVE || "";

  try {
    if (!signature || !rawRequestBody) {
      console.warn("⚠️ Missing signature or request body");
      // await logWebhookEvent({ eventType: "unknown" }, "missing_data", null, signature, req);
      return NextResponse.json({ ok: false, error: "Missing data" }, { status: 400 });
    }

    // ✅ Verify and decode Paddle event
    const eventData = await paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature);
    const JSONData = JSON.stringify(eventData, null, 2);
    console.log("📦 Paddle Webhook Received:", JSONData);

    // convert string back to object
    const parsedData = JSON.parse(JSONData);
    const email = parsedData.data?.customData?.userEmail;
    const uid = parsedData.data?.customData?.uid;

    console.log('thiss is in customData',email);

    console.log('thiss is in customDate-uid',uid);
    // const email =
    //   'jmgutierrez122091@gmail.com' ||
    //   null;

    // if (!email) console.warn("⚠️ No email found in event data.");

    // ✅ Handle event types
    switch (eventData.eventType) {
      case EventName.SubscriptionActivated:
        console.log(`⚠️ ${finalDate}: Subscription ${eventData.data.id} activated`);

        // await logWebhookEvent(eventData, "success", null, signature, req);

        // if (email) {
          // const userRef = doc(db, "Firebase-jigzexplorer-profiles", uid);
          // await updateDoc(userRef, {
          //   premium: {
          //     status: true,
          //     subscriptionId: eventData.data.id, // ✅ correct syntax
          //   },
          // });
          // console.log(`🔥 Firestore updated: ${email} -> premium {status: true, subscription: ${eventData.data.id}`);
          // localStorage.setItem ('subId', eventData.data.id ) //-> cannot be used on server
        // }
        break;

      case EventName.SubscriptionCanceled:
        console.log(`⚠️ ${finalDate}: Subscription ${eventData.data.id} canceled`);
        break;

      case EventName.TransactionUpdated:
        console.log(`⚠️ ${finalDate}: Transaction ${eventData.data.id} updated....`);
        break;

      case EventName.TransactionReady:
        console.log(`⚠️ ${finalDate}: Transaction ${eventData.data.id} ready....`);
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    // await logWebhookEvent({ eventType: "unknown" }, "error", err, signature, req);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
