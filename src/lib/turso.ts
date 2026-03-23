import { createClient } from '@libsql/client/web';

const url = import.meta.env.VITE_TURSO_DATABASE_URL;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

if (!url) {
  console.warn('VITE_TURSO_DATABASE_URL is not defined. Database features will be unavailable.');
}

export const turso = createClient({
  url: url || 'libsql://dummy.turso.io', // Fallback to a dummy URL to prevent crash
  authToken: authToken,
});
