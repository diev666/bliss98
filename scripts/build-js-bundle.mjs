import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const modulesDir = path.join(root, 'assets/js/modules');
const orderFile = path.join(modulesDir, 'order.json');
const outFile = path.join(root, 'assets/js/bliss98.bundle.js');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizeNewlines(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

const order = readJson(orderFile);
if (!Array.isArray(order) || order.length === 0) {
  throw new Error('assets/js/modules/order.json must be a non-empty array');
}

const parts = [];
parts.push('/* AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY. */');
parts.push('/* Source modules: assets/js/modules/*.js (see order.json) */');
parts.push('');

for (const rel of order) {
  if (typeof rel !== 'string' || !rel.endsWith('.js')) {
    throw new Error(`Invalid module entry: ${String(rel)}`);
  }
  const abs = path.join(modulesDir, rel);
  if (!fs.existsSync(abs)) {
    throw new Error(`Missing module file: ${rel}`);
  }
  const src = normalizeNewlines(fs.readFileSync(abs, 'utf8')).replace(/\s+$/g, '');
  parts.push(`/* ===== Module: ${rel} ===== */`);
  parts.push(src);
  parts.push('');
}

const out = parts.join('\n');
fs.writeFileSync(outFile, out + '\n', 'utf8');
console.log(`Built ${path.relative(root, outFile)} from ${order.length} modules.`);
