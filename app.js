

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
  grid.innerHTML = STATS_CARDS.map(c => `
    <div class="stat-card" style="--card-accent:${c.accent};--icon-bg:${c.iconBg};--fill-color:${c.fill}">
      <div class="stat-card-header">
        <div class="stat-icon">${c.icon}</div>
        <span class="stat-badge ${c.badgeClass}">${c.badge}</span>
      </div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${c.label}</div>
      <div class="stat-progress-track">
        <div class="stat-progress-fill" data-target="${c.progress}"></div>
      </div>
    </div>
  `).join('');
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
  const risks = CONFIG.risks;
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
  subText.textContent = 'ESPECIES';
  svg.appendChild(subText);
  const legend = $('donutLegend');
  legend.innerHTML = risks.map((r, i) => {
    const pct = Math.round(counts[i] / total * 100);
    return `<div class="legend-item">
      <div class="legend-dot-colored" style="background:${colors[i]}"></div>
      <span class="legend-name">${RISK_LABELS[r]}</span>
      <span class="legend-pct" style="color:${colors[i]}">${pct}%</span>
    </div>`;
  }).join('');
}

// ============================================================
// BAR CHART
// ============================================================

function renderBarChart() {
  const container = $('barChart');
  container.innerHTML = TREND_DATA.map(d => `
    <div class="bar-row">
      <span class="bar-label">${d.label}</span>
      <div class="bar-track">
        <div class="bar-fill" data-target="${d.value}" style="background:${d.color};width:0%"></div>
      </div>
      <span class="bar-value" style="color:${d.color}">${d.value}%</span>
    </div>
  `).join('');
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
  container.innerHTML = CONTINENT_DATA.map(d => `
    <div class="cont-row">
      <span class="cont-name">${d.name}</span>
      <div class="cont-track"><div class="cont-fill" data-target="${d.pct}"></div></div>
      <span class="cont-count">${d.count}</span>
    </div>
  `).join('');
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
  const riskColor = RISK_COLORS[animal.risk];
  panel.innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
      <span style="font-size:2rem">${animal.emoji}</span>
      <div>
        <div style="font-weight:700;font-size:0.95rem">${animal.name} <small style="font-style:italic;color:#6b7280">— ${animal.latin}</small></div>
        <div style="font-size:0.8rem;margin-top:0.3rem;display:flex;gap:1rem;flex-wrap:wrap">
          <span style="color:${riskColor}">● ${RISK_LABELS[animal.risk]}</span>
          <span style="color:#a7f3d0">${UI_TEXT.labels.population}: ~${formatNumber(animal.population)}</span>
          <span style="color:#a7f3d0">${UI_TEXT.labels.lifespan}: ${animal.lifespan} años</span>
          <span style="color:#a7f3d0">${UI_TEXT.labels.habitat}: ${animal.habitat}</span>
        </div>
      </div>
    </div>`;
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
  const risks = ['all', ...CONFIG.risks];
  $('continentFilters').innerHTML = continents.map(c => `<button class="filter-tag ${c === 'all' ? 'active' : ''}" onclick="setContinentFilter('${c}')">${CONTINENT_LABELS[c] || c}</button>`).join('');
  $('riskFilters').innerHTML = risks.map(r => `<button class="filter-tag ${r === 'all' ? 'risk-active' : ''}" onclick="setRiskFilter('${r}')">${RISK_UI_LABELS[r]}</button>`).join('');
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
  $('speciesCount').textContent = UI_TEXT.speciesCount(filtered.length, ANIMALS.length);
  renderSpeciesCards(filtered);
};

// ============================================================
// SPECIES CARDS
// ============================================================

function renderSpeciesCards(list) {
  const grid = $('speciesGrid');
  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">${UI_TEXT.noSpeciesFound}</div>`;
    return;
  }
  grid.innerHTML = list.map((a, idx) => {
    const trend = a.trend >= 0
      ? `<span style="color:#34d399">↑ +${a.trend}%</span>`
      : `<span style="color:#f87171">↓ ${a.trend}%</span>`;
    return `
      <div class="species-card" style="animation-delay:${idx * 0.05}s">
        <div class="species-header">
          <span class="species-emoji">${a.emoji}</span>
          <div>
            <div class="species-title">${a.name}</div>
            <div class="species-latin">${a.latin}</div>
          </div>
        </div>
        <div class="species-body">
          <div class="species-tags">
            <span class="tag tag-continent">${a.continent.replace('SudAmerica', 'S.América').replace('NorteAmerica', 'N.América')}</span>
            <span class="tag tag-${a.risk}">${RISK_LABELS[a.risk]}</span>
          </div>
          <div class="species-stats">
            <div class="sp-stat"><span class="sp-stat-label">${UI_TEXT.labels.population}</span><span class="sp-stat-value">~${formatNumber(a.population)}</span></div>
            <div class="sp-stat"><span class="sp-stat-label">${UI_TEXT.labels.lifespan}</span><span class="sp-stat-value">${a.lifespan} años</span></div>
            <div class="sp-stat"><span class="sp-stat-label">${UI_TEXT.labels.habitat}</span><span class="sp-stat-value">${a.habitat}</span></div>
            <div class="sp-stat"><span class="sp-stat-label">${UI_TEXT.labels.trend}</span><span class="sp-stat-value">${trend}</span></div>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ============================================================
// MISSIONS & GAMIFICATION
// ============================================================

function renderMissions() {
  $('missionsList').innerHTML = MISSIONS.map(m => `
    <div class="mission-item ${m.completed ? 'completed' : ''}" id="mission-${m.id}" onclick="toggleMission('${m.id}')">
      <div class="mission-check"></div>
      <div class="mission-text">
        <span class="mission-title">${m.icon} ${m.title}</span>
        <span class="mission-sub">${m.desc}</span>
      </div>
      <span class="mission-xp">+${m.xp} XP</span>
    </div>`).join('');
}

function renderAchievements() {
  $('achievementsList').innerHTML = ACHIEVEMENTS.map(a => `
    <div class="achievement-item ${a.unlocked ? 'unlocked' : 'locked'}" id="ach-${a.id}">
      <span class="achievement-icon">${a.icon}</span>
      <div>
        <span class="achievement-name">${a.name}</span>
        <span class="achievement-desc">${a.desc}</span>
      </div>
      <span class="achievement-badge">${a.unlocked ? '✓ DESBLOQUEADO' : '🔒'}</span>
    </div>`).join('');
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
  $('userRank').textContent = UI_TEXT.userRankLabel(lvl.rank, lvl.label);
  $('userName').textContent = lvl.rank >= 3 ? UI_TEXT.highRankName : UI_TEXT.lowRankName;
}

// ============================================================
// NAVBAR SCROLL
// ============================================================

function initNavbar() {
  const navbar = $('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    const sections = CONFIG.navSections;
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

// --- TF-IDF ---
const SYNONYMS = {
  'pagina': 'wildtrack', 'sitio': 'wildtrack', 'web': 'wildtrack', 'aqui': 'wildtrack', 'esto': 'wildtrack',
  'titulo': 'wildtrack', 'nombre': 'wildtrack', 'bot': 'wildbot', 'tu': 'wildbot'
};

function ragTokenize(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ') // permitir números
    .split(/\s+/)
    .map(t => SYNONYMS[t] || t) // reemplazar por sinónimos si aplica
    .filter(t => t.length >= 2 && !STOPWORDS_ES.has(t)); // restaurar stopwords
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
    .split(/\r?\n/)           // dividir por CADA línea individual
    .map(p => p.trim())
    .filter(p => p.length > 3); // permitir fragmentos muy cortos (ej: "Hola!")
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

  // SCRAPING DINÁMICO DEL DOM (Exigencia del usuario: "que se llene de conocimiento con la web")
  console.log('[WildBot] 🌐 Extrayendo conocimiento dinámico de la página web (DOM Scraping)...');
  const pageText = document.body.innerText;
  const pageFragments = parseTxtToFragments(pageText).filter(f => f.length > 15); // Filtramos muy cortos para evitar ruido UI
  const domDocs = pageFragments.map(f => ({
    text: f,
    response: `Según la información actual en la página web: ${f}`,
    source: 'dom'
  }));
  docs = [...docs, ...domDocs];
  console.log(`[WildBot] 🌐 ${domDocs.length} fragmentos extraídos dinámicamente de la web.`);

  if (docs.length === 0) {
    ragReady = false;
    appendChatMsg('bot', '⚠️ No he podido cargar ninguna base de conocimiento ni extraer datos de la web.', true);
    return;
  }

  const rawDocs = docs.map(d => ({ ...d, tokens: ragTokenize(d.text + ' ' + d.response) }));
  ragIdf = ragBuildIDF(rawDocs);
  ragDocs = rawDocs.map(d => ({ ...d, tfIdf: ragTFIDF(ragBuildTF(d.tokens), ragIdf) }));
  ragReady = true;
  console.log(`[WildBot] ✅ RAG listo — ${ragDocs.length} vectores indexados (TXT + DOM)`);
}

function ragQuery(query, threshold = CONFIG.ragThreshold) {
  if (!ragReady) return null;
  const qVec = ragTFIDF(ragBuildTF(ragTokenize(query)), ragIdf);
  const best = ragDocs
    .map((d, i) => ({ score: ragCosineSim(qVec, d.tfIdf), i }))
    .sort((a, b) => b.score - a.score)[0];
  return (best && best.score >= threshold) ? ragDocs[best.i].response : null;
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
  const grid = $('chatEmojiGrid');
  if (grid) {
    grid.innerHTML = CHAT_EMOJIS.map(e =>
      `<button class="cemoji-btn" onclick="insertChatEmoji('${e}')">${e}</button>`
    ).join('');
  }
  initRAG();
  setTimeout(() => {
    appendChatMsg('bot', UI_TEXT.botGreeting);
  }, 1200);
  document.addEventListener('click', e => {
    if (!e.target.closest('#chatEmojiPicker') && !e.target.closest('.chat-emoji-toggle')) {
      const p = $('chatEmojiPicker');
      if (p) p.classList.remove('open');
    }
  });
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
  const div = document.createElement('div');
  div.innerHTML = `
    <div class="cmsg ${isUser ? 'user' : 'bot'}">
      <div class="cmsg-avatar ${isUser ? 'user-av' : 'bot-av'}">${isUser ? 'Tú' : '🌿'}</div>
      <div class="cmsg-bubble">${html}</div>
    </div>
    <div class="cmsg-time ${isUser ? 'user-t' : ''}">${time}</div>`;
  container.appendChild(div);
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
      appendChatMsg('bot', UI_TEXT.botError);
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
    setTimeout(() => appendChatMsg('bot', UI_TEXT.botReset), 150);
  }
};

window.toggleChatEmoji = function () {
  const p = $('chatEmojiPicker');
  if (p) p.classList.toggle('open');
};

window.insertChatEmoji = function (emoji) {
  const inp = $('chatInput');
  if (!inp) return;
  const pos = inp.selectionStart || inp.value.length;
  inp.value = inp.value.slice(0, pos) + emoji + inp.value.slice(pos);
  inp.focus();
  $('chatEmojiPicker').classList.remove('open');
};
