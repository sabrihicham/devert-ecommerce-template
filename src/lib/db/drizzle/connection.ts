import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// In dev, Next.js hot-reloads this module on every save, which would
// otherwise create a brand-new postgres-js client (and new DB connections)
// each time without closing the previous one, eventually exhausting the
// Supabase pooler's connection limit. Cache the client on `globalThis` so
// Fast Refresh reuses the same instance.
const globalForDb = globalThis as unknown as {
  queryClient?: ReturnType<typeof postgres>;
};

const queryClient =
  globalForDb.queryClient ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Required when connecting through Supabase's transaction pooler (port 6543),
    // which does not support prepared statements.
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.queryClient = queryClient;
}

export const db = drizzle(queryClient, { schema });
export { schema };
export type Database = typeof db;
export type RLSClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Sets the current user ID in PostgreSQL session for RLS policies */
export async function setCurrentUserId(
  client: RLSClient,
  userId: string | null | undefined
): Promise<void> {
  const value = userId || "";
  await client.execute(
    sql`SELECT set_config('app.current_user_id', ${value}, true)`,
  );
}

export async function clearCurrentUserId(client: RLSClient): Promise<void> {
  await client.execute(sql`SELECT set_config('app.current_user_id', '', true)`);
}

/**
 * Executes a database operation with user context set for RLS policies.
 * @example
 * const items = await withRLS(userId, () => db.select().from(cartItems));
 */
export async function withRLS<T>(
  userId: string | null | undefined,
  operation: (tx: RLSClient) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await setCurrentUserId(tx, userId);
    return operation(tx);
  });
}

/** Creates a database transaction with RLS context */
export async function withRLSTransaction<T>(
  userId: string,
  operation: (tx: RLSClient) => Promise<T>,
): Promise<T> {
  return withRLS(userId, operation);
}
