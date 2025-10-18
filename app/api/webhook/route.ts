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
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";
import dbConnect from "../mongodb/connection/dbConnection";
import WebhookLog from "../mongodb/schemas/webhooklog";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

// ✅ Paddle setup
const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
  environment: Environment.production,
});

// ✅ Webhook logging function
async function logWebhookEvent(
  eventData: any,
  status: string,
  error: any = null,
  signature?: string,
  req?: Request
) {
  try {
    const logEntry = new WebhookLog({
      eventType: eventData?.eventType || "unknown",
      dataId: eventData?.data?.id || "unknown",
      status,
      eventData,
      signature,
      ipAddress: req?.headers?.get("x-forwarded-for") || "unknown",
      userAgent: req?.headers?.get("user-agent") || "unknown",
      errorMessage: error?.message,
      errorStack: error?.stack,
      processedAt: new Date(),
    });

    await logEntry.save();
    console.log(`📘 Webhook logged: ${eventData?.eventType || "unknown"} - ${status}`);
  } catch (err) {
    console.error("❌ Failed to log webhook:", err);
  }
}

export async function POST(req: Request) {
  await dbConnect();

  const signature = req.headers.get("paddle-signature") || "";
  const rawRequestBody = await req.text();
  const secretKey = process.env.WEBHOOK_SECRET_KEY || "";

  try {
    if (!signature || !rawRequestBody) {
      console.warn("⚠️ Missing signature or request body");
      await logWebhookEvent({ eventType: "unknown" }, "missing_data", null, signature, req);
      return NextResponse.json({ ok: false, error: "Missing data" }, { status: 400 });
    }

    // ✅ Verify and decode Paddle event
    const eventData = await paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature);
    console.log("📦 Paddle Webhook Received:", JSON.stringify(eventData, null, 2));

    // const email =
    //   'jmgutierrez122091@gmail.com' ||
    //   null;

    // if (!email) console.warn("⚠️ No email found in event data.");

    // ✅ Handle event types
    switch (eventData.eventType) {
      case EventName.SubscriptionActivated:
        console.log(`✅ Subscription ${eventData.data.id} activated`);
        // await logWebhookEvent(eventData, "success", null, signature, req);

        // if (email) {
        //   const userRef = doc(db, "Firebase-jigzexplorer-profiles", email);
        //   await updateDoc(userRef, { premium: true });
        //   console.log(`🔥 Firestore updated: ${email} -> premium: true`);
        // }
        break;

      case EventName.SubscriptionCanceled:
        console.log(`⚠️ Subscription ${eventData.data.id} canceled`);
        await logWebhookEvent(eventData, "success", null, signature, req);

        // if (email) {
        //   const userRef = doc(db, "Firebase-jigzexplorer-profiles", email);
        //   await updateDoc(userRef, { premium: false });
        //   console.log(`🧊 Firestore updated: ${email} -> premium: false`);
        // }
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${eventData.eventType}`);
        await logWebhookEvent(eventData, "ignored", null, signature, req);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    await logWebhookEvent({ eventType: "unknown" }, "error", err, signature, req);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
