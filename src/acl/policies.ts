// Central role -> permissions mapping
export const rolePermissions: Record<string, string[]> = {
  guest: [],
  customer: ["order:create", "order:view:own"],
  merchant: [
    "product:create",
    "product:update",
    "product:delete",
    "product:read",
    "order:view:own",
  ],
  "merchant-admin": [
    "product:create",
    "product:update",
    "product:delete",
    "product:read",
    "merchant:manage",
    "order:view:own",
  ],
  fulfillment: ["order:fulfillment"],
  support: ["order:view:all", "support:ticket:create"],
  marketing: ["promotion:create", "content:manage", "carousel:manage"],
  finance: ["payout:create", "refund:approve", "reports:view"],
  auditor: ["reports:view"],
  admin: ["*"],
  developer: ["deploy", "featureflags:toggle"],
};

export type Role = keyof typeof rolePermissions;

// Helper to check if a role has a permission
export function roleHasPermission(
  role: string | undefined,
  permission: string,
) {
  if (!role) return false;
  const perms = rolePermissions[role as keyof typeof rolePermissions] || [];
  if (perms.includes("*")) return true;
  return perms.includes(permission);
}
