import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = request.body;

  if (!password) {
    return response.status(400).json({ error: 'Password is required' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    return response.status(200).json({ success: true, message: 'Authenticated successfully' });
  } else {
    return response.status(401).json({ success: false, message: 'Invalid password' });
  }
}
