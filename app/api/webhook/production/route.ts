
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";
import dbConnect from "../../mongodb/connection/dbConnection";
import WebhookLog from "../../mongodb/schemas/webhooklog";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

// change this to either sandbox or production...
const webhook_environment = "production"; // or "production"

// Choose correct Paddle secret token
const paddleSecret =

     process.env.PADDLE_SECRET_TOKEN_LIVE!;

// Initialize Paddle
const paddle = new Paddle(paddleSecret, {
  environment:
   Environment.production,
});

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

export async function POST(req: Request) {
  // await dbConnect();
  console.log('initializing api/webhook/production..')

  const signature = req.headers.get("paddle-signature") || "";
  const rawRequestBody = await req.text();
  const secretKey = process.env.WEBHOOK_SECRET_KEY_LIVE || ""
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
      // 1️⃣ Transaction ready → checkout started
      case EventName.TransactionReady:
        console.log(`⚠️ ${finalDate}: Transaction ${eventData.data.id} ready → checkout started`);
        break;

      // 2️⃣ Transaction updated → transaction info updated
      case EventName.TransactionUpdated:
        console.log(`⚠️ ${finalDate}: Transaction ${eventData.data.id} updated → transaction info updated`);
        break;

      // 3️⃣ Transaction paid → first payment succeeded
      case EventName.TransactionPaid:
        console.log(`⚠️ ${finalDate}: Transaction ${eventData.data.id} paid → first payment succeeded`);
        break;

      // 4️⃣ Subscription created → subscription object created
      case EventName.SubscriptionCreated:
        console.log(`⚠️ ${finalDate}: Subscription ${eventData.data.id} created → subscription object created`);
        break;

      // 5️⃣ Subscription activated → subscription activated
      case EventName.SubscriptionActivated:
        console.log(`⚠️ ${finalDate}: Subscription ${eventData.data.id} activated → subscription activated`);
        break;

      // 6️⃣ Transaction updated → post-activation updates
      case EventName.TransactionUpdated: // same event type, but different context
        console.log(`⚠️ ${finalDate}: Transaction ${eventData.data.id} updated → post-activation updates`);
        break;

      // 7️⃣ Transaction completed → transaction finalized
      case EventName.TransactionCompleted:
        console.log(`⚠️ ${finalDate}: Transaction ${eventData.data.id} completed → transaction finalized`);
        console.log("📦 Paddle Webhook Received:", JSONData);
         if (email) {
          const userRef = doc(db, "Firebase-jigzexplorer-profiles", uid);
          await updateDoc(userRef, {
            subscription: {
              amount: Number(eventData.data?.items?.[0]?.price?.unitPrice?.amount) || 0,
              billingFrequency: eventData.data?.items?.[0]?.price?.billingCycle?.frequency || 1,
              billingInterval: eventData.data?.items?.[0]?.price?.billingCycle?.interval || "month",
              cancelAt: 0,
              currency: eventData.data?.currencyCode || "USD",
              isTrial: eventData.data?.items?.[0]?.price?.trialPeriod ? true : false,
              last4: eventData.data?.payments?.[0]?.methodDetails?.card?.last4 || "0000",
              lastPaymentAt: eventData.data?.payments?.[0]?.capturedAt || Date.now(),
              meta: {},
              nextBillAt: eventData.data?.billingPeriod?.endsAt || 0,
              paymentType: 0,
              planId: eventData.data?.subscriptionId ? "Active" : "Freemium",
              planName: eventData.data?.items?.[0]?.price?.name || "Active",
              status: "Active",
              subscriptionId: eventData.data?.subscriptionId || '',
              trialEndsAt: 0,
            },
          });

          console.log(`🔥 Firestore updated: ${email} -> subscription info saved`);
        }
        break;

        case EventName.SubscriptionCanceled: // same event type, but different context
        console.log(`⚠️ ${finalDate}: Transaction ${eventData.data.id} canceled `);
        if (email) {
          const userRef = doc(db, "Firebase-jigzexplorer-profiles", uid);
          // This means that when a user cancel a subscription,the card data for last4 is also lost.
          await updateDoc(userRef, {
            "subscription.amount": 0,
            "subscription.billingFrequency": 1,
            "subscription.billingInterval": eventData.data?.items?.[0]?.price?.billingCycle?.interval || "month",
            "subscription.cancelAt": Date.now(),
            "subscription.currency": eventData.data?.currencyCode || "USD",
            "subscription.isTrial": eventData.data?.items?.[0]?.price?.trialPeriod ? true : false,
            "subscription.last4":  "0000",
            "subscription.nextBillAt": 0,
            // "subscription.lastPaymentAt": Date.now(),
            "subscription.meta": {},
            "subscription.paymentType": 0,
            "subscription.planName": eventData.data?.items?.[0]?.price?.name || "Active",
            "subscription.status": "canceled",
            "subscription.trialEndsAt": 0
          });

          console.log(`🔥 Firestore updated: ${email} -> subscription info saved`);
        }
        break;

      // Default for unhandled events
      default:
        console.log(`ℹ️ ${finalDate}: Unhandled event type: ${eventData.eventType}`);

        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    // await logWebhookEvent({ eventType: "unknown" }, "error", err, signature, req);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
