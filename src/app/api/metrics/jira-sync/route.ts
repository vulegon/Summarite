import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        jiraSyncStatus: true,
        accounts: {
          where: { provider: "jira" },
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Jira連携していない場合
    if (user.accounts.length === 0) {
      return NextResponse.json(
        { error: "Jira not connected" },
        { status: 400 }
      );
    }

    // 既に同期中の場合
    if (user.jiraSyncStatus === "syncing") {
      return NextResponse.json(
        { status: "syncing", message: "Sync already in progress" },
        { status: 200 }
      );
    }

    // 同期開始を記録
    await prisma.user.update({
      where: { id: user.id },
      data: { jiraSyncStatus: "syncing" },
    });

    // バックグラウンドで同期を開始（awaitしない）
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    fetch(`${baseUrl}/api/metrics/jira-sync-worker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": process.env.NEXTAUTH_SECRET || "",
      },
      body: JSON.stringify({ userId: user.id }),
    }).catch((error) => {
      console.error("Failed to trigger Jira sync worker:", error);
    });

    return NextResponse.json({
      status: "syncing",
      message: "Jira sync started",
    });
  } catch (error) {
    console.error("Jira Sync API error:", error);
    return NextResponse.json(
      { error: "Failed to start Jira sync" },
      { status: 500 }
    );
  }
}
