import "dotenv/config";

import {
  assertProductionMigrationTarget,
  runPendingMigrations,
} from "../src/db/run-pending-migrations";
import {
  resetSchemaCompatibilityCache,
  verifyApplicationSchema,
} from "../src/db/schema-compatibility";

async function main() {
  assertProductionMigrationTarget();

  console.log("Applying pending migrations to production Turso...");
  await runPendingMigrations();
  resetSchemaCompatibilityCache();

  const schema = await verifyApplicationSchema();

  if (!schema.ready) {
    console.error(schema.message);
    process.exit(1);
  }

  console.log("Production migrations applied successfully.");
}

main().catch((error) => {
  console.error("Production migration failed:", error);
  process.exit(1);
});
