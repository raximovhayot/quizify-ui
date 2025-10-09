#!/usr/bin/env node
/**
 * i18n consistency & duplicates check
 * - Detects duplicate keys per object in raw JSON (pre-parse)
 * - Compares flattened key sets across locales (en, ru, uz)
 * - Exits non-zero on any issue
 */

import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.resolve('src/i18n/messages');
const LOCALES = ['en', 'ru', 'uz'];

function readFileText(file) {
  return fs.readFileSync(file, 'utf8');
}

function nextNonWs(str, idx) {
  while (idx < str.length && /\s/.test(str[idx])) idx++;
  return idx;
}

function detectDuplicateKeys(jsonText, filePath) {
  // Simple JSON tokenizer to detect duplicate object keys.
  const duplicates = [];
  const stack = []; // { type: 'object'|'array', keys:Set<string>, path:string[] }
  let i = 0;
  let inString = false;
  let escape = false;
  let buffer = '';
  let lastString = null; // last parsed string literal

  while (i < jsonText.length) {
    const ch = jsonText[i];

    if (inString) {
      if (escape) {
        escape = false;
        buffer += ch;
      } else if (ch === '\\') {
        escape = true;
      } else if (ch === '"') {
        // end string
        inString = false;
        lastString = buffer;
        buffer = '';
      } else {
        buffer += ch;
      }
      i++;
      continue;
    }

    if (ch === '"') {
      inString = true;
      buffer = '';
      i++;
      continue;
    }

    if (ch === '{') {
      const parent = stack[stack.length - 1];
      const pathArr = parent && parent.type === 'object' && parent.pendingKey
        ? parent.path.concat(parent.pendingKey)
        : parent
        ? parent.path.slice()
        : [];
      stack.push({ type: 'object', keys: new Set(), path: pathArr, pendingKey: null });
      i++;
      continue;
    }

    if (ch === '}') {
      stack.pop();
      i++;
      continue;
    }

    if (ch === '[') {
      const parent = stack[stack.length - 1];
      const pathArr = parent && parent.type === 'object' && parent.pendingKey
        ? parent.path.concat(parent.pendingKey)
        : parent
        ? parent.path.slice()
        : [];
      stack.push({ type: 'array', path: pathArr });
      i++;
      continue;
    }

    if (ch === ']') {
      stack.pop();
      i++;
      continue;
    }

    // If we just parsed a string and we're in an object, check if it's a key (lookahead for colon)
    if (lastString !== null) {
      const ctx = stack[stack.length - 1];
      if (ctx && ctx.type === 'object') {
        let j = nextNonWs(jsonText, i);
        if (jsonText[j] === ':') {
          // It's a key
          if (ctx.keys.has(lastString)) {
            const fullPath = ctx.path.length ? ctx.path.join('.') + '.' + lastString : lastString;
            duplicates.push(fullPath);
          } else {
            ctx.keys.add(lastString);
          }
          ctx.pendingKey = lastString;
        }
      }
      lastString = null;
    }

    i++;
  }

  return duplicates.map((p) => `${filePath}: duplicate key at ${p}`);
}

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = true;
    }
  }
  return out;
}

function main() {
  const issues = [];

  // 1) Duplicate detection per locale via raw text scan
  for (const loc of LOCALES) {
    const file = path.join(LOCALES_DIR, `${loc}.json`);
    const text = readFileText(file);
    issues.push(...detectDuplicateKeys(text, file));
  }

  // 2) Missing key parity check across locales (use `en` as base)
  const data = {};
  for (const loc of LOCALES) {
    const file = path.join(LOCALES_DIR, `${loc}.json`);
    try {
      data[loc] = JSON.parse(readFileText(file));
    } catch (e) {
      issues.push(`${file}: JSON parse error: ${e.message}`);
    }
  }

  const base = flatten(data.en);
  const ru = flatten(data.ru);
  const uz = flatten(data.uz);

  const missing = { ru: [], uz: [] };
  for (const key of Object.keys(base)) {
    if (!ru[key]) missing.ru.push(key);
    if (!uz[key]) missing.uz.push(key);
  }

  if (missing.ru.length) {
    issues.push(`ru.json: missing ${missing.ru.length} keys vs en.json (first 10): ${missing.ru.slice(0, 10).join(', ')}`);
  }
  if (missing.uz.length) {
    issues.push(`uz.json: missing ${missing.uz.length} keys vs en.json (first 10): ${missing.uz.slice(0, 10).join(', ')}`);
  }

  if (issues.length) {
    console.error('\n[i18n] Issues found:');
    for (const msg of issues) console.error(' -', msg);
    process.exit(1);
  } else {
    console.log('[i18n] All locale files look good (no duplicate keys, parity ok).');
  }
}

main();
