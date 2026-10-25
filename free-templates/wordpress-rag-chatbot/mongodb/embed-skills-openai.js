import { MongoClient } from 'mongodb';

const required=['MONGO_URI','OPENAI_API_KEY'];
for(const name of required)if(!process.env[name])throw new Error('Missing '+name);
const client=new MongoClient(process.env.MONGO_URI);
const dbName=process.env.MONGO_DB||'chatbot';
const collectionName=process.env.MONGO_COLLECTION||'skills';
const model=process.env.EMBEDDING_MODEL||'text-embedding-3-small';
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function embed(text){
 for(let attempt=0;attempt<5;attempt++){
  const response=await fetch('https://api.openai.com/v1/embeddings',{
   method:'POST',
   headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
   body:JSON.stringify({model,input:text})
  });
  if(response.status===429||response.status>=500){await delay(Math.min(2000*2**attempt,20000));continue;}
  if(!response.ok)throw new Error('Embedding API returned HTTP '+response.status);
  const body=await response.json();
  const vector=body?.data?.[0]?.embedding;
  if(!Array.isArray(vector)||!vector.length)throw new Error('Invalid embedding response');
  return vector;
 }
 throw new Error('Embedding retries exhausted');
}
try{
 await client.connect();
 const col=client.db(dbName).collection(collectionName);
 const cursor=col.find({},{projection:{_id:1,name:1,title:1,text:1,description:1,embedding_model:1}});
 let count=0;
 for await(const doc of cursor){
  const text=String(doc.text||[doc.name||doc.title,doc.description].filter(Boolean).join('\n')).trim();
  if(!text||doc.embedding_model===model)continue;
  const vector=await embed(text);
  await col.updateOne({_id:doc._id},{$set:{text,embedding:vector,embedding_model:model,embedding_dim:vector.length,embeddedAt:new Date()}});
  count++;
 }
 console.log('Updated embeddings:',count);
}finally{await client.close();}
