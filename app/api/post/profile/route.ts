import dbConnect from "../../mongodb/connection/dbConnection";
import Profile from "../../mongodb/schemas/profile";

export async function POST(req: Request) {
  await dbConnect(); // ✅ ensure DB is connected

  try {
    const {  name, email } = await req.json();

    const profile = new Profile({
    //   _id,
      name,
      email,
      date: new Date().toISOString(), // ✅ auto-generate date
    });

    await profile.save();

    const statusMessage = email
      ? "Your feedback has been accounted for. Thank you."
      : "Uh-oh. Something seems to be wrong. Try again later.";

    return new Response(
      JSON.stringify({
        success: true,
        message: statusMessage,
        data: profile,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error saving profile:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to save profile" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET() {
  await dbConnect();

  try {
    const profiles = await Profile.find({});
    return new Response(JSON.stringify(profiles), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching profiles:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to fetch profiles" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
