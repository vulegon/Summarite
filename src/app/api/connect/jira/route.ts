import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const JIRA_AUTH_URL = "https://auth.atlassian.com/authorize";
const JIRA_TOKEN_URL = "https://auth.atlassian.com/oauth/token";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");

  if (!code) {
    const authUrl = new URL(JIRA_AUTH_URL);
    authUrl.searchParams.set("audience", "api.atlassian.com");
    authUrl.searchParams.set("client_id", process.env.JIRA_CLIENT_ID!);
    authUrl.searchParams.set("scope", "read:jira-work read:jira-user offline_access");
    authUrl.searchParams.set("redirect_uri", `${process.env.NEXTAUTH_URL}/api/connect/jira`);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("prompt", "consent");

    return NextResponse.redirect(authUrl.toString());
  }

  try {
    const tokenResponse = await fetch(JIRA_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/connect/jira`,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error("Jira token error:", error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=jira_auth_failed`
      );
    }

    const tokens = await tokenResponse.json();

    const resourcesResponse = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const resources = await resourcesResponse.json();
    const cloudId = resources[0]?.id;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard?error=user_not_found`
      );
    }

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "jira",
          providerAccountId: cloudId || "jira-account",
        },
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
        tokenType: tokens.token_type,
        scope: tokens.scope,
      },
      create: {
        userId: user.id,
        type: "oauth",
        provider: "jira",
        providerAccountId: cloudId || "jira-account",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
        tokenType: tokens.token_type,
        scope: tokens.scope,
      },
    });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?connected=jira`
    );
  } catch (error) {
    console.error("Jira OAuth error:", error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/dashboard?error=jira_connection_failed`
    );
  }
}
