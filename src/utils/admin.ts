import { auth } from "@/utils/auth";
import { db } from "@/lib/db/drizzle/connection";
import { users } from "@/lib/db/drizzle/schema";
import { eq } from "drizzle-orm";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Verifies the incoming request belongs to an authenticated admin.
 *
 * Primary check: `session.user.role === "admin"` (DB-backed via better-auth's
 * `additionalFields`). Bootstrap fallback: if the `ADMIN_EMAIL` env var matches
 * the session's email but the DB role hasn't been promoted yet (e.g. right
 * after the role column migration), self-heal by upgrading that user's role
 * to `"admin"` so future checks no longer need the env fallback.
 *
 * Returns the admin user, or `null` if the request is unauthorized.
 */
export async function verifyAdmin(
  request: Request | { headers: Headers },
): Promise<AdminUser | null> {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user) return null;

  const role = (session.user as { role?: string }).role;

  if (role === "admin") {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && session.user.email === adminEmail) {
    try {
      await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, session.user.id));
    } catch (error) {
      console.error("Failed to bootstrap admin role:", error);
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
  }

  return null;
}
