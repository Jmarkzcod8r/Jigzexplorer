import dbConnect from "../../mongodb/connection/dbConnection";
import Score from "../../mongodb/schemas/score";
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

// Route Segment Config for caching
export const dynamic = "force-dynamic";
export const revalidate = 300;
export const fetchCache = "force-cache";

// 🔹 Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email, accessToken } = await req.json();

    console.log("📡 Activating api/get/leaderboard");
    console.log("📧 Email from frontend:", email);
    console.log("🔑 Firebase ID Token received:", accessToken?.substring(0, 15) + "...");

    // 🔹 Verify Firebase ID Token
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    console.log("✅ Decoded Firebase Token:", decodedToken);

    // 🔹 Ensure email matches
    if (decodedToken.email !== email) {
      return NextResponse.json(
        { success: false, error: "Email mismatch. Unauthorized request." },
        { status: 401 }
      );
    }

    // 🔹 Fetch leaderboard
    const scores = await Score.find({})
      .populate("user", "email name")
      .sort({ points: -1 })
      .limit(10);

    return NextResponse.json(
      {
        success: true,
        user: decodedToken, // includes email, uid, etc.
        leaderboard: scores,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error verifying Firebase token or fetching leaderboard:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
