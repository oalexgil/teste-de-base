const safeDivide = (num, den) => (den > 0 ? num / den : 0);

export function aggregateLeads(records = [], mediaSpend = 0) {
  const totals = records.reduce(
    (acc, row) => {
      acc.leads += 1;
      if (row.qualified === true || row.qualified === 'true' || row.status === 'qualified') acc.qualified += 1;
      if (row.meetingBooked === true || row.meetingBooked === 'true') acc.meetings += 1;
      if (row.won === true || row.won === 'true' || row.status === 'won') acc.sales += 1;
      acc.revenue += Number(row.revenue || 0);
      const invalid = ['invalid', 'fake', 'spam', 'unresponsive'].includes(String(row.status || '').toLowerCase());
      if (invalid) acc.lowQuality += 1;
      return acc;
    },
    { leads: 0, qualified: 0, meetings: 0, sales: 0, revenue: 0, lowQuality: 0 },
  );

  return {
    ...totals,
    qualificationRate: safeDivide(totals.qualified, totals.leads),
    meetingRate: safeDivide(totals.meetings, totals.leads),
    closeRate: safeDivide(totals.sales, totals.leads),
    qualifiedToSaleRate: safeDivide(totals.sales, totals.qualified),
    lowQualityRate: safeDivide(totals.lowQuality, totals.leads),
    revenuePerLead: safeDivide(totals.revenue, totals.leads),
    cpql: safeDivide(mediaSpend, totals.qualified),
    costPerMeeting: safeDivide(mediaSpend, totals.meetings),
    cac: safeDivide(mediaSpend, totals.sales),
  };
}

export function leadQualityScore(metrics) {
  if (!metrics || metrics.leads <= 0) return 0;
  let score = 40;
  score += Math.min(25, metrics.qualificationRate * 50);
  score += Math.min(15, metrics.meetingRate * 50);
  score += Math.min(20, metrics.closeRate * 100);
  score -= Math.min(25, metrics.lowQualityRate * 50);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function diagnoseLeads(metrics) {
  const findings = [];
  if (!metrics || metrics.leads <= 0) return findings;

  if (metrics.qualificationRate < 0.3) {
    findings.push({
      category: 'lead', severity: 'critical', title: 'Cheap leads may be masking poor quality',
      evidence: [{ metric: 'Qualification rate', current: metrics.qualificationRate }],
      interpretation: 'Most captured leads are not reaching qualification.',
      action: 'Compare CPQL by campaign and tighten message, form questions, audience and conversion feedback.', confidence: 'high',
    });
  }

  if (metrics.lowQualityRate >= 0.25) {
    findings.push({
      category: 'lead', severity: 'warning', title: 'High invalid or unresponsive lead share',
      evidence: [{ metric: 'Low-quality lead rate', current: metrics.lowQualityRate }],
      interpretation: 'A meaningful portion of acquisition volume is not commercially useful.',
      action: 'Add validation fields, review placements and feed qualified outcomes back to ad platforms.', confidence: 'medium',
    });
  }

  if (metrics.qualified > 0 && metrics.qualifiedToSaleRate < 0.1) {
    findings.push({
      category: 'lead', severity: 'warning', title: 'Qualified leads are not converting to sales',
      evidence: [{ metric: 'Qualified-to-sale rate', current: metrics.qualifiedToSaleRate }],
      interpretation: 'Lead acquisition may be acceptable while handoff, follow-up or offer conversion is weak.',
      action: 'Audit response time, sales follow-up and offer fit before blaming media acquisition.', confidence: 'medium',
    });
  }

  return findings;
}
