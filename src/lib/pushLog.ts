const PREFIX = '[DocAlert push]';

/** Development-only console logs for push token registration. */
export function pushLog(message: string, detail?: unknown): void {
  if (!__DEV__) {
    return;
  }

  if (detail !== undefined) {
    console.log(`${PREFIX} ${message}`, detail);
  } else {
    console.log(`${PREFIX} ${message}`);
  }
}
