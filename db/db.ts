// db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Debug logging - Force complete cache clear
console.log("=== DATABASE DEBUG ===");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("DATABASE_URL full length:", process.env.DATABASE_URL?.length);
console.log("DATABASE_URL preview:", process.env.DATABASE_URL?.substring(0, 50) + "...");
console.log("Environment:", process.env.NODE_ENV);
console.log("Timestamp:", new Date().toISOString());

// create the connection
const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client);
