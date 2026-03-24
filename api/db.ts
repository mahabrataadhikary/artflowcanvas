import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { sql, args } = request.body;

  if (!sql) {
    return response.status(400).json({ error: 'SQL query is required' });
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    return response.status(500).json({ error: 'Database configuration missing' });
  }

  try {
    const client = createClient({ url, authToken });
    const result = await client.execute({ sql, args: args || [] });
    
    // Map rows to plain objects and handle BigInt serialization
    const safeRows = result.rows.map(row => {
      const obj: any = {};
      result.columns.forEach((column, index) => {
        const value = row[column] !== undefined ? row[column] : row[index];
        obj[column] = typeof value === 'bigint' ? value.toString() : value;
      });
      return obj;
    });

    return response.status(200).json({
      ...result,
      rows: safeRows,
      // Also handle bigint in other parts of result if they exist
      rowsAffected: typeof result.rowsAffected === 'bigint' ? Number(result.rowsAffected) : result.rowsAffected,
      lastInsertRowid: typeof result.lastInsertRowid === 'bigint' ? result.lastInsertRowid.toString() : result.lastInsertRowid
    });
  } catch (err: any) {
    console.error(`[DB Proxy Error] SQL: ${sql}`, err);
    return response.status(500).json({ error: err.message });
  }
}
