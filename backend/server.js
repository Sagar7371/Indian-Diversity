import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { Festival } from './models/index.js';
import { festivalRecords } from '../src/festivals/festivalData.js';
import { aiRouter } from './routes/ai.js';

// Always load the project-root .env, regardless of the shell's current directory.
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const app = express();
const port = Number(process.env.PORT || 5000);
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((item) => item.trim());
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: (origin, callback) => {
  const localDevOrigin = process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
  if (!origin || allowedOrigins.includes(origin) || localDevOrigin) return callback(null, true);
  return callback(new Error('This site is not allowed to access the Bharat AI API.'));
}, methods: ['GET','POST','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '128kb' }));
app.get('/api/health', (_req, res) => res.json({ success: true, database: mongoose.connection.readyState === 1 ? 'connected' : 'not-configured' }));
app.use('/api/ai', rateLimit({ windowMs: 15 * 60 * 1000, limit: Number(process.env.AI_RATE_LIMIT || 40), standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, error: 'You have reached the current AI usage limit. Please try again later.' } }), aiRouter);
app.use((req, res) => res.status(404).json({ success: false, error: 'This API endpoint was not found.' }));
app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error('[api]', error.code || 'SERVER_ERROR', error.message);
  const publicError = error.code === 'AI_NOT_CONFIGURED'
    ? 'AI service is not configured.'
    : error.code === 'AI_AUTH_FAILED'
      ? 'AI service authentication failed.'
      : error.code === 'AI_CREDITS_EXHAUSTED'
        ? 'AI provider credits are exhausted. Add API credits or use a funded API key.'
      : error.code === 'AI_RATE_LIMITED'
        ? 'AI service is busy. Please try again shortly.'
      : error.code === 'AI_UNAVAILABLE'
        ? 'AI service is temporarily unavailable.'
        : status >= 500 ? 'Sorry, I’m having trouble connecting right now. Please try again in a moment.' : error.message;
  res.status(status).json({ success: false, error: publicError });
});

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
    .then(async () => {
      console.info('MongoDB connected');
      await Festival.bulkWrite(festivalRecords.map(({ name, slug, dates, states, regions, category, tags, shortDescription, significance, sources }) => ({ updateOne: { filter: { slug }, update: { $set: { name, dates, states, regions, category, tags, summary: shortDescription, significance, sources } }, upsert: true } })), { ordered: false });
    })
    .catch((error) => console.error('MongoDB connection failed; guest AI features can still run:', error.message));
}
app.listen(port, () => {
  console.info(`Bharat AI API listening on http://localhost:${port}`);
  console.info('AI API key configured:', Boolean(process.env.AI_API_KEY?.trim()));
});
