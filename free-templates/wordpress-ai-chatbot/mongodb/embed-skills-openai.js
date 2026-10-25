import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!MONGO_URI) throw new Error("MONGO_URI mancante (env var).");
if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY mancante (env var).");

const DB_NAME = process.env.MONGO_DB || "chatbot";
const COLLECTION = process.env.MONGO_COLLECTION || "skills_demo";

const EMBEDDING_MODEL = "text-embedding-3-small"; // 1536 dim

function buildText(doc) {
  // Adatta se i tuoi campi hanno nomi diversi
  const name = doc.name ?? "";
  const description = doc.description ?? "";
  const domain = doc.domain ?? "";
  const category = doc.category ?? "";
  const subcategory = doc.subcategory ?? "";
  const proficiency = doc.proficiency ?? "";
  const url = doc.url ?? "";
  const tags = Array.isArray(doc.tags) ? doc.tags.join(", ") : (doc.tags ?? "");

  // Text “unificato”: è quello che il bot userà come knowledge snippet
  return [
    `Skill: ${name}`.trim(),
    description ? `Description: ${description}` : "",
    domain ? `Domain: ${domain}` : "",
    category ? `Category: ${category}` : "",
    subcategory ? `Subcategory: ${subcategory}` : "",
    proficiency ? `Proficiency: ${proficiency}` : "",
    tags ? `Tags: ${tags}` : "",
    url ? `URL: ${url}` : "",
  ].filter(Boolean).join("\n");
}

async function openaiEmbed(text) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI embeddings error ${res.status}: ${body}`);
  }

  const json = await res.json();
  const emb = json?.data?.[0]?.embedding;

  if (!Array.isArray(emb) || emb.length !== 1536) {
    throw new Error(`Embedding non valido o dimensione errata. len=${emb?.length}`);
  }

  return emb;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const col = client.db(DB_NAME).collection(COLLECTION);

  // Prendiamo tutti i documenti (o filtra solo quelli senza embedding, se preferisci)
  const docs = await col.find({}, { projection: { _id: 1, name: 1, description: 1, domain: 1, category: 1, subcategory: 1, tags: 1, proficiency: 1, url: 1 } }).toArray();
  console.log(`Trovati ${docs.length} documenti.`);

  let ok = 0;

  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];
    const text = buildText(d);

    try {
      const embedding = await openaiEmbed(text);

      await col.updateOne(
        { _id: d._id },
        {
          $set: {
            text,
            embedding,
            embedding_model: EMBEDDING_MODEL,
            embedding_dim: 1536,
            embeddedAt: new Date(),
          },
        }
      );

      ok++;
      console.log(`✔ [${ok}/${docs.length}] ${d.name ?? d._id.toString()}`);
      // piccolo delay per stare tranquilli
      await sleep(150);
    } catch (e) {
      console.error(`✖ Errore su ${d.name ?? d._id.toString()}:`, e.message);
      // in caso di rate limit, aumenta sleep o fai retry
      throw e;
    }
  }

  await client.close();
  console.log("✅ Embedding completato.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
