function splitCsvLine(line, delimiter) {
  const cells = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function parseCsv(text) {
  const normalized = String(text || '').replace(/^\uFEFF/, '').trim();
  if (!normalized) return [];
  const lines = normalized.split(/\r?\n/).filter(Boolean);
  const delimiter = (lines[0].match(/;/g) || []).length > (lines[0].match(/,/g) || []).length ? ';' : ',';
  const headers = splitCsvLine(lines[0], delimiter).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line, delimiter);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
  });
}

export function validateColumns(rows, required = []) {
  if (!rows.length) return { ok: false, missing: required };
  const columns = new Set(Object.keys(rows[0]));
  const missing = required.filter((key) => !columns.has(key));
  return { ok: missing.length === 0, missing };
}
