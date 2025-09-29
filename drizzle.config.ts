export default {
  schema: "./db/schema.ts",
  out: "./migrations-folder", 
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
};
