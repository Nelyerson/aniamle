// ============================================================
// WILDBOT SERVER — RAG con Groq
// Retriever: TF-IDF + Similaridad Coseno sobre conocimiento.txt
// Generator: Groq API (llama-3.3-70b-versatile)
// ============================================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (index.html, style.css, app.js, etc.)
app.use(express.static(path.join(__dirname)));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const KNOWLEDGE_FILE = path.join(__dirname, 'conocimiento.txt');

// ============================================================
// STOPWORDS EN ESPAÑOL
// ============================================================
const STOPWORDS_ES = new Set([
  'que','el','la','los','las','de','del','en','y','es','se','un','una','por',
  'con','para','no','si','me','te','su','al','lo','más','ya','mi','le','pero',
  'como','este','esta','esto','eso','esa','son','hay','tiene','han','fue','ser',
  'estar','era','o','a','e','i','u','sobre','entre','sin','hasta','desde',
  'también','todo','todos','todas','muy','bien','cuando','donde','quien',
  'qué','cómo','cuándo','cuánto','cuanto','sería','poder','hacer'
]);

// ============================================================
// MÓDULO RETRIEVER — TF-IDF
// ============================================================

function tokenize(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 2 && !STOPWORDS_ES.has(t));
}

function buildTF(tokens) {
  const tf = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  const total = tokens.length || 1;
  Object.keys(tf).forEach(k => tf[k] /= total);
  return tf;
}

function buildIDF(docs) {
  const idf = {};
  const N = docs.length;
  docs.forEach(doc => {
    new Set(doc.tokens).forEach(t => { idf[t] = (idf[t] || 0) + 1; });
  });
  Object.keys(idf).forEach(k => { idf[k] = Math.log((N + 1) / (idf[k] + 1)) + 1; });
  return idf;
}

function tfidf(tf, idf) {
  const vec = {};
  Object.keys(tf).forEach(t => { vec[t] = tf[t] * (idf[t] || 1); });
  return vec;
}

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  keys.forEach(k => {
    const av = a[k] || 0, bv = b[k] || 0;
    dot += av * bv; na += av * av; nb += bv * bv;
  });
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

function parseKnowledge(text) {
  const fragments = [];
  const blocks = text.split(/(?:\r?\n){2,}/);
  for (const b of blocks) {
    if (b.includes('|||')) {
      const parts = b.split('|||');
      fragments.push({
        keywords: parts[0].trim(),
        response: parts[1].trim(),
        text: parts[0].trim() + ' ' + parts[1].trim()
      });
    } else if (b.trim().length > 10) {
      fragments.push({ keywords: b.trim(), response: b.trim(), text: b.trim() });
    }
  }
  return fragments;
}

// ============================================================
// INICIALIZAR BASE DE CONOCIMIENTO
// ============================================================

let ragDocs = [];
let ragIdf = {};
let ragReady = false;

function initRAG() {
  try {
    const text = fs.readFileSync(KNOWLEDGE_FILE, 'utf-8');
    const fragments = parseKnowledge(text);
    const rawDocs = fragments.map(f => ({ ...f, tokens: tokenize(f.text) }));
    ragIdf = buildIDF(rawDocs);
    ragDocs = rawDocs.map(d => ({ ...d, tfidfVec: tfidf(buildTF(d.tokens), ragIdf) }));
    ragReady = true;
    console.log(`✅ RAG inicializado: ${ragDocs.length} fragmentos indexados desde conocimiento.txt`);
  } catch (err) {
    console.error('❌ Error al cargar conocimiento.txt:', err.message);
    ragReady = false;
  }
}

// ============================================================
// RETRIEVER — Búsqueda de fragmentos relevantes
// ============================================================

function retrieve(query, topK = 3, threshold = 0.02) {
  if (!ragReady) return [];
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];

  const qVec = tfidf(buildTF(tokens), ragIdf);

  return ragDocs
    .map(d => ({ score: cosineSim(qVec, d.tfidfVec), response: d.response }))
    .filter(m => m.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ============================================================
// GENERATOR — Groq API
// ============================================================

async function generateResponse(question, contextChunks) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY no configurada en el archivo .env');
  }

  const context = contextChunks.length > 0
    ? contextChunks.map((c, i) => `[Fragmento ${i + 1}]\n${c.response}`).join('\n\n')
    : 'No se encontraron fragmentos relevantes en la base de conocimiento.';

  const systemPrompt = `Eres WildBot, un asistente experto en fauna silvestre y conservación del portal WildTrack. 
Respondes ÚNICAMENTE basándote en el contexto biológico y estadístico proporcionado.
Tus respuestas son naturales, informativas y en español. 
Si el contexto no contiene información suficiente, dilo honestamente.
Nunca inventes datos ni estadísticas que no estén en el contexto.
Mantén un tono educativo y apasionado por la naturaleza.`;

  const userMessage = `Contexto recuperado de la base de conocimiento:
${context}

Pregunta del usuario: ${question}

Responde de forma natural y concisa basándote estrictamente en el contexto anterior.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 400,
      temperature: 0.4
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || 'No pude generar una respuesta.';
}

// ============================================================
// RUTA API: POST /api/chat
// ============================================================

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Mensaje vacío o inválido.' });
  }

  const query = message.trim();
  console.log(`\n🔍 [RETRIEVER] Consulta: "${query}"`);

  // PASO 1: RETRIEVER — Buscar fragmentos relevantes
  const chunks = retrieve(query, 3);

  if (chunks.length > 0) {
    console.log(`📄 Fragmentos recuperados: ${chunks.length}`);
    chunks.forEach((c, i) => console.log(`  [${i + 1}] score=${c.score.toFixed(4)} | ${c.response.slice(0, 80)}...`));
  } else {
    console.log('⚠️  No se encontraron fragmentos relevantes.');
  }

  // PASO 2: GENERATOR — Generar respuesta con Groq
  try {
    const answer = await generateResponse(query, chunks);
    console.log(`🤖 [GENERATOR] Respuesta generada (${answer.length} chars)`);
    res.json({ answer, chunksFound: chunks.length });
  } catch (err) {
    console.error('❌ Error en Groq:', err.message);
    res.status(500).json({ 
      error: 'Error al generar respuesta con Groq.',
      detail: err.message 
    });
  }
});

// ============================================================
// RUTA: GET /api/status
// ============================================================

app.get('/api/status', (req, res) => {
  res.json({
    ragReady,
    docsIndexed: ragDocs.length,
    groqConfigured: !!GROQ_API_KEY,
    model: GROQ_MODEL
  });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

initRAG();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n🌿 ===== WildBot RAG Server =====');
  console.log(`   URL:   http://localhost:${PORT}`);
  console.log(`   RAG:   ${ragReady ? '✅ Activo' : '❌ Error'}`);
  console.log(`   Groq:  ${GROQ_API_KEY ? '✅ API Key configurada' : '❌ Sin API Key'}`);
  console.log(`   Docs:  ${ragDocs.length} fragmentos indexados`);
  console.log('================================\n');
});
