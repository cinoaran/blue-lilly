"use server";

import {headers} from "next/headers";
import {ensureSession} from "@/acl/acl";
import updateAvatarForUser from "@/lib/uploadthing/updateAvatar";

export async function updateAvatar(data: {url: string | null}) {
  const session = await ensureSession({headers: await headers()});
  if (!session?.user?.id) return {error: "Unauthorized"};
  const userId = session.user.id;
  try {
    return await updateAvatarForUser(userId, data.url, ["/dashboard"]);
  } catch (err) {
    console.error(err);
    return {error: "Failed to update avatar"};
  }
}

export default updateAvatar;
