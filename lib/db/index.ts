import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env.mjs";

const client = postgres(env.NEXT_PUBLIC_DATABASE_URL ?? process.env.NEXT_PUBLIC_DATABASE_URL ?? env.DATABASE_URL ?? process.env.DATABASE_URL, { max: 1 });
export const db = drizzle(client);
