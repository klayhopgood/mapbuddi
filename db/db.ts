// db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Debug logging - Force redeploy
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("DATABASE_URL preview:", process.env.DATABASE_URL?.substring(0, 30) + "...");
console.log("Environment:", process.env.NODE_ENV);

// create the connection
const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client);
