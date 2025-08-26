import fs from "fs";
import path from "path";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const imagesDir = path.join(process.cwd(), "public/images");

    if (!fs.existsSync(imagesDir)) {
      return res.status(404).json({ error: "Images folder not found" });
    }

    const files = fs.readdirSync(imagesDir);
    const images = files.map((file) => `/images/${file}`);

    res.status(200).json(images);
  } catch (error: any) {
    console.error("Error reading images:", error);
    res.status(500).json({ error: "Failed to load images" });
  }
}
