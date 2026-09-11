const number = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  let raw = String(value ?? '').trim();
  if (!raw) return 0;
  raw = raw.replace(/[^0-9,.-]/g, '');
  const hasComma = raw.includes(',');
  const hasDot = raw.includes('.');
  if (hasComma && hasDot) {
    if (raw.lastIndexOf(',') > raw.lastIndexOf('.')) raw = raw.replace(/\./g, '').replace(',', '.');
    else raw = raw.replace(/,/g, '');
  } else if (hasComma) {
    const parts = raw.split(',');
    raw = parts.length === 2 && parts[1].length <= 2 ? `${parts[0]}.${parts[1]}` : parts.join('');
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

const boolean = (value) => {
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'sim', 'qualified', 'qualificado', 'won', 'ganho', 'sale', 'venda'].includes(String(value ?? '').trim().toLowerCase());
};

export function normalizeMediaRow(row) {
  return {
    date: row.date || row.day || '',
    platform: row.platform || 'Unknown',
    accountId: row.accountId || row.account_id || '',
    campaignId: row.campaignId || row.campaign_id || row.campaign || row.campaignName || '',
    campaignName: row.campaignName || row.campaign_name || row.campaign || '',
    adGroupId: row.adGroupId || row.adset_id || row.ad_group_id || '',
    adId: row.adId || row.ad_id || row.ad || row.creativeName || '',
    spend: number(row.spend || row.cost),
    impressions: number(row.impressions),
    clicks: number(row.clicks || row.link_clicks),
    landingPageViews: number(row.landingPageViews || row.landing_page_views),
    leads: number(row.leads || row.results),
    conversions: number(row.conversions || row.purchases),
    revenue: number(row.revenue || row.purchase_value || row.conversion_value),
  };
}

export function normalizeLeadRow(row) {
  return {
    leadId: row.leadId || row.lead_id || row.id || '',
    createdAt: row.createdAt || row.created_at || row.date || '',
    platform: row.platform || 'Unknown',
    campaignId: row.campaignId || row.campaign_id || row.campaign || '',
    adId: row.adId || row.ad_id || row.ad || '',
    status: String(row.status || '').trim().toLowerCase(),
    qualified: boolean(row.qualified) || ['qualified', 'qualificado', 'won', 'ganho'].includes(String(row.status || '').trim().toLowerCase()),
    meetingBooked: boolean(row.meetingBooked || row.meeting_booked),
    won: boolean(row.won || row.sale) || ['won', 'ganho', 'venda', 'sale'].includes(String(row.status || '').trim().toLowerCase()),
    revenue: number(row.revenue || row.value),
    rejectionReason: row.rejectionReason || row.rejection_reason || '',
  };
}

export function normalizeCreativeRow(row) {
  return {
    adId: row.adId || row.ad_id || row.ad || '',
    creativeName: row.creativeName || row.creative_name || row.name || '',
    hook: row.hook || 'Unknown hook',
    angle: row.angle || 'Unknown angle',
    format: row.format || 'Unknown format',
    offer: row.offer || '',
    cta: row.cta || '',
    launchedAt: row.launchedAt || row.launched_at || row.date || '',
  };
}
