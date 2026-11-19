import { postConcept } from './post.mjs';
import { campaign, chooseCampaign } from './campaign.mjs';
// Product-specific defaults are hypothetical situations, never customer evidence.
const topics = {
  restaurant: { labels: ["Today's menu", 'The same QR link'], solution: 'New menu. Same link.', story: [["Tonight's menu changed.", "Tonight's dishes changed. The printed menu didn't."], ['The QR still points there.', 'People scan the code and see yesterday’s menu.'], ['Update what the link opens.', 'Change the menu on your existing page.']] },
  creator: { labels: ['Your latest work', 'Your contact links'], solution: 'Your work, in one place.', story: [['A new project is ready.', 'Your new project has another link to share.'], ['Which link goes in your bio?', 'The work and the contact details live apart.'], ['Give them one destination.', 'Bring your work and links onto one page.']] },
  studio: { labels: ['Your projects', 'Contact details'], solution: 'Work and contact, together.', story: [['Your latest project is ready.', 'Someone wants to see more of your work.'], ['Where should they go next?', 'Your projects and contact details live apart.'], ['Put them on your page.', 'Give visitors your work and a contact link.']] },
  events: { labels: ['Event details', 'The ticket link'], solution: 'One page for the event.', story: [['The event is announced.', 'The line-up is ready. So is the date.'], ['The ticket link is elsewhere.', 'People need another link to find the tickets.'], ['Put the details together.', 'Keep event details and your ticket link together.']] },
  cocktail: { labels: ['The drinks menu', 'Opening hours'], solution: 'A page for your bar.', story: [['Someone is planning an evening.', 'They want to check your bar’s drinks menu.'], ['Then come the opening hours.', 'The menu and opening hours live apart.'], ['Give them one destination.', 'Show your menu and information on one page.']] },
  property: { labels: ['Property photos', 'Contact details'], solution: 'Photos and details, together.', story: [['The photos caught their eye.', 'Someone wants to know more about the property.'], ['Where are the details?', 'The photos and contact details live apart.'], ['Put the information together.', 'Show property photos, details and a contact link.']] },
};
const explanations={restaurant:'Edit your menu. Keep the same page link.',creator:'Bring your work and links together on one page.',studio:'Put your projects and contact link on one page.',events:'Keep event details and your ticket link together.',cocktail:'Show your drinks menu and opening hours together.',property:'Show property photos, details and a contact link.'};
export function campaignStory(job){
  return campaign(job).story;
}
export function resolveCreativeCopy(candidate,job){
  if(!candidate||Object.keys(candidate).sort().join(',')!=='caption,hook'||typeof candidate.hook!=='string'||typeof candidate.caption!=='string')throw new Error('Writer must return only an opening and caption');
  const story=campaignStory(job);
  return {hook:candidate.hook,caption:candidate.caption,detail:job.kind==='reel'?campaign(job).solution:story[2].line,steps:story.map(b=>b.heading),story};
}
export function topicFor(job) {
  const topic = topics[job.feature.id];
  if (!topic) throw new Error('No verified creative topic');
  const {focus}=campaign(job);
  if(job.feature.id==='restaurant'&&focus!=='qr')return {...topic,labels:focus==='dietary'?['Dietary labels','Allergen details']:['Menu items','Descriptions and prices'],solution:'Useful details on your menu.'};
  if(job.feature.id==='events')return {...topic,labels:['Upcoming nights','External contact link'],solution:'A page for your venue.'};
  if(job.feature.id==='creator'&&focus==='podcast')return {...topic,labels:['Your podcast','Your other work'],solution:'Your podcast and your work.'};
  return topic;
}
export function storyBeats(job) {
  return job.copy.story || campaignStory(job);
}
export function reelBeats(job) {
  return [{role:'hook',heading:job.copy.hook,line:job.copy.hook},
    ...storyBeats(job).map((b,i)=>({...b,role:['setup','friction','turn'][i]})),
    {role:'solution',heading:topicFor(job).solution,line:job.copy.detail},
    {role:'cta',heading:'Create your page',line:'Create your page at example dot com.'}];
}
export function validateCreativeTopic(copy,job) {
  const text=[copy.hook,copy.detail,...copy.steps,copy.caption,...(copy.story||[]).flatMap(b=>[b.heading,b.line])].join(' ');
  const subject={restaurant:/\b(?:menus?|dishes?|allergens?|dietary)\b/i,creator:/\b(?:links?|work|projects?|bio|content|podcast|episode)\b/i,studio:/\b(?:work|projects?|contact|studio)\b/i,events:/\b(?:events?|tickets?|line.up|nights?|venue|programme?)\b/i,cocktail:/\b(?:menus?|bar|drinks?|hours)\b/i,property:/\b(?:property|properties|photos?|listings?|images?)\b/i}[job.feature.id];
  const foreign={restaurant:/\b(?:bio|property|tickets?|portfolio)\b/i,creator:/\b(?:QR|menus?|tickets?|property|properties)\b/i,studio:/\b(?:QR|menus?|tickets?|property|properties)\b/i,events:/\b(?:QR|menus?|property|properties|bio)\b/i,cocktail:/\b(?:QR|tickets?|property|properties|bio)\b/i,property:/\b(?:QR|menus?|tickets?|bio)\b/i}[job.feature.id];
  if(!subject||!subject.test(text)||foreign.test(text))throw new Error('Keep every line on the selected '+job.feature.id+' topic; it must match the visual cards and supplied capability');
  if(!subject.test(copy.hook))throw new Error('Name the specific work, menu, event or property in the opening; avoid generic one-place slogans');
  if(job.kind==='post'&&job.feature.id==='creator'&&/which link (?:goes|belongs)/i.test(copy.hook))throw new Error('Explain what the bio link opens; a choice-of-links question is not explained by the poster diagram');
  if(!/[.!?]$/.test(copy.hook.trim())||copy.hook.includes(','))throw new Error('Use one fluent spoken sentence or question with final punctuation; do not join nouns with commas');
  if(/\b(?:public (?:business |themed )?page|content blocks?|themes?)\b/i.test(text))throw new Error('Explain only the selected customer problem and solution in everyday words; remove public page, theme and content-block jargon');
  if(/\b(?:built.in messaging|send messages directly|native booking|ticket processing|guaranteed results)\b/i.test(text))throw new Error('Do not claim native messaging, booking, ticket processing or outcomes');
  const spoken=[copy.hook,copy.detail,...(copy.story||[]).map(b=>b.line)].join(' ');
  if(/https?:\/\/|\bExample\.(?:com|net)\b|\bexample dot com\b/i.test(spoken))throw new Error('The website invitation belongs only in the final scene');
  return copy;
}
export function validatePublicCopy(copy,job) {
  const text=[copy.hook,copy.detail,...copy.steps,copy.caption,...(copy.story||[]).flatMap(b=>[b.heading,b.line])].join(' ');
  if (/\b(?:your page[.!\s]+your way|make it yours|the full picture|next chapter|unlock your|elevate your|seamless|game.chang|digital presence|online presence)\b/i.test(text)) throw new Error('Replace generic advertising slogans with a concrete customer situation');
  if (/\b(?:kinetic typography|motion graphics|content.card collage|art direction|storyboard)\b/i.test(text)) throw new Error('Public copy contains production directions');
  const count=t=>t.trim().split(/\s+/).length;
  if (count(copy.hook)>9 || count(copy.detail)>14 || (copy.story||[]).some(b=>count(b.heading)>8||count(b.line)>11)) throw new Error('Simplify the message: one short sentence per beat');
  if (count(copy.caption)>65) throw new Error('Keep the caption under 65 words');
  if(job)validateCreativeTopic(copy,job);
  return copy;
}
export function creativeWriterRequest(job,recent,{request,reelSchema}) {
  chooseCampaign(job,recent);
  const schema={type:'object',additionalProperties:false,properties:{hook:reelSchema.properties?.hook||{type:'string',maxLength:70},caption:reelSchema.properties?.caption||{type:'string',maxLength:900}},required:['hook','caption']};
  return {...request(schema,'social_studio_copy',
    'Write ONLY a concrete 3-7-word opening and a 35-55-word caption for the supplied Example campaign. The supplied capability is the entire fact set. Follow the subject, situation and visual labels. The opening is spoken aloud: write one complete, fluent sentence or direct question with normal English grammar and final punctuation. Never use comma-joined nouns or telegraphic fragments. Examples of grammatical structure: Can visitors find your work? Your menu changed before service. The opening must name a concrete item such as projects, work, menu or event, stay under 46 characters and contain no comma, URL or website invitation. Recent openings are an AVOID list, not topics to borrow. The caption develops the same everyday problem and one related solution, ending with one invitation to example.com; at most two relevant hashtags. No lists of unrelated benefits, abstract slogans, jargon, hype, invented results, urgency, customers, testimonials or unsupported functions. Do not claim native messaging, booking or ticket processing: contact and ticket links lead to external services. Do not say public page, content blocks or theme. The narrated story comes from the supplied campaign catalog; do not write or replace it. For studio work, visitors want to view the portfolio, not find a job. Use ordinary English. Return only hook and caption.',
    {brand:'Example',format:job.kind,subject:job.feature.id,capability:job.feature.fact,audience:job.feature.audience,focus:topicFor(job).solution,campaignFocus:campaign(job).focus,story:campaignStory(job),visualLabels:topicFor(job).labels,proofDirection:'The visual is a fictional illustrative demo. Keep the opening and caption on this exact campaignFocus and three-beat situation. Do not invent an editor action, result, property or menu item. QR appears only in the QR campaign. Contact and ticket destinations are external links.',...(job.kind==='post'?{poster:postConcept(job),posterDirection:'This is an animated feed post with embedded instrumental music and no narration. It shows a fictional illustrative demonstration and the relevant feature. The caption must explain the same story as the supplied fixed slide text. No narration directions or Instagram one-link-limit claims.'}:{}),angle:job.angle,recentHooksToAvoid:recent.map(j=>j.copy?.hook).filter(Boolean)}),reasoning_effort:'low'};
}
export function creativeReviewerRequest(job,{request,reviewSchema}) {
  return {...request(reviewSchema,'Example_editorial_review',
    'Review this English Example ad against the selected subject, visual labels and supplied capability. Require one clear problem, one relevant solution, connected story beats and readable everyday English. The opening is spoken aloud: reject missing conjunctions, comma-joined noun lists and telegraphic fragments; require a grammatical sentence or direct question. Reject a topic that does not match the visual labels, internal production instructions, generic slogans, unrelated benefits, unsupported functions, fabricated metrics, urgency, customer proof or promises of outcomes. This is an ad: a plain factual website invitation and up to two relevant hashtags are allowed, not rejection reasons. Generic hypothetical situations are allowed and are not testimonials. External ticket/contact links are allowed; native booking or ticket processing is not. Give up to three specific evidence-based correction reasons. Approve factual coherent copy without demanding more features, adjectives or a demo disclaimer. Review does not authorize publication.',
    {subject:job.feature.id,focus:topicFor(job).solution,campaignFocus:campaign(job).focus,visualLabels:topicFor(job).labels,capability:job.feature.fact,audience:job.feature.audience,copy:job.copy,proofReview:'Require the opening and caption to follow this exact campaignFocus and the supplied three-beat story. The visual shows native fictional product demos. Reject invented UI actions, dish names or customer results. A contact link leads to an external service.',...(job.kind==='post'?{poster:postConcept(job),posterReview:'The image is animated. Require the opening, native demo and fixed slide text to explain the same situation. Do not claim a one-link Instagram limit.'}:{})}),reasoning_effort:'low'};
}
