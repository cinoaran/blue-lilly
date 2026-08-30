import {headers} from "next/headers";
import {notFound, redirect} from "next/navigation";
import {ensureSession} from "@/acl/acl";

export default async function DashboardPage() {
  const session = await ensureSession({headers: await headers()});

  if (!session?.user?.id) {
    notFound();
  }

  const role = session.user.role || "user";
  redirect(`/dashboard/${role}`);
}
