import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Correct path to your folder
    const imagesDir = path.join(process.cwd(), "public/pics/paris");

    // read all files in the folder
    const files = fs.readdirSync(imagesDir);

    // keep only .jpg and .webp files
    const validFiles = files.filter(file => {
      const lower = file.toLowerCase();
      return lower.endsWith(".jpg") || lower.endsWith(".webp");
    });

    // return them with the correct public path
    const imagePaths = validFiles.map(file => `/pics/paris/${file}`);

    return NextResponse.json(imagePaths);
  } catch (err) {
    console.error("Error reading images:", err);
    return NextResponse.json({ error: "Failed to load images" }, { status: 500 });
  }
}
