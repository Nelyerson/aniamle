/* =============================================
   WildTrack — App Logic
   JSON Data + Dashboard + Map + Filter + Gamification
   ============================================= */

'use strict';

// ============================================================
// DATA
// ============================================================



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

// ==================== 1. INTENT DETECTION ====================
// These run FIRST — before any RAG or keyword matching.
// Each intent has a test() and a reply() function.

const INTENTS = [
  // Greeting
  {
    test: q => /^(hola|hi|hey|saludos|buenas|buenos días|buen día|good morning|ola)[\s!¡.]*$/i.test(q.trim()),
    reply: () => '¡Hola! 🌿 Soy **WildBot**, tu guía de fauna silvestre con IA. Puedo responderte sobre:\n\n• 🦁 **Todos los animales** monitoreados\n• 🔴 Especies en peligro o extinción\n• 🌍 Fauna por continente\n• 🎯 Misiones, XP y logros\n• 📊 Estadísticas de biodiversidad\n\n¿Qué quieres saber?'
  },

  // List ALL animals
  {
    test: q => /(todos|todas|lista|listar|dame|muéstrame|mostrar|cuales|cuáles).*(animales?|especies?|fauna)/i.test(q) ||
               /(animales?|especies?|fauna).*(todos|todas|lista|todas las|todos los)/i.test(q) ||
               /^(animales?|especies?|fauna)\s*[?!]*$/i.test(q.trim()),
    reply: () => {
      const list = ANIMALS.map(a =>
        `• ${a.emoji} **${a.name}** — *${a.latin}* | ${RISK_LABELS[a.risk]} | ${a.continent}`
      ).join('\n');
      return `🌍 **Las ${ANIMALS.length} especies monitoreadas en WildTrack:**\n\n${list}\n\n¿Quieres saber más sobre alguna en particular?`;
    }
  },

  // Animals by RISK — crítico
  {
    test: q => /(critico|crítico|críticas?|peligro crítico|extinción|extincion|extintas?)/i.test(q),
    reply: () => {
      const list = ANIMALS.filter(a => a.risk === 'critico');
      return `🔴 **Especies en Peligro Crítico (${list.length}):**\n\n${
        list.map(a => `• ${a.emoji} **${a.name}** *(${a.latin})*\n  👥 Población: ~${formatNumber(a.population)} · 📅 Esperanza de vida: ${a.lifespan} años · 🌿 Hábitat: ${a.habitat}`).join('\n\n')
      }\n\n¡Estas especies necesitan acción urgente de conservación!`;
    }
  },

  // Animals by RISK — en peligro
  {
    test: q => /\b(en peligro|peligro[^s])\b/i.test(q) && !/crítico/i.test(q),
    reply: () => {
      const list = ANIMALS.filter(a => a.risk === 'peligro');
      return `🟠 **Especies En Peligro (${list.length}):**\n\n${
        list.map(a => `• ${a.emoji} **${a.name}** *(${a.latin})*\n  👥 ~${formatNumber(a.population)} individuos · 🌿 ${a.habitat}`).join('\n\n')
      }`;
    }
  },

  // Animals by RISK — vulnerable
  {
    test: q => /\b(vulnerable|vulnerables)\b/i.test(q),
    reply: () => {
      const list = ANIMALS.filter(a => a.risk === 'vulnerable');
      return `🟡 **Especies Vulnerables (${list.length}):**\n\n${
        list.map(a => `• ${a.emoji} **${a.name}** *(${a.latin})*\n  👥 ~${formatNumber(a.population)} individuos · 🌿 ${a.habitat}`).join('\n\n')
      }`;
    }
  },

  // Animals by CONTINENT — Africa
  {
    test: q => /\b(africa|africano|african|sabana)\b/i.test(q),
    reply: () => {
      const list = ANIMALS.filter(a => a.continent === 'Africa');
      return `🌍 **Fauna de África (${list.length} especies):**\n\n${
        list.map(a => `• ${a.emoji} **${a.name}** — ${RISK_LABELS[a.risk]} | 👥 ~${formatNumber(a.population)}`).join('\n')
      }`;
    }
  },

  // Animals by CONTINENT — Asia
  {
    test: q => /\b(asia|asiático|asiática|asiatico|asiatica)\b/i.test(q),
    reply: () => {
      const list = ANIMALS.filter(a => a.continent === 'Asia');
      return `🌏 **Fauna de Asia (${list.length} especies):**\n\n${
        list.map(a => `• ${a.emoji} **${a.name}** — ${RISK_LABELS[a.risk]} | 👥 ~${formatNumber(a.population)}`).join('\n')
      }`;
    }
  },

  // Animals by CONTINENT — SudAmerica
  {
    test: q => /\b(sudamerica|sudamérica|sur america|sur améric|america del sur|amazonas|amazon)\b/i.test(q),
    reply: () => {
      const list = ANIMALS.filter(a => a.continent === 'SudAmerica');
      return `🌎 **Fauna de Sudamérica (${list.length} especies):**\n\n${
        list.map(a => `• ${a.emoji} **${a.name}** — ${RISK_LABELS[a.risk]} | 👥 ~${formatNumber(a.population)}`).join('\n')
      }`;
    }
  },

  // Animals by CONTINENT — NorteAmerica
  {
    test: q => /\b(norteamerica|norteamérica|norte america|america del norte)\b/i.test(q),
    reply: () => {
      const list = ANIMALS.filter(a => a.continent === 'NorteAmerica');
      return `🌎 **Fauna de Norte América (${list.length} especies):**\n\n${
        list.map(a => `• ${a.emoji} **${a.name}** — ${RISK_LABELS[a.risk]} | 👥 ~${formatNumber(a.population)}`).join('\n')
      }`;
    }
  },

  // Animals by CONTINENT — Europa
  {
    test: q => /\b(europa|europe|europeo|europeos)\b/i.test(q),
    reply: () => {
      const list = ANIMALS.filter(a => a.continent === 'Europa');
      return `🏔️ **Fauna de Europa (${list.length} especies):**\n\n${
        list.map(a => `• ${a.emoji} **${a.name}** — ${RISK_LABELS[a.risk]} | 👥 ~${formatNumber(a.population)}`).join('\n')
      }`;
    }
  },

  // Animals by CONTINENT — Oceania
  {
    test: q => /\b(oceania|oceanía|australia|australia|pacifico|pacífico)\b/i.test(q),
    reply: () => {
      const list = ANIMALS.filter(a => a.continent === 'Oceania');
      return `🦘 **Fauna de Oceanía (${list.length} especies):**\n\n${
        list.map(a => `• ${a.emoji} **${a.name}** — ${RISK_LABELS[a.risk]} | 👥 ~${formatNumber(a.population)}`).join('\n')
      }`;
    }
  },

  // Specific animal lookup — any animal name from the array
  {
    test: q => ANIMALS.some(a =>
      q.toLowerCase().includes(a.name.toLowerCase().split(' ')[0]) ||
      q.toLowerCase().includes(a.name.toLowerCase())
    ),
    reply: q => {
      const found = ANIMALS.find(a =>
        q.toLowerCase().includes(a.name.toLowerCase().split(' ')[0]) ||
        q.toLowerCase().includes(a.name.toLowerCase())
      );
      if (!found) return null;
      const trendIcon = found.trend >= 0 ? '↑' : '↓';
      const trendColor = found.trend >= 0 ? '📈' : '📉';
      return `${found.emoji} **${found.name}** *(${found.latin})*\n\n` +
        `• 🔴 Estado: **${RISK_LABELS[found.risk]}**\n` +
        `• 👥 Población estimada: ~**${formatNumber(found.population)}** individuos\n` +
        `• 📅 Esperanza de vida: **${found.lifespan} años**\n` +
        `• 🌍 Continente: **${found.continent}**\n` +
        `• 🌿 Hábitat: **${found.habitat}**\n` +
        `• ${trendColor} Tendencia poblacional: **${trendIcon} ${found.trend}%**`;
    }
  },

  // Missions list
  {
    test: q => /mis(?:iones?|ion)/i.test(q) || /\b(logros?|xp|expedicion|expedición|nivel)\b/i.test(q),
    reply: () => {
      const completadas = MISSIONS.filter(m => m.completed).length;
      const lista = MISSIONS.map(m =>
        `• ${m.completed ? '✅' : '⬜'} ${m.icon} **${m.title}** — +${m.xp} XP\n  _${m.desc}_`
      ).join('\n');
      return `🎯 **Misiones de WildTrack (${completadas}/${MISSIONS.length} completadas):**\n\n${lista}\n\n**XP actual:** ${userXP} pts · Haz clic en cualquier misión de la barra lateral para completarla y ganar XP.`;
    }
  },

  // Global stats
  {
    test: q => /\b(estadisticas?|estadísticas?|datos|resumen|cuantas?|cuántas?|total|numeros?|números?|cifras?)\b/i.test(q),
    reply: () => {
      const total = ANIMALS.length;
      const byCont = {};
      ANIMALS.forEach(a => { byCont[a.continent] = (byCont[a.continent] || 0) + 1; });
      const continentes = Object.entries(byCont).map(([k, v]) => `  • ${k}: ${v}`).join('\n');
      return `📊 **Estadísticas globales de WildTrack:**\n\n` +
        `• 🌍 Total de especies monitoreadas: **${total}**\n` +
        `• 🔴 En Peligro Crítico: **${ANIMALS.filter(a => a.risk === 'critico').length}**\n` +
        `• 🟠 En Peligro: **${ANIMALS.filter(a => a.risk === 'peligro').length}**\n` +
        `• 🟡 Vulnerables: **${ANIMALS.filter(a => a.risk === 'vulnerable').length}**\n` +
        `• 🔵 Preocupación Menor: **${ANIMALS.filter(a => a.risk === 'menor').length}**\n\n` +
        `**Por continente:**\n${continentes}\n\n` +
        `• 📅 Esperanza de vida promedio: **${Math.round(ANIMALS.reduce((s, a) => s + a.lifespan, 0) / total)} años**`;
    }
  },

  // Population / most endangered
  {
    test: q => /\b(mas?|más).*(peligro|amenazado|raro|escaso)\b/i.test(q) ||
               /\b(menor|más pequeña|mínima).*(poblaci)/i.test(q) ||
               /\b(animal|especie).*(menos|escas|raro)\b/i.test(q),
    reply: () => {
      const sorted = [...ANIMALS].sort((a, b) => a.population - b.population);
      const top5 = sorted.slice(0, 5);
      return `⚠️ **Las 5 especies con menor población:**\n\n${
        top5.map((a, i) => `${i + 1}. ${a.emoji} **${a.name}** — ~${formatNumber(a.population)} individuos | **${RISK_LABELS[a.risk]}**`).join('\n')
      }\n\n_Datos basados en estimaciones actuales de la UICN._`;
    }
  },

  // Conservation help
  {
    test: q => /\b(como|cómo).*(ayud|conserv|proteg|salvar?)\b/i.test(q) || /\b(ayud|conserv|proteg).*(como|cómo)\b/i.test(q),
    reply: () => '🌿 **Cómo puedes ayudar a conservar la fauna silvestre:**\n\n' +
      '1. ✅ **Completa las misiones** en el panel lateral — cada misión apoya una causa real\n' +
      '2. 💚 **Apoya organizaciones** como WWF, UICN, WCS o National Geographic Society\n' +
      '3. 🚫 **Evita productos ilegales** de origen animal (marfil, pieles, etc.)\n' +
      '4. 📢 **Difunde información** sobre biodiversidad en tu comunidad\n' +
      '5. 🌳 **Planta árboles nativos** y participa en actividades de reforestación\n' +
      '6. 🔍 **Explora el mapa** de avistamientos para conocer las zonas críticas de biodiversidad'
  },

  // Achievements
  {
    test: q => /\b(logros?|achievements?|desbloquear|desbloqueado)\b/i.test(q),
    reply: () => {
      const lista = ACHIEVEMENTS.map(a =>
        `• ${a.unlocked ? '🏆' : '🔒'} **${a.name}** — _${a.desc}_`
      ).join('\n');
      return `🏆 **Logros de WildTrack:**\n\n${lista}\n\nCompleta misiones para desbloquear logros y subir de nivel.`;
    }
  },

  // Map / sightings
  {
    test: q => /\b(mapa|map|avistamiento|marcador|radar|ubicaci|donde|dónde)\b/i.test(q),
    reply: () => `🗺️ **Mapa de Avistamientos de WildTrack:**\n\n` +
      `El mapa muestra **${ANIMALS.length} marcadores** interactivos distribuidos globalmente:\n\n` +
      `• 🔴 **Crítico**: ${ANIMALS.filter(a => a.risk === 'critico').length} marcadores (rojo)\n` +
      `• 🟠 **En Peligro**: ${ANIMALS.filter(a => a.risk === 'peligro').length} marcadores (naranja)\n` +
      `• 🟡 **Vulnerable**: ${ANIMALS.filter(a => a.risk === 'vulnerable').length} marcadores (amarillo)\n` +
      `• 🔵 **Menor riesgo**: ${ANIMALS.filter(a => a.risk === 'menor').length} marcadores (azul)\n\n` +
      `Haz clic en cualquier marcador para ver la ficha detallada del animal. Usa los filtros para mostrar solo una categoría de riesgo.`
  },

  // Thanks / positive feedback
  {
    test: q => /^(gracias|thanks|thx|perfecto|genial|excelente|ok|bien|buenisimo|buenísimo|increible|increíble|cool|nice)[\s!.]*$/i.test(q.trim()),
    reply: () => '😊 ¡Con mucho gusto! Sigue explorando WildTrack — hay **16 especies** que descubrir, **5 misiones** que completar y un **mapa interactivo** con datos en tiempo real. ¿Qué más quieres saber?'
  },
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

// Build the knowledge base dynamically from:
// 1. ANIMALS data — one doc per animal
// 2. Summaries by continent and risk level
// 3. rag-data.json entries
function buildRagKnowledge() {
  const docs = [];

  // --- Per-animal documents ---
  ANIMALS.forEach(a => {
    const trendDir = a.trend >= 0 ? 'en aumento' : 'en descenso';
    docs.push({
      text: `${a.name} ${a.latin} ${a.continent} ${a.habitat} ${RISK_LABELS[a.risk]}`,
      response:
        `${a.emoji} **${a.name}** *(${a.latin})*\n\n` +
        `• Estado de conservación: **${RISK_LABELS[a.risk]}**\n` +
        `• Población estimada: ~**${formatNumber(a.population)}** individuos\n` +
        `• Esperanza de vida: **${a.lifespan} años**\n` +
        `• Hábitat natural: **${a.habitat}**\n` +
        `• Continente: **${a.continent}**\n` +
        `• Tendencia poblacional: **${trendDir} (${a.trend > 0 ? '+' : ''}${a.trend}%)**`,
    });
  });

  // --- Summary documents ---
  const riskGroups = ['critico', 'peligro', 'vulnerable', 'menor'];
  riskGroups.forEach(r => {
    const group = ANIMALS.filter(a => a.risk === r);
    docs.push({
      text: `animales ${r} peligro estado riesgo extincion ${RISK_LABELS[r]} especies`,
      response: `${r === 'critico' ? '🔴' : r === 'peligro' ? '🟠' : r === 'vulnerable' ? '🟡' : '🔵'} **${RISK_LABELS[r]} (${group.length} especies):**\n\n` +
        group.map(a => `• ${a.emoji} **${a.name}** — ~${formatNumber(a.population)} individuos`).join('\n'),
    });
  });

  // Continent summaries
  const continents = [...new Set(ANIMALS.map(a => a.continent))];
  continents.forEach(cont => {
    const group = ANIMALS.filter(a => a.continent === cont);
    docs.push({
      text: `fauna animales especies ${cont.toLowerCase()} continente`,
      response: `🌍 **Fauna de ${cont} (${group.length} especies):**\n\n` +
        group.map(a => `• ${a.emoji} **${a.name}** — ${RISK_LABELS[a.risk]}`).join('\n'),
    });
  });

  // All animals summary
  docs.push({
    text: 'todos animales especies lista fauna silvestre wildtrack completa',
    response: `🌍 **Las ${ANIMALS.length} especies monitoreadas:**\n\n` +
      ANIMALS.map(a => `• ${a.emoji} **${a.name}** — ${RISK_LABELS[a.risk]} | ${a.continent}`).join('\n'),
  });

  // Missions summary
  docs.push({
    text: 'misiones xp expedicion conservacion logros nivel guardián explorador',
    response: `🎯 **Misiones de WildTrack:**\n\n` +
      MISSIONS.map(m => `• ${m.icon} **${m.title}** — ${m.desc} *(+${m.xp} XP)*`).join('\n') +
      `\n\n**Logros:** Completa misiones para desbloquear: ${ACHIEVEMENTS.map(a => a.icon + ' ' + a.name).join(', ')}`,
  });

  // Page / tech info from rag-data.json (inline copy of key entries)
  const ragStaticDocs = [
    { text: 'wildtrack spa pagina app tecnologias html css javascript', response: 'WildTrack está construido con **HTML5, CSS3 y Vanilla JS (ES6+)**. Es una Single Page Application (SPA) con navegación fluida, diseño glassmorphism en dark mode, animaciones CSS, IntersectionObserver para carga progresiva, y datos completamente en JavaScript sin servidor.' },
    { text: 'hero seccion bienvenida titulo fondo orbes animaciones cta boton', response: 'La **sección Hero** muestra el título "Fauna Silvestre en Peligro" con gradiente esmeralda-naranja, orbes animados de fondo, mini-estadísticas (8.7M especies, 41K en peligro, 195 países), tarjetas flotantes de animales y botones CTA para ir al Dashboard o iniciar misiones.' },
    { text: 'mapa radar avistamientos marcadores filtros biodiversidad biomas', response: 'El **Mapa de Avistamientos** simula un radar interactivo. Tiene marcadores circulares pulsantes para las 16 especies, coloreados por nivel de riesgo. Al hacer clic, muestra la ficha completa del animal. Hay filtros por: Todos, Crítico, En Peligro y Vulnerable.' },
    { text: 'dashboard estadisticas graficos donut barras progreso charts', response: 'El **Dashboard de Estadísticas** muestra 4 tarjetas animadas (Especies, Críticas, Población, Esperanza de vida), un gráfico donut SVG de distribución por riesgo, barras de tendencia poblacional, y estadísticas de cobertura por continente.' },
    { text: 'fichas tecnicas filtros busqueda continente especie grid cards', response: 'Las **Fichas Técnicas** muestran cards de las 16 especies con búsqueda en tiempo real, filtros por continente (África, Asia, Sudamérica, Europa, N.América, Oceanía) y por nivel de riesgo. El filtrado es instantáneo sin recargar la página.' },
    { text: 'misiones gamificacion xp nivel logros sidebar accordion guardián', response: 'El sistema de **Gamificación** incluye: 5 misiones de conservación con XP, barra de nivel (Observador → Rastreador → Naturalista → Explorador → Guardián Elite), 4 logros desbloqueables, y el contador de XP en la navbar.' },
    { text: 'intersectionobserver animaciones barras scroll carga progressive lazy', response: 'WildTrack usa **IntersectionObserver** para activar animaciones de barras de progreso solo cuando el elemento entra en pantalla. Las barras de Población, Riesgo y Longevidad arrancan en 0% y se animan hasta su valor real con transition CSS de 1.5s.' },
    { text: 'navbar navegacion sticky links smooth scroll backdrop blur glassmorphism', response: 'La **Navbar** es sticky (position: fixed) con efecto blur glassmorphism. Al hacer scroll muestra sombra adicional. Los links activan smooth scroll a cada sección y el link activo se resalta automáticamente según la sección visible.' },
  ];

  ragStaticDocs.forEach(d => docs.push(d));
  return docs;
}

async function initRAG() {
  // Build dynamic knowledge base from live data
  const dynamicDocs = buildRagKnowledge();

  let extraDocs = [];
  
  // Try to load conocimiento.txt (RAG Document required by user)
  try {
    const res = await fetch('conocimiento.txt');
    if (res.ok) {
        const text = await res.text();
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 10);
        const txtDocs = paragraphs.map(p => ({ text: p, response: p }));
        extraDocs = [...extraDocs, ...txtDocs];
        console.log(`[WildBot RAG] ✅ Loaded ${txtDocs.length} docs from conocimiento.txt`);
    }
  } catch(e) { console.warn("No conocimiento.txt found"); }

  // Try to also load rag-data.json (adds more entries when served over HTTP)
  try {
    const res = await fetch('rag-data.json');
    if (res.ok) {
      const raw = await res.json();
      extraDocs = [...extraDocs, ...raw.map(d => ({ text: d.text, response: d.response }))];
      console.log(`[WildBot RAG] ✅ Loaded ${raw.length} extra docs from rag-data.json`);
    }
  } catch (_) {
    console.log('[WildBot RAG] 📦 Using inline knowledge base only');
  }

  const allDocs = [...dynamicDocs, ...extraDocs];

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
      '🌿 No encontré una respuesta exacta. Puedes preguntarme:\n• **"Todos los animales"** — lista completa\n• **"Animales críticos"** — en peligro de extinción\n• **"Fauna de África"** — por continente\n• **"Misiones"** — tus objetivos de conservación\n• El nombre de un animal específico (ej. *"tigre"*, *"panda"*)',
      '🔍 Intenta ser más específico. Ejemplos:\n• *"¿Cuáles animales están en peligro crítico?"*\n• *"Dime sobre el leopardo de Amur"*\n• *"¿Qué misiones hay disponibles?"*\n• *"Estadísticas de WildTrack"*',
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


