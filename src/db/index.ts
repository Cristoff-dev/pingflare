import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing in environment variables");
}

// prepare: false is strictly required for Supabase Transaction Pooler (port 6543)
const client = postgres(process.env.DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });