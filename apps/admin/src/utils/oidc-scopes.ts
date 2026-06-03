import { Fingerprint, Link, type LucideIcon, Mail, User } from "@workspace/ui";

type ScopeInfo = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const SCOPE_MAP: Record<string, Omit<ScopeInfo, "id">> = {
  openid: {
    label: "Verify your identity",
    description: "Confirm who you are without sharing your password",
    icon: Fingerprint,
  },
  profile: {
    label: "View your profile",
    description: "Name, display picture, and account details",
    icon: User,
  },
  email: {
    label: "View your email address",
    description: "Access to your primary email",
    icon: Mail,
  },
  offline_access: {
    label: "Stay connected",
    description: "Maintain access even when you're not actively using the app",
    icon: Link,
  },
};

export function mapScopes(scopes: string[]): ScopeInfo[] {
  return scopes
    .filter((scope) => scope in SCOPE_MAP)
    .map((scope) => ({ id: scope, ...SCOPE_MAP[scope] }));
}
