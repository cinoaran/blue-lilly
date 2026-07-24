import React from "react";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {ensureAndRequire} from "@/acl/acl";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  try {
    await ensureAndRequire({headers: hdrs}, "admin:access");
  } catch {
    redirect("/");
  }

  return <>{children}</>;
}
