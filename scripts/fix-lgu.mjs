/**
 * fix-lgu.mjs  (v2 — handles typos like "LA UNJON", duplicates, etc.)
 *
 * Normalises `lguRepresented` in ALL Firestore docs:
 *   1. UPPERCASE everything
 *   2. Strip EVERY occurrence of "LA UN..." (catches typos: LA UNJON, LA UNIION …)
 *   3. Strip stray commas / spaces
 *   4. Re-append ", LA UNION"
 *
 * Usage:  node scripts/fix-lgu.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Load .env.local ──────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
try {
  const envContent = readFileSync(join(__dir, '..', '.env.local'), 'utf8');
  for (const line of envContent.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('//')) continue;
    const idx = t.indexOf('=');
    if (idx === -1) continue;
    process.env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  console.log('✅ Loaded .env.local');
} catch {
  console.error('❌ Could not load .env.local'); process.exit(1);
}

// ── Firebase ─────────────────────────────────────────────────────────────────
import { initializeApp }                              from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const db = getFirestore(initializeApp({
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}));

console.log(`🔥 Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);

// ── Normalise helper ─────────────────────────────────────────────────────────
/**
 * Strips ALL "LA UN..." occurrences (handles typos like UNJON, UNIION …),
 * then re-appends ", LA UNION".
 *
 * Examples:
 *   "Aringay, La Unjon, La Union"   → "ARINGAY, LA UNION"
 *   "BAUANG, LA UNION, LA UNION"    → "BAUANG, LA UNION"
 *   "City of San Fernando, La Union"→ "CITY OF SAN FERNANDO, LA UNION"
 *   "Bauang"                        → "BAUANG, LA UNION"
 *   null / ""                       → returned unchanged
 */
function normaliseLgu(raw) {
  if (!raw || typeof raw !== 'string') return raw;

  // 1. Uppercase
  let val = raw.trim().toUpperCase();

  // 2. Remove every "LA UN<anything>" token (with any preceding comma/space)
  //    Regex: optional comma+spaces, then "LA" + spaces + "UN" + word chars
  val = val.replace(/[,\s]*\bLA\s+UN\w*/g, '').trim();

  // 3. Strip any leftover trailing / leading commas or spaces
  val = val.replace(/^[,\s]+|[,\s]+$/g, '').trim();

  // Safety: if nothing's left, don't wipe the value
  if (!val) return raw.trim().toUpperCase() + ', LA UNION';

  return `${val}, LA UNION`;
}

// ── Process one Firestore collection ────────────────────────────────────────
async function processCollection(colName) {
  console.log(`\n📂 "${colName}"…`);
  const snap = await getDocs(collection(db, colName));

  if (snap.empty) { console.log('   (empty)'); return 0; }

  const toUpdate = [];
  snap.forEach((d) => {
    const raw        = d.data().lguRepresented;
    const normalised = normaliseLgu(raw);
    if (normalised !== raw) toUpdate.push({ id: d.id, normalised, raw });
  });

  console.log(`   ${snap.size} docs scanned, ${toUpdate.length} need updating`);
  toUpdate.slice(0, 8).forEach(({ raw, normalised }) =>
    console.log(`   "${raw}"  →  "${normalised}"`)
  );
  if (toUpdate.length > 8) console.log(`   … and ${toUpdate.length - 8} more`);

  // Batch write (≤400 per batch to stay under Firestore's 500-op limit)
  const BATCH = 400;
  let done = 0;
  for (let i = 0; i < toUpdate.length; i += BATCH) {
    const chunk = toUpdate.slice(i, i + BATCH);
    const batch = writeBatch(db);
    chunk.forEach(({ id, normalised }) =>
      batch.update(doc(db, colName, id), { lguRepresented: normalised })
    );
    await batch.commit();
    done += chunk.length;
    console.log(`   ✔ ${done}/${toUpdate.length} updated`);
  }
  return toUpdate.length;
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  const n1 = await processCollection('cso_organizations');
  const n2 = await processCollection('cso_records');
  console.log(`\n🎉 Done! ${n1 + n2} documents updated.`);
  process.exit(0);
})().catch((err) => {
  console.error('❌ Failed:', err.message ?? err);
  process.exit(1);
});
