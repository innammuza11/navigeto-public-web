import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialSelection,validateSelection} from './tour-builder.ts';
import {publicBuilderResponse} from './tour-builder-response.ts';
test('traveller selections validate complete adult occupancy',()=>{const s={...initialSelection,packageId:'test',startDate:'2026-11-01',nationality:'TEST'};assert.equal(validateSelection(s),null);assert.match(validateSelection({...s,adults:3})||'',/every adult/);assert.match(validateSelection({...s,children:[{age:12,extraBed:false}]})||'',/child/);});
test('public proxy drops internal fields at every pricing boundary',()=>{const value=publicBuilderResponse({supplierCost:1,private_snapshot:{cost:2},quote:{total:850,currency:'USD',supplierCost:9,markup:75,itinerary:[{day:1,title:'TEST',hotelSgl:10,activities:[{id:'1:0',name:'TEST',included:false,entranceFee:8}]}],availableHotels:{'1':[{id:'test',name:'TEST HOTEL',single_rate:30,profit:2}]}}});assert(!JSON.stringify(value).match(/supplierCost|private_snapshot|markup|hotelSgl|entranceFee|single_rate|profit/));assert.equal((value.quote as Record<string,unknown>).total,850);});
