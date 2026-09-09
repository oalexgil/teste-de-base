import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('runtime vision dependency is pinned to an explicit MediaPipe version', () => {
  assert.match(html, /@mediapipe\/tasks-vision@0\.10\.14/);
  assert.match(html, /face_landmarker\/float16\/1\/face_landmarker\.task/);
});

test('repository no longer ships placeholder publishing instructions', () => {
  assert.doesNotMatch(readme, /SEU-USUARIO/);
  assert.doesNotMatch(readme, /Crie o repositório/i);
});

test('files documented in the repository map exist', () => {
  for (const relative of [
    '../.gitignore',
    '../.nojekyll',
    '../ARCHITECTURE.md',
    '../VALIDATION.md',
    '../SECURITY.md',
  ]) {
    assert.equal(existsSync(new URL(relative, import.meta.url)), true, `${relative} deveria existir`);
  }
});
