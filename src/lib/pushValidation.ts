import { pushLog } from '@/src/lib/pushLog';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string | null | undefined): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

/** Expo push tokens typically contain ExponentPushToken or ExpoPushToken */
export function isValidExpoPushToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const trimmed = token.trim();
  if (trimmed.length < 20) {
    return false;
  }

  return (
    trimmed.startsWith('ExponentPushToken[') ||
    trimmed.startsWith('ExpoPushToken[') ||
    trimmed.includes('PushToken[')
  );
}

export function logRegistrationContext(
  userId: string | null | undefined,
  companyId: string | null | undefined,
): { ok: boolean; userId?: string; companyId?: string } {
  pushLog('Current user', {
    user_id: userId ?? null,
    user_id_valid: isValidUuid(userId),
  });
  pushLog('Current company_id', {
    company_id: companyId ?? null,
    company_id_valid: isValidUuid(companyId),
  });

  if (!userId || !isValidUuid(userId)) {
    pushLog('Validation failed — user_id missing or invalid');
    return { ok: false };
  }

  if (!companyId || !isValidUuid(companyId)) {
    pushLog('Validation failed — company_id missing or invalid');
    return { ok: false };
  }

  return { ok: true, userId, companyId };
}
