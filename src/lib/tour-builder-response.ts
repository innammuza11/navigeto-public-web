/** Defence in depth: the public proxy cannot forward new internal upstream fields by accident. */
function pick(value:unknown,keys:string[]) {
 if(!value || typeof value!=='object' || Array.isArray(value))return undefined;
 const object=value as Record<string,unknown>;return Object.fromEntries(keys.filter(key=>key in object).map(key=>[key,object[key]]));
}
export function publicBuilderResponse(value:unknown) {
 const object=value as Record<string,unknown>;const output:Record<string,unknown>={};
 if(typeof object?.draftId==='string')output.draftId=object.draftId;
 if(Array.isArray(object?.tours))output.tours=object.tours.map(t=>pick(t,['id','title','slug','summary','duration_days','duration_nights','hero_image_url']));
 if(object?.selection)output.selection=pick(object.selection,['packageId','startDate','market','nationality','adults','children','rooms','category','mealPlan','hotels','activities','dayNotes']);
 if(object?.booking)output.booking=pick(object.booking,['reference','status','confirmed','message']);
 if(object?.quote){const quote=pick(object.quote,['title','startDate','endDate','currency','status','total','fingerprint','blockers','inclusions','exclusions'])!;
 const source=object.quote as Record<string,unknown>;
 quote.itinerary=Array.isArray(source.itinerary)?source.itinerary.map(day=>{const d=pick(day,['day','date','title','description','route','hotel','mealPlan','supplement','dinnerFallback','notes'])!;const activities=(day as Record<string,unknown>).activities;d.activities=Array.isArray(activities)?activities.map(a=>pick(a,['id','name','included'])):[];return d;}):[];
 const hotels=source.availableHotels as Record<string,unknown>;quote.availableHotels=hotels && typeof hotels==='object'?Object.fromEntries(Object.entries(hotels).map(([day,rows])=>[day,Array.isArray(rows)?rows.map(h=>pick(h,['id','name','room','mealPlan'])):[]])):{};
 output.quote=quote;}
 return output;
}
