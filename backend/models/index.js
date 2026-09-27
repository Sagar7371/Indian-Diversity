import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;
const profileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true, index: true },
  exploredStates: [String], exploredFestivals: [String], exploredCategories: [String], favoriteCategories: [String],
  interests: [String], quizPerformance: { type: Map, of: Number, default: {} }, culturalJourney: [{ type: Schema.Types.Mixed }],
  lastActiveAt: Date
}, { timestamps: true });

export const User = models.User || model('User', new Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true }, role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true }));

export const State = models.State || model('State', new Schema({ name: { type: String, unique: true }, region: String, languages: [String], food: [String], festivals: [String], dances: [String], traditions: [String], sources: [String] }));
export const Festival = models.Festival || model('Festival', new Schema({ slug: { type: String, unique: true }, name: String, dates: [{ year: Number, startDate: String, endDate: String }], states: [String], regions: [String], category: String, tags: [String], summary: String, significance: String, sources: [Schema.Types.Mixed] }));
export const Food = models.Food || model('Food', new Schema({ name: { type: String, index: true }, regions: [String], description: String, sources: [String] }));
export const Dance = models.Dance || model('Dance', new Schema({ name: { type: String, index: true }, regions: [String], description: String, sources: [String] }));
export const CulturalItem = models.CulturalItem || model('CulturalItem', new Schema({ name: { type: String, index: true }, type: String, regions: [String], category: String, summary: String, sources: [String], verified: { type: Boolean, default: false } }));
export const UserCulturalProfile = models.UserCulturalProfile || model('UserCulturalProfile', profileSchema);
export const AIConversation = models.AIConversation || model('AIConversation', new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true }, title: { type: String, maxlength: 100 }
}, { timestamps: true }));
export const AIMessage = models.AIMessage || model('AIMessage', new Schema({ conversationId: { type: Schema.Types.ObjectId, ref: 'AIConversation', index: true }, role: { type: String, enum: ['user','assistant'], required: true }, content: { type: String, required: true, maxlength: 12000 }, createdAt: { type: Date, default: Date.now } }));
export const Quiz = models.Quiz || model('Quiz', new Schema({ sessionId: { type: String, unique: true, index: true }, topic: String, difficulty: String, questions: [{ question: String, options: [String], correctAnswer: String, explanation: String }], expiresAt: { type: Date, expires: 0 } }, { timestamps: true }));
export const QuizAttempt = models.QuizAttempt || model('QuizAttempt', new Schema({ userId: Schema.Types.ObjectId, topic: String, difficulty: String, score: Number, total: Number, answers: [String] }, { timestamps: true }));
export const CulturalJourney = models.CulturalJourney || model('CulturalJourney', new Schema({ userId: Schema.Types.ObjectId, title: String, goals: [String], steps: [{ type: Schema.Types.Mixed }], completed: { type: Boolean, default: false } }, { timestamps: true }));
export const Favorite = models.Favorite || model('Favorite', new Schema({ userId: Schema.Types.ObjectId, itemType: String, itemId: String }, { timestamps: true }));
