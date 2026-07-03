import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createPresignedUploadUrl, buildObjectKey } from "@/utils/r2/client";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 15;

interface PresignRequest {
  contentType: string;
  fileSizeBytes?: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body: PresignRequest = await request.json();
    const { contentType, fileSizeBytes } = body;

    if (!contentType || !ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: `Unsupported file type. Allowed: ${ALLOWED_CONTENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (fileSizeBytes && fileSizeBytes > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large. Max size is ${MAX_FILE_SIZE_MB}MB.` },
        { status: 400 }
      );
    }

    const extension = contentType.split("/")[1] === "jpeg" ? "jpg" : contentType.split("/")[1];
    const key = buildObjectKey("uploads", user?.id ?? null, extension);

    const { uploadUrl, publicUrl } = await createPresignedUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (error) {
    console.error("Failed to create presigned upload URL:", error);
    return NextResponse.json(
      {
        error: "Failed to prepare upload. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
