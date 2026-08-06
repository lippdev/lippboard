import Database from 'better-sqlite3';
import { betterAuth } from 'better-auth';

const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || 'lipp-board-dev-secret-please-change-me-000';

export function createAuth(dbPath) {
  const database = new Database(dbPath);
  database.pragma('journal_mode = WAL');
  database.pragma('foreign_keys = ON');

  const auth = betterAuth({
    secret: BETTER_AUTH_SECRET,
    database,
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 8,
    },
  });

  return {
    auth,
    authHandler: auth.handler,
    database,
    async getSessionFromRequest(req) {
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers || {})) {
        if (Array.isArray(value)) {
          headers.set(key, value.join(', '));
        } else if (typeof value === 'string') {
          headers.set(key, value);
        }
      }
      try {
        return await auth.api.getSession({ headers });
      } catch {
        return null;
      }
    },
    async isFirstRun() {
      try {
        const row = database.prepare('SELECT COUNT(*) AS count FROM user').get();
        return Number(row?.count || 0) === 0;
      } catch {
        return true;
      }
    },
  };
}
