import MerchantForm from "../_components/MerchantForm";
import {updateMerchant} from "@/actions/admin/merchant/update";
import {
  createMerchant,
  CreateMerchantInput,
} from "@/actions/admin/merchant/create";
import prisma from "@/lib/prisma";
import {notFound} from "next/navigation";

export default async function Page(props: unknown) {
  const {params} = props as {params: {id: string}};
  const id = await params.id;

  // Add new merchant
  if (id === "add") {
    async function handleCreate(data: CreateMerchantInput) {
      "use server";
      await createMerchant(data);
    }

    return (
      <div className="p-6 max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Add Merchant</h1>
        <MerchantForm onSubmit={handleCreate} submitLabel="Create Merchant" />
      </div>
    );
  }

  // Edit existing merchant
  const merchant = await prisma.merchant.findUnique({
    where: {id},
    include: {partners: true},
  });

  if (!merchant) return notFound();

  const initialValues: CreateMerchantInput = {
    name: merchant.name,
    address: merchant.address || undefined,
    web: merchant.web || undefined,
    phone: merchant.phone || undefined,
    email: merchant.email || undefined,
    partners: merchant.partners?.map((p) => ({
      name: p.name || undefined,
      phone: p.phone || undefined,
      email: p.email || undefined,
      department: p.department || undefined,
    })),
  };

  async function handleUpdate(data: CreateMerchantInput) {
    "use server";
    await updateMerchant(id, data);
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Edit Merchant</h1>
      <MerchantForm
        onSubmit={handleUpdate}
        initialValues={initialValues}
        submitLabel="Update Merchant"
      />
    </div>
  );
}
