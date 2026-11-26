import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/* The connection is created lazily, on the first query — NOT at import time.
   Next collects route configs during `next build`, so throwing here would fail the build on any
   host without a database (Netlify, a preview deploy, a fresh clone). Instead the build succeeds
   and only a request that actually needs Postgres fails, with a clear message. */

type Db = ReturnType<typeof drizzle>;

const globalForDb = globalThis as typeof globalThis & {
  __aureliusPool?: Pool;
  __aureliusDb?: Db;
};

function connect(): Db {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for orders, requests and private agent links.");
  }
  const pool = globalForDb.__aureliusPool ?? new Pool({ connectionString: databaseUrl });
  if (process.env.NODE_ENV !== "production") globalForDb.__aureliusPool = pool;
  const instance = drizzle(pool);
  globalForDb.__aureliusDb = instance;
  return instance;
}

/** Same API as `drizzle(pool)`, but the pool is only opened when something is queried. */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    const instance = globalForDb.__aureliusDb ?? connect();
    const value = Reflect.get(instance as object, prop, instance);
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(instance) : value;
  },
});
