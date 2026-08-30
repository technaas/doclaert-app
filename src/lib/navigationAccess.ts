let currentRole: string | null = null;

export function setNavigationAccessRole(role: string | null | undefined): void {
  currentRole = role?.trim() ? role : null;
}

export function getNavigationAccessRole(): string | null {
  return currentRole;
}
