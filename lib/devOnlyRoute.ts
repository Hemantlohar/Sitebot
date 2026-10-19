import { NextResponse } from "next/server";

/**
 * Blocks access to development-only API routes in production.
 * Returns a 404 response when NODE_ENV is "production", otherwise null.
 */
export function devOnlyGuard(): NextResponse | null {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  return null;
}
