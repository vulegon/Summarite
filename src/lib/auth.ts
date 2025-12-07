import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          await prisma.account.upsert({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              },
            },
            update: {
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at,
              tokenType: account.token_type,
              scope: account.scope,
            },
            create: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              accessToken: account.access_token,
              refreshToken: account.refresh_token,
              expiresAt: account.expires_at,
              tokenType: account.token_type,
              scope: account.scope,
            },
          });
        } else {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  accessToken: account.access_token,
                  refreshToken: account.refresh_token,
                  expiresAt: account.expires_at,
                  tokenType: account.token_type,
                  scope: account.scope,
                },
              },
            },
          });
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: { accounts: true },
        });

        if (user) {
          session.user.id = user.id;
          session.user.hasGithub = user.accounts.some(
            (a: { provider: string }) => a.provider === "github"
          );
          session.user.hasJira = user.accounts.some(
            (a: { provider: string }) => a.provider === "jira"
          );
        }
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // ログイン後はダッシュボードにリダイレクト
      if (url.startsWith(baseUrl)) {
        // callbackUrlが/auth/signinや/の場合はダッシュボードへ
        if (url === baseUrl || url === `${baseUrl}/` || url.includes("/auth/signin")) {
          return `${baseUrl}/dashboard`;
        }
        return url;
      }
      // 相対URLの場合
      if (url.startsWith("/")) {
        if (url === "/" || url.includes("/auth/signin")) {
          return `${baseUrl}/dashboard`;
        }
        return `${baseUrl}${url}`;
      }
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
};
