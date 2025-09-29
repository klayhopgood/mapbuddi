// db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Debug logging - URGENT FIX NEEDED - Timestamp: 2025-09-29T08:16:00
console.log("=== DATABASE DEBUG v3 ===");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("DATABASE_URL full length:", process.env.DATABASE_URL?.length);
console.log("DATABASE_URL first 60 chars:", process.env.DATABASE_URL?.substring(0, 60) + "...");
console.log("Environment:", process.env.NODE_ENV);
console.log("Timestamp:", new Date().toISOString());
console.log("=== END DEBUG ===");

// create the connection
const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client);
