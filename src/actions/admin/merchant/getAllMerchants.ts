import {ensureAndRequire} from "@/acl/acl";
import prisma from "@/lib/prisma";

// opts can be { headers } or { req } — pass through to ensureAndRequire
export async function getAllMerchants(
  opts: Parameters<typeof ensureAndRequire>[0] = {},
) {
  // require admin permission
  try {
    await ensureAndRequire(opts, "admin:read");
  } catch (err) {
    console.error("getAllMerchants: permission check failed", err);
    return null;
  }

  // fetch merchants (adjust fields as needed)
  const merchants = await prisma.merchant.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      web: true,
    },
    orderBy: {createdAt: "desc"},
  });

  return merchants;
}
