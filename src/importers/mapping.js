const normalizeHeader = (value = '') => String(value)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const schemas = {
  media: {
    date: ['date', 'day', 'data', 'dia'],
    platform: ['platform', 'plataforma', 'channel', 'canal'],
    accountId: ['account id', 'account_id', 'id da conta', 'conta id'],
    campaignId: ['campaign id', 'campaign_id', 'id da campanha'],
    campaignName: ['campaign name', 'campaign', 'nome da campanha', 'campanha'],
    adGroupId: ['ad set id', 'adset id', 'ad group id', 'grupo de anuncios id', 'conjunto de anuncios id'],
    adId: ['ad id', 'ad_id', 'id do anuncio', 'anuncio id'],
    spend: ['spend', 'amount spent', 'cost', 'gasto', 'valor gasto', 'custo'],
    impressions: ['impressions', 'impressoes'],
    clicks: ['clicks', 'link clicks', 'cliques', 'cliques no link'],
    landingPageViews: ['landing page views', 'landing_page_views', 'visualizacoes da pagina de destino', 'visitas a pagina de destino'],
    leads: ['leads', 'results', 'resultados', 'cadastros', 'contatos'],
    conversions: ['conversions', 'purchases', 'conversoes', 'compras'],
    revenue: ['revenue', 'purchase value', 'conversion value', 'receita', 'valor de conversao', 'valor das compras'],
  },
  leads: {
    leadId: ['lead id', 'lead_id', 'id', 'id do lead', 'id do contato'],
    createdAt: ['created at', 'created_at', 'date', 'data', 'data de criacao'],
    platform: ['platform', 'plataforma', 'source', 'origem'],
    campaignId: ['campaign id', 'campaign_id', 'campaign', 'id da campanha', 'campanha'],
    adId: ['ad id', 'ad_id', 'ad', 'id do anuncio', 'anuncio'],
    status: ['status', 'stage', 'etapa', 'situacao'],
    qualified: ['qualified', 'qualificado', 'lead qualificado'],
    meetingBooked: ['meeting booked', 'meeting_booked', 'reuniao marcada', 'agendamento'],
    won: ['won', 'sale', 'venda', 'ganho', 'fechado'],
    revenue: ['revenue', 'value', 'receita', 'valor', 'valor da venda'],
    rejectionReason: ['rejection reason', 'rejection_reason', 'motivo de perda', 'motivo de rejeicao'],
  },
  creative: {
    adId: ['ad id', 'ad_id', 'ad', 'id do anuncio', 'anuncio'],
    creativeName: ['creative name', 'creative_name', 'name', 'nome do criativo', 'criativo'],
    hook: ['hook', 'gancho'],
    angle: ['angle', 'angulo'],
    format: ['format', 'formato'],
    offer: ['offer', 'oferta'],
    cta: ['cta', 'call to action', 'chamada para acao'],
    launchedAt: ['launched at', 'launched_at', 'date', 'data', 'data de lancamento'],
  },
};

export const requiredFields = {
  media: ['spend', 'impressions', 'clicks'],
  leads: [],
  creative: [],
};

export function schemaFor(type) {
  return schemas[type] || {};
}

export function inferMapping(rows = [], type) {
  if (!rows.length) return {};
  const headers = Object.keys(rows[0]);
  const normalizedHeaders = headers.map((header) => ({ header, normalized: normalizeHeader(header) }));
  const schema = schemaFor(type);
  const mapping = {};

  for (const [field, aliases] of Object.entries(schema)) {
    const candidates = [field, ...aliases].map(normalizeHeader);
    const exact = normalizedHeaders.find((item) => candidates.includes(item.normalized));
    if (exact) {
      mapping[field] = exact.header;
      continue;
    }
    const fuzzy = normalizedHeaders.find((item) => candidates.some((alias) => alias.length > 3 && (item.normalized.includes(alias) || alias.includes(item.normalized))));
    if (fuzzy) mapping[field] = fuzzy.header;
  }
  return mapping;
}

export function applyMapping(rows = [], mapping = {}) {
  return rows.map((row) => Object.fromEntries(
    Object.entries(mapping)
      .filter(([, source]) => source)
      .map(([field, source]) => [field, row[source] ?? '']),
  ));
}

export function mappingQuality(mapping = {}, type) {
  const schema = schemaFor(type);
  const total = Object.keys(schema).length || 1;
  const mapped = Object.keys(mapping).filter((field) => mapping[field]).length;
  const missingRequired = (requiredFields[type] || []).filter((field) => !mapping[field]);
  return {
    score: Math.round((mapped / total) * 100),
    mapped,
    total,
    missingRequired,
    ok: missingRequired.length === 0,
  };
}
