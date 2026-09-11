function parseDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const iso = new Date(raw);
  if (!Number.isNaN(iso.getTime())) return iso;

  const match = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const [, a, b, year] = match;
    const dayFirst = Number(a) > 12 || Number(b) <= 12;
    const day = dayFirst ? Number(a) : Number(b);
    const month = dayFirst ? Number(b) : Number(a);
    const date = new Date(Number(year), month - 1, day);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

const stamp = (value) => parseDate(value)?.getTime() ?? null;

export function splitComparablePeriods(mediaRecords = [], leadRecords = []) {
  const datedMedia = mediaRecords
    .map((row) => ({ row, time: stamp(row.date) }))
    .filter((item) => item.time !== null)
    .sort((a, b) => a.time - b.time);

  const uniqueDays = [...new Set(datedMedia.map((item) => item.time))];
  if (uniqueDays.length < 2) {
    return {
      currentMediaRecords: mediaRecords,
      baselineMediaRecords: [],
      currentLeadRecords: leadRecords,
      baselineLeadRecords: [],
      cutoff: null,
      comparable: false,
    };
  }

  const splitIndex = Math.floor(uniqueDays.length / 2);
  const currentStart = uniqueDays[splitIndex];

  const baselineMediaRecords = datedMedia.filter((item) => item.time < currentStart).map((item) => item.row);
  const currentMediaRecords = datedMedia.filter((item) => item.time >= currentStart).map((item) => item.row);

  const datedLeads = leadRecords.map((row) => ({ row, time: stamp(row.createdAt || row.date) }));
  const baselineLeadRecords = datedLeads.filter((item) => item.time !== null && item.time < currentStart).map((item) => item.row);
  const currentLeadRecords = datedLeads.filter((item) => item.time === null || item.time >= currentStart).map((item) => item.row);

  return {
    currentMediaRecords,
    baselineMediaRecords,
    currentLeadRecords,
    baselineLeadRecords,
    cutoff: new Date(currentStart).toISOString().slice(0, 10),
    comparable: baselineMediaRecords.length > 0,
  };
}
