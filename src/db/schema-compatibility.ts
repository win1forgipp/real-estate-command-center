import { createClient } from "@libsql/client";

export const SCHEMA_BEHIND_MESSAGE =
  "Database schema is behind application version. Run npm run db:migrate.";

const REQUIRED_TRANSACTION_COLUMNS = [
  "commission_percentage_bps",
  "brokerage_split_bps",
  "gross_commission_amount_cents",
  "brokerage_fee_amount_cents",
  "agent_net_commission_cents",
] as const;

export type SchemaCompatibilityResult = {
  ready: boolean;
  missingColumns: string[];
  message: string;
};

let schemaCheckPromise: Promise<SchemaCompatibilityResult> | undefined;
let schemaWarningLogged = false;

function getDatabaseEnv() {
  const url = process.env.DATABASE_URL?.trim();
  const authToken = process.env.DATABASE_AUTH_TOKEN?.trim();

  if (!url) {
    return null;
  }

  const isLocalDatabase = url.startsWith("file:");

  if (!isLocalDatabase && !authToken) {
    return null;
  }

  return {
    url,
    authToken: authToken || undefined,
  };
}

async function loadSchemaCompatibility(): Promise<SchemaCompatibilityResult> {
  const env = getDatabaseEnv();

  if (!env) {
    return {
      ready: true,
      missingColumns: [],
      message: "",
    };
  }

  const client = createClient({
    url: env.url,
    authToken: env.authToken,
  });

  try {
    const columnsResult = await client.execute("PRAGMA table_info(transactions)");
    const existingColumns = new Set(
      columnsResult.rows.map((row) => String(row.name)),
    );
    const missingColumns = REQUIRED_TRANSACTION_COLUMNS.filter(
      (column) => !existingColumns.has(column),
    );

    if (missingColumns.length === 0) {
      return {
        ready: true,
        missingColumns: [],
        message: "",
      };
    }

    return {
      ready: false,
      missingColumns: [...missingColumns],
      message: `${SCHEMA_BEHIND_MESSAGE} Missing columns: ${missingColumns.join(", ")}.`,
    };
  } finally {
    client.close();
  }
}

export async function verifyApplicationSchema(): Promise<SchemaCompatibilityResult> {
  if (!schemaCheckPromise) {
    schemaCheckPromise = loadSchemaCompatibility().catch((error) => {
      schemaCheckPromise = undefined;
      throw error;
    });
  }

  return schemaCheckPromise;
}

export function resetSchemaCompatibilityCache() {
  schemaCheckPromise = undefined;
  schemaWarningLogged = false;
}

export async function isTransactionSchemaReady(): Promise<boolean> {
  return (await verifyApplicationSchema()).ready;
}

export async function getTransactionSchemaWarning(): Promise<string | null> {
  const result = await verifyApplicationSchema();

  if (result.ready) {
    return null;
  }

  if (!schemaWarningLogged) {
    console.error("[db]", result.message);
    schemaWarningLogged = true;
  }

  return result.message;
}

export async function logSchemaCompatibilityOnStartup() {
  const result = await verifyApplicationSchema();

  if (!result.ready) {
    console.error("[db]", result.message);
  }
}
