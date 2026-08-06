import { Pool } from "pg";
import { betterAuth } from "better-auth";

// In dev, Next.js hot-reloads this module on every save, which would
// otherwise create a brand-new `Pool` (and new DB connections) each time
// without closing the previous one, eventually exhausting the Supabase
// pooler's connection limit. Cache the pool on `globalThis` so Fast Refresh
// reuses the same instance.
const globalForAuthPool = globalThis as unknown as {
  authPgPool?: Pool;
};

const authPgPool =
  globalForAuthPool.authPgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForAuthPool.authPgPool = authPgPool;
}

export const auth = betterAuth({
  database: authPgPool,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    fields: {
      emailVerified: "email_verified",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        // Never settable by the client (sign-up/update-profile payloads) —
        // only changed server-side (DB migration bootstrap / admin tooling).
        input: false,
      },
    },
  },
  session: {
    fields: {
      userId: "user_id",
      expiresAt: "expires_at",
      ipAddress: "ip_address",
      userAgent: "user_agent",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  account: {
    fields: {
      userId: "user_id",
      accountId: "account_id",
      providerId: "provider_id",
      accessToken: "access_token",
      refreshToken: "refresh_token",
      idToken: "id_token",
      accessTokenExpiresAt: "access_token_expires_at",
      refreshTokenExpiresAt: "refresh_token_expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
  verification: {
    fields: {
      expiresAt: "expires_at",
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
});

