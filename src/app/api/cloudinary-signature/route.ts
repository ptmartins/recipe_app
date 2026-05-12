import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    const secret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;

    if (!secret || !cloudName || !apiKey) {
      return NextResponse.json(
        { error: `Missing env vars: ${[!secret && "CLOUDINARY_API_SECRET", !cloudName && "CLOUDINARY_CLOUD_NAME", !apiKey && "CLOUDINARY_API_KEY"].filter(Boolean).join(", ")}` },
        { status: 500 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = "super-chef/recipes";

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder, transformation: "c_fill,w_1200,h_800,g_auto/f_auto,q_auto" },
      secret
    );

    return NextResponse.json({ signature, timestamp, folder, cloudName, apiKey });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
