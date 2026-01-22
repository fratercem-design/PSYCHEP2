export function isAllowedAdminEmail(email?: string | null) {
  if (!email) return false;

  const raw = process.env.ADMIN_EMAILS || "";
  // If allowlist is empty, deny everyone (secure default)
  if (!raw.trim()) return false;

  const allow = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const normalizedEmail = email.trim().toLowerCase();

  // Check allowlist
  return allow.includes(normalizedEmail);
}
