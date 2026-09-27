import { festivalRecords } from '../../src/festivals/festivalData.js';
import mongoose from 'mongoose';
import { Festival } from '../models/index.js';

export const CULTURE_GUIDELINES = `You are Bharat AI, a careful cultural discovery guide about India's many communities, traditions, festivals, food, languages, arts, music, dance, architecture and history. Be factual and respectful, distinguish regional and community variations, avoid stereotypes and unsupported claims, and say when uncertain. Never invent festival dates or cite generated content as official. Respond in the user's language (including Hindi/Hinglish). Use supplied cultural context when relevant.`;

export async function findCulturalContext(query) {
  const words = String(query).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 2);
  const local = festivalRecords.filter((item) => words.some((word) => JSON.stringify(item).toLowerCase().includes(word))).slice(0, 6).map(({ name, category, states, regions, shortDescription, significance, traditions, dates }) => ({ name, category, states, regions, shortDescription, significance, traditions, dates }));
  if (mongoose.connection.readyState !== 1 || !words.length) return local;
  const terms = words.slice(0, 8).map((word) => new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  const stored = await Festival.find({ $or: terms.flatMap((regex) => ['name','category','states','regions','summary','significance','tags'].map((field) => ({ [field]: regex }))) }).limit(6).lean();
  const byName = new Map([...local, ...stored.map((item) => ({ ...item, shortDescription: item.summary }))].map((item) => [item.name, item]));
  return [...byName.values()].slice(0, 8);
}

export async function askModel({ messages, json = false, image }) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    const error = new Error('Bharat AI is not configured yet. Add AI_API_KEY to the backend environment.');
    error.status = 503; error.code = 'AI_NOT_CONFIGURED'; throw error;
  }
  const endpoint = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '') + '/chat/completions';
  const userContent = image ? [
    { type: 'text', text: messages.at(-1).content },
    { type: 'image_url', image_url: { url: `data:${image.mimetype};base64,${image.buffer.toString('base64')}` } }
  ] : messages.at(-1).content;
  const payload = {
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    temperature: 0.35,
    messages: [...messages.slice(0, -1), { ...messages.at(-1), content: userContent }],
    ...(json ? { response_format: { type: 'json_object' } } : {})
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_TIMEOUT_MS || 30000));
  try {
    const response = await fetch(endpoint, { method: 'POST', signal: controller.signal, headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(response.status === 429 ? 'Bharat AI is busy. Please try again later.' : 'Bharat AI could not complete that request. Please try again.');
      error.status = response.status === 429 ? 429 : 502; throw error;
    }
    const content = body.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) { const error = new Error('Bharat AI returned an empty response. Please try again.'); error.status = 502; throw error; }
    return content.trim();
  } catch (error) {
    if (error.name === 'AbortError') { const timeoutError = new Error('Bharat AI took too long to respond. Please try again.'); timeoutError.status = 504; throw timeoutError; }
    throw error;
  } finally { clearTimeout(timeout); }
}

export function parseJsonObject(text) {
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(clean);
}
