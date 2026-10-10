import assert from 'node:assert/strict';
import test from 'node:test';
import { assess } from './pressed-field.js';

test('empty required email fails', () => {
  const result = assess('  ', { validate: 'email', required: true });
  assert.equal(result.ok, false);
  assert.equal(result.empty, true);
});

test('incomplete email stays invalid', () => {
  const result = assess('ada@print', { validate: 'email', required: true });
  assert.equal(result.ok, false);
  assert.equal(result.empty, false);
});

test('complete email passes', () => {
  const result = assess(' ada@print.co ', { validate: 'email', required: true });
  assert.equal(result.ok, true);
});

test('short name fails minlength', () => {
  const result = assess('A', { validate: 'text', required: true, minlength: 2 });
  assert.equal(result.ok, false);
});

test('name of two characters passes', () => {
  const result = assess('Ada', { validate: 'text', required: true, minlength: 2 });
  assert.equal(result.ok, true);
});

test('whatsapp requires a country code', () => {
  assert.equal(assess('612 345 678', { validate: 'whatsapp', required: true }).ok, false);
  assert.equal(assess('+34 612 345 678', { validate: 'whatsapp', required: true }).ok, true);
  assert.equal(assess('0044 20 7946 0958', { validate: 'phone', required: true }).ok, true);
  assert.equal(assess('+123', { validate: 'phone', required: true }).ok, false);
});

test('optional empty text is valid', () => {
  const result = assess('', { validate: 'text', required: false });
  assert.equal(result.ok, true);
  assert.equal(result.empty, true);
});

test('error attribute replaces the default message', () => {
  const result = assess('nope', {
    validate: 'email',
    required: true,
    error: 'Enter a complete email address.',
  });
  assert.equal(result.message, 'Enter a complete email address.');
});

test('pattern and a custom function both have to pass', () => {
  const pattern = assess('studio', { validate: 'pattern', pattern: '^studio', required: true });
  assert.equal(pattern.ok, true);
  const fn = assess('studio', {
    validate: 'text',
    required: true,
    validator: (value) => value.includes('north') || 'Mention the north light.',
  });
  assert.equal(fn.ok, false);
  assert.equal(fn.message, 'Mention the north light.');
});

test('a broken pattern fails closed', () => {
  const result = assess('abc', { validate: 'pattern', pattern: '(', required: true });
  assert.equal(result.ok, false);
});
