"use client";

import {useRouter} from "next/navigation";
import {authClient} from "@/lib/auth/auth-client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import Spinner from "@/components/Loader/Spinner";

export default function SignoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsPending(true);

      // Try to sign out via auth client; if it fails (network), continue to clear local server cookie and redirect.
      try {
        await authClient.signOut();
      } catch (e) {
        console.warn("authClient.signOut failed, continuing logout flow:", e);
      }

      try {
        // server-side clear of httpOnly cart cookie via server action
        const {clearCart} = await import("@/app/(root)/cart/actions/clearCart");
        await clearCart();
      } catch (e) {
        console.warn("Failed to clear cart cookie via server action", e);
      }

      try {
        router.push("/login");
        router.refresh();
      } catch (e) {
        console.warn("Redirect after logout failed:", e);
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="submit"
      className="flex items-center justify-center gap-2 hover:text-sheet-foreground/70 uppercase cursor-pointer transition-colors duration-200 ease-in-out w-[90%] my-5"
      disabled={isPending}
      onClick={handleSignOut}
      variant="default"
      aria-label="Logout"
      role="button"
    >
      {isPending ? (
        <>
          <Spinner label="Please wait..." />
          <span className="sr-only">Please wait...</span>
        </>
      ) : (
        "Logout"
      )}
    </Button>
  );
}
