export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 200);
}
