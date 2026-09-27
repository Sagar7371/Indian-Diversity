import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bot, Camera, Check, Compass, Copy, House, Languages, LoaderCircle, LogIn, MessageCircle, Mic, Send, Sparkles, Trophy, Trash2, X } from 'lucide-react';
import './bharatAI.css';
import { findDirectCultureTarget, foodDetails, normalizeCultureName } from './culturalLookup.js';
import { festivalRecords } from '../festivals/festivalData.js';
import { states } from '../stateData.js';
import { answerOfflineQuestion, compareOfflineCultures, createOfflineJourney, createOfflineQuiz, scoreOfflineQuiz } from './offlineCulture.js';

const apiBase = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/$/, '');
const starterPrompts = ['Explore Rajasthan', 'Famous Indian festivals', 'Traditional Indian food', 'Tell me about folk dances', 'Compare two cultures', 'Plan a cultural trip'];
const routes = [
  ['/bharat-ai/chat','Ask Bharat AI',MessageCircle], ['/bharat-ai/image','Identify an image',Camera], ['/bharat-ai/quiz','Generate a quiz',Trophy], ['/bharat-ai/explain','Explain / translate',Languages], ['/bharat-ai/journey','My culture journey',Compass], ['/bharat-ai/compare','Compare cultures',ArrowRight], ['/bharat-ai/story','Tell me a story',Sparkles], ['/bharat-ai/recommendations','For you',Bot]
];

async function request(path, options = {}) {
  const token = localStorage.getItem('bharat-ai-token');
  const headers = { ...(options.body instanceof FormData ? {} : { 'Content-Type':'application/json' }), ...(token ? { Authorization:`Bearer ${token}` } : {}), ...options.headers };
  let response;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    try { response = await fetch(`${apiBase}/api/ai${path}`, { ...options, headers, signal: controller.signal }); }
    finally { clearTimeout(timeout); }
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Bharat AI is taking longer than expected. Please retry.');
    throw new Error('Bharat AI server se connection nahi ho raha. Ek terminal mein `npm run server` chalayein, phir retry karein.');
  }
  if (response.status === 204) return {};
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to connect to Bharat AI right now. Please try again.');
  return data;
}

function Result({ value }) { return value ? <div className="bharatResult" aria-live="polite">{value}</div> : null; }
function ErrorNotice({ error, retry }) { return error ? <div className="bharatError" role="alert"><span>{error}</span>{retry && <button type="button" onClick={retry}>Retry</button>}</div> : null; }

function directCultureReply(target) {
  if (!target) return '';
  if (target.type === 'state') {
    const state = states.find((item) => normalizeCultureName(item.name) === normalizeCultureName(target.name));
    if (!state) return '';
    return { content:`${state.name} · ${state.region}\n\nLanguages: ${state.languages}\nFood: ${state.food}\nFestivals: ${state.festival}\nDance: ${state.dance}\nArt and craft: ${state.art}\nHeritage: ${state.heritage}\n\n${state.tradition}.` };
  }
  if (target.type === 'festival') {
    const festival = festivalRecords.find((item) => item.id === target.id);
    if (!festival) return '';
    const details = [festival.description || festival.shortDescription, festival.significance && `Why it matters: ${festival.significance}`, festival.traditions?.length && `Traditions: ${festival.traditions.join('; ')}`, festival.traditionalFoods?.length && `Foods: ${festival.traditionalFoods.join(', ')}`, festival.states?.length && `Observed in: ${festival.states.join(', ')}`].filter(Boolean);
    return { content:`${festival.name}\n\n${details.join('\n\n')}` };
  }
  if (target.type === 'food') {
    const food = foodDetails.find((item) => item.id === target.id);
    if (!food) return '';
    return { content:`${food.name} · ${food.region}\n\n${food.description}\n\nRegional context: ${food.background}\n\nIngredients and preparation: ${food.ingredients}\n\nFood traditions and recipes vary by region, community and household.`, imageUrl:food.imageUrl, imageCredit:food.imageCredit };
  }
  return '';
}

function googleSearchRequest(message, previousMessages = []) {
  const type = /\b(image|images|photo|photos|picture|pictures|visual)\b/i.test(message) ? 'image' : 'web';
  const genericFollowUp = /\b(another|more|one more|different)\b/i.test(message) && type === 'image';
  const previous = genericFollowUp
    ? [...previousMessages].reverse().find((item) => item.role === 'user' && !/^\s*(give me )?(another|more|one more|different)\s+(image|photo|picture)s?\s*$/i.test(item.content))?.content || ''
    : '';
  const source = previous || message;
  const query = source
    .replace(/\b(please|can you|could you|i want|give me|show me|find|search|google|web results|search results|image|images|photo|photos|picture|pictures|visual|of|for|about|another|more|one more|different)\b/gi, ' ')
    .replace(/\s+/g, ' ').trim();
  return { query:query || source.trim(), type };
}

function localChatReply(message) {
  const text = normalizeCultureName(message);
  if (/^(hi|hello|hey|namaste|namaskar|good morning|good afternoon|good evening)$/.test(text)) {
    return 'Namaste! I’m Bharat AI, your guide to India’s states, festivals, food and traditions. Ask me about a place or dish, or request a Google web/image search.';
  }
  if (/^(thanks|thank you|shukriya|dhanyavaad)$/.test(text)) return 'You’re welcome! What would you like to explore next?';
  if (/^(help|what can you do|what do you do)$/.test(text)) return 'I can share details about Indian states, festivals and regional foods, and help search Google for web pages or images. Try “Bihar”, “Onam”, or “image of Bodh Gaya”.';
  return 'I can still help with local details for Indian states, festivals and regional foods, plus Google search links. The live AI answer service is not configured yet, so try a specific place, festival, dish, or ask for a Google search.';
}

function googleResultsUrl(query, type) {
  return `https://www.google.com/search?${type === 'image' ? 'tbm=isch&' : ''}q=${encodeURIComponent(query)}`;
}

export default function BharatAIPage({ embedded = false, initialTool = 'chat', onClose }) {
  const location = useLocation(); const navigate = useNavigate(); const tool = location.pathname.split('/').filter(Boolean)[1] || 'chat';
  const [embeddedPath, setEmbeddedPath] = useState(`/bharat-ai/${initialTool}`);
  const currentPath = embedded ? embeddedPath : location.pathname;
  const currentTool = embedded ? (currentPath.split('/').filter(Boolean)[1] || 'chat') : tool;
  const aiNavigate = (path) => embedded ? setEmbeddedPath(path) : navigate(path);
  const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [result, setResult] = useState(null);
  const [messages, setMessages] = useState(() => { try { return JSON.parse(localStorage.getItem('bharat-ai-guest-chat') || '[]'); } catch { return []; } });
  const [conversationId, setConversationId] = useState(null); const [draft, setDraft] = useState(''); const [token, setToken] = useState(() => localStorage.getItem('bharat-ai-token') || '');
  const [failedChat, setFailedChat] = useState('');
  const [activeMessageMenu, setActiveMessageMenu] = useState(null); const [copiedMessage, setCopiedMessage] = useState(null);
  const [recentConversations, setRecentConversations] = useState([]); const [showRecent, setShowRecent] = useState(false);
  const [authOpen, setAuthOpen] = useState(false); const [authMode, setAuthMode] = useState('login'); const [authForm, setAuthForm] = useState({ name:'',email:'',password:'' }); const [authError, setAuthError] = useState('');
  const [image, setImage] = useState(null); const [imagePreview, setImagePreview] = useState(''); const [quiz, setQuiz] = useState(null); const [answers, setAnswers] = useState({}); const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null); const [nextDifficulty, setNextDifficulty] = useState('');
  const [journeySteps, setJourneySteps] = useState([]); const [journeyNext, setJourneyNext] = useState('');
  const bottomRef = useRef(null); const fileRef = useRef(null); const workspaceRef = useRef(null);
  useEffect(() => { localStorage.setItem('bharat-ai-guest-chat', JSON.stringify(messages.slice(-30))); const list = bottomRef.current?.parentElement; if (list) list.scrollTo({ top:list.scrollHeight, behavior:'smooth' }); }, [messages]);
  useEffect(() => { setError(''); setResult(null); if (embedded && workspaceRef.current) workspaceRef.current.scrollTop = 0; }, [currentTool, embeddedPath, embedded]);

  const run = async (work) => { setLoading(true); setError(''); setResult(null); try { return await work(); } catch (e) { setError(e.message || 'Unable to connect to Bharat AI right now. Please try again.'); return null; } finally { setLoading(false); } };
  const searchGoogle = async (message, history = messages) => {
    const search = googleSearchRequest(message, history);
    const response = await run(() => request('/search', { method:'POST', body:JSON.stringify(search) }));
    if (!response) {
      const target = findDirectCultureTarget(search.query, festivalRecords);
      const local = search.type === 'image' ? directCultureReply(target) : null;
      setError(''); setFailedChat('');
      setMessages((old) => [...old, { role:'assistant', content:local?.content || `I couldn’t load results inside chat. Open Google ${search.type === 'image' ? 'Images' : 'Search'} for “${search.query}” to see the latest results.`, ...(local?.imageUrl ? { imageUrl:local.imageUrl, imageCredit:local.imageCredit } : {}), googleUrl:googleResultsUrl(search.query, search.type), searchType:search.type, time:new Date().toISOString() }]);
      return;
    }
    setFailedChat('');
    const kind = search.type === 'image' ? 'Google Images' : 'Google Search';
    const local = !response.configured && search.type === 'image' ? directCultureReply(findDirectCultureTarget(search.query, festivalRecords)) : null;
    const content = response.configured
      ? (response.results.length ? `Here are a few ${kind} results for “${response.query}”. Open a result for more information.` : `Google did not return results for “${response.query}”. Try a different search.`)
      : `I found a${search.type === 'image' ? 'n image' : ' search'} for “${response.query}”. Open Google for more results.`;
    setError('');
    setMessages((old) => [...old, { role:'assistant', content:local?.content || content, ...(local?.imageUrl ? { imageUrl:local.imageUrl, imageCredit:local.imageCredit } : {}), googleUrl:response.googleUrl, searchType:search.type, searchResults:response.results, time:new Date().toISOString() }]);
  };
  const sendChat = async (text = draft) => {
    const message = text.trim(); if (loading) return; if (!message) { setError(''); setFailedChat(''); return; }
    const greeting = /^(hi|hello|hey|namaste|namaskar|good morning|good afternoon|good evening|thanks|thank you|shukriya|dhanyavaad|help|what can you do|what do you do)[!.? ]*$/i.test(message);
    if (greeting) {
      setDraft(''); setError(''); setFailedChat('');
      setMessages((old) => [...old, { role:'user', content:message, time:new Date().toISOString() }, { role:'assistant', content:localChatReply(message), time:new Date().toISOString() }]);
      return;
    }
    const wantsSearch = /\b(image|images|photo|photos|picture|pictures|visual|search results|google search|search for|look up online|find online)\b/i.test(message);
    if (wantsSearch) {
      setDraft(''); setError(''); setFailedChat('');
      const history = messages;
      setMessages((old) => [...old, { role:'user', content:message, time:new Date().toISOString() }]);
      await searchGoogle(message, history);
      return;
    }
    const directTarget = findDirectCultureTarget(message, festivalRecords);
    const directReply = directCultureReply(directTarget);
    const clientMessageId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setDraft(''); setMessages((old) => [...old, { role:'user', content:message, clientMessageId, time:new Date().toISOString() }]);
    if (directReply?.content) {
      setFailedChat(''); setError('');
      setMessages((old) => [...old, { role:'assistant', ...directReply, time:new Date().toISOString() }]);
      return;
    }
    const offlineAnswer = answerOfflineQuestion(message);
    if (offlineAnswer) {
      setFailedChat(''); setError('');
      setMessages((old) => [...old, { role:'assistant', content:offlineAnswer, time:new Date().toISOString() }]);
      return;
    }
    const response = await run(() => request('/chat', { method:'POST', body:JSON.stringify({ message, ...(conversationId ? { conversationId } : {}) }) }));
    if (response) { setFailedChat(''); if (response.conversationId) setConversationId(response.conversationId); setMessages((old) => [...old.map((item)=>item.clientMessageId===clientMessageId?{...item,serverMessageId:response.userMessageId}:item), { role:'assistant', content:response.reply, related:response.related || [], serverMessageId:response.assistantMessageId, time:new Date().toISOString() }]); }
    else {
      setFailedChat(''); setError('');
      setMessages((old) => [...old, { role:'assistant', content:localChatReply(message), time:new Date().toISOString() }]);
    }
  };
  const retryChat = async () => {
    if (!failedChat || loading) return;
    const greeting = /^(hi|hello|hey|namaste|namaskar|good morning|good afternoon|good evening|thanks|thank you|shukriya|dhanyavaad|help|what can you do|what do you do)[!.? ]*$/i.test(failedChat);
    if (greeting) { setError(''); setFailedChat(''); setMessages((old) => [...old, { role:'assistant', content:localChatReply(failedChat), time:new Date().toISOString() }]); return; }
    if (/\b(image|images|photo|photos|picture|pictures|visual|search results|google search|search for|look up online|find online)\b/i.test(failedChat)) {
      await searchGoogle(failedChat);
      return;
    }
    const directReply = directCultureReply(findDirectCultureTarget(failedChat, festivalRecords));
    if (directReply?.content) {
      setError(''); setFailedChat('');
      setMessages((old) => [...old, { role:'assistant', ...directReply, time:new Date().toISOString() }]);
      return;
    }
    const response=await run(()=>request('/chat',{method:'POST',body:JSON.stringify({message:failedChat,...(conversationId?{conversationId}:{})})}));
    if(response){setFailedChat('');if(response.conversationId)setConversationId(response.conversationId);setMessages(old=>{const latestUserIndex=old.map((item)=>item.role).lastIndexOf('user');const updated=old.map((item,index)=>index===latestUserIndex&&item.content===failedChat?{...item,serverMessageId:response.userMessageId}:item);return [...updated,{role:'assistant',content:response.reply,related:response.related||[],serverMessageId:response.assistantMessageId,time:new Date().toISOString()}];});}
    else { setError(''); setFailedChat(''); setMessages((old)=>[...old,{role:'assistant',content:localChatReply(failedChat),time:new Date().toISOString()}]); }
  };
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Voice input is not supported in this browser. You can type your question instead.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (event) => { setDraft((current) => `${current}${current ? ' ' : ''}${event.results[0][0].transcript}`); setError(''); };
    recognition.onerror = () => setError('Voice input could not hear you. Please try again or type your question.');
    recognition.start();
  };
  const submitEmbeddedPrompt = (event) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || loading) return;
    aiNavigate('/bharat-ai/chat');
    sendChat(message);
  };
  const newChat = () => { setMessages([]); setConversationId(null); setFailedChat(''); localStorage.removeItem('bharat-ai-guest-chat'); setError(''); };
  const copyMessage = async (content, index) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(content || '');
      else { const field=document.createElement('textarea');field.value=content||'';document.body.appendChild(field);field.select();document.execCommand('copy');field.remove(); }
      setCopiedMessage(index); setTimeout(()=>setCopiedMessage(null),1600);
    } catch { setError('Could not copy this message. Please select and copy it manually.'); }
  };
  const deleteMessage = async (message, index) => {
    if (message.serverMessageId && conversationId && token) {
      try { await request(`/conversations/${conversationId}/messages/${message.serverMessageId}`,{method:'DELETE'}); }
      catch (e) { setError(e.message || 'Could not delete this message.'); return; }
    }
    setMessages((current)=>current.filter((_,messageIndex)=>messageIndex!==index));
    setActiveMessageMenu(null);setCopiedMessage(null);setError('');
  };
  const loadRecent = async () => { setShowRecent(value=>!value); if(!showRecent){const data=await run(()=>request('/conversations'));if(data)setRecentConversations(data.conversations||[]);} };
  const openConversation = async (id) => { const data=await run(()=>request(`/conversations/${id}`));if(data){setConversationId(id);setMessages((data.conversation.messages||[]).map(message=>({...message,serverMessageId:message._id,time:message.createdAt})));setShowRecent(false);} };
  const deleteConversation = async (id) => { try { await request(`/conversations/${id}`,{method:'DELETE'});setRecentConversations(rows=>rows.filter(row=>row._id!==id));if(conversationId===id)newChat(); } catch(e) {setError(e.message);} };
  const submitAuth = async (event) => { event.preventDefault(); setAuthError(''); try { const data = await request(`/auth/${authMode === 'register' ? 'register' : 'login'}`, { method:'POST', body:JSON.stringify(authForm) }); localStorage.setItem('bharat-ai-token',data.token); setToken(data.token); setAuthOpen(false); setAuthForm({ name:'',email:'',password:'' }); } catch (e) { setAuthError(e.message); } };

  const generateQuiz = async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const generated=createOfflineQuiz(form.get('topic'),Number(form.get('count')),form.get('difficulty')); setQuiz(generated);setAnswers({});setQuizSubmitted(false);setQuizScore(null);setNextDifficulty('');setError(''); };
  const submitQuiz = async () => {
    if (!quiz) return;
    if (quiz.local) {
      const score = scoreOfflineQuiz(quiz, answers);
      setQuiz((current)=>({...current,questions:score.questions}));setQuizScore(score.score);setNextDifficulty(score.nextDifficulty);setQuizSubmitted(true);return;
    }
    const data=await run(()=>request('/quiz/submit',{method:'POST',body:JSON.stringify({quizId:quiz.quizId,answers:quiz.questions.map((_,i)=>answers[i]||'')})}));if(data){setQuiz(current=>({...current,questions:current.questions.map((question,index)=>({...question,...data.results[index]}))}));setQuizScore(data.score);setNextDifficulty(data.nextDifficulty);setQuizSubmitted(true);}
  };
  const analyzeImage = async (event) => { event.preventDefault(); if(!image) return; const form=new FormData(); form.append('image',image); const data=await run(()=>request('/analyze-image',{method:'POST',body:form})); if(data)setResult(data.identification); };
  const createJourney = async (event) => { event.preventDefault(); const interests=new FormData(event.currentTarget).get('interests');setJourneySteps(createOfflineJourney(interests));setJourneyNext('');setError(''); };
  const markExplored = async (step) => { if(token) { try { await request('/journey/explore',{method:'POST',body:JSON.stringify({state:step.state,category:step.category})}); } catch { /* Keep navigation available if activity sync is unavailable. */ } } else { try { const recent=JSON.parse(localStorage.getItem('bharat-ai-explored-states')||'[]'); localStorage.setItem('bharat-ai-explored-states',JSON.stringify([...new Set([...recent,step.state])])); } catch { /* Browser storage can be disabled. */ } } navigate(`/state/${encodeURIComponent(step.state)}`); };
  const getNextJourneyStep = async () => { const next=states.find((item)=>!journeySteps.some((step)=>step.state===item.name));setJourneyNext(next?`Next, explore ${next.name}: ${next.tradition}. Try ${next.food} and learn about ${next.festival}.`:'You have explored every state in this suggested path. Start a new journey with a different interest.');setError(''); };
  const compareCultures = (event) => { event.preventDefault();const form=new FormData(event.currentTarget);setResult(compareOfflineCultures(form.get('first'),form.get('second')));setError(''); };
  const textAction = (path, body, key) => async (event) => { event.preventDefault(); const form=new FormData(event.currentTarget); const payload=Object.fromEntries(form.entries()); const data=await run(()=>request(path,{method:'POST',body:JSON.stringify(payload)})); if(data)setResult(data[key]); };

  return <div className={`bharatPage${embedded ? ' bharatEmbedded' : ''}`}>
    {!embedded && <header className="bharatNav"><Link to="/" className="bharatBrand"><span>✦</span> Indian Diversity <b>×</b> Bharat AI</Link><div className="bharatNavRight"><Link to="/" className="bharatBack"><ArrowLeft size={16}/> Back to explorer</Link>{token ? <button className="bharatAuthBtn" onClick={()=>{localStorage.removeItem('bharat-ai-token');setToken('');}}>Sign out</button> : <button className="bharatAuthBtn" onClick={()=>{setAuthOpen(true);setAuthMode('login');}}><LogIn size={16}/> Sign in</button>}</div></header>}
    <main className="bharatMain"><div className="bharatHero"><span className="bharatEyebrow"><Sparkles size={15}/> CULTURAL INTELLIGENCE</span><h1>Bharat AI <span>🇮🇳</span></h1><p>Your thoughtful guide to India's many cultures. Ask, discover, compare and learn.</p></div>
      <nav className="bharatTools" aria-label="Bharat AI tools">
        {embedded ? <>
          <button type="button" title="Home" aria-label="Home" className={currentTool==='home'?'active':''} onClick={()=>aiNavigate('/bharat-ai/home')}><House size={19}/><span>Home</span></button>
          <button type="button" title="Ask Bharat AI" aria-label="Ask Bharat AI" className={currentTool==='chat'?'active':''} onClick={()=>aiNavigate('/bharat-ai/chat')}><MessageCircle size={19}/><span>Ask Bharat AI</span></button>
          {routes.slice(1,2).map(([path,label,Icon])=><button key={path} type="button" title={label} aria-label={label} className={currentTool==='image'?'active':''} onClick={()=>aiNavigate(path)}><Icon size={19}/><span>{label}</span></button>)}
          {routes.slice(2,3).map(([path,label,Icon])=><button key={path} type="button" title={label} aria-label={label} className={currentTool==='quiz'?'active':''} onClick={()=>aiNavigate(path)}><Icon size={19}/><span>{label}</span></button>)}
          {[routes[3], routes[5], routes[4], routes[7]].map(([path,label,Icon])=><button key={path} type="button" title={label} aria-label={label} className={currentTool===path.split('/').pop()?'active':''} onClick={()=>aiNavigate(path)}><Icon size={19}/><span>{label}</span></button>)}
        </> : routes.map(([path,label,Icon])=><button key={path} title={label} aria-label={label} className={currentPath===path || (currentTool==='chat' && path==='/bharat-ai/chat')?'active':''} onClick={()=>aiNavigate(path)}><Icon size={17}/><span>{label}</span></button>)}
      </nav>
      <section className="bharatWorkspace" ref={workspaceRef}>
        {embedded && currentTool==='home' && <div className="bharatEmbeddedHome"><div className="bharatEmbeddedHomeGreeting"><div className="bharatHomeBot"><Bot size={23}/></div><h2>Namaste! 👋</h2><p>How can I help you today?</p></div><div className="bharatEmbeddedHomeActions"><button type="button" onClick={()=>aiNavigate('/bharat-ai/chat')}><span className="homeActionIcon orange">✦</span><span><strong>Ask a Question</strong><small>About India’s culture</small></span></button><button type="button" onClick={()=>aiNavigate('/bharat-ai/image')}><span className="homeActionIcon teal"><Camera size={19}/></span><span><strong>Upload an Image</strong><small>Identify Indian culture</small></span></button><button type="button" onClick={()=>aiNavigate('/bharat-ai/quiz')}><span className="homeActionIcon coral"><Trophy size={19}/></span><span><strong>Generate a Quiz</strong><small>Test your knowledge</small></span></button><button type="button" onClick={()=>aiNavigate('/bharat-ai/explain')}><span className="homeActionIcon purple"><Languages size={19}/></span><span><strong>Translate &amp; Explain</strong><small>In multiple languages</small></span></button></div></div>}
        {currentTool==='food' && <FoodDetailPage foodId={currentPath.split('/').filter(Boolean)[2]} aiNavigate={aiNavigate} />}
        {currentTool==='chat' && <div className="bharatChat"><div className="bharatPanelHead"><div><span className="bharatEyebrow">CULTURAL GUIDE</span><h2>Ask Bharat AI</h2></div><div className="bharatChatActions">{token&&<button type="button" className="bharatSecondary" onClick={loadRecent}>Recent chats</button>}<button type="button" className="bharatSecondary" onClick={newChat}><X size={15}/> New conversation</button></div></div>
          {showRecent&&<div className="bharatRecentList">{recentConversations.length?recentConversations.map(item=><div key={item._id}><button type="button" onClick={()=>openConversation(item._id)}>{item.title||'Cultural conversation'}<small>{new Date(item.updatedAt).toLocaleDateString()}</small></button><button type="button" aria-label="Delete conversation" onClick={()=>deleteConversation(item._id)}><Trash2 size={15}/></button></div>):<p>No saved conversations yet.</p>}</div>}
            {!messages.length ? (embedded ? <div className="bharatEmbeddedWelcome"><div className="bharatEmbeddedGreeting"><div className="bharatMessageBadge"><Bot size={18}/></div><div className="bharatEmbeddedGreetingBubble"><strong>Namaste! 🙏</strong><br/>I’m Bharat AI, your cultural guide. Ask me anything about India’s states, festivals, food, traditions and more.</div></div><div className="bharatEmbeddedActions"><button type="button" onClick={()=>sendChat('Tell me about Indian states and regions')}>🏛️ <span>Explore a State</span></button><button type="button" onClick={()=>sendChat('Tell me about famous Indian festivals')}>🪷 <span>Festivals</span></button><button type="button" onClick={()=>sendChat('Tell me about traditional Indian food')}>🍛 <span>Food &amp; Cuisine</span></button><button type="button" onClick={()=>sendChat('Tell me about Indian dance and music traditions')}>💃 <span>Dance &amp; Music</span></button><button type="button" onClick={()=>aiNavigate('/bharat-ai/journey')}>🗺️ <span>Plan a Cultural Trip</span></button><button type="button" onClick={()=>aiNavigate('/bharat-ai/compare')}>⚖️ <span>Compare Cultures</span></button></div></div> : <div className="bharatWelcome"><div className="bharatBotIcon"><Bot/></div><h3>What would you like to explore?</h3><p>Ask about a region, tradition, festival, food, art or journey. Type a state, food or festival name to see its details right here in chat.</p><div className="bharatPromptGrid">{starterPrompts.map((prompt)=><button key={prompt} type="button" onClick={()=>sendChat(prompt)}>{prompt}<ArrowRight size={14}/></button>)}</div></div>) : <div className="bharatMessages">{messages.map((message,index)=><article key={`${message.time}-${index}`} className={`bharatMessage ${message.role}`}><div className="bharatMessageBadge">{message.role==='assistant'?'✦':'You'}</div><div className="bharatMessageBody" onClick={(event)=>{if(event.target.closest('a,button'))return;setActiveMessageMenu((active)=>active===index?null:index);}} aria-expanded={activeMessageMenu===index}><p>{message.content}</p>{message.imageUrl&&<figure className="bharatChatImage"><img src={message.imageUrl} alt="Litti chokha, a traditional Bihari dish" loading="lazy"/><figcaption>Photo: <a href={message.imageCredit?.url} target="_blank" rel="noreferrer">{message.imageCredit?.label || 'Wikimedia Commons'}</a></figcaption></figure>}{message.searchResults?.length>0&&<div className={message.searchType==='image'?'bharatSearchImages':'bharatSearchResults'}>{message.searchResults.map((item,resultIndex)=><a className="bharatSearchCard" key={`${item.link}-${resultIndex}`} href={item.searchType==='image'?item.contextLink:item.link} target="_blank" rel="noreferrer">{message.searchType==='image'&&item.imageUrl&&<img src={item.imageUrl} alt={item.title} loading="lazy"/>}<strong>{item.title}</strong>{item.snippet&&<span>{item.snippet}</span>}<small>{item.source}</small></a>)}</div>}{message.googleUrl&&<a className="bharatGoogleMore" href={message.googleUrl} target="_blank" rel="noreferrer">More information on Google →</a>}{activeMessageMenu===index&&<div className="bharatMessageMenu" onClick={(event)=>event.stopPropagation()}><button type="button" onClick={()=>copyMessage(message.content,index)}><Copy size={14}/>{copiedMessage===index?'Copied':'Copy'}</button><button type="button" onClick={()=>deleteMessage(message,index)}><Trash2 size={14}/>Delete message</button></div>}<time>{new Date(message.time).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</time>{message.related?.length>0&&<div className="bharatRelated">Related: {message.related.map((item)=><button type="button" key={item} onClick={()=>sendChat(item)}>{item}</button>)}</div>}</div></article>)}{loading&&<div className="bharatTyping"><i/><i/><i/> Bharat AI is thinking</div>}<div ref={bottomRef}/></div>}
          <ErrorNotice error={error} retry={failedChat?retryChat:null}/><form className="bharatComposer" onSubmit={(e)=>{e.preventDefault();sendChat();}}><textarea value={draft} onChange={e=>{setDraft(e.target.value);setError('');setFailedChat('');}} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}}} placeholder="Ask about Indian culture…" maxLength={2000} rows={2}/><button className="bharatVoiceButton" type="button" onClick={startVoiceInput} aria-label="Use voice input"><Mic size={17}/></button><button className="bharatSendButton" disabled={loading||!draft.trim()} aria-label="Send message"><Send size={18}/></button></form><small className="bharatHint">Enter to send · Shift + Enter for a new line · Guest conversations stay on this device</small>
        </div>}

        {currentTool==='image' && <div className="bharatPanel"><div className="bharatPanelHead"><div><span className="bharatEyebrow">IMAGE UNDERSTANDING</span><h2>Identify this culture</h2></div></div><p className="bharatIntro">Upload a photo of a cultural object, textile, dish, dance, instrument or architecture. Results are possibilities, not definitive identifications.</p><form className="bharatForm" onSubmit={analyzeImage}><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const f=e.target.files?.[0];setImage(f||null);setImagePreview(f?URL.createObjectURL(f):'');}}/><small>JPG, PNG or WEBP · maximum 5 MB</small>{imagePreview&&<img className="bharatImagePreview" src={imagePreview} alt="Selected cultural image preview"/>}<button disabled={!image||loading}>{loading?<LoaderCircle className="spin"/>:<Camera size={17}/>} Analyze image</button></form><ErrorNotice error={error}/>{result&&<div className="bharatResult"><span className="bharatConfidence">{result.confidence} confidence</span><h3>{result.name}</h3><p><b>{result.category}</b> · {result.possibleRegions?.join(', ')}</p><p>{result.description}</p><p>{result.culturalSignificance}</p>{result.relatedStates?.length>0&&<p>Related states: {result.relatedStates.join(', ')}</p>}</div>}</div>}

        {currentTool==='quiz' && <div className="bharatPanel"><div className="bharatPanelHead"><div><span className="bharatEyebrow">LEARN BY PLAYING</span><h2>Generate a cultural quiz</h2></div></div><form className="bharatForm bharatQuizSetup" onSubmit={generateQuiz}><label>Topic<select name="topic">{['Rajasthan','Kerala','Indian Festivals','Indian Food','Folk Dances','Traditional Clothing','Indian Architecture','Languages','History'].map(x=><option key={x}>{x}</option>)}</select></label><label>Difficulty<select name="difficulty"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label><label>Questions<select name="count"><option>5</option><option>10</option><option>15</option></select></label><button disabled={loading}>{loading?<LoaderCircle className="spin"/>:<Sparkles size={17}/>} Generate quiz</button></form><ErrorNotice error={error}/>{quiz&&<div className="bharatQuiz">{quiz.questions.map((q,i)=><fieldset key={i}><legend><b>{i+1}.</b> {q.question}</legend>{q.options.map(option=><label key={option} className={quizSubmitted?(option===q.correctAnswer?'correct':answers[i]===option?'incorrect':''):''}><input type="radio" name={`q${i}`} checked={answers[i]===option} disabled={quizSubmitted} onChange={()=>setAnswers({...answers,[i]:option})}/>{option}{quizSubmitted&&option===q.correctAnswer&&<Check size={15}/>}</label>)}{quizSubmitted&&<p className="bharatExplanation">{q.explanation}</p>}</fieldset>)}{!quizSubmitted?<button className="bharatPrimary" disabled={Object.keys(answers).length!==quiz.questions.length||loading} onClick={submitQuiz}>{loading?'Scoring…':'Check answers'}</button>:<div className="bharatScore">You scored {quizScore} / {quiz.questions.length}. Next suggested difficulty: {nextDifficulty}. {quiz.local?'This offline score is shown on this device.':token?'Your score was saved.':'Sign in to save scores and track adaptive difficulty.'}</div>}</div>}</div>}

        {currentTool==='explain' && <div className="bharatPanel"><div className="bharatPanelHead"><div><span className="bharatEyebrow">CULTURAL EXPLAINER</span><h2>Explain this culture</h2></div></div><p className="bharatIntro">Get a culturally aware explanation in your chosen language. The goal is to preserve meaning, not translate word for word.</p><form className="bharatForm" onSubmit={textAction('/explain',{},'explanation')}><label>Content<textarea name="content" required maxLength={3000} placeholder="Paste a festival, custom, place or tradition…"/></label><div className="bharatInlineFields"><label>Language<select name="language">{['English','Hindi','Hinglish','Bengali','Tamil','Telugu','Marathi','Gujarati','Punjabi','Malayalam','Kannada'].map(x=><option key={x}>{x}</option>)}</select></label><label>Audience<input name="audience" defaultValue="general reader"/></label></div><button disabled={loading}>{loading?<LoaderCircle className="spin"/>:<Languages size={17}/>} Explain</button></form><ErrorNotice error={error}/><Result value={result}/></div>}

        {currentTool==='journey' && <div className="bharatPanel"><div className="bharatPanelHead"><div><span className="bharatEyebrow">YOUR CULTURAL MENTOR</span><h2>Plan a discovery journey</h2></div></div><p className="bharatIntro">Share what you enjoy or what you have explored. Bharat AI will suggest varied paths across regions and traditions.</p><form className="bharatForm" onSubmit={createJourney}><label>What would you like to explore?<textarea name="interests" required maxLength={500} placeholder="I enjoy folk music and want to learn about North-East India…"/></label><button disabled={loading}>{loading?<LoaderCircle className="spin"/>:<Compass size={17}/>} Create my journey</button></form><ErrorNotice error={error}/>{journeySteps.length>0&&<><div className="bharatJourneyGrid">{journeySteps.map((step,index)=><article key={`${step.state}-${index}`}><span>STEP {index+1} · {step.category}</span><h3>{step.title}</h3><p>{step.reason}</p><button onClick={()=>markExplored(step)}>Explore {step.state} <ArrowRight size={14}/></button></article>)}</div><button className="bharatSecondary bharatJourneyNext" type="button" disabled={loading} onClick={getNextJourneyStep}>Suggest my next discovery <ArrowRight size={15}/></button><Result value={journeyNext}/></>}</div>}

        {currentTool==='compare' && <div className="bharatPanel"><div className="bharatPanelHead"><div><span className="bharatEyebrow">SIDE BY SIDE</span><h2>Compare cultures</h2></div></div><p className="bharatIntro">Compare states, festivals, foods, dances or traditions. Bharat AI focuses on context, similarities and differences without ranking cultures.</p><form className="bharatForm bharatInlineFields" onSubmit={compareCultures}><label>First culture<input name="first" required placeholder="Punjab"/></label><label>Second culture<input name="second" required placeholder="Kerala"/></label><button type="submit"><ArrowRight size={17}/> Compare</button></form><Result value={result}/></div>}

        {currentTool==='story' && <div className="bharatPanel"><div className="bharatPanelHead"><div><span className="bharatEyebrow">IMAGINED CULTURAL SCENE</span><h2>Tell me the story</h2></div></div><p className="bharatIntro">Create a short story inspired by a cultural subject, with imagined details distinguished from cultural facts.</p><form className="bharatForm bharatInlineFields" onSubmit={textAction('/story',{},'story')}><label>Subject<input name="subject" required placeholder="A visit to a Pattachitra workshop"/></label><label>Format<select name="format"><option>short story</option><option>story for children</option><option>travel vignette</option></select></label><button disabled={loading}>{loading?<LoaderCircle className="spin"/>:<Sparkles size={17}/>} Create story</button></form><ErrorNotice error={error}/><Result value={result}/></div>}

        {currentTool==='recommendations' && <Recommendations run={run} token={token} embedded={embedded} onNavigateTool={aiNavigate}/ >}
      </section>
      <p className="bharatFootnote">Bharat AI uses an AI service and may be mistaken. Cultural practices vary across communities; verify details with reliable sources.</p>
    </main>
    {embedded && <form className="bharatEmbeddedDock" onSubmit={submitEmbeddedPrompt}><input type="text" aria-label="Ask Bharat AI" autoComplete="off" value={draft} onChange={(event)=>{setDraft(event.target.value);setError('');setFailedChat('');}} onKeyDown={(event)=>{if(event.key==='Enter'){event.preventDefault();submitEmbeddedPrompt(event);}}} maxLength={2000} placeholder="Ask about India’s culture…"/><button className="bharatVoiceButton" type="button" onClick={startVoiceInput} aria-label="Use voice input"><Mic size={17}/></button><button className="bharatSendButton" type="submit" disabled={loading||!draft.trim()} aria-label="Send message"><Send size={18}/></button></form>}
    {authOpen&&<div className="bharatOverlay" onClick={()=>setAuthOpen(false)}><section className="bharatAuthModal" onClick={e=>e.stopPropagation()}><button className="bharatClose" onClick={()=>setAuthOpen(false)} aria-label="Close"><X/></button><span className="bharatEyebrow">SAVE YOUR JOURNEY</span><h2>{authMode==='login'?'Sign in':'Create your account'}</h2><form className="bharatForm" onSubmit={submitAuth}>{authMode==='register'&&<label>Name<input required minLength="2" maxLength="80" value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})}/></label>}<label>Email<input required type="email" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})}/></label><label>Password<input required type="password" minLength={authMode==='register'?10:1} value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})}/></label><button>{authMode==='register'?'Create account':'Sign in'}</button></form>{authError&&<p className="bharatError">{authError}</p>}<button className="bharatSwitchAuth" onClick={()=>setAuthMode(authMode==='login'?'register':'login')}>{authMode==='login'?"Need an account? Register":"Already registered? Sign in"}</button></section></div>}
  </div>;
}

function Recommendations({ token, embedded = false, onNavigateTool }) {
  const [data,setData]=useState(null); const [error,setError]=useState(''); const navigate=useNavigate();
  const load=async()=>{setError('');try{const explored=JSON.parse(localStorage.getItem('bharat-ai-explored-states')||'[]');setData(await request(`/recommendations?explored=${encodeURIComponent(explored.join(','))}`));}catch(e){setError(e.message);}};
  const aiNavigate = onNavigateTool || navigate;
  const exploreState=async(name)=>{if(token){try{await request('/journey/explore',{method:'POST',body:JSON.stringify({state:name,category:'Recommendations'})});}catch{}}else{try{const explored=JSON.parse(localStorage.getItem('bharat-ai-explored-states')||'[]');localStorage.setItem('bharat-ai-explored-states',JSON.stringify([...new Set([...explored,name])]));}catch{}}navigate(`/state/${encodeURIComponent(name)}`);};
  useEffect(()=>{load();},[]);
  return <div className="bharatPanel"><div className="bharatPanelHead"><div><span className="bharatEyebrow">PERSONALIZED DISCOVERY</span><h2>Picked for you</h2></div><button className="bharatSecondary" onClick={load}>Refresh</button></div>{error&&<ErrorNotice error={error} retry={load}/ >}{data&&<><p className="bharatIntro">{data.reason}</p><div className="bharatRecommendationGrid">{data.states.map((name)=><article key={name}><span>State to explore</span><h3>{name}</h3><p>Discover local food, arts, festivals and traditions.</p><button onClick={()=>exploreState(name)}>Explore state <ArrowRight size={14}/></button></article>)}{data.festivals.map((item)=><article key={item.id}><span>{item.category}</span><h3>{item.name}</h3><p>{item.description}</p><Link to="/festivals">Explore festivals <ArrowRight size={14}/></Link></article>)}{[["Food",data.foods],["Dance",data.dances],["Places",data.places]].map(([title,items])=><article key={title}><span>Explore {title.toLowerCase()}</span><h3>{items[0]||title}</h3><p>{items.slice(1,4).join(' · ')||'Discover cultural traditions across India.'}</p><button onClick={()=>aiNavigate('/bharat-ai/chat')}>Ask about {title.toLowerCase()} <ArrowRight size={14}/></button></article>)}</div>{!token&&<p className="bharatHint">Sign in to save activity and improve recommendations over time.</p>}</>}</div>;
}

function FoodDetailPage({ foodId, aiNavigate: onNavigateTool }) {
  const navigate = useNavigate();
  const aiNavigate = onNavigateTool || navigate;
  const food = foodDetails.find((item) => item.id === decodeURIComponent(foodId || '') || normalizeCultureName(item.name) === normalizeCultureName(foodId?.replace(/-/g,' ')));
  if (!food) return <div className="bharatPanel"><h2>Food detail not found</h2><button className="bharatSecondary" onClick={()=>aiNavigate('/bharat-ai/chat')}>Back to Bharat AI chat</button></div>;
  return <article className="bharatFoodDetail"><button className="bharatSecondary" type="button" onClick={()=>aiNavigate('/bharat-ai/chat')}><ArrowLeft size={15}/> Bharat AI chat</button><span className="bharatEyebrow">FOOD TRADITION · {food.region.toUpperCase()}</span><h2>{food.name}</h2><p className="bharatFoodLead">{food.description}</p><section><h3>Regional context</h3><p>{food.background}</p></section><section><h3>About this food</h3><p>{food.ingredients}</p></section><p className="bharatFoodNote">Food traditions and recipes vary by region, community and household.</p></article>;
}
