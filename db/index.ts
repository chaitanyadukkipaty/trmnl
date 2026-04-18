import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const DB_PATH = process.env.DATABASE_URL?.replace("file:", "") ?? "./trmnl.db";
const absolutePath = path.isAbsolute(DB_PATH)
  ? DB_PATH
  : path.join(process.cwd(), DB_PATH);

declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof drizzle> | undefined;
}

function getDb() {
  if (!global.__db) {
    const sqlite = new Database(absolutePath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    global.__db = drizzle(sqlite, { schema });
  }
  return global.__db;
}

export const db = getDb();
export { schema };
