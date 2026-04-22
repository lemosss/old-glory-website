import "server-only";
import { db } from "@/lib/db";

/**
 * The legacy DB has UTF-8 text that was double-encoded (UTF-8 bytes
 * re-encoded again as if they were Latin1). The stored bytes, decoded as UTF-8,
 * give mojibake like "alteraÃ§Ãµes". Re-encoding that string as Latin1 and
 * decoding again as UTF-8 reverses the damage to "alterações".
 */
function decode(raw: unknown): string {
  if (raw == null) return "";
  let buf: Buffer;
  if (Buffer.isBuffer(raw)) buf = raw;
  else if (raw instanceof Uint8Array) buf = Buffer.from(raw);
  else buf = Buffer.from(String(raw), "utf8");
  const onceDecoded = buf.toString("utf8");
  const reencoded = Buffer.from(onceDecoded, "latin1");
  return reencoded.toString("utf8");
}

/** Site-specific content rewrites: strip legacy references no longer valid. */
const CONTENT_STRIPS: RegExp[] = [
  // remove any HTML block that contains the legacy IP
  /<center\b[^>]*>[\s\S]*?venus\.megatibia\.net[\s\S]*?<\/center>/gi,
  /<p\b[^>]*>[\s\S]*?venus\.megatibia\.net[\s\S]*?<\/p>/gi,
  /<div\b[^>]*>[\s\S]*?venus\.megatibia\.net[\s\S]*?<\/div>/gi,
  // fallback: any remaining textual IP reference
  /(?:<[^>]+>\s*)*IP:\s*(?:<[^>]+>\s*)*venus\.megatibia\.net(?:\s*<\/[^>]+>)*\.?/gi,
  /venus\.megatibia\.net/gi,
  /megatibia\.net/gi,
  // legacy support emails that no longer exist
  /confirma[cç][aã]o@megai?tbia\.net/gi,
  // strip inline images referencing no-longer-available legacy assets
  /<img\b[^>]*>/gi,
];

function applyContentRewrites(html: string): string {
  let out = html;
  for (const r of CONTENT_STRIPS) out = out.replace(r, "");
  // collapse lingering empty wrappers like "<b>IP:</b> <i></i>"
  out = out.replace(/<(\w+)[^>]*>\s*(<[^>]+>\s*)*<\/\1>/g, "");
  return out;
}

export type NewsBig = {
  date: number;
  author: string;
  author_id: number;
  image_id: number;
  topic_df: string;
  text_df: string;
  topic_ot: string;
  text_ot: string;
};

type RawNewsBig = {
  date: number;
  author: Buffer | string;
  author_id: number;
  image_id: number;
  topic_df: Buffer | string;
  text_df: Buffer | string;
  topic_ot: Buffer | string;
  text_ot: Buffer | string;
};

export async function getLatestNews(limit = 5): Promise<NewsBig[]> {
  const rows = await db.$queryRaw<RawNewsBig[]>`
    SELECT
      date,
      CAST(author AS BINARY)  AS author,
      author_id,
      image_id,
      CAST(topic_df AS BINARY) AS topic_df,
      CAST(text_df  AS BINARY) AS text_df,
      CAST(topic_ot AS BINARY) AS topic_ot,
      CAST(text_ot  AS BINARY) AS text_ot
    FROM z_news_big
    WHERE hide_news = 0
    ORDER BY date DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    date: r.date,
    author: decode(r.author),
    author_id: r.author_id,
    image_id: r.image_id,
    topic_df: decode(r.topic_df),
    text_df: applyContentRewrites(decode(r.text_df)),
    topic_ot: decode(r.topic_ot),
    text_ot: applyContentRewrites(decode(r.text_ot)),
  }));
}

export type NewsTicker = {
  date: number;
  author: number;
  image_id: number;
  text: string;
};

export async function getLatestTickers(limit = 5): Promise<NewsTicker[]> {
  const rows = await db.$queryRaw<
    { date: number; author: number; image_id: number; text: Buffer | string }[]
  >`
    SELECT date, author, image_id, CAST(text AS BINARY) AS text
    FROM z_news_tickers
    WHERE hide_ticker = 0
    ORDER BY date DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    date: r.date,
    author: r.author,
    image_id: r.image_id,
    text: applyContentRewrites(decode(r.text)),
  }));
}
