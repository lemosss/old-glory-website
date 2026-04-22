import "server-only";
import { db } from "@/lib/db";

export async function getOnlineRecord() {
  const row = await db.server_record.findFirst({
    orderBy: { record: "desc" },
  });
  return row;
}

export async function getServerConfig() {
  return db.server_config.findMany();
}
