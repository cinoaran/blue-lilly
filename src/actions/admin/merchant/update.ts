"use server";

import prisma from "@/lib/prisma";
import {CreateMerchantInput} from "@/actions/admin/merchant/create";

export async function updateMerchant(id: string, data: CreateMerchantInput) {
  const partnersToCreate = (data.partners || [])
    .filter((p) => p && p.name && p.name.trim().length > 0)
    .map((p) => ({
      name: p!.name!.trim(),
      phone: p!.phone || "",
      email: p!.email || "",
      department: p!.department || "",
    }));

  const updated = await prisma.merchant.update({
    where: {id},
    data: {
      name: data.name,
      address: data.address || "",
      web: data.web || "",
      phone: data.phone || "",
      email: data.email || "",
      // replace partners: delete existing and create new list
      partners: {
        deleteMany: {},
        create: partnersToCreate,
      },
    },
    include: {partners: true},
  });

  return updated;
}
