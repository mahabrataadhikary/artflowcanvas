export const turso = {
  execute: async (sql: any, args?: any) => {
    const response = await fetch('/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: typeof sql === 'string' ? sql : sql.sql,
        args: typeof sql === 'string' ? args : sql.args,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Database proxy error');
    }

    return response.json();
  },
};
