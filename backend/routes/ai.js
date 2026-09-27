import { Router } from 'express';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import { z } from 'zod';
import { AIConversation, AIMessage, CulturalJourney, Quiz, QuizAttempt, User, UserCulturalProfile } from '../models/index.js';
import { CULTURE_GUIDELINES, askModel, findCulturalContext, parseJsonObject } from '../services/aiService.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

export const aiRouter = Router();
aiRouter.use(optionalAuth);
const guestQuizSessions = new Map();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 }, fileFilter: (_req, file, cb) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) { const error = new Error('Upload a JPG, PNG, or WEBP image under 5 MB.'); error.status = 400; return cb(error); }
  cb(null, true);
} });
const chatSchema = z.object({ message: z.string().trim().min(1).max(2000), conversationId: z.string().nullable().optional() });
const searchSchema = z.object({ query: z.string().trim().min(1).max(300), type: z.enum(['web', 'image']).default('web') });
const quizSchema = z.object({ topic: z.string().trim().min(1).max(80), difficulty: z.enum(['easy', 'medium', 'hard']), numberOfQuestions: z.coerce.number().int().refine((n) => [5, 10, 15].includes(n)) });
const stateNames = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

function fail(res, status, error) { return res.status(status).json({ success: false, error }); }
aiRouter.post('/search', async (req, res, next) => {
  try {
    const { query, type } = searchSchema.parse(req.body);
    const googleUrl = `https://www.google.com/search?${type === 'image' ? 'tbm=isch&' : ''}q=${encodeURIComponent(query)}`;
    const key = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
    if (!key || !cx) return res.json({ success:true, configured:false, query, type, googleUrl, results:[] });
    const params = new URLSearchParams({ key, cx, q:query, num:'5', ...(type === 'image' ? { searchType:'image', safe:'active' } : {}) });
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?${params}`, { signal:AbortSignal.timeout(12000) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('[google search]', data.error?.message || response.statusText);
      return fail(res, 502, 'Google search is temporarily unavailable. Please try again.');
    }
    const results = (data.items || []).slice(0, 5).map((item) => ({
      title:String(item.title || 'Search result').slice(0, 180),
      snippet:String(item.snippet || item.htmlSnippet || '').replace(/<[^>]*>/g, '').slice(0, 320),
      link:item.link,
      contextLink:type === 'image' ? (item.image?.contextLink || item.image?.thumbnailLink || item.link) : '',
      searchType:type,
      imageUrl:type === 'image' ? (item.image?.thumbnailLink || item.link) : '',
      source:item.displayLink || ''
    }));
    res.json({ success:true, configured:true, query, type, googleUrl, results });
  } catch (error) { if (error instanceof z.ZodError) return fail(res, 400, 'Enter a search query up to 300 characters.'); next(error); }
});

function validateQuiz(value, count) {
  if (!Array.isArray(value.questions) || value.questions.length !== count) throw new Error('The quiz could not be generated in a valid format. Please try again.');
  const questions = value.questions.map((item) => {
    const opts = item.options;
    if (!item.question?.trim() || !item.explanation?.trim() || !Array.isArray(opts) || opts.length !== 4 || opts.some((o) => typeof o !== 'string' || !o.trim()) || new Set(opts.map((o) => o.trim().toLowerCase())).size !== 4) throw new Error('The quiz could not be generated in a valid format. Please try again.');
    const correctAnswer = typeof item.correctAnswer === 'number' ? opts[item.correctAnswer] : item.correctAnswer;
    if (!opts.includes(correctAnswer)) throw new Error('The quiz could not be generated in a valid format. Please try again.');
    return { question: item.question.trim(), options: opts, correctAnswer, explanation: item.explanation.trim() };
  });
  return questions;
}
async function generateJson(system, prompt, image) {
  let last;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try { return parseJsonObject(await askModel({ json: true, image, messages: [{ role: 'system', content: `${CULTURE_GUIDELINES}\n${system}${attempt ? '\nReturn only valid JSON matching the requested schema.' : ''}` }, { role: 'user', content: prompt }] })); }
    catch (error) { last = error; if (error.status) throw error; }
  }
  throw last;
}

aiRouter.post('/auth/register', async (req, res, next) => {
  try {
    const input = z.object({ name: z.string().trim().min(2).max(80), email: z.email(), password: z.string().min(10).max(128) }).parse(req.body);
    const email = input.email.toLowerCase();
    if (await User.exists({ email })) return fail(res, 409, 'An account with this email already exists.');
    const user = await User.create({ name: input.name, email, passwordHash: await bcrypt.hash(input.password, 12) });
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.status(201).json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (error) { if (error instanceof z.ZodError) return fail(res, 400, 'Enter a name, valid email, and password of at least 10 characters.'); next(error); }
});
aiRouter.post('/auth/login', async (req, res, next) => {
  try {
    const input = z.object({ email: z.email(), password: z.string().min(1).max(128) }).parse(req.body);
    const user = await User.findOne({ email: input.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return fail(res, 401, 'Email or password is incorrect.');
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (error) { if (error instanceof z.ZodError) return fail(res, 400, 'Enter a valid email and password.'); next(error); }
});

aiRouter.post('/chat', async (req, res, next) => {
  try {
    const { message, conversationId } = chatSchema.parse(req.body);
    const context = await findCulturalContext(message);
    const profile = req.user && await UserCulturalProfile.findOne({ userId: req.user._id }).lean();
    let conversation = conversationId && req.user ? await AIConversation.findOne({ _id: conversationId, userId: req.user._id }) : null;
    const history = conversation ? (await AIMessage.find({ conversationId: conversation._id }).sort({ createdAt: -1 }).limit(12).lean()).reverse().map(({ role, content }) => ({ role, content })) : [];
    const contextPrompt = `User message: ${message}\nRelevant verified project data (use only when relevant): ${JSON.stringify(context)}\nInterest context: ${JSON.stringify(profile?.interests || [])}`;
    const reply = await askModel({ messages: [{ role: 'system', content: CULTURE_GUIDELINES }, ...history, { role: 'user', content: contextPrompt }] });
    let savedMessageIds = [];
    if (req.user) {
      if (!conversation) conversation = new AIConversation({ userId: req.user._id, title: message.slice(0, 80) });
      else if (conversation.title === 'New conversation') conversation.title = message.slice(0, 80);
      await conversation.save();
      const savedMessages = await AIMessage.insertMany([{ conversationId: conversation._id, role:'user', content:message }, { conversationId: conversation._id, role:'assistant', content:reply }]);
      savedMessageIds = savedMessages.map((item) => item.id);
      await UserCulturalProfile.updateOne({ userId: req.user._id }, { $set: { lastActiveAt: new Date() }, $addToSet: { interests: { $each: message.toLowerCase().split(/\W+/).filter((word) => word.length > 4).slice(0, 4) } } }, { upsert: true });
    }
    res.json({ success: true, reply, conversationId: conversation?.id || null, userMessageId:savedMessageIds[0] || null, assistantMessageId:savedMessageIds[1] || null, related: context.map(({ name }) => name) });
  } catch (error) { if (error instanceof z.ZodError) return fail(res, 400, 'Enter a message up to 2,000 characters.'); next(error); }
});

aiRouter.get('/conversations', requireAuth, async (req, res, next) => {
  try { const rows = await AIConversation.find({ userId: req.user._id }).select('title createdAt updatedAt').sort({ updatedAt: -1 }).limit(30).lean(); res.json({ success: true, conversations: rows }); } catch (error) { next(error); }
});
aiRouter.get('/conversations/:id', requireAuth, async (req, res, next) => {
  try { const conversation = await AIConversation.findOne({ _id: req.params.id, userId: req.user._id }).select('title createdAt updatedAt').lean(); if (!conversation) return fail(res, 404, 'Conversation not found.'); conversation.messages = await AIMessage.find({ conversationId: conversation._id }).sort({ createdAt: 1 }).lean(); res.json({ success: true, conversation }); } catch (error) { next(error); }
});
aiRouter.delete('/conversations/:id', requireAuth, async (req, res, next) => {
  try { const deleted = await AIConversation.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); if (deleted) await AIMessage.deleteMany({ conversationId: deleted._id }); res.status(204).end(); } catch (error) { next(error); }
});
aiRouter.delete('/conversations/:id/messages/:messageId', requireAuth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id) || !mongoose.isValidObjectId(req.params.messageId)) return fail(res, 404, 'Message not found.');
    const conversation = await AIConversation.findOne({ _id:req.params.id, userId:req.user._id }).select('_id');
    if (!conversation) return fail(res, 404, 'Conversation not found.');
    const deleted = await AIMessage.findOneAndDelete({ _id:req.params.messageId, conversationId:conversation._id }).select('_id');
    if (!deleted) return fail(res, 404, 'Message not found.');
    await AIConversation.updateOne({ _id:conversation._id }, { $set:{ updatedAt:new Date() } });
    res.status(204).end();
  } catch (error) { next(error); }
});

aiRouter.get('/recommendations', async (req, res, next) => {
  try {
    const profile = req.user && await UserCulturalProfile.findOne({ userId: req.user._id }).lean();
    const guestExplored = String(req.query.explored || '').split(',').filter((item) => stateNames.includes(item));
    const explored = new Set([...(profile?.exploredStates || []), ...guestExplored]);
    const picks = stateNames.filter((name) => !explored.has(name)).slice(0, 5);
    const records = (await import('../../src/festivals/festivalData.js')).festivalRecords;
    const festivals = records.filter((festival) => !profile?.exploredFestivals?.includes(festival.id)).slice(0, 4).map(({ id, name, category, shortDescription, regions }) => ({ id, name, category, description: shortDescription, regions }));
    const unique = (values) => [...new Set(values.filter(Boolean))].slice(0, 6);
    const foods = unique(records.flatMap((festival) => festival.traditionalFoods || []));
    const dances = unique(records.flatMap((festival) => festival.dances || []));
    const places = unique(records.flatMap((festival) => festival.bestPlaces || []));
    res.json({ success: true, states: picks, festivals, foods, dances, places, reason: explored.size ? 'These picks add new regions and traditions to the states you have already explored.' : 'Start with a mix of regions and traditions across India.' });
  } catch (error) { next(error); }
});

aiRouter.post('/analyze-image', upload.single('image'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return fail(res, 400, 'Choose a JPG, PNG, or WEBP image under 5 MB.');
    const magic = file.buffer.subarray(0, 12);
    const valid = (file.mimetype === 'image/jpeg' && magic[0] === 0xff && magic[1] === 0xd8) || (file.mimetype === 'image/png' && magic.subarray(0, 4).toString('hex') === '89504e47') || (file.mimetype === 'image/webp' && magic.toString('ascii', 0, 4) === 'RIFF' && magic.toString('ascii', 8, 12) === 'WEBP');
    if (!valid) return fail(res, 400, 'This file is not a valid supported image.');
    const result = await generateJson('Identify visible cultural objects cautiously. Return JSON with name, category, possibleRegions (array), confidence (High|Medium|Low), description, culturalSignificance, relatedStates (array). Explicitly state when the image is inconclusive. Never claim certainty.', 'Describe visible cultural clues and likely possibilities. Do not infer identity from people alone.', { buffer: file.buffer, mimetype: file.mimetype });
    const validResult = typeof result.name === 'string' && typeof result.category === 'string' && typeof result.description === 'string' && typeof result.culturalSignificance === 'string' && Array.isArray(result.possibleRegions) && Array.isArray(result.relatedStates);
    if (!validResult) return fail(res, 502, 'Unable to analyze this image. Please try another image.');
    res.json({ success: true, identification: { name: result.name, category: result.category, possibleRegions: result.possibleRegions.filter((x)=>typeof x==='string').slice(0,8), confidence: ['High', 'Medium', 'Low'].includes(result.confidence) ? result.confidence : 'Low', description: result.description, culturalSignificance: result.culturalSignificance, relatedStates: result.relatedStates.filter((x)=>typeof x==='string').slice(0,8) } });
  } catch (error) { next(error); }
});

aiRouter.post('/generate-quiz', async (req, res, next) => {
  try {
    const { topic, difficulty, numberOfQuestions } = quizSchema.parse(req.body);
    let questions;
    for (let attempt = 0; attempt < 2 && !questions; attempt += 1) {
      const result = await generateJson(`Create a culturally respectful quiz. Return JSON with a questions array. Each question must have question, exactly four distinct options, correctAnswer (one option string), and a concise explanation. Do not fabricate facts.${attempt ? ' Validate every field and return the exact number of questions.' : ''}`, `Topic: ${topic}\nDifficulty: ${difficulty}\nQuestion count: exactly ${numberOfQuestions}.`, null);
      try { questions = validateQuiz(result, numberOfQuestions); } catch (error) { if (attempt) throw error; }
    }
    const quizId = randomUUID();
    guestQuizSessions.set(quizId, { topic, difficulty, questions, expiresAt: Date.now() + 60 * 60 * 1000 });
    if (mongoose.connection.readyState === 1) await Quiz.create({ sessionId: quizId, topic, difficulty, questions, expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
    if (guestQuizSessions.size > 200) for (const [key, session] of guestQuizSessions) if (session.expiresAt < Date.now()) guestQuizSessions.delete(key);
    res.json({ success: true, quizId, topic, difficulty, questions: questions.map(({ question, options }) => ({ question, options })) });
  } catch (error) { if (error instanceof z.ZodError) return fail(res, 400, 'Choose a topic, valid difficulty, and 5, 10, or 15 questions.'); next(error); }
});
aiRouter.post('/quiz/submit', async (req, res, next) => {
  try {
    const input = z.object({ quizId: z.string().uuid(), answers: z.array(z.string()).max(15) }).parse(req.body);
    let session = guestQuizSessions.get(input.quizId);
    if ((!session || session.expiresAt < Date.now()) && mongoose.connection.readyState === 1) {
      const stored = await Quiz.findOne({ sessionId: input.quizId }).lean();
      if (stored) session = { ...stored, expiresAt: new Date(stored.expiresAt).getTime() };
    }
    if (!session || session.expiresAt < Date.now()) { guestQuizSessions.delete(input.quizId); return fail(res, 404, 'This quiz has expired. Generate a new one to continue.'); }
    if (input.answers.length !== session.questions.length) return fail(res, 400, 'Answer every quiz question before submitting.');
    const score = session.questions.reduce((total, question, index) => total + Number(input.answers[index] === question.correctAnswer), 0);
    const total = session.questions.length;
    const nextDifficulty = score / total > .8 ? ({ easy: 'medium', medium: 'hard', hard: 'hard' })[session.difficulty] : score / total < .4 ? ({ hard: 'medium', medium: 'easy', easy: 'easy' })[session.difficulty] : session.difficulty;
    let attemptId = null;
    if (req.user) {
      const attempt = await QuizAttempt.create({ userId: req.user._id, topic: session.topic, difficulty: session.difficulty, score, total, answers: input.answers });
      attemptId = attempt.id;
      await UserCulturalProfile.updateOne({ userId: req.user._id }, { $set: { lastActiveAt: new Date(), [`quizPerformance.${session.topic}`]: Math.round(score / total * 100) }, $addToSet: { exploredCategories: session.topic } }, { upsert: true });
    }
    guestQuizSessions.delete(input.quizId);
    if (mongoose.connection.readyState === 1) await Quiz.deleteOne({ sessionId: input.quizId });
    res.json({ success: true, score, total, nextDifficulty, attemptId, results: session.questions.map((question,index)=>({correct:input.answers[index]===question.correctAnswer,correctAnswer:question.correctAnswer,explanation:question.explanation})) });
  } catch (error) { if (error instanceof z.ZodError) return fail(res, 400, 'Quiz result is invalid.'); next(error); }
});

aiRouter.post('/explain', async (req, res, next) => {
  try { const { content, language, audience } = z.object({ content: z.string().trim().min(1).max(3000), language: z.enum(['English','Hindi','Hinglish','Bengali','Tamil','Telugu','Marathi','Gujarati','Punjabi','Malayalam','Kannada']), audience: z.string().max(60).default('general reader') }).parse(req.body); const reply = await askModel({ messages: [{ role: 'system', content: CULTURE_GUIDELINES }, { role: 'user', content: `Explain the following culture content in ${language} for ${audience}. Preserve cultural meaning and nuance; do not translate idioms literally.\n\n${content}` }] }); res.json({ success: true, explanation: reply }); }
  catch (error) { if (error instanceof z.ZodError) return fail(res, 400, 'Provide content and a supported language.'); next(error); }
});
aiRouter.post('/compare', async (req, res, next) => {
  try { const { first, second } = z.object({ first: z.string().trim().min(1).max(100), second: z.string().trim().min(1).max(100) }).parse(req.body); const reply = await askModel({ messages: [{ role: 'system', content: CULTURE_GUIDELINES }, { role: 'user', content: `Compare ${first} and ${second} respectfully. Cover region/context, history when verifiable, food, celebrations, dance/music, clothing, cultural significance, similarities and differences. Do not rank them.` }] }); res.json({ success: true, comparison: reply }); }
  catch (error) { if (error instanceof z.ZodError) return fail(res, 400, 'Enter two cultures to compare.'); next(error); }
});
aiRouter.post('/story', async (req, res, next) => {
  try { const { subject, format } = z.object({ subject: z.string().trim().min(1).max(100), format: z.string().max(50).default('short story') }).parse(req.body); const reply = await askModel({ messages: [{ role: 'system', content: CULTURE_GUIDELINES }, { role: 'user', content: `Create a ${format} inspired by ${subject}. Keep verifiable cultural facts distinct from imagined narrative details; label the story as an imagined scene.` }] }); res.json({ success: true, story: reply }); }
  catch (error) { if (error instanceof z.ZodError) return fail(res, 400, 'Choose a subject for the story.'); next(error); }
});

aiRouter.get('/journey', requireAuth, async (req, res, next) => {
  try { const journeys = await CulturalJourney.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(10).lean(); res.json({ success: true, journeys }); } catch (error) { next(error); }
});
aiRouter.post('/journey/start', async (req, res, next) => {
  try {
    const { interests } = z.object({ interests: z.string().trim().min(1).max(500) }).parse(req.body);
    const generated = await generateJson('Create 3-5 useful cultural discovery steps. Return JSON: {"steps":[{"state":"one exact Indian state name","category":"Food, Festivals, Arts, Music, Dance, Heritage, or Traditions","title":"short title","reason":"one sentence"}]}. Use only these states: ' + stateNames.join(', ') + '. Do not repeat states.', `Interests: ${interests}`, null);
    const steps = Array.isArray(generated.steps) ? generated.steps.filter((step) => stateNames.includes(step.state) && typeof step.title === 'string' && typeof step.reason === 'string').slice(0, 5) : [];
    if (steps.length < 3) { const error = new Error('The journey could not be formatted. Please try again.'); error.status = 502; throw error; }
    let journey = null;
    if (req.user) journey = await CulturalJourney.create({ userId: req.user._id, title: `Journey: ${interests.slice(0, 55)}`, goals: [interests], steps });
    res.json({ success: true, steps, journeyId: journey?.id || null });
  } catch (error) { if (error instanceof z.ZodError) return fail(res, 400, 'Describe what you would like to explore.'); next(error); }
});
aiRouter.post('/journey/next', async (req, res, next) => {
  try { const { context } = z.object({ context: z.string().trim().min(1).max(1000) }).parse(req.body); const reply = await askModel({ messages: [{ role: 'system', content: CULTURE_GUIDELINES }, { role: 'user', content: `Suggest the next diverse, less-explored cultural discovery based on: ${context}. Include one reason and a specific state or tradition.` }] }); res.json({ success: true, reply }); }
  catch (error) { if (error instanceof z.ZodError) return fail(res, 400, 'Share what you have explored so far.'); next(error); }
});
aiRouter.post('/journey/explore', requireAuth, async (req, res, next) => {
  try { const { state, category } = z.object({ state: z.string().trim().min(1).max(80), category: z.string().max(80).optional() }).parse(req.body); const item = { state, category: category || '', exploredAt: new Date() }; await UserCulturalProfile.updateOne({ userId: req.user._id }, { $set: { lastActiveAt: new Date() }, $addToSet: { exploredStates: state, ...(category ? { exploredCategories: category } : {}) }, $push: { culturalJourney: item } }, { upsert: true }); res.json({ success: true }); }
  catch (error) { if (error instanceof z.ZodError) return fail(res, 400, 'Choose a valid state.'); next(error); }
});

aiRouter.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) return fail(res, error.code === 'LIMIT_FILE_SIZE' ? 413 : 400, error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : 'Upload one image at a time.');
  if (error instanceof z.ZodError) return fail(res, 400, 'Please check the submitted information and try again.');
  return fail(res, error.status || 500, error.status ? error.message : 'Unable to complete the request right now. Please try again.');
});
