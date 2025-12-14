import { NextRequest, NextResponse } from "next/server";
import { syncJiraEvents } from "@/services/sync";
import { prisma } from "@/lib/prisma";

// 内部APIなのでシークレットキーで保護
const INTERNAL_SECRET = process.env.NEXTAUTH_SECRET;

export async function POST(request: NextRequest) {
  console.log("[jira-sync-worker] Received request");

  let userId: string | undefined;

  try {
    const authHeader = request.headers.get("x-internal-secret");
    console.log("[jira-sync-worker] Auth header present:", !!authHeader);

    if (authHeader !== INTERNAL_SECRET) {
      console.log("[jira-sync-worker] Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    userId = body.userId;
    const storyPointsFieldId = body.storyPointsFieldId;
    console.log("[jira-sync-worker] userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // 同期を実行
    console.log("[jira-sync-worker] Starting syncJiraEvents");
    await syncJiraEvents(userId, storyPointsFieldId);
    console.log("[jira-sync-worker] Completed syncJiraEvents");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[jira-sync-worker] Error:", error);

    // エラー時にステータスをfailedに更新
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { jiraSyncStatus: "failed" },
      }).catch((e) => console.error("[jira-sync-worker] Failed to update status:", e));
    }

    return NextResponse.json(
      { error: "Jira sync failed" },
      { status: 500 }
    );
  }
}
