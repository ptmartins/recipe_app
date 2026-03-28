import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  const results: Record<string, string> = {};

  // Check env vars
  results.MONGODB_URI = process.env.MONGODB_URI ? "set" : "MISSING";
  results.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ? "set" : "MISSING";
  results.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ? "set" : "MISSING";
  results.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ? "set" : "MISSING";

  // Test MongoDB connection
  try {
    await connectDB();
    results.mongodb = "connected";
  } catch (err) {
    results.mongodb = `FAILED: ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json(results);
}
