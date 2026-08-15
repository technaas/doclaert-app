import { AuthApiError } from '@supabase/supabase-js';

import { supabase } from '@/src/lib/supabase';

export const SESSION_EXPIRED_MESSAGE =
  'Your session expired. Please sign in again.';

const REFRESH_TOKEN_MESSAGE_FRAGMENTS = [
  'invalid refresh token',
  'refresh token not found',
  'jwt expired',
  'refresh_token_not_found',
  'invalid_grant',
];

function messageFromUnknown(error: unknown): string {
  if (error instanceof AuthApiError) {
    return `${error.message} ${error.code ?? ''}`.trim();
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === 'string') {
      return msg;
    }
  }
  return '';
}

export function isInvalidRefreshTokenError(error: unknown): boolean {
  const message = messageFromUnknown(error).toLowerCase();
  if (!message) {
    return false;
  }
  return REFRESH_TOKEN_MESSAGE_FRAGMENTS.some((fragment) =>
    message.includes(fragment),
  );
}

export function isInvalidRefreshTokenMessage(text: string): boolean {
  const message = text.toLowerCase();
  return REFRESH_TOKEN_MESSAGE_FRAGMENTS.some((fragment) =>
    message.includes(fragment),
  );
}

/** Clears persisted Supabase auth from AsyncStorage without requiring a valid refresh token. */
export async function clearStoredAuthSession(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // Storage may already be empty after a failed refresh.
  }
}
