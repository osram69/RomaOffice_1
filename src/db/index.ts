import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsDrizzle?: NodePgDatabase;
};

function getDb(): NodePgDatabase {
  if (globalForDb.__arenaNextJsDrizzle) {
    return globalForDb.__arenaNextJsDrizzle;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({ connectionString: databaseUrl });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  const instance = drizzle(pool);
  globalForDb.__arenaNextJsDrizzle = instance;
  return instance;
}

// Proxy: la connessione viene creata solo quando "db" viene realmente usato
// (cioè a runtime, quando arriva una richiesta), non durante il build.
export const db = new Proxy({} as NodePgDatabase, {
  get(_target, prop, receiver) {
    const instance = getDb();
    const value = Reflect.get(instance as object, prop, receiver);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});