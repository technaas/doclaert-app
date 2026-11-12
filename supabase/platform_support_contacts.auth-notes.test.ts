import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const sqlPath = join(
  dirname(fileURLToPath(import.meta.url)),
  'migrations',
  '20261112000000_platform_support_contacts.sql',
);
const sql = readFileSync(sqlPath, 'utf8');

assert.match(sql, /enable row level security/i);
assert.match(sql, /Anyone can read platform support contacts/);
assert.match(sql, /to anon, authenticated/);
assert.match(sql, /Platform super admins update support contacts/);
assert.match(sql, /has_platform_role\(auth\.uid\(\), 'technaas_super_admin'\)/);
assert.match(sql, /\+96566112457/);
assert.match(sql, /info@technaas\.com/);
assert.match(sql, /https:\/\/docalert\.net/);
assert.doesNotMatch(sql, /service_role/);
assert.doesNotMatch(sql, /for insert/i);
assert.doesNotMatch(sql, /for delete/i);
assert.match(sql, /whatsapp_number/);
assert.match(sql, /call_number/);

console.log('platform_support_contacts migration auth-notes checks passed');
