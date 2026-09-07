"use server";

import prisma from "@/lib/prisma";
import {utapi} from "@/uploadthing/server";
import {revalidatePath} from "next/cache";

function extractFileKey(url: string) {
  if (!url) return null;
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split("?")[0];
}

export async function updateAvatarForUser(
  userId: string,
  newImageUrl: string | null,
  revalidatePaths: string[] = ["/dashboard"],
) {
  if (!userId) throw new Error("Missing userId");

  const user = await prisma.user.findUnique({
    where: {id: userId},
    select: {image: true},
  });
  if (!user) throw new Error("User not found");

  const oldImageUrl = user.image;

  // If there is an old image and it's different from the new one, attempt deletion.
  if (oldImageUrl && oldImageUrl !== newImageUrl) {
    try {
      const key = extractFileKey(oldImageUrl);
      if (key) await utapi.deleteFiles(key);
    } catch (err) {
      // Non-fatal: log and continue
      console.error("Failed to delete old avatar via utapi:", err);
    }
  }

  await prisma.user.update({where: {id: userId}, data: {image: newImageUrl}});

  // Revalidate any provided paths
  for (const p of revalidatePaths) {
    try {
      revalidatePath(p);
    } catch (err) {
      console.error("Failed to revalidate path:", err);
      // ignore
    }
  }

  return {success: true};
}

export default updateAvatarForUser;
