"use server";

import prisma from "@/lib/prisma";
import {requireServerPermission} from "@/acl/server";

export async function getAllUsers() {
  await requireServerPermission("admin:read");

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

export default getAllUsers;
