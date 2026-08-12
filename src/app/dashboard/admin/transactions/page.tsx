import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {ensureSession} from "@/acl/acl";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const hdrs = await headers();
  const session = await ensureSession({headers: hdrs});

  if (!session || !session.user || !session.user.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Transactions</h1>
      <p className="mt-4">
        (Placeholder) No transactions available. for {session.user.name}
      </p>
    </div>
  );
}
