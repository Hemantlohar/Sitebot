import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(
  req: Request
) {
  try {
    // ==========================================
    // 1. AUTHENTICATE USER
    // ==========================================

    const supabase =
      await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // 2. READ REQUEST
    // ==========================================

    const body =
      await req.json();

    const websiteId =
      typeof body.websiteId === "string"
        ? body.websiteId.trim()
        : "";

    const fileName =
      typeof body.fileName === "string"
        ? body.fileName.trim()
        : "";

    if (
      !websiteId ||
      !fileName
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Website ID and file name are required.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 3. PROTECT WEBSITE CRAWL
    // ==========================================

    if (
      fileName === "__website__"
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "The original website crawl cannot be deleted.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // 4. VERIFY BOT OWNERSHIP
    // ==========================================

    const { data: website, error: websiteError } =
      await supabaseAdmin
        .from("websites")
        .select("id")
        .eq("id", websiteId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (websiteError) {
      console.error(
        "KNOWLEDGE DELETE OWNERSHIP ERROR:",
        websiteError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to verify bot ownership.",
        },
        {
          status: 500,
        }
      );
    }

    if (!website) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Bot not found or access denied.",
        },
        {
          status: 404,
        }
      );
    }

    // ==========================================
    // 5. DELETE DOCUMENT CHUNKS
    // ==========================================

    const { error } =
      await supabaseAdmin
        .from("website_chunks")
        .delete()
        .eq(
          "website_id",
          websiteId
        )
        .eq(
          "file_name",
          fileName
        );

    if (error) {
      console.error(
        "KNOWLEDGE DELETE ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // 6. RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,

      message:
        `${fileName} deleted successfully.`,
    });
  } catch (error: any) {
    console.error(
      "KNOWLEDGE DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Delete failed.",
      },
      {
        status: 500,
      }
    );
  }
}




















// import { NextResponse } from "next/server";
// import { supabase } from "../../../../lib/supabase";

// export async function DELETE(req: Request) {
//   try {
//     const body = await req.json();

//     const { websiteId, fileName } = body;

//     if (!websiteId || !fileName) {
//       return NextResponse.json({
//         success: false,
//         error: "Missing data",
//       });
//     }

//     // Protect website crawl
//     if (fileName === "__website__") {
//       return NextResponse.json({
//         success: false,
//         error: "Website crawl cannot be deleted.",
//       });
//     }

//     const { error } = await supabase
//       .from("website_chunks")
//       .delete()
//       .eq("website_id", websiteId)
//       .eq("file_name", fileName);

//     if (error) {
//       return NextResponse.json({
//         success: false,
//         error: error.message,
//       });
//     }

//     return NextResponse.json({
//       success: true,
//     });

//   } catch (err) {
//     console.error(err);

//     return NextResponse.json({
//       success: false,
//       error: "Delete failed",
//     });
//   }
// }