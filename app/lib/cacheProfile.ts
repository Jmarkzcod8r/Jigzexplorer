import dbConnect from "../api/mongodb/connection/dbConnection";
import Profile from "../api/mongodb/schemas/profile";
import { NextResponse } from "next/server";
import { setProfileInCache , getProfileFromCache} from "@/app/lib/getUser";
export async function GET(req: Request) {
  await dbConnect();

    const body = await req.json();

//   const { email, tickets, overallScore, countries } = body;

}