export type TourSelection={packageId:string;startDate:string;market:'SAARC'|'Non-SAARC'|'Local';nationality:string;adults:number;children:{age:number;extraBed:boolean}[];rooms:{single:number;double:number;triple:number};category:'3 Star'|'4 Star'|'5 Star';mealPlan:'BB'|'HB';hotels:Record<string,string>;activities:string[];dayNotes:Record<string,string>};
export type BuilderTour={id:string;slug?:string;title:string;summary:string;duration_days:number;duration_nights:number;hero_image_url?:string};
export type BuilderQuote={title:string;startDate:string;endDate:string;currency:string;status:'priced'|'needs_selection';total:number|null;fingerprint:string|null;blockers:string[];inclusions:string[];exclusions:string[];availableHotels:Record<string,{id:string;name:string;room:string;mealPlan:string}[]>;itinerary:{day:number;date:string;title:string;description:string;route:string;hotel:string;mealPlan:string;supplement:string;dinnerFallback:boolean;notes:string;activities:{id:string;name:string;included:boolean}[]}[]};
export type BuilderBooking={reference:string;status:string;confirmed:boolean;message:string};
export const initialSelection:TourSelection={packageId:'',startDate:'',market:'Non-SAARC',nationality:'',adults:2,children:[],rooms:{single:0,double:1,triple:0},category:'4 Star',mealPlan:'BB',hotels:{},activities:[],dayNotes:{}};
export function validateSelection(s:TourSelection) {
  if(!s.packageId) return 'Choose your itinerary.';
  if(!s.startDate || !Number.isFinite(Date.parse(`${s.startDate}T00:00:00Z`))) return 'Choose your travel date.';
  if(s.nationality.trim().length<2) return 'Enter your nationality.';
  if(!Number.isInteger(s.adults)||s.adults<1||s.adults>32) return 'Choose 1–32 adults.';
  if(s.rooms.single+s.rooms.double*2+s.rooms.triple*3!==s.adults) return 'Your room occupancy must accommodate every adult exactly.';
  if(s.children.some(c=>!Number.isInteger(c.age)||c.age<0||c.age>11)) return 'Enter every child’s age, from 0 to 11. Travellers aged 12 and above count as adults.';
  return null;
}
export async function builderRequest(payload?:unknown,draft?:string) {
  const response=await fetch(`/api/tour-builder${draft?`?draft=${encodeURIComponent(draft)}`:''}`,payload?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}:{cache:'no-store'});
  const result=await response.json();if(!response.ok) throw new Error(result.error || 'The package could not be loaded.');return result;
}
