/* =============================================
   WildTrack — App Logic
   JSON Data + Dashboard + Map + Filter + Gamification
   ============================================= */

'use strict';

// ============================================================
// DATA
// ============================================================

const ANIMALS = [
  { id: 1,  emoji: '🦁', name: 'León Africano',       latin: 'Panthera leo',          continent: 'Africa',    risk: 'vulnerable', population: 23000,  lifespan: 14, trend: -3.5, habitat: 'Sabana',    mapMarker: { top: 52, left: 50 } },
  { id: 2,  emoji: '🐼', name: 'Panda Gigante',        latin: 'Ailuropoda melanoleuca', continent: 'Asia',      risk: 'vulnerable', population: 1864,   lifespan: 20, trend: +2.1, habitat: 'Bambusar', mapMarker: { top: 38, left: 72 } },
  { id: 3,  emoji: '🐅', name: 'Tigre de Bengala',     latin: 'Panthera tigris tigris', continent: 'Asia',      risk: 'peligro',    population: 2500,   lifespan: 15, trend: +1.8, habitat: 'Selva',     mapMarker: { top: 42, left: 66 } },
  { id: 4,  emoji: '🦏', name: 'Rinoceronte Negro',    latin: 'Diceros bicornis',       continent: 'Africa',    risk: 'critico',    population: 6195,   lifespan: 35, trend: +3.2, habitat: 'Sabana',    mapMarker: { top: 60, left: 52 } },
  { id: 5,  emoji: '🐘', name: 'Elefante Asiático',    latin: 'Elephas maximus',        continent: 'Asia',      risk: 'peligro',    population: 48000,  lifespan: 60, trend: -1.4, habitat: 'Bosque',    mapMarker: { top: 45, left: 68 } },
  { id: 6,  emoji: '🦅', name: 'Águila Arpía',         latin: 'Harpia harpyja',         continent: 'SudAmerica',risk: 'vulnerable', population: 50000,  lifespan: 35, trend: -0.8, habitat: 'Selva',     mapMarker: { top: 60, left: 28 } },
  { id: 7,  emoji: '🐋', name: 'Ballena Azul',         latin: 'Balaenoptera musculus',  continent: 'Oceania',   risk: 'peligro',    population: 10000,  lifespan: 90, trend: +0.5, habitat: 'Océano',   mapMarker: { top: 65, left: 78 } },
  { id: 8,  emoji: '🦊', name: 'Zorro Ártico',         latin: 'Vulpes lagopus',         continent: 'Europa',    risk: 'menor',      population: 630000, lifespan: 6,  trend: -5.1, habitat: 'Tundra',    mapMarker: { top: 18, left: 45 } },
  { id: 9,  emoji: '🐊', name: 'Caimán del Orinoco',   latin: 'Crocodylus intermedius', continent: 'SudAmerica',risk: 'critico',    population: 1500,   lifespan: 75, trend: +1.0, habitat: 'Río',       mapMarker: { top: 55, left: 26 } },
  { id: 10, emoji: '🦁', name: 'Puma',                 latin: 'Puma concolor',          continent: 'NorteAmerica', risk: 'menor',  population: 80000,  lifespan: 12, trend: -2.2, habitat: 'Montaña',   mapMarker: { top: 38, left: 18 } },
  { id: 11, emoji: '🐺', name: 'Lobo Gris',            latin: 'Canis lupus',            continent: 'Europa',    risk: 'menor',      population: 300000, lifespan: 13, trend: +1.1, habitat: 'Bosque',    mapMarker: { top: 30, left: 44 } },
  { id: 12, emoji: '🦓', name: 'Cebra de Grevy',       latin: 'Equus grevyi',           continent: 'Africa',    risk: 'peligro',    population: 2250,   lifespan: 25, trend: -4.0, habitat: 'Sabana',    mapMarker: { top: 48, left: 54 } },
  { id: 13, emoji: '🦁', name: 'Guepardo',             latin: 'Acinonyx jubatus',       continent: 'Africa',    risk: 'vulnerable', population: 7000,   lifespan: 12, trend: -3.0, habitat: 'Sabana',    mapMarker: { top: 50, left: 54 } },
  { id: 14, emoji: '🦈', name: 'Tiburón Blanco',       latin: 'Carcharodon carcharias', continent: 'Oceania',   risk: 'vulnerable', population: 3500,   lifespan: 70, trend: -2.5, habitat: 'Océano',   mapMarker: { top: 68, left: 74 } },
  { id: 15, emoji: '🦜', name: 'Guacamayo Jacinto',    latin: 'Anodorhynchus hyacinthinus', continent: 'SudAmerica', risk: 'vulnerable', population: 6500, lifespan: 50, trend: +0.3, habitat: 'Pantanal', mapMarker: { top: 62, left: 30 } },
  { id: 16, emoji: '🐆', name: 'Leopardo de Amur',     latin: 'Panthera pardus orientalis', continent: 'Asia',  risk: 'critico',    population: 100,    lifespan: 15, trend: +5.0, habitat: 'Bosque',    mapMarker: { top: 28, left: 78 } },
];

const RISK_LABELS = { critico: 'Crítico', peligro: 'En Peligro', vulnerable: 'Vulnerable', menor: 'Preocupación Menor' };
const RISK_COLORS = { critico: '#ef4444', peligro: '#f97316', vulnerable: '#eab308', menor: '#3b82f6' };

const STATS_CARDS = [
  { icon: '🦁', label: 'Especies Monitoreadas', value: '16', unit: '', progress: 100, badge: '↑ 3 nuevas', badgeClass: 'badge-up', accent: '#10b981', iconBg: 'rgba(16,185,129,0.08)', fill: '#10b981' },
  { icon: '🔴', label: 'En Estado Crítico',      value: '3',  unit: '',  progress: 19,  badge: '↑ Alerta',  badgeClass: 'badge-down', accent: '#ef4444', iconBg: 'rgba(239,68,68,0.08)',  fill: '#ef4444' },
  { icon: '👥', label: 'Población Total (M)',     value: '1.1', unit: 'M', progress: 45, badge: '↓ 1.8%',   badgeClass: 'badge-warn', accent: '#f97316', iconBg: 'rgba(249,115,22,0.08)', fill: '#f97316' },
  { icon: '📅', label: 'Esperanza de Vida Prom.', value: '34', unit: 'años', progress: 68, badge: 'Estable', badgeClass: 'badge-up', accent: '#3b82f6', iconBg: 'rgba(59,130,246,0.08)', fill: '#3b82f6' },
];

const CONTINENT_DATA = [
  { name: 'Asia',          count: 5, pct: 88 },
  { name: 'África',        count: 4, pct: 75 },
  { name: 'Sudamérica',    count: 3, pct: 60 },
  { name: 'Europa',        count: 2, pct: 40 },
  { name: 'Norte América', count: 1, pct: 25 },
  { name: 'Oceanía',       count: 2, pct: 35 },
];

const TREND_DATA = [
  { label: 'Ballena Azul',  value: 72, color: '#3b82f6' },
  { label: 'Panda Gigante', value: 91, color: '#10b981' },
  { label: 'L. de Amur',   value: 85, color: '#10b981' },
  { label: 'Tigre Bengala', value: 63, color: '#f97316' },
  { label: 'Guepardo',      value: 40, color: '#ef4444' },
  { label: 'Zorro Ártico',  value: 28, color: '#ef4444' },
];

const MISSIONS = [
  { id: 'm1', title: 'Explorador de la Sabana',  desc: 'Observa 5 especies africanas',  xp: 15, icon: '🌾', completed: false },
  { id: 'm2', title: 'Protector del Ártico',     desc: 'Aprende sobre 3 especies polares', xp: 20, icon: '❄️', completed: false },
  { id: 'm3', title: 'Guardián del Océano',      desc: 'Descubre 4 especies marinas',   xp: 25, icon: '🌊', completed: false },
  { id: 'm4', title: 'Rastreador de Felinos',    desc: 'Identifica 4 grandes felinos',  xp: 18, icon: '🐾', completed: false },
  { id: 'm5', title: 'Defensor de la Selva',     desc: 'Explora animales de Amazonas',  xp: 22, icon: '🌿', completed: false },
];

const ACHIEVEMENTS = [
  { id: 'a1', icon: '🥇', name: 'Primer Avistamiento',  desc: 'Completa tu primera misión', unlocked: false },
  { id: 'a2', icon: '🌿', name: 'Naturalista',           desc: 'Alcanza nivel 3', unlocked: false },
  { id: 'a3', icon: '🦅', name: 'Maestro de la Fauna',   desc: 'Completa todas las misiones', unlocked: false },
  { id: 'a4', icon: '🔭', name: 'Gran Explorador',       desc: 'Acumula 100 XP', unlocked: false },
];

const LEVELS = [
  { min: 0,   max: 100,  label: 'Observador',     rank: 1 },
  { min: 100, max: 200,  label: 'Rastreador',     rank: 2 },
  { min: 200, max: 350,  label: 'Naturalista',    rank: 3 },
  { min: 350, max: 500,  label: 'Explorador',     rank: 4 },
  { min: 500, max: 999,  label: 'Guardián Elite', rank: 5 },
];

// ============================================================
// STATE
// ============================================================

let userXP = 0;
let activeContinentFilter = 'all';
let activeRiskFilter = 'all';
let mapFilter = 'all';

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
    <div class="stat-card" style="--card-accent:${c.accent}; --icon-bg:${c.iconBg}; --fill-color:${c.fill}">
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

  // Animate progress bars after render
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

  // SVG donut
  const r = 72, cx = 100, cy = 100;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const colors = risks.map(r => RISK_COLORS[r]);
  const gaps = 3;

  const svg = $('donutChart');
  svg.innerHTML = '';

  // Background circle
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

    setTimeout(() => {
      circle.setAttribute('stroke-dasharray', `${dashLen} ${circumference - dashLen}`);
    }, 300 + i * 100);

    offset += pct * circumference;
  });

  // Center text
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

  // Legend
  const legend = $('donutLegend');
  legend.innerHTML = risks.map((r, i) => {
    const pct = Math.round(counts[i] / total * 100);
    return `
      <div class="legend-item">
        <div class="legend-dot-colored" style="background:${colors[i]}"></div>
        <span class="legend-name">${RISK_LABELS[r]}</span>
        <span class="legend-pct" style="color:${colors[i]}">${pct}%</span>
      </div>`;
  }).join('');
}

// ============================================================
// BAR CHART (population trend health)
// ============================================================

function renderBarChart() {
  const container = $('barChart');
  container.innerHTML = TREND_DATA.map(d => `
    <div class="bar-row">
      <span class="bar-label">${d.label}</span>
      <div class="bar-track">
        <div class="bar-fill" data-target="${d.value}" style="background:${d.color}; width:0%"></div>
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
      <div class="cont-track">
        <div class="cont-fill" data-target="${d.pct}"></div>
      </div>
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
  const x = e.clientX - rect.left + 12;
  const y = e.clientY - rect.top - 10;

  tooltip.style.display = 'block';
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
  tooltip.innerHTML = `<strong>${animal.emoji} ${animal.name}</strong><br/><small style="color:#6b7280">${RISK_LABELS[animal.risk]}</small>`;
}

function hideMapTooltip() {
  $('mapTooltip').style.display = 'none';
}

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
          <span style="color:#a7f3d0">👥 Población: ~${formatNumber(animal.population)}</span>
          <span style="color:#a7f3d0">📅 Esperanza de vida: ${animal.lifespan} años</span>
          <span style="color:#a7f3d0">🌿 Hábitat: ${animal.habitat}</span>
        </div>
      </div>
    </div>
  `;
}

window.filterMap = function(filter) {
  mapFilter = filter;
  document.querySelectorAll('.map-btn').forEach(b => b.classList.remove('active'));

  const btnMap = { all: $('mapAll'), critico: $('mapCritico'), peligro: $('mapPeligro'), vulnerable: $('mapVulnerable') };
  if (btnMap[filter]) btnMap[filter].classList.add('active');

  document.querySelectorAll('.map-marker').forEach(m => {
    if (filter === 'all' || m.dataset.risk === filter) {
      m.style.opacity = '1';
      m.style.pointerEvents = 'auto';
    } else {
      m.style.opacity = '0.12';
      m.style.pointerEvents = 'none';
    }
  });
};

// ============================================================
// FILTER BAR
// ============================================================

function renderFilterTags() {
  const continents = ['all', ...new Set(ANIMALS.map(a => a.continent))];
  const risks = ['all', 'critico', 'peligro', 'vulnerable', 'menor'];

  $('continentFilters').innerHTML = continents.map(c => {
    const labels = { all: '🌍 Todos', Africa: '🌍 África', Asia: '🌏 Asia', SudAmerica: '🌎 Sudamérica', NorteAmerica: '🌎 N. América', Europa: '🏔️ Europa', Oceania: '🦘 Oceanía' };
    return `<button class="filter-tag ${c === 'all' ? 'active' : ''}" onclick="setContinentFilter('${c}')">${labels[c] || c}</button>`;
  }).join('');

  $('riskFilters').innerHTML = risks.map(r => {
    const labels = { all: '⚡ Todos los riesgos', critico: '🔴 Crítico', peligro: '🟠 En Peligro', vulnerable: '🟡 Vulnerable', menor: '🔵 Menor' };
    return `<button class="filter-tag ${r === 'all' ? 'risk-active' : ''}" onclick="setRiskFilter('${r}')">${labels[r]}</button>`;
  }).join('');
}

window.setContinentFilter = function(continent) {
  activeContinentFilter = continent;
  document.querySelectorAll('#continentFilters .filter-tag').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  filterAnimals();
};

window.setRiskFilter = function(risk) {
  activeRiskFilter = risk;
  document.querySelectorAll('#riskFilters .filter-tag').forEach(b => b.classList.remove('risk-active'));
  event.target.classList.add('risk-active');
  filterAnimals();
};

window.filterAnimals = function() {
  const query = $('searchInput').value.toLowerCase();
  const filtered = ANIMALS.filter(a => {
    const matchContinent = activeContinentFilter === 'all' || a.continent === activeContinentFilter;
    const matchRisk = activeRiskFilter === 'all' || a.risk === activeRiskFilter;
    const matchSearch = a.name.toLowerCase().includes(query) || a.latin.toLowerCase().includes(query) || a.habitat.toLowerCase().includes(query);
    return matchContinent && matchRisk && matchSearch;
  });

  $('speciesCount').textContent = `Mostrando ${filtered.length} de ${ANIMALS.length} especies`;
  renderSpeciesCards(filtered);
};

// ============================================================
// SPECIES CARDS
// ============================================================

function renderSpeciesCards(list) {
  const grid = $('speciesGrid');
  if (list.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted)">🔍 No se encontraron especies con estos filtros.</div>`;
    return;
  }

  grid.innerHTML = list.map((a, idx) => {
    const trend = a.trend >= 0 ? `<span style="color:#34d399">↑ +${a.trend}%</span>` : `<span style="color:#f87171">↓ ${a.trend}%</span>`;
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
            <span class="tag tag-continent">${a.continent.replace('SudAmerica','S.América').replace('NorteAmerica','N.América')}</span>
            <span class="tag tag-${a.risk}">${RISK_LABELS[a.risk]}</span>
          </div>
          <div class="species-stats">
            <div class="sp-stat">
              <span class="sp-stat-label">👥 Población</span>
              <span class="sp-stat-value">~${formatNumber(a.population)}</span>
            </div>
            <div class="sp-stat">
              <span class="sp-stat-label">📅 Esperanza vida</span>
              <span class="sp-stat-value">${a.lifespan} años</span>
            </div>
            <div class="sp-stat">
              <span class="sp-stat-label">🌿 Hábitat</span>
              <span class="sp-stat-value">${a.habitat}</span>
            </div>
            <div class="sp-stat">
              <span class="sp-stat-label">📈 Tendencia</span>
              <span class="sp-stat-value">${trend}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// MISSIONS & GAMIFICATION
// ============================================================

function renderMissions() {
  const list = $('missionsList');
  list.innerHTML = MISSIONS.map(m => `
    <div class="mission-item ${m.completed ? 'completed' : ''}" id="mission-${m.id}" onclick="toggleMission('${m.id}')">
      <div class="mission-check"></div>
      <div class="mission-text">
        <span class="mission-title">${m.icon} ${m.title}</span>
        <span class="mission-sub">${m.desc}</span>
      </div>
      <span class="mission-xp">+${m.xp} XP</span>
    </div>
  `).join('');
}

function renderAchievements() {
  const list = $('achievementsList');
  list.innerHTML = ACHIEVEMENTS.map(a => `
    <div class="achievement-item ${a.unlocked ? 'unlocked' : 'locked'}" id="ach-${a.id}">
      <span class="achievement-icon">${a.icon}</span>
      <div>
        <span class="achievement-name">${a.name}</span>
        <span class="achievement-desc">${a.desc}</span>
      </div>
      <span class="achievement-badge">${a.unlocked ? '✓ DESBLOQUEADO' : '🔒'}</span>
    </div>
  `).join('');
}

window.toggleMission = function(missionId) {
  const mission = MISSIONS.find(m => m.id === missionId);
  if (!mission) return;

  mission.completed = !mission.completed;
  userXP = mission.completed ? userXP + mission.xp : Math.max(0, userXP - mission.xp);

  const el = $(`mission-${missionId}`);
  el.classList.toggle('completed', mission.completed);

  updateXP();
  checkAchievements();
};

function checkAchievements() {
  const completedCount = MISSIONS.filter(m => m.completed).length;
  const allDone = completedCount === MISSIONS.length;

  // First completion
  if (completedCount >= 1) { ACHIEVEMENTS[0].unlocked = true; }
  // Level 3
  const lvl = getLevel();
  if (lvl.rank >= 3) { ACHIEVEMENTS[1].unlocked = true; }
  // All missions
  if (allDone) { ACHIEVEMENTS[2].unlocked = true; }
  // 100 XP
  if (userXP >= 100) { ACHIEVEMENTS[3].unlocked = true; }

  renderAchievements();
}

function getLevel() {
  return LEVELS.find(l => userXP >= l.min && userXP < l.max) || LEVELS[LEVELS.length - 1];
}

function updateXP() {
  const lvl = getLevel();
  const xpInLevel = userXP - lvl.min;
  const xpRange = lvl.max - lvl.min;
  const pct = Math.min(100, (xpInLevel / xpRange) * 100);

  $('xpDisplay').textContent = userXP;
  $('xpNext').textContent = `/ ${lvl.max}`;
  $('xpBarFill').style.width = pct + '%';
  $('xpNav').textContent = userXP;
  $('userRank').textContent = `Nivel ${lvl.rank} — ${lvl.label}`;
  $('userName').textContent = lvl.rank >= 3 ? 'Gran Explorador' : 'Explorador';
}

// ============================================================
// NAVBAR SCROLL
// ============================================================

function initNavbar() {
  const navbar = $('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    // Active nav links
    const sections = ['dashboard', 'map', 'species', 'missions'];
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) current = id;
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
}

// ============================================================
// INTERSECTION OBSERVER (animate on scroll)
// ============================================================

function initScrollAnimations() {
  const cards = document.querySelectorAll('.glass-card, .stat-card, .species-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // Trigger bar animations when charts come into view
        e.target.querySelectorAll('[data-target]').forEach(bar => {
          bar.style.width = bar.dataset.target + '%';
        });
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(c => observer.observe(c));
}

// ============================================================
// INIT
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

  // Init chatbot after main content
  initChatbot();
});

// ======================================================================
//  WILDBOT — RAG-POWERED CHATBOT v2
//  • Intent detection (greetings, animal lists, missions, stats…)
//  • Dynamic RAG knowledge base built from ANIMALS[], MISSIONS[], rag-data.json
//  • TF-IDF + Cosine Similarity retrieval
//  • Graceful fallback chain: Intent → RAG → keyword → generic
// ======================================================================

/* ---- State ---- */
let ragDocs  = [];
let ragReady = false;
let ragIdf   = {};
let chatOpen = false;
let chatBotTyping = false;

const CHAT_EMOJIS = [
  '🌿','🦁','🐼','🐅','🦏','🐘','🦅','🐋','🌍','🌎',
  '🎯','🔴','🟠','🟡','💚','⭐','🌟','✨','🔥','💡',
  '👍','❤️','🙌','💪','🎉','🏆','📊','🔬','🌱','🦋',
];


// ==================== 2. RAG ENGINE ====================
// Spanish stopwords (filtered out of TF-IDF)
const STOPWORDS_ES = new Set([
  'que','el','la','los','las','de','del','en','y','es','se','un','una','por',
  'con','para','una','no','si','me','te','su','al','lo','más','ya','mi','le',
  'pero','como','este','esta','esto','eso','esa','son','hay','tiene','son','han',
  'fue','ser','estar','era','o','a','e','i','u','sobre','entre','sin','hasta',
  'desde','también','todo','todos','todas','muy','bien','cuando','donde','quien',
  'qué','que','cómo','como','cuándo','cuánto','cuanto','sería','poder','hacer',
]);

function ragTokenize(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // strip accents for matching
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS_ES.has(t));
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
  Object.keys(idf).forEach(k => {
    idf[k] = Math.log((N + 1) / (idf[k] + 1)) + 1;
  });
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

async function initRAG() {
  let allDocs = [];
  
  // Try to load conocimiento.txt (RAG Document required by user)
  try {
    const res = await fetch('conocimiento.txt');
    if (res.ok) {
        const text = await res.text();
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 10);
        const txtDocs = paragraphs.map(p => ({ text: p, response: p }));
        allDocs = txtDocs;
        console.log(`[WildBot RAG] ✅ Loaded ${txtDocs.length} docs from conocimiento.txt`);
    }
  } catch(e) { console.warn("No conocimiento.txt found"); }

  // Vectorize
  const rawDocs = allDocs.map(d => ({
    text: d.text,
    response: d.response,
    tokens: ragTokenize(d.text + ' ' + d.response),
  }));

  ragIdf  = ragBuildIDF(rawDocs);
  ragDocs = rawDocs.map(d => ({
    text:     d.text,
    response: d.response,
    tfIdf:    ragTFIDF(ragBuildTF(d.tokens), ragIdf),
  }));

  ragReady = true;
  console.log(`[WildBot RAG] ✅ Ready — ${ragDocs.length} vectors indexed`);
}

function ragQuery(query, threshold = 0.09) {
  if (!ragReady) return null;
  const qVec = ragTFIDF(ragBuildTF(ragTokenize(query)), ragIdf);
  const best = ragDocs
    .map((d, i) => ({ score: ragCosineSim(qVec, d.tfIdf), i }))
    .sort((a, b) => b.score - a.score)[0];
  if (best && best.score >= threshold) {
    return { response: ragDocs[best.i].response, score: best.score };
  }
  return null;
}

function formatRAGText(raw) {
  return raw
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

// ==================== 3. CHATBOT UI ====================

function initChatbot() {
  // Emoji grid
  const grid = $('chatEmojiGrid');
  if (grid) {
    grid.innerHTML = CHAT_EMOJIS.map(e =>
      `<button class="cemoji-btn" onclick="insertChatEmoji('${e}')">${e}</button>`
    ).join('');
  }

  // Load RAG
  initRAG();

  // Greeting
  setTimeout(() => {
    appendChatMsg('bot',
      '¡Bienvenido a **WildTrack**! 🌿 Soy **WildBot**, tu guía de fauna silvestre.\n\nPuedo decirte sobre los **16 animales monitoreados**, sus poblaciones, niveles de riesgo, las **misiones de conservación**, y mucho más. ¿Qué quieres saber?'
    );
  }, 1200);

  // Close emoji on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('#chatEmojiPicker') && !e.target.closest('.chat-emoji-toggle')) {
      const p = $('chatEmojiPicker');
      if (p) p.classList.remove('open');
    }
  });
}

window.toggleChat = function() {
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

function appendChatMsg(role, text, isRaw = false) {
  const container = $('chatMessages');
  if (!container) return;
  const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const isUser = role === 'user';
  const html = isRaw ? text : formatRAGText(text);
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

window.sendChatMessage = function() {
  if (chatBotTyping) return;
  const input = $('chatInput');
  const text = input.value.trim();
  if (!text) return;

  appendChatMsg('user', text);
  input.value = '';
  chatAutoResize(input);

  const qr = $('chatQuickReplies');
  if (qr) qr.style.display = 'none';

  chatBotTyping = true;
  $('chatTyping').style.display = 'flex';
  const msgs = $('chatMessages');
  msgs.scrollTop = msgs.scrollHeight;

  setTimeout(() => {
    $('chatTyping').style.display = 'none';
    chatBotTyping = false;

    // Solo usar el motor RAG (sin preguntas predeterminadas / Intents)
    const rag = ragQuery(text);
    if (rag) {
      const pct = Math.round(rag.score * 100);
      const badge = `<span style="display:inline-block;margin-top:0.5rem;font-size:0.63rem;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.25);color:var(--emerald-light);border-radius:999px;padding:2px 8px;">🔍 RAG · ${pct}% relevancia</span>`;
      appendChatMsg('bot', formatRAGText(rag.response) + '<br>' + badge, true);
      msgs.scrollTop = msgs.scrollHeight;
      return;
    }

    // Priority 3: generic fallback
    const fallbacks = [
      '🌿 No encontré una respuesta exacta en mis documentos. Intenta preguntarlo de otra manera.',
      '🔍 Intenta ser más específico con tu pregunta para que pueda buscarlo en mi base de conocimientos.',
    ];
    appendChatMsg('bot', fallbacks[Math.floor(Math.random() * fallbacks.length)]);
    msgs.scrollTop = msgs.scrollHeight;

  }, 600 + Math.random() * 500);
};

window.sendQuickReply = function(text) {
  const inp = $('chatInput');
  if (inp) { inp.value = text; sendChatMessage(); }
};

window.chatKeyDown = function(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
};

window.chatAutoResize = function(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
};

window.clearChat = function() {
  const msgs = $('chatMessages');
  if (msgs) {
    msgs.innerHTML = '';
    setTimeout(() => appendChatMsg('bot',
      `🌿 Chat limpiado. RAG ${ragReady ? `✅ activo con **${ragDocs.length} documentos**` : '⚠️ cargando…'}. ¿En qué puedo ayudarte?`
    ), 150);
  }
};

window.toggleChatEmoji = function() {
  const p = $('chatEmojiPicker');
  if (p) p.classList.toggle('open');
};

window.insertChatEmoji = function(emoji) {
  const inp = $('chatInput');
  if (!inp) return;
  const pos = inp.selectionStart || inp.value.length;
  inp.value = inp.value.slice(0, pos) + emoji + inp.value.slice(pos);
  inp.focus();
  $('chatEmojiPicker').classList.remove('open');
};


