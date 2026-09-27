import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export async function optionalAuth(req, _res, next) {
  const token = req.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return next();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.sub).select('_id email name role');
  } catch { /* Expired/invalid tokens remain guest requests; protected routes reject separately. */ }
  next();
}
export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, error: 'Sign in to save this activity.' });
  next();
}
