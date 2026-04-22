/**
 * Site-wide display rewrites.
 * Used to keep legacy DB values without touching them, while presenting current info.
 */
export const AUTHOR_REWRITES: Record<string, string> = {
  "[ADM]-Beckman": "[ADM]-Lemos",
};

export function displayAuthor(raw: string): string {
  return AUTHOR_REWRITES[raw] ?? raw;
}
