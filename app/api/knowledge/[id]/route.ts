import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  req: Request,
  { params }: Props
) {
  try {
    // ==========================================
    // 1. GET WEBSITE ID
    // ==========================================

    const { id } =
      await params;

    // ==========================================
    // 2. AUTHENTICATE USER
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
    // 3. VERIFY BOT OWNERSHIP
    // ==========================================

    const { data: website, error: websiteError } =
      await supabaseAdmin
        .from("websites")
        .select("id")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (websiteError) {
      console.error(
        "KNOWLEDGE OWNERSHIP ERROR:",
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
    // 4. LOAD KNOWLEDGE CHUNKS
    // ==========================================

    const { data, error } =
      await supabaseAdmin
        .from("website_chunks")
        .select(
          "file_name, uploaded_at, chunk_index"
        )
        .eq("website_id", id)
        .order("uploaded_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "LOAD KNOWLEDGE ERROR:",
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
    // 5. GROUP CHUNKS BY FILE
    // ==========================================

    const grouped: Record<
      string,
      {
        fileName: string;
        uploadedAt: string;
        chunks: number;
      }
    > = {};

    for (const row of data || []) {
      const fileName =
        row.file_name || "Unknown";

      if (!grouped[fileName]) {
        grouped[fileName] = {
          fileName,

          uploadedAt:
            row.uploaded_at,

          chunks: 0,
        };
      }

      grouped[fileName].chunks++;
    }

    // ==========================================
    // 6. SORT FILES
    // ==========================================

    const files =
      Object.values(grouped).sort(
        (a, b) => {
          if (
            a.fileName === "__website__"
          ) {
            return -1;
          }

          if (
            b.fileName === "__website__"
          ) {
            return 1;
          }

          return (
            new Date(
              b.uploadedAt
            ).getTime() -
            new Date(
              a.uploadedAt
            ).getTime()
          );
        }
      );

    // ==========================================
    // 7. RESPONSE
    // ==========================================

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error: any) {
    console.error(
      "KNOWLEDGE LIST ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ||
          "Failed to load knowledge files.",
      },
      {
        status: 500,
      }
    );
  }
}










// import { NextResponse } from "next/server";
// import { supabase } from "../../../../lib/supabase";

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;

//   const { data, error } = await supabase
//     .from("website_chunks")
//     .select("file_name, uploaded_at")
//     .eq("website_id", id);

//   if (error) {
//     return NextResponse.json({
//       success: false,
//       error: error.message,
//     });
//   }

//   const grouped: Record<
//     string,
//     {
//       fileName: string;
//       uploadedAt: string;
//       chunks: number;
//     }
//   > = {};

//   data.forEach((row: any) => {
//     if (!grouped[row.file_name]) {
//       grouped[row.file_name] = {
//         fileName: row.file_name,
//         uploadedAt: row.uploaded_at,
//         chunks: 0,
//       };
//     }

//     grouped[row.file_name].chunks++;
//   });

//   return NextResponse.json({
//     success: true,
//     files: Object.values(grouped),
//   });
// }