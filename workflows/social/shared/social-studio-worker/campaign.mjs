// Fictional situations, illustrated only by owned captures of the native product.
const stories={
  restaurant:[
    ['qr','The menu changed before service.','Tonight’s menu has changed.','The printed QR stays.','Keep the code already on your tables.','Edit the linked menu.','Update the menu behind the same page link.'],
    ['menu','Let guests see the dishes.','Guests want to explore the menu before ordering.','A title is not enough.','The dish description helps explain what is included.','Give each dish its details.','Show descriptions and prices on your menu page.'],
    ['categories','Make the menu easier to explore.','Guests are looking for a particular course.','A long list takes time.','They need a clear way through the dishes.','Organise dishes by category.','Keep starters and main courses in their own sections.'],
    ['dietary','Make dietary details easy to find.','A guest wants to check a dish’s ingredients.','The useful details matter.','Dietary labels and allergens belong beside the dish.','Keep the information close.','Show those details on the menu item itself.'],
    ['prices','Show the price beside the dish.','Guests want to compare dishes on the menu.','Separate information slows them down.','The description and price should be easy to find.','Put the details together.','Keep prices and descriptions beside each menu item.'],
  ],
  creator:[
    ['work','Your new project deserves a place.','You have a new project ready to share.','The old destination feels dated.','Your bio still opens work from earlier.','Update the destination.','Bring the latest project onto your creator page.'],
    ['contact','Let your work lead somewhere.','Someone enjoys a project you have shared.','Now they want to connect.','Your contact link should be easy to find.','Keep the next step close.','Put your contact links beside your creative work.'],
    ['podcast','Give your podcast a home.','A new podcast episode is ready to share.','The rest of your work matters.','One episode link leaves other projects out.','Bring the episode onto your page.','Keep your podcast beside your other work and links.'],
    ['work','Show more than the latest post.','Someone finds one piece of your creative work.','There is more to explore.','Your earlier projects still deserve a place.','Build a useful collection.','Show selected projects together on your creator page.'],
    ['contact','Keep your creator links current.','You have more than one profile to share.','The destinations can change.','A shared page should reflect your current work.','Update the page you share.','Keep your work and contact links together.'],
  ],
  studio:[
    ['work','Give your projects some context.','Someone is exploring the work your studio does.','A title leaves questions.','They want to understand what the project involved.','Put context beside the work.','Show your projects and information on your studio page.'],
    ['contact','Make the next step easy.','A visitor likes one of your studio projects.','Where can they contact you?','They should not need to search somewhere else.','Keep the contact link close.','Put a contact link beside your studio’s work.'],
    ['work','Your portfolio can keep growing.','Your studio has another project ready to share.','The shared link already exists.','It should still lead to your current work.','Update your project collection.','Keep selected studio projects on the page you share.'],
    ['about','Introduce the studio behind the work.','A visitor has found one of your projects.','Who created the project?','Your work needs a little context about the studio.','Bring the introduction together.','Show studio information beside your selected projects.'],
    ['contact','Share a useful studio destination.','Someone asks where they can explore your work.','One image tells part of it.','They also need context and a contact link.','Give them your studio page.','Keep your projects and contact details together.'],
  ],
  events:[
    ['program','Let guests explore your upcoming nights.','Someone is planning their next night out.','The announcement is only a start.','They want to see what is coming up.','Give the programme a destination.','Put event information together on your venue page.'],
    ['contact','Keep the booking link easy to find.','A guest wants to ask about a table.','The next step needs a link.','The event announcement should lead somewhere useful.','Show the external contact option.','Keep event information beside a link to contact you.'],
    ['program','Make room for the next event.','Your venue has another night to announce.','Old announcements stay in the feed.','Guests need somewhere to find current event information.','Keep the venue page current.','Share one destination for your upcoming nights.'],
    ['about','Introduce the place behind the event.','Someone is discovering your venue for the first time.','An event name leaves questions.','They want to know what kind of night awaits.','Give visitors more context.','Bring venue information and upcoming events together.'],
    ['program','Give the event a lasting destination.','Your next event is ready to share.','A post soon moves down.','The useful information still needs a home.','Share your venue page.','Keep event information and relevant links together.'],
  ],
  cocktail:[
    ['menu','Let guests explore your drinks.','A guest is choosing where to spend the evening.','A bar photo tells part of it.','They also want to see the drinks menu.','Put the menu on your page.','Show drinks and prices before the visit.'],
    ['hours','Make opening hours easy to find.','Someone is planning a visit to your bar.','They need the practical details.','A drinks photo does not show opening hours.','Keep the visit information together.','Show your drinks menu and bar information together.'],
    ['categories','Give each drink its place.','A guest wants to explore the drinks menu.','One photo is hard to browse.','Clear menu sections help organise the choices.','Group the drinks by category.','Show the drinks in their own menu sections.'],
    ['prices','Show what is in the glass.','A guest is comparing drinks on your menu.','Names alone leave questions.','Descriptions and prices help explain the options.','Keep the useful details close.','Show descriptions and prices beside each drink.'],
    ['about','Give your bar one useful destination.','Someone has discovered your bar on social media.','The visit takes a little planning.','They want the menu and practical bar information.','Bring the details onto your page.','Keep your drinks menu and information together.'],
  ],
  property:[
    ['photos','Give property photos their context.','A property photo catches someone’s attention.','The image leaves questions.','They want to know more about the space.','Put the details beside the photos.','Show property information on the page you share.'],
    ['contact','Let interest lead to a contact link.','A visitor wants to ask about a property.','The next step should be clear.','The photos need a way to find contact details.','Keep a contact link close.','Put property information and contact links together.'],
    ['photos','Give each property room to show.','Someone is exploring the properties you have shared.','One picture tells part of it.','They need photos and information together.','Build a useful property page.','Keep selected property images beside their details.'],
    ['details','Keep property details easy to compare.','A visitor is looking through your property photos.','The details help explain the space.','The description belongs beside the property photos.','Put the information together.','Show photos and property details on your page.'],
    ['contact','Share a destination for property questions.','Someone asks where to find your property information.','A photo is only a start.','They need the details and a contact option.','Give them your property page.','Show property photos beside details and contact links.'],
  ],
};

const solutions={
  restaurant:['Guests scan the same code for your menu.','Give guests a readable menu before they choose.','Give guests a menu with clear sections.','Guests can check the details before choosing.','Let guests compare your dishes on the page.'],
  creator:['Share the page link from your profile.','Visitors can follow the contact link from there.','Listeners can find the episode beside your work.','Give visitors a collection they can explore.','Share the destination that reflects your current work.'],
  studio:['Share a page that introduces your studio’s work.','Visitors can follow the contact link from there.','Share a portfolio that reflects your latest work.','Let visitors discover the studio behind the projects.','Send visitors a useful introduction to your work.'],
  events:['Share the venue page before the night begins.','Visitors can follow your chosen external contact link.','Give guests a destination for your current programme.','Let guests discover the venue before their visit.','Share the page wherever you announce the event.'],
  cocktail:['Let guests explore the drinks before their visit.','Share the bar page when guests plan a visit.','Give guests a drinks menu they can browse.','Let guests read about each drink before choosing.','Share a useful destination for your bar.'],
  property:['Give visitors a clearer view of the property.','Visitors can follow the contact link from there.','Share the property page with interested visitors.','Let visitors explore each property’s photos and details.','Share a useful starting point for property enquiries.'],
};

export function campaignIndex(job){
  if(Number.isInteger(job.campaignIndex)&&job.campaignIndex>=0&&job.campaignIndex<5)return job.campaignIndex;
  const hex=String(job.id||'0').replaceAll('-','');
  return (Number.parseInt(hex.slice(-8),16)||0)%5;
}
export function chooseCampaign(job,recent=[]){
  if(Number.isInteger(job.campaignIndex))return;
  const used=recent.filter(j=>j.feature?.id===job.feature.id).map(j=>campaignIndex(j));
  const start=campaignIndex(job);
  job.campaignIndex=Array.from({length:5},(_,i)=>(start+i)%5).find(i=>!used.includes(i))??start;
}
export function campaign(job){
  const row=stories[job.feature.id]?.[campaignIndex(job)];
  if(!row)throw new Error('No verified campaign');
  return {focus:row[0],story:[1,3,5].map(i=>({heading:row[i],line:row[i+1]})),solution:solutions[job.feature.id][campaignIndex(job)]};
}
