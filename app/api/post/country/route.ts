import { NextResponse } from "next/server";
import dbConnect from "../../mongodb/connection/dbConnection";
import Score from "../../mongodb/schemas/score";


export async function POST(req: Request) {
    try {
      await dbConnect();
      const body = await req.json();

      const { email, country, score, datePlayed } = body;

      if (!email || !country) {
        return NextResponse.json(
          { success: false, message: "Email and country are required" },
          { status: 400 }
        );
      }

      // ✅ Build update object for the specific country
      const updateField: Record<string, any> = {
        [`countries.${country}`]: {
          unlock: true, // or based on your own game logic
          score: score ?? 0,
          datePlayed: datePlayed ? new Date(datePlayed) : new Date(),
        },
      };

      // ✅ Upsert: update if exists, otherwise create new document
      const updatedScore = await Score.findOneAndUpdate(
        { email },
        {
          $set: updateField,
          $setOnInsert: { email } // ensure email is saved if new document
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({ success: true, data: updatedScore }, { status: 200 });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }
