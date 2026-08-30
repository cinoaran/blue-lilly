import {headers} from "next/headers";
import {notFound, redirect} from "next/navigation";
import {ensureSession} from "@/acl/acl";

export default async function UserDashboardPage() {
  const hdrs = await headers();
  const session = await ensureSession({headers: hdrs});

  if (!session || !session.user || !session.user.id) {
    notFound();
  }

  if (session.user.role !== "user") {
    // Not authorized for user dashboard
    notFound();
  }
  // Redirect to the user default subpage
  redirect(`/dashboard/user/orders`);
}
