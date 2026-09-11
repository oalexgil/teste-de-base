import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '../src/importers/csv.js';
import { inferMapping, applyMapping, mappingQuality } from '../src/importers/mapping.js';
import { normalizeMediaRow, normalizeLeadRow } from '../src/importers/normalize.js';
import { splitComparablePeriods } from '../src/domain/periods.js';
import { analyzeWorkspace } from '../src/domain/analyze.js';
import { saveWorkspace, loadWorkspace, listWorkspaces } from '../src/workspace/store.js';
import { buildExecutiveReportHtml } from '../src/report/export.js';
import { mediaRecords, leadRecords, creativeRecords } from '../src/sample-data/demo.js';

class FakeStorage {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
}

test('column mapper recognizes common Portuguese paid-media exports', () => {
  const csv = 'Data;Nome da campanha;Valor gasto;Impressoes;Cliques;Resultados\n01/09/2026;Campanha A;1.234,56;10000;300;25';
  const rows = parseCsv(csv);
  const mapping = inferMapping(rows, 'media');
  const quality = mappingQuality(mapping, 'media');
  assert.equal(quality.ok, true);
  assert.equal(mapping.spend, 'Valor gasto');
  assert.equal(mapping.campaignName, 'Nome da campanha');
  const normalized = applyMapping(rows, mapping).map(normalizeMediaRow);
  assert.equal(normalized[0].spend, 1234.56);
  assert.equal(normalized[0].clicks, 300);
  assert.equal(normalized[0].leads, 25);
});

test('single historical export is split into baseline and current periods', () => {
  const media = [
    { date: '2026-09-01', spend: 10 },
    { date: '2026-09-02', spend: 20 },
    { date: '2026-09-03', spend: 30 },
    { date: '2026-09-04', spend: 40 },
  ];
  const leads = [
    normalizeLeadRow({ leadId: '1', createdAt: '2026-09-01', qualified: 'sim' }),
    normalizeLeadRow({ leadId: '2', createdAt: '2026-09-04', qualified: 'sim' }),
  ];
  const split = splitComparablePeriods(media, leads);
  assert.equal(split.comparable, true);
  assert.equal(split.baselineMediaRecords.length, 2);
  assert.equal(split.currentMediaRecords.length, 2);
  assert.equal(split.baselineLeadRecords.length, 1);
  assert.equal(split.currentLeadRecords.length, 1);
});

test('creative intelligence carries CRM quality and CAC downstream', () => {
  const result = analyzeWorkspace({ mediaRecords, leadRecords, creativeRecords });
  const ugc = result.creativeGroups.find((group) => group.hook === 'Stop wasting ad budget');
  assert.ok(ugc);
  assert.equal(ugc.crmLeads, 3);
  assert.equal(ugc.qualified, 2);
  assert.equal(ugc.sales, 1);
  assert.ok(ugc.cpql > 0);
  assert.ok(ugc.cac > 0);
});

test('workspace can be saved and restored locally', () => {
  const storage = new FakeStorage();
  const saved = saveWorkspace({ id: 'client-a', name: 'Cliente A', targets: { maxCac: 300 } }, storage);
  assert.equal(saved.id, 'client-a');
  assert.equal(listWorkspaces(storage).length, 1);
  const restored = loadWorkspace('client-a', storage);
  assert.equal(restored.name, 'Cliente A');
  assert.equal(restored.targets.maxCac, 300);
});

test('executive report exports the decision layer in printable HTML', () => {
  const analysis = analyzeWorkspace({ mediaRecords, leadRecords, creativeRecords });
  const html = buildExecutiveReportHtml({ workspaceName: 'Cliente A', analysis, generatedAt: new Date('2026-09-11T12:00:00Z') });
  assert.match(html, /AdSignal Executive Performance Report/);
  assert.match(html, /Cliente A/);
  assert.match(html, /CAC atual/);
  assert.match(html, /Prioridades/);
});
