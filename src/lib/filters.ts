import type { Prisma } from "@/generated/prisma";

/**
 * Filter applied to all public player listings (highscores, online, search).
 * Excludes:
 *  - system/account-manager characters on account_id = 1
 *  - deleted characters
 *  - staff (group_id >= 2: tutor, gamemaster, god, etc.)
 */
export const publicPlayerFilter: Prisma.playersWhereInput = {
  deleted: false,
  account_id: { gt: 1 },
  group_id: { lt: 2 },
};
