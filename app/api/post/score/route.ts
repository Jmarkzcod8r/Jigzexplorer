import { NextResponse } from "next/server";
import dbConnect from "../../mongodb/connection/dbConnection";
import Score from "../../mongodb/schemas/score";

export async function GET() {
    try {
      await dbConnect();
      const scores = await Score.find();
      return NextResponse.json(scores, { status: 200 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  // ✅ POST new score OR update existing user's countries
 // ✅ POST new score OR update existing user's countries
 export async function POST(req: Request) {
    try {
      await dbConnect();
      const body = await req.json();

      const { email, tickets, overallScore, countries } = body;

      if (!email || !countries || typeof countries !== "object") {
        return NextResponse.json(
          { success: false, message: "Email and valid countries object are required" },
          { status: 400 }
        );
      }

      // ✅ Build update object
      const updateField: Record<string, any> = {
        tickets,
        overallScore,
      };

      // Each country gets updated separately (merge instead of overwrite)
      Object.entries(countries as Record<string, any>).forEach(([countryName, details]) => {
        updateField[`countries.${countryName}`] = {
          unlock: details.unlock ?? false,
          score: details.score ?? 0,
          datePlayed: details.datePlayed ?? null,
        };
      });

      // ✅ This will merge countries instead of overwriting
      const updatedScore = await Score.findOneAndUpdate(
        { email },
        { $set: updateField },
        { upsert: true, new: true }
      );

      return NextResponse.json({ success: true, data: updatedScore }, { status: 200 });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }