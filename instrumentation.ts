export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { logSchemaCompatibilityOnStartup } = await import(
    "@/db/schema-compatibility"
  );

  await logSchemaCompatibilityOnStartup();
}
