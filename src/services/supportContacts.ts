import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  FALLBACK_SUPPORT_CONTACTS,
  parseSupportContactsRow,
  type SupportContactCanonical,
} from '@/src/lib/supportContacts';
import { supabase } from '@/src/lib/supabase';

export const SUPPORT_CONTACTS_CACHE_KEY = '@docalert/platform_support_contacts_v1';

export async function readCachedSupportContacts(): Promise<SupportContactCanonical | null> {
  try {
    const raw = await AsyncStorage.getItem(SUPPORT_CONTACTS_CACHE_KEY);
    if (!raw) return null;
    return parseSupportContactsRow(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function writeCachedSupportContacts(
  contacts: SupportContactCanonical,
): Promise<void> {
  const payload = {
    whatsapp_number: contacts.whatsappNumber,
    call_number: contacts.callNumber,
    email: contacts.email,
    website_url: contacts.websiteUrl,
  };
  await AsyncStorage.setItem(SUPPORT_CONTACTS_CACHE_KEY, JSON.stringify(payload));
}

/**
 * Loads support contacts for UI.
 * Order: network (on success) → valid cache → hardcoded fallbacks.
 * Failed/malformed network responses never overwrite a valid cache.
 */
export async function loadSupportContacts(): Promise<{
  contacts: SupportContactCanonical;
  source: 'network' | 'cache' | 'fallback';
}> {
  const cached = await readCachedSupportContacts();

  try {
    const { data, error } = await supabase
      .from('platform_support_contacts')
      .select('whatsapp_number,call_number,email,website_url')
      .eq('id', 1)
      .maybeSingle();

    if (!error) {
      const parsed = parseSupportContactsRow(data);
      if (parsed) {
        try {
          await writeCachedSupportContacts(parsed);
        } catch {
          // Cache write failure must not block the UI.
        }
        return { contacts: parsed, source: 'network' };
      }
    }
  } catch {
    // Network/client failures fall through to cache/fallback.
  }

  if (cached) {
    return { contacts: cached, source: 'cache' };
  }

  return { contacts: FALLBACK_SUPPORT_CONTACTS, source: 'fallback' };
}
