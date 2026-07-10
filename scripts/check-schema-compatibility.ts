import "dotenv/config";

import { verifyApplicationSchema } from "../src/db/schema-compatibility";

async function main() {
  const schema = await verifyApplicationSchema();

  if (schema.ready) {
    console.log("Database schema matches application requirements.");
    return;
  }

  console.error(schema.message);
  process.exit(1);
}

main().catch((error) => {
  console.error("Schema compatibility check failed:", error);
  process.exit(1);
});
