import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const match = html.match(/\/\* ================= cor ================= \*\/([\s\S]*?)\/\* ================= catálogo ================= \*\//);

assert.ok(match, 'Bloco de colorimetria não encontrado em index.html');

const sandbox = { Math };
vm.createContext(sandbox);
vm.runInContext(
  `${match[1]}\nthis.__color = { srgbToLinear, rgbToLab, labToRgb, deltaE, ita, itaClass, undertone };`,
  sandbox,
);

const { rgbToLab, deltaE, ita, itaClass, undertone } = sandbox.__color;

function close(actual, expected, tolerance, label) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: esperado ${expected} ± ${tolerance}, recebido ${actual}`,
  );
}

test('sRGB white and black map to the expected CIELAB endpoints', () => {
  const white = rgbToLab(255, 255, 255);
  close(white.L, 100, 0.02, 'white L*');
  close(white.a, 0, 0.02, 'white a*');
  close(white.b, 0, 0.02, 'white b*');

  const black = rgbToLab(0, 0, 0);
  close(black.L, 0, 0.001, 'black L*');
  close(black.a, 0, 0.001, 'black a*');
  close(black.b, 0, 0.001, 'black b*');
});

test('sRGB red maps near the standard D65 CIELAB value', () => {
  const red = rgbToLab(255, 0, 0);
  close(red.L, 53.2408, 0.03, 'red L*');
  close(red.a, 80.0925, 0.03, 'red a*');
  close(red.b, 67.2032, 0.03, 'red b*');
});

test('CIEDE2000 matches Sharma/Wu/Dalal reference pairs', () => {
  const pairs = [
    [{ L: 50, a: 2.6772, b: -79.7751 }, { L: 50, a: 0, b: -82.7485 }, 2.0425],
    [{ L: 50, a: 3.1571, b: -77.2803 }, { L: 50, a: 0, b: -82.7485 }, 2.8615],
    [{ L: 50, a: 2.8361, b: -74.0200 }, { L: 50, a: 0, b: -82.7485 }, 3.4412],
    [{ L: 50, a: -1.3802, b: -84.2814 }, { L: 50, a: 0, b: -82.7485 }, 1.0000],
    [{ L: 50, a: -1.1848, b: -84.8006 }, { L: 50, a: 0, b: -82.7485 }, 1.0000],
    [{ L: 50, a: -0.9009, b: -85.5211 }, { L: 50, a: 0, b: -82.7485 }, 1.0000],
  ];

  for (const [a, b, expected] of pairs) {
    close(deltaE(a, b), expected, 0.0001, `ΔE00 ${expected}`);
    close(deltaE(b, a), expected, 0.0001, `ΔE00 symmetry ${expected}`);
  }
});

test('ITA classification keeps documented boundaries stable', () => {
  assert.equal(itaClass(56), 'muito clara');
  assert.equal(itaClass(50), 'clara');
  assert.equal(itaClass(35), 'intermediária');
  assert.equal(itaClass(20), 'morena');
  assert.equal(itaClass(0), 'castanha');
  assert.equal(itaClass(-31), 'escura');
  close(ita({ L: 70, b: 20 }), 45, 0.0001, 'ITA');
});

test('undertone classifier is deterministic at current prototype thresholds', () => {
  const atAngle = (deg) => ({ L: 60, a: Math.cos(deg * Math.PI / 180), b: Math.sin(deg * Math.PI / 180) });
  assert.equal(undertone(atAngle(40)), 'frio');
  assert.equal(undertone(atAngle(52)), 'neutro');
  assert.equal(undertone(atAngle(62)), 'quente');
});
