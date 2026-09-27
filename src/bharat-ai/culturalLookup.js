export const indianStateNames = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'
];

const featuredFoodDetails = [
  { id:'chole-bhature', name:'Chole Bhature', region:'North India', description:'A beloved North Indian combination known for its rich taste and festive appeal.', background:'Strongly linked with Punjabi and Delhi food culture.', ingredients:'Chickpeas simmered with spices, served with deep-fried bhature.' },
  { id:'dosa-idli', name:'Dosa & Idli', region:'South India', description:'Popular breakfast foods with a deep connection to regional culinary traditions and fermentation practices.', background:'A defining part of Karnataka, Tamil Nadu and Kerala cuisine.', ingredients:'Fermented rice and lentil batter prepared as steamed idli or crisp dosa.' },
  { id:'macher-jhol', name:'Macher Jhol', region:'East India', description:'A classic fish curry strongly associated with Bengali food traditions.', background:'Known for its use of mustard, spices and local river fish.', ingredients:'Fish simmered in a light, spiced gravy; recipes vary by household and region.' },
  { id:'dhokla', name:'Dhokla', region:'West India', description:'A fluffy vegetarian snack celebrated for its lightness and taste.', background:'Closely associated with Gujarati cuisine and street food culture.', ingredients:'A steamed, savory fermented batter, often finished with a tempered spice mixture.' },
  { id:'momos', name:'Momos', region:'North-East India', description:'A much-loved regional snack, often served with spicy chutneys and local flavor variations.', background:'A common food tradition across Himalayan and North-Eastern communities.', ingredients:'Dough dumplings with varied vegetable or meat fillings, served with chutney.' },
  { id:'thepla-undhiyu', name:'Thepla & Undhiyu', region:'Gujarat', description:'Recognized for their festive and family-centered food culture.', background:'Often associated with travel, craft, and seasonal celebrations.', ingredients:'Spiced flatbread and a seasonal mixed-vegetable preparation; local recipes differ.' }
];

const regionalFoodExamples = [
  ['Pulihora','Andhra Pradesh'],['Gongura','Andhra Pradesh'],['Thukpa','Arunachal Pradesh'],['Khar','Assam'],['Masor Tenga','Assam'],['Litti Chokha','Bihar'],['Fara','Chhattisgarh'],['Chila','Chhattisgarh'],['Bebinca','Goa'],['Fish Curry Rice','Goa'],['Bajra Roti','Haryana'],['Churma','Haryana'],['Dham','Himachal Pradesh'],['Siddu','Himachal Pradesh'],['Rogan Josh','Jammu and Kashmir'],['Dum Aloo','Jammu and Kashmir'],['Kahwa','Jammu and Kashmir'],['Dhuska','Jharkhand'],['Rugra','Jharkhand'],['Bisi Bele Bath','Karnataka'],['Ragi Mudde','Karnataka'],['Appam','Kerala'],['Sadya','Kerala'],['Puttu','Kerala'],['Poha','Madhya Pradesh'],['Bhutte ka Kees','Madhya Pradesh'],['Puran Poli','Maharashtra'],['Pav Bhaji','Maharashtra'],['Misal Pav','Maharashtra'],['Eromba','Manipur'],['Singju','Manipur'],['Jadoh','Meghalaya'],['Tungrymbai','Meghalaya'],['Bai','Mizoram'],['Vawksa','Mizoram'],['Smoked Pork','Nagaland'],['Axone','Nagaland'],['Pakhala','Odisha'],['Dalma','Odisha'],['Sarson da Saag','Punjab'],['Makki di Roti','Punjab'],['Dal Baati Churma','Rajasthan'],['Gatte','Rajasthan'],['Momos','Sikkim'],['Pongal','Tamil Nadu'],['Hyderabadi Biryani','Telangana'],['Sarva Pindi','Telangana'],['Mui Borok','Tripura'],['Awadhi Biryani','Uttar Pradesh'],['Kachori','Uttar Pradesh'],['Petha','Uttar Pradesh'],['Kafuli','Uttarakhand'],['Aloo ke Gutke','Uttarakhand'],['Mishti Doi','West Bengal']
];

export const foodDetails = [
  ...featuredFoodDetails,
  ...regionalFoodExamples.map(([name, state]) => ({
    id:normalizeCultureName(name).replace(/\s+/g,'-'),
    name,
    region:state,
    description:`A regional food example associated with ${state}. Recipes and ingredients can vary across communities and households.`,
    background:`Listed in the Indian Diversity cultural profile for ${state}.`,
    ingredients:'Ingredients and preparation vary by local recipe.',
    ...(name === 'Litti Chokha' ? {
      imageUrl:'https://upload.wikimedia.org/wikipedia/commons/3/3e/Litti-Chokha-From-Bihar.jpg',
      imageCredit:{ label:'RAJ123SONY · Wikimedia Commons (CC BY-SA 4.0)', url:'https://commons.wikimedia.org/wiki/File:Litti-Chokha-From-Bihar.jpg' }
    } : {})
  }))
];

export function normalizeCultureName(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function findDirectCultureTarget(message, festivals) {
  const query = normalizeCultureName(message);
  if (!query || /\b(compare|difference|versus|vs)\b/.test(query)) return null;

  const state = indianStateNames.find((name) => query === normalizeCultureName(name));
  if (state) return { type:'state', name:state };

  const intent = /\b(show|open|detail|details|tell me about|what is|explain|information|info|explore|image|photo|picture|pic|visual)\b/.test(query);
  const festival = festivals.find((item) => query === normalizeCultureName(item.name) || (intent && new RegExp(`(^| )${normalizeCultureName(item.name).replace(/\s+/g, '\\s+')}($| )`).test(query)));
  if (festival) return { type:'festival', id:festival.id, name:festival.name };

  const foodAliases = { 'dosa idli':['dosa','idli'], 'chole bhature':['chole','bhature'], 'macher jhol':['macher jhol','fish curry'], 'thepla undhiyu':['thepla','undhiyu'], 'dal baati churma':['dal baati','baati','churma'], 'litti chokha':['litti','chokha'], 'sarson da saag':['sarson','saag'], 'hyderabadi biryani':['biryani'], 'awadhi biryani':['biryani'] };
  const food = foodDetails.find((item) => {
    const normalized = normalizeCultureName(item.name);
    const aliases = foodAliases[normalized] || [normalized];
    return query === normalized || query === normalizeCultureName(item.id.replace(/-/g,' ')) || aliases.some((alias) => query === alias || (intent && query.includes(alias)));
  });
  return food ? { type:'food', id:food.id, name:food.name } : null;
}
