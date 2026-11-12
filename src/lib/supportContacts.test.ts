import assert from 'node:assert/strict';

import {
  FALLBACK_SUPPORT_CONTACTS,
  formatPhoneDisplay,
  normalizeEmail,
  normalizePhoneNumber,
  normalizeWebsiteUrl,
  parseSupportContactsRow,
  resolveSupportContactView,
  validateSupportContacts,
} from './supportContacts';

assert.equal(normalizePhoneNumber('+965 6611 2457'), '+96566112457');
assert.equal(normalizePhoneNumber('96566112457'), '+96566112457');
assert.equal(normalizePhoneNumber('0096566112457'), '+96566112457');
assert.equal(normalizePhoneNumber('not-a-phone'), null);

assert.equal(formatPhoneDisplay('+96566112457'), '+965 6611 2457');
assert.equal(normalizeEmail('Info@Technaas.com'), 'info@technaas.com');
assert.equal(normalizeEmail('bad'), null);
assert.equal(normalizeWebsiteUrl('https://docalert.net/'), 'https://docalert.net');
assert.equal(normalizeWebsiteUrl('docalert.net'), 'https://docalert.net');
assert.equal(normalizeWebsiteUrl('http://docalert.net'), null);

const valid = validateSupportContacts({
  whatsappNumber: '+96566112457',
  callNumber: '+96566110000',
  email: 'info@technaas.com',
  websiteUrl: 'https://docalert.net',
});
assert.equal(valid.ok, true);
if (valid.ok) {
  assert.equal(valid.value.whatsappNumber, '+96566112457');
  assert.equal(valid.value.callNumber, '+96566110000');
}

const independent = resolveSupportContactView({
  whatsappNumber: '+96566112457',
  callNumber: '+96566110000',
  email: 'info@technaas.com',
  websiteUrl: 'https://docalert.net',
});
assert.equal(independent.whatsappUrl, 'https://wa.me/96566112457');
assert.equal(independent.callUrl, 'tel:+96566110000');
assert.equal(independent.whatsappDisplay, '+965 6611 2457');
assert.equal(independent.callDisplay, '+965 6611 0000');
assert.equal(independent.emailUrl, 'mailto:info@technaas.com');

assert.deepEqual(
  parseSupportContactsRow({
    whatsapp_number: '+96566112457',
    call_number: '+96566112457',
    email: 'info@technaas.com',
    website_url: 'https://docalert.net',
  }),
  FALLBACK_SUPPORT_CONTACTS,
);

assert.equal(parseSupportContactsRow({ email: 'bad' }), null);
assert.equal(parseSupportContactsRow(null), null);

const malformedShouldNotPass = validateSupportContacts({
  whatsappNumber: '',
  callNumber: FALLBACK_SUPPORT_CONTACTS.callNumber,
  email: FALLBACK_SUPPORT_CONTACTS.email,
  websiteUrl: FALLBACK_SUPPORT_CONTACTS.websiteUrl,
});
assert.equal(malformedShouldNotPass.ok, false);

console.log('supportContacts tests passed');
