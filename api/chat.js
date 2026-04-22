const fs = require('fs');
const path = require('path');

const GROQ_API_KEY = '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';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// STOPWORDS
const STOPWORDS_ES = new Set([
  'que','el','la','los','las','de','del','en','y','es','se','un','una','por',
  'con','para','no','si','me','te','su','al','lo','más','ya','mi','le','pero',
  'como','este','esta','esto','eso','esa','son','hay','tiene','han','fue','ser',
  'estar','era','o','a','e','i','u','sobre','entre','sin','hasta','desde',
  'también','todo','todos','todas','muy','bien','cuando','donde','quien',
  'qué','cómo','cuándo','cuánto','cuanto','sería','poder','hacer'
]);

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
  const set = new Set([...Object.keys(a), ...Object.keys(b)]);
  set.forEach(k => {
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

let ragDocs = [];
let ragIdf = {};
let ragReady = false;

function initRAG() {
  if (ragReady) return;
  try {
    // Vercel expone process.cwd() apuntando a la raíz del proyecto
    const file = path.join(process.cwd(), 'conocimiento.txt');
    const text = fs.readFileSync(file, 'utf-8');
    const fragments = parseKnowledge(text);
    const rawDocs = fragments.map(f => ({ ...f, tokens: tokenize(f.text) }));
    ragIdf = buildIDF(rawDocs);
    ragDocs = rawDocs.map(d => ({ ...d, tfidfVec: tfidf(buildTF(d.tokens), ragIdf) }));
    ragReady = true;
  } catch (err) {
    console.error('Error cargando conocimiento.txt:', err);
  }
}

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

async function generateResponse(question, contextChunks) {
  if (!GROQ_API_KEY) throw new Error('Falta GROQ_API_KEY');

  const context = contextChunks.length > 0
    ? contextChunks.map((c, i) => `[Fragmento ${i + 1}]\n${c.response}`).join('\n\n')
    : 'No se encontraron fragmentos relevantes.';

  const systemPrompt = `Eres WildBot, un asistente experto en fauna silvestre y conservación del portal WildTrack. 
Respondes ÚNICAMENTE basándote en el contexto biológico y estadístico proporcionado.
Tus respuestas son naturales, informativas y en español. 
Si el contexto no contiene información suficiente, dilo honestamente y amigablemente.
Nunca inventes datos ni estadísticas. Mantén un tono educativo y apasionado por la naturaleza.`;

  const userMessage = `Contexto:\n${context}\n\nPregunta: ${question}\n\nResponde de forma natural basándote en el contexto.`;

  // fetch es nativo en Node 18+ de Vercel
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
    const errorText = await response.text();
    throw new Error(`Groq API Error: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || 'No pude generar una respuesta.';
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    initRAG();
    return res.status(200).json({ status: 'ok', ragReady, count: ragDocs.length });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  initRAG();

  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensaje inválido.' });
  }

  const query = message.trim();
  const chunks = retrieve(query, 3);

  try {
    const answer = await generateResponse(query, chunks);
    return res.status(200).json({ answer, chunksFound: chunks.length });
  } catch (err) {
    console.error('Groq Error:', err);
    return res.status(500).json({ error: 'Error generando respuesta.' });
  }
};
