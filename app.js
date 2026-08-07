/* =========================================================
   ENSEM SPORT — app.js (partagé par toutes les pages)
   ========================================================= */

/* ---------- CONFIGURATION — mêmes valeurs partout ---------- */
const CONFIG = {
  SUPABASE_URL:      'https://gexqqlyzlggrxicwhcnb.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_zLVBKoecbek6-P1TL7K7nw_V9zSjKmY',
  SHEET_ENDPOINT:    'https://script.google.com/macros/s/AKfycbxjMtNowfp8jLpOZHNSwq6g7Ld8DeuJiW9hssUJ_wUxZJ21ThtmtDe6cj7vnKOrs8WZ/exec'
};
const configured = !CONFIG.SUPABASE_URL.includes('VOTRE-PROJET');
const sheetReady  = !CONFIG.SHEET_ENDPOINT.includes('VOTRE-ID');
const sb = (configured && window.supabase) ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY) : null;

const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = d => new Date(d+'T00:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
const initials = n => String(n).trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase();

/* ---------- HEADER / FOOTER (injectés sur chaque page) ---------- */
const NAV_ITEMS = [
  ['index.html','Accueil'],
  ['apropos.html','À propos'],
  ['bureau.html','Le Bureau'],
  ['evenements.html','Événements'],
  ['actualites.html','Actualités'],
  ['galerie.html','Galerie'],
  ['podcast.html','ES Podcast'],
  ['partenaires.html','Partenaires'],
  ['rejoindre.html','Inscription'],
  ['contact.html','Contact'],
];

function currentPage(){
  const p = location.pathname.split('/').pop();
  return p === '' ? 'index.html' : p;
}

function injectHeader(){
  const host = document.getElementById('site-header');
  if(!host) return;
  const cur = currentPage();
  const links = NAV_ITEMS.map(([href,label])=>`<a href="${href}" class="${href===cur?'active':''}">${label}</a>`).join('');
  host.innerHTML = `
    <header class="nav" id="nav">
      <a href="index.html" class="brand" aria-label="Accueil ENSEM Sport">
        <img class="mark" src="logo.png" alt="ENSEM Sport">
        ENSEM<b>SPORT</b>
      </a>
      <nav class="links" id="links">
        ${links}
        <a href="dashboard.html" class="nav-cta">Espace comité</a>
      </nav>
      <div style="display:flex;align-items:center;gap:.5rem">
        <button class="theme-toggle" id="themeToggle" aria-label="Changer de thème" type="button">
          <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>
        </button>
        <button class="burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </header>
    <div class="nav-scrim" id="navScrim"></div>`;
  const burger=document.getElementById('burger'), nlinks=document.getElementById('links'), scrim=document.getElementById('navScrim');
  const closeMenu=()=>{nlinks.classList.remove('open');burger.classList.remove('open');burger.setAttribute('aria-expanded',false);scrim.classList.remove('show');};
  burger.addEventListener('click',()=>{
    const open=nlinks.classList.toggle('open');burger.classList.toggle('open',open);
    burger.setAttribute('aria-expanded',open);scrim.classList.toggle('show',open);
  });
  scrim.addEventListener('click',closeMenu);
  nlinks.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));

  const toggle=document.getElementById('themeToggle');
  toggle.addEventListener('click',()=>{
    const isDark=document.documentElement.classList.toggle('dark');
    try{localStorage.setItem('ens-theme',isDark?'dark':'light');}catch(e){}
  });
}

function injectFooter(){
  const host = document.getElementById('site-footer');
  if(!host) return;
  host.innerHTML = `
    <footer>
      <div class="wrap">
        <div class="foot-grid">
          <div>
            <div class="brand">ENSEM<b>SPORT</b></div>
            <p class="desc">Organisation sportive étudiante officielle de l'ENSEM, Université Hassan II de Casablanca.</p>
          </div>
          <div class="fcol"><h4>Explorer</h4><a href="apropos.html">À propos</a><a href="evenements.html">Événements</a><a href="actualites.html">Actualités</a><a href="galerie.html">Galerie</a></div>
          <div class="fcol"><h4>Participer</h4><a href="rejoindre.html">Nous rejoindre</a><a href="partenaires.html">Devenir partenaire</a><a href="contact.html">Nous contacter</a><a href="dashboard.html">Espace comité</a></div>
        </div>
        <div class="foot-base">
          <span>© 2026-2027 ENSEM Sport — Ensemble, plus loin.</span>
          <span>Confidentialité · Des données personnelles traitées avec soin.</span>
        </div>
      </div>
    </footer>
    <div class="toast" id="toast"></div>`;
}

/* ---------- reveal on scroll ---------- */
function observeReveal(){
  const targets=[...document.querySelectorAll('.reveal:not(.in)')];
  if(!targets.length) return;
  if(!('IntersectionObserver' in window)){ targets.forEach(el=>el.classList.add('in')); return; }
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{threshold:.15});
  targets.forEach(el=>io.observe(el));
  setTimeout(()=>targets.forEach(el=>el.classList.add('in')),1800);
}
function observeCounters(){
  const cio=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return; const el=e.target; cio.unobserve(el);
    const end=+el.dataset.count, suf=el.dataset.suffix||''; let s=null;
    const step=t=>{if(!s)s=t;const p=Math.min((t-s)/1400,1);el.textContent=Math.floor(p*end)+(p===1?suf:'');if(p<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);
  }),{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(el=>cio.observe(el));
}

/* ---------- toast ---------- */
function showToast(html){
  const toast=document.getElementById('toast'); if(!toast)return;
  toast.innerHTML=html; toast.classList.add('show');
  clearTimeout(toast._t); toast._t=setTimeout(()=>toast.classList.remove('show'),4200);
}

/* ---------- validation ---------- */
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const markField = (i,ok) => { i.closest('.field').classList.toggle('invalid',!ok); return ok; };

/* ================= DONNÉES DE SECOURS ================= */
const FALLBACK_EVENTS = [
  {category:'Média',name:'ES Podcast',event_date:null,logo_url:'ev-podcast.png',description:"Un podcast avec des personnalités inspirantes de l'ingénierie, de l'entrepreneuriat, du leadership, de l'innovation, de l'intelligence artificielle, de la technologie, de la recherche, du sport et du développement personnel."},
  {category:'Gaming',name:'ENSEM Gaming Expo',event_date:null,logo_url:'ev-gaming.png',description:"Un événement gaming pensé par et pour les étudiants : tournois, découvertes, animations et compétitions autour du jeu vidéo."},
  {category:'Vie de club',name:"Semaine d'Intégration",event_date:null,logo_url:'ev-integration.png',description:"La Semaine d'Intégration est le premier grand rendez-vous de l'année universitaire. Elle a pour objectif d'accueillir les nouveaux étudiants dans les meilleures conditions, de faciliter leur adaptation à la vie de l'ENSEM et de créer dès les premiers jours un véritable esprit de promotion. À travers des activités sportives, des jeux, des défis, des animations, des présentations des clubs, des moments de convivialité et une soirée d'intégration, cet événement permet aux étudiants de découvrir leur nouvel environnement tout en développant des liens solides avec leurs camarades."},
  {category:'Compétition',name:'JOE — Olympiades',event_date:null,logo_url:'ev-joe.png',description:"La Journée ENSEM Sport est l'événement phare du club et l'une des plus grandes manifestations étudiantes organisées au sein de l'école. Elle rassemble les étudiants autour d'une journée riche en compétitions sportives, animations, spectacles, démonstrations, stands partenaires et activités interactives. Elle constitue également une véritable vitrine pour les partenaires, les sponsors et les médias."},
  {category:'Sport',name:'Tournois Sportifs',event_date:null,logo_url:'ev-tournois.png',description:"Des tournois inter-classes et inter-écoles dans plusieurs disciplines, pour faire vivre l'esprit de compétition et de dépassement de soi tout au long de l'année."},
  {category:'Vie de club',name:'Mini Journée',event_date:null,logo_url:'ev-minijournee.png',description:"Une version condensée de la grande journée sportive : compétitions, animations et bonne humeur sur une demi-journée."},
  {category:'Projet',name:'Rénovation Buvette',event_date:null,logo_url:'ev-buvette.png',description:"Un projet porté par le club pour moderniser et redynamiser l'espace buvette de l'école, lieu de vie central des étudiants."},
  {category:'Soirée',name:'Soirée Show',event_date:null,logo_url:'ev-soiree.png',description:"Une soirée spectacle organisée par ENSEM Sport : animations, performances et ambiance festive pour clôturer les grands événements du club."},
];
const FALLBACK_NEWS = [
  {title:'Programmation des événements à venir'},
  {title:"Propositions d'invités ES Podcast"},
  {title:'Appel aux partenariats'},
];
const SPORTS = ['Football','Basketball','Volleyball','Handball','Athlétisme','Tennis de table','Échecs','Natation','Fitness','E-sport','Course','Padel'];
const CELLULES = ['Logistique','Événement','Sponsoring','Média','Communication','Design','Jeux & Sports','Soirées & Shows'];

/* ================= LOADERS ================= */
async function loadEventsInto(elId, {limit=null}={}){
  const grid=document.getElementById(elId); if(!grid) return;
  let rows=null;
  if(sb){ const {data,error}=await sb.from('events').select('*').order('display_order'); if(!error&&data&&data.length) rows=data; }
  if(!rows) rows=FALLBACK_EVENTS;
  if(limit) rows=rows.slice(0,limit);
  window.__events = rows;
  grid.innerHTML = rows.map((e,i)=>`
    <button class="ticket reveal in" type="button" data-ev="${i}">
      <span class="stub-top">${e.logo_url?`<img src="${esc(e.logo_url)}" alt="${esc(e.name)}">`:`<span style="font-family:'Anton';color:var(--ink);font-size:1.2rem;text-align:center;padding:0 .5rem">${esc(e.name)}</span>`}</span>
      <span class="perf"></span>
      <span class="stub-bottom">
        <span class="cat">${esc(e.category)}</span>
        <h3>${esc(e.name)}</h3>
        ${e.event_date?`<span class="date set">${fmtDate(e.event_date)}</span>`:`<span class="date">À annoncer</span>`}
      </span>
    </button>`).join('');
  grid.querySelectorAll('[data-ev]').forEach(b=>b.addEventListener('click',()=>openEventModal(window.__events[+b.dataset.ev])));
}

function ensureEventModal(){
  if(document.getElementById('evOverlay')) return;
  const div=document.createElement('div');
  div.innerHTML=`
    <div class="overlay" id="evOverlay">
      <div class="ev-modal" role="dialog" aria-modal="true">
        <div class="top">
          <button class="close" id="evClose" aria-label="Fermer">✕</button>
          <img id="evImg" src="" alt="">
        </div>
        <div class="body">
          <span class="cat" id="evCat"></span>
          <h3 id="evName"></h3>
          <span class="date" id="evDate"></span>
          <p class="desc" id="evDesc"></p>
        </div>
        <div class="foot">
          <a href="contact.html" class="btn primary full">Nous rejoindre <span class="arrow">→</span></a>
        </div>
      </div>
    </div>`;
  document.body.appendChild(div.firstElementChild);
  const overlay=document.getElementById('evOverlay');
  document.getElementById('evClose').addEventListener('click',()=>overlay.classList.remove('open'));
  overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('open');});
  addEventListener('keydown',e=>{if(e.key==='Escape')overlay.classList.remove('open');});
}
function openEventModal(e){
  ensureEventModal();
  document.getElementById('evImg').src=e.logo_url||'';
  document.getElementById('evImg').alt=e.name;
  document.getElementById('evCat').textContent=e.category;
  document.getElementById('evName').textContent=e.name;
  const d=document.getElementById('evDate');
  if(e.event_date){d.textContent=fmtDate(e.event_date);d.className='date set';}
  else{d.textContent='À annoncer';d.className='date';}
  document.getElementById('evDesc').textContent=e.description||'Détails à venir — le comité complètera bientôt cette fiche événement.';
  document.getElementById('evOverlay').classList.add('open');
}

async function loadNewsInto(elId){
  const list=document.getElementById(elId); if(!list) return;
  let rows=null;
  if(sb){ const {data,error}=await sb.from('news').select('*').order('display_order'); if(!error&&data&&data.length) rows=data; }
  if(!rows) rows=FALLBACK_NEWS;
  list.innerHTML=rows.map((n,i)=>`
    <div class="news-item reveal in">
      <span class="idx">0${i+1}</span><h3>${esc(n.title)}</h3><span class="go">→</span>
    </div>`).join('');
}

async function loadGalleryInto(elId){
  const grid=document.getElementById(elId); if(!grid) return;
  let rows=null;
  if(sb){ const {data,error}=await sb.from('gallery').select('*').order('display_order'); if(!error&&data) rows=data; }
  if(rows&&rows.length){
    window.__galleryImages = rows.map(g=>({src:g.image_url,title:g.title||''}));
    grid.innerHTML=rows.map((g,i)=>`
      <figure class="shot reveal in" data-idx="${i}">
        <img src="${esc(g.image_url)}" alt="${esc(g.title||'Photo ENSEM Sport')}" loading="lazy" decoding="async">
        <span class="zoom-ic">⤢</span>
        ${g.title?`<figcaption class="cap">${esc(g.title)}</figcaption>`:''}
      </figure>`).join('');
  } else {
    const ph=[['Olympiades',230],['Tournois',300],['Gaming Expo',180],['Intégration',270],['Podcast',200],['Team',320]];
    window.__galleryImages = ph.map((t,i)=>({placeholder:true,cls:'g'+(i+1),title:t[0]}));
    grid.innerHTML = ph.map((t,i)=>`
      <div class="shot g${i+1} reveal in" data-idx="${i}">
        <div class="fill" style="height:${t[1]}px"><span>${t[0]}</span></div>
        <span class="zoom-ic">⤢</span>
      </div>`).join('');
  }
  ensureLightbox();
  grid.querySelectorAll('[data-idx]').forEach(el=>el.addEventListener('click',()=>openLightbox(+el.dataset.idx)));
}

let __lbIndex = 0;
function ensureLightbox(){
  if(document.getElementById('lightbox')) return;
  const div=document.createElement('div');
  div.innerHTML=`
    <div class="lightbox" id="lightbox" style="position:fixed;inset:0;z-index:999999;background:rgba(10,10,10,.92);display:none;align-items:center;justify-content:center;padding:2.5rem;box-sizing:border-box;">
      <div class="stage" id="lbStage" style="position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">
        <button class="nav-btn prev" id="lbPrev" aria-label="Photo précédente" style="position:absolute;left:0;top:50%;transform:translateY(-50%);">‹</button>
        <img id="lbImg" src="" alt="" style="display:block;max-width:min(85vw,900px);max-height:78vh;width:auto;height:auto;object-fit:contain;border-radius:10px;box-shadow:0 30px 60px rgba(0,0,0,.5);margin:0 auto;">
        <div id="lbPlaceholder" class="lb-placeholder" style="display:none"></div>
        <button class="nav-btn next" id="lbNext" aria-label="Photo suivante" style="position:absolute;right:0;top:50%;transform:translateY(-50%);">›</button>
        <button class="close" id="lbClose" aria-label="Fermer" style="position:absolute;top:-1.4rem;right:-1.4rem;">✕</button>
        <span class="counter" id="lbCounter" style="position:absolute;bottom:-2.2rem;left:50%;transform:translateX(-50%);"></span>
      </div>
    </div>`;
  document.body.appendChild(div.firstElementChild);
  const lb=document.getElementById('lightbox');
  const stage=document.getElementById('lbStage');
  const img=document.getElementById('lbImg');

  const close=()=>{lb.classList.remove('open');lb.style.display='';lb.style.opacity='';document.body.style.overflow='';};
  document.getElementById('lbClose').addEventListener('click',close);
  lb.addEventListener('click',e=>{if(e.target===lb)close();});
  document.getElementById('lbPrev').addEventListener('click',()=>navLightbox(-1));
  document.getElementById('lbNext').addEventListener('click',()=>navLightbox(1));
  addEventListener('keydown',e=>{
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    if(e.key==='ArrowLeft')navLightbox(-1);
    if(e.key==='ArrowRight')navLightbox(1);
  });

  // glissement tactile gauche/droite pour naviguer
  let startX=0, deltaX=0, dragging=false;
  stage.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;deltaX=0;dragging=true;img.classList.add('swiping');},{passive:true});
  stage.addEventListener('touchmove',e=>{
    if(!dragging)return;
    deltaX=e.touches[0].clientX-startX;
    img.style.transform=`translateX(${deltaX}px)`;
    img.style.opacity=String(1-Math.min(Math.abs(deltaX)/400,.5));
  },{passive:true});
  stage.addEventListener('touchend',()=>{
    dragging=false; img.classList.remove('swiping');
    img.style.transform=''; img.style.opacity='';
    if(deltaX>60) navLightbox(-1);
    else if(deltaX<-60) navLightbox(1);
    deltaX=0;
  });
}
function navLightbox(dir){
  const list=window.__galleryImages||[];
  if(!list.length)return;
  __lbIndex=(__lbIndex+dir+list.length)%list.length;
  renderLightbox();
}
function renderLightbox(){
  const list=window.__galleryImages||[];
  const item=list[__lbIndex]; if(!item)return;
  const img=document.getElementById('lbImg');
  const ph=document.getElementById('lbPlaceholder');
  if(item.placeholder){
    img.style.display='none';
    ph.style.display='grid';
    ph.className='lb-placeholder '+item.cls;
    ph.textContent=item.title;
  } else {
    ph.style.display='none';
    img.style.display='block';
    img.src=item.src; img.alt=item.title||'';
  }
  document.getElementById('lbCounter').textContent=(__lbIndex+1)+' / '+list.length;
  const multi=list.length>1;
  document.getElementById('lbPrev').style.display=multi?'grid':'none';
  document.getElementById('lbNext').style.display=multi?'grid':'none';
}
function openLightbox(index){
  ensureLightbox();
  __lbIndex=index;
  renderLightbox();
  const lb=document.getElementById('lightbox');
  lb.classList.add('open');
  lb.style.display='flex';
  lb.style.opacity='1';
  document.body.style.overflow='hidden';
}

async function loadPartnersInto(elId){
  const grid=document.getElementById(elId); if(!grid) return;
  let rows=null;
  if(sb){ const {data,error}=await sb.from('partners').select('*').order('display_order'); if(!error&&data&&data.length) rows=data; }
  if(rows&&rows.length){
    grid.innerHTML=rows.map(p=>{
      const inner=`<img src="${esc(p.logo_url)}" alt="${esc(p.name)}" style="max-width:80%;max-height:70%;object-fit:contain">`;
      return p.website
        ? `<a class="plogo" href="${esc(p.website)}" target="_blank" rel="noopener" style="border-style:solid">${inner}</a>`
        : `<div class="plogo" style="border-style:solid">${inner}</div>`;
    }).join('');
  } else {
    grid.innerHTML = Array.from({length:6}).map(()=>`<div class="plogo">Votre logo</div>`).join('');
  }
}

async function loadTeamInto(elId){
  const row=document.getElementById(elId); if(!row) return;
  let rows=null;
  if(sb){ const {data,error}=await sb.from('team').select('*').order('display_order'); if(!error&&data&&data.length) rows=data; }
  if(!rows) rows=[['Nom Prénom','Président·e'],['Nom Prénom','Vice-président·e'],['Nom Prénom','Trésorier·ère'],['Nom Prénom','Responsable médias'],['Nom Prénom','Responsable sport']].map(([name,role])=>({name,role,photo_url:null,email:null}));
  row.innerHTML=rows.map(m=>`
    <div class="story reveal in">
      <span class="ring"><span class="photo" ${m.email?'tabindex="0" role="button" aria-label="Voir l\'e-mail"':''}>
        ${m.photo_url?`<img src="${esc(m.photo_url)}" alt="${esc(m.name)}" loading="lazy">`:`<span class="ini">${esc(initials(m.name))}</span>`}
        ${m.email?`<span class="email-ov"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M4 6l8 7 8-7"/></svg><a href="mailto:${esc(m.email)}" onclick="event.stopPropagation()">${esc(m.email)}</a></span>`:''}
      </span></span>
      <b>${esc(m.name)}</b><span>${esc(m.role||'')}</span>
    </div>`).join('');
  row.querySelectorAll('.photo[role="button"]').forEach(el=>{
    el.addEventListener('click',()=>el.classList.toggle('show'));
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.classList.toggle('show');}});
  });
}

/* ================= Chips (sports, cellules, etc.) ================= */
function buildChips(list, boxId, hiddenId){
  const box=document.getElementById(boxId); if(!box) return;
  const selected=new Set();
  box.innerHTML=list.map(s=>`<span class="chip" role="button" tabindex="0">${s}</span>`).join('');
  box.querySelectorAll('.chip').forEach(c=>{
    const t=()=>{c.classList.toggle('on'); c.classList.contains('on')?selected.add(c.textContent):selected.delete(c.textContent); document.getElementById(hiddenId).value=[...selected].join(', ');};
    c.addEventListener('click',t);
    c.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();t();}});
  });
  return selected;
}
function buildSportChips(boxId, hiddenId){ return buildChips(SPORTS, boxId, hiddenId); }

/* ================= Envoi formulaires vers le Google Sheet ================= */
async function sendToSheet(payload){
  if(!sheetReady) return;
  await fetch(CONFIG.SHEET_ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
}

document.querySelectorAll('input,textarea').forEach(i=>i.addEventListener('input',()=>i.closest('.field')?.classList.remove('invalid')));

/* ---------- boot commun ---------- */
function applyStoredTheme(){
  try{
    const saved=localStorage.getItem('ens-theme');
    const dark=saved?saved==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark',dark);
  }catch(e){}
}

document.addEventListener('DOMContentLoaded',()=>{
  applyStoredTheme();
  injectHeader(); injectFooter();
  document.querySelectorAll('input,textarea').forEach(i=>i.addEventListener('input',()=>i.closest('.field')?.classList.remove('invalid')));
});
