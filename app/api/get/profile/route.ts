import dbConnect from "../../mongodb/connection/dbConnection";
import Profile from "../../mongodb/schemas/profile";
import Score from "../../mongodb/schemas/score";
import { NextRequest, NextResponse } from "next/server";

// Route Segment Config for caching
export const dynamic = 'force-dynamic'; // or 'auto' for default behavior
export const revalidate = 300; // Revalidate every 5 minutes (300 seconds)
export const fetchCache = 'force-cache'; // Always cache unless explicitly opted out

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email } = await req.json();

    console.log("📡 Activating api/get/profile");
    console.log("📧 This is email:", email);

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const [profile, score] = await Promise.all([
      Profile.findOne({ email }),
      Score.findOne({ email: email })
    ]);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: profile, score: score },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        }
      }
    );
  } catch (error) {
    console.error("❌ Error fetching profile:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch profile",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}