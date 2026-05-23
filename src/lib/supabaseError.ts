import type { PostgrestError } from '@supabase/supabase-js';

import { pushLog } from '@/src/lib/pushLog';

export function formatSupabaseError(error: PostgrestError | null | undefined) {
  if (!error) {
    return null;
  }

  return {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  };
}

export function logSupabaseError(context: string, error: PostgrestError | null | undefined): void {
  const formatted = formatSupabaseError(error);
  if (formatted) {
    pushLog(`Supabase error — ${context}`, formatted);
    console.error(`[DocAlert push] Supabase error — ${context}`, error);
  }
}
