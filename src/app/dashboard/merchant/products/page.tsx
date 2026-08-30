import {headers} from "next/headers";
import {notFound} from "next/navigation";
import {ensureSession} from "@/acl/acl";

export default async function ProductsPage() {
  const hdrs = await headers();
  const session = await ensureSession({headers: hdrs});

  if (!session || !session.user || !session.user.id) notFound();
  if (session.user.role !== "merchant") notFound();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Products</h1>
      <p className="mt-4">(Placeholder) No products yet.</p>
    </div>
  );
}
