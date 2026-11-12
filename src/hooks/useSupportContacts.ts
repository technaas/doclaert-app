import { useCallback, useEffect, useState } from 'react';

import {
  FALLBACK_SUPPORT_CONTACTS,
  resolveSupportContactView,
  type SupportContactCanonical,
  type SupportContactView,
} from '@/src/lib/supportContacts';
import {
  loadSupportContacts,
  readCachedSupportContacts,
} from '@/src/services/supportContacts';

export function useSupportContacts() {
  const [contacts, setContacts] = useState<SupportContactCanonical>(FALLBACK_SUPPORT_CONTACTS);
  const [view, setView] = useState<SupportContactView>(() =>
    resolveSupportContactView(FALLBACK_SUPPORT_CONTACTS),
  );
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'network' | 'cache' | 'fallback'>('fallback');

  const apply = useCallback((next: SupportContactCanonical, nextSource: typeof source) => {
    setContacts(next);
    setView(resolveSupportContactView(next));
    setSource(nextSource);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const cached = await readCachedSupportContacts();
      if (cached) {
        apply(cached, 'cache');
      }
      const result = await loadSupportContacts();
      apply(result.contacts, result.source);
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { contacts, view, loading, source, refresh };
}
