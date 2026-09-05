"use server";

import {cookies} from "next/headers";
import {revalidatePath} from "next/cache";

export async function clearCart(): Promise<void> {
  const cookieStore = await cookies();
  try {
    cookieStore.delete("cartId");
  } catch (err) {
    console.error("clearCart: failed to delete cookie", err);
  }

  try {
    revalidatePath("/cart");
    revalidatePath("/");
  } catch (err) {
    // revalidation failures shouldn't break the flow
    console.info("clearCart: revalidation failed", String(err));
  }
}
