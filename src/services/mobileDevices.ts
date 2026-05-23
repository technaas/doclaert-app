import { pushLog } from '@/src/lib/pushLog';
import { logSupabaseError } from '@/src/lib/supabaseError';
import { supabase } from '@/src/lib/supabase';
import type { DeviceRegistrationInfo } from '@/src/types/notifications';

export type SyncMobileDeviceInput = {
  companyId: string;
  userId: string;
  device: DeviceRegistrationInfo;
};

export type SyncMobileDeviceResult = {
  action: 'insert' | 'update';
  rowId?: string;
};

type MobileDeviceRow = {
  id: string;
  expo_push_token: string;
};

const DEVICE_SELECT = 'id, expo_push_token';

function buildDevicePayload(companyId: string, userId: string, device: DeviceRegistrationInfo) {
  return {
    company_id: companyId,
    user_id: userId,
    expo_push_token: device.expoPushToken,
    device_name: device.deviceName,
    platform: device.platform,
    app_version: device.appVersion,
    is_active: true,
  };
}

async function findDeviceByInstall(
  userId: string,
  platform: string,
  deviceName: string,
): Promise<MobileDeviceRow | null> {
  const { data, error } = await supabase
    .from('mobile_devices')
    .select(DEVICE_SELECT)
    .eq('user_id', userId)
    .eq('platform', platform)
    .eq('device_name', deviceName)
    .limit(1);

  if (error) {
    logSupabaseError('findDeviceByInstall', error);
    throw new Error(error.message);
  }

  return data?.[0] ?? null;
}

async function findDeviceByToken(
  userId: string,
  expoPushToken: string,
): Promise<MobileDeviceRow | null> {
  const { data, error } = await supabase
    .from('mobile_devices')
    .select(DEVICE_SELECT)
    .eq('user_id', userId)
    .eq('expo_push_token', expoPushToken)
    .maybeSingle();

  if (error) {
    logSupabaseError('findDeviceByToken', error);
    throw new Error(error.message);
  }

  return data;
}

async function updateDeviceRow(
  id: string,
  payload: ReturnType<typeof buildDevicePayload>,
  reason: string,
): Promise<void> {
  pushLog('Update payload', payload);

  const { data, error } = await supabase
    .from('mobile_devices')
    .update(payload)
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) {
    logSupabaseError('update mobile_devices', error);
    pushLog('Update failure', { id, reason, error: error.message });
    throw new Error(error.message);
  }

  pushLog('Update success', {
    id: data?.id ?? id,
    reason,
    response: data,
  });
}

/**
 * Upserts into public.mobile_devices.
 */
export async function syncMobileDevice({
  companyId,
  userId,
  device,
}: SyncMobileDeviceInput): Promise<SyncMobileDeviceResult> {
  const payload = buildDevicePayload(companyId, userId, device);

  pushLog('Insert payload', payload);

  const existingByInstall = await findDeviceByInstall(
    userId,
    device.platform,
    device.deviceName,
  );

  if (existingByInstall?.id) {
    await updateDeviceRow(existingByInstall.id, payload, 'existing device (platform + name)');
    return { action: 'update', rowId: existingByInstall.id };
  }

  const existingByToken = await findDeviceByToken(userId, device.expoPushToken);

  if (existingByToken?.id) {
    await updateDeviceRow(existingByToken.id, payload, 'existing device (expo_push_token)');
    return { action: 'update', rowId: existingByToken.id };
  }

  pushLog('Insert start — no existing row found');

  const { data: inserted, error: insertError } = await supabase
    .from('mobile_devices')
    .insert(payload)
    .select('id, user_id, company_id, expo_push_token, is_active');

  if (insertError) {
    logSupabaseError('insert mobile_devices', insertError);
    pushLog('Insert error', {
      message: insertError.message,
      code: insertError.code,
      details: insertError.details,
      hint: insertError.hint,
    });

    if (insertError.code === '23505') {
      pushLog('Insert duplicate — resolving with update', { message: insertError.message });

      const conflictRow =
        (await findDeviceByToken(userId, device.expoPushToken)) ??
        (await findDeviceByInstall(userId, device.platform, device.deviceName));

      if (conflictRow?.id) {
        await updateDeviceRow(conflictRow.id, payload, 'duplicate conflict');
        return { action: 'update', rowId: conflictRow.id };
      }
    }

    throw new Error(insertError.message);
  }

  const row = Array.isArray(inserted) ? inserted[0] : inserted;

  pushLog('Insert success', {
    response: inserted,
    row,
  });

  return { action: 'insert', rowId: row?.id };
}

/** Manual test: insert only, returns raw Supabase response for debugging. */
export async function testInsertMobileDevice({
  companyId,
  userId,
  device,
}: SyncMobileDeviceInput) {
  const payload = buildDevicePayload(companyId, userId, device);

  pushLog('TEST insert payload', payload);

  const response = await supabase
    .from('mobile_devices')
    .insert(payload)
    .select('id, company_id, user_id, expo_push_token, device_name, platform, app_version, is_active');

  if (response.error) {
    logSupabaseError('TEST insert mobile_devices', response.error);
    pushLog('TEST insert error', {
      message: response.error.message,
      code: response.error.code,
      details: response.error.details,
      hint: response.error.hint,
    });
  } else {
    pushLog('TEST insert success', { data: response.data });
  }

  return {
    payload,
    data: response.data,
    error: response.error
      ? {
          message: response.error.message,
          code: response.error.code,
          details: response.error.details,
          hint: response.error.hint,
        }
      : null,
    status: response.status,
    statusText: response.statusText,
  };
}

export type DeactivateMobileDeviceInput = {
  userId: string;
  platform: string;
  deviceName: string;
  expoPushToken?: string | null;
};

export async function deactivateMobileDevice({
  userId,
  platform,
  deviceName,
  expoPushToken,
}: DeactivateMobileDeviceInput): Promise<void> {
  pushLog('Deactivating device', { user_id: userId, platform, device_name: deviceName });

  if (expoPushToken) {
    const { error } = await supabase
      .from('mobile_devices')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('expo_push_token', expoPushToken);

    if (!error) {
      return;
    }
    logSupabaseError('deactivate by token', error);
  }

  const { error } = await supabase
    .from('mobile_devices')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('platform', platform)
    .eq('device_name', deviceName);

  if (error) {
    logSupabaseError('deactivate by install', error);
    throw new Error(error.message);
  }
}
