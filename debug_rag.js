const fs = require('fs');

const STOPWORDS_ES = new Set([
  "de", "la", "que", "el", "en", "y", "a", "los", "del", "se", "las", "por", "un",
  "para", "con", "no", "una", "su", "al", "lo", "como", "mas", "pero", "sus", "le",
  "ya", "o", "este", "si", "porque", "esta", "entre", "cuando", "muy", "sin",
  "sobre", "tambien", "me", "hasta", "hay", "donde", "quien", "desde", "todo",
  "nos", "durante", "todos", "uno", "les", "ni", "contra", "otros", "ese", "eso",
  "ante", "ellos", "e", "esto", "mi", "antes", "algunos", "que", "unos", "yo",
  "otro", "otras", "otra", "el", "tanto", "esa", "estos", "mucho", "quienes",
  "nada", "muchos", "cual", "poco", "ella", "estar", "estas", "algunas", "algo",
  "nosotros", "mi", "mis", "tu", "te", "ti", "tu", "tus", "ellas", "nosotras",
  "vosotros", "vosotras", "os", "mio", "mia", "mios", "mias", "tuyo", "tuya",
  "tuyos", "tuyas", "suyo", "suya", "suyos", "suyas", "nuestro", "nuestra",
  "nuestros", "nuestras", "vuestro", "vuestra", "vuestros", "vuestras", "es"
]);

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

function parseTxtToFragments(text) {
  return text
    .split(/\r?\n/)
    .map(p => p.trim())
    .filter(p => p.length > 3);
}

const txt = fs.readFileSync('c:/Users/Luis/Desktop/animales/conocimiento.txt', 'utf8');
const fragments = parseTxtToFragments(txt);
const docs = fragments.map(f => ({ text: f, response: f }));

docs.forEach(doc => {
  doc.tokens = ragTokenize(doc.text);
});

const ragIdf = ragBuildIDF(docs);

docs.forEach(doc => {
  doc.tf = ragBuildTF(doc.tokens);
  doc.tfidf = ragTFIDF(doc.tf, ragIdf);
});

function testQuery(q) {
  console.log(`\nQuery: "${q}"`);
  const tokens = ragTokenize(q);
  const tf = ragBuildTF(tokens);
  const tfidf = ragTFIDF(tf, ragIdf);

  const results = docs.map(doc => ({
    sim: ragCosineSim(tfidf, doc.tfidf),
    text: doc.text
  })).sort((a, b) => b.sim - a.sim);

  console.log(`Top 1: ${results[0].sim.toFixed(4)} - ${results[0].text}`);
  console.log(`Top 2: ${results[1].sim.toFixed(4)} - ${results[1].text}`);
}

testQuery("hola");
testQuery("cual es el titulo");
testQuery("leopardo de amur");
testQuery("ayuda");
