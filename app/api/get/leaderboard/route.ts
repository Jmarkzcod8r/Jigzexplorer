import dbConnect from "../../mongodb/connection/dbConnection";
import Profile from "../../mongodb/schemas/profile";
import Score from "../../mongodb/schemas/score";
import { NextRequest, NextResponse } from "next/server";
import { getProfileFromCache } from "@/app/lib/getUser";


export async function POST(req: NextRequest) {

    if (req){
        const user = await getProfileFromCache()
        console.log('user from leaderboard:', user)
        console.log('leaderbopard backend')

    }


}