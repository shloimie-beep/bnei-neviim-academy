'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveRelativeDateRange } = require('./relative-date-range');

const NOW = new Date('2026-07-12T09:00:00.000Z');

test('last two weeks is a rolling 14-day Israel calendar range', () => {
  const range = resolveRelativeDateRange('Give me the questions from the last two weeks', { now: NOW });
  assert.equal(range.localFromDate, '2026-06-29');
  assert.equal(range.localToDate, '2026-07-12');
  assert.equal(range.timezone, 'Asia/Jerusalem');
  assert.equal(range.from, '2026-06-28T21:00:00.000Z');
  assert.equal(range.toExclusive, '2026-07-12T21:00:00.000Z');
});

test('Hebrew two-week phrase resolves identically', () => {
  const range = resolveRelativeDateRange('תן לי את כל השאלות מהשבועיים האחרונים', { now: NOW });
  assert.equal(range.localFromDate, '2026-06-29');
  assert.equal(range.localToDate, '2026-07-12');
});

test('last week is the previous Sunday-to-Saturday calendar week in Israel', () => {
  const range = resolveRelativeDateRange('What happened last week?', { now: NOW });
  assert.equal(range.localFromDate, '2026-07-05');
  assert.equal(range.localToDate, '2026-07-11');
});

test('today and yesterday resolve using Israel local date', () => {
  assert.equal(resolveRelativeDateRange('today', { now: NOW }).localFromDate, '2026-07-12');
  assert.equal(resolveRelativeDateRange('אתמול', { now: NOW }).localFromDate, '2026-07-11');
});

test('explicit ISO date range is inclusive', () => {
  const range = resolveRelativeDateRange('from 2026-07-01 to 2026-07-03', { now: NOW });
  assert.equal(range.localFromDate, '2026-07-01');
  assert.equal(range.localToDate, '2026-07-03');
});

test('unknown date phrase does not invent a range', () => {
  assert.equal(resolveRelativeDateRange('show me the questions sometime', { now: NOW }), null);
});
