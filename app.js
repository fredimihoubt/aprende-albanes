// Claves de almacenamiento
const KEYS = {
  vocab: 'sqpl_app_vocab_custom',
  progress: 'sqpl_app_progress',
  rewards: 'sqpl_app_rewards',
  rewardsHistory: 'sqpl_app_rewards_history',
  flashState: 'sqpl_app_flash_state',
  uiLang: 'sqpl_app_ui_lang',
  plan: 'sqpl_app_plan'
};

// Estado simple
auth = { user: 'guest' };
const state = {
  data: { words: [], phrases: [] },
  uiLang: localStorage.getItem(KEYS.uiLang) || 'es',
  ttsVoice: null,
  flashQueue: [],
  flashIndex: 0,
  plan: [],
  rewards: [
    { id:'gift', name:'Regalo' },
    { id:'dinner', name:'Cena' },
    { id:'icecream', name:'Helado' },
    { id:'massage', name:'Masaje' },
  ]
};

// Utilidades
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 1600); }
function speak(text, lang){
  if(!('speechSynthesis' in window)) return toast('TTS no disponible');
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; // 'sq-AL', 'pl-PL', 'es-ES' según disponibilidad
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
function setView(id){ $$('.view').forEach(v=>v.classList.remove('active')); $(`#view-${id}`).classList.add('active'); }

// Navegación
$$('.nav-btn').forEach(btn=>btn.addEventListener('click',()=>setView(btn.dataset.view)));

// i18n UI mínima
const uiLangSelect = $('#uiLang');
uiLangSelect.value = state.uiLang;
uiLangSelect.addEventListener('change',()=>{
  state.uiLang = uiLangSelect.value;
  localStorage.setItem(KEYS.uiLang, state.uiLang);
  loadUILabels();
});

async function loadUILabels(){
  const res = await fetch('i18n/ui.json');
  const ui = await res.json();
  const t = (k)=> ui[state.uiLang][k] || k;
  // Etiquetas básicas
  $('#vocabTitle').textContent = t('vocabTitle');
  $('#addCustomBtn').textContent = t('addCustom');
  $('#btnAgain').textContent = t('again');
  $('#btnGood').textContent = t('good');
  $('#btnSpeak').textContent = t('speak');
}

// Carga de datos
async function loadData(){
  const base = await fetch('i18n/phrases.json').then(r=>r.json());
  const custom = JSON.parse(localStorage.getItem(KEYS.vocab) || '{"words":[],"phrases":[]}');
  state.data = {
    words: [...base.words, ...custom.words],
    phrases: [...base.phrases, ...custom.phrases]
  };
  buildCategoryFilter();
  renderVocabTable();
  initFlashcards();
  initPlan();
  initRewards();
}

function buildCategoryFilter(){
  const set = new Set(state.data.words.map(w=>w.cat).concat(state.data.phrases.map(p=>p.cat)).filter(Boolean));
  const sel = $('#catFilter');
  sel.innerHTML = '<option value="">Todas las categorías</option>' + Array.from(set).sort().map(c=>`<option value="${c}">${c}</option>`).join('');
}

// Render tabla vocabulario
function rowHtml(row){
  const speakBtns = `
    <button onclick="speak('${row.sq.replace(/'/g,"\\'")}', 'sq-AL')">SQ</button>
    <button onclick="speak('${row.pl.replace(/'/g,"\\'")}', 'pl-PL')">PL</button>
    <button onclick="speak('${row.es.replace(/'/g,"\\'")}', 'es-ES')">ES</button>`;
  return `<tr><td>${row.sq}</td><td>${row.pl}</td><td>${row.es}</td><td>${row.cat||''}</td><td>${speakBtns}</td></tr>`;
}
function renderVocabTable(){
  const q = $('#searchInput').value.toLowerCase();
  const cat = $('#catFilter').value;
  const rows = [...state.data.words, ...state.data.phrases]
    .filter(r => (!cat || r.cat===cat))
    .filter(r => !q || Object.values(r).join(' ').toLowerCase().includes(q));
  $('#vocabBody').innerHTML = rows.map(rowHtml).join('');
}
$('#searchInput').addEventListener('input', renderVocabTable);
$('#catFilter').addEventListener('change', renderVocabTable);

// Añadir personalizado
$('#addCustomBtn').addEventListener('click', ()=>$('#customDialog').showModal());
$('#saveCustom').addEventListener('click', (e)=>{
  e.preventDefault();
  const sq=$('#sqInput').value.trim();
  const pl=$('#plInput').value.trim();
  const es=$('#esInput').value.trim();
  const cat=$('#catInput').value.trim()||'personal';
  if(!sq||!pl||!es) return;
  const store = JSON.parse(localStorage.getItem(KEYS.vocab)||'{"words":[],"phrases":[]}');
  // Heurística: si es corto, palabra; si lleva espacio, frase
  const target = (sq.includes(' ')||pl.includes(' ')||es.includes(' ')) ? 'phrases' : 'words';
  store[target].push({sq,pl,es,cat});
  localStorage.setItem(KEYS.vocab, JSON.stringify(store));
  $('#customDialog').close();
  ['#sqInput','#plInput','#esInput','#catInput'].forEach(id=>$(id).value='');
  loadData();
  toast('Guardado');
});

// Flashcards (SRS simple)
function initFlashcards(){
  const items = [...state.data.words, ...state.data.phrases];
  // crear tarjetas con timestamps; si no hay estado previo, ahora
  const now = Date.now();
  const saved = JSON.parse(localStorage.getItem(KEYS.flashState)||'{}');
  state.flashQueue = items.map((it,i)=>{
    const key = it.sq+"|"+it.es;
    const due = saved[key]?.due || now;
    const interval = saved[key]?.interval || 1; // minutos
    return { ...it, key, due, interval };
  }).sort((a,b)=>a.due-b.due);
  nextFlashcard();
}
function nextFlashcard(){
  const now = Date.now();
  const next = state.flashQueue.find(it=>it.due<=now) || state.flashQueue[0];
  if(!next){ $('#flashFront').textContent='—'; $('#flashBack').textContent='—'; return; }
  state.currentFlash = next;
  $('#flashFront').textContent = next.sq;
  $('#flashBack').textContent = `${next.pl} \n ${next.es}`;
}
function scheduleFlash(quality){
  const sKey = KEYS.flashState;
  const store = JSON.parse(localStorage.getItem(sKey)||'{}');
  const cur = state.currentFlash;
  const mult = quality==='good' ? 3 : 0.5; // muy simple
  const newInterval = Math.max(1, Math.round((cur.interval||1)*mult));
  const due = Date.now() + newInterval*60*1000; // minutos
  store[cur.key] = { interval:newInterval, due };
  localStorage.setItem(sKey, JSON.stringify(store));
  toast(quality==='good'?'¡Bien! Reaparece más tarde.':'No pasa nada, la verás pronto.');
  initFlashcards();
}
$('#btnGood').addEventListener('click',()=>scheduleFlash('good'));
$('#btnAgain').addEventListener('click',()=>scheduleFlash('again'));
$('#btnSpeak').addEventListener('click',()=>speak(state.currentFlash?.sq||'', 'sq-AL'));

// Plan semanal 3h (sesiones de 30–45 min)
function initPlan(){
  const stored = JSON.parse(localStorage.getItem(KEYS.plan)||'[]');
  if(stored.length){ state.plan = stored; }
  else {
    state.plan = [
      { id:1, title:'Vocabulario: 20 min + juegos: 10–15 min', done:false },
      { id:2, title:'Flashcards: 30 min', done:false },
      { id:3, title:'Juego: Casa (15–20 min) + repaso 10 min', done:false },
      { id:4, title:'Vocabulario nuevo: 20 min + práctica 10 min', done:false },
      { id:5, title:'Juego: Mercado (20–25 min)', done:false },
      { id:6, title:'Flashcards: 20 min + frases útiles 10 min', done:false }
    ];
  }
  renderPlan();
}
function renderPlan(){
  const ul = $('#planList');
  ul.innerHTML = '';
  state.plan.forEach(item=>{
    const li = document.createElement('li');
    li.innerHTML = `<label class="switch"><input type="checkbox" ${item.done?'checked':''} /> <span>${item.title}</span></label>`;
    const cb = li.querySelector('input');
    cb.addEventListener('change',()=>{ item.done = cb.checked; savePlan(); updateProgress(); maybeUnlockReward(); });
    ul.appendChild(li);
  });
  updateProgress();
}
function savePlan(){ localStorage.setItem(KEYS.plan, JSON.stringify(state.plan)); }
function updateProgress(){
  const total = state.plan.length; const done = state.plan.filter(i=>i.done).length;
  const pct = Math.round(done/total*100);
  $('#progressBar').style.width = pct+'%';
}

// Recompensas
function initRewards(){
  const list = $('#rewardsList');
  const hist = $('#rewardsHistory');
  const history = JSON.parse(localStorage.getItem(KEYS.rewardsHistory)||'[]');
  list.innerHTML=''; hist.innerHTML='';
  state.rewards.forEach(r=>{
    const li = document.createElement('li');
    li.className='panel';
    li.innerHTML = `<strong>${r.name}</strong><br/><button data-id="${r.id}">Marcar como entregada</button>`;
    li.querySelector('button').addEventListener('click',()=>{
      history.push({ id:r.id, name:r.name, date:new Date().toISOString() });
      localStorage.setItem(KEYS.rewardsHistory, JSON.stringify(history));
      renderHistory();
      toast('¡Recompensa entregada!');
    });
    list.appendChild(li);
  });
  function renderHistory(){
    const items = JSON.parse(localStorage.getItem(KEYS.rewardsHistory)||'[]');
    hist.innerHTML = items.slice(-10).reverse().map(i=>`<li class="panel"><strong>${i.name}</strong><br/><small>${new Date(i.date).toLocaleString()}</small></li>`).join('');
  }
  renderHistory();
}
function maybeUnlockReward(){
  const done = state.plan.filter(i=>i.done).length;
  const total = state.plan.length;
  if(done===total){ toast('¡Semana completada! Recompensa desbloqueada.'); }
}

// PWA hint toggle
$('#pwaInstallHint').addEventListener('change',()=>toast('Preferencia guardada'));

// Lanzar escena de juego desde botones
$$('.play-btn').forEach(btn=>btn.addEventListener('click',()=>{
  const scene = btn.dataset.scene; window.__launchScene(scene);
  setView('games');
  toast('Cargando juego…');
}));

// Tabla reactiva al cargar
window.addEventListener('DOMContentLoaded', async ()=>{
  await loadUILabels();
  await loadData();
  renderVocabTable();
});
