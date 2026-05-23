const NETWORK_HINTS = [
  'network',
  'fetch',
  'timeout',
  'failed to fetch',
  'connection',
  'offline',
  'internet',
];

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  return fallback;
}

export function isLikelyNetworkError(message: string): boolean {
  const lower = message.toLowerCase();
  return NETWORK_HINTS.some((hint) => lower.includes(hint));
}

export function getFriendlyErrorPresentation(
  message: string,
  fallbackTitle = 'Something went wrong',
): { title: string; message: string; isNetwork: boolean } {
  const isNetwork = isLikelyNetworkError(message);

  if (isNetwork) {
    return {
      title: 'Connection problem',
      message:
        'Please check your internet connection and try again.',
      isNetwork: true,
    };
  }

  return {
    title: fallbackTitle,
    message,
    isNetwork: false,
  };
}
