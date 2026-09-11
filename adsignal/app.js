import { analyzeWorkspace } from '../src/domain/analyze.js';
import { mediaRecords, leadRecords, creativeRecords } from '../src/sample-data/demo.js';
import { baselineMediaRecords, baselineLeadRecords, businessTargets, demoExperiments } from '../src/sample-data/history.js';
import { parseCsv } from '../src/importers/csv.js';
import { inferMapping, applyMapping, schemaFor, mappingQuality } from '../src/importers/mapping.js';
import { normalizeMediaRow, normalizeLeadRow, normalizeCreativeRow } from '../src/importers/normalize.js';
import { splitComparablePeriods } from '../src/domain/periods.js';
import { saveWorkspace, loadWorkspace, listWorkspaces } from '../src/workspace/store.js';
import { buildExecutiveReportHtml } from '../src/report/export.js';

const byId = (id) => document.getElementById(id);
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const percent = (value) => `${number.format((Number(value) || 0) * 100)}%`;
const escapeHtml = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const fieldLabels = {
  media: {
    date: 'Data', platform: 'Plataforma', accountId: 'ID da conta', campaignId: 'ID da campanha', campaignName: 'Campanha',
    adGroupId: 'Conjunto / grupo', adId: 'ID do anúncio', spend: 'Gasto', impressions: 'Impressões', clicks: 'Cliques',
    landingPageViews: 'Landing page views', leads: 'Leads', conversions: 'Conversões', revenue: 'Receita',
  },
  leads: {
    leadId: 'ID do lead', createdAt: 'Data de criação', platform: 'Plataforma / origem', campaignId: 'ID da campanha', adId: 'ID do anúncio',
    status: 'Status', qualified: 'Qualificado', meetingBooked: 'Reunião marcada', won: 'Venda / ganho', revenue: 'Receita', rejectionReason: 'Motivo de perda',
  },
  creative: {
    adId: 'ID do anúncio', creativeName: 'Nome do criativo', hook: 'Hook', angle: 'Ângulo', format: 'Formato', offer: 'Oferta', cta: 'CTA', launchedAt: 'Data de lançamento',
  },
};

const uploadCache = { media: null, leads: null, creative: null };
let workspace = createEmptyWorkspace();
let analysis = null;

function createEmptyWorkspace() {
  return {
    id: null,
    name: 'Minha operação',
    targets: { maxCpl: 0, maxCpql: 0, maxCac: 0, minRoas: 0, minQualificationRate: 0, maxLowQualityRate: 0 },
    experiments: [],
    mappings: { media: {}, leads: {}, creative: {} },
    records: null,
    periodMeta: null,
  };
}

function setStatus(message, tone = '') {
  const el = byId('setupStatus');
  el.textContent = message;
  el.className = `pill ${tone}`.trim();
}

async function readCsvFile(type, file) {
  if (!file) return;
  const rows = parseCsv(await file.text());
  uploadCache[type] = rows;
  workspace.mappings[type] = inferMapping(rows, type);
  const statusId = type === 'media' ? 'mediaFileStatus' : type === 'leads' ? 'leadFileStatus' : 'creativeFileStatus';
  byId(statusId).textContent = `${file.name} · ${rows.length} linhas`;
  renderMappingEditors();
  updateSetupReadiness();
}

function mappingEditor(type, rows) {
  if (!rows?.length) return '';
  const headers = Object.keys(rows[0]);
  const schema = schemaFor(type);
  const label = type === 'media' ? 'Mídia' : type === 'leads' ? 'Leads / CRM' : 'Criativos';
  return `<details class="mapping-group" open>
    <summary>${label}</summary>
    <div class="mapping-grid">
      ${Object.keys(schema).map((field) => {
        const options = ['<option value="">Não mapear</option>', ...headers.map((header) => `<option value="${escapeHtml(header)}" ${workspace.mappings[type]?.[field] === header ? 'selected' : ''}>${escapeHtml(header)}</option>`)].join('');
        return `<label><span>${escapeHtml(fieldLabels[type]?.[field] || field)}</span><select class="select mapping-select" data-type="${type}" data-field="${field}">${options}</select></label>`;
      }).join('')}
    </div>
  </details>`;
}

function renderMappingEditors() {
  const any = Object.values(uploadCache).some((rows) => rows?.length);
  byId('mappingPanel').classList.toggle('hidden', !any);
  if (!any) return;
  byId('mappingEditors').innerHTML = [
    mappingEditor('media', uploadCache.media),
    mappingEditor('leads', uploadCache.leads),
    mappingEditor('creative', uploadCache.creative),
  ].join('');
  document.querySelectorAll('.mapping-select').forEach((select) => {
    select.addEventListener('change', (event) => {
      const { type, field } = event.target.dataset;
      workspace.mappings[type][field] = event.target.value;
      updateSetupReadiness();
    });
  });
  updateMappingScore();
}

function updateMappingScore() {
  const mediaQuality = mappingQuality(workspace.mappings.media, 'media');
  const parts = [`Mídia ${mediaQuality.score}%`];
  if (uploadCache.leads?.length) parts.push(`CRM ${mappingQuality(workspace.mappings.leads, 'leads').score}%`);
  if (uploadCache.creative?.length) parts.push(`Criativos ${mappingQuality(workspace.mappings.creative, 'creative').score}%`);
  byId('mappingScore').textContent = parts.join(' · ');
  return mediaQuality;
}

function updateSetupReadiness() {
  const quality = updateMappingScore();
  const hasMedia = uploadCache.media?.length > 0;
  byId('analyzeData').disabled = !(hasMedia && quality.ok);
  if (!hasMedia) setStatus('Aguardando mídia');
  else if (!quality.ok) setStatus(`Mapeie: ${quality.missingRequired.join(', ')}`, 'danger');
  else setStatus('Pronto para analisar', 'good');
}

function readTargetsFromForm() {
  return {
    maxCpl: Number(byId('targetMaxCpl').value || 0),
    maxCpql: Number(byId('targetMaxCpql').value || 0),
    maxCac: Number(byId('targetMaxCac').value || 0),
    minRoas: Number(byId('targetMinRoas').value || 0),
    minQualificationRate: Number(byId('targetMinQualification').value || 0) / 100,
    maxLowQualityRate: Number(byId('targetMaxLowQuality').value || 0) / 100,
  };
}

function writeTargetsToForm(targets = {}) {
  byId('targetMaxCpl').value = targets.maxCpl || '';
  byId('targetMaxCpql').value = targets.maxCpql || '';
  byId('targetMaxCac').value = targets.maxCac || '';
  byId('targetMinRoas').value = targets.minRoas || '';
  byId('targetMinQualification').value = targets.minQualificationRate ? Math.round(targets.minQualificationRate * 100) : '';
  byId('targetMaxLowQuality').value = targets.maxLowQualityRate ? Math.round(targets.maxLowQualityRate * 100) : '';
}

function normalizeUploads() {
  const mappedMedia = applyMapping(uploadCache.media || [], workspace.mappings.media).map(normalizeMediaRow);
  const mappedLeads = applyMapping(uploadCache.leads || [], workspace.mappings.leads).map(normalizeLeadRow);
  const mappedCreative = applyMapping(uploadCache.creative || [], workspace.mappings.creative).map(normalizeCreativeRow);
  return { media: mappedMedia, leads: mappedLeads, creative: mappedCreative };
}

function runAnalysisFromUploads() {
  const normalized = normalizeUploads();
  if (!normalized.media.length) throw new Error('Importe um CSV de mídia antes de analisar.');
  const split = splitComparablePeriods(normalized.media, normalized.leads);
  workspace.name = byId('workspaceName').value.trim() || 'Minha operação';
  workspace.targets = readTargetsFromForm();
  workspace.records = {
    mediaRecords: split.currentMediaRecords,
    baselineMediaRecords: split.baselineMediaRecords,
    leadRecords: split.currentLeadRecords,
    baselineLeadRecords: split.baselineLeadRecords,
    creativeRecords: normalized.creative,
  };
  workspace.periodMeta = { comparable: split.comparable, cutoff: split.cutoff, source: 'csv-auto-split' };
  analyzeCurrentWorkspace();
  persistWorkspace(true);
}

function analyzeCurrentWorkspace() {
  if (!workspace.records?.mediaRecords?.length) return;
  analysis = analyzeWorkspace({
    ...workspace.records,
    targets: workspace.targets,
    experiments: workspace.experiments,
  });
  renderDashboard();
}

function addExperiment() {
  const name = byId('experimentName').value.trim();
  if (!name) return;
  workspace.experiments.push({
    id: globalThis.crypto?.randomUUID?.() || `exp-${Date.now()}`,
    name,
    metric: byId('experimentMetric').value,
    direction: byId('experimentDirection').value,
    minimumLift: Number(byId('experimentLift').value || 10) / 100,
    hypothesis: name,
  });
  byId('experimentName').value = '';
  renderExperimentDrafts();
  if (workspace.records) analyzeCurrentWorkspace();
}

function renderExperimentDrafts() {
  byId('experimentDrafts').innerHTML = workspace.experiments.length
    ? workspace.experiments.map((item, index) => `<div class="draft-item"><span>${escapeHtml(item.name)}</span><button data-remove-experiment="${index}" title="Remover">×</button></div>`).join('')
    : '<span class="helper">Nenhum teste registrado.</span>';
  document.querySelectorAll('[data-remove-experiment]').forEach((button) => button.addEventListener('click', () => {
    workspace.experiments.splice(Number(button.dataset.removeExperiment), 1);
    renderExperimentDrafts();
    if (workspace.records) analyzeCurrentWorkspace();
  }));
}

function formatTrendValue(trend) {
  if (['qualificationRate', 'lowQualityRate'].includes(trend.key)) return percent(trend.current);
  if (trend.key === 'roas') return `${number.format(trend.current)}×`;
  return money.format(trend.current);
}

function renderRecommendation(item, index) {
  const evidence = item.evidence?.[0];
  const raw = evidence?.current;
  const shown = Number.isFinite(raw) ? (Math.abs(raw) < 1 ? percent(raw) : number.format(raw)) : '—';
  return `<article class="recommendation ${item.severity}">
    <div class="recommendation-index">${String(index + 1).padStart(2, '0')}</div>
    <div><div class="recommendation-top"><span>${escapeHtml(item.category)}</span><b>${escapeHtml(item.severity)}</b></div>
    <h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.interpretation)}</p>
    <div class="evidence">${escapeHtml(evidence?.metric || 'Evidência')}: ${shown}</div>
    <strong class="action">→ ${escapeHtml(item.action)}</strong></div>
  </article>`;
}

function renderTrend(trend) {
  const delta = `${trend.change >= 0 ? '+' : ''}${number.format(trend.change * 100)}%`;
  return `<div class="trend ${trend.status}"><span>${escapeHtml(trend.label)}</span><strong>${formatTrendValue(trend)}</strong><small>${delta} vs. período anterior · ${escapeHtml(trend.status)}</small></div>`;
}

function renderExperiment(item) {
  return `<article class="experiment ${item.status}"><div><span>${escapeHtml(item.status)}</span><strong>${escapeHtml(item.name)}</strong></div><p>${escapeHtml(item.hypothesis || item.name)}</p><small>${escapeHtml(item.conclusion || 'Aguardando período comparável.')}</small></article>`;
}

function signalForCreative(group) {
  if (group.crmLeads >= 3 && group.qualificationRate > 0 && group.qualificationRate < 0.25) return ['Lead ruim', 'bad'];
  if (group.sales > 0 && (group.roas >= 2 || group.qualificationRate >= 0.4)) return ['Vencedor', 'good'];
  if (group.roas >= 1.5 || group.qualificationRate >= 0.3) return ['Observar', 'neutral'];
  return ['Em risco', 'bad'];
}

function renderDashboard() {
  const { scores, media, leads, campaigns, creativeGroups, recommendations, executiveSummary, change, experiments } = analysis;
  byId('dashboard').classList.remove('hidden');
  byId('exportReport').disabled = false;
  byId('workspaceLabel').textContent = workspace.name;
  byId('workspaceName').value = workspace.name;
  byId('periodLabel').textContent = workspace.periodMeta?.comparable
    ? `Comparação automática: período anterior × atual${workspace.periodMeta.cutoff ? ` · corte em ${workspace.periodMeta.cutoff}` : ''}`
    : 'Sem histórico comparável: o diagnóstico usa apenas o período atual.';

  byId('overallScore').textContent = scores.overall;
  byId('efficiencyScore').textContent = scores.efficiency;
  byId('leadScore').textContent = scores.leadQuality;
  byId('creativeScore').textContent = scores.creativeHealth;
  byId('headline').textContent = executiveSummary.headline;
  byId('spend').textContent = money.format(media.spend);
  byId('cpl').textContent = money.format(media.cpl);
  byId('cpql').textContent = leads.qualified ? money.format(leads.cpql) : 'Sem CRM';
  byId('cac').textContent = leads.sales ? money.format(leads.cac) : 'Sem vendas';
  byId('roas').textContent = `${number.format(media.roas)}×`;
  byId('closeRate').textContent = percent(leads.closeRate);
  byId('budgetAtRisk').textContent = money.format(change.budgetAtRisk.amount);
  byId('riskMethod').textContent = `${change.budgetAtRisk.horizonDays} dias · ${change.budgetAtRisk.reason} Estimativa direcional.`;
  byId('trendGrid').innerHTML = change.trends.length ? change.trends.map(renderTrend).join('') : '<div class="empty-state">Importe dados com pelo menos duas datas para comparar períodos.</div>';

  byId('leadTotal').textContent = leads.leads;
  byId('qualifiedTotal').textContent = leads.qualified;
  byId('meetingTotal').textContent = leads.meetings;
  byId('salesTotal').textContent = leads.sales;
  byId('lowQualityRate').textContent = percent(leads.lowQualityRate);

  const riskCount = executiveSummary.risk.critical + executiveSummary.risk.warning;
  byId('riskCount').textContent = `${riskCount} riscos`;
  byId('recommendations').innerHTML = recommendations.length ? recommendations.slice(0, 7).map(renderRecommendation).join('') : '<div class="empty-state">Nenhum risco prioritário detectado com os dados disponíveis.</div>';
  byId('nextAction').textContent = executiveSummary.nextAction;

  byId('campaignTable').innerHTML = [...campaigns].sort((a, b) => (a.cac || Infinity) - (b.cac || Infinity)).map((item) => `<tr>
    <td><strong>${escapeHtml(item.campaignName)}</strong><small>${escapeHtml(item.platform)}</small></td>
    <td>${money.format(item.spend)}</td><td>${money.format(item.cpl)}</td><td>${item.qualified ? money.format(item.cpql) : '—'}</td>
    <td>${item.sales ? money.format(item.cac) : '—'}</td><td>${percent(item.qualificationRate)}</td><td>${item.sales}</td><td>${number.format(item.roas)}×</td>
  </tr>`).join('') || '<tr><td colspan="8">Sem campanhas identificadas.</td></tr>';

  byId('creativeTable').innerHTML = [...creativeGroups].sort((a, b) => (a.cac || Infinity) - (b.cac || Infinity)).map((group) => {
    const [label, css] = signalForCreative(group);
    return `<tr><td><strong>${escapeHtml(group.hook)}</strong><small>${escapeHtml(group.angle)} · ${escapeHtml(group.format)}</small></td>
      <td>${money.format(group.spend)}</td><td>${money.format(group.cpl)}</td><td>${group.qualified ? money.format(group.cpql) : '—'}</td>
      <td>${group.crmLeads ? percent(group.qualificationRate) : '—'}</td><td>${group.sales ? money.format(group.cac) : '—'}</td>
      <td>${number.format(group.roas)}×</td><td><span class="signal ${css}">${label}</span></td></tr>`;
  }).join('') || '<tr><td colspan="8">Sem dados criativos suficientes.</td></tr>';

  byId('experimentList').innerHTML = experiments.length ? experiments.map(renderExperiment).join('') : '<div class="empty-state">Registre um experimento para medir se a próxima decisão funcionou.</div>';
  window.setTimeout(() => byId('dashboard').scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

function workspacePayload() {
  return {
    id: workspace.id,
    name: workspace.name,
    targets: workspace.targets,
    experiments: workspace.experiments,
    records: workspace.records,
    periodMeta: workspace.periodMeta,
  };
}

function persistWorkspace(silent = false) {
  if (!workspace.records) {
    if (!silent) setStatus('Analise os dados antes de salvar', 'danger');
    return;
  }
  workspace = { ...workspace, ...saveWorkspace(workspacePayload()) };
  refreshWorkspaceSelect();
  if (!silent) setStatus('Workspace salvo neste navegador', 'good');
}

function refreshWorkspaceSelect() {
  const select = byId('workspaceSelect');
  const items = listWorkspaces();
  select.innerHTML = '<option value="">Workspaces salvos</option>' + items.map((item) => `<option value="${escapeHtml(item.id)}" ${workspace.id === item.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
}

function openSavedWorkspace(id) {
  const saved = loadWorkspace(id);
  if (!saved) return;
  workspace = { ...createEmptyWorkspace(), ...saved, mappings: { media: {}, leads: {}, creative: {} } };
  writeTargetsToForm(workspace.targets);
  byId('workspaceName').value = workspace.name;
  renderExperimentDrafts();
  analyzeCurrentWorkspace();
  setStatus('Workspace carregado', 'good');
}

function loadDemoWorkspace() {
  workspace = {
    ...createEmptyWorkspace(),
    name: 'Demo · Growth operation',
    targets: { ...businessTargets },
    experiments: demoExperiments.map((item) => ({ ...item })),
    records: {
      mediaRecords: mediaRecords.map((item) => ({ ...item })),
      leadRecords: leadRecords.map((item) => ({ ...item })),
      creativeRecords: creativeRecords.map((item) => ({ ...item })),
      baselineMediaRecords: baselineMediaRecords.map((item) => ({ ...item })),
      baselineLeadRecords: baselineLeadRecords.map((item) => ({ ...item })),
    },
    periodMeta: { comparable: true, cutoff: 'demo', source: 'demo' },
  };
  byId('workspaceName').value = workspace.name;
  writeTargetsToForm(workspace.targets);
  renderExperimentDrafts();
  analyzeCurrentWorkspace();
  setStatus('Demo carregada', 'good');
}

function openReport() {
  if (!analysis) return;
  const report = buildExecutiveReportHtml({ workspaceName: workspace.name, analysis });
  const win = window.open('', '_blank');
  if (!win) {
    setStatus('Permita pop-ups para abrir o relatório', 'danger');
    return;
  }
  win.document.open();
  win.document.write(report);
  win.document.close();
}

byId('mediaFile').addEventListener('change', (event) => readCsvFile('media', event.target.files?.[0]));
byId('leadFile').addEventListener('change', (event) => readCsvFile('leads', event.target.files?.[0]));
byId('creativeFile').addEventListener('change', (event) => readCsvFile('creative', event.target.files?.[0]));
byId('addExperiment').addEventListener('click', addExperiment);
byId('analyzeData').addEventListener('click', () => {
  try { runAnalysisFromUploads(); } catch (error) { setStatus(error.message || 'Não foi possível analisar os dados.', 'danger'); }
});
byId('saveWorkspace').addEventListener('click', () => persistWorkspace(false));
byId('saveWorkspaceBottom').addEventListener('click', () => persistWorkspace(false));
byId('exportReport').addEventListener('click', openReport);
byId('exportReportBottom').addEventListener('click', openReport);
byId('loadDemo').addEventListener('click', loadDemoWorkspace);
byId('workspaceSelect').addEventListener('change', (event) => { if (event.target.value) openSavedWorkspace(event.target.value); });

refreshWorkspaceSelect();
renderExperimentDrafts();
updateSetupReadiness();
