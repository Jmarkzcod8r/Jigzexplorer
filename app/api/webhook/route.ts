// import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
// import { NextResponse } from "next/server";
// import dbConnect from "../mongodb/connection/dbConnection";


// const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
//     environment: Environment.sandbox
// });

// export async function POST (req:Request ) {

//     await dbConnect()
//     const signature = (req.headers.get('paddle-signature') as string) || '';
//   // req.body should be of type `buffer`, convert to string before passing it to `unmarshal`.
//   // If express returned a JSON, remove any other middleware that might have processed raw request to object
//   const rawRequestBody = (await req.text() ) || '' ;
//   // Replace `WEBHOOK_SECRET_KEY` with the secret key in notifications from vendor dashboard
//   const secretKey = process.env.WEBHOOK_SECRET_KEY || '';

//   try {
//     if (signature && rawRequestBody) {
//       // The `unmarshal` function will validate the integrity of the webhook and return an entity
//       const eventData = await paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature);

//       // database operation and provision the user with stuff purchased
//       switch (eventData.eventType) {
//         case EventName.SubscriptionActivated:
//           console.log(`Product ${eventData.data.id} was activated`);
//           break;
//         case EventName.SubscriptionCanceled:
//           console.log(`Subscription ${eventData.data.id} was canceled`);
//           break;
//         case EventName.TransactionPaid:
//           console.log(`Transaction ${eventData.data.id} was paid`);
//            break;
//         default:
//           console.log(eventData.eventType);
//       }
//     } else {
//       console.log('Signature missing in header');
//     }
//   } catch (e) {
//     // Handle signature mismatch or other runtime errors
//     console.log(e);
//   }
//   // Return a response to acknowledge
//   return NextResponse.json({ok: true});

// }

// app/api/webhooks/paddle/route.ts
import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk";
import { NextResponse } from "next/server";
import dbConnect from "../mongodb/connection/dbConnection";
import WebhookLog from "../mongodb/schemas/webhooklog";

const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
  environment: Environment.production
});

async function logWebhookEvent(
  eventData: any,
  status: string,
  error: any = null,
  signature?: string,
  req?: Request
) {
  try {
    const logEntry = new WebhookLog({
      eventType: eventData?.eventType || 'unknown',
      dataId: eventData?.data?.id || 'unknown',
      status: status,
      eventData: eventData,
      signature: signature,
      ipAddress: req?.headers?.get('x-forwarded-for') || 'unknown',
      userAgent: req?.headers?.get('user-agent') || 'unknown',
      errorMessage: error?.message,
      errorStack: error?.stack,
      processedAt: new Date()
    });

    await logEntry.save();
    console.log(`Webhook logged: ${eventData?.eventType || 'unknown'} - ${status}`);
  } catch (error) {
    console.error('Failed to log webhook:', error);
  }
}

export async function POST(req: Request) {
  await dbConnect();

  const signature = (req.headers.get('paddle-signature') as string) || '';
  const rawRequestBody = (await req.text()) || '';
  const secretKey = process.env.WEBHOOK_SECRET_KEY || '';

  try {
    if (signature && rawRequestBody) {
      const eventData = await paddle.webhooks.unmarshal(rawRequestBody, secretKey, signature);

      // Log successful verification
      await logWebhookEvent(eventData, 'processing', null, signature, req);

      // Handle different event types
      switch (eventData.eventType) {
        case EventName.SubscriptionActivated:
          console.log(`Product ${eventData.data.id} was activated`);
          await logWebhookEvent(eventData, 'success', null, signature, req);
          // Add your subscription activation logic here
          break;

        case EventName.SubscriptionCanceled:
          console.log(`Subscription ${eventData.data.id} was canceled`);
          await logWebhookEvent(eventData, 'success', null, signature, req);
          // Add your subscription cancellation logic here
          break;

        case EventName.TransactionPaid:
          console.log(`Transaction ${eventData.data.id} was paid`);
          await logWebhookEvent(eventData, 'success', null, signature, req);
          // Add your transaction logic here
          break;

        default:
          console.log(`Unhandled event: ${eventData.eventType}`);
          await logWebhookEvent(eventData, 'success', null, signature, req);
      }
    } else {
      console.log('Signature missing in header');
      await logWebhookEvent(
        { eventType: 'unknown', data: { id: 'unknown' } },
        'missing_data',
        null,
        signature,
        req
      );
    }
  } catch (e) {
    console.log('Webhook processing error:', e);
    await logWebhookEvent(
      { eventType: 'unknown', data: { id: 'unknown' } },
      'error',
      e,
      signature,
      req
    );
  }

  return NextResponse.json({ ok: true });
}