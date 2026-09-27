import { states } from '../stateData.js';
import { festivalRecords } from '../festivals/festivalData.js';
import { foodDetails, normalizeCultureName } from './culturalLookup.js';

const fields = {
  food:['Food', 'food'], festival:['Festivals', 'festival'], dance:['Dance', 'dance'], art:['Art and craft', 'art'], heritage:['Heritage', 'heritage'], languages:['Languages', 'languages']
};

function findCulture(name) {
  const value = normalizeCultureName(name);
  const state = states.find((item) => normalizeCultureName(item.name) === value);
  if (state) return { name:state.name, kind:'State', details:Object.entries(fields).map(([key,[label,field]]) => `${label}: ${state[field]}`).join('\n') };
  const festival = festivalRecords.find((item) => normalizeCultureName(item.name) === value || normalizeCultureName(item.id.replace(/-/g,' ')) === value);
  if (festival) return { name:festival.name, kind:'Festival', details:[festival.shortDescription || festival.description, festival.significance, festival.states?.length ? `Observed in: ${festival.states.join(', ')}` : ''].filter(Boolean).join('\n\n') };
  const food = foodDetails.find((item) => normalizeCultureName(item.name) === value || normalizeCultureName(item.id.replace(/-/g,' ')) === value);
  if (food) return { name:food.name, kind:'Food', details:`Region: ${food.region}\n${food.description}\n${food.background}\nIngredients: ${food.ingredients}` };
  const regionalArt = states.find((item) => normalizeCultureName(item.art).includes(value) && value.length > 3);
  return regionalArt ? { name:regionalArt.art, kind:'Art and craft', details:`Associated with ${regionalArt.name}. ${regionalArt.tradition}` } : null;
}

export function compareOfflineCultures(first, second) {
  const left = findCulture(first);
  const right = findCulture(second);
  if (!left || !right) return `I couldn’t find ${!left ? `“${first}”` : `“${second}”`} in the local culture guide. Try a state name, listed festival, or regional food.`;
  return `${left.name} · ${left.kind}\n${left.details}\n\n${right.name} · ${right.kind}\n${right.details}\n\nThese are brief guide entries; customs and recipes can vary between communities.`;
}

const quizCategories = [
  { key:'food', label:'food tradition', field:'food', type:'food' },
  { key:'festival', label:'festival', field:'festival', type:'festival' },
  { key:'dance', label:'dance', field:'dance', type:'dance' },
  { key:'art', label:'art or craft', field:'art', type:'art' },
  { key:'heritage', label:'heritage site', field:'heritage', type:'heritage' }
];

export function createOfflineQuiz(topic, count, difficulty) {
  const state = states.find((item) => normalizeCultureName(item.name) === normalizeCultureName(topic));
  const normalizedTopic = normalizeCultureName(topic);
  const category = normalizedTopic.includes('food') ? quizCategories[0]
    : normalizedTopic.includes('festival') ? quizCategories[1]
      : normalizedTopic.includes('dance') ? quizCategories[2]
        : normalizedTopic.includes('clothing') || normalizedTopic.includes('language') ? null
          : normalizedTopic.includes('architecture') || normalizedTopic.includes('history') ? quizCategories[4] : null;
  const selectedStates = state ? [state, ...states.filter((item) => item.name !== state.name)] : states;
  const questions = Array.from({ length:count }, (_, index) => {
    if (state) {
      const item = quizCategories[index % quizCategories.length];
      const answer = state[item.field];
      const distractors = [...new Set(states.filter((candidate) => candidate.name !== state.name).map((candidate) => candidate[item.field]).filter((value) => value !== answer))].slice(index % 3, (index % 3) + 3);
      const options = [answer, ...distractors].slice(0,4);
      if (options.length < 4) options.push(...states.map((candidate) => candidate[item.field]).filter((value) => !options.includes(value)).slice(0, 4 - options.length));
      return { question:`Which ${item.label} is listed for ${state.name}?`, correctAnswer:answer, options, explanation:`The cultural guide lists ${answer} for ${state.name}.` };
    }
    const item = category || quizCategories[index % quizCategories.length];
    const answerState = selectedStates[(index * 5) % selectedStates.length];
    const answer = answerState.name;
    const options = [answer, ...states.filter((candidate) => candidate.name !== answer).map((candidate) => candidate.name).slice(index % 4, (index % 4) + 3)];
    return { question:`Which state is associated with ${answerState[item.field]}?`, correctAnswer:answer, options, explanation:`The guide lists ${answerState[item.field]} for ${answerState.name}.` };
  });
  return { quizId:`local-${Date.now()}`, topic, difficulty, local:true, questions };
}

export function scoreOfflineQuiz(quiz, answers) {
  let score = 0;
  const questions = quiz.questions.map((question, index) => {
    const userAnswer = answers[index] || '';
    const correct = userAnswer === question.correctAnswer;
    if (correct) score += 1;
    return { ...question, userAnswer, correct, explanation:question.explanation };
  });
  const nextDifficulty = quiz.difficulty === 'easy' ? 'medium' : quiz.difficulty === 'medium' ? 'hard' : 'hard';
  return { questions, score, nextDifficulty };
}

export function createOfflineJourney(interests = '') {
  const text = normalizeCultureName(interests);
  const preferred = states.find((item) => text.includes(normalizeCultureName(item.name)));
  const regionHints = [
    ['north east', 'North-East India'], ['northeast', 'North-East India'], ['south', 'South India'], ['east', 'East India'], ['west', 'West India'], ['himalaya', 'Himalayan India'], ['north', 'North India'], ['central', 'Central India']
  ];
  const preferredRegion = regionHints.find(([hint]) => text.includes(hint))?.[1];
  const selected = [preferred, ...states.filter((item) => item !== preferred && (preferredRegion ? item.region === preferredRegion : true))].filter(Boolean);
  const unique = [...new Map(selected.map((item) => [item.name, item])).values()];
  const ordered = [...unique.slice(0,5)];
  if (ordered.length < 5) ordered.push(...states.filter((item) => !ordered.some((chosen) => chosen.name === item.name)).slice(0, 5 - ordered.length));
  const category = text.includes('food') || text.includes('cook') ? ['Cuisine', 'Festivals', 'Dance and music', 'Arts and crafts', 'Heritage']
    : text.includes('festival') ? ['Festivals', 'Cuisine', 'Arts and crafts', 'Dance and music', 'Heritage']
      : text.includes('art') || text.includes('craft') ? ['Arts and crafts', 'Heritage', 'Festivals', 'Cuisine', 'Dance and music']
        : ['Heritage', 'Cuisine', 'Festivals', 'Dance and music', 'Arts and crafts'];
  return ordered.map((item, index) => ({
    state:item.name,
    category:category[index],
    title:category[index] === 'Cuisine' ? `Taste ${item.name}` : category[index] === 'Festivals' ? `Explore ${item.name} festivals` : category[index] === 'Dance and music' ? `Discover ${item.name} performing arts` : category[index] === 'Arts and crafts' ? `Meet ${item.name} artisans` : `Explore ${item.name} heritage`,
    reason:`${item.region}. Discover ${item.food}, ${item.festival}, and ${item.heritage}.`
  }));
}

export function answerOfflineQuestion(message) {
  const text = normalizeCultureName(message);
  if (/how many states/.test(text)) return 'India has 28 states and 8 Union Territories.';
  if (text.includes('bhojpuri')) return 'Bhojpuri is an Indo-Aryan language spoken mainly in western Bihar and eastern Uttar Pradesh, and by diaspora communities. It has rich folk-song, theatre and film traditions. Language use and identity vary across communities.';
  if (text.includes('union territor')) return 'India has 8 Union Territories. India also has 28 states.';
  const culture = states.find((item) => text.includes(normalizeCultureName(item.name)));
  if (culture && /(food|festival|dance|language|art|heritage|culture|tradition|tell|about)/.test(text)) {
    return `${culture.name} · ${culture.region}\n\nLanguages: ${culture.languages}\nFood: ${culture.food}\nFestivals: ${culture.festival}\nDance: ${culture.dance}\nArt: ${culture.art}\nHeritage: ${culture.heritage}\n\n${culture.tradition}.`;
  }
  return '';
}
