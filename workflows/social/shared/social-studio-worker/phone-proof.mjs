import{campaign,campaignIndex}from'./campaign.mjs';

// One native page inside one device. Focus is a scroll position, never an
// independent screenshot enlargement alongside it.
export function phoneProof(job,beat=0){
 const id=job.feature.id,{focus}=campaign(job);let name=id,offset=0;
 if(id==='creator'){name='creator-'+(campaignIndex(job)%2+1);if(beat>1)offset=focus==='contact'?1:focus==='podcast'?.36:.16;}
 else if(id==='restaurant'){name=focus==='qr'&&beat>=3?'qr-restaurant':'restaurant';if(beat>0&&name==='restaurant')offset=focus==='dietary'?.12:focus==='categories'?.34:.08;}
 else if(id==='cocktail'){name=['menu','prices','categories'].includes(focus)&&beat>=3?'cocktail-menu':'cocktail';if(beat>1)offset=name==='cocktail-menu'?1:focus==='about'?1:.12;}
 else if(beat>1)offset=focus==='contact'?1:focus==='about'?0:id==='property'?.16:id==='events'?.4:.24;
 return {phone:'sample-'+name+'.png',phoneOffset:offset};
}
