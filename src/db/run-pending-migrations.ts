import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "node:path";

function getDatabaseEnv() {
  const url = process.env.DATABASE_URL?.trim();
  const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();

  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }

  const isLocalDatabase = url.startsWith("file:");

  if (!isLocalDatabase && !authToken) {
    throw new Error("DATABASE_AUTH_TOKEN is not set for remote Turso database.");
  }

  return {
    url,
    authToken: authToken || undefined,
    isLocalDatabase,
  };
}

export async function runPendingMigrations() {
  const env = getDatabaseEnv();
  const client = createClient({
    url: env.url,
    authToken: env.authToken,
  });
  const db = drizzle(client);

  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });

  client.close();
}

export function assertProductionMigrationTarget() {
  const env = getDatabaseEnv();

  if (env.isLocalDatabase) {
    throw new Error(
      "db:migrate:prod requires a remote Turso DATABASE_URL. Use npm run db:migrate for local databases.",
    );
  }
}
