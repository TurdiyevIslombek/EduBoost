import "server-only";
import { clerkClient } from "@clerk/nextjs/server";

// Single source of truth for who is an admin: the ADMIN_EMAILS env var
// (comma-separated). Returns null when the var is not configured.
export const getAdminEmails = (): string[] | null => {
  const adminEmails = process.env.ADMIN_EMAILS;
  if (!adminEmails) return null;
  return adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
};

// Resolves a Clerk user's emails and checks them against the allowlist.
// Returns a boolean (never throws for a non-admin) so it can back the
// tRPC `requireAdmin` guard, the client `isAdmin` query, and the
// server-rendered /admin layout gate.
export const isClerkUserAdmin = async (clerkId: string): Promise<boolean> => {
  const allowed = getAdminEmails();
  if (!allowed || allowed.length === 0) return false;

  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(clerkId);

  // Check the primary email first, then any verified address on the account.
  const primary = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (primary && allowed.includes(primary)) return true;

  return clerkUser.emailAddresses.some((e) =>
    allowed.includes(e.emailAddress.toLowerCase())
  );
};
