import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeWorkspace } from '../src/domain/analyze.js';
import { mediaRecords, leadRecords, creativeRecords } from '../src/sample-data/demo.js';

test('unified analysis calculates all three product dimensions', () => {
  const result = analyzeWorkspace({ mediaRecords, leadRecords, creativeRecords });
  assert.ok(result.scores.overall > 0);
  assert.ok(result.scores.efficiency > 0);
  assert.ok(result.scores.leadQuality > 0);
  assert.ok(result.scores.creativeHealth > 0);
  assert.equal(result.media.spend, 1600);
  assert.equal(result.leads.leads, 10);
  assert.equal(result.leads.qualified, 5);
  assert.equal(result.leads.sales, 3);
  assert.ok(result.leads.cpql > result.media.cpl);
  assert.equal(result.creativeGroups.length, 4);
  assert.ok(result.recommendations.length > 0);
});

test('recommendations stay evidence-based', () => {
  const result = analyzeWorkspace({ mediaRecords, leadRecords, creativeRecords });
  for (const item of result.recommendations) {
    assert.ok(item.category);
    assert.ok(item.title);
    assert.ok(item.interpretation);
    assert.ok(item.action);
    assert.ok(Array.isArray(item.evidence));
  }
});

test('empty workspace returns safe zero scores', () => {
  const result = analyzeWorkspace({});
  assert.deepEqual(result.scores, { efficiency: 0, leadQuality: 0, creativeHealth: 0, overall: 0 });
  assert.equal(result.recommendations.length, 0);
});
