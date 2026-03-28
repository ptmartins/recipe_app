import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";
import Busboy from "busboy";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    const body = await req.arrayBuffer();
    const bodyBuffer = Buffer.from(body);
    const chunks: Buffer[] = [];

    const { url, publicId } = await new Promise<{ url: string; publicId: string }>(
      (resolve, reject) => {
        const busboy = Busboy({ headers: { "content-type": contentType } });

        busboy.on("file", (_fieldname, stream) => {
          stream.on("data", (chunk: Buffer) => chunks.push(chunk));
          stream.on("end", async () => {
            const buffer = Buffer.concat(chunks);
            try {
              const result = await uploadImage(buffer);
              resolve(result);
            } catch (e) {
              reject(e);
            }
          });
        });

        busboy.on("error", reject);
        busboy.write(bodyBuffer);
        busboy.end();
      }
    );

    return NextResponse.json({ url, publicId });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
