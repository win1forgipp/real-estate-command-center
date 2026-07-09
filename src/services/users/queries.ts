import "server-only";

import { asc } from "drizzle-orm";

import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import type { UserDto } from "@/features/transactions/types";

export async function getUsersList(): Promise<UserDto[]> {
  const db = getDb();
  const rows = await db.select().from(users).orderBy(asc(users.name));

  return rows.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }));
}
