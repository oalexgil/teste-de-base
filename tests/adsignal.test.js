import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeWorkspace } from '../src/domain/analyze.js';
import { mediaRecords, leadRecords, creativeRecords } from '../src/sample-data/demo.js';
import { baselineMediaRecords, baselineLeadRecords, businessTargets, demoExperiments } from '../src/sample-data/history.js';

const fullWorkspace = () => analyzeWorkspace({
  mediaRecords,
  leadRecords,
  creativeRecords,
  baselineMediaRecords,
  baselineLeadRecords,
  targets: businessTargets,
  experiments: demoExperiments,
});

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

test('temporal analysis detects deterioration and estimates directional budget risk', () => {
  const result = fullWorkspace();
  assert.ok(result.change.trends.length >= 6);
  assert.ok(result.change.trends.some((trend) => trend.key === 'cac' && trend.status === 'worse'));
  assert.ok(result.change.targetChecks.some((check) => check.key === 'cac' && check.breached));
  assert.ok(result.change.budgetAtRisk.amount > 0);
  assert.equal(result.change.budgetAtRisk.methodology.includes('not a revenue forecast'), true);
});

test('experiment engine converts historical comparison into learning state', () => {
  const result = fullWorkspace();
  assert.equal(result.experiments.length, 2);
  assert.ok(result.experiments.every((experiment) => ['winner', 'loser', 'learning'].includes(experiment.status)));
  assert.ok(result.experiments.some((experiment) => experiment.status === 'loser'));
});

test('recommendations stay evidence-based', () => {
  const result = fullWorkspace();
  for (const item of result.recommendations) {
    assert.ok(item.category);
    assert.ok(item.title);
    assert.ok(item.interpretation);
    assert.ok(item.action);
    assert.ok(Array.isArray(item.evidence));
  }
});

test('empty workspace returns safe zero scores and no false risk', () => {
  const result = analyzeWorkspace({});
  assert.deepEqual(result.scores, { efficiency: 0, leadQuality: 0, creativeHealth: 0, overall: 0 });
  assert.equal(result.recommendations.length, 0);
  assert.equal(result.change.budgetAtRisk.amount, 0);
});
