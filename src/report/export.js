const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const money = (value) => Number.isFinite(Number(value)) ? Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—';
const pct = (value) => `${(Number(value || 0) * 100).toFixed(1)}%`;
const num = (value) => Number(value || 0).toFixed(2);

export function buildExecutiveReportHtml({ workspaceName = 'AdSignal workspace', analysis, generatedAt = new Date() }) {
  const recs = analysis?.recommendations || [];
  const trends = analysis?.change?.trends || [];
  const experiments = analysis?.experiments || [];
  const media = analysis?.media || {};
  const leads = analysis?.leads || {};
  const risk = analysis?.change?.budgetAtRisk || {};

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(workspaceName)} — AdSignal Report</title>
<style>
body{font-family:Arial,sans-serif;color:#111827;margin:40px;line-height:1.45}h1,h2{margin:0 0 10px}.muted{color:#6b7280}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0}.card{border:1px solid #d1d5db;border-radius:10px;padding:16px}.metric{font-size:24px;font-weight:700}.danger{color:#b91c1c}.good{color:#047857}table{width:100%;border-collapse:collapse;margin:12px 0 24px}th,td{text-align:left;padding:9px;border-bottom:1px solid #e5e7eb;font-size:13px}.rec{border-left:4px solid #111827;padding:10px 14px;margin:10px 0;background:#f9fafb}.small{font-size:12px}@media print{button{display:none}body{margin:20px}}
</style></head><body>
<h1>AdSignal Executive Performance Report</h1>
<p class="muted">${esc(workspaceName)} · ${esc(generatedAt.toLocaleString('pt-BR'))}</p>
<div class="grid">
<div class="card"><div class="muted">AdSignal Score</div><div class="metric">${esc(analysis?.scores?.overall ?? '—')}/100</div></div>
<div class="card"><div class="muted">CAC atual</div><div class="metric">${money(leads.cac)}</div></div>
<div class="card"><div class="muted">Budget at risk · 7 dias</div><div class="metric danger">${money(risk.amount)}</div><div class="small muted">Estimativa direcional; não é previsão de receita.</div></div>
</div>
<h2>Economia de aquisição</h2>
<table><tbody>
<tr><th>Investimento</th><td>${money(media.spend)}</td><th>CPL</th><td>${money(media.cpl)}</td></tr>
<tr><th>CPQL</th><td>${money(leads.cpql)}</td><th>CAC</th><td>${money(leads.cac)}</td></tr>
<tr><th>ROAS</th><td>${num(media.roas)}×</td><th>Qualificação</th><td>${pct(leads.qualificationRate)}</td></tr>
</tbody></table>
<h2>O que mudou</h2>
<table><thead><tr><th>Métrica</th><th>Anterior</th><th>Atual</th><th>Variação</th><th>Sinal</th></tr></thead><tbody>
${trends.map((t) => `<tr><td>${esc(t.label)}</td><td>${esc(t.key.includes('Rate') ? pct(t.baseline) : num(t.baseline))}</td><td>${esc(t.key.includes('Rate') ? pct(t.current) : num(t.current))}</td><td>${pct(t.change)}</td><td>${esc(t.status)}</td></tr>`).join('') || '<tr><td colspan="5">Sem período comparável.</td></tr>'}
</tbody></table>
<h2>Prioridades</h2>
${recs.slice(0, 8).map((r, i) => `<div class="rec"><strong>${i + 1}. ${esc(r.title)}</strong><div>${esc(r.interpretation)}</div><div><b>Ação:</b> ${esc(r.action)}</div><div class="small muted">Confiança: ${esc(r.confidence || '—')}</div></div>`).join('') || '<p>Sem recomendações prioritárias.</p>'}
<h2>Experimentos</h2>
<table><thead><tr><th>Experimento</th><th>Métrica</th><th>Status</th><th>Resultado</th></tr></thead><tbody>
${experiments.map((e) => `<tr><td>${esc(e.name)}</td><td>${esc(e.metric)}</td><td>${esc(e.status)}</td><td>${pct(e.improvement)}</td></tr>`).join('') || '<tr><td colspan="4">Nenhum experimento registrado.</td></tr>'}
</tbody></table>
<p class="small muted">AdSignal Intelligence · relatório calculado por regras determinísticas e dados fornecidos pelo usuário. Recomendações não garantem resultado futuro.</p>
</body></html>`;
}
