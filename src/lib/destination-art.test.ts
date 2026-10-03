import {test} from 'node:test';
import assert from 'node:assert/strict';
import {destinationArtPlan} from './destination-art.ts';
test('cover identity is stable across display ordering and creates individual editions',()=>{
 const input={identity:'malaysia-visa-tourism',country:'Malaysia'};
 assert.deepEqual(destinationArtPlan(input),destinationArtPlan(input));
 assert.notEqual(destinationArtPlan(input).edition,destinationArtPlan({...input,identity:'malaysia-visa-business'}).edition);
});
test('Sri Lanka routes select relevant landmark scenes',()=>{
 assert.equal(destinationArtPlan({identity:'tea',country:'Sri Lanka',places:['Ella','Nuwara Eliya']}).motifs[0],'train');
 assert.equal(destinationArtPlan({identity:'wild',country:'Sri Lanka',places:['Yala']}).motifs[0],'elephant');
 assert.equal(destinationArtPlan({identity:'fort',country:'Sri Lanka',places:['Galle']}).motifs[0],'lighthouse');
});
test('international covers never fall back to Sri Lanka landmarks',()=>{
 assert.equal(destinationArtPlan({identity:'jp',country:'Japan'}).motifs[0],'torii');
 assert.equal(destinationArtPlan({identity:'my',country:'Malaysia'}).motifs[0],'towers');
 assert.equal(destinationArtPlan({identity:'ca',country:'Canada'}).motifs[0],'cn');
 assert.equal(destinationArtPlan({identity:'unknown',country:'New destination'}).motifs[0],'globe');
});

test('painted covers match the destination and individual international package',async()=>{
 const {destinationArtwork}=await import('./destination-art.ts');
 assert.equal(destinationArtwork({identity:'rail',country:'Sri Lanka',places:['Ella']}),'sri-lanka');
 assert.equal(destinationArtwork({identity:'safari',country:'Sri Lanka',places:['Yala']}),'sri-lanka-wildlife');
 const singapore=['05-nights','04-nights','03-nights'].map(identity=>destinationArtwork({identity,country:'Singapore'}));
 const malaysia=['04-nights','03-nights','02-nights'].map(identity=>destinationArtwork({identity,country:'Malaysia'}));
 assert.equal(new Set(singapore).size,3);
 assert.equal(new Set(malaysia).size,3);
 assert.equal(destinationArtwork({identity:'future',country:'Unknown destination'}),'world-journey');
});
