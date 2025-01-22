import type { Config } from "drizzle-kit";
import { env } from "@/lib/env.mjs";

export default {
    schema: "./lib/db/schema",
    dialect: "postgresql",
    out: "./lib/db/migrations",
    dbCredentials: {
        url: env.NEXT_PUBLIC_DATABASE_URL ?? process.env.NEXT_PUBLIC_DATABASE_URL ?? env.DATABASE_URL ?? process.env.DATABASE_URL,
    }
} satisfies Config;