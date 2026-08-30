import React from "react";
// Prevent Next.js from statically pre-rendering admin routes which require
// server-side authentication checks at runtime. Marking as dynamic avoids
// running `ensureAndRequire` during build-time where no session exists.
export const dynamic = "force-dynamic";
import {headers} from "next/headers";
import {notFound} from "next/navigation";
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
    notFound();
  }

  return <>{children}</>;
}
