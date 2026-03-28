import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

// Returns a signed upload signature so the browser can upload directly to Cloudinary
// This bypasses Vercel's 4.5MB body size limit on serverless functions
export async function GET() {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "savori/recipes";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, transformation: "c_fill,w_1200,h_800,g_auto/f_auto,q_auto" },
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  });
}
