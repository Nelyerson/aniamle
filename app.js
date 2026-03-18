

// ============================================================
// UTILS
// ============================================================

function $(id) { return document.getElementById(id); }

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toLocaleString('es-ES');
}

// ============================================================
// STATS DASHBOARD
// ============================================================

function renderStatsCards() {
  const grid = $('statsGrid');
  grid.innerHTML = '';
  const tmpl = $('tmpl-stat-card');
  STATS_CARDS.forEach(c => {
    const clone = tmpl.content.cloneNode(true);
    const card = clone.querySelector('.stat-card');
    card.style.setProperty('--card-accent', c.accent);
    card.style.setProperty('--icon-bg', c.iconBg);
    card.style.setProperty('--fill-color', c.fill);
    clone.querySelector('.stat-icon').textContent = c.icon;
    clone.querySelector('.stat-badge').textContent = c.badge;
    clone.querySelector('.stat-badge').className = `stat-badge ${c.badgeClass}`;
    clone.querySelector('.stat-value').textContent = c.value;
    clone.querySelector('.stat-label').textContent = c.label;
    clone.querySelector('.stat-progress-fill').dataset.target = c.progress;
    grid.appendChild(clone);
  });
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('.stat-progress-fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    }, 200);
  });
}

// ============================================================
// DONUT CHART
// ============================================================

function renderDonutChart() {
  const risks = ['critico', 'peligro', 'vulnerable', 'menor'];
  const counts = risks.map(r => ANIMALS.filter(a => a.risk === r).length);
  const total = counts.reduce((a, b) => a + b, 0);
  const r = 72, cx = 100, cy = 100;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const colors = risks.map(r => RISK_COLORS[r]);
  const gaps = 3;
  const svg = $('donutChart');
  svg.innerHTML = '';
  const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  bgCircle.setAttribute('cx', cx); bgCircle.setAttribute('cy', cy); bgCircle.setAttribute('r', r);
  bgCircle.setAttribute('fill', 'none'); bgCircle.setAttribute('stroke', 'rgba(255,255,255,0.05)'); bgCircle.setAttribute('stroke-width', '22');
  svg.appendChild(bgCircle);
  counts.forEach((count, i) => {
    const pct = count / total;
    const dashLen = pct * circumference - gaps;
    const dashOffset = circumference - offset;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx); circle.setAttribute('cy', cy); circle.setAttribute('r', r);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', colors[i]);
    circle.setAttribute('stroke-width', '22');
    circle.setAttribute('stroke-dasharray', `0 ${circumference}`);
    circle.setAttribute('stroke-dashoffset', dashOffset);
    circle.setAttribute('stroke-linecap', 'butt');
    circle.style.transform = 'rotate(-90deg)';
    circle.style.transformOrigin = '50% 50%';
    circle.classList.add('donut-circle');
    svg.appendChild(circle);
    setTimeout(() => { circle.setAttribute('stroke-dasharray', `${dashLen} ${circumference - dashLen}`); }, 300 + i * 100);
    offset += pct * circumference;
  });
  const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  centerText.setAttribute('x', cx); centerText.setAttribute('y', cy - 8);
  centerText.setAttribute('text-anchor', 'middle'); centerText.setAttribute('font-size', '26');
  centerText.setAttribute('font-weight', '800'); centerText.setAttribute('fill', '#f0fdf4');
  centerText.setAttribute('font-family', 'Inter, sans-serif');
  centerText.textContent = total;
  svg.appendChild(centerText);
  const subText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  subText.setAttribute('x', cx); subText.setAttribute('y', cy + 14);
  subText.setAttribute('text-anchor', 'middle'); subText.setAttribute('font-size', '10');
  subText.setAttribute('fill', '#6b7280'); subText.setAttribute('font-family', 'Inter, sans-serif');
  const dict = $('ui-dictionary');
  subText.textContent = dict ? dict.dataset.donutSpecies : 'ESPECIES';
  svg.appendChild(subText);
  const legend = $('donutLegend');
  legend.innerHTML = '';
  const legTmpl = $('tmpl-donut-legend');
  risks.forEach((r, i) => {
    const pct = Math.round(counts[i] / total * 100);
    const clone = legTmpl.content.cloneNode(true);
    clone.querySelector('.legend-dot-colored').style.background = colors[i];
    clone.querySelector('.legend-name').textContent = RISK_LABELS[r];
    clone.querySelector('.legend-pct').style.color = colors[i];
    clone.querySelector('.legend-pct').textContent = `${pct}%`;
    legend.appendChild(clone);
  });
}

// ============================================================
// BAR CHART
// ============================================================

function renderBarChart() {
  const container = $('barChart');
  container.innerHTML = '';
  const tmpl = $('tmpl-bar-row');
  TREND_DATA.forEach(d => {
    const clone = tmpl.content.cloneNode(true);
    clone.querySelector('.bar-label').textContent = d.label;
    const fill = clone.querySelector('.bar-fill');
    fill.dataset.target = d.value;
    fill.style.background = d.color;
    fill.style.width = '0%';
    const val = clone.querySelector('.bar-value');
    val.textContent = `${d.value}%`;
    val.style.color = d.color;
    container.appendChild(clone);
  });
  requestAnimationFrame(() => {
    setTimeout(() => {
      container.querySelectorAll('.bar-fill').forEach(b => { b.style.width = b.dataset.target + '%'; });
    }, 400);
  });
}

// ============================================================
// CONTINENT STATS
// ============================================================

function renderContinentStats() {
  const container = $('continentStats');
  container.innerHTML = '';
  const tmpl = $('tmpl-cont-row');
  CONTINENT_DATA.forEach(d => {
    const clone = tmpl.content.cloneNode(true);
    clone.querySelector('.cont-name').textContent = d.name;
    clone.querySelector('.cont-fill').dataset.target = d.pct;
    clone.querySelector('.cont-count').textContent = d.count;
    container.appendChild(clone);
  });
  requestAnimationFrame(() => {
    setTimeout(() => {
      container.querySelectorAll('.cont-fill').forEach(b => { b.style.width = b.dataset.target + '%'; });
    }, 500);
  });
}

// ============================================================
// MAP
// ============================================================

function renderMapMarkers() {
  const container = $('mapMarkers');
  container.innerHTML = '';
  ANIMALS.forEach(a => {
    const marker = document.createElement('div');
    marker.className = `map-marker ${a.risk}`;
    marker.style.top = a.mapMarker.top + '%';
    marker.style.left = a.mapMarker.left + '%';
    marker.dataset.id = a.id;
    marker.dataset.risk = a.risk;
    marker.addEventListener('mouseenter', (e) => showMapTooltip(e, a));
    marker.addEventListener('mouseleave', hideMapTooltip);
    marker.addEventListener('click', () => showMapInfo(a));
    container.appendChild(marker);
  });
}

function showMapTooltip(e, animal) {
  const tooltip = $('mapTooltip');
  const map = $('mapWorld');
  const rect = map.getBoundingClientRect();
  tooltip.style.display = 'block';
  tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
  tooltip.style.top = (e.clientY - rect.top - 10) + 'px';
  tooltip.innerHTML = `<strong>${animal.emoji} ${animal.name}</strong><br/><small style="color:#6b7280">${RISK_LABELS[animal.risk]}</small>`;
}

function hideMapTooltip() { $('mapTooltip').style.display = 'none'; }

function showMapInfo(animal) {
  const panel = $('mapInfoPanel');
  panel.innerHTML = '';
  const tmpl = $('tmpl-map-info');
  const clone = tmpl.content.cloneNode(true);
  clone.querySelector('.mi-emoji').textContent = animal.emoji;
  clone.querySelector('.mi-title').innerHTML = `${animal.name} <small style="font-style:italic;color:#6b7280">— ${animal.latin}</small>`;
  const risk = clone.querySelector('.mi-risk');
  risk.style.color = RISK_COLORS[animal.risk];
  risk.textContent = `● ${RISK_LABELS[animal.risk]}`;
  clone.querySelector('.mi-pop').textContent = formatNumber(animal.population);
  clone.querySelector('.mi-life').textContent = animal.lifespan;
  clone.querySelector('.mi-hab').textContent = animal.habitat;
  panel.appendChild(clone);
}

window.filterMap = function (filter) {
  mapFilter = filter;
  document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));
  const btnMap = { all: $('mapAll'), critico: $('mapCritico'), peligro: $('mapPeligro'), vulnerable: $('mapVulnerable') };
  if (btnMap[filter]) btnMap[filter].classList.add('active');
  document.querySelectorAll('.map-marker').forEach(m => {
    const show = filter === 'all' || m.dataset.risk === filter;
    m.style.opacity = show ? '1' : '0.12';
    m.style.pointerEvents = show ? 'auto' : 'none';
  });
};

// ============================================================
// FILTER BAR
// ============================================================

function renderFilterTags() {
  const continents = ['all', ...new Set(ANIMALS.map(a => a.continent))];
  const risks = ['all', 'critico', 'peligro', 'vulnerable', 'menor'];
  const tmpl = $('tmpl-filter-tag');

  const cCont = $('continentFilters');
  cCont.innerHTML = '';
  continents.forEach(c => {
    const clone = tmpl.content.cloneNode(true);
    const btn = clone.querySelector('button');
    btn.textContent = CONTINENT_LABELS[c] || c;
    if (c === 'all') btn.classList.add('active');
    btn.onclick = () => setContinentFilter(c);
    cCont.appendChild(clone);
  });

  const rCont = $('riskFilters');
  rCont.innerHTML = '';
  risks.forEach(r => {
    const clone = tmpl.content.cloneNode(true);
    const btn = clone.querySelector('button');
    btn.textContent = RISK_UI_LABELS[r];
    if (r === 'all') btn.classList.add('risk-active');
    btn.onclick = () => setRiskFilter(r);
    rCont.appendChild(clone);
  });
}

window.setContinentFilter = function (continent) {
  activeContinentFilter = continent;
  document.querySelectorAll('#continentFilters .filter-tag').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  filterAnimals();
};

window.setRiskFilter = function (risk) {
  activeRiskFilter = risk;
  document.querySelectorAll('#riskFilters .filter-tag').forEach(b => b.classList.remove('risk-active'));
  event.target.classList.add('risk-active');
  filterAnimals();
};

window.filterAnimals = function () {
  const query = $('searchInput').value.toLowerCase();
  const filtered = ANIMALS.filter(a => {
    const matchContinent = activeContinentFilter === 'all' || a.continent === activeContinentFilter;
    const matchRisk = activeRiskFilter === 'all' || a.risk === activeRiskFilter;
    const matchSearch = a.name.toLowerCase().includes(query) || a.latin.toLowerCase().includes(query) || a.habitat.toLowerCase().includes(query);
    return matchContinent && matchRisk && matchSearch;
  });
  const dict = $('ui-dictionary');
  const fmt = dict ? dict.dataset.speciesShowing : 'Mostrando {0} de {1} especies';
  $('speciesCount').textContent = fmt.replace('{0}', filtered.length).replace('{1}', ANIMALS.length);
  renderSpeciesCards(filtered);
};

// ============================================================
// SPECIES CARDS
// ============================================================

function renderSpeciesCards(list) {
  const grid = $('speciesGrid');
  grid.innerHTML = '';
  if (list.length === 0) {
    grid.appendChild($('tmpl-empty-species').content.cloneNode(true));
    return;
  }
  const tmpl = $('tmpl-species-card');
  list.forEach((a, idx) => {
    const clone = tmpl.content.cloneNode(true);
    const card = clone.querySelector('.species-card');
    card.style.animationDelay = `${idx * 0.05}s`;
    
    clone.querySelector('.species-emoji').textContent = a.emoji;
    clone.querySelector('.species-title').textContent = a.name;
    clone.querySelector('.species-latin').textContent = a.latin;
    
    clone.querySelector('.tag-continent').textContent = a.continent.replace('SudAmerica', 'S.América').replace('NorteAmerica', 'N.América');
    const riskTag = clone.querySelector('.tag-risk');
    riskTag.textContent = RISK_LABELS[a.risk];
    riskTag.classList.add(`tag-${a.risk}`);
    
    clone.querySelector('.sp-pop').textContent = `~${formatNumber(a.population)}`;
    clone.querySelector('.sp-life').textContent = `${a.lifespan} años`;
    clone.querySelector('.sp-hab').textContent = a.habitat;
    const trendEl = clone.querySelector('.sp-trend');
    if (a.trend >= 0) {
      trendEl.textContent = `↑ +${a.trend}%`;
      trendEl.style.color = '#34d399';
    } else {
      trendEl.textContent = `↓ ${a.trend}%`;
      trendEl.style.color = '#f87171';
    }
    
    grid.appendChild(clone);
  });
}

// ============================================================
// MISSIONS & GAMIFICATION
// ============================================================

function renderMissions() {
  const list = $('missionsList');
  list.innerHTML = '';
  const tmpl = $('tmpl-mission-item');
  MISSIONS.forEach(m => {
    const clone = tmpl.content.cloneNode(true);
    const item = clone.querySelector('.mission-item');
    item.id = `mission-${m.id}`;
    if (m.completed) item.classList.add('completed');
    item.onclick = () => toggleMission(m.id);
    clone.querySelector('.mission-title').innerHTML = `${m.icon} ${m.title}`;
    clone.querySelector('.mission-sub').textContent = m.desc;
    clone.querySelector('.mission-xp').textContent = `+${m.xp} XP`;
    list.appendChild(clone);
  });
}

function renderAchievements() {
  const list = $('achievementsList');
  list.innerHTML = '';
  const tmpl = $('tmpl-achievement-item');
  ACHIEVEMENTS.forEach(a => {
    const clone = tmpl.content.cloneNode(true);
    const item = clone.querySelector('.achievement-item');
    item.id = `ach-${a.id}`;
    item.classList.add(a.unlocked ? 'unlocked' : 'locked');
    clone.querySelector('.achievement-icon').textContent = a.icon;
    clone.querySelector('.achievement-name').textContent = a.name;
    clone.querySelector('.achievement-desc').textContent = a.desc;
    const dict = $('ui-dictionary');
    clone.querySelector('.achievement-badge').textContent = a.unlocked ? (dict ? dict.dataset.badgeUnlocked : '✓') : (dict ? dict.dataset.badgeLocked : '🔒');
    list.appendChild(clone);
  });
}

window.toggleMission = function (missionId) {
  const mission = MISSIONS.find(m => m.id === missionId);
  if (!mission) return;
  mission.completed = !mission.completed;
  userXP = mission.completed ? userXP + mission.xp : Math.max(0, userXP - mission.xp);
  $(`mission-${missionId}`).classList.toggle('completed', mission.completed);
  updateXP();
  checkAchievements();
};

function checkAchievements() {
  const completedCount = MISSIONS.filter(m => m.completed).length;
  if (completedCount >= 1) ACHIEVEMENTS[0].unlocked = true;
  if (getLevel().rank >= 3) ACHIEVEMENTS[1].unlocked = true;
  if (completedCount === MISSIONS.length) ACHIEVEMENTS[2].unlocked = true;
  if (userXP >= 100) ACHIEVEMENTS[3].unlocked = true;
  renderAchievements();
}

function getLevel() {
  return LEVELS.find(l => userXP >= l.min && userXP < l.max) || LEVELS[LEVELS.length - 1];
}

function updateXP() {
  const lvl = getLevel();
  const pct = Math.min(100, ((userXP - lvl.min) / (lvl.max - lvl.min)) * 100);
  $('xpDisplay').textContent = userXP;
  $('xpNext').textContent = `/ ${lvl.max}`;
  $('xpBarFill').style.width = pct + '%';
  $('xpNav').textContent = userXP;
  const dict = $('ui-dictionary');
  $('userRank').textContent = `${dict ? dict.dataset.lvlPrefix : 'Nivel '}${lvl.rank} — ${lvl.label}`;
  $('userName').textContent = lvl.rank >= 3 ? (dict ? dict.dataset.lvlHigh : 'Gran Explorador') : (dict ? dict.dataset.lvlLow : 'Explorador');
}

// ============================================================
// NAVBAR SCROLL
// ============================================================

function initNavbar() {
  const navbar = $('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    const sections = ['dashboard', 'map', 'species', 'missions'];
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) current = id;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
}

// ============================================================
// SCROLL ANIMATIONS
// ============================================================

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('[data-target]').forEach(bar => {
          bar.style.width = bar.dataset.target + '%';
        });
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.glass-card, .stat-card, .species-card').forEach(c => observer.observe(c));
}

// ============================================================
// INIT PÁGINA
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  renderStatsCards();
  renderDonutChart();
  renderBarChart();
  renderContinentStats();
  renderMapMarkers();
  renderFilterTags();
  filterAnimals();
  renderMissions();
  renderAchievements();
  updateXP();
  initNavbar();
  setTimeout(initScrollAnimations, 500);
  initChatbot();
});


// ============================================================
// WILDBOT — CHATBOT RAG (conocimiento.txt)
// Motor: TF-IDF + Similaridad Coseno
// Fuente única: conocimiento.txt — sin respuestas hardcodeadas
// ============================================================

let ragDocs = [];
let ragIdf = {};
let ragReady = false;
let chatOpen = false;
let chatBotTyping = false;

function ragTokenize(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ') 
    .split(/\s+/)
    .filter(t => t.length >= 2 && !STOPWORDS_ES.has(t));
}

function ragBuildTF(tokens) {
  const tf = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  const total = tokens.length || 1;
  Object.keys(tf).forEach(k => tf[k] /= total);
  return tf;
}

function ragBuildIDF(docs) {
  const idf = {};
  const N = docs.length;
  docs.forEach(doc => {
    new Set(doc.tokens).forEach(t => { idf[t] = (idf[t] || 0) + 1; });
  });
  Object.keys(idf).forEach(k => { idf[k] = Math.log((N + 1) / (idf[k] + 1)) + 1; });
  return idf;
}

function ragTFIDF(tf, idf) {
  const vec = {};
  Object.keys(tf).forEach(t => { vec[t] = tf[t] * (idf[t] || 1); });
  return vec;
}

function ragCosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => {
    const av = a[k] || 0, bv = b[k] || 0;
    dot += av * bv; na += av * av; nb += bv * bv;
  });
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

// --- Parsear conocimiento.txt en fragmentos ---
function parseTxtToFragments(text) {
  return text
    .split(/\r?\n/)
    .map(p => p.trim())
    .filter(p => p.length > 5); // Excluir líneas vacías o demasiado cortas
}

// --- Enriquecer fragmentos con datos vivos de ANIMALS ---


// --- Inicializar RAG ---
async function initRAG() {
  let docs = [];

  try {
    const res = await fetch('conocimiento.txt');
    if (res.ok) {
      const txt = await res.text();
      const fragments = parseTxtToFragments(txt);
      docs = fragments.map(f => ({ text: f, response: f, source: 'txt' }));
      console.log(`[WildBot] ✅ conocimiento.txt cargado — ${docs.length} fragmentos`);
    } else {
      console.error('[WildBot] ❌ No se encontró conocimiento.txt');
    }
  } catch (err) {
    console.error('[WildBot] ❌ Error cargando conocimiento.txt:', err);
  }

  if (docs.length === 0) {
    ragReady = false;
    const dict = $('ui-dictionary');
    appendChatMsg('bot', dict ? dict.dataset.botLoadErr : 'ERROR', true);
    return;
  }

  const rawDocs = docs.map(d => ({ ...d, tokens: ragTokenize(d.text + ' ' + d.response) }));
  ragIdf = ragBuildIDF(rawDocs);
  ragDocs = rawDocs.map(d => ({ ...d, tfIdf: ragTFIDF(ragBuildTF(d.tokens), ragIdf) }));
  ragReady = true;
  console.log(`[WildBot] ✅ RAG puro inicializado con éxito. (${ragDocs.length} vectores indexados).`);
}

function ragQuery(query, threshold = 0.02) {
  if (!ragReady) return null;
  const tokens = ragTokenize(query);
  if (tokens.length === 0) return null;

  const qVec = ragTFIDF(ragBuildTF(tokens), ragIdf);
  
  const bestMatches = ragDocs
    .map((d, i) => ({ score: ragCosineSim(qVec, d.tfIdf), text: d.response, source: d.source }))
    .filter(m => m.score >= threshold)
    .sort((a, b) => b.score - a.score);

  if (bestMatches.length === 0) return null;

  return bestMatches[0].text;
}

// --- Renderizar markdown básico a HTML ---
function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

// ============================================================
// CHATBOT UI
// ============================================================

function initChatbot() {
  initRAG();
  setTimeout(() => {
    const dict = $('ui-dictionary');
    appendChatMsg('bot', dict ? dict.dataset.botGreeting : 'Conectado');
  }, 1200);
}

window.toggleChat = function () {
  chatOpen = !chatOpen;
  $('chatPanel').classList.toggle('open', chatOpen);
  $('chatFab').classList.toggle('open', chatOpen);
  if (chatOpen) {
    $('chatFabBadge').classList.add('hidden');
    setTimeout(() => {
      const msgs = $('chatMessages');
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
      const inp = $('chatInput');
      if (inp) inp.focus();
    }, 350);
  }
};

function appendChatMsg(role, text, raw = false) {
  const container = $('chatMessages');
  if (!container) return;
  const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const isUser = role === 'user';
  const html = raw ? text : renderMarkdown(text);
  
  const tmpl = $('tmpl-chat-msg');
  const clone = tmpl.content.cloneNode(true);
  const cmsg = clone.querySelector('.cmsg');
  cmsg.classList.add(isUser ? 'user' : 'bot');
  
  const avatar = clone.querySelector('.cmsg-avatar');
  avatar.classList.add(isUser ? 'user-av' : 'bot-av');
  const dict = $('ui-dictionary');
  avatar.textContent = isUser ? (dict ? dict.dataset.chatYou : 'Tú') : (dict ? dict.dataset.chatBot : '🌿');
  
  clone.querySelector('.cmsg-bubble').innerHTML = html;
  
  const timeEl = clone.querySelector('.cmsg-time');
  if (isUser) timeEl.classList.add('user-t');
  timeEl.textContent = time;
  
  container.appendChild(clone.firstElementChild);
  container.scrollTop = container.scrollHeight;
}

window.sendChatMessage = function () {
  if (chatBotTyping) return;
  const input = $('chatInput');
  const text = input.value.trim();
  if (!text) return;

  appendChatMsg('user', text);
  input.value = '';
  chatAutoResize(input);

  chatBotTyping = true;
  $('chatTyping').style.display = 'flex';
  const msgs = $('chatMessages');
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(() => {
    $('chatTyping').style.display = 'none';
    chatBotTyping = false;

    const response = ragQuery(text);
    if (response) {
      appendChatMsg('bot', response);
    } else {
      const dict = $('ui-dictionary');
      appendChatMsg('bot', dict ? dict.dataset.botErr : 'No entiendo');
    }
    msgs.scrollTop = msgs.scrollHeight;
  }, 600 + Math.random() * 400);
};

window.chatKeyDown = function (e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
};

window.chatAutoResize = function (el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
};

window.clearChat = function () {
  const msgs = $('chatMessages');
  if (msgs) {
    msgs.innerHTML = '';
    const dict = $('ui-dictionary');
    setTimeout(() => appendChatMsg('bot', dict ? dict.dataset.botReset : 'Limpio'), 150);
  }
};
