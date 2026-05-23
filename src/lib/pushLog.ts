const PREFIX = '[DocAlert push]';

/** Console logs for push token registration (always on for debugging). */
export function pushLog(message: string, detail?: unknown): void {
  if (detail !== undefined) {
    console.log(`${PREFIX} ${message}`, detail);
  } else {
    console.log(`${PREFIX} ${message}`);
  }
}
