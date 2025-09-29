// db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Database connection

// create the connection
const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client);
