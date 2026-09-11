import { analyzeWorkspace } from '../src/domain/analyze.js';
import { mediaRecords, leadRecords, creativeRecords } from '../src/sample-data/demo.js';
import { baselineMediaRecords, baselineLeadRecords, businessTargets, demoExperiments } from '../src/sample-data/history.js';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const percent = (value) => `${number.format((value || 0) * 100)}%`;
const byId = (id) => document.getElementById(id);

function signalFor(group) {
  if (group.roas >= 3) return ['Winning', 'good'];
  if (group.roas >= 1.5) return ['Watch', 'neutral'];
  return ['At risk', 'bad'];
}

function metricValue(trend) {
  if (['qualificationRate', 'lowQualityRate'].includes(trend.key)) return percent(trend.current);
  if (trend.key === 'roas') return `${number.format(trend.current)}×`;
  return money.format(trend.current);
}

function renderRecommendation(item, index) {
  const current = item.evidence?.[0]?.current;
  const evidence = Number.isFinite(current)
    ? `${item.evidence[0].metric}: ${current < 1 ? percent(current) : number.format(current)}`
    : item.evidence?.[0]?.metric || 'Evidence available';

  return `
    <article class="recommendation ${item.severity}">
      <div class="recommendation-index">${String(index + 1).padStart(2, '0')}</div>
      <div>
        <div class="recommendation-top"><span>${item.category}</span><b>${item.severity}</b></div>
        <h3>${item.title}</h3>
        <p>${item.interpretation}</p>
        <div class="evidence">${evidence}</div>
        <strong class="action">→ ${item.action}</strong>
      </div>
    </article>`;
}

function renderTrend(trend) {
  const arrow = trend.status === 'improved' ? '↑' : trend.status === 'worse' ? '↓' : '→';
  return `<div class="trend ${trend.status}">
    <span>${trend.label}</span>
    <strong>${metricValue(trend)}</strong>
    <small>${arrow} ${percent(Math.abs(trend.change))} vs previous period</small>
  </div>`;
}

function renderExperiment(experiment) {
  return `<article class="experiment ${experiment.status}">
    <div><span>${experiment.status}</span><strong>${experiment.name}</strong></div>
    <p>${experiment.hypothesis}</p>
    <small>${experiment.conclusion}</small>
  </article>`;
}

function render() {
  const analysis = analyzeWorkspace({
    mediaRecords,
    leadRecords,
    creativeRecords,
    baselineMediaRecords,
    baselineLeadRecords,
    targets: businessTargets,
    experiments: demoExperiments,
  });
  const { scores, media, leads, creativeGroups, recommendations, executiveSummary, change, experiments } = analysis;

  byId('overallScore').textContent = scores.overall;
  byId('efficiencyScore').textContent = scores.efficiency;
  byId('leadScore').textContent = scores.leadQuality;
  byId('creativeScore').textContent = scores.creativeHealth;
  byId('headline').textContent = executiveSummary.headline;

  byId('spend').textContent = money.format(media.spend);
  byId('cpl').textContent = money.format(media.cpl);
  byId('cpql').textContent = money.format(leads.cpql);
  byId('cac').textContent = money.format(leads.cac);
  byId('roas').textContent = `${number.format(media.roas)}×`;
  byId('closeRate').textContent = percent(leads.closeRate);

  byId('budgetAtRisk').textContent = money.format(change.budgetAtRisk.amount);
  byId('riskMethod').textContent = `${change.budgetAtRisk.horizonDays}-day directional estimate · ${change.budgetAtRisk.reason}`;
  byId('trendGrid').innerHTML = change.trends.map(renderTrend).join('');
  byId('experimentList').innerHTML = experiments.map(renderExperiment).join('');

  byId('leadTotal').textContent = leads.leads;
  byId('qualifiedTotal').textContent = leads.qualified;
  byId('meetingTotal').textContent = leads.meetings;
  byId('salesTotal').textContent = leads.sales;
  byId('lowQualityRate').textContent = percent(leads.lowQualityRate);

  const risk = executiveSummary.risk.critical + executiveSummary.risk.warning;
  byId('riskCount').textContent = `${risk} risks`;
  byId('recommendations').innerHTML = recommendations.slice(0, 6).map(renderRecommendation).join('') || '<p>No priority findings yet.</p>';

  byId('creativeTable').innerHTML = [...creativeGroups]
    .sort((a, b) => b.roas - a.roas)
    .map((group) => {
      const [label, css] = signalFor(group);
      return `<tr>
        <td><strong>${group.hook}</strong><small>${group.angle} · ${group.format}</small></td>
        <td>${money.format(group.spend)}</td>
        <td>${percent(group.ctr)}</td>
        <td>${money.format(group.cpl)}</td>
        <td>${number.format(group.roas)}×</td>
        <td><span class="signal ${css}">${label}</span></td>
      </tr>`;
    }).join('');
}

byId('loadDemo').addEventListener('click', render);
render();
