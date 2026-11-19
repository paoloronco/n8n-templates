import { creativeWriterRequest, creativeReviewerRequest, validatePublicCopy } from './message.mjs';
export const MODEL = 'gpt-5-mini';
export const RESERVATION = 0.05;
export const MONTHLY_USD = 3;
export const features = [
  { id: 'restaurant', audience: 'Restaurant owners', category: 'THE DIGITAL MENU', asset: 'live-restaurant-01.webp', video: 'menu-mobile.webm', fact: 'Create a public restaurant page with a native digital menu. The same page URL can remain behind a printed QR code when menu content is updated.', proof: 'Illustrative fictional restaurant demo and actual Menu component with fictional data.', url: 'https://example.com/demos/restaurant-01', hooks: ['New menu. Same QR code.', 'The menu changed. The link stayed.', 'Give tonight’s menu a place to live.'] },
  { id: 'creator', audience: 'Independent creators', category: 'CREATOR PAGES', asset: 'live-creator-01.webp', fact: 'Build a public page that brings together your links and content with your chosen theme.', proof: 'Illustrative fictional creator fixture for a fictional demo brand.', url: 'https://example.com/demos/creator-01', hooks: ['Your work deserves more than a list.', 'One page. Your next chapter.', 'Give your next release a home.'] },
  { id: 'studio', audience: 'Freelancers and studios', category: 'A PAGE FOR YOUR WORK', asset: 'live-studio-01.webp', video: 'profile-mobile.webm', fact: 'Create a public business page with contact links, content and a customizable visual theme.', proof: 'Illustrative fictional studio demo and actual Profile component with fictional data.', url: 'https://example.com/demos/studio-01', hooks: ['Make your work easy to find.', 'Your studio, in one clear page.', 'Start with the work. End with a next step.'] },
  { id: 'events', audience: 'Clubs and event organizers', category: 'THE NEXT EVENT', asset: 'live-club-02.webp', fact: 'Create a public page for event information and links to external booking or ticket services. Native booking and ticket processing are not claimed.', proof: 'Illustrative fictional club demo.', url: 'https://example.com/demos/club-02', hooks: ['Tonight has a destination.', 'Give your next event one clear link.', 'The line-up. The details. One page.'] },
  { id: 'cocktail', audience: 'Cocktail bars', category: 'BEYOND THE BAR', asset: 'live-cocktail-01.webp', fact: 'Show a bar’s menu and information on a public page with links chosen by its owner.', proof: 'Illustrative fictional cocktail bar demo.', url: 'https://example.com/demos/cocktail-01', hooks: ['A menu worth opening.', 'Let the evening start on your page.', 'Your bar has a character. Show it.'] },
  { id: 'property', audience: 'Small real estate agencies', category: 'ROOM FOR YOUR LISTINGS', asset: 'live-real-estate-01.webp', fact: 'Present property information, images and contact links in a public page. This does not claim a property-management, CRM or transaction system.', proof: 'Illustrative fictional real estate demo; properties and prices are fictional.', url: 'https://example.com/demos/real-estate-01', hooks: ['Give your listings a clear address.', 'The property. The details. The next step.', 'Make room for your next listing.'] },
];
export const layouts = ['editorial', 'blueprint', 'spotlight'];
const field = (description, maxLength) => ({ type: 'string', description, maxLength });
export const copySchema = { type: 'object', additionalProperties: false, properties: {
  hook: field('Specific English opening; no unsupported outcomes, maximum 70 characters.', 70),
  detail: field('One short concrete supporting sentence, maximum 110 characters.', 110),
  steps: { type: 'array', items: field('A complete 3-6 word slide heading, maximum 48 characters. Never truncate a word or add a Next step prefix.', 48), minItems: 3, maxItems: 3 },
  caption: field('Plain English caption, 35-55 words, one specific situation and one invitation to example.com. At most two relevant hashtags. No invented customer or results.', 900),
}, required: ['hook', 'detail', 'steps', 'caption'] };
const reelSchema={...copySchema,properties:{...copySchema.properties,story:{type:'array',minItems:3,maxItems:3,items:{type:'object',additionalProperties:false,properties:{heading:field('Readable 3-7 word story beat, under 46 characters.',46),line:field('A short complete 6-9 word spoken sentence. Hypothetical everyday situation, not a customer testimonial.',110)},required:['heading','line']}}},required:[...copySchema.required,'story']};
export const reviewSchema = { type: 'object', additionalProperties: false, properties: {
  approved: { type: 'boolean' },
  reasons: { type: 'array', items: { type: 'string', maxLength: 240 }, maxItems: 3 },
}, required: ['approved', 'reasons'] };
export function request(schema, name, instructions, data) {
  return { model: MODEL, reasoning_effort: 'minimal', max_completion_tokens: 3000, messages: [
    { role: 'system', content: instructions }, { role: 'user', content: JSON.stringify(data) },
  ], response_format: { type: 'json_schema', json_schema: { name, strict: true, schema } } };
}
export function writerRequest(job,recent){return creativeWriterRequest(job,recent,{request,reelSchema});}
export function reviewerRequest(job){return creativeReviewerRequest(job,{request,reviewSchema});}
export function parseCompletion(raw) {
  if (raw?.model !== MODEL && !raw?.model?.startsWith(MODEL + '-')) throw new Error('Unexpected model');
  if (raw.choices?.[0]?.finish_reason !== 'stop') throw new Error('Incomplete or refused AI response');
  return JSON.parse(raw.choices[0].message.content);
}
export function usageCost(raw) {
  const u = raw?.usage;
  if (!u || !Number.isSafeInteger(u.prompt_tokens) || !Number.isSafeInteger(u.completion_tokens) || u.prompt_tokens < 0 || u.completion_tokens < 0) throw new Error('Missing valid provider usage');
  if (u.prompt_tokens > 16000 || u.completion_tokens > 3000) throw new Error('Usage exceeds bounded request');
  return Math.ceil(u.prompt_tokens * .25 + u.completion_tokens * 2) / 1e6;
}
export function validateCopy(copy, recent = [], job) {
  if (!copy || !['caption,detail,hook,steps','caption,detail,hook,steps,story'].includes(Object.keys(copy).sort().join(','))) throw new Error('Invalid copy shape');
  for (const [key, min, max] of [['hook', 10, 70], ['detail', 15, 110], ['caption', 100, 900]]) {
    const unsafe = key === 'caption' ? /[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/u : /[<>\u0000-\u001f]/u;
    if (typeof copy[key] !== 'string' || copy[key].length < min || copy[key].length > max || unsafe.test(copy[key])) throw new Error('Invalid ' + key);
  }
  if (!Array.isArray(copy.steps) || copy.steps.length !== 3 || copy.steps.some(t => typeof t !== 'string' || t.length < 5 || t.length > 48 || /[<>\u0000-\u001f]/u.test(t))) throw new Error('Invalid step headings');
  if(copy.story && (!Array.isArray(copy.story)||copy.story.length!==3||copy.story.some(b=>!b||Object.keys(b).sort().join(',')!=='heading,line'||typeof b.heading!=='string'||b.heading.length<5||b.heading.length>46||typeof b.line!=='string'||b.line.length<15||b.line.length>110||b.line.split(/\s+/).length>20||/[<>\u0000-\u001f]/u.test(b.heading+b.line))))throw new Error('Invalid story beats');
  const all = [copy.hook, copy.detail, ...copy.steps, copy.caption,...(copy.story||[]).flatMap(b=>[b.heading,b.line])].join(' ');
  if (/revolutioni[sz]e|game.chang|unlock your|seamless|guarantee|\d+\s*%|[$€£]|free forever|double your|boost (your )?(sales|conversion)|real customer/i.test(all)) throw new Error('Unsupported or generic marketing claim');
  if ((copy.caption.match(/\b[A-Za-z][A-Za-z’']+\b/g)||[]).length<18) throw new Error('Caption must contain meaningful English prose');
  const words = s => new Set(s.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(w => w.length > 2));
  const a = words(copy.hook);
  for (const old of recent) {
    const b = words(old.copy?.hook ?? ''); const overlap = [...a].filter(w => b.has(w)).length;
    if (b.size && overlap / new Set([...a, ...b]).size > .72) throw new Error('Opening too close to a recent creative');
  }
  return validatePublicCopy(copy,job);
}
