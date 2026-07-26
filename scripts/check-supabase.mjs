/**
 * Verifikasi konfigurasi Supabase dan bucket storage.
 * Usage: node scripts/check-supabase.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return {};
  const vars = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return vars;
}

const env = { ...loadEnv(), ...process.env };
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

console.log('ArgasariHub — Supabase Check\n');

if (!url || !key || url.includes('your-project')) {
  console.log('Status: MODE DEMO (Supabase belum dikonfigurasi)');
  console.log('\nLangkah:');
  console.log('  1. cp .env.example .env');
  console.log('  2. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY');
  console.log('  3. Jalankan supabase/schema.sql di SQL Editor');
  console.log('  4. npm run db:check');
  process.exit(0);
}

console.log('URL:', url);
console.log('Key:', key.slice(0, 12) + '...');

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
};

let ok = true;

try {
  const res = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, { headers });
  if (res.ok) {
    console.log('\n[OK] Database — tabel profiles dapat diakses');
  } else {
    console.log(`\n[FAIL] Database — HTTP ${res.status}`);
    console.log('       Pastikan schema.sql sudah dijalankan.');
    ok = false;
  }
} catch (err) {
  console.log('\n[FAIL] Database —', err.message);
  ok = false;
}

for (const bucket of ['listing-images', 'site-assets']) {
  try {
    const res = await fetch(`${url}/storage/v1/bucket/${bucket}`, { headers });
    if (res.ok) {
      const data = await res.json();
      console.log(`[OK] Storage — bucket "${bucket}" (public: ${data.public})`);
    } else if (res.status === 404) {
      console.log(`[FAIL] Storage — bucket "${bucket}" tidak ditemukan`);
      console.log('       Jalankan supabase/storage.sql di SQL Editor.');
      ok = false;
    } else {
      console.log(`[WARN] Storage — bucket "${bucket}" HTTP ${res.status}`);
      ok = false;
    }
  } catch (err) {
    console.log(`[FAIL] Storage — bucket "${bucket}":`, err.message);
    ok = false;
  }
}

console.log(ok ? '\nSemua check lulus.' : '\nAda masalah — lihat supabase/README.md');
process.exit(ok ? 0 : 1);
