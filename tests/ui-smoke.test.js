import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../adsignal/index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../adsignal/app.js', import.meta.url), 'utf8');

test('every DOM id referenced by the app exists in the product page', () => {
  const ids = [...app.matchAll(/byId\('([^']+)'\)/g)].map((match) => match[1]);
  const unique = [...new Set(ids)];
  assert.ok(unique.length > 25);
  for (const id of unique) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `Missing DOM element #${id}`);
  }
});

test('self-service product assets are present', () => {
  assert.equal(existsSync(new URL('../adsignal/styles.css', import.meta.url)), true);
  assert.equal(existsSync(new URL('../adsignal/decision.css', import.meta.url)), true);
  assert.equal(existsSync(new URL('../adsignal/product.css', import.meta.url)), true);
  assert.match(html, /Mídia paga/);
  assert.match(html, /Leads \/ CRM/);
  assert.match(html, /Metadados criativos/);
  assert.match(html, /Abrir relatório executivo/);
});
