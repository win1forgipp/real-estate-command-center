import { createClient, type Client } from "@libsql/client";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";

import { schema } from "@/db/schema";

export type Database = LibSQLDatabase<typeof schema>;

type DatabaseEnv = {
  url: string;
  authToken?: string;
};

let client: Client | undefined;
let database: Database | undefined;

function getDatabaseEnv(): DatabaseEnv {
  const url = process.env.DATABASE_URL?.trim();
  const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and add your Turso database URL.",
    );
  }

  const isLocalDatabase = url.startsWith("file:");

  if (!isLocalDatabase && !authToken) {
    throw new Error(
      "DATABASE_AUTH_TOKEN is not set. Remote Turso databases require an auth token.",
    );
  }

  return {
    url,
    authToken: authToken || undefined,
  };
}

export function createDb(): Database {
  const env = getDatabaseEnv();

  const libsql = createClient({
    url: env.url,
    authToken: env.authToken,
  });

  return drizzle(libsql, { schema });
}

export function getDb(): Database {
  if (!database) {
    if (!client) {
      const env = getDatabaseEnv();
      client = createClient({
        url: env.url,
        authToken: env.authToken,
      });
    }

    database = drizzle(client, { schema });
  }

  return database;
}

export function resetDbForTests() {
  client = undefined;
  database = undefined;
}
