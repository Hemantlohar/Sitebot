import { NextResponse } from "next/server";
import { devOnlyGuard } from "../../../lib/devOnlyRoute";
import { supabase } from "../../../lib/supabase";

export async function GET() {
  const blocked = devOnlyGuard();
  if (blocked) return blocked;

  const { data, error } = await supabase
    .from("websites")
    .select("*");

  return NextResponse.json({
    data,
    error,
  });
}