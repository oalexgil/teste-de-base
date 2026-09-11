const safeDivide = (num, den) => (den > 0 ? num / den : 0);
const pctChange = (current, baseline) => (baseline > 0 ? (current - baseline) / baseline : 0);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const metricConfig = [
  { key: 'cpl', label: 'CPL', source: 'media', lowerIsBetter: true },
  { key: 'cpql', label: 'CPQL', source: 'leads', lowerIsBetter: true },
  { key: 'cac', label: 'CAC', source: 'leads', lowerIsBetter: true },
  { key: 'roas', label: 'ROAS', source: 'media', lowerIsBetter: false },
  { key: 'qualificationRate', label: 'Qualification rate', source: 'leads', lowerIsBetter: false },
  { key: 'lowQualityRate', label: 'Low-quality rate', source: 'leads', lowerIsBetter: true },
];

function statusFor(change, lowerIsBetter) {
  const directional = lowerIsBetter ? -change : change;
  if (directional >= 0.08) return 'improved';
  if (directional <= -0.08) return 'worse';
  return 'stable';
}

export function comparePeriods({ currentMedia, currentLeads, baselineMedia, baselineLeads }) {
  if (!baselineMedia || !baselineLeads) return [];

  return metricConfig.map((config) => {
    const currentSource = config.source === 'media' ? currentMedia : currentLeads;
    const baselineSource = config.source === 'media' ? baselineMedia : baselineLeads;
    const current = Number(currentSource?.[config.key] || 0);
    const baseline = Number(baselineSource?.[config.key] || 0);
    const change = pctChange(current, baseline);
    return {
      ...config,
      current,
      baseline,
      change,
      status: statusFor(change, config.lowerIsBetter),
    };
  });
}

export function evaluateTargets({ media, leads, targets = {} }) {
  const checks = [
    targets.maxCpl > 0 ? { key: 'cpl', label: 'CPL', current: media.cpl, target: targets.maxCpl, type: 'max' } : null,
    targets.maxCpql > 0 ? { key: 'cpql', label: 'CPQL', current: leads.cpql, target: targets.maxCpql, type: 'max' } : null,
    targets.maxCac > 0 ? { key: 'cac', label: 'CAC', current: leads.cac, target: targets.maxCac, type: 'max' } : null,
    targets.minRoas > 0 ? { key: 'roas', label: 'ROAS', current: media.roas, target: targets.minRoas, type: 'min' } : null,
    targets.minQualificationRate > 0 ? { key: 'qualificationRate', label: 'Qualification rate', current: leads.qualificationRate, target: targets.minQualificationRate, type: 'min' } : null,
    targets.maxLowQualityRate > 0 ? { key: 'lowQualityRate', label: 'Low-quality rate', current: leads.lowQualityRate, target: targets.maxLowQualityRate, type: 'max' } : null,
  ].filter(Boolean);

  return checks.map((check) => {
    const breached = check.type === 'max' ? check.current > check.target : check.current < check.target;
    const distance = check.target > 0
      ? (check.type === 'max' ? (check.current - check.target) / check.target : (check.target - check.current) / check.target)
      : 0;
    return { ...check, breached, distance: breached ? Math.max(0, distance) : 0 };
  });
}

export function estimateBudgetAtRisk({ media, trends = [], targetChecks = [], periodDays = 7, horizonDays = 7 }) {
  if (!media?.spend || media.spend <= 0) {
    return { amount: 0, riskRate: 0, horizonDays, reason: 'No spend available', methodology: 'directional' };
  }

  const targetPressure = targetChecks.reduce((max, check) => Math.max(max, check.distance || 0), 0);
  const worsening = trends.filter((trend) => trend.status === 'worse');
  const trendPressure = worsening.length
    ? worsening.reduce((sum, trend) => sum + Math.min(Math.abs(trend.change), 0.75), 0) / worsening.length
    : 0;

  const riskRate = clamp(Math.max(targetPressure, trendPressure * 0.65), 0, 0.75);
  const dailySpend = safeDivide(media.spend, Math.max(1, periodDays));
  const amount = dailySpend * horizonDays * riskRate;

  return {
    amount: Math.round(amount * 100) / 100,
    riskRate,
    horizonDays,
    reason: targetPressure >= trendPressure * 0.65 && targetPressure > 0
      ? 'Business targets are being breached.'
      : worsening.length
        ? 'Key economics are deteriorating versus the comparison period.'
        : 'No material deterioration detected.',
    methodology: 'directional estimate based on spend pace, target breaches and period-over-period deterioration; not a revenue forecast',
  };
}

export function temporalFindings({ trends = [], budgetAtRisk }) {
  const findings = [];
  for (const trend of trends.filter((item) => item.status === 'worse' && Math.abs(item.change) >= 0.15)) {
    findings.push({
      category: 'change',
      severity: Math.abs(trend.change) >= 0.3 ? 'critical' : 'warning',
      title: `${trend.label} deteriorated versus the previous period`,
      evidence: [{ metric: `${trend.label} change`, current: trend.change, baseline: trend.baseline }],
      interpretation: `${trend.label} moved ${Math.round(Math.abs(trend.change) * 100)}% in the wrong direction compared with the baseline period.`,
      action: 'Review campaign, funnel and creative changes made between periods before scaling spend.',
      confidence: 'high',
    });
  }

  if (budgetAtRisk?.amount > 0) {
    findings.push({
      category: 'economics',
      severity: budgetAtRisk.riskRate >= 0.3 ? 'critical' : 'warning',
      title: 'Budget at risk if current conditions persist',
      evidence: [{ metric: `${budgetAtRisk.horizonDays}-day budget at risk`, current: budgetAtRisk.amount }],
      interpretation: budgetAtRisk.reason,
      action: 'Prioritize the breached target or deteriorating metric before increasing budget.',
      confidence: 'directional',
    });
  }

  return findings;
}
