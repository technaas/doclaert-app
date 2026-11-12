import assert from 'node:assert/strict';

import {
  FALLBACK_SUPPORT_CONTACTS,
  parseSupportContactsRow,
  validateSupportContacts,
} from '../lib/supportContacts';

/**
 * Simulates cache/network precedence without AsyncStorage or live Supabase.
 * Mirrors loadSupportContacts decision rules.
 */
function resolveContacts(options: {
  networkRow: unknown;
  networkError?: boolean;
  cached: unknown;
}) {
  const cached = parseSupportContactsRow(options.cached);

  if (!options.networkError) {
    const parsed = parseSupportContactsRow(options.networkRow);
    if (parsed) {
      return { contacts: parsed, source: 'network' as const, cacheWouldUpdate: true };
    }
  }

  if (cached) {
    return { contacts: cached, source: 'cache' as const, cacheWouldUpdate: false };
  }

  return {
    contacts: FALLBACK_SUPPORT_CONTACTS,
    source: 'fallback' as const,
    cacheWouldUpdate: false,
  };
}

const cachedValid = {
  whatsapp_number: '+96566112457',
  call_number: '+96566110000',
  email: 'cached@technaas.com',
  website_url: 'https://docalert.net',
};

const networkValid = {
  whatsapp_number: '+96566112222',
  call_number: '+96566113333',
  email: 'network@technaas.com',
  website_url: 'https://docalert.net',
};

const fromNetwork = resolveContacts({ networkRow: networkValid, cached: cachedValid });
assert.equal(fromNetwork.source, 'network');
assert.equal(fromNetwork.contacts.email, 'network@technaas.com');
assert.equal(fromNetwork.cacheWouldUpdate, true);

const fromCacheOnError = resolveContacts({
  networkRow: networkValid,
  networkError: true,
  cached: cachedValid,
});
assert.equal(fromCacheOnError.source, 'cache');
assert.equal(fromCacheOnError.contacts.email, 'cached@technaas.com');
assert.equal(fromCacheOnError.cacheWouldUpdate, false);

const fromCacheOnMalformed = resolveContacts({
  networkRow: { email: 'bad' },
  cached: cachedValid,
});
assert.equal(fromCacheOnMalformed.source, 'cache');
assert.equal(fromCacheOnMalformed.contacts.callNumber, '+96566110000');
assert.equal(fromCacheOnMalformed.cacheWouldUpdate, false);

const fromFallback = resolveContacts({
  networkRow: null,
  networkError: true,
  cached: { email: 'bad' },
});
assert.equal(fromFallback.source, 'fallback');
assert.deepEqual(fromFallback.contacts, FALLBACK_SUPPORT_CONTACTS);

const rejectPartial = validateSupportContacts({
  whatsappNumber: '+96566112457',
  callNumber: '',
  email: 'info@technaas.com',
  websiteUrl: 'https://docalert.net',
});
assert.equal(rejectPartial.ok, false);

console.log('supportContacts cache precedence tests passed');
