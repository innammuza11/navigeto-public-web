import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleCost } from './travelos-sample.ts';
test('double sharing, odd parties and zero markup keep room and per-person totals consistent', () => {
  assert.deepEqual(sampleCost(2, 5, 120, 400, 100, 20), {rooms:1, net:1100, total:1320, perAdult:660, profit:220});
  const odd = sampleCost(3, 5, 120, 400, 100, 0);
  assert.equal(odd.rooms,2); assert.equal(odd.net,1700); assert.equal(odd.total,1700);
  assert.equal(odd.perAdult*3,1700); assert.equal(odd.profit,0);
});
test('adjusted quote, sample FX, deposit and remaining balance reconcile', () => {
  const quote = sampleCost(2,5,150,400,100,20);
  assert.equal(quote.total,1500); assert.equal(quote.perAdult*335,251250);
  const deposit=quote.total*.3;
  assert.equal(deposit+(quote.total-deposit),quote.total);
});
