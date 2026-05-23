/** Max time to wait for native splash hide / auth bootstrap before continuing. */
export const STARTUP_SPLASH_TIMEOUT_MS = 4000;
export const STARTUP_AUTH_TIMEOUT_MS = 5000;

export function startupLog(message: string, detail?: unknown): void {
  if (detail !== undefined) {
    console.log(`[DocAlert startup] ${message}`, detail);
  } else {
    console.log(`[DocAlert startup] ${message}`);
  }
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}
