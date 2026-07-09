import "server-only";

import { getDb } from "@/db/client";
import { links } from "@/db/schema";

export type CreateLinkInput = {
  title: string;
  url: string;
  linkType:
    | "google_drive"
    | "mls"
    | "dotloop"
    | "skyslope"
    | "dropbox"
    | "website"
    | "other";
  transactionId?: string;
};

export async function createLink(input: CreateLinkInput) {
  const db = getDb();

  const [link] = await db
    .insert(links)
    .values({
      title: input.title,
      url: input.url,
      linkType: input.linkType,
      transactionId: input.transactionId ?? null,
    })
    .returning();

  return link;
}
