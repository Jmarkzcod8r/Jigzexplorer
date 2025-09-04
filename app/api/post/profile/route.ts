// import dbConnect from "../../mongodb/connection/dbConnection";
// import Profile from "../../mongodb/schemas/profile";

// // ✅ Get profile with caching logic
// export async function GET(req: Request) {
//   await dbConnect();

//   try {
//     const url = new URL(req.url);
//     const email = url.searchParams.get("email");
//     const lastUpdate = url.searchParams.get("last_update"); // from frontend localStorage

//     if (!email) {
//       return new Response(
//         JSON.stringify({ success: false, error: "Email is required" }),
//         { status: 400, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // Always fetch updatedAt only for comparison
//     const profile = await Profile.findOne({ email }).select("updatedAt");

//     if (!profile) {
//       return new Response(
//         JSON.stringify({ success: false, error: "Profile not found" }),
//         { status: 404, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // If frontend has same updatedAt, tell it no need to refresh
//     if (
//       lastUpdate &&
//       new Date(lastUpdate).getTime() ===
//         new Date(profile.updatedAt).getTime()
//     ) {
//       return new Response(
//         JSON.stringify({ success: true, upToDate: true }),
//         { status: 200, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // Otherwise fetch full profile
//     const fullProfile = await Profile.findOne({ email });

//     return new Response(
//       JSON.stringify({
//         success: true,
//         upToDate: false,
//         data: fullProfile,
//       }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (error) {
//     console.error("❌ Error fetching profile:", error);
//     return new Response(
//       JSON.stringify({ success: false, error: "Failed to fetch profile" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }

// // ✅ Create or update profile
// export async function POST(req: Request) {
//   await dbConnect();

//   try {
//     const body = await req.json();
//     console.log('request body:',body)
//     const { name, email, date } = body;

//     if (!email) {
//       return new Response(
//         JSON.stringify({ success: false, error: "Email is required" }),
//         { status: 400, headers: { "Content-Type": "application/json" } }
//       );
//     }

//     // Upsert profile (create if not exist, update if exist)
//     const profile = await Profile.findOneAndUpdate(
//       { email },
//       {
//         $set: {
//           name,
//           email,
//           updatedAt: date || new Date(),
//         },
//       },
//       { upsert: true, new: true } // new = return updated doc
//     );

//     return new Response(
//       JSON.stringify({ success: true, data: profile }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (error) {
//     console.error("❌ Error saving profile:", error);
//     return new Response(
//       JSON.stringify({ success: false, error: "Failed to save profile" }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }

import dbConnect from "../../mongodb/connection/dbConnection";
import Profile from "../../mongodb/schemas/profile";
import { NextResponse } from "next/server";
import { setProfileInCache , getProfileFromCache} from "@/app/lib/getUser";
export async function GET(req: Request) {
  await dbConnect();

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const lastUpdate = url.searchParams.get("last_update");

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // 🔍 Check shared cache first
    const cachedProfile = getProfileFromCache();
    if (cachedProfile) {
      if (
        lastUpdate &&
        new Date(lastUpdate).getTime() === new Date(cachedProfile.updatedAt).getTime()
      ) {
        return NextResponse.json({ success: true, upToDate: true });
      }
      return NextResponse.json({
        success: true,
        upToDate: false,
        data: cachedProfile,
        source: "cache",
      });
    }

    // 🔍 If not in cache → fetch from MongoDB
    const profile = await Profile.findOne({ email });
    if (!profile) {
      return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
    }

    // ✅ Save to shared cache
    setProfileInCache(email, profile.toObject());

    return NextResponse.json({
      success: true,
      upToDate: false,
      data: profile,
      source: "db",
    });
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    console.log("request body:", body);
    const { name, email, date } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    // ⬆️ Update DB
    const profile = await Profile.findOneAndUpdate(
      { email },
      {
        $set: {
          name,
          email,
          updatedAt: date || new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // ✅ Update shared cache
    setProfileInCache(email, profile.toObject());

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("❌ Error saving profile:", error);
    return NextResponse.json({ success: false, error: "Failed to save profile" }, { status: 500 });
  }
}