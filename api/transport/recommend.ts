import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTransportRecommendations } from '../_lib/backendLogic.js';

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

  try {
    const destination = (req.method === 'POST' ? req.body?.destination : req.query?.destination) || '';
    const origin = (req.method === 'POST' ? req.body?.origin : req.query?.origin) || '';

    if (!destination) {
      return res.status(400).json({ error: 'Destination parameter is required.', success: false });
    }

    const recommendation = await getTransportRecommendations(String(destination), String(origin));
    return res.status(200).json({ success: true, ...recommendation });
  } catch (error: any) {
    console.error('Transport Recommendation API error:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to generate transport recommendation.',
      success: false,
    });
  }
}
