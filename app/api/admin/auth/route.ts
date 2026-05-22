import { NextResponse } from "next/server";
import { getAdminAccounts, addAdminLog } from "@/lib/dbHelper";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const cleanUsername = (username || "").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "nexa-admin-2026";

    // Retrieve accounts
    const accounts = await getAdminAccounts();
    let matchedAccount = null;

    if (accounts.length === 0 || !accounts.some(acc => acc.role === "Owner")) {
      // If db accounts are empty, allow fallback owner login
      if (cleanUsername === "owner" && password === adminPassword) {
        matchedAccount = {
          username: "owner",
          role: "Owner" as const,
        };
      }
    } else {
      // Match from database accounts
      const found = accounts.find(acc => acc.username.toLowerCase() === cleanUsername);
      if (found && found.password === password) {
        matchedAccount = found;
      }
    }

    if (matchedAccount) {
      const response = NextResponse.json({ 
        success: true, 
        token: "nexa_admin_authenticated",
        username: matchedAccount.username,
        role: matchedAccount.role
      });
      
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      };

      // Set session cookies
      response.cookies.set("admin_session", "nexa_admin_authenticated", cookieOptions);
      response.cookies.set("admin_username", matchedAccount.username, cookieOptions);
      response.cookies.set("admin_role", matchedAccount.role, cookieOptions);
      
      // Log this login activity
      await addAdminLog(matchedAccount.username, matchedAccount.role, "Berhasil masuk (login) ke dashboard admin.");

      return response;
    }

    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Auth API error:", err.message);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

