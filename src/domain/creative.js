const safeDivide = (num, den) => (den > 0 ? num / den : 0);
const isTrue = (value) => value === true || value === 'true' || value === '1';

export function joinCreativePerformance(mediaRecords = [], creativeRecords = [], leadRecords = []) {
  const metadata = new Map(creativeRecords.map((row) => [String(row.adId), row]));
  const leadByAd = new Map();

  for (const row of leadRecords) {
    const id = String(row.adId || 'unknown');
    if (!leadByAd.has(id)) leadByAd.set(id, { leads: 0, qualified: 0, meetings: 0, sales: 0, revenue: 0, lowQuality: 0 });
    const item = leadByAd.get(id);
    item.leads += 1;
    const status = String(row.status || '').toLowerCase();
    if (isTrue(row.qualified) || ['qualified', 'won', 'qualificado', 'ganho'].includes(status)) item.qualified += 1;
    if (isTrue(row.meetingBooked)) item.meetings += 1;
    if (isTrue(row.won) || ['won', 'ganho', 'sale', 'venda'].includes(status)) item.sales += 1;
    if (['invalid', 'fake', 'spam', 'unresponsive', 'invalido', 'sem resposta'].includes(status)) item.lowQuality += 1;
    item.revenue += Number(row.revenue || 0);
  }

  const grouped = new Map();
  for (const row of mediaRecords) {
    const meta = metadata.get(String(row.adId)) || {};
    const key = [meta.hook || 'Unknown hook', meta.angle || 'Unknown angle', meta.format || 'Unknown format'].join(' | ');
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        hook: meta.hook || 'Unknown hook',
        angle: meta.angle || 'Unknown angle',
        format: meta.format || 'Unknown format',
        spend: 0, impressions: 0, clicks: 0, leads: 0, conversions: 0, revenue: 0,
        crmLeads: 0, qualified: 0, meetings: 0, sales: 0, crmRevenue: 0, lowQuality: 0,
        ads: new Set(), countedLeadAds: new Set(),
      });
    }
    const item = grouped.get(key);
    const adId = String(row.adId || 'unknown');
    item.ads.add(adId);
    item.spend += Number(row.spend || 0);
    item.impressions += Number(row.impressions || 0);
    item.clicks += Number(row.clicks || 0);
    item.leads += Number(row.leads || 0);
    item.conversions += Number(row.conversions || 0);
    item.revenue += Number(row.revenue || 0);

    if (!item.countedLeadAds.has(adId)) {
      const crm = leadByAd.get(adId);
      if (crm) {
        item.crmLeads += crm.leads;
        item.qualified += crm.qualified;
        item.meetings += crm.meetings;
        item.sales += crm.sales;
        item.crmRevenue += crm.revenue;
        item.lowQuality += crm.lowQuality;
      }
      item.countedLeadAds.add(adId);
    }
  }

  return Array.from(grouped.values()).map((item) => ({
    ...item,
    ads: Array.from(item.ads),
    countedLeadAds: undefined,
    ctr: safeDivide(item.clicks, item.impressions),
    cpl: safeDivide(item.spend, item.leads || item.crmLeads),
    roas: safeDivide(item.crmRevenue || item.revenue, item.spend),
    qualificationRate: safeDivide(item.qualified, item.crmLeads),
    lowQualityRate: safeDivide(item.lowQuality, item.crmLeads),
    cpql: safeDivide(item.spend, item.qualified),
    cac: safeDivide(item.spend, item.sales),
  }));
}

export function creativeHealthScore(groups = []) {
  if (!groups.length) return 0;
  const totalSpend = groups.reduce((sum, g) => sum + g.spend, 0);
  const sorted = [...groups].sort((a, b) => b.spend - a.spend);
  const concentration = totalSpend > 0 ? sorted[0].spend / totalSpend : 1;
  const profitable = groups.filter((g) => g.roas >= 2 || (g.sales > 0 && g.cac > 0)).length / groups.length;
  const qualityKnown = groups.filter((g) => g.crmLeads > 0);
  const avgQualification = qualityKnown.length ? qualityKnown.reduce((sum, g) => sum + g.qualificationRate, 0) / qualityKnown.length : 0.4;
  const diversity = Math.min(1, groups.length / 5);
  const score = 40 + profitable * 25 + diversity * 20 + avgQualification * 20 - Math.max(0, concentration - 0.6) * 50;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function diagnoseCreative(groups = []) {
  const findings = [];
  if (!groups.length) return findings;
  const totalSpend = groups.reduce((sum, g) => sum + g.spend, 0);
  const ranked = [...groups].sort((a, b) => b.spend - a.spend);
  const dominant = ranked[0];

  if (totalSpend > 0 && dominant.spend / totalSpend > 0.65) {
    findings.push({
      category: 'creative', severity: 'warning', title: 'Creative spend is concentrated in one concept',
      evidence: [{ metric: 'Top concept spend share', current: dominant.spend / totalSpend }],
      interpretation: 'The account is vulnerable to fatigue or a sudden decline in one dominant creative idea.',
      action: `Develop a challenger concept that changes the angle or hook instead of making only cosmetic variants of “${dominant.key}”.`, confidence: 'high',
    });
  }

  const lowQualityCreative = ranked.find((g) => g.crmLeads >= 3 && g.qualificationRate > 0 && g.qualificationRate < 0.25);
  if (lowQualityCreative) {
    findings.push({
      category: 'creative', severity: 'critical', title: 'A creative concept attracts volume but poor downstream quality',
      evidence: [
        { metric: `${lowQualityCreative.key} qualification rate`, current: lowQualityCreative.qualificationRate },
        { metric: `${lowQualityCreative.key} CPL`, current: lowQualityCreative.cpl },
      ],
      interpretation: 'The message is attracting clicks or leads that rarely become qualified opportunities.',
      action: `Do not scale “${lowQualityCreative.hook}” on CPL alone. Change the promise, angle or qualification message and compare CPQL/CAC.`, confidence: 'high',
    });
  }

  const loser = ranked.find((g) => g.spend > 0 && ((g.roas > 0 && g.roas < 1) || (g.sales === 0 && g.crmLeads >= 3)));
  if (loser) {
    findings.push({
      category: 'creative', severity: 'critical', title: 'A creative concept is consuming spend without downstream value',
      evidence: [{ metric: `${loser.key} ROAS`, current: loser.roas }, { metric: `${loser.key} sales`, current: loser.sales }],
      interpretation: 'The concept has received spend but is not producing sufficient tracked revenue or customers.',
      action: 'Reduce exposure and isolate whether the weak component is hook, angle, format or offer before producing more variants.', confidence: 'medium',
    });
  }

  const winner = [...groups].sort((a, b) => {
    if (a.sales && b.sales && a.cac !== b.cac) return a.cac - b.cac;
    return b.roas - a.roas;
  })[0];
  if (winner && (winner.roas >= 2 || winner.sales > 0)) {
    findings.push({
      category: 'creative', severity: 'info', title: 'Winning creative concept identified',
      evidence: [
        { metric: `${winner.key} ROAS`, current: winner.roas },
        { metric: `${winner.key} qualification rate`, current: winner.qualificationRate },
        { metric: `${winner.key} CAC`, current: winner.cac },
      ],
      interpretation: 'This concept currently has stronger tracked downstream economics than its peers.',
      action: `Create controlled challengers around the “${winner.angle}” angle while changing one variable at a time.`, confidence: 'medium',
    });
  }

  return findings;
}
