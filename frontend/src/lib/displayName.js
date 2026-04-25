/**
 * @param {{ name?: string; firstName?: string; lastName?: string; email?: string } | null | undefined} u
 */
export function displayName(u) {
  if (!u) return 'Guest';
  if (u.name && String(u.name).trim()) return u.name.trim();
  const a = (u.firstName || '').trim();
  const b = (u.lastName || '').trim();
  const n = [a, b].filter(Boolean).join(' ').trim();
  return n || u.email || 'User';
}
