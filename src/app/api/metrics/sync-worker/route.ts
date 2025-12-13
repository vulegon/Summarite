import { NextRequest, NextResponse } from "next/server";
import { syncGitHubEvents } from "@/services/sync";

// 内部APIなのでシークレットキーで保護
const INTERNAL_SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(request: NextRequest) {
  console.log("[sync-worker] Received request");

  try {
    const authHeader = request.headers.get("x-internal-secret");
    console.log("[sync-worker] Auth header present:", !!authHeader);

    if (authHeader !== INTERNAL_SECRET) {
      console.log("[sync-worker] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await request.json();
    console.log("[sync-worker] userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // 同期を実行
    console.log("[sync-worker] Starting syncGitHubEvents");
    await syncGitHubEvents(userId);
    console.log("[sync-worker] Completed syncGitHubEvents");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[sync-worker] Error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
