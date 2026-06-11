/*
  MONSTER CARDS .card GUI Tool
  ------------------------------------------------------------
  This file contains behavior only. Static UI text lives in translations.js,
  and visual styling lives in styles.css.

  Confirmed .card process:
    Read:  .card bytes -> AES-CBC decrypt -> gzip decompress -> ES3 JSON parse
    Write: ES3 JSON text -> gzip compress -> AES-CBC encrypt -> .card bytes
  확인된 .card 처리 순서:
    읽기: .card bytes -> AES-CBC 복호화 -> gzip 압축해제 -> ES3 JSON 파싱
    저장: ES3 JSON 문자열 -> gzip 압축 -> AES-CBC 암호화 -> .card bytes

  Browser APIs used:
    - crypto.subtle: PBKDF2 / AES-CBC
    - DecompressionStream / CompressionStream: gzip
    - Blob URL: preview and downloads
  브라우저 기능:
    - crypto.subtle: PBKDF2 / AES-CBC 처리
    - DecompressionStream / CompressionStream: gzip 처리
    - Blob URL: 이미지 미리보기 및 다운로드

  Recommended browser:
    - Latest Chrome / Edge
    - Chrome / Edge 같은 최신 Chromium 계열 브라우저 권장
    - Firefox/Safari 일부 버전은 CompressionStream 지원이 부족할 수 있음
*/

'use strict';

// ------------------------------------------------------------
// Global state 현재 열린 카드와 설정을 저장합니다.
// ------------------------------------------------------------
const state = {
  language: 'ko',
  settings: {
    encryptionType: 1,
    compressionType: 1,
    password: 'twoweeks',
    format: 0,
  },
  cardFileName: '',
  cardObject: null,
  imageObjectUrls: [],
};

// DOM shortcut. 자주 쓰는 DOM 요소 모음입니다.
const $ = (id) => document.getElementById(id);
const els = {
  languageSelect: $('languageSelect'),
  defaultsFile: $('defaultsFile'),
  passwordInput: $('passwordInput'),
  cardFile: $('cardFile'),
  openBtn: $('openBtn'),
  clearBtn: $('clearBtn'),
  status: $('status'),
  summary: $('summary'),
  images: $('images'),
  downloadZipBtn: $('downloadZipBtn'),
  downloadJsonBtn: $('downloadJsonBtn'),
  jsonImport: $('jsonImport'),
  jsonText: $('jsonText'),
  applyJsonBtn: $('applyJsonBtn'),
  repackBtn: $('repackBtn'),
};

// ------------------------------------------------------------
// i18n helpers
// ------------------------------------------------------------
function getTranslations() {
  return window.MONSTER_CARD_TRANSLATIONS || {};
}

function getByPath(obj, path) {
  return String(path).split('.').reduce((cur, key) => (cur && Object.prototype.hasOwnProperty.call(cur, key) ? cur[key] : undefined), obj);
}

function template(text, vars = {}) {
  return String(text).replace(/\{(\w+)\}/g, (_, key) => (Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : `{${key}}`));
}

function t(key, vars = {}) {
  const translations = getTranslations();
  const langTable = translations[state.language] || translations.ko || {};
  const fallbackTable = translations.ko || {};
  const value = getByPath(langTable, key) ?? getByPath(fallbackTable, key) ?? key;
  return template(value, vars);
}

function applyTranslations() {
  document.documentElement.lang = state.language;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = t(key);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });

  document.title = t('app.title');
}

function setLanguage(lang) {
  const translations = getTranslations();
  state.language = translations[lang] ? lang : 'ko';
  els.languageSelect.value = state.language;
  safeSetStorage('monsterCardGuiLanguage', state.language);
  applyTranslations();

  // Dynamic areas are rendered by JS, so render them again when language changes.
  if (state.cardObject) {
    renderSummary(state.cardObject);
    renderImages(state.cardObject);
  } else {
    renderEmptySummary();
  }
}

function safeGetStorage(key) {
  try { return localStorage.getItem(key); } catch (_) { return null; }
}

function safeSetStorage(key, value) {
  try { localStorage.setItem(key, value); } catch (_) { /* Ignore private-mode or file:// storage restrictions. */ }
}

function initLanguage() {
  const saved = safeGetStorage('monsterCardGuiLanguage');
  const browserLang = (navigator.language || '').toLowerCase().startsWith('ko') ? 'ko' : 'en';
  setLanguage(saved || browserLang);
}

// ------------------------------------------------------------
// UI utilities UI 유틸리티
// ------------------------------------------------------------
function setStatus(message, kind = '') {
  els.status.textContent = message;
  els.status.className = 'status' + (kind ? ' ' + kind : '');
}

function setStatusKey(key, kind = '', vars = {}) {
  setStatus(t(key, vars), kind);
}

function enableWorkingButtons(enabled) {
  els.downloadZipBtn.disabled = !enabled;
  els.downloadJsonBtn.disabled = !enabled;
  els.applyJsonBtn.disabled = !enabled;
  els.repackBtn.disabled = !enabled;
}

function revokeImageUrls() {
  for (const url of state.imageObjectUrls) URL.revokeObjectURL(url);
  state.imageObjectUrls = [];
}

function renderEmptySummary() {
  els.summary.innerHTML = `<div class="pill"><b>${escapeHtml(t('summary.statusLabel'))}</b>${escapeHtml(t('summary.notOpened'))}</div>`;
}

function resetAll() {
  revokeImageUrls();
  state.cardObject = null;
  state.cardFileName = '';
  els.cardFile.value = '';
  els.jsonImport.value = '';
  els.jsonText.value = '';
  els.images.innerHTML = '';
  renderEmptySummary();
  enableWorkingButtons(false);
  setStatusKey('status.reset', 'ok');
}

function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  // Revoke a bit later so the browser has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function readFileAsArrayBuffer(file) {
  return file.arrayBuffer();
}

function readFileAsText(file) {
  return file.text();
}

function sanitizeBaseName(name) {
  return (name || 'card').replace(/\.[^.]+$/, '').replace(/[\\/:*?"<>|]+/g, '_');
}

// ------------------------------------------------------------
// ES3Defaults.asset parsing
// ------------------------------------------------------------
function regexFindInt(text, key, defaultValue) {
  const re = new RegExp('^\\s*' + escapeRegExp(key) + '\\s*:\\s*(-?\\d+)\\s*$', 'm');
  const m = text.match(re);
  return m ? Number(m[1]) : defaultValue;
}

function regexFindStr(text, key, defaultValue) {
  const re = new RegExp('^\\s*' + escapeRegExp(key) + '\\s*:\\s*(.*?)\\s*$', 'm');
  const m = text.match(re);
  if (!m) return defaultValue;
  let value = m[1].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return value;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function loadSettingsFromUi() {
  const settings = {
    encryptionType: 1,
    compressionType: 1,
    password: 'twoweeks',
    format: 0,
  };

  const defaultsFile = els.defaultsFile.files[0];
  if (defaultsFile) {
    const text = await readFileAsText(defaultsFile);
    settings.encryptionType = regexFindInt(text, 'encryptionType', settings.encryptionType);
    settings.compressionType = regexFindInt(text, 'compressionType', settings.compressionType);
    settings.password = regexFindStr(text, 'encryptionPassword', settings.password);
    settings.format = regexFindInt(text, 'format', settings.format);
  }

  // Manual password has priority when it is not empty.
  const manualPassword = els.passwordInput.value;
  if (manualPassword !== '') settings.password = manualPassword;

  if (settings.format !== 0) {
    throw new Error(t('errors.unsupportedFormat', { format: settings.format }));
  }
  if (![0, 1].includes(settings.encryptionType)) {
    throw new Error(t('errors.unsupportedEncryption', { type: settings.encryptionType }));
  }
  if (![0, 1].includes(settings.compressionType)) {
    throw new Error(t('errors.unsupportedCompression', { type: settings.compressionType }));
  }

  state.settings = settings;
  return settings;
}

// ------------------------------------------------------------
// byte/string/base64 utilities
// ------------------------------------------------------------
function concatUint8Arrays(arrays) {
  const total = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const arr of arrays) {
    out.set(arr, offset);
    offset += arr.length;
  }
  return out;
}

function arrayBufferToBase64(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToUtf8(bytes) {
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

function utf8ToBytes(text) {
  return new TextEncoder().encode(text);
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

// ------------------------------------------------------------
// gzip
// ------------------------------------------------------------
async function gzipDecompress(data) {
  if (typeof DecompressionStream !== 'function') {
    throw new Error(t('errors.noDecompressionStream'));
  }
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gzipCompress(data) {
  if (typeof CompressionStream !== 'function') {
    throw new Error(t('errors.noCompressionStream'));
  }
  const stream = new Blob([data]).stream().pipeThrough(new CompressionStream('gzip'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// ------------------------------------------------------------
// ES3 AES-CBC
// ------------------------------------------------------------
async function deriveAesKey(password, iv) {
  // Matches ES3 C#: Rfc2898DeriveBytes(password, IV, 100).GetBytes(16).
  // .NET's default PBKDF2 hash is SHA-1.
  const passwordBytes = utf8ToBytes(password);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: iv,
      iterations: 100,
      hash: 'SHA-1',
    },
    baseKey,
    { name: 'AES-CBC', length: 128 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function aesDecryptEs3(cardBytes, password) {
  if (cardBytes.length < 32) throw new Error(t('errors.encryptedTooShort'));
  const iv = cardBytes.slice(0, 16);
  const ciphertext = cardBytes.slice(16);
  const key = await deriveAesKey(password, iv);

  // WebCrypto AES-CBC automatically removes PKCS#7 padding.
  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, ciphertext);
  return new Uint8Array(plainBuffer);
}

async function aesEncryptEs3(plainBytes, password) {
  const iv = randomBytes(16);
  const key = await deriveAesKey(password, iv);

  // WebCrypto AES-CBC automatically adds PKCS#7 padding.
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, plainBytes);
  return concatUint8Arrays([iv, new Uint8Array(cipherBuffer)]);
}

// ------------------------------------------------------------
// .card decode / encode
// ------------------------------------------------------------
async function decodeCardBytes(cardBytes, settings) {
  let data = cardBytes;

  // Save order is JSON -> gzip -> AES, so read order is AES -> gzip.
  if (settings.encryptionType === 1) data = await aesDecryptEs3(data, settings.password);
  if (settings.compressionType === 1) data = await gzipDecompress(data);

  return data;
}

async function encodeCardBytes(jsonBytes, settings) {
  let data = jsonBytes;

  // Write order is JSON -> gzip -> AES.
  if (settings.compressionType === 1) data = await gzipCompress(data);
  if (settings.encryptionType === 1) data = await aesEncryptEs3(data, settings.password);

  return data;
}

async function loadCardObjectFromFile(file, settings) {
  const cardBytes = new Uint8Array(await readFileAsArrayBuffer(file));
  const jsonBytes = await decodeCardBytes(cardBytes, settings);
  const jsonText = bytesToUtf8(jsonBytes);
  return JSON.parse(jsonText);
}

function dumpEs3Json(obj) {
  // Keep the same readable tab-indented style as the previous single-file version.
  return JSON.stringify(obj, null, '\t') + '\n';
}

// ------------------------------------------------------------
// ES3 byte[] fields and image handling
// ------------------------------------------------------------
function looksLikeBase64BytesEntry(value) {
  if (!value || typeof value !== 'object') return false;
  if (typeof value.value !== 'string') return false;
  const typ = value.__type;
  if (typ === 22) return true;
  if (typeof typ === 'string' && typ.startsWith('System.Byte[]')) return true;
  return false;
}

function iterImageKeys(obj) {
  return Object.keys(obj)
    .filter((key) => /^image\d+Bytes$/.test(key) && looksLikeBase64BytesEntry(obj[key]))
    .sort((a, b) => {
      const na = Number((a.match(/^image(\d+)Bytes$/) || [])[1] || 9999);
      const nb = Number((b.match(/^image(\d+)Bytes$/) || [])[1] || 9999);
      return na - nb || a.localeCompare(b);
    });
}

function detectBinaryExtension(bytes) {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return '.png';
  if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return '.jpg';
  if (bytes.length >= 6) {
    const head6 = String.fromCharCode(...bytes.slice(0, 6));
    if (head6 === 'GIF87a' || head6 === 'GIF89a') return '.gif';
  }
  if (bytes.length >= 12) {
    const riff = String.fromCharCode(...bytes.slice(0, 4));
    const webp = String.fromCharCode(...bytes.slice(8, 12));
    if (riff === 'RIFF' && webp === 'WEBP') return '.webp';
  }
  if (bytes.length >= 3) {
    if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return '.mp3';
    if (bytes[0] === 0xFF && [0xFB, 0xF3, 0xF2].includes(bytes[1])) return '.mp3';
  }
  return '.bin';
}

function decodeBase64Field(entry) {
  return base64ToUint8Array(entry.value);
}

function setBase64Field(entry, bytes) {
  entry.value = arrayBufferToBase64(bytes);
}

function getValue(obj, key, fallback = '') {
  const entry = obj[key];
  if (entry && typeof entry === 'object' && 'value' in entry) return entry.value;
  return fallback;
}

function summarizeCard(obj) {
  const keys = ['cardName', 'cardRubyName', 'cardUUID', 'rarity', 'power', 'element', 'species', 'means', 'size', 'skill', 'variantSkill'];
  const summary = [];
  for (const key of keys) summary.push([key, String(getValue(obj, key, ''))]);
  for (const key of iterImageKeys(obj)) {
    const raw = decodeBase64Field(obj[key]);
    summary.push([key, raw.length + ' bytes, ' + detectBinaryExtension(raw)]);
  }
  if (obj.bgm && looksLikeBase64BytesEntry(obj.bgm)) {
    const raw = decodeBase64Field(obj.bgm);
    summary.push(['bgm', raw.length + ' bytes, ' + detectBinaryExtension(raw)]);
  }
  return summary;
}

// ------------------------------------------------------------
// ZIP creation: uncompressed ZIP without external libraries
// ------------------------------------------------------------
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = crcTable[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
}

function writeU16(arr, value) { arr.push(value & 0xFF, (value >>> 8) & 0xFF); }
function writeU32(arr, value) { arr.push(value & 0xFF, (value >>> 8) & 0xFF, (value >>> 16) & 0xFF, (value >>> 24) & 0xFF); }

function makeZip(files) {
  // files: [{ name: string, data: Uint8Array }]
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { dosTime, dosDate } = dosDateTime();

  for (const file of files) {
    const nameBytes = utf8ToBytes(file.name);
    const data = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data);
    const crc = crc32(data);

    const local = [];
    writeU32(local, 0x04034b50);
    writeU16(local, 20);
    writeU16(local, 0x0800);
    writeU16(local, 0);
    writeU16(local, dosTime);
    writeU16(local, dosDate);
    writeU32(local, crc);
    writeU32(local, data.length);
    writeU32(local, data.length);
    writeU16(local, nameBytes.length);
    writeU16(local, 0);
    const localHeader = concatUint8Arrays([new Uint8Array(local), nameBytes, data]);
    localParts.push(localHeader);

    const central = [];
    writeU32(central, 0x02014b50);
    writeU16(central, 20);
    writeU16(central, 20);
    writeU16(central, 0x0800);
    writeU16(central, 0);
    writeU16(central, dosTime);
    writeU16(central, dosDate);
    writeU32(central, crc);
    writeU32(central, data.length);
    writeU32(central, data.length);
    writeU16(central, nameBytes.length);
    writeU16(central, 0);
    writeU16(central, 0);
    writeU16(central, 0);
    writeU16(central, 0);
    writeU32(central, 0);
    writeU32(central, offset);
    centralParts.push(concatUint8Arrays([new Uint8Array(central), nameBytes]));

    offset += localHeader.length;
  }

  const centralStart = offset;
  const centralData = concatUint8Arrays(centralParts);
  offset += centralData.length;

  const end = [];
  writeU32(end, 0x06054b50);
  writeU16(end, 0);
  writeU16(end, 0);
  writeU16(end, files.length);
  writeU16(end, files.length);
  writeU32(end, centralData.length);
  writeU32(end, centralStart);
  writeU16(end, 0);

  return concatUint8Arrays([...localParts, centralData, new Uint8Array(end)]);
}

function buildUnpackedFiles(obj) {
  const files = [];
  const jsonText = dumpEs3Json(obj);
  files.push({ name: 'card.json', data: utf8ToBytes(jsonText) });

  const manifest = {
    note: t('manifest.note'),
    byte_fields: {},
  };

  const imageKeySet = new Set(iterImageKeys(obj));

  for (const key of imageKeySet) {
    const raw = decodeBase64Field(obj[key]);
    const ext = detectBinaryExtension(raw);
    const filename = key + ext;
    files.push({ name: filename, data: raw });
    manifest.byte_fields[key] = filename;
  }

  // Include non-image byte[] fields such as bgm.
  for (const [key, entry] of Object.entries(obj)) {
    if (imageKeySet.has(key)) continue;
    if (!looksLikeBase64BytesEntry(entry)) continue;
    try {
      const raw = decodeBase64Field(entry);
      const ext = detectBinaryExtension(raw);
      const filename = key + ext;
      files.push({ name: filename, data: raw });
      manifest.byte_fields[key] = filename;
    } catch (_) {
      // Ignore invalid base64 fields.
    }
  }

  files.push({ name: 'manifest.json', data: utf8ToBytes(JSON.stringify(manifest, null, 2)) });
  return files;
}

// ------------------------------------------------------------
// Rendering
// ------------------------------------------------------------
function renderSummary(obj) {
  const rows = summarizeCard(obj);
  els.summary.innerHTML = rows.map(([key, value]) => {
    const safeKey = escapeHtml(key);
    const safeValue = escapeHtml(value);
    return `<div class="pill"><b>${safeKey}</b>${safeValue || '&nbsp;'}</div>`;
  }).join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

function renderImages(obj) {
  revokeImageUrls();
  els.images.innerHTML = '';

  const keys = iterImageKeys(obj);
  if (keys.length === 0) {
    els.images.innerHTML = `<p class="muted">${escapeHtml(t('image.noFields'))}</p>`;
    return;
  }

  for (const key of keys) {
    const raw = decodeBase64Field(obj[key]);
    const ext = detectBinaryExtension(raw);
    const mime = extensionToMime(ext);
    const blob = new Blob([raw], { type: mime });
    const url = URL.createObjectURL(blob);
    state.imageObjectUrls.push(url);

    const box = document.createElement('div');
    box.className = 'imageBox';
    box.innerHTML = `
      <h3>${escapeHtml(key)}</h3>
      <div class="muted">${raw.length.toLocaleString()} bytes · ${escapeHtml(ext)}</div>
      <div class="previewWrap"><img src="${url}" alt="${escapeHtml(t('image.previewAlt', { key }))}"></div>
      <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,*/*" data-replace-key="${escapeHtml(key)}">
      <button type="button" class="secondary" data-download-key="${escapeHtml(key)}">${escapeHtml(t('buttons.downloadImage'))}</button>
    `;
    els.images.appendChild(box);
  }

  // Replace image bytes immediately when the user chooses a new image file.
  els.images.querySelectorAll('input[type="file"][data-replace-key]').forEach((input) => {
    input.addEventListener('change', async () => {
      const key = input.dataset.replaceKey;
      const file = input.files[0];
      if (!file) return;
      try {
        const bytes = new Uint8Array(await readFileAsArrayBuffer(file));
        setBase64Field(state.cardObject[key], bytes);
        els.jsonText.value = dumpEs3Json(state.cardObject);
        renderImages(state.cardObject);
        renderSummary(state.cardObject);
        setStatusKey('status.imageReplaced', 'ok', { key });
      } catch (err) {
        setStatus(t('errors.imageReplaceFailed', { message: err.message }), 'err');
      }
    });
  });

  // Individual image downloads.
  els.images.querySelectorAll('button[data-download-key]').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.downloadKey;
      const raw = decodeBase64Field(state.cardObject[key]);
      const ext = detectBinaryExtension(raw);
      downloadBlob(new Blob([raw], { type: extensionToMime(ext) }), key + ext);
    });
  });
}

function extensionToMime(ext) {
  return {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp3': 'audio/mpeg',
  }[ext.toLowerCase()] || 'application/octet-stream';
}

// ------------------------------------------------------------
// Button actions
// ------------------------------------------------------------
els.openBtn.addEventListener('click', async () => {
  try {
    setStatusKey('status.opening');
    enableWorkingButtons(false);
    const cardFile = els.cardFile.files[0];
    if (!cardFile) throw new Error(t('errors.noCardFile'));

    const settings = await loadSettingsFromUi();
    state.cardFileName = cardFile.name;
    state.cardObject = await loadCardObjectFromFile(cardFile, settings);

    renderSummary(state.cardObject);
    renderImages(state.cardObject);
    els.jsonText.value = dumpEs3Json(state.cardObject);
    enableWorkingButtons(true);

    const imageCount = iterImageKeys(state.cardObject).length;
    setStatusKey('status.openSuccess', 'ok', {
      file: cardFile.name,
      encryptionType: settings.encryptionType,
      compressionType: settings.compressionType,
      format: settings.format,
      imageCount,
    });
  } catch (err) {
    console.error(err);
    setStatus(t('errors.generic', { message: err.message }), 'err');
  }
});

els.clearBtn.addEventListener('click', resetAll);

els.downloadJsonBtn.addEventListener('click', () => {
  if (!state.cardObject) return;
  const blob = new Blob([dumpEs3Json(state.cardObject)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, 'card.json');
});

els.downloadZipBtn.addEventListener('click', () => {
  if (!state.cardObject) return;
  try {
    const files = buildUnpackedFiles(state.cardObject);
    const zipBytes = makeZip(files);
    const base = sanitizeBaseName(state.cardFileName || 'card');
    downloadBlob(new Blob([zipBytes], { type: 'application/zip' }), base + '_unpacked.zip');
    setStatusKey('status.zipSuccess', 'ok', { count: files.length });
  } catch (err) {
    console.error(err);
    setStatus(t('errors.zipFailed', { message: err.message }), 'err');
  }
});

els.jsonImport.addEventListener('change', async () => {
  const file = els.jsonImport.files[0];
  if (!file) return;
  try {
    const text = await readFileAsText(file);
    JSON.parse(text);
    els.jsonText.value = text;
    setStatusKey('status.jsonImported', 'ok');
  } catch (err) {
    setStatus(t('errors.jsonImportFailed', { message: err.message }), 'err');
  }
});

els.applyJsonBtn.addEventListener('click', () => {
  try {
    const obj = JSON.parse(els.jsonText.value);
    state.cardObject = obj;
    renderSummary(obj);
    renderImages(obj);
    setStatusKey('status.jsonApplied', 'ok');
  } catch (err) {
    setStatus(t('errors.jsonParseFailed', { message: err.message }), 'err');
  }
});

els.repackBtn.addEventListener('click', async () => {
  try {
    if (!state.cardObject) throw new Error(t('errors.noCardObject'));

    // Always read the latest textarea content so manual JSON edits are not lost.
    const obj = JSON.parse(els.jsonText.value);
    state.cardObject = obj;

    const settings = await loadSettingsFromUi();
    const jsonBytes = utf8ToBytes(dumpEs3Json(obj));
    const cardBytes = await encodeCardBytes(jsonBytes, settings);

    // Self-check: decode the new bytes and parse JSON before offering the download.
    const decoded = await decodeCardBytes(cardBytes, settings);
    JSON.parse(bytesToUtf8(decoded));

    const base = sanitizeBaseName(state.cardFileName || 'edited');
    downloadBlob(new Blob([cardBytes], { type: 'application/octet-stream' }), base + '_edited.card');
    setStatusKey('status.repackSuccess', 'ok');
  } catch (err) {
    console.error(err);
    setStatus(t('errors.repackFailed', { message: err.message }), 'err');
  }
});

els.languageSelect.addEventListener('change', () => {
  setLanguage(els.languageSelect.value);
});

// ------------------------------------------------------------
// Startup
// ------------------------------------------------------------
function checkCompatibility() {
  const missing = [];
  if (!globalThis.crypto || !globalThis.crypto.subtle) missing.push('WebCrypto crypto.subtle');
  if (typeof CompressionStream !== 'function') missing.push('CompressionStream');
  if (typeof DecompressionStream !== 'function') missing.push('DecompressionStream');

  if (missing.length) {
    setStatusKey('status.compatibilityWarning', 'warn', { missing: missing.join(', ') });
  } else {
    setStatusKey('status.idle');
  }
}

initLanguage();
checkCompatibility();
