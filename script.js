let selectedState=STATES[20], quizIndex=0, score=0;
function renderStates(){
 const q=document.getElementById('stateSearch').value.toLowerCase(), r=document.getElementById('regionFilter').value;
 const list=STATES.filter(s=>(s.name.toLowerCase().includes(q)||s.food.toLowerCase().includes(q)||s.festival.toLowerCase().includes(q))&&(r==='All'||s.region===r));
 document.getElementById('stateGrid').innerHTML=list.map((s,i)=>`<article class="state-card" onclick="openState('${s.name.replace(/'/g,"\\'")}')"><div class="state-img" style="background-image:url('${s.image}')"><span class="badge">${s.region}</span></div><div class="state-body"><h3>${s.name}</h3><p>${s.language} · ${s.festival}</p></div></article>`).join('');
}
function openState(name){
 const s=STATES.find(x=>x.name===name); selectedState=s;
 document.getElementById('modalContent').innerHTML=`<div class="profile"><div><img src="${s.image}" alt="${s.name}"></div><div><span class="eyebrow">${s.region.toUpperCase()} INDIA</span><h2>${s.name}</h2><p class="tagline">${s.name} — A unique cultural story</p><p>Explore the language, flavours, clothing, celebrations, art, dance and heritage associated with ${s.name}.</p><div class="facts">
<div class="fact"><b>🗣 Language</b>${s.language}</div><div class="fact"><b>🍲 Famous Food</b>${s.food}</div><div class="fact"><b>🧵 Traditional Dress</b>${s.dress}</div><div class="fact"><b>🪔 Festival</b>${s.festival}</div><div class="fact"><b>🎨 Art & Craft</b>${s.art}</div><div class="fact"><b>💃 Dance</b>${s.dance}</div><div class="fact"><b>🏛 Heritage</b>${s.heritage}</div></div></div></div>`;
 document.getElementById('modal').classList.add('show');
}
function closeModal(e){if(!e||e.target.id==='modal')document.getElementById('modal').classList.remove('show')}
function openSearch(){document.getElementById('searchModal').classList.add('show');setTimeout(()=>document.getElementById('globalSearch').focus(),50)}
function globalSearch(){const q=document.getElementById('globalSearch').value.toLowerCase();document.getElementById('searchResults').innerHTML=q?STATES.filter(s=>JSON.stringify(s).toLowerCase().includes(q)).slice(0,10).map(s=>`<div class="result" onclick="document.getElementById('searchModal').classList.remove('show');openState('${s.name}')"><b>${s.name}</b><span>${s.food} · ${s.festival} · ${s.art}</span></div>`).join(''):'<p>Type to search across states, food, festivals, art and heritage.</p>'}
function filterExplore(key){document.getElementById('stateSearch').value='';document.getElementById('regionFilter').value='All';document.getElementById('states').scrollIntoView({behavior:'smooth'});showToast('Showing cultural profiles — open any state for details');}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.style.display='block';setTimeout(()=>t.style.display='none',2500)}
const questions=[
["Which state is famous for Madhubani art?",["Bihar","Punjab","Kerala","Gujarat"],0,"Madhubani art is associated with Bihar."],
["Which festival is strongly associated with Kerala?",["Pongal","Onam","Bihu","Baisakhi"],1,"Onam is a major festival of Kerala."],
["Which dance form is associated with Tamil Nadu?",["Garba","Bharatanatyam","Bhangra","Ghoomar"],1,"Bharatanatyam is a classical dance tradition of Tamil Nadu."],
["Which state is known for the Golden Temple?",["Punjab","Rajasthan","Odisha","Assam"],0,"The Golden Temple is in Amritsar, Punjab."],
["Which craft is strongly associated with Rajasthan?",["Blue Pottery","Warli","Pattachitra","Madhubani"],0,"Blue Pottery is a noted craft tradition of Rajasthan."]
];
function renderQuiz(){
 const q=questions[quizIndex%questions.length];document.getElementById('quizBox').innerHTML=`<div style="color:#8d6b58">Question ${(quizIndex%questions.length)+1} of 5 · Score ${score}</div><div class="quiz-question">${q[0]}</div>${q[1].map((x,i)=>`<label class="option"><input type="radio" name="q" value="${i}"> ${String.fromCharCode(65+i)}. ${x}</label>`).join('')}<button class="quiz-btn" onclick="checkAnswer()">Check Answer →</button><div id="answer"></div>`;
}
function checkAnswer(){const q=questions[quizIndex%questions.length], v=document.querySelector('input[name=q]:checked'), a=document.getElementById('answer');if(!v){a.innerHTML='<p>Please select an option.</p>';return}if(+v.value===q[2]){score++;a.innerHTML='<p style="color:#28733a;font-weight:700">✓ Correct!</p>'}else a.innerHTML=`<p style="color:#9b2f2f;font-weight:700">Not quite. Correct answer: ${q[1][q[2]]}</p>`;a.innerHTML+=`<p>${q[3]}</p><button class="quiz-btn" onclick="quizIndex++;renderQuiz()">Next Question →</button>`}
renderStates();renderQuiz();