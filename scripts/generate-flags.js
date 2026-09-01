// One-off generator script: rebuilds data/flags.json with every country.
// Requires the "world-countries" package, which is NOT a runtime dependency
// of the app itself. Install it first if you want to regenerate the list:
//   npm install world-countries --no-save
const fs = require('fs');
const path = require('path');
const countries = require('world-countries');

// Flags widely recognizable to a general audience -> "easy". Everything else -> "hard".
const EASY_CODES = new Set([
  'US', 'GB', 'FR', 'DE', 'IT', 'ES', 'PT', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI',
  'IE', 'PL', 'GR', 'RU', 'UA', 'TR',
  'CA', 'MX', 'BR', 'AR', 'CO', 'CL', 'PE', 'CU',
  'CN', 'JP', 'KR', 'IN', 'ID', 'TH', 'VN', 'PH', 'MY', 'SG', 'PK', 'BD', 'SA', 'AE', 'IL',
  'IQ', 'IR',
  'AU', 'NZ',
  'EG', 'ZA', 'NG', 'KE', 'MA', 'DZ',
  'JM'
]);

// Sovereign states we want in the game: all UN members plus a handful of
// well-known non-UN-member states whose flags people commonly recognize.
const EXTRA_NON_UN = new Set(['VA', 'PS', 'TW', 'XK']); // Vatican City, Palestine, Taiwan, Kosovo

const selected = countries.filter(c => c.unMember || EXTRA_NON_UN.has(c.cca2));

// Keep any existing custom entries' ids stable isn't required since admin can
// manage everything after generation; just build a fresh, de-duplicated list.
const seen = new Set();
const flags = [];
let id = 1;

for (const c of selected.sort((a, b) => a.name.common.localeCompare(b.name.common))) {
  const code = c.cca2.toLowerCase();
  if (seen.has(code)) continue;
  seen.add(code);
  flags.push({
    id: id++,
    country: c.name.common,
    code,
    level: EASY_CODES.has(c.cca2) ? 'easy' : 'hard'
  });
}

const outPath = path.join(__dirname, '..', 'data', 'flags.json');
fs.writeFileSync(outPath, JSON.stringify(flags, null, 2) + '\n', 'utf-8');
console.log(`Wrote ${flags.length} flags to ${outPath}`);
console.log(`Easy: ${flags.filter(f => f.level === 'easy').length}, Hard: ${flags.filter(f => f.level === 'hard').length}`);
