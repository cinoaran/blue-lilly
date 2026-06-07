"use client";

import {Button} from "@/components/ui/button";
import {authClient} from "@/lib/auth-client";
import {useRouter} from "next/navigation";
import SuccessToast from "@/components/shared/customToast/SuccessToast";

interface ImpersonateUserProps {
  userId: string;
}

export default function ImpersonateUser({userId}: ImpersonateUserProps) {
  const router = useRouter();

  const handleImpersonateUser = async () => {
    try {
      await authClient.admin.impersonateUser({
        userId: userId,
      });
      router.push("/");
      SuccessToast({
        message: "You are now impersonating the user.",
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to impersonate user:", error);
    }
  };

  return (
    <Button onClick={handleImpersonateUser} variant="outline" size="sm">
      Impersonate
    </Button>
  );
}
