import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../mongodb/connection/dbConnection";
import Profile from "../mongodb/schemas/profile";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // ✅ ensure DB is connected before queries

  const { method } = req;

  switch (method) {
    case "POST":
      try {
        const { _id, name, email, date } = req.body;

        const profile = new Profile({ _id, name, email, date });
        await profile.save(); // ✅ save document

        const statusMessage = _id
          ? "Your feedback has been accounted for. Thank you."
          : "Uh-oh. Something seems to be wrong. Try again later.";

        res.status(200).json({ success: true, message: statusMessage, data: profile });
      } catch (error) {
        console.error("❌ Error saving profile:", error);
        res.status(500).json({ success: false, error: "Failed to save profile" });
      }
      break;

    default:
      res.setHeader("Allow", ["POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}
