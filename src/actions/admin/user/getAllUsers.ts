import {ensureAndRequire} from "@/acl/acl";
import prisma from "@/lib/prisma";

// opts can be { headers } or { req } — pass through to ensureAndRequire
export async function getAllUsers(
  opts: Parameters<typeof ensureAndRequire>[0] = {},
) {
  // require admin permission
  try {
    await ensureAndRequire(opts, "admin:read");
  } catch (err) {
    return null;
  }

  // fetch users (adjust fields as needed)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
    orderBy: {createdAt: "desc"},
  });

  return users;
}
