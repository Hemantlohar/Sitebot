import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
]);

/**
 * Validates the file header magic bytes to prevent MIME spoofing.
 */
function isValidImageSignature(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  // JPEG: FF D8 FF
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // WebP: RIFF .... WEBP
  if (mimeType === "image/webp") {
    const isRiff =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;
    const isWebp =
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  return false;
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file");
    const websiteId = formData.get("websiteId");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid image file uploaded.",
        },
        { status: 400 }
      );
    }

    // 3. Optional Bot Ownership verification if websiteId is provided
    if (typeof websiteId === "string" && websiteId.trim()) {
      const { data: website, error: websiteError } = await supabaseAdmin
        .from("websites")
        .select("id")
        .eq("id", websiteId.trim())
        .eq("user_id", user.id)
        .maybeSingle();

      if (websiteError || !website) {
        return NextResponse.json(
          {
            success: false,
            error: "Bot not found or access denied.",
          },
          { status: 403 }
        );
      }
    }

    // 4. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds 2 MB limit.",
        },
        { status: 400 }
      );
    }

    // 5. Validate MIME type strictly (reject SVG, HTML, etc.)
    const mimeType = file.type.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only PNG, JPEG, and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    // 6. Validate magic bytes (file signature)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!isValidImageSignature(buffer, mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: "Corrupted or spoofed image content detected.",
        },
        { status: 400 }
      );
    }

    // 7. Generate a secure, unguessable path namespaced by user ID
    const extension =
      mimeType === "image/png"
        ? "png"
        : mimeType === "image/webp"
        ? "webp"
        : "jpg";

    const safeFileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    // 8. Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from("logos")
      .upload(safeFileName, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("LOGO STORAGE UPLOAD ERROR:", uploadError);
      return NextResponse.json(
        {
          success: false,
          error: `Upload failed: ${uploadError.message}`,
        },
        { status: 500 }
      );
    }

    // 9. Retrieve public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("logos")
      .getPublicUrl(safeFileName);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    });
  } catch (err: any) {
    console.error("UPLOAD LOGO UNCAUGHT ERROR:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "An unexpected error occurred during upload.",
      },
      { status: 500 }
    );
  }
}