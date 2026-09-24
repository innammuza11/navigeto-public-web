import test from 'node:test';
import assert from 'node:assert/strict';
import { demoRequestPayload } from './travelos-demo.ts';

function form() {
 const data=new FormData();
 for(const [key,value] of Object.entries({name:'Demo person',agency:'Example agency',email:'demo@example.test',phone:'+94 77 123 4567',goal:'Costing and quotations',consent:'on'}))data.set(key,value);
 return data;
}
test('software request is labelled explicitly and contains no fabricated travel details',()=>{
 const result=demoRequestPayload(form(),'?utm_source=linkedin&utm_medium=organic&utm_campaign=travelos_pilot&utm_content=workflow_demo&email=private@example.test&token=secret');
 assert.equal(result.enquiry_type,'general');assert.equal(result.details.request_kind,'agency_software_demo');
 assert.match(result.subject,/Example agency/);assert.match(result.notes,/not a travel booking/);
 assert.deepEqual(result.details.campaign,{utm_source:'linkedin',utm_medium:'organic',utm_campaign:'travelos_pilot',utm_content:'workflow_demo'});
 assert.ok(!('pax' in result));assert.ok(!('travel_start_date' in result));
 assert.ok(!JSON.stringify(result).includes('secret'));assert.ok(!JSON.stringify(result).includes('private@example.test'));
});
test('demo requires consent and usable contact fields',()=>{
 for(const [key,value] of [['consent',''],['name',' '],['agency','x'],['email','no-email'],['phone','no-phone'],['phone','.......']]){
  const data=form();data.set(key,value);assert.throws(()=>demoRequestPayload(data,''));
 }
});
test('campaign labels reject URLs, contacts and oversized values',()=>{
 const result=demoRequestPayload(form(),`?utm_source=https://example.test/private&utM_campaign=ignored&utm_medium=user@example.test&utm_content=${'a'.repeat(101)}`);
 assert.deepEqual(result.details.campaign,{});
});
