import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: { country: string } }
) {
  try {
    const { country } = params;

    // Path to the specific country's folder
    const imagesDir = path.join(process.cwd(), "public", "Europe-Pics", country);

    // Check if the folder exists
    if (!fs.existsSync(imagesDir)) {
      return NextResponse.json(
        { error: `No images found for country: ${country}` },
        { status: 404 }
      );
    }

    // Read all files in the folder
    const files = fs.readdirSync(imagesDir);

    // Keep only .jpg and .webp files
    const validFiles = files.filter((file) => {
      const lower = file.toLowerCase();
      return lower.endsWith(".jpg") || lower.endsWith(".webp");
    });

    // Return them with correct public paths
    const imagePaths = validFiles.map(
      (file) => `/Europe-Pics/${country}/${file}`
    );

    return NextResponse.json(imagePaths);
  } catch (err) {
    console.error("Error reading images:", err);
    return NextResponse.json(
      { error: "Failed to load images" },
      { status: 500 }
    );
  }
}
