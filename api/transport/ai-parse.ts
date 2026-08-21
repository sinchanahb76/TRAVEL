import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseNaturalLanguageTransportQuery } from '../_lib/backendLogic.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    const { prompt } = req.body || {};
    const parsed = await parseNaturalLanguageTransportQuery(prompt || '');
    return res.status(200).json({ success: true, ...parsed });
  } catch (error: any) {
    console.error('Transport AI Parse API error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to parse natural language transport query.',
      success: false,
    });
  }
}
