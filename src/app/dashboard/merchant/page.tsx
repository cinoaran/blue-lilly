import {headers} from "next/headers";
import {notFound, redirect} from "next/navigation";
import {ensureSession} from "@/acl/acl";

export default async function MerchantDashboardPage() {
  const hdrs = await headers();
  const session = await ensureSession({headers: hdrs});

  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  if (session.user.role !== "merchant") {
    // Not authorized for merchant dashboard
    notFound();
  }
  // Redirect to the merchant default subpage
  redirect(`/dashboard/merchant/products`);
}
