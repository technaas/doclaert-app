export function requiresPasswordChange(
  profile: { must_change_password?: unknown } | null | undefined,
): boolean {
  return profile?.must_change_password === true;
}
