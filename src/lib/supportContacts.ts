/** Hardcoded fallbacks — match the seeded platform_support_contacts row. */
export const FALLBACK_WHATSAPP_NUMBER = '+96566112457';
export const FALLBACK_CALL_NUMBER = '+96566112457';
export const FALLBACK_SUPPORT_EMAIL = 'info@technaas.com';
export const FALLBACK_WEBSITE_URL = 'https://docalert.net';

/** Separately designated privacy/legal policy URL — not managed by support contacts. */
export const PRIVACY_POLICY_URL = 'https://docalert.net/privacy';

export type SupportContactCanonical = {
  whatsappNumber: string;
  callNumber: string;
  email: string;
  websiteUrl: string;
};

export type SupportContactView = {
  whatsappDisplay: string;
  whatsappUrl: string;
  callDisplay: string;
  callUrl: string;
  emailDisplay: string;
  emailUrl: string;
  websiteDisplay: string;
  websiteUrl: string;
};

export const FALLBACK_SUPPORT_CONTACTS: SupportContactCanonical = {
  whatsappNumber: FALLBACK_WHATSAPP_NUMBER,
  callNumber: FALLBACK_CALL_NUMBER,
  email: FALLBACK_SUPPORT_EMAIL,
  websiteUrl: FALLBACK_WEBSITE_URL,
};

/** @deprecated Prefer resolveSupportContactView / FALLBACK_SUPPORT_CONTACTS */
export const SUPPORT_WHATSAPP_URL = 'https://wa.me/96566112457';
/** @deprecated Prefer resolveSupportContactView / FALLBACK_SUPPORT_CONTACTS */
export const SUPPORT_PHONE_URL = 'tel:+96566112457';
/** @deprecated Prefer resolveSupportContactView / FALLBACK_SUPPORT_CONTACTS */
export const SUPPORT_EMAIL_URL = 'mailto:info@technaas.com';
/** @deprecated Prefer resolveSupportContactView / FALLBACK_SUPPORT_CONTACTS */
export const SUPPORT_PHONE_DISPLAY = '+965 6611 2457';
/** @deprecated Prefer resolveSupportContactView / FALLBACK_SUPPORT_CONTACTS */
export const SUPPORT_EMAIL_DISPLAY = FALLBACK_SUPPORT_EMAIL;
/** @deprecated Prefer resolveSupportContactView / FALLBACK_SUPPORT_CONTACTS */
export const DOCALERT_WEBSITE_URL = FALLBACK_WEBSITE_URL;

const E164_REGEX = /^\+[1-9]\d{7,14}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizePhoneNumber(raw: string): string | null {
  let value = raw.trim().replace(/[\s()-]/g, '');
  if (!value) return null;
  if (value.startsWith('00')) {
    value = `+${value.slice(2)}`;
  }
  if (!value.startsWith('+')) {
    if (!/^\d{8,15}$/.test(value)) return null;
    value = `+${value}`;
  }
  if (!E164_REGEX.test(value)) return null;
  return value;
}

export function formatPhoneDisplay(e164: string): string {
  const normalized = normalizePhoneNumber(e164);
  if (!normalized) return e164.trim();
  const kuwait = normalized.match(/^\+965(\d{8})$/);
  if (kuwait) {
    const local = kuwait[1];
    return `+965 ${local.slice(0, 4)} ${local.slice(4)}`;
  }
  return normalized;
}

export function normalizeEmail(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  if (!EMAIL_REGEX.test(value)) return null;
  return value;
}

export function normalizeWebsiteUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`;
  }
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:') return null;
    if (!url.hostname || !url.hostname.includes('.')) return null;
    const path = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
    return `${url.origin}${path}${url.search}`;
  } catch {
    return null;
  }
}

export function validateSupportContacts(input: {
  whatsappNumber: string;
  callNumber: string;
  email: string;
  websiteUrl: string;
}): { ok: true; value: SupportContactCanonical } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const whatsappNumber = normalizePhoneNumber(input.whatsappNumber);
  const callNumber = normalizePhoneNumber(input.callNumber);
  const email = normalizeEmail(input.email);
  const websiteUrl = normalizeWebsiteUrl(input.websiteUrl);

  if (!whatsappNumber) {
    errors.whatsappNumber = 'Enter a valid WhatsApp number with country code (e.g. +96566112457).';
  }
  if (!callNumber) {
    errors.callNumber = 'Enter a valid call number with country code (e.g. +96566112457).';
  }
  if (!email) {
    errors.email = 'Enter a valid email address.';
  }
  if (!websiteUrl) {
    errors.websiteUrl = 'Enter a valid HTTPS website URL (e.g. https://docalert.net).';
  }

  if (Object.keys(errors).length > 0 || !whatsappNumber || !callNumber || !email || !websiteUrl) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { whatsappNumber, callNumber, email, websiteUrl },
  };
}

export function parseSupportContactsRow(row: unknown): SupportContactCanonical | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  const result = validateSupportContacts({
    whatsappNumber: typeof r.whatsapp_number === 'string' ? r.whatsapp_number : '',
    callNumber: typeof r.call_number === 'string' ? r.call_number : '',
    email: typeof r.email === 'string' ? r.email : '',
    websiteUrl: typeof r.website_url === 'string' ? r.website_url : '',
  });
  return result.ok ? result.value : null;
}

export function resolveSupportContactView(
  contacts: SupportContactCanonical = FALLBACK_SUPPORT_CONTACTS,
): SupportContactView {
  const whatsappDigits = contacts.whatsappNumber.replace(/\D/g, '');
  return {
    whatsappDisplay: formatPhoneDisplay(contacts.whatsappNumber),
    whatsappUrl: `https://wa.me/${whatsappDigits}`,
    callDisplay: formatPhoneDisplay(contacts.callNumber),
    callUrl: `tel:${contacts.callNumber}`,
    emailDisplay: contacts.email,
    emailUrl: `mailto:${contacts.email}`,
    websiteDisplay: contacts.websiteUrl,
    websiteUrl: contacts.websiteUrl,
  };
}
