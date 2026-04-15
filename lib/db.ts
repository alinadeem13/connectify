import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { Database } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "store.json");

const defaultDb: Database = {
  users: [],
  sessions: [],
  posts: [],
};

export async function readDb(): Promise<Database> {
  try {
    const raw = await readFile(dataFile, "utf-8");
    return JSON.parse(raw) as Database;
  } catch {
    await writeDb(defaultDb);
    return defaultDb;
  }
}

export async function writeDb(data: Database) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(data, null, 2), "utf-8");
}
