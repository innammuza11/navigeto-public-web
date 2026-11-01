import test from 'node:test';
import assert from 'node:assert/strict';
import { BOT_TRAP_FIELD, FORM_STARTED_FIELD, botSignals } from './bot-signals.ts';

const root = (...values: string[]) => ({ querySelectorAll: (selector: string) => selector.includes(BOT_TRAP_FIELD) ? values.map(value => ({ value })) : [] });

test('sends an empty trap and the page start time for a person', () => {
 assert.deepEqual(botSignals(root('', ''), 1234), { [BOT_TRAP_FIELD]: '', [FORM_STARTED_FIELD]: 1234 });
});

test('reports any filled trap field on the page', () => {
 assert.equal(botSignals(root('', 'https://spam.example'), 1)[BOT_TRAP_FIELD], 'https://spam.example');
});

test('works without a document (server render)', () => {
 assert.deepEqual(botSignals(null, 0), { [BOT_TRAP_FIELD]: '', [FORM_STARTED_FIELD]: 0 });
});

test('field names match the TravelOS server check', () => {
 assert.equal(BOT_TRAP_FIELD, 'website_url');
 assert.equal(FORM_STARTED_FIELD, 'form_started_at');
});
