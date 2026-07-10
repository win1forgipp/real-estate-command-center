# Deployment Checklist

Run these steps **before** deploying code that depends on database schema changes.

Migrations are **not** applied automatically during Vercel startup. Apply them manually against production Turso first.

## Pre-deploy

1. Review migration files in `drizzle/` and confirm statement-breakpoint markers are present for multi-statement migrations.
2. Run migrations against production Turso:
   ```bash
   npm run db:migrate:prod
   ```
   For local development databases, use:
   ```bash
   npm run db:migrate
   ```
3. Verify migration status without mutating the database:
   ```bash
   npm run db:schema:check
   ```
4. Run:
   ```bash
   npm run build
   npm run test:rec-014
   npm run validate:iti-production-imports
   ```

## Deploy

5. Push to `main`.
6. Verify the Vercel deployment completes successfully.

## Post-deploy smoke test

7. Smoke test these routes in production:
   - `/` (dashboard)
   - `/transactions`
   - `/transactions/[existing transaction id]`

If the database schema is behind the application version, transaction routes degrade gracefully and server logs will include:

`Database schema is behind application version. Run npm run db:migrate.`
