const TOKEN_PATTERNS: RegExp[] = [
  /ExponentPushToken\[[^\]]+\]/g,
  /ExpoPushToken\[[^\]]+\]/g,
  /\b(?:ya29|eyJ)[A-Za-z0-9_\-.]{20,}\b/g,
];

export function redactSecrets(value: string): string {
  const redacted = TOKEN_PATTERNS.reduce(
    (text, pattern) => text.replace(pattern, "[redacted]"),
    value,
  );
  return redacted.length > 400 ? `${redacted.slice(0, 400)}…` : redacted;
}
