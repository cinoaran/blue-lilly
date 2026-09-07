"use server";

import prisma from "@/lib/prisma";
import {requireServerPermission} from "@/acl/server";

export type CreateMerchantInput = {
  name: string;
  address?: string;
  web?: string;
  phone?: string;
  email?: string;
  partners?: Array<{
    name?: string;
    phone?: string;
    email?: string;
    department?: string;
  }>;
};

export async function createMerchant(data: CreateMerchantInput) {
  await requireServerPermission("merchant:manage");
  const partnersToCreate = (data.partners || [])
    .filter((p) => p && p.name && p.name.trim().length > 0)
    .map((p) => ({
      name: p!.name!.trim(),
      phone: p!.phone || "",
      email: p!.email || "",
      department: p!.department || "",
    }));

  const merchant = await prisma.merchant.create({
    data: {
      name: data.name,
      address: data.address || "",
      web: data.web || "",
      phone: data.phone || "",
      email: data.email || "",
      partners: {
        create: partnersToCreate,
      },
    },
  });
  return merchant;
}

export default createMerchant;
