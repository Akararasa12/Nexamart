import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  getAdminAccounts, 
  saveAdminAccount, 
  deleteAdminAccount, 
  addAdminLog 
} from "@/lib/dbHelper";

async function verifyAuth(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader === "Bearer nexa_admin_authenticated") {
    return true;
  }
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (session === "nexa_admin_authenticated") {
      return true;
    }
  } catch {
    // Ignore error
  }
  return false;
}

// GET all admin accounts
export async function GET(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await getAdminAccounts();
    // Exclude actual passwords for safety, or return encrypted/obfuscated ones.
    // Since it is a simulation/admin page, we can return masked passwords or actual for simple updates.
    // We will mask it or return actual so they can edit. Returning it is fine since it's for administrators.
    return NextResponse.json({ success: true, accounts });
  } catch (error: any) {
    console.error("GET Admin Accounts API error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to retrieve accounts" }, { status: 500 });
  }
}

// POST create or update admin account
export async function POST(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get session info for logging
    const cookieStore = await cookies();
    const currentUsername = cookieStore.get("admin_username")?.value || "system";
    const currentRole = cookieStore.get("admin_role")?.value || "System";

    const body = await request.json();
    const { id, username, role, password } = body as {
      id?: string;
      username: string;
      role: "Owner" | "Admin" | "Manager";
      password: string;
    };

    if (!username || !role || !password) {
      return NextResponse.json({ error: "Username, Role, and Password are required" }, { status: 400 });
    }

    const accountId = id || Math.random().toString(36).substr(2, 9);
    const saved = await saveAdminAccount({
      id: accountId,
      username: username.toLowerCase().trim(),
      role,
      password
    });

    await addAdminLog(
      currentUsername,
      currentRole,
      id ? `Memperbarui akun admin: ${username} (${role})` : `Mendaftarkan akun admin baru: ${username} (${role})`
    );

    return NextResponse.json({ success: true, account: saved });
  } catch (error: any) {
    console.error("POST Admin Account API error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to save account" }, { status: 500 });
  }
}

// DELETE an admin account
export async function DELETE(request: Request) {
  try {
    const isAuthorized = await verifyAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const currentUsername = cookieStore.get("admin_username")?.value || "system";
    const currentRole = cookieStore.get("admin_role")?.value || "System";

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const username = searchParams.get("username") || "unknown";

    if (!id) {
      return NextResponse.json({ error: "Account ID is required" }, { status: 400 });
    }

    if (id === "1") {
      return NextResponse.json({ error: "Akun owner utama tidak dapat dihapus" }, { status: 400 });
    }

    await deleteAdminAccount(id);

    await addAdminLog(
      currentUsername,
      currentRole,
      `Menghapus akun admin: ${username}`
    );

    return NextResponse.json({ success: true, message: `Account deleted successfully` });
  } catch (error: any) {
    console.error("DELETE Admin Account API error:", error.message);
    return NextResponse.json({ error: error.message || "Failed to delete account" }, { status: 500 });
  }
}
