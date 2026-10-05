import {test} from 'node:test';
import assert from 'node:assert/strict';
import {itinerarySketch} from './itinerary-sketch.ts';
test('storyboard gives distinct scenes to the published Sri Lanka day sequence',()=>{
 const days=['Arrival in Colombo','Sigiriya fortress','Kandy and Temple of the Tooth','Nuwara Eliya tea country','Ella by train','Yala safari','Galle coast','Departure'];
 const actual=days.map(title=>itinerarySketch({title,copy:''}));
 assert.deepEqual(actual,['sri-lanka-arrival','sri-lanka-heritage','sri-lanka-kandy','sri-lanka-tea','sri-lanka','sri-lanka-wildlife','sri-lanka-coast','sri-lanka-arrival']);
});
test('chapter destination takes precedence over incidental programme references',()=>{
 assert.equal(itinerarySketch({title:'Kandy',copy:'After the previous safari day, visit the temple.'}),'sri-lanka-kandy');
 assert.equal(itinerarySketch({title:'Bentota',copy:'Take a Madu river safari.'}),'sri-lanka-river');
});
