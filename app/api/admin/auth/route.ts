import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD || "nexa-admin-2026";

    if (password === adminPassword) {
      const response = NextResponse.json({ success: true, token: "nexa_admin_authenticated" });
      
      // Set secure HttpOnly cookie
      response.cookies.set("admin_session", "nexa_admin_authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      
      return response;
    }

    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Auth API error:", err.message);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
